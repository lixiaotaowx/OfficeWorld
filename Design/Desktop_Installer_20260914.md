# 桌面客户端：安装包、开机自启、托盘图标

记录日期：2026-09-14（深夜）
范围：`OfficeDesktop/`（未改动 `OfficeWeb/`，也未改 `Design/Deployment.md`，避免与并行的另一个对话冲突）

## 一、这次加了什么

| 需求 | 落地 |
|---|---|
| 打包安装功能 | 新增 NSIS 安装包 target，**保留**原 portable 产物 |
| 安装界面好看 | 助手式安装流程（非一键静默）+ 自定义侧栏/页眉美术 + 应用图标 |
| 开机自启自动设置 | 由**应用自己**登记登录项，装完即生效；托盘里可关 |
| 状态栏 icon 不显示 | 重建 `icon.ico` 为多尺寸；托盘图标显式按 16px 构造 |

## 二、怎么写 / 出什么

```powershell
cd OfficeDesktop
npm run icons            # 重新生成图标与安装美术（改了主图才需要）
npm test                 # 34 项单元测试
npm run dist             # 便携版  -> iruler-dream-<版本>-Windows-x64.exe
npm run dist:installer   # 安装包  -> iruler-dream-Setup-<版本>-x64.exe
npm run dist:all         # 两个都出
```

- 产物目录：`../Build/OfficeDesktopRelease/`。
- 安装包是**按用户安装**（`perMachine: false`，装到 `%LOCALAPPDATA%\Programs\iruler dream`），**不需要管理员权限**；可选安装目录；建桌面与开始菜单快捷方式；装完可直接运行。
- 版本号沿用 `package.json` 的 `version`（本次 0.1.10，与并行会话一致，未擅自提升）。

## 三、开机自启怎么做的

关键决定：**由应用登记，不是由安装器写注册表。**

- `autostart.cjs` 是唯一的接缝，`main.cjs` 在 `app.whenReady()` 里调 `ensure()`，所以**装完第一次启动就自动带上开机自启**，不需要用户勾选。
- 注册的是 `HKCU\...\Run\com.officeworld.desktop`，命令行是 `"<app.exe>" --autostart`。
- **便携版永久跳过**：portable 每次运行都解压到新的临时目录，登记那个路径只会在临时目录被清理后留下死项。判定依据是 electron-builder 的 `PORTABLE_EXECUTABLE_DIR`。
- **`--autostart` 会静默进托盘**（不弹窗），这是主动加的：开机自启如果直接甩一个窗口到脸上很讨厌。托盘菜单里也给了「开机自动启动」勾选项，用户可自行关掉；`set()` 会回报**登记后的真实状态**而不是请求的状态。

### 证据（真机实测，不是推断）

用隔离 profile 启动打包好的 `win-unpacked\iruler dream.exe`，前后对比注册表：

```
added values: com.officeworld.desktop
  = "G:\...\win-unpacked\iruler dream.exe" --autostart
（用后已删除，注册表恢复到原样）
```

隐藏启动对比（同一 exe，两个隔离 profile）：

```
--autostart 启动 : running=True  MainWindowHandle=0         title=''
普通启动         : running=True  MainWindowHandle=72812656  title='iruler dream'
```

`MainWindowHandle=0` 即没有可见窗口 → `--autostart` 确实静默进托盘；普通启动照旧弹窗。

### 单元测试

`test/autostart.test.cjs` 4/4：已安装版默认登记且参数正确、便携版**一次都不碰登录项**、可以关掉并回报最终状态、非 Windows 与注册表被策略锁死时返回 false 而不抛异常。

## 四、托盘图标为什么不显示（以及改了什么）

**旧 `assets/icon.ico` 里只有一个 256×256 的 PNG 条目。** 通知区域是按 **16 逻辑像素**画的，只给一个 256 的帧，Windows 只能硬缩，结果就是糊成一团甚至看着像没有。窗口、任务栏、Alt-Tab 也都没有合适尺寸可用。

改法两层：

