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
    };
  }
}
