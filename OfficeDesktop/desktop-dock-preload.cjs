// 任务栏头像条那个小窗的桥：只暴露"显示 + 遥控"需要的东西。
// 它**没有** socket、没有媒体、没有文件系统——一切都要经过主进程转给主窗口。
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('officeDock', Object.freeze({
  /** 首帧状态（主进程缓存的主窗口最后一次推送）。 */
  videoWant: id => ipcRenderer.invoke('office:dock-video-want', id),
  onVideo(callback) {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('office:dock-video', listener);
    return () => ipcRenderer.removeListener('office:dock-video', listener);
  },
  state: () => ipcRenderer.invoke('office:dock-state'),
  /** 主窗口后来推的状态。 */
  onState(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-state', listener);
    return () => ipcRenderer.removeListener('office:dock-state', listener);
  },
  /** 悬停某个人时，请主窗口把那个人的最近一帧发过来。 */
  requestPreview: personId => ipcRenderer.invoke('office:dock-preview-want', personId),
  onPreview(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-preview', listener);
    return () => ipcRenderer.removeListener('office:dock-preview', listener);
  },
  /** 卡片上的三个按钮：看对方屏幕 / 把我的屏幕给他 / 语音通话。 */
  action: (kind, personId, meeting) => ipcRenderer.invoke('office:dock-action', { kind, personId, meeting }),
  /** 接听 / 拒绝某一通来电（用户 2026-09-21）：交给主窗口去应答那条邀请。 */
  answer: (requestId, accept) => ipcRenderer.invoke('office:dock-answer',
    { requestId: String(requestId || ''), accept: accept === true }),
  /** 拖动后记住位置（相对默认位置的偏移，DIP）。 */
  drag: (dx, dy) => ipcRenderer.invoke('office:dock-drag', { dx, dy }),
  /** 报版面：悬停卡片开没开、舞台亮没亮（哪种舞台、多高）、头像条实际多宽。 */
  layout: input => ipcRenderer.invoke('office:dock-layout', {
    expanded: input?.expanded === true, stage: input?.stage === true,
    stageMode: input?.stageMode === 'peek' || input?.stageMode === 'call' ? input.stageMode : '',
    // 来电气泡会让舞台更高，所以高度由页面算好报上来（上限挡一下脏数据）。
    stagePx: Math.max(0, Math.min(900, Math.round(Number(input?.stagePx) || 0))),
    cardPx: Math.max(0, Math.min(700, Number(input?.cardPx) || 0)),
    width: Number(input?.width) || 0,
    // Preserve measured control regions; dropping these makes meeting buttons click through.
    hitRegions: (Array.isArray(input?.hitRegions) ? input.hitRegions : []).slice(0, 80)
      .filter(row => row && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(row[key])))
      .map(({ x, y, width, height }) => ({ x, y, width, height })) }),
  /** 有人在看我的头像：把那个人的角色拉出来演一段动作（主窗口 → 主进程 → 这里）。 */
  onGreet(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-greet', listener);
    return () => ipcRenderer.removeListener('office:dock-greet', listener);
  },
  /** 主进程要求隐藏/显示（共享屏幕、全屏、任务栏自动隐藏）。 */
  onVisibility(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-visible', listener);
    return () => ipcRenderer.removeListener('office:dock-visible', listener);
  },
  /**
   * 被拖到头像上的那个文件到底是谁（用户 2026-09-22）。
   *
   * Electron ≥32 已经删掉 `File.path`，只有 `webUtils.getPathForFile` 能拿到真路径。
   * 小窗**只转交路径**：读盘、分片、发送全在主窗口那一侧，符合"小窗只做显示 + 遥控"。
   */
  filePaths: files => {
    const out = [];
    for (const file of files || []) {
      try { const path = webUtils.getPathForFile(file); if (path) out.push(path); }
      catch { /* 不是真实文件（比如从网页拖来的图片），跳过 */ }
    }
    return out;
  },
  /** 把路径交给主进程，由它转给唯一的连接拥有者（主窗口）去发。 */
  dropFiles: (personId, paths) => ipcRenderer.invoke('office:dock-files',
    { personId: String(personId || ''),
      paths: (Array.isArray(paths) ? paths : []).filter(item => typeof item === 'string').slice(0, 64) }),
}));
