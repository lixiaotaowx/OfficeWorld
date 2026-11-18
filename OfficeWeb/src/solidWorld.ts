import * as THREE from "three";

/** 碰撞世界常量（与 11 月 chunk 中的数值一致）。 */
export const CELL = 4;                 // 空间格宽（网格键 = gx * 4096 + gz）
export const BODY_RADIUS = .22;        // 玩家半径
export const STEP_HEIGHT = .42;        // 台阶高
export const JUMP_HEIGHT = 1.7;        // 跳跃高
export const BODY_HEIGHT = 1.6;        // 玩家高

export interface SolidBox {
  x0: number; x1: number;
  y0: number; y1: number;
  z0: number; z1: number;
  water?: boolean;
}

/** 碰撞世界：把静态方块装进空间格，查询只看附近的格子。 */
export class SolidWorld {
  private boxes: SolidBox[] = [];
  private grid = new Map<number, number[]>();
  private stamp = new Uint32Array(0);
  private stampN = 0;
  private last: number[] = [];

  set(boxes: SolidBox[]) {
    this.boxes = boxes;
    this.grid.clear();
    this.stamp = new Uint32Array(boxes.length);
    boxes.forEach((box, index) => {
      for (let gx = Math.floor(box.x0 / CELL); gx <= Math.floor(box.x1 / CELL); gx++)
        for (let gz = Math.floor(box.z0 / CELL); gz <= Math.floor(box.z1 / CELL); gz++) {
          const key = gx * 4096 + gz;
          let bucket = this.grid.get(key);
          if (!bucket) this.grid.set(key, bucket = []);
          bucket.push(index);
        }
    });
  }

  get list(): SolidBox[] { return this.boxes; }

  /** 矩形范围附近的方块（带去重戳）。 */
  near(x0: number, z0: number, x1: number, z1: number, y0: number, y1: number): number[] {
    const result: number[] = [];
    const minX = Math.min(x0, x1) - .02, maxX = Math.max(x0, x1) + .02;
    const minZ = Math.min(z0, z1) - .02, maxZ = Math.max(z0, z1) + .02;
    this.stampN++;
    for (let gx = Math.floor(minX / CELL); gx <= Math.floor(maxX / CELL); gx++)
      for (let gz = Math.floor(minZ / CELL); gz <= Math.floor(maxZ / CELL); gz++)
        for (const index of this.grid.get(gx * 4096 + gz) ?? []) {
          if (this.stamp[index] === this.stampN) continue;
          this.stamp[index] = this.stampN;
          const box = this.boxes[index];
          if (box.x1 < minX || box.x0 > maxX || box.z1 < minZ || box.z0 > maxZ
            || box.y1 < y0 || box.y0 > y1) continue;
          result.push(index);
        }
    return this.last = result;
  }

  /** 脚下的地面高度；水面不算地。 */
  groundAt(x: number, z: number, feetY: number): number | null {
    let ground: number | null = null;
    for (const index of this.near(x, z, x, z, -99, feetY)) {
      const box = this.boxes[index];
      if (x < box.x0 - .03 || x > box.x1 + .03 || z < box.z0 - .03 || z > box.z1 + .03) continue;
      if (box.y1 > feetY + .001) continue;
      if (!box.water && (ground === null || box.y1 > ground)) ground = box.y1;
    }
    return ground !== null && this.waterAt(x, z, ground) ? null : ground;
  }

  /** 这一点附近是不是水面（游起来）。 */
  waterAt(x: number, z: number, y: number): boolean {
    return this.near(x - BODY_RADIUS, z - BODY_RADIUS, x + BODY_RADIUS, z + BODY_RADIUS, y - .05, y + BODY_HEIGHT)
      .some(index => {
        const box = this.boxes[index];
        return box.water && y <= box.y1 + .05 && y >= box.y0 - .5;
      });
  }

  /** 这一点能不能站（头顶没有东西）。 */
  blocksAt(x: number, z: number, y: number): boolean {
    const reach = BODY_RADIUS - .02;
    return this.waterAt(x, z, y)
      || this.near(x - reach, z - reach, x + reach, z + reach, y + STEP_HEIGHT + .01, y + BODY_HEIGHT).length > 0;
  }

  /** 跳跃落点：目标地面比脚下高一点点、且头顶通畅才允许。 */
  canJump(from: { x: number; y: number; z: number }, x: number, z: number): number | null {
    const ground = this.groundAt(x, z, from.y + JUMP_HEIGHT + .05);
    if (ground === null || ground <= from.y + STEP_HEIGHT || ground > from.y + JUMP_HEIGHT + .001) return null;
    if (this.blocksAt(x, z, ground)) return null;
    if (this.near(from.x - BODY_RADIUS, from.z - BODY_RADIUS, from.x + BODY_RADIUS, from.z + BODY_RADIUS,
      from.y + BODY_HEIGHT, ground + BODY_HEIGHT).length) return null;
    return ground;
  }
}
