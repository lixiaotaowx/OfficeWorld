/** 大厅单击的分流优先级（11 月 x6 pointerup 的判定层）：
 *  台球桌 → 猫 → 显示屏（单击贴合面）→ 梯子 → 座位 → 地面走路。 */

export interface ClickHit {
  id: string;
  /** 射线命中距离。 */
  distance: number;
}

export interface FloorHit {
  point: { x: number; y: number; z: number };
  distance: number;
}

export type ClickRoute =
  | { kind: 'billiards'; id: string }
  | { kind: 'cat' }
  | { kind: 'display' }
  | { kind: 'ladder'; id: string }
  | { kind: 'seat'; id: string }
  | { kind: 'walk'; point: { x: number; y: number; z: number } }
  | { kind: 'none' };

/** 台球桌比地面"近一点点"（3cm 容差）就优先选桌。 */
export function pickBilliardsOrFloor(tables: ClickHit[], floor: FloorHit | null): ClickHit | null {
  const nearest = tables.slice().sort((a, b) => a.distance - b.distance)[0];
  if (!nearest) return null;
  if (!floor || nearest.distance <= floor.distance + .03) return nearest;
  return null;
}

/** 单击路由：按 11 月的优先级依次判定。 */
export function routeClick(input: {
  billiardsTables: ClickHit[];
  floor: FloorHit | null;
  catVisible: boolean;
  catHit: boolean;
  displayHit: boolean;
  ladderPartId: string | null;
  seatId: string | null;
  walking: boolean;
}): ClickRoute {
  const table = pickBilliardsOrFloor(input.billiardsTables, input.floor);
  if (table) return { kind: 'billiards', id: table.id };
  if (input.catVisible && input.catHit) return { kind: 'cat' };
  if (input.displayHit) return { kind: 'display' };
  if (input.ladderPartId) return { kind: 'ladder', id: input.ladderPartId };
  if (input.seatId) return { kind: 'seat', id: input.seatId };
  if (input.floor && input.walking) return { kind: 'walk', point: input.floor.point };
  return { kind: 'none' };
}
