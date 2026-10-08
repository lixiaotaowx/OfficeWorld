import { fixtureFor } from './buildFixtures';
import catalog from '../build-catalog.json';
export type ChestPerson = { id: string; name: string; appearance?: unknown; at?: number };
export type ChestPeople = { creator?: ChestPerson; readers: ChestPerson[] };
export { catalog };
export const palette = ['#f3dfc5', '#e9b8b5', '#b9c9df', '#b4c5a0', '#cabddd', '#c69770', '#596679'];
export type BuildPart = {
  id: string; kind: string; color: string; seatIndex?: number;
  chestPeople?: ChestPeople; fixture?: string; fixtureCopy?: boolean;
  scale?: [number, number, number];
  x: number; y: number; z: number; rotation: number; pitch?: number; roll?: number; version: number;
};
export type BuildSnapshot = { revision: number; parts: BuildPart[] };
export type ChestEntry = {
  id: string; type: 'link' | 'image' | 'note'; title: string; value: string;
  author: string; owner: string; at: number;
};
export type BuildMode = 'explore' | 'place' | 'move' | 'remove';
export type BuildAnchor = 'auto' | 'start' | 'side-start' | 'end' | 'side-end' | 'center';
export const anchorLabels: Record<BuildAnchor,string> = {auto:'自动',start:'底边 1','side-start':'底边 2',end:'底边 3','side-end':'底边 4',center:'中心'};
export function nextAnchor(anchor: BuildAnchor = 'auto'): BuildAnchor {
  const choices: BuildAnchor[] = ['auto','start','side-start','end','side-end','center'];
  return choices[(choices.indexOf(anchor)+1)%choices.length];
}
export type BuildSettings = { mode: BuildMode; kind: string; color: string; rotation: number; pitch?: number; roll?: number; height: number; anchor?: BuildAnchor };
export function partSize(part: Pick<BuildPart, 'kind' | 'rotation' | 'pitch' | 'roll' | 'scale' | 'fixture'>) {
  const item = catalog.find(item => item.id === part.kind);
  let [x,y,z] = fixtureFor(part)?.dimensions || (part.pitch || part.roll ? item?.dimensions : item?.size) || [1,1,1];
  [x,y,z]=[x,y,z].map((n,i)=>n*(part.scale?.[i] ?? 1));
  if ((part.roll || 0)%2) [x,y]=[y,x];
  if ((part.pitch || 0)%2) [y,z]=[z,y];
  return part.rotation%2 ? [z,y,x] : [x,y,z];
}
export function placementError(part: BuildPart) {
  if (![part.x, part.y, part.z].every(n => Number.isFinite(n) && Number.isSafeInteger(Math.round(n*1000))
    && Math.abs(n*1000-Math.round(n*1000)) < 0.001))
    return '位置无效';
  return '';
}
