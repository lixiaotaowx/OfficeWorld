# 重建模块接线计划（Wiring Plan）

> 状态：11 个 11 月逻辑模块已重建并测试通过，但**尚未接入应用**——
> 构建产物里一个都不在（Vite 只打包被 import 的模块）。
> 本文档说明每个模块能替换什么、风险多大，供逐个接线时参考。

## 背景

- 应用现在跑的是 0.1.54（10 月）的场景组成：`OfficeScene.tsx`（462 行）
  + `sceneLoop.ts` + `portraitLighting.ts` + `buildEnvironment.ts`，
  配 `OrbitControls`、`navigation.ts`、`OfficeAvatar/RemoteAvatars`。
- 重建的 11 月模块是对照生产 chunk 逐个还原的，行为有测试钉住，
  但 `OfficeScene.tsx` 还没改成用它们。

## 待接线清单（按风险从低到高）

| 模块 | 替换/新增什么 | 风险 | 验证方法 |
| --- | --- | --- | --- |
| `hallTimes.ts` | **新增**时段功能（旧场景完全没有日/暮/夜） | 低（纯新增，不碰旧路径） | 接入后面板出现时段按钮，肉眼对比三档 |
| `motionPublish.ts` | 替换 OfficeScene 里自己的动作广播节流 | 低（行为等价：70ms 防抖 + 2s 心跳） | 双开浏览器看对方动作同步 |
| `framePacing.ts` | 替换 `sceneLoop.ts` 的节流档位 | 低-中（帧节奏变化，肉眼可感） | 空闲 10s 后 CPU 占用应下降 |
| `cameraDrag.ts` | 替换 OrbitControls 的灵敏度/判定 | 中（手感变化明显，需你亲自试） | 拖拽旋转/平移手感对比 |
| `seatVerdict.ts` | 替换 OfficeScene 里座位点击的内联判定 | 中（文案已在测试里钉住） | 点被占座位/别人工位看提示 |
| `solidWorld.ts` | 替换 `navigation.ts` 的碰撞查询 | 中-高（移动/跳跃手感） | 走/跳/下水全流程 |
| `hallLighting.ts` | **新增**吊顶灯+投影（旧场景只有环境光） | 中（视觉变化大，可能要调参数） | 截图对比 |
| `hallRendering.ts` | 替换渲染管线（新增 GTAO/Bloom 后处理） | 高（GPU 负载、视觉风格全变） | 各档画质截图 + 低配机验证 |
| `officeCat.ts` | **新增**猫（需要先接服务端猫广播） | 中（依赖 cat/interaction.mjs 已在服务器跑） | 猫出现并跟随广播 |

## 建议路线

1. **先接低风险三个**（hallTimes / motionPublish / framePacing）——
   一次一个，每个接完跑全量测试 + 浏览器回归，确认无回归再接下一个。
2. **中风险的等你拍板**（cameraDrag 手感、seatVerdict 文案）——
   接之前先在本地跑，你亲自试过手感再保留。
3. **高风险的（hallRendering）单独做一晚**——后处理一开整个画风就变，
   需要你对比后再决定要不要留。

## 已知事实

- 应用当前完全可用（登录→大厅→捏人→工位面板，0 页面错误）。
- 生产环境未动；本地预览 127.0.0.1:3111 是最新构建。
- 11 个模块都在 `src/` 下且有测试（`test/*.test.mjs`），
  `npm test` 468 通过 / 0 失败。
