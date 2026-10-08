# CREDITS — 尺子人吉祥物（ruler mascot）

## 2026-09-28 配件重建版本

当前网页版本基于用户提供并已授权使用的 `Build/ruler/src/ruler-full.blend`。
本轮重新制作 19 件配件与平滑眼睛，无新增第三方素材；原创生成代码位于
`tools/ruler_detail_geometry.py`、`tools/ruler_detail_accessories.py`、`tools/ruler_detail_eyes.py`。
加工源文件为 `detail-v2/ruler-detailed.blend`，原网页模型备份为 `detail-v2/ruler-before.glb`。
下面的说明是早期导入记录，不代表此次新配件的来源或此次修改范围。

## 来源

- 原稿文件：`C:\Users\Administrator\Downloads\跑步循环.blend`
- 大小 / 时间：41,567,610 字节，2026-09-21 17:03:31
- sha256：`F150A26951BBA7F7C8F75C19F776DAEBE41F7F64B4F0C4B67D556D1D93F14118`
- 由用户 2026-09-21 提供，本仓库**不保存原稿**（按项目约定，用户的 Blender 原稿留在项目外）；
  上面这一行就是原稿的唯一凭据，重新加工时用 `--src <路径>` 指过去即可。
- 原稿在全部加工过程中**从未被写回**（每次加工前后核对 mtime / 大小 / sha256 一致）。

## 作者与授权：**待用户确认**

原稿内部没有版权信息，但有几处像是素材包的命名，需要用户确认来源后才能按项目规则记录：

- 网格名 `RULER.001`，材质名 `材质.017`
- 贴图名 `ruler03_材质.002_BaseColor.png` / `_Normal.png` / `_Roughness.png`，
  原始相对路径 `//..\06_maps\ruler01\`（说明贴图来自某个 `06_maps` 素材工程）
- 骨架是 **Auto-Rig Pro** 的命名规范（`spine.k`、`chestik`、`foot_ik`、`shoulder.fk`、
  `palm.tg`、`f_index.01`…），通常是用户在素材模型上自己绑的

## 我们的改动

见同目录 [README.md](README.md)：只留角色本体、烘焙并整理动作、新增 Idle / Wave、
贴图降到 512²、删顶点色、减面、按色相导出六个配色。原模型形状与贴图内容未做美术改动
（配色只是色相旋转）。
