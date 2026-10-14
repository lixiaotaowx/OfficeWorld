export type CinemaFit = 'contain' | 'cover' | 'stretch';
export type CinemaContent = {type:'image'|'video';src:string;fit:CinemaFit};
export type CinemaSnapshot = {content:CinemaContent|null;version:number};

/** Source crop and destination box for proportional fit, crop-fill or stretch. */
export function cinemaRect(sw:number,sh:number,w:number,h:number,fit:CinemaFit) {
  if(fit==='stretch')return [0,0,sw,sh,0,0,w,h];
  const factor=fit==='cover'?Math.max(w/sw,h/sh):Math.min(w/sw,h/sh);
  const dw=sw*factor,dh=sh*factor;
  if(fit==='cover')return [(dw-w)/2/factor,(dh-h)/2/factor,w/factor,h/factor,0,0,w,h];
  return [0,0,sw,sh,(w-dw)/2,(h-dh)/2,dw,dh];
}
