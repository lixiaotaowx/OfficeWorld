const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');
const output = path.resolve('Build/Audit/return-seat.cjs');
fs.mkdirSync(path.dirname(output), { recursive: true });
esbuild.buildSync({
  stdin: { resolveDir: path.resolve('OfficeWeb'), loader: 'ts', contents: `
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { OfficeAvatar } from './src/OfficeAvatar';
import { WORKSTATIONS } from './src/seats';
import { AutoSitPose } from './src/autoSitPose';
const timer = new AutoSitPose(() => 0);
assert.equal(timer.update(500, false, 'standard'), null);
assert.equal(timer.update(44, true, 'standard'), null);
const changed = timer.update(1, true, 'standard');
assert.ok(changed && changed !== 'standard');
assert.equal(timer.update(44, true, changed), null);
assert.notEqual(timer.update(1, true, changed), changed);
globalThis.window = { addEventListener(){}, removeEventListener(){} } as any;
for (const seat of WORKSTATIONS) {
 const actor: any = new OfficeAvatar(new THREE.Scene(), new THREE.PerspectiveCamera(), () => {});
 actor.model = new THREE.Group();
 actor.clock.getDelta = () => .05;
 const finish = () => { for(let i=0;i<1200;i++)actor.update(); };
 actor.sit(seat.index); finish();
 assert.equal(actor.getState().sitting,true,seat.label+' initial arrival');
 actor.keydown({code:'KeyW',target:{closest:()=>false},preventDefault(){}});
 for(let i=0;i<30;i++)actor.update();
 actor.keyup({code:'KeyW'});
 assert.equal(actor.getState().sitting,false,seat.label+' WASD stands');
 actor.sit(seat.index); finish();
 assert.equal(actor.getState().sitting,true,seat.label+' return');
 assert.ok(Math.abs(actor.getState().x-seat.chair.x)<.001);
 assert.ok(Math.abs(actor.getState().z-seat.chair.z)<.001);
 actor.dispose();
}
console.log('PASS: 8 seats, initial seating, WASD stand-up and return-to-seat');
` }, bundle: true, platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent',
});
require(output);

