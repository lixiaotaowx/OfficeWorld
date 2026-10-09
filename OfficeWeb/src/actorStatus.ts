/**
 * 底部那行状态文案。
 *
 * 从 `OfficeAvatar.update()` 里搬出来的：那一串三元表达式本来就没法单测，而那个文件正贴着
 * 500 行上限（2026-10-09 加掉落机制时挪出来）。
 */
export function actorStatusText(input: {
  sitting: boolean;
  /** 坐着的那个座位名（`sitting` 为真时有意义）。 */
  label?: string;
  /** 入座/起身的过渡进度：>0 就是正在坐下。 */
  sitBlend: number;
  moving: boolean;
  /** 正在下落（含空中控制的那一段）。 */
  falling: boolean;
}): string {
  if (input.falling) return "下落中…";
  if (input.sitting) return `已坐在 ${input.label}`;
  if (input.sitBlend > 0.001) return "入座中…";
  return input.moving ? "行走中" : "待机 · 点击地面或 WASD 行走";
}
