import {useEffect,useState} from 'react';
import {detectCinemaSource,knownCinemaSource,type CinemaKind} from './cinemaSource';
export function useCinemaSource(src:string){
  const [result,setResult]=useState<{src:string;kind:CinemaKind|null;error:string}>({src:'',kind:null,error:''});
  const known=knownCinemaSource(src);
  useEffect(()=>{
    if(!src || known)return;
    const controller=new AbortController();
    const timer=setTimeout(()=>{void detectCinemaSource(src,controller.signal)
      .then(kind=>{if(!controller.signal.aborted)setResult({src,kind,error:''});})
      .catch(()=>{if(!controller.signal.aborted)setResult({src,kind:null,error:'暂时无法识别此链接，请检查地址或选择本地文件'});});},400);
    return()=>{clearTimeout(timer);controller.abort();};
  },[src,known]);
  const kind=known || (result.src===src?result.kind:null);
  const error=!known && result.src===src?result.error:'';
  return {kind,error,detecting:Boolean(src && !kind && !error)};
}
