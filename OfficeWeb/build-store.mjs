// The shared world: every part anyone has placed, kept in one versioned save. Conflicting edits are refused
// rather than overwriting a newer change. Parts come from the shared part library (part-library.json) or
// are imported models; their contents (documents, notes, cinema videos) live beside them in the save.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { cleanCinemaContent } from './cinema-content.mjs';
import { library, partDef, sizeOf, PALETTE, holdsDocs, isCinema } from './part-library.mjs';

export const FORMAT = 2;
export const STEP_DEG = 15;            // rotation steps: 24 to a full turn
export const TURNS = 360 / STEP_DEG;
export const GRID = 0.25;              // parts slide on a 25 cm floor grid; height is free so things stack
export const palette = PALETTE;
export const catalog = library.parts;
export const MODEL_PREFIX = 'model:';
export const MODEL_ROLES = ['plain', 'holds', 'seat'];
export const modelOf = (kind, models) => typeof kind === 'string' && kind.startsWith(MODEL_PREFIX)
  ? models?.[kind.slice(MODEL_PREFIX.length)] || null : null;
export const holds = (part, models) => holdsDocs(part.kind) || modelOf(part.kind, models)?.role === 'holds';
export const gridSnap = value => Math.round(value / GRID) * GRID + 0;
const mm = value => Math.round(value * 1000) / 1000 + 0;

/** The box a part occupies in the world (width, height, depth), after its scale and rotation. */
export function dimensions(part, models) {
  const model = modelOf(part.kind, models);
  const base = model ? model.size : sizeOf(part.kind);
  if (!base) throw Error('没有这种零件');
  const s = part.scale || [1, 1, 1];
  const h = [base[0] * s[0] / 2, base[1] * s[1] / 2, base[2] * s[2] / 2];
  const rad = n => (n || 0) * STEP_DEG * Math.PI / 180;
  // yaw about y, then pitch about x, then roll about z; the extents are the sum of |R| times half-sizes
  const [cy, sy, cp, sp, cr, sr] = [Math.cos(rad(part.rotation)), Math.sin(rad(part.rotation)),
    Math.cos(rad(part.pitch)), Math.sin(rad(part.pitch)), Math.cos(rad(part.roll)), Math.sin(rad(part.roll))];
  const Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], Rx = [[1, 0, 0], [0, cp, -sp], [0, sp, cp]], Rz = [[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]];
  const mul = (a, b) => a.map((row, i) => b[0].map((_, j) => row.reduce((sum, _v, k) => sum + a[i][k] * b[k][j], 0)));
  const R = mul(Ry, mul(Rx, Rz));
  return R.map(row => mm(2 * row.reduce((sum, v, j) => sum + Math.abs(v) * h[j], 0)));
}

const turn = (value, label) => {
  if (value === undefined || value === 0) return 0;
  if (!Number.isInteger(value) || value < 0 || value >= TURNS) throw Error(`${label}要按 15° 一档`);
  return value;
};
function cleanPart(raw, models) {
  if (!raw || typeof raw !== 'object') throw Error('零件数据不对');
  const model = modelOf(raw.kind, models);
  if (typeof raw.kind === 'string' && raw.kind.startsWith(MODEL_PREFIX) && !model) throw Error('这个导入的模型已经被删掉了');
  if (!model && !partDef(raw.kind)) throw Error('没有这种零件');
  if (![raw.x, raw.y, raw.z].every(Number.isFinite) || [raw.x, raw.y, raw.z].some(n => Math.abs(n) > 10000)) throw Error('位置不对');
  if (!model && !palette.includes(raw.color)) throw Error('选一个颜色');
  const part = { kind: raw.kind, color: model ? (palette.includes(raw.color) ? raw.color : palette[0]) : raw.color,
    x: mm(raw.x), y: mm(raw.y), z: mm(raw.z), rotation: turn(raw.rotation, '转向') };
  const pitch = turn(raw.pitch, '倾斜'), roll = turn(raw.roll, '倾斜');
  if (pitch) part.pitch = pitch;
  if (roll) part.roll = roll;
  if (raw.scale !== undefined) {
    if (!Array.isArray(raw.scale) || raw.scale.length !== 3 || raw.scale.some(n => !Number.isFinite(n))) throw Error('缩放不对');
    if (model) {
      const [s] = raw.scale;
      if (raw.scale.some(n => n !== s) || s < 0.05 || s > 20) throw Error('导入的模型只能等比缩放，0.05 到 20 倍');
      if (s !== 1) part.scale = [s, s, s];
    } else {
      // Preserve metre-based resizing ratios; quantizing multipliers breaks physical steps.
      if (raw.scale.some(n => n < 0.1 - 1e-9 || n > 10 + 1e-9)) throw Error('缩放范围为 0.1 到 10 倍');
      const scale = raw.scale.map(n => Math.max(0.1, Math.min(10, n)));
      if (scale.some(n => n !== 1)) part.scale = scale;
    }
  }
  if (model && dimensions(part, models).some(n => n > 30 || n < 0.01)) throw Error('导入的模型要在 1 厘米到 30 米之间');
  return part;
}
function cleanModel(raw, user) {
  const name = String(raw?.name || '').trim();
  if (!name || name.length > 60) throw Error('模型名字 1 到 60 个字');
  if (!MODEL_ROLES.includes(raw.role)) throw Error('选一下这个模型用来做什么');
  if (typeof raw.file !== 'string' || !/^[a-f0-9-]{36}\.glb$/.test(raw.file)) throw Error('先上传模型文件');
  if (!Array.isArray(raw.size) || raw.size.length !== 3 || raw.size.some(n => !Number.isFinite(n) || n < 0.01 || n > 30))
    throw Error('模型每一边要在 1 厘米到 30 米之间');
  return { id: randomUUID(), name, role: raw.role, file: raw.file, size: raw.size.map(mm), author: user.name, owner: user.id, at: Date.now() };
}

