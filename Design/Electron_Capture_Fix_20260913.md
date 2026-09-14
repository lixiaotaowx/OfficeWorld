# Electron 0.1.1 采集修复

实际Electron44请求getDisplayMedia时先发mediaTypes为空数组的media权限请求，旧实现只允许audio而误拒绝。
现允许可信主帧的该请求进入显式选择器；空origin使用Electron提供的embeddingOrigin校验。
摄像头仍拒绝，必须有用户手势；取消不采集，不自动共享或捆绑系统声音。

- 9项权限测试通过；Build/desktop-capture-trace.json记录实际请求顺序。
- 真实选择器/preload/IPC集成：工位、私聊、会议均收到1568×1070帧，audio0，停止成功。
- 采用合成自有页面作为来源，没有录制用户桌面或麦克风；跨设备真实共享仍需人工复核。
- Build/desktop-capture-integration.json记录；最终EXE隔离启动加载正式站成功，保留sandbox/contextIsolation。

文件：Build/OfficeDesktopRelease/OfficeWorld-0.1.1-Windows-x64.exe

SHA256：dab0fb6d868863fd59859a8800f26cedb4263b3b5022e02b9abe10d61387f0f7

关闭旧客户端后打开此新文件；网页刷新不能更新旧EXE权限代码。仍为无自动更新的未签名便携包。
