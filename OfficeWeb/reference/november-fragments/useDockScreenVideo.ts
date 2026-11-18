export function useDockScreenVideo(screen: DockScreen) {\
export function useDockScreenVideo(screen: DockScreen, enabled = true) {\
  useEffect(() => {\
    if (!enabled) { setStatus(''); return; }\
  }, [screen.id, screen.streamId, retry]);\
  }, [screen.id, screen.streamId, retry, enabled]);\
