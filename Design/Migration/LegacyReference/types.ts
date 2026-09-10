import { DrawStroke } from '@/types/drawing'

export interface LoginResponseData {
  token: string
  user: {
    userId: string
    nickname: string
  }
  roomId: string
}

export interface RoomUser {
  userId: string
  nickname: string
  activeAudioRoomId?: number
  seatStatus?: UserSeatStatus
  seatStatusChangedAt?: number
}

export type UserSeatStatus = 'present' | 'away'

export interface RoomUsersPayload {
  roomId: string
  users: RoomUser[]
}

export interface RoomJoinedPayload extends RoomUsersPayload {
  latestFrames?: BinaryScreenFramePayload[]
}

export interface ScreenFramePayload {
  roomId: string
  userId: string
  seq: number
  image: string
  width: number
  height: number
  ts: number
}

export interface BinaryScreenFramePayload {
  roomId: string
  userId: string
  seq: number
  width: number
  height: number
  ts: number
  mime?: string
  chunk: ArrayBuffer | Uint8Array | number[]
}

export interface IceCandidatePayload {
  candidate: string
  sdpMid?: string | null
  sdpMLineIndex?: number | null
  usernameFragment?: string | null
}

export interface VideoSignalPayload {
  roomId: string
  requestId: string
  fromUserId: string
  targetUserId?: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'mouse-position' | 'avatar-meta' | 'avatar-request' | 'avatar-data' | 'audio-invite' | 'audio-invite-response' | 'audio-invite-cancel' | 'audio-call-left' | 'audio-meeting-ended' | 'video-stop' | 'screen-share-start' | 'room-reminder' | 'seat-status-update' | 'audio-level' | 'file-transfer-request' | 'file-transfer-meta' | 'file-transfer-ack' | 'file-transfer-chunk' | 'file-transfer-finished' | 'file-transfer-error' | 'private-audio-invite' | 'private-audio-invite-response' | 'private-audio-invite-cancel' | 'private-audio-hangup'
  audioRoomId?: number
  audioHostUserId?: string
  janusFeedId?: number
  janusRoomId?: number
  autoShareScreen?: boolean
  shareRequesterScreen?: boolean
  seatStatus?: UserSeatStatus
  seatStatusChangedAt?: number
  accepted?: boolean
  reason?: string
  message?: string
  sdp?: string
  candidate?: IceCandidatePayload
  fileTransferId?: string
  filePath?: string
  fileName?: string
  fileSize?: number
  chunkIndex?: number
  totalChunks?: number
  chunkData?: string
  bytesRead?: number
}

export interface DrawStrokePayload {
  fromUserId: string
  targetUserId: string
  requestId?: string
  stroke: DrawStroke
}

export interface DrawClearPayload {
  fromUserId: string
  targetUserId: string
  requestId?: string
}

export interface VideoResolutionChangePayload {
  roomId: string
  requestId: string
  targetUserId: string
  resolution: '720p' | '1080p'
}

export interface MousePositionPayload {
  roomId: string
  requestId?: string
  fromUserId?: string
  targetUserId: string
  x: number
  y: number
  nickname: string
}
