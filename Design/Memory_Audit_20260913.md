# 内存检查（2026-09-13）

正式站点：https://115.159.43.237/

## 测量

独立Electron44.3.0、1440×940、同一办公室和一个人物，无聊天/采集。
这是本机单次对照，不是用户当前700MB任务管理器读数的逐进程复刻。

| 项目 | 原始 | 可选压缩版 |
|---|---:|---:|
| 页面进程working set | 644.3MiB | 367.1MiB |
| GPU进程working set | 357.3MiB | 271.2MiB |
| CPU图像RGBA估算 | 464.0MiB | 4.7MiB，另保留压缩mip数据 |
| GPU纹理含mip估算 | 618.6MiB | 159.4MiB |
| 场景文件下载 | 4.34MiB | 13.02MiB |

进程共享页可能重复计数；GPU专用内存、共享内存和提交量不是同一指标，不可相加当物理内存。
134纹理（125模型图+9屏幕画布），网格属性/索引10.7MiB，原始JS堆约30MiB。
压缩mip须保留用于WebGL上下文恢复，所以压缩版JS堆上升，不代表总占用反增。
大头是解码像素和Chromium/GPU缓冲；10fps/隐藏停绘省运算但不卸载纹理。

## 已修复并发布

- 人物切换/离开：释放旧纹理、ImageBitmap、骨骼纹理和AnimationMixer引用。
- 退出场景：完整释放几何/材质/纹理/阴影缓冲；按对象去重。
- 异步加载晚于场景退出时仍清理；诊断入口不再持有旧场景。
- 解码结束再关闭worker，避免中断任务留下悬挂Promise和数据。
- 默认画质、布局、最新坐姿方向、10fps、音视频与聊天保留。

上述修复针对资源累积，不能宣称首次进入已将用户700MB降至367MB。

## 用户判断的取舍

对比入口：https://115.159.43.237/?textures=compact

普通入口仍加载原图；参数不永久改变设置。不支持压缩或加载失败回退原图。
KTX2/ETC1S质量255保留原贴图尺寸与UV，减少内存，但地砖渐变边缘存在色块、首载增加8.7MiB。
因此没有设为默认。UASTC更近原画，但文件55.9MiB，未上线此版本。
小物件1K降512可将该图像素内存减至1/4，但损失近景；地板/桌子2K暂不降。
降低渲染分辨率/抗锯齿影响清晰度；长期隐藏卸载三维需回来重载，均留待决定。
Electron多进程及共享视频帧是运行时/功能成本，无法全部删除而保持使用体验。

## 证据与工具

- 75项网页测试、tsc、构建通过；真实浏览器3秒工位预览/无浮窗/10fps/暂停恢复通过。
- Build/desktop-memory-before.json、desktop-memory-etc255.json及对应PNG；隔离Electron实测。
- 两版本节点/材质/UV/accessor以及451个非图像buffer完全一致。
- 正式默认与compact入口复核；发布目录Build/OfficeWebMemoryRelease。
- JS D0Zwm5NK，SHA256 ce2ff24fa048f087aef394980932070c061b54acc221efc36dccd23355adc2d8。
- 压缩GLB SHA256 8bad9e02b8881fc626cdfd57127d77292860ef3d5980ce4451f480ef7affbea7。
- 仅前端发布，未动账号/工位/聊天/.env/LiveKit；回滚backups/memory-20260913/index.html。
- 编码器：[Khronos KTX-Software 4.4.2](https://github.com/KhronosGroup/KTX-Software/releases/tag/v4.4.2)，只提取到Build/KtxTools。
- 转码器来自既有three的basis目录，[Basis Universal](https://github.com/BinomialLLC/basis_universal)。
- tools/compress_office_textures.cjs可重建；原Blender与office-baked.glb保留。
