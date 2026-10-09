import type { BuildPart } from './buildTypes';

/**
 * 传送点：**点到哪一块就传到那一块**——任何地点点它都直接出现在它上面，一块就够用。
 *
 * （用户原话：「不是一对一 是任何地点 直接传送到点击处，只需要创建一个就行」。
 *  第一版理解成"配对的两个点互相传"，所以只有一块时点了什么都不发生，看着就是"无效"。）
 *
 * 规则（纯函数，测试直接吃）：
 * - 点在任意一块传送点上 → 立刻站到**那一块**上，不需要有第二块；
 * - 已经站在这一块上（`NEAR_PAD` 以内）再点它 → 传到**最近的另一块**（人多时来回跳）；
 *   世界上只有这一块时返回 undefined，调用方给一句"你已经站在这个传送点上了"；
 * - 落地朝向：面向"传过来之前站的地方"（来路），也就是 `atan2(from - to)`。
 */

export const TELEPORT_KIND = 'teleport-pad';

export const isTeleport = (kind: string) => kind === TELEPORT_KIND;

/** 站在这一块上再点它，就当作"去下一块"。 */
export const NEAR_PAD = 0.6;

export type TeleportTarget = { x: number; y: number; z: number; heading: number };

/** 水平面上一小块平地：传送只关心脚下这一点和朝向。 */
export type TeleportFrom = { x: number; z: number };

export function teleportTarget(
  parts: BuildPart[],
  pad: Pick<BuildPart, 'id' | 'x' | 'y' | 'z'>,
  from?: TeleportFrom,
): TeleportTarget | undefined {
  const onThisPad = Boolean(from) && Math.hypot(from!.x - pad.x, from!.z - pad.z) < NEAR_PAD;
  const destination = onThisPad ? nearestOtherPad(parts, pad) : pad;
  if (!destination) return undefined;
  const dx = (from?.x ?? destination.x) - destination.x;
  const dz = (from?.z ?? destination.z) - destination.z;
  // 面向来路：角色模型朝 +Z，朝向 = atan2(指向来路的向量)。
  const heading = Math.hypot(dx, dz) > 0.001 ? Math.atan2(dx, dz) : 0;
  return { x: destination.x, y: destination.y, z: destination.z, heading };
}

function nearestOtherPad(parts: BuildPart[], source: Pick<BuildPart, 'id' | 'x' | 'z'>) {
  let best: BuildPart | undefined;
  let bestDistance = Infinity;
  for (const pad of parts) {
    if (!isTeleport(pad.kind) || pad.id === source.id) continue;
    const distance = Math.hypot(pad.x - source.x, pad.z - source.z);
    if (distance < bestDistance) { bestDistance = distance; best = pad; }
  }
  return best;
}

/** 落点用脚下"能站的那一层"，与行走寻路同一套规则，别把存档里的 y 直接当脚底。 */
export function landingHeight(
  support: (x: number, z: number, fromY: number) => number | null,
  target: Pick<TeleportTarget, 'x' | 'z'>,
  from: number,
): number {
  return support(target.x, target.z, from + 0.25) ?? from;
}

/** 供诊断/测试读取：传送方向（弧度）是否指向来路。角色朝 +Z，朝向 = atan2(x,z)。 */
export function facesSource(target: TeleportTarget, source: { x: number; z: number }) {
  const dx = source.x - target.x, dz = source.z - target.z;
  if (Math.hypot(dx, dz) < 0.001) return true;
  const want = Math.atan2(dx, dz);
  const delta = Math.atan2(Math.sin(want - target.heading), Math.cos(want - target.heading));
  return Math.abs(delta) < 0.05;
}
