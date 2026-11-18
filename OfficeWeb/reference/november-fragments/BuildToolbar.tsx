import { buildColor } from './buildColors';\
import type { BuildMenuPoint } from './BuildAddMenu';\
  onRedo?: () => void; redoCount?: number;\
  onAdd?: (point:BuildMenuPoint) => void;\
  useEffect(() => { if (props.settings.mode === 'place') setExpanded(true); }, [props.settings.mode]);\
  useEffect(() => { if (props.settings.mode === 'place' && !props.onAdd) setExpanded(true); }, [props.settings.mode,props.onAdd]);\
        disabled={mode !== 'explore' && !props.ready} onClick={() => { change({ mode }); if (mode === 'place') setExpanded(true); }}>\
        title={mode==='place'?'Shift+A：创建物体':undefined}\
        disabled={mode !== 'explore' && !props.ready} onClick={event => {\
          if(mode==='place' && props.onAdd){props.onAdd({x:event.clientX,y:event.clientY});return;}\
          change({ mode });if (mode === 'place') setExpanded(true);\
        }}>\
