/** M1 random-policy test animal, not a trained brain. No people-targeting rules. */
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { ground, fits } from './world.mjs';
import { initialDrives, validDrives, stepDrives, perceive } from './physiology.mjs';
export function createCat({path, geometry, emit=()=>{}, seed=18731, automatic=true, physiology=false, people=()=>[]}) {
 let state={version:1,mode:'random-prototype',x:0,y:0,z:3.7,rot:0,pose:'stand',moving:false,age:0,born:Date.now(),seq:0,rng:seed,action:8,remaining:0};
 if(path && existsSync(path)) {
  const saved=JSON.parse(readFileSync(path,'utf8'));
  if(saved.version!==1||!['x','y','z','rot','age','rng','seq','remaining','action','born'].every(k=>Number.isFinite(saved[k]))||!['stand','sit','lie','sleep','groom'].includes(saved.pose)) throw Error('Invalid cat checkpoint; refusing to silently replace it');
  state=saved;
 }
 if(physiology) {
  if(state.drives !== undefined && !validDrives(state.drives)) throw Error('Invalid cat physiology checkpoint');
  state.drives ||= initialDrives();
  state.secondsAlone = Number.isFinite(state.secondsAlone) ? state.secondsAlone : 0;
 }
 const random=()=>{state.rng=(Math.imul(1664525,state.rng)+1013904223)>>>0;return state.rng/4294967296;};
 let stopped=false, paused=false, pauseSaved=false, timer=null, saveAge=state.age;
 const snapshot=()=>structuredClone(state);
 let pendingPets=0, observation=null, reward=0;
 const readings=[];
 const save=()=>{if(path){writeFileSync(path+'.next',JSON.stringify(state));renameSync(path+'.next',path);}};
 function tick() {
  if(stopped||paused)return;
  const solids=geometry(); state.age+=.2; state.seq++; state.moving=false;
  // Physics resolves removed furniture; no policy choice is made here.
  const support=ground(solids,state.x,state.z,state.y+.05);
  if(support!==null&&support<state.y) state.y=Math.max(support,state.y-.3);
  if(state.remaining<=0){state.action=Math.floor(random()*17);state.remaining=1+random()*4;}
  state.remaining-=.2;
  // Resolve a spawn or edited piece of furniture intersecting the body.
  if(!fits(solids,state.x,state.y,state.z)) {
   let relocated=false;
   for(let r=.2;r<8&&!relocated;r+=.2) for(let n=0;n<16;n++) {
    const x=state.x+Math.sin(n*Math.PI/8)*r,z=state.z+Math.cos(n*Math.PI/8)*r;
    const y=ground(solids,x,z,state.y+.32);
    if(y!==null&&fits(solids,x,y,z)){state.x=x;state.y=y;state.z=z;relocated=true;break;}
   }
  }
  const a=state.action;
  if(a<8) {
   state.pose='stand';state.rot=a*Math.PI/4;
   const x=state.x+Math.sin(state.rot)*.09,z=state.z+Math.cos(state.rot)*.09;
   const y=ground(solids,x,z,state.y+.32);
   if(y!==null&&y>=state.y-.35&&fits(solids,x,y,z)){state.x=x;state.y=y;state.z=z;state.moving=true;}
  } else if(a<13) state.pose=['stand','sit','lie','sleep','groom'][a-8];
  else if(a===13||a===14) {
   const x=state.x+Math.sin(state.rot)*.55,z=state.z+Math.cos(state.rot)*.55;
   const y=ground(solids,x,z,state.y+(a===13?1.1:-.08));
   if(y!==null&&Math.abs(y-state.y)<=1.1&&fits(solids,x,y,z)&&fits(solids,state.x,Math.max(y,state.y)+.1,state.z)) {
    state.x=x;state.y=y;state.z=z;state.pose='stand';state.moving=true;
   }
   state.remaining=0;
  }
  if(physiology) {
   const sensed=perceive(state,state.drives,solids,people(),state.secondsAlone,state.born+state.age*1000);
   state.secondsAlone=sensed.environment.company>0?0:state.secondsAlone+.2;
   const result=stepDrives(state.drives,state,{...sensed.environment,pets:pendingPets},.2);
   state.drives=result.drives; reward=result.reward; observation=sensed.vector; pendingPets=0;
   // Bounded, aggregate telemetry only. Never put observations or human motion on disk.
   if(state.seq%25===0) {
    readings.push({age:state.age,...state.drives,reward});
    if(readings.length>360)readings.shift();
   }
  }
  emit({...snapshot(),meow:a===15&&state.remaining>3.7});
  if(state.age-saveAge>=600){save();saveAge=state.age;}
 }
 if(path&&!existsSync(path))save();
 function startTimer(){
  if(!automatic||timer||stopped||paused)return;
  timer=setInterval(()=>{try{tick();}catch(error){console.error('Cat simulation paused:',error.message);stopped=true;clearInterval(timer);timer=null;}},200);
  timer.unref?.();
 }
 startTimer();
 return {tick,snapshot,save,
  touch(){if(physiology&&!stopped&&!paused)pendingPets=Math.min(4,pendingPets+1);},
  diagnostics(){return structuredClone({stage:physiology?'M2-experimental':'M1',observation,reward,readings});},
  pause(){if(stopped||paused)return;paused=true;clearInterval(timer);timer=null;pauseSaved=false;save();pauseSaved=true;},
  resume(){if(stopped||!paused)return;paused=false;pauseSaved=false;startTimer();},
  stop(){if(stopped)return;clearInterval(timer);timer=null;stopped=true;if(!pauseSaved)save();}};
}
