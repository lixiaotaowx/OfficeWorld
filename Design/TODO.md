# OfficeWorld outstanding work

- [x] 2026-09-14: 起立改为当帧站立，取消坐姿反向插值与站立淡入；本人/同事姿态、安全站位、首帧行走和释放座位已用真实模型测试通过（Build/standing-snap-validation.json）。三文件 OfficeAvatar.ts / RemoteAvatars.ts / standingPose.ts 已随 index-B5mO1Nd3.js 统一发布；本任务独立通过正式 HTTPS 获取并核对 JS SHA256 为 5951b8637360aa4cb5859b8142120998c942c3b56547ca022aff9ebb02a88a62，与发布目录一致。发布任务确认 service active、正式浏览器在线；姿态测试证据来自本地真实模型，未另行宣称正式多人姿态逐帧验收。

- [ ] 2026-09-13: 用户纠正为灰色实体bezel太粗；加载时真实几何已缩至左右5mm/上4mm/下6mm，9台近景、几何与点击回归通过。待助理正式站部署验收，见 Design/OfficeConcept/Thin_Monitor_Bezel_20260913.md。不得把旧内屏适配当作此需求已解决。

- [ ] 2026-09-13: 将显示器真实内沿适配与实体屏幕点击聚焦统一部署并在正式网站验收。本地 9 屏 / 81 贴面点、9 项单测、真实 OfficeScene 点击验证已通过；记录 Design/OfficeConcept/Screen_Fit_Click_20260913.md。未将本地截图视为线上更新。

Updated 2026-09-08. Detailed evidence and acceptance limits: DeliveryAcceptance.md.

## Verified implementation
- [x] Four independent 6x5m extension rooms (billiards, fitness, restroom, meeting) with 2m corridor and existing city/park window image. Actual UE evidence: Design/ExtensionEvidence; 80 extension uassets and map saved.
- [x] Continuous possessed-character traversal: 47 checkpoints through all new rooms and back to original office, no intermediate teleports; Saved/extension-route-tests.json passed=true. Final thin corridor lining preserves 83.5cm clearance to the tested route centerline (capsule radius30cm).
- [x] Approved CC0 succulent, Calathea variant a with pot, three book covers and sparse ceramic vase installed with original PBR/alpha; actual screenshots inspected. Credits: Design/ExtensionCredits.md.
- [x] Generated city/park panorama installed on a 160-degree window backdrop; actual UE frontal/diagonal captures in Design/Generated/CityPark. Saved map and three backdrop uassets verified.
- [x] Correct floor world-coordinate graph connections and physical 170 cm tile scale; real UE screenshot shows plank seams at natural scale.
- [x] Replace all twelve workstation equipment actors with free licensed G8 monitor, G915 keyboard and MX4 mouse assets; real UE orientation/material check and 19 uassets on disk.
- [x] Preserve approved natural office reference and pre-change backups.
- [x] Four finished D1 desks / C1 chairs, licensed Poly Haven accessories and plants.
- [x] Visible third-person pawn and three native working demo colleagues.
- [x] Authored native work / sit-down / stand-up animation, measured seat placement.
- [x] Local HUD proximity and screen-request consent demo: 20 regression checks.
- [x] Eight native Enhanced Input/body checks: seated movement blocked, constrained observation, standing locomotion, actual second seating.
- [x] Save new meeting furniture, pantry, restroom, clear main entrance and connected exterior hardscape.
- [x] Import original CC0 PBR park trees and street seating; retain authors/licenses.
- [x] Correct default startup map and GameMode to current office / third person.

## Required completion
- [ ] Finish visual matching: sage/olive wall tone, natural daylight, foliage brightness, wood scale and furniture proportions. Current full scene not visually accepted.
- [ ] Verify new continuous routes through meeting / pantry / WC / main entrance / crosswalk / park.
- [ ] Finish restroom privacy door and functional shared-space interactions.
- [ ] Add verified colleague proximity responses and broader workplace activities; current periodic seated motion is local demo behavior.
- [x] Replace visible mannequins with assembled MetaHuman baseline; 290 assets saved, runtime contains four Body/Face/Clothing instances. Original native eight interaction checks passed again; actual seated image inspected. Baseline still shares one appearance and wears default shirt/shorts barefoot.
- [ ] Complete latest four-person appearance requirement: two distinct adult Asian men and two distinct adult Asian women, independent faces/hair, different office-casual clothing styles, shoes. Design/Characters/office_people.json tracks identities; FreeWardrobeSources.md lists official free candidates, not downloaded assets. Verify final four-person and close-up/full-body runtime images, seating/clothing fit, and movement again.
  Character-only pause, 2026-09-08: all four final identities (Aoi, Aera, Bo, Tuya) assembled, installed and saved. Full CC0 archive downloaded and checked. Native MetaHuman tops replace external shirts that failed shoulder/arm fit; trousers/skirt/shoes installed as adaptation candidates. Actual PIE 00031-00038 exposed remaining F01 trouser and shoe/foot clipping, so wardrobe is NOT accepted. M01 joined suit required waist separation; jeans restored and visible in 00037. Dynamic SetMaterialAttributes caused an array assertion crash at 13:16; old script disabled. Fixed-layout alternative saved but changed skin appearance and failed masking QA; reverted F01 to original skin. Do not rerun either mask script as a final solution. Five missing Common groom dependencies recovered from autosaves. Saved-map reload clears duplicate PIE child actors after blueprint recompilation. Pause after saving and necessary movement regression; do not expand rooms/network/packaging.
  Cache mitigation: normal saved editor shutdown and reopen recovered C drive space from 0.6GB to 31GB; OfficeWorldLocal DDC graph uses old Zen read-only and new writable cache on G. Launch with -DDC=OfficeWorldLocal.
