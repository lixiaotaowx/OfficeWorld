type JanusTransactionResult = {
  janus: string
  transaction?: string
  sender?: number
  session_id?: number
  handle_id?: number
  data?: {
    id?: number
  }
  jsep?: RTCSessionDescriptionInit
  plugindata?: {
    plugin?: string
    data?: Record<string, any>
  }
  error?: {
    code?: number
    reason?: string
  }
  candidate?: RTCIceCandidateInit
}

type PendingTransaction = {
  resolve: (payload: JanusTransactionResult) => void
  reject: (error: Error) => void
  timeoutId: number
}

type PendingHandleEvent = {
  match: (payload: JanusTransactionResult) => boolean
  resolve: (payload: JanusTransactionResult) => void
  reject: (error: Error) => void
  timeoutId: number
}

type PublisherParams = {
  roomId: number
  feedId: number
  displayName: string
  stream: MediaStream
  iceServers: RTCIceServer[]
  maxBitrate?: number
  maxFps?: number
}

type ViewerParams = {
  roomId: number
  feedId: number
  iceServers: RTCIceServer[]
  onTrack: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
}

export interface JanusParticipant {
  id: number
  display: string
  publisher: boolean
  talking?: boolean
}

type JanusVideoBridgeOptions = {
  wsUrl: string
  subProtocol: string
  debug?: boolean
}

function randomTransactionId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function getPluginError(result: JanusTransactionResult) {
  const pluginData = result.plugindata?.data
  if (!pluginData) {
    return ''
  }
  if (pluginData.error) {
    return String(pluginData.error)
  }
  if (pluginData.error_code) {
    return `(${pluginData.error_code}) ${pluginData.error || 'Janus plugin error'}`
  }
  return ''
}

export class JanusVideoBridge {
  private static readonly DEFAULT_MAX_BITRATE = 3_500_000
  private static readonly DEFAULT_MAX_FPS = 20
  private static readonly MIN_STABLE_BITRATE = 1_000_000
  private static readonly ADAPT_INTERVAL_MS = 1200
  private static readonly SCENE_CHANGE_BOOST_MS = 1500
  private static readonly VP9_MAX_SPATIAL_LAYER = 2
  private static readonly VP9_MAX_TEMPORAL_LAYER = 2
  private ws: WebSocket | null = null
  private wsOpenPromise: Promise<void> | null = null
  private sessionId: number | null = null
  private keepaliveTimer: number | null = null
  private pendingTransactions = new Map<string, PendingTransaction>()
  private handleListeners = new Map<number, (payload: JanusTransactionResult) => void>()
  private pendingHandleEvents = new Map<number, PendingHandleEvent[]>()
  private cachedHandleEvents = new Map<number, JanusTransactionResult[]>()
  private publisherHandleId: number | null = null
  private publisherPc: RTCPeerConnection | null = null
  private publisherSender: RTCRtpSender | null = null
  private publisherAdaptTimer: number | null = null
  private publisherTargetBitrate = JanusVideoBridge.DEFAULT_MAX_BITRATE
  private publisherTargetFps = JanusVideoBridge.DEFAULT_MAX_FPS
  private publisherBitrateCeiling = JanusVideoBridge.DEFAULT_MAX_BITRATE
  private publisherLastOutboundStats: { packetsSent: number; packetsLost: number } | null = null
  private publisherLastFramesEncoded: number | null = null
  private publisherLowMotionTicks = 0
  private publisherBoostUntilTs = 0
  private currentPublisherRoom: number | null = null
  private currentPublisherFeedId: number | null = null
  private lastPublisherContext: Omit<PublisherParams, 'stream' | 'maxBitrate' | 'maxFps'> | null = null
  private publisherRemoteDescReady = false
  private pendingPublisherCandidates: RTCIceCandidateInit[] = []
  private viewerHandleId: number | null = null
  private viewerPc: RTCPeerConnection | null = null
  private viewerRemoteDescReady = false
  private pendingViewerCandidates: RTCIceCandidateInit[] = []
  private viewerPreferredSpatialLayer = JanusVideoBridge.VP9_MAX_SPATIAL_LAYER
  private viewerPreferredTemporalLayer = JanusVideoBridge.VP9_MAX_TEMPORAL_LAYER
  private readonly wsUrl: string
  private readonly subProtocol: string
  private readonly debug: boolean

  constructor(options: JanusVideoBridgeOptions) {
    this.wsUrl = options.wsUrl
    this.subProtocol = options.subProtocol
    this.debug = options.debug !== false
  }

  private log(..._args: unknown[]) {
    if (!this.debug) {
      return
    }
    // 日志已禁用
  }

  private pushCachedHandleEvent(handleId: number, payload: JanusTransactionResult) {
    const queue = this.cachedHandleEvents.get(handleId) || []
    queue.push(payload)
    if (queue.length > 30) {
      queue.shift()
    }
    this.cachedHandleEvents.set(handleId, queue)
  }

