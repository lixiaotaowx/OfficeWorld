# 标注与静音波纹四改（2026-10-14）

用户原话四条：

> 1 分享者清屏按钮需要，2 状态栏静音按钮需要一个声音波纹来看麦的音量，3 观众看别人时标记
> 可以修改颜色，4 标记每一笔都会署名，名称去掉。

四条都改完，**都在网页层与浮层里，没有改协议、没有改后端、不需要新客户端**（浮层那份
`annotation-overlay.js` 是随安装包走的，但这次改的是**它收不收新字段**，老客户端照旧能画，
见下面"兼容性"）。规则细节写进了 [../OfficeWeb/AGENTS.md](../OfficeWeb/AGENTS.md) 的
「标注四改」与 [../OfficeWeb/AGENTS-dock.md](../OfficeWeb/AGENTS-dock.md) 的「静音按钮上的声音波纹」。

## 1 分享者清屏按钮

- **为什么他要这个按钮**：标注是画在**分享者自己那块屏幕上**的透明浮层里（`setIgnoreMouseEvents(true)`，
  鼠标穿透，好让点击落到下面的应用上）。所以分享者**在自己桌面上点不到那层**，别人画上去的笔迹
  他只能从自己的页面擦 —— 以前页面里压根没有这个入口。
- 现在 `ScreenStage` 多一个 `clearsOwnBoard` 开关：为真时画面右上角渲染一个「清屏」
  （`.screen-stage-own-clear`），并给 stage 加 `.own-board` 类把绘制层关掉（那块预览不吃鼠标，
  点击照旧还给下面的应用）。
- 两条路都接上：会议是 `MeetingCenter` 的 `SharingPreview`；私聊是 `PrivateCallPanel` 在
  `state?.sharing && videos['local-screen']` 时渲染 `SharingPreview`（以前私聊共享**没有任何**
  自己的预览，顺手补齐）。`useOffice` 为此交出 `boardScope`（我正在共享的那张画布），
  它的算法与"共享结束时清掉哪些画布"是**同一份** `shareScopes`，没有写第二套。
- 清屏前**先清本机即时回显**（`clearBoard()`），否则屏幕上留一条幽灵笔迹要等 `ECHO_MS` 才消失。
  预览收起时清屏挪到标题栏，别让人为了擦笔迹先展开窗口。

## 2 静音按钮的声音波纹

- 小窗（任务栏头像条）**不碰媒体**（连 socket 都没有，见铁律），所以音量只能在主窗口量：
  `media.activeMic()` → `useMicLevel` 每 60ms → `DockMeetingState/PrivateState.micLevel`
  （0..1）→ 小窗 `DockMicWave` 画一圈随音量长大的描边。
- 数值规则在 `src/micLevel.ts`（纯函数）：掐底噪（`MIC_FLOOR = 0.008`）→ 放大 4 倍开方 →
  起快落慢（`release = 0.16`）→ 四舍五入到 0.01。
- 静音 / 没在通话时读数是 **0**，一圈都不画。
- IPC 限速 `METER_PUSH_MS = 80`，判断方式是比较"去掉音量以后的快照"；别的状态变化不受它限制。

## 3 观众改笔色

- 色板 `src/inkColors.ts`（7 色）→ `src/InkPicker.tsx`（工具条上一排小圆点）→ `ScreenStage`
  的 `ink` 状态。默认仍是**这个人的固定色**，所以老用户看到的和以前一样，想换才换。
- **颜色是"每条笔画"的属性**：只在起笔那一条消息上带出去，续画与收尾都不带，所以中途换色
  只影响下一笔。浮层只认色板里的值，不认的退回 `colorFor(clientId)`。
- 浮层是普通脚本、不能 import TS，所以 `OfficeDesktop/annotation-overlay.js` 里复刻了一份
  颜色表，`test/ink-colors.test.mjs` **逐字**核对两份。
- 撤销跟着改成**按笔画 id 精确删**（`annotate-undo { scope, stroke }`），老消息（不带 `stroke`）
  才退回"这个人最后一条"。

## 4 每一笔不再署名

- 浮层里那个名牌胶囊（`label()`：`roundRect` + `fillText`）**整条删掉**，浮层从此不出现任何文字。
- `name` 仍留在协议里（服务端还转发、老页面还在发），只是不画 —— **别顺手把字段删掉**。

## 兼容性

- **服务端只原样转发 `color` / `stroke`，不认内容**，所以后端一行没改。
- `color` 与 `stroke` 都是**可选**字段：老页面（不带）画出来与以前逐字节一样的颜色、
  撤销退回"最后一条"；新页面遇到老客户端也一样。
- 浮层那份 `INKS` 与新字段随**安装包**走：装了新版客户端的人才能在**自己屏幕上**看到
  别人选的颜色。分享者是老客户端时，新页面选的颜色会在浮层里退回固定色 —— 这是有意的
  降级，不是 bug。

## 验证

- 单测：`node --test test/*.test.mjs` **435/435 通过**（本轮新增 `ink-colors`、`mic-level`，
  并扩了 `meeting-annotations`；顺带修掉三条**过期断言**，见下）。
- 桌面：`npm test`（`OfficeDesktop`）**176/176 通过**（`annotation-paint.test.cjs` 新增署名、
  颜色、按 id 撤销三条）。**桌面用例数含原生窗口那些 `.test.cjs`，不是"只有浮层"**。
- 真浏览器：`node test/browser/screen-stage.cjs`（改笔色：起笔那条带 `#4a9fd8`、本机回显像素
  偏蓝、收尾不带；`?own=1`：只有一个「清屏」、绘制层 `display:none`、点一下真的 clear 一次）
  + `node test/browser/dock-meeting-controls.cjs`（静音时没有波纹；`micLevel` 0 / 0.34 / 1
  三档圈依次变大且封顶）。
- 构建：`npm run build` 通过，`public/` 与构建产物 90 个文件一致。

### 顺带修掉的三条过期断言

这三条在**改动之前就已经是红的**（已用 `git stash` 对基线核过），文档里也记着"既有失败、
不得当作证据"。它们的期望值与实现漂了，本轮按**当前实现**更新，并写清为什么：

| 文件 | 原来的期望 | 现在 |
| --- | --- | --- |
| `dock-session-end.test.mjs` | `return () => { clearInterval(timer); release(); }` | 中间多了 `pushNow.current = undefined;`（摘掉指向已卸载组件的节流函数） |
| `dock-rules.test.mjs` | `{ appearance: resolveAppearance(appearance), size: mode }` | `appearance: resolveAppearance(appearance), size: mode`（多行对象，花括号不再紧贴） |
| `dock-rules.test.mjs` | `key={greet.id + greetMode(greet.mode)}` | 末尾多了 `+ (greet.requestId \|\| '')`（换一通来电也要重新挂载） |
| `file-transfer-rules.test.mjs` | 布局 effect 依赖 `[hovered, state, greet, dropNotice, …]` | 现在是 `[]`（无依赖）——**别把 `dropNotice` 加回去**，那会让每敲一次提示都重报原生窗口尺寸 |

## 未做 / 边界

- 分享者**不能自己画**（只在别的屏幕上有整套标注工具；自己那块预览只给「清屏」）。
  用户这次只要了清屏，没有要"分享者也能标"。
- 波纹是**本机麦克风的音量**，不是远端听到的音量；对方听到多大取决于他的设备。
- 波纹只能人工确认"看着像不像在说话"：自动化只覆盖数值与圈的大小。
