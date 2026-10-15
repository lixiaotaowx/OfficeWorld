# 任务栏头像条与文件直传（从 AGENTS.md 拆出，2026-10-14）

拆出来的原因：`AGENTS.md` 已经 516 行，超过"每个文件 ≤500 行"的规则。这一份装
**任务栏头像条（dock）**与**文件直传**两段 —— 它们本来就是同一件事的两个面（小窗只
显示 + 遥控、只交路径，业务与 socket 全在主窗口）。**条目一条都没删**，只是搬了家。

索引：主窗口侧的状态推送在 `src/useDockBridge.ts`，小窗页面在 `src/dock.tsx`，
原生窗口在 `OfficeDesktop/dock-*.cjs`；协议契约 `src/dock-*-contract.ts`。

## 任务栏头像条（dock，2026-09-17 用户要求）

- 需求（用户）：「贴 Windows 任务栏、永远置顶、无边框，锁定在任务栏的图标右侧…紧贴右侧托盘左边」+ 头像悬停看缩略图 + 卡片上三个按钮直接通话。设计与文件分工见 `../Design/Taskbar_Dock_20260917.md`。
- **铁律：小窗只做「显示 + 遥控」**。主窗口是唯一 socket 与媒体拥有者；服务器 `join` 会把同一 `clientId` 的旧 socket 踢掉（`server.mjs` 270-276 行），所以**小窗绝不能自己连 socket 或碰媒体**，否则会把主窗口顶下线、成员列表出现两个"我"。`test/dock-rules.test.mjs` 里有断言守着（`dock.tsx` 里不许出现 socket.io/useOffice/getDisplayMedia 等）。
- **窗口**：`dock-window.cjs`（无边框/透明/`alwaysOnTop('screen-saver')`/`skipTaskbar`/`focusable:false`/与主窗口同会话）+ `taskbar-position.cjs`（纯几何）。`dock.html` + `src/dock.tsx` 是独立入口，**不加载 three.js**（约 3KB）；主窗口用 `useDockBridge` 每秒推状态、悬停时把最近一帧交过去（**不需要新协议**）。
- **放置规则**：默认贴在**任务栏托盘左边 8px**——托盘宽度**真的去量**（`tray-area.cjs`：Win32 的 `Shell_TrayWnd` → `TrayNotifyWnd` 矩形），量不到才退回 220 的估算值；量到之后**还会夹住**：就算用户把条子往右拖、或者估算值偏小，条子右边缘也不许越过托盘左边缘。
  - **DPI 是这条路上的大坑**（2026-09-18 用户报「那台设备的头像现在又跑到了正中心」）：PowerShell 子进程默认**不是 DPI 感知**的，Windows 会把 `GetWindowRect` 的坐标**虚拟化**（已经除以缩放比例），我们再除一次 `scaleFactor` 就偏小一大截——那台 150% 缩放的机器上条子因此跑到屏幕中间。现在两头都堵住：脚本先 `SetProcessDPIAware()`（坐标保证是物理像素），换算时再**用任务栏高度自校准**（量到的高度 ÷ Electron 给的 DIP 厚度 = 这套坐标系里"1 DIP 等于几个单位"，接近 1 就说明拿到的是已缩放坐标，不能再除）。
  - **Windows 11 放屏幕最左侧，Windows 10 保持现状**（用户 2026-09-18：「当时Windows11系统的话 就把头像简单放在屏幕最左侧，Windows10保持当下状态」）：`taskbar-position.cjs` 的 `dockAnchor(os.release())` —— build ≥ **22000** 判为 Win11 → `anchor: 'left'`，条子放**屏幕/任务栏最左端**（`LEFT_GAP = 8`，不再受托盘夹紧影响）；否则 `'tray'`，就是上面这套"贴托盘左边 + 量托盘 + 夹住"。`dock-window.cjs` 启动时定一次（`dependencies.anchor` 可注入，测试用）。**本机是 Win10 19045，现场行为不变**（实测 `dockAnchor('10.0.19045') === 'tray'`）。
  - **卡片/舞台画在哪一侧要挑"有地方的那边"，并且条子一个像素都不许动**（用户 2026-09-20：「鼠标放在上面出现大窗口时头像会自适应位移，需要锁定」+「小窗口出现的方向多变一下」）：`dockBounds` 按两侧的空档挑 `popup`——左边放得下就先左边（老样子），放不下才翻到右边（Win11 条子在屏幕最左端，左边只有 8px，必然往右画）。**参考宽度固定用 `CARD_WIDTH`**，不能用当前状态的 `minWidth`，否则状态一变条子会左右横跳。往右画时窗口**左边缘**对齐条子左边缘，页面用 `.dock.popup-right` 把条子钉在窗口**左**边、卡片/舞台改成左对齐；往左画时是老样子（窗口右边缘对齐条子右边缘、条子钉右边）。主进程通过 `office:dock-state` 的 `popup` 字段告诉小窗（`dock-bridge.cjs` 的白名单清洗里也要带上它，漏了就是老行为）。**不这么做的话**：窗口往左摆、左边缘被屏幕夹住 → 窗口右边缘不再和条子对齐 → 页面里靠右对齐的条子被顶走，用户看到的就是"出现大窗口时头像会自适应位移"（按 156 的条子实测位移 175px）。
  - **所有头像套一圈灵动岛那种"纯半圆收口"的框，颜色跟着任务栏适配**（用户 2026-09-20：「把所有的头像整体框起来，像是同一个系统内感觉，有个大的圆角框，另外要根据当前状态栏的颜色去适配」，随后追加「大框两侧用纯半圆像是灵动岛那种」）：`.dock-frame` 高度 `calc(var(--dock-h) - 4px)`、**`border-radius: 999px`**（会被浏览器夹成高度的一半 = 两端正好两个半圆），把头像和"暂无人在线"那句话都圈进去；**`.dock` 自己仍然完全透明**（2026-09-18 定的"别有黑底"），框**不能加 `overflow: hidden`**——头像右上角的未读"!"和共享标记是往外凸的，会被切掉。两侧留白必须够宽，否则最边上头像的方角会戳出半圆、把边框线切断：要求 `留白 ≥ 半径 − √(框高 − 3)`（算下来约框高的 0.26～0.35 倍，任务栏越厚越大），所以就是 `padding: 0 calc(var(--dock-h) * .4)`——**别改回固定 px**，厚任务栏上会露馅（测试里按 28/40/48/64 四种厚度验过）。颜色由 `frameColors(state.theme)` 算成三个 CSS 变量：深色任务栏 → 白色浮层（`rgba(255,255,255,.1)` + 白边 `.2`）、浅色 → 黑色浮层（`rgba(0,0,0,.06)` + 黑边 `.16`）、任务栏被强调色着色时边框用强调色（里面再垫 7% 同色）；关掉透明效果时浮层加 4% 浓度。框会占一点宽度（条子从 157 变 169），页面量出来报给主进程，窗口跟着长。
  - **任务栏的颜色在主进程读注册表**（`OfficeDesktop/taskbar-theme.cjs`）：`SystemUsesLightTheme`（**不是 `AppsUseLightTheme`**——那是应用窗口的主题，本机实测就是"应用浅色、任务栏深色"）、`EnableTransparency`、`ColorPrevalence`、`AccentColor`（`0xAABBGGRR`，低字节是红）。**`reg query` 只认一个 `/v`**：`reg query KEY /v A /v B` 直接报 "Invalid syntax"（实测踩到，整条路静默退回兜底），所以整把键读回来自己挑。结果缓存 30 秒，读不到就退回 Electron 的 `nativeTheme` 明暗（没有强调色），**任何时候都不抛**。`dock-bridge.cjs` 每 20 秒重读一次、**变了就立刻重发一次完整状态**（不然要等主窗口下次推状态才换色），`theme` 同样要过白名单清洗（四个字段、强调色必须 `#rrggbb` 且小写）。验证：`test/taskbar-theme.test.cjs`（解析、ABGR、缓存、兜底）、`test/dock-bridge.test.cjs`（转发与重发）、网页 `dock-rules.test.mjs`（frameColors）、浏览器 `dock.cjs`（框包住所有头像、深/浅/强调色三种配色、换回来就没这个类），放大截图 `Build/dock-frame-zoom-*.png`。
  - **启动/自启不出现头像、头像忽闪、关机不要被拖住**（用户 2026-09-20：「有时候启动不出现头像，有时候开机自启不出现头像，有时候头像会消失闪烁，问题二不要阻止关机如果可以的话」）：
    - **启动先藏着**：`dock-bridge.cjs` 的初始状态是 `hidden: true`，装桥时就 `dock.setVisible(false, 'starting')`。以前初始是"显示"，主窗口还没推过任何东西的那一两秒会先亮一条空条子（用户看到的就是"没有头像"）。
    - **页面加载失败会重试**：`dock-window.cjs` 的 `did-fail-load`（`-3` 是我们自己中断的，不算）→ 按 2s/5s/10s/30s 退避重载；`render-process-gone`（渲染进程崩了）→ 立刻重载。开机自启时网络常常还没起来，老代码那一次 `loadURL` 失败就是永久透明窗口。`dependencies.loadRetryMs` 可注入（测试调快用）。
    - **不许忽闪**：`place()` 里"任务栏不在了"要**连续三次**（`HIDE_AFTER_MISSES`，每次 1.5 秒）才真藏——息屏、切分辨率、全屏应用、量托盘的 PowerShell 抖一下都会让某一次读数是"没有任务栏"，一次就藏条子就会忽闪忽现；认定真藏之后最多多留三四秒（条子在托盘那侧，底边别处照样能碰出任务栏）。
    - **短暂掉线不抹名单**：主窗口把 `connected` 一起推给小窗，`dockRules.mergeState()` 在 `connected === false` 且这一份名单为空时沿用上一份（`hidden: true` 时照旧清空）——休眠/切网/服务器重启时 `disconnect` 会先 `setPeople([])`，几秒后连上再推回来，不保留就是"整排消失再冒出来"。
    - **关机/注销不拖时间**：`main.cjs` 处理 `app.on('session-end')`（Windows 真的结束会话时）→ 收掉头像条、光晕窗口、常驻采集流（它会替我们申请"屏幕常亮"）然后 `app.exit(0)`；`before-quit` 里也停采集。托盘那条"关窗口 = 收进托盘"的 `preventDefault` 早就有 `quitting` 放行（`query-session-end`/`session-end`/`before-quit` 三处），`test/shutdown.test.cjs` 用源码级断言盯着这几处，改掉就红。
  - **有人打电话过来时，在人物头顶写清"谁来电"+ 直接接听**（用户 2026-09-21：「通话请求时，需要在人物上加上是谁来电，再加一个接听的按钮」，随后纠正：「我是说打招呼的人站在状态栏上的人物头顶」）：小窗那个跳出来的角色照旧站在头像条上（下边缘贴条子上边缘），**来电气泡挂在他头顶**（`.dock-call-wrap` 那一格 + `.dock-call`，灵动岛那种胶囊）：`callLabel()` 出文案（`同事乙 来电 · 语音通话` / `· 想看你的屏幕` / `· 要给你看屏幕`，纯规则；老客户端没带 `kind` 就只说 `同事乙 来电`），右边「拒绝」（红）+「接听」（绿）。
    - **位置怎么算**（别再挪到下面去）：`.dock-call-wrap` 与角色画布是**同一格**——同样宽（`--dock-stage-w` = `GREET_CANVAS[mode].width`）、底边同样在 `calc(var(--dock-h) + var(--dock-stage-h, 380px))`，也就是**画布上边缘之上**；气泡在里面 `justify-content: center`，而角色站在画布正中，所以气泡正对着他的头（实测气泡中心与画布中心偏差 0px）。外层 `pointer-events: none`、气泡自己 `pointer-events: auto`，透明区不吃鼠标；气泡高 52 且 `box-sizing: border-box`，`white-space: nowrap` + 文字 `flex: 1 1 auto; min-width: 0`（名字长了要省略号，不然"接听"会被顶出窗口右边）。`popup-right` 时外层一起钉左边。**旧的 `.dock-stage.over-call`（角色站气泡上面那一版）已经删掉**，`test/dock-rules.test.mjs` 里有断言禁止它回来。
    - **舞台多高由页面报**（`layout({ stagePx })`）：气泡让舞台从 380 变成 452（380 画布 + 62 气泡 + 10 余量），写死在主进程里就会被窗口裁掉；`dockBounds` 夹在 120～700（报得离谱地小就当没报，退回 `STAGE_SPACE`），`dock-window.applyLayout` 记下来，`desktop-dock-preload` 与 `dock-bridge` 各清洗一遍。舞台那会儿窗口宽度至少 `STAGE_WIDTH = 320`，所以 320 宽的气泡不会被屏幕/窗口边界裁掉。
    - **接听走 `office:dock-answer`**（小窗 → 主进程 → 主窗口 → `office.respond(requestId, accept)`），跟通话面板那两个按钮同一条路，小窗自己不碰 socket/媒体。**老客户端没有 `answer` 桥就不渲染按钮**（`typeof window.officeDock?.answer === 'function'`），只显示"谁来电"那行字。
    - 邀请本身（`requestId`/`kind`/`offer`）由 `callAttention()` 带出来 → `useCallAttention` → `dockGreet`；`dock-bridge.cjs` 里同样过一遍白名单（`kind` 只认 screen/voice、`requestId` 截 64 字符）。验证：桌面 `test/dock-bridge.test.cjs`（转发、来源校验、脏种类、`stagePx` 夹取）、`dock-window.test.cjs`（`stagePx` 三档）、网页 `dock-rules.test.mjs`（`callLabel` 四种）、浏览器 `dock.cjs`（气泡、角色站位、`stagePx=452`、点接听/拒绝记到 `__answers`），截图 `Build/dock-call.png`。
    - **这条链上有三处会静默丢字段，加字段时三处都要改**（2026-09-21 真机报障"看到名字了、但头顶没有接听/挂断按钮"就是漏了第一处）：
      1. `OfficeDesktop/desktop-preload.cjs` 的 `dockGreet` **白名单清洗**（主窗口页 → 主进程）：它把载荷重建成一个新对象，只留 `id/name/character/mode`，新加的 `requestId/kind/offer` 就被**静默丢掉** → 气泡有名字、**没有按钮**。现在四个字段都带上，`test/desktop-preview.test.mjs` 逐条盯着。
      2. `OfficeDesktop/dock-bridge.cjs` 的 `office:dock-greet` 处理（主进程 → 小窗）：`test/dock-bridge.test.cjs` 盯着。
      3. **反方向**：主窗口页要收得到小窗的接听 —— `desktop-preload.cjs` 必须有 `onDockAnswer`（订阅 `office:dock-answer`），`useDockBridge` 才会 `bridge.onDockAnswer?.(…)`。**这条桥以前根本不存在**，所以就算按钮画出来了，点下去也没反应。漏 `onDockAnswer` 也是静默的（可选链 `?.` 直接跳过）。
    - **真 Electron 上把这条链整跑一遍**：`& '.\node_modules\electron\dist\electron.exe' test/dock-call-chain.cjs`（两个窗口 + 真 preload + 真 dock-bridge，用协议桩喂夹具页，不碰网络）。它断言：小窗收到 **`{id,mode:'call',requestId,kind,offer}`** 一个不少、脏数据仍被清洗、**小窗点接听 → 主窗口收到 `{requestId, accept}`**。证据写在 `Build/dock-call-chain.json`。**改了任一白名单就跑它**——源码字符串断言只能证明"代码里写着"，这个脚本证明"真的传到了"。
  - **改文件别走 PowerShell**（2026-09-21 血的教训）：我用 `(Get-Content -Raw)` + `Set-Content` 改 `dock-window.test.cjs`，宿主是 Windows PowerShell 5.1，它按 **GBK** 读 UTF-8、再写回 UTF-8 → 中文和换行整片烂掉，只能从 git 恢复后重写整个文件。**编辑一律用 read/edit/write 工具；PowerShell 只用来跑命令，不要用它重写文本文件。**
  - 实测这台机器托盘 256~280px（会随图标多少变，所以每 20 秒重量一次），条子右边缘 = 托盘左边 - 8px。
  - 头像条在任务栏里竖直居中；**没人悬停时窗口就是头像条本身**（宽高都等于条子，一个像素都不多占任务栏），悬停卡片打开时才向上长高一个卡片空间、并宽到至少放得下卡片（`taskbar-position.cjs` 的 `expanded`）。两种状态下窗口**右边缘、下边缘都与头像条对齐**，所以卡片不会被裁、条子也不会跳。任务栏在哪条边、多厚、自动隐藏都由 `bounds`/`workArea` 之差推断，每 1.5 秒复查。
