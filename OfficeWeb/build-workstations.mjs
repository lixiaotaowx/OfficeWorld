// Workstations are the desk parts in the world. Each desk keeps one number for as long as it exists, so a
// workstation someone has claimed stays theirs when the desk is moved. Numbers start at 0 in the order desks appear.
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { isWorkstation } from './part-library.mjs';

export function createBuildWorkstations(path, parts) {
  const ids = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
  if (!ids || Array.isArray(ids) || Object.values(ids).some(n => !Number.isSafeInteger(n) || n < 0)
    || new Set(Object.values(ids)).size !== Object.values(ids).length) throw Error('Invalid workstation index');
  const list = () => {
    let dirty = false, next = Math.max(-1, ...Object.values(ids)) + 1;
    const desks = parts().filter(p => isWorkstation(p.kind) && !p.pitch && !p.roll);
    for (const p of desks) if (ids[p.id] === undefined) { ids[p.id] = next++; dirty = true; }
    if (dirty) { writeFileSync(path + '.next', JSON.stringify(ids)); renameSync(path + '.next', path); }
    return desks.map(p => ({ ...p, seatIndex: ids[p.id] }));
  };
  return {
    list,
    index: id => list().find(p => p.id === id)?.seatIndex,
    valid: index => list().some(p => p.seatIndex === index),
    count: () => Math.max(0, ...list().map(p => p.seatIndex + 1)),
    decorate: value => {
      if (!Array.isArray(value.parts)) return value;
      const rows = new Map(list().map(p => [p.id, p.seatIndex]));
      return { ...value, parts: value.parts.map(p => (rows.has(p.id) ? { ...p, seatIndex: rows.get(p.id) } : p)) };
    },
    // the hall replaced the old world: old desk numbers mean nothing any more
    clear: () => { for (const key of Object.keys(ids)) delete ids[key]; writeFileSync(path + '.next', '{}'); renameSync(path + '.next', path); },
  };
}
