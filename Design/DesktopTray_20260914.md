# 客户端托盘与图标 — 2026-09-14

- 版本 0.1.3，继续提供免安装便携 EXE，本次未加入安装器或开机自启。
- 关闭主窗口改为隐藏，保留原 webContents、登录和通信；单击/双击托盘或“打开 Office World”恢复窗口。
- 托盘“退出 Office World”和应用菜单退出会销毁窗口及托盘；系统注销/关机允许正常结束。
- 托盘初始化失败时显示错误并保留关闭即退出，避免应用隐藏后无法找回。
- 图标原件实际路径：G:/my/ai/code/iruler-desk_new/dist/icon.ico。
- 原样复制到 OfficeDesktop/assets/icon.ico，用于窗口、托盘、内部EXE及便携启动器。
- 打包改用 signExecutable:false，保留图标资源写入；未改变现有代码签名状态。

## 验证

- 12 项既有自动测试通过。
- 实际 Electron 原生窗口/托盘集成测试通过：关闭隐藏、同一页面仍存活、托盘点击和菜单恢复、退出销毁。
- 隐藏期间合成 WebRTC 音频接收字节 5918 → 17258、合成共享画面 4230 → 13310，连接仍 connected。
- 上述集成测试对打包后的 app.asar 内模块和图标重复通过，使用独立用户配置，不访问用户媒体设备或正式账号。
- 最终便携 EXE 隔离烟雾测试加载 https://115.159.43.237/ 成功并正常退出；沙箱、上下文隔离和证书检查保留。
- PE 图标检查确认便携 EXE 和内部 Office World.exe 的图标数据与原 ICO 完全一致。
- 原项目代码同步前逐文件比较基线，备份位于 Build/BeforeDesktopTray20260914/。

## 交付

- G:/C/wendang/ChatGPT/youxi/Build/OfficeDesktopRelease/OfficeWorld-0.1.3-Windows-x64.exe
- 大小：100364536 字节。
- SHA256：08949f0021244535efe6d898ddabafcd188616ee2c546f2d703f63b857c89db9。
- 实测记录：DesktopTray_20260914/integration.json、package-icons.json、smoke.json。
- 网站代码与业务数据未改动。实体设备长时间通话、系统注销等既有端到端验收仍按 TODO.md 跟踪。
