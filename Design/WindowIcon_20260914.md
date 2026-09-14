# Windows 图标修复 · 0.1.5

- 窗口显式设置用户提供的 ICO，并向 Windows Shell 设置应用身份、名称及稳定磁盘图标路径；Shell 不再需要读取 app.asar 内的 ICO。
- 使用便携启动器的 PORTABLE_EXECUTABLE_FILE 作为重新启动目标，避免固定到临时解压目录。
- 主进程持有托盘引用直到退出。
- 14 项单测通过；真实 Electron 及打包 asar 验证磁盘 ICO 与源文件相同、关闭隐藏、后台合成音视频持续、托盘恢复与退出清理通过。
- 未声称已经观察用户现有任务栏缓存；旧固定快捷方式可能仍使用旧图标。
- 当前没有开机自启开关，未修改用户注册表或启动文件夹。免安装客户端可使用 Electron setLoginItemSettings，必须指向固定的便携 EXE 路径；自启功能仍待实现。
- 原工程备份 Build/BeforeWindowIcon20260914。
- 登录回填修复仍因服务器上传审批拒绝而未上线，见 LoginRemember_20260914.md。本版本只修复本机桌面图标。
