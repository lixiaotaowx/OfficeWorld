import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { BuildInteraction } from './buildInteraction';
import { BuildStatus } from './BuildStatus';
import { BuildSelectionColor } from './BuildSelectionColor';
import { BuildChest } from './BuildChest';
import { BuildCinema } from './BuildCinema';
import { BuildAddMenu, type BuildMenuPoint } from './BuildAddMenu';
import { buildSound } from './buildAudio';
import { useBuildWorld } from './useBuildWorld';
import { nextAnchor, type BuildSettings } from './buildTypes';
import './build.css';

export function useBuildEditor(accountId: string) {
  const store = useBuildWorld();
  const [settings, setSettings] = useState<BuildSettings>({ mode: 'explore', kind: 'block', color: '#f3dfc5', rotation: 0, height: 0 });
  const sound = true;
  const [chest, setChest] = useState('');
  const [hint, setHint] = useState('');
  const [addMenu,setAddMenu]=useState<BuildMenuPoint>();
  const pointer=useRef<BuildMenuPoint>();
  const placementReturn=useRef<'explore'|'move'>('explore');
  const interaction = useRef<BuildInteraction>();
  const latest = useRef({ store, settings, sound, chest, addMenu });
  latest.current = { store, settings, sound, chest, addMenu };
  useEffect(() => { interaction.current?.sync(store.world.parts); }, [store.world.parts]);
  useEffect(() => { interaction.current?.refresh(); }, [settings]);
  const change = (next: BuildSettings) => {
    if (next.rotation !== latest.current.settings.rotation || next.pitch !== latest.current.settings.pitch || next.roll !== latest.current.settings.roll) buildSound('rotate',latest.current.sound);
    setSettings(next);
  };
  const openAddMenu=(point?:BuildMenuPoint)=>{
    if(!latest.current.store.ready){setHint('空间尚未连接，请稍后再创建物体');return;}
    interaction.current?.cancelTransform();
    if(latest.current.settings.mode!=='place')placementReturn.current=latest.current.settings.mode==='move'?'move':'explore';
    setAddMenu(point || pointer.current || {x:window.innerWidth/2,y:window.innerHeight/3});
  };
  useEffect(() => {
    const trackPointer=(event:PointerEvent)=>{pointer.current={x:event.clientX,y:event.clientY};};
    const keyboard = (event: KeyboardEvent) => {
      if (document.querySelector('.chest-video-backdrop')) return;
      if ((event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')) return;
      if (event.key==='Escape' && latest.current.chest){setChest('');return;}
      if (latest.current.chest || document.querySelector('[role="dialog"]')) return;
      const key=event.key.toLowerCase();
      if(key==='a' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey){
        event.preventDefault();event.stopImmediatePropagation();
        if(!event.repeat && !latest.current.addMenu)openAddMenu();
        return;
      }
      if(latest.current.addMenu)return;
      if(event.key==='Escape' && (event.target as HTMLElement)?.closest('.build-selection-color[data-open=true]'))return;
      if(event.key==='Tab' && !event.ctrlKey && !event.metaKey && !event.altKey){
        event.preventDefault();event.stopImmediatePropagation();
        if(event.repeat)return;
        interaction.current?.cancelTransform();
        interaction.current?.cancelMove();
        const mode=latest.current.settings.mode==='move'?'explore':'move';
        change({...latest.current.settings,mode});
        setHint(mode==='move'?'移动模式 · 点击选中物体 · Tab 返回漫游':'漫游模式 · Tab 进入移动');
        return;
      }
      if((event.ctrlKey || event.metaKey) && ['z','y'].includes(key) && latest.current.settings.mode!=='explore') {
        event.preventDefault();event.stopImmediatePropagation();
        interaction.current?.cancelTransform();
        void (key==='y' || event.shiftKey ? latest.current.store.redo() : latest.current.store.undo());
        return;
      }
      if(!event.ctrlKey && !event.metaKey && (!event.altKey || key==='a') && latest.current.settings.mode==='move'
        && interaction.current?.shortcut(event)){
        event.preventDefault();event.stopImmediatePropagation();return;
      }
      if(event.key==='Escape'){
        event.preventDefault();interaction.current?.cancelMove();setSettings(s=>({...s,mode:'explore'}));return;
      }
      if(event.ctrlKey || event.metaKey || event.altKey) return;
      if(latest.current.settings.mode==='explore') return;
      if(key==='d' && event.shiftKey && latest.current.settings.mode==='move') {
        event.preventDefault();event.stopImmediatePropagation();
        if(!event.repeat)void interaction.current?.duplicateSelected();
        return;
      }
      // 移动模式下删除选中（单个或整组）：和拖手柄一样是"按一下就生效"，可 Ctrl+Z 撤销。
      if((event.key==='Delete' || event.key==='Backspace') && latest.current.settings.mode==='move') {
        event.preventDefault();event.stopImmediatePropagation();
        if(!event.repeat)void interaction.current?.removeSelected();
        return;
      }
      if(key==='e') {event.preventDefault();interaction.current?.sampleHovered();}
      if(key==='f') {event.preventDefault();interaction.current?.focusHovered();}
      if (key === 'c') {
        event.preventDefault();
        change({...latest.current.settings,anchor:nextAnchor(latest.current.settings.anchor)});
      }
      if (['q','r','x','z'].includes(key) && latest.current.settings.mode==='place') {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.repeat) return;
        const axis = key==='x' ? 'pitch' : key==='z' ? 'roll' : 'rotation';
        const step = (key==='q' ? -1 : 1)*(event.shiftKey ? -1 : 1);
        change({...latest.current.settings,[axis]:((latest.current.settings[axis] || 0)+step+4)%4});
      }
    };
    window.addEventListener('keydown',keyboard,true);
    window.addEventListener('pointermove',trackPointer,true);
    return ()=>{
      window.removeEventListener('keydown',keyboard,true);
      window.removeEventListener('pointermove',trackPointer,true);
    };
  }, []);
  function attach(world: THREE.Scene, camera: THREE.Camera, element: HTMLElement, focus?: (box:THREE.Box3)=>void, lock?: (locked:boolean)=>void, teleport?: (target:{x:number;y:number;z:number;heading:number})=>void, position?: () => {x:number;z:number}) {
    const controller = new BuildInteraction(world,camera,element,{
      accountId,
      settings: () => latest.current.settings,
      hint: setHint,
      focus, lock, teleport, position,
      orient: part => change({...latest.current.settings,color:part.color,rotation:part.rotation,pitch:part.pitch,roll:part.roll}),
      sample: part => change({...latest.current.settings,kind:part.kind,color:part.color,
        rotation:part.rotation,pitch:part.pitch,roll:part.roll,mode:'place',height:0,anchor:'auto'}),
      open: id => { setChest(id); buildSound('open',latest.current.sound); },
      change: command => {
        return latest.current.store.mutate(command).then(ok => {
          if (ok) buildSound(command.action === 'remove' ? 'remove' : 'place',latest.current.sound);
          // 创建是临时操作：放下一件后回到创建前的模式；传送点仍回漫游便于点击使用。
          if (ok && command.action === 'add' && latest.current.settings.mode==='place') {
            const teleport=(command.part as {kind?:string} | undefined)?.kind === 'teleport-pad';
            change({...latest.current.settings, mode:teleport?'explore':placementReturn.current});
          }
          return ok;
        });
      },
    });
    interaction.current = controller;
    controller.sync(latest.current.store.world.parts);
    return controller;
  }
  // 常驻提示：安装传送点时说明玩法（transient 的 hint 会被安装提示「高度 x m」立刻覆盖）。
  const tip = settings.mode === 'place' && settings.kind === 'teleport-pad'
    ? '传送点＝目的地：放下后在**任何地方**点它都会立刻传过去（放一块就够）'
    : '';
  const ui = <>
    {settings.mode==='move' && !addMenu && !chest && <BuildSelectionColor read={()=>interaction.current?.colorTarget()}
      onChange={color=>change({...latest.current.settings,color})} />}
    <BuildStatus hint={hint} tip={tip} message={store.message} ready={store.ready} />
    {addMenu && <BuildAddMenu point={addMenu} color={settings.color} kind={settings.kind}
      onClose={()=>setAddMenu(undefined)} onChoose={kind=>{
        setAddMenu(undefined);change({...latest.current.settings,kind,mode:'place'});
      }} />}
    {chest && (store.world.parts.find(p=>p.id===chest)?.kind==='cinema-screen'
      ? <BuildCinema key={chest} id={chest} onClose={()=>setChest('')} />
      : <BuildChest key={chest} id={chest} accountId={accountId} onClose={() => setChest('')} />)}
  </>;
  return { attach, ui, revision:store.world.revision };
}
