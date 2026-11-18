/** Geometry-only adapter. Never exposes contents, media URLs or user records. */
import { Box3, Vector3, Matrix4, Quaternion, Euler } from 'three';
import { readFileSync } from 'node:fs';
const library = JSON.parse(readFileSync(new URL('../part-library.json', import.meta.url), 'utf8'));
const defs = new Map(library.parts.map(p => [p.id, p]));
const box = (w,h,d,x,y,z) => new Box3(new Vector3(x-w/2,y-h/2,z-d/2),new Vector3(x+w/2,y+h/2,z+d/2));
export function catGeometry(world) {
  // Structural walking surfaces match shell.ts. Decorative books are deliberately omitted.
  const solids = [box(14,.06,10,0,-.03,0),box(5,2.7,2.06,-4.5,1.35,-3.97),box(9,.22,3.4,2.5,2.59,-3.3),
    box(2,.9,1.9,-4.6,.45,1.85),box(2,1.8,1.9,-4.6,.9,-.05),box(2,2.7,1.94,-4.6,1.35,-1.97)];
  for(let i=0;i<9;i++) solids.push(box(1.4,.3*(i+1),.66,-6.3,.15*(i+1),3-.66*(i+.5)));
  for(let i=0;i<8;i++) solids.push(box(1,.06,.32,-1.4,.3*(i+1)-.03,-1.6+.32*(7.5-i)));
  for(const p of world.parts) {
    const def=defs.get(p.kind), model=world.models.find(m=>'model:'+m.id===p.kind);
    const rows=[...(def?.boxes || [])];
    for(const s of def?.shapes || []) {
      if(s[0]==='cyl') rows.push([2*s[1],s[2],2*s[1],s[3],s[4],s[5]]);
      else rows.push([2*s[1],s[0]==='ball'?2*s[1]:.26,2*s[1],s[2],s[3],s[4]]);
    }
    if(model) rows.push([...model.size,0,model.size[1]/2,0]);
    const matrix=new Matrix4().compose(new Vector3(p.x,p.y,p.z),new Quaternion().setFromEuler(new Euler((p.pitch||0)*Math.PI/12,(p.rotation||0)*Math.PI/12,(p.roll||0)*Math.PI/12,'YXZ')),new Vector3(...(p.scale||[1,1,1])));
    for(const row of rows) solids.push(box(...row.slice(0,6)).applyMatrix4(matrix));
  }
  return solids.map(b=>({x0:b.min.x,x1:b.max.x,y0:b.min.y,y1:b.max.y,z0:b.min.z,z1:b.max.z}));
}
export function ground(solids,x,z,maxY) {
 let top=null;
 for(const b of solids) if(x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&b.y1<=maxY+.001) top=Math.max(top??-99,b.y1);
 return top;
}
export function fits(solids,x,y,z) {
 if(x < -6.8 || x > 6.8 || z < -4.8 || z > 4.8) return false;
 return !solids.some(b=>b.x1>x-.16&&b.x0<x+.16&&b.z1>z-.16&&b.z0<z+.16&&b.y1>y+.06&&b.y0<y+.46);
}
