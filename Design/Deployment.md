## 2026-10-16 客户端 0.1.54 与 GitHub 简介精简

- 按用户要求发布 0.1.54；GitHub 仓库 About 简介、根 README 和本次更新说明均改为「测试」。
- 本轮只改版本及介绍，功能沿用 0.1.53 的共享屏幕绿框与换屏修复；依赖不变。
- 桌面测试 190/190，前端类型检查、构建、90 项公共资源检查通过；线上 16 个文件与本地一致，11 项 HTTP 抽验通过。
- 安装器：`iruler-dream-Setup-0.1.54-x64.exe`，101732424 字节；SHA256
  `c629c9aa7f2ea2a25851748292168c2fe8540e72c0694abc8b9668592987ed33`。
- `publish:update --notes "测试" --verify full` 已通过整包核验，线上更新清单为 0.1.54。
- 原有未提交工作继续保留；未上传后端、重启服务或操作用户已安装客户端。真机多屏边框验收范围沿用上一版记录。

## 2026-10-16 共享绿色边框：前端 + 客户端 0.1.53 已发布

- 分享者当前真正共享的屏幕边缘显示 3 DIP 绿色细框，鼠标完全穿透；成功换屏才更新对应
  发布轨的提示，停止/挂断/退出/重载清除。另修复会议首次换屏时清理旧包装器误停新视频轨。
  细节见 [Screen-Share-Border-20261016.md](Screen-Share-Border-20261016.md)。
- 前端：`node Build/deploy-web.cjs --upload --verify` 上传 `index.html` 与
  `assets/main-iUMpqR4m.js`，16 个文件逐项哈希一致，11 项公网 HTTP 200 抽验通过。
  构建包含当前工作区已有的会议质量改动；这些原有修改继续保留在未提交范围，没有混入本次提交。
- 安装器：`iruler-dream-Setup-0.1.53-x64.exe`，101733510 字节，SHA256
  `88c89ba1a390851dc3a5e2f2919ad71683a476820f0dde29385d14ec3c1735c1`。
  `publish:update --verify full` 整包大小与哈希核验通过，远端 `latest.json` 为 0.1.53。
  第一次上传在构建结束前被执行，因安装器尚未生成而退出，未发布文件；构建完成后重试成功。
- 验证：网页 470/470、桌面 190/190、类型检查、构建与 90 项资源一致性通过；
  本地源码的隔离 Electron 离屏截图确认绿色细框、透明中央。测试进程已退出。
- 没有改后端协议、上传后端或重启服务；没有操作已安装客户端、测试机或拨打同事电话。
- **使用需要安装 0.1.53 并重启客户端。** 实体双屏、系统缩放、其他软件全屏时的物理观感，
  以及接收端不含边框仍需用户真机验收。

## 2026-10-15 「看屏幕」浮层加信号条 + 去掉最大化（前端已上线）

用户：「需要新加一个信号条，在观看队友全屏的时候，在视频播放的"返回头像条"按钮的右侧。
另外把最大化去掉，现在只用全屏就可以了」。

- **信号条**：`MeetingScreenViewer` 的 `actions` 里排在「返回头像条」之后（也就是它右边），
  数据来自 `office.signal`（主窗口的 `useMeetingSignal`；小窗不连 socket 所以拿不到）。
  会议面板那套浅底卡片样式在深色控制条里压成一行（透明底 + 分隔线）。
- **"最大化"那一档整体删除**：`ScreenStage` 的 `initialMode` 换成 `initialFullscreen`，
  `maximized` 状态 / 按钮 / `ScreenViewControls.onMaximize` / `screen-stage.css` 里所有
  `.screen-stage.maximized` 规则全部删掉；「看屏幕」与「全屏」现在开同一个全屏浮层。
  **注意这个取舍也影响会议面板与私聊**：共享画面放大只剩全屏（用户明确要求）。
- **修掉一个真 bug**：从小窗点「全屏」时，stage 会被 `createPortal` 挪到 `body` 下，节点一被
  挪走浏览器就把刚进的全屏撤掉（`requestFullscreen` resolve、`fullscreenElement` 随后变 null，
  且不报错）—— 现象就是"点了全屏没反应"。改成先提交状态、等重挂完成再请求。
- 部署：`node Build/deploy-web.cjs --upload --verify` 上传 8 个文件（两个入口 + assets），
  上传后复验"本地与远端逐文件一致"，7 个入口资源逐个 SHA256 与本地一致。
  **前端本次还带上了同一工作区里另一个会话的改动**（会议掉线/信号那批的 `main` 包），
  因为构建是本工作区的整体状态 —— 已在提交里注明，没有把它们混进我的提交。
- **本轮不动客户端**：改动全在前端（`ScreenStage` 等），刷新页面即可；客户端仍是 0.1.52。
- 验证：网页 **463/463**（新增 `meeting-viewer-signal.test.mjs` 3 项）、tsc 通过、构建与
  90 项资源一致性通过、`node test/browser/meeting-viewer-signal.cjs`（截图
  `Build/viewer-signal-bars.png`）与 `node test/browser/screen-stage.cjs` 通过。

## 2026-10-15 发布：前端 + 客户端 0.1.51（已上线并核验）

用户要求把这两件做出来并上线：①标记改颜色；②「麦克风图标里面会根据音量的大小来填充颜色的
高度，就像腾讯会议那样的功能」。

- **前端已发布**（`Build/deploy-web.cjs --upload --verify`）：上传 `dock.html` 与
  `assets/dock-CM40Bf5O.js` / `assets/dock-CBM-PR9z.css` 共 3 个文件，上传后复验"本地与远端
  逐文件一致"，11 项公网 200 抽样通过。主入口 `main-DrYJZw55.js` 上传前就与本地一致，未重传。
- **麦克风改成填充式**：新增 `src/DockMicFill.tsx`（**删掉了旧的 `DockMicWave.tsx`** 那圈外描边），
  液面满高 + `scaleY(level)` 从底部涨、图标压在填充上面。线上 dock 包已含 `dock-mic-fill`，
  **旧类名 `dock-mic-wave` 在线上包里已搜不到**。
- **客户端 0.1.51 已发布**：`iruler-dream-Setup-0.1.51-x64.exe`，101731019 字节，
  SHA256 `3d1aec51b7e780b82bf828e36e6bbf34fae1422f8bb283885fb9cc69444cbdff`；
  `publish:update --verify full` 整包核验通过，`latest.json` 已是 0.1.51。
  打包前后都核过 ASAR：版本 0.1.51、`annotation-overlay.js` 与 `fullscreen.cjs`/`main.cjs`
  **与工作区源码逐字节一致**，署名名牌已删、认识观众颜色、`hidesDock` 在。
- 这一版带上客户端侧的四项（此前只在源码里、装 0.1.50 的人看不到）：
  **①每一笔不再署名；②分享者屏幕上按观众挑的颜色画；③分享者的共享预览有「清屏」；
  ④看视频时头像条让位（最大化/整屏自动隐藏，最小化/还原回来）。**
- 备份：`officeweb/backups/dock-mic-fill-0.1.51/latest.json`（发布前的 0.1.50 清单）。
- 验证：网页全量 **458/458**、桌面 **180/180**；`node test/browser/dock-meeting-controls.cjs`
  量到液面 0 / 7.6px / 17px（铺满按钮可用高度）且贴底、铺满宽度、被裁切、在图标后面；
  6 倍放大观感图 `Build/dock-mic-fill-zoom.png`。
- **待人工验收**：真实通话里开麦说话看液面跟不跟手、静音是否立刻归零；
  以及"点最大化 → 头像条消失 / 最小化 → 回来"的真机行为（自动化只覆盖判定与接线）。

## 2026-10-14 看视频时头像条让位（未发布）

- 用户：「当状态栏小窗口出现视频共享画面时，点击最大化，这个小窗口会消失；当最小化时，这个小
  窗口就会出现」。`fullscreen.cjs` 新增 `hidesDock(window)` = 整屏 **或** 最大化；`main.cjs` 的
  `systemHidden` 改用它，并监听 `maximize`/`unmaximize`/`minimize`/`restore`（原来只有整屏进出）
  立刻重贴一次。**最小化不算藏** —— 窗口缩下去时没有画面要遮，条子该正常出现。
- 顺手修掉一个真 bug：退出整屏时 `setFullScreen(false)` 会把"最大化着看视频"的窗口缩回旧摆放；
  现在进整屏前记住是否最大化、退出时还原。
- 桌面单测 **180/180**（`fullscreen.test.cjs` 8 项 + 新拆的 `dock-hide-reasons.test.cjs`）。
  `dock-window.test.cjs` 涨到 528 行超了 500 行上限，已把"藏/显示理由"那一簇拆出去、假窗口抽到
  `test/dock-harness.cjs`。**未做真机验收**：物理窗口的"点最大化就消失"要用户在自己机器上看。
- **本轮不发布**：没上传资源、没重启服务、没打包安装包（这条改动在 `main.cjs`，要装新版客户端
  才生效）。正式站仍是 main-H0W6dS6h.js / dock-B12xwDLd.js，客户端仍是 0.1.50。

## 2026-10-14 标注四改与静音波纹（未发布）

- 用户四条：分享者清屏按钮、状态栏静音按钮的声音波纹、观众可改笔色、去掉每一笔的署名。
  实现与踩坑见 [Annotation-Audio-20261014.md](Annotation-Audio-20261014.md)。
- 新增 `src/inkColors.ts`、`src/InkPicker.tsx`、`src/micLevel.ts`、`src/useMicLevel.ts`、
  `src/mediaVoice.ts`、`src/DockMicWave.tsx`；`media.ts` 拆出语音状态判定（500 行上限），
  `useOffice` 交出 `boardScope` 与 `activeMic`。
- 验证：网页单测 **435/435**、桌面 **176/176**、真浏览器 `screen-stage.cjs`（改笔色 + 分享者
  清屏）与 `dock-meeting-controls.cjs`（波纹三档）通过；`npm run build` 通过，`public/` 与
  构建产物 90 个文件一致。
- **顺带修掉三条早就红了的过期断言**（`dock-session-end`、`dock-rules` ×2、`file-transfer-rules`）：
  先用 `git stash` 对基线确认"不是本轮改坏的"，再按当前实现更新期望值。**网页全量从
  "418/420" 变成 435/435。**
- `OfficeWeb/AGENTS.md` 已经 516 行、违反 500 行规则：把**任务栏头像条**与**文件直传**两段
  整体搬进新增的 `OfficeWeb/AGENTS-dock.md`（条目一条没删，逐条核对仍在），现在
  `AGENTS.md` 494 行 / `AGENTS-dock.md` 223 行。
- 兼容性：服务端**一行未改**（`color` / `stroke` 都是可选字段，只原样转发）；老页面/老客户端
  照旧按人固定色画、撤销退回"最后一条"。浮层那份颜色表随安装包走，**要让别人在自己屏幕上
  看到你选的颜色，分享者需装下一版客户端**。
- **本轮不发布**：没有上传任何资源、没有重启服务、没有打包新的安装包。正式站仍是
  main-H0W6dS6h.js / dock-B12xwDLd.js，客户端仍是 **0.1.50**（`latest.json` 的哈希未变）。

## 2026-10-14 源码入库（0.1.14 之后一直没提交的那批）

- 起因：正式站与 0.1.50 安装包都已上线，但仓库落后。本地 main 领先 origin/main 3 个提交，另有 62 个改动文件 + 107 个未跟踪文件；`presence-status.mjs`、`cinema-content.mjs`、`BuildCinema.tsx`、`DockMeetingPanel.tsx`、`dock-pointer.cjs` 等**正在线上跑的模块在 HEAD 里根本不存在**——换机器 clone 拉不到能还原线上那一版的代码。
- 阻塞原因：`.git/index.lock` 是 2026-10-11 10:52 崩溃留下的 0 字节陈旧锁，`git add` 一律 `fatal: Unable to create index.lock`（退出码 128）。确认无 git 进程持有后删除，index 先备份。
- 处理：169 个文件一次性提交 `56fe36b`（+6897/−729），push `22fead9..56fe36b`，本地与远端 HEAD 一致；工作区干净，无残留锁。
- 推前扫描：无 >5MB 单文件、无私钥 / 明文密钥字面量、运行数据仍被 `.gitignore` 挡住（169 文件共 1.65MB）。
- 换机核验：全新 `git clone` 后 HEAD = `56fe36b`、1439 个文件、关键模块与 SETUP.md 均在；临时克隆已清理。
- **本轮不重新发布**：正式站仍是 main-H0W6dS6h.js / dock-B12xwDLd.js（与本地构建 SHA256 一致），客户端仍是 0.1.50，未改后端与正式数据。

## 2026-10-14 私人来电角色与状态栏通话按钮

- 私人邀请纳入缓存状态，三种来电持续显示发起人招手与头顶接听；悬停、晚到事件和旧初始快照不再覆盖来电。私人会话补齐与会议一致的共享文字按钮和红斜线静音图标，共享时保留控制条。
- 网页专项 28 项、私人信令 4 项、桌面 173 项、构建 / 90 项资产检查通过；本地构建及正式资源浏览器回归、源码和 ASAR 的 Windows 隔离原生按钮回归通过。未拨同事或宣称真实双机验收。
- 发布 main-H0W6dS6h.js、dock-B12xwDLd.js 及依赖和两个入口，10 项公网哈希一致。备份 officeweb/backups/dock-private-20261014/，后端和正式数据未变。
- 0.1.50 安装器 101728277 字节，SHA256 17b3869197d2ba7311ca7bfd86a8f04d386def127e5c0604c1fc9e87ddd7e742；公网整包和更新清单核验通过。两端需安装新版并重启，未自动升级用户客户端。详情：[Dock-Private-Calls-20261014.md](Dock-Private-Calls-20261014.md)。

## 2026-10-14 头像按钮拨错人

- 复现旧头像焦点在浮窗重新激活时恢复，80ms 后改写 hovered，复用按钮在 click 时读取最新悬停 ID 导致甲的操作拨给乙。原生双测试窗口旧构建实际出现 `[call,p2]`，新构建保持 `[call,p1]`。
- 将焦点恢复与明确 Tab 导航分开；按钮绑定卡片成员 ID，卡片按 ID 独立挂载，关闭时清理悬停定时器。浏览器覆盖焦点 / 重排 / 离线 / 按住时换卡片 / 键盘；三隔离客户端 18 次交替邀请均只到指定目标。专项 27 项、桌面 171 项、构建 / 90 项资源一致性、原生焦点与按钮回归通过。
- 发布 dock-sC9DLmLb.js、依赖和 dock.html，共 7 项公网 SHA256 一致；正式资源普通刷新后目标身份与右侧布局回归通过。旧入口备份 officeweb/backups/dock-target-20261014/。主入口、后端、正式数据和 0.1.49 安装器清单未变。
- 已安装 0.1.49 的客户端彻底退出再打开加载修复，无需新安装包；未操作用户同事的来电。详情：[Dock-Target-Identity-20261014.md](Dock-Target-Identity-20261014.md)。

## 2026-10-14 头像浮窗吞掉按钮点击

- 用户停留鼠标时的只读诊断确认命中正确浮窗、穿透关闭；生产窗口的 focusable:false 在当前 Windows / Electron 返回 WM_MOUSEACTIVATE=4 并吞掉点击。改为 true，继续使用 showInactive / NOACTIVATE 保证悬停不抢焦点。私聊 share 同时补齐既有一次性捕获点击意图。
- 桌面全量 171/171、网页专项 24/24、浏览器悬停 / 右侧布局 / 命令、构建与 90 项公共资产一致性通过。原生用例修复前失败，修复后源码与 ASAR 的成员 / 游客 × 三按钮均返回 1 且命令恰好一次；六个相关 ASAR 模块与源码逐字节一致。
- 客户端 0.1.49 已发布：iruler-dream-Setup-0.1.49-x64.exe，101728705 字节，SHA256 fb5ca9e50b24062bc13e47fce51985e938134e7b9701bfdb2d9e066552375d4a。公网整包与 latest.json 核验通过，旧清单备份 officeweb/backups/dock-input-0.1.49/latest.json。需要安装新版并重新启动，刷新网页不足以生效。
- 游客和无座位成员双向三种邀请隔离验证通过；未拨打同事、触发实际采集或自动接听。物理点击与真实双机通话由用户复验。本轮未发布网页、后端、正式存档，未自动升级用户客户端，也未提交其他未完成工作。详情：[Dock-Input-20261014.md](Dock-Input-20261014.md)。

## 2026-10-14 头像条任务栏层级与全屏避让

- 头像条改为紧邻任务栏并跟随其置顶 / 普通层级，移除 screen-saver 和无条件 moveTop。检测同屏前台全屏窗口时隐藏，退出后恢复，普通最大化仍显示；页面 / 手动隐藏不被覆盖。
- 桌面 170 项单测通过；源码及最终 ASAR 的隔离 Windows 原生验证各通过三轮全屏切换、全屏期间布局更新、最大化、退出恢复与焦点保持。ASAR 相关源码逐字节一致。当前 Windows 10 原生测试通过，具体外部播放器、Windows 11 / 物理多显示器待人工验收。
- 客户端 0.1.48 已发布：iruler-dream-Setup-0.1.48-x64.exe，101730399 字节，SHA256 a32b44a258de377373f731d662bc46aefca1bb4b633ec02824bd7e9e16b89bbf；公网整包校验与 latest.json 核验通过。必须安装更新，单纯刷新网页不能应用原生窗口修复。未自动关闭或升级用户客户端，测试窗口已清理。
- 未更新网页入口、后端与正式存档。详情：[Dock-Taskbar-Level-20261014.md](Dock-Taskbar-Level-20261014.md)。

## 2026-10-14 屏幕共享声音

- 私聊与会议新增独立共享音频；停止、切屏与接替同时清理声音，麦克风静音不影响共享音频。
- 正式主入口 main-BQwQvnnz.js 及依赖已发布，9 项公网资源哈希一致，普通刷新无页面异常。仅更新 livekit.mjs 后端并重启，active、哈希一致；旧入口/后端/清单备份 officeweb/backups/screen-audio-20261014/。保留 dock 入口，未改正式业务数据。
- 客户端 0.1.47 安装包已发布，101728757 字节，SHA256 535164749e3a3eed274f452ca19f6de615dd8ad04c638e73834a3776be6b5a54；公网整包校验、latest.json 和 ASAR 源码/版本核验通过。桌面共享声音需要安装新版。
- 34 项专项、166 项桌面全量通过，真实 SFU 两浏览器 10 项回归通过。Windows 原生实测外部声音保留、自身播放排除，避免回传通话声。网页全量 418/420，两项既有 dock 源码正则断言失败，未放宽断言。物理双机和其他 Windows/声卡人工验收尚未完成。
- 详情与证据见 [Screen-Audio-20261014.md](Screen-Audio-20261014.md)。

## 2026-10-14 恢复预览右侧按钮

- 按用户最新要求，看屏幕 / 分享屏幕 / 语音通话恢复到缩略图右侧单列。显式固定预览与按钮在同一网格行，状态文字占下方整行，避免有状态时按钮被自动排到下一行。预览保留 16:9 和完整内容高度测量。
- 构建、90 项公共资源一致性检查、本地与正式资源悬停回归通过：三成员 × 横屏 / 竖屏 / 方形已解码图片均为 16:9、按钮在右侧且不重叠；长状态及小视口高度测量稳定，三个按钮命令正确。正式资源会议按钮回归通过，截图检查完整。
- 发布 dock-TA1rmLYR.js / dock-B53nM43f.css 及构建资源，仅替换 dock.html 入口，未替换主页面入口。9 项公网 SHA256 与本地一致，入口备份 officeweb/backups/hover-right-actions-20261014/。无后端或原生安装器变更；真实 Elsa 客户端未操作。

## 2026-10-14 状态卡片完整测量与 16:9 预览

- 修正上一轮预览固定 96px 高造成的过宽容器，改成 aspect-ratio:16/9、height:auto，原图继续 object-fit:contain，不拉伸。按钮继续在预览和状态文字下面横排。
- 状态文字会增加卡片内容高度。dock-popup-stack 受当前视口 max-height 限制，旧 measure 只读被裁剪的 getBoundingClientRect 高度，再加 18px 请求原生高度，可能按每轮 6px 逐步增长。改成 max(scrollHeight,bounds.height) 后一次申请完整内容空间，不依赖当前窗口能否完整容纳。不是发现状态数据的无限循环，而是尺寸反馈。
- 浏览器覆盖三成员 × 横屏 / 竖屏 / 方形图片（真实解码后核对尺寸），预览容器均 16:9、按钮同一横排。250px 高窗口 + 长状态文字可复现内容被裁剪，断言一次报告 cardPx 已包含完整 scrollHeight，稳定 600ms 布局上报不增长，并按申请高度扩窗后检查状态与按钮完整可见。本地及正式资源回归通过，会议按钮回归通过。
- 构建与 90 项公共资源校验通过，发布 dock-C7mqNYbK.js / dock-xNsw3Q0w.css 及依赖，10 项公网文件 SHA256 一致；入口备份 officeweb/backups/hover-status-ratio-20261014/。无原生安装器、后端、正式存档变更，客户端 0.1.46 重新打开加载页面。Elsa 的物理窗口截图仍未读取成功，不宣称完成她现场的复验。

## 2026-10-14 头像悬停提速和横排按钮

- 头像悬停等待由 220ms 减到 80ms，卡片入场由 160ms 减到 90ms；看屏幕 / 分享屏幕 / 语音通话放到预览下方同一横排，统一三列等宽，避免旧的右侧单列纵向布局。预览高度 96px，保持普通卡片在原生基础预留空间内。
- 浏览器验证实际 hover 事件到卡片挂载小于 250ms（三按钮横排、不重叠、三个命令均正确），本地测量 108ms；会议按钮命中回归通过。构建与 90 项资源一致性检查通过。
- 已发布 dock--XoltP6c.js / dock-Ht7e09v5.css，10 项公网资源 SHA256 一致；旧入口备份 officeweb/backups/hover-layout-20261014/。无原生改动、后端改动或安装包版本变更，客户端仍为 0.1.46。远端屏幕预览帧到达时间由媒体来源决定，不能把卡片弹出速度当作远端预览时延验收。

## 2026-10-14 状态菜单无法操作补强

- 用户明确卡住的是头像旁的状态菜单。将整个 dock-status-menu 加入原生鼠标命中区域，覆盖菜单背景和全部按钮；定时重测仍保留，但相同完整布局不反复调用 IPC，失败后可重报。主窗口状态保存另加 8 秒超时，等待时仍可关闭 / 取消 / Esc，避免网络无响应将编辑器锁住。
- 浏览器状态回归通过，包括未返回的保存请求期间点击关闭、超时后恢复编辑和 Esc；会议按钮回归通过。隐藏 Electron 使用实际右键 / 左键输入验证菜单打开、右上角关闭、修改命令和清除命令，Windows 原生命中可交互，errors 为空。测试中一度因脚本提前 stop 清空命中区域失败，纠正夹具生命周期后通过，不能把这次夹具失败称为用户现场复现。用户现场卡住的直接触发条件尚未复现。
- 构建及 90 项公共资源一致性检查通过；已发布 main-B_y5D1AZ.js、dock-CizPcsGF.js 和依赖，10 项公网文件 SHA256 一致，入口备份 officeweb/backups/status-unfreeze-20261014/。无新的原生代码或安装包版本变更，客户端保持 0.1.46，重新打开加载页面即可。未改后端和正式存档。

## 2026-10-13 会议按钮命中与视频放大修复

- dock 命中监听保持单实例，布局回调读取最新 React 状态；增加滚动、原生窗口尺寸变化后的位置重测，避免频繁会议状态推送取消待执行测量。透明背景 / 装饰人物仍穿透，只接受可见交互区。
- 最大化播放视图再次调用现有 focusWindow 白名单命令，主进程 show / moveTop / focus；全屏放大视图 Portal 到 body，避免父面板 transform / filter / overflow 裁剪，只预留 4px 边缘。滚轮将画面缩放到 100%–400%，按钮大小和位置不随缩放改变；标注时恢复 100% 以保持坐标映射。切换内嵌 / 放大重新绑定视频，不停止会议共享源。
- 本地及正式资源会议按钮回归通过：8 轮折叠 / 展开、密集状态更新后逐轮核对分享屏幕 / 静音、开启麦克风 / 停止共享、离开 / 确认按钮中心在最新原生命中区域内，并验证每次点击发出的命令。隐藏原生 Electron 使用 sendInputEvent 真实鼠标按下 / 抬起，再验证 Windows 穿透已关闭以及新收到的分享 / 静音 / 最大化 / 全屏命令，清除前一轮命令避免旧记录误判。播放回归通过：最大化唤起命令、带 transform / filter 的裁剪祖先、全屏接近视口尺寸、滚轮缩放 / 恢复、控制条稳定、返回后视频重新播放；原有标注映射 / 回显 / 挂断退出全屏测试通过。
- 桌面单测 165 项通过；隔离隐藏 Electron 会议链验证实际 preload / IPC / Windows 穿透及会议结束命令，未操作用户正在运行的客户端。真实双机会议和物理桌面前台唤起尚未人工复验。
- 构建 / 90 项公共资产一致性检查通过。正式站发布 main-DYac7wEM.js / main-YFVIEAuZ.css、dock-cISO2pWQ.js / dock-CHlOHqlj.css 及依赖，共 10 项公网 SHA256 与本地一致；入口备份 officeweb/backups/meeting-view-20261013/，未改后端与正式场景存档。
- 客户端 0.1.46 安装包原生 focus 源码与本地一致，已发布安装器 iruler-dream-Setup-0.1.46-x64.exe（101727711 字节，SHA256 25120e73ba1e8765b1c0c0c2595c3c85c7191c4e2eb9448852fe3e9d40dd7bb5），公网整包下载哈希一致、latest.json 为 0.1.46；没有自动安装或关闭用户客户端。

## 2026-10-12 状态气泡关闭按钮位置

- 我的状态小菜单关闭按钮固定在右上角，预留顶部空间避免覆盖状态文字。状态交互浏览器回归、构建和 90 项资源校验通过。
- 仅替换正式 dock 入口引用的样式为 `dock-status-close-87df79c47b68.css`，保留已发布 JavaScript 和其他功能；公网文件逐字节验证一致，浏览器验证正式样式的右上角位置与关闭点击。旧入口备份 `officeweb/backups/status-close-20261012/`。

## 2026-10-12 影院窗口美化、修复裁剪并自动识别内容

- 窗口通过 body Portal 和固定遮罩显示，宽屏左右布局、窄屏上下布局，正文可滚动且关闭 / 保存区保持可见；去掉图片 / 视频类型选择，统一链接与文件入口，动态识别标签、预览和文案。弹窗高于客户端更新提示，并验证保存 / 关闭按钮的实际鼠标命中。
- 图片 / 视频无后缀地址通过实际解码探测识别，B站短链、抖音分享文案自动识别 / 提取链接；替换或关闭取消旧探测并释放资源。保存继续沿用影院现有契约，未改后端、安装包或正式场景内容。
- 5 项影院单测、构建与 90 项资源校验通过。本地及正式资源浏览器通过自动分类 / 保存、4 档视口边界、无横向裁剪、显示选项完整可访问，以及原有图片 / 视频 / 平台 / 多客户端流程；快捷键回归通过。
- 仅发布主入口 `main-BNyJZR6t.js` / `main-BdqC-3a7.css` 及所引用依赖，资源先于入口，6 项公网状态与 SHA256 一致。旧主入口备份 `officeweb/backups/cinema-ui-20261012/`。其他聊天的 dock 入口 / 资源变更未在本轮发布。

## 2026-10-12 影院屏幕支持图片、视频及显示方式

- 漫游点击影院屏幕可设置图片 / 视频、本地文件 / 地址、自适应 / 填充 / 拉伸。复用宝箱图片压缩、B站 / 抖音链接识别、短链接解析和官方播放器。平台视频显示封面并在官方播放器观看，本地视频直接映射到真实屏幕。
- 全量 414 项单测，最终受影响的 16 项后端 / 存档 / 撤销补充回归，构建和 90 项资源校验通过。本地与正式资源浏览器通过真实 MP4 帧、图片 fit、两客户端读取、离开视野暂停及平台播放器契约；不将隔离 iframe 内容称为真实平台播放验收。
- 服务端仅更新 `build-store.mjs` / `build-http.mjs`，新增 `cinema-content.mjs` / `cinema-media.mjs`，模块加载检查通过，`officeweb` active，四项源码 SHA256 一致。存档内容没有被直接修改；已备份旧代码及入口到 `officeweb/backups/cinema-screen-20261012/`。
- 前端入口 `main-Bo2MZmQk.js` / `main-BJsGnQqn.css`，资源先于入口上传，16 项远端文件一致，公网入口 / 资源 200 和 SHA256 一致。匿名影院查询 401。
- 图片上限 20 MB（与宝箱共用压缩），本地 MP4 / WebM 上限 100 MB、分片上传、Range 播放。契约、资源释放与上传文件回收见 `Design/Cinema-screen.md`。无需重装客户端，刷新生效。

## 2026-10-12 S 缩放 / R 旋转以部件中心为轴心

- 修复快捷键变换使用底部存储原点的问题。操作中心取选区真实包围盒中心，变换后补偿部件原点；支持不对称几何、已有缩放 / 翻转及 fixture。保留原有网格、90° 旋转和保存契约。
- 410 项单测、构建与 90 项公共资产检查通过；本地及正式资源浏览器均通过居中 S / R 预览、确认、撤销，以及原有多选、复制、取消、焦点和失败回退。
- 发布入口 `main-qHUmuChM.js`，先上传资源再切入口，16 项文件远端逐字节一致，公网入口与资源 200 / SHA256 一致。旧入口备份 `officeweb/backups/center-transform-20261012/`。
- 仅发布网页资源，后端、正式场景存档及安装包未改。浏览器回归隔离 API / Socket，没有正式场景写入。保留已有未提交工作。

## 2026-10-11 头像悬停闪动完整交付及会议小窗 UI

- 已发布安装器 `iruler-dream-Setup-0.1.43-x64.exe`，101726769 字节，SHA256 `a89e3f07d880ab1dc1dc1ffdd8b26652e095f9aa5cccd756e51ba71fe1eff6b0`。公网整包下载哈希一致，`download/latest.json` 已为 0.1.43；上一版清单与 dock 入口备份在 `officeweb/backups/dock-hover-0.1.43/`。
- 主进程预留基础预览空间，避免普通悬停开合时调整透明窗口尺寸。桌面端 163 项测试通过，隐藏原生窗口 10 轮开合验证位置稳定及 Win32 穿透样式，asar 内源码一致，打包客户端烟雾测试成功加载正式站。
- 会议小窗成员列表无滚动条，人数增加自动换行；静音麦克风只有图标并叠红色斜线，共享屏幕保留文字。发布 `dock.html` → `dock-BRf9LKq7.js` / `dock-Cw0sHyEo.css` 及依赖，7 项公网文件哈希一致。未改主页面 index、后端或正式场景存档。
- 本地及生产资源浏览器均验证 6 / 12 / 24 人换行无滚动、麦克风两态和共享命令；会议真实编码视频播放与清理回归通过，构建及 90 项公共资产校验通过。
- 前端全量并发测试首轮 407 / 408，会议回会测试一次失败；该项隔离复跑通过，随后串行全量 408 / 408 通过。未改后端或放宽断言。
- 原生修复需安装 0.1.43；尚未在用户物理桌面复录合成结果，不能以隐藏窗口测试代替用户真机视觉确认。详见 `Design/Dock-hover-flicker.md`。保留其他聊天的未提交工作。

## 2026-10-11 选中物体旁的更改颜色按钮

- Tab 移动模式选中后，在坐标轴右上方显示当前配色小圆按钮和“更改颜色”；点击选色，支持多选、撤销和保存失败回退。
- 406 项单测、构建及 90 项公共资产校验通过；本地与正式资源 `build-modal.cjs` 均验证按钮位置、改色、撤销、多选、失败回退及原有变换流程。
- 只更新 `index.html`、`main-GSp6YtP3.js`、`main-CFQrgHmm.css`；16 项审计文件一致，公网入口与资源 200、SHA256 一致。
- 旧入口备份 `officeweb/backups/selected-color-20261011/index.html`。后端、正式存档及安装包未改；浏览器测试隔离 API / Socket，无正式场景写入。源码未提交或推送。

## 2026-10-11 地板穿透与反复下落修复

- 复现：真实初始地板上方的椅面挡住身体净空，旧重力查询错误地忽略脚下地板。分离重力承托与通行净空，保留墙体 / 家具阻挡。
- 406 项单测、构建、90 项资产校验通过；本地及正式资源浏览器均通过站在地板 / 椅面重叠处不掉落、走出边缘、落下层、死亡复活。
- 只发布 `assets/main-xSWTWxGC.js` 与 `index.html`；16 项文件审计一致，公网入口与资源 200、SHA256 一致。旧入口备份 `officeweb/backups/floor-support-20261011/index.html`。
- 正式资源验证隔离 API / Socket；后端、正式场景存档与安装包未修改。详见 `Design/Floor-support-fix.md`。源码未提交或推送。

## 2026-10-11 建造工具栏移除与 Tab 模式切换

- 用户反馈仍看到旧 UI；核实正式入口仍引用 `main-DsKk5E4N.js`。旧入口备份到 `officeweb/backups/tab-toolbar-20261011/index.html`。
- 先上传已验证的 `assets/main-D-Ccy0Y8.js`，再更新 `index.html`；只改这两个前端文件，后端、场景存档及安装包未修改。
- `deploy-web.cjs --upload --verify`：16 个文件全部一致，两个入口及引用资源公网 200 且 SHA256 一致。
- 正式资源浏览器验证通过：无建造工具栏、Tab 切换、漫游禁止选中 / 复制、两模式 Shift+A、创建与取消、输入焦点。测试内隔离 API / Socket，无正式场景写入。
- 完整 404 项单测及构建通过。详见 `Design/Blender-build-shortcuts.md`；源码未提交或推送。

## 2026-10-09 掉落机制：走出边缘会掉、掉到下层站住、掉过最低部件宣布死亡并原地复活

用户：「添加掉落机制，可以走下去掉落到最低的部件组合之下就宣布死亡，然后再掉落前的位置，也就是可以跳到下一层建筑上原地复活」。

- **以前**：走出边缘被当成"撞住不动"（`buildTraverse` 找不到支撑就回 null），所以想从平台上下来只能绕着走或者用传送点。
- **现在**：①`buildNavigation` 新增 `supportBelow`（从某个高度往下、这里最高的一层地——`supportHeight` 的 ±0.255 窗口是给抬腿用的，下落一帧能掉几米，拿它问会穿过楼板）、`blocksBody`、`buildClearPath`、`buildStepOff`，并在 `setBuildSolids()` 里顺便算好 `lowestSolidBottom()`；②`avatarWalk.walkStep` 在 `traverse` 失败后再问一次 `stepOff`——能踏空就返回 `{falling:true}`（位置已挪到边缘外，高度不变），撞墙才真的不动；③新文件 `src/avatarFall.ts` 的 `FallRig` 管重力（18m/s²、终端 28m/s）、落地（`supportBelow`，用上一帧的 y 当上界）、判死（**全世界最低那一件的底面再往下 0.5m**）、复活（回**掉落前站的位置**，站不住就在 2m 内就近找一个支撑）、复活后 0.9s 不许走动；空中可以横向控制，能往下一层平台上飘；④新文件 `FallToast.tsx` + `src/fall.css` 在画面上方**宣布死亡**（「你掉下去了 / 已在掉落前的位置复活 · 落差 N m」），2.6s 自己消失。
- **产物**：`npm run build`（`public-parity` 90 个文件一致）→ `node Build/deploy-web.cjs --upload --verify`。**这一轮没有上传动作**：逐文件审计显示远端已与本地构建**逐字节一致**（并行的另一个会话在提交后发布过，构建树里已经包含这份改动），公网 `index.html` + `assets/main-DATeyWq7.js`（859,853 字节）/`main-xWPLr2SU.css` 全部 200 且 SHA256 与本地相同。**纯前端，后端未改、没有重启 `officeweb`**（`build-catalog.json` 审计一致）。
- **验证**：`node --test test/avatar-fall.test.mjs`（8 项：判死线/踏空与撞墙/落到下层顶面且速度归零/掉过最低部件即死/复活点含就近救援/状态机的落地·死亡·保护期/空中控制与撞墙/梯子里不算踏空）+ 全量 **392 项**单测 + `tsc --noEmit` 全绿；真浏览器 `node test/browser/build-fall.cjs`（自建 6.25 高台 + 3.25 下层：走出边缘 → 下落 → 正好落在 3.25 且 deaths=0；再走出下层边缘 → deaths=1 → **回到掉落前的位置 (100, 3.25, 5.985)** + 死亡卡片文案，截图 `Build/build-fall.png`）；回归 `build-ladder-climb`/`build-experience`/`editable-scene`/`no-spin`/`box-expansion-check` 全过。
- **上线核验（正式站）**：`node test/browser/build-fall-live.cjs` PASS —— 验收账号在 **PLOT=(64,64)**（开跑前量过半径 14m 内 0 件）放两块平台，真键盘走出边缘落到下层、再走出边缘掉 **12.0m** 触发死亡（判死线 = 正式世界最低件 −8.25 再往下 0.5 = **−8.75**）并在掉落前的位置复活；收尾删掉自己那两件，**正式世界回到 233 件**（基线一致，别人的件一件没动）。截图 `Build/build-fall-live.png`（画面上方就是那张死亡卡片）。**接口节流坑**：`/api/build` 每账号写接口 120ms 起步，连发两次 `add` 第二次回「操作太快，请稍候」——验收用例两次写入之间必须 `await sleep(500)`。

## 2026-10-09 摞起来的直梯不能自动寻路：柱体要"并成一根"

用户：「把直梯摞得很高之后，怎么不能自动寻路了」。

- **先量正式存档**：他摞了 **5 根**在 x=−3.5 / z=−22.5，y = −8 / −4.25 / −0.5 / 3.25 / 7（正好每 3.75m 一根）。
- **真因不是高度上限，是"只认第一根"**：`climbSpanAt(x,z)` 返回命中 `(x,z)` 的**第一根**梯子且**不看高度** → A\* 在接缝处往上的边是 `y = min(n.y+STEP, span.max.y)`，被最下面那根的 3.75 夹回来、`|y−n.y|<1e-3` 直接跳过，**永远上不去**；手动爬同理：接缝处 `y` 已等于下面那根的顶，`climbStep` 当成"到顶了"改成朝相机踏出去，人卡在接缝。
- **改法**：`buildNavigation` 新增 `mergeClimbs()`，`setBuildClimbs()` 把 **(x,z) 投影重叠 + 竖直相接（≤`STEP_HEIGHT`）** 的柱体并成一根（y 取并集、x/z 取交集），每段法线记进 `segments`，`climbFacing()` 按人所在那段取朝向。接缝从此只是长梯子中间的一格，底/顶是整根的两端。
- **产物**：`npm run build` → `deploy-web.cjs --upload --verify`，正式站入口 **`assets/main-DATeyWq7.js`**（845.10 kB）+ `main-xWPLr2SU.css`，公网 200 + 哈希一致。**只发前端**（后端未动）。
- **验证**：`node --test test/build-ladder.test.mjs` 新增两条——两根（接缝处连按 W/S 都能越过 3.75 继续上下 + 寻路到 7.5）、**五根（照正式世界的真实坐标）**：`climbAt` 顶=10.75/底=−8、一路按 W 爬到 10.75、`buildPath` 从 −8 到 10.75 **86 个路径点**；单测全量 **393 项**全绿；真浏览器 `build-ladder-climb.cjs`、正式站 `build-parts-live.cjs` 全 PASS。



## 2026-10-09 移动模式多选后也能旋转和缩放（Blender 的 median pivot 语义）

用户：「请移动工具下在多选之后也可以旋转和缩放」。

- **以前为什么不行**：`buildMoveHandle.selectRows()` 在多选时把 rotate/resize 两个手柄 `detach()` 并 `enabled=false` 了，`settings()` 也在多选时直接 `return`——多选只剩平移。
- **现在**：三个手柄都挂上，`posed(part)` 是唯一算法（预览、`moveMany` 存档、键盘 Q/R/X/Z 都调它）。整组绕**这一组的中心**（`groupCenter()`，取到格点）转 yaw、按同一组因子摊开缩放；**只有 yaw 会转位置**（绕组中心转 90° 是刚性变换，位置仍是 0.25 整数倍、高度不变，不变量不受影响），翻面按件原地；缩放时间距一起放大、每件尺寸按同一因子取整到 0.25。顺带解开：多选也能整组改颜色。
- **两个坑（都写进 AGENTS.md）**：①拖过头越过手柄原点时 TransformControls 给**负**因子 → 会镜像整组而尺寸不能为负 → 取 `Math.abs` + 25% 下限（浏览器用例第一次跑就踩到）；②变换落进存档后必须 `resetGroupTransform()`，否则 `save()` 收尾的 `draw()` 会再乘一次。
- **产物**：`npm run build` → `deploy-web.cjs --upload --verify`，正式站入口 **`assets/main-a8DVwXAe.js`**（840.20 kB，公网 200 + 哈希一致；线上 bundle 里查得到「整体绕中心旋转 / 整组缩放」）。**只发前端**：后端在上一轮已经是 `eadcd00…`，本次没改。
- **验证**：新增 `node test/browser/build-group-transform.cjs` PASS —— Shift 多选两根立柱 → 三个手柄都抓得到 → 拖旋转环（两件朝向一致、绕中心 82 刚性旋转、间距 4→4、仍在格上、高度不变）→ 拖缩放方头（因子从松手前的 `userData.group.scale` 读，位置因子 0.25 时间距 4→1、两件尺寸同因子取整到 0.5、仍在格上）→ 两次 Ctrl+Z 还原；回归 `build-experience`/`build-copy-teleport`/`editable-scene`/`build-gizmo` 全 PASS；全量 **383 项**单测不受影响。



## 2026-10-09 两个拱门「对不齐」的真正原因：高度的步长是从各自原点算的 → 结构件三轴落格

用户：「我有两个拱门 差距一直都是一个小缝 对不齐」。

- **先量**：拉正式存档看那两个拱门——`arch` y=**−4.605** 与 y=**−4.564**，x 差 0.5（正好是它们的进深，水平是齐的）。**高度的步长是"从各自的原点加整格"**，两件起点差 4.1cm，再怎么拖都永远凑不到同一高度——这才是"对不齐"（不是水平缝）。上一轮只把 x/z 落了格，y 故意留给"接触高度"，于是这个洞留在那儿。
- **改法**：`buildGrid.ts` 新增 `snapPart()` + `isStructural()`——**结构件（目录分类「建筑」「玩法」：墙、地板、方块、柱、梁、拱门、楼梯、门、窗、屋顶、直梯、传送点…）三轴都落格**（放置/贴面/顶面辅助/搭桥/拖动/旋转/整组同伴全过它，服务端 `cleanPart()` 再兜一层）；**家具/摆件的 y 保留毫米接触**（书桌 1.42m、圆桌 0.8m，取整会让杯子浮在桌面或陷进去），**原场景 fixture 的 y 也不动**（island 基座 −0.6、柱子配重 −4.15 是背景几何，动它会把地面抬高）。`offGridParts()` 与迁移用同一套判定（`part.fixture` 跳过 y），否则每次开服都白写一次存档、版本号一直涨。
- **产物**：`npm run build` → `deploy-web.cjs --upload --verify`，正式站入口 **`assets/main-9ZUaF2Oo.js`**（836.98 kB，公网 200 + 哈希一致）；后端 `scp build-store.mjs`（md5 `eadcd00…` 再变一次）+ `systemctl restart officeweb` → active。
- **正式站迁移**：`[build-store] 回格迁移：31 件离格部件对齐到 0.25 网格`（原文件另存 `build-world.json.before-grid.json`；**上一轮的备份我先另存成 `build-world.json.before-grid-xz.json`**，免得被覆盖；`build-world.json.before-grid-deploy-20261009.json` 仍是最初那份）。
- **核验（正式站）**：拉存档复核——**189 件**、水平离格 **0**、结构件高度离格 **0**、摆件高度非整格 9 件（有意保留）；三个拱门现在是 `y=0 / y=-4.5 / y=-4.5`（那两根**同高了**）。`build-parts-live.cjs` 真发两次写入：结构件 (41.11, 0.105, 41.06) → 存档 **(41, 0, 41)**；摆件 `mug` y=1.42 → **原样 1.42**。
- **回归**：全量 **383 项**单测（`build-grid-invariant` 覆盖结构件/摆件两类 + 迁移里"两个拱门对齐到同一高度、摆件与 fixture 的 y 不动"）+ 真浏览器 `build-surface`/`build-gap`/`build-top`/`build-experience`/`editable-scene` 全过。**代价（有意）**：结构件放在"顶面不在格上"的支撑上时会落格，最多差半格 0.125。



## 2026-10-09 「部件整格」改成不变量（服务端闸门＋客户端产出即整格＋老存档迁移），并删掉「对齐网格」按钮

用户：「将来确保不会有步长不统一的部件 所以就不需要对齐网格的按钮 你理解吗 根源修复 而不是打补丁」。

- **三层保证**：① `build-store.mjs` 的 `cleanPart()` 把 x/z 落格——**唯一的写入闸门**，`add`/`move`/`moveMany`/`duplicate` 与撤销重放全走它，所以旧版客户端照发毫米值也污染不了世界；② 客户端每条产出路径都过 `src/buildGrid.ts` 的 `snapHorizontal`（放置候选件的出口、`fitToSurface`/`fitToPlane`、`gapPlacement`、旋转时反推的 x/z、整组移动的同伴、Shift+D 复制落点——最后一条顺手删掉了"保留原件小数偏置"的老逻辑）；③ `createBuildStore()` 启动时把历史离格件整盘回格，原文件另存 `.before-grid.json`、journal 记件数、幂等。（**同日晚些时候又补了高度规则**：结构件三轴落格、家具/摆件的 y 保留毫米——见上一条，两件拱门"对不齐"就是这么修的。）
- **三层保证**：① `build-store.mjs` 的 `cleanPart()` 把 x/z 落格——**唯一的写入闸门**，`add`/`move`/`moveMany`/`duplicate` 与撤销重放全走它，所以旧版客户端照发毫米值也污染不了世界；② 客户端每条产出路径都过 `src/buildGrid.ts` 的 `snapHorizontal`（放置候选件的出口、`fitToSurface`/`fitToPlane`、`gapPlacement`、旋转时反推的 x/z、整组移动的同伴、Shift+D 复制落点——最后一条顺手删掉了"保留原件小数偏置"的老逻辑）；③ `createBuildStore()` 启动时把历史离格件整盘回格，原文件另存 `.before-grid.json`、journal 记件数、幂等。**y 一个字节都不取整**（接触高度是毫米级），y 的步长仍由 `snapMove` 保证整格。
- **代价（有意，别再改回去）**：贴面/抓底边不再毫米级精确，最多差半格 **0.125**。`test/browser/build-surface.cjs` 的断言跟着从 `gap<.001` 放宽到 `<.126`，并新增"落点必须在网格上"；"四条边四个不同位置"放宽成"至少两个不同"（吸到网格后可能有两三个落在同一格点）。
- **产物（前端）**：`npm run build`（`public-parity` 90 个文件一致）→ `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-8JoPwKyd.js`**（851,302 字节，公网 200 且哈希一致），线上 bundle 里已经查不到「对齐网格」。
- **产物（后端，必须一起发）**：先核对服务器 `~/officeweb/build-store.mjs` 与 git HEAD **逐字节一致**（md5 `6b99af1…`）再 `scp` 上传（新 md5 `eadcd00…`），然后 `sudo -n systemctl restart officeweb` → **active**。目录 `build-catalog.json` 未改，没有重启之外的额外动作（重启不影响持久存档）。
- **正式站迁移结果**：重启日志 `[build-store] 水平回格迁移：58 件离格部件对齐到 0.25 网格（原文件备份为 /home/ubuntu/officeweb/build-world.json.before-grid.json）`；我另外手动备份了一份 `build-world.json.before-grid-deploy-20261009.json`。迁移后拉正式存档复核：**182 件、离格 0 件**（用户当时正在施工，件数比前一天记录的 177 多，他重建了直梯）。
- **验证**：全量 **383 项**单测全绿（其中新增 `test/build-grid-invariant.test.mjs` 5 项：服务端四种命令 + 目录 70 件 × 贴面/地面/手动高度/搭桥/拖动/复制 + 顶面辅助吸附 + 迁移与备份 + `snapHorizontal` 语义）；真浏览器 `build-surface`/`build-gap`/`build-top`/`build-experience`/`editable-scene`/`build-copy-teleport`/`build-hints` 全 PASS；**正式站** `build-parts-live.cjs` PASS —— 里面真发一次离格坐标（41.11/41.06）→ 正式存档回 **41/41**、`y=0.105` 原样，随后把验收件删净。
- **删掉的东西**：`BuildToolbar` 的「对齐网格」按钮与 `onAlign`、`BuildInteraction.alignSelected()`、`buildMoveSnap.alignToGrid()`、两条 `build-align-grid*` 用例（它们的教训——正式站面板挡住画布 / `role=dialog` 让 Ctrl+Z 静默失效 / Esc 是"回漫游"——已并入 AGENTS.md）。
- **回滚点**：前端回 `assets/main-DKeDnhq7.js`（或 git HEAD 的 `OfficeWeb/`），后端回 git HEAD 的 `build-store.mjs`，存档用线上自动留的 `build-world.json.before-grid.json`（58 件原坐标）。

## 2026-10-09 正式站验收用例曾经删掉用户自己建的部件（已修 + 传送点已放回）

- **事故**：`OfficeWeb/test/browser/build-parts-live.cjs` 开跑前按**类型**清理——把正式世界里所有 `ladder`/`teleport-pad` 都 `remove` 掉，于是把**用户自己建的两根直梯和一块传送点**（x≈-25 与 (3.5,0,-1.5)）一起删了。2026-10-08 那轮的验收记录里「复核正式存档里 `ladder`/`teleport-pad` 各 0 件」其实把这件事当成了通过条件。
- **为什么找不回来**：`build-store.mjs` 只有"当前状态 + 原子写"（`writeFileSync(path+'.next')` → `renameSync`）；撤销历史（`src/buildHistory.ts`）在**客户端内存**里、上限 30 步，服务端没有回滚接口；VPS `~/officeweb/backups/` 里只有目录/前端快照，没有该存档的备份（`build-world.json` 只有 9-30 的 `before-editable-scene` 副本，早于这两件）。
- **已修**：验收件改到 `PLOT={x:40,z:40}` 这块空地上（先量正式世界包围盒 x −42.75~13.5 / z −26~24，该点 25m 内一件都没有），`mine()` 只按"离 PLOT 12m 以内"筛（比落点范围 ±6 宽一点，太窄会把自己的件漏掉），并**在开头与结尾核对世界总件数**（`baseline`＝清掉自己残留后的件数，结尾必须回到它）。重跑 PASS：正式世界 **176 件进、176 件出**，验收件全部落在这块空地上并删净。
- **传送点已放回**：按记录的原坐标 **(3.5, 0, −1.5)**（下面那块 `floor` y=−0.25 的顶面正好是 0）重新放了一块，世界 176 → **177 件**。
- **两根直梯不代放**：记录只到"x≈-25"，而用户那片现在已经是两层框架（立柱 y=3.25、横梁 y=5.75，还有楼梯），乱放会穿模。已问用户，他选择**自己重搭**（2026-10-09 确认），所以那两根梯子不进存档。

## 2026-10-09 对齐网格：已经建好的离格部件一键回格

用户：「上线了吗 还是不行啊 是不是因为我已经创建的就不行？」——**用户猜对了**。

- 上一轮修的是"拖动时怎么落点"，**老存档里那 63 件离格部件不会自己动**（它们是在网格修复之前贴面/搭桥建出来的）。**不做自动迁移**（那会在用户没要求时静默挪动几十件已建好的东西，包括地下那簇），改成给一个显式入口：移动模式工具栏 **`⌗ 对齐网格`**，对**选中的**部件（Shift 多选）逐件发 `{action:'move', id, version, part: alignToGrid(part)}`，每件都进历史、Ctrl+Z 按逆序还原；**只动 x/z，y 一点不碰**（y 是接触高度：1.42m 桌面、0.34m 方块顶、地下 −1.855 那一簇，强行取整会让叠着的东西浮起/陷进去）。一件没选给「先点选要对齐的部件（Shift 点击可多选）」，本来就在格上给「这些部件本来就在网格上」（不发请求）。
- **产物**：`npm run build`（`public-parity` 90 个文件一致）→ `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-DKeDnhq7.js`**（852,353 字节，本地/远端 SHA256 一致，公网 200 且哈希相同），`index.html` 同步更新，线上 bundle 里查得到「对齐网格 / 把选中的部件对齐到 0.25 网格 / 这些部件本来就在网格上」。**没动后端、没有重启 `officeweb`**（目录/存档未改）。
- **验证**：全量 **377 项单测**全绿 + `tsc --noEmit` 通过；本地真浏览器 `test/browser/build-align-grid.cjs`（两块离格方块 Shift 多选 → 点按钮 → 存档 x/z 落到 0.25 网格、y 仍 0.105 → 两次 Ctrl+Z 各自回原位）PASS；回归 `editable-scene.cjs`、`build-copy-teleport.cjs`、`build-hints.cjs` 全 PASS。
- **正式站验收**：新增 `test/browser/build-align-grid-live.cjs`（真账号 + 真后端：远处空地放两块离格方块 → 移动模式 Shift 多选 → 点「对齐网格」→ 正式存档 `120.11/120.06`、`122.37/120.19` 变成 `120/120`、`122.25/120.25`，y 仍 0.105 → 两次 Ctrl+Z 回原位 → 删掉验收件）**PASS**；`build-parts-live.cjs`（正式站建造直梯/传送点、传送、Delete + 撤销）也 PASS。
- **正式站独有的三个坑**（本地假存档碰不到，已写进用例注释）：①"先捏一下你的角色"面板**在页面稍后才挂上来**，早一步查是 0 个，于是它带着 `role="dialog"` 留在页面上，而 `useBuildEditor` 一看到对话框就跳过整段键盘处理——**Ctrl+Z 静默失效**；②它那块 `LiveLookPreview` 画布压在场景画布正中（实测 368~598 × 315~602 被盖住），`__pick` 照样打得中部件、真实鼠标却点在预览画布上，"拾取命中了却选不中"，所以落点要用 `elementFromPoint` 确认；③**Esc 在编辑态是"取消并回到漫游"**，想关面板必须**先按 Esc 再进移动模式**，反过来会一直在漫游里点。
- **说明**：老存档里已经离格的部件**不会自动搬**；**拖一下**（现在落点会吸回网格）或者**选中后点「对齐网格」**就行。桌面客户端要按 **Ctrl+R** 才会拿到新产物（EXE 加载的就是这个站点，不用更新客户端）。

## 2026-10-08 被顶下线后任务栏头像条还挂着一排人（用户：「被挤掉线之后为啥头像都还在 所有人的都在 这不合理吧」）

用户：「被挤掉线之后为啥头像都还在 所有人的都在 这不合理吧」。

- **真因**：办公室页其实已经回到登录页了（App 卸载），但 `src/useDockBridge.ts` 的 effect 收尾只 `clearInterval(timer)`，**没有把小窗交还回去**——主进程里那份状态还是"上一次推送的那一排人"，所以任务栏头像条继续显示所有同事（连已经掉线的我自己）。那个 `enabled` 入参**只表示"这台机器有没有 dockState 这道桥"**，被顶下线/会话失效/被请出/主动退出都不会让它变 false，"不可用就清空"那条分支在客户端里从来没跑到。
- **修法**：把清空抽成 `release()`（清 `lastSent` + 推 `{people: [], sharing: false, missed: 0, hidden: true}`），**"不可用"分支与卸载收尾共用它**；清 `lastSent` 是为了再登进来能重新推（否则那份状态与上次一样会被"没变"跳过，条子永远回不来）。**纯前端，不用发新客户端**。
- **产物**：`npm run build`（`public-parity` 90 个文件一致）→ `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-D9gS2QH7.js`**（851,320 字节，本地/远端 SHA256 一致，公网 200 且哈希相同），`index.html` 同步更新。**只传了这两个文件**（没有 `scp -r`、没有碰 `dist/download/`）；**后端未动、没有重启 `officeweb`**（`build-catalog.json` 审计一致）。
- **验证（修复前先复现，红的）**：新增 `test/browser/dock-session-end.mjs` —— 真服务器 + 真账号，浏览器里装假桌面桥记录每一次 `dockState` 推送：A 注册进办公室（条子上有头像）→ B 用同一账号登录把 A 顶掉 → A 回登录页。**修复前实测最后一份仍是 `{"people":[…],"hidden":false}`（用例当场红）**，修复后 `{"people":0,"hidden":true}`，并且再登回来条子又亮起来。配套源码断言 `test/dock-session-end.test.mjs`（别改回"只清定时器"）。
- **上线核验（正式站）**：`BOX_LIVE=1 node test/browser/dock-session-end.mjs` PASS —— 正式站上真实在线的另外两位（小桃1、IRIS）都在 `people` 里，被顶下线那一刻推给小窗的最后一份是空名单 + `hidden`，重新登录后又变回 3 个人。另跑全量 **377 项单测**全绿 + `tsc --noEmit` 通过 + 回归浏览器 `test/browser/dock.cjs` PASS。



## 2026-10-08 拖动步长统一成整格：部件不再"离格走一辈子"

用户：「有些部件额移动单位有问题 没有按照一个格子的大小步长，完整检查」。

- **先量**：拉正式存档逐件核对 0.25 网格 → **179 件里 63 件离格**：`small`/`block`/`arch`/`lamp`/`fern` 那一簇（x≈-23～-26、y≈-1.855，就是用户自己在修的"地下小房间"）、`beam`/`pillar`/`floor` 正好差 0.125、`cinema-screen` y 差 0.065、`desk` 差 0.017。
- **三个来源**：①`buildMoveSnap` 的贴面磁吸直接写毫米值，而且步长是"相对保存原点加整格"→ 一旦离格就永远回不来；②`gapPlacement` 的"把每只脚吸到柱子中心"写的是 `b-a` 的毫米值（**两柱之间搭的梁**，正好对上 beam/pillar 那 0.125）；③贴面/接点/顶面放置**本来就有意**允许毫米精度（叠在 1.42m 桌面 / 0.34m 方块顶上必须精确落层）——这条不动。
- **改法**：拖动时**水平两轴（x/z）落点吸附到 0.25 网格**（不再"相对原点"），离格的老部件拖一下就回格、之后每一步正好一格；磁吸候选也过同一套取整，两个部件都整格时依旧精确贴面，否则最多差半格；**y 保持原点+整格与毫米接触精度**。
- **产物**：`npm run build` → `node Build/deploy-web.cjs --upload --verify`；正式站入口 **`assets/main-BEXmWtfw.js`**（`index.html` 引用的就是它）。没动后端。
- **验证**：`node --test test/build-move-snap.test.mjs`（4 项，含"全部 70 件部件"扫描：任何方向拖多少，落点都在网格上、位移都是整数格、方向不反；非整格齐平点也落回网格）+ 全量 **377 项单测**全绿；`test/browser/editable-scene.cjs` 加了"真拖一次后 saved x/z 在网格上"的断言；`build-surface`/`build-gap`/`build-experience` 全过；正式站 `build-parts-live.cjs` PASS。
- **说明**：老存档里已经离格的部件**不会自动搬**（那是用户自己搭的），但它们**下一次被拖动时就会回到格子上**。

## 2026-10-08 传送点规则改成"点到哪一块就传到那一块"（用户澄清后的返工）

用户：「传送你理解错了 不是一对一 是任何地点 直接传送到点击处，只需要创建一个就行，创建后不要鼠标只能继续创建从而出不来」。

- **返工原因**：第一版把传送点做成**配对的两个点互相传**（点是"入口"），只有一块时点了什么都不发生。用户要的是**点到哪一块就传到那一块**（点是"目的地"），一块就够。
- **改了什么**（`src/buildTeleport.ts` 纯函数）：①点哪一块就到哪一块（一块就够）；②已经站在这一块上（0.6m 内）再点它 → 去最近的那一块（人多时来回跳），世界上只有这一块时给一句「你已经站在这个传送点上了」而不是静默失败；③落地朝向 = 面向来路（`from` 现在是人所在的位置）。**模式**：漫游和**安装**模式点传送点都是"传过去"——安装模式也算，正是用户说的"创建后不要鼠标只能继续创建从而出不来"；移动/拆除里传送点仍是普通部件（能选中/挪动/删除）。**放下传送点后自动回到漫游**，流程变成"放一块 → 点它就走"。**粒子条不再表示"能不能配对"**：所有传送点共用一份亮青材质、一直亮着（`syncBeams`/`partner`/`hasTwoPads` 全部删掉）。`BuildInteraction` 新增 `position?: () => {x,z}`（`OfficeScene` 传 `avatar.root.position`），用来判断"是不是已经站在这一块上了"。
- **产物**：`npm run build` → `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-CWMLtePT.js`**（公网核验：`index.html` 引用的就是它，bundle 里查得到 `你已经站在这个传送点上了` / `teleportBeam` / `传送点＝目的地`）。**没动后端**，不需要重启 `officeweb`。
- **验证**：`node --test test/build-teleport.test.mjs`（重写：一块就够/点哪去哪/站在上面再点去下一块/落地朝向）+ `test/build-beam.test.mjs` + 全量 **377 项单测**全绿；真浏览器 `build-teleport-beam.cjs`（粒子条在冒 → 从老远点它就站上去 → 站在上面再点给提示 → 装第二块后自动回漫游 → 站在第一块上点它去第二块）、`build-copy-teleport.cjs` ④⑤（先用 `teleportTo` 放一个确定出发点，落点朝向才可断言）、`build-experience`/`editable-scene`/`build-props` 全过；**正式站** `build-parts-live.cjs` PASS（从 x=4 点 -2.5 那一块 → 直接站到 -2.5；站在上面再点 → 去 -8.5；跑完世界无残留）。

## 2026-10-08 传送点「无效」修复 + 粒子条（用户：传送点无效，请修复；并且要粒子条往上出现，简约、注意性能）

用户：「传送点无效，请修复 并且传送点要有粒子条往上出现，简约的做一个，注意性能」。

- **先查正式世界**（`~/officeweb/build-world.json`）：里面只有**一块**传送点（3.5,0,-1.5；另外两根直梯在 x≈-25）。一块自己传自己等于原地不动，所以点下去确实什么都不发生。**更关键的是 `BuildToolbar` 收下了 `hint` prop 却从来没渲染** —— `buildInteraction` 里所有操作提示（「再放一个传送点才能传过去」、放置错误、「已传送」…）用户**一个字都看不到**，"点了没反应"多半就是这个。
- **改了什么**：①工具栏把 `hint` 渲染成画面上方**悬浮提示条**（`.build-hint`，`position:fixed` 不会顶动按钮，4.5s 自动消失）＋新的常驻 `tip`（不自动消失）；②常驻提示：在「安装 + 传送点 + 世界里只有 1 块」时说「传送点要成对：再点一下地面放下第二块…」；③**漫游模式**点只有一块的传送点 → 自动切到「安装 + 传送点」（部件库展开、分类页切到「玩法」），用户再点一下地面就配好对（移动模式不变：那里点它是选中来挪动/删除）；④传送点加一块隐形**拾取助手**（1.7×0.9×1.7，`userData.pickHelper`），0.34m 高的东西隔着几步很容易差一点打到旁边的地板；⑤**粒子条**（`src/buildBeam.ts`）：每块传送点一根往上冒的光点柱（18 点、2.3m、上下淡出），**所有传送点共用一份几何与 2 份材质**，每帧只更新一次共享顶点属性，世界里没有传送点时零开销；不吃拾取、不参与碰撞、挂空包围盒（不撑大实测尺寸）。粒子条颜色就是配对状态：**亮青＝两块以上能传送，暗灰＝只有一块**。
- **产物**：`npm run build` → `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-BaWgcRX6.js`**（851,267 字节，公网核验 200，bundle 里查得到 `teleportBeam`/`传送点要成对`/`pickHelper`）。**这次没动后端**（目录没变），不需要重启 `officeweb`。
- **验证**：`node --test test/build-beam.test.mjs`（点数/共用几何与材质/不吃拾取/不进碰撞/不撑大目录尺寸/上下淡出）+ 全量 **374 项单测**全绿；真浏览器 `node test/browser/build-teleport-beam.cjs`（粒子条在冒 → 一块时给提示并切到安装且选中传送点 → 放下第二块后粒子条变亮 → 点它真的站到另一块）；回归 `build-copy-teleport`/`build-experience`/`build-props`/`build-hints`/`arrow-glow`/`editable-scene` 全过；**正式站** `test/browser/build-parts-live.cjs` PASS（并新增断言：正式站的传送点粒子条 18 点、一块时暗、两块时亮）。



## 2026-10-08 爬梯子时的朝向修正（用户报「爬梯子时的面朝向不对」）

用户：「很好 但是 爬梯子时的面朝向不对」。

- **原因**：爬梯那几帧的朝向一直取的是**相机的水平朝向**。爬梯是纯竖直位移，只要镜头不在梯子正后方（绕到侧面、或从斜角走近），角色就会朝着镜头方向"侧着身子"上升；自动寻路爬梯那一段更明显——`OfficeAvatar` 里 `atan2(traveled.x, traveled.z)` 在纯竖直位移上等于 `atan2(0,0)`，会把角色拧到 +Z。
- **修法**：①`localClimb` 里连同**梯面法线**（本地 +Z，梯子薄的那一轴）一起声明，`buildArch.climbColumns()` 把世界盒（`Box3.applyMatrix4`，取 8 个角的 AABB）和法线一起变换出来（`normalX/normalZ`），`buildNavigation.buildClimbAt()` 顺带返回 `faceX/faceZ` —— 人站梯子哪一侧就朝哪一侧看；人正好压在梯子中线上时返回 (0,0)，保持原朝向。**不用"世界盒哪根轴薄"猜法线**：梯子被 scale 拉过之后比例会反过来。②`buildClimb.climbStep()` 上下爬用这个朝向，只有"到顶踏出去 / 到底退出来"那一步才跟着**实际移动方向**（等于走路朝向）。③寻路跟随只有水平位移 > 1e-4 才转朝向，纯竖直段保持进梯子时的朝向。
- **产物**：`npm run build` → `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-BWNNqnjH.js`**（848,865 字节，公网核验 200、bundle 里查得到 `localClimb`/`normalX`/`faceX`）。**这次没动后端**（`build-catalog.json` 与上一版一致），所以不必重启 `officeweb`。
- **验证**：`node --test test/build-ladder.test.mjs`（新增「爬梯朝向」用例：站在梯子前面/背面、梯子旋转 90° 后从侧面爬、以及正好在中线上四种情况）+ 全量 **371 项单测全绿**；真浏览器 `node test/browser/build-ladder-climb.cjs`（爬到一半把镜头甩到 +X 侧再继续按 W：还在往上爬、朝向仍 ≈0 弧度；寻路爬梯那一段也采样一次朝向）PASS；正式站 `node test/browser/build-parts-live.cjs` 在新 bundle 上重跑 PASS（建直梯+两块传送点、Delete+Ctrl+Z、传送），跑完正式世界仍是 135 件、无残留。



## 2026-10-08 直梯改成真的能爬的梯子（上下通行 + 方向键 + 自动寻路）

用户：「新增直梯是可以通行的，不管是上和下，可以用方向键通行，就类似于游戏，以及自动寻路也可以」。

- **为什么重做**：第一版直梯是把横档按 0.25m 叠成"台阶"，但 `buildNavigation` 的抬腿高度只有 0.255m、身高 1.3m，横档叠在同一个 z 上时上面那级会把下面那级**整个封死**（`supportHeight` 只认最顶上一级）→ 只能"站上去"不能"走上去"；改成每级退后 0.25m 的窄楼梯虽然真能走，但那是个 **0.7 × 3.8m 的楼梯**、不是梯子。现在改成**可攀爬柱体**：两根立柱实心（能贴墙/选中/有实测尺寸），15 根横档只当外观（`noBuildCollision`），玩法由 `localClimb` 世界盒 + `buildClimb.climbStep()` 决定。
- **规则**：柱体里 **W/↑ 往上爬、S/↓ 往下退**（`CLIMB_SPEED=1.15m/s`，比走路慢），A/D 仍然横着挪；到梯顶还按上就朝相机方向迈一步踏上平台、到梯底还按下就退着走出来（落点由 `traverse` 校验，平台上下差 ≤0.255m 都行）。寻路：`buildNavigation` 在柱体内生成上下相邻边，`avatarPath.advancePath` 跟随时**先把高度挪到路径点再横着走**（`traverse` 在梯子里不改高度）。
- **产物**：`npm run build`（`public-parity` 90 个文件）→ `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-Dx6lTObp.js`**。**目录按实测改了 `size:[0.7,3.8,0.5]`、`dimensions:[0.6,3.78,0.08]`**，所以按老规矩同时 `scp OfficeWeb/build-catalog.json ubuntu@…:~/officeweb/build-catalog.json` + `sudo -n systemctl restart officeweb`（`build-catalog.json` 是**启动时读进内存**的，只发前端不算数）。`build-world.json` 是运行数据，不动。
- **验证**：本地 `node --test test/build-ladder.test.mjs`（几何/柱体内外/按键爬上退下/自由行走一路按 W 爬到平台/`buildPath` 顺着梯子到 3.75m 平台）+ 370 项单测全绿；**真浏览器** `node test/browser/build-ladder-climb.cjs`（真键盘 W 爬到 4.0m 平台、↑↓ 退下来、`moveTo()` 寻路也能爬到平台）；回归 `build-copy-teleport`/`build-props`/`build-architecture`/`build-surface`/`editable-scene`/`build-experience` 全过。
- **上线核验（正式站）**：`node Build/deploy-web.cjs --upload --verify` → 上传 `assets/main-Dx6lTObp.js`/`index.html`/`build-catalog.json`（本地与远端逐文件一致，公网 HEAD 全 200）；`~/officeweb/build-catalog.json` 的 sha256 `e098fe68…2c84` 与本地一致，`sudo -n systemctl restart officeweb` 后 **active**；公网 bundle 里查得到新代码的 `localClimb`；`test/browser/build-teleport-live.cjs` PASS（136 件、玩法分类含直梯/传送点）、`test/browser/build-parts-live.cjs` PASS（真鼠标建直梯+两块传送点落进存档、移动模式 Delete 真删掉再 Ctrl+Z 恢复、点传送点瞬移），跑完正式世界回到 135 件、`ladder`/`teleport-pad` 各 0 件（无残留）。**这条正式站用例顺手修了一个测试写法**：梯子变薄（0.08m 进深）后，"斜着看、瞄准腰高"的射线会先打到梯子前面的地板，于是删掉的不是梯子；现在改成**正上方俯视 + 按手柄 `selectedIds` 逐个候选点确认**。



用户：「请在选择工具下选择物体后，可以按 delete 删除」。

- **实现**：`BuildInteraction.removeSelected()`——先把选中那一组的 id/version 记下来，再逐件 `remove`（服务端没有批量删除），每件都进历史，**Ctrl+Z 按逆序整组恢复**；`useBuildEditor` 的 keydown 只在 `mode==='move'` 接管、`event.repeat` 与输入框都不触发。**顺带修一个真 bug**：`pickable()` 原本把传送点在移动模式里排除出拾取，导致"选中后 Delete"对传送点完全无效；现在传送点照常可命中，点击语义改成"两块以上时点它就是传过去、一块时不响应"（`hasTwoPads()`），**要删/挪传送点走「拆除」模式**。
- 发布：`npm run build`（`public-parity` 90 个文件）→ `node Build/deploy-web.cjs --upload --verify`；正式站入口现为 **`assets/main-V1bypZoW.js`**（831,361 字节源码字节数；本地/远端 SHA256 一致），线上 `index.html` 引用的就是它，`removeSelected` / `已删除` / `Backspace` / `hasTwoPads` 都能在线上包里查到。后端未改、未重启。
- 验证：本地 `test/browser/build-copy-teleport.cjs`（整组 Delete 删 2 件 → Ctrl+Z 两次整组恢复；单件 Backspace；拆除模式删传送点 + 撤销）全过；**正式站** `test/browser/build-parts-live.cjs` 里真按了一次 Delete（直梯）并 Ctrl+Z 恢复，随后两块传送点的传送与收尾仍通过。364 项单测 + `build-experience`/`editable-scene`/`build-gizmo`/`build-surface`/`build-seats`/`build-wall-app` 全绿。


## 2026-10-08 报障修复「这俩点不上去啊 无法点击建造」（直梯 / 传送点）

用户在上一次上线后报：「这俩点不上去啊 无法点击建造」。**两个真因都不是"前端没发上去"**：

1. **后端目录没更新**。`build-store.mjs` 在**进程启动时**把 `build-catalog.json` 读进内存（`JSON.parse(readFileSync(...))`），上一次只重传了前端产物、没有更新服务器上的目录文件，也没有重启 → 正式站那份还是 2026-09-30 的旧目录，每次 `add` 都回 **400「没有这个部件」**。前端只把这句显示在底部状态条上，看画面就像"点了没反应"。
   - 处置：备份 `~/officeweb/backups/copy-teleport-20261008-133347/build-catalog.json.before` → `scp OfficeWeb/build-catalog.json ubuntu@…:~/officeweb/build-catalog.json`（sha256 `7e00dfb0…5164`，与本地一致）→ `sudo -n systemctl restart officeweb` → **active**，日志 `OfficeWeb ready on http://127.0.0.1:3108 (livekit: wss://115.159.43.237)`。`build-world.json` 是运行数据，重启不影响。
2. **安装预览挡住射线**：`BuildInteraction.refresh()` 里的浅蓝预览（ghost）是可拾取网格，站在预览/真部件重叠处点击时射线命中预览 → `teleportAt` 拿到 `undefined` → 不传送、人反而走开。现在预览创建后整体 `raycast=()=>{}`（它不是场景里的部件），并在 `refresh()` 里漫游模式直接 `ghost.visible=false`。

- 发布：`npm run build`（`public-parity` 90 个文件一致）→ `node Build/deploy-web.cjs --upload --verify`，逐文件上传 `index.html` + `assets/main-DnKjfKvM.js`，本地与远端 SHA256 一致、公网 8 个引用资源全部 200 且哈希一致。**没有 `scp -r`、没有碰 `dist/download/`**；后端只换了目录文件并重启，`server.mjs` 未改。
- **正式站端到端核验**（新增 `OfficeWeb/test/browser/build-parts-live.cjs`，真鼠标点场景）：建出直梯 @(3.5, 12.25) 与传送点 @(-2.5, 12.25) 且都落进存档 → 页面自己再建第二块 @(-8.5, 12.25) → 点第一块，人**立刻**出现在第二块上（`y=0.25` 是站在地砖面），截图 `Build/teleport-live-build.png`；结尾把验收件删干净（复核正式存档里 `ladder`/`teleport-pad` 各 0 件）。
- 该用例踩过的五个坑（都写在文件头）：登录要走页面表单（手工塞会话 cookie 会停在身份选择页、画布根本不存在）；**每次登录会吊销该账号的其他会话**，所以校验走浏览器自己的 `context.request`，别另开 Node 会话；要点掉"先捏一下你的角色"，否则面板盖住画布、真实鼠标点在 DOM 上（合成 PointerEvent 能绕过，极易误判成功）；登录/选身份会冲掉 `?debug=1`，探针装不上，要重新带上再进一次；**每件都要先把镜头对准落点再点**，否则目标偏出画面、射线打到别处。
- 本地回归：364 项单测全绿；`build-copy-teleport`、`build-experience`、`editable-scene`、`build-surface`、`build-top`、`build-gap`、`build-seats`、`build-props` 全过。


## 2026-10-08 移动模式 Shift+D 拖拽复制 + 玩法两件（直梯 / 传送点）

用户：「在移动模式下，shift d拖拽时复制 类似blender，支持多选」「新增部件：直梯和传送点，单击传送点可以原地消失，直接传送过去开黑吧」。

- **Shift+D 变成 Blender 式**：按下即在原位建好副本并进入跟随态，鼠标移动副本跟着走，**单击放下**并保存；没挪动就是原位放下。单件与整组多选都支持（整组先记下 `selectedIds.map(id=>({id,version}))` 再逐件复制，整组重选走加选语义 `selectCopies()`）。细节与六个坑见 `OfficeWeb/AGENTS.md` 同日条目。
- **新部件**：`ladder`（踏面严格 0.25m 分级，`buildNavigation` 的 0.255m 抬腿高度真能爬上去）、`teleport-pad`（底座跟色板、面板单独自发光材质）。单击传送点 → 传到**水平最近的另一块**并面向来路；`OfficeAvatar.teleportTo()` 是瞬移，不走寻路。
- 发布：**纯前端**，后端未改、**没有重启 officeweb**。`npm run build`（含 `postbuild` 的 `public-parity`：`public/` 与产物一致 90 个文件）→ `node Build/deploy-web.cjs --upload --verify`：
  - 上传 `index.html`、`assets/main-CqzdezW0.js`（844,914 字节）、`assets/main-CuG_y9Nd.css`（87,490 字节）；其余 11 个文件哈希已一致，没有重复上传，**没有 `scp -r`、没有碰 `dist/download/`**（安装器 0.1.17/0.1.21/0.1.22/0.1.25 原样）。
  - 上传后复验「本地与远端逐文件一致」；公网逐个取值核验：`main-CqzdezW0.js`、`main-CuG_y9Nd.css`、`dock-C_2bFltL.js`、`dock-CMqxuJsV.css`、`dockGreeting-B406LHoz.js`、`characterModel-D-HunoXp.js`、`index.html`、`dock.html` 全部 **200 且 SHA256 与本地一致**。
  - 回滚点：`~/officeweb/backups/copy-teleport-20261008-133347/`（上一版 `index.html`）。
- **线上核验**：`node test/browser/build-teleport-live.cjs`（真账号注册 + 只替换 `/api/auth/me` 为"访客+已捏过人"，避免捏人/选座弹窗）打正式站：场景载入 **130 件**已保存部件、部件库出现新的 **玩法** 分类且 `直梯`／`传送点` 各一个、无页面错误、非 socket 资源无 4xx/5xx，截图 `Build/teleport-live-parts.png`。本地那一版另有完整交互回归 `node test/browser/build-copy-teleport.cjs`（单击放下、整组复制、整组拖走、传送与回程朝向）。
- 说明：`test/browser/deployed-smoke.mjs` 仍等在 2026-09-14 就被替换掉的旧选座 UI（`.seat-picker`），跑正式站会超时失败；这是 `Design/TODO.md` 里早就记着的过期用例，不是这次发布造成的。


## 2026-09-30 宝箱视频链接显示封面缩略图、点开即放大观看

用户：「宝箱里面的视频链接，我希望有一个缩略图放的图片，我希望别人点开的时候可以放大观看」，并确认要**自动抓取平台封面**（不是让上传者自己挑图）。

- **封面必须由服务端代理，浏览器直连不行**（三条都是实测）：`api.bilibili.com` 不返回 CORS 头；封面图床认 Referer，带本站来源是 **403**、带 `https://www.bilibili.com/` 才是 200；原始封面常有几百 KB，套 B 站图片 CDN 的 `@480w_300h_1c.webp` 规则后只有 **6.6KB／21.5KB／26.2KB**（jpg 与 png 封面都吃这条规则）。
- 新增 `OfficeWeb/build-cover.mjs`（156 行）：BV/av 走 `x/web-interface/view`、番剧 ep 走 `pgc/view/web/season`（**没有 `/x/` 前缀**——线上 `/x/pgc/...` 返回的是 HTML 错误页），取 `data.pic` / `result.cover`；图片地址必须落在 hdslb / bilibili / douyinpic 等白名单图床，协议强制 https，只收 `image/*` 且 ≤512KB。带 TTL 内存缓存（命中 6 小时／失败 5 分钟）、**同链接 in-flight 合并**、**上游并发闸门 3**、平台抖动重试一次；`COVER_TRACE=1` 打开失败日志。
- `build-http.mjs` 新增 `GET /api/build?cover=<视频页>`：**故意不做每账号限速**——打开宝箱时一屏可能同时有好几条视频链接，逐个 429 会把缩略图成片打掉（第一版 300ms 限速在回归里当场现形：3 条连发有 2 条被拒），上游压力交给缓存/合并/闸门兜；解析不到回 **204**，前端降级。未登录仍然 401。
- 前端：新增 `src/ChestCover.tsx`，视频链接的 110×88 类型位换成封面 + 居中 ▶ 浮层（`aria-label`＝`放大观看：<标题>`），**点缩略图直接打开放大播放器**；不是视频页或取不到封面时退回原来的 `↗` 符号（`onError` 卸载图片，别留一张 0 像素的 `<img>`）。播放器宽屏默认窗口 760px → `min(1040px,92vw)`（竖屏抖音仍是 430px 窄窗），「▶ xx观看」按钮与「最大化」都保留。
- **抖音封面目前取不到**：分享页只有 SSR 外壳、`<meta og:image>` 在手机 UA／桌面 UA／facebookexternalhit／Bytespider／Baiduspider 下都不返回，`_ROUTER_DATA` 里也没有 video 详情（详情接口要签名）。保留 og:image 这条尽力而为的路径，取不到就退回类型符号。
- 验证：新增 8 项单测（地址识别、图床白名单、体积上限、缓存、抖动重试、并发闸门），`npm test` 356 项全绿；`node test/browser/chest-cover.cjs` 本地与正式站都通过（缩略图有尺寸、`<img>` 真的加载出来、只请求本站 `?cover=`、普通链接与失败封面退回符号、点缩略图开播放器且宽度 1040，并**顺带打真后端**：匿名 401、B 站 webp（RIFF…WEBP）、站外 204、连发不限速）。同一用例里还有一段**全真链路**（本地起真服务端 + vite 把 `/api` 代理过去 + 真账号 + 真宝箱）：面板里那一行是**平台自己那张图**，实测 `naturalWidth×naturalHeight = 480×300`（正是 `@480w_300h_1c` 那档），截图 `Build/chest-cover-real.png`。两个坑：真账号要先过捏人和选座那两道弹窗（用例只把 `/api/auth/me` 换成"访客+已捏过人"），以及**别把两段用例的宝箱放在同一个坐标**——叠在一起时点击只会命中先渲染的那个（空宝箱），现象是面板一直是"第一件宝物，会是什么？"。`BOX_LIVE=1` 跑 `chest-layout`／`chest-video`／`chest-people` 全过。截图 `Build/chest-cover-{local,live}.png`、`Build/chest-cover-player-live.png`，证据 JSON `Build/chest-cover-live.json`。
- 发布：前端 `index.html` + `assets/main-BEPwM3kM.js`（839,511 字节）+ `assets/main-DGM9Vziq.css`（86,831 字节），本地与远端逐文件 SHA256 一致、公网 9 项 200；后端 `build-cover.mjs`（`b75d1183b61945900afb56eb16a39e315687e8473de25d7c2614dcdf61e96fbf`）+ `build-http.mjs`（`dc0a0e7608e640595ec92a5c0eb72f94712ed21c2ea7651248726a66759f6868`）上传并 `sudo -n systemctl restart officeweb` → active，日志 `OfficeWeb ready on http://127.0.0.1:3108`。
- **后端先在 VPS 的隔离预演实例上验过**（`Build/cover-qa-stage.sh`：拷 `~/officeweb/*.mjs` 到 `~/cover-stage`、独立端口 3211、独立 statePath/accountsPath，不碰正式数据与端口）：B 站视频 `200 image/webp 21584` 字节（magic `RIFF…WEBP`）、番剧 `200 26186`、站外 `204`、匿名 `401`、连发 3 条全 `200`、重复命中缓存 6ms。发布后又用**线上那两个文件本身**跑了一遍（`Build/cover-prod-verify.sh`，端口 3212），结果相同；文件哈希与预演实例完全一致。
- 备份 `~/officeweb/backups/chest-cover-20260930/`（改动前的 `build-http.mjs`、`before.sha256`，以及"此前没有 `build-cover.mjs`"的标记）。刷新页面生效。

## 2026-09-30 绿光过淡修正：客户端0.1.37

保留窄范围无实边的柔光，提高绿色可见度，修正0.1.36过淡。7项相关测试、渲染截图和打包CSS一致性通过。正式安装器101725764字节，整包SHA256 f63e368b65353fb8328000977cb1fa147169f5a8bcbf78a9f1f82b4ae01a7beb及latest.json已核验；更新客户端生效。详情见[绿光记录](Soft_Glow_20260930.md)。
## 2026-09-30 流动箭头改成"发光、一闪一闪"

用户：「我希望箭头是发光，发光，发光的一闪一闪的那个提示」「箭头组件，那个模型」——即构建库里的**流动箭头（flow-arrow）模型**本身要会发光、会闪。
- `buildArchitecture`：箭头单独一份自发光材质（`emissive` 取比本体更饱和的同色，`emissiveIntensity = .9*pulse`）+ 一层**加法混合光晕壳**（放大 1.3、`opacity = .5*pulse`）；呼吸曲线 `arrowPulse(t)=.5-.5cos(2πt/1.3)`（1.3 秒一轮），由每帧的 `updateBuildFlags` 驱动，原有的 +Z 轻微推移保留。
- 两个坑都堵上了：光晕壳**挂空包围盒**（`halo.boundingBox=new THREE.Box3()`），否则目录实测尺寸/选中框会被撑大 30%，`build-specifications`/`build-rotation`/`build-scale` 三条单测立刻变红；`buildInteraction` 把预览网格换成共享 `MeshBasicMaterial` 时**跳过光晕壳并隐藏它**，动画侧再用 `if(body.emissive)` 兜一层（老坑：预览材质不能进 emissive 更新）。
- 顺带修了两条**早就过期**的浏览器用例（与本次改动无关，在正式站上同样失败）：`build-architecture.cjs`（以为世界是空的，其实默认模板本身就是一批 buildId 节点）与 `build-props.cjs`（画廊张数写死 42，目录已长到 68）。348 项 Node 测试全绿。
- 发布 `index.html` + `assets/main-DjTW5g57.js` + `characterModel-D-HunoXp.js`；本地/远端逐文件 SHA256 一致、公网 9 项 200。
- 以正式站为准：`BOX_LIVE=1 node test/browser/arrow-office.cjs` 通过（真实应用里连拍 10 张，最暗/最亮两帧 **4855 px 变化、最亮 +98 级**），`build-architecture.cjs`、`build-hints.cjs`、`build-gizmo.cjs`、`build-experience.cjs` 全过；截图 `Build/arrow-office-{dim,lit,full}-live.png`、`Build/arrow-glow-{dark,bright}.png`。
- 后端未动、未重启；备份 `~/officeweb/backups/arrow-glow-20260930/`。刷新页面生效。

## 2026-09-30 提示贴片浮到最上层（"不要遮住"）

用户截图反馈：安装模式的贴片被预览部件压掉半张（`Q / R 左右转` 只剩一半），要求「不要遮住」。
- `buildRotationGuide` 的四张提示贴片改为 `depthTest=false` + `renderOrder=900`（`floatLabel()`），永远画在部件与环线之上；**环线本身仍遵守深度遮挡**（那是 3D 提示，露一半不影响判断）。旧的「旋转提示遵守深度遮挡」规则由用户本次要求取代，AGENTS.md 已同步。
- 顺势把槽位半径 `SLOT_REACH` 1.45→1.7，贴片整体推到部件轮廓外，减少压在模型上的面积。
- 发布 `assets/main-BLfyjWYP.js`（838,023 字节）+ `index.html`；本地/远端逐文件 SHA256 一致、公网 9 项 200。
- 以正式站为准：`BOX_LIVE=1` 跑 `build-hints.cjs`（新增断言：贴片 `depthTest===false` 且 `renderOrder ≥ 900`）、`build-experience.cjs`（断言改为"环线仍吃深度、贴片不吃"）、`build-gizmo.cjs` 全通过；截图 `Build/hint-install-live.png`（四张全部完整可见）。
- 后端未动、未重启；备份 `~/officeweb/backups/hint-on-top-20260930/`。刷新页面生效。

## 2026-09-30 提示贴片：删掉移动那条、安装改成饼菜单排布

用户：「这个很丑 不要太大 太抢戏，改小，另外把移动的那个去掉提示，安装的这个做成类似 blender 的饼状菜单的 ui 排列文字，不会重叠和干扰」。
- **移动手柄的说明贴片整条删除**（`BuildMoveHandle` 不再创建 sprite；相关 import/缩放/释放一并清掉）。
- **安装模式改成饼菜单方位槽**：三张贴片按相机的右/上向量摆到**左／上／右**槽，接点占**右上 45° 斜槽**；**不设正下方槽位**——画布底部压着建造工具栏那层 DOM，第一版放在正下方时实测被整条挡住。sprite 因此从"旋转环的子节点"改成"`root` 的子节点"（`build-experience.cjs` 的断言同步改成读 `root` 下的 sprite）。
- **变小**：画布 88→80 高、内边距 30→24、键帽 54→50；`guideLabelHeight` `clamp(distance*.034,.06,.7)` → `clamp(distance*.027,.05,.45)`，屏幕高度从 37~43px 降到 **31px**。
- 发布 `assets/main-0ZNZpipJ.js`（837,919 字节）+ `index.html`；本地/远端逐文件 SHA256 一致、公网 9 项 200。
- 以正式站为准：`BOX_LIVE=1 node test/browser/build-hints.cjs` 通过（贴片 22~32px；移动模式**没有任何贴片**；三条环提示分别落在左/上/右；接点在右上斜槽；任意两张屏幕矩形不相交；都不落进底部工具栏带），截图 `Build/hint-install-live.png`；`build-gizmo.cjs`（移动手柄 sprite 数 = 0）、`build-experience.cjs`、348 项 Node 测试通过。
- 后端未动、未重启；备份 `~/officeweb/backups/pie-hints-20260930/`。刷新页面生效。

## 2026-09-30 三维提示文字重做（移动说明 / 旋转快捷键 / 接点）

用户：「移动工具的提示文字的ui设计的实在是太丑了 以及安装工具也是 旋转快捷键的那些提示 重新设计一下」。旧的 `createGuideLabel` 是深色方框 + 8px 高饱和粗描边 + 粗体大字（画布固定 512×96，比例写死 `96/512`），长文案还会被压。
- 新建 `src/buildHints.ts`：圆角药丸 + 轻投影 + 强调色细描边；快捷键做成**键帽**（`Q / R`、`X`、`Z`、`C`）与说明分开，无键帽的用同色圆点；**画布按文字宽度自适应**（`userData.aspect`），`fitGuideLabel(sprite,height)` 按高度缩放，`guideLabelHeight(distance)=clamp(distance*.034,.06,.7)` 让屏幕高度恒定（实测 37~43px、字约 15px）。`buildRotationGuide.ts` 与 `buildMoveHandle.ts` 都改用它；移动说明文案收短为 `移动 25cm · 缩放 25cm`；`userData.shortcut` 保持完整文案，`build-experience.cjs` 的既有断言不变。
- 发布：`npm run build`（90 项 public 一致）→ `node Build/deploy-web.cjs --upload --verify`，`index.html` + `assets/main-DZ6sNZkF.js`（838,439 字节）等；本地/远端逐文件 SHA256 一致、公网 9 项 200。
- 以正式站为准：`BOX_LIVE=1 node test/browser/build-hints.cjs` 通过（画布是细长药丸 501×88、97% 不透明深底、13% 浅色文字、移动与安装模式各一条都在 26~44px 高度带内），截图 `Build/hint-move-live.png`、`Build/hint-install-live.png`；`build-gizmo.cjs`、`build-experience.cjs`、348 项 Node 测试全部通过。
- 后端未动、未重启；备份 `~/officeweb/backups/hint-chips-20260930/`。刷新页面生效。

## 2026-09-30 移动手柄：其他轴不再压暗

用户：「选中的轴明显了但是没选的其他轴还是看不清 其他轴不要变色了」。去掉悬停时的压暗（原来其余轴会淡到 0.14），抓住的那根仍换饱和色 `#d2603f`／`#3f9a55`／`#3579ad` 并放大 1.16；其余轴连不透明度都不动，并把常驻档位调高（平移 1／旋转 .72／缩放 1）。
- 发布 `assets/main-CV6NjW7r.js`（837,163 字节）+ `index.html`；本地/远端逐文件 SHA256 一致、公网 9 项 200。
- `BOX_LIVE=1 node test/browser/build-gizmo.cjs` 通过：新增/改写的断言是"抓住的轴=饱和色且放大"，以及"其余轴的**颜色和不透明度都与静止态一致**"（不再允许压暗）；截图 `Build/gizmo-live-*.png`。本地 348 项 Node 测试与 `build-experience` 通过。
- 后端未动、未重启；备份 `~/officeweb/backups/gizmo-no-dim-20260930/`。刷新页面生效。

## 2026-09-30 宝箱面板重新布局 + 修"提示有了却不滚动"

用户要求「宝箱内的页面再设计一下，布局合理」。旧版是 480px 宽、内容列表只有 260px 高，外层面板还各滚一次（双滚动条），投放表单永远占在下面。
- 新布局：面板 `min(940px,96vw) × min(720px,92vh)`，**只有内容列表滚动**；左栏＝创建人/已读头像 + 滚出提示 + 单列条目（110px 类型位：图片缩略图 / 链接 `↗` / 便签 `≡`，右侧标题、域名、正文、署名、`▶ xx观看`、移除）；右栏＝常驻「放进宝箱」表单；计数 `N / 30 项` 进标题栏；便签超 120 字给「展开全文」。窄屏（≤860px）右栏落到列表下，两边各半、都不裁内容。样式搬进新的 `src/chest.css`（`build.css` 不再管宝箱）。
- 顺带修掉一个真实 bug：`useChestScroll` 的"轻滚 90px 再回顶"以前把计时器放在 effect cleanup 里清，而 `shown` 标记活在 ref 里，依赖变化／StrictMode 开发态重跑就把刚排好的滚动作废——**"提示有了、滚动永远不发生"，4 次里 3 次不滚**。现在计时器归组件自己持有，只在真正卸载（`!element.isConnected`）时收掉；`chest-people.cjs` 也改成用页面内峰值探针断言（从 driver 轮询瞬时动画会漏）。
- 发布：`npm run build`（90 项 public 一致）→ `node Build/deploy-web.cjs --upload --verify`，`index.html` + `assets/main-Cg2lh-81.js`（837,300 字节）+ `assets/main-CINJP6Bo.css`（85,985 字节）；本地/远端逐文件 SHA256 一致、公网 9 项 200。
- 以正式站为准：`BOX_LIVE=1` 跑 `chest-layout.cjs`（面板不出视口、只有一个滚动区、无横向溢出、行不重叠、缩略图有尺寸、表单完整可见、窄屏一档）、`chest-people.cjs`（创建人/已读、开箱记录已读、刷新去重、滚动提示）、`chest-video.cjs`（B站/抖音识别、iframe 控件、最大化/还原、关闭卸载、Esc、小红书回退）全部通过；本地 348 项 Node 测试与 `build-experience` 通过。截图 `Build/chest-panel-{local,live}.png`、`chest-panel-zoom-*.png`、`chest-panel-narrow-*.png`。
- 后端未动、未重启 `officeweb`，未碰 `dist/download/`；备份 `~/officeweb/backups/chest-layout-20260930/`。刷新页面生效。

## 2026-09-30 移动手柄重新设计（低饱和、更小、不被遮挡）

用户在正式客户端里仍看到旧手柄（纯红绿蓝、大而笨重、被柱体吞掉）：原因是上一轮只改了本地源码，客户端加载的是正式站。
- 改动：低饱和轴色 `#c38e88`/`#97c28e`/`#92b1c4`（悬停 `#dfc590`）、缩放方头与支杆奶油 `#ddd0bd`；`setSize` 平移 .7／旋转 .9／缩放 1.15，杆半径 .0075、锥头 .03×.15、方头 .048；**手柄与提示标签 `depthTest=false` + `renderOrder≥900`**，永远画在被操作部件之上；悬停只留当前轴实色、其余淡到 0.14。样式集中在 `OfficeWeb/src/buildGizmoStyle.ts`。
- 发布：`npm run build`（`public/ 与构建产物一致：90 个文件`）→ `node Build/deploy-web.cjs --upload --verify`。前端 14 个文件中 12 个已一致、`index.html` 覆盖、`assets/main-xZjJVQ9D.js`（835,902 字节）新上传；上传后本地与远端逐文件 SHA256 一致，公网 9 项资源全部 200 且哈希相同。线上包内能查到 `#c38e88`/`#97c28e`/`#92b1c4`/`#dfc590`/`#ddd0bd` 与 `RoundedBoxGeometry`。
- 以正式站为准的专项验收：`BOX_LIVE=1 node test/browser/build-gizmo.cjs` 通过（配色、`depthTest=false`、提示标签不被遮挡），截图 `Build/gizmo-live-*.png`。本地 348 项 Node 测试、完整编辑回归与 `SCALE_ONLY` 变体通过。
- 后端未动、没有重启 `officeweb`，没有碰 `dist/download/`；备份 `~/officeweb/backups/gizmo-restyle-20260930/index.html`。
- 客户端加载的就是本站，**刷新页面（Ctrl+R，或从托盘退出重开）即可看到**；已加载的旧页面不会自动替换。未能代为刷新：本机 9210 端口不是 CDP 调试端口（`Build/client-eval.mjs` 默认要 9223），无法从外部重载用户窗口。
- 顺带修掉一个测试竞态：上一次保存还没回来就抓下一个手柄时拖动会被拒（`buildMoveHandle` 现在暴露 `userData.working`），`test/browser/build-experience.cjs` 每次拖动前先等空闲，不再靠运气。
- **同日追加（用户「点中轴的时候怎么看不清了」）**：上一版把选中态调成淡沙色 `#dfc590`，在浅色地板上比静止时还难认。选中态改为饱和轴色 `#d2603f`／`#3f9a55`／`#3579ad` + 手柄放大 1.16 倍 + 辅助线用同一轴色（拖动时 0.6），静止态仍是低饱和。放大的缩放值必须乘在每个 handle 自己的 `updateMatrixWorld` 里——写在帧后处理里会被 gizmo 每帧的 scale 重置盖掉（第一版就是这么失效的）。
  已发布 `main-BcoN5VqN.js`（836,328 字节）+ `index.html`；本地/远端逐文件一致、公网 9 项 200 且哈希相同；`BOX_LIVE=1 node test/browser/build-gizmo.cjs` 通过（新增"抓住的轴是饱和色 + 放大 + 其余淡出"断言），截图 `Build/gizmo-live-hover-*-zoom.png`。备份 `~/officeweb/backups/gizmo-restyle-20260930/index-before-grab-fix.html`。

## 2026-09-30 轻薄绿色观看提示

客户端0.1.36已发布，去掉观看/来电绿光的实边及大范围绿雾，只保留淡绿色边缘柔光。7项相关测试、渲染截图、打包CSS一致性通过；公网整包101724439字节、SHA256及latest.json核验通过。需要更新客户端，网页刷新不生效。详见[验证记录](Soft_Glow_20260930.md)。
## 2026-09-30 Shift+D复制

移动模式复制主选中物件，原位保存并选中新副本，可继续拖动、改色和撤销；工位身份独立，宝箱内容不复制。main-BBUxs12T.js已发布，9项公网资源及3个后端模块哈希一致、服务active，未修改场景存档。
11项复制/历史/工位/迁移测试、构建及90项资源一致性通过；本地和正式前端隔离业务API验证Shift+D、自动选中、独立编辑、撤销重做和漫游禁用通过。
备份backups/shift-duplicate-20260930，快照Build/OfficeWebShiftDuplicate20260930，证据Build/shift-duplicate-production.json。刷新页面生效。

## 2026-09-30 直接清理原场景

用户明确要求直接删除闲置物件。正式存档64件减为29件，revision430，删除28件远处悬空方块和7根残留底座柱。空工位与公共座椅清理前已不在存档中；保留7个已认领工位、其他建筑和宝箱，服务active且已重读核验。
备份backups/manual-scene-cleanup-2026-09-30T03-27-19-657Z。相同存档对照渲染：旧页面仍额外生成202个静态网格，当前公网main-COdbzcf0静态网格为0；旧客户端需要刷新一次卸载旧代码。窗口抓取两次超时，未代为刷新，已告知用户。
证据Build/manual-scene-cleanup-result.txt、Build/scene-cleanup-render-proof.json、Build/scene-cleanup-live.png。

## 2026-09-30 原场景可编辑与移动网格统一

67件原固定物件接入持久化编辑，原有67件建筑和宝箱不变；原工位编号保留。
移动三轴统一25cm；删除同步移除碰撞和显示屏。345项测试、浏览器编辑/删除/撤销/刷新及正式资源隔离验收通过。
main-COdbzcf0.js；9个后端文件及9项公网资源SHA256一致，服务active。
详情：[Editable_Scene_20260930.md](Editable_Scene_20260930.md)。

## 2026-09-30 收起通话窗口紧凑化

通话控制与共享预览均收为约42px高单行，统一堆放并避让建造工具栏、底部操作栏。
已发布 main-dXHuAptl.js / main-BxU7E56U.css；九项公网文件SHA256一致。
1280/390/320px浏览器尺寸、避让、按钮动作、展开及媒体轨保留通过；无需更新客户端。
详情：[Compact_Call_Panels_20260930.md](Compact_Call_Panels_20260930.md)。

## 2026-09-30 小号单箭头与宝箱饰带修复

- 流动箭头改为0.5×0.125×0.75米的单支常见箭头，取消三段发光，沿局部指向轻推8cm再回位；保存原点及朝向不变，旧部件自动换用新几何。目录同步后端。
- 宝箱木板与饰带留2cm间距，保持原外包围尺寸，减少共面闪烁；Blender源及68件导出同步，修改前已备份。
- 构建/90项资源一致性、5项尺寸与缩放测试通过；正式页面隔离数据验证安装、保存、刷新、单箭头及旗帜动画通过。正式main-CJj6qXmz.js，9项公网资源SHA256一致。
- 证据Build/small-arrow-production-evidence.json、Build/small-arrow-backend-evidence.json；截图Build/small-arrow-live.png。用户存档未覆盖。

## 2026-09-30 宝箱头像、流动箭头、缩放与统一配色

- 宝箱chestPeople持久化创建人/读者，由认证账号写入；读者去重，旧创建人不猜测。场景头像金边创建人在前，绿边读者在后；打开面板显示全员。内容多时轻滚90px回顶部并提示，用户操作取消。
- 新增flow-arrow三段循环发光纯Box部件，68件库同步至Blender；全组件scale局部XYZ方头手柄按0.25m目标尺寸吸附，保留底部原点、保存/撤销/碰撞支持，原工位占用保护不变。多选仍只平移。
- 地板移除可见网格；buildColors统一奶油/蜜桃/蓝紫/橄榄材质与更明亮暖光冷色补光。旧颜色ID保留，已建建筑自动统一，无存档迁移。
- 343项Node测试全部通过；正式网站隔离业务API验证头像/已读/刷新去重、内容滚动回弹、6件建筑安装/刷新、旗帜与箭头动画、无网格地板、缩放手柄/25cm尺寸/撤销。Blender68件源、旗帜动画与GLB导出核查通过。
- 正式main-DTAIxClk.js、main-rRVz0zUu.css，9个公网资源SHA256一致；build-store.mjs/build-http.mjs/build-catalog.json逐项核对旧哈希后备份发布，服务active，用户存档不覆盖。
- 快照Build/OfficeWebWorldUpgradeFinal20260929；证据Build/world-upgrade-final-production-evidence.json、Build/chest-people-backend-evidence.json、Build/world-upgrade-tests.log；截图Build/chest-people-live.png、Build/scale-handle-live.png、Build/architecture-live.png。

## 2026-09-29 最大化还原按钮避让客户端标题栏

- 客户端非全屏时视频遮罩顶部留54px，匹配desktop-theme标题栏；整屏模式与浏览器不留空。重置播放器header受全局102px高度影响，保持按钮独立背景和层级。
- 构建及90项资源一致性通过；模拟客户端最高层54px标题栏，命中测试及真实点击还原通过。正式main-C35ka_ee.js、main-DTK16DEL.css，9个公网文件哈希一致。
- 快照Build/OfficeWebVideoRestore20260929，证据Build/video-restore-production-evidence.json。仅前端发布。

## 2026-09-29 竖屏播放器完整缩放

- 抖音iframe使用360×720原始布局，按可用窗口等比缩放，为视频控件和平台底栏预留高度；最大化同样保持竖屏比例。小红书提示更正为“内嵌播放尚未接入”，不宣称平台绝对不支持。
- 正式main-DqdC944k.js、main-gkT0eWKZ.css，9个公网文件哈希一致；构建/90项资源一致性、本地480×890与1500×700窗口边界及最大化还原检查通过。没有修改后端或存档。
- 快照Build/OfficeWebPortraitFitFinal20260929，证据Build/portrait-fit-final-production-evidence.json。

## 2026-09-29 宝箱内嵌视频

- B站BV/AV/分P/时间点/番剧单集、抖音完整视频链接识别为官方iframe；B站b23.tv和抖音v.douyin.com通过认证后端白名单逐跳解析，6秒超时、5跳上限，拒绝任意域名/内网跳转。不抓取视频文件。
- 独立窗口最大化/还原，关闭即卸载iframe；使用官方播放器的播放暂停控件，保留原页入口。小红书仅识别平台并打开原页，未发现可确认使用的官方嵌入方案。
- 正式main-cZ9K-jp0.js、main-C54g5qYj.css，9个公网资源哈希一致；build-link.mjs/build-http.mjs备份发布、哈希核对、服务active，存档不变。
- 构建/90项公共资产一致性、解析安全测试和工位后端回归通过；正式页面窗口最大化/还原/关闭/Esc/降级通过；真实B站视频媒体时间推进后暂停成功，截图Build/chest-video-live.png。抖音验证了嵌入地址及窗口，未验证有效视频的媒体播放。
- 官方依据：[B站外链播放器](https://player.bilibili.com/)、[抖音嵌入播放器文档](https://developer.open-douyin.com/docs/resource/zh-CN/dop/develop/openapi/video-management/douyin/iframe-player/get-iframe-by-item)。抖音使用文档示例的公开播放器地址；不宣称所有视频均可嵌入。
- 快照Build/OfficeWebChestVideo20260929，证据Build/chest-video-production-evidence.json与Build/chest-video-backend-evidence.json。

## 2026-09-29 组件滚轮横向浏览

- 鼠标在组件列表上，普通纵向滚轮直接左右浏览；保留触控板横向滚动及Ctrl缩放，不传递到场景缩放。
- 正式main-DRBNCc3H.js，9个公网资源哈希一致；构建及90项公共资源一致性通过。本地/正式页面双向滚动、相机不变、收起重开后横向滚动通过。
- 快照Build/OfficeWebPartsWheel20260929，证据Build/parts-wheel-production-evidence.json；仅前端发布。

## 2026-09-29 漫游关闭建筑选中

- 漫游不再显示悬停选中框，E/F编辑快捷键仅在编辑模式生效；选座与宝箱业务互动保留。
- 正式main-D3ul1DP_.js，9个公网资源哈希一致，未修改后端/存档；快照Build/OfficeWebRoamSelection20260929。
- 构建及90项资产一致性、本地完整编辑回归、正式页面漫游专项通过。正式完整回归在后续旋转手柄命中断言失败，漫游检查已通过；该额外回归问题待复查。

## 2026-09-29 客户端 0.1.35：撤销任务栏 owner 回归

已发布 0.1.35，正式 latest.json 已更新，公网整包 101724823 字节和 SHA256 匹配。
SHA256：6f13040dd55fb138b8a187d4848d3e53f8a32d5517c60bcde0e44303ff4e1493。
取消 Explorer owner 依赖；事件与原生状态检查不依赖点击，正常时不反复提层。
155 项测试、打包模块 20 次无点击恢复、真实头像窗口 8 次恢复和桌面像素检查通过。
当前安装的 0.1.34 未强制退出；需要更新桌面客户端，网页刷新不能替换外壳代码。
详见 [Dock_Independent_20260929.md](Dock_Independent_20260929.md)。

## 2026-09-29 客户端 0.1.34：任务栏空白处点击闪烁

已发布 `/download/iruler-dream-Setup-0.1.34-x64.exe`，正式 latest.json 已更新。
公网整包 101723096 字节、SHA256 与本地一致：
`d5d9030f6e8a731949977e614eb01d99e44c3d83982fd4f3aef0ca2815759668`。
原生窗口 owner 关系替代正常状态下的周期性抢置顶，153 项单测与原生窗口重排测试通过。
从实际 app.asar 加载原生依赖测试通过；用户需更新客户端，未强制安装或重启。
网页及后端本次不改。详见 [Dock_Taskbar_Owner_20260929.md](Dock_Taskbar_Owner_20260929.md)。

## 2026-09-28 蓝色胡子弹出角色与悬停卡片

- 已部署 main-B8Le83Ox.js / dock-CD7cIBLD.js / dock-CMqxuJsV.css。
- 主窗口与头像条增加同源 BroadcastChannel 完整外观传递；IPC 和名单兜底保留。
  最新提醒里的外观优先，随后旧桥丢字段的消息不会覆盖已收到的蓝色和胡子。
- 卡片改为顶部姓名/状态、左侧 218×123 预览、右侧三个图标文字按钮。
  实测卡片 332×173，可容纳于既有客户端 340×210 预留区域，保留气泡尖角。
- 源码测试：33 项规则测试、10 色招手、旧桥回退、双窗口蓝色胡子传递、完整头像条交互通过。
  另有 25 项含并行表情功能兼容测试通过。修改的 OfficeWeb 文件均不超过 500 行。
- 公网全部 14 个发布文件 SHA256 与独立构建快照一致；正式 dock.html 的双窗口渲染、
  卡片尺寸和语音按钮转发通过，已查看 Build/hover-card-live.png 与 blue-beard-live.png。
- 备份：/home/ubuntu/officeweb/backups/hover-fix-20260928/；构建：Build/OfficeWebHoverFix20260928。
- 本次只发布前端；同工作区的自动表情任务由其自身处理服务端发布。
- 已运行的旧头像条页面不会因主窗口 F5 自动重载：用户从托盘退出后重新打开客户端即可加载，
  无需重新安装。本次未连接用户实际客户端调试端口，因此未宣称其运行中的窗口已自动更新。
## 2026-09-28 灵动岛留白与配饰贴合

灵动岛外框采用任务栏高度的80%（40px任务栏对应32px），头像保持40px与8px间距。
尺面实测 y=-.043；胡子向内移动 .028，头发前部深度压至38%并贴近面板。
保留卡通块面造型，同步GLB、选角缩略图和透明配饰层；侧面渲染见 Build/accessory-fit-side.png。
已发布 main-BmkGcjrl.js / dock-DLeOY2Uz.js / dock-5g3ymsjG.css。
89项发布文件服务器SHA256一致；98项公网资源及入口SHA256一致；公网状态栏浏览器检查通过（80%外框、统一头像、配饰组装）。
构建与90项public一致性通过。后端未重启。
备份：`/home/ubuntu/officeweb/backups/accessory-fit-20260928/`。
加工源及旧模型：AssetSources/Characters/RulerMascot/cartoon-fit-v4/。

## 2026-09-28 客户端 0.1.33：任务栏切换时头像窗层级恢复

已发布 `/download/iruler-dream-Setup-0.1.33-x64.exe`，latest.json 已更新。
149 项桌面测试通过；修复模块 asar 与源码一致，既有打包检查通过。
公网整包大小 101272052 字节、SHA256 与本地一致：
`1f935eb3f3b9dae3e4cb3089d617d4eb4af8850598c12794a24503090679766d`。
任务栏操作期间快速恢复头像窗层级，退出任务栏后覆盖 800ms 切换动画；不抢焦点。
需要更新桌面客户端；未强制替用户重启。网页和后端本次未改。
原因、验证边界见 [Dock_Taskbar_Switch_20260928.md](Dock_Taskbar_Switch_20260928.md)。

## 2026-09-28 自动头像状态

已发布忙碌、困倦、在线十分钟开心及专注/休息/招手规则，所有在线用户同步。
前端九文件公网 SHA256、后端两文件远端 SHA256、服务 active 均通过。
正式 dock.html 六表情合成验证通过；无需重装客户端。
详情与阈值见 [Automatic_Expressions_20260928.md](Automatic_Expressions_20260928.md)。

## 2026-09-28 悬停/来电角色同步与预览恢复

已发布 main-C3fNZRdT.js / dock-Bio-QhuL.js / dock-DSWxYLwX.css / dockStage-eJn1Y0QW.js。
舞台优先读取在线名单的完整 appearance 或 look: 字符串，兼容旧桌面桥丢弃来电外观字段；名单换装也触发舞台更新。
40px 任务栏的头像由 36px 增至 40px；所有状态保持相同尺寸和 8px 间距。
选角预览加载失败自动重试两次，最终失败保留手动重试，并记录具体错误。
用户历史首次失败没有当时错误日志，不能认定是网络或模型本身；已故障注入验证首个模型请求失败后自动恢复。
构建、90 项 public 资产一致性、37 项单测、10 种配色招手和旧桥悬停/来电装扮测试通过。
正式资源浏览器验证头像尺寸、装扮、选角失败恢复、设置换装和响应式通过。
两个 HTML 与全部 7 个 JS/CSS 逐文件公网 SHA256 匹配；后端未重启。
备份：/home/ubuntu/officeweb/backups/greeting-preview-20260928/。
首次批量公网 fetch 曾超时；改用逐文件 curl 校验全部此次代码资源通过。
## 2026-09-28 头发与胡子改为卡通块面

已发布六种发型、六种胡子的重建模型及选角缩略图、状态栏透明配饰。
main-C3fNZRdT.js / dock-Bio-QhuL.js / characterModel-GaPglLJi.js。
模型 1,168,140 字节，保留头骨绑定和动作库。备份在 `/home/ubuntu/officeweb/backups/cartoon-groom-20260928/`。
服务器逐文件 SHA256 通过；首次公网并发 fetch 被连接中断，改用 curl --noproxy 后全部 98 项资源和入口 SHA256 通过。
构建与 11 项外观单测、19 配件组合渲染、多人换装同步通过。
公网设置浏览器测试本次超时，未计为通过；实际模型和状态栏视觉已在本地应用渲染检查。
后端未重启。详见 [Cartoon_Groom_20260928.md](Cartoon_Groom_20260928.md)。

## 2026-09-28 状态栏头像加大、间距加宽

40px 任务栏下头像从 32px 增至 36px，头像间距从 2px 增至 8px；保留随任务栏高度适配。
发布 dock-DHVQvkDq.js / dock-hXDrtB-i.css。14 项发布文件远端一致，公网入口及引用资源校验通过。
本地与公网浏览器验证 10 个头像、所有状态尺寸、8px 间距、边界和窗口宽度上报均通过。
后端未重启；构建及 90 项 public 资产一致性检查通过。

## 2026-09-28 状态栏共用姿势、同步场景配饰

已移除独立头像表情选择和账号 expression 字段；旧字段兼容忽略。
状态栏与场景共用配色、头发、帽子、胡子、眼镜，所有人使用同一套状态姿势。
设置改为只读的三种状态预览。困倦/专注为保留素材，暂不自动触发。
已发布 main-BTXPkW0v.js / dock-BUoec6EA.js / useDockPortrait-Cp9wElWK.js。
39 项前端文件远端及公网 SHA256 匹配，look.mjs 服务端哈希匹配，officeweb active。
备份：`/home/ubuntu/officeweb/backups/dock-outfit-shared-20260928/`。
构建及 36 项单测通过；本地多人换装同步、设置分类响应式、状态栏尺寸测试通过。
公网资源状态栏测试通过：共同姿势、同装扮同图片、胡子叠加、忽略旧个人表情、固定尺寸。
公网资源设置测试通过：配色/帽子真实像素变化、三个只读状态头像、分类与响应式布局。

## 2026-09-28 薄片尺子表情头像

已发布 6 张透明表情底图、19 张独立配件层、状态栏合成器与设置中的头像表情选择。
main-BCcWm7bz.js / dock-Bt7zh1Tj.js / expressionPortrait-DQR0uXtv.js。
39 项此次前端发布文件远端与公网 SHA256 匹配；look.mjs 服务端校验模块哈希匹配。
officeweb 已重启且 active；旧入口与 look.mjs 备份至
`/home/ubuntu/officeweb/backups/expressions-thin-20260928/`。
详见 [Expression_Kit_20260928.md](Expression_Kit_20260928.md)。

## 2026-09-28 角色配件重新建模

已发布 19 件重建配件、平滑眼睛、49 张应用渲染缩略图与头像柔光。
main-CeWsWQHk.js / dock-DOfcHoWU.js / characterModel-BzT6uWjA.js。
65 项远端与公网 SHA256 一致；旧模型、缩略图与入口已备份至
`/home/ubuntu/officeweb/backups/accessories-20260928/`。后端未重启。
详见 [Accessory_Remodel_20260928.md](Accessory_Remodel_20260928.md)。

## 2026-09-28 状态栏头像尺寸统一

已发布 dock-Cftqhxvy.js / dock-BGLD_B6p.css / portraitRenderer-BwTz73i7.js。
头像共用固定相机，方形外框禁止 flex 压缩；悬停、提醒和拖拽动画取消缩放。
64 项远端与公网 SHA256 匹配，后端未重启。浏览器使用公网实际资源验证
10 种搭配、5 种状态与各动画时刻均为 32×32；截图 Build/dock-uniform-size.png。

## 2026-09-28 配件特写、坐姿与头像修复

已发布并逐文件校验。详见 [Face_Sit_Dock_20260928.md](Face_Sit_Dock_20260928.md)。

## 2026-09-28 选角与设置重设计

已发布 main-BNupYH-3.js / main-DGSa0sqm.css；63 项线上文件哈希匹配，后端未重启。细节见 [Settings_Look_20260928.md](Settings_Look_20260928.md)。

# OfficeWeb 部署（VPS 115.159.43.237）

## 2026-09-28 12:40 尺子角色第三轮：远端跑步位 + `__sendMotion` 探针（前端 `main-CwVrI5lk.js`；后端未动、**未重启**）

- 运动快照补 `running` 位（`OfficeAvatar.getState()` → `types.Motion` → `RemoteAvatars` 按它放
  `跑步循环_Run`，老客户端不发就当走路）；`RemoteAvatars.snapshot()` 顺带多报 `running` 与当前
  `clip`（walk/run/idle/pose），方便诊断。
- `sceneProbe` 加 `__sendMotion`（测试用：把一份构造好的运动快照交给正常上报通道）。
- 部署：`node Build/deploy-web.cjs --upload --verify` → 只变了 `main-CwVrI5lk.js` 与 `index.html`，
  上传后本地/远端逐文件一致、公网全 200。核验（curl 原始字节 SHA256）：
  `main-CwVrI5lk.js`、`icons-DjQzsbEJ.js`、`characterModel-Bi6m6kff.js`、`main-BLJPGaBl.css`
  **全部 match=true**，线上 `index.html` 入口已是 `main-CwVrI5lk.js`。**后端未动，没有重启 officeweb。**
- 回归：单测 **292/292**；浏览器 `look` / `look-sync` / `greet-characters` / `sit-probe` / `wear-probe` / `dock` 全过。

## 2026-09-28 12:28 尺子角色第二轮：修掉「默认短发变成光头」（前端 `main-BSMQ86Z2.js` / `icons-DjQzsbEJ.js` / `characterModel-Bi6m6kff.js` / `dock-Bj_icVWv.js` / `dockStage-BsvOShBi.js`；后端 `look.mjs`，**已重启 officeweb**）

- 第二轮自查新增了 `test/browser/look-sync.cjs`（两个真实浏览器 + 隔离服务器：甲换配色/戴礼帽，
  乙那边画出来的远端角色要跟着变），**它当场抓到**：远端默认外观是 `kraft|none|none|none|none`
  ——默认短发没了，**任何没有外观载荷的人（老客户端、刚注册没捏过的账号）在别人眼里都是光头**。
- 根因在**两处**（客户端 `resolveAppearance` 与服务端 `sanitizeAppearance`）：认不出来的配件回退到
  "该槽位列表第一项"，而第一项是 `none`。都改成回退到 `DEFAULT_APPEARANCE.accessories[slot]`。
  测试补在 `test/look.test.mjs`（空载荷必须 == `DEFAULT_APPEARANCE`）与 `look-sync.cjs`。
  **教训**：默认值只有 `DEFAULT_APPEARANCE` 一处真源，任何回退都要指向它。
- 部署：`node Build/deploy-web.cjs --upload --verify`（8 个文件，本地/远端逐文件一致、公网全 200）
  + `scp look.mjs`（哈希 `139f4c0a…` 与本地一致）→ `sudo -n systemctl restart officeweb` → `active`。
- 线上核验（curl 取原始字节比 SHA256）：`main-BSMQ86Z2.js`、`icons-DjQzsbEJ.js`、
  `characterModel-Bi6m6kff.js`、`dock-Bj_icVWv.js`、`dockStage-BsvOShBi.js`、`main-BLJPGaBl.css`、
  `ruler.glb` **全部 match=true**。
- 回归：单测 **292/292**；浏览器 `look` / `look-sync` / `greet-characters` / `sit-probe` /
  `wear-probe` / `dock` 全过。

## 2026-09-28 12:16 尺子角色上线：换掉 21 个旧角色 + 两步捏人（前端 `main-Big2eYvM.js` / `characterModel-zhvr9ZSi.js` / `dock-FrwJMBOt.js` / `dockStage-COZ38jmU.js` / `main-BLJPGaBl.css`；后端 `server.mjs` / `accounts.mjs` / `preview-relay.mjs` / 新增 `look.mjs`，**已重启 officeweb**）

- 需求与实现细节见 [RulerCharacter_20260928.md](RulerCharacter_20260928.md)：把角色换成用户元绘工程里的「尺子角色」，
  10 个配色 + 4 个槽位配件（眼镜/头发/胡子/帽子），1 先配色 → 2 选配件；坐下改用已授权的 `坐姿打字_Type`。
- **前端**：`node Build/deploy-web.cjs --upload --verify` → 8 个文件（两个入口 + 6 个 assets）上传后
  本地与远端 SHA256 逐文件一致，公网 9 个资源全 200。**这个脚本只覆盖两个入口 + `assets/*` 顶层**，
  角色模型在子目录里，所以另外用 `scp` 补传：
  - `assets/characters/ruler.glb`（710,488 字节，与本地哈希 `31d10e27…` 一致）
  - `assets/characters/thumbnails/`（39 张：`body-*` 10 / `full-*` 10 / `wear-*` 19）
  - `assets/draco/`（4 个文件）与 `assets/basis/`——**这两份原来线上 dist 里没有**（只有 `public/assets/basis/` 的历史副本在别处），
    而 `ruler.glb` 是 Draco 压缩的，缺解码器会静默加载失败。**下次换角色一定要连解码器一起查。**
  - 旧资源移到 `~/officeweb/backups/ruler-20260928/`（21 个旧角色 GLB + 21 张旧缩略图，共 44 个文件），
    线上 `assets/characters/` 现在只剩 `ruler.glb` + 39 张新缩略图 + `characters.json`。
- **后端**：`server.mjs`（`character` 事件 → `appearance`，白名单收敛并只在真的变了时广播）、
  `accounts.mjs`（`setCharacter` → `setAppearance`，`publicUser` 返回 `appearance`）、
  `preview-relay.mjs`（`watched` 带 `appearance`）、新增 `look.mjs`（由 `tools/build_look_manifest.mjs`
  从 `src/look.ts` 生成的白名单）。四个文件上传后哈希均与本地一致，`sudo -n systemctl restart officeweb` → `active`，
  日志 `OfficeWeb ready on http://127.0.0.1:3108`。
- **线上核验**（本地 `Build/OfficeWeb` 的原始字节 vs 公网 `curl` 取回来的字节，SHA256 逐一比对）：
  `main-Big2eYvM.js` `da0b3bf20770` / `icons-DUxuLjyH.js` `77ac1824ea49` /
  `characterModel-zhvr9ZSi.js` `6c693ba50b3b` / `main-BLJPGaBl.css` `bc8a36c73401` /
  `dock-FrwJMBOt.js` `b90962be96a9` / `dockStage-COZ38jmU.js` `2fb8de73020a` / `dock.html` / `index.html` —— **全部 match=true**。
  `ruler.glb`、`body-rose.png`、`wear-hat-beret.png`、`draco_decoder.wasm`、`basis_transcoder.wasm` 均 HTTP 200 且类型正确。
- **注意**：文本资源**不要**用 `Invoke-WebRequest` 取回来比哈希——PowerShell 会把内容解码成字符串再编码，哈希必然不等（本次先误判过一次）。
  要用 `curl.exe -o` 拿原始字节；`curl` 走 Windows 的 schannel，不用加 `-k`。
- 测试：`OfficeWeb` 单测 **292/292**；浏览器 `look.cjs` / `greet-characters.cjs` / `dock.cjs` 通过。
  未做人眼观感验收（坐姿好看与否只有数值证据）。

## 2026-09-2X 去掉"我自己头像"那圈白边（用户：「为什么我自己的头像还有一个白边 去掉吧」）—— 已上线（前端 `dock-9D6Eik2k.js` / `dock-CC0_nwE3.css`）

- 那圈边是 `.dock-avatar.mine` 的白色内描边（`inset 0 0 0 1.5px rgba(255,255,255,.6)`，悬停 `.85`、被看时 `.8`），当初当"这是我"的标记加的。三条规则**全部删掉**；`.mine` 类保留（自己仍排最前、文件拖拽时 `.mine.dropping` 还用它）。
- **自己怎么认**：排在最前 + 悬停卡片里写着「（我 · 我的工位）」；被我看时照样走 `.open` 的强调色光圈。
- 线上核验 `Build/live-ui-verify.cjs` 新增断言 **`mineShadow === "none"`**（我自己的头像 computed `box-shadow` 必须为空）并 PASS；`test/dock-rules.test.mjs` / `dock.cjs` 不受影响（断言的是 `.mine` **类**与卡片内容，不是那圈边），网页 **283/283**、`dock.cjs` PASS。

## 2026-09-2X 头像**去掉自己的小底色**（用户：「头像本身的小背景有点黑啊 直接去掉内部小背景」）—— 已上线（前端 `dock-BtTYwdF3.js` / `dock-BELoqsNw.css`；后端未动）

- 改法：`frameColors().chip` 恒为 `transparent`（深浅任务栏都一样），`.dock-avatar` 的 `background-color` 走 `--dock-chip-bg: transparent`；悬停那一层浅色高亮保留（那是"摸到了"的反馈，不是垫底）。
- **补偿**：原来那块深垫底在 `filter: brightness()` 之下也一起被压暗，等于帮着压住了贴图亮度。去掉之后条子平均亮度从 37.4 跳到 **67.8**，所以把头像的 `brightness(.86 → .68)`、`saturate(1.7 → 1.55)` 补回来，最终 67.1（比原来亮一档是必然的：少了一层暗底；用户要的就是"直接透出任务栏"）。量法见 `Build/dock-white-measure.cjs` / `dock-white-regions.cjs` / `dock-avatar-probe.cjs`（后者直接问页面要 computed filter/背景/贴图 URL）。
- 回归：`test/dock-rules.test.mjs` 断言 `chip === 'transparent'`（深浅都一样）；网页 **283/283**、`dock.cjs` PASS、`tsc --noEmit` 干净；`dock.css` 485 行。
- 公网核验 `Build/live-ui-verify.cjs` PASS：`avatarBg rgba(0,0,0,0)`（真的没垫底了）、`cardBg rgba(20,21,24,.88)`、`stripLine .14`、`tipToAvatar 1`。

## 2026-09-2X 按用户三点要求改头像条：**小窗给实底** + **条子更透、边更细** + **小窗加指向头像的尖** —— 已上线（前端 `dock-BADOx3Hz.js` / `dock-DDlDG0Wi.css`；后端未动）

- 用户原话：「弹出的小窗不要完全透明啊 是指状态栏头像设计要改的透明一些，边缘细一些也不要太明显，以及我希望小窗有一个气泡指向的尖尖那个东西指向头像」。
- **① 小窗（悬停卡片）不许完全透明**：我上一轮为了"降低透明度"把卡片压到 `rgba(18,18,20,.52)`，透到看不清字。现在深色 `rgba(20,21,24,.88)`、浅色 `rgba(250,250,250,.93)`，`backdrop-filter` 保留（`.88` + blur 仍然是一块玻璃，但内容清楚）。**注意主进程给的卡片空间是 `CARD_SPACE = 210`，卡片实测 175 高；尖探出卡片 11px，仍在窗口内。**
- **② 条子更透、边更细**：白色浮层 `.05 → .04`（悬停 `.07 → .06`），边框 `.2 → .14`（浅色 `.16 → .12`），强调色边框 `.55 → .5`，头像垫底 `rgba(10,12,12,.2) → .16`。条子平均亮度 36.4 → 35 左右，边线不再是一条明显的白线。
- **③ 小窗的气泡尖指向头像**（用户明确要的）：`.dock-card-tip` = 转 45° 的方块（对角线朝下 = 圆角小三角），`bottom: -11px` 让它探到**头像条上边缘**、和卡片连成一块；位置由纯函数 `cardTipOffset(cardLeft, cardWidth, avatarCenterX)`（`dockRules.ts`）算，**夹在卡片内**（否则会被 18px 圆角切掉），页面在悬停时量头像中点与卡片左边界得出；任务栏在上方时（`.edge-top`）转 225° 指向上面的头像。
  - 尖**不能挂 `border`**：转 45° 后边框会变成一根斜线；改用 `inset 0 0 0 1px rgba(255,255,255,.16)` 那道极淡边光，尖本身才看得出形状（实测截图上不加就是一团糊）。尖的底色比卡片再实一点（`--dock-card-tip-bg`），小尺寸下太透就糊在一起。
- 回归：`test/dock-rules.test.mjs` 新增一项（尖对准头像中点、超界夹住、卡片宽度未知时返回 null、页面/样式接线）；`dock.cjs`（真实页面）PASS；网页 **283/283**；`tsc --noEmit` 干净；`dock.css` 485 行、`dockRules.ts` 333、`dock.tsx` 362（都 ≤500）。
- 上线：`Build/deploy-web.cjs --upload --verify` 上传 8 个文件，复验本地=远端、公网 9 个资源 200 且哈希相同。**重建后文件名会变**（`dock-DDlDG0Wi.css` 等），用 `Build/same-content.cjs` 证实重建产物与线上逐字节相同（规范化哈希后）。
- 公网核验 `Build/live-ui-verify.cjs` PASS：`cardBg rgba(20,21,24,.88)`（不再透明）、`stripGlass .06`、`stripLine .14`、`tipBox [23,23]`、**`tipToAvatar 1`（尖与头像中点只差 1px）**；浅色档 `rgba(250,250,250,.93)`。
- 仍然要用户做的一步：**重启客户端**（头像条小窗启动时加载一次），否则看到的还是旧的那份。

## 2026-09-2X 头像条"还是太白了"：**不是透明的问题，是白色浮层太浓** —— 已上线（前端 `dock-D1-Mhz6f.js` / `dock-C4cCZsbU.css` / `main-Dj86UWuF.js`）

- 用户反馈：「还是不好看 太白了 是不是透明的问题」。**先量再改**，写了个逐像素工具 `Build/dock-white-measure.cjs`（同一套假桥 + 同一层 `#1b1b1b` 任务栏底，渲染两份产物并量条子区域的加权亮度）+ `Build/dock-white-regions.cjs`（把条子分成"框底/每个头像/头像缝"分别量）。
- **量出来的真相**：① 白的是**框那层白色浮层**——深色任务栏上 `rgba(255,255,255,.1)`、悬停还加到 `.17`，白色一层层叠上去就是一块白玻璃；② 头像本身**一点不白**（旧版头像格子内部亮度 44），我上一轮为了"降低透明度"把垫底换成白色 `.14` 反而又加了一层白。
- **改法**：框的白色浮层降到 **.05**（悬停 .07），顶部高光 `.16 → .07`，头像垫底改成**暗色** `rgba(10,12,12,.2)`（由 `frameColors().chip` 按主题给，浅色任务栏才用亮垫底），卡片底色 `rgba(18,18,20,.52 → .58)` 补回一点（透明降了要保住可读性），悬停白 `.2 → .12`，按钮阴影收细。条子平均亮度实测 **41.7 → 36.4**。
- **中途一次弯路（值得记下来）**：我曾按"头像太白"的方向把头像提亮（brightness .74 → .88），区域实测头像亮度 **44.3 → 91.8**，方向完全反了；发现后用 `Build/dock-dim-sweep.cjs` 扫参数时又发现**贴图本身是透明底的暗色角色**（它显示多少亮度完全由 CSS filter 决定）。结论：这类"白不白"必须**量**，不要凭截图里的观感调。
- **构建产物漂移的坑**：同一份源码在依赖/分块名变化后重建，主包会**逐字节相同但文件名不同**（`main-ZLu45is8.js` → `main-Dj86UWuF.js`，两者规范化分块名后 745,716 字节逐字节相同；`icons`/`characterModel`/`dockStage` 分块名也跟着变）。所以"远端缺失新文件名"不等于"有别人的改动混进来"，用 `Build/build-drift.cjs` + `Build/same-content.cjs` 规范化比对来证明，**别靠文件名判断**。
- 上线：`Build/deploy-web.cjs --upload --verify` 上传 8 个文件（两个入口 + 6 个 assets），复验本地与远端逐文件一致、公网 9 个资源 200 且哈希相同；后端未动、未重启。
- 公网核验：`Build/live-ui-verify.cjs` PASS —— `stripGlass rgba(255,255,255,.07)`、`cardBg rgba(18,18,20,.58)`、`cardRadius 18px`、`buttonBg rgba(255,255,255,.96)`+深色图标+`50%`+36×36、`avatarBg rgba(10,12,12,.2)`、强调色光圈在；浅色任务栏 `rgba(0,0,0,.08)` + `rgba(255,255,255,.62)`。`Build/live-dock-verify.cjs` PASS（来电气泡、接听、顺序冻结）。截图 `Build/live-dock-look.png`。
- 仍未定：用户看到的"太白"到底指哪一块（条子/头像/卡片/白按钮）还没确认——线上产物已按"白色浮层降到极淡"这一版发布，**等用户指定具体位置再动**，不再盲调。

## 2026-09-2X 「右键切屏卡顿」修复 + 头像条按参考图重做外观：**已上线**（前端 `main-ZLu45is8.js` / `dock-UjNvyHif.js` / `dock-DiBDYFk2.css`；后端未动、未重启、未发新客户端）

- 用户报障与需求：① 「右键切换屏幕时有一丢丢卡顿…右键出来以后，就整个变卡了。鼠标拖动都变慢了」（测试机三块屏）；② 给了参考图：「把状态栏上的头像部件改的灵动一些…头像背景和组件降低透明度，以及小窗口的圆角绘制，按钮的白色」。
- **卡顿的根因不是"换屏本身"**，而是 `MonitorContextMenu` 的 effect 依赖写了 `[close]`，而 `close` 是 `App.tsx` 每次渲染新建的箭头函数 —— 页面每重渲染一次（people/seats 广播、任何交互）就重跑 effect、重调 `officeDesktop.displays()`；真客户端里那一次就是 `desktopCapturer.getSources`：**每块屏抓一遍 480×480 缩略图**（用户三块屏，实测 12 次重渲染 → 24 次重读）。主进程被灌满，所以卡的是整台机器、连鼠标都发飘。修法：回调放 `useRef`（`closeRef`），effect 依赖改 `[]`。**换屏那一瞬约一秒的停顿是正常设计**（要重新采集 + 原地换轨，编码器重来），没有改。
- **头像条外观**（纯 CSS + 一个 `open`/`alert` 类）：条子与悬停卡片共用半透明玻璃材质（`backdrop-filter` blur）、卡片圆角 12 → 18px、动作按钮改成白色圆钮（36px、白底深色图标）、头像垫底改淡亮色玻璃底并把亮度 `.74 → .88`、悬停/被看时带强调色光圈、新人弹一下、有未读/未接来电的一呼一吸柔光。
- **两个实测踩到的坑**（写进 `AGENTS.md` 与源码注释）：`color-mix()` 在预乘空间会把半透明色的 RGB 一起拖白（浅色任务栏"黑色浮层"被算成 `rgba(35,35,35,…)`，既有断言当场红）→ 悬停底色按主题写死；`.dock-frame` 上不能加 `transition: background`（主题切换时 computed 读到过渡插值，断言随机红）。
- **上线动作**：`npm run build` → 新脚本 `Build/deploy-web.cjs` 逐文件 sha256 审计（**只比哈希、不 `scp -r`、不碰 `dist/download/`**）：本地 14 个文件里 9 个已一致，**5 个有差异**（`index.html`、`dock.html`、`assets/{main-ZLu45is8.js,dock-UjNvyHif.js,dock-DiBDYFk2.css}`）→ `--upload --verify` 上传后复验 **本地与远端逐文件一致**，公网 9 个资源全部 `HTTP 200` 且 SHA256 与本地逐一相同（`main-ZLu45is8.js` 756,544 字节）。**后端未动、没有重启 officeweb。**
- **公网核验（跑的是线上产物）**：新脚本 `Build/live-ui-verify.cjs` 从正式站抓下 `index.html`/`dock.html` 与它们引用的 assets，交给本地测试服务端伺服（cookie 认证必须同源），用 Playwright 实测：
  - `线上切屏菜单：开菜单读 1 次，12 次重渲染后 1 次（旧版是 24 次）`，且选中后 `selectDisplay('22')` 被调用、菜单关闭、广播了 `office-display-changed`；
  - `线上头像条实测：{"stripGlass":"rgba(255,255,255,0.17)","stripBlur":"blur(18px) saturate(1.25)","stripRadius":"999px","cardRadius":"18px","cardBg":"rgba(18,18,20,0.52)","cardBlur":"blur(22px) saturate(1.3)","buttonBg":"rgba(255,255,255,0.96)","buttonFg":"rgb(27,30,28)","buttonRadius":"50%","buttonBox":[36,36],"cardBox":[294,175],"avatarBg":"rgba(255,255,255,0.14)","openRing":"rgb(0,120,215) 0px 0px 0px 2px …"}`；
  - 浅色任务栏那一档：`{"strip":"rgba(0,0,0,0.1)","card":"rgba(255,255,255,0.62)","ink":"rgb(29,33,29)"}`（黑色浮层 + 浅色卡片 + 深色字）。
  - 截图 `Build/live-dock-look.png` / `live-dock-look-light.png` / `live-screen-menu.png`。
- **既有线上行为核验同时跑过**：`node Build/live-dock-verify.cjs` → `线上 dock.html 的脚本：["/assets/dock-UjNvyHif.js"]`、来电气泡挂头顶（`barToStage 0`、`centerOff 0`、`clip Wave`、`motion 0.83`、`stagePx 452`）、顺序冻结与 2 秒后换序 PASS。
- 回归：`OfficeWeb` 单测 **282/282**、浏览器 `dock.cjs`（新外观下）**PASS** 且连跑两次稳定、`screen-menu-render.cjs` PASS；改动文件行数 `dock.css` 479、`dock.tsx` 344。
- **客户端不用重发**：两项都是纯前端，装着的客户端重启或刷新就拉到新分块。仍未做：真机（用户这台三块屏的客户端）上抓一张贴着真实任务栏的截图核对玻璃效果——本地/线上核验的背景是脚本铺的，真机上任务栏合成才是最终样子。

## 2026-09-22 14:31 「头像这个 ui 有时候会消失找不到」：查出**整屏那一路会把条子永久藏起来**（前端 `main-BL0R9IcA.js` / `dock-BdOUFoAn.js`；客户端 `0.1.32`，**未发布**）

- 用户报障：「头像这个 ui 有时候会消失找不到 检查一下问题，注意不要造成新的问题」。
- **先量现场，不猜**：枚举客户端所有顶层窗口 → 当时条子是好的（`iruler 头像条` pid 21712，visible=True，`1465,1040 191x40`，`ex=0x8000008` = TOPMOST|NOACTIVATE）；任务栏**没有**开自动隐藏（`StuckRects3` 的 offset 8 = 0x02，bit0 = 0）；主屏 1920×1080、任务栏 40 DIP、双屏（办公窗口在下面那块）。
- **读代码找出两个真会"永久藏"的结构性问题**：
  1. **三个隐藏理由共用一个 `visible` 标志**。`dock-window.cjs` 里"页面说藏"（共享屏幕/未登录）和"主进程说藏"（整屏）写的是**同一个标志，最后一个写的赢**；而整屏那一路靠 `enter-full-screen` / `leave-full-screen` 两个事件 —— 而 `fullscreen.cjs` 的注释**自己就写着**：这个无边框透明窗口上 Electron **不可靠地**发这两个事件（"the window resizes, but nothing observes it"，2026-09-15 就踩过）。事件漏一次 → 条子**再也不回来**，只能重启客户端。这与用户说的"有时候消失找不到"完全对得上（看全屏视频/整屏共享后最容易遇到）。
  2. **窗口被异常销毁后没人重建**：`window.on('closed')` 把 `window` 清空，而 `ensure()` 只在启动时调过一次 —— 窗口一旦被系统/驱动收掉，条子从此永久消失。
- **顺手实测出一个更硬的坑**：把整屏改成"每次现算"后，真机跑 `Build/dock-why-check.mjs` 发现进整屏时**根本没藏**——`mainWindow.isFullScreen()` 在页面调 `setFullscreen(true)` 之后**仍然返回 false**（页面类加上了、窗口也铺满了屏幕）。所以"整屏判断"改成 `fullscreen.cjs` 新增的 `isWindowFullscreen()` = **我们自己请求过（`REQUESTED`）|| 系统说整屏**；`main.cjs` 把它当 `systemHidden` 传进小窗（每 1.5 秒现算，不依赖事件）。`chrome.cjs` 的 `did-navigate` 顺手改成**无条件** `setWindowFullscreen(window, false)`（它内部本来就有"没进过整屏就不动窗口"的守卫），免得重载后 `REQUESTED` 里的记录清不掉。
- **改法**：① `place()` 现在算 `taskbarGone / pageVisible / system / manual` **四路独立理由**，任一路说藏就藏、互不覆盖；② `follow` 那个 1.5 秒的 tick 里窗口没了就 `ensure()` 重建（主动 `destroy()` 先置 `destroyed`，不会再冒出来）；③ **"为什么藏"留证据**：每次结论变化写一行到 `%APPDATA%\iruler dream\dock-why.json`（`why: shown|taskbar|page|system|manual` + 当时的任务栏/屏幕读数），只在变化时写；④ 页面侧小修：`useDockBridge` 在"不可用"分支推完 `{people:[],hidden:true}` 后清掉 `lastSent`，否则重新可用时会被"没变"跳过、一直停在藏起来那一份。**没有加"定期重推状态"的 keep-alive**——老客户端没有上面那个"整屏现算"，重推会让条子在整屏应用上冒出来，宁可不做。
- **测试**：桌面 **147/147**（`dock-window.test.cjs` 新增 2 项：三个理由互不覆盖 + 整屏结束自己回来 + 报告的理由序列 = `shown,system,shown,page,shown,manual,shown`、窗口被销毁后重建 / 主动 destroy 后不再重建；`fullscreen.test.cjs` 新增 1 项：`isFullScreen()` **撒谎时**（真机表现）自己请求过的整屏仍算 true、退出后立刻 false、外部整屏也认）。网页 **282/282**。`check-packaged` 扩到 **48 项**（新增 5 项"找不到"标记，含 `isWindowFullscreen`）。
- **真机核验 `Build/dock-why-check.mjs`**（新脚本，对着打包客户端跑，读主进程写的 `dock-why.json`）：

  ```
  推状态：why=shown  头像数=2
  进整屏：why=system  头像数=2
  退整屏（不额外发任何东西）：why=shown  头像数=2
  页面说藏：why=page  头像数=0
  页面说显示：why=shown  头像数=1
  PASS
  ```

  并且用 Win32 枚举**在系统层**确认了窗口可见性：整屏中我的探针实例 `pid 20576 visible=False`（同时用户自己开着的 `pid 21712 visible=True`，没被影响），**退出整屏后 `visible=True` 自己回来了**。（探针用单独 user-data-dir，跑完关掉。）
- **前端已上线**（逐文件 `scp`，没碰 `dist/download/`）：`index.html`、`dock.html` + `assets/{main-BL0R9IcA.js,main-WSouybdb.css,dock-BdOUFoAn.js,dock-CB-_Gs8X.css,dockStage-BYC3GpmU.js,icons-B5h5tCp1.js,characterModel-eDIaoQED.js}`；9 个文件本地/远端 SHA256 逐一相同，公网 `HEAD` 全部 200（`main-BL0R9IcA.js` 756,503 字节、公网取回来哈希一致）。后端未动、未重启 officeweb。
- **客户端 0.1.32**（**未发布**；线上 `latest.json` 目前是 **0.1.30**，9-21 19:03 发的）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.32-x64.exe`，101,269,171 字节，sha256 `4757644d2631dc83a477d055f07ecec6ae1f2fdb5205a06c4c026640f5ae763e`；`check-packaged` **48/48**。**注意版本号**：14:06 另一轮把版本顶到 0.1.31 并打了包（标注清空那套桌面改动），我的修复在它之后落地，所以直接发 **0.1.32**（把 0.1.31 那批一起带上）；0.1.31 的包留在 `Build/OfficeDesktopRelease/` 里没发。

## 2026-09-22 14:05 两个报障的修复上线：标注清空 + 会议共享能放大能标注（**纯前端**，后端未动、未发新客户端）

- 用户报障：「视频通话的标注清空不管用」「视频会议的屏幕分享和私人要保持一样，可以放大观看可以标记，目前没有」。
- **根因（都很具体）**：
  1. 清空是从**别人的页面**中继到分享者桌面浮层的，走 `office:annotation-push`，而 `desktop-bridge.cjs`
     的 `type` 白名单只认 `annotate`/`undo` —— `{type:'clear'}` 被**静默丢掉**，所以只有"点清空的人自己
     也在共享"时才擦得掉。
  2. 会议压根没用 `ScreenStage`（`MeetingCenter` 里是裸的 `<video controls>`）；而且会议的共享由
     `MeetingScreenShare` 自己采集，**不经过 `media.screen`**，于是 `sharingScreen()` 恒假、浮层从未
     `attach()`，会议里的标注完全不工作。
- **改动**：`annotationChannel.mirror()` 让 clear 走已放行的 `office:annotation-clear`（**老客户端也立刻生效**）；
  `desktop-bridge.cjs` 白名单补 `clear`（随下次客户端版本生效）；`MeetingCenter` 改用 `ScreenStage`
  （最大化/全屏 + 标注/撤销/清空）+ `App` 传 `annotation`；`media.ts` 的会议视频轨按**共享者 identity** 作键
  （拆出新模块 `src/meetingVideo.ts`，`media.ts` 已贴 500 行上限）；`useOffice` 的 `sharingScreen()` 把会议
  共享算上、并在共享开始时 `attach()`；`meetings.css` 放行画布尺寸。
- **验证**：`OfficeWeb` 全量 **278/278**（含新增 `test/meeting-annotations.test.mjs` 4 项）、
  `OfficeDesktop` **9/9**（含新增「标注浮层：中继过来的清空也要放行」）、`tsc --noEmit` 干净、改动文件均 ≤500 行。
- **上线**：`npm run build`（新主包 `assets/main-O_qO03B7.js`）→ 与远端逐文件哈希比对（8 个文件有差异：
  `index.html`/`dock.html` + 6 个 assets）→ **逐个 `scp`**（没有 `scp -r`、没有碰 `dist/download/`）→ 重跑审计
  **本地与远端 0 差异**；公网复验 `https://115.159.43.237/` 与 `/dock.html` 引用的 7 个资源全部 HTTP 200 且
  SHA256 与本地逐一相同。**后端未动，没有重启 officeweb**。
- 未做：真实的双人会议/通话跑一遍标注（会议那两条现成的 UI harness 是"旧版 UI"那一类，跑不到；改用
  组件级与中继级测试覆盖）；`desktop-bridge.cjs` 的 `clear` 放行要等下次发客户端版本才生效（网页侧已经不依赖它）。
- 注意：本地树上另有一个**更新的构建**（另一会话 2026-09-22 13:59 打的 `main-D620__0u.js`，已含本轮改动），
  线上跑的仍是本次上传的 `main-O_qO03B7.js`；两者只差那个会话自己的改动，等它发布即可。

## 2026-09-22 14:02 头像条的顺序要"粘住"：鼠标看着谁，谁就不许被换走（前端 `dock-GAybfogC.js` / `dock-RCtGPLma.css`；后端未动）

## 2026-09-22 14:02 头像条的顺序要"粘住"：鼠标看着谁，谁就不许被换走（前端 `dock-GAybfogC.js` / `dock-RCtGPLma.css`；后端未动）

- 用户需求：「状态栏的头像位置尽量不要频繁的切换顺序，不然本来鼠标看着一个人闪烁到另一个人了」。
- **为什么会闪**：名次规则是 未接来电 → 未读 → 正在共享 → 在座 → 名字，而这几个键**随时会翻**——离座/在座（10 秒不操作就变）、别人开始/停止共享、未读数变化。主窗口每推一次状态就按新名次重排名单，小窗照着画，于是头像在鼠标底下换位；`hovered` 是**按 id** 记的，DOM 一挪浏览器就重发 mouseover，卡片跟着换人 = 用户看到的"闪烁到另一个人"。
- **改法（纯前端，刷新即生效，不用动客户端）**：**显示顺序和名次分开**，新纯函数 `dockRules.stickyOrder()` 两档防抖：
  1. **指针停在条子/卡片上时（`.dock` 的 `onMouseEnter/Leave` → `pointerOn`）一个都不许挪**——新人接在最后、走掉的人立刻消失（不留鬼头像）；
  2. 没停住也要名次**连续稳定 `ORDER_SETTLE_MS = 2000`** 才换序，没稳就返回 `waitMs`，页面定个闹钟到点再看一眼。
  - **踩到的语义坑（写进测试了）**：`since` 必须记"名次第一次和显示对不上"的时刻，**不能**记"上次换序"的时刻——否则下一个心跳（1 秒后）算出来的等待时间早就超了，会立刻换序，"稳住两秒"等于没做。
  - `orderPeople()` 按粘住的顺序摆人头（顺序表里没有的人接最后，**不许丢人**）；页面画的是 `people`（粘住顺序），不是 `state.people`（刚推来的名次）。
- **测试**：网页 **279/279**（`test/dock-rules.test.mjs` 新增一项 12 条断言：照排 / 冻结 / 冻结期间新人接尾 / 走人立刻消失 / 刚变不动 / `since` 语义 / 差 100ms 不换 / 变回去重新计时 / 稳住才换 / 指针压着多久都不换 / 两个辅助函数 / 页面接线与"别画回原始顺序"+ 名次规则没被改掉）；浏览器 `dock.cjs` 在真页面里打乱名次：指针压在条子上时**顺序不动**，移开 2.6 秒后才变成 `["我","小李","客户丙","同事乙"]`；`tsc --noEmit` 通过；文件行数 `dock.tsx` 389、`dockRules.ts` 355、`dock-rules.test.mjs` 427、`browser/dock.cjs` 460，全部 ≤500。
- **前端已上线**（逐文件 `scp`，**没有** `scp -r`、没有碰 `dist/download/`）：`index.html`、`dock.html` + `assets/{main-D620__0u.js,main-WSouybdb.css,dock-GAybfogC.js,dock-RCtGPLma.css,dockStage-mmIrUhFm.js,icons-nnDVQH_G.js,characterModel-DwkIGQTW.js}`（这次**共享分块的名字也全变了**，所以按上次的教训先把 `ls assets` 与线上 HTML 引用的资产逐一对齐再传）。核验：9 个文件本地/远端 SHA256 逐一相同；公网再取一遍 7 个资产哈希也与本地一致；线上 HTML 引用的 6 个资源 + 动态 import 的 `dockStage-mmIrUhFm.js` **全部 200** 且 content-length 对得上；**本地 `Build/OfficeWeb` 全部 65 个文件与远端 `dist` 全量比对：缺失 0、不一致 0**。
- **线上实测**（`node Build/live-dock-verify.cjs`，直接打开**部署站点**的 `dock.html` 注入假桥）：
  `线上实测：{"text":"同事乙 来电 · 语音通话","buttons":["拒绝","接听"],"aboveStrip":380,"barToStage":0,"centerOff":0,"clip":"Wave","stagePx":452}`；
  `顺序（指针在条子上）：{"before":["我","同事乙","客户丙"],"frozen":["我","同事乙","客户丙"]}`；
  `顺序（移开之后）：["我","客户丙","同事乙"]` → **PASS**。（顺手修了脚本两处：等模型加载改成等探针挂上，远端拉 three 分块 + GLB 时固定 sleep 会偶发不够；假桥补上 `window.__dockState`。）
- **客户端不用重发**：这一条是纯前端，装着的 0.1.30 重新打开头像条就会拉到新分块。`latest.json` 仍是 0.1.26（0.1.30 还没发布）。

## 2026-09-21 18:55 全量同步审计：**前端已一致，后端有 3 个文件是旧的**（已补齐 + 重启）

- 用户问「现在发布的版本是最新的构建版本吗，同步好吧」——于是做了一次**逐文件哈希审计**
  （本地 `Build/OfficeWeb` 全部 66 个文件 vs 远端 `dist`；本地 `OfficeWeb/*.mjs` 21 个 vs 远端 `~/officeweb`）。
- **前端：本来就完全同步**（66/66 逐字节相同；远端多出的 260 个文件是历史哈希包，无害）。
- **后端：3 个文件比本地旧，而且其中两个是真 Bug 修复，一直没上传过**：
  1. `collab-annotations.mjs` —— 缺 `drain()`：**线上的标注中继还在丢点**（就是那个"画笔断开"，
     `AGENTS.md` 里写着已修、测试也有，但从来没部署）。
  2. `input-presence.mjs` —— 缺 `idleOf(data)`：离座时间没有按客户端上报的 `idleMs` 回拨，
     线上只会显示「离座 10 秒」而不是真实时长。
  3. `package.json` —— 只是 `scripts` 不同（本地按 2026-09-14 的要求**删掉了 `dev`/`server` 两个脚本**、
     加了 `postbuild`）。**先确认过 systemd 的 `ExecStart=/usr/bin/node start.mjs`，不依赖那两个 npm 脚本**，
     所以换掉是安全的。
- **动作**：远端先备份到 `backups/sync-20260921/`（三个文件的原件），再上传三个文件，
  `sudo -n systemctl restart officeweb` → `active`，日志 `OfficeWeb ready on http://127.0.0.1:3108`，
  重启后 2 分钟内**没有任何 error/throw**。
- **复验**：重跑同一个审计 → **前端 MISSING/DIFFERENT 都是 (none)，后端也是 (none)**；
  线上 `index.html` 引用的 `assets/main-B72sKwvJ.js` 与本地构建一致，7 个资源全部 200 且 content-type 正确。
- **客户端安装器：已发布 0.1.30**（用户 2026-09-21 明确同意「发布 0.1.30」）。
  - **打包前先重新打包了一次**：原来那个 0.1.30 是 14:42 打的，而 `OfficeDesktop/file-transfer.cjs`
    在 16:57 才改成 2 GB 预检——直接发那个包，发出去的就不是"当前源码的构建"。
    重打（`npm run dist:all`）后 asar 里 `MAX_BYTES = 2 * 1024 ** 3`、`文件不能超过 2 GB` 都在，
    `Build/check-packaged.cjs` **40/40 全绿**，`--office-smoke-test` → `ok: true`。
  - `iruler-dream-Setup-0.1.30-x64.exe`，**101,267,582 字节**，
    sha256 `01db6e90279325dabdc353ca69800161661b09b3f00bae3527a1df6b0a6f5584`（重打后与 14:42 那个不同，正常）。
  - 发布用 `node tools/publish-update.mjs --notes "…"`（**直接调脚本而不是 `npm run`**：npm 转手会把
    中文参数弄坏）。脚本自报：大小一致、前 1MB 哈希 `8c8388ef…` 一致、`Accept-Ranges` 在、线上清单已是 0.1.30。
  - **从公网独立复验过**：`/download/latest.json` 是 `0.1.30` + 那段中文说明；安装器 HEAD 200、
    `Content-Length` 与本地完全一致、`Accept-Ranges: bytes`；`Range: 0-1048575` 取回的前 1MB 哈希与本地一致。
  - 0.1.27～0.1.29 三个包**始终没发布过**（这次一并跨过去了）；装 0.1.26 的同事打开/刷新软件会看到更新提示。
- 仍然没同步的：**没有**。前端、后端、客户端安装器三者现在都等于本地最新构建。

## 2026-09-21 18:50 拖拽发送的**真正根因**：socket.io 广播回执是数组（后端 `file-relay.mjs` **已重启**；前端 `main-B72sKwvJ.js`）

- **真机复现**（用 CDP 对着正式客户端派发真实拖放，目标只用用户授权的测试账号 `李小桃公司`）：
  卡片写的是 **`对方无法接收文件`** —— 这句话在服务端只可能来自 `file-relay.mjs` 的
  `fail(answer?.error || '对方无法接收文件')`，也就是"ack 里既没有 ok 也没有 error"。
- **服务端日志一次就点破了**（为此给 `file-relay.mjs` 加了一行 warn，见下）：
  ```json
  [file-relay] file-in 被拒绝：{"target":"李小桃公司","kind":"object","isArray":true,"keys":["0"],"error":null}
  ```
  **`io.to(room).timeout(ms).emitWithAck(ev, payload)` 是广播操作符，解析出来永远是数组 `[ack]`**
  ——哪怕 room 里只有一个 socket（只有 `socket.emitWithAck` 才是单个 ack）。服务端原来写
  `if (!answer?.ok)`，在数组上恒为 `undefined`，于是**每一趟都在 `file-offer` 就被判成"对方无法接收文件"**，
  而对方其实每次都回了 `{ ok: true }`——传输根本没开始。`file-chunk` / `file-end` 走的 `toTarget()`
  是同一个坑，所以即使 offer 过了，每一片也会失败。
- **改法**：`file-relay.mjs` 加 `firstAck(value) => Array.isArray(value) ? value[0] : value`，
  offer 与 `toTarget()` 都过它；另在 offer 被拒时打一行 `console.warn`（**排障先看
  `journalctl -u officeweb | grep file-relay`**，`isArray: true` 就是这条 Bug 的指纹）。
- **为什么测试没抓住**：两个 harness 的假 `io` 回的是**单个对象**（照着"我以为的"写，不是照着真的库写）。
  现在 `test/file-relay.test.mjs` 与 `test/file-transfer-endtoend.test.mjs` 都**回数组**并加了注释。
  **实测把那行退回旧写法，11 条中继测试红 9 条**；改回来 11/11。
- **真机验收**：同一发法重跑 → 卡片变成
  `给李小桃公司-测试文件-可删除.txt 82 KB 已发送给 李小桃公司 82 KB · 已送达 [打开][打开文件夹][关闭]`，
  底部状态栏 `已发送给 李小桃公司：…`。**功能通了。**
- **同时修掉的两个显示问题**（真机看到的）：① Electron 的 `Error invoking remote method 'x': Error: …`
  原文直接漏到卡片上 → 新增 `readableError()` 剥壳；② 失败的行抬头还写"正在发送给" → 现在
  失败/取消写「发送给 X」、成功写「已发送给 X」。
- **发布**：后端 `file-relay.mjs` 上传并 `sudo -n systemctl restart officeweb` → `active`
  （本地/远端 SHA256 一致 `7eecf0f8…`）；前端 `index.html` + `assets/main-B72sKwvJ.js`（SHA256 一致，
  线上已引用）。全量回归 OfficeWeb **274/274**、OfficeDesktop **143/143**、`tsc` 通过、所有文件 ≤500 行。

## 2026-09-21 18:35 头像条拖拽：**拖进来了，但发不出去是静默的**（前端 `main-BC0F_7Xo.js`；**后端未动、没有重启**）

- 用户回报（重启客户端后实测）：**头像亮了、条子上写「正在发给 XX」，但左下角没有传输卡片、也传不过去**。
- **这一句把范围砍掉一半**：头像亮 + 那句提示，说明**系统把拖拽投进小窗了**（窗口标志不是问题），
  `webUtils.getPathForFile` 也拿到了真路径，`office:dock-files` 一路转到了主窗口。
  注意「正在发给 XX」是**小窗自己**说的，它并不知道后面成没成——所以真正卡住的是 `sendFiles` 之后。
- **找到的静默点**：`sendOne` 原来是**先 `sendOpen`、后 `place`**。`sendOpen` 一抛
  （拖进来的是文件夹 / 路径读不到 / 空文件 / 超过 2 GB），**连一条记录都不建** —— 左下角什么都不出现，
  原因只闪在底部状态栏。用户看到的正是"拖上去了、然后没有然后了"。
  - 现在**先立卡片、再开文件**：任何失败都会留下一条带原因的记录（卡片上直接写「暂时不能发送文件夹，
  请打包后再发」这类原话），并在底部状态栏 + 系统通知各说一次。
  - `sendFiles` 进门先 `notify(正在发送 N 个文件给 XX…)`：小窗那句是小窗说的，这句才是主窗口真的收到了。
- **顺手把 `fileTransfer.ts` 拆了**（AGENTS.md 里早就记着"下一次改它之前先把发送那一半拆出去"）：
  读盘与分片搬到新模块 `src/fileSend.ts`（`createFileSender(ctx)`，依赖用 `SendContext` 显式写出来）。
  `fileTransfer.ts` 从 **510 行（已经超了上限！）降到 428 行**，`fileSend.ts` 119 行。
- **测试**：新增 1 项——`sendOpen` 抛错时**必须**留下一条 failed 卡片且名字取路径最后一段；
  `file-transfer-rules.test.mjs` 里"别再弹同意框"那条也跟着改成查 `fileSend.ts`，
  并新增"先 place 再 sendOpen"的顺序断言。全量 OfficeWeb **271/271**、`tsc` 通过、所有文件 ≤500 行。
- **发布**：上传 `index.html` + `assets/main-BC0F_7Xo.js`（`dock-*` 仍是最新的那一版），
  两个文件本地与远端 SHA256 逐一相同；公网复取：线上入口已是 `main-BC0F_7Xo.js`，
  包里能查到「正在发送」「无法读取这个文件」「file-offer」。
- **要用户做的**：在办公室窗口按 **F5**（主窗口的页面不用重启客户端）再拖一次——
  这次**一定会**在左下角出现一张卡片，卡片上写的就是真正的原因。

## 2026-09-21 18:10 头像条拖拽发送"不行"：先把失败变成看得见（前端 `dock-Dq2hyo-_.js` + `dock-RCtGPLma.css`；**后端未动、没有重启**）

- 报障（用户）：「聊天还行 但是头像拖拽上去发送的功能不行」。
- **已经排除的**（都有实据）：
  1. 装的客户端是 **0.1.30**（`Build/which-client.cjs`），而且是 14:42 装的、16:49 启动的；
     `node Build/check-packaged.cjs "C:\Program Files\iruler dream\resources\app.asar"` 对着**已安装的 asar** 跑，
     文件直传那 12 项**全绿**（`file-transfer.cjs`、`filePaths`、`dropFiles`、`dock-files` 转发、`transfers` 白名单全在）。
  2. 于是另起一个隔离实例（`electron . --user-data-dir=… --remote-debugging-port=9223`），
     用 `Build/client-eval.mjs dock` 问运行中的小窗页：`filePaths`/`dropFiles`/`answer`/`layout` **都是 function**。
  - 也就是说：**两端代码都在位**，剩下的只有"系统有没有把这次拖拽投进那个小窗"这一件事没法从外面看出来。
- **所以先把失败变成看得见**（原来做不到就静默 `return`，用户那边一点反应都没有，根本分不清
  "拖拽没进来"还是"进来了发不出去"）：
  - 只要这一拖**带着文件**，头像就一定会亮起来——**高亮不再看 `canDrop`**。
    连亮都不亮 = 拖拽根本没进到这个窗口，这是最有价值的一条线索。
  - 松手后条子上给一句话（`.dock-notice`，6 秒）：`正在发给 XX` / `客户端太旧 · 请更新` /
    `这是你自己` / `这一拖没有文件` / `请拖到同事的头像上`（拖在头像之间的空隙上松手也会说）。
  - 条子宽度变了要重报一次版面，否则那句话会被窗口裁掉（`layout` 的依赖里加了 `dropNotice`）。
- **探测踩的坑（记下来省得重踩）**：我写了个 P/Invoke 探针，用 `RevokeDragDrop(hwnd)` 的返回值判断
  "这个窗口有没有注册 OLE 投放目标"，结果**所有窗口（包括主窗口）都报没注册**；
  拿 explorer.exe 的文件夹窗口做对照，它也报"没注册"——**说明这个探针本身不成立**
  （`RevokeDragDrop` 要在建窗线程上调用，跨进程跨线程探测不可信）。差点据此得出错误结论。
  另外那个 `.ps1` 第一版写成 UTF-8 中文注释 + `//` 注释，Windows PowerShell 5.1 按 GBK 读 → 直接语法错误。
- **发布**：只重传 `dock.html` + `assets/dock-Dq2hyo-_.js` + `assets/dock-RCtGPLma.css`（`main-*` 未变），
  3 个文件本地与远端 SHA256 逐一相同；公网复取：`dock.html` 现在引用 `dock-Dq2hyo-_.js`（200），
  包里能查到 `dock-notice` / 「客户端太旧」/「这一拖没有文件」/「这是你自己」/「请拖到同事的头像上」，
  CSS 里有 `.dock-notice`。
- **要用户做的**：**重启客户端**（小窗的页面是开窗时加载的，不重启还是旧的），
  再拖一次，把条子上出现的那句话告诉我——那一句话就能定位到底卡在哪一环。

## 2026-09-21 17:40 聊天框的文件下载改成复用文件直传那套（前端 `main-Djfx15DJ.js` + `main-D2IGwDtR.css`；**后端未动、没有重启**）

- 需求（用户）：「整理一下聊天框里面的文件下载，要带进度条，要软件内设置好下载位置 下载好了也还是有几个按钮 打开等 复用」。
- **做法：不另写一套下载器，直接走文件直传那条通道**（`fileTransfer.ts` 的 `downloadAttachment`）：
  - 数据来源换成 HTTP 流（`/api/chat/files/:id`，经新模块 `src/downloadStream.ts` 的 `streamResponse()` 一块块搬，
    天然背压：写盘慢就把读取拖慢）；
  - 其余**全部复用**：设置里那个接收文件夹（`receiveOpen/Write/End`）、被限流的进度、任务栏进度条、
    左下角那张卡片、以及「打开 / 打开文件夹」。设置里改一处，头像直传和聊天下载**两边同时变**。
  - **行 id 就是附件 id**：聊天里那一条和传输面板里那一条是同一个记录，点两次不会下两遍。
  - 聊天气泡里新增：自己的细进度条（`.chat-file-bar`）、「下载 / 重新下载」「打开」「打开文件夹」「取消」，
    小附件另给「另存一份」直链。
- **顺带修掉一个上限提到 2 GB 后必然出事的地方**：原来**所有**附件都会在后台自动抓下来缓存
  （`chatClient.show()` 无条件入队），2 GB 时代等于打开一次聊天静默拉几个 GB。现在只预取
  ≤ `PREFETCH_MAX_BYTES`（4 MB）的小附件（图片预览和"离线也能看"靠它），大附件点了「下载」才走。
- **测试**：新增 `test/download-stream.test.mjs`（6 项：分块顺序、背压、404/410 单独报错、无 Content-Length、
  响应头回调）；`test/file-transfer-endtoend.test.mjs` 加 3 项聊天下载（落到接收文件夹 + 逐字节核对 + 行 id 是附件 id、
  过期副本写清原因、下好再点不重下）；`test/file-transfer-rules.test.mjs` 加 1 项源码断言防止有人又写一套下载器。
  **新增共享助手 `test/helpers.mjs` 的 `loadTs()`**：`chatAttachments.ts` 开始 import `fileTransferRules.ts` 之后，
  老的"就地 transpile"写法解析不了 `./x`，会直接崩（这次踩到了）。
- **回归**：OfficeWeb **269/269**、OfficeDesktop **143/143**、`tsc --noEmit` 通过；所有文件 ≤500 行
  （`fileTransfer.ts` 494，下一次改它之前先把发送那一半拆出去）。
- **发布**：`npm run build` 后上传 `index.html` + `assets/main-Djfx15DJ.js` + `assets/main-D2IGwDtR.css`
  （`dock-*` / `icons-*` / `characterModel-*` / `dockStage-*` 哈希未变）。3 个文件本地与远端 SHA256 逐一相同；
  公网复取：线上入口已是 `main-Djfx15DJ.js`（200、`text/javascript`），包里能查到 `downloadAttachment`、
  `chat-file-bar`、「打开文件夹」「另存一份」；CSS 里有 `.chat-file-bar` / `.chat-file-actions`。
  **后端未动、没有重启 officeweb。**

## 2026-09-21 17:00 两条路的上限都改成 2 GB（前端 `main-5mc0XjJs.js`；后端 `chat-files.mjs` + `file-relay.mjs`，**已重启 officeweb**）

- 需求（用户）：「把聊天框的大小限制到2g文件传输，把头像直传也2g」。
- **改了四处常量（必须一起改，散在三个文件里）**：
  | 路径 | 常量 | 原来 → 现在 |
  |---|---|---|
  | 头像直传（服务端硬门） | `OfficeWeb/file-relay.mjs` `MAX_FILE_BYTES` | 4 GB → **2 GB** |
  | 头像直传（桌面端早报错） | `OfficeDesktop/file-transfer.cjs` `MAX_BYTES` | 4 GB → **2 GB** |
  | 聊天附件（服务端硬门） | `OfficeWeb/chat-files.mjs` `MAX_FILE_SIZE` | 20 MB → **2 GB** |
  | 聊天附件（网页端早报错） | `OfficeWeb/src/chatAttachments.ts` `MAX_CHAT_FILE_BYTES` | 20 MB → **2 GB** |
  另有 `ChatPanel.tsx` 那行「单个不超过 2 GB」、`OfficeDesktop/README.md`、`Design/Chat_Attachments_20260913.md` 同步。
- **提上限时"必须一起改"的两处**（不然 2 GB 根本走不完，属于同一个改动的一部分）：
  1. `chatAttachments.ts` 下载用的是 `AbortSignal.timeout(60000)`——**它卡的是整条请求，不是空闲**，
     20 MB 时无所谓，2 GB 永远下不完。改成 `downloadTimeoutMs(size)`：按最低 64 KB/s 估算，
     最少 2 分钟、最多 6 小时（2 GB ≈ 封顶）。
  2. 超过 `CACHE_MAX_BYTES`（256 MB）的附件**不再写进 IndexedDB**，直接把手里的 Blob 交出去下载
     ——浏览器的存储配额经不起几个 GB，`put` 会失败或卡住。
- **测试**：新增 `OfficeWeb/test/file-size-limits.test.mjs`（3 项）把四个常量钉在一起并核对提示文案
  （改一处就红），另加 `downloadTimeoutMs` 的边界；`OfficeDesktop/test/file-transfer.test.cjs`
  新增 1 项（2 GB 收、2 GB+1 拒，并禁止旧的 4 GB 残留）；`file-relay.test.mjs` 的文案断言改成 2 GB
  并补了"刚好超过 2 GB 就拒"。全量：OfficeWeb **259/259**、OfficeDesktop **143/143**、`tsc --noEmit` 通过。
- **发布**：前端重新构建上传 `index.html` + `assets/main-5mc0XjJs.js`（其余分块哈希未变）；
  后端上传 `chat-files.mjs` + `file-relay.mjs` 并 `sudo -n systemctl restart officeweb` → `active`
  （`OfficeWeb ready on http://127.0.0.1:3108`）。4 个文件本地与远端 SHA256 逐一相同；
  公网复取：线上入口已是 `assets/main-5mc0XjJs.js`（200、751,815 字节），包里能查到
  「单个不超过 2 GB」「单个文件需为 1 字节至 2 GB」，**旧的 20 MB 字样已不存在**；
  服务器上 `grep` 确认两个常量都是 `2 * 1024 ** 3`。
- **磁盘提醒**：聊天附件是**存在 VPS 上**的（`chat-data/`，保留 7 天）。改完当时 `chat-data` 只有 40K、
  根分区 40G 用 16G（**22G 可用**）；2 GB 的文件攒几个就会明显吃盘，心里有数。
- **客户端**：`OfficeDesktop/file-transfer.cjs` 的 2 GB 改动**在下一次打包时生效**；
  在那之前服务端已经按 2 GB 硬门拒收（超了会收到「文件需为 1 字节至 2 GB」），不会传一半才失败。

## 2026-09-21 14:50 文件直传报障修复：「对方无法接收文件，接收方进度条没有进度」（**纯前端**，只上传 `index.html` + `assets/main-Bs-ZW9Sa.js`；客户端**未动**）

- 报障（用户）：「对方无法接收文件，接收方出现了进度条显示没有进度」。
- **根因**：`socket.io-client` 的**浏览器构建**（页面和客户端渲染进程用的就是它）默认
  `binaryType = "arraybuffer"`（`engine.io-client/build/esm/globals.js`），所以接收端拿到的是
  **`ArrayBuffer`——它只有 `byteLength`，没有 `.length`**。`file-in-part` 原来写的是
  `const length = payload?.bytes?.length || 0`，于是 `length` 永远是 0，**每一片都被判成"无效的文件分片"**：
  接收方那张卡片出现了却停在 0% 随即失败，发送方只被告知对方收不了。
  服务端（Node 构建是 `"nodebuffer"`）收到的是 `Buffer`，所以服务端、中继单测、聊天附件那条老路
  全都正常——问题只在浏览器那一侧，这就是它没被早发现的原因。
- **改法**（`src/fileTransferRules.ts` 新增 `toBytes()` / `byteLengthOf()` / `describeBinary()`）：
  分片统一归一化以后再判长度，`ArrayBuffer` / `TypedArray` / `Buffer` / `Blob` /
  socket.io 老式 `{type:'Buffer',data}` 全部覆盖；错误信息里写明"收到了什么类型"，下次不用猜。
  顺带补上 `file-in` / `file-in-end` 的 try/catch——原来接收端一抛（比如 `receiveOpen` 的 IPC 失败）
  就永远不会 `reply`，发送方要**白等 60 秒**才知道失败。
- **回归**：新增 `test/file-transfer-endtoend.test.mjs`——**真的 `file-relay.mjs`** +
  两端 `createFileTransferChannel` 跑完整一趟，harness **把二进制转成 `ArrayBuffer` 再投递给接收方**
  并断言转换确实发生过（`delivered.arrayBuffers >= 2`）；另外 5 种二进制形状进了
  `test/file-transfer-rules.test.mjs`。**把那一行退回旧的 `.length` 写法，4 条里有 3 条立刻变红**（已实测）。
  最后全量：OfficeWeb **256/256**、OfficeDesktop **142/142**、`tsc --noEmit` 通过。
- **发布**：`npm run build` 后只有主分块变了（`main-fnGAIxfv.js` → **`main-Bs-ZW9Sa.js`**），
  `dock-*` / `icons-*` / `characterModel-*` / 两个 CSS 的哈希都没变 —— 这也反向证明**改动只在主窗口那一侧**。
  逐文件 `scp` 上传 `index.html` + `assets/main-Bs-ZW9Sa.js`（没有 `scp -r`、没有碰 `dist/download/`），
  本地与远端 SHA256 逐一相同；公网复取：`https://115.159.43.237/` 现在引用 `assets/main-Bs-ZW9Sa.js`
  （200、`text/javascript`、751,654 字节），包里能查到 `byteLength` / `instanceof ArrayBuffer` /
  「无效的文件分片（收到」/`file-in-part`。**后端未动、没有重启 officeweb。**
- **用户要做什么**：两端**刷新页面（F5）**即可生效——这是纯前端修复，**不需要重新装客户端**。
  已装的 0.1.29（含文件直传的桌面代码）继续可用。

## 2026-09-21 14:44 真机报障：**头顶气泡有名字、却没有「接听 / 拒绝」** —— 两处静默丢字段的桥（客户端 `0.1.30`，**未发布**；前端未变）

- 用户报障（装的是 0.1.29，14:35 启动）：「看到名字了 但是没有出现接通和挂断的按钮哎名字附近」。
- **根因一（主因）**：`OfficeDesktop/desktop-preload.cjs` 的 `dockGreet` 是**白名单清洗**——它把载荷重建成一个新对象，只留 `id/name/character/mode`，而 `requestId/kind/offer` 是随"来电"那一版新加的字段，**在这里被静默丢掉**。小窗那页的渲染条件是 `canAnswer && greet.requestId`，所以：名字出来了（`mode` 在）、**按钮不出现**（`requestId` 没了）。`0.1.29` 是在改这个文件**之前**打的包，装着它必然如此。
- **根因二（顺手查出来的，更隐蔽）**：反方向的桥**根本不存在** —— `desktop-preload.cjs` 没有 `onDockAnswer`，而 `useDockBridge` 用的是可选链 `bridge.onDockAnswer?.(…)`，所以**就算按钮画出来了，点「接听」也不会有任何反应**（静默跳过）。现在补上（订阅 `office:dock-answer`，清洗成 `{ requestId, accept }`）。
- **教训（已写进 `OfficeWeb/AGENTS.md`）**：这条链上有**三处**会把新字段悄悄吃掉——① `desktop-preload.cjs` 的 `dockGreet`、② `dock-bridge.cjs` 的 `office:dock-greet`、③ 反方向的 `onDockAnswer`。加字段时三处一起改；漏 ① 的现象是"有名字没按钮"，漏 ③ 是"点了没反应"，两种情况都**不报错**。
- **新增真机链路测试 `OfficeDesktop/test/dock-call-chain.cjs`**（真 Electron、两个窗口、真 preload、真 dock-bridge，协议桩喂夹具页、不碰网络）：

  ```powershell
  cd OfficeDesktop
  & '.\node_modules\electron\dist\electron.exe' test/dock-call-chain.cjs
  ```

  它断言：小窗收到的 greet **`{id,mode:'call',requestId,kind,offer}` 一个不少**、脏数据仍被清洗（`mode` 归 peek、`kind` 清空、`requestId` 截 64）、**小窗点接听 → 主窗口收到 `{requestId, accept:true}`**、状态照样推得到小窗。证据 `Build/dock-call-chain.json`（本轮 5 项全绿、`errors: []`，退出码 0）。
- **新增真机探针 `Build/dock-call-probe.mjs`**（对着**打包好的客户端**跑，验的就是用户看得见的那一眼）：

  ```powershell
  & '.\Build\OfficeDesktopRelease\win-unpacked\iruler dream.exe' --remote-debugging-port=9226 --user-data-dir="$env:TEMP\office-call-probe"
  $env:DOCTOR_PORT=9226; node Build/dock-call-probe.mjs
  ```

  在主窗口页里走**真正的桥** `officeDesktop.dockGreet({…, mode:'call', requestId, kind})`，再在头像条页里量。实测：`{"bar":true,"text":"同事乙 来电 · 语音通话","buttons":["拒绝","接听"],"answerBridge":true,"viewport":[320,492],"barToStage":0,"aboveStrip":380,"centerOff":0,"clip":"Wave"}` —— 连**窗口高度**都对（`320×492` = 40 条子 + 452 舞台，说明 `stagePx` 真的把气泡算进去、主进程也真的把窗口长高了），截图 `Build/dock-call-client.png`。（探针用单独的 user-data-dir，不碰用户正开着的那个实例；跑完把那个实例关掉。）
- **测试**：网页 **251/251**（`test/desktop-preview.test.mjs` 新增 6 条：`requestId`/`kind`/`offer` 必须出现在 preload 白名单里、`onDockAnswer` 与 `office:dock-answer` 订阅必须在）；桌面 **142/142**；`node Build/check-packaged.cjs` **43 项全绿**（给这一条加了 3 个 asar 标记：`来电：邀请 id 传得出主窗口页`、`来电：邀请种类与 offer 传得出`、`来电：主窗口页收得到接听`）。
- **前端没有改动**（头顶位置那一版已在 14:12 上线），所以**没有重新上传前端、没有重启 officeweb**；这一轮只打客户端。
- **客户端 0.1.30**（**未发布**，线上 `latest.json` 仍是 0.1.26）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.30-x64.exe`，101,266,900 字节，sha256 `15cffc39837e28e32e00842d24743612cf35ec5e71939dc7d9989e4f24cf6060`；免安装版 `iruler-dream-0.1.30-Windows-x64.exe`（100,680,771 字节）。`check-packaged` 43/43；打包产物 `--office-smoke-test` → `ok: true`、加载 `https://115.159.43.237/`。**0.1.29 已被这一版取代**（用户已经装过 0.1.29，所以要装 0.1.30 才有按钮）。

## 2026-09-21 14:25 文件直传：拖到任务栏头像就发（后端 `file-relay.mjs` **新增** + `server.mjs`；前端 `main-fnGAIxfv.js` / 其余见下条；客户端 `0.1.29`，**未发布**）

需求（用户）：「新增文件发送功能，就是把文件拖至状态栏某人头像，就会开始发送，不需要对方同意，直接就发送到设置好的位置，设置里面可以改，双方要显示系统级进度条，完事有打开和打开文件夹的功能」。功能细节与铁律写在 `OfficeWeb/AGENTS.md` 的「文件直传」一节。

- **后端（本轮真正改到的线上代码）**：新增 `file-relay.mjs`（服务器**只实时转发、不落盘**），`server.mjs` 里 `createFileRelay({ io, people })` + 每个连接 `fileRelay.attach(s)`。两个文件都已上传，**并执行了 `sudo -n systemctl restart officeweb`** → `active`，日志 `OfficeWeb ready on http://127.0.0.1:3108`（没有模块加载错误，说明新模块 import 正常）。
  - 上面 14:12 那条写「后端未动，没有重启 officeweb」说的是**它自己那一轮**（dock 气泡只动前端）；**本轮的 file-relay 必须重启才生效，已经重启过**，两条记录不要混起来读。
- **上传与核验**（逐文件 `scp`，没有 `scp -r`，没有碰 `dist/download/`）：后端 `server.mjs`、`file-relay.mjs`；前端 `index.html`、`dock.html`、`assets/{main-fnGAIxfv.js,main-CQo0e_cV.css,icons-CT87jDZG.js,characterModel-Bx0u9nAi.js,dock-DcFR8WQD.js,dock-CYkb4d9K.css,dockStage-mQicwV4d.js}`（第一轮的 dock 分块）→ 之后并发那一轮又重出了 `dock-CmPIa763.js` / `dock-BgWdkgXe.css` 并重传。**11 个文件本地与远端 SHA256 逐一相同**，公网再取一遍仍是同样内容。
- **线上实测**：`https://115.159.43.237/` 引用的 `assets/main-fnGAIxfv.js`（200、`text/javascript`、750,602 字节）里能查到 `file-offer` / `file-chunk` / `file-in-part` / `file-in-end` / 「接收文件夹」/「打开文件夹」；`dock.html` 引用的 `dock-CmPIa763.js` 里能查到 `dropFiles` / `filePaths` / `dock-progress` 与并发那轮的 `dock-call-wrap`，`dock-BgWdkgXe.css` 里能查到 `.dock-avatar.dropping` / `.dock-progress` / `.dock-call-wrap`。全部 200 且 content-type 正确（不是 SPA 回退的 HTML）。
- **兼容老客户端**：`dock.tsx` 的拖放以 `typeof window.officeDock?.dropFiles === 'function'` 为门、进度线读 `state.transfers || []`，`files` 桥不存在时发送直接提示"需要桌面客户端"、接收退回浏览器下载。所以 0.1.26 的同事加载新页面**行为不变**，不会因为前端先上线而出错。
- **客户端 0.1.29**（**未发布**，线上 `latest.json` 仍是 0.1.26）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.29-x64.exe`，101,269,170 字节，sha256 `05fe401e42653959f359d15f16626e9d75a9bd64b61c1ec9624912dd0a5a6ff6`；`--office-smoke-test` → `ok: true`。`Build/check-packaged.cjs` 已**扩充到 40 项**（新增 12 项文件直传：主进程读写/接收文件夹/防穿越/进度条、发送读盘、接收写盘、页面桥、`webUtils.getPathForFile`、小窗交路径、主进程转主窗口、进度白名单、`main.cjs` 建实例与退出收句柄），**40/40 全绿**。
- **回归**：`tsc --noEmit` 通过；网页 **251/251**、桌面 **142/142**；所有文件 ≤500 行（`server.mjs` 492、`App.tsx` 465、`useOffice.ts` 452）。
- **还没验证的（重要）**：① 从资源管理器**真的**拖到任务栏小窗上（那条小窗是 `focusable:false` 的无边框透明窗，OLE 投放路径只能人工验一次；合成/网页拖来的 File 没有真路径，`webUtils.getPathForFile` 返回空串，自动化只能覆盖"路径转交 + 接收写盘"两段）；② 两账号真机互传的进度条与「打开 / 打开文件夹」。**所以没有发布 0.1.29**——本机装一份试通了再说，`npm run publish:update` 随时可发。未完成项记在 `Design/TODO.md`。

## 2026-09-21 14:12 来电气泡改挂到**人物头顶**（用户纠正）+ 线上逐文件核验（前端 `dock-CmPIa763.js` / `dock-BgWdkgXe.css`；客户端 `0.1.29`，**未发布**）

- 用户纠正：「没有看到 是不是你理解错了位置我是说打招呼的人站在状态栏上的人物头顶」——上一版把气泡画在**角色下面**（贴头像条上边缘、角色站在气泡上），位置理解反了。
- **为什么用户"没看到"**（两个原因，都得说清）：
  1. **位置反了**：气泡在人物下面，不在头顶。
  2. **本机装的还是 0.1.26**：`mode`/`requestId`/`kind` 这三个字段是 0.1.28 起才由主进程转发给小窗的，0.1.26 会把它们**静默丢掉** → `greetMode(undefined)` 落到 `peek` → 那条来电气泡**根本不渲染**（只有小人儿站着）。所以这一条必须装 0.1.29（含 0.1.28 的全部转发）才看得到。
- **改法（纯前端，刷新即生效）**：新增外层 `.dock-call-wrap`，与角色画布**同一格**——同样宽（新 CSS 变量 `--dock-stage-w` = `GREET_CANVAS[mode].width`）、底边同样在 `calc(var(--dock-h) + var(--dock-stage-h, 380px))`，也就是**画布上边缘之上**；气泡在里面 `justify-content: center`，角色站在画布正中，所以气泡正对着他的头。外层 `pointer-events: none`、气泡 `pointer-events: auto`（透明区不许吃鼠标，按钮要能点）。气泡高 52 且 `box-sizing: border-box`、`white-space: nowrap`，文字改成 `flex: 1 1 auto; min-width: 0`（名字长了走省略号，否则「接听」会被顶出窗口右边）。`popup-right`/`edge-top` 两条定位规则跟着挪到外层；**旧的 `.dock-stage.over-call`（角色站气泡上面那一版）已删除**，`test/dock-rules.test.mjs` 里加了断言禁止它回来。舞台高度仍是 `380 + 62 + 10 = 452`（`stagePx`），窗口宽度在舞台期间至少 320，气泡不会被裁。
- **测试**：网页 **251/251**（`callLabel` 现在"不知道种类就只说「同事乙 来电」"——老客户端不转发种类，别瞎猜是语音还是屏幕；新增 4 条 CSS 位置断言 + 禁 `over-call`）；桌面 **142/142**（本轮没动桌面代码，跑一遍确认）；浏览器 `dock.cjs` **PASS**（窗口从 520×260 加高到 520×620——气泡挂在头顶后落在矮视口外面，点不到「接听」；新增断言：`barToStage=0`、`aboveStrip=380`、`centerOff=0`，即"挂在头顶正上方"）；`test/browser/greet-characters.cjs`（21 个角色招手）PASS。
- **新增线上核验脚本 `Build/live-dock-verify.cjs`**：直接把**部署站点**的 `dock.html` 打开、注入假桥、推一条 `call` 邀请，量位置并截图。实测（线上那份分块）：`{"text":"同事乙 来电 · 语音通话","buttons":["拒绝","接听"],"aboveStrip":380,"barToStage":0,"centerOff":0,"clip":"Wave","stagePx":452}`，点「接听」记到 `["live-1", true]`，截图 `Build/live-dock-call.png`。这个脚本比本地 harness 更硬：**它核的是打包产物，本地好看而线上是旧的瞒不过去**。
- **前端已上线**（逐文件核过，**没有** `scp -r`、没有碰 `dist/download/`）：`dock.html`（`9f3c0a4b…`）、`assets/dock-CmPIa763.js`（`8359c959…`）、`assets/dock-BgWdkgXe.css`（`4e05196f…`）、`assets/dockStage-mQicwV4d.js`（`6e981cb8…`）——四个文件本地与远端 SHA256 逐一相同，公网再取一次哈希也相同（`8359c959…` / `4e05196f…`）；线上 HTML 引用的 6 个资源（`dock-CmPIa763.js`、`dock-BgWdkgXe.css`、`icons-CT87jDZG.js`、`characterModel-Bx0u9nAi.js`、`main-fnGAIxfv.js`、`main-CQo0e_cV.css`）**全部 200**，动态 import 的 `dockStage-mQicwV4d.js` 也 HEAD 200（1,901 字节）。`main-*` / `icons-*` / `characterModel-*` 这次名字没变（主窗口那侧没动到被引用的代码），所以没传也没有旧引用残留。后端未动，**没有重启 officeweb**。
- **客户端 0.1.29**（**未发布**，线上 `latest.json` 仍是 0.1.26）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.29-x64.exe`，101,269,170 字节，sha256 `05fe401e42653959f359d15f16626e9d75a9bd64b61c1ec9624912dd0a5a6ff6`；`node Build/check-packaged.cjs` **27 项全绿**（含来电四条）；免安装版 `iruler-dream-0.1.29-Windows-x64.exe`（100,683,081 字节）也在。打包产物 `--office-smoke-test` → `ok: true`、加载 `https://115.159.43.237/`、electron 44.3.0、`sandbox/contextIsolation=true`、`nodeIntegration=false`。这一版同时含同目录另一条线上的改动（文件直传进度条那套桌面代码），**装它一次即可**。

## 2026-09-21 14:20 有人打电话过来：人物上写清"谁来电"+ 直接给「接听 / 拒绝」（前端 `main-CbHUYQo_.js` / `dock-BNBD4W3W.js`；客户端 `0.1.28`，**未发布**）

- 用户需求：「通话请求时，需要在人物上加上是谁来电，再加一个接听的按钮」。
- **做在头像条（小窗）上**：有人用看屏幕 / 共享屏幕 / 语音三种方式打过来时，那个人的角色照样跳出来，**下面多一条来电气泡**（灵动岛那种胶囊）：`同事乙 来电 · 语音通话` / `· 想看你的屏幕` / `· 要给你看屏幕`，右边红「拒绝」+ 绿「接听」。角色站在气泡上面（`.dock-stage.over-call`），气泡贴着头像条上边缘。**（位置被用户纠正了：气泡应该在角色头顶——见上面 14:12 那条，`.dock-stage.over-call` 已删除。）**
  - **窗户高度由页面报**（新增 `stagePx`）：气泡让舞台从 380 变成 380+62+10=452，写死在主进程里会被裁掉。`dockBounds` 收 `stagePx`（夹在 120～700，报得离谱地小就当没报、退回老常量），`dock-window.applyLayout` 记下来，`desktop-dock-preload` 与 `dock-bridge` 各清洗一遍。
  - **接听走新通道** `office:dock-answer`（小窗 → 主进程 → 主窗口）：`office.respond(requestId, accept)`，跟通话面板那两个按钮同一条路（小窗自己不碰 socket、不碰媒体）。**老客户端没有 `answer` 桥就不渲染按钮**，只显示"谁来电"那行字，点了不会没反应。
  - `useCallAttention`/`callAttention` 现在把那一通邀请的 `requestId`/`kind`/`offer` 一起交给小窗（`callLabel()` 是纯规则，四条文案各一条断言）。
- **测试**：桌面 **131/131**（新增：`office:dock-answer` 转发与来源校验、greet 带上邀请信息与脏种类、`stagePx` 三档夹取）；网页 **230/230**（`callLabel` + 源码断言）；浏览器 `dock.cjs` 新增：气泡贴条子、角色站在气泡上、`stagePx=452`、文案随种类变、**点「接听」记到 `['inv-9', true]`、点「拒绝」记到 `['inv-10', false]`**、点完气泡收起；截图 `Build/dock-call.png`。
- **前端已上线**：`index.html`、`dock.html` + 7 个资产（`main-CbHUYQo_.js`、`dock-BNBD4W3W.js`、`dock-BeN2JkBP.css`、`icons-CfgbfAhA.js`、`characterModel-BhAuTbb6.js`、`dockStage-lcwKF5-Y.js`、`main-BG531GmC.css`）本地与线上 SHA256 逐一核过；**线上 HTML 与 dock 分块引用的每一个资源都 HEAD 200**（这次按上次的教训，先 `ls assets` 再逐个核，没有漏传）。后端未动。
- **客户端 0.1.28**（**未发布**，线上 `latest.json` 仍是 0.1.26）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.28-x64.exe`，101,260,535 字节，sha256 `b37e1518622deaffa5b1b9c6a07ec7759875d24fe9354df6e598d4240e3172e9`；smoke 通过；`node Build/check-packaged.cjs` **27 项全绿**。
- **事故与教训：别用 PowerShell 改文件**。修 `dock-window.test.cjs` 的断言时我用 `(Get-Content -Raw)` + `Set-Content` 做替换，而宿主是 Windows PowerShell 5.1：它按 **GBK** 读 UTF-8 文件、再写回 UTF-8，中文和换行整片烂掉（`Get-Content`/`Set-Content` 只能用于纯 ASCII 文件）。已从 git 恢复、按**当前**行为重写了整个测试文件（git 里那版还是 0.1.18 的：还在测点击穿透、默认贴托盘，和现在的代码相反）。**改文件一律用编辑工具（read/edit/write），不要走 PowerShell 管道。**

## 2026-09-21 12:10 修「启动/自启不出现头像、头像忽闪」+ 关机不再被拖住（前端 `main-CNrMXNfA.js` / `dock-DMHc4XPZ.js`；客户端 `0.1.27`，**未发布**）

- 用户报障：「有时候启动不出现头像，有时候开机自启不出现头像，有时候头像会消失闪烁，问题二不要阻止关机如果可以的话」。
- **四处真因，逐条修**：
  1. **启动先闪一条空条子** → `dock-bridge.cjs` 的初始状态改成 `hidden: true`，装桥时就 `dock.setVisible(false, 'starting')`；主窗口第一次推状态再决定显示。以前初始是"显示"，主窗口还没连上/还没登录的那一两秒会先亮一条"现在没有其他人在线"的条子，用户看到的就是"没有头像"。
  2. **开机自启时页面根本没加载出来** → `dock-window.cjs` 现在 `did-fail-load`（`-3` 自己中断的不算）按 2s/5s/10s/30s 退避重载，`render-process-gone` 立刻重载。开机那一刻网络常常还没就绪，老代码那一次 `loadURL` 失败就是**永久透明窗口**（没有任何重试）。`dependencies.loadRetryMs` 可注入（测试调快用）。
  3. **忽闪** → `place()` 里"任务栏不在了 / 这次量不到"要**连续三次**（`HIDE_AFTER_MISSES = 3`，跟着 1.5 秒的复查节奏）才真藏。息屏、切分辨率、全屏应用、量托盘的 PowerShell 抖一下，都会让某一次读数是"workArea == bounds"，一次就藏就是忽闪忽现。真藏起来最多多留三四秒，而条子在托盘那侧、底边别处照样能把任务栏碰出来。
  4. **掉线把名单抹掉** → 主窗口把 `connected` 一起推给小窗，`dockRules.mergeState()` 在 `connected === false` 且这份名单为空时沿用上一份（`hidden: true` 时照旧清空）。休眠/切网/服务器重启时 `disconnect` 会先 `setPeople([])`，几秒后连上再推回真的，不保留就是"整排消失再冒出来"。
- **关机/注销不再拖时间**（用户：「问题二不要阻止关机如果可以的话」）：`main.cjs` 新增 `app.on('session-end')`（Windows 真的结束会话时）→ 收掉头像条、光晕窗口、**停掉常驻采集流**（它会替我们申请 DISPLAY 常亮）然后 `app.exit(0)`；`before-quit` 里也停采集。托盘那条"关窗口 = 收进托盘"的 `preventDefault` 本来就有 `quitting` 放行（`query-session-end`/`session-end`/`before-quit` 三处），新增 `test/shutdown.test.cjs` 用源码级断言把这几处钉住，改掉就红。
- **测试**：桌面 **131/131**（新增：页面加载失败重试与崩溃重载、任务栏读数抖动 3 次才藏、桥的起始隐藏状态、`connected` 透传、关机路径 2 项）；网页 **229/229**（新增 `mergeState` 六种情形 + "主窗口/小窗都得接上 connected" 的源码断言）；浏览器 `dock.cjs` 新增"掉线期间 4 个头像必须留着、连着时以服务器为准"。
- **前端已上线**：`index.html`、`dock.html`、`assets/{main-CNrMXNfA.js,dock-DMHc4XPZ.js,icons-WYajTV1y.js,characterModel-fqmB6zru.js,dockStage-AYVZ5BBs.js}`，本地与远端 SHA256 逐一核过，线上六个被引用的资源全 **200**。`main-BG531GmC.css` / `dock-DpkPXRmi.css` 没变。
  - **过程里的教训（差点把线上弄坏）**：这次构建因为动了 `dockRules.ts`，**共享分块的名字也全变了**（`icons-*`、`characterModel-*`、`dockStage-*`），而我第一遍上传时用 `Select-String 'main-|dock-'` 过滤了构建输出，只看见 main/dock 两个名字 → 传了新 `index.html`/`dock.html` 却**没传那两个分块**，线上有几分钟是 404（随即发现并补齐）。**以后：构建完先 `ls assets` 跟"线上 HTML 引用的资产"逐一对一遍、每个都 HEAD 200 才算完事**；不要靠过滤过的构建日志判断"哪些文件变了"。
- **客户端 0.1.27**（**未发布**，线上 `latest.json` 仍是 0.1.26）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.27-x64.exe`，101,260,997 字节，sha256 `8e40d8cacb177eb089ddee79ad6313b78c517d8e8ab3a53c5318acf8b3a44ab4`；`--office-smoke-test` 通过（`ok: true`）；`node Build/check-packaged.cjs` **23 项全绿**（新增启动/掉线/闪烁/关机四条）。

## 2026-09-20 13:34 **发布**客户端 0.1.26 给所有用户（`latest.json` 0.1.25 → 0.1.26）

- 用户指令：「可以 发布吧」。
- 一条命令：`cd OfficeDesktop && npm run publish:update -- --notes "…"`。脚本自己核验通过：大小 101,258,697 字节一致、前 1MB 哈希 `c57edebba637…` 一致（`Accept-Ranges` 在）、线上 `latest.json` 已是 0.1.26。
- 线上确认（公网）：`https://115.159.43.237/download/latest.json` = `0.1.26` + sha256 `9af84f3a940dd63bf3fed09e91f8605704a8f6ec234f4da7d2970d4612a6cb11` + 大小 101,258,697 + 更新说明 + `releasedAt`；直链 HEAD **200**、`Accept-Ranges: bytes`。
- **真机网络自检**（`Build/update-flow-check.cjs`，真 Electron `net.fetch`）：8.9 秒下完 101,258,697 字节，**sha256 与清单一致**，进度回调 36 次（0% → 100%）。
- 更新说明（发给用户的）：头像条新外观（整体一个框、两侧灵动岛式纯半圆收口、颜色跟着任务栏适配，换主题最多半分钟自动跟上）+ Windows 11 上"悬停出现大窗口时头像整排位移"的修复。
- 装了 0.1.25 及更早版本的同事，正常刷新页面就会看到右下角更新提示。服务器 `dist/download/` 现在 4 个安装器（0.1.17 回滚点、0.1.21、0.1.22 孤儿、0.1.26 当前）。

## 2026-09-20 13:45 头像整体框起来（两侧**纯半圆**、灵动岛那种）+ 框的颜色跟着任务栏适配（前端 `main-Bj4dU5CG.js` / `dock-BD0rmkBl.js` / `dock-DpkPXRmi.css`；客户端 `0.1.26`，已发布）

- 用户需求：「把所有的头像整体框起来，像是同一个系统内感觉，有个大的圆角框，另外要根据当前状态栏的颜色去适配」，随后追加「大框两侧用纯半圆像是灵动岛那种」。
- **形状**：`.dock-frame` 高度 `calc(var(--dock-h) - 4px)`、**`border-radius: 999px`**（浏览器会夹成高度的一半 = 两端正好两个半圆）。**两侧留白必须按高度算**：要求 `留白 ≥ 半径 − √(框高 − 3)`（约框高的 0.26～0.35 倍，任务栏越厚越大），所以写的是 `padding: 0 calc(var(--dock-h) * .4)`；写死 px 的话厚任务栏（>48）上最边上头像的方角会戳出半圆、把边框线切断。浏览器测试里对**最边上的头像算过几何**（圆心在框高一半处，头像的角落必须在半径 − 1px 内），并在 28/40/48/64 四种任务栏厚度上验过留白公式。
- **颜色**（跟着任务栏适配）：主进程新模块 `OfficeDesktop/taskbar-theme.cjs` 读注册表 —— `SystemUsesLightTheme`（**不是 `AppsUseLightTheme`**，本机实测"应用浅色、任务栏深色"）、`EnableTransparency`、`ColorPrevalence`、`AccentColor`（`0xAABBGGRR`，低字节红）。`frameColors(state.theme)` 把它算成三个 CSS 变量：深色任务栏 → 白色浮层 `rgba(255,255,255,.1)` + 白边 `.2`；浅色 → 黑色浮层 `rgba(0,0,0,.06)` + 黑边 `.16`；任务栏被强调色着色时边框改用强调色（里面再垫 7% 同色）；关掉透明效果时浮层加 4% 浓度。**`.dock` 自己仍然完全透明**（"别有黑底"那条不许破坏），框**不加 `overflow: hidden`**（会把头像凸出去的未读"!"和共享标记切掉）。
- **坑**：`reg query` **只认一个 `/v`**——`reg query KEY /v A /v B` 直接 `Invalid syntax`（第一版就这么写的，整条路静默退回兜底、看起来"永远深色"），改成整把键读回来自己挑。结果缓存 30 秒，读不到退回 Electron `nativeTheme` 的明暗，**任何情况都不抛**。`dock-bridge.cjs` 每 20 秒重读、变了就**立刻重发一次完整状态**（否则要等主窗口下次推状态才换色），`theme` 过白名单清洗。本机实测读数 `{ light:false, tinted:false, accent:'#0078d7', transparent:true }`。
- 框占宽度：条子 157 → **191**（两端半圆的留白），页面量出来报给主进程，窗口跟着长、条子位置不动。
- **测试**：桌面 **127/127**（新增 `test/taskbar-theme.test.cjs` 六项 + `dock-bridge` 的主题转发/重发）；网页 **228/228**（`frameColors` + CSS 断言 + 四种厚度的留白公式）；浏览器 `dock.cjs` 新增：框把 4 个头像都圈住、**半径 ≥ 框高的一半（纯半圆）**、最边上头像的角没戳出半圆、深/浅/强调色三种配色各验一次；截图 `Build/dock-frame-{dark,light,accent}.png`、放大版 `Build/dock-frame-zoom-{dark,light,accent}.png`（`Build/dock-frame-zoom.cjs`，4 倍缩放）。
- **前端已上线**：`dock-BD0rmkBl.js`、`dock-DpkPXRmi.css`、`dock.html` 三个文件本地与远端 SHA256 一致，线上 `dock.html` 已指向新文件（HEAD 200）；`main-Bj4dU5CG.js` 是上一条那版（`dockRules.ts` 变了会带上它）。**后端未动。**
- **客户端 0.1.26**（**未发布**，线上 `latest.json` 仍是 0.1.25）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.26-x64.exe`，101,258,697 字节，sha256 `9af84f3a940dd63bf3fed09e91f8605704a8f6ec234f4da7d2970d4612a6cb11`；`--office-smoke-test` 通过；`node Build/check-packaged.cjs` **18 项全绿**。**框的形状是纯前端（CSS），不用重新打包；只有"颜色跟着任务栏"需要装这一版**（客户端才能读注册表）。

## 2026-09-20 13:25 头像整体框起来 + 框的颜色跟着任务栏适配（前端 `main-Bj4dU5CG.js` / `dock-auUNR0NO.js` / `dock-D7LfaXmg.css`；客户端 `0.1.26`，**未发布**）

- 用户需求：「把所有的头像整体框起来，像是同一个系统内感觉，有个大的圆角框，另外要根据当前状态栏的颜色去适配」。
- **页面**：新增 `.dock-frame`（`border-radius: 12px`、`height: calc(var(--dock-h) - 4px)`）把头像与"暂无人在线"都圈进去。颜色由 `frameColors(state.theme)` 算成三个 CSS 变量：深色任务栏 → 白色浮层（`rgba(255,255,255,.1)` + 白边 `.2`）、浅色 → 黑色浮层（`rgba(0,0,0,.06)` + 黑边 `.16`）、任务栏被强调色着色时边框改用强调色（里面再垫 7% 同色）；关掉透明效果时浮层加 4% 浓度。**`.dock` 自己仍然完全透明**（2026-09-18 定的"别有黑底"），框**不加 `overflow: hidden`**（会把头像右上角凸出去的未读"!"和共享标记切掉）。框占一点宽度：条子 157 → 169，页面量出来报给主进程，窗口跟着长。
- **任务栏颜色在主进程读注册表**（新模块 `OfficeDesktop/taskbar-theme.cjs`）：`SystemUsesLightTheme`（**不是 `AppsUseLightTheme`**，本机实测"应用浅色、任务栏深色"）、`EnableTransparency`、`ColorPrevalence`、`AccentColor`（`0xAABBGGRR`，低字节红）。**坑：`reg query` 只认一个 `/v`**——`reg query KEY /v A /v B` 直接 `Invalid syntax`（第一次实现就踩到，整条路静默退回兜底），所以整把键读回来自己挑。结果缓存 30 秒，读不到退回 Electron `nativeTheme` 的明暗，**任何情况都不抛**。`dock-bridge.cjs` 每 20 秒重读、变了就**立刻重发一次完整状态**（否则要等主窗口下次推状态才换色），`theme` 过白名单清洗（四个字段、强调色必须 `#rrggbb` 转小写）。
- 本机实测读数：`{ light:false, tinted:false, accent:'#0078d7', transparent:true }`（深色任务栏 + 蓝色强调色但没勾"用在任务栏上"）→ 白色浮层。
- **测试**：桌面 **127/127**（新增 `test/taskbar-theme.test.cjs` 六项：解析 `reg query`、ABGR→RGB、感知亮度、着色任务栏听强调色、缓存与 `refresh`、读不到时的兜底；`dock-bridge` 新增主题转发与"变了立刻重发"）；网页 **228/228**（新增 `frameColors` 与源码断言）；浏览器 `dock.cjs` 新增：**框真的把 4 个头像都圈住**、圆角 ≥10px、框高 < 任务栏高、深/浅/强调色三种配色各断言一次、换回 `left`… 截图 `Build/dock-frame-{dark,light,accent}.png`，放大版 `Build/dock-frame-zoom-{dark,light,accent}.png`（`Build/dock-frame-zoom.cjs`，4 倍缩放看细节）。
- **前端已上线**：8 个文件（`index.html`、`dock.html`、`main-Bj4dU5CG.js`、`icons-CWk7gf1C.js`、`characterModel-DMKg22U6.js`、`dockStage-COcjP1HM.js`、`dock-auUNR0NO.js`、`dock-D7LfaXmg.css`）本地与远端 SHA256 一致，线上 `index.html`/`dock.html` 已指向新文件（HEAD 200）。**后端未动、没有重启 officeweb。**
- **客户端 0.1.26**（**未发布**，线上 `latest.json` 仍是 0.1.25）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.26-x64.exe`，101,258,697 字节，sha256 `9af84f3a940dd63bf3fed09e91f8605704a8f6ec234f4da7d2970d4612a6cb11`；`--office-smoke-test` 通过；`node Build/check-packaged.cjs` **18 项全绿**（含新增的"任务栏颜色"三条）。主题只有在客户端里才读得到，所以要装这一版框才会跟着任务栏变。

## 2026-09-20 12:56 **发布**客户端 0.1.25 给所有用户（`latest.json` 0.1.21 → 0.1.25）

- 用户指令：「发布一下吧」（0.1.24 没发过，直接把 0.1.25 发出去）。
- 一条命令：`cd OfficeDesktop && npm run publish:update -- --notes "…"`。脚本自己核验通过：大小 101,258,128 字节一致、前 1MB 哈希 `873d2bcea834…` 一致（`Accept-Ranges` 在）、线上 `latest.json` 已是 0.1.25。
- 线上确认（公网）：`https://115.159.43.237/download/latest.json` = `0.1.25` + sha256 `2545674643557162cfdb29b9180ee3b6c3620587cdb30695447662a8134728e0` + 大小 101,258,128 + 更新说明 + `releasedAt`；直链 HEAD **200**、`Accept-Ranges: bytes`。
- **真机网络自检**（`Build/update-flow-check.cjs`，用真 Electron 的 `net.fetch` 走客户端的网络栈；注意要用 `OfficeDesktop/node_modules/electron/dist/electron.exe` 跑，打包好的 exe 不会执行传进来的脚本）：8.7 秒下完 101,258,128 字节，**sha256 与清单一致**，进度回调 36 次（0% → 100%）。
- 更新说明（发给用户的）：鼠标停在同事头像上 2 秒才开始提示、绿光慢慢亮约 2 秒；只是停一下时人物小一倍、不打招呼；看屏幕/共享屏幕/语音三种方式打过来时所有屏幕立刻绿起来、他的角色照当前大小跳出来招手（21 个角色的招手动作都验过）；修好了 Windows 11 上悬停出现大窗口时头像整排位移的问题。
- 装了 0.1.21 及更早版本的同事，正常刷新页面就会看到右下角更新提示（装 0.1.25 的不会提示）。
- **服务器 `dist/download/` 现在 387M**：0.1.17（回滚点）、0.1.21、0.1.22（那条 Win11 实验版，**没有任何清单引用**）、0.1.25（当前）。磁盘 40G 用了 16G（42%），暂时不急，但 0.1.22 那个孤儿包可以删（用户没要求，先留着）。

## 2026-09-20 12:45 修 Windows 11 上的小 bug：出现大窗口时头像被顶走 + 小窗口会挑方向（前端 `dock-DHm6URPI.js` / `dock-DYMXU0aM.css`；客户端 `0.1.25`，**发布前先按"不发布"写的**）

- 用户报障：「小bug 就是Windows11，鼠标放在上面出现大窗口时头像会自适应位移，需要锁定 小窗口出现的方向多变一下」。
- **根因**：Win11 的条子贴在屏幕最左端（`LEFT_GAP = 8`），可窗口还是按"往左长"摆——窗口左边缘被屏幕夹住（`clamp` 到 0），于是**窗口右边缘不再和条子右边缘对齐**，而页面里的条子一直是 `right: 0` 靠右对齐的，就被顶到一边去了（按 156 的条子实测位移 175px）。
- **修法**：`dockBounds` 现在按两侧的空档挑 `popup`——左边放得下就先左边（老样子），放不下才翻到右边（Win11 必然往右画）。**参考宽度固定用 `CARD_WIDTH`**（不能用当前状态的 `minWidth`，否则卡片/舞台/peek 一变条子就左右横跳）。往右画时窗口**左边缘**对齐条子左边缘，页面用 `.dock.popup-right` 把条子钉在窗口左边、卡片与舞台改成左对齐；往左画时维持原样。主进程通过 `office:dock-state` 新增的 `popup` 字段告诉小窗（`dock-bridge.cjs` 的清洗里也带上）。
- **改动文件**：`OfficeDesktop/taskbar-position.cjs`（挑边 + 对齐）、`dock-window.cjs`（记 `popup` 并暴露）、`dock-bridge.cjs`（转发 `popup`）；`OfficeWeb/src/dockRules.ts`（`DockState.popup`）、`src/dock.tsx`（`popup-right` 类）、`src/dock.css`（条子钉左边 + 卡片/舞台左对齐）。
- **测试**：桌面 **120/120**（新增：挑边与两侧空档、任何状态下 `strip` 完全不变、anchor `left` 下窗口 x 不变且 `popup()` 为 right、`popup` 转发）；网页 **227/227**；浏览器 `dock.cjs` 新增 `popup-right` 断言（条子钉在窗口左边、卡片左对齐、换回 `left` 就没这个类）。
- **真机验证（本机 Win10 用 `--dock-left` 预览 Win11 摆法）**：推进假状态后，小窗页面自己报 `window.screenX + 条子左边` = **8**；把 320×380 的大舞台点亮后窗口从 123 → 320 宽（往右长），条子仍然是 **8**（一个像素没动），舞台落在条子右边（截图 `Build/dock-left-greet.png`、`Build/dock-left-bar.png`）。命令：`electron.exe . --user-data-dir=… --remote-debugging-port=9226 --dock-left` + `Build/client-eval.mjs`（`DOCTOR_PORT=9226`）+ `Build/dock-shot.ps1`。
- **前端已上线**：`assets/dock-DHm6URPI.js`、`assets/dock-DYMXU0aM.css`、`dock.html` 三个文件本地与远端 SHA256 一致；线上 `dock.html` 已指向新文件（HEAD 200）。`main-*.js` 没变（这次只动小窗那一页）。**后端未动。**
- **客户端 0.1.25**（**未发布**，线上 `latest.json` 仍是 0.1.21）：`Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.25-x64.exe`，101,258,128 字节，sha256 `2545674643557162cfdb29b9180ee3b6c3620587cdb30695447662a8134728e0`；`--office-smoke-test` 通过；`node Build/check-packaged.cjs` 15 项全绿（含新增的"挑边"三条）。
- 说明：这一版把 0.1.24 的内容（慢慢亮 2 秒、peek 小舞台、打电话过来打招呼）一起带上了——0.1.24 没发出去，直接用 0.1.25。

## 2026-09-20 12:20 悬停 2 秒才亮、绿光慢慢亮 2 秒、打电话过来也绿 + 用当前大小打招呼（前端 `main-BGHtv48u.js` / `dock-6CrEJYBE.js`；客户端 `0.1.24`，**按要求没有发布**）

- 用户需求（一条消息三件事）：「鼠标停留在别人头像2秒后才开始亮起绿色，且亮起的时间会很慢 大概用2秒才渐渐亮起，，只是鼠标放上的话人物出现会小一倍，不用打招呼，当用三个方式打电话过来需要屏幕里面绿起来，且用当前角色大小打招呼，注意检查所有角色都要适配打招呼的动作」。
- **停够 2 秒才算"有人来看我"**：小窗每 800ms 索要一次画面，这条心跳同时就是"我在看他"。现在 `useDockBridge` 自己计时（纯规则 `dockRules.dwellWatch`：`WATCH_DWELL_MS = 2000`、`WATCH_DWELL_GAP_MS = 1500`，中间断过或换了人就重新数），停够了才 `onPreviewWant`，并用 `waitMs` 起定时器**刚好在第 2 秒**报，不等下一次心跳。
- **亮起来 2 秒**：`PEEK_GLOW_FADE_MS = 2000`（悬停）/ `CALL_GLOW_FADE_MS = 150`（打电话过来，急事，立刻亮）。绿光页面改成"从全透明过渡到不透明"，用 `ease-in-out`——用默认的 `ease-out` 时 2 秒的过渡在 0.6 秒就已经半亮，看着还是"一下亮"。
- **两种场合**：`GreetMode = peek | call`。只是鼠标停一下（peek）→ 画布 **160×190**、人物小一倍、**不演动作**；有人打电话过来（call）→ **320×380**、演招手。`dock.tsx` 把 `stageMode` 报给主进程，`taskbar-position.cjs` 新增 `PEEK_SPACE = 200` / `PEEK_WIDTH = 168`（那片透明区是**会吃鼠标**的，所以 peek 只留一半），`dock-window.cjs` 的 `applyLayout` 跟着记 `peek`。
- **三种方式打电话过来**（看我的屏幕 / 把他的屏幕给我 / 语音，服务端都是同一条 `request`）：新增 `src/callAttention.ts`（纯函数 `callAttention(requests, people)` → `{ id, name, character, mode: 'call' }`）+ `src/useCallAttention.ts`（只看"还有没有没处理的邀请"：有就立刻亮 + 让头像条把那个人拉出来招手，每 3 秒补一次，接听/婉拒/超时后 `requests` 空了自然停）。浏览器里没有绿光层，直接不挂。
- **两个坑（都补了断言）**：
  1. **`desktop-preload.cjs` 的白名单清洗**：它把 `previewGlow` 的载荷重建成 `{ sharing, on }`、把 `dockGreet` 重建成 `{ id, name, character }`，新加的 `fade`/`mode` 在这里被**静默丢掉** → 现象是"永远立刻亮、永远是小人儿不招手"。第一次真机量到"1ms 就到 1.000"就是它（`test/desktop-preview.test.mjs` 现在盯着这两个字段）。
  2. **"要不要从全透明重新亮起"必须由主进程判断**（`preview-glow.cjs` 的 `payload.restart`）：窗口一藏起来，页面里的过渡和计时器就被冻住，淡出那步可能根本没跑，页面自己记的"我还亮着"是错的 → 第二次悬停时它不再淡入。页面据此先**同步**强制一帧（`void glow.offsetWidth`）再改成不透明；**别用 requestAnimationFrame**（这个小窗有时拿不到帧，实测 rAF 一直不回调、opacity 一直 0）。
- **所有 21 个角色都适配招手**：`test/dock-rules.test.mjs` 逐个解析 21 个 GLB（有 `Wave`、通道都指向真实节点、真有旋转/位移通道）；新增浏览器 `test/browser/greet-characters.cjs` 把 21 个角色**真的**一个个挂上舞台演一遍，量手腕累计位移（待机 ≈0.02，招手 0.75～1.0，断言 > 0.15）——21 个全过（`canvas.__dockStage` 是舞台留在画布上的探针；骨骼名要按 `wrist/hand` 找，**不能写死 `Wrist.R`**，glTF 名字里的点号被 GLTFLoader 去掉了）。
- 测试：网页 `npm test` **227/227**（新增 dwell、两种场合、21 个角色、`useCallAttention`）、桌面 `npm test` **117/117**（新增 peek 几何、`applyLayout({stageMode})`、greet `mode` 透传、光晕 `restart`/`fade`）；浏览器 `dock.cjs`（peek 160×190 / call 320×380 + 真的在动）、`greet-characters.cjs`、`desk-preview.cjs`、`chat-threads.cjs` 全过。
- **前端已上线**：`npm run build` 后逐个传 `index.html`、`dock.html`、`assets/{main-BGHtv48u.js,icons-BvGxstLz.js,characterModel-DlqEuGVf.js,dockStage-B_gbbxIB.js,dock-6CrEJYBE.js,dock-Be_bcX47.css}`，8 个文件本地与远端 SHA256 一致；线上 `https://115.159.43.237/` 已返回 `assets/main-BGHtv48u.js`（HEAD 200，737,146 字节），`dock.html` 返回 `dock-6CrEJYBE.js`。**后端未改动、没有重启 officeweb。**
- **真机验证"慢慢亮"**（dev 客户端 + `--remote-debugging-port=9225`，`Build/glow-fade-check.mjs`）：连上绿光页面每 150ms 读 `#glow` 的实际透明度——冷启动第一次悬停与第二次悬停都一样：**0.3s → 0.05、1s → 0.57、半亮在 1.1 秒、2 秒到 1.00**，之后保持 3.6 秒再 0.5 秒淡出；三次重复一致。`Build/glow-page-state.mjs` 打页面自述与 `__glowLog`；`Build/glow-fade-shots.cjs` 是量真实像素那一版（当天因为 DXGI 被别的采集占住抓不到画面，工具留着）。
- **客户端 0.1.24**（**没有跑 `publish:update`**，线上 `latest.json` 仍是 0.1.21）：`npm run dist:installer` → `Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.24-x64.exe`，101,255,983 字节，sha256 `e68cdcbfa6bedeb8e1e70d70699f8e4aa253c2e97ba2c2b4839de3d260d3f19f`；`--office-smoke-test` 通过（`ok: true`，加载正式站）；`node Build/check-packaged.cjs` 逐条核对 asar 里 12 处新代码都在。
- **版本号说明**：并行的"Windows 11 头像条放最左"改动（见下一条）已经把版本带到 `0.1.23`，而那一版（11:55 打的包）里的绿光还是"立刻亮"、preload 也还没带 `fade`/`mode`——所以这一版补成 `0.1.24`，两条改动合在一起，避免和已存在的 0.1.23 安装器混淆。

## 2026-09-20 11:55 Win11 把任务栏头像条放到屏幕最左侧（Win10 不变）；**按用户要求暂不发布**（客户端 0.1.23 已打包）

- 需求（用户）：「当时Windows11系统的话 就把头像简单放在屏幕最左侧，Windows10保持当下状态」。
- 代码：`taskbar-position.cjs` 新增 `dockAnchor(os.release())`（build ≥ **22000** → `'left'`）、`LEFT_GAP = 8`，`dockBounds` 接受 `anchor`；`dock-window.cjs` 启动时定一次 anchor，并支持 `--dock-left` / `--dock-tray`（或 `IRULER_DOCK_ANCHOR=left|tray`）在任意机器上预览两种摆法。Win11 走"贴屏幕最左端"、不受托盘夹紧影响；Win10 完全走原来的"量托盘 + 贴托盘左边 + 夹住"。**本机是 Win10 19045，实测 `dockAnchor('10.0.19045') === 'tray'`，现场行为不变。**
- 验证：桌面 `node --test test/*.test.cjs` **116/116**（新增 3 项：build 判定、Win11 左端摆放与拖动夹紧、左端不受托盘夹紧影响）；打包产物 `win-unpacked/resources/app.asar` 里能查到 `dockAnchor` / `--dock-left` / `IRULER_DOCK_ANCHOR`。
- **发布状态：未发布**（用户 2026-09-20：「先不要发布 我测试好了给你说」）。0.1.22 曾短暂发布（11:51），随即按要求把 `dist/download/latest.json` **逐字回滚到 0.1.21**（线上确认仍是 0.1.21，没人会收到更新提示）。0.1.22 的安装器留在服务器 `dist/download/`（**没有任何清单引用它**）；0.1.23 只在本机 `Build/OfficeDesktopRelease/`（sha256 `e7409ca25a04…`）。用户说可以了再跑 `npm run publish:update`。
- 怎么测：Win11 机器直接装 `iruler-dream-Setup-0.1.23-x64.exe`；Win10 机器想看 Win11 的样子，用 `--dock-left` 启动（或设 `IRULER_DOCK_ANCHOR=left`）。

## 2026-09-20 10:00 页面自空转事故：办公室页 CPU 102%、内存狂涨、头像条一片空白（前端 `main-BIA-z1_K.js`，**不用重装客户端**）

- 报障（用户）：「现在呢遇见一个严重的bug 内存和cpu占比巨大 且头像没有出现」。
- **实测**（正式客户端 0.1.21 + `--remote-debugging-port=9223`，用 `Build/client-cpu.mjs` 按页面量，每个页面一条独立 CDP 连接）：办公室页一个渲染进程 **102% 一个核**、内存 **445MB** 且每 10 秒涨 11MB；主线程 `ScriptDuration` **5.39s / 6s**（脚本占满，布局/样式几乎为 0）；采集页与头像条页完全空闲。任务栏上的头像条只有 120px 宽、**什么都没画**，三维场景里也看不到人。
- **根因：React 无限重渲染回路**。`ChatInbox` 的 effect 依赖里放了 `props.onUnread`，而这个回调是 `App`/`SidePanel` 每次渲染新建的箭头函数；effect 里又 `setUnreadByPerson(byPerson)`（`byPerson` 每次都是新对象）→ App 重渲染 → 新箭头 → effect 再跑 → 无限循环。主线程被占满，**渲染、IPC、头像条推送全被饿死**，所以"CPU/内存爆表"和"头像不出来"是同一个病，不是两个。
- **修法（纯前端，刷新页面即生效）**：
  1. `ChatInbox`：回调放进 `useRef`，effect 依赖只留 `[unread, unreadKey]`——父组件传下来的函数绝不进依赖；
  2. `App`：`handleUnread` 用 `useCallback` 固定引用，并用 `mergeUnreadCounts(previous, next)`，内容没变就返回原对象（React 才会跳过渲染）；
  3. `SidePanel`：`setUnread(previous => previous === count ? previous : count)`；
  4. 新增纯函数模块 `src/unreadCounts.ts`（`sameUnreadCounts` / `mergeUnreadCounts`）。
- 发布：`npm run build` → 上传 `main-BIA-z1_K.js` 到 `~/officeweb/dist/assets/`（后端未改动，**没有重启 officeweb**）；线上 `https://115.159.43.237/` 现在返回 `assets/main-BIA-z1_K.js`，本地与线上 SHA256 一致。
- 真机核验（同一台机器、同一个正式客户端）：修复后办公室页 **0.30s / 6s**（原 5.39s）、进程 **249MB / 6.4 CPU 秒**（原 445MB / 260 CPU 秒），JS 堆不再持续增长；头像条回来了，截图 `Build/dock-fixed.png`（自己的头像，离托盘 8px）。
- 回归测试：新增 `test/browser/no-spin.cjs`——真实浏览器 + 真实服务器、两个账号，先暂停三维画面，再量 5 秒里主线程忙了多少、JS 堆涨了多少：空转时 **5.00s/5s**，正常 **≈0.09s/5s**，修复前必失败、修复后连续三次稳定通过；另有 `test/unread-counts.test.mjs`（比较 / 原地返回 / 以及"这三处写法不许退化"的源码断言）。网页侧 `npm test` 219 项、桌面侧 110 项全通过，浏览器 `dock.cjs` / `desk-preview.cjs` / `chat-threads.cjs` 同批复跑通过。
- **不需要重新打包安装器**：病在网页里，装了 0.1.21 的同事只要刷新（F5）或重启客户端一次；线上 `latest.json` 仍是 0.1.21，未动。
- 排查工具都留在 `Build/`：`client-cpu.mjs`（按页面量主线程/脚本/布局与 JS 堆）、`client-doctor.mjs`（问每个页面 DOM/状态/报错）、`client-eval.mjs`（在某个页面里求值）。**量每个页面必须用各自的 CDP 连接**，否则读数全是 0。

## 2026-09-18 19:38 **发布**客户端 0.1.21 给所有用户（`latest.json` 0.1.17 → 0.1.21）

- 用户指令：「ok 发布安装器给用户吧」（0.1.20/0.1.21 是在本地打好包、验证完才发的）。
- 一条命令：`cd OfficeDesktop && npm run publish:update -- --notes "…"`。脚本自己核验通过：大小 101,253,287 字节一致、前 1MB 哈希 `aead78829ce6…` 一致（`Accept-Ranges` 在）、线上 `latest.json` 已是 0.1.21。
- 线上确认：`https://115.159.43.237/download/latest.json` = `0.1.21` + sha256 `4738c1336d67b2337d2bc112c07aa9ff1ab4f97bb2bdd0abf5ef442e01cb0f98` + 更新说明；直链 `Range: bytes=0-1023` 返回 **206**（可断点续传）。
- **真机自检**（`Build/update-flow-check.cjs`，真的用 Electron 的 `net.fetch` 走客户端的网络栈）：10.4 秒下完 101,253,287 字节，**sha256 与清单一致**，进度回调 40 次（0% → 100%）——即客户端"弹提示 → 进度条 → 下载 → 校验 → 拉起安装器"这条链路是通的（没有运行安装器）。
- 更新说明（发给用户的）：新增任务栏头像条（贴任务栏、悬停看同事工位画面、卡片上直接通话）；有人来看你时屏幕四周闪绿光、那个人的角色会跳出来招手；离开电脑自动暂停工位预览，屏幕能正常熄灭；修好了头像条盖住输入法等托盘按钮、以及高 DPI 屏幕上位置跑偏的问题。
- 装有 0.1.17 及更早版本的同事，正常刷新页面就会看到右下角更新提示。
- **旧安装器清理**（用户 2026-09-18：「老的清理」）：服务器 `dist/download/` 删掉 0.1.14/0.1.15/0.1.16/0.1.18，**保留 0.1.21（当前）+ 0.1.17（上一个正式发布版，留着当回滚点）** → 580M → **194M**；本地 `Build/OfficeDesktopRelease` 删掉 28 个旧安装器/压缩包（0.1.0～0.1.16、0.1.18～0.1.20 以及各种 -notify/-iconfix 变体）→ **3.18G → 0.55G**，只留 0.1.21、0.1.17 和 `win-unpacked/`（烟囱测试要用）。清理后重新核验：`latest.json` 仍指向 0.1.21、直链 `Range` 仍返回 206。


## 2026-09-18 19:30 DPI 坑：那台机器上头像条跑到屏幕正中（客户端 `0.1.21`，**没发布**）

- 报障（用户）：「完全不对啊 那台设备的头像现在又跑到了正中心」——0.1.20 的托盘测量在那台机器上算出了错误的预留值。
- **根因（经典 DPI 陷阱）**：PowerShell 子进程默认**不是 DPI 感知**的，Windows 会把 `GetWindowRect` 返回的坐标**虚拟化**（已经除以缩放比例）。我拿到的 `TrayNotifyWnd.left` 在那台 150% 缩放的机器上其实是"已缩放的 1109"，我又除以 `scaleFactor` → 736，于是"托盘左边缘"被算到屏幕中间，条子自然跟着去了中间。这台机器 100% 缩放，虚拟化是恒等变换，所以一直看不出来。
- **两头都堵住**：
  1. 脚本先调 `SetProcessDPIAware()`（返回的坐标保证是物理像素）；
  2. 换算时**用任务栏高度自校准**：量到的任务栏高度 ÷ Electron 给的 DIP 厚度 = 这套坐标系里"1 DIP 等于几个单位"；比例接近 1（±15%）就说明拿到的是已缩放坐标，**不能再除** scaleFactor。
- 另加自检：算出来的预留 <40 DIP 或 >60% 屏宽、或者托盘顶到屏幕左边，一律当成"没量到"，退回 220 的估算值（宁可位置不完美，也不能跑到屏幕中间）。
- **诊断落盘**：每次量到都会把原始数据写进 `%APPDATA%\iruler dream\dock-tray.json`（`scaleFactor`、托盘矩形、任务栏矩形、`space`、最终 reserve）。哪台机器位置不对，看一眼这个文件就能判断是不是缩放/坐标系的问题。本机现在是：托盘 `1640..1920`、`space: 1`、`reserve.rightOffset: 288`、条子右边缘 `1632`（正好 8px 间隙）。
- 验证：桌面 `npm test` **110/110**（`tray-area` 8 项，新增"坐标被虚拟化过就不能再除一次缩放"和"离谱结果宁可不要"两条）；真机 dev 重启后位置不变（本机 100% 缩放），`dock-tray.json` 内容如上。
- 打包：`0.1.20 → 0.1.21`，`iruler-dream-Setup-0.1.21-x64.exe`（101,253,287 字节，sha256 `4738c1336d67b2337d2bc112c07aa9ff1ab4f97bb2bdd0abf5ef442e01cb0f98`），`--office-smoke-test` 通过；**没有发布**（`latest.json` 仍是 0.1.17）。


## 2026-09-18 15:35 头像条位置改成"真的去量托盘"（客户端 `0.1.20`，**没发布**）

- 报障（用户）：「我另一台电脑直接盖在了输入法等那一堆按钮上了 你需要计算位置啊」。
- **根因**：托盘宽度一直是**写死的 220 DIP**（Windows 不提供这个数字）。实测这台机器：`Shell_TrayWnd → TrayNotifyWnd` 的矩形是 **1664..1920 = 256px 宽**，也就是写死的 220 本来就压进去 36px；这台机器之所以没露出来，是因为 `dock.json` 里恰好有一次往左拖的 `dx: -123`（早期为了躲开手动留的）。用户那台机器托盘更宽（输入法 + 一堆图标），于是条子直接压在图标上。
- **现在的做法**：
  - 新增 `OfficeDesktop/tray-area.cjs`：用一次 PowerShell + `Add-Type` 的 P/Invoke 量 `TrayNotifyWnd` 的窗口矩形（物理像素），按 `scaleFactor` 折算成 DIP → `{ rightOffset, trayLeft }`；**缓存 30 秒**、同一时刻只跑一次、4 秒超时、非 Windows/量不到一律返回 null（退回 220 的估算值，绝不报错）。
  - `dock-window.cjs` 建窗时、页面加载完、以及每 20 秒重量一次托盘（托盘宽度会随图标多少变）；`taskbar-position.cjs` 除了用 `rightOffset`，还拿 `trayLeft` **夹住**：就算用户把条子往右拖、或者估算值偏小，条子右边缘也不许越过托盘左边缘 8px。
- 验证：桌面 `npm test` **108/108**（新增 `tray-area` 6 项：解析噪音/坏 JSON/空矩形、256px 换算、高 DPI 折算、副屏不算、缓存与失败兜底、并发只跑一次；`dock-window` 新增 2 项：量到就贴左边、往右拖也压不过去、量不到退回估算值）；真机 dev：清掉 `dock.json` 后条子右边缘 = **1632**，而托盘左边缘量到 **1640**（正好 8px 间隙，截图 `Build/dock-tray-gap.png` 里能看到条子和隐藏图标箭头/输入法「中」/时钟之间留了空）。
- **打包**：客户端版本 `0.1.19 → 0.1.20`，`npm run dist:installer` 出 `Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.20-x64.exe`（101,251,337 字节，sha256 见下方汇报）；打包后 `--office-smoke-test` 通过（`ok: true`）。**没有跑 `publish:update`**：线上 `latest.json` 仍是 0.1.17，服务器 `dist/download/` 里没有 0.1.20。


## 2026-09-18 15:10 有人来看我 → 他本人从头像条里跳出来，站在任务栏上招手（前端 `dock-CB9Ne3zn.js` / `main-FdduS8rL.js`；客户端本地 dev）

- 需求（用户）：「当有人看我时，除了绿色，还要把那个看我的人从状态栏头像中跳出来，站在状态栏上很大，做一个动作，动作就用下载的动作库里面找一个」。
- **动作库**：角色 GLB（Quaternius）里本来就带 24 条动作：`Death / Gun_Shoot / HitRecieve / Idle / Idle_Gun / Idle_Sword / Interact / Kick_Left / Kick_Right / Punch_Left / Punch_Right / Roll / Run* / Sword_Slash / Walk / Wave`。挑的是 **`Wave`（招手）**——"我来看你啦"。`test/dock-rules.test.mjs` 会直接解析 GLB 的 JSON 块确认这条真的存在，改名字会立刻红。
- **实现**：头像条上**那个来看我的人**的头像先蹦一下（`dock-jump`：抬 26px、放大 1.9 倍再落回 1.25 倍），同时条子上方开一个 **320×380 的小舞台**，用 three.js 渲染**他那套角色模型**演 `Wave`——画布下边缘贴着头像条上边缘，所以看起来就是**站在任务栏上**，1.72 米的人占画面八成（"很大"），脚下一块接触阴影。最后一个人来看我之后 3.6 秒自动收起；窗口跟着长高（`STAGE_SPACE = 390`），头像条位置不动。
- **three.js 按需加载**：`dock.tsx` 里 `import('./dockStage')`，小窗那一页仍然只有 **6.19 kB**（three 落到共享分块 `characterModel-*.js`，593 kB，只有真有人来看时才拉；角色 GLB 走浏览器缓存）。旧的"小窗不加载 three.js"规则改成"不**静态**加载"。
- 踩的坑：① Quaternius 的模型本来就面朝 +Z（相机方向），我按惯例转了 π，结果第一次跑出来**背对着人**（截图确认后去掉）；② 舞台窗口是懒建的，第一次闪时页面还没加载完，`send` 会丢——绿光那边同样的坑，这里靠 React 挂载后拉模型解决。
- 验证：桌面 `npm test` **100/100**（新增舞台几何、桥接频道与可信来源门）；网页 `node --test test/*.test.mjs` **216/216**（`GREET_CLIP` 必须真的在动作库里、小窗静态 import 里不许有 three、`stage` 要报给主进程）；浏览器 `test/browser/dock.cjs` **真跑一遍 3D**：舞台出现、画布 320×380、头像带 `data-greeting`、`layout.stage === true`、**真的下载了 `man_suit.glb`**、舞台截图非空、3.6 秒后自动收起（截图 `Build/dock-greet.png`）；真机 dev 截图 `Build/screen-dock-greet.png`（李文杰的角色站在任务栏上招手，窗口 320×430）。
- 发布：前端 `index.html`/`dock.html` + `assets/`（`dock-CB9Ne3zn.js`、`dock-BpGAQlxF.css`、`dockStage-D-wuU4OD.js`、`characterModel-0D0LrN8O.js`、`main-FdduS8rL.js`、`main-BG531GmC.css`、`icons-1E_n0O5i.js`）逐个 SHA256 核对、线上引用全部 200；后端 `preview-relay.mjs` 多带上"看的人的角色"并重启 `officeweb`（`active`）。客户端的舞台窗口代码只在 dev，没有打包发版。


## 2026-09-18 14:50 新功能：有人来看我了 → 所有屏幕四周闪一圈绿光（后端 `preview-relay.mjs` + 前端 `main-CDaCveS3.js`；客户端本地 dev）

- 需求（用户）：「当有人鼠标悬浮在自己头像上时，自己的所有屏幕的边缘都发绿光，面积很大，就是简单叠一个覆盖层的显示即可……相当于说有人来看我了，提示我一下」。
- **信号**：小窗悬停头像本来就会每 800ms 索要那个人的最近一帧，这条心跳同时当"我正在看他"用——`useDockBridge.onDockPreviewWant` 顺手调 `office.notifyWatching` → socket `preview-watch { target }` → 服务端 `preview-relay.watch()`（目标必须在场 / 有工位 / 不是访客 / 不是自己；同一对 700ms 只转一次）→ 转给**被看的人** `watched { from, name }` → 他的页面调 `officeDesktop.previewGlow()`。
- **绿光层**（新文件 `OfficeDesktop/preview-glow.{cjs,html,css,js}` + `preview-glow-preload.cjs`）：**每块屏幕一个**透明、整窗穿透、`screen-saver` 置顶、不抢焦点、不进任务栏的窗口，铺满整块屏；四周一大圈绿光（亮边 + 大范围绿雾 + 往中间淡出的渐变）。闪一下后 **3.6 秒**自动收掉，一直有人看就一直亮；插拔屏幕/改分辨率会重贴。**自己在共享屏幕时不闪**（否则那一圈光会被一起共享出去）。
- 踩的两个坑（已修 + 有测试）：① 窗口是第一次闪才建的，页面还在加载时 `send` 会丢 → 现在等 `did-finish-load` 并补一次；② `main.cjs` 是按名字解构 `require('electron')` 的，用 `screen` 必须加进那行，否则启动直接 `ReferenceError`（整窗不开）。
- 验证：桌面 `npm test` **97/97**（新增 `preview-glow` 5 项：每块屏一层、参数、闪→自动收、连闪不叠层、插拔屏幕、立刻收掉）；网页 `node --test test/*.test.mjs` **211/211**（中继的看/被看规则、限速、真服务端 `watched`、源码级链路断言）；真机 dev：`Build/glow-flash-loop.mjs` 连续闪 + `Build/screen-crop-all.cjs` 抓**每一块屏** + `Build/glow-analyze.cjs` 量四周一圈的 green excess（**这台机器壁纸本来就是绿的，肉眼看不出来**）：主屏 **14.5 → 48**、副屏也亮，`Build/glow-diff.png` 是放大 6 倍的差异图，`Build/glow-lit.png` 是主屏截图；`Build/glow-probe.mjs` 能直接问两个光晕页面「你亮了没有、在哪块屏」。中途有过一次假阴性（-0.5）：截图正好落在一次闪烁的淡出间隙里，所以**必须连续闪几次再抓**。
- 发布：后端 `server.mjs`（488 行）+ `preview-relay.mjs`（89 行）上传后 `systemctl restart officeweb` → `active`；前端 `index.html`/`dock.html` + `assets/`（`main-CDaCveS3.js` 等）逐个 SHA256 核对，线上 main 里能查到 `preview-watch` / `watched` / `previewGlow`。客户端的绿光层只在 dev，没有打包发版。


## 2026-09-18 14:20 走开/采集失败不再抹掉最后一张；更正：「Elsa 没在广播」是误判（前端 `main-Gb8SQmGe.js` + 后端 `preview-relay.mjs`）

- 用户追问：「为啥没有获得屏幕 不是说了保留离座1分钟前的最后一张 吗」。
- **先查真相**：从办公室页面把服务端的实时人头读出来（`office-peek.mjs --eval` + React fiber，见下）：Elsa `annotate=true`（**她是桌面客户端**）、在座时 `previewSharing=true`（**她一直在正常广播**）。所以上一轮"她的客户端从没广播过、可能是网页登录"是**误判**，要更正。真正的原因是三个都在我们这边：
  1. 小窗只问一次帧（14:00 已修，悬停期间每 800ms 再要）；
  2. 服务端不留帧，看的人手里没有就没有（13:53 已修，按账号缓存 + join 快照）；
  3. **`ambient-sharing:false` 会把画面抹掉**：显示器关掉会让采集失败 → 客户端发它 → 以前服务端 `sendPreview(null)` 让所有人和缓存都清空，看起来就是"办公室还关着屏幕"。
- 第 3 条这次修掉：`preview-relay.stop()` **不再删缓存**（只发一帧 null 告诉别人"现在没有实时画面"），`useOffice` 收到 null 也**不删手里那一张**（只有人真的离开空间、`retainPresent` 清整条时才丢）。`test/desktop-preview.test.mjs` 新增断言盯着这两处。
- 另外记一条坑：**任何人走开或断线重连后 `previewSharing` 都是 false**（服务端的人在重连时重建），要等他下一次出帧才回到 true——不能拿这个当成"他的客户端坏了"的证据。
- 验证：`node --test test/*.test.mjs` **208/208**；真机（dev）悬停 Elsa：**卡片里有她的屏幕画面** + 暗绿「在座」（截图 `Build/dock-card-elsa4.png`）；更早的 `Build/dock-card-away-lastframe.png` 是"我离座 2 分钟、采集已暂停，卡片仍是我离开前那一张"。
- 发布：前端 `index.html`/`dock.html` + `assets/`（`main-Gb8SQmGe.js`、`main-BG531GmC.css`、`dock-Dg1JwL3x.js`、`dock-C99WVchE.css`、`icons-uUDpnXpb.js`）+ 后端 `preview-relay.mjs`（`server.mjs` 未改），逐个 SHA256 核对；`systemctl restart officeweb` → `active`，站点 200。


## 2026-09-18 14:05 「不在就用最后一张」：服务端记住每个人的最后一帧（后端 `preview-relay.mjs` + 前端 `dock-Dg1JwL3x.js`）

- 用户把三条要求又说了一遍：「不要出现此人不在电脑前的文字 不在的话用最后一张 不要再办公室还关着屏幕」。查下来文字那条上一轮已经删了，剩下两条卡在**根本没有画面可显示**上：低清预览一直是"纯转发"的——服务端不留帧，看的人手里没有就是没有。实测（dev 里挨个悬停）：自己和李文杰有画面，离座 14 分钟的 Elsa 是一片白。另外小窗**只问一次帧**：悬停早了（主窗口手里还没有这个人的画面）就永远是一片白，直到挪开再悬停。
- **后端：新增 `preview-relay.mjs`**（把原来写在 `server.mjs` 里的 `sendPreview` + `preview` 处理搬出来，顺便加能力）：
  - 校验限速照旧（访客不广播、400ms 一帧、250KB 封顶、必须是 `data:image/jpeg;base64,`）；
  - 转发给"能看的人"（分享者自己也收，他桌上那块显示器才有画面）；
  - **按账号 `clientId` 缓存最后一帧**：人走开（客户端暂停采集、什么都不发）之后画面继续留着，别人——**包括刚启动的客户端**——都拿得到。`join` 结束时补一份快照（`previewRelay.snapshot(s.id)`），新开的客户端不用再等每个人下一次采集（最长 12 秒，人不在电脑前就永远不采），整间办公室不再是黑屏。
  - **只有明说停止广播**（`ambient-sharing:false`：关掉预览或关窗）才清掉最后一帧；断线只清限速表（人回来还认得出是他，重连也还在）。
  - `server.mjs` 因此**从 500 行降到 485 行**（正好离上限更远了）：`sendPreview` 删除、`preview` 处理收成一行、新增 join 快照与 disconnect 清理。
- **前端：小窗悬停期间每 800ms 再要一次帧**（`PREVIEW_POLL_MS`）：主窗口手里那张可能还没到，只问一次就会一直白着。
- 顺带确认：`dock.tsx` 收到空帧不覆盖已有的图、`useDockBridge` 有画才发——离座的人显示的就是"最后那一张"。
- 验证：`node --test test/*.test.mjs` **207/207**（新增 `preview-relay` 5 项：转发/回显/访客兜底/脏数据/限速、"人走开最后一张留着"、"明说停止才清掉"、"按账号记重连还在"；新增 `preview-snapshot` 5 项：**在真服务端上**验回显、join 快照、停止广播后不再补、访客兜底、限速）；浏览器 `test/browser/dock.cjs` PASS（改成断言"悬停期间反复要帧"，并保留离座标签/暗红暗绿/空帧不顶掉最后一张那些断言）；`test/browser/desk-preview.cjs`、`workstation-preview.cjs` 都 PASS（预览链路没被改坏）。
- 发布：后端 `server.mjs` + `preview-relay.mjs` 上传后 `sudo -n systemctl restart officeweb`（`active`，日志 `OfficeWeb ready on http://127.0.0.1:3108`，站点 200）；前端 `index.html`/`dock.html` + `assets/` 5 个 js/css（`dock-Dg1JwL3x.js`、`dock-C99WVchE.css`、`main-D6IWcUNw.js`、`main-BG531GmC.css`、`icons-uUDpnXpb.js`）逐个 SHA256 核对，线上引用全部 200。
- 真机（dev）截图：`Build/dock-card-self2.png`（我自己的卡片有自己的画面 + 暗红「离座 1 秒」）、`Build/dock-card-li2.png`（李文杰 + 暗绿「在座」+ 他的画面）。**Elsa 的卡片仍然是"暂时没有画面"**：她的客户端压根没有广播过工位预览（浏览器登录/老客户端都可能），服务端也就没有她的画面——这不是坏了，是真的没有，`Build/dock-card-elsa3.png` 就是这一张。
- 客户端（`dock-window.cjs` 等）依旧只在 dev，没有打包发版。


## 2026-09-18 12:45 卡片上写清「在座/离座」、离座也显示最后一张画面（前端 `dock-Cznt7O8a.js` / `dock-C99WVchE.css`）

- 用户要求（一句话四条）：「在座就显示暗绿色在座 离座显示暗红色离座，不要出现此人不在电脑前的文字 不在的话用最后一张 不要在办公室还关着屏幕」。
- **状态写成字**：悬停卡片名字右边多一个小标签（`.dock-card-state`），在座 = 暗绿 `#2f6b3c` 写「在座」，离座 = 暗红 `#8f3a2c` 写「离座 N 分钟」（时长仍然来自主窗口算好的 `away`）。名字放进 `.dock-card-who`，长了先省略名字，别把标签挤出去。
- **删掉「此人不在电脑前，预览已暂停」**（`dockRules.previewPlaceholder`）：离座不再等于"没有画面"，真的没画面时只说「暂时没有画面（对方可能没在采集）」。
- **离座显示最后一张**：小窗收到空帧时**不覆盖**手里已有的图（`dock.tsx` 的 `onPreview` 直接 return），主窗口那边也改成**有画才发**（`useDockBridge` 的 `onDockPreviewWant` 遇到空帧不推）——否则"对方停采 → 空帧 → 卡片变白板"就是用户看到的"办公室还关着屏幕"。
- 验证：网页 `node --test test/*.test.mjs` **197/197**；浏览器 `test/browser/dock.cjs` PASS（新增：离座标签文字 =「离座 6 分钟」且背景 `rgb(143, 58, 44)`、在座标签 =「在座」且背景 `rgb(47, 107, 60)`、整页不含「不在电脑前」、给离座的人推一帧后卡片显示图片、再推空帧图片**仍在**）；真机（dev）截图 `Build/dock-card-away.png`（我是甲方 + 暗红「离座 1 分钟」）与 `Build/dock-card-here.png`（李文杰 + 暗绿「在座」+ 实时画面）。
- **部署踩到的坑（差点把 dock 页面弄坏）**：这一版 `icons-*` 分块的哈希从 `CD4QjoSP` 变成了 `uUDpnXpb`，`dock.html`（和 `index.html`）都引用它。我按上一次的文件名上传，`scp` 报 `No such file or directory`，而**新的 dock.html 已经先传上去了**——那一瞬间线上 dock.html 指向一个不存在的 icons 分块。发现后立刻补传 `assets/icons-uUDpnXpb.js` 并逐个 `curl` 线上引用（`dock-C99WVchE.css`、`dock-Cznt7O8a.js`、`icons-uUDpnXpb.js` 全部 200 且 content-type 正确，不是 SPA 回退的 HTML）。**教训：重传前端前先 `ls Build/OfficeWeb/assets`，把 `index.html`/`dock.html` 里引用的每个文件名（含 `icons-*`）都对着真实文件核一遍，别照抄上一轮的清单。**
- 发布：`index.html`、`dock.html` + `assets/` 下 5 个 js/css（`main-D6IWcUNw.js`、`main-BG531GmC.css`、`dock-Cznt7O8a.js`、`dock-C99WVchE.css`、`icons-uUDpnXpb.js`），SHA256 与本地逐一相同。客户端侧仍是 dev，没打包发布。


## 2026-09-18 12:30 头像条点不动：不用点击穿透了，窗口跟着状态收放（前端 `dock-DXTdviRe.js`；客户端本地 dev）

- 报障（用户）：「**我鼠标放上去弹出的窗口我无法点击 快速消失了**」。先查根因再改，查出来的东西比想象的严重：
  - 小窗原本一直 `setIgnoreMouseEvents(true, { forward: true })` 穿透，指望页面收 mousemove 来判断"指针在头像条上了"再接管点击。**实测这台机器上 ignore+forward 一条 mousemove 都不给**：`Build/dock-hover-watch.mjs` 把真实指针从 x1400 扫到 x1590（正好压过 4 个头像），穿透状态下页面收到 **0** 条 mousemove、`enters` 空、卡片不出来；用 CDP 把 `setInteractive(true)`（=关掉穿透）再扫同一条轨迹，立刻收到 40 条 mousemove、`enters` 依次是 小桃1/李文杰/我是甲方/Elsa、卡片弹出（`cardName:"李文杰"`）。所以页面永远判不出指针上来了——悬停卡片要么不出来，要么出来了也点不动。透明窗上的 forward 本来就不稳（electron#40213），不修它，改成不依赖它。
- **新做法**：窗口**始终接收鼠标事件**，尺寸跟着状态走。没人悬停时窗口**就是头像条本身**（宽高都等于条子：实测 `window 157x40 @1420,1040`，正好压在条子上，一个像素都不多占任务栏）；悬停卡片打开时向上长高一个卡片空间、并宽到至少放得下卡片（实测悬停后 `340x250 @1237,830`，**头像条屏幕位置一动没动**，卡片完整在窗口内）。页面新增 `officeDock.layout({ expanded, width })`：**卡片开没开 + 条子实际多宽**——宽度以页面量出来的为准（`widthFor(count)` 只在页面报之前兜底），所以窗口不会再比条子宽出 30px 去盖住任务栏上别人的图标。`setIgnoreMouseEvents` / `dockRules.dockInteractive` 全部删除，测试里有断言禁止回来。
- **顺手抓到第二个真 bug**：`dock-bridge.cjs` 转发人头时按白名单重建字段，`self` / `missed` / `away` **都没在名单里**——所以真机上"自己的头像没有白圈也不排最前、未接来电没有 `!`、**悬停卡片里没有离座时长**"（用户前一天刚要求的那个）。浏览器 harness 直接吃 `buildDockState` 的产物，所以测试全绿而真机是坏的。已在白名单补上三个字段并加断言；现在 dev 真机状态里能看到 `self:true`（我在最左）与「离座 13 秒 / 6 分钟 / 1 分钟」。
- 另外：头像不再挂 `title`（系统悬停提示会盖在头像条上，卡片里已经写清名字/未读/离座时长）。
- 验证：桌面 `npm test` **92/92**（新增"窗口就是头像条本身"、"悬停时向上长高一个卡片空间、关掉就收回"、"不用点击穿透"、桥接的 `office:dock-layout` 通道与白名单三字段）；网页 `node --test test/*.test.mjs` **197/197**、`tsc --noEmit` 通过；浏览器 `test/browser/dock.cjs` PASS（新增断言：卡片开着时报 `expanded:true` 且宽度 = 条子实际宽度、离开后报 `expanded:false`）。真机（dev，`electron .` + `--remote-debugging-port=9222`）：真实鼠标扫过头像 → `hover.any:true`、`card:true`、`cardName:"我是甲方 · 离座 6 分钟"`；指针移开后窗口收回 `157x40`（就是条子本身）；真机截图 `Build/screen-dock-card.png`、`Build/screen-taskbar.png`。
- **这次验证犯了一个错，用户当场警告「不要乱打电话」**：为了证明"卡片上的按钮真的点得动"，我用真实鼠标点了第三个按钮（邀请语音）。原本打算把 `window.officeDock.action` 换成只记录不发送，但 `contextBridge.exposeInMainWorld` 暴露的对象是 `Object.freeze` 的，赋值被**静默忽略**——于是那一下真的走了 `office.request`，办公室窗口弹出「请求已发送，等待对方同意」。事后查过办公室窗口：`sessions 0`、无未接弹窗、无通知，请求自己超时了，没有留下任何东西。**以后一律不许用真实点击去点那三个按钮**（已写进 `OfficeWeb/AGENTS.md`）：要么用浏览器 harness，要么在捕获阶段拦下 click。
- 发布：**只上传了 `dock.html` + `assets/dock-DXTdviRe.js`**（dock 是独立入口，不必连带重传主包；`https://115.159.43.237/dock.html` 已引用新 `dock-DXTdviRe.js`，SHA256 与本地一致）。客户端侧（`dock-window.cjs` / `dock-bridge.cjs` / preload）**只在 dev 目录里，没有打包发布**——`latest.json` 仍是回退后的 0.1.17，等用户测试点头再打包发版。

## 2026-09-18 12:20 收起按钮写字了、共享小窗标题收窄（前端 `main-CSiebPKI.js` / `main-BG531GmC.css`）

- 用户追加：「屏幕小窗口的标题太宽了，通话的收起按钮太小了 也叫"收起吧"」。
- **通话的收起按钮**：不再是那个小小的 `⌄` 箭头，改成正常按钮并写上「收起」/「展开」（`aria-expanded` 仍在，`title` 里带对方名字）。收起后的三条规则（只有三个按钮、视频不显示、面板 ≤200×110）不变——按钮变宽后重新量过：约 141×80px。
- **共享小窗（`SharingPreview`）的标题**：`正在共享屏幕` → **`正在共享`**、`正在共享到会议` → **`共享到会议`**；窗口 360px → **320px**，标题 13px → 12px 且 `white-space: nowrap`（标题不再撑成一长条；屏幕名仍留在底部那行，带省略号）。
- 验证：浏览器 `test/browser/call-fold.cjs` **PASS**（新增断言：展开时按钮文字是「收起」、收起后是「展开」；同时截图 B 侧的共享小窗 `Build/sharing-preview-compact.png` 与 A 侧的收起态 `Build/call-folded.png`）。这一次也顺手修掉了用例本身的一个竞态：**必须等两边都"2 人在线"再发邀请**，否则请求会被服务器丢掉（表现为乙收不到「同意并接通」）。
- 发布：`npm run build` → 上传 `index.html` + `dock.html` + `dist/assets/` 下 5 个 js/css。线上 `main-BG531GmC.css`、`main-CSiebPKI.js`、`icons-CD4QjoSP.js` 与本地 **SHA256 逐一相同**，且都确认返回的是真 CSS/JS 而不是 SPA 回退的 HTML；CSS 里能查到 `.call-fold`、`width:min(320px`，JS 里能查到「共享到会议」。`Build/live-boot-check.cjs` 打开正式站无页面错误。

## 2026-09-18 12:05 通话窗口可以收起，收起后只剩三个按钮并且够小（前端 `main-CmZjs8oP.js` / `main-IFVeK0Av.css`）

- 需求（用户）：「通话中的小窗口可以折叠起来，折叠后只剩三个按钮」「视频窗口的收起也要收起的够小」。
- 改动：`PrivateCallPanel.tsx` 加 `.call-fold` 收起按钮（`⌄`/`⌃`），收起状态按 session id 记在本机内存；收起后**只留麦克风 / 共享 / 挂断三个图标按钮**（`aria-label` 决定语义，`title` 出提示），视频与状态文字全部隐藏、面板整体缩到最小（`main-IFVeK0Av.css` 里 `.call-folded …` 一套规则）。视频元素**不卸载**，只用 `display:none` 隐藏，展开瞬时恢复、不动共享状态。
- **顺手修掉一个继承坑**：`styles.css` 的全局 `header { height: 102px; border-bottom }` 会落到通话卡片的 `<header class="call-heading">` 上，所以收起时怎么都是 102px 高（实测面板 172px）。现在 `.call-heading` 显式 `height:auto; min-height:0; border-bottom:0`；窄条里的中文还要 `white-space:nowrap`，否则 flex 逐字换行、高度再翻几倍。
- 验证：浏览器 `test/browser/call-fold.cjs` **PASS**（本地服务器 + 正式 LiveKit：甲请乙共享屏幕 → 视频真的播起来 → 收起后断言只有三个按钮、视频不可见、面板 ≤200×110 且比展开窄一半 → 展开画面回来 → 再收起点挂断，两边面板都消失），截图 `Build/call-folded.png`；`tsc --noEmit` 通过。
- **部署过程中自己踩的坑（已修）**：第一次 `scp` 把 `main-*.js/css`、`icons-*.js`、`dock-*` 直接传到了 `dist/` 根目录（应该进 `dist/assets/`），而 `static.mjs` 的 SPA 回退把缺失资源返回成 200 的 HTML——差点当成"上传成功"。已删掉放错的文件、按 `dist/assets/` 重传，并**逐个核对线上内容不是 HTML 且 SHA256 与本地一致**；线上 `main-IFVeK0Av.css` 里能查到 `.call-heading{…height:auto;min-height:0;border-bottom:0}` 与 `.call-folded`。`Build/live-boot-check.cjs` 打开正式站无页面错误。

## 2026-09-18 10:55 任务栏头像条（dock）：贴任务栏看在线同事、悬停看缩略图、可直接通话（前端 `main-C3jZuwtg.js` / `dock-XauI8cGZ.js`；客户端 0.1.18）

- 需求（用户）：先讨论可行性，最后定「方案 B：独立小浮窗」+「悬停用最近一帧」+「只显示在线的人」+「贴右侧托盘左边」+「任务栏自动隐藏时跟着藏」+「尽量像任务栏图标」。
- **架构铁律（有测试守着）**：小窗只做「显示 + 遥控」。主窗口是唯一 socket 与媒体拥有者——服务器 `join` 会把同一 `clientId` 的旧 socket 踢掉（`server.mjs` 270-276），小窗若自己连 socket 会把主窗口顶下线。数据流：主窗口 --IPC--> 主进程 `dock-bridge.cjs` --> 小窗；点击反向走同一条路。
- 新增/改动：`OfficeDesktop/taskbar-position.cjs`（纯几何：边/厚度/自动隐藏/放置/拖动夹紧）、`dock-window.cjs`（建窗、跟随、拖动记忆、按人数调宽、点击穿透开关）、`dock-bridge.cjs`（中转 + 双向可信来源校验）、`desktop-dock-preload.cjs`（只暴露 state/onState/requestPreview/onPreview/action/drag/setInteractive）、`preview-*` 无改动；网页端 `dock.html` + `src/dock.tsx` + `dock.css`（独立入口约 3KB，**不加载 three.js**）+ `src/dockRules.ts`（谁显示/排序/占位文案/穿透命中）+ `src/useDockBridge.ts`（主窗口每秒推状态、悬停给帧、接点击发起邀请）+ `vite.config.ts` 多入口 + `ChatInbox`/`SidePanel` 把"每人未读"报上来。
- 关键实现细节：窗口 = 头像条(44 高) + 卡片空间(210)，宽度 = max(人数*38+34, 340)，**窗口右边缘与头像条右边缘对齐**（卡片永远落在窗口内不被裁）；透明区域默认 `setIgnoreMouseEvents(true, {forward:true})`，页面命中判定后才接管点击（否则会盖住任务栏上别人的图标）；任务栏自动隐藏/自己共享屏幕/窗口全屏时自动隐藏；托盘菜单新增「显示任务栏头像条」开关。
- 验证：
  - 桌面 `npm test` **87/87**（新增 `taskbar-position` 10 项、`dock-window` 10 项、`dock-bridge` 8 项：建窗参数、四条边、自动隐藏、拖动记忆、宽度、点击穿透、只有两个窗口能说话、状态清洗）。
  - 网页 `node --test test/*.test.mjs` **191/191**（新增 `dock-rules` 8 项，含"小窗里不许出现 socket.io/useOffice/getDisplayMedia"这条铁律断言）。
  - 浏览器 `test/browser/dock.cjs` PASS：一排头像、徽标（在座绿点/离座红点/共享标/未读数字/未接来电 !）、悬停缩略图、三个按钮各走一次、访客占位文案、空状态、隐藏状态、点击穿透开关（截图 `Build/dock-strip.png`、`dock-hover-card.png`、`dock-no-preview.png`）。
  - **真机自检** `Build/dock-check.cjs`（真 Electron + 真任务栏）：窗口 `1240,826 460x254`、`edge=bottom`、页面从 `https://115.159.43.237/dock.html` 加载、3 个头像与拖动把手渲染出来、悬停卡片带图且在窗口内（`rect 16,25`）；并截屏 `Build/dock-taskbar-crop.png` 供人眼核对——头像条确实压在任务栏上、紧贴托盘左边。
- 发布：客户端 `iruler-dream-Setup-0.1.18-x64.exe`（101,247,616 字节，SHA256 `73f06605e3e873e0cc05c01bc0f255c0a6a41d8bf5d4eb8781d00c74ffaa6d41`，`publish:update` 自动核验通过，`latest.json` 已是 0.1.18；打包后烟囱测试 `ok:true`，asar 里含四个 dock 模块）；前端 `index.html` / `dock.html` + `assets/main-C3jZuwtg.js`（SHA256 `83f99a97d58dbb8bab37976b713ce477bbf04b30155ef1de8124785c05a21c0f`）、`assets/dock-XauI8cGZ.js`（`52f1a3daa8bb5bee33be470417aafdc94a6dcb3532cd175e0033bf784ef2e9fa`）、`main-Cuvm_341.css`、`dock-_G-RqDVc.css`、`icons-DBo0eNci.js`，线上与本地哈希逐字节一致。
- 注意：多入口之后**入口文件名变了**（`main-*` / `dock-*` / `icons-*`，不再是 `index-*`），以后重传前端要按 `index.html`、`dock.html` 里的引用逐文件上传；`dist/download/` 仍不能清。
- 设计文档：`Design/Taskbar_Dock_20260917.md`。

## 2026-09-17 21:55 离开电脑就暂停工位预览采集，别再挡息屏（前端 `index-D8ot_KOa.js`；客户端 0.1.17）

- 用户先问「可不可以不影响电脑电源管理的几分钟就息屏」，查清后要求：「**离开就暂停采集 不要耽误息屏**」。
- **先实测**（`Build/sleep-request-check.cjs`、`Build/capture-release-check.cjs`，真 Electron + `powercfg /requests`）：
  - 只开窗口：DISPLAY **无**（不挡）；
  - 页面**播放视频**：DISPLAY **无**（播放视频只保留 SYSTEM 请求，不挡息屏）；
  - **正在采集桌面**：DISPLAY `[PROCESS] electron.exe | Native desktop capture` —— **会挡**；
  - **停止采集后**：DISPLAY 回到 **无** —— 所以"停流"确实能让屏幕按电源计划熄灭，这条链路成立。
  结论：Chromium 采集桌面时会申请屏幕常亮（OBS 之类同理），Electron 没有"能采集但不申请常亮"的开关，只能**在不该采集的时候停掉采集流**。
- 实现（判定放在主进程，页面只读状态）：
  - 新增 `OfficeDesktop/preview-idle.cjs`：`createPreviewIdleGate()`，`AWAY_PAUSE_SECONDS = 60`，用 `powerMonitor.getSystemIdleTime()`；空闲跨过阈值的那一次翻转调用 `onChange(true)` → `previewCapture.stop()`；读不到空闲时间一律当 0（宁可继续采集，也不莫名停掉别人的预览）。
  - `desktop-bridge.cjs`：`office:preview-frame` 在暂停时**直接返回 null**（不给帧、也不重新附着采集）；新增 `office:preview-state` → `{ paused, idleSeconds, awayAfter, attached }`；`desktop-preload.cjs` 暴露 `previewState()`。
  - 网页：`useDesktopPreview` 收到 null 帧时问一次 `previewState()`，确认是"离开"就置 `paused`（不算失败、不弹提示、不发预览），状态行显示「**我的工位预览：已暂停（你离开超过 1 分钟，屏幕才能熄灭）**」；有帧时自动清掉这个状态。`previewGate.previewReason` 新增 `paused`（优先于"采集失败"）。
  - 阈值 60 秒 ≤ 系统关屏超时，所以不会把关屏往后拖；共享屏幕走的是另一条采集（`getDisplayMedia`），**不受影响**，正在共享时屏幕仍然是亮的（本来就该亮）。
- 验证：桌面 `npm test` **60/60**（新增 `test/preview-idle.test.cjs` 6 项 + 桥接里"离开就停采集、回来恢复"1 项）；网页 `node --test test/*.test.mjs` **184/184**（状态行与"暂停来自主进程"断言）；客户端烟囱测试 `ok:true`。
- 发布：客户端 `iruler-dream-Setup-0.1.17-x64.exe`，101,243,090 字节，SHA256 `8977208096941492a6fa6383fe5e5ef32759375bc560ec83752e81555f14f0fd`，`latest.json` 已是 0.1.17（`publish:update` 自动核验通过）；前端 `index.html` + `assets/index-D8ot_KOa.js`（SHA256 `64085f16524bb26f1f49d9a4685b527775c1d0c1f0c5e0394dae51deed5a694c`，与本地一致）。
- 另附：那台 VPS **没有任何限速**（`tc qdisc` 只有默认队列），实测客户端同一条代码路径下 96.6MB 用 8.8 秒（11.5 MB/s）；用户遇到的"下载慢"更可能来自共用这台机器的另一个服务占带宽、他本机的系统代理 `127.0.0.1:7890`、或 Defender 扫描正在写入的安装包。

## 2026-09-17 13:35 按用户要求回退：老客户端点更新直接下载，不再跳说明页（前端 `index-DpJlq-wq.js`）

- 用户反馈（第三轮）：「你这个引导也更麻烦了 算了还是刚才那样吧 下载后让他自己去找吧」。
- 回退内容：老客户端（无更新桥）的 `browser` 阶段不再打开 `/download/` 说明页，改回**直接把安装包直链交给系统浏览器下载**；卡片文案缩成一行「已开始下载 0.1.16 安装包 · 下载完成后到系统的「下载」文件夹双击安装」+ 文件名与大小，按钮「重新下载 / 复制下载地址 / 稍后」。`DOWNLOAD_PAGE` 常量删除（不再被代码引用）。
- **保留**：`public/download/index.html`（`https://115.159.43.237/download/`）作为可以直接发给同事的直链，页面上仍有三步说明；`static.mjs` 的目录首页支持也保留（通用能力）。新客户端（≥0.1.16）的"下完 3 秒自动弹安装器 + 打开文件夹"不变。
- 验证：`test/update-rules.test.mjs` 改成断言"**不要再塞操作步骤**（提示里不许出现「在文件夹中显示 / Ctrl / Win」）"和"直接 `window.open(安装包直链)`"；浏览器 `update-prompt.cjs` 四阶段 PASS；线上入口 `index-DpJlq-wq.js`，SHA256 `2246ad4246cd3138d40fe55fd47063489b8185504a34c1d98f826fb4f0a44498` 与本地一致，线上包内已无「已在浏览器打开下载页」。

## 2026-09-17 13:20 老版本用户"下载了找不到文件"：改成打开浏览器里的下载说明页（前端 `index-D4lK25Xr.js` + 新增 `download/index.html`；后端 `static.mjs` 支持目录首页）

- 用户报障（第二轮，讲的是**别人的老版本客户端**）：「老版本人家用户下载了找不到文件位置…你搞新的有啥意义」。
- **先查证旧客户端到底能干什么**（`@electron/asar` 直接读已安装 0.1.13 的 asar）：
  - `desktop-preload.cjs` 暴露的只有 `focusWindow / alert / onAlertOpen / displays / selectDisplay / previewFrame / setPreviewActive / systemIdle / saveLogin / readLogin / clearLogin / setFullscreen / onFullscreenChange / annotations`；
  - `chrome.cjs` 的 `dream:action` 只有 reload / browser / quit / zoom* / fullscreen / devices / microphone / permissions / minimize / maximize / close；
  - `main.cjs` 的 `setWindowOpenHandler`：本站 URL 在窗口内打开，**其它 http(s) 交给 `shell.openExternal`（系统默认浏览器）**，其余 scheme 一律 deny。
  - 结论：**旧客户端没有任何"打开文件夹/运行文件"的能力**，而且 `file://` 会被 deny。它唯一能做的是把 http(s) 地址丢给系统浏览器 —— 所以文件落在浏览器的下载目录里，软件这边当然"什么都不弹"。
- **改法（不需要用户更新客户端就生效，因为网页是线上的）**：
  - 老客户端点「下载更新」时不再把 **exe 直链**丢给浏览器，而是打开**下载说明页** `https://115.159.43.237/download/`：页面自动开始下载（也可手动点），显示版本/大小/发布说明/SHA256，并写明**三步**：「等下载完 → 点浏览器右上角刚下载的文件名里的「在文件夹中显示」（找不到就 Ctrl+J 看下载列表）→ 双击 `iruler-dream-Setup-x.y.z-x64.exe` 安装」，外加「还是找不到？Win+E → 左侧『下载』」。
  - 软件内卡片同步改成：「已在浏览器打开下载页（0.1.16）· 请在打开的页面里点『下载安装包』，然后按页面上的三步安装」+ 文件名与大小 +「装好这一版之后就能在软件里一键更新」，按钮「重新打开下载页 / 复制下载地址 / 稍后」。
  - 页面放在 `public/download/index.html`（随前端构建进 `dist/download/`，与安装器同一个目录）；`static.mjs` 增加**目录首页**支持（`/download/` → `/download/index.html`），否则目录地址会回落到 App 外壳。
- 验证：`test/static-files.test.mjs` 新增"目录地址返回自己的 index.html，没有 index.html 时仍 404"；`test/update-rules.test.mjs` 新增"下载说明页：读同一份 latest.json，写明三步安装与文件名"与老客户端文案断言；浏览器 `update-prompt.cjs` 四个阶段 PASS；`node --test test/*.test.mjs` **183/183**。线上实测：`/download/` → 200 `text/html`（含「在文件夹中显示」「Win + E」），`/download/index.html` → 200，`latest.json` = 0.1.16，入口 `index-D4lK25Xr.js`（SHA256 `35867e383c6b62ca0c752f3bf30d461dc2d20d3b580ed9cee6ce192381db092e`）与本地一致；`officeweb` 重启后 active。
- **仍然要说清的边界**：任何 ≤0.1.13 的客户端都**不可能**自己运行安装器（Windows 也不允许程序无提示替换正在运行的自己），第一次升级必须人工双击安装包；0.1.14 起才是"一键更新"。给同事可以直接发这条链接：`https://115.159.43.237/download/`（不用登录，任何浏览器都能打开）。

## 2026-09-17 13:10 修「旧客户端下载好了既没弹文件夹也没弹安装」：老客户端说清怎么手动装；新客户端下完自动弹安装器 + 「打开文件夹」（前端 `index-CVVBXBXa.js`；客户端 0.1.16）

- 用户报障：「旧客户端选择位置之后下载好了没有弹出文件夹，或者没有弹出安装」。
- **查证**：本机装的仍是 **0.1.13**（没有更新桥），`window.open` 让内嵌 Chromium 把安装包静默存进了 `C:\Users\Administrator\Downloads\iruler-dream-Setup-0.1.15-x64.exe`（96.6MB，12:55）——文件在，但页面既不能打开文件夹也不能运行 exe，所以看着像"什么都没发生"。这是平台限制，不是下载失败。
- **老客户端（<0.1.14）改法**：新增 `browser` 阶段文案，点「下载更新」后卡片变成「正在下载 0.1.15 安装包 · 下载完成后到系统的「下载」文件夹双击安装」，并写明安装包文件名与大小、「装好这一版之后就能在软件里一键更新」，按钮是「重新下载 / 复制下载地址 / 稍后」。**不再假装能自动安装**。
- **新客户端（≥0.1.16）改法**（对应原需求"然后安装器打开覆盖安装"）：下载完成即进入 `ready` —— 文案「下载完成，**3 秒后自动启动安装程序**」，到点自己调用 `installUpdate`（打开安装器 + 客户端退出 + 安装器覆盖安装并重启），另有「立即安装 / 打开文件夹 / 稍后安装」三个出口；`office:update-reveal` → `shell.showItemInFolder` 让"弹出文件夹"成为真的按钮。
- 测试：桌面 `npm test` **53/53**（`update.test.cjs` 新增"弹出文件夹：定位安装包；文件不在或路径越界都拒绝"）；网页 `test/update-rules.test.mjs` 新增"老客户端走浏览器下载：要说清文件去哪了、怎么装"；浏览器 `update-prompt.cjs` 增加 ready 与 browser 两个阶段（截图 `Build/update-old-client.png`、`Build/update-old-idle.png`）。
- 发布：`latest.json` → **0.1.16**（`iruler-dream-Setup-0.1.16-x64.exe`，101,240,693 字节，SHA256 `0df91db0dd6e774a5d39d3db6525792a0cfba03e6ff76bda6bdcc8a7c04f6e39`，`publish:update` 自动核验通过）；前端 `index.html` + `assets/index-CVVBXBXa.js`（SHA256 `ecf8581fa2f35a14bc73c087c1eca0bf9cac1df05066167a68b2ee47beee9114`，与本地一致）。
- **给用户的动作**：安装包已经下到本机 `C:\Users\Administrator\Downloads\iruler-dream-Setup-0.1.16-x64.exe`（哈希已核对），双击即可；装完这一版，以后就真的是"弹提示 → 进度条 → 自动弹安装器"。

## 2026-09-17 13:05 发布 0.1.15：底部栏显示客户端版本（并让"自动更新"第一次真的能被看到）（前端 `index-Dm7F-A2e.js`；客户端 0.1.15）

- 承接上一条：0.1.14 已经能自动更新，但**装 0.1.14 的人看不到提示**（装的就是最新版）。所以再发一版 0.1.15，让 0.1.14 的用户第一次就看见完整流程：右下角弹「发现新版本」→ 进度条 → 立即安装 → 安装器覆盖安装并重启。
- 顺带补上"我装的是哪一版"：`useAppUpdate` 把 `appVersion()` 的结果作为 `currentVersion` 暴露出来，`App.tsx` 底部栏在「离座检测：…」后面显示「客户端 0.1.15」。这正是上一轮"装的 0.1.11 却以为是最新"那类问题的根治——以后看底部栏就知道。
- 测试：网页 `node --test test/*.test.mjs` **180/180**（`update-rules.test.mjs` 增加"底部栏要显示装的是哪个版本"）；桌面 `npm test` **52/52**；浏览器 `update-prompt.cjs` PASS。
- 发布：前端 `index.html` + `assets/index-Dm7F-A2e.js`（SHA256 `1654d99ad60810972a390e66a2df6310b2a16b24a6118c3e0636e15e473c652a`，与本地一致）；客户端 `iruler-dream-Setup-0.1.15-x64.exe`，101,241,205 字节，SHA256 `e358019ed862fe66c854d5e9079c7d9572a21b4db712fa66acdb6d071ab44c13`，线上 `download/latest.json` 已是 0.1.15（`publish:update` 自动核验：大小、前 1MB 哈希、Accept-Ranges、线上清单）。
- **给用户的动作**：本机现在装的是 0.1.13，**先手动装一次 0.1.14 或 0.1.15**（0.1.14 起才有更新桥）。装 0.1.14 的话，打开就会看到「发现新版本 0.1.15」，点一下就能走完整流程。

## 2026-09-17 12:50 应用内自动更新：一条命令推安装器 + 网页弹提示 + 进度条 + 覆盖安装（前端 `index-BZ2aCnT5.js` / `index-Cuvm_341.css`；客户端 0.1.14；服务器新增 `~/officeweb/dist/download/`）

- 需求（用户）：「搞一个推送的功能 直接用命令推送到我的服务器安装器，然后网页检测到新版本就弹出更新软件的提示，然就是下载进度条，然后安装器打开覆盖安装」。
- **发布端（一条命令）**：`OfficeDesktop/tools/publish-update.mjs`，`npm run publish:update -- --notes "更新说明"`。取 `Build/OfficeDesktopRelease` 里与 `package.json` 版本一致的安装器 → 流式算 sha256 → `scp` 到 `~/officeweb/dist/download/` → 写并上传 `latest.json` → **从公网核验**（HEAD 大小一致、`Range: bytes=0-1048575` 前 1MB 哈希与本地一致并确认 `Accept-Ranges`、线上 `latest.json` 已是新版本）。`--verify full` 会整包重下核对；`--dry-run` 只看要做什么。
- **客户端（0.1.14）**：`update.cjs` 用 Electron 的 `net.fetch` 流式下载到 `%TEMP%\iruler-dream-update\`，每 250ms 通过 `office:update-progress` 把字节数/百分比推给页面，下完校验 sha256（不符就删掉），`installUpdate` 交给 `shell.openPath` 打开安装器并 **1.2 秒后退出**——安装器才能覆盖正在运行的文件。`desktop-preload.cjs` 暴露 `appVersion` / `downloadUpdate` / `installUpdate` / `onUpdateProgress`，全部走既有的**可信来源**门（只有本网站的页面能调）。只允许从本站下载（`trusted()`），路径必须落在更新目录内，且拒收 >512MB。
- **网页**：`updateRules.ts`（纯规则：版本按段比数字、`formatBytes`、`percent`、`describeUpdate`）+ `useAppUpdate.ts`（读 `/download/latest.json?t=…`，问客户端 `appVersion()`，订阅进度，「稍后」按版本记在 localStorage）+ `UpdatePrompt.tsx`（右下角卡片、进度条 `role=progressbar`、「下载更新 / 立即安装 / 稍后」）。老客户端（<0.1.14，没有 `appVersion`/`downloadUpdate`）照样弹提示，但文案是「当前客户端不支持自动更新」，点下载走浏览器直接下载安装包。
- **验证**：桌面 `npm test` **52/52**（新增 `test/update.test.cjs` 6 项：进度、写盘、校验失败删文件、下载不完整、体积上限、只信任本网站与目录外路径拒绝；`test/publish-update.test.cjs` 5 项：参数、清单结构、哈希、默认安装器、服务器与密钥沿用部署文档）；网页 `node --test test/*.test.mjs` 里本次相关 **17/17**（新增 `test/update-rules.test.mjs` 4 项）；浏览器 `test/browser/update-prompt.cjs` PASS（截图 `Build/update-available.png`、`update-downloading.png`、`update-old-client.png`：右下角、42.5% 进度条宽度、按钮禁用状态、老客户端文案）。打包后烟囱测试 `ok:true`。
- **已发布的这一版**：`iruler-dream-Setup-0.1.14-x64.exe`，101,239,425 字节，SHA256 `92ef0bc72f05e166a5185985399e13434fef046d5cf1c1173dd720dee32288b4`，线上 `https://115.159.43.237/download/iruler-dream-Setup-0.1.14-x64.exe`，`download/latest.json` 已是 0.1.14；前端上传 `index.html` + `assets/index-BZ2aCnT5.js` + `assets/index-Cuvm_341.css`（线上哈希与本地一致）。
- **注意**：装在本机的是 **0.1.13**（没有更新桥），所以这一次仍需手动装 0.1.14；从 0.1.14 起才是"点一下就更新"。`node Build/which-client.cjs` 可以对比"已装的"和"刚打的"客户端各支持哪些能力。
- 坑：`~/officeweb/dist/download/` 是**部署产物目录**，不是仓库内容；以后重传前端不要 `scp -r` 或清空 `dist`，否则会把安装器删掉（占用约 100MB，服务器磁盘要留意）。

## 2026-09-17 12:35 屏幕共享改两层（720p 垫底 + 1080p）并把 LiveKit 切到 send-side BWE（前端 `index-CIFNV6CQ.js`；VPS `/etc/livekit/livekit.yaml`）

- 用户追问：「为什么不能还是三层把速度提快呢 从低到高快速过去不能吗 非要写死吗」→ 选定**加回一层 720p 垫底**，并且「直接更新服务器就行，不要管人」。上一版（20:45）是单层 1080p：**第一帧就清晰、抖动不掉清晰度**，但弱网对端没有可降级的那一路。
- 网页（`mediaRooms.ts`）：`publishDefaults.screenShareSimulcastLayers: [ScreenSharePresets.h720fps15]` —— **一个 preset ⇒ 正好两层**（源码 `presets.length === 1` 走 `[low, original]`）：720p@15 1.5 Mbps 垫底 + 1080p@15 5 Mbps 顶层，总上行约 6.5 Mbps；顶层码率、`contentHint = 'text'`、屏幕轨默认的 `maintain-resolution` 都不变。**为什么不做三层**：默认三层里最低那层是 q 层（很小），对端先订阅它就是"很久才清晰"；而且层数本身不是清晰度开关——**选哪一层由 LiveKit 服务器按接收端带宽估计决定**，页面里只能声明"我要最高层"（我们已 `adaptiveStream: false` ⇒ `VideoQuality.HIGH`），没有任何开关能命令它立刻给顶层。所以正确做法是"把垫底层做得看得清 + 顶层码率给足"。
- 服务器：`/etc/livekit/livekit.yaml` 的 `rtc.congestion_control` 加 `enabled: true` + `use_send_side_bwe: true`（按发送端带宽估计选层，比 SFU 探测接收端快；字段路径按 livekit v1.8.4 的 `pkg/config/config.go` 核对过）。回滚点 `/etc/livekit/livekit.yaml.bak-20260915-bwe`（改动脚本 `Build/livekit-bwe-apply.sh`，幂等）；`systemctl restart livekit` → **active**，`ss` 显示 7880 与 TURN 55000 都在听，日志 `starting LiveKit server ... version 1.8.4`、TURN 正常启动；`Build/livekit-api-check.mjs`（在服务器上跑，`RoomServiceClient.listRooms()`）返回正常、officeweb 仍 active。
- 验证：`node --test test/*.test.mjs` **176/176**（`screen-quality` 改成断言"两层、垫底层 ≥720p、垫底码率 ≥1 Mbps"；`media-lifecycle` 的 livekit 桩补上 `ScreenSharePresets`，否则 `Cannot read properties of undefined (reading 'h720fps15')`）、`tsc --noEmit` 通过。线上当前服务的就是 `index-CIFNV6CQ.js`（12:18 构建，与本地逐字节一致，包内含 `h720fps15`；同时也带着并行会话 12:20 的"离座检测"文案）。
- **顺带说明**：导出服务器配置时我的脱敏正则只匹配了顶格的 key，没盖住"两个空格缩进"的情况，**LiveKit 的 API key/secret 被打印在这个会话里了**。要轮换的话：改 `/etc/livekit/livekit.yaml` 的 keys → 同步改 `/home/ubuntu/officeweb/.env` 的 `LIVEKIT_API_KEY/SECRET` → 重启 `livekit` 与 `officeweb`（我没擅自轮换，因为会中断正在进行的通话）。

## 2026-09-17 12:20 查明「离座检测不管用，鼠标要进软件才算」= 装的是 0.1.11 客户端；底部栏显示判定方式（前端 `index-AihhNAtS.js`）

- 用户报障：「离座检测不管用 鼠标需要去到软件里面才行，我在别的软件工作的话那就没有意义了」。
- **先查证再改代码**（`Build/which-client.cjs` 直接读 asar）：本机**已安装**的 `C:\Program Files\iruler dream` 是 **0.1.11**（asar 时间 09-15 14:21，`office:system-idle` 与 `systemIdle` **都不存在**）；已经打好的 `Build/OfficeDesktopRelease/win-unpacked` 是 **0.1.13**（`office:system-idle`、`systemIdle` 都在，烟囱测试 `ok:true`、URL 正确）。也就是说：网页侧"问 Windows 全局空闲时间"的代码早就在线上了（线上包里有 `systemIdle`/`input-state`/`idleMs`），但**装在他机器上的客户端太旧、没有这个桥**，所以自动退回"只看本窗口输入"——正好就是"鼠标必须进软件"的现象。
- **结论：这是客户端版本问题，不是判定逻辑 bug**。修法 = 装 `Build/OfficeDesktopRelease/iruler-dream-Setup-0.1.13-x64.exe`（0.1.13 起才有 `powerMonitor` 系统空闲桥；桌面源码最后改动 09-15 19:09 < 打包 19:10/19:12，所以 0.1.13 就是当前桌面代码）。
- **顺带把"怎么判定"显示出来**（这次如果不显示，下次还得再查一遍）：`src/presenceInput.ts` 新增 `usesSystemIdle()` 与纯函数 `deskSensorLabel()`，`useOffice` 暴露 `deskSensorLabel`，`App.tsx` 底部栏在「我的工位预览：…」旁边多一行 —— 客户端显示「**离座检测：系统空闲（客户端）**」，浏览器显示「**离座检测：仅本窗口输入（浏览器）**」（鼠标悬停有解释）。用户一眼就能看出自己装的是不是带桥的客户端。
- 验证：`node --test test/*.test.mjs` **158/158**（`test/presence-input.test.mjs` 新增「底部栏要能看出谁在判定」：有 `desktopIdle` 时 `usesSystemIdle()` 为真、没有为假，两个文案、`App.tsx` 真的渲染 `office.deskSensorLabel`、`useOffice` 真的问了桥）；`tsc --noEmit` 通过；桌面 `npm test` **40/40**。
- 发布：纯前端，逐文件上传 `index.html` + `assets/index-AihhNAtS.js`。线上入口 `index-AihhNAtS.js`，JS SHA256 `be4bf700844cc60492f6715d31a6ddccb0779be3f6ab39405875dafd3c260573` 与本地逐字节一致；**未重启 `officeweb`**。
- 边界照旧：**浏览器**没有任何办法看到别的程序的输入（平台限制），只有客户端能。`Build/which-client.cjs` 可以随时对比"已安装的客户端"和"新打出来的客户端"里的 `version` 与 `system-idle` 支持。

## 2026-09-15 20:45 屏幕共享更快变清晰、不再突然变糊（前端 `index-BnYubJZw.js`）

- 报障（用户）：「视频接通后需要等待很久才变清晰，我希望快一些，另外会有突然变糊的情况也改善一下」。
- **根因（读 livekit-client 2.17.2 源码确认）**：屏幕共享默认是**三层 simulcast**（`computeVideoEncodings`：1080p 且 `screenShareSimulcastLayers` 未设时给 `[low, mid, original]`）。对端一开始只订阅到低层，等带宽估计升上去才切到高清——这就是"很久才清晰"；之后任何一次带宽抖动又会把它切回低层——这就是"突然变糊"。另外默认目标码率只有 **2.5 Mbps**（`ScreenSharePresets.h1080fps15`），而 LiveKit 用**目标的 90%** 作为 `x-google-start-bitrate`，目标小 ⇒ 起步码率低 ⇒ 前十几秒都在爬坡。
- **改法（纯网页，客户端不用重装）**：
  - `mediaRooms.ts` 的 Room 参数里设 `publishDefaults.screenShareSimulcastLayers: []` —— 空数组会让 LiveKit 走"单层"分支（`presets.length === 0` → 只发 `original`），对端**第一帧就是全清晰那一层**，也不再存在"被切回低层"；
  - `screenShareEncoding: { maxBitrate: 5_000_000, maxFramerate: 15 }`（原来 2.5 Mbps）—— 起步码率跟着变成 4.5 Mbps；
  - 采集时设 `contentHint = 'text'`（`screenSwitch.ts` 的 `captureSelectedScreen()`；会议那条给 `createScreenTracks({ contentHint: 'text' })`）—— 同样码率下文字更清楚；
  - 清晰度的兜底不变：LiveKit 对屏幕轨默认 `degradationPreference: 'maintain-resolution'`（2.17.2 的 `getDefaultDegradationPreference`），带宽不够时**掉帧、不掉清晰度**；
  - `media.ts` 的私聊采集改为复用 `captureSelectedScreen()`，两条路径不会再各自漂移（顺手把 `media.ts` 从 499 行降到 496 行）。
- 取舍（要跟用户说清）：弱网对端现在会**卡顿**而不是自动变糊（单层没法再降级）；将来若发现有人网络太差，可以加回一层低清（`screenShareSimulcastLayers: [ScreenSharePresets.h720fps5]`）。
- 验证：`node --test test/*.test.mjs` **175/175**（新增 `screen-quality` 4 项：单层、≥4 Mbps、`contentHint='text'`、两条采集路径一致；`meeting-screen-switch` 的期望参数同步更新）、`tsc --noEmit` 通过。
- 发布：前端 `index.html` + `assets/index-BnYubJZw.js`（CSS 未变），纯前端**未重启 officeweb**；线上 JS 与本地逐字节一致，线上包里能查到 `maxBitrate:5e6`、`screenShareSimulcastLayers`、`contentHint`；`Build/live-boot-check.cjs` 打开正式站无页面错误。

## 2026-09-15 20:20 换屏也能换"正在共享的屏幕"：会议/视频通话里实时切过去，成员列表里右键自己也能换（前端 `index-vb-0HrVn.js`）

- 需求（用户）：「现在右键自己显示会切换屏幕，这是很不错的…在屏幕会议和视频聊天中可以切换屏分享的屏幕也是实时变化过去，除了右键屏幕，右键成员列表中的自己也可以」。
- 原来只切**低清工位预览**（右键显示器 → `MonitorContextMenu` → `office:display-select` → `office-display-changed` → `useDesktopPreview` 重抓一帧）。正在共享的高清画面绑在旧屏幕上，不会跟着走。
- **做法（纯网页，客户端不用重装）**：桌面端本来就没有自己的选屏窗口——每次 `getDisplayMedia` 都跟着"当前选中的显示器"（`permissions.cjs` 的 `setDisplayMediaRequestHandler`）。所以换屏就是**再采集一次**，然后 `LocalTrack.replaceTrack()` **原地换轨**：房间不重协商、参会者不断线、不用重新同意。新增 `src/screenSwitch.ts`（`captureSelectedScreen` / `swapScreenTrack` / `switchLiveScreen`）；`media.ts` 的 `switchScreenDisplay()` 先问会议（`meetingScreenShare.ts` 新增 `switchDisplay()`），再把自己的私聊共享换过去；`useOffice` 监听 `office-display-changed` 调它。旧采集在换轨后由我们停掉（LiveKit 只 detach 不停），换之前先清掉旧轨的 `onended`，否则会被当成"用户停止共享"。
- **成员列表入口**：`.seat-grid .seat.mine` 与访客条里自己那一行加 `onContextMenu`；菜单状态从 `OfficeScene` 提到 `App.tsx`（`screenMenu`），画面里右键显示器和列表里右键自己打开的是同一个菜单，菜单文案改成「共享与预览 · 切换屏幕」。
- **顺带按 500 行规则拆出一块**：`media.ts` 因为这次改动到 507 行，于是把工位缩略图循环拆成 `src/screenThumbnails.ts`（300px / 6 秒 / JPEG 0.55 行为不变，新增 4 项测试守着），`media.ts` 回到 499 行。提醒下一位：`media.ts` 只剩 1 行余量，再动它请先拆。
- 验证：网页 `node --test test/*.test.mjs` **171/171**（新增 `screen-switch` 5 项、`meeting-screen-switch` 5 项、`screen-thumbnails` 4 项；`annotation-cleanup.test.mjs` 的依赖白名单补了 `screenSwitch`）、`tsc --noEmit` 通过；浏览器 `test/browser/screen-menu.cjs`（真实页面 + 假桌面桥：右键别人的工位不弹、右键自己的弹出两块屏幕、选中后 `selectDisplay('22')` 被调用且广播了 `office-display-changed`）**PASS**，截图 `Build/screen-menu.png`；`desk-presence-dots.cjs` 回归 PASS。真实 Electron（`Build/screen-switch-capture-check.cjs`，用合成显示器以免抓用户桌面）：**点菜单 → await 选屏 IPC → 再 getDisplayMedia，采集请求没有被权限拦下**（合成显示器读不到画面，得到预期的 `NotReadableError`；对照组里"没有手势"那次也是 `NotReadableError`，所以这条只证明"没被拒授权"，不证明"手势一定还在"——如实记录）。
- 发布：前端 `index.html` + `assets/index-vb-0HrVn.js`（CSS 未变），纯前端**未重启 officeweb**；线上 JS 与本地逐字节一致，线上包里能查到 `replaceTrack`、`office-display-changed`、`onContextMenu`；`Build/live-boot-check.cjs` 打开正式站无页面错误。

## 2026-09-15 19:45 未接来电改为「一直显示，只能手动关」（前端 `index-BXrLyfgG.js`，CSS 无改动）

- 用户追问：「未接来电是否一直显示 只可以手动关闭」→ 在我给的选项里选了「**一直显示，只能手动关**」（原实现是 12 秒自动消失）。
- 实现：`src/CallAlerts.tsx` 删掉自动消失的 `useEffect` / `ALERT_MS` 常量，卡片只留「知道了」「再拨一次」两个出口（组件变成纯展示，44 行）；入栈逻辑搬到纯规则 `withCallAlert(list, alert)` + `MAX_CALL_ALERTS = 5`（同一通电话只留一条、最新的在最后、超过 5 张挤掉最旧的），`useOffice` 用它入栈，便于单测。
- 验证：`node --test test/*.test.mjs` **157/157**（新增「未接来电一直显示，只有『知道了』才关掉」：`CallAlerts.tsx` 源码里**不许出现 `setTimeout`/`setInterval`**、去重、上限 5、最旧的被挤掉）；浏览器 `test/browser/call-alerts.cjs` 增加一条**等 13 秒后两张卡仍在**的断言（旧实现 12 秒就消失，这条会失败）——实测仍在，截图 `Build/call-alerts.png`；`tsc --noEmit` 通过。
- 发布：纯前端，逐文件上传 `index.html` + `assets/index-BXrLyfgG.js`（CSS 无改动，仍是 `index-IILK1dyr.css`），**未重启 `officeweb`**。线上入口 `index-BXrLyfgG.js`，JS SHA256 `3ddd04f9f1aa553df94ebe242306e8eacddd383856fe9dbd5b2bc98ef93c10d9` 与本地逐字节一致；线上包内仍有「未接通，稍后重试 / 未接来电 / 再拨一次 / 知道了」。
- 边界：刷新页面后未接来电不保留（用户没选「刷新后仍在」那一项，那就得另存本机）；托盘里的 Windows 系统通知由系统管理，无法"一直显示"，能一直挂着的是程序内右下角这张卡。

## 2026-09-15 19:15 在座 / 离桌（补）：客户端改用 Windows 全局空闲时间，在别的软件里干活也算在座（前端 `index-B7SWfW_n.js`；EXE 0.1.13）

- 用户追问：「必须点击网页再网页操作才算回来座位吗 我要是不在这个软件呢 比如在别的软件 你不叫回座位吗」——上一版只看网页收到的输入，在 Word／别的程序里打字确实会被判成离桌。
- **网页层面无解**（浏览器看不到别的程序的输入），所以在客户端里补上：`desktop-bridge.cjs` 新增 `office:system-idle`（`powerMonitor.getSystemIdleTime()` + `getSystemIdleState(1)` → `active/idle/locked`），`desktop-preload.cjs` 暴露 `systemIdle()`；网页 `presenceInput.ts` 有这条能力时每 5 秒问一次（`IDLE_POLL_MS`）：**空闲秒数 < 2 分钟就算在座**（本页 DOM 输入仍给即时反应），**锁屏立刻算离桌**，轮询失败或老 EXE 自动退回纯 DOM 检测——网页与客户端可以各自发版。
- 实测（本机 Electron 44.3.0 / Windows 10 19045）：`Build/idle-times-check.cjs` → `{"seconds":0,"state":"active"}`；`Build/idle-bridge-check.cjs`（真 sandbox preload + 真 IPC，加载桌面端 preload/main 模块）→ `{"seconds":7,"state":"idle"}`、无 preload 错误。
- 测试：`OfficeDesktop` **40/40**（新增「在座 / 离桌：把 Windows 全局的空闲时间交给页面，而不是只看本窗口」）；`OfficeWeb` **155/155**（`presence-input` 新增三条：在别的软件里干活也算在座、系统空闲与锁屏判定、轮询失败退回本地判定）、`tsc --noEmit` 通过。
- 发布：前端上传 `index.html` + `assets/index-B7SWfW_n.js`（CSS 未变，仍是 `index-IILK1dyr.css`），纯前端**未重启 officeweb**；线上 JS 与本地逐字节一致且含 `systemIdle`。桌面端 **0.1.13**：免安装 `iruler-dream-0.1.13-Windows-x64.exe`（96.0 MB，SHA256 `56b0be934f947afe…`）、安装版 `iruler-dream-Setup-0.1.13-x64.exe`（96.5 MB，SHA256 `a226b35a12c0e4bf…`）；打包产物 `--office-smoke-test` → `ok=true`、`url=https://115.159.43.237/`、electron 44.3.0、sandbox/contextIsolation=true、nodeIntegration=false；打包时间之后没有更新的桌面源码。
- 待用户安装：网页部分刷新即生效；「在别的软件里干活也算在座」需要装 **0.1.13**（建议装回同一目录 `C:\Program Files\iruler dream`）。已知遗留：`test/desktop-bridge-integration.cjs` 是**过期**的（`installDesktopBridge(() => win)` 没传 `displays`，在 `office:displays` 就抛错，本次未修），新的 IPC 由 `Build/idle-bridge-check.cjs` 覆盖。

- 用户追加（19:40）：「不操作10秒就算是离座 显示离座时间就好了比如离座55秒 然后一会又离座2分钟，时间长了比如离座1小时，都是只要一个单位」→ `AWAY_AFTER_MS` 从 2 分钟改成 **10 秒**；`awayLabel` 改成**秒 → 分钟 → 小时，只有一个单位**（<60 秒「离座 55 秒」，<60 分钟「离座 2 分钟」，之后「离座 1 小时」/「1.5 小时」，≥10 小时取整）；客户端上报 `idleMs`（已经安静了多久），服务端 `idleOf()` 用它**把离座起点回拨**（夹在 0～24 小时），这样刚变红就显示真实的「离座 10 秒」而不是「1 秒」；桌面端轮询 `IDLE_POLL_MS` 5 秒 → **2 秒**（必须比 10 秒阈值密，否则红点迟到）。
- 发布（19:45）：前端 `index.html` + `assets/index-DD8lehBP.js`（CSS 未变，仍是 `index-IILK1dyr.css`），纯前端**未重启 officeweb**；线上 JS 与本地逐字节一致，线上包里能查到三段单位 `离座 ${Math.max(1,e)} 秒 … ${t} 分钟 … 小时` 与 `{atDesk,idleMs}`。测试：网页 **156/156**、`tsc --noEmit` 通过、浏览器 `desk-presence-dots.cjs` PASS（截图 `Build/desk-presence-away-label.png` 里是「离座 1 秒」）。**这一次不需要新 EXE**：阈值与单位都在网页里；但「在别的软件里干活也算在座」仍要 0.1.13。

## 2026-09-15 18:55 在座 / 离桌：键鼠活跃检测 → 名字卡片与成员列表的绿点/红点 + 离座时长（前端 `index-J_xQsCMi.js` / `index-IILK1dyr.css`，后端 `server.mjs` + `input-presence.mjs`）

- 需求（用户）：「检测鼠标的移动和键盘的输入…在座就在头顶的名字卡片上显示绿点、成员列表也显示绿点，离桌显示红点，并记录离座时间分钟为单位，触及小时就用小时…最好不更新客户端，在网页解决」。
- **纯网页实现，不用重装 EXE**：`src/presenceInput.ts` 监听 `pointermove / pointerdown / keydown / wheel / touchstart`（capture + passive），**2 分钟**（`AWAY_AFTER_MS`）毫无输入算离桌；只有状态**翻转**才发 `input-state { atDesk }`（鼠标每动一下都发消息是不可能的）。开页面默认「在座」，`connect` 时重新声明一次，掉线重连后不会被当成一直在座。
- **离座时钟在服务端**：`input-presence.mjs` 记 `awaySince`，广播时给 `atDesk` 与 `awayFor`（推送那一刻已离座多少毫秒），内部时间戳不外发；**没上报过的客户端一律算在座**（旧版 EXE、检测不到输入的浏览器不会被标红）；只在翻转时 `publish()`，重复上报不广播。
- **离座时长**（`src/awayTime.ts`）：客户端把 `awayFor` 加上 payload 到达后经过的时间（不比较双方时钟）。不足一小时显示「离座 N 分钟」，满一小时显示「离座 1.5 小时」（≥10 小时取整）。成员列表用 1 秒心跳刷新，只有真的有人离桌时才跑这个 timer。
- **显示**：头顶名字卡片（`nameTags.ts`）在药丸左侧画点（在座 `#3f9d4f` / 离桌 `#cf4a38`，名字右移让开），只在 `atDesk` 变化时重画 canvas；成员列表工位行 `.seat-state` 绿/红 + `.away-label`「离座 N 分钟」，访客条与详情卡同样显示。
- **已知边界（已跟用户说明）**：网页只能看到**发到本窗口**的输入，在别的程序里连着敲 2 分钟也会算离桌；想放宽改 `src/presenceInput.ts` 的 `AWAY_AFTER_MS` 一个常量即可。
- 测试：新增 `test/away-time.test.mjs`、`test/presence-input.test.mjs`、`test/input-presence.test.mjs`、`test/name-tag-presence.test.mjs`、`test/desk-presence.test.mjs`（真服务器 + 真 socket 端到端）；浏览器 `test/browser/desk-presence-dots.cjs`（真页面 + 真服务器：绿点 → 上报离桌 → 成员列表红点与「离座 N 分钟」+ 名字卡片红点 → 回绿），截图 `Build/desk-presence.png`、放大 `Build/desk-presence-tags.png`。`node --test test/*.test.mjs` **152/152**、`tsc --noEmit` 通过。
- 发布：前端 `index.html` + `assets/index-J_xQsCMi.js` + `assets/index-IILK1dyr.css`，后端 `server.mjs` + `input-presence.mjs`，`systemctl restart officeweb` → active；线上 JS/CSS（`2fc5234e…` / `9ce1c559…`）与本地逐字节一致，线上 JS 里能查到 `input-state`、`pointermove`，线上 CSS 里有 `.away-label`；`Build/live-boot-check.cjs` 打开正式站：登录页正常渲染、没有页面错误（只有未登录必然的一次 401）。
- 提醒下一位：`server.mjs` 现在**正好 500 行**（本次只加了 import 与 `createInputPresence` 两行）。再往里加东西之前，请先按职责拆出一块，别贴着上限堆。

## 2026-09-15 18:30 未接电话提示：右下角弹窗 + 振铃 30 秒没人接就提示（前端 `index-J_xQsCMi.js` / `index-IILK1dyr.css`，后端 `server.mjs` + `privateSessions.mjs` + `input-presence.mjs`）

- 需求（用户）：「添加一个未接电话提示，明显一点的弹窗在程序右下角以及拨打时间30秒没人接就提示未接通，稍后重试」。
- **振铃上限 30 秒**：`privateSessions.mjs` 的 `ringMs = 30000`（测试可用 `createOfficeServer({ inviteRingMs })` 注入短值），到点 `expire(invite, 'timeout')`：双方各收一条 `request-expired { id, reason }`，**发起方**另加一条 notice「未接通，稍后重试」。`reason` 现在是 `timeout | cancelled | answered`（外加 `server.mjs` 断线清理那条 `cancelled`），不再只发一个裸 id。
- **右下角弹窗**：纯规则 `src/callAlertRules.ts`（`alertForExpiry`）**只认 `timeout`**——我拨出去的 →「未接通，稍后重试」+「某某 暂时没有接听（屏幕邀请）」，别人拨给我的 →「未接来电」+「某某 拨打过语音通话／（屏幕邀请）」；自己取消、对方挂断、婉拒、已接听都**不弹**（那些本来就有 notice）。视图 `src/CallAlerts.tsx` 堆叠在 `.call-alerts`（`position:fixed; right:20px; bottom:88px; z-index:260`，窄屏自适应宽度），每张卡有「再拨一次」（直接按原 kind 重新邀请）与「知道了」，12 秒自动消失；`PrivateCallPanel` 挂它，`useOffice` 暴露 `callAlerts` / `dismissCallAlert`。
- **窗口缩在托盘里也看得到**：`src/officeNotifications.ts` 的 `request-expired` 处理改成收 `{ id, reason }`（旧的裸 id 字符串仍兼容，直接当 `cancelled`），`reason === 'timeout'` 时额外走一次桌面／系统通知（「未接电话 / 这次通话没有接通，可以再试一次」）——页面弹窗在托盘里是看不见的。
- 验证：`node --test test/*.test.mjs` **152/152**（新增 `test/call-alerts.test.mjs` 6 项：timeout 双向文案、非 timeout 不弹、旧字符串载荷、查不到邀请时安静；`test/missed-call.test.mjs` 用短 `inviteRingMs` 跑真实服务端振铃超时）；浏览器 `test/browser/call-alerts.cjs` PASS（截图 `Build/call-alerts.png`：右下角两张卡、「再拨一次 / 知道了」、重拨目标与关闭回调都对）；`tsc --noEmit` 通过。`private-calls.test.mjs` 里断言旧裸 id 的那一条已按新载荷更新。
- 发布：前端逐文件上传 `index.html` + `assets/index-J_xQsCMi.js` + `assets/index-IILK1dyr.css`；后端上传 `server.mjs`、`privateSessions.mjs`、`input-presence.mjs`，`systemctl restart officeweb` → `active`。线上入口 `index-J_xQsCMi.js`，JS SHA256 `2fc5234e28c11d1a12affecce3f7ddc5c33a4074738f253f97549c32dfc14c15`、`server.mjs` `da8fbcd16e27b27225c1530ceae666aa036ce6d695677d1a3fb3c15fe844b803`、`privateSessions.mjs` `e2f6d8ec02a80ea2f5bf49ef49eeab604675d5d730e9c0d5b3747f56b2039153`、`input-presence.mjs` `0d786f553226b2c5a4c6de86fa4ad505c6a145e51de5bcfd4e42729fd391818f`，全部与本地逐字节一致；线上 JS 里能查到「未接通，稍后重试」「未接来电」「再拨一次」。
- **这一轮踩到两个坑（都记下来）**：
  1. 把 `server.mjs` 传上去后**服务起不来**（`activating` 后崩溃重启）：它 `import "./input-presence.mjs"`，而这个并行会话新加的模块**从没上传过**，`ERR_MODULE_NOT_FOUND`。补传后立刻 `active`。教训：后端要**按 `server.mjs` 的 import 图核对远端是否齐全**，不能只传自己改过的那几个文件。
  2. 第一次 `scp index.html assets/index-*.js assets/index-*.css ubuntu@…:~/officeweb/dist/` **退出码 0，但两个 assets 根本没落地**（`ls` 时才发现），结果线上 `index.html` 指向一个不存在的 JS，`/assets/…js` 被回退成健康检查 JSON——只看 `scp` 返回码会误判成功。改为显式传到 `dist/assets/` 后正常。**上传后必须逐文件核对远端存在 + 取线上哈希比对本地。**

## 2026-09-15 15:52 修「右上角的 SVG 图标歪了」（前端 `index-CVDzAW6s.js` / `index-Dr3vcraQ.css`）

- 用户报障：「右上角的 svg 图标没有更新到线上吗 怎么还是"我"」「右上角的 svg 图标歪了」。
- 先查证"没更新到线上"这个怀疑：线上包**已经**是新的 SVG（`$M` = `circle cx=12 cy=8.4 r=3.6` + `path M5.4 20a6.6 6.6 0 0 1 13.2 0`），用 `[regex]::Matches` 全量扫线上 JS 也**没有任何**字面量「我」的图标。所以不是没更新，是它**渲染出来歪了**，看着像别的字。
- **根因**：`styles.css` 的全局 `button { padding: 10px 15px }` 同样落在 `.avatar` 上。头像圆片只有 34px，又有 `* { box-sizing: border-box }`，内容盒只剩 2px；19px 的人形图标在 grid 里被从内容盒左上角排出，实测落点 offsetLeft **16** / offsetRight **−1**、offsetTop **11** / offsetBottom **4** —— 图标整体挤到圆片右下并溢出圆边。
- **修法**：`.avatar` 规则里把内边距清零（`padding: 0`），`display: grid` / `place-items: center` 保持不动。底部栏姓名首字圆片（`.identity .avatar`）是同一个 bug，一并修好。
- **验证**：拿**线上 CSS** 加真实 rail 标记做几何探针（`Build/rail-icon-shot.cjs`，输出 `Build/rail-icon-report.json`）：修前 16 / −1 / 11 / 4，修后 **7.5 / 7.5 / 7.5 / 7.5**（(34−19)/2）。放大图 `Build/rail-icons-zoom.png`、真实比例 `Build/rail-topright.png` 人形图标居中。新增回归测试 `test/icon-centering.test.mjs`（2 项，删掉 `padding: 0;` 那行会失败，已 A/B 证伪）。`node --test test/*.test.mjs` **133/133**、`tsc --noEmit` 通过。
- 发布：前端逐文件上传 `index.html` + `assets/index-CVDzAW6s.js` + `assets/index-Dr3vcraQ.css`。线上入口已是 `index-CVDzAW6s.js`；JS SHA256 `8d810b483954321b…`、CSS SHA256 `8f6da46add8052e7…` 与本地逐字节一致，线上 CSS 里能查到 `.avatar{…place-items:center;padding:0;…}`。纯前端，**未重启 `officeweb`**。

## 2026-09-15 15:40 EXE 0.1.12（含"挂断后窗口变小"的桌面侧修复）

- 需求（用户）：「可以 打包一下吧」——把 0.1.11（今天 10:27）**之后**改动的桌面侧代码打进去。
- 内容：`fullscreen.cjs` 增加 WeakSet 守护（只有本模块真的把窗口切进过全屏，才允许退出全屏；Chromium 的 `setFullScreen(false)` 会恢复窗口旧位置/尺寸，之前对**从未进过全屏**的窗口也调用一次，于是"挂断后软件变小了"）；`main.cjs` / `tray.cjs` / `window-icon.cjs` 的托盘、图标与启动相关改动；`assets/icon.ico` + 新增 `icon-256.png`、`installerHeader.bmp`、`installerSidebar.bmp` 与 `tools/build-icons.ps1`；`autostart.cjs`（开机自启）；安装器配置（NSIS：可选目录、桌面/开始菜单快捷方式）。
- 版本：`OfficeDesktop/package.json` 0.1.11 → **0.1.12**。
- 验证：桌面 `node --test test/*.test.cjs` **39/39** 通过（比上次多 5 项：autostart、托盘图标、annotation-paint、fullscreen 等）；打包后源码中**没有比 exe 更新的文件**；用 `--office-smoke-test` 跑打包产物：`ok=true`、`url=https://115.159.43.237/`、`electron 44.3.0`、`sandbox/contextIsolation=true/nodeIntegration=false`。
- 产物（`Build/OfficeDesktopRelease/`，该目录被 `.gitignore` 忽略）：
  - 免安装 `iruler-dream-0.1.12-Windows-x64.exe`，96.0 MB，SHA256 `649fcd43792fc3ec72489ee37936f56cfee31b227d250f81f292f96d36add668`
  - 安装版 `iruler-dream-Setup-0.1.12-x64.exe`，96.5 MB，SHA256 `91d0fef8ea4f960ebaef0a18f6af22475c8049c9ebf85a2c1f09a4d61d288b51`
- 说明：网页侧无需改动（本次只打客户端）；桌面侧这些改动是并行会话写的，已随本次打包一起提交，保证"能装到的东西在 Git 里"。

## 2026-09-15 15:40 修「视野被突然裁掉一大半，刷新就好」（前端 `index-Dpusn6cO.js`）

- 用户报障：「有些时候视野会被突然裁掉一大半，然后我刷新一下就好了」。
- **根因**：`src/workstationView.ts` 的 `updateWorkstationClip()`。点工位/点成员会把相机对到那张桌子，同时开启「前景裁切」，公式是 `camera.near = depth - 1.25`（depth = 相机到 `controls.target` 的视距）。这个值**跟着视距一起长**：实测对焦后 near=1.63，滚轮缩小到 22m 时 near=**20.9**，也就是相机前 20.9m（一直到工位前 1.25m）的整个前景全部被裁掉；刷一次页面 `focusedWorkstation` 复位、near 回 0.1 才恢复。只有"先对焦工位、再缩小/拉远"才会触发，所以是"有时候"。
- **修法**：把前景裁切**加上绝对上限** `THREE.MathUtils.clamp(depth - 1.25, 0.1, 1.25)`。要裁掉的东西（相机与桌子之间那面墙/隔断）永远在相机 1m 上下，1.25m 足够；对焦时的效果与原来一致（原来在 3m 视距下就是 1.77→现在 1.25）。
- **验证**：真实浏览器 A/B（同机同账号，对焦工位后滚轮缩到 22m）——旧规则 `Build/ab-old.png` 里近处地面/木栅栏被整段裁掉，修好后 `Build/ab-new.png` 完整；新增 `test/browser/focus-clip.cjs`：缩到 65m 时 near 仍为 1.25（上限 1.3），沿"相机→工位"采样的 20 段前景**旧规则裁 20/20、现在 0/20**，切回总览 near 回到 0.1；截图 `Build/focus-clip-zoomed-out.png`，证据 `Build/focus-clip-evidence.json`。单测新增「the foreground clip stays bounded however far the camera pulls back」（`test/workstation-view.test.mjs`），网页单测 **131/131**、四个浏览器 harness 全过。
- **顺带修掉一个自己埋的雷**：名字标签是 `Sprite`，而 `Sprite.raycast` 需要 `raycaster.camera`；`sceneProbe.probeMonitor` 用的是 `new Raycaster(origin, direction)`（没有 camera），于是诊断射线一撞到名字标签就抛 `Cannot read properties of null (reading 'matrixWorld')`。现在名字标签 `sprite.raycast = () => {}`（标签是覆盖层，本来就不该被拾取），并给那支诊断射线补上 `ray.camera = camera`。
- 线上：`index-Dpusn6cO.js`（1,462,262 字节，SHA256 `8d810b483954321b8e5c9d5c77ab6ae7b57a8f91a681a46e05fcf60003b2c6a6`）与本地逐字节一致；真实浏览器打开正式站确认仍能正常启动（只有未登录的 401）。纯前端，**未重启 `officeweb`**。
- 说明：期间树上有另一位 agent 未完成的改动，构建一度因 `ScreenStage.tsx` 引用未定义的 `canAnnotate` 而失败、随后产物在页面加载时抛 `Cannot access '_e' before initialization`（整页白屏，对方已在 15:10 条目中记录并修复）。我没有改他的文件，等修好后重新构建验证再上传。

## 2026-09-15 15:10 只让桌面客户端"可被标注"；顺带修掉一个白屏（前端 `index-P7GfaOee.js`，后端 `server.mjs`）

- 需求（用户）：「能识别对方是网页登录不是客户端吗 这样就可以避免在网页登录者屏幕上绘制」→ 选定**方案 1：网页登录者分享屏幕时不提供标注入口**。
- 实现（与并行会话共同完成，本次上线）：客户端 join 时上报 `annotate: Boolean(window.officeDesktop?.annotations)`（EXE=true，浏览器=false）→ `server.mjs` 存进 person（`annotate: data?.annotate === true`）并随 `people` 广播 → 通话面板只对"正在共享屏幕的那个人 `annotate === true`"渲染标注工具（`ScreenStage` 的 `annotatable={false}` 时连「标注」按钮都没有）。已放弃"查看端叠层让网页分享也可被标注"的方向，那版本地半成品（`ink-layer` 事件、客户端笔迹板、`board`/`localInk` 属性）**已全部移除**，仓库里没有残留。
- **顺带修掉一个会白屏的 bug**：`useOffice` 里 `annotations` 的 `useMemo` 被放在了 `socket`/`media` 两个 `useRef` **之前**，工厂函数立即执行并读取它们 → 构建产物加载即 `ReferenceError: Cannot access '_e' before initialization`，整页空白（先在浏览器探针里复现，再修顺序）。若不修，这次上线就是白屏版本。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **131/131**（新增「加入时上报的能力决定别人能不能标注他的屏幕」：客户端=true、网页=false、没上报按 false，且别人也能看到该能力）；浏览器 `test/browser/screen-stage.cjs` PASS（新增 `?readonly=1` 场景：不可标注的分享者工具栏里没有「标注/撤销/清空」）、`desk-preview.cjs` PASS、`sidebar-layout.cjs` PASS。
- 发布：前端 `index.html` + `assets/index-P7GfaOee.js`，后端 `server.mjs`（**必须一起发**，否则没有任何客户端会被标记为可标注，EXE 用户也会失去标注入口），`systemctl restart officeweb` → active。线上入口 `index-P7GfaOee.js`，JS SHA256 `ab5079cee9ff3ff67902701439684ef49772186a1e459d3cd8e8b5de919efc90`、`server.mjs` SHA256 `adc79561597120da14623fcc8d0b1d7c96c30e6d66cd80a636b9cccbaaf2f092` 与本地一致；线上包里能查到 `annotate:!!(window.officeDesktop…)` 与能力门控 `(d?.annotate)===!0`。备份 `backups/annot-gate-20260915/`。

## 2026-09-15 13:00 修「无法给访客打电话」（前端 `index-CLicjdwV.js`）

- 现象（用户）：「无法给访客打电话啊 修复一下」。
- 根因：**不是服务端限制**——`privateSessions.mjs` 的 `request` 只检查双方在线、不是自己、kind 合法，跟身份无关。问题在右侧面板：详情卡原来只跟着**选中的工位**（`onlinePerson = people.find(p => p.seat === selected)`），访客没有工位，于是三个通话按钮永远是 disabled，也没有别的入口。
- 修复（`src/SidePanel.tsx`）：卡片改为跟着**被点中的人**——`focused`（`focusedPerson`）优先，其次才是该工位的人；目标是别人时三个动作都可用（请求观看对方屏幕 / 分享我的屏幕给对方 / 邀请语音）。访客还会显示「访客 · 在公共区沙发」小标，空屏区提示「点上面的按钮即可通话」。成员与工位原有行为不变（点工位会清掉人物焦点）。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **128/128**（新增「成员可以给访客打电话，访客也能反过来邀请成员」：成员邀请 → 访客收到来电 → 同意后建立 `call-` 会话，双向都通）；浏览器 `test/browser/desk-preview.cjs` PASS 并新增断言——点访客行后详情卡为「客户乙 / 访客 · 在公共区沙发 / 三个按钮全部可用」，截图 `Build/visitor-call-card.png`。`sidebar-layout.cjs` 仍 PASS。
- 发布：`index.html` + `assets/index-CLicjdwV.js`（CSS 未变，仍是 `index-BOg4IzVj.css`）；线上入口即 `index-CLicjdwV.js`，JS SHA256 `35dd683a5cdf487558a4a93eb3047789434eaadacbfebcd8ab813b0fb9e84fe4` 与本地一致，线上包里能查到「访客 · 在公共区沙发」与「点上面的按钮即可通话」。纯前端改动，未改后端、未重启服务。

## 2026-09-15 12:35 会议室墙面显示器换成团队照片（前端 `index-B-v0-LCJ.js` + 新资源 `meeting-wall-photo.jpg`）

- 需求（用户）：给了一张 AI 生成的团队合影（2732×1535，豆包 AI 生成），"把这个图片存下来放在会议室墙上的图片上"。
- 定位：模型里会议室墙上的"画"就是那块演示屏 `Meeting / display surface`（three.js 名字 `Meeting__display_surface`，材质 `Display background`，纯深色无贴图，世界坐标约 (3.8, 1.9, −8.0)）；外框是另一个节点 `Meeting / presentation display`（材质 `Warm graphite`）。休息区/老板间那些 `abstract print frame` 是烘焙好的画，不动。
- 改动：新增 `src/meetingWallPhoto.ts`（`findMeetingWallSurface` / `remapPanelUv` / `attachMeetingWallPhoto`），在 `OfficeScene` 载入办公室模型后调用；资源存 `public/assets/meeting-wall-photo.jpg`（1600×899、194 KB、质量 82）。
  - 两个坑都实测踩过并修掉：① 面板 UV 来自烘焙图集（u 仅 0.125–0.875），直接贴只显示一条窄带 → 按面板局部 x/y 重做 0..1 UV；② 直接用 three.js 默认 `flipY` 会让照片上下颠倒 → `texture.flipY = false`。材质 `MeshStandardMaterial`（map + emissiveMap，emissiveIntensity 0.3）让它在偏暗的房间里像亮着的画面。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` 127/127；新增 `test/browser/meeting-wall-photo.cjs` PASS（面板存在、贴上照片且解码出 1600×899、材质名正确、外框材质未被换掉），并输出人眼可核对的两张截图 `Build/meeting-wall-photo.png`（整间会议室，画面正立在墙上）与 `Build/meeting-wall-panel.png`（面板特写，照片完整、朝向正确）。`sidebar-layout.cjs` 仍 PASS。
- 发布：`index.html` + `assets/index-B-v0-LCJ.js` + 新资源 `assets/meeting-wall-photo.jpg`（CSS 未变，仍是 `index-BOg4IzVj.css`）。线上入口即 `index-B-v0-LCJ.js`，JS SHA256 `d8cd9c28a32e8fba811bc54d2287ad79d6d9e6f01a18f2da204a3ea3f3725c0d`、照片 SHA256 `26df107b54ea6b7bf89a8f1e3f8a0b57e29ea5c994a601268d6bcde2d9a6ea92`（HTTP 200、198983 字节）与本地一致。纯前端改动，未改后端、未重启服务。构建输出到 `Build/OfficeWebWallPhoto`（避免与并行会话的 `Build/OfficeWeb` 冲突）。

## 2026-09-15 12:00 右上角头像「我」改成 SVG 人物图标（前端 `index-C3m3vD5v.js`）

- 需求（用户）：「右上角头像 我 那里改一个svg吧」。
- 改动：`src/icons.tsx` 新增 `PersonIcon`（与其它图标同一套 `stroke=currentColor` 风格：头 + 肩），`App.tsx` 顶栏的 `.avatar` 按钮由文字「我」改为 `<PersonIcon width={19} height={19} />`；`title`/`aria-label`（退出登录）不变，颜色自动跟随 `.avatar` 的 `color`。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` 127/127；用真实构建产物在 1366×768 截图核对右上角（`Build/avatar-corner.png`，人物图标正常、无文字）；`test/browser/sidebar-layout.cjs` 仍 PASS。
- 发布：`index.html` + `assets/index-C3m3vD5v.js`（CSS 未变，仍是 `index-BOg4IzVj.css`）；线上入口即 `index-C3m3vD5v.js`，JS SHA256 `79f7f9c20a556591a70e105b9ce1235e2f56d14ff42719124f95bd1abaf48aa9` 与本地一致；线上包里能查到人物图标路径、且头像按钮里不再有「我」字。纯前端改动，未改后端、未重启服务。构建输出到 `Build/OfficeWebAvatar`（避免与并行会话的 `Build/OfficeWeb` 冲突）。

## 2026-09-15 11:38 名字改为屏幕固定大小；首次载入慢的实测与修复（前端 `index-C3HxeGVb.js` + `index-BOg4IzVj.css`）

- 需求（用户）：① 头顶名字要「针对显示器显示固定大小」；② 刷新后模型有时加载很慢，找出阻碍并解决。
- **① 名字改成屏幕空间固定尺寸**：`SpriteMaterial.sizeAttenuation = false`——three 会把 scale 乘上视距，正好抵消透视；`NameTags.render(camera, 画布高度)` 每帧按 `TAG_PIXELS = 24` CSS 像素反算 `scale = px · 2tan(fov/2) / 高度`。因此远近一样大，换窗口尺寸或 fov 也不变（此前是世界尺寸 0.22m：近景偏大、远景偏小）。测试断言：`screenSpace = true`、远景与近景两次 `pixels ≈ 24`、两次 `scaleY` 完全相同。
- **② 加载慢的实测阻碍**（本机隔离服务器，网络≈0，单独看 CPU/解码）：
  - 网络面：默认加载 `office-balanced-gpu.glb` = **14.89MB**（GPU 压缩版；它是为把解码图像内存从 ~464MB 压到 ~5MB 才成为默认的）+ 人物 1.67MB + JS 包 1.46MB。
  - CPU 面（同一份代码对照，**转码器齐备的干净构建**、本机、各跑 3 次）：KTX2/draco worker 上限 2（旧值）→ 办公室就绪（monitors 可探测）**3270 / 3437 / 3500ms**；改成按机器核心数（`min(8, max(2, cores-1))`，draco 与 KTX2 都改）→ **2286 / 2304 / 2143ms**（另两次 2245 / 1988），**少约 1.1–1.3 秒（≈35%）**。130+ 张贴图原本一次只转两张，多核闲置。
  - **过程中的一个大坑（已加防护）**：中途测到过 3317→2012ms 的一组数据，后来发现那次的本地产物是**残缺的**——`Build/OfficeWeb/assets/basis/` 两个转码器缺失（0 字节）。原因是两个 agent 同时 `vite build` 到同一个 `outDir`，`emptyOutDir` 把对方刚拷进去的文件删了。缺失是**静默**的：浏览器里 KTX2 转码失败，代码回退去下备用模型，看起来只是"慢"，而线上 `dist` 因为 scp 不删文件反而是好的——**本地测的和线上跑的不是同一套资源**。现在 `npm run build` 之后自动跑 `test/public-parity.mjs`（package.json 的 `postbuild`）核对 `public/` 与产物逐文件大小，不一致就让构建失败。
  - 试过并**放弃**：在文档里预取 draco/basis 解码器。加载器是在 worker 里取这些文件的，不会复用文档级预取——实测被下载两次，办公室反而晚 ~250ms 完成；原因已写在 `officeAsset.ts` 注释里，防止以后又"顺手优化"回去。
  - **重要纠正**：`Ctrl+F5` 硬刷新会绕过缓存重新下这 15MB。而 `index.html` 是 no-cache、bundle 名带内容哈希、模型带 `?v=`，**普通刷新（F5）就一定能拿到新版本**。此前文档让人「硬刷新确认」，等于每次都强制重下整个模型，已把 `OfficeWeb/AGENTS.md` 与本文「重新部署」改为普通刷新。
- 验证：网页单测 **127/127**、`tsc --noEmit`、`vite build` 通过；三个真实浏览器 harness（`default-view`、`character-setting`、`visitor-labels`）全过。`visitor-labels.cjs` 另修一处测试自身问题：后台窗口的定时器会被节流，访客走到沙发的模拟因此慢十倍，改为先让访客页在前台走完再切换（见 `Design/TODO.md`）。
- 线上：`index-C3HxeGVb.js`（1,460,686 字节，SHA256 `931382f6352ec4898fa07129b64702a10a873f25532855e13523c0a8cd692ece`）+ `index-BOg4IzVj.css`（55,661 字节，SHA256 `df76d90efd20b0996969d9b67524cce62c2714515cd5b9f17d5453b5d15d025c`），与本地 `Build/OfficeWeb` 逐字节一致；线上包含 `sizeAttenuation` 与 `hardwareConcurrency` 两处新逻辑。纯前端，**未重启 `officeweb`**。
- **未做（要更快就得动资产，需你确认）**：① 预转码成 GPU 就绪格式（BC7 等）→ 加载时零转码；② 降低纹理分辨率 → 转码量按像素数下降。两者都会牺牲当前 GPU 压缩版换来的显存/画质收益。

## 2026-09-15 11:40 修「客户端老是记不住账号和密码」（前端 `index-C3HxeGVb.js` + `index-BOg4IzVj.css`）

- 用户报障：「严重的问题 客户端老是记不住用户账号和密码」。
- 根因：桌面端保存的登录信息（`%APPDATA%\office-world-desktop\login.enc`，本机实测存在且当天 10:04 刚写过）**只要会话结束就被删掉**——`AccountGate` 的 `office-session-ended` 处理里无条件 `clearLogin()`。而"会话结束"包括最常见的两种情况：同一账号在**浏览器**登录（服务端按既定规则撤销旧会话，`session-replaced`）和 Cookie 会话失效（`connect_error: 请先登录`）。于是每次在网页上登一次同一个账号，EXE 就把密码忘掉、下次启动要重新输入；EXE 启动再自动登录又把浏览器顶下线，两边互相顶号，感受就是"老是记不住"。
- 修复：
  - `useOffice`：`office-session-ended` 的 detail 改为 `{ message, forget }`；**被顶下线、会话失效、被管理员请出都是 `forget:false`**。
  - `AccountGate`：只有 `forget === true`（主动退出登录）才 `clearLogin()`；否则保留保存的账号并**从 `readLogin()` 把姓名和密码填回表单**，回来只要点一下「进入办公室」。`submit()` 里本机加密不可用（`saveLogin` 返回 false）不再抛错阻断登录，只是这次记不住。
  - `App` 设置里新增一行「登录记忆：已保存／未保存」，可在应用内直接确认。
- 验证：新增 `test/browser/login-memory.cjs` + `test/login-memory-harness.html`（只挂 `AccountGate`、桩掉桌面桥）：表单带出保存的姓名与密码、`forget:false` 时 **0 次 clearLogin** 且账号仍在、`forget:true` 时恰好 1 次且密码被清空；`tsc --noEmit` 通过；`node --test test/*.test.mjs` 127/127。
- 发布：`index.html` + `assets/index-C3HxeGVb.js` + `assets/index-BOg4IzVj.css`（并发会话正在占用 `Build/OfficeWeb`，本次构建输出到 `Build/OfficeWebLoginFix`）；线上入口即这两个文件，JS SHA256 `931382f6352ec4898fa07129b64702a10a873f25532855e13523c0a8cd692ece`、CSS `df76d90efd20b0996969d9b67524cce62c2714515cd5b9f17d5453b5d15d025c` 与本地一致。纯前端改动，未改后端、未重启服务；**EXE 无需重新构建**。
- 遗留（已告知用户，待其决定）：同一账号在 EXE 与浏览器同时登录仍会互相顶号（这是之前明确要求的单会话规则）；若要两边并存，需要放开"新登录撤销旧会话"。

## 2026-09-15 11:07 访客进右侧列表（异色 + 点击对焦人物）与全角色头顶名字（前端 `index-BzFXjOZU.js` + `index-CCVeF8Qd.css`）

- 需求（用户）：访客进来之后也要在右侧工位列表那边显示、用不同颜色；点一下能聚焦到人物；并且给所有角色头顶写上自己的名字，UI 要合理。
- **访客行**：`SidePanel` 在工位网格之后新增「访客」区（`.visitor-strip`，琥珀底 `#332c1e` + 字 `#f2dda9` + 琥珀圆点），与绿色工位行（`#405a40`）明确区分；每行显示姓名与「访客 · 在公共区沙发」/「我 · 在公共区沙发」，点一下触发新的 `onFocusPerson`。访客没有工位，所以列表里不能只提供「聚焦工位」这一种动作。
- **点击聚焦到人**：`App.tsx` 新增 `focusPerson` 状态（与 `focusSeat` 互斥，切视角/点工位都会清掉），`OfficeScene` 新增 `api.person(id)`——把镜头瞄到该角色胸口高度，并在**当前相机那一侧**退开 3.4m，避免镜头绕场景或穿墙；远端角色位置由新增的 `RemoteAvatars.objectOf(id)` 提供。
- **头顶名字**：新增 `src/nameTags.ts`。canvas 画药丸 → `CanvasTexture` → 挂在角色 root 上的 `Sprite`，随模型走、零逐帧开销；三名一套配色与右侧列表一致（自己=青柠底深字、成员=象牙底深字、访客=琥珀底深棕字），`depthTest:false` 保证被桌面/显示器/植物挡住也读得到，带投影阴影以免象牙色贴在浅色墙上消失；7→34m 由不透明淡到 0.38；挂点按姿态变（站立 2.02m、坐下 1.52m）；标签世界高度 0.22m（先做 0.27m，近景过大，已收小）。
- 验证：网页单测 **127/127**、`tsc --noEmit`、`vite build` 通过。新增 `test/browser/visitor-labels.cjs`（隔离服务器 + 两个真实浏览器上下文）：员工端 `.visitor-strip` 恰好一行、背景与文字色都与工位行不同（实测 `rgb(51,44,30)` vs `rgb(64,90,64)`）；点击该行后镜头落到距本人 **4.0–4.1m**（点击前 >6m）；`__officeDebug.nameTags` 两名角色各一条，自己 `kind=me`、访客 `kind=visitor`，挂点 `y≥1.4`；访客自己那屏该行带 `mine` 且显示「我 ·」，自己 `kind=me`、成员 `kind=employee`。截图 `Build/name-tags-desks.png`（默认开放工位视角下两条名字）、`Build/visitor-sidebar.png`（右侧访客行）、`Build/visitor-focus.png`（点访客后的近景），证据 `Build/visitor-labels-evidence.json`。
- **顺带修好**：新加的身份选择页（`AccountGate` 的 `RoleChoice`：账号 `role` 为空时拦在场景之前）让 `test/browser/default-view.cjs` 与 `character-setting.cjs` 卡在等场景上；两个用例补上 `/api/auth/role` 选择身份后恢复通过。这不是本次改动引入的，是它们没跟上身份流程。
- 线上：`index-BzFXjOZU.js`（1,459,591 字节，SHA256 `12e69d7bf06df522bc125230cdc171d9722ad5d98a3b9ac28f9b46452a258746`）+ `index-CCVeF8Qd.css`（55,557 字节，SHA256 `ef261f82cb615f906910e1a254e3361d2638eda0c483f67340d420b1e4b0452c`），与本地 `Build/OfficeWeb` 逐字节一致；线上 JS 含名字标签字体串（`600 42px`）、线上 CSS 含 `.visitor-strip` 与琥珀底色。纯前端，**未重启 `officeweb`**。
- 拆文件（用户 500 行硬上限）：本批改动后 `src/OfficeScene.tsx` 达到 **546 行**，已把视角预设 `VIEWS`、`remoteStates`、`nameTagItems` 抽到新的 `src/sceneViews.ts`，并在 `OfficeScene` 原地 `export type { View }` 保持既有导入不变；现为 **492 行**。`src/nameTags.ts` 181 行、`SidePanel.tsx` 226 行。

## 2026-09-15 11:10 全屏只放大了窗口、视频没放大（前端 `index-ClFhEJ4r.js` + `index-C9mQAzGE.css`）

- 用户报障：「怎么窗口全屏了 但是视频没有」——客户端点「全屏」后**窗口**进了全屏，共享画面仍留在内联的小框（`max-height: 62vh`）里。
- 根因：`ScreenStage` 的 className 只拼了 `maximized` / `annotating`，**从来没有 `fullscreen`**；而 CSS 里给全屏用的只有 `:fullscreen` 伪类。桌面端的整屏是**原生窗口模式**（DOM Fullscreen API 在那种无边框透明窗口里是空操作），伪类永远不匹配 → 于是只有窗口变了。浏览器端走的是 DOM 全屏，所以一直看不出这个问题。
- 改法：`ScreenStage.tsx` 补上 `fullscreen` 类；`screen-stage.css` 新增 `.screen-stage.fullscreen`（`fixed; inset:0; display:flex` 居中）与 `.fullscreen video { width/height:100% }`，底部药丸按钮条的居中规则也一并挂到 `.fullscreen`。规则声明在 `.maximized` 之后，两个类同时存在时整屏优先。
- 验证：扩展现有浏览器测试 `test/browser/screen-stage.cjs` 的桌面路径——点全屏后必须 `classList.contains("fullscreen")`、舞台矩形等于视口矩形、**视频高度 > 90% 视口高度**。实测 `{"hasClass":true,"viewport":{"width":420,"height":700},"stage":{"left":0,"top":0,"width":420,"height":700},"videoHeight":700}`（修前是 62vh≈434）。该脚本 PASS、`tsc --noEmit` 通过、`node --test test/*.test.mjs` 127/127。
- 发布：`index.html` + `assets/index-ClFhEJ4r.js` + `assets/index-C9mQAzGE.css`，JS/CSS SHA256 与本地一致；线上实测含 `.screen-stage.fullscreen{`，并且**同时包含并行会话的右侧面板收紧改动**（线上 JS 已无 `DESK `、CSS 已含 `11px 20px 8px`），没有覆盖对方的工作。纯前端，未改后端、未重启服务。备份 `backups/stage-fullscreen-20260915/`。
- 边界：本次动到 `ScreenStage.tsx` 与 `screen-stage.css`（另一个对话的活跃文件），只加了全屏类与对应 CSS，未触碰其本机回显 / 坐标映射逻辑。

## 2026-09-15 11:05 右侧面板收紧 + 去掉「DESK A-1」字样（前端 `index-CJLUOYc0.js` + `index-BcoqqEm8.css`）

- 需求（用户）：「网页上把DESK A-1这个字眼去掉，还是要收紧一下右侧 不然看不见下面 还得要滚轮，in good company 这里也收紧空间」。
- 改动：
  - `SidePanel.tsx`：工位详情卡里的 `DESK A-1` eyebrow 整块删除（座位号在左侧工位卡片和底部状态栏里本来就有）。
  - `directory-ui.css`：`IN GOOD COMPANY / 人与空间` 头部 padding 24/24/19 → **11/20/8**、标题 23px → 19px、在线数字 42px → 30px；标签 9px → 7px、工位标题 21/22/11 → **11/20/5**、工位卡 min-height 48 → **40px**、间距 5/8 → 3/6、详情卡 margin/padding 18/20/16 → **10/16/12**、空屏 64 → 48px、底栏 18/22 → **9/20**。**座位列表成为面板内唯一可滚动区域**（`flex:1; min-height:96px; overflow-y:auto`），工位详情与底栏固定可见。
  - `chat-inbox.css`：会话列表/搜索/行距同步收紧（标题 17→15px、行 padding 13→9px、头像 40→34px、列表改为 `flex:1`）。
- 验证：新增浏览器布局检查 `test/browser/sidebar-layout.cjs`，在 **1366×768** 下断言：9 个工位都在、`.detail .eyebrow` 为 null（DESK 字样已去掉）、面板 `scrollHeight-clientHeight = 0`（不需要滚轮）、工位详情与底部状态栏都在面板高度内可见；截图 `Build/sidebar-1366x768.png`。`tsc --noEmit` 通过、`node --test test/*.test.mjs` 127/127。
- 发布：`index.html` + `assets/index-CJLUOYc0.js` + `assets/index-BcoqqEm8.css`；线上入口即这两个文件，JS SHA256 `e54029487d356a432869be0216fa492f87e33e8a0f71b46c117d000c65063d80`、CSS `e7c1567cbf119919e252d7633e0a0e45daa135a4b7f8ab447a1509d14d7aa207` 与本地一致。纯前端改动，未改后端、未重启服务。

## 2026-09-15 10:40 修两个报障：视频全屏卡住软件 + 标注映射/断线/延迟（前端 `index-BDgLeBTq.js`，后端 `collab-annotations.mjs`，EXE 0.1.11）

- 用户报障：「1. 屏幕全屏时挂断软件也全屏了无法退出全屏，视频全屏不要影响软件，且软件的最大化按钮怎么能没了呢。2. 标注的屏幕映射不对，要针对各种分辨率去适配，以及画笔断开和延迟严重的问题」。
- **全屏**：整屏模式由 `ScreenStage` 请求，却没人负责结束——挂断只是把组件卸载掉，窗口留在全屏，而 `html.iruler-fullscreen` 会把标题栏（含最大化按钮）隐藏，于是"退不出去 + 没有最大化按钮"是同一个根因。现在：组件卸载（挂断/对方停止共享/退出会议/关闭放大视图）时若整屏是本组件请求的就 `setFullscreen(false)`；Esc 退出；桌面端页面导航（重载）时也退出全屏；`applyFullscreenState` 退出时按窗口真实最大化状态决定圆角类。
- **标注映射**：坐标测量基准从"绘制层矩形"改为 **`<video>` 元素自身矩形**，并按 letterbox 内的画面框归一化；`videoWidth=0`（首帧未到）时退回元素框，避免第一笔被丢。桌面浮层由主进程保证内容区恰好等于被共享显示器：`place()` 先比较再 `setBounds`、页面加载完成后与 `display-metrics-changed` 时重新贴合。
- **画笔断开**：中继的 40ms 限速原来是直接 `return` 丢包（快速拖动时留下缺口）。改为**排队补发**：`queued` + `setTimeout` 按窗口发送，`done` 只在最后一批点后发出，队列上限 512 点，`clear`/`undo`/断线清空队列。
- **延迟**：笔迹要走 指针→socket→分享者桌面浮层→采集→视频 才回来（几百毫秒）。`ScreenStage` 新增本机即时回显层 `.screen-stage-ink`：落笔立刻用自己的颜色画出来，1.4 秒后交还给画面里的真迹，避免双份墨迹。
- 验证：网页 `tsc --noEmit` 通过、`node --test test/*.test.mjs` **127/127**（新增"超频排队补发而不是丢弃"：同窗口两批点全部到达、十批 20 点全到、`done` 必须最后到达）；浏览器 `test/browser/screen-stage.cjs` PASS（420×700 与 1280×720 两种比例落点都命中 0.25/0.75、本机回显立刻可见且 1.8 秒后交还、桌面端卸载时 `setFullscreen(false)`）；桌面端 `node --test test/*.test.cjs` **34/34**。
- 发布：前端 `index.html` + `assets/index-BDgLeBTq.js` + `assets/index-BcuF-NcO.css`，后端 `collab-annotations.mjs` 上传并重启（active），线上哈希与本地一致（JS `4ba08972b30ffc5b662beeb33f2ce02736413e3b8801e766a642655a4d2d563c`、`collab-annotations.mjs` `13ca16fee9bd8a26f2df3c3c77f7e9e7295bbc98af57b0e1b5182358c37a8b57`）。备份 `backups/annotation-fullscreen-20260915/`。
- **EXE 需要更新**：标注浮层贴合与桌面端全屏安全网在桌面侧，已构建 `Build/OfficeDesktopRelease/iruler-dream-0.1.11-Windows-x64.exe`（OfficeDesktop 版本 0.1.10 → 0.1.11）。网页侧改动刷新即生效，但浮层/标题栏相关要装新版客户端。

## 2026-09-15 04:30 会话列表补回"工位主人（离线也要在）"（前端 `index-BznCqOD4.js`）

- 需求（用户）：「怎么没有提的也没了？工位上的人 离线也要在列表中啊」——上一轮把列表收得过窄，离线但持有工位的同事不该消失。
- 改动（`src/ChatInbox.tsx` + `SidePanel.tsx` 透传 `seats`）：会话目录改为三端构成——`people`（当前在空间）+ **`seats` 里的永久工位主人（含离线）** + 本机有往来记录的人；名册仍只用于查名字。被请出/隐藏账号照旧排除。因此：有工位的同事哪怕离线也在列表里，没工位、没聊过、也不在空间的旧账号不再出现。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **127/127**；浏览器端到端 `test/browser/desk-preview.cjs` PASS——新增场景：一个认领了工位后离线的同事**必须**在会话列表里（`离线同事` 出现），而只注册过、没工位也没聊过的 `老同事` 不出现。
- 发布：上传 `index.html` + `assets/index-BznCqOD4.js`；线上入口即 `index-BznCqOD4.js`，JS SHA256 `77e3f91e7c805a4bd1fdb188247f95076901009bebc638767e64942a663fb19d` 与本地一致。纯前端改动，未改后端、未重启服务。

## 2026-09-15 04:10 聊天列表不再有"曾经的人"（前端 `index-_bU9fZb3.js`，后端 `membership.mjs` 落盘）

- 现象（用户）：「聊天里面的列表还是有曾经的人啊 没有清啦」。
- 原因：会话列表原来按**账号名册全量**铺开（`contacts` = 所有注册过的账号），所以很久不上线、甚至从没聊过的旧账号也各占一行；另外被请出名单只存在内存里，服务重启（每次部署都重启）就全被赦免。
- 改动：
  - `ChatInbox` 的目录只由两端构成——**当前在空间的人**（`people`）+ **本机有实际往来的会话**（名字优先取名册里的最新名字），被隐藏/请出的一律排除。名册只用于查名字，不再自动占一行。
  - `membership.mjs` 的请出名单**落盘 `ejected.json`**（与 `state.json` 同目录）：重启不再自动赦免；`eject` 幂等；重新登录清除标记也落盘。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **127/127**（新增 `test/membership.test.mjs` 两项：跨重启仍隐藏、重新登录恢复；幂等与 `chat-directory` 广播）；浏览器端到端 `test/browser/desk-preview.cjs` PASS——访客会话列表里**没有**"从没聊过、也不在空间"的旧账号（老同事），有在线同事时出现，被请出后消失。
- 线上现状（只读核对，未改动业务数据）：消息共 4 条（公共 3、私聊 1：发发 ↔ 小桃1）；账号 小文杰/客户/小桃/发发/小桃1，工位只剩 seat 0（小桃1）与 seat 3（发发）——说明老板工位此前已被请出过一次（那次是旧逻辑，所以人还留在聊天里）。
- 发布：后端上传 `server.mjs` + `membership.mjs` 并重启（active）；前端上传 `index.html` + `assets/index-_bU9fZb3.js`。线上 `server.mjs` SHA256 `5ab0bcfd21af12d7ff108ae2b3cc3ebc12acb85a582ccde5ed192628445f14d7`、`membership.mjs` `2758eb5741519f25c5f62bde0b0b6e70d498c765410292812689f55349a6a479`、JS `33b8a6a4e9abb4984c266fcf73578af8a804f0ab4ebc1ad51b85030dce0ea729`，与本地一致。备份 `backups/chat-list-20260915/`。

## 2026-09-15 03:40 「请出」＝离开空间：聊天里不再有他（前端 `index-NYCwsRDX.js`，后端 `membership.mjs` 等）

- 现象（用户）：「已经踢了的人怎么还会在聊天里面」。确认后用户选定的行为：**被请出的人直接从空间移除**（他当时仍在线），其他人的聊天行为不变。
- 原因：管理员「请出工位」只收回工位，socket 与 Cookie 会话都还在，所以他还在成员列表和聊天会话列表里。
- 改动：
  - 新模块 `membership.mjs`：`eject(accountId)` 把账号加入 `ejected`、`accounts.revokeSessions` 撤销其会话、断开他所有 socket，并用 `io.emit("chat-directory", { hidden })` 推送给所有人；`login(accountId)` 在他重新登录时清除标记；`contacts()`/`hidden()` 供 `chat-contacts` 使用。`server.mjs` 只多 3 行（已到 493/500，因此单独成模块）。
  - `accounts.mjs` 新增 `revokeSessions(userId)`（持久化失败回滚）；`admin.mjs` 在释放工位与 `publish()` 之后发 `kicked`（文案改为「你被管理员请出了空间，请重新登录」）并调用 `eject`；`chat-server.mjs` 的 `chat-contacts` 回包增加 `hidden`。
  - 客户端：`useOffice` 收到 `kicked` 走 `sessionEnded`（回到登录页 + 清掉 EXE 保存的登录信息，避免自动登回）；`chatClient` 缓存目录并处理 `chat-directory` 推送；`ChatInbox` 新增 `hidden` 属性，被隐藏账号的会话（含本地存档里的旧消息）不再出现；`AdminDialog` 按钮/文案改为「请出」。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **125/125**，新增「管理员请出＝离开空间：断开连接并撤销会话」——`kicked` 通知、socket 断开、`/api/auth/me` 401、工位可被他人认领、成员列表与 `chat-contacts` 都不再有他、`hidden` 名单含他、**重新登录后恢复**；浏览器端到端 `test/browser/desk-preview.cjs` 新增第 4 幕 PASS——被请出前访客会话列表里有「李文杰测试」，请出 1.2 秒后该会话消失，且被请出的那个客户端回到登录页。
- 发布：后端上传 `server.mjs` / `membership.mjs` / `admin.mjs` / `accounts.mjs` / `chat-server.mjs` 并重启（active）；前端上传 `index.html` + `assets/index-CfRI5GXj.js`（最终构建）。线上 `server.mjs` SHA256 `eaf9f330922c166467043a9bf760ca419c0a557652a70d9f4a6c528ab58e51a6`、`membership.mjs` `38117be0d888dcba48976a85e482c2d48d48954dfc559d7c6791e30fd66291dd`、JS `c1d358dde642790518f4330402d9783c1740e546920cfb1a92c33fa9a11fcee1`，与本地一致。备份 `backups/eject-20260915/`。
  - 顺带拆分：`useOffice.ts` 到 500 行上限，把 `sameCallStates` 移到 `src/presenceResources.ts`（纯函数、无行为变化），`useOffice.ts` 回落到 486 行。

## 2026-09-15 03:00 访客不接收公共聊天，私聊照常（前端 `index-CE4Bcpwz.js`，后端 4 个 chat 模块）

- 需求（用户）：「访客不可以收到公共聊天频道 私聊可以」。
- 服务端规则（公共频道 = 无 `recipientId` 的消息）：`chat-access.mjs` 的 `canReadChat(row, accountId, visitor)` 公开行对访客不可读、`publishChat` 的公共分支只发给成员；`chat-store.mjs` 的 `page(after, accountId, visitor)` 透传；`chat-server.mjs` 的 `chat-history` 按身份过滤、`chat` 拒绝访客发公共消息（"访客不能发公共聊天，请私聊同事"）；`chat-files.mjs` 同规则拒绝访客的公共文件并在附件下载时对公共文件返回 403。**私聊路径完全没有改动**（实时、历史、文件、未读）。
- 客户端：`ChatInbox` 新增 `visitor` 属性——访客的会话列表不渲染「公共聊天」那一行，列表副标题改为「和同事单独聊聊」；`SidePanel` 透传，`App.tsx` 传 `isVisitor`。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **124/124**（新增「访客不参与公共聊天，私聊照常可用」：成员自己的公共消息照旧可见、访客收不到公共消息、访客能收到私聊、访客发公共被拒、访客历史里没有公共消息）；浏览器端到端 `test/browser/desk-preview.cjs` PASS，并确认访客的会话列表里没有「公共聊天」。
- 发布：后端上传 `chat-access.mjs` / `chat-store.mjs` / `chat-server.mjs` / `chat-files.mjs` 并 `systemctl restart officeweb` → active；前端上传 `index.html` + `assets/index-CE4Bcpwz.js`。线上入口 `index-CE4Bcpwz.js`（JS SHA256 `1de66756d4b1d9a04e8d16f342785dfc4e4dd1a0eee19fb3f29fb614680d1970`）、`chat-access.mjs`（`7d96ffaf712f6d6820b60d78cffa906cf55f84796e6d3397f4b468403feb028c`）、`chat-store.mjs`（`60db4029…`）、`chat-server.mjs`（`552916e7…`）、`chat-files.mjs`（`1a3ce14d…`）全部与本地一致。备份 `backups/visitor-chat-20260915/`。

## 2026-09-15 02:30 访客不再出现选座提示（前端 `index-DptbtmyV.js`）

- 需求（用户）：「客户的话就不需要再出现"点击场景里你想坐的椅子"了……只需要去掉这个选择」——访客已由服务端安排在公共区沙发，不该再被要求点椅子。
- 改动（`src/App.tsx`）：`showPicker` 增加 `!isVisitor`（`me?.role === 'visitor'`），访客完全不显示 `SeatPicker`（含「点击场景里你想坐的椅子」）；底部身份栏由「还没选工位」改为「公共区沙发」；设置面板里访客显示「我的座位：公共区沙发」并隐藏「去选工位 / 重新选座」按钮，说明文字改为访客版本。成员的行为不变（没工位时仍然是先选角色、再点椅子）。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **123/123**；浏览器端到端 `test/browser/desk-preview.cjs` 扩充为三场景并 PASS——访客 `.seat-picker-hint` 计数 **0**、身份栏为「公共区沙发」；无工位的成员计数 **1**（提示仍在）；老板工位的低清预览照常。
- 发布：上传 `index.html` + `assets/index-DptbtmyV.js`（CSS 未变，仍是 `index-BVSyMKpz.css`）；线上入口即 `index-DptbtmyV.js`，JS SHA256 `06c7d4c76183fd42524b4b072373323c396fa0b3bb9a6b0862b4c49dba4ea36d` 与本地一致。纯前端改动，未改后端、未重启服务。

## 2026-09-15 02:00 去掉老板例外；预览间隔改为焦点内 6 秒 / 焦点外 12 秒（前端 `index-CJYubbjI.js`，后端 `server.mjs`）

- 需求（用户）：「别什么都老板例外搞得太复杂，即便是没有人也可以看到自己的屏幕低分辨率就好了 只是此时更新时间换成焦点内6秒 焦点外12秒」。
- 改动：
  - **删除老板例外**：删除 `preview-policy.mjs`，`server.mjs` 恢复为 `p.previewSharing = value === true && p.seat != null && p.role !== "visitor"` 与 `preview` 事件里 `if (p?.role === "visitor") return;` 两处兜底（线上 `server.mjs` SHA256 `72fb9d75d890174c482941c2eb31d021c8a512a4ea7190ae60a69de59e38c261`，与本地一致；远端已删除 `preview-policy.mjs`）。客户端删掉 `mayBroadcastPreview`/`BOSS_SEAT` 引用，改为 `person?.role !== 'visitor'`；`src/seats.ts` 不再导出 `BOSS_SEAT`。「文杰 → 老板工位」仍是**座位规则**，与预览无关。
  - **刷新间隔**：新增 `previewIntervalMs(focused, visible)` = 焦点内（且窗口可见）**6000ms**，焦点外或隐藏 **12000ms**；回到焦点立刻补一帧（`window.addEventListener('focus', frame)`）。300px / JPEG 55 不变。
  - **顺带修正**：`office.sharing` 不再等于 `desktopPreview.active`——只有真正的高清共享才让三维场景持续出帧，工位低清预览不再把"焦点外不刷新三维场景"这条规则冲掉。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **123/123**（含"刷新间隔：焦点内 6 秒，焦点外 12 秒"、"访客一律不广播，没有老板例外"）；浏览器端到端 `test/browser/desk-preview.cjs` PASS——老板工位（成员）独自在线时自己的屏幕就有画面（`frames>=1`），访客 `frames=0` 仍能看到老板工位的画面。
- 发布：上传 `index.html` + `assets/index-CJYubbjI.js`（CSS 未变，仍是 `index-BVSyMKpz.css`）与 `server.mjs`，`systemctl restart officeweb` → active。线上入口 `index-CJYubbjI.js`，JS SHA256 `b18c6a90d222c27314f2e558878bffece5acee43ed5e4c0d81065ab5dc0c3e9e` 与本地一致；线上包里可见 `function(i,e){return i&&e?6e3:12e3}`、`oO(document.hasFocus(),document.visibilityState!=="hidden")`、`desktop&&…connected&&…seated` 三条件判定与状态行文案。备份 `backups/boss-preview-20260915/`。

## 2026-09-15 01:20 修「还是没有出现屏幕预览」：有工位就一直采集（前端 `index-Dzq7sHO6.js` + `index-BVSyMKpz.css`）

- 现象（用户）：「还是没有出现屏幕预览」。用真实浏览器端到端复现（新增 `OfficeWeb/test/browser/boss-preview.cjs`，隔离服务端 + 桩 `officeDesktop`）：老板工位**屏幕存在、工位认领正常，但客户端一帧都没采集**（`frames: 0`）——因为 2026-09-14 的规则「除你之外没人开着接收就不采集」，一个人办公时 `wanted=false`，于是自己的显示器一片空白；等第二个人进来后画面立刻出现。这正是"没有预览"的原因。
- 修复：`shouldPreview` 去掉 `wanted`——**桌面客户端在线且持有工位就持续采集**（6 秒 / 300px，常驻流单帧约 3ms，代价可忽略）；`ambient { wanted }` 保留，但只用于状态提示「采集中（暂时没人看）」，不再停采。
- 顺带补上可诊断性：底部栏常驻一行「我的工位预览：…」（`previewGate.previewReason`），区分需桌面客户端 / 浏览器需点「授权工位预览」 / 连接中 / 还没有工位 / 访客不广播 / 采集失败重试 / 采集中。显示器空白时先看这行。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **122/122**（新增「没人在接收也照常采集」「状态行说得出为什么没有画面」）；浏览器端到端 `boss-preview.cjs` PASS——老板一个人时自己的屏幕上就有画面（`frames>=1`、`shown` 为 JPEG），普通访客 `frames=0` 但能看到老板的画面。
- 发布：前端逐个文件上传 `index.html` + `assets/index-Dzq7sHO6.js` + `assets/index-BVSyMKpz.css`；线上入口即 `index-Dzq7sHO6.js`，JS SHA256 `7788b3d0b73a70c85dbddd6b3361bbb33f80f1557a31d8354e0bbf75e2b2461b` 与本地一致，线上包内含状态行、老板例外规则与"只要求 desktop/connected/seated"的新判定。纯前端改动，**未改后端、未重启服务**；EXE 无需重新打包。

## 2026-09-15 00:45 老板也共享低分辨率屏幕（前端 `index-RGgXNJ2q.js`，后端 `preview-policy.mjs`）

- 需求（用户）：「老板也要共享低分辨率屏幕啊」——坐老板工位的人不再受「访客不广播低清预览」限制，即使以访客身份进来也照常采集并广播。
- 规则：判定以**坐位**为准。新增后端模块 `preview-policy.mjs` 的 `broadcastsPreview(person, BOSS_SEAT)`（`server.mjs` 的 `ambient-sharing` 与 `preview` 两处都改用它，作为服务端兜底）；客户端对应 `src/previewGate.ts` 的 `mayBroadcastPreview(role, seat, bossSeat)`，`src/seats.ts` 新增由坐位表推导的 `BOSS_SEAT`，`useDesktopPreview` 用它决定是否采集。普通访客一切照旧（不采集、服务端拒绝）。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` **120/120** 通过；新增/加强 3 项测试——`roles.test.mjs`「老板工位的人即使是访客身份，也照常共享低清预览」（同事确实收到老板的低清帧，且服务端不把它清掉）、原有访客用例补上"服务端主动清屏"断言、`seats.test.mjs` 校验服务端 `BOSS_SEAT` 与坐位表同源。
- 发布：前端逐个文件上传 `index.html` + `assets/index-RGgXNJ2q.js`（CSS 未变）；后端上传 `server.mjs` + `preview-policy.mjs` 并 `systemctl restart officeweb`（active）。线上入口 `index-RGgXNJ2q.js`，JS SHA256 `586e56d104fe41ce92ad935a0a918b0e7f21cdb201d1a1f611495b00d8a78e5d` 与本地一致；`server.mjs` 线上 SHA256 `b080645c14a1f0ef68ff6b8d490ab5dce7ce406562080634bf4813f1091e0951` 与本地一致；线上 JS 里能查到编译后的规则 `function(i,e,t){return i!=="visitor"||e===t}`。
- 备份 `backups/boss-preview-20260915/`（旧 `server.mjs` + 旧 `index.html`）；未覆盖账号、工位、聊天数据。线上未用真实"文杰"账号跑端到端（避免测试账号混入正式名册），转发链路由同一份 `server.mjs` 的隔离测试覆盖。

## 2026-09-15 00:20 身份改名：员工 → 成员（前端 `index-CvfrhYs1.js` + `index-C5yNhsdZ.css`）

- 需求（用户）：把界面上的「iruler 员工」改成「iruler 成员」，只改称呼。
- 改动：`src/AccountGate.tsx` 身份卡与说明文案、`src/AdminDialog.tsx` 管理员密码提示、`accounts.mjs` 校验提示「身份只能是成员或访客」；**协议与存储取值仍是 `employee` / `visitor`**（改了就丢已有身份），已在 `OfficeWeb/AGENTS.md` 写明。
- 验证：`tsc --noEmit` 通过；`node --test test/*.test.mjs` 118/118 通过；构建产物 `../Build/OfficeWeb`。
- 发布：上传 `index.html`、`assets/index-CvfrhYs1.js`、`assets/index-C5yNhsdZ.css`（逐个文件，不用 `-r`）；线上入口已是 `index-CvfrhYs1.js`，JS SHA256 `c35a6ee7bf13586766bdfa0a417bfa3f5dd7b032c03b9e2055e587ccd1ad80c9` 与本地一致。
- 线上核验：`https://115.159.43.237/` 返回新入口，线上 JS 内含「iruler 成员」且「员工」出现 0 次；`characters/`、`basis/`、`draco/` 与四个 `.glb` 的远端大小与本地逐一相同，无缺失资源。未改后端数据，未重启服务。

## 2026-09-14 23:50 身份选择：员工 / 访客（前端 `index-D-FK-i7S.js`）

- 需求（用户）：进软件先选身份——**iruler 员工**或**访问人（客户）**；访客直接坐公共区沙发、**不广播低清屏幕预览**，但会议/私聊/语音/高清共享照旧；**名字含「文杰」直接进老板工位**。
- 服务端：`accounts.mjs` 增加 `role`（`POST /api/auth/role`，落库持久化）；`server.mjs` 在 join 时按身份落座——名字匹配 `BOSS_NAME = /文杰/` 时直接认领 `BOSS_SEAT = 8`（`src/seats.ts` 的 `Manager`/"老板工位"）并 `save()`；访客由 `sitting.freeSofa()` 选空沙发就坐、认领工位被拒；`ambient-sharing` 与 `preview` **双重拒绝**访客的低清帧。
- 客户端：`AccountGate` 在 `role` 为空时先显示身份选择页；`previewGate` 增加 `employee` 条件；`OfficeScene` 新增 `sitSpot`，访客会走过去坐到服务端安排的沙发（每次分配只应用一次）。
- 验证：新增 `test/roles.test.mjs` 2 项；网页 118/118；线上入口 `index-D-FK-i7S.js` 与本地逐字节一致；匿名 `POST /api/auth/role` 被 CSRF 来源检查拦为 403（浏览器内未登录为 401）。

## 2026-09-14 23:10 设置里的角色选择改为缩略图网格（前端 `index-C83fSQrx.js` + `index-B4pndPqT.css`）

- 需求（用户）：设置里选「我的角色」时，要和刚进来时一样有缩略图。此前设置里是个只有文字的 `<select>`。
- 做法：抽出 `src/CharacterChooser.tsx`（女/男页签 + 缩略图网格），首访选座弹窗 `SeatPicker` 与设置里的 `CharacterSetting` **共用同一个组件**，两处不会再各写一套；设置里的下拉框删除。
- 版面：设置弹窗加宽到 560px（`.modal.settings-modal`），让 11 个缩略图两行放完、缩略图尺寸与首访一致；`.modal` 补 `max-height: 88dvh; overflow-y: auto`，窗口矮时整个弹窗可滚动，不会再把「关闭」顶出视口。
- 验证：网页单测 **112/112**、`tsc --noEmit`、`vite build` 通过。新增 `test/browser/character-setting.cjs`（真实浏览器跑构建产物 + 隔离服务器 + 隔离账号）：设置里 2 个页签、女 10 / 男 11 个缩略图，逐个 `naturalWidth > 0` 确认真的解码（含滚动后的懒加载图）；缩略图地址集合与首访弹窗**逐项相同**；点「宇航服」后确实发起 `man_spacesuit.glb` 请求且高亮跟随；刷新后设置里仍是宇航服并按它加载模型。截图 `Build/character-setting-thumbnails.png`、`Build/character-setting-chosen.png`，证据 `Build/character-setting-evidence.json`。
- 线上：`index-C83fSQrx.js`（1,445,925 字节，SHA256 `ca595e90725e2a72a09bded0578d143bc354df55a95700f8ff5ca9dbdfc6873c`）、`index-B4pndPqT.css`（52,888 字节，SHA256 `5e90aa2a2d0e951dc0cb06c8d43321b3d992295da7ecdcd690e658634c5c4036`），两者与本地 `Build/OfficeWeb` **逐字节一致**，线上 CSS 内已含 `.settings-modal` 与 `.character-setting .character-grid`。纯前端，**未重启 `officeweb`**。
- 测试选择器同步：`livekit-remote-avatars.mjs` 与 `livekit-workstation.mjs` 不再用 `select[aria-label='选择角色']`（该元素已删），改为在设置网格里点缩略图；打开设置改用 `button[aria-label="设置"]`——玩家昵称里可能含「设置」二字，`getByRole(name)` 会撞到成员按钮。
- 本次上传的是当时工作区的整份前端产物：除本任务外还**顺带包含当时未提交的前端改动**（`PrivateCallPanel.tsx`、`ScreenStage.tsx`、`screen-stage.css`、`officeNotifications.ts`、`useOffice.ts`）。同批未提交的 `OfficeDesktop/annotation-overlay.*` 属于 EXE，**没有**随本次上线。
- 已知问题（本次未修）：`deployed-smoke.mjs`、`livekit-screen.mjs`、`livekit-workstation.mjs` 仍在断言旧版选座弹窗（`.seat-picker`、`.seat-picker-grid`、「先不选」），而现在的选座是「先选角色 → 点场景里的椅子」（`.seat-picker-hint`），按现状跑必然失败；已记入 `Design/TODO.md`。

## 2026-09-14 23:05 工位预览改为常驻低频采集（EXE 0.1.10，300px / 6 秒）

- 用户决定：采用 B 方案，并把分辨率改为 **300px**、间隔改为 **6 秒**（原 480px / 3 秒作废）。
- 实测旧做法：`desktopCapturer.getSources()` 单次 **552ms**（JPEG 仅 0.8ms），每 3 秒一次且在主进程 ≈ 持续 18% 的一个核心，并周期性阻塞主线程——与用户反馈的"鼠标断跳"吻合（现场采样单进程 17.4%）。
- 新做法 `OfficeDesktop/preview-capture.cjs`：一个**隐藏窗口**持有常驻采集流（`getUserMedia` + `chromeMediaSource:'desktop'`，采集时就设好 `maxWidth/maxHeight=300`、`maxFrameRate=2`），主进程每帧只取最新画面。实测：取源 **590ms 仅一次**，之后每帧 **2.5–3.7ms**、JPEG 12KB。旧的一次性枚举保留为回退路径。
- 安全与行为不变：隐藏窗口 `show:false`、禁用 Node、独立 session 且只允许它自己申请媒体权限；仍是低清静态 JPEG、不弹选择器、不自预览、不传视频；换屏时自动重启采集。
- 网页侧同口径：`useDesktopPreview.ts` 6 秒；浏览器共享缩略图 `media.ts` 300px / 6 秒。
- 测试：桌面 30/30（新增 4 项常驻采集断言）；网页 111/111（新增 3 项：门控条件、"释放采集"调用、服务端 `ambient` 语义）。
- **同时实现了 A**：服务端 `publish()` 逐个 socket 下发 `ambient { wanted }`（含义"除你之外还有没有人开着接收"）；为 false 时客户端停止取帧并调用 `officeDesktop.setPreviewActive(false)` 释放常驻流，恢复后自动重启。关闭自己的接收**不会**停止自己的上传——只有确实无人可看时才停。
- **待人工确认**：常驻采集期间 Windows 是否持续显示"正在截屏"提示图标（我无法自动观测系统托盘提示）。若一直亮着，就在"无人接收"之外再退回一次性取源。

## 2026-09-14 22:51 默认视角改为开放工位；移除本地运行方式（前端 `index-BZwjPWbv.js`）

- 需求（用户）：相机默认用开放工位视野；127.x 那套本地运行方式基本不用，有就去掉。
- 默认视角：`src/App.tsx` 初始 `view` 由 `overview` 改为 `desks`，相机预设从 `[19,23,29]` 换成开放工位的 `[8,12,15] → [0.6,0.5,1.8]`；空间总览仍在导航/页签里一键可达，其余三个视角不变。
- 移除本地运行方式：`package.json` 删除 `dev`（Vite `127.0.0.1:5188`）与 `server`（本地 `start.mjs` `127.0.0.1:3108`）两个脚本；`vite.config.ts` 删除仅供开发服务器使用的 `/socket.io`、`/api` 代理。`start.mjs`/`server.mjs` 是 systemd 线上入口，保留；Vite 仍用于 `vite build` 与测试内建服务器（`createServer({ configFile:false })`），依赖未动。
- **保留**明文 HTTP 提示横幅（`App.tsx` 的 `insecure`）：`Design/Deployment.md` 已记录 `http://115.159.43.237/` 仍可访问且确实不能采集屏幕/语音，它不只是本地专用。
- 验证：`tsc --noEmit` 与 `vite build` 通过，网页单测 **108/108**；线上入口 `index-BZwjPWbv.js`（此前 `index-CdsicpxU.js`），线上 JS SHA256 `f115d614d311d9c9713527c2e08406f026675361408595ec899ea61f684c4f66`、1,447,859 字节，与本地 `Build/OfficeWeb` 逐字节一致。
- 新增 `test/browser/default-view.cjs`（真实浏览器 + 隔离服务器跑构建产物）：断言默认选中页签为 `02开放工位`、相机落在 `[8,12,15]`、切到空间总览与切回都到达预设；截图 `Build/default-view-open-desks.png`，证据 `Build/default-view-evidence.json`。
- 生效范围：纯前端。`static.mjs` 每次请求 `stat`/读盘、`index.html` 为 `no-cache`，因此**没有重启 `officeweb`**，线上会话未中断。

## 2026-09-14 22:40 降 CPU/流量：压缩、条件缓存、减少重渲染（前端 `index-CdsicpxU.js`）

- **压缩**（`static.mjs`）：文本类型按 `Accept-Encoding` 用 brotli/gzip 传输并带 `Vary`，压缩结果按 文件+大小+mtime 缓存（上限 32MB）。实测线上 JS **1,447,862 → 374,363 字节（-74%）**；已压缩格式（.glb/.png）不重复压缩；Range 与压缩不混用。
- **条件缓存**（`static.mjs`）：带内容哈希的文件（`index-<hash>.js|css`）→ `max-age=31536000, immutable`；其它资源保留 1 小时但新增 `ETag`，过期后返回 **304**。
  - 验证：在服务器上直连应用、经 nginx :80 与 :443，带 ETag 均返回 **304 / 0 字节**。
  - 注意：**从本机测会看到 200**，因为这台机器的 TUN 代理会插手（`--noproxy` 也无效）；以服务器侧结果为准。
- **减少 React 重渲染**（`useOffice.ts`、`OfficeScene.tsx`）：500ms 通话轮询在没有通话时不运行、值未变时保留旧对象；motion/preview 批量合并（100ms/500ms）后一次写入；远端角色映射表只在快照变化时重建。
- 测试：网页单测 108/108（新增 2 项静态压缩/缓存断言）。

## 2026-09-14 桌面端预览截图的真实开销（待决）

- 实测 `desktopCapturer.getSources({types:['screen'], thumbnailSize:480})` 单次 **552ms**（中位 550、最大 627），JPEG 编码仅 0.8ms。它每 3 秒执行一次且在主进程，等于持续占用约 **18% 的一个核心**，并周期性阻塞主线程——与"开着软件鼠标断跳"高度吻合。
- 现场采样（用户正在运行的实例，16 线程机）：`iruler dream` 各进程合计约 **36% 的一个核心**，其中单个进程 17.4%，与上述预测一致。
- 可选修法（未实施，需用户确认）：① 无人接收预览时完全不截图（服务端已知 `previewAllowed`）；② 改为常驻低帧率采集（一次性取源 + `getUserMedia` 的 `chromeMediaSource: 'desktop'`，每 3 秒只抓一帧），把 552ms 降到个位数毫秒。

## 2026-09-14 共享屏幕不再选屏（0.1.8）

- 需求（用户）：共享屏幕不再让用户选，直接用"低分辨率工位预览"已经选定的那块显示器；私聊和会议统一；不再弹独立选屏窗口。
- 做法：新增 `display-store.cjs` 作为**唯一决策点**（选择持久化在 `preview-display.json`，选中的屏幕断开则回退主屏）。`permissions.cjs` 的 `setDisplayMediaRequestHandler` 直接解析该显示器并回调，不再调用选择器；`desktop-bridge.cjs` 的 `office:displays` / `office:display-select` / `office:preview-frame` 全部改用同一个 store，因此低清预览与高清共享必然同一块屏。
- 删除：`source-picker.cjs`、`picker.html/js/css`、`picker-preload.cjs`（连同打包清单里的条目）。私聊与会议都走 `getDisplayMedia`，所以两条路自动统一。
- 平台限制（必须知道）：**浏览器版无法跳过**浏览器的原生选择器——这是浏览器的安全要求，网页做不到；只有桌面 EXE 里那个我们自己的弹窗被去掉了。
- 波及的测试已同步：`permissions.test.cjs`（改为断言"直接给已选屏、不存在第二次交互"）、`desktop-bridge.test.cjs`（改用真实 display store + 临时文件）、新增 `display-store.test.cjs`（默认主屏/选择生效/重启恢复/断屏回退/无屏返回 undefined）、`capture-integration.cjs` 与 `capture-trace.cjs`（真实 Electron 采集改为无选择窗路径：三种约束直接采集、无可用显示器时拒绝、摄像头仍拒绝）。
- 桌面测试 22/22 通过。新产物 `Build/OfficeDesktopRelease/iruler-dream-0.1.8-Windows-x64.exe`。

### 2026-09-14 21:48 标注功能上线（前端 `index-BUZKbHTL.js`）

- 前端入口 `index-BUZKbHTL.js`，线上 JS SHA256 `7c7bfaec03c3e7d445988cd4f8b7ecc496817e9eb7c5aba38698d838cec3e6f5` 与本地 `Build/OfficeWeb` 逐字节一致。
- 后端新增 `collab-annotations.mjs` 并已上传（远端 mtime 21:48），`officeweb` 服务 active、近 2 分钟无 error。
- 远端备份 `backups/pre-annotation-20260914-2148`（旧 dist + 全部后端）。
- 线上包里已确认含标注 UI（"标注中…"、"抢占共享"、"静音对方"、`annotate` 事件）。
- **未完成**：两客户端真实联机标注会话尚未人工跑通；中继行为由自动化测试覆盖（私聊/会议授权、越权拒绝、限频、清理）。

### 2026-09-14 22:00 小窗按钮修正（前端 `index-7ug9IbJH.js`）

- 用户反馈：小窗里一排按钮叠在画面上。原因是把完整按钮条也放进了内联视图，窄面板下换行盖住了画面。
- 修正：内联只保留**一个**「全屏」药丸按钮（高 36px，右下角，不占条带）；「标注 / 撤销 / 清空 / 放大 / 退出全屏 / 静音我 / 静音对方 / 抢占共享 / 挂断 / 关闭」只在进入全屏或窗口内放大后出现。
- 验证：新增 `test/browser/screen-stage.cjs`（harness `test/screen-stage-harness.html`）断言——内联按钮集合必须恰好是 `["全屏"]` 且高度 <48px；点全屏后 `document.fullscreenElement` 成立、按钮集合为完整 8 项、按钮条 opacity=1；进入标注后追加「撤销/清空」。截图 `Build/stage-inline.png`、`Build/stage-fullscreen.png`、`Build/stage-annotating.png`。
- 线上入口 `index-7ug9IbJH.js`，SHA256 `f510fdedbbaccab7e3b07686400dad7fba7fa74975c973e4097e4a2fe4df7e21` 与本地一致。桌面 EXE 无需重新打包（0.1.8 不变）。

### 2026-09-14 22:05 按钮被切割的真正原因（前端 `index-BDoTVoaO.js` + `index-njgHlGw4.css`）

- 用户反馈：小窗里的按钮被切割。定位到根因不是我的样式，而是 `panels.css:218` 的
  `.session-panel button { position: absolute; top: 4px; right: 0; }`——它是 (0,1,1) 特异性、且比 `screen-stage.css` 后加载，
  于是把舞台里**每一个**按钮都从按钮条里拽出来、按面板右上角定位：小窗里表现为按钮压在画面上并掉到画面外被 `overflow:hidden` 裁掉（实测按钮底边 707px vs 画面底边 667px），多按钮时表现为"一堆按钮叠在一起"。
- 修复：`screen-stage.css` 增加 `.screen-stage .screen-stage-bar button { position: static; inset: auto; }`（两个类胜过那条单类规则，与样式表顺序无关），定位权只留给按钮条本身。
- 教训与测试修正：我之前只在**独立** harness（无 `.session-panel`）里断言，那条全局规则不生效，所以断言全过而真实面板是坏的。新增 `test/browser/private-call-stage.cjs` + `test/private-call-stage-harness.html`：在**真实私聊面板**里跑，断言按钮 `position=static`、完全落在画面矩形内、滚动后仍可见、放大后 8 个按钮位置互不重叠且都在可见区域。`test/browser/stage-cascade.cjs` 保留为定位类问题的诊断脚本。
- 证据：`Build/panel-inline.png`（单按钮在画面内）、`Build/panel-fullscreen.png`。线上 CSS SHA256 `5a68375ce265cc646d38a19ab3bd8473…` 与本地逐字节一致，且线上 CSS 内含上述两条规则。

### 2026-09-14 22:12 放大后按钮居中（前端 `index-B-vtqV4X.js` + `index-Dx7H4GVR.css`）

- 用户反馈：展开后按钮仍"围在一起"。实为其时按钮条是**通栏**：标题孤零零在最左，8 个按钮全挤在右下角。
- 修正：放大/全屏时按钮条改为**底部居中的药丸**（`left:50%` + `translate(-50%)`、`width:max-content`、`max-width:min(940px, calc(100% - 32px))`、`justify-content:center`、`gap:8px`），标题后加一条分隔线；窄屏自动换行仍保持居中。
- 实测（真实私聊面板 + 全屏，1440×900）：按钮条中心 720 = 视口中心 720；宽 744 < 1440；中心线跨度 0px（单行）；两两重叠面积 0；间距 8px 均匀；位于下方（824–878）。截图 `Build/panel-fullscreen.png`。
- 新增断言写入 `test/browser/private-call-stage.cjs`（居中 ±4px、单行、无重叠、间距 3–24px、不拉满、在下方）。
- 线上入口 `index-B-vtqV4X.js` + `index-Dx7H4GVR.css`；CSS SHA256 `a0e5bb9d255ce3d9…` 线上与本地一致，并已从线上 CSS 抽出该规则逐字核对（压缩后为 `translate(-50%)`，不是 `translateX(-50%)`）。

### 2026-09-14 22:25 拆成「最大化 / 全屏」两个按钮（前端 `index-vJVhJjFz.js` + EXE 0.1.9）

- 用户反馈：客户端点全屏没效果。**实测确认**：在打包好的窗口里 `requestFullscreen()` 完全无效——没有报错、`document.fullscreenElement` 仍为 false、窗口尺寸不变（1440×940，屏幕 1920×1080）。原因是 0.1.7 为圆角把窗口改成 `transparent: true`，Windows 上透明窗口进不了 HTML 全屏。
- 拆成两个按钮：**最大化**=软件窗口内占满（纯 CSS，一直可用）；**全屏**=占满整个屏幕（客户端走 Electron 原生 `win.setFullScreen()`，浏览器走 DOM 全屏）。小窗两个都是紧凑药丸按钮，完整按钮条仍在最大化/全屏后出现。
- 又一个实测发现：透明无边框窗口**不会触发 `enter-full-screen`/`leave-full-screen`**，所以状态不能等事件。新增 `OfficeDesktop/fullscreen.cjs`：谁改全屏谁负责给页面加类并通知渲染进程（`office:fullscreen-changed`）；`chrome.cjs`（含 F11）与 `desktop-bridge.cjs` 共用它。
- 实测（打包 0.1.9，独立 profile）：IPC 返回 `true`、窗口 1440×940 → **1920×1080**、退出后复原 1440×940。桌面路径的网页侧行为（调原生接口、不碰 DOM 全屏、按钮文案随事件翻转）在 `test/browser/screen-stage.cjs?desktop=1` 用可控假桥断言。
- 未解之谜（如实记录）：用 CDP 附加探针时，桌面的 chrome 注入（`iruler-desktop` 类与标题栏元素）在这台机器上**任何版本都不发生**（0.1.8 同样），而用户正常启动时标题栏是存在的；因此"全屏时隐藏标题栏"这条我无法在探针里观测，需要在真实使用中确认。
- 测试：桌面 24/24；网页单测 104/104；两个浏览器 harness（独立舞台 + 真实私聊面板）全过。EXE 0.1.9 已构建（`Build/OfficeDesktopRelease/iruler-dream-0.1.9-Windows-x64.exe`，同时保留 `Build/OfficeDesktopRelease019/` 一份）。

### 2026-09-14 22:30 后台/托盘的来电与消息通知（前端 `index-BElqbAGe.js` + EXE 0.1.9 重打包）

- 用户反馈：窗口关到托盘后**有提示音但看不到任何弹窗**，来电/聊天/语音/会议都收不到可见提示。
- 根因：通知走渲染进程的 HTML5 `Notification`，窗口 `hide()` 后 Chromium 视其为隐藏页，Windows 会丢弃；`webPreferences` 又缺 `backgroundThrottling:false`；且没有任何代码会主动把窗口弹到前台（只有点通知才 `focusWindow()`，而通知根本看不到）。
- 做法：`desktop-bridge.cjs` 新增 `office:alert`，由**主进程原生 `Notification`** 发通知；紧急事件（来电/语音/会议）调用 `attention()` = restore→show→moveTop→focus + `flashFrame(true)` + 1.2 秒置顶脉冲，点击弹窗经 `office:alert-open` 回到渲染进程。`main.cjs` 加 `backgroundThrottling:false` 并在聚焦时停闪烁。网页侧 `officeNotifications.ts` 把来电/会议标为 `urgent`（铃声 2 秒×15，接听/点击/过期即停），聊天只弹通知不抢窗口；**桥接不可用时回退网页通知**，避免 preload 有方法、主进程无处理器时静默丢弃。
- 上线核验：本地入口 `index-BElqbAGe.js`（CSS 沿用 `index-Dx7H4GVR.css`），线上 `https://115.159.43.237/assets/index-BElqbAGe.js` SHA256 `22c6443fce0b0eeb4a8c175c859433bf597602fa97891bf6c7631c65f633c5f0` 与本地逐字节一致，`officeweb` active、无 error。备份 `backups/notifications-20260914/`。**只改前端，未重启服务，线上用户未掉线**（上次入口 `index-vJVhJjFz.js` 保留在盘上）。
- 测试：桌面 24/24（含新增 alert 用例）、网页 106/106（含新增 3 条通知用例）、`tsc --noEmit` 通过。EXE 于 22:22:17 重新打包，并在 `win-unpacked/resources/app.asar` 实测到 `office:alert`、`office:alert-open`、`backgroundThrottling`、`flashFrame`、`setAlwaysOnTop`、`onAlertOpen`。
- 注意：本次前端构建快照同时包含 22:25 那条「最大化/全屏」改动（同一 `src/` 树）。**未验收**：真实 Windows 上「关窗到托盘 → 另一客户端来电/会议」的弹屏与响铃尚需人工双端实测。

### 2026-09-14 23:10 标注变成单层：只画在共享的那块屏幕上（前端 `index-Yp42T-T1.js` + EXE 0.1.10）

- 用户要求（参考腾讯会议 / 向日葵）：标注应画在**对方那块真实屏幕**上，画完被共享画面拍进去，所有人自然就看到了；**不要在视频上再叠一层**。
- 根因：overlay 原来 `setContentProtection(true)` 把标注层**排除在采集之外**，所以只能在视频里补第二层——这正是「多此一举」的来源。另外 `annotation-overlay.js` 的 `paint()` 把 `startX/startY` 提到循环外，一条笔画被画成从起点散开的 N-1 根线。
- 改法：`setContentProtection(false)` 让标注层留在共享画面里；`ScreenStage` 删除 canvas 与全部笔迹渲染，只留不可见的拖动输入面 `.screen-stage-draw`；`useOffice` 删除本地笔迹 state（不再每批笔迹触发 React 重渲染）。**全链路只剩共享屏幕这一层。**
- 折线修复证据：新增 `OfficeDesktop/test/annotation-paint.test.cjs`；把旧 `paint()` 换回去是 **2 失败**，用新实现是 **2 通过**。
- 核验：本次上传的线上入口 `index-Yp42T-T1.js` + `index-BbmmLFdr.css` SHA256 与本地逐字节一致；线上 JS 实测含 `screen-stage-draw`、不含 `screen-stage-board`。（并发会话随后又重建过一次，线上入口现为 `index-Cp4VNN2K.js`，已复验仍含 `screen-stage-draw`、不含 `screen-stage-board`，即本改动在线。）EXE 0.1.10 于 23:08:41 打包，`app.asar` 内实测 `setContentProtection(false)` 为真、`true` 为假，且含折线修复。
- 测试：桌面 30/30、网页 111/111、`tsc --noEmit` 通过。备份 `backups/single-annotation-layer-20260914/`。
- 已知限制与未验收：标注需要**共享方运行桌面 EXE** 才有那层可画（浏览器共享没有本机层）；两台真实客户端之间的标注仍未人工跑通。
- 事故与教训：本轮 `scp -r assets` 在并发构建下中途失败，造成 index.html 已更新而新 JS 未上传；`static.mjs` 的 SPA 回退会把缺失资源返回成 200 的 HTML，**只看状态码会误判成功**。已改为逐文件上传并复验；传前端请显式列出改动的哈希文件，不要 `-r` 整个 assets。

### 2026-09-14 23:20 提醒卡片改为屏幕居中（前端 `index-BSh4ZjSM.js` + `index-D5TZK3cm.css`，纯 CSS 无需重打包）

- 用户反馈：消息提醒没有居中。原两个应用内提醒都钉在角落：`.incoming-calls`（来电/看屏幕邀请）右上 `top:85px;right:28px`，`.meeting-notification`（会议邀请/有人共享）右下 `bottom:30px;right:30px`。
- 改法：`.incoming-calls` 改为 `fixed;inset:0` 的 flex 居中 + 浅色遮罩 `#0e1a1424`；容器 `pointer-events:none`、`.incoming-calls>*{pointer-events:auto}`，卡片居中显眼而背后界面仍可点、按钮照常可用；`.call-invite` 固定 `width:min(380px,calc(100vw - 32px))`。`.meeting-notification` 改为 `left:50%;top:calc(50% - 150px);transform:translateX(-50%)`（略高于中心，避免压住居中的来电卡片）。
- **踩到的坑**：`.meeting-notification` 在 `workspace-ui.css:251` 与 `workspace-responsive.css:83` 各有一条**后加载的覆盖规则**又把它按回底部（`bottom:42px;right:40px`、`left/right/bottom:22px`）。同优先级下后写的赢，**只改 `meetings.css` 等于没改**。已去掉这两处定位，只留配色与窄屏字号。
- 核验（线上抽 CSS 逐条核对，不只看状态码）：`index-BSh4ZjSM.js` + `index-D5TZK3cm.css` SHA256 与本地一致；线上 `.meeting-notification` 只剩 3 条规则且**都不含 left/right/bottom 定位**；`.incoming-calls` 实测含 `justify-content:center`、`pointer-events:none`，且 `.incoming-calls>*{pointer-events:auto}` 在线上存在（缺了接听/拒绝按钮就点不动）；`top:85px`/`right:28px`/`bottom:42px`/`right:40px` 均已不在线上。备份 `backups/centered-alerts-20260914/`。
- 未验收：居中效果未在真实双端来电场景截图确认（只核对了线上 CSS 规则与哈希）。

### 2026-09-14 23:41 管理员密码改为用户指定值（仅服务器 `.env`，无代码/前端改动）

- 位置：`/home/ubuntu/officeweb/.env` 的 `ADMIN_PASSWORD`。`server.mjs` 用 `process.loadEnvFile` 在启动时读同目录 `.env`；`admin.mjs` 把两边 SHA-256 后常量时间比较，并按 socket 限流（5 次失败锁 10 分钟）。**明文不写入本仓库。**
- **更正本文档旧记录**：此前写的「未设置时默认 `admin123`」是错的。`server.mjs:43` 是 `process.env.ADMIN_PASSWORD || ""`，空值即**关闭**管理功能；实测改动前线上 `.env` 根本没有这一行，也就是管理员功能一直是关的。`.env.example` 的说法（留空即禁用、无默认值）才是对的。
- 做法：备份 `backups/admin-password-20260914/.env.before`（原文件仅 LIVEKIT 三项）→ 用 `grep -v` 删掉旧行后追加新行 → `cat` 回写以保持 inode/权限 → `chmod 600` → `systemctl restart officeweb`。
- 核验：该行值长度 8、全为数字、**不含 CR/LF**（带 CR 会让密码静默永不匹配，本轮就差点踩到）；服务器上 `process.loadEnvFile('./.env')` 载入值的 SHA-256 与预期完全一致；服务 active、3108 恰好 1 个监听、回环 200、正式站 200、日志 `OfficeWeb ready on http://127.0.0.1:3108 (livekit: wss://115.159.43.237)`（LIVEKIT 三项未被破坏）。
- 未验收：真实「管理员踢人」流程未跑（需要已登录会话；唯一不破坏数据的探针是「正确密码 + 非法工位号」，同样要先登录）。重启会让在线用户掉线一次，重连即可。
- 提醒：纯数字、日期形态属弱口令；`admin` 目前只有「踢出工位」一个动作，但共享空间建议换成更长的随机串。

### 2026-09-14 23:52 管理员密码标签写明用途（前端 `index-DxsZMtyx.js`，纯前端无需重打包）

- 用户要求：管理员密码那里标注它的用途。`AdminDialog.tsx` 的标签由「管理员密码」改为「管理员密码（iruler员工通用密码）」，`aria-label` 同步，读屏与可见文本一致。
- 核验：线上入口 `index-DxsZMtyx.js` SHA256 与本地逐字节一致；从线上 bundle 抽出的 JSX 实测为 `jsx("span",{children:"管理员密码（iruler员工通用密码）"})`（共 2 处：可见标签 + `aria-label`）。CSS 未变，沿用 `index-D5TZK3cm.css`。
- 说明：`.admin-password` 是 flex 纵向布局，长标签只会自然换行，不会挤压输入框宽度。

## 2026-09-14 桌面端窗口圆角（0.1.7）

- 背景：Windows 10 的无边框窗口没有原生圆角；Electron 的 `roundedCorners` 只从 Windows 11 Build 22000 起生效（该选项默认 true），Win10 上必须由外壳自己实现。
- 做法：窗口改 `transparent: true` + 全透明底色；**标题栏负责上两角**（`chrome.css` 的 `.bar`），**页面盒子负责下两角**（`desktop-theme.css` 的 `.app` / `.account-page`），半径由 `--window-radius: 16px` 统一控制。`html` 与 `body` 必须保持透明——否则 `body` 背景会被提升为整个画布的背景，圆角立刻失效。最大化/全屏时主进程给页面加 `iruler-maximized` 类，半径归零填满工作区（`chrome.cjs` 监听 maximize/unmaximize/enter-/leave-full-screen）。
- 代价（已知并接受）：透明窗口拿不到 DWM 原生阴影，改用 1px 内描边（左/右/下，避免标题栏下出现接缝）保证边缘可辨；四角 16px 区域不再是窗口的一部分，那一点的鼠标事件会穿透到桌面。
- 验证（真实打包 0.1.7、独立 profile、未影响用户正在运行的实例）：逐像素检查 `Build/desktop-017-normal.png` —— 四角 alpha=0、对角线剖面 `0/0/0/78/255…`（抗锯齿弧线而非 1px 切角）、直边与中心 alpha=255；最大化后四角变不透明、半径 0、窗口 1920×1040；还原后回到 16px 与 1440×940。合成效果图 `Build/desktop-017-on-desktop.png`。
- 生效范围仅桌面外壳；网站未改动、未重新部署。

## 2026-09-14 桌面端品牌去重（0.1.6）

- 问题：应用标题栏与网页（登录卡、应用内导航条）各显示一次 "iruler dream"；桌面预加载还会把网页里的 OFFICE 改写成 iruler dream，导致窗口顶部出现两行相同品牌。
- 定案：**标题栏只保留图标**（名称仍在 DOM 中供读屏，窗口标题仍是 iruler dream）；**网页只保留字母**（图标隐藏），因此品牌在整个窗口里只出现一次。
- 改动只在外壳：`OfficeDesktop/chrome.html`、`chrome.css`、`desktop-theme.css`。**网站未改动、未重新部署**，浏览器版视觉不变。
- 新产物 `Build/OfficeDesktopRelease/iruler-dream-0.1.6-Windows-x64.exe`（`package.json` 0.1.5→0.1.6，不覆盖旧包）。
- 验证：app.asar 内 chrome.html/chrome.css/desktop-theme.css 与源码 SHA256 逐字节一致；`--office-smoke-test` 隔离启动 `ok=true`、加载 https://115.159.43.237/；真实窗口截图 `Build/desktop-real-app.png`（登录页实测登录卡图标 display:none、图标 30px、标题文字 clip-path inset(50%)）。
- 登录后的应用内导航条由同一条 `.rail .brand .brand-mark` 选择器覆盖，本机未登录故未截图实测。
- 未做：安装版与开机自启（按用户要求后续处理，见 `TODO.md`）。

## 2026-09-14 新域名 HTTPS

- `iruler.online` 和 `www.iruler.online` 已解析到本 VPS；原警告原因是服务器仅提供 IP 证书，域名不匹配。
- 已签发并安装 Let's Encrypt 域名证书，SAN 包含上述两个域名，到期 2026-12-13；路径 `/etc/letsencrypt/live/iruler.online/`。不得读取私钥内容。
- 新增 `/etc/nginx/sites-available/officeweb-domain` 及 sites-enabled 链接，沿用现有应用/LiveKit 反代；域名 HTTP 自动跳转 HTTPS，保留 ACME 验证目录和原 IP 入口。
- 原配置备份 `/home/ubuntu/officeweb/backups/domain-tls-20260914-161718/officeweb.nginx`；nginx 校验通过后平滑 reload，未重启应用或改动业务数据。
- Python 默认 TLS 校验实测两个域名与原 IP 均 HTTP 200，首页 SHA256 一致：`806108981c8d0286788a13407ea3b2d327266a08294998ada6d82d58fe1e9e00`；两个域名 HTTP 跳转成功，nginx/officeweb 均 active。
- 既有 officeweb-cert.timer 每天执行新版 certbot renew，成功后 reload nginx，覆盖新域名证书。此处为线上 TLS/HTTP 验证，未重新进行多人媒体验收。

## 2026-09-14 预览接收、通话小窗与通知

- 当前正式 B5mO1Nd3 / C7e3Smgy，来自 Build/OfficeWebPreviewReceiveRelease；HTTPS index/JS/CSS逐字节匹配，officeweb active。
- JS SHA256 5951b8637360aa4cb5859b8142120998c942c3b56547ca022aff9ebb02a88a62；CSS 784bcbcb27bf704b68ab8063080f4243389f1e7c69c2c1a05156e7d3fb215572。
- server.mjs SHA256 246a8885b1b7d8a202a09dc8ec15b766356cbbec834fc92c733ef2ce74fa5e2e，正式匹配。仅更新此后端，未覆盖业务数据/.env或重启LiveKit。
- 备份 backups/preview-notifications-20260914。包含接收侧预览省流量、移除底栏暂停/麦克风、SVG通话小窗、通知，以及已独立验证的起立跳帧。
- 84网页测试、13桌面测试、桌面完整UI与双客户端预览回归、真实SFU接替回归通过；正式站3人在线和新底栏已查看。
- 桌面通知需新版0.1.4，保留0.1.3托盘功能；真实Windows通知show成功、短音AudioContext running，便携EXE隔离加载正式站通过。
- 详情见 Preview_Notifications_20260914.md。


## 2026-09-14 桌面自动预览统一发布

- 当前正式B3RovUWT / DE_G6PVl，来自Build/OfficeWebDesktopAutoRelease；HTTPS哈希与本地一致，officeweb active。
- JS f863377dc70a4d8acd5851ab524ef0ccafd6a3cd001519ab7b589fd08c4172fb；CSS 67686d80d6d44aa2e8cd697eeeb39cb88ae44bbaaf6255dc73f18eccb59f2c79。
- server/accounts/privateSessions/meetings/livekit五后端上传且远端哈希匹配；备份backups/desktop-auto-20260914。
- 包含EXE自动登录/3秒独立预览、本人屏幕右键切屏、工位相机和共享接替；82测试、桌面10测试与完整网页回归通过。
- EXE 0.1.2已打包并隔离启动正式站点验证，需使用新版；详见Desktop_Auto_Preview_20260914.md。
- 保留业务数据/.env与私聊隔离，未重启LiveKit。

更新于 2026-09-10。**当前地址：https://115.159.43.237/**

## 2026-09-13 当前账号发布

- 已启用姓名密码注册、登录、退出；Socket 身份由服务端会话验证，不再依赖浏览器访客 ID。
- 部署后首次使用须自行注册账号。密码只保存加盐 scrypt 哈希，cookie 为 Secure / HttpOnly / SameSite。
- 账号与会话按用户存入 `/home/ubuntu/officeweb/accounts.json.d/`，兼容旧 `accounts.json`；不得随发布覆盖或放到 dist。
- 工位保存在 `state.json`，绑定账号 UUID，原子写入，离线或重启仍保留。不得按同名自动合并旧访客身份。
- 后端文件新增 `accounts.mjs`、`account-storage.mjs`；管理员未配置密码时关闭，不存在公共默认密码。
- 发布备份 `/home/ubuntu/officeweb/backups/accounts-20260913/`；最新前端入口 `index-D5MYOdLk.js`。
- 账号/工位服务器测试通过，线上登录页已查看，匿名 `/api/auth/me` 返回 401。真实跨网络音视频仍待验收。
- 下文历史“无鉴权”“全部内存”“admin123”描述不再代表当前版本。

### SSH 固定连接配置（2026-09-12 已验证）

- 服务器：`115.159.43.237`；账号：`ubuntu`；端口：`22`。
- 私钥路径：`C:/Users/Administrator/.ssh/id_ed25519_aiwb`。
- 远端项目：`/home/ubuntu/officeweb`；静态目录：`/home/ubuntu/officeweb/dist`。
- 使用 `IdentitiesOnly=yes`、`BatchMode=yes` 和 `StrictHostKeyChecking=yes`。
- 已用此密钥实际登录并核对账号与工程目录；用户明确密钥未改变。
- `id_ed25519_irulerdream` 属于另一台 Windows 测试机，不能用于本 VPS。
- 此前认证失败是选错密钥，不能据此推断用户改了密钥或服务器离线。
- 后续先使用下面的已验证命令，不重复询问服务器或枚举其他密钥。
  只有这个明确配置本身失败时，才按实际错误诊断；不得关闭主机校验。
- 文档只记录路径，不记录或输出私钥内容。

```powershell
ssh -i C:/Users/Administrator/.ssh/id_ed25519_aiwb -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes ubuntu@115.159.43.237
```

**证书已是 Let's Encrypt 正式签发，浏览器不再有任何警告**，直接打开即可（无需点「继续访问」）。
`http://115.159.43.237/` 同样可访问，但只能看和走，不能共享屏幕或语音。

## 现在跑着什么

| 组件 | 位置 | 说明 |
|---|---|---|
| 前端（构建产物） | `/home/ubuntu/officeweb/dist` | 由应用进程托管 |
| 信令 + 静态托管 | `/home/ubuntu/officeweb/start.mjs` | systemd 服务 `officeweb`，监听 `127.0.0.1:3108` |
| TLS 终止与反代 | nginx（`/etc/nginx/sites-available/officeweb`） | 监听 80 与 443，同源反代应用与 LiveKit |
| 媒体面 | 既有的 `livekit-server`（`115.159.43.237:7880`） | 配置未改动，经 nginx 以 wss 反代给浏览器 |
| 配置 | `/home/ubuntu/officeweb/.env` | `LIVEKIT_URL=wss://115.159.43.237` 等 |

`start.mjs` 是独立入口。`server.mjs` 原本用 `import.meta.url === pathToFileURL(process.argv[1])`
判断"我是不是入口"再自启动，**但 PM2 会用容器包一层执行脚本**，`argv[1]` 指向那层容器，
判断静默失效：PM2 显示 online、端口没人听、日志一个字都没有。改成显式入口后正常。

## 为什么是 80 端口

这台机器的腾讯云安全组只放行了少数几个入方向端口。实测（在服务器上起临时监听、
从本机用 `curl --noproxy '*'` 取真实数据，只有拿到真实 payload 才算通）：

| 端口 | 结果 |
|---|---|
| 22 / 7880 / 7881 | 通（ssh 与 LiveKit） |
| **80** | **通** |
| 443 | 通（可用于 TLS） |
| 3108 / 8080 / 3000 / 8443 / 8000 段 / 9000 / 10000 段 | **不通** |
| UDP 30000–40000、50000–60000 | 通（TURN 与 RTC 用） |

所以选 80。80 是特权端口，服务用 systemd 的 `AmbientCapabilities=CAP_NET_BIND_SERVICE`
以 ubuntu 身份绑定 —— 既没有改系统 node 二进制，也没有加 iptables 规则，重启后自动恢复。

⚠️ 注意：本机装了代理（WinINET `127.0.0.1:7890`，疑似 Clash 且开了 TUN）。在**本机**
用普通方式探测端口会得到假结果：TUN 会接受任何 TCP 连接，所以 `Test-NetConnection`
连没有监听的 80/443 都报"OPEN"，而 HTTP 请求经代理会返回 502。必须用
`curl --noproxy '*'` 并检查真实响应体才能判断端口是否真的通。

## 服务管理

```bash
sudo systemctl status officeweb     # 状态
sudo systemctl restart officeweb    # 重启
sudo journalctl -u officeweb -f     # 日志
```

服务 `Restart=always`，开机自启（`systemctl is-enabled` = enabled）。

## 重新部署

```powershell
cd OfficeWeb
npm run build                       # 产物在 ..\Build\OfficeWeb，本地不存在 OfficeWeb\dist
# 构建结束会自动跑 postbuild = test/public-parity.mjs，核对 public\ 与产物逐文件
# 大小。必须看到「public/ 与构建产物一致」再往下走——两个 agent 同时构建到同一个
# outDir 时 emptyOutDir 会删掉对方刚拷进去的文件（2026-09-15 实际发生过：basis\
# 转码器变 0 字节，浏览器里静默回退到备用模型，只表现为"加载慢"）。
# 构建会把 public\ 全量拷进产物。两个零引用资源（office.glb 17.9MB、
# office-white.glb 5.0MB）已于 2026-09-14 从 public\ 删除，新构建不再包含；
# 若在历史构建目录里看到它们，照下面这行清理即可。
Remove-Item ..\Build\OfficeWeb\assets\office.glb, ..\Build\OfficeWeb\assets\office-white.glb -Force -ErrorAction SilentlyContinue
# 1) 前端：把构建产物【内容】传到远端 dist（不要传本地 dist，它根本不存在）
scp -i C:/Users/Administrator/.ssh/id_ed25519_aiwb -o IdentitiesOnly=yes -r ..\Build\OfficeWeb\* ubuntu@115.159.43.237:~/officeweb/dist/
# 2) 后端：全部运行时文件，缺一个服务就起不来（依赖关系见下表）
scp -i C:/Users/Administrator/.ssh/id_ed25519_aiwb -o IdentitiesOnly=yes server.mjs start.mjs static.mjs livekit.mjs admin.mjs collab-annotations.mjs accounts.mjs account-storage.mjs chat-access.mjs chat-store.mjs chat-server.mjs chat-files.mjs meetings.mjs privateSessions.mjs sitting.mjs public-seats.json package.json ubuntu@115.159.43.237:~/officeweb/
ssh -i C:/Users/Administrator/.ssh/id_ed25519_aiwb -o IdentitiesOnly=yes ubuntu@115.159.43.237 "sudo -n systemctl restart officeweb"
```

后端运行时文件与依赖（2026-09-14 核对，`start.mjs` → `server.mjs` → 其余）：

| 文件 | 作用 | 被谁引用 |
|---|---|---|
| `start.mjs` | systemd 入口，绑定端口 | 服务 |
| `server.mjs` | 信令、工位、静态与路由 | `start.mjs` |
| `livekit.mjs` | 令牌与房间授权 | `server.mjs`、`meetings.mjs` |
| `static.mjs` | dist 静态托管（支持 Range） | `server.mjs` |
| `admin.mjs` | 管理员释放工位、密码限流与恒定时间比较 | `server.mjs` |
| `collab-annotations.mjs` | 共享屏标注中继（同通话/同会议可见） | `server.mjs` |
| `accounts.mjs` + `account-storage.mjs` | 账号、会话、scrypt | `server.mjs` |
| `chat-store.mjs` / `chat-files.mjs` / `chat-server.mjs` / `chat-access.mjs` | 聊天与附件 | `server.mjs` |
| `meetings.mjs` / `privateSessions.mjs` | 会议与私聊会话 | `server.mjs` |
| `sitting.mjs` | 公共座位仲裁 | `server.mjs` |
| `public-seats.json` | 座位数据，`sitting.mjs` 在导入时读取 | `sitting.mjs` |

依赖只在首次装：`cd ~/officeweb && npm install --omit=dev`。

发布后核验（本地入口名必须与线上返回一致，否则就是没传上去）：

```powershell
$entry = [regex]::Match((Get-Content ..\Build\OfficeWeb\index.html -Raw -Encoding UTF8), 'index-[A-Za-z0-9_-]+\.js').Value
$entry
curl.exe -sS -k https://115.159.43.237/ | Select-String $entry   # 有输出才算这次构建真的上线
```

## 已验证（2026-09-10）

`cd OfficeWeb && node test/browser/deployed-smoke.mjs`：**6/6 通过**。在**部署站点**上
用两个真实浏览器客户端验证：站点可访问且信令已连接、办公室模型加载完成、两个客户端
连到同一台服务器、**能看到另一个玩家的角色并跟随其走动（误差 0.17 米）**、页面无未预期错误。

## TLS 已启用（2026-09-10）

**HTTPS 地址：https://115.159.43.237/　——媒体功能在此地址才可用。**
`http://115.159.43.237/` 仍然可以访问（只是看和走，不能共享屏幕/语音）。

未改动既有 `livekit-server` 的任何配置（它还服务着别的应用）。做法是 nginx 在 443 终止
TLS，同源反代：静态与 `/socket.io/` → `127.0.0.1:3108`，`/rtc`（WebSocket）与 `/twirp/`
→ `127.0.0.1:7880`。前端 `.env` 的 `LIVEKIT_URL` 改为 `wss://115.159.43.237`，
于是页面与媒体面同源，一张证书全盖住。应用自身退到 `127.0.0.1:3108`，由 nginx 转出去。

### 证书：Let's Encrypt 的 IP 证书（无警告）

试过两条「用域名」的路，都不通：

1. `sslip.io` 通配 DNS + Let's Encrypt —— **失败**。这台机器在中国大陆，**未备案域名的请求会被
   网络层拦截**并跳转到 DNSPod 的 webblock 页，校验请求拿不到 challenge 文件：

   ```
   Detail: 43.174.224.202: Invalid response from
           https://dnspod.qcloud.com/static/webblock.html?d=115.159.43.237.sslip.io
   ```

2. 用户自己的已备案域名 `aiwb.org.cn` —— 它解析到**另一台**服务器（`8.138.233.99`），而且
   `office.aiwb.org.cn` 之类的子域**没有 DNS 记录**，无法指向本机。改 DNS 需要用户操作。

**最终做法：用 Let's Encrypt 新支持的 IP 地址证书。** 裸 IP 不被拦截，所以 HTTP-01 校验能通过：

- 系统自带的 certbot 2.9.0 **不支持** IP 证书（没有 `--ip-address` / `--preferred-profile`）。
  已在 `/home/ubuntu/certbot-venv` 用 pip 装了 **certbot 5.8.0**。
- 签发：`certbot certonly --webroot -w /var/www/html --ip-address 115.159.43.237 --preferred-profile shortlived`
- 产物：`/etc/letsencrypt/live/115.159.43.237/{fullchain,privkey}.pem`，签发者 `Let's Encrypt`，
  SAN 为 `IP Address:115.159.43.237`。

⚠️ **IP 证书是短期的（这次到期 2026-09-17，约 6 天）**，必须自动续期。已建
`officeweb-cert.timer`（每天 03:20 + 随机延迟）执行
`/home/ubuntu/certbot-venv/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"`，
续期后自动 reload nginx。**注意别用系统那个 2.9.0 的 certbot 续期，它做不了 IP 证书。**

验证（**不带任何证书例外**）：`curl https://115.159.43.237/` → HTTP 200、`TLS=0`；
`openssl s_client` → `Verify return code: 0 (ok)`；Playwright 不加 `ignoreHTTPSErrors` 也能直接打开，
`isSecureContext=true`。三个浏览器测试套件已**移除**证书例外，以确保将来证书出问题会直接失败。

如果以后愿意加一条 DNS 记录（例如把已备案域名的子域指向 `115.159.43.237`），可以换成
有效期 90 天的常规 Let's Encrypt 证书，就不用每 6 天续一次。


### 已验证

`node test/browser/deployed-smoke.mjs https://115.159.43.237/`：**12/12 通过**。

- 部署站点可访问、信令已连接、模型加载完成
- 两个客户端连到同一台服务器
- **能看到另一个玩家的角色并跟随其走动（误差 0.15 米）**
- **`isSecureContext = true`**（TLS 生效）
- `getDisplayMedia` / `getUserMedia` 均可用，**并真的采集到 1 条屏幕视频轨与 1 条麦克风音轨**
- **经 nginx 的 wss 反代连上 LiveKit：2 人入会，双方麦克风轨道成功发布**
- 除已知的 `/rtc/v1` 版本探测 404 外无未预期错误

## 已知限制

- 证书是自签的，浏览器首次访问有一次警告（见上，加一条 DNS 记录即可根治）。
- 没有鉴权：身份是 socket id + 随机「访客 123」，任何人打开网址就能进。
- 状态全在内存：重启服务 = 所有人掉线、工位与聊天记录清空。
- `livekit-server` 版本偏旧（protocol 15 / 客户端 17），靠回退到 `/rtc` 工作。
- 只有本机与单机双客户端验证过，尚未在真正的两台不同网络机器之间验证。

## 2026-09-11 更新：起名 + 永久工位 + 管理员踢出

- **起名系统**：浏览器 `localStorage` 存 `office-id`（稳定身份）与 `office-name`（名字），跨会话、跨刷新保留；服务端 `rename` 同步到工位名册，别人能看到你的名字。
- **工位永久**：`server.mjs` 把工位归属持久化到 `state.json`（与 `server.mjs` 同目录，即服务器 `/home/ubuntu/officeweb/state.json`）。断线、重启都不释放工位；换座会释放旧座，但本人不能自己放弃，只有管理员能踢出释放。
- **管理员踢出**：密码由 `ADMIN_PASSWORD` 控制（读 `/home/ubuntu/officeweb/.env`），未设置时默认 **`admin123`**——部署后记得在服务器 `.env` 里改掉。前端左侧栏盾牌图标进入管理员面板，踢出后该工位立即空闲、在线的人收到提示。
- 部署命令不变（见「重新部署」）；`state.json` 是运行时生成，**无需上传**；服务端无新增依赖。

## 2026-09-13 密码规则调整
- 用户要求密码允许 1–16 个字符，前后端已同步上线；入口 index-CYP1cPkf.js。
- 34 项测试通过，包含 1 位和 16 位允许、空密码和 17 位拒绝；正式网站输入框已核验。

## 2026-09-13 显示器重新烘焙
- 九台显示器使用新独立 UV 与 256 采样降噪贴图，源材质简化为原理化 BSDF。
- 线上入口 index-Dx0b4M-Y.js，模型版本 20260913-monitor，模型 SHA256 8f8484dcc0b2a06a5c124cae058a6f7903a0e9f4d7c27769ed92f36834925067。

- 最终 UV 修复版本：index--LdtEyxY.js / 20260913-monitor-uv2；模型 4550076 字节，SHA256 75b0cf8311b72671c53ab86baf3a69c18dbd7ce3c627d900268f87ce2ed9886a。
- 显示器图最终为 1K，引导降噪 256 采样；源工程已保存。

## 2026-09-13 椅子交互简化
- 已发布 index-C3AZUTMS.js / index-D4RxazWv.css；只更新前端。
- 角色设置、椅后坐姿、本人椅子或屏幕回座；类型检查与构建通过，所有 OfficeWeb 文本文件不超过500行。
- 线上已确认设置入口和椅后坐姿；当前会话验收途中失效，完整回座动作需补验。

## 2026-09-13 聊天本地存档与七天补收
- 已上线浏览器 IndexedDB 长期存档、按账号隔离、离线补收最近七天与服务端定时清理。
- 后端新增 chat-store.mjs、chat-server.mjs；运行数据 chat-data/ 不得静态托管、覆盖部署或纳入长期备份。
- 入口 index-C3AZUTMS.js；构建目录 Build/OfficeWebChatRelease，正式 HTTPS 返回及浏览器聊天说明已核验。
- 37 项服务端测试与真实浏览器存档测试通过，完整规则和证据见 Chat_20260913.md。

## 2026-09-13 UI 更新与老板工位
- 已部署 index-BrCiUMPY.js / index-EOr5DQbs.css，暖白/橄榄 UI、登录页及第 9 个老板工位。
- server.mjs 已更新为 SEAT_COUNT=9 并重启；原 8 个工位编号与归属保留，聊天模块哈希与此前发布一致。
- 正式 HTTPS 返回和浏览器界面已核验；38 项测试通过，老板门口路径检查通过。
- 备份目录 /home/ubuntu/officeweb/backups/ui-20260913-manager/；详细证据及会话限制见 UI-Refresh-20260913.md。

## 2026-09-13 前景墙自动裁切
- 入口 index-CEAhGu-1.js，样式 index-EOr5DQbs.css；独立构建目录 Build/OfficeWebWallRelease。
- 新增 src/wallCutaway.ts，摄像机与焦点之间的遮挡墙平滑降为低墙，切回视角恢复；不修改 GLB 或源场景。
- TypeScript 和两项裁切专项测试通过，实际模型对照截图检查确认墙后家具显露，正式网站实际资源已核验。
- 旧入口备份 backups/wall-cutaway-20260913/index.html，带哈希的旧静态资源保留。

## 2026-09-13 自动坐姿与回座修复
- 最新前端 index-BiZ9_C7e.js / index-Dn4GrtvI.css 已上线并查看界面，移除坐姿控件。
- 坐下后每45–90秒随机切换已有坐姿，不连续重复，行走暂停计时。
- 本人工位通过账号永久归属判断，临时在线列表清空不再丢失回座判断；WASD可从坐姿起身。
- 回座与定时暂停/不重复测试通过；多人动作同步需正常连接后再复核。
- 发布期间另一并行更新将入口更新为 index-BiZ9_C7e.js；已检查该实际入口仍包含 front low wall 裁切模块及 localClippingEnabled 开关，保留较新发布，未回滚覆盖。

## 2026-09-13 多层墙与梁柱裁切修正版
- 修复单层墙裁切遗漏：包括独立内墙饰面、后侧窗体、玻璃立柱、顶梁横框、墙上黑板与显示板。
- 入口 index-DtdMxDtL.js，样式 index-Dn4GrtvI.css；构建目录 Build/OfficeWebWallLayersRelease。
- TypeScript、3 项裁切专项测试和真实 GLB 后侧裁切截图检查通过；正式 HTTPS 入口和脚本哈希已验证。
- 旧入口备份 backups/wall-layers-20260913/index.html，保留旧资源及全部业务数据。

## 2026-09-13 屏幕贴合修复
- 已发布 index-DGgzX7FT.js / index-Dn4GrtvI.css；独立目录 Build/OfficeWebScreenFitRelease。
- 九台画面改为贴合真实机身正面，修复底座包围盒导致约9.1cm悬空，保留1mm防闪烁间隙。
- 模型未修改；三项专项测试、81点模型采样和正/侧面对比检查通过。详情 Screen-Fit-20260913.md。
- 旧入口备份 backups/screen-fit-20260913/index.html；实际脚本上传哈希已核验。
- 正式网站浏览器新入口与老板显示器近景已查看确认，画面贴合边框。

## 2026-09-13 会议中心发布
- index-C7AtdTyK.js / index-DURXtgs1.css；新增 meetings.mjs，更新 server.mjs 与 livekit.mjs。
- 服务 active，正式浏览器已连接并打开会议中心，显示主题、邀请成员和创建按钮。
- SHA256 15a671726209b2f047bf555e4d4dfb4ba76c8d80e25e514b2e16e8ac4d83563a；备份 backups/meetings-20260913/。
- 验证与边界见 Meetings_20260913.md；真实跨网络音视频仍待验收。

## 2026-09-13 自己的共享预览
- 发布 index-DDwuszvT.js / index-OZQMCNrs.css；HTTPS 内容与本地哈希一致，仅前端更新。
- 备份 backups/self-preview-20260913/index.html。动态本地视频、浮动预览、停止及系统结束清理测试通过；保留用户进行中的会议，不强制刷新。

## 2026-09-13 会议远端共享修复
- index-DKRgN7CO.js / index-OZQMCNrs.css，正式 HTTPS 与构建哈希一致。
- 双账号经 LiveKit 验证接收画面连续播放，主界面共享已路由到当前会议，邀请入口整理。备份 backups/meeting-receiver-20260913/。

- 会议邀请页简化：移除另建会议按钮，发布 index-MpP5jpT9.js，类型检查与构建通过，HTTPS入口已核验。

## 2026-09-13 通信生命周期与兼容性修复
- 已发布 index--R4vf-D0.js / index-OZQMCNrs.css，更新 meetings.mjs 并重启 officeweb；LiveKit 服务未重启。
- 前端 SHA256 6976ef4cfacce1d573ad9f3837de24a64ca949f30690cf69f3e990accab7b63e，正式 HTTPS 实际返回匹配。
- 固定 livekit-client 2.17.2；2.22.3 对旧 1.8.4 服务端的协商确认出现周期性超时，A/B 验证兼容版消除该问题。
- 房间操作排队、旧连接隔离、采集取消、分房间麦克风、共享取消发布、重连与迟到移除保护。
- 50 项自动测试通过，1 项因本地未配置密钥跳过；双浏览器真实 SFU 音频能量、视频解码帧及启停/重进/断网恢复已验证。
- 业务测试账号隔离于 VPS media-qa-20260913；正式 HTTPS 前端复测通过，未写入正式名册。
- 回滚：backups/media-20260913/，包含原 index.html、meetings.mjs、package.json；旧哈希资源保留。
- 详细原因、验证边界和证据见 Media_20260913/README.md。真实跨网络双设备与物理设备人工验收仍待完成。


## 2026-09-13 通话界面与定向共享
- index-vh8dYLTa.js / index-COtConwn.css，后端server.mjs更新，HTTPS哈希与本地一致、服务active。
- 常驻会议状态、空面板清理、私聊麦克风真实状态、双向屏幕邀请。详情 Call_UI_20260913.md。

## 2026-09-13 Atelier UI 改版
- 发布 index-DrSGSS_y.js / index-C2AWnaTD.css：纸色、墨绿、黄绿的新视觉，横向导航、深色工位名册、浮动协作控制台与海报式登录页。
- 独立构建 Build/OfficeWebAtelierRelease；正式HTTPS入口、JS/CSS哈希及浏览器刷新后的主界面均已核验，服务active。
- 备份 backups/atelier-20260913/index.html；只更新前端，保留最新通信和业务数据。
- 桌面、手机与会议弹层检查通过；详情 UI-Atelier-20260913.md。

## 2026-09-13 紧凑标题与两列成员面板
- index-CdI-nBPx.js / index-JnwbRo91.css 已发布，CSS SHA256 ae4b6326719fabd5c1c6141b3c1f42373053497f6bc07c86a65a94bba43ea485 与正式HTTPS返回一致。
- 标题区64px、导航64px；桌面成员面板360px，两列卡片，窄屏响应式，长姓名截断、操作按钮可换行。
- 1440x900、1280x720、390x844检查无横向溢出；正式站截图已查看（3人在线），保留通信功能，仅CSS布局调整。
- 截图 Build/layout-1440.png、layout-1280.png、layout-390.png；备份 backups/compact-layout-20260913/index.html。

## 2026-09-13 单行顶部独立发布
- 已发布 index-wzkgSXs2.js / index-D1fgA_EZ.css，来自 Build/OfficeWebCompactHeaderCheck 已验收隔离快照。
- 与前正式CdI的JS差异仅顶部JSX，通信和三维代码逐字一致；未带正在开发的媒体及屏幕改动。
- HTTPS JS SHA256 9f1f03fd6f93f71753fc6eeb117255f0e5809771aa96e7eec13892ed4cb96438；CSS 295553b9b57cdf171dfd42a32ee2f729788f1583e858e2687aa7cb3e9a1870bf，与本地一致。
- 正式浏览器已查看单条56px导航、场景顶部64px、两列成员（3人在线），Good work已移除。
- 只上传两个哈希资源及最后切换index；未覆盖public资产、后端或账号数据。入口备份 backups/single-header-20260913/index.html。

## 2026-09-13 私聊音视频与实体薄边框集成发布
- 正式 index-DNY_NLtw.js / index-B_t315Gb.css；构建目录 Build/OfficeWebIntegratedRelease。
- HTTPS JS SHA256 6fd207fa6104feef0d39e8a4883725a15cd8493f87246fb53b8b7bc8d78bb06b；CSS 829b8926412f155dad523587db39933bf6edfd67d9e6532d40ce4333ec840711，与本地相同。
- server.mjs / livekit.mjs / privateSessions.mjs 已上传且哈希一致，officeweb重启后active；未重启LiveKit，未改业务数据/.env。
- 63项测试、类型检查、集成构建通过；正式浏览器恢复3人在线，A-3显示器近景确认薄边框与内屏贴合，保留单栏顶部和两列成员。
- 薄边框为加载时克隆并调整真实几何，GLB文件不变，无需重新上传模型。显示器点击聚焦与比例证据见 OfficeConcept/Thin_Monitor_Bezel_20260913.md。
- 私聊隔离SFU/权限竞态/断网等验证见 Private_Call_AV_20260913.md；真实跨网络硬件人工验收仍待完成。
- 回滚备份 backups/private-av-bezel-20260913/ 保存旧index/server/livekit；旧哈希静态资源保留。新版新增privateSessions.mjs可保留但旧server不引用。
- 发布后正式HTTPS产物复验通过：两方向屏幕+双向音频、挂断清理及零页面错误；采用隔离QA账号和真实SFU，证据Build/private-deployed-smoke-evidence.json，未扰动正式用户。

## 2026-09-13 工位预览与高清自预览分离
- 用户明确：低分辨率工位预览每3秒一帧，仅在场景显示器呈现，不弹个人共享浮窗。
- App仅在实际已连接且发布屏幕的私聊显示自预览；会议原有预览保留。media工位JPEG间隔700ms改3000ms，最长边480和原比例不变。
- 发布index-BWSZd6U3.js，沿用index-B_t315Gb.css；正式HTTPS SHA256 ce87242a14a8e2132288a165ae8311d4b4ff9f982abcbc46c25908e92b1ae963与本地一致。仅前端更新。
- 独立完整UI合成采集测试：本人工位Canvas收到正确画面、无浮窗、无麦克风请求，间隔2969/2997ms，停止采集成功，零页面错误。证据Build/workstation-preview-evidence.json及workstation-preview-only.png。
- 类型检查和构建通过；旧私聊UI测试同步取消普通预览必须出现浮窗的断言。备份backups/preview-only-20260913/index.html。

## 2026-09-13 成员列表紧凑行高
- 已发布index-BjC6acur.js / index-BTNZrnNF.css，保留3秒工位预览与私聊音视频。
- CSS SHA256 c38b7ac85613a396c69becd5260945c3b696c63dff13dc75ffe0066c0823c631，正式HTTPS与本地一致。
- 编号姓名同排、状态第二排，桌面46px/手机48px，保留360px两列；本地桌面列表250px，手机260px，类型检查/构建及交互验证由UI任务完成。
- 仅前端发布，备份backups/member-density-20260913/index.html；正式浏览器最终视觉复核交UI任务执行。

## 2026-09-13 三维节能与聊天附件统一发布
- 已发布index-DeSGVqns.js / index-D4CzR1lM.css；HTTPS JS SHA256 5d9e6d801c1713ac3c9925200de024a06a9e874f88ed06462198a14c52dcbb55；CSS 1a5639a0d44268bd86bef12e44f2bc6c3e338f35ada7feb45aeb146df9fbfdb8，与Build/OfficeWebPowerRelease一致。
- 67项测试、类型检查、构建通过。三维静止30fps，活动60fps，失焦15fps，隐藏/手动暂停零绘制；位置模拟与通信独立，详见Scene_Power_20260913.md。
- 实际浏览器2秒60帧、暂停零帧而工位预览持续，恢复正常；正式站设置/暂停覆盖层/恢复均已操作查看，最终已恢复用户画面。没有测量用户设备GPU百分比。
- 聊天附件同步发布server.mjs/chat-store.mjs/chat-files.mjs，SHA核验一致，officeweb active；匿名附件401、正式聊天旧文字和新附件入口由后端任务核验。
- 未覆盖.env、账号、工位或聊天数据；未重启LiveKit。备份backups/scene-power-chat-20260913/，完整非敏感源码快照Build/SourceSnapshots/Power20260913供后续隔离发布。

## 2026-09-13 发送方附件提示简化
- 发布index-BPLCipbr.js，沿用D4CzR1lM.css；正式HTTPS SHA256 d8707b9770246f6f1f7fc89f5e4e74eb84cb0c211b9d1e1d62e41555aed8221c与隔离构建一致。
- 按账号senderId区分本人附件，发送方隐藏本地保存成功提示，接收方保留；保存、错误提示及下载逻辑不变。
- 类型检查与现有双浏览器附件回归通过，正式聊天3人在线及接收方附件正常。仅前端发布，无服务重启；备份backups/chat-sender-20260913/，源码快照Build/SourceSnapshots/ChatSender20260913。

## 2026-09-13 静止10帧
- 用户要求闲置三维10fps；active仍60，失焦也降10，隐藏/手动暂停仍零绘制。
- 发布CKrJeP1Z / D4CzR1lM，保留发送方附件提示修复；HTTPS JS SHA256 60a05484f4d3c3142dd403174a97f13da2db65a4acab7ea59680d5bbd22e93a0与本地一致。
- 调度单测/类型检查/构建通过；实际浏览器2秒19帧，暂停0、恢复正常，3秒预览继续。备份backups/idle10-20260913/index.html。

## 2026-09-13 在线标识、老板房通行与单账号登录
- 已发布index-wLvv2Asc.js / index-C0dEHtLO.css，来源Build/OfficeWebPresenceNavigationLoginRelease；HTTPS字节与本地相同。
- JS SHA256 37b699e04982756c5b0e39ebdbdba1075a16b46f29974b4707710bda6398757b；CSS 064a54d76e2c29fa3e3dea05d10132908bfecea6f008df8b22f3dac5e709c554。
- 在线成员亮绿色徽标/实心点/亮姓名，离线灰色徽标/空心点；正式3名在线成员界面已查看，手机离线对照使用隔离数据截图Build/presence-mobile.png。
- 全部导航障碍矩形每边内收最多10cm，额外余量15cm减为2cm；缩小后的薄碰撞采用完整线段检查防止跳过。老板桌左侧旧20cm可通行宽度小于28cm网格，现已打通；墙体核心和楼外边界仍限制通行。
- navigation回归验证门口、桌侧、椅后的双向完整路径；真实浏览器人物实际进入老板房、走到桌后并退出，零页面错误，截图Build/manager-room-arrival.png。
- 新登录成功持久化后撤销同账号旧会话，立即通知并断开旧Socket；旧界面返回登录页，避免调用logout误注销同浏览器新会话。错误密码不顶人，旧登录刷新和服务重启后仍失效。
- 69项单元/集成测试全部通过、tsc通过；test/browser/single-login.mjs双独立浏览器会话验证新旧登录、错误密码和重启恢复。
- server.mjs SHA256 1e944792b007ff19280f189d22d81d0c3ad02cc34e3db62ed8e004410a754db2；accounts.mjs 0ab4de92459065a8cd266f59ede7c0ac5affb821da6d97e77fab894a5ce842e9；远端匹配，officeweb重启后active。
- 未覆盖账号、工位、聊天数据或.env，未重启LiveKit；保留静止10fps及发送方提示修复。备份backups/presence-navigation-login-20260913/，源码快照Build/SourceSnapshots/PresenceNavigationLogin20260913。


## 2026-09-13 公共区点击入座
- 已发布 index-BOmtET0d.js / index-C0dEHtLO.css，正式 HTTPS JS SHA256 035be4aadbb2e6e49ae9adece7e543c07e678b71d5035ed897bdafddf886c8d1。
- 后端新增 sitting.mjs、public-seats.json；server.mjs SHA256 f29682a63727634dbfddb65432cacf57a5854f15ee803f93494d6c0697caeaf2，服务 active，备份 backups/public-seating-20260913/。
- 18个公共座位临时预约、防并发抢坐、离座释放；保留专属归属与所有已有通信/附件/节能功能。原项目独立构建同字节。
- 73项测试通过、1项未配置LiveKit跳过；双浏览器和正式资源+隔离信令验收通过。完整记录 PublicSeating_20260913.md。


## 2026-09-13 坐下朝向修正
- [x] 长沙发三个位置朝向真实茶几中心，修复两端方向配反。
- [x] 入座完整重置旋转并锁定座位方向，避免行走四元数转换为XYZ欧拉角后残留X/Z翻转；移动广播改用四元数计算真实朝向。远端坐姿采用同一座位角度。
- [x] 正式HTTPS硬刷新、18个公共座位方向、8个可用工位朝向和双窗口残留旋转回归通过；业务API/Socket隔离，未写入正式名册。截图SeatedFacing_20260913/production-two-sofa.png。
- [x] 已发布 index-b_gP7G1G.js / index-C0dEHtLO.css；JS SHA256 74af816f422c484200b8c53691c8753916a37978c3bd5addf2697057b66f7936，service active。73项测试通过、1项LiveKit配置相关跳过。
- 原项目备份Build/BeforeSeatedFacing20260913，VPS备份backups/seated-facing-20260913；保留账号、工位和聊天数据，未改家具模型和既有延期事项。

## 2026-09-13 内存清理与可选压缩对照
- 发布 D0Zwm5NK/C0dEHtLO，正式HTTPS JS SHA256 ce2ff24fa048f087aef394980932070c061b54acc221efc36dccd23355adc2d8，与本地一致。
- 默认保留原画质，修复人物/场景释放；?textures=compact加载独立KTX2对照版，纹理有损，因此未默认启用。
- 75测试、类型检查、构建与预览/节能回归通过。旧入口备份backups/memory-20260913/index.html。
- 仅前端和新增静态资源，未覆盖业务数据或重启LiveKit。详见Memory_Audit_20260913.md。

## 2026-09-14 公共与个人聊天
- 发布BNq8_jzk/Drf0iNJg；正式HTTPS与本地一致。JS SHA256 906a789fc14fe246c6f114338cd8bd513d4815603d5a75b431e5807bc4b32df7；CSS 037b4b4be3691c2864f7ed916298007b9321966b14210dcc7f8f7830c6b33d1f。
- server/accounts/chat-server/chat-store/chat-files/chat-access六文件哈希匹配，officeweb active；76测试及三个隔离浏览器回归通过，正式列表/私聊进入/返回已查看。
- 备份backups/chat-threads-20260914；未覆盖业务数据。产生私聊后不得回退旧版无隔离聊天后端。详见Chat_Threads_20260914.md。



## 2026-09-29 记住密码修复（找回密码待确认）

仅前端已部署 main-DM4UMfvi.js / main-CgZrxncf.css，公网入口及全部七个代码资源 SHA256 与
Build/OfficeWebAuthRecovery20260929 一致。备份 backups/login-memory-20260929/index.html。
正式登录页浏览器验收通过，无页面异常；匿名 /api/auth/me 返回401且未启用 recoveryEnabled。
未上传 accounts.mjs、未重启服务、未修改账号数据。找回密码接口因自动审批拒绝而尚未发布，
界面入口保持关闭；不能把本地完成描述为正式可用。详见 Login_Recovery_20260929.md。

## 2026-09-29 找回密码正式启用

用户明确回复“接受这个风险，按姓名直接改密码并上线”后，已上传 accounts.mjs 并重启
officeweb，服务 active；后端文件 SHA256 与本地一致。前端 main-DM4UMfvi.js 保持不变，
入口及七个 JS/CSS 公网 SHA256 全部匹配。备份 backups/auth-recovery-20260929。
正式浏览器点击“找回密码”后出现姓名、新密码和“修改密码并进入”；无页面异常。
/api/auth/me 已声明 recoveryEnabled:true；重设接口空请求返回400，未修改真实账号。
截图 Build/password-recovery-live.png。此条替代下文“找回密码待确认”状态。


## 2026-09-29 方块共创空间正式发布

- 已发布全新无倒角 Box 场景；旧办公室 GLB 不再被场景请求。
- 19 种部件、放置/旋转/移动/拆除/撤销、音效、地面自建座位、共享宝箱。
- 线上入口 main-hRXlpASE.js / main-Dv3gN8lr.css；全部 9 个 JS/CSS/HTML 公网 SHA256
  与本地构建一致，5 个后端文件远端 SHA256 一致，officeweb active。
- 正式 /api/build 匿名返回 401。未覆盖任何账号、名单、聊天或建造存档。
- 308 项 Node 回归通过；VPS 双人 QA 与正式网址实际发布资源完整交互验收通过，
  含安装、R旋转、移动、拆除、撤销、跨客户端同步、刷新、三类宝箱内容、自建椅子入座、
  占用时禁止拆除。正式网址验收将业务 API/Socket 路由到独立 QA，未写正式测试账号。
- 已查看正式发布资源的 1600×1080 / 1000×800 场景截图与宝箱截图，无页面异常。
- 后端和入口备份 /home/ubuntu/officeweb/backups/box-world-20260929/。
- Blender 源 AssetSources/BoxWorld/BoxWorld_Parts.blend（19种纯Box部件，约137KB）。
- 当前边界：地面行走；楼梯上楼、展示屏视频播放、自建工位绑定预览在 TODO 单独跟踪。
- 详情 Design/BoxWorld_20260929.md；证据 Build/box-production-evidence.json、box-world-evidence.json。


## 2026-09-29 方块拱门、立体行走与地板扩展

- 正式入口 main-BQcnD_WD.js / main-DM1Jpqnl.css；9 个前端文件公网 SHA256 一致，5 个后端文件远端一致，officeweb active。
- 新增纯 Box 拱门，楼梯点击/WASD 上下行走及多人 y 高度同步；地板取消初始岛屿边界和 600 件非地板装饰限制。
- 支持不符合承重物理的悬挑、单角支撑、悬空。保留账号、工位、聊天、建造存档与原通话流程。
- 组件栏实测展开 149px、收起 55px（1600px / 1000px 两档窗口）。Blender 源同步为 20 种部件。
- 313 项 Node 测试通过；隔离 QA 和正式网址实际发布资源的双人交互验收全部通过。
- 正式网址验证仅把业务 API/Socket 路由到隔离 QA，不写入正式测试账号或建筑。
- 已查看正式资源楼上站立、拱门和紧凑 UI 截图；无页面异常。
- 备份 /home/ubuntu/officeweb/backups/box-expansion-20260929/；证据 Build/box-expansion-production-evidence.json、box-expansion-evidence.json。
- 详情 Design/BoxWorld_Expansion_20260929.md；跳跃与自建工位预览等边界继续在 TODO 跟踪。


## 2026-09-29 放置接触面高亮

- 正式入口 main-CG6lf7ds.js / main-DM1Jpqnl.css；9 个前端 HTML/JS/CSS 公网 SHA256 全部匹配。
- 新增浅蓝虚线落点轮廓、实际接触面的绿色填色及加粗亮边；无效位置为红色。
- 按实际 Box 表面交集显示，覆盖柱顶单角支撑、侧边接地板；悬空仍可安装。
- 移动模式排除原部件自身；漫游/移出画布隐藏，转动相机时重新计算；高亮不参与点击和碰撞。
- 类型检查、构建通过；QA 和正式发布资源浏览器分别验证单角接触、侧边接缝、无效红色和漫游隐藏，零页面异常。
- 已查看接缝和柱顶截图。证据 Build/box-guide-evidence.json、box-guide-production-evidence.json。
- 仅更新前端，无后端重启或数据覆盖；备份 backups/box-guide-20260929/。
## 2026-09-29 休闲影音区42件新物品

已发布main-D7efjecU.js / main-AwCDpcjG.css，部件目录扩为62件、8类并增加搜索。
公网9个入口/代码文件SHA256与Build/OfficeWebLoungeProps20260929一致；服务active。
后端仅替换build-catalog.json，账号/聊天/建造存档均保留。备份backups/lounge-props-20260929。
正式页面加载新模型、搜索与马克杯贴合0.495m桌面已实测（业务API隔离为内存，不污染正式存档）。
证据Build/lounge-props-live.png，完整模型清单和可编辑源见Lounge_Props_20260929.md。



## 2026-09-29 外方内圆拱门

- 用户纠正原阶梯拱门：现为 3×3×0.5m 方正外框，2m 宽门洞，半径1m半圆内缘，拱顶2.5m，无倒角。
- 真实圆弧轮廓挤出；独立空心碰撞近似保留门洞通行，接触面高亮不会把洞口视为实心。
- main-Ws2IXQfI.js / main-AwCDpcjG.css；9 个前端文件公网 SHA256 一致，未改后端或存档。
- 317 项 Node 测试、构建、90 项静态资产一致性通过。QA / 正式页面的圆弧外观、门洞通行和部件缩略图验收通过，原接触面高亮回归通过。
- 实际页面截图 Build/round-arch-scene.png；资源证据 Build/round-arch-production-evidence.json。
- 保留全部62件模型，Blender可编辑库和 Models/arch.glb 已由同一顶点数据重新生成。
- 发布快照 Build/OfficeWebRoundArch20260929；VPS入口备份 backups/round-arch-20260929/。

## 2026-09-29 建造遮挡与墙面安装

- 用户所说“不透视”指不能隔墙看见后方物件；保留原透视相机。
- 放置预览改为不透明且写入深度；接触面、亮边、落点轮廓开启深度测试，编辑模式停用工位前景裁切。
- 识别墙面世界法线，四朝向自动贴面并支持相对旋转；移动时射线排除被拿起的原部件。
- 从实际旋转网格计算接触偏移；建造存档校验允许毫米精度，修复薄墙/相框偏移和非整格桌面高度保存被拒绝。
- 正式入口 main-CXGnSykS.js；9个HTML/JS/CSS公网SHA256全部一致，build-store.mjs远端哈希一致，服务active。
- 318项Node回归、类型检查、构建和90项公共资源一致性通过；隔离浏览器验证四向贴墙、像素级遮挡；正式资源完整页面安装相框、保存和刷新通过，业务请求隔离到临时存档。
- 快照 Build/OfficeWebWall20260929，备份 backups/wall-placement-20260929；证据 Build/wall-production-evidence.json、wall-app-live.png。
- 几何资产未改变，无需重导Blender；建造/账号/聊天数据保留。

## 2026-09-29 地下搭建开放

- 去掉客户端和服务端y>=0限制，贴墙不再夹回地面；原工位保护仅拦与0～2m地上区域相交的部件，允许在其下方搭建。
- 高度改为紧凑数值输入，无负数下限，清空回自动；编辑视角可绕到地下。既有地上12m上限保持。
- 多人motion广播保留负y；地下楼梯上下行走验证通过。
- 321项Node回归、构建、90项资源一致性通过；负3/100/10000米持久化与地下角色同步通过。
- 正式main-C3LGtM0s.js / main-C7dwhlmq.css，9个前端公网哈希及build-store.mjs、server.mjs远端哈希一致，服务active。
- 正式资源页面验证负高度输入、地下安装相框、保存与刷新；业务API隔离到临时测试存档。
- 快照Build/OfficeWebUnderground20260929，备份backups/underground-20260929；未覆盖用户存档。

## 2026-09-29 鼠标接点与双柱搭梁

- 柱子叠接自动对齐同尺寸轴线；不同尺寸近边吸附。横梁默认抓住端点，旋转时端点随朝向变化。
- 紧凑工具栏新增接点按钮，Q循环自动/一端/另一端/中心；中心模式保留自由错位，不强制承重。
- 鼠标点击第一根柱顶可把4m横梁从x10搭到x14的第二根柱子；真实接触检测为两个支撑面。
- 浏览器验证柱顶边角点击对齐、四向旋转和两个端点、墙面安装/遮挡回归；完整页面Q切换、双柱搭梁、保存刷新通过。
- 部件库8类及1600/1000/520宽度紧凑布局通过；构建和90项公共资源一致性通过。
- 正式main-DzoLEWt-.js / main-C7dwhlmq.css；9个HTML/JS/CSS公网哈希一致，正式资源完整页面搭接通过（业务API隔离到临时存档）。
- 快照Build/OfficeWebAnchors20260929；备份backups/anchors-20260929；只更新前端，未重启后端或改用户存档。
- 截图Build/bridge-app-live.png、two-pillar-beam-preview.png；几何未变，无需重新导出Blender。

## 2026-09-29 空心门框跨柱落点修复

- 用户截图指出实际问题是鼠标射线穿过两柱空隙，退到远处地面；此前端点切换不能解决此问题。
- 新增buildGapPlacement，按部件真实底足和两侧支撑顶面识别跨空隙安装高度，近距离磁吸对齐两只脚；不改门洞模型或碰撞。
- 仅在真实底足同时接触两个部件、且落点前方无更近射线命中时吸附；自由悬空仍保留，手动高度优先。
- 浏览器覆盖门框/圆拱、两个旋转方向、地下、直接指向空隙、远处命中和近处遮挡；接触面至少两个。墙面/端点/遮挡回归通过。
- 正式main-CdSqxxwg.js / main-C7dwhlmq.css；9个前端文件公网哈希全部一致。正式资源页面直接指向空隙安装门框、保存刷新通过，业务API隔离到临时存档。
- 构建与90项静态资源一致性通过；快照Build/OfficeWebGap20260929、备份backups/hollow-gap-20260929。
- 已查看Build/hollow-gap-preview.png、gap-app-live.png。仅前端，无服务重启或用户数据覆盖。

## 2026-09-29 建造体验与62件部件规格核对

- 发布 main-Br8NALOE.js / main-C7dwhlmq.css；9个HTML/JS/CSS公网SHA256一致，build-catalog.json远端哈希一致，服务active。
- E取同款、F聚焦、Shift+R反向旋转；目标金色/拆除红色轮廓；连续撤销/重做；移动保存失败保留拿起状态，可重试或Esc恢复。
- 实测62件四朝向网格；dimensions显示实际规格，size保留居中范围；宝箱范围覆盖外凸锁扣，几何及已建物件外形不变。
- 325项Node测试、构建、90项公共资产一致性通过；1600/1000/520宽度紧凑工具栏通过。
- 正式资源浏览器验证快捷操作、撤销/重做、取消移动、保存冲突重试；双柱空隙安装与刷新回归通过。业务API隔离到临时存档。
- 已查看 Build/build-experience-live.png；证据 Build/build-experience-production-evidence.json；快照 Build/OfficeWebExperience20260929。
- 备份 backups/build-experience-20260929；仅更新前端与目录，不覆盖建造/账号/聊天数据。Blender库元数据已同步。
- 原panels.css超500行，将管理面板样式拆至admin-panel.css；构建CSS哈希不变。OfficeWeb除用户豁免锁文件外均≤500行。

## 2026-09-29 建造三向旋转快捷键

- 已发布 main-C9mGA-_G.js / main-DBOwZaBP.css；9个前端文件公网SHA256一致，build-store.mjs/build-http.mjs远端一致，服务active。
- 取消底部旋转按钮，改为紧凑三轴角度显示和屏幕快捷键提示：Q/W左右、X前后、Z侧翻、Shift反向；C接点；R兼容旧操作。仅安装/移动模式截获旋转键，漫游W走路保留。
- 新增pitch/roll可选字段，旧存档默认0；旋转几何底部归零，实际碰撞/贴面与缓存键包含三轴。翻倒座椅不提供坐下入口，翻倒地板不套水平续铺规则。
- 327项测试、构建、90项资源一致性通过；62件×三轴四档组合尺寸检查、保存与非法角度校验通过。
- 正式页面验证Q/W、X/Z及反向操作、横柱保存刷新；移动取消/失败重试/撤销重做、双柱中空搭接回归通过。业务API隔离，不污染用户存档。
- 1600/1000/520宽度工具栏保持紧凑；已查看Build/build-experience-live.png。
- 快照Build/OfficeWebRotation20260929，备份backups/build-rotation-20260929，证据Build/build-rotation-production-evidence.json。
- 部件基础几何不变，无需改Blender模型；只是实例朝向变化。没有覆盖账号/聊天/建造数据。

## 2026-09-29 边行走边建造与常驻按键提示

- 旋转键由Q/W改为Q/R；W不再被建造事件拦截，安装和移动时WASD保持行走。
- 编辑时独立常驻快捷键条：WASD行走、Q/R水平、X前后、Z侧翻、Shift反向、C接点、左键操作、Esc退出、Ctrl+Z撤销；落点提示不覆盖快捷键。
- 正式main-yPqYzf5T.js / main-ClD1epYs.css，9个公网文件SHA256与快照一致；只发布前端，不重启后端。
- 实际页面验证安装模式W持续按下使角色位置变化且角度不变，Q/R旋转、翻转、移动重试、撤销及保存刷新通过；业务API隔离。
- 工具栏1600/1000/520响应式、构建、90个资源一致性通过；修改文件均≤500行。已查看正式页面编辑提示截图。
- 快照Build/OfficeWebWalkBuild20260929，备份backups/walk-build-20260929，证据Build/walk-build-production-evidence.json。

## 2026-09-29 场景内旋转轴按键提示

- 按用户纠正，将Q/R、X、Z提示从底部移至预览部件周围的三色旋转环；标签朝向镜头、选取上侧弧段，随部件与视角更新。
- 环与标签遵守深度遮挡，不参与拾取；漫游/移出/取消时隐藏，释放时回收纹理和几何。底部仅保留行走、安装等通用操作。
- 正式main-D1XQ0Iic.js，9个前端文件公网SHA256一致；无后端重启或存档修改。
- 本地及正式页面旋转/翻转、W行走、保存刷新、取消隐藏通过；双柱搭接回归、紧凑工具栏、构建与90项资源一致性通过。
- 快照Build/OfficeWebAxisHints20260929；备份backups/axis-hints-20260929；证据Build/axis-hints-production-evidence.json。

## 2026-09-29 部件移动与旋转手柄

- 移动模式点部件后原位选中，显示三轴箭头与旋转环；鼠标拖箭头位移，拖圆环旋转，松手保存，拖动中Esc取消。WASD行走和键盘旋转保留。
- 位移0.25米吸附、旋转90度；旋转围绕真实包围盒中心，恢复为已支持的三轴离散朝向与底部坐标。原有自由悬挑/地下规则不变。
- 拖动期间锁定OrbitControls；保存失败恢复原位置，旧版本冲突保留服务端校验，退出时恢复原部件并回收预览。
- 去掉自由旋转球/多轴平面，保留单轴手柄；文字贴近物件，按视距缩放，深度遮挡保持。
- 327项Node测试、构建和90项公共资产一致性通过；真实鼠标位移、圆环旋转、Esc取消及失败回退通过。并行测试的转译输出改为进程独立目录，避免半写模块竞态。
- 正式main-BrCaZsU_.js，9个前端文件公网SHA256一致；前端发布，无后端重启或数据覆盖。
- 快照Build/OfficeWebMoveHandle20260929，备份backups/move-handle-20260929，证据Build/move-handle-production-evidence.json。
- 正式资源完整页面鼠标手柄交互、旋转、取消、失败回退及保存刷新验收通过，业务API隔离；已查看Build/move-handle-live.png。

## 2026-09-29 手柄步长与接触吸附修正

- 根因：TransformControls按物件包围盒中心吸附0.25m，中心不在网格上的薄板/家具产生半格偏移；原手柄没有接触面吸附。
- 关闭内置中心吸附，改为相对已保存原点计算位移，每格0.05m；Shift为0.01m并关闭磁吸。未拖动不跳位，未选中轴不变。
- 仅在其他两轴实际重叠/接触时，沿拖动轴按真实碰撞片边缘0.075m内磁吸；圆拱/门洞不填实心区域；接触面高亮复用安装标记。
- 新增4项测试覆盖薄地板半高偏移、非网格原点、毫米墙面/桌面、地下、Shift脱离吸附及空门洞；全部通过。
- 正式页面鼠标验证5cm步长、Shift 1cm、保存、取消、旋转及失败回退通过；业务API隔离。
- 正式main-DGjUOf9D.js，9个前端文件公网SHA256一致；构建及90项资产一致性通过，无后端或存档改动。
- 快照Build/OfficeWebMoveSnap20260929，备份backups/move-snap-20260929，证据Build/move-snap-production-evidence.json。

## 2026-09-29 Shift多选整组移动

- 移动模式Shift点击追加/取消部件；普通点击重新单选，空白点击清除，Shift点击空白保留。选中轮廓与组中心手柄，拖动保持所有相对位置。
- 多选状态仅显示位移手柄；单选旋转保留。Shift点击是多选，Shift拖动是1cm微调。
- moveMany整组校验、一次落盘/修订号；任一版本冲突/越界则整组拒绝；占用座椅检查覆盖全部选择。Ctrl+Z/重做按组回退，并更新前序单件历史版本。
- 333项Node测试、构建与90项公共资源一致性通过；正式资源浏览器Shift增减、两柱同位移、整组撤销、原单件旋转/失败回退通过，业务API隔离。
- 正式main-ByNXYGlc.js，9个前端公网SHA256与build-store.mjs/build-http.mjs远端SHA256一致，服务active；用户存档保留。
- 快照Build/OfficeWebMultiMove20260929，备份backups/multi-move-20260929，证据Build/multi-move-production-evidence.json；已查看Build/multi-move-live.png。

## 2026-09-29 取消贴面自动旋转

- 删除buildSurface按墙面法线追加朝向的逻辑；fitToSurface只改位置，rotation/pitch/roll完全保留用户值。
- 浏览器覆盖四面墙×三轴四档组合共256种朝向，均不改变输入角度；边缘贴合、遮挡与双柱搭接通过；完整手柄/多选回归通过。
- 正式页面从背面墙安装相框仍保持rotation=0，保存刷新通过（原逻辑会改成2）；业务API隔离。
- 正式main-CtQadxTi.js，9个公网文件SHA256一致；构建与90项资源一致性通过。仅前端发布，无后端/存档更改。
- 快照Build/OfficeWebManualRotation20260929，备份backups/manual-rotation-20260929，证据Build/manual-rotation-production-evidence.json。

## 2026-09-29 狭窄顶面拾取与空白落点修正

- 新增14屏幕像素范围内真实碰撞片顶边辅助吸附，优先于双支撑推断；保留近处遮挡检查和用户三轴朝向。顶面法线改用世界坐标，覆盖翻转部件。
- 空白近水平射线不再投射到极远平面；无有效交点时隐藏预览，提示指向实体或地面。
- build-top、build-gap、build-surface、build-experience浏览器回归通过；覆盖柱顶边缘偏入空隙、翻转、地下、近处遮挡、手柄与多选。
- 正式资源完整页面鼠标柱顶安装、服务端校验、保存刷新通过（业务API隔离）；横梁y=3、rotation=0，已查看Build/top-edge-app-live.png。
- 正式main-Pqjb8bmi.js，9个前端文件公网SHA256一致；构建与90项公共资产一致性通过。仅前端发布，无后端重启或存档覆盖。
- 快照Build/OfficeWebTopEdge20260929，备份backups/top-edge-20260929，证据Build/top-edge-production-evidence.json。


## 2026-09-29 C键四底边接点

- C循环自动、底边1、底边2、底边3、底边4、中心；四条底边中点可作为放置接点，跟随当前朝向，保持手动三轴角度。
- 选中底边金色高亮，图内显示C及当前接点，遵守实体遮挡；指定边时地板自动续铺不再覆盖接点位置。
- 1024组部件/三轴朝向/底边落点检查通过，含等宽翻转的浮点稳定性；柱顶吸附、双柱安装、完整编辑体验回归通过。
- 正式资源实际键盘C六档循环、图内提示和角度保持验证通过，业务API隔离；构建与90项公共资源一致性通过，改动文件均小于500行。
- 正式main-pQjz6C0A.js，9个公网文件SHA256一致；仅前端发布，后端和用户存档不变。
- 快照Build/OfficeWebFourEdges20260929，备份backups/four-edges-20260929，证据Build/four-edges-production-evidence.json。


## 2026-09-29 四底边侧贴高度网格修复

- 根因：指定底边侧面安装绕过高度网格，直接使用命中点y，造成厘米级错层；改为0.25m高度网格，附近真实上下边可精确对齐。保持顶面实际高度、手动高度及地下高度。
- 四边正负高度扰动、相邻地板齐平、非网格真实顶面及手动高度回归通过；既有1024组四边朝向检查、柱顶拾取通过。构建及90项公共资源一致性通过。
- 正式页面鼠标命中1.04m侧面，地板保存y=1，刷新重载验证通过；业务API隔离，不改已有错层存档。
- 正式main-Dm7UQly_.js，9个公网文件SHA256一致；仅前端发布，无后端重启。
- 快照Build/OfficeWebHeightGrid20260929，备份backups/height-grid-20260929，证据Build/height-grid-production-evidence.json。


## 2026-09-29 旧楼梯错层存档修复

- 只读核对正式53件场景，发现三段楼梯旧高度5.516/6.242/7.003米；分别修正为5.5/6.25/7米。
- 停止服务后备份，校验各部件版本及坐标，原子保存并恢复服务active；重新下载逐字段核对，仅三项y、各自version及全局revision改变，其他部件与宝箱不变。网站可访问。
- 备份backups/height-repair-20260929-212117，证据Build/height-repair-evidence.json。未发布新前端。


## 2026-09-29 移动选中部件改色

- 移动模式底部常驻色板，选中同步当前颜色，点击直接保存；单件/多选均支持，位置与朝向不变，复用版本校验及撤销历史。
- 正式页面鼠标单选改色、撤销、多选统一改色、后续拖动回归通过（API隔离）；构建和90项公共资产一致性通过。
- 正式main-CgHdfkEX.js，9个公网文件SHA256一致；快照Build/OfficeWebMoveColor20260929，备份backups/move-color-20260929。
- 仅前端发布，12米上限仍然保留。取消地上上限的后端发布被自动审批拒绝，等待用户明确授权；代码备份在Build/PendingHighStairs，未部署。

## 2026-09-29 用户明确授权解除空间边界

- 取消前后端12米建造高度及人物同步截断，移除600件非地板上限；镜头距离改为Infinity，远裁切面/雾随视距调整并启用对数深度缓冲。保留有限数值、毫米精度、存档容量及原通话工位保护。
- 22项存档/移动/寻路测试通过，覆盖高处同步、1000米保存及超过600件。正式前端13米楼梯安装保存刷新与改色移动回归通过，业务API隔离。
- 正式main-86NeyVua.js，公网资源哈希一致；构建和90项公共资源一致性通过。后端精确修改build-store.mjs/server.mjs规则并备份重启，服务active；用户场景不覆盖。
- 快照Build/OfficeWebHighStairs20260929，备份backups/high-stairs-20260929，证据Build/high-stairs-production-evidence.json及Build/high-stairs-backend-evidence.txt。

## 2026-09-29 自建工位参与选座

- 自建desk使用稳定数字编号加入原有永久工位认领、成员列表、共享屏幕及管理员释放。新增运行数据build-world.json.seats.json，禁止部署覆盖；原始场景/账号/归属文件保留。
- 已被认领或正在坐人的工位不能移动拆除；普通椅子和沙发仍为临时坐位。高处及地下座位携带chair/stand.y，入座起身不回地面；翻倒工位不能认领。
- 336项Node测试通过；真实页面点击高处自建椅子认领、13.25米坐下/起身、显示器生成、占用时拆除拒绝通过。正式前端资源配合隔离后端再次验证并查看Build/built-seat-live.png。
- 正式main-B8UBKvDH.js，9个公网文件SHA256一致；后端server.mjs、admin.mjs、build-http.mjs、build-workstations.mjs核对差异后备份发布，哈希一致、服务active。构建及90项公共资产一致性通过。
- 快照Build/OfficeWebBuiltSeats20260929，备份backups/built-seats-20260929，证据Build/built-seats-production-evidence.json及Build/built-seats-backend-evidence.json。

## 2026-09-29 删除底部两行提示

- 移除build-shortcuts和build-help及对应样式；消除动态提示出现/消失改变底部定位工具栏高度的问题，保留三维轴提示。
- 构建及90项公共资源一致性通过；正式页面反复悬停工具栏包围框不变，改色/旋转/多选/撤销回归通过，业务API隔离。
- 正式main-eUb-WZpP.js、main-GuCGzSDG.css，9个公网文件SHA256一致；仅前端发布。
- 快照Build/OfficeWebStableToolbar20260929，备份backups/stable-toolbar-20260929，证据Build/stable-toolbar-production-evidence.json。

## 2026-09-29 楼梯、屋顶与飘旗

- 新增窄/高/窄高楼梯、双坡屋顶、飘旗屋顶，共67件；基础Box无倒角，踏步高0.25米，旗面装饰动画不参与碰撞。
- 尺寸/旋转/持久化及楼梯上下行走测试通过；正式资源五件安装、保存刷新、旗帜动画验证通过，业务API隔离。Blender可编辑库及GLB同步，旧库备份Build/BoxWorldBeforeArchitecture20260929。
- 正式main-BOnpPaH_.js，9个公网文件SHA256一致；只更新后端build-catalog.json并备份重启，服务active，目录哈希一致；未覆盖任何场景和座位归属存档。
- 快照Build/OfficeWebArchitecture20260929，证据Build/architecture-production-evidence.json及Build/architecture-catalog-evidence.json。



## 2026-10-10 任务栏会议入口与客户端0.1.38

- 正式前端已发布：main-B6_OlKgN.js、dock-BjVUdcQv.js；deploy-web.cjs --upload --verify 确认逐文件一致，两个入口及其脚本、样式公网200与本地SHA256一致。未变更后端。
- 安装器0.1.38已发布到download并更新latest.json，101726263字节，SHA256 35afbbe8cb978a97b5cd8aafa09468cd0d6cffdbf63acff57d513a8e2bd3322d；publish:update --verify full从公网下载整包核对通过。
- 功能：头像气泡“发起会议”小窗；入会后分享/静音按钮；既有会议视频经白名单IPC在任务栏气泡持续播放并保持展开，最大化/全屏接既有查看器。需要更新客户端以获得新IPC。
- 验证：Web395项、桌面159项全量通过，追加位置回归通过；原头像条浏览器回归、新会议编码解码播放回归、真实Electron两个受信渲染器的preload/IPC视频与命令链路通过。真正跨设备的音频和桌面捕获仍需实际用户联调；用户暂缓的全屏旧问题记录在TODO。

## 2026-10-11 会议气泡按钮与输入修复（0.1.39）

- 共享气泡移除重复会议/呼叫/分享入口，仅在视频内保留与私人通话共用的最大化/全屏按钮；方块尾部改为贴边小三角。
- 修复desktop-dock-preload漏转hitRegions导致按钮穿透。真实Electron回归经过生产preload/IPC，验证Windows WS_EX_TRANSPARENT在按钮上关闭、透明背景开启，两个鼠标点击命令均抵达主窗口。
- 22项相关Web单测、160项桌面单测、构建、会议视频浏览器回归、ScreenStage及真实私人通话面板回归通过；修补过时私聊测试夹具缺少callAlerts/accountId的字段。
- 正式前端main-DsKk5E4N.js与dock-DZyyqG8b.js等资源上传后公网SHA256一致。客户端0.1.39已发布，安装器101727280字节，SHA256 bdded05d4959f2d65fe39b5a33fb7ad5faf2afd5d6e1410edbaffca8b7775c55；公网整包校验及latest.json版本核验通过。未修改后端。

## 2026-10-11 任务栏会议采集授权修复（0.1.40）

- 复现截图错误：主页面同参数采集成功，任务栏IPC触发时因userGesture=false被权限层拒绝，Electron报Invalid capture constraints。由受信meeting-share命令向接收主窗口提供5秒内单次采集授权，保留来源、框架和窗口校验。
- 161项桌面全量及追加权限回归通过；真实Electron生产preload/IPC/权限流程使用合成WebFrameMain成功采集有效尺寸视频，无麦克风或用户桌面采集；未经再次点击的重复调用被拒绝。
- 0.1.40安装器已发布，101726308字节，SHA256 d441b292e941e28d97e74020c1ecdf7e2374bafdfed2032ae07bac1ce4d8d26b，公网整包校验及latest.json核验通过。此次仅客户端更新，无前端或后端部署。

## 2026-10-11 会议常驻操作与任务栏角色邀请（0.1.41）

- 会议面板新增离开/结束及确认，结束限定主持人；入会后自动常驻，只能折叠为小三角。邀请复用角色招手和接听/拒绝，显示发起者姓名，处理或撤回后清理，默认静音接听。
- 408项Web、162项桌面单测通过；浏览器覆盖角色邀请、折叠展开、权限、离会/结束命令以及持续视频回归；真实Electron生产preload/IPC验证邀请接听、面板操作、视频、输入命中与清理。未修改服务端协议。
- 正式前端main-DuKA8Evb.js、dock-CVHVejIa.js及依赖逐文件上传并公网校验一致。安装器0.1.41已发布，101727646字节，SHA256 75b4d3f16788924f31fef4bb07e21159c22463f458d28614382365d16fb1c60e，整包下载校验及latest.json版本核验通过。

## 2026-10-11 会议成员状态与预览误触修复（0.1.42）

- 会议小窗改为成员列表，已加入对号、等待加入时钟，实时同步状态；清除发起会议前的头像悬停并增加220ms停留门槛，离开预览取消待完成的观看计时。
- Web408项、桌面162项全量单测、构建、原头像条及会议两组浏览器回归通过。真实Electron验证生产IPC成员白名单、入会状态显示、视频、按钮命中、折叠和会议命令。
- 正式前端main-BZpfJDyf.js、dock-BT6Jq6CT.js及依赖上传后公网逐文件SHA256一致。客户端0.1.42安装器已发布，SHA256 13c5614647be1fbb739f94d53e6fffa6a0999644a52a26781486047d4d5934c9，整包下载及latest.json核验通过。未修改后端。源码未提交或推送。
## 2026-10-12 头像状态（0.1.44）

- 自己头像单击/右键显示加状态入口；主窗口编辑40字状态，头像上方公示，支持修改和清除。详见 `Design/Avatar-Status.md`。
- 正式前端 main-Dy58X9_0.js / dock-DGwqqT-W.js，16项文件审计一致及公网SHA256核验通过。后端只更新server.mjs三处接线和presence-status.mjs，服务active。
- 新运行数据presence-status.json不得部署覆盖。此次未修改世界、账号或工位存档；旧程序及入口备份在officeweb/backups/presence-status-20261012/。
- Web415项、桌面164项测试、构建、90项公共资产、浏览器状态及原头像/会议回归、隐藏Electron生产IPC检查通过。正式接口鉴权及生产资源UI验证通过，未发布测试状态。
- 客户端0.1.44：101727319字节，SHA256 211a40cb3857ff1b4a1beff1166ec773ed55109cff81afd79468945316bb4c8e，公网整包核对通过、latest.json一致。需要升级客户端才能使用新命令与状态字段。源码未提交或推送。

## 2026-10-12 状态字号与右键直接清除（0.1.45）

- 状态气泡文字从10px微调至11px；自己的头像菜单直接清除状态，不弹编辑器或唤起主窗口。清除失败保留内容并在菜单提示。
- 39项相关Web测试、164项桌面测试、浏览器清除/失败重试与隐藏Electron生产IPC检查通过；构建及90项公共资产一致性通过。正式main-BdTBefzY.js / dock-DBTrGRs4.js等16项文件审计、公网哈希和生产资源交互验证通过。未修改后端或存档。
- 0.1.45安装包101727014字节，SHA256 adc75e838346e4eff00c6cdaba4bfd88c9f584723979482d3dcbb12ebbdb8397；公网整包校验、latest.json版本及ASAR桥源码核对通过。旧入口与清单备份officeweb/backups/status-clear-20261012/。直接清除需升级客户端。

