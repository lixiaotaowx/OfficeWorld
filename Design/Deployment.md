# OfficeWeb 部署（VPS 115.159.43.237）

更新于 2026-09-10。**当前地址：http://115.159.43.237/**

## 现在跑着什么

| 组件 | 位置 | 说明 |
|---|---|---|
| 前端（构建产物） | `/home/ubuntu/officeweb/dist` | 由应用进程直接托管，与信令同源同端口 |
| 信令 + 静态托管 | `/home/ubuntu/officeweb/start.mjs` | systemd 服务 `officeweb`，监听 `0.0.0.0:80` |
| 媒体面 | 既有的 `livekit-server`（`115.159.43.237:7880`） | 未改动其配置，只由客户端直连 |
| 配置 | `/home/ubuntu/officeweb/.env` | `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` |

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
npm run build
Remove-Item dist\assets\office.glb      # 17.8MB 未使用的带材质场景，不必上传
scp -i <key> -r dist server.mjs start.mjs static.mjs livekit.mjs package.json ubuntu@115.159.43.237:~/officeweb/
ssh -i <key> ubuntu@115.159.43.237 "sudo -n systemctl restart officeweb"
```

依赖只在首次装：`cd ~/officeweb && npm install --omit=dev`。

## 已验证（2026-09-10）

`cd OfficeWeb && node test/browser/deployed-smoke.mjs`：**6/6 通过**。在**部署站点**上
用两个真实浏览器客户端验证：站点可访问且信令已连接、办公室模型加载完成、两个客户端
连到同一台服务器、**能看到另一个玩家的角色并跟随其走动（误差 0.17 米）**、页面无未预期错误。

## TLS：还没做，但必须做

**现状：明文 HTTP，媒体捕获不可用。** 实测部署页面上
`window.isSecureContext === false`、`navigator.mediaDevices.getDisplayMedia === false`。

浏览器规定屏幕捕获与麦克风只能在**安全上下文**（`https://` 或 `localhost`）里使用。
所以在 `http://115.159.43.237/` 上：

- ✅ 能进办公室、能看到别人、能走动、能选工位、能聊天
- ❌ **不能共享屏幕、不能语音**（点了也不会成功）

好消息是前置条件都具备：**443 已放行**，apt 可用（`nginx 1.24.0` 可装）。

计划做法（不碰既有 livekit-server，避免影响共用它的另一个应用）：

1. 装 nginx，在 443 终止 TLS；
2. 反代 `/socket.io/` 与静态文件到 `127.0.0.1:80`（或直接把 root 指向 dist）；
3. 反代 `/rtc`（WebSocket）与 `/twirp/` 到 `127.0.0.1:7880`，让客户端用 `wss://<host>/` 连 LiveKit；
4. 前端 `LIVEKIT_URL` 改成 `wss://<host>`（同源，证书一并覆盖）。

**证书这一关还没解决。** 唯一现有的证书是 coturn 那把**自签、只签了裸 IP**的证书，
浏览器会拒绝。可选路线：

- **需要用户操作**：加一条 DNS 记录指向 `115.159.43.237`，然后 Let's Encrypt 签真证书（最干净，无警告）。
- **不需要 DNS**：用 `115-159-43-237.sslip.io` 这类通配 DNS + Let's Encrypt（待验证是否可签发）。
- **兜底**：自签证书 + 浏览器手动信任（每个浏览器一次性点"继续访问"，体验差）。

## 已知限制

- 没有鉴权：身份是 socket id + 随机「访客 123」，任何人打开网址就能进。
- 状态全在内存：重启服务 = 所有人掉线、工位与聊天记录清空。
- 明文 HTTP，媒体不可用（见上）。
- 只有本机与单机双客户端验证过，尚未在真正的两台不同网络机器之间验证。
