/** Dock 卡片/悬浮窗的尺寸规则（11 月 dockLayout.ts）。 */

/** 卡片宽度：跟着悬浮窗宽度走，有提醒时略宽。 */
export function dockCardWidth(flyWidth: number, attention: boolean) {
  return Math.max(280, Math.round(flyWidth * (attention ? 1.15 : 1)));
}

/** 共享屏幕尺寸是 CSS 像素，半宽在 Windows DPI 缩放下也成立。 */
export function enlargedScreenSize(availableWidth: number, availableHeight: number) {
  const width = Math.max(280, Math.min(4080, Math.round((availableWidth || 1366) / 2)));
  const height = Math.max(200, Math.min(640, (availableHeight || 768) - 80));
  return { width, height, pictureHeight: Math.max(120, height - 164) };
}
