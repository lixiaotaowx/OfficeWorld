/** Whether this client should be capturing its screen at all.
 *
 * Kept free of React so the rules themselves can be unit-tested. Capturing used to
 * run whenever the client held a desk, even with nobody able to watch, and one frame
 * cost 552ms of main-process time - which is why "nobody is receiving" once stopped
 * the capture. The stream is long-lived and a frame now costs ~3ms, so the capture
 * keeps running whenever this machine is at a desk: your own monitor shows your own
 * screen, exactly like standing at a real desk, and a colleague who logs in later
 * sees it immediately instead of waiting for the next start.
 */
export function shouldPreview(input: {
  desktop: boolean; connected: boolean; seated: boolean; mayBroadcast?: boolean;
}) {
  // A visiting client never broadcasts a low-resolution preview of their screen
  // (the server refuses the frames as well); everybody else follows the rules.
  if (input.mayBroadcast === false) return false;
  return input.desktop && input.connected && input.seated;
}

/** How often the desk preview is refreshed: 6s with the window in focus, 12s when it
 *  is not (user, 2026-09-15). Nobody is looking at the office then, so half the
 *  frames are enough while staying warm for whoever watches. */
export function previewIntervalMs(focused: boolean, visible: boolean) {
  return focused && visible ? 6000 : 12000;
}

/** One short line for the UI: why this machine is, or is not, on its desk screen.
 *  A blank monitor used to be a mystery - nobody could tell "访客被拒绝" from
 *  "浏览器不采集" or from a capture that keeps failing. */
export function previewReason(input: {
  active: boolean; desktop: boolean; connected: boolean; seated: boolean;
  mayBroadcast: boolean; failed: boolean; watched: boolean;
  /** 人不在电脑前，采集被暂停，好让屏幕按电源计划熄灭（用户 2026-09-17）。 */
  paused?: boolean;
}) {
  if (input.active) return input.watched ? '我的工位预览：采集中' : '我的工位预览：采集中（暂时没人看）';
  if (input.paused) return '我的工位预览：已暂停（你离开超过 1 分钟，屏幕才能熄灭）';
  if (!input.desktop) return '我的工位预览：浏览器需点「授权工位预览」';
  if (!input.connected) return '我的工位预览：连接中…';
  if (!input.seated) return '我的工位预览：还没有工位';
  if (!input.mayBroadcast) return '我的工位预览：访客不广播';
  if (input.failed) return '我的工位预览：采集失败，重试中';
  return '我的工位预览：准备中…';
}