- **必须跟着藏**：任务栏自动隐藏时藏（否则鼠标碰不到底边、任务栏再也弹不出来）、自己共享屏幕时藏（免得被一起共享出去）、窗口进全屏时藏；托盘菜单「显示任务栏头像条」可手动关。
  - **但"藏"必须是三个独立理由，谁都不能卡住别的**（2026-09-22 用户报「头像这个 ui 有时候会消失找不到」后改）：`dock-window.cjs` 的 `place()` 现在算的是 `taskbarGone / pageVisible / system / manual` 四路，**任一路说藏就藏、互不覆盖**。以前"页面要求"和"整屏要求"写的是**同一个 `visible` 标志**（最后写的赢），而整屏那一路靠 `enter-full-screen` / `leave-full-screen` 两个事件——事件漏一次（窗口先收进托盘再退全屏、Electron 没发 leave……）条子就**再也不回来**，只能重启客户端。现在整屏改成**现算**：`main.cjs` 传 `systemHidden: () => mainWindow.isFullScreen() === true`，`place()`（每 1.5 秒一次）自己问一遍，事件漏不漏都不影响；`enter/leave-full-screen` 两个监听只负责"立刻贴一次"，不再写状态。
  - **窗口被异常销毁要能自愈**：`window.on('closed')` 会把 `window` 清空，而以前只有启动时调过一次 `ensure()`——窗口一旦被系统/驱动收掉，条子从此永久消失。现在 `follow` 那个 1.5 秒的 tick 里 `if (!window || window.isDestroyed()) { ensure(); return; }` 自己建回来；主动 `destroy()`（退出/关机）会先置 `destroyed = true`，不会再冒出来。
  - **"为什么藏"要留证据**：每次结论变化都往 `store.decide` 写一行（`main.cjs` 落到 `%APPDATA%\iruler dream\dock-why.json`：`{at, why, pageVisible, manual, hiddenStreak, strip, screen}`，`why` 是 `shown`/`taskbar`/`page`/`system`/`manual`），只在变化时写、不刷盘。下次再有人说"头像不见了"，先看这个文件，别靠猜。`dock-window.test.cjs` 有断言盯着（三个理由互不覆盖、整屏结束自己回来、报告的理由序列、窗口销毁后重建、主动 destroy 后不再重建）。
  - 页面那侧顺手修了个小的：`useDockBridge` 在"不可用"分支里推完 `{people: [], hidden: true}` 后把 `lastSent` 清掉——不然重新可用时那份状态和上次一模一样，会被当成"没变"跳过，小窗就一直停在"藏起来"那一份（`test/desktop-preview.test.mjs` 有断言）。**没有加"定期重推状态"那种 keep-alive**：老客户端没有上面那个"整屏现算"，重推会让条子在整屏应用上冒出来（宁可不做，也不引入新问题）。
  - **被顶下线/退出/被请出时要把条子交还回去**（用户 2026-10-08 报障：「被挤掉线之后为啥头像都还在 所有人的都在 这不合理吧」）：`useDockBridge` 的 `enabled` 入参**只表示"这台机器有没有 `dockState` 这道桥"**（`App.tsx` 里就是 `Boolean(window.officeDesktop?.dockState)`），而**被别的设备顶下线、Cookie 会话失效、被管理员请出、主动退出**走的都是 **App 卸载回登录页**，它压根不会变 false —— 所以以前收尾只 `clearInterval(timer)` 的话，小窗就**永远停在最后那一份名单**上：登录页都出来了，任务栏上还挂着一排同事（连已经掉线的我自己）。现在把清空抽成 `release()`＝清 `lastSent` + 推 `{people: [], sharing: false, missed: 0, hidden: true}`，**"不可用"那条路和卸载收尾共用它**（清 `lastSent` 是为了再登进来能重新推：那份状态和上次一模一样会被"没变"跳过）。回归：`node test/browser/dock-session-end.mjs`（真服务器 + 真账号：A 进办公室 → B 用同账号登录把 A 顶掉 → 登录页出来时小窗最后一份必须是空名单 + hidden，再登回来还要重新亮起来。**修复前必失败**，实测最后一份还是 `{"people":[…],"hidden":false}`）+ `node --test test/dock-session-end.test.mjs`（源码断言，别改回"只清定时器"）。**纯前端修复，刷新页面即生效、不用发新客户端**。