const DEG = d => Math.round(((d % 360) + 360) % 360 / STEP_DEG) % TURNS;
/** The library hall's furniture, all of it movable: our long table, study desks, café, lounge, mezzanine. */
export function seedParts() {
  const parts = [];
  const P = (kind, x, y, z, deg = 0, color) => parts.push({ id: `hall-${parts.length}`, kind,
    color: color || library.palette[partDef(kind).color] || palette[0], x: gridSnap(x), y, z: gridSnap(z), rotation: DEG(deg), version: 1 });
  const M = 2.7;
  // the long table: four workstations side by side, stools behind them, facing into the room
  // (1.25 m apart: desks are 1.1 m wide, and tabletops must never overlap)
  for (const x of [0.75, 2, 3.25, 4.5]) { P('desk', x, 0, 1.25); P('stool', x, 0, 0.5); }
  // study desks under the mezzanine, facing the shelves
  for (const x of [0.5, 1.75, 3.75, 5]) { P('desk', x, 0, -3.25, 180, library.palette.ink); P('stool', x, 0, -2.5); }
  // the café in front
  for (const [x, z] of [[-2.25, 3.75], [0.5, 4]]) {
    P('round-table', x, 0, z);
    for (const a of [0, 120, 240]) { const r = a * Math.PI / 180; P('chair', x + Math.sin(r) * 0.75, 0, z + Math.cos(r) * 0.75, a + 180); }
  }
  // the lounge: a sofa facing a screen on a stand
  P('sofa', 4.5, 0, 3.75, 90); P('screen', 6.75, 0, 3.75, 270); P('lamp', 3.5, 0, 4.5);
  // the pinboard by the door, plants, the cabinet
  P('board', -6.5, 0, 4, 90); P('cabinet', 6.25, 0, -4.25);
  P('plant', 6.5, 0, 1.75); P('plant', -4.25, 0, 4.5); P('plant', -1.5, 0, 4.5);
  // up on the mezzanine: reading tables, the treasure chest, a document desk
  for (const x of [0.25, 2.5]) { P('table', x, M, -3.5); P('chair', x - 0.4, M, -2.75, 180); P('chair', x + 0.4, M, -2.75, 180); }
  P('chest', 6, M, -3.5, 345); P('doc-desk', 4.5, M, -3.75); P('plant', 6.5, M, -2);
  return parts;
}

