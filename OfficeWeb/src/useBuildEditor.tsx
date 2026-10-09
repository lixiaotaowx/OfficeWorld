import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { BuildInteraction } from './buildInteraction';
import { BuildToolbar } from './BuildToolbar';
import { BuildChest } from './BuildChest';
import { buildSound } from './buildAudio';
import { useBuildWorld } from './useBuildWorld';
import { nextAnchor, type BuildSettings } from './buildTypes';
import './build.css';

export function useBuildEditor(accountId: string) {
  const store = useBuildWorld();
  const [settings, setSettings] = useState<BuildSettings>({ mode: 'explore', kind: 'block', color: '#f3dfc5', rotation: 0, height: 0 });
  const [sound, setSound] = useState(true);
  const [chest, setChest] = useState('');
  const [hint, setHint] = useState('');
  const interaction = useRef<BuildInteraction>();
  const latest = useRef({ store, settings, sound, chest });
  latest.current = { store, settings, sound, chest };
  useEffect(() => { interaction.current?.sync(store.world.parts); }, [store.world.parts]);
  useEffect(() => { interaction.current?.refresh(); }, [settings]);
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.scene-shell');
    const bar = document.querySelector<HTMLElement>('.stage .bottom-bar');
    if (!shell || !bar) return;
    const observer = new ResizeObserver(() => {
      shell.style.setProperty('--build-bottom', `${bar.getBoundingClientRect().height + 42}px`);
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  const change = (next: BuildSettings) => {
    if (next.rotation !== latest.current.settings.rotation || next.pitch !== latest.current.settings.pitch || next.roll !== latest.current.settings.roll) buildSound('rotate',latest.current.sound);
    setSettings(next);
  };
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (document.querySelector('.chest-video-backdrop')) return;
      if ((event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')) return;
      if (event.key === 'Escape') { setChest(''); interaction.current?.cancelMove();setSettings(s => ({ ...s, mode: 'explore' })); }
      if (latest.current.chest || document.querySelector('[role="dialog"]')) return;
      const key=event.key.toLowerCase();
      if((event.ctrlKey || event.metaKey) && ['z','y'].includes(key) && latest.current.settings.mode!=='explore') {
        event.preventDefault();
        void (key==='y' || event.shiftKey ? latest.current.store.redo() : latest.current.store.undo());
        return;
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
      if (['q','r','x','z'].includes(key) && ['place','move'].includes(latest.current.settings.mode)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.repeat) return;
        const axis = key==='x' ? 'pitch' : key==='z' ? 'roll' : 'rotation';
        const step = (key==='q' ? -1 : 1)*(event.shiftKey ? -1 : 1);
        change({...latest.current.settings,[axis]:((latest.current.settings[axis] || 0)+step+4)%4});
      }
    };
    window.addEventListener('keydown',keyboard,true);
    return () => window.removeEventListener('keydown',keyboard,true);
  }, []);
  function attach(world: THREE.Scene, camera: THREE.Camera, element: HTMLElement, focus?: (box:THREE.Box3)=>void, lock?: (locked:boolean)=>void, teleport?: (target:{x:number;y:number;z:number;heading:number})=>void, position?: () => {x:number;z:number}) {
    const controller = new BuildInteraction(world,camera,element,{
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
          // 放下传送点后**自动回到漫游**：用户报「创建后鼠标只能继续创建从而出不来」——
          // 回到漫游后点它就是传过去。想连着放好几块可以再点一次「安装」。
          if (ok && command.action === 'add' && (command.part as {kind?:string} | undefined)?.kind === 'teleport-pad') {
            setHint('传送点已放下 · 已回到漫游：在任何地方点它都会立刻传过去');
            change({...latest.current.settings, mode:'explore'});
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
    <BuildToolbar settings={settings} onChange={change} ready={store.ready} busy={store.busy}
      message={store.message} hint={hint} tip={tip} sound={sound} onSound={() => setSound(!sound)}
      onAlign={() => void interaction.current?.alignSelected()}
      onUndo={() => void store.undo()} undoCount={store.undoCount}
      onRedo={() => void store.redo()} redoCount={store.redoCount} />
    {chest && <BuildChest key={chest} id={chest} accountId={accountId} onClose={() => setChest('')} />}
  </>;
  return { attach, ui, revision:store.world.revision };
}