  private tryConsumeCachedHandleEvent(handleId: number, match: (payload: JanusTransactionResult) => boolean) {
    const queue = this.cachedHandleEvents.get(handleId)
    if (!queue || queue.length === 0) {
      return null
    }
    const index = queue.findIndex((payload) => match(payload))
    if (index === -1) {
      return null
    }
    const [matched] = queue.splice(index, 1)
    if (queue.length > 0) {
      this.cachedHandleEvents.set(handleId, queue)
    } else {
      this.cachedHandleEvents.delete(handleId)
    }
    return matched || null
  }

  private bindWebSocket(ws: WebSocket) {
    ws.onmessage = (event) => {
      let payload: JanusTransactionResult
      try {
        payload = JSON.parse(String(event.data))
      } catch {
        return
      }
      this.log('recv', payload.janus, payload.transaction || '', payload.sender || '', payload.plugindata?.data || '')
      if (payload.sender && (payload.janus === 'event' || payload.janus === 'success' || payload.janus === 'trickle' || payload.janus === 'hangup' || payload.janus === 'detached' || Boolean(payload.jsep?.sdp))) {
        this.pushCachedHandleEvent(payload.sender, payload)
      }
      if (payload.sender && this.handleListeners.has(payload.sender)) {
        this.handleListeners.get(payload.sender)?.(payload)
      }
      if (payload.sender) {
        const pendingEvents = this.pendingHandleEvents.get(payload.sender)
        if (pendingEvents?.length) {
          const matched = pendingEvents.find((item) => item.match(payload))
          if (matched) {
            clearTimeout(matched.timeoutId)
            matched.resolve(payload)
            const nextEvents = pendingEvents.filter((item) => item !== matched)
            if (nextEvents.length > 0) {
              this.pendingHandleEvents.set(payload.sender, nextEvents)
            } else {
              this.pendingHandleEvents.delete(payload.sender)
            }
          }
        }
      }
      if (!payload.transaction) {
        return
      }
      const pending = this.pendingTransactions.get(payload.transaction)
      if (!pending) {
        return
      }
      if (payload.janus === 'ack') {
        this.pendingTransactions.delete(payload.transaction)
        clearTimeout(pending.timeoutId)
        pending.resolve(payload)
        return
      }
      this.pendingTransactions.delete(payload.transaction)
      clearTimeout(pending.timeoutId)
      if (payload.janus === 'error') {
        const reason = payload.error?.reason || 'Janus request failed'
        pending.reject(new Error(reason))
        return
      }
      pending.resolve(payload)
    }
    ws.onclose = () => {
      this.ws = null
      this.wsOpenPromise = null
      this.sessionId = null
      this.stopKeepalive()
      this.rejectAllPending('Janus websocket closed')
      this.rejectAllPendingHandleEvents('Janus websocket closed')
      this.cachedHandleEvents.clear()
      this.publisherHandleId = null
      this.viewerHandleId = null
      this.handleListeners.clear()
    }
  }

