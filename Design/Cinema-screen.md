# 影院屏幕内容（2026-10-12）

## 设置窗口重做与自动识别

- 去掉手动类型选择：一个内容链接输入框和一个本地文件入口。文件按 MIME / 扩展名自动处理；平台及已上传内容直接识别，普通 HTTPS 地址按实际图片解码 / 视频 metadata 探测识别，支持无后缀和签名链接。识别中禁用保存，失败保留地址并提示换文件 / 检查链接；替换链接与关闭窗口取消旧探测并释放媒体。
- B站 / 抖音分享文案中提取 HTTPS 链接，识别标签、预览与说明随内容变化；保存仍使用既有 type / src / fit 契约，无后端变更。
- 弹窗通过 Portal 放在 body，使用固定全窗口遮罩，避开场景祖先的裁剪。宽屏预览 / 设置左右排列，窄屏上下排列；只在必要时滚动正文，关闭和保存区始终可见。弹窗层级高于客户端更新提示，避免保存 / 关闭按钮被提示遮挡；浏览器用例用命中检测覆盖该回归。
- 本地与正式资源浏览器验证 1500×950、1000×650、390×740、900×500 的边界、无横向裁剪、显示控件完整可访问；自动识别无后缀图片 / 视频、本地图片 / 视频、B站短链 / 抖音分享文案，保存后类别正确；原有上传、fit、两端读取、纹理播放和清空继续通过。
- 发布主入口 `main-BNyJZR6t.js` / `main-BdqC-3a7.css` 及依赖，6 项公网文件 200、SHA256 一致。旧主入口备份 `officeweb/backups/cinema-ui-20261012/`；此轮未发布其他聊天的 dock 入口 / 资源改动，未改后端、安装包或场景存档。

漫游模式点击 `cinema-screen`，沿用宝箱的点击入口与遮罩打开设置。移动模式继续选择 / 移动物件。图片和本地视频可选择文件或填写 HTTPS 地址；视频链接至少支持 B站、抖音及现有短链接解析。显示方式为 contain（保持比例完整显示）、cover（保持比例裁剪填充）、stretch（拉伸铺满）。

## 落点与复用

- `BuildCinema.tsx`：设置、预览、上传进度、保存 / 清空。图片压缩由宝箱原算法抽到 `buildImageData.ts`，宝箱仍用同一实现。B站 / 抖音复用 `chestVideo.ts`、`ChestVideoFrame.tsx` 和 `/api/build?resolveLink=`，不另建平台抓取或播放器。
- `BuildCinemaScreens.ts`：在真实屏幕表面显示 CanvasTexture，随部件缩放 / 旋转；独立图片 / 视频资源，不保存另一份世界事实状态。纹理尺寸按真实表面比例生成，自适应 / 裁剪 / 拉伸由 `cinemaTypes.ts` 的矩形计算统一处理。
- 本地 / 直接视频在地图上静音循环；离开视野或页面隐藏暂停，卸载 / 更换内容停止视频并 dispose 材质、纹理和计时器。设置窗口原生视频可手动带声播放，关闭停止其资源。
- 平台视频在地图上显示封面或播放入口，打开设置后用官方 iframe 播放；不将跨域 iframe 捕获成 WebGL 视频，也不绕过平台登录 / 内容权限。平台内部播放未用测试替身冒充真实平台验收。

## HTTP 契约与存储

- `CinemaContent = {type: 'image' | 'video', src: string, fit: 'contain' | 'cover' | 'stretch'}`，前端类型定义于 `src/cinemaTypes.ts`；服务端 `cinema-content.mjs` 再验证 HTTPS、凭据、格式、图片大小与字节头。
- `GET /api/build?cinema=<部件 id>` → `{content, version}`。世界快照只给 `cinemaVersion`，不在每次世界轮询里携带图片或媒体二进制。
- `POST /api/build`，`{action:'cinema', id, version, content}`；null 清空。检查部件类型和版本，持久化到 build-world 的 `screens` 字段。配置随移动保留；复制复制内容；拆除返回 previousCinema，使既有撤销链能恢复。
- `POST /api/build?cinemaUpload=<部件 id>`，`{uploadId, offset, total, type, bytes}`；每块最多 128 KiB（base64），视频最多 100 MiB，仅 MP4 / WebM，检查首块文件头、账号、目标部件、顺序、大小和类型。上传到 `build-world.json.media/` 的 UUID 临时文件，完成原子改名，返回 src；持久配置不保存 blob URL。
- `GET / HEAD /api/build?cinemaFile=<UUID.mp4|UUID.webm>`：仅登录用户可读，支持单段 Range、206 / 416、正确类型和 nosniff，拒绝路径穿越。断开的传输关闭文件流；未引用且超过一天的文件在下次新上传时回收，进行中的文件受保护，过期分片在下一次上传时清理。
- 所有写入继续执行既有来源校验、账号校验、120ms 限速和 240KB 请求上限；分片不要求放宽 nginx 或 Socket.IO 限制。未新增 Socket 事件或客户端输入接管。

## 验证与部署

- 全量 414 项单测通过；最终受影响的存档、撤销、影院 HTTP / Range / 上传 / 校验、显示矩形共 16 项补充回归通过。构建及 90 项公共资源检查通过。
- 本地与正式资源浏览器：漫游点击打开、图片上传和三种 fit、本地真实 MP4 纹理帧、第二客户端读取保存内容、离开视野暂停、清空、B站短链接与抖音官方播放器地址。API / Socket 与平台 iframe 内容在浏览器用例中隔离；真实平台播放取决于登录、网络与内容权限。
- 正式服务只更新 `build-store.mjs`、`build-http.mjs` 与两个新增 cinema 后端模块；与部署前服务文件比较，差异仅本轮影院功能。模块加载检查通过，`officeweb` 重启后 active，四个文件 SHA256 与本地一致，匿名影院查询返回 401。未直接修改正式场景记录或原资产。
- 网页入口 `main-Bo2MZmQk.js` / `main-BJsGnQqn.css`，资源先于入口上传；16 项文件审计一致，公网入口及资源 200 / SHA256 一致。旧服务代码和入口备份 `officeweb/backups/cinema-screen-20261012/`。
- 无客户端原生变更，刷新即可使用。所有临时测试只写隔离目录，收尾关闭自己启动的浏览器 / Vite 并移除测试目录。用户其他未提交改动保留。
