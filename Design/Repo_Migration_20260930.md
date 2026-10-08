# 2026-09-30 仓库推送与"换台电脑能拉起来"

用户要求：「推上去 并且保证我在别的电脑拉取可用」。

## 事实核对（先说清之前的状态）

- 远端 `https://github.com/lixiaotaowx/OfficeWorld.git` **早就存在**，是 **private** 仓库
  （创建于 2026-09-10T04:36:46Z）。之前"还没创建仓库"的印象来自一个假的证据：
  不带认证请求 GitHub API 对私有仓库返回 **404**，看起来就像仓库不存在。
  实际 `git ls-remote`（凭据管理器里存着 `gho_` 开头的 token）一直能通。
- 真正的问题是**内容没推**：远端 `main` 停在 `b891205`（2026-09-10 16:14 最后推送），
  本地 `main` 已经领先 **50 个提交**，另有 493 项未提交改动（107 改 / 43 删 / 343 未跟踪）。
  也就是说 09-10 之后的全部工作（账号、聊天、会议、桌面客户端、尺子角色、建造、宝箱、
  文件传输、自动更新）此前**只存在于开发机**。

## 这次做了什么

1. **安全体检**（推之前）：
   - 未跟踪文件合计 17.3MB，最大单文件 1.17MB（`OfficeWeb/public/assets/characters/ruler.glb`），
     没有接近 GitHub 100MB 硬限制的东西；
   - 已跟踪的大文件只有两个 GLB（13.0MB / 14.2MB）；
   - 全仓库扫 `gho_`/`ghp_` 前缀、`BEGIN OPENSSH PRIVATE KEY`、`BEGIN RSA PRIVATE KEY`：**无命中**；
   - `OfficeWeb/.env` 被 ignore，模板 `.env.example` 里只有占位符；
   - `Build/`（含每个约 246MB 的 `iruler dream.exe` 与 100MB 安装器）、`AssetSources/**`
     二进制、`Design/**` 图片/模型、`OfficeWorld/Content/*` 的 uasset 全部仍在 ignore 里。
2. **补换机器要用的东西**：新增 `SETUP.md`（装什么、`.env` 三个值、怎么跑、
   运行期数据在哪、怎么部署、怎么跑测试、哪些脚本写死了本机路径）；
   新增 `.gitattributes`（`eol=lf` 全仓库统一，避免 Windows `core.autocrlf` 造成
   工作区 CRLF 而仓库是 LF 的字节不一致）；`.gitignore` 补 `debug.log`、`*.TMP`、
   `OfficeWeb/Build/`；删掉 `OfficeWeb/debug.log` 与 5 个 `*~RF*.TMP` 临时文件。
3. **提交并推送**：`7e48b94`（522 个文件，+46126 / −1275），
   远端 `main` 与本地一致（`git ls-remote` 核对 `7e48b949aa01cd069b679498de8fa6a38997b830`），
   本地不再领先、工作区干净。
4. **新增可复用的核验脚本** `tools/verify_fresh_clone.ps1`：把仓库 clone 到**工作区之外**
   的目录，`npm install` → `npm run build` → `npm test`，逐条写日志。

## 边界（没有假装的部分）

- 私钥、`OfficeWeb/.env` 里的 LiveKit key/secret、`ADMIN_PASSWORD`、运行期数据
  （`accounts.json`/`state.json`/`build-world.json`/`chat-data/`）**不在仓库里**，
  换机器要自己带过去。`SETUP.md` 写明了每一项。
- `OfficeDesktop/tools/publish-update.mjs` 的 SSH 私钥路径是写死的
  （`C:/Users/Administrator/.ssh/id_ed25519_aiwb`），换机器要自带密钥或改这一行。
- `tools/` 下大量一次性诊断脚本仍然写死 Playwright/sharp/`.codex` 的绝对路径；
  网页、客户端、构建、单测都不依赖它们，但要复用就得先改路径。
- 本次只做了"clone 下来能不能装、能不能构建、单测过不过"这条核验；
  **没有**在真机之外验证线上部署，也没有改变 https://115.159.43.237/ 上的任何东西
  （推送仓库 ≠ 部署；那次站点上跑的还是之前发布的产物）。