- [ ] Check safe stand-up destination against dynamic obstacles.
- [ ] Verify UI at target resolutions and keep QA camera/HUD cleanup reliable.
- [ ] Implement authenticated online identities, replicated seat ownership and consent messaging.
- [ ] Implement actual explicitly authorized screen media transport; local consent demo is not real sharing.
- [ ] Verify saved scene reload, successful Win64 cook/package and independent runtime launch. Packaging in progress, no pass yet.
- [ ] Consolidate final credits, controls, limitations and delivery evidence.
- [ ] DEFERRED BY USER: chair back mesh transparency/holes.

Do not call the project complete while required items remain failed, unimplemented or unverified. Concept art is not evidence of UE implementation; authored fixtures are not downloaded third-party models.

- [ ] Character FaceBuilder trial: visible manual pin refinement completed (23 front/10 profile pins), 2048 projected texture packed in FaceBuilder_Refined_Textured.blend. Further likeness review, real hair geometry, unseen-side texture cleanup and downstream integration remain. See Characters/FaceBuilderTrial/README.md. Office scene is unchanged by this trial.

## Lightweight web transition — 2026-09-09
- [x] User selected Quaternius modular women and men; retain UE project in place. See Migration/README.md.
- [ ] Download selected CC0 character packs and verify bundled animations, model sizes and browser rendering.
- [ ] Validate sitting, standing, typing and conversation animation coverage; the separate universal animation viewer is not proof of bundled/free clips.
- [ ] Prototype one lightweight room and one character, then measure download and runtime resource use.

- [x] Preserve user-authored office Blender original and packed copy with all external images. See ../../AssetSources/UserOfficeScene/README.md. 15,501 base triangles; browser materials/export validation pending.
- [x] Delete 7,824,094,426 bytes of generated caches/old builds; 1,427 UE source files verified unchanged by SHA-256. See Migration/cleanup-report.json.


## Approved original office model — 2026-09-09
- [x] User approved concept with separate manager office and no roof; previous user scene kept only as backup.
- [x] Opened user-visible Blender 5.1; user confirmed visibility. Saved first editable layout with 8 workstation displays, glass meeting room, manager office, coffee bar and lounge.
- [ ] Refine furniture/proportions/glazing/foliage to approved image; current geometry is a blockout.
- [ ] Coordinate lighting and rendering with user; bake only after validation.
- [ ] Export new scene to web, replace old scene export only after validation, optimize draw calls and textures.

- [ ] Obtain visual acceptance of staggered layout; latest actual view Design/OfficeConcept/Layout_Corrected_v2.png. Plant modelling stopped by user; agent placeholder plants/wall art hidden. Prefer finished free decor if needed later.


- [x] User manually corrected the layout and declared modelling complete; further modelling stopped by explicit request.
- [ ] Source licensed free finished cartoon potted plants, wall decor and interior materials. Preserve user layout and lighting; no procedural foliage.


- [x] Download and CRC-check approved Tiny Treats House Plants free pack; archive license confirms Isa Lousberg, CC0. 113 glTF models, all external references resolve. See AssetSources/Decor/TinyTreats_HousePlants/audit.json. Not imported into user scene.


- [x] Apply user-approved office props and recolored plants to live scene; save backup, delete 586 obsolete scene objects, verify closeup.
- [ ] Validate updated scene in browser after export; no runtime performance claim yet.

