import { createBilliardsGame } from './game.mjs';
/** Each placed component owns a game. IDs are checked against the saved world. */
export function attachBilliards(io, people, http, world) {
  const games=new Map();
  let valid=new Set(), checked=0, last=performance.now(), broadcast=0;
  const emit=state=>{for(const socket of io.sockets.sockets.values())if(people.has(socket.id))socket.emit('billiards-state',state);};
  const refresh=()=>{
    valid=new Set(world().parts.filter(p=>p.kind==='billiards').map(p=>p.id));checked=performance.now();
    for(const id of games.keys())if(!valid.has(id)){games.delete(id);emit({tableId:id,removed:true});}
  };
  const forget=id=>{for(const game of games.values())game.leave(id);};
  const sync=socket=>{refresh();for(const [tableId,game] of games)socket.emit('billiards-state',{...game.snapshot(),tableId});};
  const timer=setInterval(()=>{
    const now=performance.now(),dt=(now-last)/1000;last=now;
    if(now-checked>1000)refresh();
    const publish=now-broadcast>=50;
    for(const game of games.values())if(game.advance(dt)&&publish)game.publish();
    if(publish)broadcast=now;
  },16);
  timer.unref();http.on('close',()=>clearInterval(timer));
  return {sync,forget,attach(socket){
    let lastAction=0;
    socket.on('billiards-action',(command,reply)=>{
      if(typeof reply!=='function')return;
      const person=people.get(socket.id);if(!person)return reply({ok:false,error:'请先进入大厅'});
      refresh();
      const tableId=command?.tableId;
      if(typeof tableId!=='string'||!valid.has(tableId))return reply({ok:false,error:'这张台球桌已移除，请返回大厅'});
      if(!['join','leave','reset','shoot'].includes(command?.action))return reply({ok:false,error:'未知台球操作'});
      const now=Date.now();
      if(['shoot','reset'].includes(command.action)){
        if(now-lastAction<100)return reply({ok:false,error:'操作太快，请稍后再试'});lastAction=now;
      }
      let game=games.get(tableId);
      if(!game){game=createBilliardsGame({emit:state=>emit({...state,tableId})});games.set(tableId,game);}
      const result=game.act(person,command);
      if(result.ok&&command.action==='join')for(const [id,other] of games)if(id!==tableId)other.leave(person.id);
      reply(result);
    });
    socket.on('billiards-sync',()=>{if(people.has(socket.id))sync(socket);});
  }};
}
