# 显示器屏幕贴合修复 — 2026-09-13

## 原因
- 原逻辑把整台显示器（包含凸出底座）的世界包围盒最前端当成屏幕表面，再外移 12mm。
- 使用正式站点相同 GLB 测量，九台画面均悬在真实面板前约 90.74mm。

## 修复
- 新增 src/monitorSurface.ts，在面板高度向真实机身表面发射射线，取朝向使用者的正面交点。
- 仅保留 1mm 防止共面闪烁的偏移；不移动模型、底座、角色或工位。
- 继续使用现有干净矩形 UV、工位方向及独立画布；找不到真实表面时不制造悬浮画面，并释放未用材质。
- 修改前备份：Build/Backups/ScreenFit-20260913/monitorScreens.ts。

## 核验
- 三项专项测试通过：凸出底座不改变屏幕深度、旋转/倾斜/嵌套缩放、找不到真实表面时返回空。
- test/screen-fit.html 加载真实 GLB，每台采样中心与周围共 9 个点，9 台共 81 点。
- 所有点间距 0.999945–1.000055mm，无遗漏交点。
- 已检查 A-1 侧面、A-2 正面、老板工位侧面修复前后渲染；边框贴合、文字正向。
- TypeScript 与 Vite 构建通过；修改文件均不超过 500 行。
- 模型本地/线上 SHA256 一致：75b0cf8311b72671c53ab86baf3a69c18dbd7ce3c627d900268f87ce2ed9886a。

## 发布
- 独立构建目录 Build/OfficeWebScreenFitRelease。
- 新入口 index-DGgzX7FT.js，样式 index-Dn4GrtvI.css。
- 已上传实际资源并重启 officeweb，服务器脚本 SHA256 与本地一致：ee744fdb726a8e2cdf59f81527dd3c55df8e0465920a14baef957090f445d0a8。
- 旧入口备份 /home/ubuntu/officeweb/backups/screen-fit-20260913/index.html。
- 正式站点已刷新，DOM 确认 index-DGgzX7FT.js；实际老板显示器近景已查看，画面处于机身边框内，连接与工位身份正常。
