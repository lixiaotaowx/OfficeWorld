## 2026-09-30 仓库推送：换台电脑能不能拉起来

- [x] 远端 private 仓库确认存在（之前"没创建"是匿名 API 对私有库返回 404 的误判）；
      本地领先的 50 个提交 + 522 个文件已提交并推送（`7e48b94`），远端与本地哈希一致。
- [x] 新增 `SETUP.md`、`.gitattributes`（统一 LF），`.gitignore` 补 `debug.log`/`*.TMP`；
      推前扫描确认无密钥、无 >20MB 单文件。
- [ ] `tools/` 下一次性诊断脚本仍写死 Playwright/sharp/`.codex` 绝对路径，换机器要改；
      网页/客户端/构建/单测不依赖它们。`OfficeDesktop/tools/publish-update.mjs` 的
      私钥路径同理（见 `SETUP.md` 第 8 节）。
- [ ] 私钥、`.env` 的 LiveKit key/secret、`ADMIN_PASSWORD`、运行期数据不在仓库里，
      换机器需人工带过去；未做任何自动同步。
- 详情与证据：[Repo_Migration_20260930.md](Repo_Migration_20260930.md)、
  核验脚本 `tools/verify_fresh_clone.ps1`。

## 2026-09-30 宝箱视频链接封面缩略图（已完成，附已知边界）

- [x] 视频链接显示平台封面缩略图，点缩略图直接打开放大播放器；B 站视频与番剧封面已验证，取不到封面时退回类型符号。详见 [Deployment.md](Deployment.md) 同日条目。
- [ ] **抖音链接目前取不到封面**（分享页只有 SSR 外壳，各种 UA 都不返回 `og:image`，详情接口要签名；服务器是机房 IP）。代码保留了 og:image 这条尽力而为的路径；若将来有可用的公开封面来源，可在 `OfficeWeb/build-cover.mjs` 的 `coverTarget` 里补。
- [ ] 小红书同样没有封面来源（链接本身也只能打开原页观看）。
- [ ] 现有宝箱里**已经放进去**的 B 站链接会直接开始显示封面（按链接实时解析，不需要重新投放）；首次打开若平台抖动可能空一次，5 分钟后自动重试。

## 2026-09-30 直接清理旧场景

- [x] 正式存档删除剩余35件悬空装饰，保留7个已认领工位、其他建筑与宝箱；revision430。
- [x] 对照复现旧页面仍生成202个静态网格，当前公网页面静态网格0，保存物件29件。
- [ ] 用户运行中的旧客户端页面刷新一次；Windows窗口抓取两次超时，未代为刷新，已明确告知。
- 备份：backups/manual-scene-cleanup-2026-09-30T03-27-19-657Z；证据：Build/manual-scene-cleanup-result.txt、Build/scene-cleanup-render-proof.json。

## 2026-09-30 原场景物件编辑

- [x] 67件固定几何迁入存档，编辑/拆除/撤销/刷新、座位及显示屏同步通过。
- [x] 移动与安装统一25cm，已发布并验证；原建筑和宝箱逐项保留。
- 详情：[Editable_Scene_20260930.md](Editable_Scene_20260930.md)。

## 2026-09-29 点击任务栏才显示头像（0.1.34 回归）

- [x] 复现 owner 隐藏和降级传递，取消绑定；0.1.35 已发布、公网整包核验通过。
- [x] 打包原生模块20次、真实头像窗口8次无需点击恢复，主动隐藏/恢复和桌面像素检查通过。
- [ ] 用户安装 0.1.35 后实际日常切换软件与任务栏操作验收；当前0.1.34未强制退出。
- 详情：[Dock_Independent_20260929.md](Dock_Independent_20260929.md)。

## 2026-09-29 单击任务栏空白处闪烁（旧方案已由0.1.35取代）

- [x] 0.1.34 改用 Windows 原生 owner 关系，绑定成功后停止频繁提层；已发布并核验公网整包。
- [x] 153 项桌面测试、原生窗口 100 次立即层级检查、真实任务栏绑定、打包模块集成测试通过。
- 该版验收收到回归反馈，见上方0.1.35修复；不再继续推荐0.1.34。
- 详情：[Dock_Taskbar_Owner_20260929.md](Dock_Taskbar_Owner_20260929.md)。

## 2026-09-28 自动头像状态

- [x] 频繁输入忙碌、离座满五分钟困倦、在线超过十分钟开心；服务端同步与旧桌面桥兼容。
- [x] 构建、相关测试、正式资源哈希及六表情浏览器渲染核验。
- [ ] 真实多设备在其他应用中持续操作的系统活跃采样体验，按反馈调整阈值。
- 详情：[Automatic_Expressions_20260928.md](Automatic_Expressions_20260928.md)。

## 2026-09-28 配饰贴合与灵动岛

- [x] 胡子后表面贴合尺面，头发前部压薄；状态栏外框高度为任务栏的80%，保留40px头像和8px间距。

## 2026-09-28 任务栏切换软件时头像窗短暂消失

- [x] 补任务栏指针区域的 80ms 层级恢复及 800ms 动画尾段，149 项桌面测试通过。
- [x] 构建 0.1.33 安装器，asar 核验修复模块与源码一致。
- [ ] 更新后的用户真机任务栏切换视觉验收；未将单测描述为实际重现消失帧。
- 细节见 [Dock_Taskbar_Switch_20260928.md](Dock_Taskbar_Switch_20260928.md)。

## 2026-09-28 悬停/来电角色与首次预览

- [x] 舞台从在线名单兼容恢复完整装扮，头像增大至任务栏高度；已部署并核验。
- [x] 首次预览加载失败有限自动重试、手动重试和错误记录；公网资源故障注入恢复验证通过。
- [ ] 历史那次预览失败的原始错误无法追溯；若再次出现，依据新增 Character preview failed 日志确认原因。
- [ ] 用户实际已安装客户端的跨设备悬停/来电人工验收；自动化已覆盖旧桥丢失外观字段的两种场合。
## 2026-09-28 卡通头发与胡子

