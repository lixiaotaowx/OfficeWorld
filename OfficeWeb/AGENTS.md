# 项目规则

- 2026-09-30：宝箱里的**视频链接显示封面缩略图、点开即放大观看**（用户：「宝箱里面的视频链接，我希望有一个缩略图放的图片，我希望别人点开的时候可以放大观看」，并确认要**自动抓取平台封面**而不是让上传者自己挑图）。**封面必须走服务端代理，别再改回浏览器直连**（三条都是实测）：`api.bilibili.com` 不发 CORS 头；封面图床认 Referer，带本站来源是 **403**、带 `https://www.bilibili.com/` 才 200；原始封面几百 KB，套 B 站图片 CDN 的 `@480w_300h_1c.webp` 规则后只有 6.6KB／21.5KB／26.2KB。新增 `build-cover.mjs`：BV/av 走 `x/web-interface/view`、番剧 ep 走 `pgc/view/web/season`（**没有 `/x/` 前缀**——线上 `/x/pgc/...` 返回的是 HTML 错误页），图片地址必须落在 hdslb/bilibili/douyinpic 等白名单图床，只收 `image/*` 且 ≤512KB；命中缓存 6 小时、失败只记 5 分钟，**同一链接 in-flight 合并 + 上游并发闸门 3**，平台抖一下重试一次；`COVER_TRACE=1` 打开失败日志。`build-http.mjs` 的 `GET /api/build?cover=<视频页>` **故意不做每账号限速**：一屏可能同时有好几条视频链接，逐个 429 会把缩略图成片打掉（第一版 300ms 限速在回归里当场现形），上游压力交给缓存/合并/闸门；认不到回 **204** 让前端降级。前端 `src/ChestCover.tsx` 把视频链接的 110×88 类型位换成封面 + 居中 ▶ 浮层（`aria-label`＝`放大观看：<标题>`），**点缩略图直接开播放器**；不是视频页或取不到封面时退回原来的 `↗` 符号。播放器宽屏默认窗口 760px → `min(1040px,92vw)`（竖屏抖音仍是 430px），「▶ xx观看」按钮与「最大化」都保留。**抖音目前取不到封面**（分享页只有 SSR 外壳、各种 UA 都不返回 `og:image`、详情接口要签名），保留 og:image 这条尽力而为的路径。回归：`node --test test/build-cover.test.mjs`（8 项：地址识别/白名单/体积/缓存/重试/并发闸门）+ `node test/browser/chest-cover.cjs`（`BOX_LIVE=1` 打正式站；缩略图有尺寸、`<img>` 真的加载出来、只请求本站 `?cover=`、普通链接与失败封面退回符号、点缩略图开播放器且宽度 1040，并**顺带打真后端**：匿名 401、B 站返回 webp（RIFF…WEBP）、站外 204、连发不限速；本地模式还有一段**全真链路**——真服务端 + vite 代理 `/api` + 真账号 + 真宝箱，断言面板里那张图就是平台自己那张（实测 480×300 = `@480w_300h_1c` 那档），截图 `Build/chest-cover-real.png`。**两个坑**：真账号要先过捏人/选座弹窗，用例只把 `/api/auth/me` 换成「访客 + 已捏过人」；两段用例的宝箱**不能放同一坐标**——叠在一起时点击只命中先渲染的那个空宝箱），截图 `Build/chest-cover-{local,live}.png`、`Build/chest-cover-player-live.png`。

- 2026-09-30：三维提示文字重做（用户：「移动工具的提示文字的ui设计的实在是太丑了 以及安装工具也是 旋转快捷键的那些提示 重新设计一下」→「这个很丑 不要太大 太抢戏，改小，另外把移动的那个去掉提示，安装的这个做成类似 blender 的饼状菜单的 ui 排列文字，不会重叠和干扰」）。**移动手柄那句提示整条删掉**（`BuildMoveHandle` 里不再有 sprite，`build-gizmo.cjs` 断言 `children` 里 sprite 数为 0）；安装模式的三条旋转提示 + 接点改成**饼菜单方位槽**：贴片挂在 `root` 下（不再挂在环里，见下），按相机的右/上向量摆到 **左／上／右** 三个槽，接点占**右上 45° 斜槽**——**不设正下方槽位**（画布底部压着建造工具栏那层 DOM，放那儿会被整条挡住）。因此 `buildRotationGuide` 的 sprite 从"环的子节点"变成"root 的子节点"，`build-experience.cjs` 的断言跟着改成读 `root` 下的 sprite（仍按 `Q / R · 左右转`／`X · 前后翻`／`Z · 侧翻` 顺序，接点用 `C · ` 前缀单独断言）。**贴片一律 `depthTest=false`、`renderOrder=900`（浮在部件与环线之上）**，环线本身仍遵守深度遮挡（用户：「不要遮住」）。**圆角药丸 + 轻投影 + 该功能强调色的细描边**（原来的深色方框＋8px 高饱和粗边＋粗体大字已经删掉）；快捷键画成 `键帽`（`Q / R`、`X`、`Z`、`C`）与说明文字分开，没有键帽的状态说明用一个同色圆点；**画布按文字宽度自适应**（长文案变宽而不是被压扁），`userData.aspect` 记比例，`fitGuideLabel(sprite,height)` 按高度缩放；**屏幕高度恒定**（`guideLabelHeight(distance)=clamp(distance*.027,.05,.45)` ≈ 27px，实测 31px），禁止再写死 `96/512` 这种比例。`userData.shortcut` 仍是完整文案（`'Q / R · 左右转'`、`'C · 自动'`）。回归：`node test/browser/build-hints.cjs`（画布是细长药丸、有不透明深底、有浅色文字、屏幕高度 22~32px；移动模式**没有**任何贴片；三条环提示各占左/上/右槽、接点占右上斜槽；任意两张的屏幕矩形不相交；且都不落进底部工具栏那条带（画布 72% 高度以下）；截图 `Build/hint-install-*.png`；`BOX_LIVE=1` 可直接打正式站）。
- 2026-09-30：宝箱面板重新布局（用户：「宝箱内的页面再设计一下，布局合理」）。样式搬进 `src/chest.css`（`build.css` 不再管宝箱）：面板 940×720（`min(940px,96vw)` × `min(720px,92vh)`，内部统一 `border-box`），**面板自身不滚动**，滚动只发生在 `.build-chest-items`（内容列表）里——旧版是 480px 宽、列表 `max-height:260px` 加外层面板各滚一次的双滚动。左栏＝创建人/已读头像 + 滚出提示 + 单列条目（110px 类型位：图片缩略图，链接 `↗`、便签 `≡` 圆角块；右侧标题/域名/正文/署名 + `▶ xx观看`／移除）；右栏＝`放进宝箱` 表单常驻（`.chest-rail`），条目计数 `N / 30 项` 移到标题栏。便签超过 120 字显示「展开全文」。窄屏（≤860px）右栏落到列表下面，`grid-template-rows:minmax(120px,1fr) minmax(0,50%)`，两边各自滚动、都不裁内容。回归 `node test/browser/chest-layout.cjs`（面板不出视口、只有一个滚动区、无横向溢出、行不重叠、缩略图有尺寸、表单完整可见 + 窄屏一档，截图 `Build/chest-panel-*.png`）。
- 2026-09-30：`useChestScroll` 的"轻滚 90px 再回顶"改成本组件自己持有计时器，**只在真正卸载（`!element.isConnected`）时才 clearTimeout**：以前在 effect cleanup 里清计时器，而 `shown` 标记活在 ref 里，依赖变化／StrictMode 开发态重跑就会把刚排好的滚动作废——现象是"提示有了、滚动永远不发生"，实测 4 次里 3 次不滚。回归：`test/browser/chest-people.cjs` 用页面内峰值探针断言"确实滚过"（从 driver 侧轮询瞬时动画会漏）。

- 2026-09-30：移动模式三轴手柄重新设计（用户：「组件的移动工具的轴实在是太艳俗丑陋了」→「太大了 太笨重了 不要被遮挡 饱和度低一点」）。样式集中在 `src/buildGizmoStyle.ts`：三轴用低饱和度色（`#c38e88`／`#97c28e`／`#92b1c4`，悬停 `#dfc590`），缩放方头与支杆是奶油 `#ddd0bd`；`control.setSize` 改成平移 0.7／旋转 0.9／缩放 1.15（原 .85／1.2／1.65），杆半径 .0075、锥头 .03×.15、方头 .048、中心圆球 .032，都比 three.js 默认细一圈（原粗锥＋三棱面细杆、且只有单侧有杆）。**手柄和提示标签一律 `depthTest=false`、`renderOrder ≥ 900`，永远画在被操作部件之上**（用户明确不要被遮挡；`buildRotationGuide` 的提示贴片同样是 `depthTest=false`，见下条）。**悬停时其余轴保持原样，不许压暗（用户：「没选的其他轴还是看不清 … 其他轴不要变色了」）**：只把抓住的那根换成饱和色并放大 1.16，别的轴连不透明度都不动（平移 1／旋转 .72／缩放 1）。**抓住的轴必须一眼可辨**（用户反馈「点中轴的时候怎么看不清了」）：选中态换成饱和轴色 `#d2603f`／`#3f9a55`／`#3579ad`、手柄放大 1.16 倍、辅助线也用该轴色并在拖动时加实到 0.6——禁止把选中态做成淡沙色，它在浅色地板上比静止时还难认。放大的缩放值必须在**每个 handle 自己的 `updateMatrixWorld` 里**乘（gizmo 每帧会先把手柄 scale 重置成相机距离推出的值，写在帧后处理里会被重置盖掉、永远不生效）。TransformControls 只当交互层（拾取仍走它自己的隐形 picker，视觉网格全部关掉 raycast），禁止恢复 three.js 默认纯红绿蓝／纯黄。回归：`node test/browser/build-gizmo.cjs`（读 `buildGizmoStyle.ts` 的配色做断言，并断言手柄 `depthTest=false`、提示标签不被遮挡，截图 `Build/gizmo-*.png`；加 `BOX_LIVE=1` 就直接打正式站），交互仍由 `node test/browser/build-experience.cjs` 覆盖（它按手柄的 `userData.working` 等空闲再拖——保存未回来时拖动会被拒，别改成靠时序）。

- 2026-09-30：移动模式Shift+D复制主选中物件，原位创建并选中新副本，保留尺寸/颜色/朝向，支持撤销；输入框、漫游和按键重复不触发。duplicate服务端按id/version读取原件，宝箱只复制空外形；fixtureCopy保留模板几何但工位/座椅身份独立，禁止继承原工位编号或认领关系。

- 2026-10-08：**Shift+D 改成 Blender 式的"复制后跟着鼠标摆"**（用户：「在移动模式下，shift d拖拽时复制 类似blender，支持多选」）。按下 Shift+D 立刻在**原位**建好副本并进入**跟随**态（`root.userData.copyFollowing`，浏览器用例等它），鼠标移动副本就跟着走，**单击放下**并保存；没挪动就是原位放下（合法结果，只收尾不写存档）。几个必须记住的坑：①`copies`（副本沿用原件的 id，只是新版本）**绝不能**在循环中按 `selectedIds` 重新筛——第一件复制完 handle 里已经是新版，再筛会一直复制同一件（整组复制变成把第一件复制两遍）；`duplicateSelected` 先 `selectedIds.map(id=>({id,version}))` 记下整组再逐件复制。②整组重选走 `selectCopies(copies)` → `select(part,obj,true,true)`（**加选语义**，否则 `selectRows` 里的"点已选中的就取消它"会把刚落下的副本自己删掉）。③一次点击会同时来 `pointerup` 和 `click`，都带着同一个鼠标位置，所以放下后要 `frozen=true` 冻住跟随，否则第二次 `followMove` 把副本又挪回鼠标下。④`settleCopy()` 里必须 `busy()` 一次，否则 `userData.copyFollowing` 停在 true（实测：状态对了但标记没刷）。⑤`save()` 里"没挪动就 return"那条也要 `if(this.frozen)this.settleCopy()`。⑥**不要按"版本变了就清空选中"判冲突**：整组保存后主选中会落后同伴一个版本，`sync` 改成"部件还在不在 + `owns()`"，并在保存期间/结束时 `reconcile()` 把本地版本对齐服务端（`settling` 标记防止收尾时用旧快照把选中清掉）。⑦手柄与预览的视觉网格全部 `raycast=()=>{}`（手柄只当交互层），否则选中后"点别处改选"点不动。回归：`node test/browser/build-copy-teleport.cjs`（在原地多一件→跟鼠标→单击放下→原件不动；Shift 加选后整组复制两件都在原位各多一份，再用手柄整组拖走两件位移一致），单测 `node --test test/build-copy-drop.test.mjs`（25cm 吸附+保留小数偏置、高度不变、视线太平返回 undefined、半格内算原位放下）。原有 `build-experience.cjs`/`editable-scene.cjs` 的移动/多选/撤销必须继续过。

- 2026-10-08：**移动模式下 Delete / Backspace 删除选中**（用户：「请在选择工具下选择物体后，可以按 delete 删除」）。`BuildInteraction.removeSelected()` 和复制对称：**先把选中那一组的 id/version 记下来**（副本/服务端都按 id 找，删掉第一件后再按 id 重筛会漏），再用 `remove` 逐件删（服务端没有批量删除），每删一件都会进历史，**Ctrl+Z 按逆序把整组恢复**；`useBuildEditor` 的 keydown 里只在 `mode==='move'` 时接管、`event.repeat` 不触发、输入框里不触发（和 Ctrl+Z 同一道门）。顺带修掉一个真 bug：`pickable()` 原本把**传送点在移动模式里排除出拾取**，于是"选中后 Delete"对传送点完全无效；现在传送点在移动模式里照常可命中，点击语义改成"**两块以上时点它就是传过去、一块时不响应**"（`hasTwoPads()`），要删/挪传送点走**拆除**模式（那里它是普通部件）。回归：`test/browser/build-copy-teleport.cjs` ③ 单件 Backspace 删除 + 整组 Delete 删除 + Ctrl+Z 整组恢复、⑤ 拆除模式删传送点 + 撤销；正式站 `test/browser/build-parts-live.cjs` 里也真按了一次 Delete 并撤销。**测试写法**：底部那句「已删除 N 件」会被「正在保存…/已保存 · 所有人可见」这条状态覆盖，断言要等**结果**（存档件数/手柄选中数），别等提示文字——踩过，等它必超时。

- 2026-10-08：**用户报「这俩点不上去啊 无法点击建造」——真因有两个，都不是前端产物没发上去**。① **后端在启动时把 `build-catalog.json` 读进内存**（`build-store.mjs` 顶层 `JSON.parse(readFileSync(...))`），只重传前端 + 重启是不够的：正式站那份目录还是旧的，每次 `add` 都回 **400「没有这个部件」**，而前端只在底部显示这句、看起来就像"点了没反应"。**加/改部件必须同时 `scp build-catalog.json` 到 `~/officeweb/` 并 `systemctl restart officeweb`**（重启会丢内存里的工位认领，但不是持久数据；`build-world.json` 不受影响）。② **安装预览（ghost）会挡住射线**：`refresh()` 里 `this.ghost` 是可拾取的网格，站在预览/真部件重叠处点击时命中预览 → `teleportAt` 拿到 undefined → 不传送、反而走开。现在预览创建后整体 `raycast=()=>{}`（它不是场景里的部件），并在 `refresh()` 里漫游模式直接 `ghost.visible=false`。回归：`node test/browser/build-parts-live.cjs`（**正式站**端到端：真鼠标点场景建出直梯+两块传送点并断言落进存档、点传送点立刻站到另一块；验收件结尾删除）。这条用例踩过五个坑，都写进了文件头注释：登录要走页面表单（手工塞 cookie 会停在身份选择页，画布根本不存在）；**每次登录会吊销该账号的其他会话**，所以校验用浏览器自己的 `context.request`，别另开 Node 会话；要点掉"先捏一下你的角色"否则面板盖住画布（合成 PointerEvent 能绕过，极易误判成功）；登录/选身份会冲掉 `?debug=1`，探针就装不上，要重新带上再进一次；**每件都要先把镜头对准落点再点**，否则目标偏出画面、射线打到别处。

- 2026-10-08：**拖动步长统一成整格 + 离格部件回格**（用户：「有些部件额移动单位有问题 没有按照一个格子的大小步长，完整检查」）。**先量正式世界**：179 件里 **63 件不在 0.25 网格上**——`small`/`block`/`arch`/`lamp`/`fern` 那一簇（x≈-23～-26、y≈-1.855）、`beam`/`pillar`/`floor` 正好差 **0.125**、`cinema-screen` y 差 0.065、`desk` 差 0.017…三个来源：①`buildMoveSnap` 的贴面磁吸直接写毫米值，而且步长是"相对保存原点加整格"→ 离格的老部件**永远回不到格上**；②`gapPlacement` 里"把每只脚吸到柱子中心"写的是 `b - a` 的毫米值（**两柱之间搭的梁**就是用户那簇 beam/pillar）；③贴面/接点/顶面放置本来就允许毫米精度（**这条是有意的，别顺手改成整格**）。现在：**水平两轴（x/z）拖动落点吸附到网格**（`gridSnap`，不是"相对原点"），离格的老部件拖一下就回格、之后每一步正好一格；**磁吸候选也走同一套取整**（否则步长会变成 0.19/0.31 这种非整格的量），两个部件都整格时磁吸仍然是精确贴面；**y 仍按原点加整格、保留毫米接触精度**（叠在 1.42m 桌面 / 0.34m 方块顶上必须精确落在那一层，强制整格会浮起/陷进去）。回归：`node --test test/build-move-snap.test.mjs`（新增「全部 70 件部件」扫描：任何方向拖多少，落点都在网格上、位移都是整数格、方向不反；另加"非整格齐平点也要落回网格"）+ `test/browser/editable-scene.cjs`（真拖一次，断言 saved x/z 在网格上）+ `build-surface`/`build-gap`/`build-experience` 全过。

