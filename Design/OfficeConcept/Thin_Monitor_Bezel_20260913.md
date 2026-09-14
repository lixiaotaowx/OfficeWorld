# 实体显示器窄边框修复

状态：本地真实模型与 OfficeScene 近景、几何和点击回归通过；交助理部署，尚未作为正式网站更新验收。

用户截图红圈指向灰色实体边框。先前 Screen_Fit_Click_20260913.md 的内屏贴合修复不是此需求的完成证据。

## 实体修改

- 新增 OfficeWeb/src/monitorBezel.ts，在 MonitorScreens 建立画面前克隆显示器几何。
- 找出前唇与显示凹面两圈内沿的 8 个空间顶点（UV/法线断开后 24 个顶点），真正向外移动内沿，扩大开孔。
- 灰色左右边框从 13.86 mm 缩至 5 mm；上沿从 8.37 mm 缩至 4 mm，下沿从 8.37 mm 缩至 6 mm。
- 外壳轮廓、后背、支架、底座、世界变换不变，没有整机拉伸，没有遮盖旧边框。
- 真实显示面从 637.946 × 385.181 mm 扩至 655.657 × 391.921 mm，画布自适配为 480 × 287。
- 保持 1 mm 防闪烁间隙，仍低于外框前表面；屏幕和外框点击聚焦继续有效。
- 原始 BufferGeometry 留存，可通过 restoreBezel 恢复。GLB、用户 Blender 原稿和 UE 均未修改。
- 修改前源码和几何审计备份：Backups/BeforeNarrowMonitorBezel_20260913/。
- 原始 GLB SHA256：75B0CF8311B72671C53AB86BAF3A69C18DBD7CE3C627D900268F87CE2ED9886A，前后相同。

## 验证

- Build/bezel-validation.json：9 台模型各只改变 24 顶点；显示器以下顶点变动为 0。
- 9 台的外包围盒、节点变换、原材质、UV 与法线数组均完全相同。
- 所有有效三角形法向前后点积 > 0.999999，无翻面或新增退化三角形。实际材质近景没有出现 UV 接缝撕裂。
- Build/screen-fit-validation.json：9 屏内沿适配、81 个间隙采样均通过；16:9 / 4:3 / 竖屏按原比例显示。
- Build/screen-click-validation.json：实际 OfficeScene 的屏幕和上边框点击继续聚焦；选座模式不占座，拖动、右键和遮挡不误触。
- TypeScript 含 App 接线：0 diagnostics。
- 已查看正面、斜侧对比与完整场景近景：Build/bezel-front-compare.png、Build/bezel-side-compare.png、Build/screen-click-focus.png。
- A-2 反向工位、老板工位斜侧证据：Build/bezel-b-compare.png、Build/bezel-manager-compare.png。

## 发布交接

- 本次新增生产文件 monitorBezel.ts；monitorScreens.ts 增加调用。其余屏幕适配、点击文件沿用前次已验证版本。
- 测试页 OfficeWeb/test/screen-bezel.html 与 tools/check_monitor_bezel.cjs 不进入正式 Vite 构建。
- 这是加载时修改真实几何的前端更新，只需把包含变更的新构建上传。没有重导出 GLB，不应声称 GLB 已被替换。
- 助理在正式站点确认实际窄边框、点击聚焦和版本后再标记已部署。
