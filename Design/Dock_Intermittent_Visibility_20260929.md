# 0.1.34 头像条偶发消失：尚未定位

用户报告：不操作也偶尔消失，点击托盘展开三角后恢复；通常显示正常。
不能再把已有的 owner 层级测试通过等同于解决所有消失问题。

本轮只读检查确认正在运行的已安装客户端为 0.1.34。
原生快照 `Build/dock-native-current.json` 中，头像窗可见、未最小化、
未被 DWM cloak，owner 为 Shell_TrayWnd，层级在任务栏上方；
头像条位置的三个命中测试也落在头像窗口。该快照没有捕获故障现场，
不能据此断言故障是层级遮挡，也不能证明屏幕像素正常绘制。

隔离实验 `Build/dock-owner-hide-repro.cjs` 对测试 owner 调用
ShowOwnedPopups(false)：Electron isVisible 与 Win32 IsWindowVisible
均从 true 变为 false，showInactive 后均恢复 true。
因此本机实验不支持“owner 隐藏后 Electron 可见性缓存仍为 true”的猜测。
实验没有对真实 Explorer 调用 ShowOwnedPopups，没有重启用户客户端。

下一步需要消失现场的原生层级、可见性与画面证据，区分遮挡、透明窗口
合成/绘制停止、页面内容消失。没有这些证据前不宣称已确定根因，
不以定时 hide/show、反复抢置顶或禁用 GPU 当作已验证的修复。

本轮未改变产品行为、未发布新版本。正式客户端仍为 0.1.34，问题未解决。
