# 工位相机与前景裁切 · 2026-09-14

- 点击列表及物理屏幕共用工位视角：水平距离由0.62米改为2.15米，视线抬高以避开坐着的人物；竖屏按视口比例后退。
- 保留完整显示器、底座、键盘和周围办公环境。
- 工位聚焦时启用临时近景裁切，保留焦点前方1.25米范围；切换总览等预设后恢复0.1米普通近裁。
- 原有墙体自动裁切保留；点击与右键射线使用相机near，避免被已裁掉的前景对象截获。
- 未修改模型/材质/通信/聊天/后端。

## 文件与验证
- OfficeWeb/src/OfficeScene.tsx、workstationView.ts、monitorContext.ts；test/workstation-view.test.mjs。
- 五项专项测试通过，覆盖两个朝向和宽/窄视口的完整屏幕及桌面入镜、近裁与总览恢复、现有多层墙裁切回归。
- TypeScript与构建通过，项目文本行数检查无超过500行。
- 本地真实浏览器查看普通工位、老板工位、手机有坐姿人物的反向工位；初次手机人物遮挡已通过抬高视线修正。
- 截图Build/workstation-view-a1.png、workstation-view-manager.png为初次后退视角；最终抬高后手机证据Build/workstation-view-mobile.png。
- 备份Build/Backups/WorkstationView20260914。
- 发布待与助理/后端任务协调，防止包含尚未完成的并行修改。

- 最终桌面有坐姿人物截图：Build/workstation-view-final-desktop.png，显示器全部边缘与底座均可见，人物在屏幕下方。

## 正式核验
- 助理统一发布B3RovUWT/DE_G6PVl，服务active且哈希匹配。
- 本任务正式浏览器确认实际加载B3RovUWT，点击老板列表进入新后退/抬高视角，完整屏幕、底座、键盘及环境可见；截图Build/workstation-view-online.png。
- 浏览器和Electron加载同一前端，客户端重新加载即可获得相机更新。
