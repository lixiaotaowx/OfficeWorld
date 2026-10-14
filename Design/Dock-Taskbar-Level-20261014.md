# 头像条跟随任务栏层级与全屏避让

## 行为

- 头像条保持独立窗口，位于任务栏紧上方，跟随任务栏的 topmost / 普通窗口层级，不再使用 screen-saver 置顶或周期 moveTop 抢到其他置顶窗口之前。
- 前台可见窗口覆盖头像条所在任务栏的整个显示器时收起头像条；退出全屏、切回普通窗口后自动恢复。普通最大化窗口只覆盖工作区，不触发全屏隐藏。其他显示器全屏不会隐藏本屏头像条。
- 页面隐藏、退出登录、手动关闭、软件自身全屏与外部全屏的理由保持独立。来电、状态、悬停布局更新不能绕过全屏避让。
- 保留独立窗口，避免重新引入 Explorer owner 导致的隐藏 / 降层后恢复异常。不修改 Explorer 或其他应用的窗口属性，不注入输入、不抢前台。

## 实现

- `OfficeDesktop/dock-desktop-state.cjs` 只读前台窗口、可见 / 最小化 / cloaked 状态、窗口类、DWM 可见边界与任务栏所在显示器边界。两者统一物理像素，支持负坐标 / DPI；排除桌面和任务栏窗口。
- `dock-z-order.cjs` 原生事件监听增加前台窗口尺寸变化；250ms 兜底观察在临时隐藏期间仍工作，避免退出全屏后等待鼠标经过任务栏才恢复。健康状态只读；有序插入到任务栏之前，不越过已有更高层窗口。Windows BOOL 使用 int32_t；GetMonitorInfo 的 cbSize 是输入输出字段。
- `dock-window.cjs` 统一显示决策新增 fullscreen 原因，创建 / 降级路径保持普通窗口，删除无法判断全屏的 taskbarGuard 抬升路径。观测失败不升级为强制置顶。
- 原生依据：[SetWindowPos](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowpos)、[DwmGetWindowAttribute](https://learn.microsoft.com/en-us/windows/win32/api/dwmapi/nf-dwmapi-dwmgetwindowattribute)。

## 验证

- 桌面全量 170 项通过；补充负坐标显示器、其他屏幕、最大化、桌面 / cloaked / 最小化排除、任务栏降层与恢复、停止监听、外部全屏与页面 / 手动隐藏组合测试。
- `test/dock-fullscreen-native.cjs` 使用隔离 Electron 窗口、实际 Win32 观察和正式 dock-window：三轮全屏进入 / 退出；全屏期间连续布局变化仍不可见；退出无需鼠标恢复；普通最大化仍可见；页面隐藏不被退出全屏覆盖；前台焦点未被抢走；头像条紧邻任务栏且 topmost 标记匹配。
- 源码及最终 ASAR 两次原生验证通过。ASAR 内三项层级模块、鼠标模块、现有权限模块与源码逐字节一致，版本 0.1.48。
- 原生测试曾因隐藏启动参数使测试播放器首个 ShowWindow 被系统隐藏而失败，夹具现在先循环一次自己的显示状态，再断言 Win32 可见后测试全屏。另修正 GetMonitorInfo 输出声明，确保输入 cbSize 保留。没有将夹具问题称为用户现场复现。
- Windows 10 当前机器原生验证完成；浏览器 / 外部播放器遵循相同窗口边界规则，但各播放器、Windows 11 与物理多显示器仍未逐一人工验收，多屏判定通过单元测试。证据：`Build/dock-fullscreen-native.json`。
- 本轮只发原生客户端，不更新正式网页入口、后端或业务存档；用户需要安装新客户端，网页刷新不足以生效。