- 2026-10-09：**「对齐网格」按钮：已经建好的离格部件一键回格**（用户：「上线了吗 还是不行啊 是不是因为我已经创建的就不行？」）。**用户猜对了**：上一轮修的是"拖动时怎么落点"，而**老存档里的 63 件不会自己动**——他们是在网格修复之前贴面/搭桥建出来的，不重新拖一次就永远离格。**不做自动迁移**（那会在用户没要求时静默挪动几十件已建好的东西、包括地下那簇），改成给一个显式入口：移动模式工具栏 `⌗ 对齐网格`（`BuildToolbar` 新 prop `onAlign`）→ `BuildInteraction.alignSelected()` 对**选中的**部件（Shift 可多选）逐件发 `{action:'move', id, version, part: alignToGrid(part)}`，每件都进历史，**Ctrl+Z 按逆序逐件还原**；一件都没选时提示「先点选要对齐的部件（Shift 点击可多选）」，本来就在格上时提示「这些部件本来就在网格上」（不发请求）。`alignToGrid` 在 `buildMoveSnap.ts` 里，**只动 x/z，y 一个字节都不碰**——y 是接触高度（1.42m 桌面、0.34m 方块顶、地下 −1.855 那一簇），强行取整会让叠着的东西浮起/陷进去。**多选整组拖动是故意保持相对位置的**（Blender 语义），所以它**不会**顺带把离格的同伴拉回格——要整组回格就选整组点「对齐网格」。回归：`node test/browser/build-align-grid.cjs`（两块离格方块 Shift 多选 → 点按钮 → 存档里 x/z 都在 0.25 网格上、y 仍是 0.105 → 两次 Ctrl+Z 各自回原位）。**写这条用例踩的坑**：两块 1×1×1 的方块**不能贴着放**（x 只差 0.26 时相互重叠，第二下斜视点到的其实是第一件，而 Shift 点已选中部件是"取消选择"，于是永远等不到选中 2 件、卡在等 2 件的超时上）；镜头要**正上方俯视**（`c.position.set(x,16,z+.001)`），斜视会被邻近几何抢先命中。**正式站另有一条** `node test/browser/build-align-grid-live.cjs`（真账号 + 真后端：API 放两块离格方块 → 刷新进场景 → Shift 多选 → 点「对齐网格」→ 正式存档 x/z 回格、y 不动 → 两次 Ctrl+Z 回原位 → 删掉验收件），它踩到**三个只有正式站才有的坑**，以后写正式站用例都按这三条来：①"先捏一下你的角色"面板**在页面稍后才挂上来**（早一步 `count()` 是 0，`confirmLook` 要有 `waitFor`），它带 `role="dialog"` 留在页面上时 `useBuildEditor` 的键盘处理器**整段跳过**，Ctrl+Z 会静默失效；②它那块 `LiveLookPreview` 画布压在场景画布正中（实测 368~598 × 315~602），`__pick` 照样命中部件、真实鼠标却点在预览画布上，所以落点要用 `elementFromPoint` 确认（`.scene` 是场景画布的祖先、预览画布不在里面，正好能区分两块 canvas），并把镜头横移让目标避开；③**Esc 在编辑态是"取消并回到漫游"**，要关面板必须**先按 Esc 再进移动模式**，反过来就一直在漫游里点（表现是提示显示「E 取同款 · F 聚焦」、怎么都选不中）。

- 2026-10-08：**传送点的规则最终定成"点到哪一块就传到那一块"＋粒子条**（用户：「传送点无效，请修复 并且传送点要有粒子条往上出现，简约的做一个，注意性能」→ 追问后澄清：「**不是一对一 是任何地点 直接传送到点击处，只需要创建一个就行**，创建后不要鼠标只能继续创建从而出不来」）。**别再做成"配对"**：第一版是"两块互相传"，只有一块时点了什么都不发生（自查正式世界时里面确实只有一块），用户判定成"无效"；而且更坑的是 **`BuildToolbar` 收下了 `hint` prop 却从来没渲染**，`buildInteraction` 里所有操作提示（「再放一个传送点才能传过去」、放置错误、「已传送」…）用户**一个字都看不到**——"点了没反应"多半就是这么来的。**现在的规则**（都在 `src/buildTeleport.ts`，纯函数）：①**点哪一块就到哪一块**，一块就够，不需要第二块；②已经站在这一块上（`NEAR_PAD=0.6m` 内）再点它 → 去**最近的那一块**（人多时来回跳），世界上只有这一块时返回 `undefined`，调用方给一句「你已经站在这个传送点上了」；③落地朝向 = 面向来路 `atan2(from - to)`，`from` 是**人**的位置（不是上一块传送点）。**四种模式**：漫游和**安装**模式点传送点都是"传过去"（安装模式也算——很多人刚放下传送点还在安装模式，那一下要是去放新部件就会"出不来"）；移动/拆除模式里传送点仍是普通部件（能选中/挪动/删除）。**放下传送点后自动回到漫游**（`useBuildEditor` 的 `change`：`action==='add' && kind==='teleport-pad'` → `mode:'explore'` + 提示），"放一块 → 点它就走"是一条直线，不会再困在安装模式里。`teleportAt` 要知道自己站在哪：`BuildInteraction` 的 Options 加 `position?: () => {x,z}`，`useBuildEditor.attach(..., position)` ← `OfficeScene` 传 `() => avatar.root.position`。**提示**：`BuildToolbar` 把 `hint` 渲染成画面上方的悬浮条（`.build-hint`，`position:fixed` 不顶动工具栏，4.5s 消失）＋常驻 `tip`（安装传送点时说明"在任何地方点它都会传过去"）。**粒子条**在 `src/buildBeam.ts`：每块传送点一根往上冒的光点柱（18 点、2.3m、上下淡出、加法混合），**所有传送点共用一份几何与一份亮青材质**，每帧只更新一次共享的 `position/color`，世界上一块都没有时 `updateTeleportBeams` 立刻返回；不吃拾取（`raycast=()=>{}`）、不参与碰撞、**必须挂空包围盒**（否则目录实测尺寸/选中框会被 2m 高的柱子撑大——和箭头光晕壳同一个坑）；安装预览里要 `visible=false`。**拾取**：传送点只有 0.34m 高，隔着几步很容易差一点打到旁边的地板，所以另挂一块**隐形拾取助手**（1.7×0.9×1.7，`userData.pickHelper=true`、空包围盒）。**踩到的坑/测试写法**：`build-props`/`build-specifications` 里"所有子节点共用一个 BoxGeometry / 找自发光面板"的写法会被 `Points` 和拾取助手带偏（按 `mesh.isMesh && !userData.pickHelper` 过滤）；`Tools/export_box_library.cjs` 的 `sources` 要加 `buildBeam`、导出 Blender 库时 `filter(m=>m.isMesh)`；`test/build-beam.test.mjs` 里 `createPart` 走导出器那份模块图，**别拿测试自己 import 的 `teleportBeamMaterial()` 去比部件上的材质**（两份实例，uuid 必然不同）。回归：`node --test test/build-teleport.test.mjs`（一块就够/点哪去哪/站在上面再点去下一块/落地朝向）+ `test/build-beam.test.mjs` + 全量 377 项单测；真浏览器 `node test/browser/build-teleport-beam.cjs`（粒子条在冒 → 从老远点它就站上去 → 站在上面再点给提示 → 装第二块后自动回漫游 → 站在第一块上点它去第二块）+ `build-copy-teleport.cjs` ④⑤；**正式站** `build-parts-live.cjs`（从 x=4 点 -2.5 那一块 → 直接站到 -2.5；站在上面再点 → 去 -8.5）。

- 2026-10-08：**直梯改成真的能爬的梯子**（用户：「新增直梯是可以通行的，不管是上和下，可以用方向键通行，就类似于游戏，以及自动寻路也可以」）。**别再把它做成一堆台阶**：`buildNavigation` 的抬腿高度只有 0.255m，横档叠在同一个 z 上时上面那级会把下面那级封死（只认最顶上一级 = 爬不上去），改成"每级退后 0.25m 的窄楼梯"虽然能走，但那是个 **3.8m 深的楼梯**、不是梯子（第一版就是这样被用户否掉的思路）。现在的直梯是**可攀爬柱体**：①`buildArchitecture` 里只有两根立柱参与碰撞（`box([.08,3.78,.08],[±.26,1.89,0])`，能贴墙、能选中、有实测尺寸），15 根横档是 `userData.noBuildCollision`（纯外观）；②`root.userData.localClimb={min:[-.35,0,-.25],max:[.35,3.75,.25]}` 是玩法本体，由 `buildArch.climbColumns()` 跟部件的位置/旋转/`buildScale` 一起变换成世界盒，`buildInteraction.sync()` 每帧交给 `setBuildClimbs()`（`dispose()` 里要 `setBuildClimbs(null)`）；③`buildNavigation` 里**梯子不是地面**：`buildTraverse` 进柱体就保持当前高度、`supportHeight` 照旧只认真踏面（放置/落点查询不被梯子污染），A* 在柱体内生成**上下相邻边**（`climbSpanAt`，代价 `CLIMB_COST=1.2`）；④`buildClimb.climbStep()` 是纯规则：柱体里 **W/↑ 往上爬、S/↓ 往下退**（`CLIMB_SPEED=1.15`，比走路慢），到梯顶还按上就朝相机方向迈一步踏上平台、到梯底还按下就退着走出来，踏出去的落点由 `traverse` 校验（平台高度差 ≤0.255m 都能上/下）；⑤寻路跟随由 `avatarPath.advancePath` 负责——**它必须先把 y 挪到路径点的高度再横着走**（`traverse` 在梯子里不改高度，光靠水平走永远上不去）；⑥按键 → 位移那段从 `OfficeAvatar.update()` 搬进了 `avatarWalk.walkStep()`（那个文件正好 500 行上限，搬出来还顺带能单测），`OfficeAvatar` 只负责调它并写回位置/朝向。⑦**爬梯时面朝梯子，不是面朝相机**（用户报「爬梯子时的面朝向不对」）：`localClimb` 里连同**梯面法线**（本地 +Z）一起声明，`buildArch.climbColumns()` 把它跟旋转一起变换到世界坐标（`climbColumns` 返回 `normalX/normalZ`），`buildClimbAt` 顺带返回 `faceX/faceZ`——人站哪一侧就朝哪一侧看，正好压在梯子中线上时返回 (0,0) 让人保持原朝向；`climbStep` 上下爬用这个朝向，只有"到顶踏出去/到底退出来"那一步才跟着实际移动方向（等于走路朝向）。**别用"世界盒哪根轴薄"去猜法线**：梯子被 scale 拉过之后比例会反过来。**另一个坑**：`climbColumns` 的世界盒必须走 `Box3.applyMatrix4`（取 8 个角的 AABB），只把 min/max 两个角转过去的话旋转 90° 后 z 区间会反向、`climbAt` 永远判"不在梯子里"。**寻路跟随那条也要管**：`OfficeAvatar` 里 `atan2(traveled.x, traveled.z)` 在纯竖直位移上是 `atan2(0,0)`，会把角色拧向 +Z，所以只有水平位移 > 1e-4 才转朝向（进梯子时本来就是面朝梯子的，保持住就对了）。回归：`test/build-ladder.test.mjs`「爬梯朝向」用例（前/后/旋转 90°/中线上四种，并断言旋转后法线跟着转）+ 真浏览器 `build-ladder-climb.cjs`（爬到一半把镜头甩到侧面，继续按 W 仍然爬、朝向仍 ≈0；寻路爬梯那一段也采样一次朝向）。回归：`node --test test/build-ladder.test.mjs`（几何 + 柱体内外判定 + 按键爬上/退下 + 自由行走一路按 W 爬上平台 + `buildPath` 顺着梯子到 3.75m 平台 + 爬梯比走路慢）+ `test/build-specifications.test.mjs` 的玩法两件几何断言 + **真浏览器** `node test/browser/build-ladder-climb.cjs`（真键盘 W 爬到 4.0m、↑↓ 退下来、`moveTo()` 寻路也能爬到平台）。目录按实测改过：`size:[0.7,3.8,0.5]`、`dimensions:[0.6,3.78,0.08]`（梯子很薄，0.08m 进深）。**测试写法**：梯子薄了之后，`build-parts-live.cjs` 原来那套"斜着看、瞄准腰高"的射线会先打到梯子**前面的地板**上（于是删掉的不是梯子），现在改成**正上方俯视**并按手柄里的 `selectedIds` 逐个候选点确认；`__pick` 收的是**画布内坐标**，传页面坐标只会得到 `{hit:null}`（踩过）。

- 2026-10-08：**新增玩法两件：直梯 `ladder`（后来改成可攀爬柱体，见上一条）与传送点 `teleport-pad`**（用户：「新增部件：直梯和传送点，单击传送点可以原地消失，直接传送过去开黑吧」）。传送点底座/立柱跟着色板，**面板单独一份自发光材质**（`emissive #2fa79a`、`emissiveIntensity .85`，`buildMeshes` 里缓存复用，不走 `buildColor` 色板），场景里一眼认得出。**单击传送点的规则后来改过一次，以「点到哪一块就传到那一块」那条为准**（第一版写成"配对/去最近另一块"，用户判定成"无效"）；落点 y 用"脚下能站的那一层"（`supportHeight(x,z,ref+0.25)`）重算而不是直接拿存档 y（这条没变）；落地**面向来路**——第一版把方向写成 `source-target` 正好反 180°，浏览器用例当场抓到，现在 `from` 就是**人**的位置。`OfficeAvatar.teleportTo()` 走 `stand()` + 清 path + 摆位置朝向，**不是** `moveTo`（不走过去）。**点击规则/模式行为以「点到哪一块就传到那一块」那条为准**（漫游+安装点是传过去；移动/拆除里它是普通部件）。回归见上面两条。**加了 `玩法` 分类后 `build-props.cjs` 的"8 个分类"写死断言会红**，已改成从 `build-catalog.json` 推导分类列表。

- 2026-09-30：原场景67件静态几何迁入build-world.json，scene-*.json为初始模板，editableScene标记仅迁移一次并先备份。禁止重新在buildEnvironment画固定几何或补回固定地面/碰撞。原工位0～8编号保留，原位置区域禁建取消；已认领/占用座椅保护继续。显示屏随工位旋转/缩放/删除/撤销。
- 移动步长最新改为与安装相同的0.25m，三轴一致、相对保存原点；Shift仅关闭贴面磁吸，不再1cm微调。本条取代下文旧5cm/1cm规则。

## 方块建造空间（用户最新方向，2026-09-29）

- 主场景已改为可搭建的纯 Box 世界，无倒角；不再加载原办公室场景 GLB。原始 UE/Blender 资产继续保留。
- 允许悬挑、单角支撑、完全悬空，不增加承重、重心或必须接地的放置限制。
- 地板可向初始岛屿之外续铺，不计入 600 件非地板装饰上限；存档 `build-world.json` 是运行数据，部署不得覆盖。
- 楼梯、平台和拱门碰撞来自实际 Box，`buildNavigation.ts` 负责高度寻路；移动广播必须保留 `y`。
- 成员列表和通话流程保留。建造组件 UI 保持紧凑单排缩略图，禁止恢复占大高度的介绍标题。
- Blender 部件源在 `../AssetSources/BoxWorld/`，网页几何变动时同步可编辑库。
- 用户明确要求拱门例外：外轮廓方正、内门洞为真正半圆弧，无倒角；不得改回阶梯方块内缘。空心拱门使用独立碰撞近似，不能用整个包围盒封住门洞。
- 建造时禁止隔墙透视：预览为不透明实体，接触标记遵守深度遮挡，编辑时禁用工位前景裁切。
- 侧面安装按世界法线和真实旋转网格边界贴合；切向仍吸附0.25m网格，接触坐标/真实桌面高度允许毫米精度，服务端不得再强制所有轴为0.25m。
- 地下无玩法深度下限：高度输入允许负数，清空为自动；地下贴面不得夹回0，多人移动广播保留负y。原工位保护仅作用于与地上0～2m空间相交的部件。
- 放置接点不能一律为物体中心：同尺寸接触轴自动对齐，横梁默认端点跟随；C/接点按钮循环自动、底边1～4、中心。指定底边按当前朝向的水平包围范围计算，图内高亮选边并标注C；不改变角度，地板指定边不被自动续铺覆盖。中心模式保留自由错位/悬挑，不加承重限制。
- 鼠标指向双柱空隙时，通过部件真实底部接触区域识别共面的两侧支撑，不能只按射线远处命中/地面算落点。近处实体遮挡优先，不得给门洞填不可见实心碰撞。
- 目录 dimensions 是实测宽高深；size 是居中校验范围，非对称模型两者不等。几何变化后跑 build-specifications 测试并同步 Blender 库元数据。
- 建造时 Q/R 左右转、X 前后翻、Z 侧翻、Shift 反向；C 切换接点；WASD始终用于行走。pitch/roll 为0～3，旧存档缺省为0；翻转后底部归零，碰撞/贴面/保存均按实际朝向。翻倒座椅不可坐。E 取同款、F 聚焦；编辑态 Ctrl+Z/Shift+Z 撤销/重做。历史仅在服务端成功后推进，不跨过他人版本变化重写旧操作；移动模式使用原位三轴手柄，松手保存，Esc取消未完成拖动；保存失败恢复原位置。拖动时锁相机，不拦WASD。

- 旋转提示必须显示在预览部件的三维旋转轴环旁，不放回底部文字栏；**提示贴片不吃深度（`depthTest=false`、`renderOrder ≥ 900`）、永远浮在部件之上，环线仍遵守深度遮挡**（用户 2026-09-30：「不要遮住」——第一版让贴片守遮挡，实机上半张被预览部件压掉）；不参与拾取，退出编辑隐藏。
- 用户要求移除底部两行提示：不再渲染build-shortcuts/build-help，禁止悬停提示改变工具栏高度导致按钮跳动；三维轴上的提示保留。
- 漫游不显示建筑选中边框、不响应E取同款/F编辑聚焦；选中仅用于移动/拆除模式，漫游的选座、宝箱等业务互动保留。

- 手柄位移按已保存原点计算5cm步长，Shift为1cm且不磁吸；禁止按包围盒中心吸附造成半格跳位。沿当前轴按实际碰撞片贴边，其他轴不变。

- 移动模式Shift点击增减选择，Shift拖动仍是1cm微调；多选只平移、保持相对位置，moveMany必须整组校验并一次保存，不能拆成逐件请求造成部分成功。占用座椅及历史撤销按组检查。

- 禁止贴墙/贴面自动旋转：位置吸附必须保留rotation/pitch/roll；只有明确旋转键或旋转环操作才改变朝向。
- 狭窄柱顶/台阶边缘允许14屏幕像素内的顶面辅助吸附，按真实碰撞片与遮挡判断，不跨近处实体吸附；顶面判断使用世界法线。空白处近水平射线不得产生极远落点，无有效交点时隐藏预览。

- 四底边接点贴侧面时，高度先吸附0.25m网格，再允许附近实际上下边缘精确对齐；禁止直接保存鼠标原始y。顶面精确贴合、手动高度及地下高度保留。

- 用户最新明确授权取消空间玩法边界：上下没有高度上限，600件装饰数量上限已取消；镜头距离不设玩法上限，远裁切面和雾随视距调整。保留有限坐标、毫米精度、存档容量和原工位通道保护。此条取代前文旧数量限制。
- 自建desk工位接入原有永久认领、工位列表、管理员释放及共享屏幕；编号由build-world.json.seats.json稳定保存，删除不复用，不得部署覆盖。前端WORKSTATIONS为紧凑列表，数字协议编号用workstationAt查询，禁止拿数组下标当动态编号。已认领或有人坐的工位禁止移动/拆除；高处和地下座位保留chair/stand的y，翻倒部件不参与选座。

## 单文件行数上限（用户要求，2026-09-09）

