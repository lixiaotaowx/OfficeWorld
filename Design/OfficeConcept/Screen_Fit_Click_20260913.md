# 显示器内屏适配与点击聚焦

状态：2026-09-13 本地真实 GLB / OfficeScene 验证通过，交助理统一发布。
本记录不代表 https://115.159.43.237/ 已更新；线上构建与正式账号验收由集成任务完成。

## 根因与修复

- 旧 authored panel 为 0.600 × 0.355 m，实际显示凹面为 0.637946 × 0.385181 m，造成额外内边。
- 旧固定 480 × 270 画布与物理屏幕比例不同。改为 480 × 290，原图等比 contain，完整保留文字和图像。
- 从中心命中的共面、连通三角形测量真实内沿，焊接位置仅用于拓扑遍历，不改模型。排除底座、外壳倒角及不相连的共面零件。
- 保留真实外壳边框。图像表面仍比凹面前移 1 mm，低于外框表面，避免闪烁和悬浮。
- 发送端原先先把所有画面塞进 16:9 JPEG，会造成二次留边；后端工程师已负责 media.ts 改成保留采集比例的 JPEG，接口仍是 data URL。
- 正常比例留边保留：16:9 内容在 480 × 290 画布上下各 10 px；4:3 与竖屏仅左右留边，不裁切或拉伸。

## 点击

- 屏幕及外壳使用 monitorSeat 标记；通过 OfficeScene.onFocusScreen 回调复用 App 成员列表的 focusSeat 路径。
- 使用原有 0.62 m 目标距离、0.10 m 高度偏移与原有镜头插值。
- 显示器点击不调用 onPick、avatar.sit、屏幕权限请求或媒体接口。无共享时仍可聚焦实体显示器。
- 只响应最近的可见表面，跳过隐藏父级和已裁切墙面；不会穿过前方桌面等实体去点击屏幕。
- 左键移动超过 5 px 即判拖动，即使回原点也不触发。取消、右键、重复释放不触发。

## 验证与证据

- TypeScript（含 App 接线）0 diagnostics：`node tools/check_monitor_types.cjs`。
- 9 项单元测试通过：monitor-surface.test.mjs / scene-picking.test.mjs；包含旋转缩放、共面不连通底座、隐藏父级、裁切、遮挡、拖动和取消。
- `node tools/check_monitor_fit.cjs`：9 台内沿全部测量成功，81 个表面采样点间隙均为 1 mm。
- 三种源画面的实际 canvas 像素边界符合等比适配，无四边重复留边：`Build/screen-fit-validation.json`。
- 本地截图已人工查看：`Build/screen-fit-wide.png`、`Build/screen-fit-b-side.png`、`Build/screen-click-focus.png`。
- 另有 `Build/screen-fit-classic.png`、`Build/screen-fit-portrait.png`、`Build/screen-fit-manager-side.png` 供复核。
- 实际 OfficeScene 隔离测试页点击屏幕和外框，镜头与成员按钮目标一致；先手动平移镜头再点击，确认重新聚焦。选座模式下 picks=0，selected=0；右键、拖动和临时实体遮挡均不增加 focus 次数。
- `Build/screen-click-validation.json` 保存镜头位置和事件计数。该隔离页不连接账号、语音或共享服务，不代替正式多用户验收。

## 文件交接

- 生产：OfficeWeb/src/monitorScreens.ts、monitorSurface.ts、scenePicking.ts、OfficeScene.tsx、sceneProbe.ts。
- App.tsx 的 onFocusScreen 接线与 media.ts 原比例 JPEG 由后端工程师修改。
- 测试：OfficeWeb/test/screen-fit.html、screen-click.html、monitor-surface.test.mjs、scene-picking.test.mjs。
- 辅助运行器在 tools/，本地服务器端口 5199；不部署测试页面或改 UE、模型、顶部 UI、景深。
