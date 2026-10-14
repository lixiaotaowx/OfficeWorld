import * as THREE from 'three';
import { buildClimbAt, buildNavigationActive, lowestSolidBottom, supportBelow, supportHeight } from './buildNavigation';
import { clearPath } from './navigation';
import { heading, walkDirection } from './avatarWalk';

/**
 * 掉落 / 死亡 / 原地复活。
 *
 * 用户 2026-10-09：「添加掉落机制，可以走下去掉落到最低的部件组合之下就宣布死亡，然后再掉落
 * 前的位置，也就是可以跳到下一层建筑上原地复活」。也就是：
 *   ① 走出边缘 → 受重力往下掉（以前是被当成"撞住不动"）；
 *   ② 掉到**下层建筑**上就正常站住（可以一层层跳下去）；
 *   ③ 掉到**全世界最低那一件的底面之下** → 宣布死亡 → 回到掉落前站的那个位置复活。
 *
 * 规则全在这里（纯函数 + 一个状态机），`OfficeAvatar` 只负责接线，`?debug=1` 的探针能直接读。
 */
/** 重力（m/s²）：比地球重一点，落地干脆，不像月球漫步。 */
export const FALL_GRAVITY = 18;
/** 终端速度（m/s）：再深也不会一帧穿过楼板（落点每帧按"上一帧的 y"重新求一次）。 */
export const FALL_MAX_SPEED = 28;
/** 判死线：最低部件底面再往下留一点，免得贴着底面那一帧反复横跳。 */
export const DEATH_DEPTH = 0.5;
/** 复活后这段时间不许走动：松不开的 W 键不会让人一复活就又走回边缘。 */
export const RESPAWN_GRACE = 0.9;
/** 复活点站不住时（平台被拆了）在附近找支撑的半径。 */
export const RESPAWN_SEARCH = 2;

export interface FallPoint { x: number; y: number; z: number }
export interface FallState { from: FallPoint; y: number; vy: number }
export interface DeathInfo { from: FallPoint; spot: FallPoint; deathY: number | null; deaths: number }

/** 从某个位置开始下落（`from` 就是"掉落前的位置"，死亡后回到这里）。 */
export function beginFall(from: FallPoint): FallState {
  return { from: { ...from }, y: from.y, vy: 0 };
}

/** 判死的高度：全世界最低那一件的底面往下 `DEATH_DEPTH`；一件部件都没有时返回 null（不掉死）。 */
export function deathLine(): number | null {
  const bottom = lowestSolidBottom();
  return bottom === null ? null : bottom - DEATH_DEPTH;
}

/**
 * 空中一帧：重力积分 + 落到哪一层 / 掉死了没有。
 *
 * 落点用**上一帧的 y** 当上界去问"下面最高的一层地"（`supportBelow`），所以一帧掉几米也不会
 * 穿过楼板；`landed` 是踩到的那一层的高度。
 */
export function fallStep(state: FallState, x: number, z: number, dt: number, death: number | null):
{ y: number; vy: number; landed: number | null; died: boolean } {
  const vy = Math.max(state.vy - FALL_GRAVITY * dt, -FALL_MAX_SPEED);
  const y = state.y + vy * dt;
  const floor = supportBelow(x, z, state.y);
  if (floor !== null && y <= floor + 1e-3) return { y: floor, vy: 0, landed: floor, died: false };
  if (death !== null && y < death) return { y, vy, landed: null, died: true };
  return { y, vy, landed: null, died: false };
}

/**
 * 复活点：掉落前站的那个位置还站得住就回那里；站不住了（平台被拆掉、位置被改成空中）就在
 * 附近找一圈能站的地方，实在没有才认原地——不然会变成"复活 → 立刻又掉死"的死循环。
 */
export function respawnSpot(from: FallPoint): FallPoint {
  if (supportHeight(from.x, from.z, from.y) !== null) return { ...from };
  for (let ring = 1; ring <= 4; ring++) {
    const radius = ring * (RESPAWN_SEARCH / 4);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = from.x + Math.cos(angle) * radius, z = from.z + Math.sin(angle) * radius;
      // 用 `supportBelow`：新落点可能在几米之下（掉落前那块平台被人挪走了）。
      const y = supportBelow(x, z, from.y);
      if (y !== null) return { x, y, z };
    }
  }
  return { ...from };
}

/**
 * 本人的下落状态机（`OfficeAvatar` 只持有它）。
 *
 * `advance()` 会直接推进传进来的 `position`（含一点点空中控制，能往下一层的平台上飘），
 * 返回这一帧发生了什么，让调用方决定播什么、报什么。
 */
export class FallRig {
  private state: FallState | null = null;
  private grace = 0;
  private count = 0;
  private last: DeathInfo | null = null;

  get falling() { return this.state !== null; }
  get deaths() { return this.count; }
  get lastDeath() { return this.last; }
  get graceLeft() { return this.grace; }
  clear() { this.state = null; }
  tick(dt: number) { this.grace = Math.max(0, this.grace - dt); }

  /** 站在地上、脚下却什么都没有（平台被拆了、被放到空中）：那就开始掉。 */
  stranded(position: FallPoint) {
    if (!buildNavigationActive()) return false;
    if (buildClimbAt(position.x, position.z, position.y)) return false;
    const floor=supportBelow(position.x,position.z,position.y+0.255);
    if(floor===null || floor<position.y-0.255)return true;
    // 地板被抬高/落格时，脚点跟随近邻顶面，不留在地板内部继续穿透。
    position.y=floor;
    return false;
  }

  /** 踩空的那一脚：`from` 是踏出去之前站的位置（死亡后回到这里）。 */
  begin(from: FallPoint) {
    if (this.state) return;
    this.state = beginFall(from);
    this.grace = 0;
  }

  /** 空中一帧：空中控制 + 重力 + 落地/判死。 */
  advance(position: THREE.Vector3, keys: Set<string>, camera: THREE.Camera, dt: number, speed: number):
  'air' | 'landed' | 'died' {
    const state = this.state!;
    const direction = walkDirection(keys, heading(camera));
    if (direction.lengthSq() > 0) {
      const x = position.x + direction.x * dt * speed, z = position.z + direction.z * dt * speed;
      if (clearPath(position, x, z)) { position.x = x; position.z = z; }
    }
    const tick = fallStep(state, position.x, position.z, dt, deathLine());
    state.y = tick.y;
    state.vy = tick.vy;
    position.y = tick.y;
    if (tick.landed !== null) { this.state = null; return 'landed'; }
    if (tick.died) return 'died';
    return 'air';
  }

  /** 确认死亡：记一笔，返回复活点（掉落前的位置，站不住就就近找一个）。 */
  die(): FallPoint {
    const from = this.state?.from ?? { x: 0, y: 0, z: 0 };
    this.state = null;
    this.grace = RESPAWN_GRACE;
    this.count++;
    const spot = respawnSpot(from);
    this.last = { from: { ...from }, spot, deathY: deathLine(), deaths: this.count };
    return spot;
  }
}
