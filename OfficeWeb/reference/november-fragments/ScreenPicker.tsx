export function ScreenPicker() {\
export function ScreenPicker({ bridge = window.officeDesktop, onSelected }: {\
  bridge?: { displays?: () => Promise<DesktopDisplay[]>; selectDisplay?: (id: string) => Promise<boolean> };\
  onSelected?: () => void;\
} = {}) {\
    void window.officeDesktop!.displays().then(rows => {\
    if (!bridge?.displays) { setLoading(false); setError('请更新客户端以使用小窗切换屏幕'); return; }\
    void bridge.displays().then(rows => {\
  }, [revision]);\
  }, [revision, bridge]);\
      await window.officeDesktop!.selectDisplay(id);\
      if (!bridge?.selectDisplay || await bridge.selectDisplay(id) === false) throw Error('Display selection failed');\
      window.dispatchEvent(new Event('office-display-changed'));\
      onSelected?.();\
