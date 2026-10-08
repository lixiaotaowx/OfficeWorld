// A sparse, height-aware collision map. Empty space outside the starting island
// is not a floor: only installed boxes extend the walkable world.
export type Point = { x: number; y: number; z: number };
export type Solid = { min: Point; max: Point };
const CELL = 4;
const STEP = 0.25;
const STEP_HEIGHT = 0.255;
const BODY_HEIGHT = 1.3;
let cells: Map<string, Solid[]> | null = null;
export function setBuildSolids(solids: Solid[] | null) {
  cells = solids ? new Map() : null;
  for (const solid of solids || []) {
    for (let x = Math.floor(solid.min.x / CELL); x <= Math.floor(solid.max.x / CELL); x++) {
      for (let z = Math.floor(solid.min.z / CELL); z <= Math.floor(solid.max.z / CELL); z++) {
        const key = `${x},${z}`;
        const bucket = cells!.get(key) || [];
        bucket.push(solid);
        cells!.set(key, bucket);
      }
    }
  }
}
export function buildNavigationActive() { return cells !== null; }
function nearby(x: number, z: number) {
  return cells?.get(`${Math.floor(x / CELL)},${Math.floor(z / CELL)}`) || [];
}
export function supportHeight(x: number, z: number, fromY: number): number | null {
  const solids = nearby(x,z).filter(b => x >= b.min.x-1e-6 && x <= b.max.x+1e-6 && z >= b.min.z-1e-6 && z <= b.max.z+1e-6);
  const levels = solids.map(b => b.max.y).filter(y => y <= fromY+STEP_HEIGHT && y >= fromY-STEP_HEIGHT);
  levels.sort((a,b) => b-a);
  return levels.find(y => !solids.some(b => b.max.y > y+0.01 && b.min.y < y+BODY_HEIGHT-0.01)) ?? null;
}
/** Substep every segment: a fast frame cannot skip a riser, a wall or a gap. */
export function buildTraverse(start: Point, x: number, z: number): Point | null {
  const count = Math.max(1, Math.ceil(Math.hypot(x-start.x,z-start.z)/0.04));
  let y = start.y;
  for (let i=1; i<=count; i++) {
    const height = supportHeight(start.x+(x-start.x)*i/count,start.z+(z-start.z)*i/count,y);
    if (height === null) return null;
    y = height;
  }
  return { x, y, z };
}
type Node = Point & { g: number; f: number; parent?: Node };
// Binary heap keeps longer paths from sorting thousands of open cells per step.
class Frontier {
  rows: Node[] = [];
  push(row: Node) {
    let i = this.rows.push(row)-1;
    while (i) {
      const p = (i-1)>>1;
      if (this.rows[p].f <= row.f) break;
      this.rows[i] = this.rows[p]; i = p;
    }
    this.rows[i] = row;
  }
  pop() {
    const first = this.rows[0], last = this.rows.pop()!;
    if (this.rows.length) {
      let i=0;
      while (i*2+1<this.rows.length) {
        let c=i*2+1;
        if (c+1<this.rows.length && this.rows[c+1].f<this.rows[c].f) c++;
        if (this.rows[c].f>=last.f) break;
        this.rows[i]=this.rows[c]; i=c;
      }
      this.rows[i]=last;
    }
    return first;
  }
}
export function buildPath(start: Point, target: Point): Point[] {
  const reached = (p: Point) => Math.abs(p.y-target.y)<0.05;
  const direct = buildTraverse(start,target.x,target.z);
  if (direct && reached(direct)) return [direct];
  const heuristic = (p: Point) => Math.hypot(target.x-p.x,target.z-p.z)+Math.abs(target.y-p.y);
  const key = (p: Point) => `${Math.round(p.x/STEP)},${Math.round(p.z/STEP)},${Math.round(p.y*100)}`;
  const open = new Frontier();
  const best = new Map<string,number>();
  // Connect the continuous start to nearby lattice nodes, rather than teleport
  // to the closest grid point (which may sit inside a wall).
  for (let dx=-1; dx<=1; dx++) for (let dz=-1; dz<=1; dz++) {
    const p=buildTraverse(start,(Math.round(start.x/STEP)+dx)*STEP,(Math.round(start.z/STEP)+dz)*STEP);
    if (p) { open.push({...p,g:0,f:heuristic(p)}); best.set(key(p),0); }
  }
  for (let visits=0; open.rows.length && visits<40000; visits++) {
    const n=open.pop();
    if (n.g>(best.get(key(n)) ?? Infinity)) continue;
    if (Math.hypot(n.x-target.x,n.z-target.z)<0.4) {
      const end=buildTraverse(n,target.x,target.z);
      if (end && reached(end)) {
        const path: Point[]=[end];
        for (let row: Node | undefined=n; row; row=row.parent) path.unshift({x:row.x,y:row.y,z:row.z});
        return path;
      }
    }
    for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const p=buildTraverse(n,n.x+dx*STEP,n.z+dz*STEP);
      if (!p) continue;
      // Prevent diagonal corner cutting across a thin wall.
      if (dx && dz && (!buildTraverse(n,p.x,n.z) || !buildTraverse(n,n.x,p.z))) continue;
      const g=n.g+Math.hypot(dx,dz)*STEP+Math.abs(p.y-n.y)*0.2;
      if (g >= (best.get(key(p)) ?? Infinity)) continue;
      best.set(key(p),g);
      open.push({...p,g,f:g+heuristic(p),parent:n});
    }
  }
  return [];
}
