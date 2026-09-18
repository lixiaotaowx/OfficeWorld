# 项目规则

## 单文件行数上限（用户要求，2026-09-09）

- 每个文件不得超过 **500 行**。
- 按物理行计算，空行和注释也计入，不只计算有效代码行。
- 创建或修改文件后检查行数，提交或交付前再次检查。
- 接近上限时，按职责拆分为多个清晰的模块。
- 禁止通过压缩、拼接大量语句到同一行来规避限制。
- 不得自行给生成的文本文件、配置、文档或参考代码设立例外。
- 二进制模型、贴图和压缩包没有文本行数，不作文本行数计算。

### 唯一例外：npm 锁文件（2026-09-14 用户确认）

- `package-lock.json` 是本规则**唯一**的例外。npm 只认包根目录下单个锁文件，
  无法按行拆分：`npm-shrinkwrap.json` 与 npm workspaces 同样只生成一份根锁文件，
  当前为 lockfileVersion 3、168 个包条目、2165 行。
- 该例外**仅**适用于 npm 生成的锁文件。`src/`、`test/`、脚本、配置、文档等
  一切由我们编写的文本仍必须 ≤500 行，不得据此扩大例外范围。
- 若将来改用其他包管理器、把依赖拆到子包，或锁文件不再由 npm 生成，需重新评估。
- 除锁文件外，当前最长的文件为 `src/OfficeScene.tsx`（460 行）、`src/media.ts`
  （454 行）、`server.mjs`（441 行）；接近上限时按职责拆分，不靠压缩规避。

## 身份：成员 / 访客（2026-09-14 用户要求）

- 进软件（注册或登录后）必须先选身份，两个选项：**iruler 成员**、**访问人（客户）**；选择写入账号（`/api/auth/role`，字段 `role`），之后自动记住，不再重复询问。
  - 界面上叫「iruler 成员」（2026-09-14 用户改名，原为「iruler 员工」）；**协议与存储里的取值仍是 `employee` / `visitor`，不要跟着改**，否则已有账号的身份会丢。
- **访客**：进空间就**自动安排到公共区沙发**（服务端 `sitting.freeSofa` 选空位，客户端走过去坐下）；**不占普通工位**（`seat` 认领会拒绝）；**永不广播低分辨率工位预览**（客户端不采集 + 服务端 `ambient-sharing`/`preview` 双重拒绝）。其余功能与成员一致：会议、私聊、语音、以及在通话/会议中**高清共享自己的屏幕**。
- **成员**：工位与低清预览按原规则（见下节）；没有工位时按原流程显示选座提示（先选角色，再点场景里的椅子）。
- **访客不出现选座提示**（2026-09-15 用户要求）：`App.tsx` 的 `showPicker` 增加 `!isVisitor`，访客不再看到「点击场景里你想坐的椅子」；底部身份栏显示「公共区沙发」，设置里显示「我的座位：公共区沙发」且没有「去选工位 / 重新选座」按钮。服务端本来就会拒绝访客认领工位，这只是把不该出现的入口去掉。
- **访客不接收公共聊天，私聊照常**（2026-09-15 用户要求）：公共频道 = 无 `recipientId` 的消息。`chat-access.mjs` 的 `publishChat` 只把公共消息发给成员；`canReadChat(row, accountId, visitor)` 让访客读不到公共历史（`chat-store.page(after, accountId, visitor)` 透传）；`chat-server.mjs` 的 `chat-history` 按身份过滤、`chat` 拒绝访客发公共消息（"访客不能发公共聊天，请私聊同事"）；`chat-files.mjs` 同规则拒绝访客的公共文件，附件下载对公共文件返回 403。客户端 `ChatInbox` 新增 `visitor` 属性，访客的会话列表不渲染「公共聊天」。**私聊完全不受影响**：文字、文件、历史、未读都照旧。
- **名字包含「文杰」**（如 李文杰）→ 进空间**直接坐进老板工位**（服务端 `BOSS_SEAT = 8`，对应 `src/seats.ts` 里 id 为 `Manager`、标签"老板工位"的那一行），并按普通认领**落盘**，重启后仍归他。**只是座位规则**：老板在预览上没有例外（2026-09-15 用户："别什么都老板例外搞得太复杂"），预览只按成员/访客身份判定。
- **访客可以打电话，也能被打电话**（2026-09-15 用户报障"无法给访客打电话"）：访客没有工位，而右侧详情卡原来只跟着**选中的工位**走（`onlinePerson = people.find(p => p.seat === selected)`），所以访客根本没有入口。现在 `SidePanel` 的卡片跟着**被点中的人**走：`focused`（`focusedPerson` 对应的在线成员/访客）优先，其次是该工位的人，并显示「访客 · 在公共区沙发」小标与提示「点上面的按钮即可通话」；三个动作（请求观看对方屏幕 / 分享我的屏幕给对方 / 邀请语音）在目标是别人时都可用。服务端本来就与身份无关（`privateSessions.mjs` 只检查双方在线、不是自己、kind 合法），测试见 `test/roles.test.mjs`「成员可以给访客打电话，访客也能反过来邀请成员」。

## 共享屏幕与标注（2026-09-15 用户报障后修订）

