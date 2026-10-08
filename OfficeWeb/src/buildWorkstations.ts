import { useSyncExternalStore } from 'react';
import { fixtureSeat } from './buildFixtures';
import { WORKSTATIONS } from './seats';
import type { BuildPart } from './buildTypes';
let version=0;
const listeners=new Set<()=>void>();
export function useBuildWorkstations(){useSyncExternalStore(fn=>{listeners.add(fn);return ()=>listeners.delete(fn);},()=>version);}
export function updateBuildWorkstations(parts:BuildPart[]) {
  const desks=parts.filter(p=>p.kind==='desk' && !p.pitch && !p.roll && p.seatIndex!==undefined);
  WORKSTATIONS.splice(0);
  for(const p of desks){
    const seat=fixtureSeat(p);
    if(seat?.display){
      WORKSTATIONS.push({index:p.seatIndex!,id:'build-'+p.id,label:seat.label,chair:seat.chair,stand:seat.stand,display:seat.display,displayScale:[p.scale?.[0] ?? 1,p.scale?.[1] ?? 1]});
      continue;
    }
    const angle=p.rotation*Math.PI/2,sin=Math.sin(angle),cos=Math.cos(angle);
    const sy=p.scale?.[1] ?? 1,sz=p.scale?.[2] ?? 1;
    WORKSTATIONS.push({index:p.seatIndex!,id:'build-'+p.id,displayScale:[p.scale?.[0] ?? 1,p.scale?.[1] ?? 1],label:'自建 '+(p.seatIndex!-8),
      chair:{x:p.x+sin*.6*sz,y:p.y,z:p.z+cos*.6*sz,angle:angle+Math.PI},
      stand:{x:p.x+sin*1.8*sz,y:p.y,z:p.z+cos*1.8*sz},
      display:{x:p.x-sin*.5*sz,y:p.y+1.18*sy,z:p.z-cos*.5*sz}});
  }
  WORKSTATIONS.sort((a,b)=>a.index-b.index);
  version++;for(const fn of listeners)fn();
}
