// Metres. Furniture envelope follows the hall's .25 m grid; cloth/balls use physical dimensions.
export const TABLE = Object.freeze({ halfX: 1.4, halfZ: .7, radius: .06, pocketRadius: .135,
  width: 3.5, depth: 2.25, height: 1, maxSpeed: 5.5, friction: .38, restitution: .96, cushion: .82 });
// On the existing coral platform: its saved base is 5.5 and its slab is .12 m thick.
export const PLACEMENT = Object.freeze({ x: 6, y: 5.62, z: -7.875 });
export const POCKETS = [-TABLE.halfX, 0, TABLE.halfX].flatMap(x => [-TABLE.halfZ, TABLE.halfZ].map(z => ({ x, z })));
export function createRack() {
  const balls = [{ id: 0, x: -.75, z: 0, vx: 0, vz: 0, pocketed: false }];
  const order = [1, 9, 2, 10, 8, 3, 4, 11, 5, 12, 6, 13, 7, 14, 15];
  let i = 0;
  for (let row = 0; row < 5; row++) for (let col = 0; col <= row; col++) {
    balls.push({ id: order[i++], x: .4 + row * TABLE.radius * Math.sqrt(3) * 1.015,
      z: (col - row / 2) * TABLE.radius * 2.03, vx: 0, vz: 0, pocketed: false });
  }
  return balls.sort((a, b) => a.id - b.id);
}
