import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { loadTs } from './helpers.mjs';

/**
 * 掉落 / 死亡 / 原地复活（用户 2026-10-09：「添加掉落机制，可以走下去掉落到最低的部件组合之下
 * 就宣布死亡，然后再掉落前的位置，也就是可以跳到下一层建筑上原地复活」）。
 *
 * 场地（都在 x=100 这一带，跟初始岛屿无关）：
 *   高台 block(100,6,0) scale[4,0.25,4] → 顶面 6.25（z ∈ [-2,2]）
 *   下层 block(100,3,4) scale[4,0.25,4] → 顶面 3.25（z ∈ [2,6]）
 *   最深的锚点 block(140,-4,0) → 底面 -4 ⇒ 判死线 -4.5（DEATH_DEPTH=0.5）
 */
const urls = new Map();
const nav = await import(await loadTs('buildNavigation.ts', urls));
const fall = await import(await loadTs('avatarFall.ts', urls));
const walk = await import(await loadTs('avatarWalk.ts', urls));
const { setBuildSolids, setBuildClimbs, supportBelow, supportHeight, buildStepOff } = nav;
const { FallRig, beginFall, fallStep, deathLine, respawnSpot, FALL_GRAVITY, RESPAWN_GRACE } = fall;
const { walkStep } = walk;

const box = (x, y, z, w, h, d) => ({ min: { x: x - w / 2, y, z: z - d / 2 }, max: { x: x + w / 2, y: y + h, z: z + d / 2 } });
const HIGH_TOP = 6.25, LOW_TOP = 3.25, DEATH = -4.5;

function world(extra = []) {
  setBuildSolids([box(100, 6, 0, 4, 0.25, 4), box(100, 3, 4, 4, 0.25, 4), box(140, -4, 0, 1, 1, 1), ...extra]);
}

/** 一直掉到落地或掉死（最多 5 秒）。 */
function fallUntil(x, z, from, tick = 1 / 60) {
  let state = beginFall({ x, y: from, z });
  for (let i = 0; i < 300; i++) {
    const step = fallStep(state, x, z, tick, deathLine());
    state = { ...state, y: step.y, vy: step.vy };
    if (step.landed !== null || step.died) return { ...step, frames: i + 1 };
  }
  return { y: state.y, vy: state.vy, landed: null, died: false, frames: 300 };
}

test('判死线 = 最低部件底面再往下一点；下面最高的一层地能问出来', () => {
  world();
  try {
    assert.equal(nav.lowestSolidBottom(), -4, '最低那一件是锚点（底面 -4）');
    assert.equal(deathLine(), DEATH);
    assert.equal(supportBelow(100, 4, 6.125), LOW_TOP, '高台外侧往下问得到下层平台');
    assert.equal(supportBelow(100, 20, 6.125), null, '什么楼板都没有的地方问出来是 null');
    assert.equal(supportHeight(100, 0, HIGH_TOP), HIGH_TOP, '原地站着还是有地面的');
  } finally { setBuildSolids(null); }
});

test('走出边缘：可以踏空；撞墙仍然走不过去', () => {
  world();
  try {
    const camera = { getWorldDirection: out => out.set(0, 0, 1) };
    const keys = new Set(['KeyW']);
    // 站在高台边上继续往 +Z 走：下一步就出边缘 → falling。
    const step = walkStep(new THREE.Vector3(100, HIGH_TOP, 1.99), keys, camera, 1 / 60, 1.65);
    assert.equal(step.falling, true, '边缘外没有地面 → 这一脚要踏空');
    assert.ok(step.position.z > 2, `人要真的迈到边缘外面（z=${step.position.z}）`);
    assert.equal(step.position.y, HIGH_TOP, '踏空那一帧高度还没变（重力在 avatarFall）');
    // 高台边缘外 3m 处立一堵墙（顶面 9m）：那是墙，不是边缘。
    setBuildSolids([box(100, 6, 0, 4, 0.25, 4), box(100, 6, 1.5, 4, 6, 0.4), box(140, -4, 0, 1, 1, 1)]);
    const blocked = walkStep(new THREE.Vector3(100, HIGH_TOP, 1.28), keys, camera, 1 / 60, 1.65);
    assert.equal(blocked.moving, false, '撞在墙上就该原地不动');
    assert.equal(blocked.falling, undefined);
    assert.equal(buildStepOff({ x: 100, y: HIGH_TOP, z: 1.28 }, 100, 1.4), false);
  } finally { setBuildSolids(null); }
});

