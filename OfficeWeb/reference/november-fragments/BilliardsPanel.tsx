  const [view,setView]=useState<'overhead'|'player'>('player');\
  const [mouse,setMouse]=useState({locked:false,fallback:false});\
  const [ready,setReady]=useState(false),[loadError,setLoadError]=useState('');\
  const locked=useRef(false),mounted=useRef(true);\
  const locked=useRef(false),mounted=useRef(true),joinRequested=useRef(false);\
  const canShoot=!!member&&state?.turn===myId&&state?.phase==='ready'&&online&&!busy;\
  const canShoot=ready&&!!member&&state?.turn===myId&&state?.phase==='ready'&&online&&!busy;\
  useEffect(()=>{\
    mounted.current=true;hall.openBilliards(tableId);hall.renderer.domElement.focus();\
    return()=>{mounted.current=false;hall.closeBilliards();void client.act(tableId,{action:'leave'}).catch(()=>{});};\
    let cancelled=false;mounted.current=true;setReady(false);setLoadError('');joinRequested.current=false;\
    void hall.openBilliards(tableId).then(opened=>{\
      if(cancelled)return;\
      if(!opened){setLoadError('台球加载失败，请返回后重试');return;}\
      setReady(true);hall.renderer.domElement.focus();\
    }).catch(()=>{if(!cancelled)setLoadError('台球加载失败，请返回后重试');});\
    return()=>{cancelled=true;mounted.current=false;hall.closeBilliards();if(joinRequested.current)void client.act(tableId,{action:'leave'}).catch(()=>{});};\
  useEffect(()=>{if(online&&myId)void act({action:'join'});},[online,myId,act]);\
  useEffect(()=>{if(ready&&online&&myId){joinRequested.current=true;void act({action:'join'});}},[ready,online,myId,act]);\
  useEffect(()=>{\
    const table=hall.billiards;if(!table)return;\
    const table=hall.billiards;if(!ready||!table)return;\
  },[hall,tableId,canShoot,state?.turnToken,act,view]);\
  },[hall,tableId,ready,canShoot,state?.turnToken,act,view]);\
  const status=error||(!online?'连接已断开，正在重连…':busy?'正在同步…':!state?'正在加入球桌…':state.phase==='finished'?state.message:state.phase==='rolling'?'球正在滚动…':turn&&turn.id!==myId?'轮到 '+turn.name:mouseHint);\
  if(!ready)return <section className="hall-billiards-panel" aria-label="台球加载">\
    <div className="hall-billiards-loading" role={loadError?'alert':'status'}>\
      {!loadError&&<span className="hall-billiards-spinner" aria-hidden="true" />}\
      <span>{loadError||'正在加载台球…'}</span>\
      <button type="button" onClick={onClose}>返回大厅</button>\
    </div>\
  </section>;\