- [x] Apply generated shared atlas/metric UVs, repair chair-back folds, warm lighting and room palette; retain approved concept.
- [x] Bake/recreate atlas repeat and tile shader for browser; inspect UV seams and final lighting in exported scene.
  Baked 2026-09-10 on user request (lighting baked in, web-friendly PNGs, one texture per repeated item).
  Scene `AssetSources/OfficeConcept/OfficeConcept_09Baked.blend`; backup `Before_Bake_Textures.blend`.
  18 textures / 17.7 MB in `AssetSources/OfficeConcept/BakedTextures`, manifest `materials.json`.
  5 family atlases (wood 2048, stone 2048, fabric 2048, rug 1024, trim 1024) each hold every object in
  its own UV cell, so duplicates that share a mesh sample identical texels. Single large surfaces
  (floor, rear wall, window sills, beams, perimeter walls) have dedicated textures.
  195 objects on baked materials, every one with a single "UVMap" layer inside 0..1; 0 objects left on
  unbaked atlas materials. Verified against a Cycles render of the original scene: correlation 0.88,
  mean luminance 0.581 vs 0.594.
  Caveat: bakes store scene-referred linear values, so the browser needs an AgX tone map matching
  Blender's AgX/Medium-High-Contrast with exposure 0.15, otherwise everything reads darker.
  Helper scripts: `_bake_tmp/bake_*.py`; log `_bake_tmp/bake_log.txt`.
- [ ] Validate the baked textures in the browser and choose the tone-mapping path (AgX vs baked-in AgX).

- [x] Reference detail pass: thin framed desk dividers, eight downloaded small desktop plants, capsule meeting tabletop, two framed abstract prints and front collaboration blackboard. Actual viewport Reference_Details_Final.png inspected.
- [ ] Inspect these details at browser camera distance after export; lighting and external scenery still differ from the concept.

- [x] Lighting atmosphere pass: lower-angle warm sun, softened directional shadows, reduced cool fill, coffee/meeting/manager localized warm lighting; AgX contrast and exposure balanced. Saved backup Before_Atmosphere_Lighting.blend. Editable lights retained.
- [ ] Recheck baked lighting and performance in browser; current verification is Blender rendered viewport only.

- [x] Add six downloaded CC0 exterior trees. User cancelled panorama: ring and exterior ground removed. Keep trees only; do not reintroduce HDR/backdrop.

- [x] Replace rejected block trees with user-selected first/last Erce tree variants; correct texture paths and inspect rendered viewport.
- [ ] Check leaf alpha cards in browser export.

- [x] Browser white scene and UI running locally; dual-tab chat verified.
- [x] Add Quaternius male/female playable avatars, Walk/Idle animation, click navigation, camera-relative keyboard movement, eight-seat procedural seated pose. Type/build and browser checks pass.
- [ ] Full sit-down/stand-up transition clips, multiplayer avatar/seat synchronization and navigation updates for future layout edits.

- [x] Collapsible member/chat sidebar; fixed waypoint-induced walk/idle restart stutter. Continuous speed tested at 30/60/144 FPS; browser collapse and arrival checks.

## 音视频迁移到 LiveKit — 2026-09-10

架构与验证细节见 Design/WebMedia.md。

- [x] 确认 VPS `115.159.43.237` 上已有 livekit-server（1.8.4，systemd，端口 7880/7881）。
- [x] 删除浏览器内裸 WebRTC mesh 与自建 offer/answer/candidate 信令，改用 LiveKit 承载媒体面。
- [x] 服务端签发 token 并按房间授权：未获同意者拿不到 token。12/12 服务端用例通过。
- [x] 会议改为共享房间；屏幕为「一分享者一房间 + N 观看者」；语音一对一每会话一房间。
- [x] 两个真实浏览器客户端实机验证 7/7：房间内 2 参与者、双方发布麦克风轨道、离开后成员回落。
- [x] TURN 已在服务器启用（`turn.enabled` + `udp_port 55000`），端口可达性已实测；**但媒体是否真的走中继未证实**，relay-only 探针无效，详见 Design/WebMedia.md。
- [ ] 升级 livekit-server（客户端 protocol 17 / 服务端 15，当前靠回退到 /rtc 可用）。该实例被其他应用共用，升级前需确认影响面。
- [ ] TURN over TLS 443 仍未启用：需要一条指向 `115.159.43.237` 的 DNS 记录 + CA 签发证书（现有 coturn 证书是裸 IP 自签，浏览器会拒）。
- [ ] 屏幕共享的席位缩略图仍走 socket.io JPEG 预览，尚未改为订阅 LiveKit 视频轨道。
- [ ] 跨网络、多台机器的真实多人验证尚未进行，不得声称已可用于生产。

## 工位自选与工位屏幕缩略图 — 2026-09-10

