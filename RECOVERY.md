# 2026-11-18 恢复说明（RECOVERY）

## 发生了什么

本地开发目录 `G:\my\ai\code\irulerdream2.0\OfficeWorld`（含 `.git` 和 `OfficeWorld.bundle`）在一次磁盘清理中被删除，回收站里也没有。该仓库的 `origin` 指向本机的 bundle 文件而不是 GitHub，所以 10 月 16 日之后的提交从未推送过。

GitHub 上的 [lixiaotaowx/OfficeWorld](https://github.com/lixiaotaowx/OfficeWorld) 最后推送是 2026-10-16（0.1.54），历史完整，仓库本身没有损坏。

## 现在这个分支有什么

| 内容 | 状态 | 来源 |
| --- | --- | --- |
| `OfficeDesktop/` 生产源码 | **完整，0.1.80** | 0.1.80 安装包 `resources/app.asar`（服务器 /download） |
| `OfficeWeb/` 服务端源码（`*.mjs`、`package.json`、`part-library.json`） | **完整，11 月 16 日版本** | 生产服务器 `/home/ubuntu/officeweb/` |
| `OfficeWeb/dist/` 前端构建产物 | **完整，11 月 16 日版本**（含全部修复） | 生产服务器 |
| `OfficeWeb/src/` 前端 TypeScript 源码 | **只有 0.1.54 版本**，与 dist 不一致 | GitHub main |
| `OfficeDesktop/test/` 桌面端测试 | **只有 0.1.54 版本** | GitHub main |
| 10 月 16 日之后的 git 历史 | **已丢失** | 无法从 GitHub 恢复 |
| 运行数据（账号、聊天、工位、世界存档） | **安全，未受影响** | 一直在生产服务器上 |

## 已知不一致

- `OfficeWeb/src/` 是 0.1.54 的前端源码，不能直接构建出当前 `dist/`（dist 是 0.1.80 时期构建的）。要恢复前端源码，需要以 `dist/` 为对照逐模块重写，或从其它备份找回。
- `OfficeDesktop/test/` 与当前 `.cjs` 实现可能不匹配（测试没有打进安装包）。
- `tools/`、`docs`、`README` 等仍为 0.1.54 版本。

## 安全

- `OfficeWeb/.env`（含密钥）、`accounts.json*`、`chat-data/`、`build-world.json*`、`state.json*` 均为运行数据/密钥，**不要提交**。
- `OfficeWeb/dist/` 按原 `.gitignore` 是被忽略的；这里用 `git add -f` 特意提交，因为它是目前唯一的前端产物，务必保留。

## 2026-11-19 更新：重建进度

- **测试套件已对齐 11 月生产行为**：`npm test` 468 通过 / 0 失败（文案、
  建造目录、座位语义、时段、英文桌面提示等都按生产 chunk 校准）。
- **新增 11 个重建模块**（`OfficeWeb/src/hallLighting.ts`、`hallRendering.ts`、
  `officeCat.ts`、`solidWorld.ts`、`hallTimes.ts`、`seatVerdict.ts`、
  `cameraDrag.ts`、`sleepSnapshot.ts`、`motionPublish.ts`、`clickRoute.ts`、
  `framePacing.ts`，另有 `connectionQuality/SignalBars/screenHealth/
  hostStateProtocol/billiardsClient/commsFiles/meetingsView/useMeetingSignal/
  sharedResourcePool`）：都是从生产 chunk 逐个还原、带单元测试的 11 月逻辑。
- **重要**：这批模块**尚未接入应用**——`OfficeScene.tsx` 仍用 0.1.54 的场景
  组成，构建产物里没有它们。逐个接入的计划与风险评估见
  `OfficeWeb/WIRING-PLAN.md`。
- 从 Codex 会话日志挖出的 11 月源码片段存档在
  `OfficeWeb/reference/`（fragments + beautified dist + 切片索引），
  是重建时的行为对照材料。

## 恢复版前端

- 当前开发入口为 [OfficeWebReverse](OfficeWebReverse/)。大厅、桌面通讯宿主、头像条及其运行素材均随恢复版源码保留。
- 在 `OfficeWebReverse` 执行 `npm ci` 和 `npm run build`，在 `OfficeWeb` 执行 `npm ci` 和 `npm run start:preview`。预览默认监听 `http://127.0.0.1:3108/`，桌面客户端可通过 `OFFICE_URL` 使用该地址。
- 无本机开发证书时，`OfficeWebReverse` 的 `npm run dev` 会将 API 和 Socket.IO 转发到本地的 3108 端口。本机专用的证书不进入仓库。
- 已实测完整桌面客户端进入大厅，并显示任务栏头像和圆桌按钮。
