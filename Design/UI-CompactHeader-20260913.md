# 紧凑单行顶栏 · 2026-09-13

## 修改
- 接续助理未发布的顶部合并：App.tsx 保留唯一 header.rail，将品牌、导航、在线状态、面板切换与设置放在同一行。
- 品牌精简为 OFFICE / 一起在场；移除 Good work 独立横栏及过时标题 CSS。
- 顶栏高度56px，场景距顶64px；相较初始 Atelier 双栏距顶174px多出110px可用高度。
- 保留360px双列成员面板、全部通信调用、会议状态条与屏幕邀请。会议状态条顶部72px，与顶栏间隔16px。
- 仅 App.tsx 顶部、workspace-ui.css、workspace-responsive.css；未改媒体、三维屏幕、后处理或后端。

## 本地验证
- TypeScript与生产构建通过，Build/OfficeWebCompactHeaderCheck。
- 快照构建 index-wzkgSXs2.js / index-D1fgA_EZ.css。统一集成后须重新构建，勿直接发布此快照覆盖其他任务。
- 修改文件行数435/255/104，均不超过500。
- 1280×720：顶栏56px、场景顶部64px、侧栏360px，工位网格155px+155px。
- 768×900、390×844、320×720：无横向溢出，顶部按钮不重叠且均处于可视范围。
- 真实浏览器验证收起侧栏、从顶部聊天重新打开侧栏、切回成员；320px会议弹层完整可操作。
- 仅使用本地隔离账号，未采集麦克风/屏幕；未重新验证多人音视频。
- 截图：Build/compact-header-desktop.png、Build/compact-header-mobile.png。

## 交接
- 本轮未部署，由助理合并后统一发布。线上当前版本不作为本次单栏结果。
- App.tsx已交还后端工程师以最小补丁集成PrivateCallPanel，顶栏保持。
- 备份：Build/Backups/UI-CompactHeader-20260913。

## 独立发布基线核验
- 应助理要求，将正式HTTPS返回的index-CdI-nBPx.js与17:44:41构建index-wzkgSXs2.js逐字符比较。
- 公共前缀1,311,897字符、公共后缀10,694字符；全部差异只有顶部JSX旧2068字符/新1847字符。
- 已逐段检查：仅导航header语义、品牌、连接状态/面板按钮迁移、删除旧标题行；通信、场景与屏幕代码逐字一致。
- 差异证据Build/compact-header-baseline-change.txt及compact-header-new-change.txt。
- 故本构建可作为独立顶部UI发布候选；只上传index.html和两个哈希JS/CSS，不上传旧public资产/后端。由助理执行，不从正在修改的共享树重建此独立版本。
