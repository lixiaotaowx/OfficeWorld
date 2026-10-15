// 小窗状态的**字段白名单**：契约里声明的每个字段，都必须活着穿过 IPC 清洗。
//
// 为什么要这条：`dock-meeting-bridge.cjs` / `dock-private-bridge.cjs` 是**按字段重建**对象的
// （只转发白名单里的字段），漏一个字段不会报错、不会有日志 —— 页面照旧每秒在推，小窗永远收不到，
// 功能**静默失效**。历史：`self` / `missed` / `away` / `transfers` 各漏过一次，
// 2026-10-15 又漏了 `micLevel`（音量填充一直不显示，用户报「没有看到语音强度条」）。
//
// 所以这里不去手写字段清单 —— 那样清单自己也会过时 —— 而是**从契约源码里把字段解析出来**，
// 逐个验证它们能穿过清洗函数。契约里加了字段而没加进白名单，这条测试当场红。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { cleanMeeting } = require('../dock-meeting-bridge.cjs');
const { cleanPrivateCalls } = require('../dock-private-bridge.cjs');

/** 从接口源码里取出顶层字段名（第一层 `名称?: 类型;`，嵌套对象里的不算）。 */
function fieldsOf(file, interfaceName) {
  const text = readFileSync(join(__dirname, '..', '..', 'OfficeWeb', 'src', file), 'utf8');
  const from = text.indexOf(`interface ${interfaceName}`);
  assert.ok(from >= 0, `契约里找不到 interface ${interfaceName}`);
  const rest = text.slice(from);
  // 先掐掉 `interface X {` 这一行：它自己的 `{` 会把深度从 1 起算，字段就全被判成"嵌在里面"
  // （第一版就栽在这：私聊契约解析出 0 个字段）。接口体到第一个行首的 `}` 为止。
  const body = rest.slice(rest.indexOf('\n') + 1);
  const stop = body.search(/\n\}/);
  const lines = body.slice(0, stop === -1 ? body.length : stop).split('\n');
  const found = [];
  let depth = 0;
  for (const line of lines) {
    // **先判定这一行、再更新深度**：像 `invitations: { … }[];` 这种同行自带花括号的字段
    // 净差是 0，但若先更新深度，就会把后面的字段全判成"嵌在里面"（第一版就栽在这）。
    if (depth === 0) {
      const hit = /^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??\s*:/.exec(line);
      if (hit) found.push(hit[1]);
    }
    depth += (line.match(/[{[]/g) || []).length - (line.match(/[}\]]/g) || []).length;
  }
  return found;
}

/** 每种形状都给一个真值：falsy 的值和"字段被丢了"在断言里分不开。 */
const MEETING_SAMPLE = {
  active: true, id: 'meeting-1', host: true,
  members: [{ id: 'a', name: '甲', status: 'joined' }],
  invitations: [{ id: 'i1', personId: 'p1', name: '乙' }],
  title: '周会', mic: true, micLevel: 0.42, sharing: true, busy: false, error: 'x',
  candidates: [{ id: 'c1', name: '丙', personId: 'p2' }],
  screens: [{ id: 's1', name: '甲', streamId: 'st1' }],
};

const PRIVATE_SAMPLE = {
  invitations: [{ id: 'i1', personId: 'p1', name: '乙', kind: 'voice', offer: false }],
  sessions: [{ id: 's1', name: '乙', connected: true, mic: true, sharing: false }],
  micLevel: 0.42, busy: false, error: 'x',
};

test('契约里声明的会议字段，一个都不能被 IPC 清洗丢掉', () => {
  const fields = fieldsOf('dock-meeting-contract.ts', 'DockMeetingState');
  assert.ok(fields.length >= 12, `没解析出字段，契约读法过期了：${JSON.stringify(fields)}`);
  for (const field of fields) {
    assert.ok(field in MEETING_SAMPLE, `契约字段 ${field} 没在样本里 —— 加字段时这里要同步`);
  }
  const cleaned = cleanMeeting(MEETING_SAMPLE);
  for (const field of fields) {
    assert.ok(field in cleaned, `会议字段 ${field} 被清洗丢掉了：页面在推、小窗永远收不到`);
  }
  assert.equal(cleaned.micLevel, 0.42, '音量要原样过去');
});

test('契约里声明的私聊字段，一个都不能被 IPC 清洗丢掉', () => {
  const fields = fieldsOf('dock-private-contract.ts', 'DockPrivateState');
  assert.ok(fields.length >= 5, `没解析出字段，契约读法过期了：${JSON.stringify(fields)}`);
  for (const field of fields) {
    assert.ok(field in PRIVATE_SAMPLE, `契约字段 ${field} 没在样本里 —— 加字段时这里要同步`);
  }
  const cleaned = cleanPrivateCalls(PRIVATE_SAMPLE);
  for (const field of fields) {
    assert.ok(field in cleaned, `私聊字段 ${field} 被清洗丢掉了：页面在推、小窗永远收不到`);
  }
  assert.equal(cleaned.micLevel, 0.42, '音量要原样过去');
});

test('音量是 0..1 的数：越界夹住、脏值当 0、没带就不写这个字段', () => {
  assert.equal(cleanMeeting({ mic: true, micLevel: 2 }).micLevel, 1, '越界夹到 1');
  assert.equal(cleanMeeting({ mic: true, micLevel: -3 }).micLevel, 0, '负数当 0');
  assert.equal(cleanMeeting({ mic: true, micLevel: 'x' }).micLevel, 0, '脏值当 0');
  assert.equal(cleanMeeting({ mic: true }).micLevel, undefined,
    '没带这个字段就不要凭空写一个（老页面不发它）');
  assert.equal(cleanPrivateCalls({ micLevel: 0.7 }).micLevel, 0.7);
  assert.equal(cleanPrivateCalls({}).micLevel, undefined);
});