- **鼠标：不用点击穿透，改成"窗口跟着状态收放"**（2026-09-18 用户报障「我鼠标放上去弹出的窗口我无法点击 快速消失了」）。原设计是窗口一直 `setIgnoreMouseEvents(true, { forward: true })` 穿透、页面靠收到的 mousemove 判断指针在不在条子上再接管点击。**实测这套在这台机器上完全不工作**：ignore+forward 状态下页面**一条 mousemove 都收不到**（`Build/dock-hover-watch.mjs` 探针；关掉穿透后同一条鼠标轨迹立刻收到几十条），于是页面永远判不出"指针上来了"——悬停卡片不出来、出来了也点不动。这类透明窗上的 forward 本来就不稳（electron#40213），所以现在：窗口**始终接收鼠标事件**，页面用 `officeDock.layout({ expanded, width })` 报两件事——卡片开没开、条子实际多宽；主进程据此把窗口收成"就是头像条"或长高一个卡片空间（`dock-window.cjs` 的 `applyLayout`）。宽度**以页面量出来的为准**（`widthFor(count)` 只是页面报之前的估算值），这样窗口和条子永远一样宽，不会盖住任务栏上别人的图标。`setIgnoreMouseEvents` / `dockRules.dockInteractive` 都已删除，`test/dock-rules.test.mjs` 有断言禁止它们回来。
  - **头像上不挂 `title`**：系统的悬停提示会盖在头像条上，而卡片里已经写清名字、未读和离座时长（用户 2026-09-18 看过截图后定的）。
  - **验证"点得到"时绝不能真的去点那三个按钮**：它们是真的邀请（`office.request`），点下去对方的电脑真的会弹来电（用户 2026-09-18 直接警告「不要乱打电话」）。要验就用浏览器 `test/browser/dock.cjs` 的 harness，或者**在捕获阶段拦下 click**。注意 `contextBridge.exposeInMainWorld` 暴露出来的对象是 `Object.freeze` 的，**`window.officeDock.action = …` 这种替换会被静默忽略**——2026-09-18 就是"以为拦住了、其实真拨出去了一次"。真要动真格的，也只在 `dock-` 里对**不存在的人**调用。