1. `tools/build-icons.ps1` 从一张方形主图重建 `icon.ico`，现在是 **16/20/24/32/40/48/64/128/256 九个尺寸**（首次运行会先把旧 ico 里的 256 帧抽成 `assets/icon-256.png` 作为主图，可复现）。
2. `tray.cjs` 不再把解码结果直接丢给 `Tray`，而是**显式构造成 16px** 再交出去（`TRAY_ICON_PX`）；`nativeImage` 为空时照旧抛错。

### 证据与**如实边界**

- `test/tray-icon-integration.cjs`（真 Electron）：`icon.ico` 可解码、托盘图恰好 16×16、`Tray` 从 Windows 拿到真实槽位（`{x:1664,y:1040,w:24,h:40}`）。
- 把 16px 帧放大 6 倍、分别贴在深色和浅色任务栏上渲染检查（`Build/tray-icon-preview.png`）：**金色标记在两种底色上都清楚可见**，所以图标内容本身不是问题。
- **必须说清楚**：`tray.getBounds()` 对「旧单尺寸 ico」和「修好后的 16px」返回了**完全相同的槽位**，也就是说这个测试**无法区分"显示"与"不显示"**。所以：
  - 「ico 缺少小尺寸」是**确凿的缺陷，已修**；
  - 但如果你之前看到的空白是**Windows 把新图标收进了溢出区**（点任务栏的 `^` 才能看到），那是系统行为，代码改不了——**需要手动把图标从 `^` 里拖到常显区域**，或者「设置 → 个性化 → 任务栏 → 其他系统托盘图标」里打开。
- 我**没有**去写 `HKCU\Control Panel\NotifyIconSettings\...\IsPromoted` 来强行置顶：那个键名是按可执行文件路径算出来的散列，属于未公开实现，写错会留下垃圾项。

### 2026-09-15 复查结论：图标是好的，是 Windows 把它藏在 `^` 里

用户反馈「还是没显示对」，于是不再推断，直接**截图看任务栏**（`test/tray-icon-capture.cjs`：起一个托盘图标，抓图标所在矩形，再抓整条任务栏 1200–1920，放大后肉眼比对）：

- 先确认**用户跑的就是带修复的版本**：从 `C:\Program Files\iruler dream\resources\app.asar` 抽出打包的 `assets/icon.ico`，**9 个尺寸（16…256）**；asar 里也有 `TRAY_ICON_PX`，即 `tray.cjs` 是修好的那版。
- 但任务栏**可见区**里只有：显示器 / 音量 / 输入法 / 一个绿色 "P" 圆标（别的应用）/ 时间日期 —— **没有我们的金色图标**，而 `^` 溢出箭头**存在**。
- 结论：**图标已创建、Windows 也分配了位置（`getBounds()` 给 x=1664），但它落在溢出区**，即 Windows 10 对**新增**托盘图标的默认行为。放大 8 倍看那个矩形、和放大 6 倍看可见区，两处都没有金色图标。
- 这一条**代码解决不了**：Win11 有 `HKCU\Control Panel\NotifyIconSettings\<hash>\IsPromoted`，但本机是 Windows 10 19045，**该键根本不存在**；可见性存在 `TrayNotify\IconStreams` 这个**二进制 blob** 里，改它属未公开格式、写坏会清掉用户整套餐盘设置。所以只给手动步骤，不动注册表。
- **一次性固定（约 5 秒）**：点任务栏 `^` → 把金色图标**拖到**任务栏上；或「设置 → 个性化 → 任务栏 → 选择哪些图标显示在任务栏上」→ 打开 **iruler dream**。
- ⚠️ **换路径就得重来**：可见性按**可执行文件路径**记。当前装在 `C:\Program Files\iruler dream`（用户在安装界面自己选的目录）；本项目 NSIS 默认是**按用户安装**（`perMachine: false`），默认目录 `%LOCALAPPDATA%\Programs\iruler dream`。**换目录重装 = 新身份 = 又藏进 `^`**。
- 顺带确认 DPI：本机 `scaleFactor = 1`（1920×1080、100%），托盘就该是 16px，所以 `tray.cjs` 显式构造 16px 是**正确**的，不会糊。

