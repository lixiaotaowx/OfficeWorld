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

服务端授权流程 `npm test`（`test/livekit.test.mjs`）：**12/12 通过**。含 11 条授权单元用例
（会议室未加入拒绝 / 加入后放行、屏幕房间房主放行 / 未同意拒绝 / 已同意放行 / 会话种类不符
拒绝 / 房主不存在拒绝、语音对端放行 / 非成员拒绝 / 会话结束后失效、未知名与非字符串一律拒绝）
与 1 条走真实 socket 的端到端用例（同意前拿不到 token、同意后签发、房间名一致、结束后收回）。

浏览器实机 `npm run test:browser`（需信令服务 3108、Vite 5188 与全局 Playwright）：

- `test/browser/livekit-browser.mjs`：**7/7**。两个真实客户端加入会议后，直接查询 LiveKit
  服务端确认房间内确有 2 个参与者、双方均已发布 `microphone` 轨道；离开会议后成员数回落。
  控制台仅出现版本探测 404，无其他错误。
- `test/browser/livekit-screen.mjs`：**9/9**。一方开始共享、另一方请求、分享方点同意后，
  服务端确认 `screen-<id>` 房间建立且已发布名为 `screen` 的轨道；观看方页面实际渲染出远端
  视频帧（1280×720，另一次 640×360，取决于自适应选层）；停止共享后房间关闭。

结论：会议语音与屏幕共享两条链路都已在真实浏览器端到端跑通，并以服务端房间状态独立佐证。

## 顺带修掉的界面缺陷

`.session-panel` 原本 `bottom: 60px`，而页脚(46px)+底部操作栏(82px) 共占 129px，面板因此压住
「麦克风 / 共享屏幕 / 加入会议」并吞掉点击（实测点击共享按钮时命中的元素是 session-panel）。
已改为 `bottom: 140px`，复测命中元素恢复为按钮本身。

## 已配置 TURN（2026-09-10，改的是服务器不是仓库）

`/etc/livekit/livekit.yaml` 增加了：

```yaml
turn:
  enabled: true
  udp_port: 55000
```

回滚点：`/etc/livekit/livekit.yaml.bak-20260910-195601`。改动前该实例另一个应用已 2 小时无活动
（近 2 小时 `call-` 房间数为 0），重启后 `systemctl is-active livekit` 为 active，本项目
7/7 + 9/9 浏览器用例复测无回归。

**已证实**：

- 启动日志 `service/turn.go:145 Starting TURN server {"turn.relay_range_start": 30000,
  "turn.relay_range_end": 40000, "turn.portUDP": 55000}`。
- 本机 `ss` 显示 `udp 0.0.0.0:55000` 由 livekit-server 持有；服务端日志出现
  `created TURN password`，说明已按参与者下发 TURN 凭据。
- 对 55000 发 STUN Binding Request（从服务器本机、公网 IP、以及本机三处）均返回
  `BINDING-SUCCESS`。
- 腾讯云安全组已放行所需 UDP 端口：用临时 UDP echo 实测 **55000 通、35000 通**，
  而 **3479 被拦截**。即 LiveKit 的 TURN 端口与 relay 段都在已放行范围内，无需改安全组。

**未证实（不要当成已完成）**：

- **没有验证媒体真的走了 TURN 中继**。浏览器侧 relay-only 探针（`iceTransportPolicy: "relay"`）
  反复失败，但服务端日志显示实际用的是 `srflx`/`prflx` 候选、**从未出现 `relay` 候选**，
  说明该探针根本没走到 TURN，结论无效。需要换一种方式（如多网络实测或强制 relay 的
  独立客户端）才能证明中继可用。
- **TLS/443 回退仍未启用**。LiveKit 的 TURN over TLS 需要 CA 签发的证书；本机唯一的证书
  是 coturn 那把**自签证书**（CN/SAN 都是裸 IP `115.159.43.237`），浏览器会直接拒绝。
  用户现有域名 `aiwb.org.cn` / `www.aiwb.org.cn` 解析到的是 `8.138.233.99`，不是这台机器。
  要拿到可用证书，需要新增一条指向 `115.159.43.237` 的 DNS 记录后再申请。

**另外注意**：服务器上另有一套 **coturn**（`/usr/local/etc/turnserver.conf`，监听 3478/5349，
relay 50000–60000）。它与 LiveKit 内嵌 TURN 是两套独立实现，**LiveKit 不会读取 coturn 的配置**，
这套 coturn 目前只服务 Janus/aooserver。两者 relay 段有重叠（coturn 50000–60000 与 LiveKit
rtc 50000–60000），存在端口争用隐患。

## 已知限制（未解决，不要声称已完成）

- **服务端版本偏旧**：LiveKit 服务端 1.8.4（protocol 15），客户端 `livekit-client` 2.22.3
  （protocol 17）。客户端先探测 `/rtc/v1` 得到 404 再回退到 `/rtc`，功能可用但会打印
  版本警告，建议升级服务端。
- **连接稳定性**：本机环境同时开着 Tailscale 与代理（服务端日志可见 `100.122.124.x`、
  `198.18.x.x`、`fd7a:115c:a1e0::` 等候选），会干扰 UDP，已多次观察到
  `negotiation timed out` 与 `PEER_CONNECTION_DISCONNECTED` 引发的重连。
- **该 LiveKit 实例是共用的**：服务端日志里出现过 `call-<uuid>` 等与本项目无关的房间
  （历史累计 334 次），说明还有别的应用在用。升级或重启前必须确认影响面。
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
