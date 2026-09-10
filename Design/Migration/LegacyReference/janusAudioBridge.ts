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
  candidate?: RTCIceCandidateInit & {
    completed?: boolean
  }
  plugindata?: {
    plugin?: string
    data?: Record<string, any>
  }
  error?: {
    code?: number
    reason?: string
  }
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

type InputTrackBundle = {
  track: MediaStreamTrack
  cleanup: () => void
}

type AudioBridgeParticipant = {
  id: number
  display?: string
  setup?: boolean
  muted?: boolean
  talking?: boolean
}

type StartAudioCallParams = {
  roomId: number
  displayName: string
  iceServers: RTCIceServer[]
  inputDeviceId?: string | null
  inputMuted?: boolean
  outputDeviceId?: string | null
  outputMuted?: boolean
  audioElement?: HTMLAudioElement | null
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
}

type JanusAudioBridgeOptions = {
  wsUrl: string
  subProtocol: string
  debug?: boolean
}

function randomTransactionId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function getPluginError(payload: JanusTransactionResult) {
  const data = payload.plugindata?.data
  if (!data || typeof data !== 'object') {
    return ''
  }
  const error = String(data.error || data.error_reason || '').trim()
  return error
}

function getAudioBridgeEvent(payload: JanusTransactionResult) {
  const data = payload.plugindata?.data
  if (!data || typeof data !== 'object') {
    return ''
  }
  const event = String((data as Record<string, unknown>).audiobridge || (data as Record<string, any>).result?.event || '').trim()
  return event
}

export class JanusAudioBridge {
  private wsUrl: string
  private subProtocol: string
  private debug: boolean
  private ws: WebSocket | null = null
  private wsOpenPromise: Promise<void> | null = null
  private sessionId: number | null = null
  private keepaliveTimer: number | null = null
  private pendingTransactions = new Map<string, PendingTransaction>()
  private pendingHandleEvents = new Map<number, PendingHandleEvent[]>()
  private handleListeners = new Map<number, (payload: JanusTransactionResult) => void>()
  private audioHandleId: number | null = null
  private audioPc: RTCPeerConnection | null = null
  private audioSender: RTCRtpSender | null = null
  private localAudioTrack: MediaStreamTrack | null = null
  private inputTrackCleanup: (() => void) | null = null
  // 热插拔自恢复：记住最近一次请求的输入设备，掉设备后据此重新采集
  private currentInputDeviceId: string | null = null
  private inputRecovering = false
  private inputRecoverToken = 0
  // 闭麦期间轨道被系统回收（ended）时置真，延迟到开麦时再重建，避免与开麦竞争
  private inputTrackDead = false
  private remoteAudioStream: MediaStream | null = null
  private currentRoomId: number | null = null
  private currentInputMuted = false
  private currentOutputMuted = false
  private currentAudioElement: HTMLAudioElement | null = null
  private currentOutputDeviceId: string | null = null
  private remoteAudioRestartTimer: number | null = null
  private fallbackToneContext: AudioContext | null = null
  private fallbackToneOscillator: OscillatorNode | null = null
  private fallbackToneGain: GainNode | null = null
  private fallbackToneAudioElement: HTMLAudioElement | null = null
  private fallbackToneTimer: number | null = null
  private audioRemoteDescReady = false
  private pendingAudioCandidates: RTCIceCandidateInit[] = []
  private participantPollTimer: number | null = null
  private iceRestartTimer: number | null = null
  private muteSyncTimer: number | null = null
  private participantCount = 0
  private participantDisplayNames: string[] = []
  private participantSnapshots: AudioBridgeParticipant[] = []
  private localTrackLevelDb = -72
  private remoteTrackLevelDb = -72
  private localTrackLevelMonitorToken = 0
  private remoteTrackLevelMonitorToken = 0

  /** 根据参与人数动态计算最优 Opus 码率，保证多人混音不降质，保底 128kbps */
  private computeOpusBitrate(): number {
    const count = Math.max(1, this.participantCount)
    if (count <= 4) return 128000
    if (count <= 7) return 160000
    return 192000
  }

  get participantCountValue() {
    return this.participantCount
  }

  get participantDisplayNamesValue() {
    return [...this.participantDisplayNames]
  }

  get participantSnapshotsValue() {
    return this.participantSnapshots.map((participant) => ({ ...participant }))
  }

  get localTrackLevelDbValue() {
    return this.localTrackLevelDb
  }

  get remoteTrackLevelDbValue() {
    return this.remoteTrackLevelDb
  }

  get isConnected() {
    return Boolean(this.audioPc && this.audioPc.connectionState === 'connected' && this.sessionId && this.audioHandleId && this.currentRoomId)
  }

  get roomId() {
    return this.currentRoomId
  }

