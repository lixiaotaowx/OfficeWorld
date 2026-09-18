// 任务栏头像条那个小窗的桥：只暴露"显示 + 遥控"需要的东西。
// 它**没有** socket、没有媒体、没有文件系统——一切都要经过主进程转给主窗口。
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('officeDock', Object.freeze({
  /** 首帧状态（主进程缓存的主窗口最后一次推送）。 */
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
  action: (kind, personId) => ipcRenderer.invoke('office:dock-action', { kind, personId }),
  /** 拖动后记住位置（相对默认位置的偏移，DIP）。 */
  drag: (dx, dy) => ipcRenderer.invoke('office:dock-drag', { dx, dy }),
  /** 指针在不在头像条/卡片上：不在就让窗口把点击透给任务栏。 */
  setInteractive: value => ipcRenderer.invoke('office:dock-interactive', value === true),
  /** 主进程要求隐藏/显示（共享屏幕、全屏、任务栏自动隐藏）。 */
  onVisibility(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-visible', listener);
    return () => ipcRenderer.removeListener('office:dock-visible', listener);
  },
}));