- **显示谁**：在线的人 + 我自己（我在最左、带一圈白边），排序 未接来电 → 未读 → 正在共享 → 在座 → 名字，最多 16 个；**访客/浏览器登录/没工位的人永远没有缩略图**（规则如此），卡片显示「此人不广播屏幕预览」。三个按钮走的是和右侧详情卡同一条邀请通道（看对方屏幕 / `offer:true` 分享我的 / 语音），点完主进程把办公室窗口抬到前面。悬停卡片的名字后面跟离座时长（`useDockBridge` 用 `awayTime` 算好一句现成的字交过去，小窗不认时间）。
- **卡片上的状态要写成字、用暗绿/暗红**（用户 2026-09-18：「在座就显示暗绿色在座 离座显示暗红色离座，不要出现此人不在电脑前的文字 不在的话用最后一张 不要在办公室还关着屏幕」）：名字右边一个小标签，在座 `#2f6b3c`、离座 `#8f3a2c`（`.dock-card-state.here/.away`），离座时标签里直接写「离座 N 分钟」。
  - **顺序要"粘住"，不许在鼠标底下换位**（用户 2026-09-21：「状态栏的头像位置尽量不要频繁的切换顺序，不然本来鼠标看着一个人闪烁到另一个人了」）：名次（上面那串规则）本身没变，但**显示顺序和名次分开**——`dockRules.stickyOrder()` 是纯函数，两档防抖：① 指针停在条子/卡片上（`.dock` 的 `onMouseEnter/Leave` → `pointerOn`）时**一个都不许挪**，新人接在最后、走掉的人立刻消失；② 没停住也要名次**连续稳定 `ORDER_SETTLE_MS = 2000`** 才真的换序（`since` 记的是"名次第一次和显示对不上"的时刻，**不是**上次换序的时刻——否则下一个心跳就会立刻换，「稳住两秒」等于没做；没稳就返回 `waitMs`，页面到点再看一眼）。**为什么会闪**：离座/在座 10 秒就翻一次，共享开关、未读数也会改名次，主窗口一重排、小窗照着画，鼠标底下就换成别人了（`hovered` 是按 id 走的，DOM 一挪浏览器就会重发 mouseover → 卡片跟着换人）。`orderPeople()` 负责按粘住的顺序摆人头（顺序表里没有的人接最后，**不许丢人**）。
  - 页面画的是 `people`（粘住的顺序），**不是** `state.people`（刚推来的名次）——`test/dock-rules.test.mjs` 里有断言禁止画回原始顺序。回归：`test/dock-rules.test.mjs`（照排/冻结/新人接尾/走人立刻消失/差 100ms 不换/变回去重新计时/指针压着多久都不换）+ 浏览器 `dock.cjs`（指针在条子上时打乱名次顺序不变、移开 2.6 秒才换）+ 线上核验 `Build/live-dock-verify.cjs`（部署页实测 `before == frozen`，移开后 `["我","客户丙","同事乙"]`）。
  - **离座不再等于"没有预览"**：`previewPlaceholder()` 里那条「此人不在电脑前，预览已暂停」**删掉了**，不许再回来（`test/dock-rules.test.mjs` 与 `test/browser/dock.cjs` 都有断言）。离座的人照样显示他**最后一张**工位画面：小窗收到空帧时**不覆盖**已有的图（`dock.tsx` 的 `onPreview` 直接 return），主窗口那边也是**有画才发**（`useDockBridge` 的 `onDockPreviewWant` 遇到空帧不推），真的没有画面时只写「暂时没有画面（对方可能没在采集）」。
  - **悬停期间反复要帧**（`PREVIEW_POLL_MS = 800`）：只问一次的话，"悬停早了"（主窗口手里还没有这个人的画面）就永远是一片白。
- **服务端记住每个人的最后一张**（`preview-relay.mjs`，2026-09-18）：低清预览的中继从 `server.mjs` 里搬出来，顺便做三件事——校验限速（访客不广播 / 400ms 一帧 / 250KB 封顶）、转发（自己也算，自己桌上的显示器才有画面）、**按账号 `clientId` 缓存最后一帧**。于是：
  - 人走开（客户端暂停采集、什么都不发）之后，他那张画面继续留在服务端，别人（包括**刚启动的客户端**）都拿得到——`join` 之后服务端会补一份快照（`previewRelay.snapshot(s.id)`）。这就是用户要的「不在的话用最后一张 不要在办公室还关着屏幕」：以前新开的客户端要等每个人下一次采集（最长 12 秒，人不在电脑前就永远不采），整间办公室的屏幕都是黑的。
  - **只有客户端明说停止广播**（`ambient-sharing:false`：关掉预览、关窗、采集失败）才会发一帧 null 告诉别人"现在没有实时画面"——但**缓存留着**，`useOffice` 收到 null 也**不删手里那一张**（`test/desktop-preview.test.mjs` 有断言守着）。人真的离开空间时才清（`retainPresent` 只保留在场的人）。用户 2026-09-18 实测：显示器关掉会让采集失败 → 客户端发 `ambient-sharing:false` → 以前这一下就把画面抹了，看起来就是"办公室还关着屏幕"。
  - 同理，任何人走开或断线重连后，`previewSharing` 会回到 false（服务端的人是重连时重建的），要等他下一次出帧才会重新变 true——**这不代表他的客户端坏了**，别据此下结论（2026-09-18 就误判过一次：Elsa 其实是桌面客户端、在座时正常广播）。
  - 测试：`test/preview-relay.test.mjs`（中继规则本身）+ `test/preview-snapshot.test.mjs`（**真服务端**上验 join 快照、回显、访客兜底、限速）。
  - 边界：如果一个人**从来没广播过**（浏览器登录、访客、老客户端），服务端也没有他的画面，卡片只会写「暂时没有画面」——这不是坏了，是本来就没有。


- **`dock-bridge.cjs` 的白名单清洗是加字段的坑**（2026-09-18 发现）：它把小窗要的人头字段一个个列出来重建，`self` / `missed` / `away` 都曾经漏掉，表现为"自己的头像没有圈也不排最前、未接来电没有 `!`、卡片里没有离座时长"——而浏览器 harness 是直接吃 `buildDockState` 的产物，所以测试全绿、真机上却是坏的。给 `DockPerson` 加字段时**必须同时改这个白名单**，`test/dock-bridge.test.cjs` 现在盯着这三个字段。