- 2026-09-30：部件增加scale三元组，按原始局部轴尺寸吸附0.25m，旋转前缩放，碰撞/保存/撤销保持一致；移动模式外侧方头轴缩放，已占用工位保护继续生效。地板不再显示GridHelper，但建造吸附网格保留。
- 2026-09-30：流动箭头（flow-arrow）改成**发光、一闪一闪**（用户：「我希望箭头是发光，发光，发光的一闪一闪的那个提示」「箭头组件，那个模型」）。它是唯一会亮的部件：`buildArchitecture` 里给它**单独一份自发光材质**（其他部件按颜色共用一份，`arrowLook()` 缓存），`emissive` 用比本体更饱和的同色（`offsetHSL(0,.18,-.06)`，直接拿本体色会一路推到白、签面就烧掉了），`emissiveIntensity = .9*pulse`；外面再套一层**加法混合的光晕壳**（同几何放大 1.3、`opacity = .5*pulse`、`depthWrite:false`、`toneMapped:false`、不吃拾取、`noBuildCollision`）。呼吸曲线 `arrowPulse(time)=.5-.5cos(2πt/1.3)`（周期 1.3s），由 `updateBuildFlags` 每帧驱动。**光晕壳必须挂一个空包围盒**（`halo.boundingBox=new THREE.Box3()`，three 的 `expandByObject` 认这个自定义值），否则目录实测尺寸/选中框/旋转环半径都会被壳撑大 30%（`build-specifications`/`build-rotation`/`build-scale` 三条单测会当场变红）。**安装预览绝不能进 emissive 更新**：`buildInteraction` 把预览网格换成共享 `MeshBasicMaterial` 时**先跳过 `userData.glowHalo` 并 `visible=false`**（不跳就换成不透明 ghost 材质、在预览外糊一圈实心轮廓），动画侧再用 `if(body.emissive)` 兜一层。回归：`node test/browser/arrow-glow.cjs`（深色背板 + AgX 逐相位量真实像素：中心亮度 166→251→166、光晕藏掉后变亮像素变少、光晕自身提亮 ≥25 级、预览材质无 emissiveIntensity）与 `node test/browser/arrow-office.cjs`（**真实应用**里连拍 10 张，最暗/最亮两帧 4800+ px 变化、最亮 +98 级；截图 `Build/arrow-office-{dim,lit,full}-*.png`；`BOX_LIVE=1` 打正式站）。
- 流动箭头flow-arrow支持普通旋转/移动/缩放；沿 +Z 轻微推移（`arrowNudge`）叠加上面的呼吸发光。不要让安装预览的MeshBasicMaterial进入emissive更新。**两条浏览器用例的期望值曾经过期、已修**：`build-architecture.cjs` 以为世界是空的（其实默认模板本身就是一批 buildId 节点），改为从当前节点数起算、只断言最后六件；`build-props.cjs` 把画廊张数写死 42（目录已长到 68），改为读 `window.__models.length`。以后加部件/改模板时要留意这类"写死的数量"。
- 宝箱创建人/已读人存于build-world.json的chestPeople，创建人来自服务端认证账号；旧宝箱创建人不猜测。成功打开内容后记录已读，按账号去重。场景最多显示创建人+7位读者及余量，面板显示全部。
- 参考新图调整建筑显示配色：buildColors映射旧颜色ID到奶油/蜜桃/蓝紫/橄榄色，旧存档无需重写。所有新旧Box/拱门及色板缩略图保持一致。

- 建筑库新增窄/高/窄高楼梯及双坡/飘旗屋顶，总计67件。楼梯每级高0.25m、深0.5m；屋顶保持Box阶梯几何，小旗仅装饰动画且不参与碰撞，不改变屋顶朝向或落点。网页几何与Blender库同步。

- 每个文件不得超过 **500 行**。
- 按物理行计算，空行和注释也计入，不只计算有效代码行。
- 创建或修改文件后检查行数，提交或交付前再次检查。
- 接近上限时，按职责拆分为多个清晰的模块。
- 禁止通过压缩、拼接大量语句到同一行来规避限制。
- 不得自行给生成的文本文件、配置、文档或参考代码设立例外。
- 二进制模型、贴图和压缩包没有文本行数，不作文本行数计算。

### 唯一例外：npm 锁文件（2026-09-14 用户确认）

- `package-lock.json` 是本规则**唯一**的例外。npm 只认包根目录下单个锁文件，
  无法按行拆分：`npm-shrinkwrap.json` 与 npm workspaces 同样只生成一份根锁文件，
  当前为 lockfileVersion 3、168 个包条目、2165 行。
- 该例外**仅**适用于 npm 生成的锁文件。`src/`、`test/`、脚本、配置、文档等
  一切由我们编写的文本仍必须 ≤500 行，不得据此扩大例外范围。
- 若将来改用其他包管理器、把依赖拆到子包，或锁文件不再由 npm 生成，需重新评估。
- 除锁文件外，当前最长的文件为 `src/media.ts`（495 行）、`src/OfficeAvatar.ts`
  （494 行）、`src/OfficeScene.tsx`（483 行）、`server.mjs`（478 行）；接近上限时按职责拆分，
  不靠压缩规避。2026-09-28 换尺子角色时 `OfficeAvatar.ts` 一度到 505 行，已把坐姿诊断拆成
  `src/sitDiagnostics.ts`、把路径长度拆进 `src/navigation.ts`。

## 身份：成员 / 访客（2026-09-14 用户要求）

- 进软件（注册或登录后）必须先选身份，两个选项：**iruler 成员**、**访问人（客户）**；选择写入账号（`/api/auth/role`，字段 `role`），之后自动记住，不再重复询问。
  - 界面上叫「iruler 成员」（2026-09-14 用户改名，原为「iruler 员工」）；**协议与存储里的取值仍是 `employee` / `visitor`，不要跟着改**，否则已有账号的身份会丢。
- **访客**：进空间就**自动安排到公共区沙发**（服务端 `sitting.freeSofa` 选空位，客户端走过去坐下）；**不占普通工位**（`seat` 认领会拒绝）；**永不广播低分辨率工位预览**（客户端不采集 + 服务端 `ambient-sharing`/`preview` 双重拒绝）。其余功能与成员一致：会议、私聊、语音、以及在通话/会议中**高清共享自己的屏幕**。
- **成员**：工位与低清预览按原规则（见下节）；没有工位时按原流程显示选座提示（先选角色，再点场景里的椅子）。
- **访客不出现选座提示**（2026-09-15 用户要求）：`App.tsx` 的 `showPicker` 增加 `!isVisitor`，访客不再看到「点击场景里你想坐的椅子」；底部身份栏显示「公共区沙发」，设置里显示「我的座位：公共区沙发」且没有「去选工位 / 重新选座」按钮。服务端本来就会拒绝访客认领工位，这只是把不该出现的入口去掉。
- **访客不接收公共聊天，私聊照常**（2026-09-15 用户要求）：公共频道 = 无 `recipientId` 的消息。`chat-access.mjs` 的 `publishChat` 只把公共消息发给成员；`canReadChat(row, accountId, visitor)` 让访客读不到公共历史（`chat-store.page(after, accountId, visitor)` 透传）；`chat-server.mjs` 的 `chat-history` 按身份过滤、`chat` 拒绝访客发公共消息（"访客不能发公共聊天，请私聊同事"）；`chat-files.mjs` 同规则拒绝访客的公共文件，附件下载对公共文件返回 403。客户端 `ChatInbox` 新增 `visitor` 属性，访客的会话列表不渲染「公共聊天」。**私聊完全不受影响**：文字、文件、历史、未读都照旧。
- **名字包含「文杰」**（如 李文杰）→ 进空间**直接坐进老板工位**（服务端 `BOSS_SEAT = 8`，对应 `src/seats.ts` 里 id 为 `Manager`、标签"老板工位"的那一行），并按普通认领**落盘**，重启后仍归他。**只是座位规则**：老板在预览上没有例外（2026-09-15 用户："别什么都老板例外搞得太复杂"），预览只按成员/访客身份判定。
- **访客可以打电话，也能被打电话**（2026-09-15 用户报障"无法给访客打电话"）：访客没有工位，而右侧详情卡原来只跟着**选中的工位**走（`onlinePerson = people.find(p => p.seat === selected)`），所以访客根本没有入口。现在 `SidePanel` 的卡片跟着**被点中的人**走：`focused`（`focusedPerson` 对应的在线成员/访客）优先，其次是该工位的人，并显示「访客 · 在公共区沙发」小标与提示「点上面的按钮即可通话」；三个动作（请求观看对方屏幕 / 分享我的屏幕给对方 / 邀请语音）在目标是别人时都可用。服务端本来就与身份无关（`privateSessions.mjs` 只检查双方在线、不是自己、kind 合法），测试见 `test/roles.test.mjs`「成员可以给访客打电话，访客也能反过来邀请成员」。

## 共享屏幕与标注（2026-09-15 用户报障后修订）

- **只有桌面客户端能"被标注"**（2026-09-15 用户要求：识别对方是网页登录而不是客户端，避免在网页用户屏幕上画）：加入空间时每个客户端上报 `annotate`（`useOffice` 的 join 载荷：EXE 里 `window.officeDesktop.annotations` 存在 → true，浏览器 → false），服务端 `server.mjs` 存进 `person` 并随 `people` 广播；通话面板只对"**正在共享屏幕的那个人** `annotate === true`"渲染标注工具 —— `ScreenStage` 的 `annotatable={false}` 时连「标注」按钮都不出现（撤销/清空同样不给）。理由是浏览器**没有**任何办法把内容画到操作系统桌面上，给入口只会让人以为"画了却没显示"。
  - 已知边界：判定的是**客户端能力**。EXE 用户如果共享的是**单个窗口**，桌面浮层同样挂不上（`reason: 'window-share'`，会有一句提示），此时笔迹只会出现在共享画面里、不会落到他桌面上。
  - 反方向（让网页分享也能被标注，靠查看端把笔迹盖在画面上）**没有做**：2026-09-15 讨论后放弃了那版半成品，相关代码已全部移除（`ink-layer` 事件、客户端笔迹板、`localInk`/`board` 属性都不存在），不要以"半成品"形式留在树里。
- **`annotations` 那个 `useMemo` 必须建在 `socket`/`media` 两个 `useRef` 之后**：工厂函数会**立即执行**并读取这两个 ref，放前面会让构建产物在页面加载时抛 `ReferenceError: Cannot access '_e' before initialization`，整页白屏（2026-09-15 实测并修复）。

- **整屏（全屏）必须随视频一起结束**（用户："屏幕全屏时挂断软件也全屏了无法退出全屏，视频全屏不要影响软件"）：`ScreenStage` 卸载时（挂断、对方停止共享、退出会议、关闭放大视图）若整屏模式是本组件请求的，必须 `officeDesktop.setFullscreen(false)`；DOM 全屏同理 `exitFullscreen()`；Esc 也退出。桌面端 `chrome.cjs` 在页面导航（重载）时同样退出全屏——否则标题栏被 `html.iruler-fullscreen #iruler-desktop-chrome { display:none }` 隐藏，最大化按钮消失且没有出路。`applyFullscreenState` 退出时按窗口真实状态决定 `iruler-maximized`，避免最大化窗口被误判成非最大化而出现圆角。
- **标注中继绝不丢点**（用户："画笔断开"）：`collab-annotations.mjs` 的 40ms 限速改为**排队补发**（`queued` + `setTimeout`），不再 `return` 丢弃；`done` 只在最后一批点之后发送；单 socket 队列上限 512 点；`annotate-clear`/`annotate-undo` 与断线都会清空队列。
- **本机即时回显**（用户："延迟严重"）：笔迹要经过 指针 → socket → 分享者桌面浮层 → 采集 → 视频 才回来，正常几百毫秒。`ScreenStage` 因此在本机画布 `.screen-stage-ink` 上立即回显自己正在画的笔画（同坐标、同颜色 `colorFor(accountId)`），`ECHO_MS=1400ms` 后交还给画面里的真迹，避免双份墨迹；撤销/清空会同时清掉回显。
- **映射按"画面框"换算，不按元素框**：坐标一律相对 `<video>`（`object-fit: contain` 的 letterbox 内框）归一化到 0..1，测量基准是 **video 元素自身**的矩形而不是绘制层；首帧未到时（`videoWidth=0`）退回元素框，避免第一笔被丢掉。`test/browser/screen-stage.cjs` 在 420×700 与 1280×720 两种窗口比例下校验落点命中 0.25/0.75。桌面浮层由主进程保证窗口内容区**恰好等于被共享显示器**（`place()` 先比较再 `setBounds`，页面加载完成后与 `display-metrics-changed` 时重新贴合），所以各种分辨率/缩放下 0..1 都对应同一位置。
- **2026-09-22 报障后修订：清空不管用 + 会议共享没有放大/标注**（用户：「视频通话的标注清空不管用」「视频会议的屏幕分享和私人要保持一样，可以放大观看可以标记，目前没有」）：
  - **清空的根因是浮层白名单**。清空是从**别人的页面**中继到分享者浮层的，走的是 `office:annotation-push`，而 `desktop-bridge.cjs` 把 `type` 写死成只认 `annotate`/`undo` —— `{type:'clear'}` 被**静默丢掉**，所以只有"点清空的人自己也在共享"时才擦得掉。两处都改了：`annotationChannel.mirror()` 让 clear 走**已经放行**的 `office:annotation-clear`（`layer().clear()`），**老客户端（≥0.1.26，含已装的 0.1.30）也立刻生效、不用发新版本**；`desktop-bridge.cjs` 的白名单同时补上 `clear`（浮层 `receive()` 本来就有 clear 分支）。回归：`test/meeting-annotations.test.mjs` 断言 `mirror({type:'clear'})` 必须调 `layer().clear()` 而**不是** `draw()`；`OfficeDesktop/test/desktop-bridge.test.cjs` 断言 push 放行 clear、白名单外的类型仍然拒掉、浮层没开时一条都不推。
  - **会议那条的根因是压根没用 `ScreenStage`**：`MeetingCenter` 里是一个裸的 `<video controls>`（只能播放）。而且会议的画面来源不同 —— 它由 `MeetingScreenShare` 自己采集，**不经过 `media.screen`**，于是 `sharingScreen()` 恒为 false、浮层也从来没 `attach()`，会议里的标注完全不工作。现在：`MeetingCenter` 用 `ScreenStage`（最大化 / 全屏 + 标注 / 撤销 / 清空），`scope = active.room`（`meeting-<id>`；服务端 `collab-annotations.mjs` 的会议分支按 `person.meetingRoom` 校验，`meetings.mjs` 会给参会者写上）；`media.ts` 的会议视频轨**按参与者 identity 作键**（`meetingVideoKey()`；identity = socket id，`server.mjs` 的 mintToken 用的就是 `s.id`），界面才查得到"谁在共享"和他的 `annotate` 能力；`useOffice` 的 `sharingScreen()` 把会议共享也算上，并在 `meetings.sharing` 变真时 `annotations.attach()`。`.meeting-streams .screen-stage video` 单独放行尺寸，别让 `.meeting-streams video` 抢样式。
  - 边界没变：会议里也只有**桌面客户端**共享时才能被标注（`person.annotate`）；浏览器共享一样只给放大/全屏，不给标注工具。

## 屏幕共享的清晰度（2026-09-15 用户报障后修订）

- 报障（用户）：「视频接通后需要等待很久才变清晰…另外会有突然变糊的情况也改善一下」。
- **根因**：LiveKit 对 1080p 屏幕共享默认发**三层 simulcast**（`computeVideoEncodings` 里 `screenShareSimulcastLayers` 未设时给 `[low, mid, original]`），对端先订阅低层、等带宽估计升上来才变清晰，任何一次抖动又切回低层 = "突然变糊"；默认目标码率只有 2.5 Mbps，而 `x-google-start-bitrate` 取目标的 90%，目标小就爬坡十几秒。
- **现在的设置（不要随手改回默认）**：`mediaRooms.ts` 的 Room 里 `publishDefaults.screenShareSimulcastLayers: [ScreenSharePresets.h720fps15]` —— **一个 preset ⇒ 正好两层**（`presets.length === 1` 走 `[low, original]`）：720p@15 1.5 Mbps 垫底 + 1080p@15 5 Mbps 顶层，总上行约 6.5 Mbps。另有 `screenShareEncoding: { maxBitrate: 5_000_000, maxFramerate: 15 }`（目标码率定高，`x-google-start-bitrate` 才会高）；采集时 `contentHint = 'text'`（`screenSwitch.ts` 的 `captureSelectedScreen()`，会议走 `createScreenTracks({ contentHint: 'text' })`）；屏幕轨的 `degradationPreference` 由 LiveKit 默认给 `maintain-resolution`（掉帧不掉清晰度）。`media.ts` 的私聊采集必须复用 `captureSelectedScreen()`，别在别处另起一套 `getDisplayMedia`（`test/screen-quality.test.mjs` 有断言守着）。
- **层数不等于清晰度开关**（2026-09-15 用户追问「为什么不能还是三层把速度提快，非要写死吗」）：看的人拿哪一层由 **LiveKit 服务器**按**接收端带宽估计**决定，页面里只能"声明我要最高层"（我们已 `adaptiveStream: false` ⇒ `VideoQuality.HIGH`），**没有任何开关能命令它立刻给顶层**。所以做法是：把垫底层做成**看得清的 720p**（而不是默认那种很小的 q 层）+ 顶层码率给足，这样"升层"几乎看不出来，抖动最多掉到 720p 或掉帧，不会糊成一团。
- **服务器侧（改的是 VPS，不是仓库）**：`/etc/livekit/livekit.yaml` 的 `rtc.congestion_control` 加了 `use_send_side_bwe: true`（按发送端带宽估计选层，比 SFU 探测接收端更快；字段路径与 livekit v1.8.4 的 `pkg/config/config.go` 核对过）。回滚点 `/etc/livekit/livekit.yaml.bak-20260915-bwe`；改完 `systemctl restart livekit` → active，TURN 55000 与 7880 都在听，API 用 `Build/livekit-api-check.mjs` 验过（listRooms 正常）。这个实例和另一个应用共用，用户已明确同意"直接更新，不用管别人"。

## 切换共享/预览用的屏幕（2026-09-15 用户要求）

