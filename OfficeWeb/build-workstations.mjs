import { fixtureFor } from './scene-fixtures.mjs';
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';

/** Stable numbers never shift or get reused after a desk is deleted. */
export function createBuildWorkstations(path, parts) {
  const ids=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
  if(!ids || Array.isArray(ids) || Object.values(ids).some(n=>!Number.isSafeInteger(n)||n<9)
    || new Set(Object.values(ids)).size!==Object.values(ids).length) throw Error('自建工位编号存档无效');
  const list=()=>{
    let dirty=false,next=Math.max(8,...Object.values(ids))+1;
    const desks=parts().filter(p=>p.kind==='desk' && !p.pitch && !p.roll);
    for(const p of desks)if((p.fixtureCopy || fixtureFor(p)?.seat?.index===undefined) && ids[p.id]===undefined){ids[p.id]=next++;dirty=true;}
    if(dirty){writeFileSync(path+'.next',JSON.stringify(ids));renameSync(path+'.next',path);}
    return desks.map(p=>({...p,seatIndex:(!p.fixtureCopy ? fixtureFor(p)?.seat?.index : undefined) ?? ids[p.id]}));
  };
  return {
    list,
    index:id=>list().find(p=>p.id===id)?.seatIndex,
    valid:index=>list().some(p=>p.seatIndex===index),
    count:()=>Math.max(8,...list().map(p=>p.seatIndex))+1,
    decorate:value=>{
      if(!Array.isArray(value.parts))return value;
      const rows=new Map(list().map(p=>[p.id,p.seatIndex]));
      return {...value,parts:value.parts.map(p=>rows.has(p.id)?{...p,seatIndex:rows.get(p.id)}:p)};
    },
  };
}