- **只有桌面客户端能"被标注"**（2026-09-15 用户要求：识别对方是网页登录而不是客户端，避免在网页用户屏幕上画）：加入空间时每个客户端上报 `annotate`（`useOffice` 的 join 载荷：EXE 里 `window.officeDesktop.annotations` 存在 → true，浏览器 → false），服务端 `server.mjs` 存进 `person` 并随 `people` 广播；通话面板只对"**正在共享屏幕的那个人** `annotate === true`"渲染标注工具 —— `ScreenStage` 的 `annotatable={false}` 时连「标注」按钮都不出现（撤销/清空同样不给）。理由是浏览器**没有**任何办法把内容画到操作系统桌面上，给入口只会让人以为"画了却没显示"。
  - 已知边界：判定的是**客户端能力**。EXE 用户如果共享的是**单个窗口**，桌面浮层同样挂不上（`reason: 'window-share'`，会有一句提示），此时笔迹只会出现在共享画面里、不会落到他桌面上。
  - 反方向（让网页分享也能被标注，靠查看端把笔迹盖在画面上）**没有做**：2026-09-15 讨论后放弃了那版半成品，相关代码已全部移除（`ink-layer` 事件、客户端笔迹板、`localInk`/`board` 属性都不存在），不要以"半成品"形式留在树里。
- **`annotations` 那个 `useMemo` 必须建在 `socket`/`media` 两个 `useRef` 之后**：工厂函数会**立即执行**并读取这两个 ref，放前面会让构建产物在页面加载时抛 `ReferenceError: Cannot access '_e' before initialization`，整页白屏（2026-09-15 实测并修复）。

- **整屏（全屏）必须随视频一起结束**（用户："屏幕全屏时挂断软件也全屏了无法退出全屏，视频全屏不要影响软件"）：`ScreenStage` 卸载时（挂断、对方停止共享、退出会议、关闭放大视图）若整屏模式是本组件请求的，必须 `officeDesktop.setFullscreen(false)`；DOM 全屏同理 `exitFullscreen()`；Esc 也退出。桌面端 `chrome.cjs` 在页面导航（重载）时同样退出全屏——否则标题栏被 `html.iruler-fullscreen #iruler-desktop-chrome { display:none }` 隐藏，最大化按钮消失且没有出路。`applyFullscreenState` 退出时按窗口真实状态决定 `iruler-maximized`，避免最大化窗口被误判成非最大化而出现圆角。
- **标注中继绝不丢点**（用户："画笔断开"）：`collab-annotations.mjs` 的 40ms 限速改为**排队补发**（`queued` + `setTimeout`），不再 `return` 丢弃；`done` 只在最后一批点之后发送；单 socket 队列上限 512 点；`annotate-clear`/`annotate-undo` 与断线都会清空队列。
- **本机即时回显**（用户："延迟严重"）：笔迹要经过 指针 → socket → 分享者桌面浮层 → 采集 → 视频 才回来，正常几百毫秒。`ScreenStage` 因此在本机画布 `.screen-stage-ink` 上立即回显自己正在画的笔画（同坐标、同颜色 `colorFor(accountId)`），`ECHO_MS=1400ms` 后交还给画面里的真迹，避免双份墨迹；撤销/清空会同时清掉回显。
- **映射按"画面框"换算，不按元素框**：坐标一律相对 `<video>`（`object-fit: contain` 的 letterbox 内框）归一化到 0..1，测量基准是 **video 元素自身**的矩形而不是绘制层；首帧未到时（`videoWidth=0`）退回元素框，避免第一笔被丢掉。`test/browser/screen-stage.cjs` 在 420×700 与 1280×720 两种窗口比例下校验落点命中 0.25/0.75。桌面浮层由主进程保证窗口内容区**恰好等于被共享显示器**（`place()` 先比较再 `setBounds`，页面加载完成后与 `display-metrics-changed` 时重新贴合），所以各种分辨率/缩放下 0..1 都对应同一位置。

## 屏幕共享的清晰度（2026-09-15 用户报障后修订）

- 报障（用户）：「视频接通后需要等待很久才变清晰…另外会有突然变糊的情况也改善一下」。
- **根因**：LiveKit 对 1080p 屏幕共享默认发**三层 simulcast**（`computeVideoEncodings` 里 `screenShareSimulcastLayers` 未设时给 `[low, mid, original]`），对端先订阅低层、等带宽估计升上来才变清晰，任何一次抖动又切回低层 = "突然变糊"；默认目标码率只有 2.5 Mbps，而 `x-google-start-bitrate` 取目标的 90%，目标小就爬坡十几秒。
- **现在的设置（不要随手改回默认）**：`mediaRooms.ts` 的 Room 里 `publishDefaults.screenShareSimulcastLayers: [ScreenSharePresets.h720fps15]` —— **一个 preset ⇒ 正好两层**（`presets.length === 1` 走 `[low, original]`）：720p@15 1.5 Mbps 垫底 + 1080p@15 5 Mbps 顶层，总上行约 6.5 Mbps。另有 `screenShareEncoding: { maxBitrate: 5_000_000, maxFramerate: 15 }`（目标码率定高，`x-google-start-bitrate` 才会高）；采集时 `contentHint = 'text'`（`screenSwitch.ts` 的 `captureSelectedScreen()`，会议走 `createScreenTracks({ contentHint: 'text' })`）；屏幕轨的 `degradationPreference` 由 LiveKit 默认给 `maintain-resolution`（掉帧不掉清晰度）。`media.ts` 的私聊采集必须复用 `captureSelectedScreen()`，别在别处另起一套 `getDisplayMedia`（`test/screen-quality.test.mjs` 有断言守着）。
- **层数不等于清晰度开关**（2026-09-15 用户追问「为什么不能还是三层把速度提快，非要写死吗」）：看的人拿哪一层由 **LiveKit 服务器**按**接收端带宽估计**决定，页面里只能"声明我要最高层"（我们已 `adaptiveStream: false` ⇒ `VideoQuality.HIGH`），**没有任何开关能命令它立刻给顶层**。所以做法是：把垫底层做成**看得清的 720p**（而不是默认那种很小的 q 层）+ 顶层码率给足，这样"升层"几乎看不出来，抖动最多掉到 720p 或掉帧，不会糊成一团。
- **服务器侧（改的是 VPS，不是仓库）**：`/etc/livekit/livekit.yaml` 的 `rtc.congestion_control` 加了 `use_send_side_bwe: true`（按发送端带宽估计选层，比 SFU 探测接收端更快；字段路径与 livekit v1.8.4 的 `pkg/config/config.go` 核对过）。回滚点 `/etc/livekit/livekit.yaml.bak-20260915-bwe`；改完 `systemctl restart livekit` → active，TURN 55000 与 7880 都在听，API 用 `Build/livekit-api-check.mjs` 验过（listRooms 正常）。这个实例和另一个应用共用，用户已明确同意"直接更新，不用管别人"。

