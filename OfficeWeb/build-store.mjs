import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { fixtureFor, initialFixtures } from './scene-fixtures.mjs';
import { randomUUID } from 'node:crypto';

export const catalog = JSON.parse(readFileSync(new URL('./build-catalog.json', import.meta.url), 'utf8'));
export const palette = ['#f3dfc5', '#e9b8b5', '#b9c9df', '#b4c5a0', '#cabddd', '#c69770', '#596679'];

/**
 * **水平两轴永远吸附 0.25 网格**——"部件不会离格"这条不变量的**最后一道闸门**。
 *
 * 用户 2026-10-09：「将来确保不会有步长不统一的部件 所以就不需要对齐网格的按钮 … 根源修复 而不是打补丁」。
 * 客户端（`src/buildGrid.ts` 的 `snapHorizontal`）已经在每条放置/拖动/复制路径上算对了，这里再强制一次：
 * 旧版客户端、以后新加的某条路径、手工调接口，都写不进离格的 x/z。**y 不动**（接触高度/桌面高度是毫米级，
 * 强行取整会让叠着的东西浮起或陷进去；y 的步长仍由客户端保证是整格）。
 */
export const BUILD_GRID = .25;
export const gridSnap = value => Math.round(value / BUILD_GRID) * BUILD_GRID + 0;
/**
 * **结构件**（目录分类「建筑」「玩法」）：三轴都严格落格。用户 2026-10-09 报「我有两个拱门 差距一直都是
 * 一个小缝 对不齐」——两件各自站在略有差异的面上（−4.605 / −4.564），而高度的步长是"从各自原点加整格"，
 * 永远凑不到同一高度；落格之后一次拖动就能齐。**家具/摆件（桌 1.42m、杯、书…）的 y 不落格**，否则
 * 放在桌面上的东西会浮起或陷进去。
 */
const STRUCTURAL = new Set(catalog.filter(item => item.category === '建筑' || item.category === '玩法').map(item => item.id));
export const isStructural = kind => STRUCTURAL.has(kind);
/** 只有 x/z 都是有限数的部件才落格：老存档里可能存在残缺条目（缺 x/z），迁移时不能把它们变成 NaN。 */
export const snapHorizontal = part => Number.isFinite(part.x) && Number.isFinite(part.z)
  ? { ...part, x: gridSnap(part.x), z: gridSnap(part.z) } : part;
/** 唯一出口：结构件三轴落格，其余部件水平两轴落格、高度保持精确。 */
export const snapPart = part => Number.isFinite(part.x) && Number.isFinite(part.y) && Number.isFinite(part.z)
  ? (isStructural(part.kind) ? { ...part, x: gridSnap(part.x), y: gridSnap(part.y), z: gridSnap(part.z) }
    : snapHorizontal(part)) : part;
/** 存档里还离格的部件（启动时的迁移与自查都用它）。**和迁移同一套判定**：fixture 的 y 不动，
 *  否则 island/柱子配重那些背景件永远"离格"、每次开服都白写一次存档、版本号一直涨。 */
export const offGridParts = parts => parts.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)
  && (Math.abs(p.x - gridSnap(p.x)) > 1e-9 || Math.abs(p.z - gridSnap(p.z)) > 1e-9
    || (isStructural(p.kind) && !p.fixture && Math.abs(p.y - gridSnap(p.y)) > 1e-9)));