- [x] 按最新要求去除写实毛丝，重做六种发型与六种胡子，同步场景、选角和状态栏透明配件。

## 2026-09-28 状态栏与场景统一

- [x] 移除个人表情选择；配色与四类配饰共用场景外观，成员共用状态姿势；只读预览已实现。
- [ ] 困倦、专注公共素材尚无业务触发条件，暂不自动应用。

## 2026-09-28 薄片透明头像表情

- [x] 按用户“几乎无厚度”修订薄片本体，完成开心/忙碌/困倦/专注/挥手/休息 6 张透明表情与 19 件配饰组装，接入头像条和账号表情选择并发布。见 [Expression_Kit_20260928.md](Expression_Kit_20260928.md)。
- [ ] 逐帧表情动画与嘴/眼/手的任意独立交换未制作；当前交付为静态表情底图加独立配饰层。

## 2026-09-28 配件重新建模

- [x] 19 件配件重建；胡须毛流、发束、针织帽与草帽细节、眼镜细框；眼睛平滑曲面和头像柔光已发布。见 [Accessory_Remodel_20260928.md](Accessory_Remodel_20260928.md)。

## 2026-09-28 状态栏头像胖瘦差异

- [x] 固定共用取景、方形尺寸与 flex 占位，去掉状态动画缩放；已发布并用公网资源验证 10 种搭配和全部提醒状态尺寸一致。

## 2026-09-28 配件特写、坐姿与头像

- [x] 配件主预览与选项改为特写；本机和远端坐姿连续播放；状态栏头像取景及完整搭配修正并发布。详见 [Face_Sit_Dock_20260928.md](Face_Sit_Dock_20260928.md)。
- [ ] 沙发专用放松动作与椅型逐一适配未纳入本轮；当前使用角色已有打字坐姿。

## 2026-09-28 选角与设置重设计

- [x] 配色图遮色、站姿缩略图、真实三维搭配预览、设置五类页面、配件分类、姓名跟随头部与视口边缘裁切已实现并发布。见 [Settings_Look_20260928.md](Settings_Look_20260928.md)。
- [ ] 人物密集时姓名标签之间的避让尚未实现；本轮只修正跟随位置及视口边缘残留。

# OfficeWorld outstanding work

## 2026-09-28 尺子角色（配色 + 配件）— 已上线

需求（用户原话）：「这是新的角色，把角色换成这个，目前角色是黄色的 不同的角色有不同的配色，选择要不要戴眼镜胡子等 就是说 1先选择配色，2选择配件 开始吧」+「文件里面的动作库都可以直接用 不要客气」。详见 [RulerCharacter_20260928.md](RulerCharacter_20260928.md)。

- [x] 从 `跑步循环_修网格.blend` 导出 `ruler.glb`（710,488 字节：身体+眼睛+眼镜+18 件配件+9 条动作，Draco+JPEG）。
- [x] 10 个配色 + 4 个槽位（眼镜/头发/胡子/帽子）的两步捏人面板，首访弹窗与设置共用；缩略图用真实模型渲染。
- [x] 换配色/配件只改材质与显隐，**不重新下载模型**；账号存档 + 本机缓存 + 多人同步。
- [x] 坐下改用已授权的 `坐姿打字_Type`（脚在地面、手在身前）；长距离移动用 `跑步循环_Run`。
- [x] 修掉换骨架的三个坑：Mixamo 命名映射、`boneKey` 漏冒号（坐下完全没反应的真因）、坐姿下沉量改实测。
- [x] 部署到 `https://115.159.43.237/`：前端资源 curl 取原始字节后与本地构建逐字节一致，
      `draco/`/`basis/`/39 张缩略图 HTTP 200，旧 21 个角色模型已备份移出。
- [x] 第二轮自查抓到并修掉：**认不出来的配件回退成"不戴"，导致默认短发变成光头**（客户端与服务端
      都犯了）；新增 `test/browser/look-sync.cjs`（两个真实浏览器 + 隔离服务器）来守这条。
- [x] 运动快照补 `running` 位，远端也跟着放 `跑步循环_Run`（源码级断言；浏览器里驱动不出来，见设计文档）。
- [x] 2026-09-28 用户报障四项：**小窗头像**改成每个配色一张头肩图（原来拿全身图放大 340% 取到板身中部）；
      **从没捏过的账号登录后弹一次捏人面板**（服务端记 `lookConfirmed`）；10 个颜色 + 两步面板确认无误；
      **白片查清**——那是用户原始模型里本来就白的板身层与腿/脚（`Build/ruler/orig-look.png` 可证），
      腿/脚已按用户确认跟着配色上色（顶点色，不动共用材质的眼睛）。
- [x] 2026-09-28 第三轮：**垃圾几何从源头删掉**（四个 `球体.004~007` 中心离板身 0.85m、蒙的骨头不存在，
      对照渲染证明脸上的眼睛是贴图上的、删掉不丢）；**默认一个配件都不戴**。
- [x] 2026-09-28 第四轮：**换配色在场景里终于真的生效**（用户：「我已经是新登录的客户端 还是不行啊…
      场景里面还是 黄的」）。两个代码坑 + 一个测法坑：① `Texture.clone()` 共享 `Source`，
      `copy.image = canvas` 会把**原图**也换掉 → 第二套配色开始拿上一套结果再乘一次，一次比一次黑；
      ② 不该读原图色相（灰贴图的 JPEG 色偏是噪声，等于加随机色相）；③ 原来的"包围盒里最饱和像素"
      量到了木桌、而且角色会走动。现在配色是**灰度当遮罩 × 配色 hex**（`characterLook.tintTexture`），
      证据：`test/browser/color-fidelity.cjs`（10 套贴图平均色与 hex 一一对应、重复应用不变）+
      `test/browser/colour-proof.cjs`（场景里板身像素十套各不相同）。缩略图 49 张重出并已上线。
