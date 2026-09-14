# OfficeWeb 部署（VPS 115.159.43.237）

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
