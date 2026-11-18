/** Scripted social presentation requested for the prototype; does not steer its policy. */
export function createCatInteraction({cat,emit,now=Date.now,touch=()=>{}}) {
 const positions=new Map(), greeted=new Map(), actions=new Map();
 const near=(p,c)=>Math.hypot(p.x-c.x,p.z-c.z)<1.8&&Math.abs((p.y||0)-c.y)<.8;
 const say=(text,to)=>emit({text,to,at:now()});
 return {
  motion(id,p){const c=cat();if(!c)return;const previous=positions.get(id), at=now(), dt=previous?(at-previous.at)/1000:0;
   positions.set(id,{x:p.x,y:p.y||0,z:p.z,at,vx:dt>0&&dt<=10?(p.x-previous.x)/dt:0,vz:dt>0&&dt<=10?(p.z-previous.z)/dt:0});
   if(near(p,c)&&(!previous||!near(previous,c))&&now()-(greeted.get(id)||0)>30000){greeted.set(id,now());say(c.pose==='sleep'?'呼噜……我在睡觉。':'喵～你来啦！',id);}},
  act(id,kind){const c=cat(),p=positions.get(id);
   if(!c||!p||now()-p.at>10000||!near(p,c))return {ok:false,text:'走近一点，再和我打招呼吧。'};
   if(!['hello','pet'].includes(kind))return {ok:false,text:'喵？'};
   if(now()-(actions.get(id)||0)<2000)return {ok:false,text:'慢一点，让我缓一缓。'};
   actions.set(id,now());if(kind==='pet')touch();const text=c.pose==='sleep'?'呼噜……让我再睡一会儿。':kind==='pet'?'咕噜咕噜～（轻轻蹭了蹭你的手）':'喵！今天也一起待在这里吧。';say(text,id);return {ok:true,text};},
  perception(){return [...positions.values()].filter(p=>now()-p.at<=10000).map(p=>({x:p.x,y:p.y,z:p.z,vx:now()-p.at<1000?p.vx:0,vz:now()-p.at<1000?p.vz:0}));},
  forget(id){positions.delete(id);greeted.delete(id);actions.delete(id);}
 };
}
