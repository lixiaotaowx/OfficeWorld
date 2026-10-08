// 头像条与主窗口之间的中转（主进程侧）。
//
// 铁律：小窗只是"显示 + 遥控"。它不连 socket、不碰媒体、不认识任何业务逻辑；所有状态都
// 由主窗口推过来（它才是唯一的连接与媒体拥有者），所有点击都转发回主窗口执行。主窗口
// 与主进程之间靠 IPC，两侧各自有可信来源校验，别的页面调不动。
const { trusted } = require('./policy.cjs');

/** 舞台的场合只认这两个值（用户 2026-09-20）：其余一律当"没说"，按老样子放大舞台。 */
const dockStageMode = value => (value === 'peek' || value === 'call' ? value : '');

/** 隔多久重读一次任务栏颜色（用户换了主题/强调色，最多这么久就跟着变）。 */
const THEME_POLL_MS = 20000;

/** 任务栏颜色的白名单清洗：只留页面画框需要的四个字段。 */
function cleanTheme(value) {
  if (!value) return null;
  const accent = String(value.accent || '');
  return {
    light: value.light === true,
    tinted: value.tinted === true,
    accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent.toLowerCase() : '',
    transparent: value.transparent !== false,
  };
}

/** 配色/配件的槽位，与 OfficeWeb/src/look.ts 的 SLOT_ORDER 一致。 */
const LOOK_SLOTS = ['glasses', 'hair', 'beard', 'hat'];
const ID_RE = /^[a-z0-9_]{1,24}$/;

/** 小窗要用它去匹配 GLB 里的网格名，所以形状在这里钉死；脏数据一律当没给。 */
function cleanAppearance(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const color = String(raw.color || '');
  if (!ID_RE.test(color)) return null;
  const source = raw.accessories && typeof raw.accessories === 'object' ? raw.accessories : {};
  const accessories = {};
  for (const slot of LOOK_SLOTS) {
    const id = String(source[slot] || '');
    accessories[slot] = ID_RE.test(id) ? id : '';
  }
  return { color, accessories };
}