test('掉到下层建筑上：落到那一层的顶面，速度归零', () => {
  world();
  try {
    const landed = fallUntil(100, 4, HIGH_TOP);
    assert.equal(landed.died, false, '下面是下层平台，不该摔死');
    assert.equal(landed.landed, LOW_TOP);
    assert.equal(landed.y, LOW_TOP);
    assert.equal(landed.vy, 0);
    // 6.125 → 3.125 是三米：1/60 步长下十几帧就该落地（重力 18m/s²）。
    assert.ok(landed.frames < 60, `三米不该掉一分钟（实测 ${landed.frames} 帧）`);
    assert.ok(Math.abs(FALL_GRAVITY - 18) < 0.001);
  } finally { setBuildSolids(null); }
});

test('掉过最低部件：宣布死亡，位置停在判死线以下', () => {
  world();
  try {
    const dead = fallUntil(100, 20, HIGH_TOP);
    assert.equal(dead.died, true, '下面什么都没有 → 掉过最低部件就该死');
    assert.equal(dead.landed, null);
    assert.ok(dead.y < DEATH, `死的时候要在判死线以下（y=${dead.y}）`);
  } finally { setBuildSolids(null); }
});

test('复活点：掉落前站的那个位置还站得住就回那里，站不住就近找一个能站的', () => {
  world();
  try {
    assert.deepEqual(respawnSpot({ x: 100, y: HIGH_TOP, z: 0 }), { x: 100, y: HIGH_TOP, z: 0 });
    // 掉落前那个点在空中的情况：半径 2m 内能找到一个支撑（这里是下层平台边缘）。
    const rescued = respawnSpot({ x: 100, y: HIGH_TOP, z: 5.5 });
    assert.equal(rescued.y, LOW_TOP, '就近落到下层平台上，而不是原地反复掉死');
    assert.ok(Math.hypot(rescued.x - 100, rescued.z - 5.5) <= 2);
    // 附近什么都没有：只能认原地（不硬造一个位置出来）。
    assert.deepEqual(respawnSpot({ x: 100, y: HIGH_TOP, z: 40 }), { x: 100, y: HIGH_TOP, z: 40 });
  } finally { setBuildSolids(null); }
});

