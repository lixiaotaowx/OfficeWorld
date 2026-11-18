// The shared part library (part-library.json) as the server sees it: which kinds exist, how big each is,
// which colours may be chosen, and what a kind does (holds documents, is a seat, is a workstation...).
import { readFileSync } from 'node:fs';

export const library = JSON.parse(readFileSync(new URL('./part-library.json', import.meta.url), 'utf8'));
export const PALETTE = Object.values(library.palette);
const byId = new Map(library.parts.map(part => [part.id, part]));
export const partDef = kind => byId.get(kind) || null;

// a part's size: the box around all of its boxes and round shapes, in metres (width, height, depth)
function measure(def) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  const add = (cx, cy, cz, hx, hy, hz) => {
    x0 = Math.min(x0, cx - hx); x1 = Math.max(x1, cx + hx);
    y0 = Math.min(y0, cy - hy); y1 = Math.max(y1, cy + hy);
    z0 = Math.min(z0, cz - hz); z1 = Math.max(z1, cz + hz);
  };
  for (const [w, h, d, x, y, z] of def.boxes || []) add(x, y, z, w / 2, h / 2, d / 2);
  if (def.arch) {
    const { outerRadius, springHeight, depth } = def.arch;
    const height = springHeight + outerRadius;
    add(0, height / 2, 0, outerRadius, height / 2, depth / 2);
  }
  for (const [shape, r, ...rest] of def.shapes || []) {
    if (shape === 'cyl') { const [h, x, y, z] = rest; add(x, y, z, r, h / 2, r); }
    else if (shape === 'disc') { const [x, y, z] = rest; add(x, y, z, r, 0.025, r); }
    else if (shape === 'cone') { const [x, y, z] = rest; add(x, y, z, r, 0.13, r); }
    else { const [x, y, z] = rest; add(x, y, z, r, r, r); }
  }
  const round = n => Math.round(n * 1000) / 1000;
  return [round(x1 - x0), round(y1 - y0), round(z1 - z0)];
}
const sizes = new Map(library.parts.map(part => [part.id, measure(part)]));
export const sizeOf = kind => sizes.get(kind) || null;

// what a kind is for
export const holdsDocs = kind => Boolean(partDef(kind)?.holds || partDef(kind)?.notes);
export const isWorkstation = kind => Boolean(partDef(kind)?.workstation);
export const seatCountOf = kind => { const seat = partDef(kind)?.seat; return seat ? seat.count || 1 : 0; };
export const isCinema = kind => Boolean(partDef(kind)?.cinema);
