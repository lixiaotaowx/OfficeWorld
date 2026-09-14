# 通信修复与证据（2026-09-13）

正式站点：https://115.159.43.237/

## 原因与修复

1. 客户端 2.22.3 与共用 LiveKit 1.8.4 存在协商兼容问题。真实双端测试出现约15秒周期的 negotiation timed out、主动离开和重新发布；服务器已经见到音轨，客户端发布承诺仍未完成。2.22.3 的 PCTransportManager 以 OfferAnswered 的 offerId 大于本次 checkpoint 作为完成条件；旧服务端协商确认与此不匹配是源码推断。保持同一服务器、网络与媒体输入，将客户端固定到2.17.2后，音频和屏幕的完整回归通过。未修改共用 SDK 安装或升级/重启共用媒体服务。
2. 应用退出没有等待异步媒体操作；旧房间回调可删除同名新连接。新增 mediaRooms.ts，按房间世代隔离、排队发布和清理，退出立即停止已发布轨道，等待操作结束后关闭 PeerConnection，新连接等待旧连接清理。
3. 权限选择器返回时房间可能已离开。mediaPublication.ts 在采集后重新检查连接与取消状态；取消时停止采集，不继续发布。
4. 会议和一对一通话共用原始麦克风流，静音与停止相互影响。改为每个 LiveKit 房间独立拥有轨道并用 publication mute/unmute；会议状态来自真实 publication，操作期间防重复点击。
5. 工位共享停止仅停止原轨道，可能残留 publication。现明确取消发布独立克隆轨道；共享开始的异步权限结果带世代检查，旧采集不能覆盖新采集。
6. SDK 最终断开后会议可重新取令牌连接；临时重连交由 SDK。信令断开清理已失效的一对一会话和工位共享，保留会议麦克风意图供重新加入。浏览器阻止音频自动播放时，后续点击会调用 startAudio。
7. 后端离开/移出媒体为异步操作，快速重进可被迟到的 removeParticipant 移除。meetings.mjs 在接受重进前等待旧移除完成并重新检查会议存在与权限；有延迟移除专项测试。

上游资料：[2.22.3 协商实现](https://github.com/livekit/client-sdk-js/blob/v2.22.3/src/room/PCTransportManager.ts)、[兼容客户端发行版](https://github.com/livekit/client-sdk-js/releases/tag/v2.17.2)。不要只根据连接成功判断媒体已可用。

## 发布

- 前端入口 index--R4vf-D0.js，CSS保持 index-OZQMCNrs.css。
- 正式 HTTPS GET 脚本返回200，SHA256：6976ef4cfacce1d573ad9f3837de24a64ca949f30690cf69f3e990accab7b63e。
- meetings.mjs SHA256：ae1aeca9b4b2f973267647e526073dc2ad9cc56d8d648a0fdcdc2e6b09045a9b。
- 原目录最新前端与线上 index-MpP5jpT9.js 为基线；源码对照确认除本次相关文件外没有前端差异。
- 通过部署锁和旧入口检查避免覆盖其他发布。备份：/home/ubuntu/officeweb/backups/media-20260913/。
- 仅更新入口、新哈希资源、meetings.mjs 和 package.json；应用服务重启后 active。账号、state、chat-data、.env 未覆盖。共享 LiveKit 服务未重启。
- 构建产物实际目录 Build/OfficeWeb。源码中的客户端版本必须保持2.17.2；已安装依赖也必须匹配，不能只修改 package.json 后继续用旧 node_modules 构建。

## 已通过的验证

- npm test：51项中50通过，1项因本地无媒体密钥跳过；包含6项新增异步竞态测试。
- TypeScript与Vite生产构建通过；OfficeWeb项目文本文件检查无超过500行（外部依赖运行时不是项目源码/参考副本）。
- VPS隔离业务服务使用当前正式后端副本，测试账号文件与正式名册隔离；媒体仍走正式VPS LiveKit与wss反代。
- 两个独立浏览器上下文：会议双向音频非零能量及持续接收字节；5次静音/开麦；屏幕3次开启/停止/再次开启，接收端解码帧增长；反向共享、系统ended清理；离开重进；2秒offline/online后双向音频及再次共享。
- 工位共享经过真实请求/同意信令，远端收到视频，3次停止/重开通过；一对一语音双向接收、3次静音/开麦与结束清理通过。
- 正式HTTPS页面实际加载新入口，查看远端画面截图；业务账号通过测试代理路由至隔离VPS服务。重复音频、屏幕、离开重进测试零页面异常通过。
- 通过声音振荡器与动态画布生成输入，接收轨道经真实SFU传输；没有采集用户桌面或录制用户声音。这不是原生设备人工验收。

## 证据文件

- media-evidence.json：最终候选在无业务代理的隔离站完整回归，包括断网恢复。
- media-production-evidence.json：正式HTTPS资源加载与媒体回归（业务信令隔离）。
- media-private-evidence.json：工位共享及一对一语音。
- media-production-receiver.png：正式页面接收另一浏览器动态画面，已实际查看。
- media-production-proxy-offline-evidence.json：保留代理模拟断网产生的WebSocket关闭错误；该运行媒体恢复，但不计为零错误通过。无代理的隔离站断网测试通过。

测试脚本在 OfficeWeb/test/browser/media-*-regression.cjs；默认隔离隧道端口3200，运行前先启动隔离服务。私聊测试先从项目根目录执行 node OfficeWeb/test/browser/build-media-harness.cjs，再执行 media-private-regression.cjs。测试工具不发布到正式网站。浏览器运行时路径沿用本机项目工具，换机器需调整。

## 未完成及用户最小验收

- 两台不同网络设备的真人麦克风、扬声器、真实桌面选择器与播放权限体验未验证。
- 长时间断网、设备拔插、受限网络和TURN/TLS回退未覆盖。
- 当前兼容客户端仍先探测/rtc/v1，旧服务器返回404后成功回退。未来升级共用服务及客户端要独立评估并跑同样回归。
- 用户双方刷新正式页面，重新创建/加入会议，交替说话，各重复开关麦克风和共享两次；另一台确认有声音和变化画面。原生屏幕权限必须由用户自行选择授权。


主界面补验：收起会议面板后的「会议麦克风：开/关」按钮已路由到当前会议，接收端声音恢复验证通过。最终补发只更新前端，无第二次重启。原项目相关源码已选择性同步并备份至 Build/MediaSourceBackup-20260913；独立依赖在 Build/OfficeWebMediaDependencies，通过 OfficeWeb/node_modules/livekit-client 链接使用，避免后续构建误用共享2.22.3。隔离QA服务已停止（最终复测后），其数据保留在专用目录，不属于正式名册。