- [ ] **坐姿要不要再改，请用户定**：整块板 1.75m、腿只有 0.33m、瞳孔在 1.486m，"上身"比腿长得多，
      所以任何摆法都不像真人坐下（腿尖坐椅面 → 瞳孔 2.07m；瞳孔压到坐姿眼高 1.15m → 腿穿到地板下）。
      现状比站着高 0.40m、腿穿出椅面 0.17m。备选：把腿程序化折向前 + 裆部坐在椅面（瞳孔 1.73m）。
      对比图：`Build/sit-pose-*.png`（`test/browser/sit-pose-shot.cjs`）。
- [x] 走路的"悬空"与"红/白色东西"核实：按 W 走 1 秒取 6 帧 `meshLowestY` 恒为 **0.000**；
      角色周围 1.8m 内全是工位资产，无游离几何（`test/browser/scene-avatar-zoom.cjs`）。
- [x] 头像改成**只特写面部**（用户 2026-09-28：「头像太小了 只特写面部就行」）：这角色没有独立的头，
      五官是板身网格里另外两个材质槽（`材质.005/006`，实测 y≈1.10~1.23）。原来按"头顶往下 0.65m"
      取景，脸只占画面十几分之一（缩到 28px 就剩一条缝）。现在 `portraitCamera()` 量出五官那块几何
      围着它取景。
- [x] **一排头像必须一样大**（用户 2026-09-28：「怎么还有大有小、、我自己的头像太小了 而且间距有一些」）：
      上一版按"脸 + 眼镜/胡子"取景，戴眼镜的人框会放宽到 0.68、不戴的只有 0.43 —— 同一条头像条上
      一个大特写一个小远景。现在取景**只按眼睛算**（系数 1.55，正好把眼镜装进去），任何人、任何配件
      都是 0.53×0.53、眼宽占画面 65%。`test/browser/portrait-frame.cjs` 现在断言"各配件档位占比
      极差 < 0.02"（戴眼镜/胡子/帽子/长发四档实测 0.000）。缩略图重出 49 张、缓存版本升到 `20260928h`。
      （头像条两侧那 16px 留白是框的半圆收口要的几何余量，`dock.cjs` 的 `capsClear` 在守着，没动。）
- [x] 名字牌不再压帽子（用户 2026-09-28：「名字挡着帽子了 提高一下字」）：原来固定在 Head 骨骼
      上方 0.36m，而尺子角色的 Head 骨骼在 1.08m、板子/帽子一直长到 1.38~1.97m，牌子正好压在帽子上。
      现在每帧量一次"这个角色当前最高的地方"（`nameTags.crownTop()`），取 `Head+0.36` 与
      `最高点+0.26` 的**较高者**；7 顶帽子 + 坐姿实测净空全为正（`test/browser/name-tag-clear.cjs`，
      图 `Build/name-tag-*.png`）。
- [ ] 远端跑步的实际效果没能用浏览器验出来（服务端对坐着的人不放行运动，注入一帧会被场景上报覆盖）。
- [ ] 小窗头像只按配色取图，不含配件组合。
- [ ] `跳跃_Jump` / `前空翻_Flip` / `游泳_Swim` / `打拳_Punch` 还没接场景交互（只是能用）。

- [x] 2026-09-15: 修「视野有时被突然裁掉一大半、刷新就好」——`updateWorkstationClip` 的前景裁切 `near = depth - 1.25` 会随视距无限放大（对焦工位后缩到 22m 时 near=20.9m，整个前景被裁掉），改为 `clamp(depth - 1.25, 0.1, 1.25)`。新增 `OfficeWeb/test/browser/focus-clip.cjs`（缩到 65m near 仍 1.25；相机→工位 20 段前景旧规则裁 20/20、现在 0/20）与单测；A/B 截图 `Build/ab-old.png` / `Build/ab-new.png`。顺带修名字标签 Sprite 让诊断射线抛错的问题（标签不再可拾取）。前端 `index-Dpusn6cO.js` 已上线，线上 SHA256 `8d810b48…c6a6` 与本地一致。详见 `Design/Deployment.md`「2026-09-15 15:40」。

- [x] 2026-09-15: 构建产物完整性防护：新增 `OfficeWeb/test/public-parity.mjs` 并挂到 `npm run build` 的 `postbuild`，核对 `public/` 与 `Build/OfficeWeb` 逐文件大小。起因是实测中发现两个 agent 同时构建到同一个 `outDir` 会把对方刚拷进去的文件删掉（`assets/basis/` 两个 KTX2 转码器变 0 字节），浏览器里**静默**回退到备用模型、只表现为"加载慢"，而线上 dist 因 scp 不删文件反而是好的——本地测的与线上跑的不是同一套资源。

- [x] 2026-09-15: 头顶名字改为**屏幕固定大小**（`SpriteMaterial.sizeAttenuation=false`，每帧按 24 CSS 像素反算 scale；远近一样大，测试断言远景/近景 `pixels≈24` 且 `scaleY` 相同）。载入慢的实测与修复：默认模型 `office-balanced-gpu.glb` 14.89MB，办公室就绪（干净构建、转码器齐备）**3270–3500ms → 2143–2304ms**（各 3 次，同一份代码对照）；另外纠正了「用 Ctrl+F5 硬刷新确认」——硬刷新会绕过缓存重下 15MB，而普通刷新就足够。前端 `index-C3HxeGVb.js` / `index-BOg4IzVj.css` 已上线，线上 SHA256 `931382f6…ece` / `df76d90e…25c` 与本地逐字节一致。详见 `Design/Deployment.md`「2026-09-15 11:38」。