## 切换共享/预览用的屏幕（2026-09-15 用户要求）

- 需求（用户）：「右键自己显示会切换屏幕…在屏幕会议和视频聊天中可以切换屏分享的屏幕也是实时变化过去，除了右键屏幕，右键成员列表中的自己也可以」。
- **两个入口、一个菜单**：画面里右键自己的显示器（`monitorContext.ts` → `App` 的 `screenMenu`）和成员列表里右键自己那一行（`SidePanel` 的 `.seat-grid .seat.mine` / 自己那条访客）打开的都是 `MonitorContextMenu`；菜单状态住在 `App.tsx`，`OfficeScene` 只负责把点击坐标交上去。**只有客户端才有这块菜单**（浏览器没有可切换的物理屏幕，`window.officeDesktop` 不存在时右键走原生菜单）。
- **换屏 = 重新采集 + 原地换轨**（`src/screenSwitch.ts`）：桌面端 `permissions.cjs` 的 `setDisplayMediaRequestHandler` 没有选择窗口，每次 `getDisplayMedia` 都跟着"当前选中的显示器"，所以换屏就是再采集一次；然后 `LocalTrack.replaceTrack()` 把**已发布的轨原地换掉**——不重协商、不断线、不用重新同意。`media.ts` 的 `switchScreenDisplay()` 先问会议（`meetingScreenShare.ts` 的 `switchDisplay()`），再换私聊那条；`useOffice` 监听 `office-display-changed` 触发。低清工位预览仍然由 `useDesktopPreview` 自己重抓一帧。
- 换轨时必须自己收尾：LiveKit 只 detach 旧轨、**不会停它**（`providedByUser` 被置 true），所以要显式 `previous.stop()`；换之前先把旧轨的 `onended` 清空，否则"主动停掉旧采集"会被当成"用户停止共享"而走 `stopScreen()`。低清缩略图循环已拆到 `src/screenThumbnails.ts`（300px / 6 秒 / JPEG 0.55）。
- 测试：`test/screen-switch.test.mjs`（原地换轨、每间一份克隆、共享已结束时收掉新采集）、`test/meeting-screen-switch.test.mjs`、`test/screen-thumbnails.test.mjs`、浏览器 `test/browser/screen-menu.cjs`；真实 Electron 授权链路由 `Build/screen-switch-capture-check.cjs` 覆盖（用合成显示器，不抓用户桌面）。

## 未接电话提示（2026-09-15 用户要求）

- 需求（用户）：「添加一个未接电话提示，明显一点的弹窗在程序右下角以及拨打时间30秒没人接就提示未接通，稍后重试」。
- **振铃 30 秒**：`privateSessions.mjs` 的 `ringMs = 30000`（`createOfficeServer({ inviteRingMs })` 可注入，测试用短值）。到点 `expire(invite, 'timeout')` 给双方发 `request-expired { id, reason }`，发起方另收 notice「未接通，稍后重试」。`reason` 现在是 `timeout | cancelled | answered`（`server.mjs` 断线清理发 `cancelled`）——**协议是 `{ id, reason }` 对象，不是裸 id**；客户端解析器要同时容忍旧的裸字符串（当 `cancelled`）。
- **弹窗只认 `timeout`**：`src/callAlertRules.ts` 的 `alertForExpiry` 是纯规则（我拨的 →「未接通，稍后重试」；别人拨给我的 →「未接来电」），取消/挂断/婉拒/已接听一律不弹，避免"自己取消也报未接"。视图 `src/CallAlerts.tsx` 固定在右下角（`.call-alerts`），带「再拨一次」「知道了」。窗口在托盘里看不见页面，所以 `officeNotifications.ts` 对 `timeout` 额外发一次桌面/系统通知。
- **一直显示，只能手动关**（2026-09-15 用户追加：「未接来电是否一直显示 只可以手动关闭」）：卡片**没有**任何自动消失的计时器（`CallAlerts.tsx` 里不许再出现 `setTimeout/setInterval`，`test/call-alerts.test.mjs` 有一条断言守着），点「知道了」或「再拨一次」才消失；堆叠上限 `MAX_CALL_ALERTS = 5`，用 `withCallAlert()` 追加（同一通电话只留一条、最新的在最后、超上限挤掉最旧的）。刷新页面不保留（要保留得另存本机，用户没要）。
- 规则与视图分离、服务器只发事实（`reason`），文案由客户端决定：新增原因值时不要改服务器文案，先想清楚"这个原因该不该弹"。

## 在座 / 离桌（2026-09-15 用户要求）

