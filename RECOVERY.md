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
