# 登录记忆与简化找回密码

## 已发布：记住密码

AccountGate 原先在请求认证前保存输入，登录失败也会把正确的本机密码替换成错误密码。
现仅在服务端确认成功后调用桌面 saveLogin；仍由 safeStorage 加密保存。
被其他设备顶下线、会话过期保留记忆；主动退出登录仍按既有规则清除。
网页浏览器保留会话 Cookie，不增加明文密码存储。

构建：Build/OfficeWebAuthRecovery20260929；正式 main-DM4UMfvi.js / main-CgZrxncf.css。
公网入口与七个 JS/CSS SHA256 全部匹配；真实浏览器登录页正常、无页面错误。
首次仅发布记忆修复时，找回密码入口保持关闭，证据：Build/login-memory-live.png。
后续用户明确接受风险后已启用找回密码，见下节。

## 已发布：找回密码

表单沿用姓名，只需填写新密码，成功即登录；保留原账号身份、角色外观及其他归属。
本地 /api/auth/reset-password 更新盐与哈希，撤销旧会话；落盘失败回滚密码与会话。
请求有同源检查、长度限制与频率限制，但这些不能代替账号所有权验证。
仅凭姓名即可重设任意账号密码，会允许知道姓名的人接管账号。
自动审批最初拒绝完整部署；用户随后明确回复“接受这个风险，按姓名直接改密码并上线”。
获得明确确认后完整部署已成功：accounts.mjs 哈希一致，officeweb 重启后 active。
正式服务已声明 recoveryEnabled:true，真实浏览器点击找回密码后新密码表单正常显示。
公网入口与七个代码资源哈希一致；接口空请求返回400，未修改真实账号密码。
备份：backups/auth-recovery-20260929；截图：Build/password-recovery-live.png。

## 验证

- node --test test/password-reset.test.mjs test/accounts.test.mjs test/restore-login.test.mjs 通过。
- 浏览器 login-memory 回归通过：失败登录不覆盖、重设后保存新密码、重载回填、主动退出清除。
- 密码重设测试包含旧密码拒绝、新密码成功、旧会话撤销、保持外观身份、持久化及失败回滚。
- TypeScript 检查与独立 Vite 构建通过；本地找回表单截图 Build/password-reset-form.png。
- 测试账号均隔离，未创建正式账号或更改真实密码。
