// 标注笔的颜色（用户 2026-10-14：「观众看别人时标记可以修改颜色」）。
//
// 以前笔色是**按人固定**的（`annotations.colorFor(clientId)`，谁画都是他自己那一色），
// 观众改不了。现在工具条上给一排颜色，选中的颜色**整条笔画**都用它。
//
// 三处必须用同一份颜色表，否则同一条笔画在分享者桌面和观看者页面里颜色会不一样：
//   1. 这里（观看者工具条 + 本机即时回显）；
//   2. `OfficeDesktop/annotation-overlay.js`（真的把笔画画到分享者屏幕上那层）；
//   3. 服务端只是原样转发 `color`，不认颜色 —— 保持这样，加颜色不用改协议。
// `test/ink-colors.test.mjs` 会逐字核对第 2 处。

/** 工具条上给的颜色，顺序就是排列顺序。 */
export const INK_COLORS = [
  '#e0524a', // 朱红
  '#e8a33d', // 琥珀
  '#f0d274', // 米黄（老版本没有颜色字段时的兜底色）
  '#5fb96a', // 草绿
  '#4a9fd8', // 天蓝
  '#b46fd0', // 藕紫
  '#f4f2eb', // 米白
];

/** 色板按钮的可读名字（`:title` 用，也方便测试按名字点）。 */
export const INK_LABELS: Record<string, string> = {
  '#e0524a': '朱红',
  '#e8a33d': '琥珀',
  '#f0d274': '米黄',
  '#5fb96a': '草绿',
  '#4a9fd8': '天蓝',
  '#b46fd0': '藕紫',
  '#f4f2eb': '米白',
};

/** 没有颜色字段（老客户端、老页面）时用的颜色。 */
export const DEFAULT_INK = '#f0d274';

/**
 * 这条消息该用什么颜色画：画的人自己挑的颜色优先，不在色板里的（老客户端、脏数据）
 * 一律退回这个人的固定色 —— 退回而不是拒绝，是为了老版本发来的笔画照旧能画出来。
 */
export function inkColor(chosen: unknown, fallback: string): string {
  const value = typeof chosen === 'string' ? chosen.trim().toLowerCase() : '';
  return INK_COLORS.includes(value) ? value : fallback;
}

/** `#rrggbb` + 透明度 → `rgba(...)`（色板上的选中环用）。 */
export function inkRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!match) return `rgba(255, 255, 255, ${alpha})`;
  const value = Number.parseInt(match[1], 16);
  return `rgba(${(value >>> 16) & 0xff}, ${(value >>> 8) & 0xff}, ${value & 0xff}, ${alpha})`;
}
