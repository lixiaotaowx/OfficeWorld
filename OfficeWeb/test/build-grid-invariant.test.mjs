import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as THREE from 'three';
import { loadTs } from './helpers.mjs';
import { createBuildStore, catalog, BUILD_GRID, offGridParts } from '../build-store.mjs';

/**
 * **"部件永远整格"这条不变量**（用户 2026-10-09：「将来确保不会有步长不统一的部件 所以就不需要
 * 对齐网格的按钮 … 根源修复 而不是打补丁」）。
 *
 * 三层保证，这里逐层验：
 *  ① 服务端 `build-store.mjs` 的 `cleanPart()`：**唯一**的写入闸门，任何 add/move/moveMany/duplicate
 *     （以及撤销重放）写进来的 x/z 都被落格——旧客户端、漏改的路径都跑不出去；
 *  ② 客户端纯函数层：贴面（接触轴原来是毫米级）、顶面辅助吸附、两侧搭桥、拖动、复制落点，
 *     出去的值都在网格上（预览＝存档，不会"存下来才跳一下"）；
 *  ③ 老存档一次性迁移：启动时把历史上已经离格的部件整盘回格，原文件另存备份。
 *
 * **y 不在不变量里**：接触高度/桌面高度是毫米级的（1.42m 桌面、0.34m 方块顶、地下 −1.855 那一簇），
 * 强行取整会让叠着的东西浮起或陷进去；y 的**步长**仍由 `snapMove` 保证整格。
 */
const urls = new Map();
const { snapHorizontal, gridSnap, onHorizontalGrid } = await import(await loadTs('buildGrid.ts', urls));
const { fitToSurface, fitToPlane } = await import(await loadTs('buildSurface.ts', urls));
const { gapPlacement } = await import(await loadTs('buildGapPlacement.ts', urls));
const { topPlacement } = await import(await loadTs('buildTopPlacement.ts', urls));
const { snapMove } = await import(await loadTs('buildMoveSnap.ts', urls));
const { copyDropPoint } = await import(await loadTs('buildCopyDrop.ts', urls));

const user = { id:'grid-qa', name:'网格自查' };
const base = kind => ({ id:'p', version:1, kind, color:'#f3dfc5', x:4.11, y:1.37, z:-2.09, rotation:0 });
const near = (value, target, tolerance=.13) => Math.abs(value-target) <= tolerance;
const assertGrid = (part, label) => assert.equal(onHorizontalGrid(part), true,
  `${label} 必须在 0.25 网格上（x=${part?.x}, z=${part?.z}）`);
const store = () => createBuildStore(join(mkdtempSync(join(tmpdir(),'box-grid-')),'world.json'));

test('服务端闸门：add / move / moveMany / duplicate 都写不进离格的 x/z', () => {
  const s = store();
  // 只给毫米级 x/z（旧客户端就是这样发的）：存下来必须是整格，y 原样。
  const added = s.mutate({ action:'add', part:{ ...base('block'), x:5.11, y:.105, z:-2.19 } }, user).changed;
  assert.equal(added.x, 5); assert.equal(added.z, -2.25);
  assert.equal(added.y, .105, 'y 是接触高度，不许被取整');
  const moved = s.mutate({ action:'move', id:added.id, version:added.version,
    part:{ ...added, x:6.03, z:-3.12 } }, user).changed;
  assert.equal(moved.x, 6); assert.equal(moved.z, -3);
  const many = s.mutate({ action:'moveMany', items:[{ id:moved.id, version:moved.version,
    part:{ ...moved, x:7.13, z:-4.06 } }] }, user);
  assert.equal(many.changedMany[0].x, 7.25); assert.equal(many.changedMany[0].z, -4);
  const copy = s.mutate({ action:'duplicate', id:moved.id, version:many.changedMany[0].version }, user).changed;
  assertGrid(copy, '副本');
  assert.equal(offGridParts(s.snapshot().parts).length, 0, '整份存档里一件离格的都不能有');
});