function installDockBridge(dependencies) {
  const { dock, getWindow } = dependencies;
  const ipcMain = dependencies.ipcMain || require('electron').ipcMain;
  // 主窗口最后一次推来的状态，小窗刚打开时先给它一份。
  // **一开始是"藏起来"**：刚启动/刚登录那会儿主窗口还没推过任何东西，先亮出空条子的话
  // 用户看到的是"没有头像"（用户 2026-09-20 报的"有时候启动不出现头像"就是这个），
  // 等主窗口第一次推状态再决定显示还是隐藏。
  let state = { people: [], sharing: false, missed: 0, hidden: true, transfers: [] };

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

  // 任务栏颜色：缓存一份（读注册表是异步的，发布状态那条路是同步的），定时重读。
  let lastTheme = null;
  async function refreshTheme() {
    try {
      const next = cleanTheme(await dock?.theme?.());
      if (JSON.stringify(next) === JSON.stringify(lastTheme)) return lastTheme;
      lastTheme = next;
      // 变了就立刻重发一次状态，小窗的框马上跟着换色（不用等主窗口下次推状态）。
      state = { ...state, theme: lastTheme };
      dock?.send('office:dock-state', state);
      return lastTheme;
    } catch { return lastTheme; }
  }
  void refreshTheme();
  const themeTimer = setInterval(() => { void refreshTheme(); }, THEME_POLL_MS);
  themeTimer.unref?.();
  // 还没收到主窗口的第一份状态之前先别露脸（见上面 state 的注释）。
  dock?.setVisible?.(false, 'starting');

  // ---- 主窗口 → 主进程 ----
  // 状态：缓存一份并转发给小窗。
  ipcMain.handle('office:dock-publish', (event, payload) => {
    allowApp(event);
    const people = Array.isArray(payload?.people) ? payload.people.slice(0, 64) : [];
    // 白名单清洗：只留下小窗画一行头像需要的东西。**加字段时别忘了这里**——
    // self / missed / away 都曾经漏掉，结果头像条上没有"我"的圈、没有"!"、卡片里也没有
    // 离座时长（用户 2026-09-18 要的就是离座时长）。test/dock-bridge.test.cjs 有断言守着。
    state = {
      people: people.map(person => ({
        id: String(person?.id || ''), name: String(person?.name || '').slice(0, 24),
        character: String(person?.character || ''), atDesk: person?.atDesk !== false,
        sharing: person?.sharing === true, hasPreview: person?.hasPreview === true,
        // 正在通话里（用户 2026-09-23：「语音通话中的人都有语音的图标」）：漏掉这个字段
        // 小窗就永远画不出话筒——和 self/missed/away/transfers 是同一个坑。
        inCall: person?.inCall === true,
        unread: Math.max(0, Number(person?.unread) || 0),
        self: person?.self === true, missed: person?.missed === true,
        away: typeof person?.away === 'string' ? person.away.slice(0, 24) : '',
      })).filter(person => person.id),
      sharing: payload?.sharing === true,
      missed: Math.max(0, Number(payload?.missed) || 0),
      hidden: payload?.hidden === true,
      // 任务栏在哪条边：小窗据此决定悬停卡片朝上还是朝下画。
      edge: dock?.edge?.() || 'bottom',
      // 卡片/舞台画在哪一侧：小窗据此把头像条钉在窗口对应的边上（Win11 条子在屏幕最左，
      // 只能往右画；挑错边条子就会被窗口边界顶走——用户 2026-09-20 报的"头像自适应位移"）。
      popup: dock?.popup?.() === 'right' ? 'right' : 'left',
      // 头像条高度（= 任务栏厚度）：小窗据此把头像和条子做得一样高。
      stripHeight: dock?.stripHeight?.() || 40,
      // 任务栏现在的颜色：小窗据此给外面那圈框配色（用户 2026-09-20）。读不到就是 null，
      // 页面自己有兜底（深色任务栏那套）。
      theme: cleanTheme(payload?.theme) ?? lastTheme,
      // 主窗口跟服务器的连接还在不在：短暂掉线（休眠、切网）时小窗**保留上一次的名单**，
      // 别让头像整排消失再冒出来（用户 2026-09-20：「有时候头像会消失闪烁」）。
      connected: payload?.connected !== false,
      // 正在传的文件（两端都推同一份）：小窗在头像条底下画一条细进度线（用户 2026-09-22）。
      // **加字段时别忘了这里**——白名单漏掉的话小窗就永远看不到进度（同一个坑踩过三次）。
      transfers: (Array.isArray(payload?.transfers) ? payload.transfers : []).slice(0, 8)
        .map(row => ({
          id: String(row?.id || ''),
          name: String(row?.name || '').slice(0, 80),
          percent: Math.max(0, Math.min(1, Number(row?.percent) || 0)),
          direction: row?.direction === 'receive' ? 'receive' : 'send',
          done: row?.done === true,
          failed: row?.failed === true,
        })).filter(row => row.id),
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
  // 头像条上按了「接听 / 拒绝」（用户 2026-09-21）：转给主窗口，由它去应答那条邀请
  // （跟通话面板上那两个按钮走同一条路，小窗自己不碰 socket）。
  ipcMain.handle('office:dock-answer', (event, payload) => {
    allowDock(event);
    const requestId = String(payload?.requestId || '').slice(0, 64);
    if (!requestId) return false;
    return toApp('office:dock-answer', { requestId, accept: payload?.accept === true });
  });
  // 有人把文件拖到了某个头像上（用户 2026-09-22）：小窗只认得出路径，发送仍然由主窗口
  // （唯一的 socket 拥有者）去做——这和三个通话按钮走的是同一条路。
  ipcMain.handle('office:dock-files', (event, payload) => {
    allowDock(event);
    const personId = String(payload?.personId || '').slice(0, 64);
    const paths = (Array.isArray(payload?.paths) ? payload.paths : [])
      .filter(item => typeof item === 'string' && item.length > 0 && item.length <= 1024)
      .slice(0, 64);
    if (!personId || !paths.length) return false;
    return toApp('office:dock-files', { personId, paths });
  });
  // 页面报版面：卡片开着就把窗口长高（指针才走得进卡片），并让窗口宽度和条子一模一样。
  // `stageMode` 决定舞台留多大地方：`peek`（鼠标停一下，人物小一倍）只留一半（用户 2026-09-20）。
  ipcMain.handle('office:dock-layout', (event, payload) => {
    allowDock(event);
    return dock?.applyLayout?.({ expanded: payload?.expanded === true,
      stage: payload?.stage === true, stageMode: dockStageMode(payload?.stageMode),
      stagePx: Math.max(0, Math.min(900, Math.round(Number(payload?.stagePx) || 0))),
      width: Number(payload?.width) || 0 }) || null;
  });
  // 主窗口收到服务端的"有人在看你"、或者有人打电话过来 → 转给头像条：把那个人的角色拉出来
  // （用户 2026-09-18：「把那个看我的人从状态栏头像中跳出来，站在状态栏上很大」）。
  // `mode` 是场合：`call` 用当前大小演一段招手，`peek` 小一倍、不演动作（用户 2026-09-20）。
  // 打电话过来还要带上那一通邀请的 id 与种类：头像条要写清"是谁、怎么打过来的"，
  // 并且能直接接听（用户 2026-09-21）。
  ipcMain.handle('office:dock-greet', (event, payload) => {
    allowApp(event);
    const id = String(payload?.id || '');
    if (!id) return false;
    const kind = payload?.kind === 'voice' ? 'voice' : payload?.kind === 'screen' ? 'screen' : '';
    return dock?.send('office:dock-greet', {
      id, name: String(payload?.name || '').slice(0, 24),
      // 配色与配件（尺子角色）：小窗照他自己的样子把他拉出来。**这里也是白名单，加字段别漏。**
      appearance: cleanAppearance(payload?.appearance),
      mode: payload?.mode === 'call' ? 'call' : 'peek',
      requestId: String(payload?.requestId || '').slice(0, 64),
      kind, offer: payload?.offer === true,
    }) || false;
  });
  ipcMain.handle('office:dock-visible', (event, payload) => {
    allowApp(event);
    return dock?.setVisible(payload?.visible !== false, String(payload?.reason || '')) || false;
  });
  return { state: () => state, refreshTheme };
}

module.exports = { installDockBridge };
