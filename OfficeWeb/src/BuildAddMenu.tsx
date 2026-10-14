import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { catalog } from './buildTypes';
import { buildThumbnails } from './buildThumbnails';
import './build-add-menu.css';

export type BuildMenuPoint={x:number;y:number};
type Props={point:BuildMenuPoint;color:string;kind:string;onChoose:(kind:string)=>void;onClose:()=>void};
const categories=[...new Set(catalog.map(item=>item.category))];

/** Category flyouts share the existing catalogue and actual mesh thumbnails. */
export function BuildAddMenu({point,color,kind,onChoose,onClose}:Props) {
  const [category,setCategory]=useState(catalog.find(p=>p.id===kind)?.category || categories[0]);
  const [search,setSearch]=useState('');
  const [thumbnails,setThumbnails]=useState<Record<string,string>>({});
  const [position,setPosition]=useState(point);
  const root=useRef<HTMLDivElement>(null);
  const close=useRef(onClose);close.current=onClose;
  const items=catalog.filter(item=>search.trim()?`${item.label} ${item.category}`.includes(search.trim()):item.category===category);
  useEffect(()=>{
    try{setThumbnails(buildThumbnails(color));}catch{ /* Text remains available if WebGL is unavailable. */ }
  },[color]);
  useLayoutEffect(()=>{
    const fit=()=>{
      const bounds=root.current?.getBoundingClientRect();if(!bounds)return;
      setPosition({x:Math.max(8,Math.min(point.x,window.innerWidth-bounds.width-8)),
        y:Math.max(8,Math.min(point.y,window.innerHeight-bounds.height-8))});
    };
    fit();window.addEventListener('resize',fit);return ()=>window.removeEventListener('resize',fit);
  },[point,category,search,thumbnails]);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    root.current?.querySelector<HTMLButtonElement>('[data-category][aria-expanded=true]')?.focus();
    const outside=(event:PointerEvent)=>{
      if(root.current?.contains(event.target as Node))return;
      // Dismissing the menu must not place/delete an object under the same click.
      event.preventDefault();event.stopImmediatePropagation();close.current();
    };
    const blur=()=>close.current();
    window.addEventListener('pointerdown',outside,true);window.addEventListener('blur',blur);
    return ()=>{
      window.removeEventListener('pointerdown',outside,true);window.removeEventListener('blur',blur);
      if(previous?.isConnected)previous.focus({preventScroll:true});
    };
  },[]);
  const focusItem=()=>root.current?.querySelector<HTMLButtonElement>('[data-item]')?.focus();
  const keyboard=(event:React.KeyboardEvent)=>{
    event.stopPropagation();
    if(event.key==='Escape'){event.preventDefault();onClose();return;}
    const target=event.target as HTMLElement;
    if(event.key==='Tab'){
      event.preventDefault();const buttons=Array.from(root.current!.querySelectorAll<HTMLElement>('input,button'));
      const index=buttons.indexOf(target),direction=event.shiftKey?-1:1;
      buttons[(index+direction+buttons.length)%buttons.length]?.focus();return;
    }
    if(target.matches('input')){
      if(event.key==='ArrowDown'){event.preventDefault();focusItem();}
      return;
    }
    if(event.key==='ArrowRight'){event.preventDefault();focusItem();return;}
    if(event.key==='ArrowLeft'){
      event.preventDefault();root.current?.querySelector<HTMLButtonElement>('[data-category][aria-expanded=true]')?.focus();return;
    }
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();const selector=target.hasAttribute('data-category')?'[data-category]':'[data-item]';
      const buttons=Array.from(root.current!.querySelectorAll<HTMLButtonElement>(selector));
      const index=buttons.indexOf(target as HTMLButtonElement);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
      buttons[next]?.focus();
    }
  };
  const image=(id:string)=>thumbnails[id]?<img src={thumbnails[id]} alt="" />:<span className="build-add-fallback" aria-hidden="true">◇</span>;
  return <div ref={root} className="build-add-menu" role="menu" aria-label="创建物体"
    style={{left:position.x,top:position.y}} onKeyDown={keyboard} onContextMenu={event=>{event.preventDefault();onClose();}}>
    <header><span>创建物体</span><kbd>Shift A</kbd><button aria-label="关闭创建菜单" onClick={onClose}>×</button></header>
    <input aria-label="搜索创建物体" placeholder="搜索物体…" value={search} onChange={event=>setSearch(event.target.value)} />
    <div className="build-add-columns">
      <div className="build-add-categories" role="menu" aria-label="创建分类">
        {categories.map(name=>{
          const members=catalog.filter(p=>p.category===name);
          return <button key={name} data-category role="menuitem" aria-haspopup="menu" aria-expanded={!search && category===name}
            onMouseEnter={()=>{setCategory(name);setSearch('');}} onFocus={()=>{setCategory(name);setSearch('');}}
            onClick={()=>{setCategory(name);setSearch('');requestAnimationFrame(focusItem);}}>
            {image(members[0].id)}<span>{name}</span><small>{members.length}</small><b aria-hidden="true">›</b>
          </button>;
        })}
      </div>
      <div className="build-add-submenu" role="menu" aria-label={search?'搜索结果':`${category}物体`}>
        {items.map(item=><button key={item.id} data-item role="menuitem" aria-label={`创建${item.label}`}
          title={`宽 × 高 × 深：${item.dimensions.join(' × ')} 米`} onClick={()=>onChoose(item.id)}>
          {image(item.id)}<span>{item.label}<small>{item.dimensions.join(' × ')} m</small></span>
        </button>)}
        {!items.length && <p className="build-add-empty">没有匹配的物体</p>}
      </div>
    </div>
  </div>;
}
