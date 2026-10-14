// A sparse, height-aware collision map. Empty space outside the starting island
// is not a floor: only installed boxes extend the walkable world.
export type Point = { x: number; y: number; z: number };
export type Solid = { min: Point; max: Point };
const CELL = 4;
const STEP = 0.25;
const STEP_HEIGHT = 0.255;
const BODY_HEIGHT = 1.3;
/** 爬梯子比走路慢一点，寻路里也按这个比例算代价（≥1 才是可采纳的启发式）。 */
const CLIMB_COST = 1.2;
/**
 * 可攀爬的柱体（直梯）。梯子里没有"能站的踏面"：人一进这个柱体就改成抓着梯子，
 * 高度由按键（W/↑ 往上爬、S/↓ 往下退）自己控制，见 `buildClimb.ts`。
 */
export type Climb = { min: Point; max: Point; normalX: number; normalZ: number;
  /** 摞起来的梯子并成一根以后，每一段的 y 区间与法线（爬的时候按人所在那一段取朝向）。 */
  segments?: { minY: number; maxY: number; normalX: number; normalZ: number }[] };
/** 上下两根梯子最多差这么点就算"接上了"（正好摞上去是 0，差半格以内也爬得过去）。 */
const CLIMB_GAP = STEP_HEIGHT;
/**
 * 把 `(x,z)` 投影重叠、竖直方向相接的柱体**并成一根**。
 *
 * 用户 2026-10-09：「把直梯摞得很高之后，怎么不能自动寻路了」——以前 `climbSpanAt()` 只返回
 * 命中 `(x,z)` 的**第一根**梯子，而且不看高度，于是摞起来以后整个柱体被卡在最下面那根的顶上
 * （A 是 0~3.75、B 是 3.75~7.5，A* 在 3.75 处往上的边被 `min(y, A.max)` 夹回 3.75，永远上不去）；
 * 手动爬也一样：在接缝处 `y` 已经等于 A 的顶，`climbStep` 把它当成"到顶了"，改成尝试往相机方向踏出去。
 * 并成一根以后，接缝只是这根梯子的中间某一格，上和下都能继续。
 */
export function mergeClimbs(list: Climb[]): Climb[] {
  const out: Climb[] = [];
  for (const climb of list) {
    const row: Climb = { min: { ...climb.min }, max: { ...climb.max }, normalX: climb.normalX, normalZ: climb.normalZ,
      segments: climb.segments ? [...climb.segments]
        : [{ minY: climb.min.y, maxY: climb.max.y, normalX: climb.normalX, normalZ: climb.normalZ }] };
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = out.length - 1; i >= 0; i--) {
        const other = out[i];
        // `(x,z)` 投影要重叠（上下摞在一起的梯子本来就对齐），竖直方向相接或重叠。
        if (row.min.x > other.max.x + 1e-6 || other.min.x > row.max.x + 1e-6) continue;
        if (row.min.z > other.max.z + 1e-6 || other.min.z > row.max.z + 1e-6) continue;
        if (row.min.y > other.max.y + CLIMB_GAP || other.min.y > row.max.y + CLIMB_GAP) continue;
        row.min = { x: Math.max(row.min.x, other.min.x), y: Math.min(row.min.y, other.min.y), z: Math.max(row.min.z, other.min.z) };
        row.max = { x: Math.min(row.max.x, other.max.x), y: Math.max(row.max.y, other.max.y), z: Math.min(row.max.z, other.max.z) };
        row.segments = [...(row.segments || []), ...(other.segments || [])].sort((a, b) => a.minY - b.minY);
        out.splice(i, 1);
        changed = true;
      }
    }
    out.push(row);
  }
  return out;
}
export function setBuildClimbs(list: Climb[] | null) { climbs = list ? mergeClimbs(list) : []; }
/** 抓到梯子时的读数：`faceX/faceZ` 是从人指向梯子的水平方向（人会面朝它）。 */
export type ClimbHold = { bottom: number; top: number; faceX: number; faceZ: number };
let climbs: Climb[] = [];
/**
 * 面朝梯子的方向：梯面法线由部件自己声明（`buildArch.climbColumns` 旋转到世界坐标），
 * 人站在梯子哪一侧就朝哪个方向看。正好压在梯子中线上时返回 (0,0)，交给调用方保持原朝向。
 * 摞起来的梯子取**人所在那一段**的法线（上下两根朝向不同时也能朝对）。
 */