- 需求（用户）：「右键自己显示会切换屏幕…在屏幕会议和视频聊天中可以切换屏分享的屏幕也是实时变化过去，除了右键屏幕，右键成员列表中的自己也可以」。
- **两个入口、一个菜单**：画面里右键自己的显示器（`monitorContext.ts` → `App` 的 `screenMenu`）和成员列表里右键自己那一行（`SidePanel` 的 `.seat-grid .seat.mine` / 自己那条访客）打开的都是 `MonitorContextMenu`；菜单状态住在 `App.tsx`，`OfficeScene` 只负责把点击坐标交上去。**只有客户端才有这块菜单**（浏览器没有可切换的物理屏幕，`window.officeDesktop` 不存在时右键走原生菜单）。
- **换屏 = 重新采集 + 原地换轨**（`src/screenSwitch.ts`）：桌面端 `permissions.cjs` 的 `setDisplayMediaRequestHandler` 没有选择窗口，每次 `getDisplayMedia` 都跟着"当前选中的显示器"，所以换屏就是再采集一次；然后 `LocalTrack.replaceTrack()` 把**已发布的轨原地换掉**——不重协商、不断线、不用重新同意。`media.ts` 的 `switchScreenDisplay()` 先问会议（`meetingScreenShare.ts` 的 `switchDisplay()`），再换私聊那条；`useOffice` 监听 `office-display-changed` 触发。低清工位预览仍然由 `useDesktopPreview` 自己重抓一帧。
- 换轨时必须自己收尾：LiveKit 只 detach 旧轨、**不会停它**（`providedByUser` 被置 true），所以要显式 `previous.stop()`；换之前先把旧轨的 `onended` 清空，否则"主动停掉旧采集"会被当成"用户停止共享"而走 `stopScreen()`。低清缩略图循环已拆到 `src/screenThumbnails.ts`（300px / 6 秒 / JPEG 0.55）。
- 测试：`test/screen-switch.test.mjs`（原地换轨、每间一份克隆、共享已结束时收掉新采集）、`test/meeting-screen-switch.test.mjs`、`test/screen-thumbnails.test.mjs`、浏览器 `test/browser/screen-menu.cjs`；真实 Electron 授权链路由 `Build/screen-switch-capture-check.cjs` 覆盖（用合成显示器，不抓用户桌面）。
- **菜单开着的时候页面重渲染，绝不能重读显示器列表**（2026-09-2X 用户报障：「右键出来以后，就整个变卡了。鼠标拖动都变慢了」）：原来 `MonitorContextMenu` 的 effect 依赖是 `[close]`，而 `close` 是 `App.tsx` 每次渲染新建的箭头函数 —— 页面每重渲染一次（服务端 `people`/`seats` 广播、任何一点交互都算）effect 就重跑，每次都调 `window.officeDesktop.displays()`；真实客户端里那一次就是 `desktopCapturer.getSources`，**把每一块屏各抓一遍 480×480 缩略图**（用户是三块屏，实测重渲染 12 次 → 重读 24 次），主进程被灌满，所以卡的是**整台机器**、连鼠标都发飘，而不只是页面。修法：回调放 `useRef`（`closeRef`），effect 依赖改成 `[]`，只在菜单挂载时读一次。**同类写法照此办理**：父组件传下来的回调（`close`/`onXxx`）一律不许进 effect 依赖，`ChatInbox` 的 `onUnread` 就是这么炸过一次（见「页面自空转事故」）。
- 回归：`test/browser/screen-menu-render.cjs` —— 三块屏的假桌面桥自己数 `displays()` 被调了几次，开着菜单用另一台机器的 `input-state` 翻转制造 **12 次真实广播**（每次都要等广播到、并确认页面 `.away-label` 跟着变，才算重渲染真的发生了），断言这段期间重读 ≤2 次；**旧写法实测 24 次、必失败**。注意**不能连着 `emit` 一串**：12 条几乎同时到达会被 React 合成一次渲染，有 bug 也只重读一两次，用例就白写了（实测踩过）。

## 通话窗口可以收起（2026-09-15 用户要求）

- 需求（用户）：「通话中的小窗口可以折叠起来，折叠后只剩三个按钮」「视频窗口的收起也要收起的够小」。
- **只有一个收起按钮**（`.call-fold`，在 `.call-heading` 最右侧），**按钮上写字：「收起」/「展开」**（用户 2026-09-18：「通话的收起按钮太小了，也叫"收起"吧」——不要再退化成小箭头），状态按 session id 记在本机内存里（`folded[session.id]`）。收起后：**只留麦克风 / 共享 / 挂断三个图标按钮**（`aria-label` 分别是「静音|开启或重试麦克风|切到此通话并开麦」「分享屏幕|停止共享」「挂断通话」），视频与状态文字全部隐藏，**面板整体缩到最小**（多路通话时只要还有一路展开，面板就不缩）。
- **共享预览那个"屏幕小窗口"的标题要短**（同一个用户要求：「屏幕小窗口的标题太宽了」）：标题是「正在共享」/「共享到会议」（原来「正在共享屏幕」/「正在共享到会议」），窗口 320px（原 360），标题 `font-size: 12px; white-space: nowrap`。屏幕名之类的细节留在底部那行（有省略号）。
- **视频元素不卸载，只用 CSS 隐藏**（`.call-folded .screen-stage { display: none }`）：展开是瞬时的，也不会动到共享/发布状态。
- **坑：`styles.css` 里有一条全局 `header { height: 102px; border-bottom: … }`**（给页面标题栏用的），通话卡片里的 `<header class="call-heading">` 会继承它——收起时怎么都是 102px 高（实测 172px 的面板）。所以 `.call-heading` 现在显式 `height: auto; min-height: 0; border-bottom: 0`。**窄条里的中文还要 `white-space: nowrap`**，否则 flex 会把名字一个字一行地折下去，高度立刻翻几倍。
- 测试：`test/browser/call-fold.cjs`（真实 SFU：甲请乙共享屏幕 → 收起 → 断言只有三个按钮、视频不可见、面板 ≤200×110 且比展开窄一半 → 展开画面回来 → 再收起点挂断，两边面板都消失）。

## 未接电话提示（2026-09-15 用户要求）

- 需求（用户）：「添加一个未接电话提示，明显一点的弹窗在程序右下角以及拨打时间30秒没人接就提示未接通，稍后重试」。
- **振铃 30 秒**：`privateSessions.mjs` 的 `ringMs = 30000`（`createOfficeServer({ inviteRingMs })` 可注入，测试用短值）。到点 `expire(invite, 'timeout')` 给双方发 `request-expired { id, reason }`，发起方另收 notice「未接通，稍后重试」。`reason` 现在是 `timeout | cancelled | answered`（`server.mjs` 断线清理发 `cancelled`）——**协议是 `{ id, reason }` 对象，不是裸 id**；客户端解析器要同时容忍旧的裸字符串（当 `cancelled`）。
- **弹窗只认 `timeout`**：`src/callAlertRules.ts` 的 `alertForExpiry` 是纯规则（我拨的 →「未接通，稍后重试」；别人拨给我的 →「未接来电」），取消/挂断/婉拒/已接听一律不弹，避免"自己取消也报未接"。视图 `src/CallAlerts.tsx` 固定在右下角（`.call-alerts`），带「再拨一次」「知道了」。窗口在托盘里看不见页面，所以 `officeNotifications.ts` 对 `timeout` 额外发一次桌面/系统通知。
- **一直显示，只能手动关**（2026-09-15 用户追加：「未接来电是否一直显示 只可以手动关闭」）：卡片**没有**任何自动消失的计时器（`CallAlerts.tsx` 里不许再出现 `setTimeout/setInterval`，`test/call-alerts.test.mjs` 有一条断言守着），点「知道了」或「再拨一次」才消失；堆叠上限 `MAX_CALL_ALERTS = 5`，用 `withCallAlert()` 追加（同一通电话只留一条、最新的在最后、超上限挤掉最旧的）。刷新页面不保留（要保留得另存本机，用户没要）。
- 规则与视图分离、服务器只发事实（`reason`），文案由客户端决定：新增原因值时不要改服务器文案，先想清楚"这个原因该不该弹"。

## 在座 / 离桌（2026-09-15 用户要求）

- 需求（用户）：「检测鼠标的移动和键盘的输入…如果在座就在头顶的名字卡片上显示一个绿点，在成员列表也展示一个绿点，如果离桌就显示红点，并记录离座时间分钟为单位，当触及小时，就用小时作为单位…最好是不更新客户端在网页解决」。
- **只在网页实现，不需要更新 EXE 就能上线**（EXE 加载的就是同一个站点）：`src/presenceInput.ts` 监听 `pointermove / pointerdown / keydown / wheel / touchstart`（capture + passive），`AWAY_AFTER_MS` 内没有任何输入算离桌（当前 **10 秒**）。**只发状态翻转**（`input-state { atDesk, idleMs }`），不要在每个鼠标事件里发消息；页面打开默认在座，`connect` 后重新声明一次（重连不能把人一直留在绿点）。
- **在别的软件里干活也算在座（2026-09-15 用户追问后补的）**：网页只能看见**发到本窗口**的输入，所以浏览器里"在 Word 里打字"确实会被判离桌——这是平台限制，除非用客户端。EXE 里换用 **Windows 全局空闲时间**：`desktop-bridge.cjs` 的 `office:system-idle`（`powerMonitor.getSystemIdleTime()` 秒 + `getSystemIdleState(1)` 的 `active/idle/locked`），`desktop-preload.cjs` 暴露 `systemIdle()`，`presenceInput.ts` 有 `desktopIdle` 时每 2 秒（`IDLE_POLL_MS`，要比阈值密）轮询一次：空闲秒数 < 阈值就算在座（本地 DOM 输入仍给即时反应），`locked` 立刻算离桌，轮询失败退回本页输入判定。**老 EXE 没有这个能力时自动退回纯 DOM 检测**，网页与客户端可以各自发版。
- **阈值 10 秒、时长只用一个单位（2026-09-15 用户追加）**：`AWAY_AFTER_MS = 10_000`（"不操作10秒就算是离座"）；`awayLabel` 是**秒 → 分钟 → 小时单一单位**：「离座 55 秒」→「离座 2 分钟」→「离座 1 小时」/「1.5 小时」（≥10 小时取整），**不要**拼成「1 小时 5 分钟」。客户端上报时带 `idleMs`（已经安静了多久），服务端 `input-presence.mjs` 的 `idleOf()` 用它**回拨离座起点**（夹在 0～24 小时），所以刚变红显示的是真实的「离座 10 秒」；桌面端 `IDLE_POLL_MS = 2 秒`，必须比阈值密。
- **离座时钟在服务端**（`input-presence.mjs`）：记 `awaySince`，广播 `atDesk` + `awayFor`（推送那刻已离座毫秒数），内部时间戳不外发；**缺字段一律算在座**（`person.atDesk !== false`），这样旧版客户端与检测不到输入的浏览器不会被误标红；只在翻转时 `publish()`。`server.mjs` 只是把 `people` 广播换成 `inputPresence.view()`。
- **时长文案**（`src/awayTime.ts`）：客户端用 `awayFor + (now - 收到 payload 的时刻)`，**不要比较双方时钟**；列表的 1 秒心跳只在有人离桌时才跑。
- 显示：头顶名字卡片（`nameTags.ts`）左侧一个点（`#3f9d4f` 在座 / `#cf4a38` 离桌，名字右移让开），`atDesk` 变了才重画 canvas；成员列表 `.seat-state` 绿/红 + `.away-label`「离座 N 秒 / N 分钟 / N 小时」，访客条与详情卡同样显示。
- **底部栏要显示"谁在判定"**（2026-09-17 用户报障「离座检测不管用 鼠标需要去到软件里面才行」后加）：`presenceInput.ts` 的 `usesSystemIdle()` + 纯函数 `deskSensorLabel()`，`useOffice` 暴露 `deskSensorLabel`，`App.tsx` 在「我的工位预览：…」旁边多一行「**离座检测：系统空闲（客户端）**」或「**离座检测：仅本窗口输入（浏览器）**」。这次报障的真因就是**本机装的客户端是 0.1.11**（asar 里既没有 `office:system-idle` 也没有 `systemIdle`），于是静默退回纯 DOM 判定 —— 以后先看这一行，不要靠猜。
- 边界：**浏览器**只看得见发到本窗口的输入，在别的程序里敲键盘仍会被判离桌（平台限制，网页层面无解）；**EXE ≥ 0.1.13** 才有 `powerMonitor` 系统空闲桥（0.1.11／0.1.12 装的都是旧版，会自动退回纯 DOM 判定，用户看到的现象就是"鼠标必须进软件"）。放宽阈值就改 `AWAY_AFTER_MS` 一个常量。`node Build/which-client.cjs` 可以直接对比"已安装的客户端"和"刚打出来的客户端"的 `version` 与 `system-idle` 支持。

## 应用内自动更新（2026-09-17 用户要求）

- 需求（用户）：「搞一个推送的功能 直接用命令推送到我的服务器安装器，然后网页检测到新版本就弹出更新软件的提示，然就是下载进度条，然后安装器打开覆盖安装」。
- **发布就一条命令**：`cd OfficeDesktop && npm run publish:update -- --notes "更新说明"`。`tools/publish-update.mjs` 取 `Build/OfficeDesktopRelease` 里与 `package.json` 版本一致的安装器 → 流式算 sha256/大小 → `scp` 到 VPS 的 `~/officeweb/dist/download/` → 生成并上传 `latest.json` → **从公网核验**（HEAD 大小、`Range: bytes=0-1048575` 前 1MB 哈希与本地一致且 `Accept-Ranges` 在、线上 `latest.json` 已是新版本）。`--verify full` 整包重下核对，`--dry-run` 只看动作，`--file` 指定别的安装器。**发版顺序：先 `npm run dist:all` 打包 → 再 publish**（脚本按版本号找文件，找不到会提示先打包）。
- **客户端侧（≥0.1.14）**：`OfficeDesktop/update.cjs` 用 Electron 的 `net.fetch`（走 Chromium 网络栈，自带会话证书处理）流式下载到 `%TEMP%\iruler-dream-update\`，每 250ms 通过 `office:update-progress` 推字节数/百分比；下完**校验 sha256**，不符/不完整就删文件报错；`office:update-install` 交 `shell.openPath` 打开安装器并 **1.2 秒后 `app.quit()`**——不退出，安装器覆盖不了正在运行的文件。安全边界：只允许 `trusted()` 的本站地址、路径必须落在更新目录内、>512MB 直接拒收；三个 handler 都过既有的可信来源门。
- **网页侧**：`src/updateRules.ts`（纯规则：`compareVersions` 按段比数字、`isNewerVersion`、`formatBytes`、`progressPercent`、`describeUpdate` 出文案）+ `src/useAppUpdate.ts`（读 `/download/latest.json?t=…`、问 `appVersion()`、订阅进度、「稍后」按版本记 localStorage、6 小时复查一次）+ `src/UpdatePrompt.tsx`（右下角卡片、`role=progressbar` 进度条、下载更新/立即安装/稍后）。
- **下完自动弹安装器**（2026-09-17 用户："然后安装器打开覆盖安装"）：`ready` 阶段**3 秒后自己调用 `installUpdate`**（`AUTO_INSTALL_SECONDS`），卡片同时给「立即安装 / 打开文件夹 / 稍后安装」；「打开文件夹」走 `office:update-reveal` → `shell.showItemInFolder`，别再让用户自己去找安装包。
- **老客户端（<0.1.14）走 `browser` 阶段：点一下就下载，不要再做引导**（用户历经三轮反馈：「旧客户端下载好了没有弹出文件夹」→ 做说明页 →「**你这个引导也更麻烦了，算了还是刚才那样吧，下载后让他自己去找吧**」）：
  - 查证过旧客户端（0.1.13）的能力边界：`main.cjs` 的 `setWindowOpenHandler` 把**非本站的 http(s)** 交给 `shell.openExternal`（系统浏览器），**其它 scheme 一律 deny**；preload 与 `dream:action` 都没有"打开文件夹/运行文件"。所以老客户端**不可能**自己安装，第一次必须人工双击——这一点改变不了。
  - 现在只做一件事：`window.open(安装包直链)` 直接开始下载；卡片就一行「已开始下载 0.1.16 安装包 · 下载完成后到系统的「下载」文件夹双击安装」+ 文件名与大小，按钮「重新下载 / 复制下载地址 / 稍后」。**不要再塞步骤说明、不要再跳到说明页**。
  - `public/download/index.html`（`https://115.159.43.237/download/`）仍然保留，作为**可以直接发给同事的直链**（页面上有三步说明），但客户端不再自动打开它；`static.mjs` 支持目录首页这条能力也是通用的。
- **老客户端照样弹提示**（没有 `appVersion`/`downloadUpdate` 时 `automatic=false`）。
- **`~/officeweb/dist/download/` 是部署产物，不是仓库内容**：重传前端时**不要** `scp -r` 或清空 `dist`，否则会把安装器删掉（一个约 100MB；服务器上会越攒越多，请留意磁盘，目前 0.1.14～0.1.18 五个约 490MB）。旧版本的安装器可以删掉腾地方。
- **底部栏显示「客户端 0.1.16」**（2026-09-17 随 0.1.15 起）：`useAppUpdate` 把 `appVersion()` 的结果作为 `currentVersion` 暴露给 `App.tsx`。上一轮"装的 0.1.11 却以为是最新"就是这么被误判的——以后先看底部栏这一行。
- **发布顺序**：改完代码 → `npm run dist:all`（OfficeDesktop）→ `npm run publish:update`（推送）→ 前端 `npm run build` 并上传。想让已经装了最新版的用户看到更新提示，必须**再发一版**（装的就是最新的自然不提示）；0.1.15 就是这么发的：0.1.14 的用户第一次就能完整看到"弹提示 → 进度条 → 覆盖安装"。
- 验证：`OfficeDesktop/test/update.test.cjs`（进度、写盘、校验失败删文件、下载不完整、体积上限、只信本站/目录内路径）、`test/publish-update.test.cjs`（参数、清单、哈希、默认安装器、服务器与密钥）；`OfficeWeb/test/update-rules.test.mjs`（版本比较、文案、约定字段）、`test/browser/update-prompt.cjs`（右下角、进度条宽度、按钮、老客户端文案）；真机网络自检 `Build/update-flow-check.cjs`（用真 Electron `net.fetch` 从正式站把已发布安装器下完并核对哈希，不运行安装器）。

## 页面自空转事故：CPU/内存爆表、头像都不出来（2026-09-20 用户报障后修订）

- 报障（用户）：「现在呢遇见一个严重的bug 内存和cpu占比巨大 且头像没有出现」。实测正式客户端（0.1.21）：
  - 一个渲染进程 **102% 一个核**、内存 445MB 且每 10 秒涨 11MB；用 CDP 量到**办公室页面**主线程 `ScriptDuration` 5.39s / 6s（脚本占满，布局/样式 0），头像条与采集页完全空闲。
  - 任务栏上的头像条窗口只有 120px 宽、**什么都没画**（三维场景里也看不到人）。
- **根因：React 无限重渲染回路**。`ChatInbox` 的 effect 依赖里放了 `props.onUnread`，而这个回调是 `App`/`SidePanel` 每次渲染新建的箭头函数；effect 里又 `setUnreadByPerson(byPerson)`（`byPerson` 每次都是新对象）→ App 重渲染 → 新箭头 → effect 再跑 → 无限循环。主线程被占满，**渲染、IPC、头像条推送全被饿死**，所以"CPU/内存爆表 + 头像不出来"是同一个病。
- **修法**（纯前端，刷新页面即生效，**不用重装客户端**）：
  1. `ChatInbox`：回调放 `useRef`，effect 依赖只留 `[unread, unreadKey]`——**父组件传下来的函数绝不能进依赖**；
  2. `App`：`handleUnread` 用 `useCallback` 固定引用，并用 `mergeUnreadCounts(previous, next)` **内容没变就返回原对象**（React 才会跳过渲染）；
  3. `SidePanel`：`setUnread(previous => previous === count ? previous : count)`；
  4. 新模块 `src/unreadCounts.ts`（`sameUnreadCounts` / `mergeUnreadCounts`，纯函数；`test/unread-counts.test.mjs` 3 项：比较、原地返回、以及"这三处写法不许退化"的源码断言）。
