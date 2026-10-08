import scenery from '../scene-scenery.json';
import desks from '../scene-desks.json';
import chairs from '../scene-chairs.json';
import type { BuildPart } from './buildTypes';
type Fixture = {
  id:string; kind:string; color:string; origin:number[]; dimensions:number[];
  boxes:(number[] | string | number)[][];
  seat?:{id:string;index?:number;label:string;family:string;height:number;chair:number[];stand:number[];display?:number[]};
};
const fixtures:Fixture[]=[...scenery,...desks,...chairs];
export const fixtureFor=(part:{fixture?:string})=>fixtures.find(row=>row.id===part.fixture);
export function fixtureSeat(part:BuildPart) {
  const seat=fixtureFor(part)?.seat;
  if(!seat || part.pitch || part.roll)return;
  const a=part.rotation*Math.PI/2,s=Math.sin(a),c=Math.cos(a);
  const point=(p:number[])=>{
    const x=p[0]*(part.scale?.[0] ?? 1),y=p[1]*(part.scale?.[1] ?? 1),z=p[2]*(part.scale?.[2] ?? 1);
    return {x:part.x+x*c+z*s,y:part.y+y,z:part.z-x*s+z*c};
  };
  return {id:part.fixtureCopy ? (part.seatIndex===undefined ? `build-seat-${part.id}` : `desk-${part.seatIndex}`) : seat.id,label:seat.label,family:seat.family,workstation:part.seatIndex,
    chair:{...point(seat.chair),angle:seat.chair[3]+a},stand:point(seat.stand),
    height:seat.height*(part.scale?.[1] ?? 1),display:seat.display?point(seat.display):undefined};
}
