// 把“这一条采集轨来自哪块屏幕”固定下来。选项随后变化、换屏失败都不能改写旧轨的来源。
const sourceDisplays = new WeakMap<MediaStreamTrack, string>();
const shared = new Map<MediaStreamTrack, () => void>();
let capturing = false;
let timer: ReturnType<typeof setInterval> | undefined;
let lastSent: string | undefined;
const bridge = () => typeof window === 'undefined' ? undefined : window.officeDesktop?.screenShareIndicator;

/** 所有高清采集入口共用；不增加任何权限，仍由标准采集 API 与原生权限处理器决定。 */
export async function captureScreen<T>(capture: () => Promise<T>, tracks: (value: T) => MediaStreamTrack[]): Promise<T> {
  const desktop = bridge();
  if (!desktop) return capture(); // 浏览器与旧客户端保持原来的系统提示。
  // 不排队延后用户手势；也不让两次异步采集串用主进程的来源回执。
  if (capturing) throw Error('正在选择共享屏幕，请稍后重试');
  capturing = true;
  let result: T | undefined;
  try {
    result = await capture();
    const displayId = await desktop.source();
    if (!displayId) throw Error('无法确认共享屏幕，请重新选择屏幕');
    for (const track of tracks(result)) if (track.kind === 'video') sourceDisplays.set(track, displayId);
    return result;
  } catch (error) {
    if (result !== undefined) tracks(result).forEach(track => track.stop());
    throw error;
  } finally { capturing = false; }
}

/** 每间房间都有自己的轨；来源沿着克隆传递，不能用“当前选择的屏幕”推测。 */
export function cloneScreenTrack(track: MediaStreamTrack): MediaStreamTrack {
  const clone = track.clone();
  const display = sourceDisplays.get(track);
  if (display) sourceDisplays.set(clone, display);
  return clone;
}

function forget(track: MediaStreamTrack) {
  const ended = shared.get(track);
  if (ended) track.removeEventListener('ended', ended);
  shared.delete(track);
}

function sync() {
  // MediaStreamTrack.stop() 不触发 ended；SDK 主动断线/销毁也要收框。
  for (const track of shared.keys()) if (track.readyState === 'ended') forget(track);
  const displays = [...new Set([...shared.keys()].map(track => sourceDisplays.get(track)!))].sort();
  const key = JSON.stringify(displays);
  const desktop = bridge();
  if (desktop && key !== lastSent) {
    lastSent = key;
    void desktop.show(displays).catch(() => { if (lastSent === key) lastSent = undefined; });
  }
  if (!shared.size) { clearInterval(timer); timer = undefined; }
}

/** 只登记已经发布的轨（或用户主动开启的公共共享），捕获成功本身不等于共享成功。 */
export function showSharedScreen(track: MediaStreamTrack) {
  if (!sourceDisplays.has(track) || track.readyState === 'ended' || shared.has(track)) return;
  const ended = () => hideSharedScreen(track);
  shared.set(track, ended);
  track.addEventListener('ended', ended, { once: true });
  timer ??= setInterval(sync, 250);
  sync();
}

export function hideSharedScreen(track: MediaStreamTrack) {
  if (!shared.has(track)) return;
  forget(track);
  sync();
}

/** 仅替换已在提示的公共预览轨；私聊的每路发布由 swapScreenTrack 分别更新。 */
export function replaceSharedScreen(previous: MediaStreamTrack, next: MediaStreamTrack) {
  if (!shared.has(previous)) return;
  forget(previous);
  showSharedScreen(next);
  sync();
}