  private async ensureWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }
    if (this.wsOpenPromise) {
      await this.wsOpenPromise
      return
    }
    this.wsOpenPromise = new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl, this.subProtocol)
      this.ws = ws
      this.bindWebSocket(ws)
      ws.onopen = () => {
        this.log('ws open', this.wsUrl)
        resolve()
      }
      ws.onerror = () => {
        this.wsOpenPromise = null
        this.log('ws error')
        reject(new Error('无法连接 Janus WebSocket'))
      }
      ws.onclose = () => {
        this.wsOpenPromise = null
      }
    })
    await this.wsOpenPromise
  }

  private async sendWithTransaction(payload: Record<string, any>, timeoutMs = 15000) {
    await this.ensureWebSocket()
    const ws = this.ws
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error('Janus WebSocket 未连接')
    }
    const transaction = randomTransactionId()
    const message = {
      ...payload,
      transaction,
    }
    return await new Promise<JanusTransactionResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingTransactions.delete(transaction)
        reject(new Error('Janus 请求超时'))
      }, timeoutMs)
      this.pendingTransactions.set(transaction, {
        resolve,
        reject,
        timeoutId,
      })
      this.log('send', payload.janus, transaction, payload.handle_id || '', payload.body?.request || '')
      ws.send(JSON.stringify(message))
    })
  }

  private rejectAllPending(reason: string) {
    this.pendingTransactions.forEach((pending, txId) => {
      clearTimeout(pending.timeoutId)
      pending.reject(new Error(reason))
      this.pendingTransactions.delete(txId)
    })
  }

  private rejectAllPendingHandleEvents(reason: string) {
    this.pendingHandleEvents.forEach((pendingList) => {
      pendingList.forEach((pending) => {
        clearTimeout(pending.timeoutId)
        pending.reject(new Error(reason))
      })
    })
    this.pendingHandleEvents.clear()
  }

  private async waitForHandleEvent(handleId: number, match: (payload: JanusTransactionResult) => boolean, timeoutMs = 15000) {
    const cached = this.tryConsumeCachedHandleEvent(handleId, match)
    if (cached) {
      this.log('consume cached handle event', handleId, cached.janus, cached.plugindata?.data || '')
      return cached
    }
    return await new Promise<JanusTransactionResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        const queue = this.pendingHandleEvents.get(handleId) || []
        const nextQueue = queue.filter((item) => item.timeoutId !== timeoutId)
        if (nextQueue.length > 0) {
          this.pendingHandleEvents.set(handleId, nextQueue)
        } else {
          this.pendingHandleEvents.delete(handleId)
        }
        this.log('wait handle event timeout', handleId)
        reject(new Error('等待 Janus 插件事件超时'))
      }, timeoutMs)
      const entry: PendingHandleEvent = { match, resolve, reject, timeoutId }
      const queue = this.pendingHandleEvents.get(handleId) || []
      queue.push(entry)
      this.pendingHandleEvents.set(handleId, queue)
    })
  }

  private startKeepalive() {
    if (this.keepaliveTimer || !this.sessionId) {
      return
    }
    this.keepaliveTimer = window.setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
        return
      }
      const payload = {
        janus: 'keepalive',
        session_id: this.sessionId,
        transaction: randomTransactionId(),
      }
      this.ws.send(JSON.stringify(payload))
    }, 25000)
  }

  private stopKeepalive() {
    if (!this.keepaliveTimer) {
      return
    }
    clearInterval(this.keepaliveTimer)
    this.keepaliveTimer = null
  }

  private async ensureSession() {
    if (this.sessionId) {
      return this.sessionId
    }
    const result = await this.sendWithTransaction({
      janus: 'create',
    })
    const sessionId = Number(result.data?.id || result.session_id)
    if (!Number.isFinite(sessionId) || sessionId <= 0) {
      throw new Error('Janus create session 失败')
    }
    this.sessionId = sessionId
    this.startKeepalive()
    return sessionId
  }

  /**
   * 通过 keepalive 验证现有 session 是否仍然有效。
   * 长时间挂在语音房时，视频侧 WS 可能进入「半死」状态：本地 readyState 仍为 OPEN、
   * ws.send 不报错，但服务端 session 早已被清理。此时直接复用旧 sessionId 会让后续
   * attach/message 逐个走满超时（累计几十秒），表现为点击屏幕分享「延迟很久 / 无效」。
   * 入口处先发一个短超时的 keepalive 探活：健康时毫秒级返回无感知；探活失败则强制
   * 重置本地状态并关闭 WS，让 ensureSession / ensureWebSocket 重建全新会话与连接。
   */
  private async validateOrResetSession() {
    if (!this.sessionId) {
      return
    }
    try {
      await this.sendWithTransaction({
        janus: 'keepalive',
        session_id: this.sessionId,
      }, 3000)
    } catch {
      this.log('session-stale-reset', this.sessionId)
      // Session 已失效，强制清理本地状态。
      // 不尝试发送 destroy，因为 WS 可能已无响应，避免阻塞。
      this.sessionId = null
      this.stopKeepalive()
      this.rejectAllPending('会话已失效')
      this.rejectAllPendingHandleEvents('会话已失效')
      this.cachedHandleEvents.clear()
      this.publisherHandleId = null
      this.viewerHandleId = null
      this.handleListeners.clear()
      if (this.ws) {
        try { this.ws.close() } catch { /* ignore */ }
        this.ws = null
        this.wsOpenPromise = null
      }
    }
  }

  private async attachPlugin(plugin: string, listener?: (payload: JanusTransactionResult) => void) {
    const sessionId = await this.ensureSession()
    const result = await this.sendWithTransaction({
      janus: 'attach',
      plugin,
      session_id: sessionId,
    })
    const handleId = Number(result.data?.id || result.handle_id)
    if (!Number.isFinite(handleId) || handleId <= 0) {
      throw new Error('Janus attach 插件失败')
    }
    if (listener) {
      this.handleListeners.set(handleId, listener)
    }
    return handleId
  }

  private async sendPluginMessage(handleId: number, body: Record<string, any>, jsep?: RTCSessionDescriptionInit) {
    if (!this.sessionId) {
      throw new Error('Janus session 不存在')
    }
    const result = await this.sendWithTransaction({
      janus: 'message',
      session_id: this.sessionId,
      handle_id: handleId,
      body,
      jsep,
    }, 30000)
    const finalResult = result.janus === 'ack'
      ? await this.waitForHandleEvent(
        handleId,
        (payload) => {
          if (payload.janus !== 'event' && payload.janus !== 'success') {
            return false
          }
          if (payload.transaction && result.transaction) {
            return payload.transaction === result.transaction
          }
          return true
        },
        20000
      )
      : result
    const pluginError = getPluginError(finalResult)
    if (pluginError) {
      throw new Error(pluginError)
    }
    return finalResult
  }

  private async sendTrickle(handleId: number, candidate: RTCIceCandidateInit | null) {
    if (!this.sessionId || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }
    const payload: Record<string, any> = {
      janus: 'trickle',
      session_id: this.sessionId,
      handle_id: handleId,
      candidate: candidate || { completed: true },
      transaction: randomTransactionId(),
    }
    this.log('send', 'trickle', payload.transaction, handleId, candidate?.candidate ? 'candidate' : 'completed')
    this.ws.send(JSON.stringify(payload))
  }

  private async detachHandle(handleId: number | null) {
    if (!handleId || !this.sessionId) {
      return
    }
    this.handleListeners.delete(handleId)
    this.pendingHandleEvents.delete(handleId)
    this.cachedHandleEvents.delete(handleId)
    try {
      await this.sendWithTransaction({
        janus: 'detach',
        session_id: this.sessionId,
        handle_id: handleId,
      }, 6000)
    } catch {
      return
    }
  }

  private async enqueueOrApplyRemoteCandidate(
    pc: RTCPeerConnection | null,
    candidate: RTCIceCandidateInit | undefined,
    remoteDescReady: boolean,
    queue: RTCIceCandidateInit[]
  ) {
    if (!candidate?.candidate) {
      return
    }
    if (!pc || pc.connectionState === 'closed') {
      queue.push(candidate)
      return
    }
    if (!remoteDescReady || !pc.remoteDescription) {
      queue.push(candidate)
      return
    }
    await pc.addIceCandidate(candidate).catch(() => undefined)
  }

  private async flushPendingCandidates(pc: RTCPeerConnection | null, queue: RTCIceCandidateInit[]) {
    if (!pc || pc.connectionState === 'closed' || !pc.remoteDescription || queue.length === 0) {
      return
    }
    const candidates = queue.splice(0, queue.length)
    for (const candidate of candidates) {
      await pc.addIceCandidate(candidate).catch(() => undefined)
    }
  }

  private async waitForConnectionReady(pc: RTCPeerConnection, timeoutMs: number) {
    if (pc.connectionState === 'connected') {
      return
    }
    await new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        pc.removeEventListener('connectionstatechange', onStateChange)
        resolve()
      }, timeoutMs)
      const onStateChange = () => {
        if (pc.connectionState === 'connected') {
          clearTimeout(timeoutId)
          pc.removeEventListener('connectionstatechange', onStateChange)
          resolve()
          return
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          clearTimeout(timeoutId)
          pc.removeEventListener('connectionstatechange', onStateChange)
          reject(new Error('PUBLISH_CONNECTION_NOT_READY'))
        }
      }
      pc.addEventListener('connectionstatechange', onStateChange)
    })
  }

  private async waitForViewerReady(
    pc: RTCPeerConnection,
    hasReceivedTrack: () => boolean,
    timeoutMs: number
  ) {
    if (hasReceivedTrack() || pc.connectionState === 'connected') {
      return
    }
    await new Promise<void>((resolve, reject) => {
      const pollTimerId = window.setInterval(() => {
        if (hasReceivedTrack() || pc.connectionState === 'connected') {
          clearTimeout(timeoutId)
          clearInterval(pollTimerId)
          pc.removeEventListener('connectionstatechange', onStateChange)
          resolve()
        }
      }, 120)
      const timeoutId = window.setTimeout(() => {
        clearInterval(pollTimerId)
        pc.removeEventListener('connectionstatechange', onStateChange)
        reject(new Error('VIEWER_CONNECTION_NOT_READY'))
      }, timeoutMs)
      const onStateChange = () => {
        if (hasReceivedTrack() || pc.connectionState === 'connected') {
          clearTimeout(timeoutId)
          clearInterval(pollTimerId)
          pc.removeEventListener('connectionstatechange', onStateChange)
          resolve()
          return
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          clearTimeout(timeoutId)
          clearInterval(pollTimerId)
          pc.removeEventListener('connectionstatechange', onStateChange)
          reject(new Error('VIEWER_CONNECTION_NOT_READY'))
        }
      }
      pc.addEventListener('connectionstatechange', onStateChange)
    })
  }

  private async tryCreateVideoRoom(handleId: number, roomId: number) {
    try {
      await this.sendPluginMessage(handleId, {
        request: 'create',
        room: roomId,
        publishers: 12,
        videocodec: 'vp9',
        bitrate: JanusVideoBridge.DEFAULT_MAX_BITRATE,
        bitrate_cap: true,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.includes('(427)')) {
        return
      }
      if (message.includes('(425)')) {
        return
      }
      if (message.includes('(486)')) {
        return
      }
    }
  }

  async ensurePublisher(params: PublisherParams): Promise<number> {
    const { roomId, feedId, displayName, stream, iceServers, maxBitrate, maxFps } = params
    this.lastPublisherContext = { roomId, feedId, displayName, iceServers }
    const hasLiveVideoTrack = stream.getVideoTracks().some((track) => track.readyState === 'live')
    if (!hasLiveVideoTrack) {
      throw new Error('没有可用的视频轨道')
    }
    const canReusePublisherSession = this.publisherPc
      && this.publisherPc.connectionState !== 'closed'
      && this.publisherPc.connectionState !== 'failed'
      && this.publisherPc.connectionState !== 'disconnected'
      && this.publisherHandleId
      && this.currentPublisherRoom === roomId
      && this.currentPublisherFeedId === feedId
    if (
      canReusePublisherSession &&
      this.publisherPc &&
      this.publisherSender?.track?.readyState === 'live'
    ) {
      if (!this.currentPublisherFeedId) {
        throw new Error('PUBLISH_FEED_NOT_READY')
      }
      return this.currentPublisherFeedId
    }
    // 复用条件不满足需要重建：先探活现有 session，避免复用半死连接导致逐级超时
    await this.validateOrResetSession()
    await this.stopPublisher()
    this.publisherRemoteDescReady = false
    this.pendingPublisherCandidates = []
    this.publisherHandleId = await this.attachPlugin('janus.plugin.videoroom', async (payload) => {
      if (payload.janus === 'trickle' && payload.candidate?.candidate) {
        await this.enqueueOrApplyRemoteCandidate(
          this.publisherPc,
          payload.candidate,
          this.publisherRemoteDescReady,
          this.pendingPublisherCandidates
        )
      }
      if ((payload.janus === 'hangup' || payload.janus === 'detached') && this.publisherPc) {
        this.publisherPc.close()
      }
    })
    const publisherHandleId = this.publisherHandleId
    await this.tryCreateVideoRoom(this.publisherHandleId, roomId)
    const joinedResult = await this.sendPluginMessage(this.publisherHandleId, {
      request: 'join',
      ptype: 'publisher',
      room: roomId,
      id: feedId,
      display: displayName,
    })
    const joinedFeedId = Number(
      joinedResult.plugindata?.data?.id ||
      joinedResult.data?.id ||
      feedId
    )
    this.currentPublisherFeedId = Number.isFinite(joinedFeedId) && joinedFeedId > 0 ? joinedFeedId : feedId
    const pc = new RTCPeerConnection({ iceServers })
    this.publisherPc = pc
    this.currentPublisherRoom = roomId
    this.publisherTargetBitrate = Math.max(
      JanusVideoBridge.MIN_STABLE_BITRATE,
      maxBitrate || JanusVideoBridge.DEFAULT_MAX_BITRATE
    )
    this.publisherBitrateCeiling = this.publisherTargetBitrate
    this.publisherTargetFps = Math.max(10, maxFps || JanusVideoBridge.DEFAULT_MAX_FPS)
    this.publisherLastOutboundStats = null
    this.publisherLastFramesEncoded = null
    this.publisherLowMotionTicks = 0
    this.publisherBoostUntilTs = Date.now() + JanusVideoBridge.SCENE_CHANGE_BOOST_MS
    pc.onicecandidate = (event) => {
      void this.sendTrickle(publisherHandleId, event.candidate ? event.candidate.toJSON() : null)
    }
    this.publisherSender = null

    // 添加视频轨道
    stream.getVideoTracks().forEach((track) => {
      const sender = pc.addTrack(track, stream)
      this.publisherSender = sender
    })

    // 添加音频轨道（系统声音）
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length > 0) {
      audioTracks.forEach((track) => {
        pc.addTrack(track, stream)
      })
    }
    if (this.publisherSender) {
      await this.applyPublisherEncoding(this.publisherTargetBitrate, this.publisherTargetFps)
    }
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    // 检查是否有音频轨道
    const hasAudio = stream.getAudioTracks().length > 0

    const configured = await this.sendPluginMessage(
      this.publisherHandleId,
      {
        request: 'configure',
        audio: hasAudio,  // 根据实际音频轨道决定
        video: true,
        bitrate: this.publisherTargetBitrate,
        bitrate_cap: true,
      },
      { type: 'offer', sdp: offer.sdp || '' }
    )
    const configuredResult = configured.jsep?.sdp
      ? configured
      : await this.waitForHandleEvent(this.publisherHandleId, (payload) => Boolean(payload.jsep?.sdp), 20000)
    if (!configuredResult.jsep || !configuredResult.jsep.sdp) {
      throw new Error('Janus 未返回发布应答')
    }
    await pc.setRemoteDescription({
      type: 'answer',
      sdp: configuredResult.jsep.sdp,
    })
    this.publisherRemoteDescReady = true
    await this.flushPendingCandidates(pc, this.pendingPublisherCandidates)
    await this.waitForConnectionReady(pc, 12000)
    this.startPublisherAdaptation(publisherHandleId)
    if (!this.currentPublisherFeedId) {
      throw new Error('PUBLISH_FEED_NOT_READY')
    }
    return this.currentPublisherFeedId
  }

  async updatePublisherEncoding(maxBitrate: number, maxFps: number) {
    if (!this.publisherSender || !this.publisherHandleId) {
      return
    }
    this.publisherTargetBitrate = Math.max(JanusVideoBridge.MIN_STABLE_BITRATE, maxBitrate)
    this.publisherBitrateCeiling = this.publisherTargetBitrate
    this.publisherTargetFps = Math.max(10, maxFps)
    this.publisherLastOutboundStats = null
    this.publisherLastFramesEncoded = null
    this.publisherLowMotionTicks = 0
    this.publisherBoostUntilTs = 0
    await this.applyPublisherEncoding(this.publisherTargetBitrate, this.publisherTargetFps)
    await this.configurePublisherBitrate(this.publisherHandleId, this.publisherTargetBitrate)
  }

  async replacePublisherStream(stream: MediaStream, maxBitrate?: number, maxFps?: number) {
    const nextTrack = stream.getVideoTracks().find((track) => track.readyState === 'live')
    if (!nextTrack) {
      throw new Error('没有可用的视频轨道')
    }
    nextTrack.contentHint = 'detail'
    if (!this.publisherSender || !this.publisherHandleId) {
      if (!this.lastPublisherContext) {
        throw new Error('PUBLISH_SENDER_NOT_READY')
      }
      await this.ensurePublisher({
        ...this.lastPublisherContext,
        stream,
        maxBitrate,
        maxFps,
      })
      return
    }
    try {
      await this.publisherSender.replaceTrack(nextTrack)
    } catch {
      if (!this.lastPublisherContext) {
        throw new Error('PUBLISH_SENDER_NOT_READY')
      }
      await this.stopPublisher()
      await this.ensurePublisher({
        ...this.lastPublisherContext,
        stream,
        maxBitrate,
        maxFps,
      })
      return
    }
    if (typeof maxBitrate === 'number') {
      this.publisherTargetBitrate = Math.max(JanusVideoBridge.MIN_STABLE_BITRATE, maxBitrate)
      this.publisherBitrateCeiling = this.publisherTargetBitrate
    }
    if (typeof maxFps === 'number') {
      this.publisherTargetFps = Math.max(10, maxFps)
    }
    this.publisherLastOutboundStats = null
    this.publisherLastFramesEncoded = null
    this.publisherLowMotionTicks = 0
    this.publisherBoostUntilTs = Date.now() + JanusVideoBridge.SCENE_CHANGE_BOOST_MS
    await this.applyPublisherEncoding(this.publisherTargetBitrate, this.publisherTargetFps)
    if (this.publisherHandleId) {
      await this.configurePublisherBitrate(this.publisherHandleId, this.publisherTargetBitrate)
    }
  }

  private async applyPublisherEncoding(maxBitrate: number, maxFps: number) {
    if (!this.publisherSender) {
      return
    }
    const parameters = this.publisherSender.getParameters()
    const currentEncoding = parameters.encodings?.[0] ?? {}
    const nextEncoding: RTCRtpEncodingParameters = {
      ...currentEncoding,
      maxBitrate,
      maxFramerate: maxFps,
      networkPriority: 'high',
    }
    parameters.encodings = [nextEncoding]
    if ('degradationPreference' in parameters) {
      ;(parameters as RTCRtpSendParameters & { degradationPreference?: RTCDegradationPreference }).degradationPreference = 'maintain-resolution'
    }
    await this.publisherSender.setParameters(parameters).catch(() => undefined)
  }

  private async configureViewerLayers() {
    if (!this.viewerHandleId) {
      return
    }
    await this.sendPluginMessage(this.viewerHandleId, {
      request: 'configure',
      spatial_layer: this.viewerPreferredSpatialLayer,
      temporal_layer: this.viewerPreferredTemporalLayer,
    }).catch(() => undefined)
  }

  async setViewerResolution(resolution: '720p' | '1080p') {
    this.viewerPreferredSpatialLayer = resolution === '1080p' ? JanusVideoBridge.VP9_MAX_SPATIAL_LAYER : 1
    this.viewerPreferredTemporalLayer = JanusVideoBridge.VP9_MAX_TEMPORAL_LAYER
    await this.configureViewerLayers()
  }

  private async configurePublisherBitrate(handleId: number, bitrate: number) {
    await this.sendPluginMessage(handleId, {
      request: 'configure',
      audio: true,  // 保持音频开启
      video: true,
      bitrate,
      bitrate_cap: true,
    }).catch(() => undefined)
  }

  private startPublisherAdaptation(handleId: number) {
    if (!this.publisherPc || !this.publisherSender) {
      return
    }
    if (this.publisherAdaptTimer) {
      clearInterval(this.publisherAdaptTimer)
      this.publisherAdaptTimer = null
    }
    const pc = this.publisherPc
    const sender = this.publisherSender
    this.publisherAdaptTimer = window.setInterval(() => {
      void (async () => {
        if (
          this.publisherPc !== pc ||
          this.publisherSender !== sender ||
          pc.connectionState === 'closed' ||
          !sender.track
        ) {
          this.stopPublisherAdaptation()
          return
        }
        let currentRoundTripTime = 0
        let qualityLimitedByBandwidth = false
        let packetsSent = 0
        let packetsLost = 0
        let framesEncoded = 0
        const stats = await pc.getStats()
        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && (report as RTCIceCandidatePairStats).state === 'succeeded') {
            const pair = report as RTCIceCandidatePairStats
            if (pair.currentRoundTripTime && pair.currentRoundTripTime > 0) {
              currentRoundTripTime = pair.currentRoundTripTime
            }
          }
          if (report.type === 'outbound-rtp') {
            const outbound = report as RTCOutboundRtpStreamStats
            if (outbound.kind === 'video') {
              packetsSent = outbound.packetsSent ?? packetsSent
              framesEncoded = outbound.framesEncoded ?? framesEncoded
              if (outbound.qualityLimitationReason === 'bandwidth') {
                qualityLimitedByBandwidth = true
              }
            }
          }
          if (report.type === 'remote-inbound-rtp') {
            const remoteInbound = report as RTCStats & { kind?: string; packetsLost?: number }
            if (remoteInbound.kind === 'video') {
              packetsLost = remoteInbound.packetsLost ?? packetsLost
            }
          }
        })
        const previousFramesEncoded = this.publisherLastFramesEncoded
        this.publisherLastFramesEncoded = framesEncoded
        let deltaFrames = 0
        if (typeof previousFramesEncoded === 'number') {
          deltaFrames = Math.max(0, framesEncoded - previousFramesEncoded)
        }
        const wasLowMotion = this.publisherLowMotionTicks >= 1
        if (deltaFrames <= 1) {
          this.publisherLowMotionTicks += 1
        } else {
          if (wasLowMotion && deltaFrames >= 3) {
            this.publisherBoostUntilTs = Date.now() + JanusVideoBridge.SCENE_CHANGE_BOOST_MS
          }
          this.publisherLowMotionTicks = 0
        }
        const previousStats = this.publisherLastOutboundStats
        this.publisherLastOutboundStats = { packetsSent, packetsLost }
        let lossRate = 0
        if (previousStats) {
          const deltaSent = Math.max(0, packetsSent - previousStats.packetsSent)
          const deltaLost = Math.max(0, packetsLost - previousStats.packetsLost)
          const total = deltaSent + deltaLost
          if (total > 0) {
            lossRate = deltaLost / total
          }
        }
        const upperBitrate = Math.max(this.publisherBitrateCeiling, JanusVideoBridge.MIN_STABLE_BITRATE)
        let nextBitrate = this.publisherTargetBitrate
        let nextFps = this.publisherTargetFps
        if (this.publisherBoostUntilTs > Date.now()) {
          nextBitrate = upperBitrate
          nextFps = JanusVideoBridge.DEFAULT_MAX_FPS
        } else if (lossRate >= 0.05 || currentRoundTripTime >= 0.3) {
          nextBitrate = Math.floor(nextBitrate * 0.72)
          nextFps = 15
        } else if (lossRate >= 0.02 || currentRoundTripTime >= 0.2 || qualityLimitedByBandwidth) {
          nextBitrate = Math.floor(nextBitrate * 0.85)
          nextFps = 15
        } else if (lossRate <= 0.008 && currentRoundTripTime > 0 && currentRoundTripTime <= 0.12 && !qualityLimitedByBandwidth) {
          nextBitrate = nextBitrate + 180_000
          nextFps = JanusVideoBridge.DEFAULT_MAX_FPS
        }
        nextBitrate = Math.max(JanusVideoBridge.MIN_STABLE_BITRATE, Math.min(upperBitrate, nextBitrate))
        if (
          Math.abs(nextBitrate - this.publisherTargetBitrate) >= 80_000 ||
          nextFps !== this.publisherTargetFps
        ) {
          this.publisherTargetBitrate = nextBitrate
          this.publisherTargetFps = nextFps
          await this.applyPublisherEncoding(nextBitrate, nextFps)
          await this.configurePublisherBitrate(handleId, nextBitrate)
        }
      })()
    }, JanusVideoBridge.ADAPT_INTERVAL_MS)
  }

  private stopPublisherAdaptation() {
    if (!this.publisherAdaptTimer) {
      return
    }
    clearInterval(this.publisherAdaptTimer)
    this.publisherAdaptTimer = null
  }

  async startViewer(params: ViewerParams) {
    // 长时间挂机后 WS 可能半死，先探活避免观看端逐级超时
    await this.validateOrResetSession()
    await this.stopViewer()
    this.viewerRemoteDescReady = false
    this.pendingViewerCandidates = []
    this.viewerHandleId = await this.attachPlugin('janus.plugin.videoroom', async (payload) => {
      if (payload.janus === 'trickle' && payload.candidate?.candidate) {
        await this.enqueueOrApplyRemoteCandidate(
          this.viewerPc,
          payload.candidate,
          this.viewerRemoteDescReady,
          this.pendingViewerCandidates
        )
      }
      if ((payload.janus === 'hangup' || payload.janus === 'detached') && this.viewerPc) {
        this.viewerPc.close()
      }
    })
    const viewerHandleId = this.viewerHandleId
    const joinResult = await this.sendPluginMessage(this.viewerHandleId, {
      request: 'join',
      ptype: 'subscriber',
      room: params.roomId,
      feed: params.feedId,
    })
    this.log('viewer join result', params.roomId, params.feedId, joinResult.janus, joinResult.plugindata?.data || '')
    const subscriberOffer = joinResult.jsep?.sdp
      ? joinResult
      : await this.waitForHandleEvent(this.viewerHandleId, (payload) => Boolean(payload.jsep?.sdp), 20000)
    if (!subscriberOffer.jsep || subscriberOffer.jsep.type !== 'offer' || !subscriberOffer.jsep.sdp) {
      throw new Error('Janus 未返回订阅 offer')
    }
    const pc = new RTCPeerConnection({ iceServers: params.iceServers })
    this.viewerPc = pc
    let hasReceivedTrack = false
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })  // 添加音频接收器
    pc.onconnectionstatechange = () => {
      if (params.onConnectionStateChange) {
        params.onConnectionStateChange(pc.connectionState)
      }
    }
    pc.onicecandidate = (event) => {
      void this.sendTrickle(viewerHandleId, event.candidate ? event.candidate.toJSON() : null)
    }
    const remoteStream = new MediaStream()
    pc.ontrack = (event) => {
      const receiver = event.receiver as RTCRtpReceiver & { playoutDelayHint?: number; jitterBufferTarget?: number }
      if ('playoutDelayHint' in receiver) {
        receiver.playoutDelayHint = 0.02
      }
      if ('jitterBufferTarget' in receiver) {
        receiver.jitterBufferTarget = 0
      }
      const stream = event.streams[0]
      const emitTrack = () => {
        if (stream) {
          hasReceivedTrack = true
          params.onTrack(stream)
          return
        }
        if (!remoteStream.getTracks().some((track) => track.id === event.track.id)) {
          remoteStream.addTrack(event.track)
        }
        hasReceivedTrack = true
        params.onTrack(remoteStream)
      }
      emitTrack()
      event.track.onunmute = () => {
        emitTrack()
      }
    }
    await pc.setRemoteDescription({ type: 'offer', sdp: subscriberOffer.jsep.sdp })
    this.viewerRemoteDescReady = true
    await this.flushPendingCandidates(pc, this.pendingViewerCandidates)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await this.sendPluginMessage(
      this.viewerHandleId,
      { request: 'start', room: params.roomId },
      { type: 'answer', sdp: answer.sdp || '' }
    )
    await this.configureViewerLayers()
    await this.waitForViewerReady(pc, () => hasReceivedTrack, 10000)
    return pc
  }

  async stopViewer() {
    const closingPc = this.viewerPc
    const detachingHandleId = this.viewerHandleId
    this.viewerPc = null
    this.viewerHandleId = null
    this.viewerRemoteDescReady = false
    this.pendingViewerCandidates = []
    this.viewerPreferredSpatialLayer = JanusVideoBridge.VP9_MAX_SPATIAL_LAYER
    this.viewerPreferredTemporalLayer = JanusVideoBridge.VP9_MAX_TEMPORAL_LAYER
    if (closingPc) {
      closingPc.ontrack = null
      closingPc.onicecandidate = null
      closingPc.onconnectionstatechange = null
      closingPc.close()
    }
    await this.detachHandle(detachingHandleId)
  }

  async getRoomParticipants(roomId: number): Promise<JanusParticipant[]> {
    if (!this.sessionId) {
      return []
    }
    
    // 使用 viewer handle 或创建临时 handle
    const handleId = this.viewerHandleId || this.publisherHandleId
    if (!handleId) {
      return []
    }
    
    try {
      const result = await this.sendPluginMessage(handleId, {
        request: 'listparticipants',
        room: roomId,
      })
      
      const participants = result.plugindata?.data?.participants as Array<{
        id: number
        display?: string
        publisher?: boolean
        talking?: boolean
      }> | undefined
      
      if (!Array.isArray(participants)) {
        return []
      }
      
      return participants.map((p) => ({
        id: p.id,
        display: p.display || `用户-${p.id}`,
        publisher: p.publisher || false,
        talking: p.talking || false,
      }))
    } catch (error) {
      this.log('获取房间参与者失败:', error)
      return []
    }
  }

  async stopPublisher() {
    this.stopPublisherAdaptation()
    const closingPc = this.publisherPc
    const detachingHandleId = this.publisherHandleId
    this.publisherPc = null
    this.publisherHandleId = null
    this.publisherSender = null
    this.publisherBitrateCeiling = JanusVideoBridge.DEFAULT_MAX_BITRATE
    this.publisherLastOutboundStats = null
    this.publisherLastFramesEncoded = null
    this.publisherLowMotionTicks = 0
    this.publisherBoostUntilTs = 0
    this.currentPublisherRoom = null
    this.currentPublisherFeedId = null
    this.lastPublisherContext = null
    this.publisherRemoteDescReady = false
    this.pendingPublisherCandidates = []
    if (closingPc) {
      closingPc.onicecandidate = null
      closingPc.onconnectionstatechange = null
      closingPc.close()
    }
    await this.detachHandle(detachingHandleId)
  }

  async destroy() {
    await this.stopViewer()
    await this.stopPublisher()
    if (this.sessionId) {
      try {
        await this.sendWithTransaction({
          janus: 'destroy',
          session_id: this.sessionId,
        }, 6000)
      } catch {
      }
    }
    this.stopKeepalive()
    this.sessionId = null
    this.rejectAllPending('Janus 已销毁')
    this.rejectAllPendingHandleEvents('Janus 已销毁')
    this.cachedHandleEvents.clear()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.wsOpenPromise = null
  }
}