- [x] 抽出单一工位数据源 `src/seats.ts`，坐标全部从 `office-white.glb` 实测。
- [x] 修掉 `OfficeScene.tsx` 指示环 z 偏移 ±0.65 与真实椅子 ±1.18 差 0.53 米的不一致。
- [x] 服务端原子化工位仲裁：抢占 / 释放 / 换座 / 断线释放 / 非法值与满座拒绝。10/10 用例通过。
- [x] 缩略图按 `seat_id` 贴到对应工位的 3D 显示器（复用 CanvasTexture、每屏独立材质、仅变更时上传）。
- [x] 分享者「工位预览」开关，服务端强制：关闭后不再广播并清空已推送的缩略图。
- [x] 浏览器实机 8/8：自选工位、被占工位不可抢、共享后该工位显示器出现真实缩略图内容（像素可证）、未占工位保持空闲、关闭开关后回到空闲。
- [ ] **缩略图在 3D 显示器上的朝向（上下/左右）未经人眼确认**；`flipY` 目前用 glTF 约定。
- [ ] 经理办公室那块 `Manager DISPLAY` 还没有对应工位，暂未纳入自选；是否开放成第 9 个工位待定。
- [ ] `src/App.tsx`(396) 与 `src/styles.css`(395) 逼近 500 行上限，下次加功能前先拆分。

## 让玩家互相看得见 — 2026-09-10

- [x] 抽出 `src/characterModel.ts`：角色加载、1.72m 归一化、walk/idle、坐姿，本地与远端共用同一套。
- [x] `src/RemoteAvatars.ts`：为每个其他玩家渲染角色，朝最近快照插值（远端误差 ≈0.17m），大跳才瞬移。
- [x] 服务端节流且夹边界的位移转发：超频丢弃、坐标限制在建筑内，单客户端无法刷屏或把角色甩出场景。
- [x] 角色性别随 join/people 广播，远端渲染正确模型。
- [x] 修掉「侧栏占用工位只占座、角色还站在原地」——坐下改由服务端返回的工位状态驱动。
- [x] 服务端 29/29、浏览器 33/33 通过；新增用例证明第二个浏览器能看到对方角色加载、走动、坐下。

## 部署到 VPS — 2026-09-10

细节与端口实测见 Design/Deployment.md。

- [x] 应用部署到 `115.159.43.237`，systemd 服务 `officeweb`，开机自启。
- [x] 静态前端与信令同进程同源，`server.mjs` 通过 `static.mjs` 托管 `dist/`。
- [x] 修掉 PM2 下入口判断失效导致「显示 online 但没监听、日志为空」的问题（新增 `start.mjs`）。
- [x] 实测部署站点 6/6：可访问、信令已连、模型加载、两客户端互通、**能看到并跟随另一个玩家的角色**。
- [x] **TLS 已是正式证书，浏览器无警告**：Let's Encrypt 的 **IP 证书**（`--ip-address` + `shortlived`），
  系统 certbot 2.9.0 不支持，改用 `/home/ubuntu/certbot-venv` 里的 5.8.0；`officeweb-cert.timer` 每天续期并 reload nginx。
- [x] 实测部署站点（HTTPS）15/15：安全上下文成立、真的采集到屏幕视频轨与麦克风音轨、**经 nginx 的 wss 反代连上 LiveKit 并入会发布轨道**。
- [x] 三个浏览器测试套件**移除了证书例外**，将来证书出问题会直接失败。
- [ ] ⚠️ **IP 证书约 6 天到期**，依赖 `officeweb-cert.timer` 自动续期；**别用系统那个 2.9.0 的 certbot 续期**。
- [x] 首访弹窗同时选**角色**与工位；工位一旦选定归其所有，换座只在设置里的「重新选座」。
- [x] 收敛按钮语义：删掉与归属规则冲突的「坐到 N 号工位」，「起身」不再交出工位，座位操作只留「回到我的座位」「起身」。
- [x] UI 字号整体上调 1–2px（原来大量 9–12px），最小 11px、正文 14px。
- [x] 拆分逼近上限的文件：`OfficeScene.tsx` 475→430（探针抽成 `sceneProbe.ts`）、`App.tsx` 448→360（侧栏抽成 `SidePanel.tsx`）。
- [x] **接入隔壁会话烘焙好的办公室材质**：`office-baked.glb`（JPEG 后 5.73MB）替换白模；烘焙面改用不受光且不走色调映射的材质，避免二次受光/二次色调映射。
- [x] **修掉工位屏幕「一条绿杠」**：不复用 266 顶点、UV 不适合整图映射的 `DISPLAY` 网格，改为自建 `PlaneGeometry`；8/8 工位屏幕从椅子上可见。
- [ ] **烘焙材质的观感与屏幕朝向未经人眼确认**（我看不了图片，只有亮度/像素/射线数值证据）。
- [ ] 工位屏幕目前仍用程序绘制的内容；`flipY` 用 glTF 约定，正反需人眼过一遍。
- [ ] 无鉴权、状态仅存内存，重启即清空；任何人知道网址就能进。
- [ ] 尚未在真正两台不同网络的机器之间验证。

