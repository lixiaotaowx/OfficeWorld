# OfficeWeb 媒体架构（LiveKit）

更新于 2026-09-10。替换了原先浏览器内裸 WebRTC mesh 的方案。

## 分工

| 层 | 承担者 | 职责 |
|---|---|---|
| 媒体面 | LiveKit（`livekit-server`，VPS `115.159.43.237:7880`） | SDP/ICE 协商、流路由、TURN 中继、断线重连 |
| 业务信令面 | socket.io（`server.mjs`，端口 3108） | 在场、工位、聊天、请求/同意、屏幕缩略图 |

裸 WebRTC 的信令代码（`offer`/`answer`/`candidate` 转发、`RTCPeerConnection` mesh）已全部删除。

## 房间模型

一次授权对应一个 LiveKit 房间，**授权由服务端签发 token 决定**，客户端无法自行越权：

- `screen-<ownerSocketId>` —— 一个分享者一个房间，房主 + 所有已同意的观看者。
- `voice-<sessionId>` —— 一对一语音，房间内只有双方。
- `meeting` —— 共享会议室，所有 `meeting` 标志为真的人。

`livekit.mjs` 的 `grantRoom()` 在签发 token 前校验：

- `meeting`：必须有 `person.meeting === true`
- `screen-<id>`：必须是房主本人，或存在一条 `kind=screen` 且 `owner=该 id`、`peers` 含本人的已批准会话
- `voice-<id>`：必须存在该会话且本人在 `peers` 中

会话结束（`end`）或分享者停止共享后，房间随即失效，旧 token 再申请会被拒。

## 已验证（2026-09-10）

服务端授权流程 `Build/livekit-smoke.mjs`：**10/10 通过**。覆盖会议室未加入时拒绝、
加入后签发、token 身份= socket id、房间授权域正确、屏幕房间未同意时拒绝、同意后放行、
未知房间拒绝、语音对端放行、会话结束后房间失效。

浏览器实机 `Build/livekit-browser.mjs`（Playwright + 假麦克风，两个真实客户端）：**7/7 通过**。
两个客户端加入会议后，直接查询 LiveKit 服务端确认房间内确有 2 个参与者、双方均已发布
`microphone` 轨道；离开会议后成员数回落。控制台仅出现版本探测 404，无其他错误。

## 已知限制（未解决，不要声称已完成）

- **服务端版本偏旧**：LiveKit 服务端 1.8.4（protocol 15），客户端 `livekit-client` 2.22.3
  （protocol 17）。客户端先探测 `/rtc/v1` 得到 404 再回退到 `/rtc`，功能可用但会打印
  版本警告，建议升级服务端。
- **未配置 TURN**：`livekit.yaml` 只有 `port/rtc/keys/logging`，没有 `turn:` 段。UDP
  50000–60000 被限制的网络环境会连接不稳甚至失败。已在测试中观察到 `negotiation timed out`
  与 `PEER_CONNECTION_DISCONNECTED` 引起的重连（本机同时开着 Tailscale 与代理，会干扰 UDP）。
  需要域名 + TLS 证书后才能启用 LiveKit 内置 TURN 的 443/TCP 回退。
- **该 LiveKit 实例是共用的**：服务端日志里出现过 `call-<uuid>` 等与本项目无关的房间，
  说明还有别的应用在用。升级或重启前必须确认影响面。
- 屏幕共享走 LiveKit 视频轨道，但席位网格里的缩略图仍是 socket.io 传输的 480×270 JPEG 预览。
- 尚未做跨网络多机验证；本机双标签页与双客户端已实测。

## 配置

服务端读 `OfficeWeb/.env`（已 gitignore，模板见 `OfficeWeb/.env.example`）：

```
LIVEKIT_URL=ws://115.159.43.237:7880
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

页面走 HTTP 时用 `ws://`；页面一旦上 HTTPS 必须换成 `wss://`，否则浏览器按混合内容拦截。
