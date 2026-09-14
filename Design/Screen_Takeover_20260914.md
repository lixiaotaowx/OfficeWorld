# 语音通话屏幕按钮与共享接替

## 行为

- 已接通私聊的“静音”“挂断通话”之后增加“分享屏幕”。已有语音关系，无需重复邀请。
- 私聊和会议同一时间仅一个屏幕发布者。后来者选好屏幕后接替原共享，原屏幕停止，语音保留。
- 取消浏览器选屏不改变原共享；结束共享不挂断通话或会议。
- 桌面原生低清工位预览仍独立，沿用 ambient-sharing，不替换为高清采集。
- 麦克风未指定 deviceId，继续采用浏览器/桌面程序默认音频输入，通常对应系统默认设备。

## 实现

- privateSessions.mjs 的邀请升级改为单 screenOwner；private-screen 在已获同意的通话中切换发布者。
- meetings.mjs 增加串行 meeting-screen claim/release，校验已加入成员。release 带 lease 防止旧停止请求误清除新共享。
- livekit.mjs 的发布权限只给当前共享者屏幕权限，先撤销其他人再授权新发布者，语音权限始终保留。
- 会议 token 默认只有麦克风；屏幕权限随 claim 更新。不是仅在接收端隐藏旧画面。
- 新的 meetingScreenShare.ts 管理采集、接替、系统停止、房间退出和断线清理；media.ts 更新私聊发布/撤销。
- SFU 的权限通知可能晚于 Socket.IO ACK，screenPermission.ts 等待本地媒体权限就绪后才发布，避免偶发 insufficient permissions。

## 验证

- 全部 82 项自动测试通过，TypeScript 类型检查通过；本轮文件均低于 500 行。
- screen-takeover.test.mjs：私聊单发布者、第三人拒绝、会议串行接替、旧 lease 释放不影响新端。
- 更新 private-calls.test.mjs 的旧双屏预期为单屏独占，保留语音与结束检查。
- test/browser/screen-takeover.mjs 使用两个独立浏览器、隔离账号/本地信令及真实 VPS SFU，合成麦克风和画布屏幕。
- 实际 PrivateCallPanel 按钮：语音接通→A 共享→取消 B 选屏保留 A→B 共享接替；A 原始采集停止，A 解码 B 新画面。
- 会议同样验证取消选屏、接替后旧采集停止、新画面帧增加、两端音频能量持续增长及停止/结束清理。
- 修复权限通知竞态后联测两次通过，零页面错误。截图 Build/private-screen-takeover.png 是隔离组件验证，不是正式站截图。
- 未进行真实跨网络双硬件人工通话；测试不发送正式聊天消息或创建正式测试账号。

## 发布交接

- 和桌面预览/自动登录任务统一发布，本任务不并发部署。
- 后端需上传 server.mjs、privateSessions.mjs、meetings.mjs、livekit.mjs；前端重新构建。
- 保留最新公共/私聊 chat-access 权限、桌面 ambient-sharing、EXE 预览、内存及坐姿功能。
- 完成时的正式发布信息以 Deployment.md 后续记录为准。

## 正式站核验

- 已随桌面任务统一发布，正式站资源为 index-B3RovUWT.js / index-DE_G6PVl.css；HTTPS 下载内容与发布目录 SHA256 一致。
- 正式 server.mjs、privateSessions.mjs、meetings.mjs、livekit.mjs 完整 SHA256 均与本地一致，officeweb 服务 active。
- 正式发布备份为 backups/desktop-auto-20260914；未另外重复部署。
