import { createRack, TABLE } from './table.mjs';
import { FIXED_STEP, moving, stepBalls, restoreCue } from './physics.mjs';
const TURN_MS = 60000, MAX_PLAYERS = 6;
export function createBilliardsGame({ emit = () => {}, now = Date.now } = {}) {
  let balls = createRack(), players = [], turn = null, turnToken = 1, seq = 0, shot = 0;
  let phase = 'ready', deadline = 0, message = '加入球桌，开始这一局', shooter = null, nextPlayer = null;
  let potted = 0, scratch = false, elapsed = 0, accumulator = 0;
  const snapshot = () => ({seq,turnToken,phase,shot,deadline,message,turn,
    balls:balls.map(b=>({...b})),players:players.map(p=>({...p}))});
  const publish = () => { seq++; emit(snapshot()); };
  const nextTurn = id => { turn = players.some(p=>p.id===id)?id:players[0]?.id||null; turnToken++; deadline=turn?now()+TURN_MS:0; };
  const after = id => { const i=players.findIndex(p=>p.id===id); return players.length?players[(i+1)%players.length].id:null; };
  function leave(id) {
    if (!players.some(p=>p.id===id)) return;
    const following=after(id); players=players.filter(p=>p.id!==id);
    if (nextPlayer===id) nextPlayer=following;
    if (turn===id && phase!=='rolling') nextTurn(following);
    message=players.length?'有人离开了球桌':'球桌空闲，随时可以加入'; publish();
  }
  function act(person, command) {
    if (!person || !command || typeof command!=='object') return {ok:false,error:'请先进入大厅'};
    const id=person.id, player=players.find(p=>p.id===id);
    if (command.action==='join') {
      if (player) return {ok:true};
      if (players.length>=MAX_PLAYERS) return {ok:false,error:'球桌已有6人，可以先旁观'};
      players.push({id,name:person.name.slice(0,24),score:0});
      if (!turn && phase==='ready') nextTurn(id);
      message=`${person.name}加入了球桌`;publish();return {ok:true};
    }
    if (command.action==='leave') {leave(id);return {ok:true};}
    if (!player) return {ok:false,error:'先加入球桌，才能击球'};
    if (command.action==='reset') {
      if (phase==='rolling'||(phase!=='finished'&&players.length>1)) return {ok:false,error:'等这一局结束后再开新局'};
      balls=createRack();players.forEach(p=>p.score=0);phase='ready';shot=0;nextTurn(players[0].id);
      message='新的一局，轮流击球';publish();return {ok:true};
    }
    if (command.action!=='shoot') return {ok:false,error:'不支持的台球操作'};
    if (phase!=='ready'||turn!==id||command.turnToken!==turnToken) return {ok:false,error:'还没轮到你，或球还在滚动'};
    const {dx,dz,power}=command, length=Math.hypot(dx,dz);
    if (![dx,dz,power].every(n=>typeof n==='number'&&Number.isFinite(n))||!Number.isFinite(length)||length<.01||power<=0||power>1) return {ok:false,error:'击球方向或力度无效'};
    const cue=balls.find(b=>b.id===0);if (!cue||cue.pocketed) return {ok:false,error:'请等白球复位'};
    const speed=.35+power*(TABLE.maxSpeed-.35);cue.vx=dx/length*speed;cue.vz=dz/length*speed;
    phase='rolling';shooter=id;nextPlayer=after(id);potted=0;scratch=false;elapsed=accumulator=0;deadline=0;shot++;turnToken++;
    message=`${player.name}击球`;publish();return {ok:true};
  }
  function advance(seconds) {
    if (phase!=='rolling') {
      if (turn&&phase==='ready'&&deadline&&now()>=deadline) {nextTurn(after(turn));message='上一回合超时，已轮到下一位';publish();}
      return false;
    }
    accumulator+=Math.max(0,Math.min(.1,seconds));
    while (accumulator>=FIXED_STEP) {
      for (const id of stepBalls(balls)) {if (id===0)scratch=true;else potted++;}
      accumulator-=FIXED_STEP;elapsed+=FIXED_STEP;
      if (!moving(balls)||elapsed>=30) {
        balls.forEach(b=>{b.vx=0;b.vz=0;});restoreCue(balls);
        const owner=players.find(p=>p.id===shooter);if(owner)owner.score+=potted;
        phase=balls.filter(b=>b.id!==0).every(b=>b.pocketed)?'finished':'ready';
        nextTurn(phase==='finished'?null:nextPlayer);
        if(phase==='finished'){turn=null;deadline=0;const high=Math.max(0,...players.map(p=>p.score));message=`本局结束 · ${players.filter(p=>p.score===high).map(p=>p.name).join('、')||'大家'} ${high}分`;}
        else message=`本杆进${potted}球${scratch?' · 白球落袋，已复位':''}`;
        publish();return true;
      }
    }
    return true;
  }
  return {snapshot,act,leave,advance,publish};
}
