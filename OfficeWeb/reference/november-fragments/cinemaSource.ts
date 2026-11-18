export function knownCinemaSource(value:string):CinemaKind|null {\
  if(/^\/api\/build\?cinemaFile=/.test(value) || chestVideo(value))return 'video';\
  if(/^\/api\/build\?cinemaFile=/.test(value) || (value.startsWith('https:') && chestVideo(value)))return 'video';\
}\
export function cinemaInput(value:string){\
  const text=value.trim();\
  return (text.match(/https:\/\/[^\s<>"'，。]+/)?.[0] || text).replace(/[）)\]】]+$/,'');\
}\
  if(url.protocol!=='https:' || url.username || url.password)throw Error('请使用 HTTPS 图片或视频链接');\
  const controller=new AbortController(),combined=AbortSignal.any([signal,controller.signal]);\
      if(finished)return;finished=true;clearTimeout(timer);signal.removeEventListener('abort',cancel);\
      if(finished)return;finished=true;clearTimeout(timer);combined.removeEventListener('abort',cancel);\
    signal.addEventListener('abort',cancel,{once:true});\
    combined.addEventListener('abort',cancel,{once:true});\
    if(signal.aborted)cancel();else media.src=url.href;\
    if(combined.aborted)cancel();else media.src=url.href;\
  const result=await Promise.any([probe('image').then(ok=>ok?'image':Promise.reject()),\
    probe('video').then(ok=>ok?'video':Promise.reject())]);\
  signal.throwIfAborted();return result as CinemaKind;\
  try{\
    const result=await Promise.any([probe('image').then(ok=>ok?'image':Promise.reject()),\
      probe('video').then(ok=>ok?'video':Promise.reject())]);\
    signal.throwIfAborted();return result as CinemaKind;\
  }finally{controller.abort();}\