- [ ] 2026-09-15: 失焦/后台窗口里 3D 模拟只有约 1/10 速度。原因：`sceneLoop` 在失焦时改用 `setTimeout(…,100)`（后台被浏览器节流到 ~1s），而 `dt` 仍被 clamp 到 0.1s，于是每次 tick 只推进 0.1 秒。表现为「窗口在后台时自己的角色几乎不走、访客走到沙发要十倍时间」（本次 `visitor-labels.cjs` 因此先让访客页在前台）。位置最终仍正确。修法候选：把 dt 上限放宽到 ~0.35s（仍防跳变）。属 `sceneLoop` 的节能改动范围，未擅自改。

- [ ] 2026-09-15: 首次载入若还要更快，只能动资产本体：① 预转码 GPU 就绪格式（BC7，加载零转码）；② 降纹理分辨率（转码量按像素数下降）。两者都要牺牲当前 GPU 压缩版的显存/画质收益，需用户确认后再做。

- [x] 2026-09-15: 访客在右侧列表单独一行（琥珀色、点击把镜头对到本人）；所有角色头顶显示自己的名字（`OfficeWeb/src/nameTags.ts`，自己/成员/访客三种配色、随距离淡出、坐下降低挂点）。`OfficeScene.tsx` 因此一度到 546 行，已把视角预设与逐人 helper 抽到 `OfficeWeb/src/sceneViews.ts`（现 492 行）。前端 `index-BzFXjOZU.js` / `index-CCVeF8Qd.css` 已上线，线上 SHA256 `12e69d7b…746` / `ef261f82…52c` 与本地逐字节一致，纯前端未重启服务。证据 `OfficeWeb/test/browser/visitor-labels.cjs`、`Build/name-tags-desks.png`、`Build/visitor-sidebar.png`、`Build/visitor-focus.png`、`Build/visitor-labels-evidence.json`。详见 `Design/Deployment.md`「2026-09-15 11:07」。

- [x] 2026-09-14: 设置里的「我的角色」改为与首访一致的缩略图网格——抽出 `OfficeWeb/src/CharacterChooser.tsx`，`SeatPicker` 与 `CharacterSetting` 共用，删除下拉框；设置弹窗加宽到 560px 使缩略图两行放完。前端 `index-C83fSQrx.js` / `index-B4pndPqT.css` 已上线，线上 SHA256 `ca595e90…73c` / `5e90aa2a…036` 与本地逐字节一致，纯前端未重启服务。证据 `OfficeWeb/test/browser/character-setting.cjs`、`Build/character-setting-thumbnails.png`、`Build/character-setting-chosen.png`、`Build/character-setting-evidence.json`。详见 `Design/Deployment.md`「2026-09-14 23:10」。

- [ ] 2026-09-14: 三个浏览器 harness（`test/browser/deployed-smoke.mjs`、`livekit-screen.mjs`、`livekit-workstation.mjs`）仍在跑**旧版选座 UI**（`.seat-picker`、`.seat-picker-grid`、「先不选」），而现在的选座是「先选角色 → 点场景里你想坐的椅子」（`.seat-picker-hint`，「取消/确认」）。按现状这些用例必然失败，不能当作联机验收证据；需按新 UI 重写（可用 socket 直接占座或走场景点击）。

- [x] 2026-09-14: 相机默认视角改为开放工位（`OfficeWeb/src/App.tsx` 初始 `view` = `desks`），并按要求移除本地运行方式（`npm run server`/`npm run dev` 两个脚本与 `vite.config.ts` 开发代理；`start.mjs` 线上入口保留）。前端 `index-BZwjPWbv.js` 已构建并上传，线上 SHA256 `f115d614d311d9c9713527c2e08406f026675361408595ec899ea61f684c4f66` 与本地逐字节一致，纯前端未重启服务。真实浏览器证据：`test/browser/default-view.cjs`、`Build/default-view-open-desks.png`、`Build/default-view-evidence.json`。详见 `Design/Deployment.md`「2026-09-14 22:51」。

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
- [x] 0.1.6品牌去重：标题栏只留图标（名称保留给读屏与窗口标题）、网页只留字母，登录卡与应用内导航条都不再显示图标；外壳三文件已重打包，asar哈希一致、隔离启动与真实窗口截图通过。网站未改动。详见Deployment.md「桌面端品牌去重」。
- [ ] 登录后在真实应用内确认导航条只剩字母（本机验证时为未登录状态）。
- [x] 0.1.7窗口圆角：透明窗口+CSS圆角，标题栏负责上两角、页面负责下两角，最大化/全屏时半径归零。逐像素验证四角真透明、剖面为抗锯齿弧线、最大化变直角；代价是无原生阴影，改用1px内描边。仅外壳改动，网站未动。详见Deployment.md「桌面端窗口圆角」。
- [ ] 待用户确认：无原生阴影的实际观感是否接受（我给的截图是合成效果，不是真实桌面）。

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
- [x] `package-lock.json`（2165 行）不能按行拆分（npm 只认单个根锁文件），经用户确认记为 500 行规则的**唯一**例外，条款写入 `OfficeWeb/AGENTS.md`。
- [x] 决策（2026-09-14 用户）：`Build/` 下 30 份历史构建副本共 2.8GB **全部保留**，改为依靠修正后的部署文档避免传错目录。
- [x] 决策（2026-09-14 用户）：`.git` 约 5.9GB 不可达松散对象**保持现状**，不执行 `git gc`（git 会持续打印 unreachable objects 警告，无害）。

