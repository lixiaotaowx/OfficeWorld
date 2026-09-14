# EXE自动登录与工位低清预览

## 交付

- 客户端：Build/OfficeDesktopRelease/OfficeWorld-0.1.2-Windows-x64.exe，100125164字节。
- EXE SHA256：ecd7fc2edc0aa00d029a5fa7fd377020988687fc78b68166aed669ead694cdc7。
- 正式站：https://115.159.43.237/；入口B3RovUWT / DE_G6PVl。
- JS SHA256：f863377dc70a4d8acd5851ab524ef0ccafd6a3cd001519ab7b589fd08c4172fb。
- CSS SHA256：67686d80d6d44aa2e8cd697eeeb39cb88ae44bbaaf6255dc73f18eccb59f2c79。
- 新能力需新版EXE预加载桥接，旧版EXE不会仅靠网页刷新获得。

## 行为与边界

- 优先恢复30天HttpOnly Cookie；没有Cookie时使用首次成功登录后由Windows safeStorage加密保存的信息。
- 页面加载失败和登录接口暂时失败分别重试，5秒递增至30秒；网络online事件可提前重试。
- 主动退出删除加密登录；无效旧Cookie或被顶下线不自动再抢登录。原有单账号规则保留。
- 登录、Socket加入并持有工位后自动预览；主屏默认，选择持久化，拔屏回退。
- desktopCapturer只枚举screen，不枚举window，按需生成JPEG55质量、最长边480，间隔3秒；不申请麦克风、不建立高清流。
- 仅自己的3D显示器右键弹菜单；右键拖动保留平移，别人的显示器不会出现换屏菜单。
- 预览开关/暂停停止截图；断线时停止广播，重连重新加入后恢复；关闭EXE终止采集。
- 低清ambient-sharing与高清sharing分离；高清私聊/会议采集仍由选择器控制。
- 主进程校验正式origin、主窗口和主frame，预加载无任意IPC/Node/文件接口。

## 验证

- 82项网页业务/图形/权限测试及TypeScript、正式构建通过。
- 10项桌面单测通过，含多屏选中/断开回退、原比例、IPC权限、加密、网络错误页重试。
- desktop-bridge-integration.cjs：真实Electron沙箱预加载与IPC、Windows真实加密/删除、非可信域拒绝；屏幕使用合成双屏，未读取用户桌面。
- desktop-auto.cjs：最终完整网页+隔离认证服务器，503后自动重试、保存信息登录、3秒画面回到自己3D屏幕、无picker/audio/浮窗、右键切屏/禁止他人屏幕、右键拖动、暂停/恢复、刷新/退出/再次保存，零页面错误。
- 最终EXE隔离冒烟启动成功，正式HTTPS证书检查正常；前端两文件实际HTTPS哈希与本地一致，五个后端远端哈希一致，service active。
- 证据：Build/desktop-auto-browser.json、desktop-auto-integration.json、desktop-screen-menu.png。
- 用户真实多显示器热插拔和跨设备长期断网体验仍需实际使用复核，不能把合成双屏测试当作用户硬件已验收。

## 同批发布

- 已包含工位相机后退/前景裁切：WorkstationView-20260914.md。
- 已包含语音后屏幕按钮、私聊/会议单人共享接替：Screen_Takeover_20260914.md。
- 后端更新server/accounts/privateSessions/meetings/livekit，备份backups/desktop-auto-20260914；未覆盖账号、工位、聊天数据或.env，未重启LiveKit。
- 保留公共/私聊权限隔离。回滚只能使用本次备份，不可回退到无私聊隔离的旧后端。