export function createBuildStore(path) {
  const fresh = () => ({ format: FORMAT, revision: 1, parts: seedParts(), chests: {}, chestPeople: {}, screens: {}, models: {} });
  let state, reset = false;
  if (existsSync(path)) {
    state = JSON.parse(readFileSync(path, 'utf8'));
    if (!state || !Array.isArray(state.parts) || !Number.isInteger(state.revision)) throw Error('Invalid build save');
    if (state.format !== FORMAT) {
      // the old island world: kept beside the new hall, never deleted
      writeFileSync(path + '.before-hall.json', readFileSync(path));
      state = { ...fresh(), revision: state.revision + 1 }; reset = true;
      writeFileSync(path + '.next', JSON.stringify(state)); renameSync(path + '.next', path);
    }
  } else {
    // a new world is written at once, so the next start sees the same hall and does not reset again
    state = fresh(); reset = true;
    writeFileSync(path + '.next', JSON.stringify(state)); renameSync(path + '.next', path);
  }
  state.chests ||= {}; state.chestPeople ||= {}; state.screens ||= {}; state.models ||= {};

  const snapshot = () => ({ removedShell: state.removedShell || [], revision: state.revision, models: Object.values(state.models || {}),
    parts: state.parts.map(p => holds(p, state.models) ? { ...p, chestPeople: state.chestPeople?.[p.id] || { readers: [] } }
      : isCinema(p.kind) ? { ...p, cinemaVersion: state.screens?.[p.id]?.revision || 0 } : p) });
  const person = user => ({ id: user.id, name: user.name, appearance: user.appearance || null });
  const commit = next => {
    next.revision = state.revision + 1;
    const json = JSON.stringify(next);
    if (Buffer.byteLength(json) > 16 * 1024 * 1024) throw Error('存储满了，先清掉一些用不上的图片');
    writeFileSync(path + '.next', json); renameSync(path + '.next', path);
    state = next;
  };
  return {
    snapshot,
    wasReset: () => reset,
    screenSources() { return Object.values(state.screens || {}).map(row => row.content?.src).filter(Boolean); },
    modelFiles() { return Object.values(state.models || {}).map(m => m.file); },
    model(id) { return state.models?.[id] || null; },
    screen(id) {
      const part = state.parts.find(p => p.id === id && isCinema(p.kind));
      if (!part) throw Error('这块屏幕已经被拿走了');
      return { content: state.screens?.[id]?.content || null, version: part.version };
    },
    chest(id) {
      if (!state.parts.some(p => p.id === id && holds(p, state.models))) throw Error('Chest was removed');
      return state.chests[id] || [];
    },
    people(id) { return state.chestPeople?.[id] || { readers: [] }; },
    mutate(command, user) {
      const next = structuredClone(state);
      if (command.action === 'shell-visibility') {
        if (!/^shell-v1-(0|[1-9][0-9]{0,2})$/.test(command.id || '') || typeof command.removed !== 'boolean') throw Error('Invalid fixed building');
        const removed = new Set(next.removedShell || []);
        if (command.removed) removed.add(command.id); else removed.delete(command.id);
        next.removedShell = [...removed]; commit(next); return snapshot();
      }
      const index = next.parts.findIndex(p => p.id === command.id);
      const previous = next.parts[index];
      const previousCinema = state.screens?.[command.id]?.content;
      if (['duplicateMany', 'addMany', 'removeMany'].includes(command.action)) {
        const items = command.items;
        if (!Array.isArray(items) || !items.length || items.length > 1000) throw Error('选中的零件数量不对');
        if (command.action !== 'addMany' && new Set(items.map(i => i.id)).size !== items.length) throw Error('选中的零件重复了');
        const created = [];
        for (const item of items) {
          const old = next.parts.find(p => p.id === item.id);
          if (command.action !== 'addMany' && (!old || old.version !== item.version)) throw Error('选中的零件被别人动过了，重新选一下');
          if (command.action === 'removeMany') {
            if ((next.chests[old.id] || []).length) throw Error('先取出零件里的资料再删除');
            next.parts = next.parts.filter(p => p.id !== old.id);
            delete next.chests[old.id]; delete next.screens[old.id]; delete next.chestPeople[old.id];
          } else {
            const part = { ...cleanPart(command.action === 'duplicateMany' ? old : item.part, next.models), id: randomUUID(), version: 1 };
            next.parts.push(part);
            if (holds(part, next.models)) next.chestPeople[part.id] = { creator: person(user), readers: [] };
            const content = command.action === 'duplicateMany' ? next.screens[old.id]?.content : item.cinemaContent;
            if (isCinema(part.kind) && content) next.screens[part.id] = { content: cleanCinemaContent(content), revision: 1 };
            created.push({ part, ...(next.screens[part.id] ? { cinemaContent: next.screens[part.id].content } : {}) });
          }
        }
        commit(next); return { ...snapshot(), created };
      }
      if (command.action === 'model-add') {
        if (Object.keys(next.models).length >= 200) throw Error('最多 200 个导入的模型，先删掉用不上的');
        const model = cleanModel(command.model, user);
        next.models[model.id] = model; commit(next);
        return { ...snapshot(), model };
      }
      if (command.action === 'model-remove') {
        const model = next.models[command.modelId];
        if (!model) throw Error('这个导入的模型已经被删掉了');
        if (model.owner !== user.id) throw Error('只有导入它的人能删');
        if (next.parts.some(p => p.kind === MODEL_PREFIX + model.id)) throw Error('先把摆出去的这个模型都删掉');
        delete next.models[model.id]; commit(next);
        return snapshot();
      }
      if (command.action === 'moveMany') {
        const items = command.items;
        if (!Array.isArray(items) || !items.length || items.length > 1000) throw Error('选中的零件数量不对');
        if (new Set(items.map(item => item.id)).size !== items.length) throw Error('选中的零件重复了');
        const previousMany = [], changedMany = [];
        for (const item of items) {
          const at = next.parts.findIndex(p => p.id === item.id), old = next.parts[at];
          if (!old || old.version !== item.version) throw Error('选中的零件被别人动过了，重新选一下');
          const changed = { ...cleanPart({ ...item.part, kind: old.kind }, next.models), id: old.id, version: old.version + 1 };
          previousMany.push(old); changedMany.push(changed); next.parts[at] = changed;
        }
        commit(next);
        return { ...snapshot(), previousMany, changedMany };
      }
      if (command.action === 'add' || command.action === 'duplicate') {
        if (command.action === 'duplicate' && (!previous || previous.version !== command.version)) throw Error('零件被别人动过了，重新选一下再复制');
        const raw = command.action === 'duplicate' ? previous : command.part;
        const part = { ...cleanPart(raw, next.models), id: randomUUID(), version: 1 };
        next.parts.push(part);
        if (holds(part, next.models)) next.chestPeople[part.id] = { creator: person(user), readers: [] };
        if (isCinema(part.kind)) {
          const saved = command.action === 'duplicate' ? next.screens[previous.id]?.content : command.cinemaContent;
          if (saved) next.screens[part.id] = { content: cleanCinemaContent(saved), revision: 1 };
        }
        commit(next);
        return { ...snapshot(), changed: part };
      }
      if (!previous) throw Error('零件已经被拿走了，刷新一下');
      if (command.action === 'cinema') {
        if (!isCinema(previous.kind)) throw Error('只有影院屏能放片子');
        if (previous.version !== command.version) throw Error('屏幕被别人动过了，重新打开');
        next.screens[previous.id] = { content: cleanCinemaContent(command.content), revision: (next.screens[previous.id]?.revision || 0) + 1 };
        next.parts[index] = { ...previous, version: previous.version + 1 };
        commit(next); return snapshot();
      }
      if (command.action === 'read') {
        if (!holds(previous, next.models)) throw Error('Only chests can be read');
        const people = next.chestPeople[previous.id] ||= { readers: [] };
        if (people.creator?.id === user.id || people.readers.some(p => p.id === user.id)) return snapshot();
        people.readers.push({ ...person(user), at: Date.now() });
        commit(next); return snapshot();
      }
      if (command.action === 'move' || command.action === 'remove') {
        if (previous.version !== command.version) throw Error('零件被别人动过了，重新选一下');
        if (command.action === 'remove') {
          if ((next.chests[previous.id] || []).length) throw Error(previous.kind === 'chest' ? 'Remove the chest contents first' : 'Remove the contents first');
          next.parts.splice(index, 1);
          delete next.chests[previous.id]; delete next.screens[previous.id]; delete next.chestPeople[previous.id];
        } else {
          next.parts[index] = { ...cleanPart({ ...command.part, kind: previous.kind }, next.models), id: previous.id, version: previous.version + 1 };
        }
      } else if (command.action === 'put') {
        if (!holds(previous, next.models)) throw Error('Items can only be placed in chests, cabinets, shelves and tables');
        const entries = next.chests[previous.id] ||= [];
        if (entries.length >= 300) throw Error('一个资料库最多放 300 项资料');
        const entry = command.entry;
        if (!entry || !['link', 'image', 'note'].includes(entry.type)) throw Error('不支持这种内容');
        const title = String(entry.title || '').trim().slice(0, 100);
        const value = String(entry.value || '').trim();
        if (!title || !value) throw Error('写个标题和内容');
        if (entry.type === 'link') {
          let url;
          try { url = new URL(value); } catch { throw Error('写完整的链接'); }
          if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || value.length > 2048) throw Error('只支持 http 和 https 链接');
        }
        if (entry.type === 'note' && value.length > 40000) throw Error('文章最多 40000 字');
        if (entry.type === 'image') {
          if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || value.length > 220000) throw Error('图片太大或格式不支持');
          const bytes = Buffer.from(value.split(',')[1], 'base64');
          const valid = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            || (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
            || (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP');
          if (!valid) throw Error('图片数据不对');
        }
        entries.push({ id: randomUUID(), type: entry.type, title, value, author: user.name, owner: user.id, at: Date.now() });
      } else if (command.action === 'take') {
        const entries = next.chests[previous.id] || [];
        const entry = entries.find(item => item.id === command.entryId);
        if (!entry || entry.owner !== user.id) throw Error('只能拿走自己放的东西');
        next.chests[previous.id] = entries.filter(item => item.id !== entry.id);
      } else throw Error('不支持这个操作');
      commit(next);
      return { ...snapshot(), previous, changed: next.parts.find(p => p.id === previous.id),
        ...(command.action === 'remove' && isCinema(previous.kind) ? { previousCinema } : {}) };
    },
  };
}
