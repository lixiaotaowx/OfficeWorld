# 头像要点击任务栏才出现：0.1.34 回归修复

## 查到的缺陷与证据

当前安装包根 package.json 确认为 0.1.34；旧 which-client 的全包正则会误读 koffi 3.3.2，
版本必须读 app.asar 根 package.json。未修改或重启用户客户端。
读取用户现有 dock-why.json：shown，pageVisible/manual=true，system/taskbarGone=false。
原生快照显示头像 HWND 264932 仍绑定 Shell_TrayWnd，当前可见、未 cloaked、topmost。
这是一帧静态状态，不能冒称已捕获用户点击前的消失瞬间。

确认的 0.1.34 设计缺陷：通过 GWLP_HWNDPARENT 把头像设为任务栏 owned window，
并在绑定成功时跳过 raise 与快速 guard。owner 关系除了保持相对顺序，
也带来了隐藏、置顶降级和生命周期耦合。

真实 Electron/Win32 隔离测试复现：

- 对测试 owner 调用 ShowOwnedPopups(false)，头像 isVisible() 立刻变为 false。
- 将测试 owner 从 topmost 降级，头像 WS_EX_TOPMOST 也被清掉。
- 0.1.34 的成功条件只是 owner 句柄相等，不能证明头像仍可见或处于 topmost。
- 之前的 100 次 moveTop 测试只覆盖升层，不覆盖隐藏、降级；此前验收范围不足。

参考：[Window Features](https://learn.microsoft.com/en-us/windows/win32/winmsg/window-features)、
[SetWindowPos](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowpos)。

## 修复

0.1.35 的 dock-window 改用 dock-z-order，窗口独立、不再绑定 Explorer。
保留旧 owner 模块与测试作为历史回归复现代码，生产窗口不再引用它。
监听前台、任务栏及本窗口变化，合并事件后按既有显示策略检查。
仅当原生 topmost 丢失或任务栏实际排到头像上方时修复。
SetWindowPos 使用 NOACTIVATE/NOMOVE/NOSIZE/NOOWNERZORDER，不抢焦点、不显示故意隐藏的窗口。
Windows 部分 SetWindowPos 变化实测不会触发对应事件，额外每 250ms 检查原生状态；
正常状态不反复改层级，不依赖鼠标在任务栏，正常检查不读配置或写日志。
全屏、共享、退出登录、手动关闭仍服从已有规则；关窗释放 hook、定时器和回调。

## 验证与发布

- 全部 155 项桌面单测通过；最终事件筛选改动后相关 23 项复测通过。
- 原生隔离测试：两种 owner 回归复现；20 次无鼠标输入降级恢复；稳定时零额外提层。
- 打包 app.asar 中加载原生模块，同一组测试通过，不抢焦点、主动隐藏仍有效。
- 真实 createDockWindow + 打包 preload + IPC + 构建头像页面：8 次无点击恢复；
  模拟全屏隐藏/恢复通过；真实桌面截图检出 425 个黄色头像像素，截图已查看。
- Build/dock-independent-native.json、dock-independent-packaged.out、dock-independent-app.out。
- 实际头像桌面截图：Build/dock-independent-avatar-screen.png。
- 安装器：Build/OfficeDesktopRelease035/iruler-dream-Setup-0.1.35-x64.exe。
- 正式 latest.json=0.1.35；公网完整安装器 101724823 字节与本地匹配。
- SHA256：6f13040dd55fb138b8a187d4848d3e53f8a32d5517c60bcde0e44303ff4e1493。
- 旧清单备份：/home/ubuntu/officeweb/backups/dock-independent-20260929/latest.json。

网站前后端未改。用户当前运行的 0.1.34 未强制退出；必须更新桌面包才能加载修复。
尚待用户真实使用场景验收，不把隔离窗口复现说成已录到用户原始点击过程。
