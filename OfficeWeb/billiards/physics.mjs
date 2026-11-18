import { TABLE, POCKETS } from './table.mjs';
export const FIXED_STEP = 1 / 240;
const STOP_SPEED = .025;
export const moving = balls => balls.some(b => !b.pocketed && (b.vx !== 0 || b.vz !== 0));
/** Equal-mass impulses and positional correction. Server is the sole simulation authority. */
export function stepBalls(balls, dt = FIXED_STEP) {
  const fallen = [], r = TABLE.radius;
  for (const b of balls) {
    if (b.pocketed) continue;
    b.x += b.vx * dt; b.z += b.vz * dt;
    if (POCKETS.some(p => Math.hypot(b.x - p.x, b.z - p.z) < TABLE.pocketRadius)) {
      b.pocketed = true; b.vx = b.vz = 0; fallen.push(b.id); continue;
    }
    for (const [pos, vel, edge] of [['x','vx',TABLE.halfX-r], ['z','vz',TABLE.halfZ-r]]) {
      if (Math.abs(b[pos]) > edge) {
        const side = Math.sign(b[pos]); b[pos] = side * edge;
        if (b[vel] * side > 0) b[vel] = -b[vel] * TABLE.cushion;
      }
    }
  }
  // Two solver passes settle the tightly packed rack without leaving overlapping balls.
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
    const a = balls[i], b = balls[j]; if (a.pocketed || b.pocketed) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx,dz);
    if (d >= 2*r) continue;
    const nx = d > 1e-9 ? dx/d : 1, nz = d > 1e-9 ? dz/d : 0;
    const correction = (2*r - d + 1e-7) / 2;
    a.x -= nx*correction; a.z -= nz*correction; b.x += nx*correction; b.z += nz*correction;
    const approach = (a.vx-b.vx)*nx + (a.vz-b.vz)*nz;
    if (approach > 0) {
      const impulse = (1+TABLE.restitution)*approach/2;
      a.vx -= impulse*nx; a.vz -= impulse*nz; b.vx += impulse*nx; b.vz += impulse*nz;
    }
  }
  for (const b of balls) {
    if (b.pocketed) continue;
    const speed = Math.hypot(b.vx,b.vz), next = Math.max(0,speed-TABLE.friction*dt);
    if (next < STOP_SPEED) b.vx = b.vz = 0;
    else { b.vx *= next/speed; b.vz *= next/speed; }
  }
  return fallen;
}
export function restoreCue(balls) {
  const cue = balls.find(b=>b.id===0); if (!cue?.pocketed) return;
  for (let x = -.8; x < TABLE.halfX-TABLE.radius; x += TABLE.radius*2.2) {
    for (const z of [0,-.15,.15,-.3,.3,-.45,.45]) {
      if (balls.some(b=>b.id!==0&&!b.pocketed&&Math.hypot(b.x-x,b.z-z)<TABLE.radius*2.05)) continue;
      Object.assign(cue,{x,z,vx:0,vz:0,pocketed:false}); return;
    }
  }
}