- **外观：一层很淡的玻璃 + 白圆按钮**（2026-09-2X 用户给了参考图：「把状态栏上的头像部件改的灵动一些…头像背景和组件降低透明度，以及小窗口的圆角绘制，按钮的白色」）：
  - 条子（`.dock-frame`）和悬停卡片（`.dock-card`）**共用一套半透明材质**：底色用主进程按任务栏颜色算好的浮层值（深色任务栏白色浮层、浅色黑色浮层），外加 `backdrop-filter: blur(...) saturate(...)`、一圈细边、顶上一道 `::after` 高光；卡片另有**更大的圆角**（18px）。
    - **但两层的"透"不是一个量级**（用户 2026-09-2X：「弹出的小窗不要完全透明啊 是指状态栏头像设计要改的透明一些」）：**条子**要很透、边很细（白浮层 `.04`、悬停 `.06`、边框 `.14`），**悬停卡片必须够实**（深色 `rgba(20,21,24,.88)`、浅色 `rgba(250,250,250,.93)`）——里面要放工位截图和字，`.52` 那版透到看不清。两套值都在 `.dock` / `.dock[data-theme="light"]` 的 CSS 变量里。
    - **头像没有自己的小底色**（用户 2026-09-2X：「头像本身的小背景有点黑啊 直接去掉内部小背景」）：`frameColors().chip` 恒为 `transparent`，`.dock-avatar` 不再垫任何底（贴图本身就是透明底的，直接透出任务栏）。**注意连带影响**：那块深垫底原来在 `filter: brightness()` 之下也一起被压暗，去掉后整条平均亮度从 37.4 跳到 67.8，所以要把头像自身的 `brightness` 从 `.86` 补到 `.68`（`saturate 1.7 → 1.55`）。量法：`Build/dock-white-measure.cjs`、`dock-white-regions.cjs`、`dock-avatar-probe.cjs`（问页面要 computed filter/背景/贴图 URL）。
  - **卡片有一个指向头像的尖**（用户 2026-09-2X：「我希望小窗有一个气泡指向的尖尖那个东西指向头像」）：`.dock-card-tip` 是转 45° 的方块（对角线朝下 = 圆角小三角），`bottom: -11px` 探到**头像条上边缘**、和卡片连成一体；位置由纯函数 `cardTipOffset(cardLeft, cardWidth, avatarCenterX)` 算并**夹在卡片内**（否则被 18px 圆角切掉），页面悬停时量"头像中点 − 卡片左边界"；`.edge-top`（任务栏在上方）时转 225° 指向上面的头像。**不能挂 `border`**（转 45° 后边框变斜线），靠 `inset 0 0 0 1px rgba(255,255,255,.16)` 那道极淡边光才看得出形状；尖的底色比卡片再实一点（`--dock-card-tip-bg`），太小太透会糊成一团（实测截图验证过）。
  - 卡片上三个动作按钮改成**白色圆按钮**（36px、`border-radius: 50%`、白底 + 深色图标 + 轻阴影，悬停微抬）；缩略图 228×128，卡片实测 294×175，主进程给的 `CARD_SPACE = 210` 装得下。
  - "灵动"这几处全是**纯 CSS，不动任何通道**：头像悬停/被选中（`.open`）时抬起 1px 并套一圈柔和光环（颜色取任务栏强调色 `--dock-ring`，读不到退回浅蓝）；新人加入时弹一下（`dock-pop`）；有未读/未接来电的头像一呼一吸地柔光（`dock-live`，2.4s，不是闪个不停）。
  - **"太白"要量，不要凭观感调**（2026-09-2X 用户「还是不好看 太白了 是不是透明的问题」）：白的是**框那层白色浮层**，不是透明问题 —— 所以白色浮层压到 **.05**（悬停 .07）、顶部高光 `.07`、头像垫底改用**暗色** `rgba(10,12,12,.2)`（`frameColors().chip` 按主题给，浅色任务栏才用亮垫底）、卡片底色补到 `rgba(18,18,20,.58)` 保住截图可读性。条子平均亮度实测 **41.7 → 36.4**（`Build/dock-white-measure.cjs` + `Build/dock-white-regions.cjs`：同一假桥 + `#1b1b1b` 任务栏底，逐像素量）。
    - **踩过的弯路**：我曾按"头像太白"把头像提亮（brightness `.74 → .88`），区域实测头像亮度 **44.3 → 91.8**，方向完全反了；`Build/dock-dim-sweep.cjs` 扫参数时才发现**贴图本身是透明底的暗色角色**——它显示多少亮度完全由 CSS filter 决定。这类判断一律先量。
  - **两个坑（都实测踩过）**：① `color-mix()` 在**预乘**空间里混合，拿半透明色去 `color-mix(..., #fff)` 会把 RGB 一起拖向白 —— 浅色任务栏那层"黑色浮层"被算成 `rgba(35,35,35,…)`，既有的「浅色 → 黑色浮层」断言当场红；所以悬停提亮的底色**按主题写死**（`--dock-strip-bg-hover`），不要用 color-mix。② `.dock-frame` 上**不能加 `transition: background`**：主题切换时 `getComputedStyle` 读到的是过渡插值（同一份代码两次跑出 `rgba(0,0,0,.06)` 和 `rgba(35,35,35,.063)`），那条断言随机红。
  - 外观核验工具是 `Build/dock-visual.cjs`（**吃构建产物**，不依赖 Vite dev server）：自己起静态服务器伺服 `Build/OfficeWeb/dock.html`、注入与 `dock.cjs` 相同的假桌面桥、再铺一层"任务栏"背景，截图 `Build/dock-visual-{strip,strip-zoom,card,card-zoom,light}.png` 并打印卡片/按钮实测几何。真正带断言的 `test/browser/dock.cjs` 仍然要跑，两者一起看。
  - **已上线**（2026-09-2X）：现在是 `main-Dj86UWuF.js` / `dock-D1-Mhz6f.js` / `dock-C4cCZsbU.css`（降白那一版），逐文件哈希核验本地=远端、公网 200 且哈希一致；**后端未动、未重启、未发新客户端**（装着的客户端重启或刷新即可）。线上实测见 `Design/Deployment.md` 顶部那条。
    - **重建后文件名会变，但内容可能逐字节相同**：同一份源码重建会让 `main-*` 与分块名一起换哈希（实测 `main-ZLu45is8.js` → `main-Dj86UWuF.js`，规范化分块名后两边都是 745,716 字节、逐字节相同）。所以"远端缺失新文件名"**不能**推断成"有别人的改动混进来"，用 `Build/build-drift.cjs` + `Build/same-content.cjs` 规范化比对来证明。


## 文件直传：把文件拖到任务栏头像上（2026-09-22 用户要求）

- 需求原话：「新增文件发送功能，就是把文件拖至状态栏某人头像，就会开始发送，**不需要对方同意**，
  直接就发送到**设置好的位置**，设置里面可以改，**双方要显示系统级进度条**，完事有打开和打开文件夹的功能」。
- 已确认的四个选择：**接收方网页也能收**（网页只能走浏览器下载，没有系统进度条）；
  **服务器实时中转**（不落盘）；对方不在线时头像条上根本没有这个人，所以不存在"离线投递"这个场景；
  **接收文件夹由接收方自己在设置里选**。
- 分工（和项目既有铁律一致）：
  - **小窗（头像条）只交路径**。`dock.tsx` 的拖放用 `officeDock.filePaths(files)` —— Electron ≥32 删掉了
    `File.path`，只有 `webUtils.getPathForFile` 拿得到真路径 —— 再 `dropFiles(personId, paths)` 交给主进程。
    小窗**依旧不碰 socket、不碰文件系统**（`test/dock-rules.test.mjs` 的静态断言守着）。
  - **主窗口（唯一的 socket 拥有者）**负责分片、确认、进度：`src/fileTransfer.ts`（引擎）+
    `src/useFileTransfers.ts`（React 外壳，`useSyncExternalStore`）+ `src/fileTransferRules.ts`（纯规则）。
  - **主进程**负责真实文件系统与系统进度条：`OfficeDesktop/file-transfer.cjs`（发送读盘、接收写盘、
    接收文件夹设置、`setProgressBar`、`openPath`/`showItemInFolder`）。
