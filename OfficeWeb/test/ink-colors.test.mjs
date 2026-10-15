// 标注笔的颜色（用户 2026-10-14：「观众看别人时标记可以修改颜色」）。
//
// 颜色表必须**三处一致**：网页工具条（`src/inkColors.ts`）、分享者桌面上那层浮层
// （`OfficeDesktop/annotation-overlay.js`，它是普通脚本，不能 import TS，所以是复制的），
// 以及服务端 —— 服务端只原样转发 `color`，压根不认颜色，所以这里不需要动它。
// 复制的那一份最容易漂，所以逐字核对。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTs } from './helpers.mjs';

const sourceOf = (file) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
const overlay = () => readFileSync(new URL('../../OfficeDesktop/annotation-overlay.js', import.meta.url), 'utf8');

test('色板：给的是低饱和之外也够区分的几种，默认色仍是老版本那个米黄', async () => {
  const { INK_COLORS, INK_LABELS, DEFAULT_INK, inkColor, inkRgba } =
    await import(await loadTs('inkColors.ts'));
  assert.ok(INK_COLORS.length >= 4, '至少要给几个能选的');
  assert.equal(new Set(INK_COLORS).size, INK_COLORS.length, '颜色不能重复');
  for (const color of INK_COLORS) {
    assert.match(color, /^#[0-9a-f]{6}$/, `${color} 必须是 #rrggbb（画布里直接吃这个写法）`);
    assert.ok(INK_LABELS[color], `${color} 要有名字，色板按钮的 title/aria-label 用它`);
  }
  assert.ok(INK_COLORS.includes(DEFAULT_INK), '默认色本身也得是可选的一种');
  assert.equal(DEFAULT_INK, '#f0d274', '老版本没带颜色时就是它（旧行为不能变）');
  // 选中/退回的规则：认得的照用，不认得的一律退回固定色（老客户端发来的笔画照样能画）。
  assert.equal(inkColor('#4a9fd8', '#111111'), '#4a9fd8');
  assert.equal(inkColor('  #4A9FD8 ', '#111111'), '#4a9fd8', '大小写与空白要容忍');
  assert.equal(inkColor(undefined, '#111111'), '#111111');
  assert.equal(inkColor('red', '#111111'), '#111111', '不认的一律退回，别把任意字符串塞进画布');
  assert.equal(inkColor(42, '#111111'), '#111111');
  assert.equal(inkRgba('#4a9fd8', 0.5), 'rgba(74, 159, 216, 0.5)');
});

test('浮层里那份颜色表必须和 src/inkColors.ts 逐字一致', async () => {
  const { INK_COLORS } = await import(await loadTs('inkColors.ts'));
  const text = overlay();
  const found = /const INKS = \[([^\]]*)\]/.exec(text);
  assert.ok(found, 'annotation-overlay.js 里要有 INKS 列表');
  const list = found[1].split(',').map(value => value.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  assert.deepEqual(list, INK_COLORS,
    '浮层那份颜色表和 src/inkColors.ts 漂了 —— 同一条笔画在两边的颜色会不一样');
  assert.match(text, /INKS\.includes\(value\)/, '浮层也要走"认得才用"的判定');
  assert.match(text, /function colorFor\(clientId\)/, '没带颜色的老消息仍按人固定色画');
});

test('服务端转发层那份颜色表也必须一致（它按字段重建消息，漏字段就静默丢）', async () => {
  // **用户 2026-10-15 报「标记没有颜色」的真因**：服务端 `flush()` 是按字段重建消息的，
  // `color` 没写进去就被丢掉 —— 页面发的颜色根本到不了分享者屏幕上那层浮层。
  // 所以服务端也要有这份表，且必须与另外两份逐字一致。
  const { INK_COLORS } = await import(await loadTs('inkColors.ts'));
  const server = readFileSync(new URL('../collab-annotations.mjs', import.meta.url), 'utf8');
  const found = /const INK_COLORS = \[([^\]]*)\]/.exec(server);
  assert.ok(found, 'collab-annotations.mjs 里要有 INK_COLORS');
  const list = found[1].split(',').map(value => value.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  assert.deepEqual(list, INK_COLORS, '服务端那份颜色表和 src/inkColors.ts 漂了');
  // 光有表没用：转发出去的消息里必须真的带上这个字段。
  assert.match(server, /\.\.\.\(entry\.color \? \{ color: entry\.color \} : \{\}\)/,
    'flush() 重建消息时要把 color 列出来，否则它在这一层就没了');
  assert.match(server, /const color = INK_COLORS\.includes\(data\?\.color\) \? data\.color : undefined/,
    '起笔那条消息上的颜色要存进这一笔的 batch 里');
  assert.match(server, /entry = \{ scope, stroke, points: \[\], done: false, timer: undefined, color \}/,
    '颜色是"每一笔"的属性，要跟着 batch 走');
});
