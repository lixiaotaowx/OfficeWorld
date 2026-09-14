# 三维渲染节能

## 行为

- 活动相机、行走或在线同事移动：最多60帧/秒。
- 前台静止：最多10帧/秒；窗口失焦但仍可见：最多10帧/秒（用户追加要求）。
- document.hidden或三维区域完全离开视口：不调用三维renderer.render。
- 设置中可手动暂停三维，画面内可恢复；点击成员或切换场景视角也会恢复。
- 暂停期间本地人物仍以100ms定时更新位置，已开始的路径继续，正常报告状态。
- 不停止Socket、LiveKit、麦克风、屏幕采集、聊天或3秒工位预览。
- 不卸载场景和GPU资源，以便立即恢复；因此此项主要降低绘制负担，并非释放全部显存。

## 实现

- sceneLoop.ts独立管理帧调度与可见性，不访问媒体对象。
- OfficeScene拆开本地位置模拟与GPU绘制，恢复时清除累积时间，防止人物或相机跳跃。
- 相机插值及OrbitControls阻尼按实际帧间隔换算，避免降帧后操作变慢。
- OfficeAvatar支持显式dt，后台100ms模拟不因原50ms上限导致路径速度减半。
- 未降低贴图分辨率、像素比、模型复杂度或阴影品质。

## 验证及限制

- 模拟120Hz调度测试通过：60/30/15帧上限、隐藏零绘制但模拟继续、重复恢复不产生多个循环、销毁取消调度。
- 完整浏览器：静止2秒60帧，手动暂停3.4秒零绘制且采集/工位JPEG继续，恢复后重新绘制。
- 测试派发visibilitychange并模拟document.hidden：隐藏零绘制、恢复正常；不是物理最小化实验。
- 证据Build/workstation-preview-evidence.json、scene-paused-preview-running.png。
- 没有采集用户设备GPU百分比，不将减少渲染次数声称为某个固定GPU降幅。
- 浏览器自身的后台节流、冻结与操作系统休眠不受应用控制；不承诺设备休眠仍保持会话。
- 屏幕编码/解码仍有GPU或CPU成本，三维暂停不等于整个浏览器GPU占用归零。

参考：[MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)。