## 2026-09-12 独立烘焙与坐姿
- [x] 每个物体单独智能 UV，最终选择 131 件独立烘焙、293 件保留源材质；备份、PNG 原图及新版椅子导出已完成。
- [x] 坐姿修正骨骼名称、独立脚骨与落地；21 角色 × 6 姿态通过数值检查，并查看实际椅子坐姿截图。
- [x] 网页模型压缩至约 10 MB；详情见 Design/OfficeConcept/Baking_20260912.md。
- [x] 已确认 id_ed25519_aiwb，初版烘焙模型与坐姿已上传并核验服务器资源。
- [x] 初版 96 采样噪点修复：131 件改为 256 采样并单独引导降噪；实际近景检查、导出、上传及线上工位视图检查完成，模型 4.95 MB。
- [ ] 线上背面墙体呈黑色，需单独检查单面烘焙/双面材质与背面可见性；不属于本次采样颗粒问题，尚未修复。
- [ ] 音视频生命周期修改仍在验证，接收音频有效信号与清理测试尚未通过，暂不作为完成项。

## 2026-09-13 账号与完整工位流程
- [x] 姓名密码注册/登录/退出，服务器认证身份，HttpOnly 会话与加盐哈希。
- [x] 永久工位绑定账号，离线显示姓名，禁止占用其他账号工位，跨重启恢复已测试。
- [x] 键盘简化为 9 个盒体共用贴图；标准/前倾坐姿双手对齐键盘并展平手掌。
- [x] 点击工位列表相机定位屏幕；修复屏幕倒置，隐藏近景遮挡控件。
- [x] 部署到正式服务器，查看登录页并核验未登录拒绝；本地浏览器全流程通过。
- [ ] 用户真实账号首次注册后的正式站点多人体验验收；不预设或代填用户密码。
详细范围与证据见 OfficeWeb_20260913_Tasks.md；旧版无认证/内存工位的描述已被本次账号方案替代。


- [x] 2026-09-13 九台显示器底座简化为单原理化源材质，独立 UV / 512 / 256 采样引导降噪完成。
- [ ] 显示器近景发现台灯灯罩仍有明显斑驳，需要单独检查源材质和烘焙。

## UI refresh — 2026-09-13
- [x] Warm neutral/olive visual system, redesigned account entry, navigation labels and consistent action icons; desktop/mobile browser inspection complete. See UI-Refresh-20260913.md.
- [x] Upload and verify integrated UI at https://115.159.43.237/; manager workstation now included as ninth seat.
- [ ] Verify actual manager chair claim/return in an uncontested production session; server arbitration tests and navigation checks passed.
- [ ] User visual acceptance of the refreshed UI.

- [x] 2026-09-13 角色选择移入设置；坐姿控件跟随本人椅后投影；移除回座、起身按钮及常驻场景状态条；本人椅子和显示器点击回座，行走自动起身。
- [ ] 本轮线上完整回座动作复核：已确认设置和椅后控件；验收期间当前会话失效，待正常登录后继续验证。

## 2026-09-13 聊天持久化
- [x] 当前浏览器按账号长期保留收到的聊天，刷新恢复、去重及本地旧消息保留已测试。
- [x] 服务器七天持久存档、定时删除过期文件、断线及离线分页补收、发送确认与失败提示。
- [x] 正式服务器已部署并核验 HTTPS 资源与聊天面板；详见 Chat_20260913.md。
- [ ] 用户两台真实设备的长期使用验收；自动化七天边界通过时钟注入验证，未宣称已经实际等待七天。


## 2026-09-13 前景墙自动裁切
- [x] 前景遮挡墙平滑降至 0.35 米，摄像机转回或越过墙顶后恢复；仅墙面与对应窗框、木条和墙饰参与。
- [x] 裁切几何条件、家具材质隔离及恢复测试 2/2；TypeScript、构建和真实模型裁切前后截图检查通过。
- [x] 正式网站已发布 index-CEAhGu-1.js，实际 HTTPS 资源校验通过。OfficeScene.tsx 465 行，新模块 wallCutaway.ts 90 行。

- [x] 用户改为自动坐姿：移除椅后控件，每45–90秒随机切换，不连续重复，站立暂停。
- [x] 修复掉线后本人工位判断依赖在线列表的问题；补齐 WASD 起身；回座路径自动检查通过。
- 最终核验时并行新版入口为 index-BiZ9_C7e.js，已确认继续包含本次墙面裁切。

