/** 点击座位时的分流规则（11 月 x6.sitAt 的判定层，提取成纯函数）：
 *  被谁坐了 / 是不是别人的工位 / 可以往下走导航。 */

export interface SeatCandidate {
  /** 座位 id（build-seat-* / desk-N）。 */
  id: string;
  /** 工位编号；非工位座位没有这个字段。 */
  workstation?: number;
  /** 导航可达点。 */
  approaches: { x: number; z: number }[];
  /** 座位坐标。 */
  at: { x: number; y: number; z: number };
  /** 面向与手势。 */
  face: number;
  hands?: string;
  pose?: string;
}

export interface PersonRow {
  id: string;
  name: string;
  sittingSpot?: string | null;
  seat?: number | null;
}

export type SeatVerdict =
  | { ok: true }
  | { ok: false; reason: 'taken'; message: string }
  | { ok: false; reason: 'owned'; message: string };

/** 判定一次入座请求：座位被别人占着、或这是别人的工位，都要拦下来。 */
export function seatVerdict(seat: SeatCandidate, people: PersonRow[], myId: string,
  ownerOf: (workstation: number) => { name: string; mine: boolean } | null): SeatVerdict {
  const occupant = people.find(person => person.sittingSpot === seat.id);
  if (occupant && occupant.id !== myId) {
    return { ok: false, reason: 'taken', message: `${occupant.name}坐在这里` };
  }
  const owner = seat.workstation !== undefined ? ownerOf(seat.workstation) : null;
  if (owner && !owner.mine) {
    return { ok: false, reason: 'owned', message: `这是${owner.name}的工位` };
  }
  return { ok: true };
}

/** 认领提示：坐上的是没人认领的工位时，面板要问一句"要不要认领"。 */
export function shouldOfferClaim(seat: SeatCandidate,
  ownerOf: (workstation: number) => { name: string; mine: boolean } | null): boolean {
  return seat.workstation !== undefined && ownerOf(seat.workstation) === null;
}
