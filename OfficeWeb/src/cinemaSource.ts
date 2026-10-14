import {chestVideo} from './chestVideo';
export type CinemaKind='image'|'video';
export function knownCinemaSource(value:string):CinemaKind|null {
  if(/^data:image\//.test(value))return 'image';
  if(/^\/api\/build\?cinemaFile=/.test(value) || (value.startsWith('https:') && chestVideo(value)))return 'video';
  return null;
}
export function cinemaInput(value:string){
  const text=value.trim();
  return (text.match(/https:\/\/[^\s<>"'，。]+/)?.[0] || text).replace(/[）)\]】]+$/,'');
}
export function cinemaSourceName(value:string,kind:CinemaKind|null) {
  if(!kind)return '';
  const platform=kind==='video'?chestVideo(value)?.platform:undefined;
  return platform?`${platform}视频`:kind==='image'?'图片':kind==='video'?'视频':'';
}
/** Probe the actual resource, including extensionless/signed image and video URLs. */
export async function detectCinemaSource(value:string,signal:AbortSignal):Promise<CinemaKind> {
  const known=knownCinemaSource(value);if(known)return known;
  let url:URL;try{url=new URL(value);}catch{throw Error('请粘贴完整的内容链接');}
  if(url.protocol!=='https:' || url.username || url.password)throw Error('请使用 HTTPS 图片或视频链接');
  const controller=new AbortController(),combined=AbortSignal.any([signal,controller.signal]);
  const probe=(kind:CinemaKind)=>new Promise<boolean>(resolve=>{
    const media=kind==='image'?new Image():document.createElement('video');
    let finished=false;
    const finish=(success:boolean)=>{
      if(finished)return;finished=true;clearTimeout(timer);combined.removeEventListener('abort',cancel);
      media.onload=null;media.onerror=null;
      if(media instanceof HTMLVideoElement){media.onloadedmetadata=null;media.pause();media.removeAttribute('src');media.load();}
      else media.src='';
      resolve(success);
    };
    const cancel=()=>finish(false),timer=setTimeout(cancel,7000);
    combined.addEventListener('abort',cancel,{once:true});
    media.onerror=cancel;
    if(media instanceof HTMLVideoElement){media.preload='metadata';media.onloadedmetadata=()=>finish(true);}
    else media.onload=()=>finish(true);
    if(combined.aborted)cancel();else media.src=url.href;
  });
  // Race only successful decodes: a failed image probe must not win over video.
  try{
    const result=await Promise.any([probe('image').then(ok=>ok?'image':Promise.reject()),
      probe('video').then(ok=>ok?'video':Promise.reject())]);
    signal.throwIfAborted();return result as CinemaKind;
  }finally{controller.abort();}
}