## 五、安装界面美术

`tools/build-icons.ps1` 同时产出（配色取自桌面外壳：`#222824` 标题栏、`#f6f2e8` 文字、`#f0d274` 金字）：

- `assets/installerSidebar.bmp` 164×314 —— 助手式安装左侧竖版：品牌渐变底、应用图标、金色横线、`iruler dream` 与 `A SPACE FOR PEOPLE.`
- `assets/installerHeader.bmp` 150×57 —— 内页页眉：图标 + 产品名

两者都是 NSIS 要求的 24 位 BMP。`package.json` 里通过 `nsis.installerSidebar/installerHeader/installerIcon/uninstallerIcon/installerHeaderIcon` 引用。

## 六、没做 / 未验收

- **没有在本机真正安装一遍**：这台机器上用户的客户端正在运行（portable 临时目录实例），安装会产生快捷方式和登录项，不适合擅自做。安装包本体只验到「是合法 PE/NSIS、96.5 MB、构建无错误」。
- **安装界面的实际观感**要你运行安装包亲眼看（美术是生成的，我没有截图佐证它在 NSIS 页面里的最终排布）。
- `--autostart` 静默进托盘**已验证**（见上）；但「开机后真的自动起来」需要重启机器才算完整验收。
- 托盘图标在你自己任务栏上的最终效果，仍建议按第四节手动确认是否被收进溢出区。

## 七、改动的文件

新增：`autostart.cjs`、`tools/build-icons.ps1`、`test/autostart.test.cjs`、`test/tray-icon-integration.cjs`、`assets/icon-256.png`、`assets/installerSidebar.bmp`、`assets/installerHeader.bmp`
修改：`main.cjs`、`tray.cjs`、`package.json`、`test/tray-integration.cjs`（菜单项改为**按标签查找**，因为菜单多了一行，写死下标会点错行）
重建：`assets/icon.ico`

## 八、任务栏按钮图标 = 默认 Electron 图标（2026-09-15，**未解决，如实记录**）

用户澄清：「状态栏」指的是 **Windows 任务栏上的应用按钮**（不是托盘），表现是**显示成默认/占位图标**。

### 已证明的部分

- **症状是真的，而且复现了**。用实时 GDI 截图（`CopyFromScreen`，不是 `desktopCapturer`——后者会返回缓存的旧帧，我一开始就被它骗过一次）拍下任务栏按钮，放大 8 倍看：**深蓝圆底 + 白色 "e" 和轨道 = Electron 默认图标**。
- 该 exe **自己的图标是正确的**：从 `win-unpacked\iruler dream.exe` 和 `C:\Program Files\iruler dream\iruler dream.exe` 里各抽出内嵌图标，金色占比都是 **77.1%**；`electron.exe` 是 **0% 金 / 85.1% 深蓝**。所以任务栏**没有**在用 exe 的内嵌图标。
- `nativeImage.createFromPath('<app.asar>/assets/icon.ico')` **能正常加载**（256×256，非空），所以 `applyWindowIcon` 不会抛错、`setIcon` 拿到的是有效图像。
- Start Menu 快捷方式存在，AUMID = `com.officeworld.desktop`，与代码里 `setAppUserModelId` **一致**；其 `IconLocation` 是 `,0`（继承目标 exe）。

### 已排除的原因（都做过对照实验，不是猜）

| 假设 | 实验 | 结果 |
|---|---|---|
| `setAppDetails` 的 `appIconPath` 给了 `.ico` 而不是 PE 图标资源 | 改成传 exe 路径 | **无效**，按钮仍是 Electron 图标 |
| AUMID 关联被 Windows 缓存/过期 | 把 AUMID 改成 `...v2` 重新打包再拍 | **无效** |
| `transparent: true` 的无边框窗口导致 WM_SETICON 被忽略 | 改成 `transparent: false` 重新打包再拍 | **无效** |
| app.asar 里的图标路径读不到 | 直接探测该路径 | **能读到**，不是原因 |
| 换一个全新的 exe 路径能绕过图标缓存 | 复制整个 `win-unpacked` 到新目录再跑 | 这个反例**推翻了我对"哪个按钮是我们的"的判断** |