## 2026-09-13 墙体裁切遗漏修复
- [x] 补齐内侧 color panel、多层玻璃、顶梁、立柱、横框、后排窗体、黑板和墙面显示板；扩展后墙与右侧范围，新增会议区左侧及前侧隔断组。
- [x] 最近所属墙面匹配取代首个匹配，避免转角构件错分；3 项裁切测试通过，包括同一视线两道隔断。
- [x] 实际 GLB 后墙裁切前后对照已查看；内外饰面与顶梁同步移除。正式入口 index-DtdMxDtL.js 已部署核验。

- [x] 修复九台共享画面与显示器脱离：实际表面射线定位，间隙从约90.74mm降至1mm；81个采样与三项专项测试通过。见 Screen-Fit-20260913.md。

## 2026-09-13 会议流程
- [x] 即时会议创建、定向邀请、接受拒绝、主持权交接及结束，已发布。
- [ ] 双设备跨网络会议声音/屏幕接收及中断恢复验收；统一单聊和会议静音状态。
- [ ] 预约、离线邀请及会议持久化后续评估；当前不包含。详情见 Meetings_20260913.md。

## 通信修复 — 2026-09-13
- [x] 修复房间退出/重进、发布/取消发布、权限等待的竞态与会议/单聊共用麦克风；固定兼容客户端 2.17.2，正式站 index--R4vf-D0.js 已核验。
- [x] 双浏览器经真实 VPS LiveKit：会议双向音频、5次开关麦克风、3次共享启停、系统停止、离开重进与2秒断网恢复；一对一语音与工位高清共享也通过。业务账号保持隔离。
- [ ] 两台不同网络设备使用真实麦克风/扬声器和浏览器原生屏幕选择器验收；长时间断网、设备热拔插、受限网络 TURN/TLS 仍待测试。
- [ ] 共用 LiveKit 1.8.4 的升级另行评估。当前兼容客户端仍有 /rtc/v1 404 后回退警告；不要直接升级依赖而不跑媒体回归。
- [ ] 正式 HTTPS 验证的业务信令通过隔离代理，代理模拟断网产生 WebSocket关闭错误；未将该子项计作零错误通过。无代理隔离站断网恢复通过。详见 Media_20260913/README.md。


- [x] 会议收起持续提示、空会话面板清理、私聊默认开麦真实状态、双向定向屏幕邀请，20260913上线。
- [ ] 新双向邀请的权限拒绝/设备拔插/长断网完整UI回归与真人跨网络验收；见Call_UI_20260913.md。

## 2026-09-13 大胆 UI 改版
- [x] 完成 Atelier 视觉并上线，桌面/手机/登录页与九个工位名册实测通过，证据见 UI-Atelier-20260913.md。
- [ ] 用户对本轮新视觉的实际使用反馈与审美验收。
- [ ] 可选景深暂缓：当前为直接渲染，需额外缓冲和合成，目标设备 GPU 开销尚未验证；不阻塞必需修复。见 DepthOfField-20260913.md。

## 2026-09-13 紧凑单行顶栏
- [x] 顶部两栏合并为56px单行，移除Good work重复标语，保留360px双列名册；桌面/平板/手机及构建通过。
- [ ] 助理统一集成部署后核验正式站点单行顶栏；本任务未独立发布。证据见UI-CompactHeader-20260913.md。

## 2026-09-13 私聊屏幕自动双向语音（待统一部署）
- [x] 独立pair房间、已有语音升级共享复用、默认麦克风、静音保留、会议/私聊音频切换、停屏保留语音与挂断清理。
- [x] 修复邀请取消/选择器迟到采集竞态及私聊重试按钮被挂断按钮遮挡；保护此前已有公共共享。
- [x] 63项自动测试、三浏览器真实SFU音画/权限源隔离、55秒断网恢复及完整UI权限模拟/取消/重试测试通过。
- [ ] 助理统一生产部署和正式站点版本核验；当前本任务未部署。见 Private_Call_AV_20260913.md。
- [ ] 真实跨网络真人麦克风/扬声器、原生权限选择器及实体热拔插验收，不能用模拟输入代替。

- [x] 2026-09-13 集成发布私聊屏幕双向语音、真实显示器薄边框及点击聚焦，正式入口DNY_NLtw/B_t315Gb与本地一致，近景已查看；详见Deployment.md。
- [ ] 私聊新版真实双设备跨网络及原生系统选择器/硬件热拔插人工验收，保留为未完成，不以合成输入测试替代。