- **广播操作符上的 `emitWithAck` 回的是数组，不是对象**（2026-09-21 真机排查出来的**根因**，
  让"把文件拖到头像上发不出去"卡了整整一轮）：
  `io.to(room).timeout(ms).emitWithAck(ev, payload)` —— **即使 room 里只有一个 socket，
  解析出来也是 `[{ ok: true }]` 这种数组**（每个客户端一个 ack；只有 `socket.emitWithAck` 才是单个 ack）。
  服务端原来写 `if (!answer?.ok)`，在数组上永远是 `undefined`，于是**每一趟都在 `file-offer` 就被判成
  「对方无法接收文件」**，而对方其实每次都回了 `{ ok: true }`——传输根本没开始。
  `file-chunk` / `file-end` 走的 `toTarget()` 是同一个坑，所以就算 offer 过了，每一片也会失败。
  - 现在统一过 `firstAck(value) => Array.isArray(value) ? value[0] : value`（`file-relay.mjs`）。
  - **服务端日志里留了一行**：offer 被拒时打 `[file-relay] file-in 被拒绝：{target, kind, isArray, keys, error}`。
    `isArray: true` 就是这条 Bug 的指纹——**排障先看 `journalctl -u officeweb | grep file-relay`**。
  - **测试的假 io 当时回的是单个对象，所以完全测不出来**。两个 harness
    （`test/file-relay.test.mjs`、`test/file-transfer-endtoend.test.mjs`）现在都**回数组**，
    并且都写了注释叫后来人别"简化"回去。实测把那行退回旧写法，11 条中继测试**红 9 条**。
  - 教训：**写假件时要照着真实库的行为写，不能照着"我以为的"写**。这一条比 Bug 本身值钱。
- 服务端只转发、不落盘（`OfficeWeb/file-relay.mjs`）：发送方分片 → 校验 → 原样转给接收方 →
  接收方写盘成功才回执。所以 VPS 上不会攒文件、不需要清理策略与配额；`test/file-relay.test.mjs`
  有一条源码级断言禁止这个文件出现任何 `node:fs` 调用。**每一片都要端到端 ack**，发送方窗口
  `WINDOW = 4`，接收方写得慢就自然把发送方拖慢（背压）；服务端同样校验 `inflight < WINDOW`，
  另有单发送方 3 个、全局 24 个传输的上限。
- **"不需要对方同意"落在协议上**：服务端的 `file-in` 不是征求同意，而是**确认对方那端接得住**
  （能开文件、有地方放）。接收方收到就直接写盘，客户端里不许出现"是否接收"的询问
  （`file-transfer-rules.test.mjs` 有断言盯着 `confirm`/`accept?` 不许回来）。
- **接收文件夹**：设置里选（`FileReceiveSetting.tsx` → `officeDesktop.files.chooseFolder()`，原生目录选择器，
  存在 `userData/file-transfer.json`）。没设过时默认 `<系统下载>/iruler dream` 并自动建出来，
  所以第一次就能收。**写盘一定在这个目录内**：`safeName()` 丢掉所有目录成分、替换非法字符、
  躲开 Windows 保留设备名、截到 150 字符；再来一次 `path.resolve` 前缀校验兜底；
  重名往后排 `(1)(2)`，**绝不覆盖**对方已有的文件；先进 `.part`，收完才 `rename`。
- **进度条是两套，都要有**：① Windows 任务栏按钮上的原生进度（主进程 `win.setProgressBar`，
  同时传多个按字节数合并，传完先把满格亮 1.5 秒再收掉）；② 任务栏头像条**里面底部**那条细线
  （`dockRules.DockState.transfers` → `dock.css` 的 `.dock-progress`，发送青色 / 接收绿色 / 失败红色）。
  头条的进度字段**必须同步加进 `dock-bridge.cjs` 的白名单清洗**——这个坑踩过三次
  （`self`/`missed`/`away` 都漏过），`test/dock-bridge.test.cjs` 现在盯着 `transfers`。
- **完事的两个按钮**：`FileTransferPanel.tsx`（左下角，右下角已经给未接来电和更新提示了）给
  「打开」（桌面端开本地文件、网页端开收下的 Blob）和「打开文件夹」（`showItemInFolder` 选中该文件）。
  卡片**不自动消失**，只能手动关（和未接来电卡片同一个理由：按钮跑掉就没得点了）。
  窗口收在托盘里时另有系统通知，不然用户不知道传完了。
- **打开/显示只认自己交出去过的路径**（`known` 列表 + 接收文件夹前缀），页面构造的任意路径一律拒绝；
  `openFolder('C:\\Windows')` 也如实返回 false，不许"悄悄换成接收文件夹"（这条是被测试逼出来的）。
- 进度状态**攒 200ms 再推给 React**（`FLUSH_MS`）：一片一次 `setState` 会让整个页面空转，
  和 2026-09-20 那次 CPU 爆表是同一类病；`sameTransferRows` 保证内容没变就不换引用。
- 网页版收文件：没有可静默写入的文件夹，先在内存里攒、收完合成 Blob 交给浏览器下载
  （因此有 `BROWSER_MAX_BYTES = 512 MB` 的上限，超了明确拒绝并让对方改用客户端接收）。
- 为了腾出行数，顺手做了三处**纯搬家**（行为不变，测试跟着搬）：`useOffice.ts` 的会议画布清理 →
  `annotationChannel.trackMeetingRoom`；socket 上那三条标注消息 → `annotationChannel.attachSocket`；
  认领工位/管理员释放 → `src/seatRequests.ts`；设置弹窗 → `SettingsDialog.tsx`。
  当前 `server.mjs` 492 行、`App.tsx` 465 行、`useOffice.ts` 452 行，都在 500 以内。
- **二进制分片千万别读 `.length`**（2026-09-21 用户报障「对方无法接收文件，接收方出现了进度条显示没有进度」的**根因**）：
  `socket.io-client` 的**浏览器构建**——页面和 Electron 渲染进程用的就是它——默认
  `binaryType = "arraybuffer"`（`engine.io-client/build/esm/globals.js`），所以收端拿到的是
  **`ArrayBuffer`**；而 `ArrayBuffer` **只有 `byteLength`，没有 `.length`**。原来的
  `payload?.bytes?.length || 0` 因此永远是 `0`，**每一片都被判成"无效的文件分片"**：接收方那张卡片
  出现了却停在 0% 随即失败，发送方只被告知对方收不了。服务端（Node 构建是 `"nodebuffer"`）拿到的是
  `Buffer`，所以服务端、单测、聊天附件那条老路全都正常——问题只在浏览器那一侧，这就是它没被早发现的原因。
  - 现在统一走 `fileTransferRules.ts` 的 **`toBytes()`**（`ArrayBuffer` / `TypedArray` / `Buffer` /
    `Blob` / socket.io 老式 `{type:'Buffer',data}` 全覆盖），配套 `byteLengthOf()` / `describeBinary()`
    让错误信息说清"到底收到了什么类型"。
  - **测试必须按浏览器的形状投递**：`test/file-transfer-endtoend.test.mjs` 用**真的 `file-relay.mjs`**
    + 两端 `createFileTransferChannel` 跑完整一趟，harness 把二进制转成 `ArrayBuffer` 再交给接收方，
    并且**断言转换确实发生过**（`delivered.arrayBuffers >= 2`）——否则测试会悄悄退回 `Buffer`，Bug 又藏起来。
    实测把那一行退回旧的 `.length` 写法，4 条里有 3 条立刻变红。
  - **这条链路是纯前端的**：修好只需重新构建上传 `dist/`，两端**刷新页面（F5）**即可，不用重新装客户端。
  - 顺带修掉一个更隐蔽的：`file-in` / `file-in-end` 原来**没有 try/catch**，接收端一抛
    （比如 `receiveOpen` 的 IPC 失败）就永远不会 `reply`，发送方要**白等 60 秒**才知道失败。
    现在两条路都包住了，失败原因立刻回传，两端卡片都写明原因。
