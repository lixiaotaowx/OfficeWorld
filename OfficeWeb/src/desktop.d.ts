export interface DesktopDisplay {
  id: string;
  name: string;
  width?: number;
  height?: number;
  selected: boolean;
}

/** One progress report from the desktop download; `percent` is null when unknown. */
export interface UpdateProgress {
  phase?: string;
  received?: number;
  total?: number;
  percent?: number | null;
}

/** 头像条的点击：看对方屏幕 / 把我的屏幕给他 / 语音通话。 */
export interface DockCommand {
  kind: 'watch' | 'share' | 'call';
  personId: string;
}

/** 尺子角色的外观（配色 + 四个槽位），与 src/look.ts 的 Appearance 同形。 */
export interface LookAppearance {
  color: string;
  accessories: { glasses: string; hair: string; beard: string; hat: string };
}

declare global {
  interface Window {
    officeDesktop?: {
      focusWindow?(): Promise<boolean>;
      /** Native alert raised by the desktop main process; an urgent one raises the window. */
      alert?(payload: { title: string; body?: string; section?: string; urgent?: boolean }): Promise<boolean>;
      /** Reports a native toast click, which never reaches this renderer on its own. */
      onAlertOpen?(callback: (section: string) => void): () => void;
      displays(): Promise<DesktopDisplay[]>;
      selectDisplay(id: string): Promise<boolean>;
      previewFrame(): Promise<string | null>;
      /** false releases the capture stream while nobody can receive the preview. */
      setPreviewActive?(active: boolean): Promise<boolean>;
      /**
       * 采集是不是因为"人不在电脑前"被暂停了。暂停时 Chromium 的 DISPLAY 常亮请求
       * 会被释放，显示器才能按电源计划熄灭（用户 2026-09-17：离开就暂停采集）。
       */
      previewState?(): Promise<{ paused?: boolean; idleSeconds?: number; awayAfter?: number; attached?: boolean } | null>;
      /**
       * 有人来看我了：所有屏幕四周亮起一圈绿光（用户 2026-09-18）。
       * 自己在共享屏幕时传 `sharing: true`——那一圈光会被一起共享出去，所以不亮。
       * `fade` 是"亮起来用多久"：鼠标停一下是慢慢亮（2 秒），打电话过来是立刻亮
       * （用户 2026-09-20）。
       */
      previewGlow?(payload?: { sharing?: boolean; on?: boolean; fade?: number }): Promise<boolean>;
      /**
       * 有人来看我了：让任务栏头像条把**那个人的角色**拉出来（用户 2026-09-18）。
       * `mode: 'call'` 是有人打电话过来——人物照现在这么大、演一段招手；`'peek'` 只是鼠标
       * 停在头像上——小一倍、不演动作（用户 2026-09-20）。打电话过来时还要带上那一通邀请
       * （`requestId` / `kind` / `offer`）：头像条要写清是谁、怎么打过来的，并直接给接听按钮
       * （用户 2026-09-21）。
       */
      dockGreet?(payload: { id?: string; name?: string; appearance?: LookAppearance;
        mode?: 'peek' | 'call'; requestId?: string; kind?: 'screen' | 'voice';
        offer?: boolean }): Promise<boolean>;
      /**
       * Seconds since the last mouse/keyboard input **anywhere in Windows**, plus
       * 'active' | 'idle' | 'locked'. Lets the page keep somebody green while they
       * work in another program, which a web page cannot see by itself.
       */
      systemIdle?(): Promise<{ seconds?: number; state?: string } | null>;
      /** Installed client version, so the page can tell whether a newer one exists. */
      appVersion?(): Promise<string>;
      /** Download the published installer; progress arrives on `onUpdateProgress`. */
      downloadUpdate?(url: string, sha256?: string):
        Promise<{ ok: boolean; file: string; size: number; sha256: string }>;
      /** Run the downloaded installer; the app quits so it can overwrite itself. */
      installUpdate?(file: string): Promise<{ ok: boolean; file: string }>;
      /** Show the finished installer in Explorer. */
      revealUpdate?(file: string): Promise<{ ok: boolean; file: string }>;
      onUpdateProgress?(callback: (payload: UpdateProgress) => void): () => void;
      saveLogin(value: { name: string; password: string }): Promise<boolean>;
      readLogin(): Promise<{ name: string; password: string } | null>;
      clearLogin(): Promise<boolean>;
      /** Whole-screen mode; the DOM Fullscreen API does nothing in this window. */
      setFullscreen?(value: boolean): Promise<boolean>;
      onFullscreenChange?(callback: (value: boolean) => void): () => void;
      /** Layer that draws other people's annotations over the shared display. */
      annotations?: {
        attach(): Promise<{ ok: boolean; reason?: string }>;
        detach(): Promise<{ ok: boolean }>;
        draw(message: unknown): Promise<boolean>;
        clear(): Promise<boolean>;
      };
      /** 任务栏头像条：把在线状态推给主进程（由它转发给那个小窗）。 */
      dockState?(payload: unknown): Promise<boolean>;
      /** 把某个人的最近一帧交给头像条。 */
      dockPreview?(payload: { id: string; image: string }): Promise<boolean>;
      /** 头像条上点了按钮（看屏幕 / 分享我的 / 语音）。 */
      onDockCommand?(callback: (payload: DockCommand) => void): () => void;
      /** 头像条上按了「接听 / 拒绝」某一通邀请（用户 2026-09-21）。 */
      onDockAnswer?(callback: (payload: { requestId: string; accept: boolean }) => void): () => void;
      /** 头像条悬停某个人，想马上要一帧。 */
      onDockPreviewWant?(callback: (personId: string) => void): () => void;
      /**
       * 文件直传（用户 2026-09-22）：拖到任务栏头像上就发，不需要对方同意，直接落进
       * **接收方自己设置好的接收文件夹**。文件系统全在主进程，页面只拿句柄。
       *
       * 整个 `files` 在老客户端上**不存在**（`officeDesktop.files` 为 undefined），
       * 但只要它存在，下面的方法就都在——所以里面不再逐个标可选，免得每次调用都要判空。
       */
      files?: {
        /** 我这台机器的接收文件夹（`custom` 说明是不是用户自己选的）。 */
        settings(): Promise<{ receiveDir: string; defaultDir?: string; custom?: boolean }>;
        /** 让用户用原生目录选择器挑一个接收文件夹。 */
        chooseFolder(): Promise<{ receiveDir: string; defaultDir?: string; custom?: boolean }>;
        openFolder(folder?: string): Promise<boolean>;
        sendOpen(path: string): Promise<{ id: string; name: string; size: number; path: string }>;
        sendRead(id: string, offset: number, length: number): Promise<Uint8Array>;
        sendClose(id: string): Promise<boolean>;
        receiveOpen(input: { transferId: string; name: string; size: number }):
          Promise<{ ok: boolean; savedName?: string; folder?: string; error?: string }>;
        receiveWrite(id: string, bytes: Uint8Array): Promise<{ ok: boolean; written?: number; error?: string }>;
        receiveEnd(id: string):
          Promise<{ ok: boolean; path?: string; savedName?: string; folder?: string; error?: string }>;
        receiveCancel(id: string): Promise<boolean>;
        /** 系统级进度条：0..1，-1 清掉，>1 表示不确定。 */
        progress(value: number): Promise<boolean>;
        open(path: string): Promise<boolean>;
        reveal(path: string): Promise<boolean>;
        /** 有人把文件拖到了小窗的某个头像上（主进程把路径转过来）。 */
        onDropped(callback: (payload: { personId: string; paths: string[] }) => void): () => void;
      };
    };
    /**
     * 头像条那个小窗自己的桥。它只有显示与遥控能力：没有 socket、没有媒体、
     * 没有文件系统（见 OfficeDesktop/desktop-dock-preload.cjs）。
     */
    officeDock?: {
      state?(): Promise<unknown>;
      onState?(callback: (state: unknown) => void): () => void;
      requestPreview?(personId: string): Promise<boolean>;
      onPreview?(callback: (payload: { id: string; image: string }) => void): () => void;
      action?(kind: DockCommand['kind'], personId: string): Promise<boolean>;
      /** 接听 / 拒绝某一通来电（用户 2026-09-21）。老客户端没有这个方法，按钮就不显示。 */
      answer?(requestId: string, accept: boolean): Promise<boolean>;
      drag?(dx: number, dy: number): Promise<unknown>;
      /**
       * 报版面：悬停卡片开没开、舞台亮没亮、舞台要多高、头像条实际多宽。
       * `stageMode` 是哪种舞台：`peek` 只留一半地方，`call` 是"站在状态栏上很大"
       * （用户 2026-09-20）；`stagePx` 是页面算出来的舞台高度（来电气泡会让它更高，
       * 用户 2026-09-21）。
       */
      layout?(input: { expanded: boolean; stage?: boolean; stageMode?: 'peek' | 'call' | '';
        stagePx?: number; width: number }): Promise<unknown>;
      /** 有人在看我的头像 / 有人打电话过来：把那个人的角色拉出来（主窗口 → 主进程 → 这里）。 */
      onGreet?(callback: (payload: { id: string; name?: string; appearance?: LookAppearance;
        mode?: 'peek' | 'call'; requestId?: string; kind?: 'screen' | 'voice';
        offer?: boolean }) => void): () => void;
      onVisibility?(callback: (payload: { visible: boolean; reason?: string }) => void): () => void;
      /**
       * 把文件拖到某个头像上（用户 2026-09-22）。小窗**只交路径**：`File.path` 在
       * Electron ≥32 已经没有了，只有 `webUtils.getPathForFile` 拿得到真路径。
       */
      filePaths?(files: FileList | File[]): string[];
      dropFiles?(personId: string, paths: string[]): Promise<boolean>;
    };
  }
}
