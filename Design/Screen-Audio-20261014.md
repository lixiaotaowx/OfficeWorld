# 屏幕共享声音（2026-10-14）

用户要求共享屏幕时同时分享声音。私聊和会议都请求显示媒体音频，使用独立的 LiveKit `screen_share_audio` 发布；麦克风仍是独立轨道。现有房间音频焦点、接收静音和自动播放恢复也适用于共享声音。本地预览继续静音，避免自我监听。

## 生命周期与权限

- `screenAudio.ts` 管理音频克隆、替换、发布、停止及私聊画面发布。每个房间独立拥有克隆，停止一个房间不会停止其他房间的源。
- `screenSwitch.ts` 在切屏时同步替换音频；新源没有音频时撤下旧音频；私聊换轨与停止通过房间操作队列串行执行。
- `meetingScreenShare.ts` 根据轨道类型分别发布画面与声音，切屏不再丢弃音轨；取消期间返回的采集全部停止。音频发布失败会提示并保留画面。
- 停止、让出共享、退出房间同时清理画面和共享声音，保留正常语音通话。
- 服务端 `livekit.mjs` 只向当前获准共享者授权 `SCREEN_SHARE` 和 `SCREEN_SHARE_AUDIO`，观看者及纯语音成员只有麦克风权限。等待授权也检查音频源权限。
- 浏览器未勾选共享音频、来源不支持音频、旧客户端没有提供音轨时提示原因，画面仍可共享。

## Windows 客户端

- 客户端版本 0.1.47；必须安装新版才能使用新增的原生系统声音采集。只刷新旧版客户端不会增加原生能力。
- `permissions.cjs` 仍只接受可信主窗口、主框架及用户操作授权的采集请求，只有 `audioRequested` 才授予音频。
- 原生实测 Electron 44.3.0 的 `restrictOwnAudio:true` 未生效，普通 `loopback` 会回采自身通话声。使用该固定版本接受的 Chromium 设备 ID `loopbackWithoutChrome`，排除整个客户端进程树的播放。此 ID 属于运行时实现接口，升级 Electron 必须重跑原生回归。
- 排除范围也包含客户端内部视频和提示音；需要共享视频声音时，在其他播放器或浏览器播放。不会通过麦克风收录屏幕声音。
- 实现依据：[Electron 44.3.0 采集设备处理源码](https://github.com/electron/electron/blob/v44.3.0/shell/browser/electron_browser_context.cc)、[LiveKit 共享音频文档](https://docs.livekit.io/transport/media/screenshare/)。

## 验证

- 专项 34 项通过，覆盖私聊发布/分轨/权限、音频替换与静音源、克隆失败清理、会议取消竞态、清晰度及原有媒体生命周期。
- 桌面全量 166 项通过；最终原生权限与 dock 采集授权 11 项复验通过。
- 网页全量首轮 420 项中 418 通过，两项失败均为既有头像条源码正则断言：`dock-rules.test.mjs` 的布局调用模式、`file-transfer-rules.test.mjs` 的 effect 依赖数组。与本次媒体模块无关，未修改头像条或放宽断言。后补的会议取消测试包含在专项 34 项中。
- `test/browser/screen-audio.cjs`：独立 QA 账号和业务数据、两个浏览器、合成画布及振荡器，经真实 VPS SFU 验证 10 项：私聊声音解码与实际 audio 播放状态、麦克风静音、切屏、无声源移除旧轨、重新带声、停屏保留通话、会议带声、会议切屏、接替、停止。
- `OfficeDesktop/test/screen-audio-native.cjs`：隐藏隔离 Electron，真实 Windows loopback。外部 PowerShell 播放 440Hz 测试音，客户端自身播放 880Hz 测试音；普通 loopback 两者均存在，排除自身后 880Hz 从约 -60dB 降至 -154dB，440Hz 保持约 -64dB。音轨为 48kHz 双声道，停止后全部 ended，无录音保存。
- 证据在 `Build/screen-audio-{evidence,native,deploy}.json` 和对应测试日志。未向真实用户发起通话，没有关闭或升级用户当前运行的实例。
- 尚未完成两台物理电脑的人工听音和不同 Windows 版本/声卡兼容性验收。

## 发布

- 正式站 https://115.159.43.237/ 已更新主入口 `main-BQwQvnnz.js` 及依赖；9 项前端资源公网 200、SHA256 一致，普通刷新加载新入口且无页面异常。保留独立发布的 dock 入口。
- 只更新后端 `livekit.mjs`，哈希一致，重启后 officeweb 为 active；未改业务存档、账号或凭据。
- 备份：`officeweb/backups/screen-audio-20261014/` 保存旧主入口、后端和安装包更新清单。
- 安装包 `iruler-dream-Setup-0.1.47-x64.exe`，101728757 字节，SHA256 `535164749e3a3eed274f452ca19f6de615dd8ad04c638e73834a3776be6b5a54`。ASAR 内 permissions 源码逐字节一致、版本为 0.1.47；公网整包哈希一致，latest.json 已更新。
