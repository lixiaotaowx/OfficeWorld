# 换一台电脑怎么跑起来（OfficeWorld）

这份文档是给「在另一台机器上 clone 本仓库、把项目跑起来」用的。
仓库是 **private**：`https://github.com/lixiaotaowx/OfficeWorld.git`（默认分支 `main`）。

## 1. 仓库里有什么

| 目录 | 内容 | 备注 |
| --- | --- | --- |
| `OfficeWeb/` | **当前正式产品**：网页版办公室（React + three.js + Vite + socket.io + LiveKit） | 部署目标是 <https://115.159.43.237/> |
| `OfficeDesktop/` | Electron 桌面客户端（`iruler dream`），加载的仍是同一个站点 | 安装器版本见 `package.json` |
| `Design/` | 设计与任务文档、部署记录（`Deployment.md` 是部署手册） | 只有文字/JSON；截图和 .blend 不入库 |
| `tools/` | 建模、导出、诊断脚本 | 很多脚本里写死了本机路径，见第 8 节 |
| `AssetSources/` | 素材来源与许可说明（`README.md` / `CREDITS.md` / `audit.json`） | 下载来的二进制素材不入库 |
| `OfficeWorld/` | 早期的 UE 5.8 工程（保留，不再是主线） | `Content/` 里的二进制大部分被 ignore |

## 2. 需要先装什么

- **Node.js 20 以上**（开发机用的是 v24.19.0）。`node -v` 确认一下。
- **Git**，并且这台机器上要有能访问本私有仓库的凭据（GitHub 账号 + PAT，或 `gh auth login`）。
- 想跑浏览器回归用例的话再装 Playwright（见第 6 节）。
- 想重新打包桌面客户端的话再装（Electron 48MB 左右，`npm install` 会自己下载）。
- 可选：想打开 UE 工程才需要 UE 5.8.2。

## 3. 网页版：最短路径

```powershell
git clone https://github.com/lixiaotaowx/OfficeWorld.git
cd OfficeWorld/OfficeWeb
npm install
```

### 3.1 配置 LiveKit（不配也能启动）

`OfficeWeb/.env` **不在仓库里**（里面有真密钥）。先按模板建一份：

```powershell
Copy-Item .env.example .env
```

三个值的意思：

| 变量 | 说明 |
| --- | --- |
| `LIVEKIT_URL` | LiveKit 地址。本地/同机 `ws://<host>:7880`；页面本身是 HTTPS 时必须 `wss://`，否则浏览器按混合内容拦掉 |
| `LIVEKIT_API_KEY` | LiveKit 服务端配置 `keys:` 段里的 key |
| `LIVEKIT_API_SECRET` | 同上的 secret。服务器签发 token 时用 |

> 真实密钥在 VPS 的 `/etc/livekit/livekit.yaml` 里（`ubuntu@115.159.43.237`）。
> 换机器要跑音视频就得把那三个值带过去；缺失时服务能起来，但会议/语音/屏幕共享会不可用。

### 3.2 跑起来

```powershell
npm run build      # tsc --noEmit && vite build，产物在 OfficeWeb/dist
node start.mjs     # 开发入口，默认 127.0.0.1:3108
```

`PORT` / `HOST` 可以用环境变量覆盖；部署时设 `HOST=0.0.0.0`。
`start.mjs` 故意和 `server.mjs` 分开（PM2 下 `import.meta.url` 判断会失效）。

> 注意：`npm run build` 的 `postbuild` 会核对 `public/` 与 `dist/` 逐文件一致
> （`test/public-parity.mjs`）。**不要让两个进程同时构建到同一个 `dist/`**，
> 曾经因此把 `assets/basis/` 里的转码器打成 0 字节，浏览器静默回退备用模型。

### 3.3 运行期数据（不入库，第一次跑会自动建）

- `OfficeWeb/accounts.json*`：账号
- `OfficeWeb/state.json*`：工位名册
- `OfficeWeb/build-world.json*` / `build-world.json.seats.json`：建造存档 + 自建工位编号
- `OfficeWeb/chat-data/`：聊天存档