- 需求（用户）：「检测鼠标的移动和键盘的输入…如果在座就在头顶的名字卡片上显示一个绿点，在成员列表也展示一个绿点，如果离桌就显示红点，并记录离座时间分钟为单位，当触及小时，就用小时作为单位…最好是不更新客户端在网页解决」。
- **只在网页实现，不需要更新 EXE 就能上线**（EXE 加载的就是同一个站点）：`src/presenceInput.ts` 监听 `pointermove / pointerdown / keydown / wheel / touchstart`（capture + passive），`AWAY_AFTER_MS` 内没有任何输入算离桌（当前 **10 秒**）。**只发状态翻转**（`input-state { atDesk, idleMs }`），不要在每个鼠标事件里发消息；页面打开默认在座，`connect` 后重新声明一次（重连不能把人一直留在绿点）。
- **在别的软件里干活也算在座（2026-09-15 用户追问后补的）**：网页只能看见**发到本窗口**的输入，所以浏览器里"在 Word 里打字"确实会被判离桌——这是平台限制，除非用客户端。EXE 里换用 **Windows 全局空闲时间**：`desktop-bridge.cjs` 的 `office:system-idle`（`powerMonitor.getSystemIdleTime()` 秒 + `getSystemIdleState(1)` 的 `active/idle/locked`），`desktop-preload.cjs` 暴露 `systemIdle()`，`presenceInput.ts` 有 `desktopIdle` 时每 2 秒（`IDLE_POLL_MS`，要比阈值密）轮询一次：空闲秒数 < 阈值就算在座（本地 DOM 输入仍给即时反应），`locked` 立刻算离桌，轮询失败退回本页输入判定。**老 EXE 没有这个能力时自动退回纯 DOM 检测**，网页与客户端可以各自发版。
- **阈值 10 秒、时长只用一个单位（2026-09-15 用户追加）**：`AWAY_AFTER_MS = 10_000`（"不操作10秒就算是离座"）；`awayLabel` 是**秒 → 分钟 → 小时单一单位**：「离座 55 秒」→「离座 2 分钟」→「离座 1 小时」/「1.5 小时」（≥10 小时取整），**不要**拼成「1 小时 5 分钟」。客户端上报时带 `idleMs`（已经安静了多久），服务端 `input-presence.mjs` 的 `idleOf()` 用它**回拨离座起点**（夹在 0～24 小时），所以刚变红显示的是真实的「离座 10 秒」；桌面端 `IDLE_POLL_MS = 2 秒`，必须比阈值密。
- **离座时钟在服务端**（`input-presence.mjs`）：记 `awaySince`，广播 `atDesk` + `awayFor`（推送那刻已离座毫秒数），内部时间戳不外发；**缺字段一律算在座**（`person.atDesk !== false`），这样旧版客户端与检测不到输入的浏览器不会被误标红；只在翻转时 `publish()`。`server.mjs` 只是把 `people` 广播换成 `inputPresence.view()`。
- **时长文案**（`src/awayTime.ts`）：客户端用 `awayFor + (now - 收到 payload 的时刻)`，**不要比较双方时钟**；列表的 1 秒心跳只在有人离桌时才跑。
- 显示：头顶名字卡片（`nameTags.ts`）左侧一个点（`#3f9d4f` 在座 / `#cf4a38` 离桌，名字右移让开），`atDesk` 变了才重画 canvas；成员列表 `.seat-state` 绿/红 + `.away-label`「离座 N 秒 / N 分钟 / N 小时」，访客条与详情卡同样显示。
- **底部栏要显示"谁在判定"**（2026-09-17 用户报障「离座检测不管用 鼠标需要去到软件里面才行」后加）：`presenceInput.ts` 的 `usesSystemIdle()` + 纯函数 `deskSensorLabel()`，`useOffice` 暴露 `deskSensorLabel`，`App.tsx` 在「我的工位预览：…」旁边多一行「**离座检测：系统空闲（客户端）**」或「**离座检测：仅本窗口输入（浏览器）**」。这次报障的真因就是**本机装的客户端是 0.1.11**（asar 里既没有 `office:system-idle` 也没有 `systemIdle`），于是静默退回纯 DOM 判定 —— 以后先看这一行，不要靠猜。
- 边界：**浏览器**只看得见发到本窗口的输入，在别的程序里敲键盘仍会被判离桌（平台限制，网页层面无解）；**EXE ≥ 0.1.13** 才有 `powerMonitor` 系统空闲桥（0.1.11／0.1.12 装的都是旧版，会自动退回纯 DOM 判定，用户看到的现象就是"鼠标必须进软件"）。放宽阈值就改 `AWAY_AFTER_MS` 一个常量。`node Build/which-client.cjs` 可以直接对比"已安装的客户端"和"刚打出来的客户端"的 `version` 与 `system-idle` 支持。

## 应用内自动更新（2026-09-17 用户要求）