test('客户端纯函数：贴面/顶面/搭桥/拖动/复制落点，出去的值都在网格上', () => {
  for (const item of catalog) {
    const part = base(item.id);
    // 竖直面贴面：接触轴（x）以前写的是毫米值——这正是老存档 0.125 偏置的来源之一。
    // 注意落点位移里还含部件自身的半宽（地板就有 2m），所以"附近"的容差按最大半宽 + 半格给。
    const wall = new THREE.Object3D();
    const vertical = fitToSurface(part, { point:new THREE.Vector3(9.173, 1.1, -2.06), object:wall,
      face:{ normal:new THREE.Vector3(1,0,0) } }, 0, 'auto', new THREE.Box3(new THREE.Vector3(9.2,0,-6),new THREE.Vector3(9.5,3,4)));
    assertGrid(vertical, `${item.id} 竖直贴面`);
    assert.equal(near(vertical.x, 9.173, 2.6), true, `${item.id} 贴面只能贴在墙面附近`);
    // 地面/顶面放置（普通放置走的就是这条）。
    const floor = fitToSurface(part, { point:new THREE.Vector3(3.13, .34, -1.06), object:wall,
      face:{ normal:new THREE.Vector3(0,1,0) } }, 0);
    assertGrid(floor, `${item.id} 地面放置`);
    // 手动高度：调用方先把 y 写成手动高度再贴面（`buildInteraction` 就是这么用的），水平仍然整格。
    const manual = fitToSurface({ ...part, y:2.75 }, { point:new THREE.Vector3(3.13, .34, -1.06), object:wall,
      face:{ normal:new THREE.Vector3(0,1,0) } }, 2.75);
    assertGrid(manual, `${item.id} 手动高度放置`);
    assert.equal(manual.y, 2.75, `${item.id} 手动高度要保住`);
    // 两侧搭桥：两根柱子中间搭梁（老存档那簇 0.125 就是这里来的）。
    const ray = new THREE.Ray(new THREE.Vector3(4.11,6,-2.09), new THREE.Vector3(0,-1,0));
    const bridge = gapPlacement(part, ray, [
      { id:'a', box:new THREE.Box3(new THREE.Vector3(2.875,0,-2.5),new THREE.Vector3(3.125,3,-2)) },
      { id:'b', box:new THREE.Box3(new THREE.Vector3(5.125,0,-2.5),new THREE.Vector3(5.375,3,-2)) },
    ], Infinity, 'auto');
    if (bridge) { assertGrid(bridge, `${item.id} 两侧搭桥`); }
    // 拖动：**被拖的那条轴**一定落在网格上（另一条轴按设计不动——世界里它本来就在网格上，
    // 那是迁移 + 服务端闸门保证的，`snapMove` 只负责当前这条轴）。
    for (const axis of ['x','z']) for (const delta of [-.37,.13,.26,.62,-1.04]) {
      const { part:stepped } = snapMove(part, delta, axis, [], []);
      assert.equal(Math.abs(stepped[axis]-gridSnap(stepped[axis]))<1e-9, true,
        `${item.id} 拖动 ${axis} ${delta} 要落在网格上（${stepped[axis]}）`);
    }
    // 起点已经整格（不变量成立后存档里只有这种）：拖完仍然整格，而且位移正好整数格。
    const solid = { ...base(item.id), x:4.25, z:-2 };
    for (const axis of ['x','z']) for (const delta of [-.37,.13,.62]) {
      const { part:stepped } = snapMove(solid, delta, axis, [], []);
      assertGrid(stepped, `${item.id} 整格起点拖动 ${axis}`);
      assert.equal(Math.abs((stepped[axis]-solid[axis])/BUILD_GRID % 1) < 1e-9, true,
        `${item.id} 位移要正好整数格`);
    }
    // 复制落点（Shift+D 跟鼠标）：落在网格上，且不保留原件的小数偏置。
    const drop = copyDropPoint(part, new THREE.Ray(new THREE.Vector3(0,8,0), new THREE.Vector3(.4,-1,.3).normalize()));
    assertGrid(drop, `${item.id} 复制落点`);
  }
});