### 卡在哪

最后那个反例很关键：换到全新路径后，任务栏**只有托盘区域发生变化**（1646–1683），**整条任务栏 x 0..1919 都没有出现新的按钮区域**。也就是说我前面认定的「我们那个按钮」（x 492..539）很可能根本不是我们的按钮，而我**没有一个可靠办法在截图里认领自己的按钮**。在这个前提下继续推断只会继续错。

### 没有做的事

- **没有清 Windows 图标缓存**（`%LOCALAPPDATA%\IconCache.db`、`Microsoft\Windows\Explorer\iconcache*.db` + 重启 explorer）。这是目前剩下的主要嫌疑，但它会**让用户的桌面/任务栏闪一下重建**，而这台机器上用户正在用、另一个对话也在跑，所以我没有擅自做。
- 没有改注册表、没有动用户正在运行的实例（全程隔离 profile，用后即删；实测用户的 8 个进程始终原样在跑）。

### 下一步建议（择一）

1. **允许我清一次图标缓存**（约 10 秒，explorer 会自动重建）——最可能一击解决，代价是任务栏短暂消失重建。
2. 在**另一台机器**上装同一个包看按钮图标：如果那台正常，就说明是本机缓存/环境问题，而不是代码问题。
3. 如果两边都不对，我再从「无边框窗口 + 自定义 chrome」这条线继续挖（那会影响圆角方案的取舍，需要你先定优先级）。

### 本节结束时仓库的状态

临时的实验改动**全部已回滚**（AUMID 回 `com.officeworld.desktop`、`transparent: true` 恢复、`window-icon.cjs` 恢复原样），一次性探针脚本已删除；只保留 `test/tray-icon-integration.cjs`、`test/tray-icon-capture.cjs`、`tools/build-icons.ps1`。桌面测试 34/34，`node --check` 通过。

### 2026-09-15 清图标缓存的结果：没有变化，并且**撤回一条结论**

用户批准后清了一次图标缓存：`%LOCALAPPDATA%\IconCache.db` 删除成功，`iconcache*.db` 从 **15 个降到 2 个**，explorer 重启完毕（`explorer` 进程 1 个）。

- **前后对比没有任何变化**：整条任务栏按列统计"金色像素"的分布，清理前是 `113..133 / 308..331 / 557..574`，清理后**逐字节相同**。所以图标缓存**不是**原因。
- **必须撤回**：我上一节说"已经证明按钮显示的是 Electron 默认图标"——**这个结论不成立，我撤回**。我裁的那个"我们的按钮"（x 492..539）放大后其实是 **VS Code**（蓝色 `><`），后来又裁到一个 **微信**。我的坐标推断从一开始就是错的，所以那张"Electron 图标"的截图**根本不是我们的按钮**。
- 因此目前**没有**任何截图证据能说明你的按钮显示成什么。你的观察（显示成默认/占位图标）仍然成立，但我**无法从截图侧证实或复现**，之前那些"已排除的原因"也都是在一个错误的观察对象上做的，结论同样不可靠。
- 仍然确凿的只有这些：exe 内嵌图标是我们的（金 77.1%，`electron.exe` 深蓝 85.1%）；`app.asar` 里的 ico 能正常加载（256×256）；快捷方式存在且 AUMID 与代码一致；进程里有一个**可见窗口**且 `TOOLWINDOW=False`（即**有资格**出现在任务栏上）。
- **卡点**：这台机器上 UIAutomation **不暴露**任务栏的各个应用按钮（`运行中的应用程序` 只是一个 x=48..1664 的 Pane，里面没有可枚举的按钮元素），所以我**没有办法在截图里认领自己的按钮**。在这个前提下继续改代码就是瞎猜，所以我停在这里。