## 2026-09-13 聊天附件
- [x] 图片/文件发送、图片预览与下载、20MB分片传输、按账号本地保存、服务器7天清理；67项测试与双浏览器验证通过。
- [x] 已与GPU优化统一发布；DeSGVqns/D4CzR1lM与本地构建哈希一致，3后端哈希一致、服务active，正式入口已查看，匿名附件下载401；详情 Chat_Attachments_20260913.md。
- [x] 三维节能调度及设置暂停上线（DeSGVqns），隐藏零绘制、自动恢复、通信与预览独立；未将帧数变化冒称固定GPU降幅。

## 2026-09-13 通行与账号状态
- [x] 在线/离线明显区分、缩小导航碰撞并打通老板房桌侧通道、同账号新登录立即顶下旧登录；测试和正式发布完成，详见Deployment.md最新记录。

## 2026-09-13 Electron桌面客户端
- [x] Windows便携exe已生成，支持同一网站服务；客户端麦克风自动权限、独立窗口选择器、保留浏览器版本。
- [x] 7项权限/选择器测试及最终打包exe加载正式站点的隔离启动检查通过。
- [ ] Electron客户端实体麦克风、原生窗口选择与浏览器跨设备通话验收；见Electron-Desktop-20260913.md。
- [ ] 商业代码签名和客户端运行时自动更新后续处理；当前未签名便携包。


## 2026-09-13 公共座位
- [x] 18个公共坐位与空闲工位可点击入座，服务端临时占用防抢坐，起身/离线释放，专属工位归属保留。
- [x] 双浏览器、全部公共座位往返、并发仲裁与正式HTTPS资源核验通过；已发布 BOmtET0d / C0dEHtLO。详见 PublicSeating_20260913.md。


## 2026-09-13 坐下朝向修正
- [x] 长沙发三个位置朝向真实茶几中心，修复两端方向配反。
- [x] 入座完整重置旋转并锁定座位方向，避免行走四元数转换为XYZ欧拉角后残留X/Z翻转；移动广播改用四元数计算真实朝向。远端坐姿采用同一座位角度。
- [x] 正式HTTPS硬刷新、18个公共座位方向、8个可用工位朝向和双窗口残留旋转回归通过；业务API/Socket隔离，未写入正式名册。截图SeatedFacing_20260913/production-two-sofa.png。
- [x] 已发布 index-b_gP7G1G.js / index-C0dEHtLO.css；JS SHA256 74af816f422c484200b8c53691c8753916a37978c3bd5addf2697057b66f7936，service active。73项测试通过、1项LiveKit配置相关跳过。
- 原项目备份Build/BeforeSeatedFacing20260913，VPS备份backups/seated-facing-20260913；保留账号、工位和聊天数据，未改家具模型和既有延期事项。

## 2026-09-13 内存与EXE采集
- [x] 人物/场景资源完整释放已上线；EXE 0.1.1采集修复打包并测试。
- [ ] 低内存压缩贴图是否接受画质/下载量取舍由用户决定，默认保留原画；详见 Memory_Audit_20260913.md。
- [ ] 真实用户跨设备EXE共享复核，详见 Electron_Capture_Fix_20260913.md。

## 2026-09-14 会话式聊天
- [x] 公共与个人会话列表、返回、搜索、未读、独立草稿、离线留言上线。
- [x] 私聊消息/历史/附件的服务端双方权限、三账号隔离与重启补收测试通过，详见Chat_Threads_20260914.md。

## 2026-09-14 屏幕共享接替
- [x] 语音接通后分享屏幕按钮，私聊/会议单人共享接替，取消选屏保留原画面；82测试、tsc、真实SFU双浏览器通过。
- [x] 与桌面预览任务统一发布B3RovUWT/DE_G6PVl，正式前后端哈希匹配，详见Screen_Takeover_20260914.md。

## 2026-09-14 桌面自动登录与预览
- [x] EXE0.1.2加密保存登录、断网重试、3秒原生工位预览、本人屏幕右键切换，正式站同步更新。
- [x] 单测、真实Electron沙箱/系统加密、完整网页隔离认证/双屏回归通过；详见Desktop_Auto_Preview_20260914.md。
- [ ] 用户真实多屏热插拔、跨设备长期断网与客户端更新后使用复核。

## 2026-09-14 工位相机
- [x] 列表点击后退2.15米并抬高，手机适配；工位聚焦前景裁切、总览恢复与拾取near同步。
- [x] 专项5测试/构建/行数检查、普通/老板/手机实际画面通过，统一发布B3RovUWT后正式老板视角核验完成。见WorkstationView-20260914.md。