- **回归测试**：`test/browser/no-spin.cjs`——真实浏览器 + 真实服务器 + 两个账号，**先把三维画面暂停**（设置里有这一项），再量页面主线程 5 秒里忙了多少、JS 堆涨了多少。空转时是 `5.00s/5s`，正常 `≈0.09s/5s`；**修复前必失败**（实测 5.00s/5s），修复后连续三次稳定通过。堆只看大概（正常也有 GC 锯齿），**主线程不忙**才是"没有回流"的证据。**从 `OfficeWeb/` 之外跑**（它按 `OfficeWeb/server.mjs` 解析路径，必须在仓库根跑），并且**设置面板改成左栏分页之后要先进「画面与操作」那一页**、关面板点右上角 `aria-label="关闭设置"` 的 ×——2026-10-08 两条旧选择器（默认页上的 checkbox、"关闭"文字按钮）让这条用例静默红了两周，现在已修。
- 真机核验（正式客户端 + `--remote-debugging-port`，用 `Build/client-cpu.mjs` 量）：修前 office 页 5.39s/6s、进程 445MB/260 CPU 秒 → 修后 **0.30s/6s、249MB/6.4 CPU 秒**，JS 堆不再增长；头像条也回来了（截图 `Build/dock-fixed.png`：我自己的头像，离托盘 8px）。
- 排查工具（都留在 `Build/`）：`client-cpu.mjs`（按页面量主线程/脚本/布局耗时与 JS 堆）、`client-doctor.mjs`（问每个页面 DOM/状态/报错）、`client-eval.mjs`（在某个页面里求值）、`screen-zoom.cjs`（放大屏幕某块）。要点：**量每个页面必须用各自的 CDP 连接**（第一次我用两条连接取差值，读数全是 0，差点误判成"都没在忙"）。

## 「有人来看我了」：屏幕四周的绿光（2026-09-18 用户要求）

- 需求（用户）：「当有人鼠标悬浮在自己头像上时，自己的所有屏幕的边缘都发绿光，面积很大，就是简单叠一个覆盖层的显示即可……相当于说有人来看我了，提示我一下」。
- **信号从哪来**：小窗悬停头像时本来就会每 800ms 向主窗口索要那一个人的最近一帧（`office:dock-preview-want`）。这条心跳同时就是"我正在看他"——`useDockBridge` 里顺手调 `onPreviewWant(personId)` → `App` 交给 `useOffice.notifyWatching` → socket 发 `preview-watch { target }`；服务端 `preview-relay.watch()` 校验（目标必须在场、有工位、不是访客、不是自己）后转给**被看的那个人**：`watched { from, name }`。同一个"看的人→被看的人"700ms 内只转一次。
- **绿光层**（`OfficeDesktop/preview-glow.cjs` + `preview-glow.html/css/js/preload`）：**每块屏幕一个**透明、整窗穿透（`setIgnoreMouseEvents(true)`，不需要 forward）、永远置顶（`screen-saver`）、不抢焦点、不进任务栏的窗口。2026-09-30用户改为轻薄淡绿色柔光：只有16px/30px模糊内阴影，保留清晰绿色（0.1.36过淡，0.1.37提升亮度），禁止实边及大范围绿雾，中央透明。`flash()` 重置计时器，**最后一次信号之后3.6秒开始淡出**；一直有人看就一直亮着，不叠加窗口。屏幕插拔/分辨率/缩放变化重新贴合。此条取代早期“大面积”要求；客户端0.1.37生效，网页刷新无法替换本地CSS。
- **共享屏幕时不闪**：那一圈光会被一起共享出去，看的人只会觉得画面脏了。页面报 `sharing`（和头像条同一条路），主进程收到就直接 `hide()`。
- **两个踩过的坑**（都有测试/断言守着）：
  - 窗口是**第一次闪的时候才建**的，页面还在加载时 `webContents.send` 会**丢掉**（监听还没挂上）——用户看到的是一块什么都没画的透明窗口。现在 `notify()` 会等 `did-finish-load`，并且加载完如果还亮着会补一次。
  - `main.cjs` 是按名字显式 `require('electron')` 的，用 `screen` 之前**必须把它加进那行解构**，否则启动就 `ReferenceError: screen is not defined`（整窗不开，只剩托盘）。
- **验证**：桌面 `test/preview-glow.test.cjs`（每块屏一层、参数、闪一下→自动收、连闪不叠层、插拔屏幕、立刻收掉）；网页 `test/preview-relay.test.mjs`（看自己/访客/没工位的不转、限速、断线清理）+ `test/preview-snapshot.test.mjs`（真服务端上被看的人收到 `watched`、看的人自己收不到）+ `test/desktop-preview.test.mjs`（源码级断言这条链路）。真机：`Build/glow-flash-loop.mjs` 连续闪 + `Build/screen-crop-all.cjs` 抓每一块屏 + `Build/glow-analyze.cjs` **量四周一圈的 green excess**（这台机器壁纸本来就是绿的，靠眼睛看不出来；实测 14.5 → 48，`glow-diff.png` 是放大 6 倍的差异图）。`Build/glow-probe.mjs` 可以直接问两个光晕页面"你亮了没有/在哪块屏"。
- 边界：**只有小窗（头像条）的悬停会触发**（右侧详情卡、网页版都没有）；老客户端没有 `previewGlow` 桥，收到 `watched` 也只是空转（`?.`）。
- **自己怎么试**：真触发要"别人在他的小窗里悬停你的头像"，一个人测不了，所以托盘菜单里有一条 **「测试：屏幕绿光（有人来看我时也会亮）」**（`tray.cjs` 的 `options.glow`），点一下就闪，和真触发走同一个 `previewGlow.flash()`。
- **同一时刻人还得"跳出来"打个招呼**（用户 2026-09-18 追加：「除了绿色，还要把那个看我的人从状态栏头像中跳出来，站在状态栏上很大，做一个动作，动作就用下载的动作库里面找一个」）：
  - 那个人（**看我的那个人**，不是我自己）在头像条上的头像先蹦一下（`.dock-avatar.greeting` 的 `dock-jump`：抬高 26px、放大到 1.9 倍再落回 1.25 倍）；
  - 同时头像条上方开一个 **320×380 的小舞台**（`.dock-stage`，下边缘贴着头像条上边缘 = 角色**站在任务栏上**），用 three.js 把**他那套角色模型**渲染出来演一段动作库里的小动作——`GREET_CLIP = '招手_Wave'`（**2026-09-28 换成尺子角色后改了名字**，原来是 Quaternius 的 `Wave`；`test/dock-rules.test.mjs` 会去 GLB 里确认这条真的存在）；
  - 最后一个人来看我之后 **3.6 秒**（`GREET_MS`）自动收起；一直有人看就一直演（心跳只刷新时间戳，不会把动画打断重播，见 `greetAlive`）。
  - **three.js 是按需加载的**：`dock.tsx` 里 `import('./dockStage')`，所以小窗那一页还是 6KB（构建产物里 three 落在共享分块 `characterModel-*.js`，只有真有人来看时才拉），`test/dock-rules.test.mjs` 断言小窗的静态 import 里不许出现 three。角色 GLB 走浏览器缓存（办公室里已经加载过一次）。
  - 舞台亮着时窗口跟着长高（`dock-window.cjs` 的 `applyLayout({ stage })` → `taskbar-position.cjs` 的 `STAGE_SPACE = 390`、`STAGE_WIDTH = 320`），头像条的屏幕位置一点不动。
  - 模型**不要转身**：尺子角色导出时就面朝 +Z（相机方向），转 π 会变成"背对着你"（实测踩过）。
  - 验证：桌面 `test/taskbar-position.test.cjs` / `dock-window.test.cjs` / `dock-bridge.test.cjs`（舞台高度与宽度、频道、可信来源门）；浏览器 `test/browser/dock.cjs` 里真跑一遍 3D（断言舞台出现、画布 320×380、头像带 `data-greeting`、`layout.stage === true`、**真的去下载了那个人的 GLB**、舞台截图非空、3.6 秒后自动收起），截图 `Build/dock-greet.png`；真机 dev 截图 `Build/screen-dock-greet.png`（李文杰的角色站在任务栏上招手）。
- **2026-09-20 修订：停 2 秒才算"有人来看我"，亮起来也要 2 秒**（用户：「鼠标停留在别人头像2秒后才开始亮起绿色，且亮起的时间会很慢 大概用2秒才渐渐亮起」）：
  - **停够 2 秒才报**：小窗每 800ms 索要一次画面，这条心跳同时就是"我在看他"；但划过一排头像不该惊动别人，所以由 `useDockBridge` 自己计时（`dockRules.dwellWatch`：`WATCH_DWELL_MS = 2000`，中间断过 `WATCH_DWELL_GAP_MS = 1500` 或换了人就重新数），停够了才 `onPreviewWant`，并用 `waitMs` 起一个定时器**刚好在第 2 秒**报，不等下一次心跳。
  - **慢慢亮**：`PEEK_GLOW_FADE_MS = 2000`，绿光页面用 CSS 过渡从 0 淡到 1，`ease-in-out`（默认的 `ease-out` 前 1/3 就冲到一半，2 秒的过渡在 0.6 秒就半亮，看着还是"一下亮"）。打电话过来是**立刻亮**（`CALL_GLOW_FADE_MS = 150`），那是急事。
  - **两种场合**（`GreetMode`）：`peek`＝鼠标只是停一下——画布 **160×190**、人物小一倍、**不演动作**（用户：「只是鼠标放上的话人物出现会小一倍，不用打招呼」）；`call`＝有人打电话过来——**320×380**、演招手。`dock.tsx` 把 `stageMode` 报给主进程，`taskbar-position.cjs` 的 `PEEK_SPACE = 200` / `PEEK_WIDTH = 168` 决定窗口留多大地方——那片透明区**是会吃鼠标的**，所以 peek 只留一半。
  - **三种方式打电话过来也绿 + 用当前角色大小打招呼**（用户：「当用三个方式打电话过来需要屏幕里面绿起来，且用当前角色大小打招呼」）：三种方式＝头像条卡片上的三个按钮（看我的屏幕 / 把他的屏幕给我 / 语音），到服务端都是同一条 `request`。`src/callAttention.ts`（纯函数 `callAttention(requests, people)` → `{ id, name, character, mode: 'call' }`）+ `src/useCallAttention.ts`（只看"还有没有没处理的邀请"：有就立刻亮、让头像条把那个人拉出来招手，每 3 秒补一次；接听/婉拒/超时后 `requests` 空了自然停）。浏览器里没有绿光层，直接不挂。
- **两个坑（都有断言守着）**：
  - **`desktop-preload.cjs` 的白名单清洗**（和 `dock-bridge.cjs` 一个毛病）：它把 `previewGlow` 的载荷重建成 `{ sharing, on }`、把 `dockGreet` 重建成 `{ id, name, character }`——新加的 `fade`、`mode` 就在这儿**静默丢掉**，现象是"永远立刻亮、永远是小人儿不招手"（2026-09-20 实测踩到）。`test/desktop-preview.test.mjs` 现在盯着这两个字段。
  - **"这次要不要从全透明重新亮起"必须由主进程判断**（`preview-glow.cjs` 的 `payload.restart`）：窗口一藏起来，页面里的过渡和计时器就被冻住，淡出那一步可能根本没跑，页面自己记的"我还亮着"是错的——于是第二次悬停时它不再淡入，看起来还是"啪一下亮"。主进程按 `!layer.isVisible()` 给 `restart`，页面据此先**同步**强制一帧（`void glow.offsetWidth`）再改成不透明。**别用 requestAnimationFrame**：这个不可聚焦的小窗有时拿不到帧，rAF 可能一直不回调（实测 opacity 一直 0）。
- **所有角色都要适配招手**（用户：「注意检查所有角色都要适配打招呼的动作」）。**2026-09-28 换了尺子角色之后**：角色只有一个（`assets/characters/ruler.glb`），但**配色有 10 套**，所以这条改成"每套配色都要能演招手"——`test/dock-rules.test.mjs` 逐个核对 GLB 里的动作与 `look.ts` 登记的每个配件网格名，`test/browser/greet-characters.cjs` 再**真的**把 10 套配色一套套挂上舞台演一遍，量手腕的累计位移（待机约 0.02，招手 0.98～1.08，断言 > 0.15）。舞台的探针 `canvas.__dockStage = { mode, clip, frames, motion }` 仍按名字找 `wrist/hand` 骨骼，**不能写死 `Wrist.R`**：glTF 名字里的点号被 GLTFLoader 去掉了，实际叫 `WristR`（冒号同理会被去掉，`mixamorig:Hips` → `mixamorigHips`）。
- 量"亮起来有多慢"用 `Build/glow-fade-check.mjs [port] [fade] [--cold]`：连上绿光页面每 150ms 读一次 `#glow` 的实际透明度（CSS 过渡中的 opacity 就是当前插值）。正式客户端实测：0.3s → 0.05、1s → 0.57、**半亮在 1.1 秒**、2 秒到 1.00，之后保持 3.6 秒 + 0.5 秒淡出；冷启动（第一次悬停）与第二次悬停都一样。**别只看页面读数就下结论**：`Build/glow-page-state.mjs` 能打页面自述与 `__glowLog`，`Build/glow-fade-shots.cjs` 是量真实像素那一版（实测那天 DXGI 被别的采集占住，抓不到画面，最后靠三次重复的页面读数定案）。

## 任务栏头像条（dock，2026-09-17 用户要求）

