# 网页角色原型

- 使用已下载的 Quaternius Ultimate Modular Women/Casual 和 Men/Casual_2，CC0，原始来源与授权保留在 AssetSources/Characters/Quaternius。
- 导出为二进制 GLB，女角色 1,410,820 字节，男角色 1,354,388 字节；公开 Walk、Idle、Idle_Neutral 动画。
- 点击地面寻路；WASD / 方向键按当前相机方向移动；输入框内不响应移动按键。
- 选择工位后点击“坐到 N 号工位”；“起身”返回椅后通道。
- 原包没有坐姿：当前采用运行时骨骼坐姿，末段入座为位置对齐，尚非完整坐下/起身动画。
- 当前只有本机控制角色；多人角色位置、占座同步尚未接入。
- 导航使用本场景的简化家具阻挡范围；修改布局后需更新 navigation.ts。
- 验证：类型检查、生产构建、浏览器男女入座和切换、八工位寻路、桌体阻挡、起点网格边缘回归。
- 浏览器渲染截图：Design/OfficeConcept/Web_Avatar_Seated.png、Web_Avatar_Man.png。
- Vite 缓存及构建输出位于 OfficeWeb 外，所有项目文本文件保持不超过 500 行。
