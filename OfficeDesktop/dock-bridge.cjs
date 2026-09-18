// 头像条与主窗口之间的中转（主进程侧）。
//
// 铁律：小窗只是"显示 + 遥控"。它不连 socket、不碰媒体、不认识任何业务逻辑；所有状态都
// 由主窗口推过来（它才是唯一的连接与媒体拥有者），所有点击都转发回主窗口执行。主窗口
// 与主进程之间靠 IPC，两侧各自有可信来源校验，别的页面调不动。
const { trusted } = require('./policy.cjs');

function installDockBridge(dependencies) {
  const { dock, getWindow } = dependencies;
  const ipcMain = dependencies.ipcMain || require('electron').ipcMain;
  // 主窗口最后一次推来的状态，小窗刚打开时先给它一份。
  let state = { people: [], sharing: false, missed: 0, hidden: false };

  const senderIs = (event, target) => Boolean(target) && !target.isDestroyed?.() &&
    event.sender === target.webContents;
  const allowApp = event => {
    const window = getWindow();
    if (!senderIs(event, window) || !trusted(event.senderFrame?.url)) {
      throw Error('Untrusted dock request');
    }
  };
  const allowDock = event => {
    const window = dock?.window();
    if (!senderIs(event, window) || !trusted(event.senderFrame?.url)) {
      throw Error('Untrusted dock request');
    }
  };
  const toApp = (channel, payload) => {
    const window = getWindow();
    if (!window || window.isDestroyed()) return false;
    window.webContents.send(channel, payload);
    return true;
  };

  // ---- 主窗口 → 主进程 ----
  // 状态：缓存一份并转发给小窗。
  ipcMain.handle('office:dock-publish', (event, payload) => {
    allowApp(event);
    const people = Array.isArray(payload?.people) ? payload.people.slice(0, 64) : [];
    state = {
      people: people.map(person => ({
        id: String(person?.id || ''), name: String(person?.name || '').slice(0, 24),
        character: String(person?.character || ''), atDesk: person?.atDesk !== false,
        sharing: person?.sharing === true, hasPreview: person?.hasPreview === true,
        unread: Math.max(0, Number(person?.unread) || 0),
      })).filter(person => person.id),
      sharing: payload?.sharing === true,
      missed: Math.max(0, Number(payload?.missed) || 0),
      hidden: payload?.hidden === true,
      // 任务栏在哪条边：小窗据此决定悬停卡片朝上还是朝下画。
      edge: dock?.edge?.() || 'bottom',
    };
    dock?.send('office:dock-state', state);
    // 有几个头像就把窗口做多宽，别白白盖住任务栏上别人的图标。
    dock?.resize?.(state.people.length);
    // 自己正在共享屏幕时把自己藏起来，免得连小窗一起被共享出去。
    return dock?.setVisible(!state.sharing && !state.hidden, state.sharing ? 'sharing' : '') || false;
  });
  // 主窗口把某个人的最近一帧交过来 → 转给小窗。
  ipcMain.handle('office:dock-preview', (event, payload) => {
    allowApp(event);
    const id = String(payload?.id || '');
    if (!id) return false;
    return dock?.send('office:dock-preview', { id, image: typeof payload?.image === 'string' ? payload.image : '' });
  });

  // ---- 小窗 → 主进程 ----
  ipcMain.handle('office:dock-state', event => { allowDock(event); return state; });
  ipcMain.handle('office:dock-preview-want', (event, personId) => {
    allowDock(event);
    return toApp('office:dock-preview-want', String(personId || ''));
  });
  ipcMain.handle('office:dock-action', (event, payload) => {
    allowDock(event);
    const kind = String(payload?.kind || '');
    if (!['watch', 'share', 'call', 'focus'].includes(kind)) throw Error('Unknown dock action');
    const personId = String(payload?.personId || '');
    // 点按钮就把办公室窗口抬到前面来，通话界面在那里。
    const window = getWindow();
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) window.restore();
      window.show(); window.moveTop(); window.focus();
    }
    return toApp('office:dock-command', { kind, personId });
  });
  ipcMain.handle('office:dock-drag', (event, payload) => {
    allowDock(event);
    return dock?.moveBy(Number(payload?.dx) || 0, Number(payload?.dy) || 0) || null;
  });
  // 指针在头像条/卡片上才接管点击，别挡住任务栏上别人的图标。
  ipcMain.handle('office:dock-interactive', (event, value) => {
    allowDock(event);
    return dock?.setInteractive(value === true) || false;
  });
  ipcMain.handle('office:dock-visible', (event, payload) => {
    allowApp(event);
    return dock?.setVisible(payload?.visible !== false, String(payload?.reason || '')) || false;
  });
  return { state: () => state };
}

module.exports = { installDockBridge };