**这些是正式服务器的运行数据，部署时不要覆盖、不要删。** 新机器上是空的，等于一个全新空间。

## 4. 桌面客户端

```powershell
cd OfficeDesktop
npm install
npm start                        # 直接跑 electron .
npm run dist:all                 # 打包 portable + nsis 安装器到 ../Build/OfficeDesktopRelease
```

客户端不自带网页：它加载的就是 `https://115.159.43.237/`。所以**改网页不需要重发客户端**。

## 5. 重新部署到正式站

细节以 `Design/Deployment.md` 为准，要点：

- 站点 `https://115.159.43.237/`，身份 `ubuntu@115.159.43.237`，
  密钥 `C:/Users/Administrator/.ssh/id_ed25519_aiwb`，必须显式 `-i` 且 `IdentitiesOnly=yes`。
  **换机器要自带这把私钥**（不在仓库里，也永远不要提交）。
- systemd 服务名 `officeweb`；前端静态文件由 `server.mjs` 通过 `static.mjs` 托管 `dist/`。
- 网页更新 = 上传 `OfficeWeb/dist` 里的新产物，然后在公网核验哈希/版本。
  **本地构建成功不等于线上已更新。**
- 桌面更新 = `OfficeDesktop` 里 `npm run dist:all` → `npm run publish:update -- --notes "..."`。
  这个脚本（`tools/publish-update.mjs`）里的 `KEY` 写死了上面那把私钥的路径，
  换机器要么把私钥放到同一路径，要么改 `KEY`（或后续改成读环境变量）。
- `~/officeweb/dist/download/` 里存的是**已发布安装器**（每个约 100MB），
  重传前端时不要 `scp -r` 覆盖整个 `dist`，否则会把安装器删掉。

## 6. 测试

```powershell
cd OfficeWeb
npm test                 # node --test test/*.test.mjs（纯逻辑，不需要浏览器）
npm run test:browser     # 真浏览器 + 真实 LiveKit，需要 Playwright
```

浏览器用例通过 `test/browser/playwright.cjs` 找 Playwright，顺序是：
`PLAYWRIGHT_PACKAGE` 环境变量 → 项目内 `playwright` → 全局 npm 安装 → 旧机器路径。
新机器装一次即可：

```powershell
npm i -g playwright
npx playwright install msedge
```

桌面端：

```powershell
cd OfficeDesktop
npm test                 # node --test test/*.test.cjs
```

## 7. 故意不入库的东西

| 排除项 | 原因 |
| --- | --- |
| `OfficeWeb/.env`、`ADMIN_PASSWORD` | 真密钥。模板在 `.env.example` |
| `OfficeWeb/{accounts,state,build-world}.json*`、`chat-data/` | 正式运行数据，不许被覆盖 |
| `Build/`、`Builds/`、`Backups/`、`Downloads/`、`_bake_tmp/` | 构建产物、安装器、备份、临时烘焙 |
| `OfficeWeb/dist/`、`node_modules/` | 都能重新生成 |
| `AssetSources/**` 的二进制、`Design/**` 的图片/模型/blend | 体积与许可；只保留说明文档与 JSON（唯一例外：`Design/References/Approved_Natural_Office_Concept.png` 是设计基准，必须有） |
| `OfficeWorld/Content/*` 的 uasset/umap | 每个上百 MB |
| `OfficeWeb/public/assets/office.glb` | 已被 ktx2 版替代的 17.9MB 旧导出 |

## 8. 换机器后已知会失效的脚本

这些是一次性诊断/建模脚本，里面写死了原机器的路径（Playwright、sharp、`.codex` 缓存、
`C:/Users/Administrator/...`）。**网页、桌面客户端、构建、单测都不依赖它们**。
要复用就把路径换成自己机器上的，或改成 `require('playwright')` 这类正常解析。

- `tools/*.cjs`、`tools/office-concept/*.cjs`（Playwright / sharp 绝对路径）
- `OfficeWeb/test/browser/*.cjs` 里直接 require 绝对路径的老脚本（新脚本已统一走 `playwright.cjs`）
- `OfficeDesktop/tools/publish-update.mjs` 的 SSH 私钥路径（见第 5 节）
