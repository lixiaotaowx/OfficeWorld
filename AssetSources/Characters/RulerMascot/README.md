# 尺子人吉祥物（ruler mascot）

用户 2026-09-21 提供的 Blender 原稿加工成的 OfficeWeb 角色。**只做了 Blender 这一块**，
网页接线（搬运、`characters.ts` 登记、选角界面）留待后续。

## 目录内容

| 文件 | 说明 |
| --- | --- |
| `ruler_mascot_web.blend` | 加工过的源文件（1.1 MB）：只留角色本体、动作整理好、贴图 512²、已减面 |
| `glb/ruler_yellow.glb` | 原稿的黄色，**计划里的母亲** |
| `glb/ruler_orange.glb` `ruler_green.glb` `ruler_blue.glb` `ruler_purple.glb` `ruler_red.glb` | 同模型换色，用来"只靠颜色区分" |
| `thumbnails/ruler_*.png` | 256×256 缩略图（拍的是 Idle 第一帧） |

每个 GLB 约 **1.10 MB**（现役 21 个 Quaternius 角色单个 1.47–2.11 MB，可作对比）。

## 这个角色是什么

一把**长着眼睛和手脚的黄色尺子**（"iruler" = 尺子），身体是带刻度的尺身，四肢是黑色细杆，
顶端眼窝里有眼球/眼皮。原稿：`C:\Users\Administrator\Downloads\跑步循环.blend`
（Blender 4.5 保存，41,567,610 字节，sha256 `F150A269…4118`，原稿未改动）。

- 骨架 83 根骨头，**Auto-Rig Pro 命名**（`thigh.L` / `shin.L` / `foot.L` / `upper_arm.L` /
  `forearm.L` / `palm.L` / `spine.k` / `head`…），静止姿势是标准 T-pose。
- 贴图原本是 3 张 4096²（BaseColor / Normal / Roughness，占原文件 39.6 MB 的绝大部分）。
- 原稿角落里另有 13 个参考物与骨骼控制器（`kuang`、`圆环`×2、`平面.001`、`立方体`、
  `WGT-rig_eyes`、`WGT-rig_hips`、`rig_eye.L`、`cs_arrow_cross.001`、`eye.up`、`eye.down`、
  `xiao` 等），不是角色的一部分。

## 加工做了什么（数字都是实测）

1. **只留角色本体**：`RULER.001` + 8 个 `球体*`（眼球/眼皮）+ 骨架；其余 13 个物体删除。
   若把它们一起导出，整包高度会从 9.89 变 13.09，网页端按 1.72 m 归一化后角色会明显偏小。
2. **走跑循环整理成 `Walk`**：原稿的动画挂在 NLA（`Anim_Layer` / `Subtract_Layer`）上，
   直接读动作并不等于所见画面，因此用 **visual keying** 把看到的循环烘成一条普通 FK 动作
   （343 条通道 / 17 帧 / 0.71 秒，第 17 帧 = 第 1 帧，循环无缝）。同时删掉原稿里
   8 条眼睛网格的单帧动作与 `Action` / `Anim_Layer.002` 两条空动作。
3. **新增两条动作**（原稿只有跑步，网页需要待机与招手）：
   - `Idle`：97 帧 / 4.00 秒。站立基底 = `Walk` 一圈的**逐通道平均**（跑动四肢摆动的中点），
     再用数值求解把手放到身侧；叠加呼吸起伏 0.35 单位、左右微移 0.16、双手小幅漂移，首尾闭合。
   - `Wave`：49 帧 / 2.00 秒。右手举到身体侧上方（举到位）后左右摆 3 次，首尾回到站立。
   - 做法：**不猜骨骼旋转轴**，全部通过世界空间位移求解 IK 目标（`palm.tg.*`、`spine.k`）的
     location 分量 —— 这套 ARP 骨骼的绑定姿势和静止姿势并不一致，靠局部欧拉角会翻车。
