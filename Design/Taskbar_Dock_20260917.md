# 任务栏头像条（dock）

用户在 2026-09-17 的讨论里定下的方案（详见 `Design/Deployment.md` 当天条目）：
小窗只做「显示 + 遥控」，贴 Windows 任务栏、紧贴右侧托盘左边，悬停看工位缩略图，
卡片上三个按钮能直接发起通话。

## 铁律（有测试守着）

**小窗绝不自己连 socket、绝不碰媒体。** 主窗口是唯一的连接与媒体拥有者：服务器在 `join`
时会把同一个 `clientId` 的旧 socket 踢掉（`server.mjs` 第 270-276 行，提示「账号已在其他
窗口登录」），第二个窗口若自己登录/连 socket，会把主窗口顶下线、成员列表里还会出现两个
"我"。所以数据流向是：

```
主窗口（唯一 socket + 媒体） --IPC--> 主进程（dock-bridge.cjs） --IPC--> dock 小窗（只画）
        ^                                                                  |
        +------------------- 点击（看屏幕 / 分享我的 / 语音）----------------+
```

## 文件

| 文件 | 职责 |
|---|---|
| `OfficeDesktop/taskbar-position.cjs` | 纯几何：任务栏在哪条边、多厚、自动隐藏、窗口/头像条放哪、拖动偏移与夹紧 |
| `OfficeDesktop/dock-window.cjs` | 建窗（无边框/透明/置顶 screen-saver/不进任务栏/不抢焦点）、跟随任务栏、拖动记忆、按人数调宽、点击穿透开关 |
| `OfficeDesktop/dock-bridge.cjs` | 主进程中转 + 双向可信来源校验（只有办公室窗口与 dock 窗口能说话） |
| `OfficeDesktop/desktop-dock-preload.cjs` | 小窗的桥：只暴露 state/onState/requestPreview/onPreview/action/drag/setInteractive |
| `OfficeWeb/dock.html` + `src/dock.tsx` + `src/dock.css` | 小窗页面：一排头像 + 悬停卡片（约 3KB JS，**不加载 three.js**） |
| `OfficeWeb/src/dockRules.ts` | 纯规则：显示谁、怎么排序、谁能有预览、占位文案、点击穿透的命中判定 |
| `OfficeWeb/src/useDockBridge.ts` | 主窗口侧：每秒推状态、悬停时给帧、接点击去发起邀请 |

## 行为

- **谁显示**：当前在线的人（成员 + 访客），去掉自己；排序：未接来电 → 未读 → 正在共享 → 在座 → 名字。最多 16 个。
- **预览从哪来**：直接用主窗口已经在收的低清帧（悬停时才传，不悬停不传图），所以**没有协议改动**。
  访客、浏览器登录、没工位的人**永远没有预览**（规则如此），卡片上显示「此人不广播屏幕预览」。
- **三个按钮**：看对方屏幕（`request(target,'screen')`）、把我的屏幕给他（`offer: true`）、
  语音（`request(target,'voice')`）；点完主进程把办公室窗口抬到前面，通话界面在那里。
- **位置**：默认离屏幕右端 220 DIP（估算的托盘宽度，Windows 不提供真实值），竖直居中在任务栏里；
  拖动后记住偏移（`dock.json`），任务栏换边/换屏/改高度/改 DPI 都会重新贴回去。
- **自动隐藏**：任务栏自动隐藏时跟着藏（否则鼠标碰不到底边、任务栏再也弹不出来）；
  自己共享屏幕时藏（免得被一起共享出去）；窗口进全屏时藏；托盘菜单「显示任务栏头像条」可手动关。
- **点击穿透**：窗口比头像条大（卡片空间 + 卡片宽度），透明区域默认 `setIgnoreMouseEvents(true, {forward:true})`，
  页面用 `dockInteractive()` 判断指针是否在头像条/卡片上，在才接管点击——否则会盖住别人钉在任务栏上的图标。