## 2026-09-14 客户端托盘与图标
- [x] 0.1.3便携版关闭隐藏到托盘、打开恢复、显式退出；复制指定iruler-desk_new图标，主EXE/便携启动器/托盘使用同一图标。
- [x] 12项测试、实际Electron托盘/后台合成音视频、打包asar和最终EXE启动通过。详见DesktopTray_20260914.md。
- [ ] 实体设备长时间托盘通话/共享与Windows实际注销/关机验收。安装版及开机自启按用户要求后续处理。

## 2026-09-14 预览与通知
- [x] 他人预览接收开关、自己的在线自动预览、移除底栏暂停/麦克风、SVG通话窗口与系统通知短音，已发布B5mO1Nd3/C7e3Smgy。
- [x] 84网页/13桌面测试，完整UI预览回归、私聊会议SFU回归、Windows原生通知、0.1.4便携EXE正式站烟雾测试通过。详见Preview_Notifications_20260914.md。


## 2026-09-14 iruler dream桌面界面
- [x] 0.1.4免安装版：无边框主窗口/共享选择器、定制菜单、声音与共享→设备管理、品牌与配色统一。
- [x] 14项测试、实际Electron/asar菜单与布局、托盘后台回归、最终EXE隔离启动和图标/文件一致性通过。详见DesktopDesign_20260914.md。

## 2026-09-14 全项目缺陷排查与修复（助手）
排查方式：只读审计（前端资源生命周期、后端正确性/安全、文件结构与仓库卫生、线上版本比对）。
基线：`tsc --noEmit` 通过；单测 96/96 通过（原 85 项 + 本次新增 11 项）。

- [x] `static.mjs` 补齐读取流的 `error` 处理与中断销毁，并支持 `Range`（206/416/`Accept-Ranges`）。
- [x] `chat-store.mjs` / `sitting.mjs` 启动容错：单个损坏存档不再让整个服务起不来（systemd 崩溃循环）。
- [x] 管理员释放工位改为"先持久化再生效"，失败回滚并返回错误；密码改为恒定时间比较并加失败限流（5 次/10 分钟/连接）。
- [x] 登录限流只统计失败，避免同一 NAT 的成功登录把同事一起锁死；追踪表加上限。
- [x] `OfficeWeb` 依赖改为自包含 `npm install` + 提交 `package-lock.json`，不再依赖 `tools/WebRuntime` 与 `Build/OfficeWebMediaDependencies` 两个被忽略目录的 junction（此前会静默回落到 livekit-client 2.22.3）。
- [x] 聊天附件遇 404/410 或长度不符时标记永久失效，不再每 30 秒无限重试。
- [x] EXE 主动退出/被顶下线时调用 `clearLogin()` 清除已保存登录信息，退出后不再把密码回填表单（此前 `clearLogin` 从未被调用，与 AGENTS.md 冲突）。
- [x] `.env.example` 删除"默认 admin123"的错误说明（代码实际默认关闭管理功能）。
- [x] 修正 `Design/Deployment.md` 重新部署命令：产物在 `Build\OfficeWeb` 而非本地 `dist`，并补全全部后端运行时文件清单与上线核验步骤。
- [x] 删除 16 个乱码空目录（Blender 无 `HOME` 时的缩略图缓存残留）与两个零引用大资源（`office.glb` 17.9MB、`office-white.glb` 5.0MB）。
- [x] 浏览器测试不再硬编码某一台机器的 Codex Playwright 路径，统一走 `test/browser/playwright.cjs`（支持 `PLAYWRIGHT_PACKAGE` / 全局安装 / 旧路径）。
- [x] 已重新构建并部署到 https://115.159.43.237/（`index-C2mGk0gA.js`，线上 SHA256 与本地构建逐字节一致；Range 206、匿名 `/api/auth/me` 401、服务 active 已核验）。

仍待处理（本次未做，需用户决定）：
- [ ] `Build/` 下有 25 份历史 OfficeWeb 构建副本（含 `OfficeWebPreviewReceiveRelease` 等已记入部署记录的版本），既是"传错目录"的风险也是发布留档；删除前需确认。
- [ ] `.git` 有约 5.9GB 松散对象（16,497 个不可达对象，源自 2026-09-09 的一次批量 add）。`git gc --prune=now` 可回收，但属不可逆操作，未执行。
- [ ] 开放注册 + 附件无总量配额仍可刷满磁盘（单文件 20MB、保留 7 天，无总配额）。
- [ ] `screen-`/`voice-` 房间（遗留授权路径，客户端已不用）的 LiveKit 令牌未限制 `canPublishSources`。
- [ ] 浏览器回归测试需要本机装 Playwright：`npm i -g playwright && npx playwright install msedge`；本次未跑浏览器/桌面回归。
- [ ] 真实跨网络双设备音视频验收仍按既有条目未完成。