4. **贴图**：只留 BaseColor 并降到 512²；Normal/Roughness 对平面风格没有意义，已删除。
   同时删掉网格上的 `COLOR_0`/`COLOR_1` 顶点色 —— glTF 会把顶点色**再乘一次**到贴图上，
   网页里颜色会和 Blender 里看到的不一样，还白占几百 KB。
5. **减面**：124,584 → **16,798** 三角面（身体 98,944 → 12,000；8 个眼球/眼皮网格原本
   合计 25,640，各压到 600）。导出时应用 Solidify 后 GLB 里是 21,790 三角面。
6. **朝向**：脸在 Blender 的 **-Y** 侧，导出 glTF（+Y up）后正好落在 **+Z**，与网页里
   "角色面朝镜头"一致，**不需要转 180°**。
7. **配色**：原稿尺身贴图本来就是黄的（色相 47°±11°），换色只需在 sRGB 空间转色相 ——
   黑刻度与黑手脚饱和度 0，不受影响，所以只有尺身换色。六个配色一次导出。

## 网页接入时还要做的（我没做，属于"网页那块"）

- 把 `glb/*.glb` 放进 `OfficeWeb/public/assets/characters/`，`thumbnails/*.png` 放进
  `public/assets/characters/thumbnails/`，并在 `src/characters.ts` 里登记 id / glb / thumb。
- **`OfficeWeb/test/dock-rules.test.mjs` 断言该目录正好 21 个 GLB，且每个都要在
  `characters.ts` 里出现** —— 加角色时要一起改这两处，否则测试会红。
- 动作名已经对齐网页的约定：`Idle`（`characterModel.ts` 找 `Idle_Neutral`→`Idle`）、
  `Walk`、`Wave`（`dockRules.GREET_CLIP`）。
- **骨骼名没有改**，仍是 Auto-Rig Pro 那套；而 `sitPoses.ts` / `seatedFeet.ts` /
  `seatedHands.ts` / `standingPose.ts` 与 `characterModel.ts` 是按 Quaternius 的名字找骨头的
  （`Hips` / `UpperLegL` / `LowerLegL` / `FootL` / `UpperArmL` / `LowerArmL` / `WristL` /
  `Index3L` / `Middle3L` / `Pinky3L`）。因此这个角色**不会**正确坐下（也拿不到
  `restHipHeight` / `groundFootHeights`）。要么加一层骨骼名映射，要么让它只站着、
  或只用于小窗打招呼。映射关系：`spine.k`→`Hips`、`thigh.*`→`UpperLeg.*`、
  `shin.*`→`LowerLeg.*`、`foot.*`→`Foot.*`、`upper_arm.*`→`UpperArm.*`、
  `forearm.*`→`LowerArm.*`、`palm.*`→`Wrist.*`（注意点号会被 GLTFLoader 去掉）。

## 重新生成 / 核对

```powershell
# 重新加工并导出全部配色（只读原稿，产物全部写在项目内）
blender --factory-startup -b -P tools/build_ruler_mascot.py
# 只要黄色 / 先跳过动作
blender --factory-startup -b -P tools/build_ruler_mascot.py -- --no-variants --no-anim
# 重新核对导出的 GLB：结构 + 每条动作抽 4 帧 + 缩略图
blender --factory-startup -b -P tools/verify_ruler_mascot.py
# 不靠 Blender 重新导入，直接从 GLB 二进制里读某个节点的动画数值
node Build/glb-anim-dump.mjs AssetSources/Characters/RulerMascot/glb/ruler_yellow.glb palm.tg.R
```

## 已知取舍

- 招手的手臂只能举到**身高中段偏上**：这模型肩到手只有 2.47 单位，而身体高 9.5，
  举到头顶是物理上不可能的（已把手举到 Z=8.65，身体顶 9.75）。
- `Idle` / `Wave` 是脚本生成的，不满意可以在 Blender 里手改，改完重跑
  `tools/build_ruler_mascot.py` 即可（它会重新加工并覆盖导出件）。
- 原稿里眼球/眼皮网格的形态键（`基型` / `键 1`）没有被任何动作或驱动器使用，
  减面时清掉了。
