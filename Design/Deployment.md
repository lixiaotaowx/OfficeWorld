# OfficeWeb 部署（VPS 115.159.43.237）

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
