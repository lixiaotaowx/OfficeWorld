# 屏幕邀请与双向语音统一私聊

## 交接状态

- 本地实现和隔离 QA 验证完成，交助理统一集成部署；本任务没有发布正式站点。
- 正式账号、工位、聊天和 `.env` 没有覆盖。测试使用 VPS `/home/ubuntu/officeweb/media-qa-20260913` 独立业务数据。
- QA 单元 `officeweb-private-qa-20260913`，监听 VPS 回环 3200；本地 SSH 3200 隧道。启动脚本一小时后自动退出，助理可按需停止。

## 行为

- 分享自己的屏幕、请求看对方屏幕两种邀请，接受时明确包含双向语音；新私聊默认申请并开启麦克风。
- 每对用户单独的 `call-<session UUID>` 房间。多个合法观看者各有独立房间，不共享同一音频房间。
- 同一对象的语音与屏幕邀请复用会话 ID、房间和连接。已有手动静音保留，不为升级创建第二条音频连接。
- 只有当前选定的通话/会议可开麦并播放远端声音，切换有提示。其他会话保留画面，但暂停收听和开麦；切回需明确点击，避免自动恢复开麦。
- 麦克风失败时保留已授权画面，显示“等待授权或开启失败”和重试按钮；按钮读取实际 publication 和底层轨道存活状态。
- 停止屏幕只取消视频，保留语音。挂断关闭该私聊音视频；原有公共采集或仍供其他已授权观看者使用的采集不被误停。
- 信令长断网会结束失效私聊和采集；恢复后重新邀请。媒体本身断开、业务会话仍有效时，自动重新取令牌连接。
- 浏览器屏幕采集仍由用户授权，不新增摄像头。

## 安全和竞态

- 服务端验证邀请发送方/接受方，撤销或过期邀请不能迟到接受，第三人不能接受或挂断。
- 令牌仅签发给已接受会话的两名成员。纯语音/观看者只有麦克风发布源权限；只有明确接受共享的发送者拥有屏幕发布源权限。
- 同一会话升级时通过 LiveKit 服务端更新发布源权限，不重建连接。停止屏幕后撤销该发送者的屏幕发布权限；撤销失败则结束通话。
- 挂断后拒发新令牌并删除对应媒体房间。私聊新令牌有效期 60 秒；不声称已签发 JWT 的密码学有效期被提前消除。下一次会话使用新 UUID 房间，旧令牌不能进入新通话。
- `respond` 增加结果确认。取消与选择器返回同时发生时，客户端按本次采集实例清理，不误停此前已有公共采集。
- 发布/取消与音频目标切换共享排队及世代检查；权限迟到、发布迟到时停止并取消旧轨道发布。

## 修改文件（供集成）

后端必须同时上传并重启应用：

- `OfficeWeb/server.mjs`：调用独立私聊逻辑、停止屏幕不挂断、关闭媒体房间、令牌发布源。
- `OfficeWeb/livekit.mjs`：call 房间成员授权、短期令牌、按成员屏幕权限、升级/撤销权限。
- 新 `OfficeWeb/privateSessions.mjs`：邀请、接受确认、每对会话复用、取消与停屏降级。

前端需要从集成后的工作区重新构建：

- `src/media.ts`、新 `src/mediaAudioFocus.ts`、`src/mediaPublication.ts`。
- `src/useOffice.ts`、`src/useMeetings.ts`、`src/types.ts`。
- 新 `src/PrivateCallPanel.tsx`、`src/private-call.css`、`src/SharingPreview.tsx`。
- `src/App.tsx`：仅会话区替换和相关 import、通话按钮支持 screen 会话；应保留并行顶部修改。按显示器会话要求加入 `onFocusScreen` prop，未改 3D 模块。
- 缩略图采集按原比例最长边 480 编码 JPEG，不先加黑边，保留 data URL 接口，由显示器模块一次 contain。

`mediaRooms.ts` 沿用现有实现，本轮没有修改。生产 `.env`、accounts/state/chat 不在上传清单。

## 验证证据

- `npm test`：最终 63/63 通过（包含其他并行任务的现有测试）。会议 fixture 会记录无真实参会者的移除提示，该既有提示未作为本轮媒体异常。
- TypeScript 通过；独立构建 `Build/OfficeWebPrivateCallCheck` 通过。本轮文件均不超过 500 行。
- `OfficeWeb/test/browser/private-av-regression.cjs`：三浏览器、合成振荡器和动态画布，经真实 VPS SFU，收到非零音频能量与持续视频解码帧。覆盖：纯语音不采屏、SFU 拒绝未同意屏幕发布、两种邀请方向、升级复用/静音保留、麦克风拒绝重试、两观看者隔离、第三人令牌拒绝、会议/私聊切换、模拟麦克风轨道丢失重试、停止共享保留语音、55 秒离线后重新邀请恢复、挂断清理。
- `OfficeWeb/test/browser/private-call-ui.cjs`：真实完整 UI + 同一隔离 SFU，模拟权限错误与迟到选择器；两侧拒绝选屏、等待期间取消、视频保留/麦克风失败重试、静音按钮、停屏保留语音、挂断，以及拒绝/取消/挂断观看者不误停原公共采集全部通过。
- `test/private-calls.test.mjs`、`test/private-audio-focus.test.mjs`：服务端会话/发布源隔离与音频切换、取消竞态。
- 证据：`Build/private-av-evidence.json`、`Build/private-call-ui-evidence.json`；截图 `Build/private-ui-mic-denied.png`、`Build/private-ui-voice-remains.png`，均已实际查看。
- 首轮 UI 验证抓到“挂断”覆盖“重试”按钮，CSS 特异性修正后使用真实点击重跑通过。首轮长断网脚本错误复用旧 socket ID，修正为恢复后最新 ID，完整 55 秒复测通过。

## 未冒充完成的验收

- 以上音画为合成输入；权限拒绝为 getUserMedia/getDisplayMedia 抛出真实同类 DOMException，设备丢失为终止测试轨道。没有拔插用户真实设备，也没有录制声音或采集用户桌面。
- 未完成两台不同网络真人设备、原生 OS 选择器/权限弹窗、人声扬声器回声、实体设备热拔插、受限网络 TURN/TLS 验收。
- 新效果尚待助理统一部署并核验正式 HTTPS 入口；本地构建/隔离站测试不作为生产发布证明。

## 助理发布后的最小复验
- 助理已统一发布 index-DNY_NLtw.js / index-B_t315Gb.css；本任务新增 private-deployed-smoke.cjs，逐项下载正式 HTTPS JS/CSS 并确认 SHA256 与本地用于测试的部署产物一致。
- 使用这份正式前端产物，业务接口仍连接隔离 QA，实际媒体仍经 VPS SFU：请求看对方屏幕、分享自己的屏幕两个方向均收到视频，双方麦克风实际开启，双方 inbound-rtp 音频能量和字节数非零。
- 两方向挂断后会话面板与私人采集均清理，零页面异常。没有使用正式账号或向正式用户发送邀请。
- 证据 Build/private-deployed-smoke-evidence.json，含正式下载资源哈希和接收音频样本；原生硬件及真人跨网络限制不变。
