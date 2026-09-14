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
      displays(): Promise<DesktopDisplay[]>;
      selectDisplay(id: string): Promise<boolean>;
      previewFrame(): Promise<string>;
      saveLogin(value: { name: string; password: string }): Promise<boolean>;
      readLogin(): Promise<{ name: string; password: string } | null>;
      clearLogin(): Promise<boolean>;
    };
  }
}
