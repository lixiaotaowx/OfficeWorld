/** M2 experimental physiology, not a policy. No action or destination is returned.
 * Parameters are provisional until pretraining; freeze them at the real birth. */
export const DRIVE_KEYS = Object.freeze(['energy', 'boredom', 'socialNeed', 'comfort', 'tension']);
export const PHYSIOLOGY = Object.freeze({ awakeCost: 1 / 14400, movementCost: 1 / 7200,
  sleepRecovery: 1 / 3600, boredomRise: 1 / 3600, noveltyRelief: 1 / 180,
  loneliness: 1 / 7200, companyRelief: 1 / 900, comfortRecovery: 1 / 1800,
  stressRecovery: 1 / 1200, chaseStress: 1 / 30, crowdStress: 1 / 120,
  petRelief: .025, disturbance: .04, negativeWeight: 1.4 });
const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));
export const initialDrives = () => ({ energy: .8, boredom: .2, socialNeed: .2, comfort: .7, tension: .1 });
export function validDrives(value) {
  return Boolean(value && DRIVE_KEYS.every(k => Number.isFinite(value[k]) && value[k] >= 0 && value[k] <= 1));
}
export function stepDrives(before, body, environment, dt) {
  if (!validDrives(before) || !Number.isFinite(dt) || dt <= 0 || dt > 1) throw Error('Invalid physiology step');
  const c = PHYSIOLOGY, sleeping = body.pose === 'sleep';
  const chase = clamp(environment.chase), company = clamp(environment.company);
  const novelty = clamp(environment.novelty), soft = clamp(environment.soft);
  const crowd = clamp(environment.crowd), pets = clamp(environment.pets, 0, 4);
  const disturbed = sleeping || before.tension >= .65;
  const next = {
    energy: clamp(before.energy + dt * (sleeping ? c.sleepRecovery * (1 + soft * .5) : -c.awakeCost - (body.moving ? c.movementCost : 0))),
    boredom: clamp(before.boredom + dt * (c.boredomRise - novelty * c.noveltyRelief)),
    socialNeed: clamp(before.socialNeed + dt * ((1 - company) * c.loneliness - company * c.companyRelief * (1 - before.tension)) - (disturbed ? 0 : pets * c.petRelief)),
    comfort: clamp(before.comfort + dt * (c.comfortRecovery * (1 - chase) - chase * c.chaseStress) - (disturbed ? pets * c.disturbance : 0)),
    tension: clamp(before.tension + dt * (chase * c.chaseStress + crowd * c.crowdStress - c.stressRecovery * (sleeping ? 1.5 : 1)) + (disturbed ? pets * c.disturbance : 0)),
  };
  const changes = [next.energy-before.energy, before.boredom-next.boredom, before.socialNeed-next.socialNeed,
    next.comfort-before.comfort, before.tension-next.tension];
  const reward = changes.reduce((total, delta) => total + delta * (delta < 0 ? c.negativeWeight : 1), 0);
  return { drives: next, reward };
}

// 5 drives, 5 poses, height, 16 horizontal ray distances, 3 × 7 person features,
// elapsed-company time and time-of-day sin/cos. Identity embeddings belong to M3.
export const OBSERVATION_SIZE = 51;
export function perceive(body, drives, solids, people = [], secondsAlone = 0, timeMs = 0) {
  const nearest = people.filter(p => [p.x,p.y,p.z,p.vx,p.vz].every(Number.isFinite))
    .map(p => ({ x:p.x-body.x, y:p.y-body.y, z:p.z-body.z, vx:p.vx, vz:p.vz }))
    .sort((a,b) => Math.hypot(a.x,a.y,a.z)-Math.hypot(b.x,b.y,b.z)).slice(0,3);
  let company = 0, chase = 0, count = 0;
  const features = nearest.flatMap(p => {
    const distance = Math.hypot(p.x,p.y,p.z), speed = Math.hypot(p.vx,p.vz);
    const approaching = -(p.x*p.vx+p.z*p.vz)/Math.max(.01,Math.hypot(p.x,p.z));
    if (distance < 1.8 && Math.abs(p.y) < .8) { count++; company = Math.max(company, clamp(1-speed)); }
    if (distance < 3 && Math.abs(p.y) < .8) chase = Math.max(chase, clamp(approaching/2));
    return [clamp(p.x/8,-1,1),clamp(p.y/4,-1,1),clamp(p.z/8,-1,1),clamp(distance/8),clamp(speed/3),clamp(approaching/3,-1,1),1];
  });
  while (features.length < 21) features.push(0);
  const rays = Array.from({length:16},(_,i) => {
    const dx = Math.sin(i*Math.PI/8), dz = Math.cos(i*Math.PI/8);
    let nearest = 4;
    for (const b of solids) {
      if (b.y1 <= body.y+.06 || b.y0 >= body.y+.46) continue;
      let near = 0, far = 4;
      for (const [origin,direction,min,max] of [[body.x,dx,b.x0,b.x1],[body.z,dz,b.z0,b.z1]]) {
        if (Math.abs(direction)<1e-9) { if (origin<min||origin>max) far=-1; continue; }
        const a=(min-origin)/direction, z=(max-origin)/direction;
        near=Math.max(near,Math.min(a,z)); far=Math.min(far,Math.max(a,z));
      }
      if (far>=near) nearest=Math.min(nearest,near);
    }
    return clamp(nearest/4);
  });
  const phase = ((timeMs/1000)%86400)/86400*2*Math.PI;
  return { vector:[...DRIVE_KEYS.map(k => drives[k]*2-1), ...['stand','sit','lie','sleep','groom'].map(p => body.pose===p?1:0),
    clamp(body.y/3),...rays,...features,clamp(Math.log1p(Math.max(0,secondsAlone))/Math.log1p(86400)),Math.sin(phase),Math.cos(phase)],
    environment:{company,chase,crowd:clamp((count-1)/2)} };
}
