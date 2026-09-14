import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as THREE from 'three';
const source = readFileSync(new URL('../src/navigation.ts', import.meta.url), 'utf8')
  .replace(/export \{ chairSeats \} from "\.\/seats";/, '');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText.replace('"three"', JSON.stringify(import.meta.resolve('three')));
const {findPath, walkable, segmentWalkable} = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const v = (x,z) => new THREE.Vector3(x,0,z);

test('每个公共坐位的入座通道可达，离座后能返回主通道', () => {
  const spots = JSON.parse(readFileSync(new URL('../public-seats.json', import.meta.url)));
  for (const spot of spots) {
    const end = v(spot.stand.x, spot.stand.z);
    assert.ok(walkable(end.x, end.z), `${spot.id}: approach blocked`);
    assert.ok(findPath(v(4,4), end).length, `${spot.id}: cannot approach`);
    assert.ok(findPath(end, v(4,4)).length, `${spot.id}: cannot leave`);
  }
});
test('老板房门口、桌侧通道与椅后可双向通行，路径不穿碰撞核心', () => {
  const targets = [v(7.2,-4.3),v(7.1,-5.8),v(8.65,-7.68)];
  for (const target of targets) {
    for (const [start,end] of [[v(4,-2.7),target],[target,v(4,-2.7)]]) {
      const path=findPath(start,end);
      assert.ok(path.length, `no path ${start.toArray()} -> ${end.toArray()}`);
      let previous=start;
      for(const point of path) {
        assert.ok(segmentWalkable(previous.x,previous.z,point.x,point.z));
        previous=point;
      }
      assert.ok(previous.distanceTo(end)<0.001);
    }
  }
});
test('碰撞余量减小，但桌子中心、隔墙及楼外仍不可穿过', () => {
  assert.equal(walkable(7.1,-5.8),true);
  assert.equal(walkable(8.5,-5.5),false);
  assert.equal(walkable(11,0),false);
  assert.equal(segmentWalkable(6.2,-5,6.95,-5),false);
});