- 需求（用户）：「搞一个推送的功能 直接用命令推送到我的服务器安装器，然后网页检测到新版本就弹出更新软件的提示，然就是下载进度条，然后安装器打开覆盖安装」。
- **发布就一条命令**：`cd OfficeDesktop && npm run publish:update -- --notes "更新说明"`。`tools/publish-update.mjs` 取 `Build/OfficeDesktopRelease` 里与 `package.json` 版本一致的安装器 → 流式算 sha256/大小 → `scp` 到 VPS 的 `~/officeweb/dist/download/` → 生成并上传 `latest.json` → **从公网核验**（HEAD 大小、`Range: bytes=0-1048575` 前 1MB 哈希与本地一致且 `Accept-Ranges` 在、线上 `latest.json` 已是新版本）。`--verify full` 整包重下核对，`--dry-run` 只看动作，`--file` 指定别的安装器。**发版顺序：先 `npm run dist:all` 打包 → 再 publish**（脚本按版本号找文件，找不到会提示先打包）。
- **客户端侧（≥0.1.14）**：`OfficeDesktop/update.cjs` 用 Electron 的 `net.fetch`（走 Chromium 网络栈，自带会话证书处理）流式下载到 `%TEMP%\iruler-dream-update\`，每 250ms 通过 `office:update-progress` 推字节数/百分比；下完**校验 sha256**，不符/不完整就删文件报错；`office:update-install` 交 `shell.openPath` 打开安装器并 **1.2 秒后 `app.quit()`**——不退出，安装器覆盖不了正在运行的文件。安全边界：只允许 `trusted()` 的本站地址、路径必须落在更新目录内、>512MB 直接拒收；三个 handler 都过既有的可信来源门。
- **网页侧**：`src/updateRules.ts`（纯规则：`compareVersions` 按段比数字、`isNewerVersion`、`formatBytes`、`progressPercent`、`describeUpdate` 出文案）+ `src/useAppUpdate.ts`（读 `/download/latest.json?t=…`、问 `appVersion()`、订阅进度、「稍后」按版本记 localStorage、6 小时复查一次）+ `src/UpdatePrompt.tsx`（右下角卡片、`role=progressbar` 进度条、下载更新/立即安装/稍后）。
- **下完自动弹安装器**（2026-09-17 用户："然后安装器打开覆盖安装"）：`ready` 阶段**3 秒后自己调用 `installUpdate`**（`AUTO_INSTALL_SECONDS`），卡片同时给「立即安装 / 打开文件夹 / 稍后安装」；「打开文件夹」走 `office:update-reveal` → `shell.showItemInFolder`，别再让用户自己去找安装包。
- **老客户端（<0.1.14）走 `browser` 阶段：点一下就下载，不要再做引导**（用户历经三轮反馈：「旧客户端下载好了没有弹出文件夹」→ 做说明页 →「**你这个引导也更麻烦了，算了还是刚才那样吧，下载后让他自己去找吧**」）：
  - 查证过旧客户端（0.1.13）的能力边界：`main.cjs` 的 `setWindowOpenHandler` 把**非本站的 http(s)** 交给 `shell.openExternal`（系统浏览器），**其它 scheme 一律 deny**；preload 与 `dream:action` 都没有"打开文件夹/运行文件"。所以老客户端**不可能**自己安装，第一次必须人工双击——这一点改变不了。
  - 现在只做一件事：`window.open(安装包直链)` 直接开始下载；卡片就一行「已开始下载 0.1.16 安装包 · 下载完成后到系统的「下载」文件夹双击安装」+ 文件名与大小，按钮「重新下载 / 复制下载地址 / 稍后」。**不要再塞步骤说明、不要再跳到说明页**。
  - `public/download/index.html`（`https://115.159.43.237/download/`）仍然保留，作为**可以直接发给同事的直链**（页面上有三步说明），但客户端不再自动打开它；`static.mjs` 支持目录首页这条能力也是通用的。
- **老客户端照样弹提示**（没有 `appVersion`/`downloadUpdate` 时 `automatic=false`）。
- **`~/officeweb/dist/download/` 是部署产物，不是仓库内容**：重传前端时**不要** `scp -r` 或清空 `dist`，否则会把安装器删掉（一个约 100MB；服务器上会越攒越多，请留意磁盘，目前 0.1.14～0.1.16 三个约 290MB）。
- **底部栏显示「客户端 0.1.16」**（2026-09-17 随 0.1.15 起）：`useAppUpdate` 把 `appVersion()` 的结果作为 `currentVersion` 暴露给 `App.tsx`。上一轮"装的 0.1.11 却以为是最新"就是这么被误判的——以后先看底部栏这一行。
- **发布顺序**：改完代码 → `npm run dist:all`（OfficeDesktop）→ `npm run publish:update`（推送）→ 前端 `npm run build` 并上传。想让已经装了最新版的用户看到更新提示，必须**再发一版**（装的就是最新的自然不提示）；0.1.15 就是这么发的：0.1.14 的用户第一次就能完整看到"弹提示 → 进度条 → 覆盖安装"。
- 验证：`OfficeDesktop/test/update.test.cjs`（进度、写盘、校验失败删文件、下载不完整、体积上限、只信本站/目录内路径）、`test/publish-update.test.cjs`（参数、清单、哈希、默认安装器、服务器与密钥）；`OfficeWeb/test/update-rules.test.mjs`（版本比较、文案、约定字段）、`test/browser/update-prompt.cjs`（右下角、进度条宽度、按钮、老客户端文案）；真机网络自检 `Build/update-flow-check.cjs`（用真 Electron `net.fetch` 从正式站把已发布安装器下完并核对哈希，不运行安装器）。

## 任务栏头像条（dock，2026-09-17 用户要求）

