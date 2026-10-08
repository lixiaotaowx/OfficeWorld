import { readFileSync } from 'node:fs';
export const sceneFixtures = ['scenery','desks','chairs'].flatMap(name =>
  JSON.parse(readFileSync(new URL(`./scene-${name}.json`, import.meta.url), 'utf8')));
export const fixtureFor = part => sceneFixtures.find(row => row.id === part.fixture);
export function initialFixtures() {
  return sceneFixtures.map(row => ({id:`scene-${row.id}`,fixture:row.id,kind:row.kind,
    color:row.color,x:row.origin[0],y:row.origin[1],z:row.origin[2],rotation:0,version:1}));
}
