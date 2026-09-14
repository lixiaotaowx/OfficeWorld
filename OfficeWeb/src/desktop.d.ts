export interface DesktopDisplay {
  id: string;
  name: string;
  width?: number;
  height?: number;
  selected: boolean;
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
      previewFrame(): Promise<string>;
      /** false releases the capture stream while nobody can receive the preview. */
      setPreviewActive?(active: boolean): Promise<boolean>;
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