- 需求（用户）：「贴 Windows 任务栏、永远置顶、无边框，锁定在任务栏的图标右侧…紧贴右侧托盘左边」+ 头像悬停看缩略图 + 卡片上三个按钮直接通话。设计与文件分工见 `../Design/Taskbar_Dock_20260917.md`。
- **铁律：小窗只做「显示 + 遥控」**。主窗口是唯一 socket 与媒体拥有者；服务器 `join` 会把同一 `clientId` 的旧 socket 踢掉（`server.mjs` 270-276 行），所以**小窗绝不能自己连 socket 或碰媒体**，否则会把主窗口顶下线、成员列表出现两个"我"。`test/dock-rules.test.mjs` 里有断言守着（`dock.tsx` 里不许出现 socket.io/useOffice/getDisplayMedia 等）。
- **窗口**：`dock-window.cjs`（无边框/透明/`alwaysOnTop('screen-saver')`/`skipTaskbar`/`focusable:false`/与主窗口同会话）+ `taskbar-position.cjs`（纯几何）。`dock.html` + `src/dock.tsx` 是独立入口，**不加载 three.js**（约 3KB）；主窗口用 `useDockBridge` 每秒推状态、悬停时把最近一帧交过去（**不需要新协议**）。
- **放置规则**：默认贴在**任务栏托盘左边 8px**——托盘宽度**真的去量**（`tray-area.cjs`：Win32 的 `Shell_TrayWnd` → `TrayNotifyWnd` 矩形），量不到才退回 220 的估算值；量到之后**还会夹住**：就算用户把条子往右拖、或者估算值偏小，条子右边缘也不许越过托盘左边缘。
  - **DPI 是这条路上的大坑**（2026-09-18 用户报「那台设备的头像现在又跑到了正中心」）：PowerShell 子进程默认**不是 DPI 感知**的，Windows 会把 `GetWindowRect` 的坐标**虚拟化**（已经除以缩放比例），我们再除一次 `scaleFactor` 就偏小一大截——那台 150% 缩放的机器上条子因此跑到屏幕中间。现在两头都堵住：脚本先 `SetProcessDPIAware()`（坐标保证是物理像素），换算时再**用任务栏高度自校准**（量到的高度 ÷ Electron 给的 DIP 厚度 = 这套坐标系里"1 DIP 等于几个单位"，接近 1 就说明拿到的是已缩放坐标，不能再除）。
  - **Windows 11 放屏幕最左侧，Windows 10 保持现状**（用户 2026-09-18：「当时Windows11系统的话 就把头像简单放在屏幕最左侧，Windows10保持当下状态」）：`taskbar-position.cjs` 的 `dockAnchor(os.release())` —— build ≥ **22000** 判为 Win11 → `anchor: 'left'`，条子放**屏幕/任务栏最左端**（`LEFT_GAP = 8`，不再受托盘夹紧影响）；否则 `'tray'`，就是上面这套"贴托盘左边 + 量托盘 + 夹住"。`dock-window.cjs` 启动时定一次（`dependencies.anchor` 可注入，测试用）。**本机是 Win10 19045，现场行为不变**（实测 `dockAnchor('10.0.19045') === 'tray'`）。
  - **卡片/舞台画在哪一侧要挑"有地方的那边"，并且条子一个像素都不许动**（用户 2026-09-20：「鼠标放在上面出现大窗口时头像会自适应位移，需要锁定」+「小窗口出现的方向多变一下」）：`dockBounds` 按两侧的空档挑 `popup`——左边放得下就先左边（老样子），放不下才翻到右边（Win11 条子在屏幕最左端，左边只有 8px，必然往右画）。**参考宽度固定用 `CARD_WIDTH`**，不能用当前状态的 `minWidth`，否则状态一变条子会左右横跳。往右画时窗口**左边缘**对齐条子左边缘，页面用 `.dock.popup-right` 把条子钉在窗口**左**边、卡片/舞台改成左对齐；往左画时是老样子（窗口右边缘对齐条子右边缘、条子钉右边）。主进程通过 `office:dock-state` 的 `popup` 字段告诉小窗（`dock-bridge.cjs` 的白名单清洗里也要带上它，漏了就是老行为）。**不这么做的话**：窗口往左摆、左边缘被屏幕夹住 → 窗口右边缘不再和条子对齐 → 页面里靠右对齐的条子被顶走，用户看到的就是"出现大窗口时头像会自适应位移"（按 156 的条子实测位移 175px）。
  - **所有头像套一圈灵动岛那种"纯半圆收口"的框，颜色跟着任务栏适配**（用户 2026-09-20：「把所有的头像整体框起来，像是同一个系统内感觉，有个大的圆角框，另外要根据当前状态栏的颜色去适配」，随后追加「大框两侧用纯半圆像是灵动岛那种」）：`.dock-frame` 高度 `calc(var(--dock-h) - 4px)`、**`border-radius: 999px`**（会被浏览器夹成高度的一半 = 两端正好两个半圆），把头像和"暂无人在线"那句话都圈进去；**`.dock` 自己仍然完全透明**（2026-09-18 定的"别有黑底"），框**不能加 `overflow: hidden`**——头像右上角的未读"!"和共享标记是往外凸的，会被切掉。两侧留白必须够宽，否则最边上头像的方角会戳出半圆、把边框线切断：要求 `留白 ≥ 半径 − √(框高 − 3)`（算下来约框高的 0.26～0.35 倍，任务栏越厚越大），所以就是 `padding: 0 calc(var(--dock-h) * .4)`——**别改回固定 px**，厚任务栏上会露馅（测试里按 28/40/48/64 四种厚度验过）。颜色由 `frameColors(state.theme)` 算成三个 CSS 变量：深色任务栏 → 白色浮层（`rgba(255,255,255,.1)` + 白边 `.2`）、浅色 → 黑色浮层（`rgba(0,0,0,.06)` + 黑边 `.16`）、任务栏被强调色着色时边框用强调色（里面再垫 7% 同色）；关掉透明效果时浮层加 4% 浓度。框会占一点宽度（条子从 157 变 169），页面量出来报给主进程，窗口跟着长。
  - **任务栏的颜色在主进程读注册表**（`OfficeDesktop/taskbar-theme.cjs`）：`SystemUsesLightTheme`（**不是 `AppsUseLightTheme`**——那是应用窗口的主题，本机实测就是"应用浅色、任务栏深色"）、`EnableTransparency`、`ColorPrevalence`、`AccentColor`（`0xAABBGGRR`，低字节是红）。**`reg query` 只认一个 `/v`**：`reg query KEY /v A /v B` 直接报 "Invalid syntax"（实测踩到，整条路静默退回兜底），所以整把键读回来自己挑。结果缓存 30 秒，读不到就退回 Electron 的 `nativeTheme` 明暗（没有强调色），**任何时候都不抛**。`dock-bridge.cjs` 每 20 秒重读一次、**变了就立刻重发一次完整状态**（不然要等主窗口下次推状态才换色），`theme` 同样要过白名单清洗（四个字段、强调色必须 `#rrggbb` 且小写）。验证：`test/taskbar-theme.test.cjs`（解析、ABGR、缓存、兜底）、`test/dock-bridge.test.cjs`（转发与重发）、网页 `dock-rules.test.mjs`（frameColors）、浏览器 `dock.cjs`（框包住所有头像、深/浅/强调色三种配色、换回来就没这个类），放大截图 `Build/dock-frame-zoom-*.png`。
  - **启动/自启不出现头像、头像忽闪、关机不要被拖住**（用户 2026-09-20：「有时候启动不出现头像，有时候开机自启不出现头像，有时候头像会消失闪烁，问题二不要阻止关机如果可以的话」）：
    - **启动先藏着**：`dock-bridge.cjs` 的初始状态是 `hidden: true`，装桥时就 `dock.setVisible(false, 'starting')`。以前初始是"显示"，主窗口还没推过任何东西的那一两秒会先亮一条空条子（用户看到的就是"没有头像"）。
    - **页面加载失败会重试**：`dock-window.cjs` 的 `did-fail-load`（`-3` 是我们自己中断的，不算）→ 按 2s/5s/10s/30s 退避重载；`render-process-gone`（渲染进程崩了）→ 立刻重载。开机自启时网络常常还没起来，老代码那一次 `loadURL` 失败就是永久透明窗口。`dependencies.loadRetryMs` 可注入（测试调快用）。
    - **不许忽闪**：`place()` 里"任务栏不在了"要**连续三次**（`HIDE_AFTER_MISSES`，每次 1.5 秒）才真藏——息屏、切分辨率、全屏应用、量托盘的 PowerShell 抖一下都会让某一次读数是"没有任务栏"，一次就藏条子就会忽闪忽现；认定真藏之后最多多留三四秒（条子在托盘那侧，底边别处照样能碰出任务栏）。
    - **短暂掉线不抹名单**：主窗口把 `connected` 一起推给小窗，`dockRules.mergeState()` 在 `connected === false` 且这一份名单为空时沿用上一份（`hidden: true` 时照旧清空）——休眠/切网/服务器重启时 `disconnect` 会先 `setPeople([])`，几秒后连上再推回来，不保留就是"整排消失再冒出来"。
    - **关机/注销不拖时间**：`main.cjs` 处理 `app.on('session-end')`（Windows 真的结束会话时）→ 收掉头像条、光晕窗口、常驻采集流（它会替我们申请"屏幕常亮"）然后 `app.exit(0)`；`before-quit` 里也停采集。托盘那条"关窗口 = 收进托盘"的 `preventDefault` 早就有 `quitting` 放行（`query-session-end`/`session-end`/`before-quit` 三处），`test/shutdown.test.cjs` 用源码级断言盯着这几处，改掉就红。
  - **有人打电话过来时，在人物头顶写清"谁来电"+ 直接接听**（用户 2026-09-21：「通话请求时，需要在人物上加上是谁来电，再加一个接听的按钮」，随后纠正：「我是说打招呼的人站在状态栏上的人物头顶」）：小窗那个跳出来的角色照旧站在头像条上（下边缘贴条子上边缘），**来电气泡挂在他头顶**（`.dock-call-wrap` 那一格 + `.dock-call`，灵动岛那种胶囊）：`callLabel()` 出文案（`同事乙 来电 · 语音通话` / `· 想看你的屏幕` / `· 要给你看屏幕`，纯规则；老客户端没带 `kind` 就只说 `同事乙 来电`），右边「拒绝」（红）+「接听」（绿）。
    - **位置怎么算**（别再挪到下面去）：`.dock-call-wrap` 与角色画布是**同一格**——同样宽（`--dock-stage-w` = `GREET_CANVAS[mode].width`）、底边同样在 `calc(var(--dock-h) + var(--dock-stage-h, 380px))`，也就是**画布上边缘之上**；气泡在里面 `justify-content: center`，而角色站在画布正中，所以气泡正对着他的头（实测气泡中心与画布中心偏差 0px）。外层 `pointer-events: none`、气泡自己 `pointer-events: auto`，透明区不吃鼠标；气泡高 52 且 `box-sizing: border-box`，`white-space: nowrap` + 文字 `flex: 1 1 auto; min-width: 0`（名字长了要省略号，不然"接听"会被顶出窗口右边）。`popup-right` 时外层一起钉左边。**旧的 `.dock-stage.over-call`（角色站气泡上面那一版）已经删掉**，`test/dock-rules.test.mjs` 里有断言禁止它回来。
    - **舞台多高由页面报**（`layout({ stagePx })`）：气泡让舞台从 380 变成 452（380 画布 + 62 气泡 + 10 余量），写死在主进程里就会被窗口裁掉；`dockBounds` 夹在 120～700（报得离谱地小就当没报，退回 `STAGE_SPACE`），`dock-window.applyLayout` 记下来，`desktop-dock-preload` 与 `dock-bridge` 各清洗一遍。舞台那会儿窗口宽度至少 `STAGE_WIDTH = 320`，所以 320 宽的气泡不会被屏幕/窗口边界裁掉。
    - **接听走 `office:dock-answer`**（小窗 → 主进程 → 主窗口 → `office.respond(requestId, accept)`），跟通话面板那两个按钮同一条路，小窗自己不碰 socket/媒体。**老客户端没有 `answer` 桥就不渲染按钮**（`typeof window.officeDock?.answer === 'function'`），只显示"谁来电"那行字。
    - 邀请本身（`requestId`/`kind`/`offer`）由 `callAttention()` 带出来 → `useCallAttention` → `dockGreet`；`dock-bridge.cjs` 里同样过一遍白名单（`kind` 只认 screen/voice、`requestId` 截 64 字符）。验证：桌面 `test/dock-bridge.test.cjs`（转发、来源校验、脏种类、`stagePx` 夹取）、`dock-window.test.cjs`（`stagePx` 三档）、网页 `dock-rules.test.mjs`（`callLabel` 四种）、浏览器 `dock.cjs`（气泡、角色站位、`stagePx=452`、点接听/拒绝记到 `__answers`），截图 `Build/dock-call.png`。
    - **这条链上有三处会静默丢字段，加字段时三处都要改**（2026-09-21 真机报障"看到名字了、但头顶没有接听/挂断按钮"就是漏了第一处）：
      1. `OfficeDesktop/desktop-preload.cjs` 的 `dockGreet` **白名单清洗**（主窗口页 → 主进程）：它把载荷重建成一个新对象，只留 `id/name/character/mode`，新加的 `requestId/kind/offer` 就被**静默丢掉** → 气泡有名字、**没有按钮**。现在四个字段都带上，`test/desktop-preview.test.mjs` 逐条盯着。
      2. `OfficeDesktop/dock-bridge.cjs` 的 `office:dock-greet` 处理（主进程 → 小窗）：`test/dock-bridge.test.cjs` 盯着。
      3. **反方向**：主窗口页要收得到小窗的接听 —— `desktop-preload.cjs` 必须有 `onDockAnswer`（订阅 `office:dock-answer`），`useDockBridge` 才会 `bridge.onDockAnswer?.(…)`。**这条桥以前根本不存在**，所以就算按钮画出来了，点下去也没反应。漏 `onDockAnswer` 也是静默的（可选链 `?.` 直接跳过）。
    - **真 Electron 上把这条链整跑一遍**：`& '.\node_modules\electron\dist\electron.exe' test/dock-call-chain.cjs`（两个窗口 + 真 preload + 真 dock-bridge，用协议桩喂夹具页，不碰网络）。它断言：小窗收到 **`{id,mode:'call',requestId,kind,offer}`** 一个不少、脏数据仍被清洗、**小窗点接听 → 主窗口收到 `{requestId, accept}`**。证据写在 `Build/dock-call-chain.json`。**改了任一白名单就跑它**——源码字符串断言只能证明"代码里写着"，这个脚本证明"真的传到了"。
  - **改文件别走 PowerShell**（2026-09-21 血的教训）：我用 `(Get-Content -Raw)` + `Set-Content` 改 `dock-window.test.cjs`，宿主是 Windows PowerShell 5.1，它按 **GBK** 读 UTF-8、再写回 UTF-8 → 中文和换行整片烂掉，只能从 git 恢复后重写整个文件。**编辑一律用 read/edit/write 工具；PowerShell 只用来跑命令，不要用它重写文本文件。**
  - 实测这台机器托盘 256~280px（会随图标多少变，所以每 20 秒重量一次），条子右边缘 = 托盘左边 - 8px。
  - 头像条在任务栏里竖直居中；**没人悬停时窗口就是头像条本身**（宽高都等于条子，一个像素都不多占任务栏），悬停卡片打开时才向上长高一个卡片空间、并宽到至少放得下卡片（`taskbar-position.cjs` 的 `expanded`）。两种状态下窗口**右边缘、下边缘都与头像条对齐**，所以卡片不会被裁、条子也不会跳。任务栏在哪条边、多厚、自动隐藏都由 `bounds`/`workArea` 之差推断，每 1.5 秒复查。
- **必须跟着藏**：任务栏自动隐藏时藏（否则鼠标碰不到底边、任务栏再也弹不出来）、自己共享屏幕时藏（免得被一起共享出去）、窗口进全屏时藏；托盘菜单「显示任务栏头像条」可手动关。
  - **但"藏"必须是三个独立理由，谁都不能卡住别的**（2026-09-22 用户报「头像这个 ui 有时候会消失找不到」后改）：`dock-window.cjs` 的 `place()` 现在算的是 `taskbarGone / pageVisible / system / manual` 四路，**任一路说藏就藏、互不覆盖**。以前"页面要求"和"整屏要求"写的是**同一个 `visible` 标志**（最后写的赢），而整屏那一路靠 `enter-full-screen` / `leave-full-screen` 两个事件——事件漏一次（窗口先收进托盘再退全屏、Electron 没发 leave……）条子就**再也不回来**，只能重启客户端。现在整屏改成**现算**：`main.cjs` 传 `systemHidden: () => mainWindow.isFullScreen() === true`，`place()`（每 1.5 秒一次）自己问一遍，事件漏不漏都不影响；`enter/leave-full-screen` 两个监听只负责"立刻贴一次"，不再写状态。
  - **窗口被异常销毁要能自愈**：`window.on('closed')` 会把 `window` 清空，而以前只有启动时调过一次 `ensure()`——窗口一旦被系统/驱动收掉，条子从此永久消失。现在 `follow` 那个 1.5 秒的 tick 里 `if (!window || window.isDestroyed()) { ensure(); return; }` 自己建回来；主动 `destroy()`（退出/关机）会先置 `destroyed = true`，不会再冒出来。
  - **"为什么藏"要留证据**：每次结论变化都往 `store.decide` 写一行（`main.cjs` 落到 `%APPDATA%\iruler dream\dock-why.json`：`{at, why, pageVisible, manual, hiddenStreak, strip, screen}`，`why` 是 `shown`/`taskbar`/`page`/`system`/`manual`），只在变化时写、不刷盘。下次再有人说"头像不见了"，先看这个文件，别靠猜。`dock-window.test.cjs` 有断言盯着（三个理由互不覆盖、整屏结束自己回来、报告的理由序列、窗口销毁后重建、主动 destroy 后不再重建）。
  - 页面那侧顺手修了个小的：`useDockBridge` 在"不可用"分支里推完 `{people: [], hidden: true}` 后把 `lastSent` 清掉——不然重新可用时那份状态和上次一模一样，会被当成"没变"跳过，小窗就一直停在"藏起来"那一份（`test/desktop-preview.test.mjs` 有断言）。**没有加"定期重推状态"那种 keep-alive**：老客户端没有上面那个"整屏现算"，重推会让条子在整屏应用上冒出来（宁可不做，也不引入新问题）。
  - **被顶下线/退出/被请出时要把条子交还回去**（用户 2026-10-08 报障：「被挤掉线之后为啥头像都还在 所有人的都在 这不合理吧」）：`useDockBridge` 的 `enabled` 入参**只表示"这台机器有没有 `dockState` 这道桥"**（`App.tsx` 里就是 `Boolean(window.officeDesktop?.dockState)`），而**被别的设备顶下线、Cookie 会话失效、被管理员请出、主动退出**走的都是 **App 卸载回登录页**，它压根不会变 false —— 所以以前收尾只 `clearInterval(timer)` 的话，小窗就**永远停在最后那一份名单**上：登录页都出来了，任务栏上还挂着一排同事（连已经掉线的我自己）。现在把清空抽成 `release()`＝清 `lastSent` + 推 `{people: [], sharing: false, missed: 0, hidden: true}`，**"不可用"那条路和卸载收尾共用它**（清 `lastSent` 是为了再登进来能重新推：那份状态和上次一模一样会被"没变"跳过）。回归：`node test/browser/dock-session-end.mjs`（真服务器 + 真账号：A 进办公室 → B 用同账号登录把 A 顶掉 → 登录页出来时小窗最后一份必须是空名单 + hidden，再登回来还要重新亮起来。**修复前必失败**，实测最后一份还是 `{"people":[…],"hidden":false}`）+ `node --test test/dock-session-end.test.mjs`（源码断言，别改回"只清定时器"）。**纯前端修复，刷新页面即生效、不用发新客户端**。
- **鼠标：不用点击穿透，改成"窗口跟着状态收放"**（2026-09-18 用户报障「我鼠标放上去弹出的窗口我无法点击 快速消失了」）。原设计是窗口一直 `setIgnoreMouseEvents(true, { forward: true })` 穿透、页面靠收到的 mousemove 判断指针在不在条子上再接管点击。**实测这套在这台机器上完全不工作**：ignore+forward 状态下页面**一条 mousemove 都收不到**（`Build/dock-hover-watch.mjs` 探针；关掉穿透后同一条鼠标轨迹立刻收到几十条），于是页面永远判不出"指针上来了"——悬停卡片不出来、出来了也点不动。这类透明窗上的 forward 本来就不稳（electron#40213），所以现在：窗口**始终接收鼠标事件**，页面用 `officeDock.layout({ expanded, width })` 报两件事——卡片开没开、条子实际多宽；主进程据此把窗口收成"就是头像条"或长高一个卡片空间（`dock-window.cjs` 的 `applyLayout`）。宽度**以页面量出来的为准**（`widthFor(count)` 只是页面报之前的估算值），这样窗口和条子永远一样宽，不会盖住任务栏上别人的图标。`setIgnoreMouseEvents` / `dockRules.dockInteractive` 都已删除，`test/dock-rules.test.mjs` 有断言禁止它们回来。
  - **头像上不挂 `title`**：系统的悬停提示会盖在头像条上，而卡片里已经写清名字、未读和离座时长（用户 2026-09-18 看过截图后定的）。
  - **验证"点得到"时绝不能真的去点那三个按钮**：它们是真的邀请（`office.request`），点下去对方的电脑真的会弹来电（用户 2026-09-18 直接警告「不要乱打电话」）。要验就用浏览器 `test/browser/dock.cjs` 的 harness，或者**在捕获阶段拦下 click**。注意 `contextBridge.exposeInMainWorld` 暴露出来的对象是 `Object.freeze` 的，**`window.officeDock.action = …` 这种替换会被静默忽略**——2026-09-18 就是"以为拦住了、其实真拨出去了一次"。真要动真格的，也只在 `dock-` 里对**不存在的人**调用。
- **显示谁**：在线的人 + 我自己（我在最左、带一圈白边），排序 未接来电 → 未读 → 正在共享 → 在座 → 名字，最多 16 个；**访客/浏览器登录/没工位的人永远没有缩略图**（规则如此），卡片显示「此人不广播屏幕预览」。三个按钮走的是和右侧详情卡同一条邀请通道（看对方屏幕 / `offer:true` 分享我的 / 语音），点完主进程把办公室窗口抬到前面。悬停卡片的名字后面跟离座时长（`useDockBridge` 用 `awayTime` 算好一句现成的字交过去，小窗不认时间）。
- **卡片上的状态要写成字、用暗绿/暗红**（用户 2026-09-18：「在座就显示暗绿色在座 离座显示暗红色离座，不要出现此人不在电脑前的文字 不在的话用最后一张 不要在办公室还关着屏幕」）：名字右边一个小标签，在座 `#2f6b3c`、离座 `#8f3a2c`（`.dock-card-state.here/.away`），离座时标签里直接写「离座 N 分钟」。
  - **顺序要"粘住"，不许在鼠标底下换位**（用户 2026-09-21：「状态栏的头像位置尽量不要频繁的切换顺序，不然本来鼠标看着一个人闪烁到另一个人了」）：名次（上面那串规则）本身没变，但**显示顺序和名次分开**——`dockRules.stickyOrder()` 是纯函数，两档防抖：① 指针停在条子/卡片上（`.dock` 的 `onMouseEnter/Leave` → `pointerOn`）时**一个都不许挪**，新人接在最后、走掉的人立刻消失；② 没停住也要名次**连续稳定 `ORDER_SETTLE_MS = 2000`** 才真的换序（`since` 记的是"名次第一次和显示对不上"的时刻，**不是**上次换序的时刻——否则下一个心跳就会立刻换，「稳住两秒」等于没做；没稳就返回 `waitMs`，页面到点再看一眼）。**为什么会闪**：离座/在座 10 秒就翻一次，共享开关、未读数也会改名次，主窗口一重排、小窗照着画，鼠标底下就换成别人了（`hovered` 是按 id 走的，DOM 一挪浏览器就会重发 mouseover → 卡片跟着换人）。`orderPeople()` 负责按粘住的顺序摆人头（顺序表里没有的人接最后，**不许丢人**）。
  - 页面画的是 `people`（粘住的顺序），**不是** `state.people`（刚推来的名次）——`test/dock-rules.test.mjs` 里有断言禁止画回原始顺序。回归：`test/dock-rules.test.mjs`（照排/冻结/新人接尾/走人立刻消失/差 100ms 不换/变回去重新计时/指针压着多久都不换）+ 浏览器 `dock.cjs`（指针在条子上时打乱名次顺序不变、移开 2.6 秒才换）+ 线上核验 `Build/live-dock-verify.cjs`（部署页实测 `before == frozen`，移开后 `["我","客户丙","同事乙"]`）。
  - **离座不再等于"没有预览"**：`previewPlaceholder()` 里那条「此人不在电脑前，预览已暂停」**删掉了**，不许再回来（`test/dock-rules.test.mjs` 与 `test/browser/dock.cjs` 都有断言）。离座的人照样显示他**最后一张**工位画面：小窗收到空帧时**不覆盖**已有的图（`dock.tsx` 的 `onPreview` 直接 return），主窗口那边也是**有画才发**（`useDockBridge` 的 `onDockPreviewWant` 遇到空帧不推），真的没有画面时只写「暂时没有画面（对方可能没在采集）」。
  - **悬停期间反复要帧**（`PREVIEW_POLL_MS = 800`）：只问一次的话，"悬停早了"（主窗口手里还没有这个人的画面）就永远是一片白。
