# 头像浮窗按钮点击丢失（2026-10-14）

## 现场证据与原因

用户反馈看屏幕、分享屏幕、语音通话均偶发无反应，点击后卡片不收起、主窗口不出现；游客和没有工位也会遇到。按用户要求，没有点击同事头像按钮或发起真实邀请。

用户将鼠标停在失效按钮时，只读 Windows 诊断确认鼠标命中头像浮窗，窗口已启用，WS_EX_TRANSPARENT 未设置，也没有菜单或鼠标捕获锁。现场运行客户端为 0.1.48，安装目录 ASAR 中的 dock-window.cjs 使用 focusable:false。

在当前 Windows / Electron 44.3 中，生产 createDockWindow 创建的不可聚焦窗口对 WM_MOUSEACTIVATE 返回 4（MA_NOACTIVATEANDEAT），系统会吞掉用于激活窗口的鼠标点击。悬停可以正常显示，却不能据此认为按钮能收到真实点击。此前 webContents.sendInputEvent 绕过该消息，不能单独用来证明原生输入正常。

修复 focusable:true 后，同一隔离测试返回 1（MA_ACTIVATE），六组按钮命令均正确。showInactive 与原生 NOACTIVATE 定位继续保证弹出、悬停不抢焦点；主动点击才允许窗口聚焦。装饰区域穿透及任务栏层级逻辑继续沿用。

另发现私聊 share 跨 IPC 时遗漏一次性桌面捕获点击意图，仅 meeting-share 会授予。两者现在复用既有 receiver 绑定、5 秒到期、消费一次的许可；watch / call 不授予，非可信发送者不能授予。没有放宽系统权限或自动接听。

## 本轮修改

- OfficeDesktop/dock-window.cjs：可交互浮窗允许聚焦，保留被动显示与区域穿透。
- OfficeDesktop/dock-bridge.cjs：私聊 share 与 meeting-share 共用已存在的受信任点击意图。
- OfficeDesktop/test/dock-window.test.cjs、dock-bridge.test.cjs：窗口配置和一次性授权回归。
- OfficeDesktop/test/dock-buttons-native.cjs：生产窗口工厂、已构建 dock UI、离线命令记录，检查原生激活决策后再验证按钮事件；支持 DOCK_INPUT_PACKAGE 检查最终 ASAR。
- OfficeWeb/test/visitor-calls.test.mjs：隔离本地服务器上，游客与无座位成员双向发起三种邀请，只有模拟接收端明确同意才建会话。
- OfficeWeb/test/dock-rules.test.mjs：修正此前源码已改为去重 payload 后、旧断言仍匹配内联 layout 对象的问题，继续检查真实布局字段与发送调用。
- OfficeDesktop/package.json / package-lock.json：0.1.49。

## 验证

- 桌面全量 171/171；游客 / 私聊 / dock 相关网页测试 24/24。
- 浏览器 dock-hover-layout.cjs 通过：110ms 悬停、预览右侧按钮及对应命令。
- 网页构建与 90 项 public 资源一致性检查通过；本轮不发布网页或后端。
- 新原生用例在修复前首项失败（mouseActivate:4）；修复后源码与最终 ASAR 各通过成员 / 游客 × 三按钮，均 mouseActivate:1，逐次命令恰好一条，出现及悬停保持原前台窗口。
- ASAR 的 dock-window、dock-bridge、dock-pointer、dock-capture-intent、dock-z-order、permissions 六个模块与源码逐字节一致，版本 0.1.49。
- 证据：Build/dock-buttons-native-before.json、dock-buttons-native-source.json、dock-buttons-native.json；Build/dock-input-{desktop-tests,web-tests,browser,build,package,publish}.log。

原生用例使用离线桥，只记录命令，没有账号、正式信令或采集权限；WM_MOUSEACTIVATE 是直接查询，后续按钮按下 / 抬起仍使用 sendInputEvent，不把它称为用户现场物理点击或真实双机通话验收。测试创建的窗口自行清理，没有重启用户客户端。新的全屏原生回归启动被自动审核阻止，未重跑；沿用原有单测，且本轮未改层级模块，不声称重新验收所有播放器。

## 发布与人工复验

- 安装器：iruler-dream-Setup-0.1.49-x64.exe，101728705 字节。
- SHA256：fb5ca9e50b24062bc13e47fce51985e938134e7b9701bfdb2d9e066552375d4a。
- 下载：https://115.159.43.237/download/iruler-dream-Setup-0.1.49-x64.exe。
- 已发布；公网整包大小 / SHA256 与本地一致，latest.json 为 0.1.49（Build/dock-input-publish.log）。旧清单备份 officeweb/backups/dock-input-0.1.49/latest.json。
- 需要安装新版并重新启动客户端，仅刷新网页无法更新主进程。
- 请用户在其他应用位于前台时，分别测试三个按钮；游客无需安排工位。真实语音 / 分享 / 对方接受由用户自行操作。

另有独立边界：隔离诊断发现人为将 dock WebContents zoomFactor 设置为 1.25 时，CSS 命中矩形与原生 DIP 坐标可能不一致。本次现场命中与穿透状态正常，不能认定该边界为现场根因；未纳入本轮修复，列入 TODO 后续验证。