- 需求（用户）：「贴 Windows 任务栏、永远置顶、无边框，锁定在任务栏的图标右侧…紧贴右侧托盘左边」+ 头像悬停看缩略图 + 卡片上三个按钮直接通话。设计与文件分工见 `../Design/Taskbar_Dock_20260917.md`。
- **铁律：小窗只做「显示 + 遥控」**。主窗口是唯一 socket 与媒体拥有者；服务器 `join` 会把同一 `clientId` 的旧 socket 踢掉（`server.mjs` 270-276 行），所以**小窗绝不能自己连 socket 或碰媒体**，否则会把主窗口顶下线、成员列表出现两个"我"。`test/dock-rules.test.mjs` 里有断言守着（`dock.tsx` 里不许出现 socket.io/useOffice/getDisplayMedia 等）。
- **窗口**：`dock-window.cjs`（无边框/透明/`alwaysOnTop('screen-saver')`/`skipTaskbar`/`focusable:false`/与主窗口同会话）+ `taskbar-position.cjs`（纯几何）。`dock.html` + `src/dock.tsx` 是独立入口，**不加载 three.js**（约 3KB）；主窗口用 `useDockBridge` 每秒推状态、悬停时把最近一帧交过去（**不需要新协议**）。
- **放置规则**：默认离屏幕右端 220 DIP（托盘宽度是估的，可拖动并记住偏移），头像条在任务栏里竖直居中；窗口比头像条高（悬停卡片的空间）、也比它宽（卡片宽度），**窗口右边缘与头像条右边缘对齐**，所以卡片永远在窗口内不被裁。任务栏在哪条边、多厚、自动隐藏都由 `bounds`/`workArea` 之差推断，每 2.5 秒复查。
- **必须跟着藏**：任务栏自动隐藏时藏（否则鼠标碰不到底边、任务栏再也弹不出来）、自己共享屏幕时藏（免得被一起共享出去）、窗口进全屏时藏；托盘菜单「显示任务栏头像条」可手动关。
- **点击穿透**：透明区域默认 `setIgnoreMouseEvents(true, { forward: true })`，页面用 `dockRules.dockInteractive()` 判断指针是否在头像条/卡片上，在才接管点击——不然会盖住别人钉在任务栏上的图标。
- **显示谁**：在线的人（去掉自己），排序 未接来电 → 未读 → 正在共享 → 在座 → 名字，最多 16 个；**访客/浏览器登录/没工位的人永远没有缩略图**（规则如此），卡片显示「此人不广播屏幕预览」。三个按钮走的是和右侧详情卡同一条邀请通道（看对方屏幕 / `offer:true` 分享我的 / 语音），点完主进程把办公室窗口抬到前面。

## 会议室墙面照片（2026-09-15 用户要求）