仍待处理（本次未做，需用户决定）：
- [ ] 开放注册 + 附件无总量配额仍可刷满磁盘（单文件 20MB、保留 7 天，无总配额）。
- [ ] `screen-`/`voice-` 房间（遗留授权路径，客户端已不用）的 LiveKit 令牌未限制 `canPublishSources`。
- [ ] 浏览器回归测试需要本机装 Playwright：`npm i -g playwright && npx playwright install msedge`；本次只做了线上登录页真实浏览器检查，未跑完整浏览器/桌面回归。
- [ ] 真实跨网络双设备音视频验收仍按既有条目未完成。

## 2026-09-14 屏幕标注（进行中）
需求：观看别人屏幕时可最大化/全屏、视频上有悬浮按钮（静音/挂断/抢占共享），并能像白板一样在共享画面上标注；分享者要在**自己真实桌面上**看到别人的标注（他在别的软件里也要看得见）。
已完成并验证的部分：
- [x] 服务端中继 `collab-annotations.mjs`：只有同一通话/同一会议的人能互相看到笔画，坐标夹紧到 0..1、超频丢弃、越权 scope 不转发、断线清理表；集成测试 3 项（含会议分支与第三人越权）。
- [x] 客户端纯逻辑 `src/annotations.ts`：笔画归并、每人稳定颜色、**按共享屏命名空间**（这就是多屏识别）、扣掉 object-fit 黑边的坐标归一化；单测 6 项。
- [x] 观看/标注舞台 `src/ScreenStage.tsx`：视频 + 画布叠加层 + 悬浮按钮条（标注/撤销/清空/最大化/全屏 + 调用方传入的静音我/静音对方/抢占共享/挂断）。已接入私聊通话面板。
- [x] `media.ts` 新增"静音对方"（仅本机听不到，不影响发送方）。
- [x] 桌面屏幕层 `OfficeDesktop/annotation-overlay.*`：置顶('screen-saver')、`setIgnoreMouseEvents(true,{forward:true})` 鼠标穿透、`setContentProtection(true)` 不进屏幕采集、按被共享显示器定位、换屏复用同一窗口；桌面测试 5 项（原有 15 项也全过）。
- [x] 桌面接线：`permissions.cjs` 在选定共享源时记录显示器、`desktop-bridge.cjs` 三个 IPC、预加载暴露 `annotations.attach/detach/draw/clear`、`main.cjs` 创建层。
- [x] `tsc --noEmit` 通过；网页单测 104/104；桌面测试 20/20；`npm run build` 通过；所有文件 ≤500 行。

未完成（下一步）：
- [ ] **两客户端浏览器实测**（项目规则：没做多人验证不得宣称可用）：观众画线 → 分享者桌面层出现；最大化/全屏/悬浮按钮实测截图。
- [ ] `MeetingCenter.tsx` 的远端屏幕也换成带标注的舞台（当前只有私聊通话面板接了）。
- [ ] 打包新 EXE（版本待定）并部署网页；上线后核验线上版本。
- [ ] 已知限制：共享"窗口"时无法映射到桌面，标注只显示在共享画面上（会提示用户）；屏幕采集是否会录到标注层需在真实设备上确认（已用 setContentProtection 防，但未实测）。

## 2026-09-22 文件直传（拖到任务栏头像就发）

需求（用户原话）：「新增文件发送功能，就是把文件拖至状态栏某人头像，就会开始发送，不需要对方同意，
直接就发送到设置好的位置，设置里面可以改，双方要显示系统级进度条，完事有打开和打开文件夹的功能」。

已完成并验证（单测，非多人实测）：
- [x] 服务端实时中继 `OfficeWeb/file-relay.mjs`：**只转发、不落盘**（源码级断言禁止出现 `node:fs`），
      端到端 ack + 发送窗口 4 + 分片 512KB 上限 + 单发送方 3 个 / 全局 24 个传输上限；
      `test/file-relay.test.mjs` 10 项全过。已接进 `server.mjs`。
- [x] 主进程 `OfficeDesktop/file-transfer.cjs`：接收文件夹设置（默认 `<下载>/iruler dream`，设置里可改，
      落盘在 `userData/file-transfer.json`）、按句柄读源文件、静默写接收文件夹（`.part` → 收完 `rename`，
      防路径穿越/防重名/躲保留设备名）、`setProgressBar`、`openPath` / `showItemInFolder` 白名单；
      `test/file-transfer.test.cjs` 10 项全过。
- [x] 网页侧 `src/fileTransfer.ts` + `useFileTransfers.ts` + `fileTransferRules.ts` + `FileTransferPanel.tsx`
      + `FileReceiveSetting.tsx`；进度攒 200ms 再渲染（避免 2026-09-20 那类空转），
      `test/file-transfer-rules.test.mjs` 11 项全过。
- [x] 头像条拖放 `dock.tsx`（`webUtils.getPathForFile` → `dropFiles` → 主进程 → 主窗口）、
      底部细进度线、`dock-bridge.cjs` 的 `transfers` 白名单；桌面 `dock-bridge.test.cjs` 已加断言。
- [x] 全量回归：OfficeWeb 251/251、OfficeDesktop 142/142；`tsc --noEmit` 通过；所有文件 ≤500 行。

### 2026-09-21 报障修复：「对方无法接收文件，接收方出现了进度条显示没有进度」

- **根因**：`socket.io-client` 的**浏览器构建**（页面和客户端渲染进程用的就是它）默认
  `binaryType = "arraybuffer"`，收端拿到的分片是 **`ArrayBuffer`——它只有 `byteLength`，
  没有 `.length`**。而 `file-in-part` 原来写的是 `payload?.bytes?.length || 0`，于是**每一片都被
  判成"无效的文件分片"**：接收方的卡片出现却停在 0% 随即失败，发送方只被告知对方收不了。
  服务端（Node 构建是 `"nodebuffer"`）拿到的是 `Buffer`，所以服务端、单测、聊天附件那条老路都正常
  ——问题只在浏览器那一侧，这就是它没被早发现的原因。