function climbFacing(climb: Climb, x: number, z: number, y: number) {
  let segment = climb.segments?.[0];
  let bestDistance = Infinity;
  for (const row of climb.segments || []) {
    const distance = Math.abs(y - Math.min(Math.max(y, row.minY), row.maxY));
    if (row.minY <= y && y <= row.maxY) { segment = row; break; }
    if (distance < bestDistance) { bestDistance = distance; segment = row; }
  }
  const normalX = segment?.normalX ?? climb.normalX, normalZ = segment?.normalZ ?? climb.normalZ;
  const middleX = (climb.min.x + climb.max.x) / 2, middleZ = (climb.min.z + climb.max.z) / 2;
  const side = (x - middleX) * normalX + (z - middleZ) * normalZ;
  if (Math.abs(side) < 1e-3) return { faceX: 0, faceZ: 0 };
  const sign = side > 0 ? -1 : 1;
  return { faceX: normalX * sign, faceZ: normalZ * sign };
}
/** `(x,z)` 处是否有梯子，且 `y` 在它能抓的范围内。 */
export function buildClimbAt(x: number, z: number, y: number): ClimbHold | null {
  for (const climb of climbs) {
    if (x < climb.min.x - 1e-6 || x > climb.max.x + 1e-6) continue;
    if (z < climb.min.z - 1e-6 || z > climb.max.z + 1e-6) continue;
    if (y < climb.min.y - STEP_HEIGHT || y > climb.max.y + STEP_HEIGHT) continue;
    return { bottom: climb.min.y, top: climb.max.y, ...climbFacing(climb, x, z, y) };
  }
  return null;
}
/** 和 `buildClimbAt` 同一批梯子，但不看高度：寻路要在梯子内部上下走。 */
function climbSpanAt(x: number, z: number): Climb | null {
  for (const climb of climbs) {
    if (x < climb.min.x - 1e-6 || x > climb.max.x + 1e-6) continue;
    if (z < climb.min.z - 1e-6 || z > climb.max.z + 1e-6) continue;
    return climb;
  }
  return null;
}
let cells: Map<string, Solid[]> | null = null;
/** 全世界最低那一件的底面：掉落判死的参照线（见 `avatarFall`）。 */
let lowestBottom: number | null = null;
export function setBuildSolids(solids: Solid[] | null) {
  cells = solids ? new Map() : null;
  lowestBottom = null;
  for (const solid of solids || []) {
    if (lowestBottom === null || solid.min.y < lowestBottom) lowestBottom = solid.min.y;
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
/** 最低部件组合的底面（一件都没有时返回 null）。掉落掉到它下面就算死。 */
export function lowestSolidBottom() { return lowestBottom; }
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
/**
 * 从 `fromY` 往下：`(x,z)` 处实体顶面的最高一层（没有就是 null）。
 *
 * `supportHeight` 那个 ±0.255 的窗口是给"走路抬腿上下一级"用的；下落时一帧能掉好几米，
 * 拿旧窗口去问会直接穿过楼板，所以掉落要的是"我下面最高的那层地"。
 */
export function supportBelow(x: number, z: number, fromY: number): number | null {
  const solids = nearby(x,z).filter(b => x >= b.min.x-1e-6 && x <= b.max.x+1e-6 && z >= b.min.z-1e-6 && z <= b.max.z+1e-6);
  const levels = solids.map(b => b.max.y).filter(y => y <= fromY+1e-6);
  levels.sort((a,b) => b-a);
  // 重力只问脚下是否有实体；头顶/身体被家具挡住不能使地板失去承托。
  // 行走与寻路仍使用 supportHeight / blocksBody 的净空判定。
  return levels[0] ?? null;
}
/** 身体会不会被实体挡住：既抬不上去（顶面高过抬腿高度），又钻不过去（底面低过头顶）。 */
export function blocksBody(x: number, z: number, y: number): boolean {
  return nearby(x,z).some(b => x >= b.min.x-1e-6 && x <= b.max.x+1e-6 && z >= b.min.z-1e-6 && z <= b.max.z+1e-6
    && b.max.y > y + STEP_HEIGHT + 1e-6 && b.min.y < y + BODY_HEIGHT - 0.02);
}
/**
 * 这一段水平路线上有没有挡住身体的东西（台阶/墙/梯子），**不管脚下有没有地面**。
 * 走路用它判断"是撞住了还是走到了边缘"，空中控制也用它。
 */
export function buildClearPath(start: Point, x: number, z: number): boolean {
  const count = Math.max(1, Math.ceil(Math.hypot(x-start.x,z-start.z)/0.04));
  for (let i=1; i<=count; i++) {
    const px=start.x+(x-start.x)*i/count, pz=start.z+(z-start.z)*i/count;
    if (buildClimbAt(px,pz,start.y)) return false;   // 梯子里不走"踏空"这条路
    if (blocksBody(px,pz,start.y)) return false;     // 被墙/台阶挡住，不是边缘
  }
  return true;
}
/**
 * 走出边缘（掉落的第一步）：水平方向没有挡住身体的实体、目的地脚下又没有能站的那一层。
 *
 * 以前这种情况被当成"撞住不动"——用户要的是**可以走下去**（掉到下层建筑上，或者掉进深渊）。
 * 被墙/高台阶挡住时仍然返回 false，那时人是真的走不过去。
 */
export function buildStepOff(start: Point, x: number, z: number): boolean {
  return buildClearPath(start, x, z) && supportHeight(x,z,start.y) === null;
}
/** Substep every segment: a fast frame cannot skip a riser, a wall or a gap. */
export function buildTraverse(start: Point, x: number, z: number): Point | null {
  const count = Math.max(1, Math.ceil(Math.hypot(x-start.x,z-start.z)/0.04));
  let y = start.y;
  for (let i=1; i<=count; i++) {
    const px=start.x+(x-start.x)*i/count, pz=start.z+(z-start.z)*i/count;
    // 梯子不是地面：进去就是抓着它，高度保持不变（往上/往下是按键决定的动作）。
    const climb = buildClimbAt(px,pz,y);
    if (climb) { y = Math.max(climb.bottom, Math.min(climb.top, y)); continue; }
    const height = supportHeight(px,pz,y);
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
    // 梯子：同一格上可以一级级往上爬、也可以往下退（梯顶/梯底是硬边界）。
    const span = climbSpanAt(n.x,n.z);
    if (span) for (const sign of [1,-1]) {
      const y = sign > 0
        ? Math.min(n.y + STEP, span.max.y)
        : Math.max(n.y - STEP, span.min.y);
      if (y < span.min.y - 1e-6 || y > span.max.y + 1e-6) continue;
      if (Math.abs(y - n.y) < 1e-3) continue;
      const p={x:n.x,y,z:n.z};
      const g=n.g+Math.abs(y-n.y)*CLIMB_COST;
      if (g >= (best.get(key(p)) ?? Infinity)) continue;
      best.set(key(p),g);
      open.push({...p,g,f:g+heuristic(p),parent:n});
    }
  }
  return [];
}
