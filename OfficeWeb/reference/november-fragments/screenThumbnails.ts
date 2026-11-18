export const THUMBNAIL_MAX_EDGE = 300;\
import { showSharedScreen, hideSharedScreen } from './screenShareIndicator';\
\
export const THUMBNAIL_MAX_EDGE = 300;\
  const context = canvas.getContext("2d");\
  if (options.publicPreview) showSharedScreen(options.stream.getVideoTracks()[0]);\
    stop() { clearInterval(timer); video.srcObject = null; },\
    stop() {\
      clearInterval(timer);\
      if (options.publicPreview) {\
        const stream = video.srcObject as MediaStream | null;\
        stream?.getVideoTracks().forEach(hideSharedScreen);\
      }\
      video.srcObject = null;\
    },\