- [x] 统一走 `fileTransferRules.ts` 的 `toBytes()`（`ArrayBuffer`/`TypedArray`/`Buffer`/`Blob`/
      socket.io 老式 `{type:'Buffer',data}` 全覆盖），配套 `byteLengthOf()` / `describeBinary()`
      让错误信息说清"收到了什么类型"。
- [x] `file-in` / `file-in-end` 补上 try/catch（原来接收端一抛就永远不 `reply`，发送方要白等 60 秒）。
- [x] 新增 `test/file-transfer-endtoend.test.mjs`：**真的 `file-relay.mjs`** + 两端
      `createFileTransferChannel` 跑完整一趟，harness **按浏览器的形状投递 ArrayBuffer** 并断言
      转换确实发生过。实测把那一行退回旧写法，4 条里有 3 条立刻变红（已验）。
- [x] `test/file-transfer-rules.test.mjs` 新增 5 种二进制形状的用例（含"`ArrayBuffer` 没有 `.length`"）。
- [x] 回归：OfficeWeb **256/256**、OfficeDesktop **142/142**、`tsc --noEmit` 通过。
- [x] **纯前端修复，已上线**：只重新构建上传了 `index.html` + `assets/main-Bs-ZW9Sa.js`
      （其余分块哈希未变），**两端刷新页面（F5）即可，不需要重新装客户端**。
- [ ] 仍需用户真机复测一次完整互传（下面的两条待办不变）。

未完成（下一步）：
- [x] **真机拖拽实测（已完成）**：2026-09-21 用 CDP 对着正式客户端派发**真实拖放**（目标只用用户
      授权的测试账号 `李小桃公司`），跑通到 `已发送给 李小桃公司 · 已送达 [打开][打开文件夹]`。
      - **根因是服务端的**：`io.to(room).timeout().emitWithAck()` 是**广播操作符，回的是数组 `[ack]`**，
        服务端却当对象读 `answer.ok` → 恒为 `undefined` → **每一趟都在 `file-offer` 被判成
        「对方无法接收文件」**，而对方其实每次都回了 `{ok:true}`。已加 `firstAck()` 并留了一行
        服务端 warn（`grep file-relay`），详见 `AGENTS.md` 与 `Deployment.md`。
      - **测试为什么没抓住**：假 `io` 回的是单个对象（照着"我以为的"写）。现在两个 harness 都回数组，
        退回旧写法 11 条红 9 条。
      - 顺带修掉：IPC 错误原文漏到界面（`readableError`）、失败行抬头还写"正在发送"。
      - 仍然人工值得再走一遍的：**从资源管理器真的用鼠标拖**（自动化派发的拖放能覆盖
        "拖放事件 → 路径 → IPC → 发送"，但不覆盖真实 OLE 拖拽源）。
- [ ] **两账号真机互传实测**：发送方和接收方的任务栏进度条、头像条进度线、完成卡片与
      「打开 / 打开文件夹」；网页账号当接收方时确认落到浏览器下载文件夹。
- [ ] 断线/中途关客户端的表现复核（当前：对端立刻收到"这一趟没了"，本端卡片标红并可关闭）。
- [ ] 暂不支持发送文件夹（两端都拒绝并提示打包后再发）；是否要做待用户决定。
- [ ] 大文件（接近 2 GB 上限，2026-09-21 从 4 GB 下调）在真实网络下的耗时与内存占用复核。
      **注意聊天附件是存在 VPS 上的**（保留 7 天），2 GB 的文件会明显吃盘；
      头像直传是纯转发不落盘，没这个问题。

### 2026-09-21 上限调整：聊天附件 20 MB → 2 GB，头像直传 4 GB → 2 GB

- [x] 四处常量一起改（`file-relay.mjs` / `file-transfer.cjs` / `chat-files.mjs` / `chatAttachments.ts`），
      并同步 `ChatPanel.tsx`、`OfficeDesktop/README.md`、`Design/Chat_Attachments_20260913.md` 的文案。
- [x] **必须一起改的两处**：下载期限从写死的 `AbortSignal.timeout(60000)`（它卡的是**整条请求**的期限！）
      改成随大小放大的 `downloadTimeoutMs()`；超过 256 MB 的附件不再写 IndexedDB。
- [x] 新增 `test/file-size-limits.test.mjs`（3 项）+ 桌面侧 1 项，把四个数字钉在一起（改一处就红）。
- [x] 已上线：前端 `main-5mc0XjJs.js`；后端 `chat-files.mjs` + `file-relay.mjs` 并重启 officeweb；
      服务器上两个常量都是 `2 * 1024 ** 3`。
- [x] 服务端硬门已按 2 GB 生效；`OfficeDesktop/file-transfer.cjs` 的 2 GB 预检在下一次打包时生效。
- [ ] 真机发一个 1～2 GB 的文件走一遍。**聊天附件那条路要特别留意速度**：上传是 128 KB 一片、
      逐片等回执，2 GB 约 1.6 万次往返，比头像直传（4 片并行 × 256 KB）慢得多。
      慢到不能接受就把分片调大——`server.mjs` 的 `maxHttpBufferSize` 是 300000，还有余量。

### 2026-09-21 聊天框的文件下载复用文件直传那套

需求（用户）：「整理一下聊天框里面的文件下载，要带进度条，要软件内设置好下载位置 下载好了也还是有几个按钮 打开等 复用」。

- [x] 不另写下载器：`fileTransfer.downloadAttachment()` 走同一条通道 → 同一个接收文件夹（设置里改一处两边都变）、
      同一份被限流的进度、同一条任务栏进度条、同一张卡片、同样的「打开 / 打开文件夹」。
      数据来源是 HTTP 流，抽到 `src/downloadStream.ts`（分块搬运 + 背压）。
