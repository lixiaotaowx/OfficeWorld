/** 大厅鼠标交互的纯判定层（11 月 x6.bindInput 里的规则）：
 *  桌面端标题栏不当作拖拽起点、相机拖拽灵敏度、平移/旋转的区分。 */

/** 桌面客户端（无边框窗）里，标题栏区域的按下不算 3D 拖拽——那是移动窗口用的。 */
export function isTitleBarGrab(clientY: number, desktop: boolean, fullscreen: boolean): boolean {
  return desktop && !fullscreen && clientY < 52;
}

/** 拖拽起点：右键、或 Shift+左键（建造模式未激活时）都是平移；普通左键是旋转。 */
export function dragMode(button: number, shiftKey: boolean, buildArmed: boolean | undefined):
  'orbit' | 'pan' {
  const pan = button === 2
    || (button === 1 && shiftKey)
    || (button === 0 && shiftKey && !buildArmed);
  return pan ? 'pan' : 'orbit';
}

/** 拖过 5 像素才算"真的在拖"（点一下和拖一下是两个动作）。 */
export const DRAG_THRESHOLD = 5;
export const movedBeyond = (dx: number, dy: number) => Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD;

export interface DragGoal {
  yaw: number;
  pitch: number;
  target: { x: number; y: number; z: number };
}

/** 旋转：横向拖 −0.007 rad/px，纵向拖 +0.004 rad/px，pitch 夹在 ±π/2。 */
export function orbitDrag(start: DragGoal, dx: number, dy: number): DragGoal {
  const yaw = start.yaw - dx * .007;
  const pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, start.pitch + dy * .004));
  return { ...start, yaw, pitch };
}
