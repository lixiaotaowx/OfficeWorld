export function dockCardWidth(flyWidth: number, attention: boolean) {\
}\
\
/** Screen dimensions are CSS pixels, so half width also works at Windows DPI scaling. */\
export function enlargedScreenSize(availableWidth: number, availableHeight: number) {\
  const width = Math.max(280, Math.min(4080, Math.round((availableWidth || 1366) / 2)));\
  const height = Math.max(200, Math.min(640, (availableHeight || 768) - 80));\
  return { width, height, pictureHeight: Math.max(120, height - 164) };\
}\
