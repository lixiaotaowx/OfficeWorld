# Electron Windows 客户端 · 2026-09-13

## 用户要求与实现
- 保留浏览器，同时提供Windows exe；用户明确客户端不再弹麦克风网页授权框。
- 新OfficeDesktop独立项目，Electron44.3.0、electron-builder26.15.3，加载正式HTTPS网站。
- 仅正式主框架音频权限由应用自动批准，不申请摄像头；麦克风和屏幕共享分开。
- 屏幕共享用独立本地窗口选择器，必须用户触发并选择窗口；取消不采集，无自动整个桌面授权。
- 选择器只暴露一次性的选择IPC，网页不具备Node或文件访问能力。
- Windows系统禁用麦克风需用户在系统设置开启，提供固定设置入口；不绕过系统权限。
- 浏览器保持原生权限机制；getDisplayMedia不可记住授权，见https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia。
- 不新增音视频录制、系统声采集或自动更新服务。网页更新自动随正式服务加载。

## 交付
- Build/OfficeDesktopRelease/OfficeWorld-0.1.0-Windows-x64.exe，100127411字节。
- SHA256:4741f1663866530f403f3f6f036bb9daa0cdb8800d5e375c17f24134d80971d3。
- 便携exe，无需Node；须联网。未代码签名，Windows可能提示未知发布者。
- 源码OfficeDesktop；本轮不修改/重新发布OfficeWeb网站。

## 验证
- 7项测试通过：正式来源白名单，音频自动授权不弹窗/不枚举桌面，摄像头/子框架/外域拒绝，屏幕必须用户操作，取消不采集，仅选定源不混入音频。
- 最终便携exe在正常Windows环境以隔离配置启动，成功加载https://115.159.43.237/，标题Office·一起在场，自动退出。
- 证据Build/electron-packaged-smoke.json；同一检查也在源运行时通过。
- 沙箱执行器的GPU子进程曾因宿主执行权限失败，正常Windows复测通过；应用Chromium沙箱保持开启。
- 启动检查禁用全部采集权限，没有录制用户声音或屏幕。
- 尚未实际验证实体麦克风、窗口选择、真实双设备音视频互通；不得将单元/启动测试冒称这些实测完成。