- **服务端记住每个人的最后一张**（`preview-relay.mjs`，2026-09-18）：低清预览的中继从 `server.mjs` 里搬出来，顺便做三件事——校验限速（访客不广播 / 400ms 一帧 / 250KB 封顶）、转发（自己也算，自己桌上的显示器才有画面）、**按账号 `clientId` 缓存最后一帧**。于是：
  - 人走开（客户端暂停采集、什么都不发）之后，他那张画面继续留在服务端，别人（包括**刚启动的客户端**）都拿得到——`join` 之后服务端会补一份快照（`previewRelay.snapshot(s.id)`）。这就是用户要的「不在的话用最后一张 不要在办公室还关着屏幕」：以前新开的客户端要等每个人下一次采集（最长 12 秒，人不在电脑前就永远不采），整间办公室的屏幕都是黑的。
  - **只有客户端明说停止广播**（`ambient-sharing:false`：关掉预览、关窗、采集失败）才会发一帧 null 告诉别人"现在没有实时画面"——但**缓存留着**，`useOffice` 收到 null 也**不删手里那一张**（`test/desktop-preview.test.mjs` 有断言守着）。人真的离开空间时才清（`retainPresent` 只保留在场的人）。用户 2026-09-18 实测：显示器关掉会让采集失败 → 客户端发 `ambient-sharing:false` → 以前这一下就把画面抹了，看起来就是"办公室还关着屏幕"。
  - 同理，任何人走开或断线重连后，`previewSharing` 会回到 false（服务端的人是重连时重建的），要等他下一次出帧才会重新变 true——**这不代表他的客户端坏了**，别据此下结论（2026-09-18 就误判过一次：Elsa 其实是桌面客户端、在座时正常广播）。
  - 测试：`test/preview-relay.test.mjs`（中继规则本身）+ `test/preview-snapshot.test.mjs`（**真服务端**上验 join 快照、回显、访客兜底、限速）。
  - 边界：如果一个人**从来没广播过**（浏览器登录、访客、老客户端），服务端也没有他的画面，卡片只会写「暂时没有画面」——这不是坏了，是本来就没有。


- **`dock-bridge.cjs` 的白名单清洗是加字段的坑**（2026-09-18 发现）：它把小窗要的人头字段一个个列出来重建，`self` / `missed` / `away` 都曾经漏掉，表现为"自己的头像没有圈也不排最前、未接来电没有 `!`、卡片里没有离座时长"——而浏览器 harness 是直接吃 `buildDockState` 的产物，所以测试全绿、真机上却是坏的。给 `DockPerson` 加字段时**必须同时改这个白名单**，`test/dock-bridge.test.cjs` 现在盯着这三个字段。

- **外观：一层很淡的玻璃 + 白圆按钮**（2026-09-2X 用户给了参考图：「把状态栏上的头像部件改的灵动一些…头像背景和组件降低透明度，以及小窗口的圆角绘制，按钮的白色」）：
  - 条子（`.dock-frame`）和悬停卡片（`.dock-card`）**共用一套半透明材质**：底色用主进程按任务栏颜色算好的浮层值（深色任务栏白色浮层、浅色黑色浮层），外加 `backdrop-filter: blur(...) saturate(...)`、一圈细边、顶上一道 `::after` 高光；卡片另有**更大的圆角**（18px）。
    - **但两层的"透"不是一个量级**（用户 2026-09-2X：「弹出的小窗不要完全透明啊 是指状态栏头像设计要改的透明一些」）：**条子**要很透、边很细（白浮层 `.04`、悬停 `.06`、边框 `.14`），**悬停卡片必须够实**（深色 `rgba(20,21,24,.88)`、浅色 `rgba(250,250,250,.93)`）——里面要放工位截图和字，`.52` 那版透到看不清。两套值都在 `.dock` / `.dock[data-theme="light"]` 的 CSS 变量里。
    - **头像没有自己的小底色**（用户 2026-09-2X：「头像本身的小背景有点黑啊 直接去掉内部小背景」）：`frameColors().chip` 恒为 `transparent`，`.dock-avatar` 不再垫任何底（贴图本身就是透明底的，直接透出任务栏）。**注意连带影响**：那块深垫底原来在 `filter: brightness()` 之下也一起被压暗，去掉后整条平均亮度从 37.4 跳到 67.8，所以要把头像自身的 `brightness` 从 `.86` 补到 `.68`（`saturate 1.7 → 1.55`）。量法：`Build/dock-white-measure.cjs`、`dock-white-regions.cjs`、`dock-avatar-probe.cjs`（问页面要 computed filter/背景/贴图 URL）。
  - **卡片有一个指向头像的尖**（用户 2026-09-2X：「我希望小窗有一个气泡指向的尖尖那个东西指向头像」）：`.dock-card-tip` 是转 45° 的方块（对角线朝下 = 圆角小三角），`bottom: -11px` 探到**头像条上边缘**、和卡片连成一体；位置由纯函数 `cardTipOffset(cardLeft, cardWidth, avatarCenterX)` 算并**夹在卡片内**（否则被 18px 圆角切掉），页面悬停时量"头像中点 − 卡片左边界"；`.edge-top`（任务栏在上方）时转 225° 指向上面的头像。**不能挂 `border`**（转 45° 后边框变斜线），靠 `inset 0 0 0 1px rgba(255,255,255,.16)` 那道极淡边光才看得出形状；尖的底色比卡片再实一点（`--dock-card-tip-bg`），太小太透会糊成一团（实测截图验证过）。
  - 卡片上三个动作按钮改成**白色圆按钮**（36px、`border-radius: 50%`、白底 + 深色图标 + 轻阴影，悬停微抬）；缩略图 228×128，卡片实测 294×175，主进程给的 `CARD_SPACE = 210` 装得下。
  - "灵动"这几处全是**纯 CSS，不动任何通道**：头像悬停/被选中（`.open`）时抬起 1px 并套一圈柔和光环（颜色取任务栏强调色 `--dock-ring`，读不到退回浅蓝）；新人加入时弹一下（`dock-pop`）；有未读/未接来电的头像一呼一吸地柔光（`dock-live`，2.4s，不是闪个不停）。
  - **"太白"要量，不要凭观感调**（2026-09-2X 用户「还是不好看 太白了 是不是透明的问题」）：白的是**框那层白色浮层**，不是透明问题 —— 所以白色浮层压到 **.05**（悬停 .07）、顶部高光 `.07`、头像垫底改用**暗色** `rgba(10,12,12,.2)`（`frameColors().chip` 按主题给，浅色任务栏才用亮垫底）、卡片底色补到 `rgba(18,18,20,.58)` 保住截图可读性。条子平均亮度实测 **41.7 → 36.4**（`Build/dock-white-measure.cjs` + `Build/dock-white-regions.cjs`：同一假桥 + `#1b1b1b` 任务栏底，逐像素量）。
    - **踩过的弯路**：我曾按"头像太白"把头像提亮（brightness `.74 → .88`），区域实测头像亮度 **44.3 → 91.8**，方向完全反了；`Build/dock-dim-sweep.cjs` 扫参数时才发现**贴图本身是透明底的暗色角色**——它显示多少亮度完全由 CSS filter 决定。这类判断一律先量。
  - **两个坑（都实测踩过）**：① `color-mix()` 在**预乘**空间里混合，拿半透明色去 `color-mix(..., #fff)` 会把 RGB 一起拖向白 —— 浅色任务栏那层"黑色浮层"被算成 `rgba(35,35,35,…)`，既有的「浅色 → 黑色浮层」断言当场红；所以悬停提亮的底色**按主题写死**（`--dock-strip-bg-hover`），不要用 color-mix。② `.dock-frame` 上**不能加 `transition: background`**：主题切换时 `getComputedStyle` 读到的是过渡插值（同一份代码两次跑出 `rgba(0,0,0,.06)` 和 `rgba(35,35,35,.063)`），那条断言随机红。
  - 外观核验工具是 `Build/dock-visual.cjs`（**吃构建产物**，不依赖 Vite dev server）：自己起静态服务器伺服 `Build/OfficeWeb/dock.html`、注入与 `dock.cjs` 相同的假桌面桥、再铺一层"任务栏"背景，截图 `Build/dock-visual-{strip,strip-zoom,card,card-zoom,light}.png` 并打印卡片/按钮实测几何。真正带断言的 `test/browser/dock.cjs` 仍然要跑，两者一起看。
  - **已上线**（2026-09-2X）：现在是 `main-Dj86UWuF.js` / `dock-D1-Mhz6f.js` / `dock-C4cCZsbU.css`（降白那一版），逐文件哈希核验本地=远端、公网 200 且哈希一致；**后端未动、未重启、未发新客户端**（装着的客户端重启或刷新即可）。线上实测见 `Design/Deployment.md` 顶部那条。
    - **重建后文件名会变，但内容可能逐字节相同**：同一份源码重建会让 `main-*` 与分块名一起换哈希（实测 `main-ZLu45is8.js` → `main-Dj86UWuF.js`，规范化分块名后两边都是 745,716 字节、逐字节相同）。所以"远端缺失新文件名"**不能**推断成"有别人的改动混进来"，用 `Build/build-drift.cjs` + `Build/same-content.cjs` 规范化比对来证明。

## 会议室墙面照片（2026-09-15 用户要求）

