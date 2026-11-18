import { BuildChest } from './BuildChest';\
import { BuildAddMenu, type BuildMenuPoint } from './BuildAddMenu';\
  const [hint, setHint] = useState('');\
  const [addMenu,setAddMenu]=useState<BuildMenuPoint>();\
  const pointer=useRef<BuildMenuPoint>();\
  const latest = useRef({ store, settings, sound, chest });\
  latest.current = { store, settings, sound, chest };\
  const latest = useRef({ store, settings, sound, chest, addMenu });\
  latest.current = { store, settings, sound, chest, addMenu };\
  const change = (next: BuildSettings) => {\
  };\
  const openAddMenu=(point?:BuildMenuPoint)=>{\
    if(!latest.current.store.ready){setHint('空间尚未连接，请稍后再创建物体');return;}\
    interaction.current?.cancelTransform();\
    setAddMenu(point || pointer.current || {x:window.innerWidth/2,y:window.innerHeight/3});\
  };\
  useEffect(() => {\
    const trackPointer=(event:PointerEvent)=>{pointer.current={x:event.clientX,y:event.clientY};};\
      const key=event.key.toLowerCase();\
      if(key==='a' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey){\
        event.preventDefault();event.stopImmediatePropagation();\
        if(!event.repeat && !latest.current.addMenu)openAddMenu();\
        return;\
      }\
      if(latest.current.addMenu)return;\
    window.addEventListener('keydown',keyboard,true);\
    return () => window.removeEventListener('keydown',keyboard,true);\
    window.addEventListener('pointermove',trackPointer,true);\
    return ()=>{\
      window.removeEventListener('keydown',keyboard,true);\
      window.removeEventListener('pointermove',trackPointer,true);\
    };\
    <BuildToolbar settings={settings} onChange={change} ready={store.ready} busy={store.busy}\
      onAdd={openAddMenu}\
      onRedo={() => void store.redo()} redoCount={store.redoCount} />\
    {addMenu && <BuildAddMenu point={addMenu} color={settings.color} kind={settings.kind}\
      onClose={()=>setAddMenu(undefined)} onChoose={kind=>{\
        setAddMenu(undefined);change({...latest.current.settings,kind,mode:'place'});\
      }} />}\