test('顶面辅助吸附（14 像素内取到真实边缘）出去的值也在网格上', () => {
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 200);
  camera.position.set(1.05, 12, 1.05);
  camera.lookAt(new THREE.Vector3(1.05, 0, 1.05));
  camera.updateMatrixWorld(true);
  const supports = [{ id:'post', box:new THREE.Box3(new THREE.Vector3(.13,0,.13), new THREE.Vector3(1.13,.25,1.13)) }];
  // 射线擦着柱子顶角过去（屏幕上离角点约 9 像素，正好进 14 像素的辅助吸附范围）。
  const ray = new THREE.Ray(new THREE.Vector3(1.05,10,1.05), new THREE.Vector3(0,-1,0));
  const snapped = topPlacement(base('block'), ray, supports, camera, 900, 900, Infinity);
  assert.ok(snapped, '顶面辅助吸附要对这根柱子的顶角生效');
  assertGrid(snapped, '顶面辅助吸附');
  assert.equal(near(snapped.x, .63, .5), true, '落点还在这根柱子附近（没有被甩走）');
});

test('老存档一次性迁移：离格件整盘回格，原文件另存，y 与件数都不动', () => {
  const dir = mkdtempSync(join(tmpdir(),'box-migrate-'));
  const path = join(dir,'world.json');
  const parts = [
    { id:'a', kind:'block', color:'#f3dfc5', x:1.11, y:.105, z:-2.19, rotation:0, version:1 },
    { id:'b', kind:'beam', color:'#f3dfc5', x:-20.875, y:0, z:12.75, rotation:0, version:1 },
    { id:'c', kind:'floor', color:'#f3dfc5', x:3, y:0, z:4, rotation:0, version:1 },
  ];
  writeFileSync(path, JSON.stringify({ revision:7, editableScene:1, parts, chests:{} }));
  const s = createBuildStore(path);
  const after = s.snapshot().parts;
  assert.equal(after.length, 3, '迁移不许增删部件');
  assert.equal(offGridParts(after).length, 0, '迁移后世界里不该再有离格件');
  assert.deepEqual([after[0].x, after[0].z],[1,-2.25]);
  assert.equal(after[0].y, .105, 'y 一个字节都不动');
  assert.deepEqual([after[1].x, after[1].z],[-20.75,12.75],'那簇 -20.875 的梁回到整格');
  assert.deepEqual([after[2].x, after[2].z],[3,4],'本来就在格上的不动');
  const backup = path + '.before-grid.json';
  assert.equal(existsSync(backup), true, '迁移前要留一份原文件');
  assert.equal(JSON.parse(readFileSync(backup,'utf8')).parts[0].x, 1.11, '备份是原样的');
  assert.equal(s.snapshot().revision, 8, '迁移算一次版本推进，客户端会重新拉取');
  // 幂等：再开一次不会再写备份、也不会再推进版本。
  assert.equal(createBuildStore(path).snapshot().revision, 8);
});

test('snapHorizontal 只动水平两轴、可反复调用', () => {
  const part = { ...base('block'), x:1.13, y:.105, z:-2.19, scale:[2,1,1] };
  const once = snapHorizontal(part);
  assert.deepEqual([once.x, once.z],[1.25,-2.25]);
  assert.equal(once.y, .105);
  assert.deepEqual(once.scale, [2,1,1], '其它字段原样带过');
  assert.deepEqual(snapHorizontal(once), once, '已经整格的不再变');
  assert.equal(gridSnap(1.13), 1.25);
  assert.equal(BUILD_GRID, .25);
  assert.equal(catalog.every(item => item.size.every(n => n > 0)), true);
});
