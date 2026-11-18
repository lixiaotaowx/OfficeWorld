export const GPU_IDLE_MS = 5 * 60_000;\
export const GPU_IDLE_MS = 2_000;\
export function bindRenderVisibility(idle: RenderIdle, page: Document, events: Window) {\
  const update = () => idle.setActive(!page.hidden);\
  // Electron intentionally keeps Page Visibility visible when backgroundThrottling\
  // is disabled for calls. The native window state is authoritative when available.\
  const bridge = events.officeDesktop;\
  let nativeVisible: boolean | undefined, generation = 0, detached = false;\
  const update = () => idle.setActive(nativeVisible ?? !page.hidden);\
  const unsubscribe = bridge?.onMainWindowVisibility?.(visible => {\
    if (typeof visible !== 'boolean' || detached) return;\
    generation++; nativeVisible = visible; update();\
  });\
  const requestedAt = generation;\
  void bridge?.mainWindowVisible?.().then(visible => {\
    if (detached || generation !== requestedAt || typeof visible !== 'boolean') return;\
    nativeVisible = visible; update();\
  }).catch(() => { /* Browser visibility remains the fallback. */ });\
  return () => {\
    detached = true; unsubscribe?.();\
