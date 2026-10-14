## 2026-10-14 状态卡片完整测量与 16:9 预览

- 修正上一轮预览固定 96px 高造成的过宽容器，改成 aspect-ratio:16/9、height:auto，原图继续 object-fit:contain，不拉伸。按钮继续在预览和状态文字下面横排。
- 状态文字会增加卡片内容高度。dock-popup-stack 受当前视口 max-height 限制，旧 measure 只读被裁剪的 getBoundingClientRect 高度，再加 18px 请求原生高度，可能按每轮 6px 逐步增长。改成 max(scrollHeight,bounds.height) 后一次申请完整内容空间，不依赖当前窗口能否完整容纳。不是发现状态数据的无限循环，而是尺寸反馈。
- 浏览器覆盖三成员 × 横屏 / 竖屏 / 方形图片（真实解码后核对尺寸），预览容器均 16:9、按钮同一横排。250px 高窗口 + 长状态文字可复现内容被裁剪，断言一次报告 cardPx 已包含完整 scrollHeight，稳定 600ms 布局上报不增长，并按申请高度扩窗后检查状态与按钮完整可见。本地及正式资源回归通过，会议按钮回归通过。
- 构建与 90 项公共资源校验通过，发布 dock-C7mqNYbK.js / dock-xNsw3Q0w.css 及依赖，10 项公网文件 SHA256 一致；入口备份 officeweb/backups/hover-status-ratio-20261014/。无原生安装器、后端、正式存档变更，客户端 0.1.46 重新打开加载页面。Elsa 的物理窗口截图仍未读取成功，不宣称完成她现场的复验。