test('状态机：脚下没地会开始掉，落地/掉死各自收尾，复活有保护期', () => {
  world();
  try {
    const rig = new FallRig();
    const camera = { getWorldDirection: out => out.set(0, 0, 1) };
    const position = new THREE.Vector3(100, HIGH_TOP, 0);
    assert.equal(rig.stranded(position), false, '站在高台上不算掉');
    assert.equal(rig.stranded(new THREE.Vector3(100, HIGH_TOP, 20)), true, '悬空就该掉');
    assert.equal(rig.stranded(new THREE.Vector3(100, HIGH_TOP, 40)), true);
    // 老场景（没有方块导航）不掉：那是固定的办公室地板。
    setBuildSolids(null);
    assert.equal(rig.stranded(new THREE.Vector3(4, 0, 4)), false);
    world();

    // 从高台边缘外（下层平台正上方）往下掉 → 落到下层。
    rig.begin(new THREE.Vector3(100, HIGH_TOP, 2.5));
    position.set(100, HIGH_TOP, 2.5);
    assert.equal(rig.falling, true);
    let result = 'air';
    for (let i = 0; i < 200 && result === 'air'; i++) {
      result = rig.advance(position, new Set(), camera, 1 / 60, 1.65);
    }
    assert.equal(result, 'landed');
    assert.equal(rig.falling, false);
    assert.equal(+position.y.toFixed(3), LOW_TOP);

    // 掉进深渊 → die() 记一笔、给保护期、回到掉落前的位置。
    rig.begin(new THREE.Vector3(100, LOW_TOP, 6.5));
    position.set(100, LOW_TOP, 6.5);
    let died = false;
    for (let i = 0; i < 400 && !died; i++) {
      died = rig.advance(position, new Set(), camera, 1 / 60, 1.65) === 'died';
    }
    assert.equal(died, true);
    const spot = rig.die();
    assert.equal(rig.deaths, 1);
    assert.equal(rig.falling, false);
    assert.equal(+rig.graceLeft.toFixed(3), RESPAWN_GRACE, '复活后有一小段不许走');
    assert.equal(spot.y, LOW_TOP, '落回下层平台那一层');
    assert.ok(Math.hypot(spot.x - 100, spot.z - 6.5) <= 2, '就在掉落前的位置附近');
    assert.equal(rig.lastDeath.deaths, 1);
    assert.equal(rig.lastDeath.from.y, LOW_TOP);
    rig.tick(RESPAWN_GRACE + 0.1);
    assert.equal(rig.graceLeft, 0, '保护期会自己走完');
  } finally { setBuildSolids(null); }
});

test('空中的横向控制：按着方向键能往平台那边飘，撞墙就停', () => {
  world();
  try {
    const rig = new FallRig();
    const camera = { getWorldDirection: out => out.set(0, 0, 1) };
    const keys = new Set(['KeyW']);
    const position = new THREE.Vector3(100, HIGH_TOP, 2.5);
    rig.begin(new THREE.Vector3(100, HIGH_TOP, 2.5));
    const before = position.z;
    rig.advance(position, keys, camera, 1 / 60, 1.65);
    assert.ok(position.z > before, '按着 W 下落时会往前飘一点');
    // 高台边缘外侧立一堵墙（占 z ∈ [2.3,2.7]、y ∈ [6,12]）：横向推进到墙前就停，垂直照掉。
    setBuildSolids([box(100, 6, 0, 4, 0.25, 4), box(100, 6, 2.5, 4, 6, 0.4), box(140, -4, 0, 1, 1, 1)]);
    rig.clear();
    const walled = new THREE.Vector3(100, HIGH_TOP, 2.05);
    rig.begin(new THREE.Vector3(100, HIGH_TOP, 2.05));
    for (let i = 0; i < 12; i++) rig.advance(walled, keys, camera, 1 / 60, 1.65);
    assert.ok(walled.z > 2.05, `空中控制还是要往前飘一点（z=${walled.z}）`);
    assert.ok(walled.z < 2.3, `墙面在 z=2.3，不许穿过去（z=${walled.z}）`);
    assert.ok(walled.y < HIGH_TOP, '垂直方向一直在往下掉');
  } finally { setBuildSolids(null); setBuildClimbs(null); }
});

test('梯子里不算"脚下没地"：抓着梯子的时候不会掉下去', () => {
  world();
  setBuildClimbs([{ min: { x: 99.6, y: 0, z: -0.25 }, max: { x: 100.4, y: 6, z: 0.25 }, normalX: 0, normalZ: 1 }]);
  try {
    const rig = new FallRig();
    assert.equal(supportHeight(100, 0, 3), null, '梯子不是地面');
    assert.equal(rig.stranded(new THREE.Vector3(100, 3, 0)), false, '在梯子柱体里不掉');
    assert.equal(rig.stranded(new THREE.Vector3(105, 3, 3)), true, '梯子外面、又没有楼板，照样掉');
  } finally { setBuildSolids(null); setBuildClimbs(null); }
});