  constructor(options: JanusAudioBridgeOptions) {
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

  private logAudioStep(step: string, details?: Record<string, unknown>) {
    if (!this.debug) {
      return
    }
    if (!details) {
      this.log(`[audio] ${step}`)
      return
    }
    let serialized = ''
    try {
      serialized = JSON.stringify(details)
    } catch {
      serialized = '[unserializable-details]'
    }
    this.log(`[audio] ${step} ${serialized}`)
  }

  private async playCurrentAudioElement(source: string) {
    if (!this.currentAudioElement) {
      return
    }
    try {
      await this.currentAudioElement.play()
      if (this.outputUnlockCleanup) {
        this.outputUnlockCleanup()
        this.outputUnlockCleanup = null
      }
      this.pendingOutputUnlockRetry = false
      this.logAudioStep('play-ok', {
        source,
        muted: this.currentAudioElement.muted,
        hasSrcObject: Boolean(this.currentAudioElement.srcObject),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logAudioStep('play-failed', { source, message })
      if (/notallowed|interact|gesture/i.test(message)) {
        this.createOutputUnlockRetry(source)
      }
    }
  }

  private async probeTrackLevel(track: MediaStreamTrack, scope: 'local' | 'remote') {
    if (!this.debug) {
      return
    }
    const ContextClass = (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!ContextClass) {
      this.logAudioStep('level-probe-unsupported', { scope })
      return
    }
    const context = new ContextClass()
    try {
      const stream = new MediaStream([track])
      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      let peak = 0
      let rmsTotal = 0
      let count = 0
      const startAt = performance.now()
      await new Promise<void>((resolve) => {
        const read = () => {
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let index = 0; index < data.length; index++) {
            const normalized = (data[index] - 128) / 128
            const abs = Math.abs(normalized)
            if (abs > peak) {
              peak = abs
            }
            sum += normalized * normalized
          }
          rmsTotal += Math.sqrt(sum / data.length)
          count += 1
          if (performance.now() - startAt >= 700) {
            resolve()
            return
          }
          requestAnimationFrame(read)
        }
        read()
      })
      source.disconnect()
      analyser.disconnect()
      this.logAudioStep('level-probe', {
        scope,
        trackId: track.id,
        trackEnabled: track.enabled,
        trackMuted: track.muted,
        trackReadyState: track.readyState,
        avgRms: Number((rmsTotal / Math.max(count, 1)).toFixed(4)),
        peak: Number(peak.toFixed(4)),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logAudioStep('level-probe-failed', { scope, message })
    } finally {
      await context.close().catch(() => undefined)
    }
  }

  private normalizeLevelDb(rms: number) {
    if (!Number.isFinite(rms) || rms <= 0) {
      return -72
    }
    return Math.max(-72, Math.min(0, 20 * Math.log10(rms)))
  }

  private async startTrackLevelMonitor(track: MediaStreamTrack, scope: 'local' | 'remote') {
    const token = scope === 'local'
      ? ++this.localTrackLevelMonitorToken
      : ++this.remoteTrackLevelMonitorToken
    const ContextClass = (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!ContextClass) {
      return
    }
    const context = new ContextClass()
    // 远端音轨：每 10 分钟重启 AudioContext 防止时钟漂移导致声音变形
    const RESTART_INTERVAL_MS = 10 * 60 * 1000
    if (scope === 'remote') {
      if (this.remoteAudioRestartTimer) {
        clearTimeout(this.remoteAudioRestartTimer)
      }
      this.remoteAudioRestartTimer = window.setTimeout(() => {
        if (track.readyState !== 'ended') {
          void this.startTrackLevelMonitor(track, 'remote')
        }
      }, RESTART_INTERVAL_MS)
    }
    try {
      const stream = new MediaStream([track])
      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.72
      source.connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      // 远端：累积 RMS 用于静音检测
      let rmsTotal = 0
      let rmsCount = 0
      const checkSilence = scope === 'remote'
      await new Promise<void>((resolve) => {
        const read = () => {
          const expired = scope === 'local'
            ? token !== this.localTrackLevelMonitorToken
            : token !== this.remoteTrackLevelMonitorToken
          if (expired || track.readyState === 'ended') {
            resolve()
            return
          }
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let index = 0; index < data.length; index++) {
            const normalized = (data[index] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / data.length)
          const db = this.normalizeLevelDb(rms)
          if (scope === 'local') {
            this.localTrackLevelDb = db
          } else {
            this.remoteTrackLevelDb = db
            // 远端累积 RMS，用于静音检测（聚合约 2 秒后检查）
            rmsTotal += rms
            rmsCount += 1
            if (checkSilence && rmsCount >= 20) {
              const avgRms = rmsTotal / rmsCount
              if (this.participantCount <= 1 || avgRms < 0.005) {
                void this.stopFallbackTone()
              } else if (this.participantCount > 1) {
                void this.stopFallbackTone()
              }
              // 重置累积，每约 2 秒检查一次
              rmsTotal = 0
              rmsCount = 0
            }
          }
          setTimeout(read, 100)
        }
        read()
      })
      source.disconnect()
      analyser.disconnect()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logAudioStep('level-monitor-failed', { scope, message })
    } finally {
      if (scope === 'local' && token === this.localTrackLevelMonitorToken) {
        this.localTrackLevelDb = -72
      }
      if (scope === 'remote' && token === this.remoteTrackLevelMonitorToken) {
        this.remoteTrackLevelDb = -72
      }
      await context.close().catch(() => undefined)
    }
  }

  private async stopFallbackTone() {
    if (this.fallbackToneTimer) {
      clearInterval(this.fallbackToneTimer)
      this.fallbackToneTimer = null
    }
    if (this.fallbackToneOscillator) {
      try {
        this.fallbackToneOscillator.stop()
      } catch (error) {
        void error
      }
      this.fallbackToneOscillator.disconnect()
      this.fallbackToneOscillator = null
    }
    if (this.fallbackToneGain) {
      this.fallbackToneGain.disconnect()
      this.fallbackToneGain = null
    }
    if (this.fallbackToneAudioElement) {
      this.fallbackToneAudioElement.srcObject = null
      this.fallbackToneAudioElement = null
    }
    if (this.fallbackToneContext) {
      await this.fallbackToneContext.close().catch(() => undefined)
      this.fallbackToneContext = null
    }
    this.logAudioStep('fallback-tone-stopped')
  }

  private async applyOutputToElement(element: HTMLAudioElement) {
    element.volume = 1
    element.muted = this.currentOutputMuted
    const target = element as HTMLAudioElement & { setSinkId?: (sinkId: string) => Promise<void> }
    if (typeof target.setSinkId === 'function') {
      const sinkId = this.currentOutputDeviceId || ''
      try {
        await target.setSinkId(sinkId)
      } catch {
        // 指定的输出设备被拔出 / 不可用时，setSinkId 会 reject 并停在已失效的 sink 上，
        // 导致听不到声音。退回系统默认 sink，保证声音仍有出口（不改动用户的设备选择配置）。
        if (sinkId) {
          this.logAudioStep('output-sink-fallback', { failedSinkId: sinkId })
          await target.setSinkId('').catch(() => undefined)
        }
      }
    }
  }

  private bindWebSocket(ws: WebSocket) {
    ws.onmessage = (event) => {
      let payload: JanusTransactionResult
      try {
        payload = JSON.parse(String(event.data))
      } catch {
        return
      }
      const pluginData = payload.plugindata?.data || {}
      const pluginEvent = String(
        (pluginData && typeof pluginData === 'object' && (pluginData.audiobridge || pluginData.result?.event || pluginData.result)) || ''
      ).trim()
      if (payload.janus === 'error') {
        this.logAudioStep('janus-error', {
          reason: payload.error?.reason || '',
          code: payload.error?.code || '',
          sender: payload.sender || '',
        })
      } else if (payload.janus === 'event' && (pluginEvent || payload.jsep?.type)) {
        this.logAudioStep('janus-event', {
          event: pluginEvent || '',
          sender: payload.sender || '',
          hasJsep: Boolean(payload.jsep?.sdp),
        })
      } else if (payload.janus === 'webrtcup' || payload.janus === 'hangup' || payload.janus === 'detached' || payload.janus === 'media') {
        this.logAudioStep('janus-state', {
          janus: payload.janus,
          sender: payload.sender || '',
          event: pluginEvent || '',
        })
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
        pending.reject(new Error(payload.error?.reason || 'Janus request failed'))
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
      this.audioHandleId = null
      this.handleListeners.clear()
    }
  }

  private rejectAllPending(reason: string) {
    this.pendingTransactions.forEach((pending) => {
      clearTimeout(pending.timeoutId)
      pending.reject(new Error(reason))
    })
    this.pendingTransactions.clear()
  }

  private rejectAllPendingHandleEvents(reason: string) {
    this.pendingHandleEvents.forEach((items) => {
      items.forEach((item) => {
        clearTimeout(item.timeoutId)
        item.reject(new Error(reason))
      })
    })
    this.pendingHandleEvents.clear()
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
    const message = { ...payload, transaction }
    return await new Promise<JanusTransactionResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingTransactions.delete(transaction)
        reject(new Error('Janus 请求超时'))
      }, timeoutMs)
      this.pendingTransactions.set(transaction, { resolve, reject, timeoutId })
      if (payload.janus !== 'keepalive') {
        this.logAudioStep('janus-send', {
          janus: payload.janus,
          request: payload.body?.request || '',
          handleId: payload.handle_id || '',
          transaction,
        })
      }
      ws.send(JSON.stringify(message))
    })
  }

  private async waitForHandleEvent(
    handleId: number,
    match: (payload: JanusTransactionResult) => boolean,
    timeoutMs = 20000
  ) {
    return await new Promise<JanusTransactionResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        const current = this.pendingHandleEvents.get(handleId) || []
        this.pendingHandleEvents.set(handleId, current.filter((item) => item.timeoutId !== timeoutId))
        reject(new Error('Janus 事件超时'))
      }, timeoutMs)
      const queue = this.pendingHandleEvents.get(handleId) || []
      queue.push({ match, resolve, reject, timeoutId })
      this.pendingHandleEvents.set(handleId, queue)
    })
  }

  private startKeepalive() {
    if (this.keepaliveTimer || !this.sessionId) {
      return
    }
    this.keepaliveTimer = window.setInterval(() => {
      if (!this.sessionId) {
        return
      }
      void this.sendWithTransaction({
        janus: 'keepalive',
        session_id: this.sessionId,
      }, 5000).catch(() => undefined)
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
    const result = await this.sendWithTransaction({ janus: 'create' })
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
   * 若 WS 假死或服务端已清理 session，强制重置本地状态，
   * 后续 ensureSession / ensureWebSocket 会创建全新会话与连接。
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
      this.logAudioStep('session-stale-reset', { prevSessionId: this.sessionId })
      // Session 已失效，强制清理本地状态
      // 不尝试发送 destroy，因为 WS 可能已无响应，避免阻塞
      this.sessionId = null
      this.stopKeepalive()
      this.rejectAllPending('会话已失效')
      this.rejectAllPendingHandleEvents('会话已失效')
      this.audioHandleId = null
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
    this.ws.send(JSON.stringify({
      janus: 'trickle',
      session_id: this.sessionId,
      handle_id: handleId,
      candidate: candidate || { completed: true },
      transaction: randomTransactionId(),
    }))
  }

  private async enqueueOrApplyRemoteCandidate(
    pc: RTCPeerConnection | null,
    candidate: RTCIceCandidateInit,
    remoteDescReady: boolean,
    pending: RTCIceCandidateInit[]
  ) {
    if (!candidate?.candidate) {
      return
    }
    if (!pc || !remoteDescReady) {
      pending.push(candidate)
      return
    }
    await pc.addIceCandidate(candidate).catch(() => undefined)
  }

  private async flushPendingCandidates(pc: RTCPeerConnection | null, pending: RTCIceCandidateInit[]) {
    if (!pc || pending.length === 0) {
      return
    }
    const queue = pending.splice(0, pending.length)
    for (const candidate of queue) {
      if (!candidate?.candidate) {
        continue
      }
      await pc.addIceCandidate(candidate).catch(() => undefined)
    }
  }

  private async ensureRoom(handleId: number, roomId: number) {
    try {
      await this.sendPluginMessage(handleId, {
        request: 'create',
        room: roomId,
        sampling_rate: 48000,
        spatial_audio: false,
        audiolevel_ext: true,
        audiolevel_event: true,
        record: false,
        default_bitrate: this.computeOpusBitrate(),
        default_expectedloss: 5,
        audio_level_average: 30,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (!message.includes('already exists') && !message.includes('(486)')) {
        throw error
      }
    }
  }

  private async joinRoom(handleId: number, roomId: number, displayName: string, muted: boolean) {
    const ensureJoined = async (payload?: JanusTransactionResult) => {
      if (payload && getAudioBridgeEvent(payload) === 'joined') {
        return
      }
      await this.waitForHandleEvent(handleId, (eventPayload) => getAudioBridgeEvent(eventPayload) === 'joined', 20000)
    }
    try {
      const result = await this.sendPluginMessage(handleId, {
        request: 'join',
        room: roomId,
        display: displayName || '访客',
        muted,
      })
      await ensureJoined(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      const shouldTryCreate = message.includes('(485)') || message.toLowerCase().includes('no such room')
      if (!shouldTryCreate) {
        throw error
      }
      await this.ensureRoom(handleId, roomId).catch((createError) => {
        this.logAudioStep('create-room-ignored-error', { message: String(createError) })
      })
      const result = await this.sendPluginMessage(handleId, {
        request: 'join',
        room: roomId,
        display: displayName || '访客',
        muted,
      })
      await ensureJoined(result)
    }
  }

  private async listParticipants(handleId: number, roomId: number) {
    const result = await this.sendPluginMessage(handleId, {
      request: 'listparticipants',
      room: roomId,
    })
    const list = result.plugindata?.data?.participants
    if (!Array.isArray(list)) {
      return [] as AudioBridgeParticipant[]
    }
    return list
      .map((item) => {
        const participant = item as AudioBridgeParticipant
        if (!Number.isFinite(participant.id) || participant.id <= 0) {
          return null
        }
        return participant
      })
      .filter((item): item is AudioBridgeParticipant => Boolean(item))
  }

  private startParticipantPoll(handleId: number, roomId: number, displayName: string) {
    if (this.participantPollTimer) {
      clearInterval(this.participantPollTimer)
      this.participantPollTimer = null
    }
    const normalizedDisplay = (displayName || '').trim()
    const pollOnce = async () => {
      try {
        const participants = await this.listParticipants(handleId, roomId)
        this.participantCount = participants.length
        this.participantSnapshots = participants
        this.participantDisplayNames = participants
          .map((participant) => String(participant.display || '').trim())
          .filter(Boolean)
        const others = participants.filter((participant) => participant.display !== normalizedDisplay)
        this.logAudioStep('audio-participants', {
          roomId,
          total: participants.length,
          others: others.length,
          displays: participants.map((participant) => participant.display || `${participant.id}`),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logAudioStep('audio-participants-failed', { roomId, message })
      }
    }
    void pollOnce()
    this.participantPollTimer = window.setInterval(() => {
      void pollOnce()
    }, 2000)
  }

  private stopParticipantPoll() {
    this.participantCount = 0
    this.participantDisplayNames = []
    this.participantSnapshots = []
    if (this.participantPollTimer) {
      clearInterval(this.participantPollTimer)
      this.participantPollTimer = null
    }
  }

  /**
   * 定时 WebRTC ICE 重协商，刷新连接状态。
   * 长时间通话（1h+）时，WebRTC/Janus 内部音频缓冲区可能累积漂移导致变形。
   * ICE restart 在不中断通话的前提下重建传输层，对齐时钟和缓冲区。
   */
  private startIceRestartSchedule() {
    this.stopIceRestartSchedule()
    const INTERVAL_MS = 20 * 60 * 1000 // 每 20 分钟
    this.iceRestartTimer = window.setInterval(() => {
      void this.performIceRestart()
    }, INTERVAL_MS)
    this.logAudioStep('ice-restart-scheduled', { intervalMinutes: 20 })
  }

  private stopIceRestartSchedule() {
    if (this.iceRestartTimer) {
      clearInterval(this.iceRestartTimer)
      this.iceRestartTimer = null
    }
  }

  private async performIceRestart() {
    const pc = this.audioPc
    const handleId = this.audioHandleId
    if (!pc || pc.connectionState === 'closed' || !handleId) {
      this.logAudioStep('ice-restart-skip', { reason: 'not connected' })
      return
    }
    this.logAudioStep('ice-restart-start')
    try {
      const offer = await pc.createOffer({ iceRestart: true })
      if (offer.sdp) {
        const opusPtMatch = offer.sdp.match(/a=rtpmap:(\d+) opus/)
        if (opusPtMatch) {
          offer.sdp = offer.sdp.replace(
            new RegExp(`a=fmtp:${opusPtMatch[1]} .*`),
            `a=fmtp:${opusPtMatch[1]} useinbandfec=1;stereo=0;sprop-stereo=0;complexity=10;minptime=20;maxaveragebitrate=${this.computeOpusBitrate()};cbr=1`
          )
        }
      }
      await pc.setLocalDescription(offer)
      const configured = await this.sendPluginMessage(
        handleId,
        { request: 'configure', muted: this.currentInputMuted },
        { type: 'offer', sdp: offer.sdp || '' }
      )
      const answerSdp = configured.jsep?.sdp
        ? configured.jsep.sdp
        : (await this.waitForHandleEvent(handleId, (payload) => Boolean(payload.jsep?.sdp), 20000)).jsep?.sdp
      if (answerSdp) {
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
        this.logAudioStep('ice-restart-ok')
      } else {
        this.logAudioStep('ice-restart-no-answer')
      }
    } catch (error) {
      this.logAudioStep('ice-restart-failed', { message: error instanceof Error ? error.message : String(error) })
    }
  }

  private createOutputUnlockRetry(source: string) {
    if (this.pendingOutputUnlockRetry) {
      return
    }
    const retry = () => {
      if (this.outputUnlockCleanup) {
        this.outputUnlockCleanup()
        this.outputUnlockCleanup = null
      }
      this.pendingOutputUnlockRetry = false
      void this.playCurrentAudioElement(`${source}-unlock`)
    }
    const onPointerDown = () => retry()
    const onKeyDown = () => retry()
    document.addEventListener('pointerdown', onPointerDown, { once: true })
    document.addEventListener('keydown', onKeyDown, { once: true })
    this.outputUnlockCleanup = () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
    this.pendingOutputUnlockRetry = true
    this.logAudioStep('play-await-user-gesture', { source })
  }

  private pendingOutputUnlockRetry = false
  private outputUnlockCleanup: (() => void) | null = null

  private async createInputTrack(deviceId?: string | null): Promise<InputTrackBundle> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: false },
        autoGainControl: { ideal: true },
      },
      video: false,
    })
    const micTrack = stream.getAudioTracks()[0]
    if (!micTrack) {
      throw new Error('麦克风采集失败')
    }
    if (micTrack.readyState === 'ended') {
      micTrack.stop()
      throw new Error('麦克风轨道已结束，设备可能被占用或拔出')
    }
    this.logAudioStep('local-track-created', {
      trackId: micTrack.id,
      label: micTrack.label || '',
      enabled: micTrack.enabled,
      muted: micTrack.muted,
      readyState: micTrack.readyState,
      requestedDeviceId: deviceId || '',
      testToneInjected: false,
    })
    return {
      track: micTrack,
      cleanup: () => {
        micTrack.onended = null
        micTrack.stop()
      },
    }
  }

  /**
   * 给当前输入轨道挂 onended 看护：麦克风被拔出 / 被独占 / 驱动重置时，
   * 浏览器会把轨道置为 ended。此时 sender 上挂的是死轨道，对方彻底听不到，
   * 且 devicechange 在「系统默认设备」场景下解析结果不变、不会触发重切。
   * 这里主动尝试用同一 deviceId 重新采集并 replaceTrack，失败则退避重试，
   * 让插回设备后能自动恢复，无需用户手动重开麦。
   */
  private attachInputTrackWatchdog(track: MediaStreamTrack) {
    track.onended = () => {
      this.logAudioStep('local-track-ended', {
        trackId: track.id,
        deviceId: this.currentInputDeviceId || '',
        inputMuted: this.currentInputMuted,
      })
      // 仅在轨道仍是当前使用的那条时才处理
      if (this.localAudioTrack !== track) {
        return
      }
      // 闭麦状态下轨道结束无需立即抢救：此时并没有在说话，
      // 大厅长时间挂机 + 默认闭麦时系统常会回收未使用的麦克风轨道，
      // 若在此疯狂重建/重试，会与用户随后的“开麦”操作竞争，导致 localAudioTrack
      // 指向死轨道 → UI 显示开麦但对方听不到。改为标记待恢复，等真正开麦时再重建。
      if (this.currentInputMuted) {
        this.inputTrackDead = true
        this.logAudioStep('local-track-ended-deferred', { trackId: track.id })
        return
      }
      void this.recoverInputTrack()
    }
  }

  private async recoverInputTrack(attempt = 0) {
    if (!this.audioPc || !this.audioSender || !this.audioHandleId) {
      return
    }
    if (this.inputRecovering && attempt === 0) {
      return
    }
    this.inputRecovering = true
    const token = ++this.inputRecoverToken
    try {
      const nextBundle = await this.createInputTrack(this.currentInputDeviceId)
      // 恢复过程中若发生了其他切换（token 变化）或通话已停，丢弃本次结果
      if (token !== this.inputRecoverToken || !this.audioPc || !this.audioSender) {
        nextBundle.cleanup()
        return
      }
      const nextTrack = nextBundle.track
      nextTrack.enabled = !this.currentInputMuted
      const prevCleanup = this.inputTrackCleanup
      const prev = this.localAudioTrack
      await this.audioSender.replaceTrack(nextTrack)
      this.localAudioTrack = nextTrack
      this.inputTrackCleanup = nextBundle.cleanup
      this.inputTrackDead = false
      this.attachInputTrackWatchdog(nextTrack)
      void this.probeTrackLevel(nextTrack, 'local')
      void this.startTrackLevelMonitor(nextTrack, 'local')
      if (prevCleanup) {
        prevCleanup()
      } else if (prev && prev !== nextTrack) {
        prev.stop()
      }
      await this.sendPluginMessage(this.audioHandleId, {
        request: 'configure',
        muted: this.currentInputMuted,
      }).catch(() => undefined)
      this.syncMuteState()
      this.logAudioStep('local-track-recovered', { trackId: nextTrack.id, attempt })
      this.inputRecovering = false
    } catch (error) {
      this.logAudioStep('local-track-recover-failed', {
        attempt,
        message: error instanceof Error ? error.message : String(error),
      })
      // 设备可能还没插回，退避重试（最多约 30 次，间隔 2s）
      if (token === this.inputRecoverToken && this.audioPc && attempt < 30) {
        window.setTimeout(() => {
          if (token === this.inputRecoverToken) {
            void this.recoverInputTrack(attempt + 1)
          }
        }, 2000)
      } else {
        this.inputRecovering = false
      }
    }
  }

  private async applyOutputDevice() {
    this.logAudioStep('output-apply', {
      outputMuted: this.currentOutputMuted,
      outputDeviceId: this.currentOutputDeviceId || '',
      hasSetSinkId: typeof (this.currentAudioElement as (HTMLAudioElement & { setSinkId?: (sinkId: string) => Promise<void> }) | null)?.setSinkId === 'function',
      hasFallbackTone: Boolean(this.fallbackToneAudioElement),
    })
    if (this.currentAudioElement) {
      await this.applyOutputToElement(this.currentAudioElement)
    }
    if (this.fallbackToneAudioElement) {
      await this.applyOutputToElement(this.fallbackToneAudioElement)
    }
  }

  async startCall(params: StartAudioCallParams) {
    try {
      this.logAudioStep('start-call', {
      roomId: params.roomId,
      inputMuted: Boolean(params.inputMuted),
      outputMuted: Boolean(params.outputMuted),
      inputDeviceId: params.inputDeviceId || '',
      outputDeviceId: params.outputDeviceId || '',
      hasAudioElement: Boolean(params.audioElement),
      simulatedWaveUiOnly: false,
    })
    this.currentOutputMuted = Boolean(params.outputMuted)
    this.currentOutputDeviceId = params.outputDeviceId || null
    this.currentAudioElement = params.audioElement || null
    await this.applyOutputDevice()
    if (this.audioPc && this.audioHandleId && this.currentRoomId === params.roomId) {
      await this.updateInputDevice(params.inputDeviceId || null, Boolean(params.inputMuted))
      await this.setOutputMuted(Boolean(params.outputMuted))
      await this.setOutputDevice(params.outputDeviceId || null)
      return
    }
    await this.stopCall()
    await this.validateOrResetSession()
    this.audioRemoteDescReady = false
    this.pendingAudioCandidates = []
    this.audioHandleId = await this.attachPlugin('janus.plugin.audiobridge', async (payload) => {
      if (payload.janus === 'trickle' && payload.candidate?.candidate) {
        await this.enqueueOrApplyRemoteCandidate(
          this.audioPc,
          payload.candidate,
          this.audioRemoteDescReady,
          this.pendingAudioCandidates
        )
      }
      if ((payload.janus === 'hangup' || payload.janus === 'detached') && this.audioPc) {
        this.audioPc.close()
      }
    })
    await this.joinRoom(this.audioHandleId, params.roomId, params.displayName, Boolean(params.inputMuted))
    this.startParticipantPoll(this.audioHandleId, params.roomId, params.displayName)
    const pc = new RTCPeerConnection({ iceServers: params.iceServers })
    this.audioPc = pc
    this.currentRoomId = params.roomId
    this.currentInputMuted = Boolean(params.inputMuted)
    
    let localBundle: InputTrackBundle | null = null
    let localTrack: MediaStreamTrack | null = null
    
    try {
      localBundle = await this.createInputTrack(params.inputDeviceId || null)
      localTrack = localBundle.track
    } catch (error) {
      this.logAudioStep('local-track-failed', { message: error instanceof Error ? error.message : String(error) })
      // 即使麦克风获取失败（比如没权限、没设备），也继续加入房间（作为纯听众）
    }

    this.localAudioTrack = localTrack
    this.inputTrackCleanup = localBundle ? localBundle.cleanup : null
    this.currentInputDeviceId = params.inputDeviceId || null
    this.inputTrackDead = false

    if (localTrack) {
      localTrack.enabled = !this.currentInputMuted
      this.audioSender = pc.addTrack(localTrack, new MediaStream([localTrack]))
      this.attachInputTrackWatchdog(localTrack)
      void this.probeTrackLevel(localTrack, 'local')
      void this.startTrackLevelMonitor(localTrack, 'local')
    } else {
      // 兜底：如果没有麦克风，添加一个 recvonly 的 transceiver 以便接收音频
      pc.addTransceiver('audio', { direction: 'recvonly' })
    }

    pc.onconnectionstatechange = () => {
      this.logAudioStep('pc-connection', { state: pc.connectionState })
      params.onConnectionStateChange?.(pc.connectionState)
    }
    pc.onicecandidate = (event) => {
      void this.sendTrickle(this.audioHandleId as number, event.candidate ? event.candidate.toJSON() : null)
    }
    const remoteStream = new MediaStream()
    this.remoteAudioStream = remoteStream
    pc.ontrack = (event) => {
      this.logAudioStep('remote-track', {
        kind: event.track.kind,
        trackId: event.track.id,
        enabled: event.track.enabled,
        muted: event.track.muted,
        readyState: event.track.readyState,
        streamCount: event.streams.length,
      })
      const stream = event.streams[0]
      if (stream) {
        this.remoteAudioStream = stream
      } else {
        remoteStream.addTrack(event.track)
        this.remoteAudioStream = remoteStream
      }
      if (event.track.kind === 'audio') {
        // 限制 jitter buffer 大小，防止长时间通话 / 多人混音时缓冲区堆积导致声音变形
        const audioReceiver = event.receiver as RTCRtpReceiver & { playoutDelayHint?: number; jitterBufferTarget?: number }
        if ('playoutDelayHint' in audioReceiver) {
          audioReceiver.playoutDelayHint = 0.04
        }
        if ('jitterBufferTarget' in audioReceiver) {
          audioReceiver.jitterBufferTarget = 0
        }
        if (this.currentOutputMuted) {
          this.currentOutputMuted = false
          this.logAudioStep('auto-unmute-on-remote-track', { muted: this.currentOutputMuted })
          void this.applyOutputDevice()
        }
        void this.probeTrackLevel(event.track, 'remote')
        void this.startTrackLevelMonitor(event.track, 'remote')
      }
      if (this.currentAudioElement) {
        this.currentAudioElement.srcObject = this.remoteAudioStream
        void this.playCurrentAudioElement('ontrack')
      }
    }
    const offer = await pc.createOffer()
    if (offer.sdp) {
      // 精确匹配 Opus 的 fmtp 行，替换为自定义参数
      const opusPtMatch = offer.sdp.match(/a=rtpmap:(\d+) opus/)
      if (opusPtMatch) {
        offer.sdp = offer.sdp.replace(
          new RegExp(`a=fmtp:${opusPtMatch[1]} .*`),
          `a=fmtp:${opusPtMatch[1]} useinbandfec=1;stereo=0;sprop-stereo=0;complexity=10;minptime=20;maxaveragebitrate=${this.computeOpusBitrate()};cbr=1`
        )
      }
    }
    await pc.setLocalDescription(offer)
    const configured = await this.sendPluginMessage(
      this.audioHandleId,
      {
        request: 'configure',
        muted: this.currentInputMuted,
      },
      { type: 'offer', sdp: offer.sdp || '' }
    )
    const answerSdp = configured.jsep?.sdp
      ? configured.jsep.sdp
      : (await this.waitForHandleEvent(this.audioHandleId, (payload) => Boolean(payload.jsep?.sdp), 20000)).jsep?.sdp
    if (!answerSdp) {
      throw new Error('Janus 未返回音频应答')
    }
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
    this.audioRemoteDescReady = true
    await this.flushPendingCandidates(pc, this.pendingAudioCandidates)
    this.startIceRestartSchedule()
    this.startMuteSync()
    if (this.currentAudioElement && this.remoteAudioStream) {
      this.currentAudioElement.srcObject = this.remoteAudioStream
      await this.applyOutputDevice()
      void this.playCurrentAudioElement('start-call')
    }
    } catch (error) {
      throw error
    }
  }

  setAudioElement(element: HTMLAudioElement | null) {
    this.currentAudioElement = element
    this.logAudioStep('bind-audio-element', { hasElement: Boolean(element), hasRemoteStream: Boolean(this.remoteAudioStream) })
    if (element && this.remoteAudioStream) {
      element.srcObject = this.remoteAudioStream
      void this.playCurrentAudioElement('bind-element')
    }
    void this.applyOutputDevice()
  }

  async setOutputDevice(outputDeviceId: string | null) {
    this.currentOutputDeviceId = outputDeviceId
    this.logAudioStep('set-output-device', { outputDeviceId: outputDeviceId || '' })
    await this.applyOutputDevice()
  }

  async setOutputMuted(muted: boolean) {
    this.currentOutputMuted = muted
    this.logAudioStep('set-output-muted', { muted })
    await this.applyOutputDevice()
  }

  async updateInputDevice(inputDeviceId: string | null, muted: boolean) {
    this.currentInputMuted = muted
    this.currentInputDeviceId = inputDeviceId || null
    // 主动切换视为一次新的输入意图，作废进行中的自恢复重试，避免二者竞争
    this.inputRecoverToken += 1
    this.inputRecovering = false
    this.logAudioStep('update-input-device', { inputDeviceId: inputDeviceId || '', muted })
    if (!this.audioPc || !this.audioSender || !this.audioHandleId) {
      return
    }
    const nextBundle = await this.createInputTrack(inputDeviceId)
    const nextTrack = nextBundle.track
    nextTrack.enabled = !muted
    const prev = this.localAudioTrack
    const prevCleanup = this.inputTrackCleanup
    await this.audioSender.replaceTrack(nextTrack)
    this.localAudioTrack = nextTrack
    this.inputTrackCleanup = nextBundle.cleanup
    this.inputTrackDead = false
    this.attachInputTrackWatchdog(nextTrack)
    void this.probeTrackLevel(nextTrack, 'local')
    void this.startTrackLevelMonitor(nextTrack, 'local')
    if (prevCleanup) {
      prevCleanup()
    } else if (prev) {
      prev.stop()
    }
    await this.sendPluginMessage(this.audioHandleId, {
      request: 'configure',
      muted,
    }).catch(() => undefined)
    this.syncMuteState()
  }

  async setInputMuted(muted: boolean) {
    this.currentInputMuted = muted
    this.logAudioStep('set-input-muted', { muted })
    // 开麦时若轨道在闭麦期间已被系统回收（死轨道），仅改 enabled 不会发声，
    // 表现为“图标开麦但对方听不到”。此处主动重建，保证开麦即可正常发送。
    if (!muted && this.audioPc && this.audioSender) {
      const track = this.localAudioTrack
      const trackDead = this.inputTrackDead || !track || track.readyState === 'ended'
      if (trackDead) {
        this.logAudioStep('unmute-rebuild-dead-track', {
          hadTrack: Boolean(track),
          readyState: track?.readyState || 'none',
        })
        await this.recoverInputTrack()
        return
      }
    }
    if (this.localAudioTrack) {
      this.localAudioTrack.enabled = !muted
    }
    if (!this.audioHandleId) {
      return
    }
    await this.sendPluginMessage(this.audioHandleId, {
      request: 'configure',
      muted,
    }).catch(() => undefined)
    // 立即自检：确保 track 状态与 currentInputMuted 真正一致
    this.syncMuteState()
  }

  /**
   * 定期自检：确保 localAudioTrack.enabled 与 currentInputMuted 始终一致。
   * 兜底修复因 WebRTC 内部状态漂移、reconnect 等场景造成的 UI 显示闭麦但实际仍在发送声音的问题。
   */
  private syncMuteState() {
    if (!this.localAudioTrack) return
    const expectedEnabled = !this.currentInputMuted
    if (this.localAudioTrack.enabled !== expectedEnabled) {
      this.logAudioStep('mute-sync-fix', {
        trackEnabled: this.localAudioTrack.enabled,
        currentInputMuted: this.currentInputMuted,
        expectedEnabled,
      })
      this.localAudioTrack.enabled = expectedEnabled
    }
  }

  private startMuteSync() {
    this.stopMuteSync()
    this.muteSyncTimer = window.setInterval(() => {
      this.syncMuteState()
    }, 5000)
  }

  private stopMuteSync() {
    if (this.muteSyncTimer) {
      clearInterval(this.muteSyncTimer)
      this.muteSyncTimer = null
    }
  }

  async stopCall() {
    this.logAudioStep('stop-call', { hasPc: Boolean(this.audioPc), hasHandle: Boolean(this.audioHandleId) })
    // 作废进行中的输入自恢复重试，避免通话结束后仍在后台反复采集
    this.inputRecoverToken += 1
    this.inputRecovering = false
    this.stopMuteSync()
    if (this.audioPc) {
      this.audioPc.onicecandidate = null
      this.audioPc.ontrack = null
      this.audioPc.onconnectionstatechange = null
      this.audioPc.close()
      this.audioPc = null
    }
    if (this.inputTrackCleanup) {
      this.inputTrackCleanup()
      this.inputTrackCleanup = null
    } else if (this.localAudioTrack) {
      this.localAudioTrack.stop()
    }
    this.localAudioTrack = null
    if (this.outputUnlockCleanup) {
      this.outputUnlockCleanup()
      this.outputUnlockCleanup = null
    }
    this.pendingOutputUnlockRetry = false
    this.localTrackLevelMonitorToken += 1
    this.remoteTrackLevelMonitorToken += 1
    this.localTrackLevelDb = -72
    this.remoteTrackLevelDb = -72
    if (this.remoteAudioRestartTimer) {
      clearTimeout(this.remoteAudioRestartTimer)
      this.remoteAudioRestartTimer = null
    }
    this.stopParticipantPoll()
    this.stopIceRestartSchedule()
    this.audioRemoteDescReady = false
    this.pendingAudioCandidates = []
    await this.stopFallbackTone()
    this.audioSender = null
    if (this.audioHandleId && this.sessionId) {
      await this.sendWithTransaction({
        janus: 'detach',
        session_id: this.sessionId,
        handle_id: this.audioHandleId,
      }).catch(() => undefined)
      this.handleListeners.delete(this.audioHandleId)
    }
    this.audioHandleId = null
    this.currentRoomId = null
    this.remoteAudioStream = null
    if (this.currentAudioElement) {
      this.currentAudioElement.srcObject = null
    }
  }

  async destroy() {
    await this.stopCall()
    const ws = this.ws
    const sessionId = this.sessionId
    this.sessionId = null
    this.stopKeepalive()
    if (ws && ws.readyState === WebSocket.OPEN && sessionId) {
      await this.sendWithTransaction({
        janus: 'destroy',
        session_id: sessionId,
      }).catch(() => undefined)
      ws.close()
    }
    this.ws = null
    this.wsOpenPromise = null
    this.rejectAllPending('Janus 已销毁')
    this.rejectAllPendingHandleEvents('Janus 已销毁')
    this.handleListeners.clear()
  }
}