- [x] 聊天气泡里加了自己的细进度条和「下载 / 重新下载 / 打开 / 打开文件夹 / 取消」；小附件另有「另存一份」。
- [x] **行 id 就是附件 id**，所以重复点「下载」不会下两遍。
- [x] 修掉"所有附件都在后台自动预取"——上限到 2 GB 之后那等于打开一次聊天静默拉几个 GB；
      现在只预取 ≤4 MB 的（图片预览用），大文件点了才走。
- [x] 测试：`test/download-stream.test.mjs` 6 项 + 聊天下载 3 项 + 1 项"别再写一套下载器"的源码断言；
      全量 OfficeWeb 269/269、OfficeDesktop 143/143、`tsc` 通过。已上线（纯前端）。
- [ ] 真机点一个聊天附件走一遍（重点看：进度条动、落到设置里那个文件夹、「打开 / 打开文件夹」可用）；
      网页账号点下载则确认走浏览器下载且有进度。
- [ ] `src/fileTransfer.ts` 已经 **494 行**：下一次改它之前先把**发送那一半**（`sendOne` / `sendFiles`）拆出去。

### 2026-09-21 尺子人角色（只做了 Blender 那块）
用户给了 `跑步循环.blend`（黄色尺子吉祥物）要"换一个角色 / 只靠颜色区分"。已加工并放在
`AssetSources/Characters/RulerMascot/`：加工过的 `.blend` + 6 个配色 GLB（黄=计划里的母亲）+ 缩略图，
每个 1.10 MB / 21,790 三角面，动作 `Idle`·`Walk`·`Wave` 齐全（详见该目录 README.md）。
- [ ] **网页接线没做**（用户明确"只做 bl 这块"）：搬 `glb/` 进 `public/assets/characters/`、
      缩略图进 `thumbnails/`、在 `src/characters.ts` 登记；`test/dock-rules.test.mjs` 断言该目录
      **正好 21 个 GLB** 且每个都在 catalog 里，改的时候要一起改。
- [ ] 骨骼名仍是 Auto-Rig Pro 那套（`thigh.L`/`palm.L`/`spine.k`…），坐姿/站姿代码按 Quaternius
      名字找骨头，所以这角色**不会正确坐下**（也拿不到 `restHipHeight`/`groundFootHeights`）：
      要么加骨骼名映射（映射表在 README 里），要么只让它站着 / 只用于小窗打招呼。
- [ ] 素材授权待用户确认（贴图名 `ruler03_材质.002`、原始路径 `06_maps\ruler01` 像是素材包）。




### 2026-09-28 悬停卡片与观看者装扮
- [x] 重设计屏幕缩略图和三个按钮，正式站部署及尺寸/点击验证通过。
- [x] 完整装扮跨窗口传递兼容旧桌面桥；线上蓝色胡子角色渲染已查看。
- [ ] 用户当前客户端退出重开后，由真实另一位同事悬停确认；未连接当前客户端调试端口。
## 2026-09-29 登录记忆与找回密码

- [x] 修复登录失败覆盖本机已保存密码；仅认证成功后更新加密记忆，前端已部署并核验公网。
- [x] 本地完成简化找回密码表单与接口；账号保留、旧会话撤销、落盘失败回滚及浏览器回归通过。
- [x] 用户明确接受仅凭姓名修改密码的临时风险后，找回密码接口已发布；正式入口、表单、能力声明及接口空请求校验通过。
- 记录：[Login_Recovery_20260929.md](Login_Recovery_20260929.md)。


## 2026-09-29 方块共创空间
- [x] 全新基础 Box 场景、无倒角部件库、放置/旋转/移动/拆除/撤销、操作音效。
- [x] 共享宝箱：链接、压缩图片、便签；认证、持久化、多人同步。
- [x] Blender 可编辑部件库源文件（20 种，含方块拱门）。
- [x] 自建楼梯/平台的立体行走：点击寻路、WASD、下楼与多人高度同步。
- [ ] 角色跳跃（此次实现楼梯行走，不含跳跃）。
- [ ] 自建展示屏的视频链接播放与多人同步（当前展示屏是装饰）。
- [ ] 自建工位与账号屏幕预览绑定（现有 9 个逻辑工位保留，新增桌椅可临时入座）。
- [x] 正式发布与公网浏览器验收：资源哈希、双人互动、宝箱、自建座位保护通过。
- 椅背透明仍按原记录延期，不因新场景删除原工程待办。


- [x] 新增可穿过的方块拱门；地板取消初始岛屿边界和 600 件装饰上限。
- [x] 允许悬挑、单角支撑和完全悬空搭建；不做结构承重检查。
- [x] 组件库取消大标题、缩略图缩小并单排显示，颜色与分类合并一行。

- [x] 放置落点与接触面高亮：虚线轮廓、实际接缝亮边、非法位置红色；正式发布及浏览器验收通过。
## 2026-09-29 休闲影音区小物件

- [x] 新增42件方块模型，部件库共62件、8类，支持搜索、换色和独立摆放；已发布核验。
- [x] 62件Blender可编辑库及独立GLB导出；小物件精确贴合桌面，相关测试通过。
- [ ] 影院屏幕/投影仪/音箱的媒体播放联动（当前为模型）。
- [ ] 新休闲沙发、躺椅、脚凳的专属坐/躺动作；既有座位机制保留。
- 详情：[Lounge_Props_20260929.md](Lounge_Props_20260929.md)。


