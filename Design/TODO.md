# OfficeWorld outstanding work

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
- [ ] Bake/recreate atlas repeat and tile shader for browser; inspect UV seams and final lighting in exported scene.

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

- [x] 应用部署到 `115.159.43.237`，systemd 服务 `officeweb`，监听 80，开机自启。
- [x] 静态前端与信令同进程同源，`server.mjs` 通过 `static.mjs` 托管 `dist/`。
- [x] 修掉 PM2 下入口判断失效导致「显示 online 但没监听、日志为空」的问题（新增 `start.mjs`）。
- [x] 实测部署站点 6/6：可访问、信令已连、模型加载、两客户端互通、**能看到并跟随另一个玩家的角色**。
- [ ] **TLS 未做：明文 HTTP 不是安全上下文，所以共享屏幕与语音在部署站点上不可用。** 443 已放行、nginx 可装，缺一张可用证书。
- [ ] 证书方案待定：加 DNS 记录用 Let's Encrypt（最干净）／`sslip.io` 通配 DNS（待验证）／自签+手动信任（兜底）。
- [ ] 无鉴权、状态仅存内存，重启即清空；任何人知道网址就能进。
- [ ] 尚未在真正两台不同网络的机器之间验证。