- 用户给了一张 AI 生成的"团队合影"（12 个角色在办公室里，豆包 AI 生成），要求**放到会议室墙上的画面里**。
- 模型里会议室墙面的"画"其实是那块演示屏：`Meeting / display surface`（three.js 名字 `Meeting__display_surface`，材质 `Display background`，纯深色无贴图），外框是另一个节点 `Meeting / presentation display`（材质 `Warm graphite`）。`src/meetingWallPhoto.ts` 落地这件事：
  - `findMeetingWallSurface`：按名字同时含 meeting/display/**surface** 定位（外框是 presentation display，不会被误选）。
  - **必须重做 UV**：那块面板的 UV 来自烘焙图集（u 只有 0.125–0.875，面板面只占其中一小块），直接用原 UV 贴照片只会显示一条窄带 —— `remapPanelUv` 按面板局部 x/y 范围重新生成 0..1 UV。
  - `texture.flipY = false`（glTF UV 原点在左上，three.js 默认翻转会让照片上下颠倒，实测确认）。
  - 材质用 `MeshStandardMaterial`（map + emissiveMap，emissiveIntensity 0.3）：房间偏暗，屏幕要像"亮着的画面"而不是一张海报。
- 照片资源：`public/assets/meeting-wall-photo.jpg`（1600×899、约 194 KB，由用户提供的 2732×1535 原图缩小，质量 82）。
- 测试：`test/browser/meeting-wall-photo.cjs`（断言面板存在、贴上照片且真的解码出 1600×899、材质名正确、外框材质未被换掉；并把相机对准墙面截图 `Build/meeting-wall-photo.png` 与面板特写 `Build/meeting-wall-panel.png` 供人眼核对）。为便于截图，`sceneProbe` 新增 `controls()`（仅 `?debug=1` 暴露）。

## 项目边界

- 本目录是独立的新网页项目，原协作软件只作为参考，不直接修改。
- UE 工程、用户 Blender 原稿和原始角色包保留在本目录外。
- 三维显示、通信、屏幕共享、语音和会议按职责拆分。
- 没有实际多人验证的功能，不得宣称已经联机可用。

## 服务器即最终呈现（用户只看部署站点，2026-09-11）

- 用户只看**部署到 VPS 的站点**：https://115.159.43.237/（部署细节见 `Design/Deployment.md`）；**不是**本地 127.0.0.1 上的任何东西。
- 本地运行方式已于 2026-09-14 按用户要求移除：`npm run server`（本地 3108）与 `npm run dev`（Vite 5188）两个脚本，以及 `vite.config.ts` 里仅供开发服务器使用的代理都已删除。不要再为「在本地 127.0.0.1 跑一遍」起服务、建流程或截图；验证在正式站或既有 QA 隧道（`127.0.0.1:3200`，见 `Design/Private_Call_AV_20260913.md`）上做。
- `start.mjs` / `server.mjs` 是**线上** systemd 入口，必须保留；Vite 仍是构建工具与浏览器测试内建服务器的来源，不要删依赖。
- 部署链路：本地 `npm run build` → 上传 `dist/` 与后端文件到 `ubuntu@115.159.43.237:~/officeweb/`；后端有改动再 `sudo systemctl restart officeweb`。完整命令见 `Design/Deployment.md`「重新部署」。
- **前端（`src/`、`public/`）改动必须重新构建并上传 `dist/` 才会上服务器；后端（`server.mjs`、`livekit.mjs`、`static.mjs`）改动必须上传并重启 `officeweb` 服务才生效。**
- 交付/汇报「界面可见」之前，先完成「构建 + 上传」，再在 https://115.159.43.237/ 上**普通刷新（F5 / Ctrl+R）**确认；**不要用 Ctrl+F5 硬刷新**——它绕过缓存重新下载 14.89MB 的办公室模型（2026-09-15 实测），而 `index.html` 是 no-cache、bundle 名带内容哈希、模型带 `?v=`，普通刷新就一定能拿到新版本。纯前端改动上传 `dist/` 即可（`static.mjs` 每次请求读盘），后端改动才需要 `systemctl restart officeweb`。不要以本地服务器为准。

## 服务器身份与交付核验（强化，2026-09-12）

- 唯一正式呈现目标是 `115.159.43.237`，部署账号是 `ubuntu`，工程目录是 `/home/ubuntu/officeweb`。
- 已验证私钥是 `C:/Users/Administrator/.ssh/id_ed25519_aiwb`（2026-09-12 登录成功）。SSH/SCP 显式指定此文件和 `IdentitiesOnly=yes`；不得再猜用 `id_ed25519_irulerdream`，也不要重复向用户索要已经记录的连接信息。完整命令见 `Design/Deployment.md`。
- `iruler-test` 是另一台 Windows 测试机，其 SSH 文档、账号和密钥不能直接作为本 VPS 的连接配置。
- 连接前核对本项目部署文档中的目标、账号及明确指定的凭据。`<key>` 是未填写的占位符，不是已确认的密钥配置；不能猜填或借用其他机器的密钥。
- 已有部署信息先查本项目文档；只有确实缺少或失效的连接信息才向用户说明具体缺项。不要再次询问已经明确的服务器地址。
- 上传前确认实际构建输出目录；若输出在 `Build/OfficeWeb`，上传该目录内容到远端 `dist`，不要误传旧的本地 `dist`。
- 模型、贴图、角色和坐姿同属网站更新范围。必须确认线上实际返回的新资源版本，并查看线上效果；本地导出或构建成功不等于上线。
- 部署失败时明确写“本地已完成，服务器未更新”，说明阻塞原因。未上传成功时，不得让用户靠刷新寻找新内容，也不能将旧资源误判为浏览器缓存问题。
- 保留已知凭据的安全边界：文档只记录确认过的路径或别名，不保存私钥内容；自动审批拒绝后不得绕过。

## 烘焙质量与性能（2026-09-12）

- 操作前阅读最新流程：`../Design/OfficeConcept/烘焙流程.md`；不得将历史初版低采样脚本当成正式流程直接执行。
- 正式烘焙采样不得低于 128；当前噪点修复采用 256。
- 必须对烘焙图像本身降噪；不能将 Cycles 的预览/最终渲染降噪开关当成烘焙输出已经降噪的证据。
- 优先使用颜色、反照率和法线引导降噪，检查实际输出文件以及场景近景。重点看地板、桌下阴影、墙面和椅面，同时保留砖缝、木纹、织物细节。
- 每个需要烘焙的物体单独智能展开 UV、单独烘焙；地板和主要桌面 2K，其他按需求用 1K、512、256。纯色细小零件、玻璃和特殊透明材质可免独立烘焙图。
- 全部烘焙完成前保持源材质参与光照，最后统一应用结果；保留备份和无损原图，网页只携带实际使用的压缩资源。

## 账号与专属工位（2026-09-13）

- 工位预览默认开启，前端加载期间不得误显示为关闭；用户可手动关闭。预览开启不代表绕过浏览器屏幕采集授权。
- 密码按用户要求允许 1–16 个字符，不设置 8 位最低长度；前后端校验与提示保持一致。
- 正式环境必须先注册或登录；身份以服务器验证的 HttpOnly 会话为准，禁止信任客户端任意 id/name。
- 姓名是唯一登录名，密码只保存加盐哈希。accounts.json、state.json 及备份不得提交、静态托管或覆盖部署。
- 工位绑定账号，离线、刷新和服务重启后仍显示主人姓名；抢座必须由服务器原子仲裁并成功持久化。
- **聊天会话列表＝在线的人 + 工位主人（含离线）+ 有实际聊天记录的人**（2026-09-15 用户要求，两轮修正）：会话列表**不再**按账号名册全量列出。`ChatInbox` 的目录由三端构成——`people`（当前在空间）、`seats`（**永久工位主人，离线也要在列表里**："工位上的人离线也要在列表中"）、本机消息记录（有往来的人，名字优先取名册里的最新名字）；名册（`chat-contacts`）只用于查名字和身份，不再自动占一行。被请出/隐藏的账号一律排除（`hidden`）。因此很久不上线、没工位、也没聊过的旧账号不会再出现。
- **管理员「请出」＝离开空间**（2026-09-15 用户要求，起因："已经踢了的人怎么还会在聊天里面"）：请出不再只是收回工位。`membership.mjs` 把该账号加入 `ejected`（**落盘 `ejected.json`，重启不会自动赦免**）——会话名册（`chat-contacts`）过滤掉他、`hidden` 名单随每次回包下发并用 `chat-directory` 推送给所有人（聊天会话列表立刻消失，不用等 30 秒周期同步）、`accounts.revokeSessions` 撤销其 Cookie 会话、所有相关 socket 断开。客户端收到 `kicked` 后回到登录页（**但不清除保存的账号**，重新登录只需点一下）。**重新登录即恢复为正常成员**（并落盘清除标记）；工位同时释放并落盘。其他同事的聊天行为不变（有往来的离线同事照旧可以留言）。
- 点击成员列表只移动相机到显示器前，不等于占座或获得高清屏幕权限。显示器文字必须朝正向，不被人物遮挡。
- 注册/登录/退出、换设备恢复、错误密码、并发抢座与拒绝冒充均须测试；隔离测试账号不得混入正式名册。

## 桌面自动登录与低清预览（2026-09-14）

- EXE恢复持久会话；网络失败按5–30秒间隔重试，首次成功登录用Electron safeStorage加密保存信息，不能明文保存密码。
- **桌面端必须记住账号密码**（2026-09-15 用户报障"客户端老是记不住用户账号和密码"修订）：保存的登录信息（`login.enc`）**只有主动退出登录才清除**。被别的设备顶下线（`session-replaced`）、Cookie 会话失效（`connect_error: 请先登录`）、被管理员请出，都**不能**清（这些原来都会 `clearLogin()`，而"在浏览器上登同一个账号"就会触发，于是 EXE 每次都忘）。这些情况下回到登录页要**从 `readLogin()` 把姓名和密码填回表单**（`office-session-ended` 的 detail 为 `{ message, forget }`，只有 `forget:true` 才清）。本机加密不可用时 `saveLogin` 返回 false，**也要允许登录**，只是这次记不住。设置里有「登录记忆：已保存／未保存」可直接确认。测试见 `test/browser/login-memory.cjs`。

- EXE登录且持有工位后自动采集所选物理屏幕的低清截图，**每6秒一张、最长边300**（2026-09-14 用户指定，取代原「每3秒/480」），默认主屏；右键自己的场景显示器切换并记住选择。
- 采集方式为**常驻低频流**（`OfficeDesktop/preview-capture.cjs`：一次性取源后保持 300px、低帧率的隐藏采集窗口，每帧只抓最新画面）。实测单帧开销从 552ms 降到约 3ms；旧的"每次重新枚举所有显示器"保留为回退路径，但不得再作为主路径。
- **有工位就一直采集**（2026-09-15 修订，取代 2026-09-14 的「没人在接收时完全不采集」）：桌面客户端在线且持有工位就持续采集，**自己一个人的时候自己的工位显示器也要有画面**，晚登录的同事立刻就能看到，不用等下一次启动。服务端仍逐个 socket 下发 `ambient { wanted }`（"除你之外还有没有人开着接收"），但客户端只把它当作状态提示（底部栏「我的工位预览：采集中（暂时没人看）」），**不再据此停采**。旧规则会让独自办公时屏幕空白——2026-09-15 用户报「还是没有出现屏幕预览」的原因就是它；常驻流单帧约 3ms，代价可忽略。**关闭自己的接收不会停止自己的上传**；断线、退出、访客身份仍会释放常驻流（`officeDesktop.setPreviewActive(false)`）。
  - **刷新间隔随焦点变**（2026-09-15 用户指定）：**焦点内 6 秒，焦点外（或窗口隐藏）12 秒**，回到焦点立刻补一帧。由 `src/previewGate.ts` 的 `previewIntervalMs(focused, visible)` 决定，`useDesktopPreview` 每次取帧后重新计算。最长边 300、JPEG 质量 55 不变。
  - **人不在电脑前时要停采，别挡息屏**（2026-09-17 用户要求：「离开就暂停采集 不要耽误息屏」）：实测 Windows 上"正在采集桌面"会让 Chromium 申请 **DISPLAY 常亮**（`powercfg /requests` 显示 `Native desktop capture`），屏幕于是永远不熄；**停止采集后该请求立刻消失**（`Build/capture-release-check.cjs` 验过）。所以 `OfficeDesktop/preview-idle.cjs` 的 `createPreviewIdleGate()`（阈值 `AWAY_PAUSE_SECONDS = 60`，读 `powerMonitor.getSystemIdleTime()`）在空闲跨过阈值时 `previewCapture.stop()`，`office:preview-frame` 暂停期间**直接返回 null**，人一回来下一次取帧自动重新附着。**阈值必须不大于系统关屏超时**；读不到空闲时间当 0（宁可继续采集也不莫名停掉预览）。共享屏幕是另一条采集（`getDisplayMedia`），不受影响、共享时屏幕仍然亮。网页侧只读 `office:preview-state`（`{ paused, idleSeconds, awayAfter, attached }`），状态行显示「我的工位预览：已暂停（你离开超过 1 分钟，屏幕才能熄灭）」。
  - 预览**没有身份例外**（2026-09-15 用户："别什么都老板例外搞得太复杂"）：只有成员广播，访客一律不广播；「文杰 → 老板工位」只是座位规则，不影响预览判定。原先的 `preview-policy.mjs` 已删除，服务端恢复成 `p.role !== "visitor"` 两处兜底。
- 底部栏常驻一行「我的工位预览：…」状态（`src/previewGate.ts` 的 `previewReason`），区分"浏览器需点「授权工位预览」/ 连接中 / 还没有工位 / 访客不广播 / 采集失败，重试中 / 采集中（暂时没人看）/ 采集中"——显示器空白时先看这行，不要靠猜。
- 小预览不调用getDisplayMedia、不弹选程序或自预览浮窗，不持续采集高清视频；不提供暂停工位预览按钮；在线且持有工位自动维持截图，断线/退出停止广播。
- **三维画面只在有焦点时刷新**（2026-09-14 用户指定）：`sceneLoop` 的 `unfocused` 模式不再出帧（此前是降到 10fps 继续画），并且改用 100ms 定时器而不是每帧 rAF；位置模拟继续跑，重新聚焦立刻恢复。**例外：本机正在高清共享屏幕时继续出帧**（否则看的人会看到冻结画面），由 `OfficeScene` 的 `keepRendering`（= `office.sharing`，即真正的高清屏幕共享）控制。**2026-09-15 修正**：工位低清预览**不再**让画面持续出帧（那是另一个 agent 早前把 `sharing` 换成 `desktopPreview.active` 造成的），焦点外仍保持冻结，只按 12 秒间隔抓帧。
- 他人工位预览开关仅控制接收：关闭时服务器不下发他人小屏幕，保留自己显示和上传；不得关联本机截图采集。
- ambient-sharing与高清sharing独立；高清接替、停止、退出会议不能清掉仍在运行的工位小预览。浏览器仍需原生屏幕权限。

## 文件直传：把文件拖到任务栏头像上（2026-09-22 用户要求）

- 需求原话：「新增文件发送功能，就是把文件拖至状态栏某人头像，就会开始发送，**不需要对方同意**，
  直接就发送到**设置好的位置**，设置里面可以改，**双方要显示系统级进度条**，完事有打开和打开文件夹的功能」。
- 已确认的四个选择：**接收方网页也能收**（网页只能走浏览器下载，没有系统进度条）；
  **服务器实时中转**（不落盘）；对方不在线时头像条上根本没有这个人，所以不存在"离线投递"这个场景；
  **接收文件夹由接收方自己在设置里选**。
- 分工（和项目既有铁律一致）：
  - **小窗（头像条）只交路径**。`dock.tsx` 的拖放用 `officeDock.filePaths(files)` —— Electron ≥32 删掉了
    `File.path`，只有 `webUtils.getPathForFile` 拿得到真路径 —— 再 `dropFiles(personId, paths)` 交给主进程。
    小窗**依旧不碰 socket、不碰文件系统**（`test/dock-rules.test.mjs` 的静态断言守着）。
  - **主窗口（唯一的 socket 拥有者）**负责分片、确认、进度：`src/fileTransfer.ts`（引擎）+
    `src/useFileTransfers.ts`（React 外壳，`useSyncExternalStore`）+ `src/fileTransferRules.ts`（纯规则）。
  - **主进程**负责真实文件系统与系统进度条：`OfficeDesktop/file-transfer.cjs`（发送读盘、接收写盘、
    接收文件夹设置、`setProgressBar`、`openPath`/`showItemInFolder`）。
- **广播操作符上的 `emitWithAck` 回的是数组，不是对象**（2026-09-21 真机排查出来的**根因**，
  让"把文件拖到头像上发不出去"卡了整整一轮）：
  `io.to(room).timeout(ms).emitWithAck(ev, payload)` —— **即使 room 里只有一个 socket，
  解析出来也是 `[{ ok: true }]` 这种数组**（每个客户端一个 ack；只有 `socket.emitWithAck` 才是单个 ack）。
  服务端原来写 `if (!answer?.ok)`，在数组上永远是 `undefined`，于是**每一趟都在 `file-offer` 就被判成
  「对方无法接收文件」**，而对方其实每次都回了 `{ ok: true }`——传输根本没开始。
  `file-chunk` / `file-end` 走的 `toTarget()` 是同一个坑，所以就算 offer 过了，每一片也会失败。
  - 现在统一过 `firstAck(value) => Array.isArray(value) ? value[0] : value`（`file-relay.mjs`）。
  - **服务端日志里留了一行**：offer 被拒时打 `[file-relay] file-in 被拒绝：{target, kind, isArray, keys, error}`。
    `isArray: true` 就是这条 Bug 的指纹——**排障先看 `journalctl -u officeweb | grep file-relay`**。
  - **测试的假 io 当时回的是单个对象，所以完全测不出来**。两个 harness
    （`test/file-relay.test.mjs`、`test/file-transfer-endtoend.test.mjs`）现在都**回数组**，
    并且都写了注释叫后来人别"简化"回去。实测把那行退回旧写法，11 条中继测试**红 9 条**。
  - 教训：**写假件时要照着真实库的行为写，不能照着"我以为的"写**。这一条比 Bug 本身值钱。
- 服务端只转发、不落盘（`OfficeWeb/file-relay.mjs`）：发送方分片 → 校验 → 原样转给接收方 →
  接收方写盘成功才回执。所以 VPS 上不会攒文件、不需要清理策略与配额；`test/file-relay.test.mjs`
  有一条源码级断言禁止这个文件出现任何 `node:fs` 调用。**每一片都要端到端 ack**，发送方窗口
  `WINDOW = 4`，接收方写得慢就自然把发送方拖慢（背压）；服务端同样校验 `inflight < WINDOW`，
  另有单发送方 3 个、全局 24 个传输的上限。
- **"不需要对方同意"落在协议上**：服务端的 `file-in` 不是征求同意，而是**确认对方那端接得住**
  （能开文件、有地方放）。接收方收到就直接写盘，客户端里不许出现"是否接收"的询问
  （`file-transfer-rules.test.mjs` 有断言盯着 `confirm`/`accept?` 不许回来）。
- **接收文件夹**：设置里选（`FileReceiveSetting.tsx` → `officeDesktop.files.chooseFolder()`，原生目录选择器，
  存在 `userData/file-transfer.json`）。没设过时默认 `<系统下载>/iruler dream` 并自动建出来，
  所以第一次就能收。**写盘一定在这个目录内**：`safeName()` 丢掉所有目录成分、替换非法字符、
  躲开 Windows 保留设备名、截到 150 字符；再来一次 `path.resolve` 前缀校验兜底；
  重名往后排 `(1)(2)`，**绝不覆盖**对方已有的文件；先进 `.part`，收完才 `rename`。
- **进度条是两套，都要有**：① Windows 任务栏按钮上的原生进度（主进程 `win.setProgressBar`，
  同时传多个按字节数合并，传完先把满格亮 1.5 秒再收掉）；② 任务栏头像条**里面底部**那条细线
  （`dockRules.DockState.transfers` → `dock.css` 的 `.dock-progress`，发送青色 / 接收绿色 / 失败红色）。
  头条的进度字段**必须同步加进 `dock-bridge.cjs` 的白名单清洗**——这个坑踩过三次
  （`self`/`missed`/`away` 都漏过），`test/dock-bridge.test.cjs` 现在盯着 `transfers`。
- **完事的两个按钮**：`FileTransferPanel.tsx`（左下角，右下角已经给未接来电和更新提示了）给
  「打开」（桌面端开本地文件、网页端开收下的 Blob）和「打开文件夹」（`showItemInFolder` 选中该文件）。
  卡片**不自动消失**，只能手动关（和未接来电卡片同一个理由：按钮跑掉就没得点了）。
  窗口收在托盘里时另有系统通知，不然用户不知道传完了。
- **打开/显示只认自己交出去过的路径**（`known` 列表 + 接收文件夹前缀），页面构造的任意路径一律拒绝；
  `openFolder('C:\\Windows')` 也如实返回 false，不许"悄悄换成接收文件夹"（这条是被测试逼出来的）。
- 进度状态**攒 200ms 再推给 React**（`FLUSH_MS`）：一片一次 `setState` 会让整个页面空转，
  和 2026-09-20 那次 CPU 爆表是同一类病；`sameTransferRows` 保证内容没变就不换引用。
- 网页版收文件：没有可静默写入的文件夹，先在内存里攒、收完合成 Blob 交给浏览器下载
  （因此有 `BROWSER_MAX_BYTES = 512 MB` 的上限，超了明确拒绝并让对方改用客户端接收）。
- 为了腾出行数，顺手做了三处**纯搬家**（行为不变，测试跟着搬）：`useOffice.ts` 的会议画布清理 →
  `annotationChannel.trackMeetingRoom`；socket 上那三条标注消息 → `annotationChannel.attachSocket`；
  认领工位/管理员释放 → `src/seatRequests.ts`；设置弹窗 → `SettingsDialog.tsx`。
  当前 `server.mjs` 492 行、`App.tsx` 465 行、`useOffice.ts` 452 行，都在 500 以内。
- **二进制分片千万别读 `.length`**（2026-09-21 用户报障「对方无法接收文件，接收方出现了进度条显示没有进度」的**根因**）：
  `socket.io-client` 的**浏览器构建**——页面和 Electron 渲染进程用的就是它——默认
  `binaryType = "arraybuffer"`（`engine.io-client/build/esm/globals.js`），所以收端拿到的是
  **`ArrayBuffer`**；而 `ArrayBuffer` **只有 `byteLength`，没有 `.length`**。原来的
  `payload?.bytes?.length || 0` 因此永远是 `0`，**每一片都被判成"无效的文件分片"**：接收方那张卡片
  出现了却停在 0% 随即失败，发送方只被告知对方收不了。服务端（Node 构建是 `"nodebuffer"`）拿到的是
  `Buffer`，所以服务端、单测、聊天附件那条老路全都正常——问题只在浏览器那一侧，这就是它没被早发现的原因。
  - 现在统一走 `fileTransferRules.ts` 的 **`toBytes()`**（`ArrayBuffer` / `TypedArray` / `Buffer` /
    `Blob` / socket.io 老式 `{type:'Buffer',data}` 全覆盖），配套 `byteLengthOf()` / `describeBinary()`
    让错误信息说清"到底收到了什么类型"。
  - **测试必须按浏览器的形状投递**：`test/file-transfer-endtoend.test.mjs` 用**真的 `file-relay.mjs`**
    + 两端 `createFileTransferChannel` 跑完整一趟，harness 把二进制转成 `ArrayBuffer` 再交给接收方，
    并且**断言转换确实发生过**（`delivered.arrayBuffers >= 2`）——否则测试会悄悄退回 `Buffer`，Bug 又藏起来。
    实测把那一行退回旧的 `.length` 写法，4 条里有 3 条立刻变红。
  - **这条链路是纯前端的**：修好只需重新构建上传 `dist/`，两端**刷新页面（F5）**即可，不用重新装客户端。
  - 顺带修掉一个更隐蔽的：`file-in` / `file-in-end` 原来**没有 try/catch**，接收端一抛
    （比如 `receiveOpen` 的 IPC 失败）就永远不会 `reply`，发送方要**白等 60 秒**才知道失败。
    现在两条路都包住了，失败原因立刻回传，两端卡片都写明原因。
- **单个文件上限 2 GB，两条路都是**（2026-09-21 用户要求：「把聊天框的大小限制到2g文件传输，把头像直传也2g」）：
  - 头像直传：`OfficeWeb/file-relay.mjs` 的 `MAX_FILE_BYTES` **==** `OfficeDesktop/file-transfer.cjs`
    的 `MAX_BYTES` == `2 * 1024 ** 3`（原来是 4 GB）。服务端那份是硬门，客户端只是早点报错。
  - 聊天附件：`OfficeWeb/chat-files.mjs` 的 `MAX_FILE_SIZE` **==** `src/chatAttachments.ts` 的
    `MAX_CHAT_FILE_BYTES` == `2 * 1024 ** 3`（原来是 20 MB）。
  - **这几个数字散在三个文件里，只改一处就会变成"界面说能发、服务端拒收"**，所以
    `test/file-size-limits.test.mjs`（网页侧）和 `OfficeDesktop/test/file-transfer.test.cjs`
    把它们钉在一起并核对提示文案；改上限时**四处一起改**（含 `ChatPanel.tsx` 里那行说明）。
  - **聊天附件是存在 VPS 上的**（`chat-data/`，保留 7 天）：上限变大等于磁盘占用变大，
    发大文件前先看 `df -h /`（2026-09-21 当时 22 GB 可用）。
  - 提上限时必须**一起**改的两处，不然大文件根本走不完：`chatAttachments.ts` 的下载期限
    `AbortSignal.timeout` 原来写死 60 秒——**它卡的是整条请求，不是"空闲"**，2 GB 永远下不完；
    现在用 `downloadTimeoutMs()` 随大小放大（最低 64 KB/s，2 分钟起、6 小时封顶）。
    另外超过 `CACHE_MAX_BYTES`（256 MB）的文件**不再往 IndexedDB 里塞**，直接把手里的 Blob
    交出去下载（浏览器的存储配额经不起几个 GB，`put` 会失败或卡住）。
- **聊天框里的文件下载也走这条通道（2026-09-21 用户要求：「整理一下聊天框里面的文件下载，要带进度条，
  要软件内设置好下载位置，下载好了也还是有几个按钮 打开等 复用」）**：
  - 入口是 `fileTransfer.ts` 的 `downloadAttachment({ id, name, size, url })`：数据来源换成
    HTTP 流（`/api/chat/files/:id`，经 `src/downloadStream.ts` 的 `streamResponse()` 一块块搬），
    其余**全部复用**——同一个接收文件夹（`receiveOpen/Write/End`）、同一份被限流（`FLUSH_MS`）的进度、
    同一条任务栏进度条、同一张卡片、同样的「打开 / 打开文件夹」。
  - **行 id 就是附件 id**：聊天里那一条和传输面板里那一条是同一个记录，界面据此画自己的进度条，
    重复点「下载」也不会开第二趟（已完成直接返回）。
  - `ChatPanel.tsx` 的 `AttachmentView` 现在渲染：进度条（`.chat-file-bar`）、「下载 / 重新下载」、
    「打开」「打开文件夹」、「取消」，小附件另给一个「另存一份」的直链。
  - **大附件不再后台自动预取**：`chatClient.show()` 只把小附件（≤ `PREFETCH_MAX_BYTES` 4 MB）放进
    后台缓存队列——上限提到 2 GB 之后，"所有附件都自动收"等于打开一次聊天就静默拉几个 GB。
    这也是 2026-09-21 之前"收到就缓存"那条规则的必要修订。
  - `chatAttachments.ts` 现在 import `fileTransferRules.ts`（`downloadTimeoutMs` 只留一份）。
    测试里转译 `src/*.ts` 请用 `test/helpers.mjs` 的 **`loadTs()`**：data URL 模块解析不了 `./x`，
    模块一旦互相 import，老的"就地 transpile"写法会直接崩（这次踩到了）。
- **`src/fileTransfer.ts` 已经 494 行（上限 500）**：下一次改动它之前，先把**发送那一半**
  （`sendOne` / `sendFiles`）拆出去，别再往里塞。
- 已知边界：拖拽的**真机**链路（从资源管理器拖到任务栏那个无边框小窗）只能人工验证一次；
  `webUtils.getPathForFile` 对合成/网页拖来的 File 返回空串，所以自动化测试只能覆盖
  "路径转交 + 接收写盘"两段。暂不支持发送文件夹（服务端/客户端都拒绝，提示打包后再发）。


