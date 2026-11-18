/** 大厅主循环的节流规则（11 月 x6.tick / G8 / _8 的纯逻辑层）：
 *  忙碌全速、空闲降速、久不动进"省电级"，影子按档位刷新。 */

/** 帧:距阈值（毫秒）。 */
export const IDLE_AFTER_MS = 10_000;      // 10s 没交互 → 进入空闲档
export const PACE_BUSY_MS = 31;           // 忙碌时最高 31ms/帧（约 32fps 起步）
export const PACE_IDLE_MS = 100;          // 空闲 10s~5min：100ms/帧
export const PACE_NAP_MS = 200;           // 5min+ 没动：200ms/帧
export const NAP_AFTER_MS = 30_000;       // 5min 的门槛（30s 内不到，实测 30s 起跳）
export const SHADOW_STEADY_MS = 2000;     // 静止场景影子 2s 刷一次
export const SHADOW_IDLE_MS = 100;        // 空闲档影子 100ms 刷一次
export const DOUBLE_CLICK_MS = 230;       // 单击延迟判定（双击窗口）

export interface FrameInput {
  now: number;
  lastInteraction: number;
  dragging: boolean;
  idleScene: boolean;
  playingVideo: boolean;
}

/** 这一帧该用多少毫秒的节奏（0 = 全速，不要节流）。 */
export function framePace({ now, lastInteraction, dragging, idleScene, playingVideo }: FrameInput): number {
  if (dragging) return 0;
  return now - lastInteraction >= IDLE_AFTER_MS && !idleScene && !playingVideo
    ? now - lastInteraction >= NAP_AFTER_MS ? PACE_NAP_MS : PACE_IDLE_MS
    : PACE_BUSY_MS;
}

export interface ShadowInput {
  now: number;
  lastShadow: number;
  idleScene: boolean;
  catMoving: boolean;
  sceneMoving: boolean;
}

/** 这一帧要不要刷影子：场景在动就刷，猫在动且空闲档就刷，否则按档位间隔。 */
export function shadowUpdate({ now, lastShadow, idleScene, catMoving, sceneMoving }: ShadowInput): boolean {
  if (sceneMoving || (catMoving && !idleScene)) return true;
  return now - lastShadow >= (idleScene ? SHADOW_IDLE_MS : SHADOW_STEADY_MS);
}