- 用户给了一张 AI 生成的"团队合影"（12 个角色在办公室里，豆包 AI 生成），要求**放到会议室墙上的画面里**。
- 模型里会议室墙面的"画"其实是那块演示屏：`Meeting / display surface`（three.js 名字 `Meeting__display_surface`，材质 `Display background`，纯深色无贴图），外框是另一个节点 `Meeting / presentation display`（材质 `Warm graphite`）。`src/meetingWallPhoto.ts` 落地这件事：
  - `findMeetingWallSurface`：按名字同时含 meeting/display/**surface** 定位（外框是 presentation display，不会被误选）。
  - **必须重做 UV**：那块面板的 UV 来自烘焙图集（u 只有 0.125–0.875，面板面只占其中一小块），直接用原 UV 贴照片只会显示一条窄带 —— `remapPanelUv` 按面板局部 x/y 范围重新生成 0..1 UV。
  - `texture.flipY = false`（glTF UV 原点在左上，three.js 默认翻转会让照片上下颠倒，实测确认）。
  - 材质用 `MeshStandardMaterial`（map + emissiveMap，emissiveIntensity 0.3）：房间偏暗，屏幕要像"亮着的画面"而不是一张海报。
- 照片资源：`public/assets/meeting-wall-photo.jpg`（1600×899、约 194 KB，由用户提供的 2732×1535 原图缩小，质量 82）。
- 测试：`test/browser/meeting-wall-photo.cjs`（断言面板存在、贴上照片且真的解码出 1600×899、材质名正确、外框材质未被换掉；并把相机对准墙面截图 `Build/meeting-wall-photo.png` 与面板特写 `Build/meeting-wall-panel.png` 供人眼核对）。为便于截图，`sceneProbe` 新增 `controls()`（仅 `?debug=1` 暴露）。

## 项目边界

- 本目录是独立的新网页项目，原协作软件只作为参考，不直接修改。
- UE 工程、用户 Blender 原稿和原始角色包保留在本目录外。
- 三维显示、通信、屏幕共享、语音和会议按职责拆分。
- 没有实际多人验证的功能，不得宣称已经联机可用。

## 服务器即最终呈现（用户只看部署站点，2026-09-11）

- 用户只看**部署到 VPS 的站点**：https://115.159.43.237/（部署细节见 `Design/Deployment.md`）；**不是**本地 127.0.0.1 上的任何东西。
- 本地运行方式已于 2026-09-14 按用户要求移除：`npm run server`（本地 3108）与 `npm run dev`（Vite 5188）两个脚本，以及 `vite.config.ts` 里仅供开发服务器使用的代理都已删除。不要再为「在本地 127.0.0.1 跑一遍」起服务、建流程或截图；验证在正式站或既有 QA 隧道（`127.0.0.1:3200`，见 `Design/Private_Call_AV_20260913.md`）上做。
- `start.mjs` / `server.mjs` 是**线上** systemd 入口，必须保留；Vite 仍是构建工具与浏览器测试内建服务器的来源，不要删依赖。
- 部署链路：本地 `npm run build` → 上传 `dist/` 与后端文件到 `ubuntu@115.159.43.237:~/officeweb/`；后端有改动再 `sudo systemctl restart officeweb`。完整命令见 `Design/Deployment.md`「重新部署」。
- **前端（`src/`、`public/`）改动必须重新构建并上传 `dist/` 才会上服务器；后端（`server.mjs`、`livekit.mjs`、`static.mjs`）改动必须上传并重启 `officeweb` 服务才生效。**
- 交付/汇报「界面可见」之前，先完成「构建 + 上传」，再在 https://115.159.43.237/ 上**普通刷新（F5 / Ctrl+R）**确认；**不要用 Ctrl+F5 硬刷新**——它绕过缓存重新下载 14.89MB 的办公室模型（2026-09-15 实测），而 `index.html` 是 no-cache、bundle 名带内容哈希、模型带 `?v=`，普通刷新就一定能拿到新版本。纯前端改动上传 `dist/` 即可（`static.mjs` 每次请求读盘），后端改动才需要 `systemctl restart officeweb`。不要以本地服务器为准。

## 服务器身份与交付核验（强化，2026-09-12）

- 唯一正式呈现目标是 `115.159.43.237`，部署账号是 `ubuntu`，工程目录是 `/home/ubuntu/officeweb`。
- 已验证私钥是 `C:/Users/Administrator/.ssh/id_ed25519_aiwb`（2026-09-12 登录成功）。SSH/SCP 显式指定此文件和 `IdentitiesOnly=yes`；不得再猜用 `id_ed25519_irulerdream`，也不要重复向用户索要已经记录的连接信息。完整命令见 `Design/Deployment.md`。
- `iruler-test` 是另一台 Windows 测试机，其 SSH 文档、账号和密钥不能直接作为本 VPS 的连接配置。
- 连接前核对本项目部署文档中的目标、账号及明确指定的凭据。`<key>` 是未填写的占位符，不是已确认的密钥配置；不能猜填或借用其他机器的密钥。
- 已有部署信息先查本项目文档；只有确实缺少或失效的连接信息才向用户说明具体缺项。不要再次询问已经明确的服务器地址。
- 上传前确认实际构建输出目录；若输出在 `Build/OfficeWeb`，上传该目录内容到远端 `dist`，不要误传旧的本地 `dist`。
- 模型、贴图、角色和坐姿同属网站更新范围。必须确认线上实际返回的新资源版本，并查看线上效果；本地导出或构建成功不等于上线。
- 部署失败时明确写“本地已完成，服务器未更新”，说明阻塞原因。未上传成功时，不得让用户靠刷新寻找新内容，也不能将旧资源误判为浏览器缓存问题。
- 保留已知凭据的安全边界：文档只记录确认过的路径或别名，不保存私钥内容；自动审批拒绝后不得绕过。

## 烘焙质量与性能（2026-09-12）

- 操作前阅读最新流程：`../Design/OfficeConcept/烘焙流程.md`；不得将历史初版低采样脚本当成正式流程直接执行。
- 正式烘焙采样不得低于 128；当前噪点修复采用 256。
- 必须对烘焙图像本身降噪；不能将 Cycles 的预览/最终渲染降噪开关当成烘焙输出已经降噪的证据。
- 优先使用颜色、反照率和法线引导降噪，检查实际输出文件以及场景近景。重点看地板、桌下阴影、墙面和椅面，同时保留砖缝、木纹、织物细节。
- 每个需要烘焙的物体单独智能展开 UV、单独烘焙；地板和主要桌面 2K，其他按需求用 1K、512、256。纯色细小零件、玻璃和特殊透明材质可免独立烘焙图。
- 全部烘焙完成前保持源材质参与光照，最后统一应用结果；保留备份和无损原图，网页只携带实际使用的压缩资源。

## 账号与专属工位（2026-09-13）

- 工位预览默认开启，前端加载期间不得误显示为关闭；用户可手动关闭。预览开启不代表绕过浏览器屏幕采集授权。
- 密码按用户要求允许 1–16 个字符，不设置 8 位最低长度；前后端校验与提示保持一致。
- 正式环境必须先注册或登录；身份以服务器验证的 HttpOnly 会话为准，禁止信任客户端任意 id/name。
- 姓名是唯一登录名，密码只保存加盐哈希。accounts.json、state.json 及备份不得提交、静态托管或覆盖部署。
- 工位绑定账号，离线、刷新和服务重启后仍显示主人姓名；抢座必须由服务器原子仲裁并成功持久化。
- **聊天会话列表＝在线的人 + 工位主人（含离线）+ 有实际聊天记录的人**（2026-09-15 用户要求，两轮修正）：会话列表**不再**按账号名册全量列出。`ChatInbox` 的目录由三端构成——`people`（当前在空间）、`seats`（**永久工位主人，离线也要在列表里**："工位上的人离线也要在列表中"）、本机消息记录（有往来的人，名字优先取名册里的最新名字）；名册（`chat-contacts`）只用于查名字和身份，不再自动占一行。被请出/隐藏的账号一律排除（`hidden`）。因此很久不上线、没工位、也没聊过的旧账号不会再出现。
- **管理员「请出」＝离开空间**（2026-09-15 用户要求，起因："已经踢了的人怎么还会在聊天里面"）：请出不再只是收回工位。`membership.mjs` 把该账号加入 `ejected`（**落盘 `ejected.json`，重启不会自动赦免**）——会话名册（`chat-contacts`）过滤掉他、`hidden` 名单随每次回包下发并用 `chat-directory` 推送给所有人（聊天会话列表立刻消失，不用等 30 秒周期同步）、`accounts.revokeSessions` 撤销其 Cookie 会话、所有相关 socket 断开。客户端收到 `kicked` 后回到登录页（**但不清除保存的账号**，重新登录只需点一下）。**重新登录即恢复为正常成员**（并落盘清除标记）；工位同时释放并落盘。其他同事的聊天行为不变（有往来的离线同事照旧可以留言）。
- 点击成员列表只移动相机到显示器前，不等于占座或获得高清屏幕权限。显示器文字必须朝正向，不被人物遮挡。
- 注册/登录/退出、换设备恢复、错误密码、并发抢座与拒绝冒充均须测试；隔离测试账号不得混入正式名册。

## 桌面自动登录与低清预览（2026-09-14）

- EXE恢复持久会话；网络失败按5–30秒间隔重试，首次成功登录用Electron safeStorage加密保存信息，不能明文保存密码。
- **桌面端必须记住账号密码**（2026-09-15 用户报障"客户端老是记不住用户账号和密码"修订）：保存的登录信息（`login.enc`）**只有主动退出登录才清除**。被别的设备顶下线（`session-replaced`）、Cookie 会话失效（`connect_error: 请先登录`）、被管理员请出，都**不能**清（这些原来都会 `clearLogin()`，而"在浏览器上登同一个账号"就会触发，于是 EXE 每次都忘）。这些情况下回到登录页要**从 `readLogin()` 把姓名和密码填回表单**（`office-session-ended` 的 detail 为 `{ message, forget }`，只有 `forget:true` 才清）。本机加密不可用时 `saveLogin` 返回 false，**也要允许登录**，只是这次记不住。设置里有「登录记忆：已保存／未保存」可直接确认。测试见 `test/browser/login-memory.cjs`。

- EXE登录且持有工位后自动采集所选物理屏幕的低清截图，**每6秒一张、最长边300**（2026-09-14 用户指定，取代原「每3秒/480」），默认主屏；右键自己的场景显示器切换并记住选择。
- 采集方式为**常驻低频流**（`OfficeDesktop/preview-capture.cjs`：一次性取源后保持 300px、低帧率的隐藏采集窗口，每帧只抓最新画面）。实测单帧开销从 552ms 降到约 3ms；旧的"每次重新枚举所有显示器"保留为回退路径，但不得再作为主路径。
- **有工位就一直采集**（2026-09-15 修订，取代 2026-09-14 的「没人在接收时完全不采集」）：桌面客户端在线且持有工位就持续采集，**自己一个人的时候自己的工位显示器也要有画面**，晚登录的同事立刻就能看到，不用等下一次启动。服务端仍逐个 socket 下发 `ambient { wanted }`（"除你之外还有没有人开着接收"），但客户端只把它当作状态提示（底部栏「我的工位预览：采集中（暂时没人看）」），**不再据此停采**。旧规则会让独自办公时屏幕空白——2026-09-15 用户报「还是没有出现屏幕预览」的原因就是它；常驻流单帧约 3ms，代价可忽略。**关闭自己的接收不会停止自己的上传**；断线、退出、访客身份仍会释放常驻流（`officeDesktop.setPreviewActive(false)`）。
  - **刷新间隔随焦点变**（2026-09-15 用户指定）：**焦点内 6 秒，焦点外（或窗口隐藏）12 秒**，回到焦点立刻补一帧。由 `src/previewGate.ts` 的 `previewIntervalMs(focused, visible)` 决定，`useDesktopPreview` 每次取帧后重新计算。最长边 300、JPEG 质量 55 不变。
  - **人不在电脑前时要停采，别挡息屏**（2026-09-17 用户要求：「离开就暂停采集 不要耽误息屏」）：实测 Windows 上"正在采集桌面"会让 Chromium 申请 **DISPLAY 常亮**（`powercfg /requests` 显示 `Native desktop capture`），屏幕于是永远不熄；**停止采集后该请求立刻消失**（`Build/capture-release-check.cjs` 验过）。所以 `OfficeDesktop/preview-idle.cjs` 的 `createPreviewIdleGate()`（阈值 `AWAY_PAUSE_SECONDS = 60`，读 `powerMonitor.getSystemIdleTime()`）在空闲跨过阈值时 `previewCapture.stop()`，`office:preview-frame` 暂停期间**直接返回 null**，人一回来下一次取帧自动重新附着。**阈值必须不大于系统关屏超时**；读不到空闲时间当 0（宁可继续采集也不莫名停掉预览）。共享屏幕是另一条采集（`getDisplayMedia`），不受影响、共享时屏幕仍然亮。网页侧只读 `office:preview-state`（`{ paused, idleSeconds, awayAfter, attached }`），状态行显示「我的工位预览：已暂停（你离开超过 1 分钟，屏幕才能熄灭）」。
  - 预览**没有身份例外**（2026-09-15 用户："别什么都老板例外搞得太复杂"）：只有成员广播，访客一律不广播；「文杰 → 老板工位」只是座位规则，不影响预览判定。原先的 `preview-policy.mjs` 已删除，服务端恢复成 `p.role !== "visitor"` 两处兜底。
- 底部栏常驻一行「我的工位预览：…」状态（`src/previewGate.ts` 的 `previewReason`），区分"浏览器需点「授权工位预览」/ 连接中 / 还没有工位 / 访客不广播 / 采集失败，重试中 / 采集中（暂时没人看）/ 采集中"——显示器空白时先看这行，不要靠猜。
- 小预览不调用getDisplayMedia、不弹选程序或自预览浮窗，不持续采集高清视频；不提供暂停工位预览按钮；在线且持有工位自动维持截图，断线/退出停止广播。
- **三维画面只在有焦点时刷新**（2026-09-14 用户指定）：`sceneLoop` 的 `unfocused` 模式不再出帧（此前是降到 10fps 继续画），并且改用 100ms 定时器而不是每帧 rAF；位置模拟继续跑，重新聚焦立刻恢复。**例外：本机正在高清共享屏幕时继续出帧**（否则看的人会看到冻结画面），由 `OfficeScene` 的 `keepRendering`（= `office.sharing`，即真正的高清屏幕共享）控制。**2026-09-15 修正**：工位低清预览**不再**让画面持续出帧（那是另一个 agent 早前把 `sharing` 换成 `desktopPreview.active` 造成的），焦点外仍保持冻结，只按 12 秒间隔抓帧。
- 他人工位预览开关仅控制接收：关闭时服务器不下发他人小屏幕，保留自己显示和上传；不得关联本机截图采集。
- ambient-sharing与高清sharing独立；高清接替、停止、退出会议不能清掉仍在运行的工位小预览。浏览器仍需原生屏幕权限。