- **单个文件上限 2 GB，两条路都是**（2026-09-21 用户要求：「把聊天框的大小限制到2g文件传输，把头像直传也2g」）：
  - 头像直传：`OfficeWeb/file-relay.mjs` 的 `MAX_FILE_BYTES` **==** `OfficeDesktop/file-transfer.cjs`
    的 `MAX_BYTES` == `2 * 1024 ** 3`（原来是 4 GB）。服务端那份是硬门，客户端只是早点报错。
  - 聊天附件：`OfficeWeb/chat-files.mjs` 的 `MAX_FILE_SIZE` **==** `src/chatAttachments.ts` 的
    `MAX_CHAT_FILE_BYTES` == `2 * 1024 ** 3`（原来是 20 MB）。
  - **这几个数字散在三个文件里，只改一处就会变成"界面说能发、服务端拒收"**，所以
    `test/file-size-limits.test.mjs`（网页侧）和 `OfficeDesktop/test/file-transfer.test.cjs`
    把它们钉在一起并核对提示文案；改上限时**四处一起改**（含 `ChatPanel.tsx` 里那行说明）。
  - **聊天附件是存在 VPS 上的**（`chat-data/`，保留 7 天）：上限变大等于磁盘占用变大，
    发大文件前先看 `df -h /`（2026-09-21 当时 22 GB 可用）。
  - 提上限时必须**一起**改的两处，不然大文件根本走不完：`chatAttachments.ts` 的下载期限
    `AbortSignal.timeout` 原来写死 60 秒——**它卡的是整条请求，不是"空闲"**，2 GB 永远下不完；
    现在用 `downloadTimeoutMs()` 随大小放大（最低 64 KB/s，2 分钟起、6 小时封顶）。
    另外超过 `CACHE_MAX_BYTES`（256 MB）的文件**不再往 IndexedDB 里塞**，直接把手里的 Blob
    交出去下载（浏览器的存储配额经不起几个 GB，`put` 会失败或卡住）。
- **聊天框里的文件下载也走这条通道（2026-09-21 用户要求：「整理一下聊天框里面的文件下载，要带进度条，
  要软件内设置好下载位置，下载好了也还是有几个按钮 打开等 复用」）**：
  - 入口是 `fileTransfer.ts` 的 `downloadAttachment({ id, name, size, url })`：数据来源换成
    HTTP 流（`/api/chat/files/:id`，经 `src/downloadStream.ts` 的 `streamResponse()` 一块块搬），
    其余**全部复用**——同一个接收文件夹（`receiveOpen/Write/End`）、同一份被限流（`FLUSH_MS`）的进度、
    同一条任务栏进度条、同一张卡片、同样的「打开 / 打开文件夹」。
  - **行 id 就是附件 id**：聊天里那一条和传输面板里那一条是同一个记录，界面据此画自己的进度条，
    重复点「下载」也不会开第二趟（已完成直接返回）。
  - `ChatPanel.tsx` 的 `AttachmentView` 现在渲染：进度条（`.chat-file-bar`）、「下载 / 重新下载」、
    「打开」「打开文件夹」、「取消」，小附件另给一个「另存一份」的直链。
  - **大附件不再后台自动预取**：`chatClient.show()` 只把小附件（≤ `PREFETCH_MAX_BYTES` 4 MB）放进
    后台缓存队列——上限提到 2 GB 之后，"所有附件都自动收"等于打开一次聊天就静默拉几个 GB。
    这也是 2026-09-21 之前"收到就缓存"那条规则的必要修订。
  - `chatAttachments.ts` 现在 import `fileTransferRules.ts`（`downloadTimeoutMs` 只留一份）。
    测试里转译 `src/*.ts` 请用 `test/helpers.mjs` 的 **`loadTs()`**：data URL 模块解析不了 `./x`，
    模块一旦互相 import，老的"就地 transpile"写法会直接崩（这次踩到了）。
- **`src/fileTransfer.ts` 已经 494 行（上限 500）**：下一次改动它之前，先把**发送那一半**
  （`sendOne` / `sendFiles`）拆出去，别再往里塞。
- 已知边界：拖拽的**真机**链路（从资源管理器拖到任务栏那个无边框小窗）只能人工验证一次；
  `webUtils.getPathForFile` 对合成/网页拖来的 File 返回空串，所以自动化测试只能覆盖
  "路径转交 + 接收写盘"两段。暂不支持发送文件夹（服务端/客户端都拒绝，提示打包后再发）。

## 静音按钮里的音量填充（2026-10-14 用户要求，2026-10-15 改成填充式）

需求（用户）：「状态栏静音按钮需要一个声音波纹来看麦的音量」，随后明确要
**「麦克风图标里面会根据音量的大小来填充颜色的高度，就像腾讯会议那样的功能」**。
第一版做成了**图标外面一圈描边**（`DockMicWave`，圈随音量变大），2026-10-15 按上面那句改成
**图标里面从底部涨起来的一层填充**（`src/DockMicFill.tsx`），旧组件已删除。

- **音量只能在主窗口量**，小窗连 socket 都没有（见上面那条铁律）。链路：
  `media.activeMic()`（**箭头函数**，页面会把它单独传出去，普通方法会丢 `this`；只认
  **正在收发声音的那间房** `audioFocus.current`——别的房间里的麦是静音状态）→
  `useMicLevel(activeMic, micOn, live)` 每 60ms 取一次 → 一个 0..1 的数塞进
  `DockMeetingState.micLevel` / `DockPrivateState.micLevel` → 小窗 `DockMicFill` 画那层填充。
- **用原生 `AnalyserNode`，不用 LiveKit 的 `createAudioAnalyser`**：那个要一个
  `LocalAudioTrack` 包装对象，而我们手里只有底层 `MediaStreamTrack`。代价是得自己管
  `AudioContext`——**每次都必须 `close()`**，浏览器同时能开的上下文很少，一通电话漏一个，
  几通之后 `createMediaStreamSource` 就再也建不出来（液面永远不动）。另外**轨道换了要重建**
  （切房间、重新授权麦克风、换设备）：旧 Analyser 量的是一条死轨，读数会永远停在最后一帧。
- **静音 / 没在通话时读数是 0，填充一点都不画** —— 那正是"没在收音"最直白的表示。
  数值规则全在 `src/micLevel.ts`（纯函数）：`waveHeight` 先掐掉底噪（`MIC_FLOOR = 0.008`，
  实测安静房间的 RMS 是 0.002～0.006）再放大 4 倍开方；`smoothLevel` 起得快落得慢
  （`release = 0.16`，约 0.4 秒落下去）；`meterLevel` 四舍五入到 0.01，**没变的数不再推**。
- **推给小窗要限速**：`useDockBridge` 的 `METER_PUSH_MS = 80`（约 12fps）。判断方式是比较
  "**去掉音量以后**的快照"（`meterStripped`）——两份一样就说明这次只有液面在变，攒到下一拍
  再发；**别的状态变化（来电、共享、名单）不受这个限制，照旧立刻推**。这里差点写错：拿
  `withoutMeter` 去比 `lastSent`（那份**带**音量的）永远不相等，等于限速完全失效、每 60ms 一次 IPC。