export function dimensions(part) {
  const item = catalog.find(item => item.id === part.kind);
  if (!item) throw Error('没有这个部件');
  let [x, y, z] = fixtureFor(part)?.dimensions || (part.pitch || part.roll ? item.dimensions : item.size);
  [x,y,z]=[x,y,z].map((n,i)=>n*(part.scale?.[i] ?? 1));
  if ((part.roll || 0)%2) [x,y]=[y,x];
  if ((part.pitch || 0)%2) [y,z]=[z,y];
  return part.rotation % 2 ? [z, y, x] : [x, y, z];
}
function cleanPart(raw) {
  if (!raw || !palette.includes(raw.color)) throw Error('请选择部件颜色');
  if (![raw.x, raw.y, raw.z, raw.rotation].every(Number.isFinite)) throw Error('无效的位置');
  if (!Number.isInteger(raw.rotation) || raw.rotation < 0 || raw.rotation > 3) throw Error('旋转角度无效');
  for (const axis of ['pitch','roll']) if (raw[axis] !== undefined && (!Number.isInteger(raw[axis]) || raw[axis]<0 || raw[axis]>3)) throw Error('翻转角度无效');
  // 位置在这里落格：这是"部件不会离格"的最后一道闸门（见 snapPart 的说明）。
  const part = snapPart({ ...(raw.pitch ? {pitch:raw.pitch} : {}), ...(raw.roll ? {roll:raw.roll} : {}), kind: raw.kind, color: raw.color, x: raw.x, y: raw.y, z: raw.z, rotation: raw.rotation });
  if (raw.fixture !== undefined) {
    const fixture=fixtureFor(raw);
    if(!fixture || fixture.kind!==raw.kind)throw Error('场景部件无效');
    part.fixture=raw.fixture;
    if(raw.fixtureCopy===true)part.fixtureCopy=true;
  }
  if (raw.scale !== undefined) {
    const base = fixtureFor(raw)?.dimensions || catalog.find(item => item.id === raw.kind)?.dimensions;
    if (!base || !Array.isArray(raw.scale) || raw.scale.length !== 3 || raw.scale.some((n,i) =>
      !Number.isFinite(n) || n <= 0 || !Number.isSafeInteger(Math.round(n*base[i]*1000))
      || (n !== 1 && (n*base[i] < .25-1e-8 || Math.abs(n*base[i]*4-Math.round(n*base[i]*4)) > 1e-6))))
      throw Error('缩放尺寸必须按25厘米格子对齐');
    part.scale = [...raw.scale];
  }
  dimensions(part);
  if (![part.x, part.y, part.z].every(n => Number.isSafeInteger(Math.round(n*1000))))
    throw Error('位置无效');
  // x/z 已经被 snapHorizontal 落格；这里只再确认毫米精度（y 是接触高度，允许毫米）。
  if (![part.x, part.y, part.z].every(n => Math.abs(n * 1000 - Math.round(n * 1000)) < 0.001))
    throw Error('请对齐网格');
  return part;
}
export function seedParts() {
  const parts = [];
  const add = (kind, x, y, z, color = palette[0], rotation = 0) =>
    parts.push({ id: `starter-${parts.length}`, kind, x, y, z, color, rotation, version: 1 });
  add('window', -6, 0, -8, palette[1]);
  add('window', -10, 0, -8);
  add('wall', -12, 0, -6, palette[0], 1);
  add('pillar', -12, 0, -2);
  add('beam', -10, 3, -8);
  add('beam', -6, 3, -8);
  add('desk', -10, 0, -6, palette[5]);
  add('shelf', -6, 0, -7, palette[5]);
  add('chest', -4.5, 0, -6, palette[1]);
  add('chest', 5, 0, 4, palette[4]);
  add('tree', -13, 0, -9, palette[3]);
  add('tree', 12.5, 0, -9, palette[3]);
  add('tree', 12.5, 0, 8.5, palette[3]);
  add('tree', -12.5, 0, 8.5, palette[3]);
  add('lamp', -3.5, 0, -8);
  add('lamp', 5, 0, 7);
  add('sofa', 8, 0, 7, palette[1]);
  add('table', 8, 0, 5, palette[5]);
  add('screen', 8, 0, 3, palette[2]);
  add('door', 5, 0, -9, palette[4]);
  return parts;
}
export function createBuildStore(path) {
  // Corrupt data must never silently become a fresh world and overwrite user builds.
  let state = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { revision: 0, parts: seedParts(), chests: {} };
  if (!Array.isArray(state.parts) || !state.chests || !Number.isInteger(state.revision)) throw Error('建造存档无效');
  const snapshot = () => ({ revision: state.revision, parts: state.parts.map(p => p.kind === 'chest'
    ? { ...p, chestPeople: state.chestPeople?.[p.id] || { readers: [] } } : p) });
  const person = user => ({ id: user.id, name: user.name, appearance: user.appearance || null });
  const commit = next => {
    next.revision = state.revision + 1;
    const json = JSON.stringify(next);
    if (Buffer.byteLength(json) > 16 * 1024 * 1024) throw Error('空间储存已满，请整理宝箱图片');
    writeFileSync(path + '.next', json);
    renameSync(path + '.next', path);
    state = next;
  };
  if (!state.editableScene) {
    if(existsSync(path))writeFileSync(path+'.before-editable-scene.json',readFileSync(path));
    const next=structuredClone(state);
    next.parts.push(...initialFixtures());
    next.editableScene=1;
    commit(next);
  }
  /**
   * 一次性把**老存档里已经离格的部件**整盘回格（用户 2026-10-09：「确保不会有步长不统一的部件」）。
   *
   * 结构件（建筑/玩法）三轴都回格——两个拱门那种"各自站在略有差异的面上、永远对不齐"就是这么修的；
   * 家具/摆件的 y 原样保留（否则桌面上的杯子会浮起来或陷进去）；**原场景 fixture 的 y 也不动**
   * （island 基座 −0.6、柱子配重 −4.15 那些是背景几何，动了会把地面整体抬高）。改之前原文件另存
   * `<path>.before-grid.json`，日志里记清改了几件。
   */
  const migrateGrid = () => {
    const moved = offGridParts(state.parts);
    if (!moved.length) return 0;
    writeFileSync(path + '.before-grid.json', readFileSync(path));
    const next = structuredClone(state);
    next.parts = next.parts.map(part => part.fixture ? snapHorizontal(part) : snapPart(part));
    commit(next);
    console.log(`[build-store] 回格迁移：${moved.length} 件离格部件对齐到 ${BUILD_GRID} 网格（原文件备份为 ${path}.before-grid.json）`);
    return moved.length;
  };
  migrateGrid();
  return {
    snapshot,
    chest(id) {
      if (!state.parts.some(p => p.id === id && p.kind === 'chest')) throw Error('宝箱已被拆除');
      return state.chests[id] || [];
    },
    people(id) { return state.chestPeople?.[id] || { readers: [] }; },
    mutate(command, user) {
      const next = structuredClone(state);
      const index = next.parts.findIndex(p => p.id === command.id);
      const previous = next.parts[index];
      if(command.action==='moveMany') {
        const items=command.items;
        if(!Array.isArray(items)||!items.length||items.length>1000)throw Error('多选数量无效');
        if(new Set(items.map(item=>item.id)).size!==items.length)throw Error('多选部件重复');
        const previousMany=[],changedMany=[];
        for(const item of items){
          const at=next.parts.findIndex(p=>p.id===item.id),old=next.parts[at];
          if(!old || old.version!==item.version)throw Error('所选部件已被修改或拆除，请重新选择');
          const changed={...cleanPart({...item.part,kind:old.kind,fixture:old.fixture,fixtureCopy:old.fixtureCopy}),id:old.id,version:old.version+1};
          previousMany.push(old);changedMany.push(changed);next.parts[at]=changed;
        }
        commit(next);
        return {...snapshot(),previousMany,changedMany};
      }
      if (command.action === 'add' || command.action === 'duplicate') {
        if(command.action==='duplicate' && (!previous || previous.version!==command.version))throw Error('部件已更新，请重新选择后复制');
        const raw=command.action==='duplicate' ? {...previous,fixtureCopy:previous.fixture ? true : undefined} : command.part;
        const cleaned=cleanPart(raw);
        if(cleaned.fixture && !cleaned.fixtureCopy && next.parts.some(p=>p.fixture===cleaned.fixture && !p.fixtureCopy))throw Error('这个原场景部件已经存在');
        const part = { ...cleaned, id: randomUUID(), version: 1 };
        next.parts.push(part);
        if (part.kind === 'chest') (next.chestPeople ||= {})[part.id] = { creator: person(user), readers: [] };
        commit(next);
        return { ...snapshot(), changed: part };
      }
      if (!previous) throw Error('部件已被拆除，请刷新位置后重试');
      if (command.action === 'read') {
        if (previous.kind !== 'chest') throw Error('只能阅读宝箱');
        const people = (next.chestPeople ||= {})[previous.id] ||= { readers: [] };
        if (people.creator?.id === user.id || people.readers.some(p => p.id === user.id)) return snapshot();
        people.readers.push({ ...person(user), at: Date.now() });
        commit(next);
        return snapshot();
      }
      if (command.action === 'move' || command.action === 'remove') {
        if (previous.version !== command.version) throw Error('同事刚修改了这个部件，请重新选择');
        if (command.action === 'remove') {
          if ((next.chests[previous.id] || []).length) throw Error('宝箱里还有内容，请先取出内容');
          next.parts.splice(index, 1);
          delete next.chests[previous.id];
          if (next.chestPeople) delete next.chestPeople[previous.id];
        } else {
          const part = cleanPart({ ...command.part, kind: previous.kind, fixture: previous.fixture, fixtureCopy: previous.fixtureCopy });
          next.parts[index] = { ...part, id: previous.id, version: previous.version + 1 };
        }
      } else if (command.action === 'put') {
        if (previous.kind !== 'chest') throw Error('只能放入宝箱');
        const entries = next.chests[previous.id] ||= [];
        if (entries.length >= 30) throw Error('一个宝箱最多放 30 项');
        const entry = command.entry;
        if (!entry || !['link', 'image', 'note'].includes(entry.type)) throw Error('不支持的内容');
        const title = String(entry.title || '').trim().slice(0, 100);
        const value = String(entry.value || '').trim();
        if (!title || !value) throw Error('请填写标题和内容');
        if (entry.type === 'link') {
          let url;
          try { url = new URL(value); } catch { throw Error('请填写完整网址'); }
          if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || value.length > 2048)
            throw Error('只支持 http / https 网址');
        }
        if (entry.type === 'note' && value.length > 4000) throw Error('便签最多 4000 字');
        if (entry.type === 'image') {
          if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) || value.length > 220000)
            throw Error('图片太大或格式不支持，请重新选择');
          const bytes = Buffer.from(value.split(',')[1], 'base64');
          const valid = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
            || (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
            || (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP');
          if (!valid) throw Error('图片数据无效');
        }
        entries.push({ id: randomUUID(), type: entry.type, title, value, author: user.name, owner: user.id, at: Date.now() });
      } else if (command.action === 'take') {
        const entries = next.chests[previous.id] || [];
        const entry = entries.find(item => item.id === command.entryId);
        if (!entry || entry.owner !== user.id) throw Error('只能移除自己放入的内容');
        next.chests[previous.id] = entries.filter(item => item.id !== entry.id);
      } else throw Error('不支持的操作');
      commit(next);
      return { ...snapshot(), previous, changed: next.parts.find(p => p.id === previous.id) };
    },
  };
}
