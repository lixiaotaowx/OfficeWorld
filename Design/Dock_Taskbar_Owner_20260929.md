# 单击任务栏空白处头像条闪烁：原生 owner 修复

> 已被 0.1.35 撤销：owner 隐藏与降级会传递到头像，旧测试未覆盖。
> 复现证据和替代实现见 [Dock_Independent_20260929.md](Dock_Independent_20260929.md)。

用户确认 0.1.33 的快速恢复仍能看见闪烁，因此不再把 80ms 补救视为根治。

新增 `OfficeDesktop/dock-taskbar-owner.cjs`，通过固定版本 koffi 3.3.2 调用
FindWindowW / GetWindow / SetWindowLongPtrW / IsWindow。只改头像窗自己的
GWLP_HWNDPARENT，将 Shell_TrayWnd 设为顶层窗口 owner；不修改 Explorer 的
样式、窗口过程或位置，不使用 SetParent/WS_CHILD（预览与招手窗口仍可向外展开）。
根据 Windows 的 owned-window 规则，系统直接保持头像窗在任务栏上方。
绑定后停止 80ms 快速 moveTop，并跳过每 1500ms 反复设置 topmost/moveTop。
定期跟随仍检查 owner，Explorer 重建后重新绑定；原有窗口异常销毁重建继续有效。
如果 native 不可用或 owner 被系统拒绝，保留旧的提层兜底，`ownership()` 可查错误。

参考：[Windows 窗口关系](https://learn.microsoft.com/en-us/windows/win32/winmsg/window-features)
及 [SetWindowLongPtrW](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowlongptrw)。

验证结果：

- 153 项桌面单测通过，包含绑定幂等、零返回成功、任务栏重建、native 失败、隐藏规则。
- `test/taskbar-owner-native.cjs` 使用隔离的真实 Electron 窗口：旧方式实际被另一个
  topmost 窗口盖住；建立 owner 后，同样的 100 次重排每一次立即保持顺序，没有定时等待。
- 与真实 Shell_TrayWnd 绑定成功、层级正确、不抢焦点、隐藏/显示、300px 弹窗展开通过。
- 关闭测试 owner 后，Electron 收到 owned 窗口的 closed 事件，可走既有 ensure 恢复路径。
- 从实际 app.asar 加载原生模块再次完成上述测试；原生依赖已随包携带，既有打包审计通过。
- 测试证据：`Build/taskbar-owner-native.json`、`Build/taskbar-owner-packaged.out`。

边界：未修改或重启用户已安装客户端；未声称已录到用户单击任务栏时的逐帧画面。
computer-use 对正在运行的透明头像窗截图超时；原生集成测试使用独立测试窗口完成。
用户安装新版本后的实际任务栏操作视觉验收待确认。

已发布 0.1.34，构建目录 `Build/OfficeDesktopRelease034`，网站前端不变。
正式更新清单已是 0.1.34，公网完整下载安装包核验通过：101723096 字节，SHA256
`d5d9030f6e8a731949977e614eb01d99e44c3d83982fd4f3aef0ca2815759668`。
