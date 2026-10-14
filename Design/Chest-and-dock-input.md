# 2026-10-10 宝箱广播提示与任务栏人物鼠标穿透

本地项目：`G:\C\wendang\ChatGPT\youxi`。

## 宝箱

- 复用现有 `chestPeople.creator/readers`；不增加服务器事件或存档字段。
- 登录者看别人创建且尚未读过的宝箱时，自动显示本色箭头，持续向下轻移、呼吸发光。
- 创建者不显示；每人已读独立。打开宝箱沿既有 read 请求标记，世界轮询更新后移除自己的箭头。
- 箭头是本机装饰，不作为建造部件保存、不吃拾取、不改变宝箱碰撞/包围盒。
- 普通 flow-arrow 也改为弱本色光：本体发光峰值 .16，光晕透明度峰值 .08；没有掺白。

## 鼠标

- 单靠 CSS pointer-events 无法穿透原生透明窗口。
- `dockHitRegions` 上报头像条、悬停卡片和真实控件区域，排除招手/观看人物与来电文字。
- `dock-pointer.cjs` 使用 Electron screen 指针坐标，每 16ms 判断区域并仅在变化时切换
  setIgnoreMouseEvents；不依赖曾实测失效的 forwarded mousemove，不安装鼠标钩子。
- IPC 限制最多 80 个有限数值矩形；窗口销毁时释放轮询。
- 此修复需新的桌面主进程与新的网页同时生效；网页更新无法替换旧客户端的主进程。

## 验证与边界

- `npm run build` 通过，public parity 90 项通过。
- 新增宝箱领域/装饰回归 2 项、鼠标区域回归 2 项通过。
- `node test/browser/chest-dock-pointer.cjs` 通过真实浏览器：文字不占点击区、接听可用、
  peek 只保留头像条；两位用户独立已读、箭头向下、销毁移除。
- `node test/browser/arrow-glow.cjs` 通过实际像素检测：箭头中心亮度 166.5→189.7→166.5。
- Electron `test/native/dock-pointer.cjs` 在隐藏测试窗口读取真实 Windows 样式：装饰区
  WS_EX_TRANSPARENT，进入按钮/头像区域后取消穿透，离开恢复，通过；未移动系统鼠标。
- 真正在用的桌面窗口手动点穿底层应用、跨显示器/DPI、文件拖放体验尚需现场验收。
- 检查期间另一组会议相关改动持续写入同一工作区，保留其改动；最终全量网页
  395 项、桌面 159 项测试均通过。超限的 dock-rules 测试按来电文案职责拆分，保留断言。
- 未部署网站、未发布安装包；仍为本地改动。
- 原 `Design/TODO.md` 已 833 行；不继续追加，将本轮边界单独记录在这里。
