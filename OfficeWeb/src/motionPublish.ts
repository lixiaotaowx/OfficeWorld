/** 自己的动作广播规则（11 月 x6.publish 的判定层）：
 *  内容变了至少 70ms 才发一次；两秒没变也要发一次心跳。 */

export interface MotionPayload {
  x: number;
  y: number;
  z: number;
  rot: number;
  moving: boolean;
  running: boolean;
  sitting: boolean;
  sittingSpot: string | null;
}

export interface MotionSource {
  position: { x: number; y: number; z: number };
  rotationY: number;
  state: 'idle' | 'walk' | 'jump' | 'sit' | 'fall';
  gait?: 'walk' | 'run';
  mySpot: string | null;
}

export const DEBOUNCE_MS = 70;
export const HEARTBEAT_MS = 2000;

/** 把角色状态折成广播负载（坐标与朝向保留 3 位小数）。 */
export function motionPayload(source: MotionSource): MotionPayload {
  const sitting = source.state === 'sit';
  return {
    x: +source.position.x.toFixed(3),
    y: +source.position.y.toFixed(3),
    z: +source.position.z.toFixed(3),
    rot: +source.rotationY.toFixed(3),
    moving: source.state === 'walk' || source.state === 'jump',
    running: source.state === 'walk' && source.gait === 'run',
    sitting,
    sittingSpot: sitting ? source.mySpot : null,
  };
}

/** 广播节流器：内容变了 ≥70ms 才发，两秒没变发心跳。 */
export class MotionPublisher {
  private key = '';
  private sentAt = -Infinity;

  /** 每帧调用：决定这一帧要不要发，要发就返回负载。 */
  frame(source: MotionSource, now: number): MotionPayload | null {
    const payload = motionPayload(source);
    const key = JSON.stringify(payload);
    const changed = key !== this.key && now - this.sentAt > DEBOUNCE_MS;
    const heartbeat = now - this.sentAt > HEARTBEAT_MS;
    if (!changed && !heartbeat) return null;
    this.key = key;
    this.sentAt = now;
    return payload;
  }
}
