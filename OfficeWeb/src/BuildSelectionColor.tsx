import { useEffect, useRef, useState } from 'react';
import { palette } from './buildTypes';
import { buildColor } from './buildColors';
import type { BuildColorTarget } from './buildColorTarget';
import './build-selection-color.css';

export function BuildSelectionColor({read,onChange}:{read:()=>BuildColorTarget|undefined;onChange:(color:string)=>void}) {
  const [target,setTarget]=useState<BuildColorTarget>();
  const [open,setOpen]=useState(false);
  const latest=useRef(read);latest.current=read;
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let frame=0,last=0;
    const update=(time:number)=>{
      if(time-last>=50){
        last=time;const next=latest.current();
        setTarget(old=>old?.id===next?.id && old?.color===next?.color && old?.busy===next?.busy
          && Math.abs((old?.x ?? 0)-(next?.x ?? 0))<.5 && Math.abs((old?.y ?? 0)-(next?.y ?? 0))<.5 ? old : next);
      }
      frame=requestAnimationFrame(update);
    };
    frame=requestAnimationFrame(update);return ()=>cancelAnimationFrame(frame);
  },[]);
  useEffect(()=>setOpen(false),[target?.id]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
    window.addEventListener('pointerdown',outside,true);
    return ()=>window.removeEventListener('pointerdown',outside,true);
  },[open]);
  if(!target || target.busy)return null;
  const x=Math.max(8,Math.min(window.innerWidth-164,target.x+48));
  const y=Math.max(8,Math.min(window.innerHeight-128,target.y-80));
  return <div ref={root} className="build-selection-color" data-open={open} style={{left:x,top:y}}
    onKeyDown={event=>{if(event.key==='Escape' && open){event.preventDefault();event.stopPropagation();setOpen(false);}}}>
    <span>更改颜色</span>
    <button className="build-color-current" aria-label="更改颜色" aria-expanded={open} disabled={target.busy}
      style={{background:buildColor(target.color)}} onClick={()=>setOpen(!open)} />
    {open && <div className="build-color-choices" role="group" aria-label="选择物体颜色">
      {palette.map((color,i)=><button key={color} aria-label={`改为${['奶油','陶粉','雾蓝','鼠尾草','淡紫','原木','岩灰'][i]}`}
        aria-pressed={color===target.color} disabled={target.busy} style={{background:buildColor(color)}}
        onClick={()=>{onChange(color);setOpen(false);}} />)}
    </div>}
  </div>;
}