- **填充的画法（别改回外圈）**：`<i class="dock-mic-fill">` 绝对定位在按钮里，**满高 + `scaleY(level)`**
  （transform 走合成层；每帧改 `height` 会重排），`transform-origin: 50% 100%` 让液面**从底部**
  涨；`bottom: -6px` 抵消按钮的 5px padding + 1px 边框，液面才是从**按钮底边**起；
  `overflow: hidden` 裁掉溢出（圆角）；**图标的 `z-index` 必须比填充高**，否则话筒形状被糊掉
  （全音量时填充是 `#4f9d68`，深色图标仍然清楚）。按钮上带 `data-mic-level` 与 `data-mic-fill`
  便于断言与排查。
- 回归：`node --test test/mic-level.test.mjs`（换算、静音归零、0.01 收敛、落回 0、接线断言
  ——**包括"不能再退回 circle"**）+ `node test/browser/dock-meeting-controls.cjs`（静音时
  0 高；`micLevel` 0 / 0.34 / 1 三档液面依次变高，满音量铺满按钮可用高度 17px；填充铺满宽度、
  被裁切、在图标后面）。肉眼观感用 6 倍放大图确认：`Build/dock-mic-fill-zoom.png`
  （0 / 0.25 / 0.55 / 1 四档并排）。

## 看视频时给画面让位：最大化/整屏就藏，最小化/还原就回来（2026-10-14 用户要求）
需求（用户）：「当状态栏小窗口出现视频共享画面时，点击最大化，这个小窗口会消失；当最小化时，
这个小窗口就会出现。这就是这种常见的逻辑」。就是播放器全屏时控制条让位那条通用规则。

- **判定只在 `OfficeDesktop/fullscreen.cjs` 的 `hidesDock(window)` 里**：
  `isWindowFullscreen(window) || window.isMaximized() === true`。`main.cjs` 把它交给
  `createDockWindow` 的 `systemHidden`，`dock-window.place()` 的 `system` 那一路负责真的藏/显示。
  - **为什么以前漏了最大化**：旧的 `systemHidden` 只看原生整屏，而"在软件窗口里最大化看共享
    画面"窗口只是最大化、没进整屏，`isWindowFullscreen` 返回 false —— 条子照旧挂在画面右下角上。
  - **最小化绝不算藏**：窗口缩下去时屏幕上没有画面要遮，条子应该正常出现（用户那句话的另一半）。
    别把这条改成"只要窗口不是普通大小就藏"，那会把最小化也算进去，条子跟着窗口一起消失。
  - `dock-z-order.cjs` 的 `foregroundFullscreen()` 管的是**别的应用**整屏（它是"条子该不该让位"
    的另一个来源），两者互不代替：最大化过的办公室窗口并不铺满整个显示器，那条路认不出来。
- **窗口状态一变就重贴一次**（`main.cjs` 监听 `enter-full-screen`/`leave-full-screen`/`maximize`/
  `unmaximize`/`minimize`/`restore` → `dockWindow.place()`）：藏/显示仍然只由 `place()` 里那个
  现算的 getter 决定，事件只负责**及时**。少一个事件就会出现"要等 1.5 秒心跳才回来"的延迟；
  事件漏一次也不会永久藏着（同 2026-09-22 的教训）。
- **顺手修掉一个真 bug**：`setWindowFullscreen(window, false)` 让 Windows 按"上一次的摆放"
  恢复窗口，对无边框透明窗口来说那一位常常是普通大小 —— 一个最大化着看视频的人，退出整屏后
  会得到一个缩小过的窗口。现在进整屏时把 `isMaximized()` 记进 `WAS_MAXIMIZED`，退出时还原。
  **本来就是普通大小进来的不许被最大化**（那就成了另一个 bug），`fullscreen.test.cjs` 两向都断言。
- 测试：`node --test test/fullscreen.test.cjs`（`hidesDock` 四态 + 还原最大化两向）、
  `test/dock-hide-reasons.test.cjs`（最大化藏、还原回来；四个理由互不覆盖；以及"`systemHidden`
  必须用 `hidesDock`、六个窗口事件一个都不能少"的源码断言）。
  **没做真机验收**：真实的"点最大化 → 条子消失 / 最小化 → 回来"要用户在自己机器上看一眼。
- 拆文件：`dock-window.test.cjs` 因为这一批涨到 528 行、超了 500 行上限，把"什么时候藏/显示"
  那一簇搬进 `test/dock-hide-reasons.test.cjs`，假窗口与 harness 抽到 `test/dock-harness.cjs`
  给两个文件共用（`test/*.test.cjs` 之外的文件不会被当成用例跑）。

## 「看屏幕」那块浮层：只剩全屏 + 信号条（2026-10-15 用户要求）

用户原话：「需要新加一个信号条，在观看队友全屏的时候，在视频播放的"返回头像条"按钮的右侧。
另外把最大化去掉，现在只用全屏就可以了」。

- **"最大化"那一档整体删除**（不是只在某一处隐藏）：`ScreenStage` 的 `initialMode:
  'maximized' | 'fullscreen'` 换成 `initialFullscreen?: boolean`，`maximized` 状态、控制条上
  那个「最大化 / 还原窗口」按钮、`ScreenViewControls` 的 `onMaximize`、以及
  `screen-stage.css` 里所有 `.screen-stage.maximized` 规则全部删掉。`enlarged` 现在就是
  `fullscreen`。
  - 任务栏气泡上的「看屏幕」与「全屏」**开的是同一个全屏浮层**：`useDockMeetings` 的
    `onView(id)` 不再带 `fullscreen` 参数，两种命令都走它；`App.tsx` 的 `meetingView` 只存 id。
  - **受影响的不只是任务栏**：会议面板与私聊里的共享画面也少了一个"窗口内占满"的档，
    放大只能靠全屏（`F11`/「全屏」按钮）。这是用户明确要的取舍，别再给某一处偷偷加回来。
- **信号条挂在「返回头像条」右侧**（`MeetingScreenViewer` 的 `actions` 里按顺序渲染，
  所以顺序就是左右顺序）。数据是 `office.signal`（`useMeetingSignal` → `signalWatch`），
  **只有主窗口有**（小窗不连 socket），所以是从主窗口传进这块画面的。没数据时显示
  「信号检测中…」，不假装有数字。
  - 会议面板里那套 `.signal-bars-panel` 是**浅底卡片**，直接塞进深色控制条会变成一块白牌子；
    `screen-stage.css` 里压成同一行（透明底、无外边距、左侧一条分隔线、文字跟随控制条颜色）。
- **一个必须记住的坑（全屏请求会被节点挪动作废）**：从小窗那一档点「全屏」时，`enlarged`
  一变，stage 会被 `createPortal` 挪到 `document.body` 下 —— 节点被摘掉再插回去。
  **在挪动之前请求全屏，浏览器会先接受、随后立刻撤销**（实测 `requestFullscreen()` resolve、
  `document.fullscreenElement` 先是 stage 再变 null，而且**一个错都不报**），现象就是
  "点了全屏没反应"。所以 `toggleFullscreen` 的浏览器分支是**先 `setFullscreen(true)` 提交状态，
  再等重挂完成（两帧 + 一帧余量）用 `host.current` 重新拿节点请求**。
  `initialFullscreen` 那条 effect 同理（等一帧）。桌面端不受影响：它走原生整屏。
- 回归：`node --test test/meeting-viewer-signal.test.mjs`（信号条在返回按钮右边、看屏幕与全屏
  同一个浮层、`ScreenStage`/样式/控件里都没有"最大化"了）+ `node test/browser/meeting-viewer-signal.cjs`
  （真几何：`panel.left >= back.right`、同一行、三格与摘要都画出来、透明底；
  截图 `Build/viewer-signal-bars.png`）+ `node test/browser/screen-stage.cjs`
  （小窗只剩「全屏」一个按钮；断言里明确写了不该再有「最大化 / 还原窗口」）。