- [x] 按最新要求将阶梯拱改为真正圆弧门洞：外方内圆、无倒角，Blender/GLB同步；空心碰撞和正式页面验收通过。
- [ ] 0.1.34 任务栏头像条静置时仍偶发消失，点托盘三角恢复；尚未捕获故障现场，层级测试不能代替视觉验收。见 [排查记录](Dock_Intermittent_Visibility_20260929.md)。
- [x] 建造预览/标记遵守墙体遮挡，搭建时停用前景裁切；四向墙面安装、精确贴面存档及正式页面刷新验收通过。
- [x] 取消地下搭建深度下限；负高度输入/自动贴面/地下楼梯与多人负高度同步，正式页面保存刷新验收通过。
- [x] 柱子自动轴线对齐、横梁端点跟随，Q切换连接点；实际双柱搭梁及正式页面保存刷新验证通过。
- [x] 修正空心门框跨双柱时鼠标穿过空隙、预览跳远：按真实底足识别两侧柱顶；旋转/地下/远处命中和近处遮挡验证通过，正式页面保存刷新通过。
- [x] 建造体验：目标轮廓、E取同款、F聚焦、反向旋转、连续撤销/重做、移动失败保留与重试；正式资源浏览器验收通过。
- [x] 核对62件部件四向真实尺寸；分开显示规格与居中校验范围，修正宝箱外凸范围；见 [规格核对](BuildingParts_Audit_20260929.md)。

- [x] 三向旋转快捷键与屏幕提示：Q/W水平、X前后、Z侧翻、Shift反向、C接点；翻转后的尺寸校验、贴面、碰撞、持久化、取同款和移动方向同步；正式页面保存刷新通过。
- [x] 旋转W改为R；建造时WASD可行走，独立常驻快捷键提示；正式页面实际移动与角度不变验证通过。
- [x] 旋转快捷键提示移到预览部件的三色旋转轴环上，跟随部件和视角，遵守遮挡且不拦点击；正式页面验证通过。
- [x] 移动模式改为原位选中+三轴箭头/旋转环手柄；松手保存、Esc取消拖动、失败恢复、相机不误拖，正式页面鼠标操作验收通过。
- [x] 手柄取消包围盒中心0.25m吸附；按原位置5cm移动，Shift 1cm微调，真实边缘磁吸与接触高亮，正式页面验证通过。
- [x] Shift点击多选/取消、组中心手柄拖动、保持相对位置、整组原子保存与撤销/重做，正式页面验证通过。
- [x] 取消贴墙/贴面自动旋转，所有吸附只改位置；四面墙256种朝向及正式页面背面墙保存刷新验证通过。
- [x] 狭窄柱顶边缘辅助吸附，修正鼠标偏入空白时预览跳远；翻转/地下/近处遮挡及空白近水平射线验证通过，正式页面柱顶安装保存刷新通过。

- [x] C键切换四条底边、自动和中心，图内高亮选边及接点提示；1024组落点检查与正式页面键盘切换验证通过。

- [x] 修复四底边贴侧面时绕过高度网格的厘米级错层；正负高度及正式页面保存刷新通过。旧场景坐标不做自动迁移。

- [x] 备份并修复线上三段旧楼梯厘米级高度误差，逐字段核对无其他场景变化。

- [x] 移动选中后底部色板直接改色，支持多选及撤销，正式前端验证通过。
- [x] 用户明确授权后取消12米建造及人物高度截断、600件装饰上限和镜头58米距离限制；正式网站发布验证通过。
- [x] 自建工位接入长期认领、成员工位列表、管理员释放与共享屏幕；高处/地下入座起身高度保留，固定编号与占用保护、重连归属、正式资源点击认领验证通过。
- [x] 移除底部两行快捷键/动态提示，修复悬停造成工具栏上下跳动；正式页面反复移入移出坐标不变，编辑回归通过。
- [x] 新增窄楼梯、高楼梯、窄高楼梯、双坡屋顶及飘旗屋顶；行走/尺寸/旋转/存档测试、正式页面安装刷新与旗帜动画验证通过；同步67件Blender和GLB资产库。
- [x] 漫游关闭建筑选中边框及E/F编辑快捷键，正式页面悬停/点击/模式切换验证通过。
- [x] 组件列表普通滚轮直接左右浏览，无需Shift；正式页面双向滚动及相机不缩放验证通过。
- [x] 宝箱B站内嵌播放器与最大化/还原/关闭，正式真实媒体播放后暂停通过；抖音官方播放器地址已接入，短链接白名单解析。
- [ ] 抖音需有效公开视频补充真实媒体播放验证；小红书内嵌播放暂未找到官方可用方案，当前保留原页入口。
- [x] 视频最大化避让桌面客户端54px标题栏，修复还原按钮被遮挡；模拟标题栏点击验证通过。
- [x] 宝箱上方创建人头像、已读头像与持久化去重，面板完整名单；旧宝箱标明未记录。
- [x] 宝箱内容溢出时首次轻滚再回顶部，显示更多内容提示；用户操作即停止动画。
- [x] 流动箭头部件，三个方向轴旋转/安装/移动/改色/缩放，动画循环；Blender68件库同步。9月30日按反馈缩为单支普通箭头，向前轻点再收回；宝箱饰带留缝修复共面闪烁，均已发布。
- [x] 全部部件增加局部XYZ缩放手柄，最终尺寸按25cm吸附，保存/撤销/碰撞/网格校验通过。
- [x] 去除地板可见网格；参考图建筑色调映射统一作用于旧建筑，存档颜色ID与几何不改写。
- [ ] 复查正式资源完整编辑自动化中旋转后再次拖动手柄未命中的断言；本地完整回归通过，漫游专项通过。

- [ ] 2026-09-30 正式页面宝箱额外回归：chest-people.cjs 的自动滚动瞬间捕获断言超时（第33行）；模型与箭头无关，需复查是否错过短暂滚动或受用户操作取消。

- [x] 2026-09-30 观看头像/来电绿色提示改为轻薄无实边柔光，客户端0.1.36已发布并核验整包；用户更新客户端后生效。
