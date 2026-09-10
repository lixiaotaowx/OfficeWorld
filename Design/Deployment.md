# OfficeWeb 部署（VPS 115.159.43.237）

更新于 2026-09-10。**当前地址：https://115.159.43.237/**

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

