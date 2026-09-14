# 网页角色

- 使用已下载的 Quaternius Ultimate Modular Women 与 Men 全套（21 个角色），CC0，原始来源与授权保留在 AssetSources/Characters/Quaternius。
- 由 tools/export_web_characters.mjs 将每个角色导出为二进制 GLB（保留全部 24 段动画），存放于 public/assets/characters/{性别}_{id}.glb；catalog 在 src/characters.ts。
- 缩略图由 tools/render_character_thumbnails.py 用 Blender 无头渲染，存放于 public/assets/characters/thumbnails/。
- 选角界面两级：先选“男角色 / 女角色”，再在对应性别网格里挑具体外观（每人一张缩略图）。首次进入时在选座弹窗内完成，之后可在场景左上角“我的角色”下拉里更换。
- 坐姿动作库（src/sitPoses.ts）：原包没有坐姿，采用程序化骨骼姿态，提供标准坐姿、放松后靠、前倾打字、仰靠小憩、翘二郎腿、坐着挥手六种，以及坐下 / 起身过渡；本机与远端角色共用同一套姿态。
- 点击地面寻路；WASD / 方向键按当前相机方向移动；输入框内不响应移动按键。
- 导航使用本场景的简化家具阻挡范围；修改布局后需更新 navigation.ts。
- 验证：类型检查、生产构建、浏览器男女入座和切换、角色网格与坐姿切换、八工位寻路、桌体阻挡、起点网格边缘回归（见 tools/smoke_character.mjs）。
- Vite 缓存及构建输出位于 OfficeWeb 外，所有项目文本文件保持不超过 500 行。
