// 「尺子角色」的配色与配件规则（用户 2026-09-23：1 先选配色，2 选配件）。
//
// 这些规则同时管着 UI、服务端校验、账号存档和多人同步，所以钉住三件事：
//   1. 认不出来的值必须收敛成可用外观，绝不抛错（网络与旧存档都会送来脏数据）；
//   2. src/look.ts 与生成给服务端用的 look.mjs 必须是同一份白名单（漂了这里就红）；
//   3. 每一件配件都要真的在模型里（缩略图与 GLB 网格名对得上）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));

const source = readFileSync(new URL('../src/look.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const {
  PALETTE, ACCESSORIES, SLOT_ORDER, SLOT_LABELS, DEFAULT_APPEARANCE,
  resolveAppearance, sameAppearance, appearanceKey, getColor, colorHex,
  colorNumber, accentNumber, getAccessory, hasAccessory, readStoredAppearance,
} = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const server = await import('../look.mjs');

const THUMBS = new URL('../public/assets/characters/thumbnails/', import.meta.url);

test('配色表：id/标签唯一、颜色是合法 hex，默认色在里面', () => {
  assert.ok(PALETTE.length >= 8, '配色太少，捏人没得选：' + PALETTE.length);
  const ids = PALETTE.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length, '配色 id 重复了');
  for (const color of PALETTE) {
    assert.match(color.hex, /^#[0-9a-f]{6}$/, `${color.id} 的颜色不是 hex：${color.hex}`);
    assert.ok(color.label.trim().length > 0, `${color.id} 没有中文标签`);
    if (color.accentHex) assert.match(color.accentHex, /^#[0-9a-f]{6}$/, `${color.id} 的深色不是 hex`);
  }
  assert.ok(ids.includes(DEFAULT_APPEARANCE.color), '默认配色必须登记在表里');
});

test('四个槽位：顺序、标签、每个槽位都有「不戴」，且 id 唯一', () => {
  assert.deepEqual(SLOT_ORDER, ['glasses', 'hair', 'beard', 'hat'], '槽位顺序就是面板顺序');
  for (const slot of SLOT_ORDER) {
    const list = ACCESSORIES[slot];
    assert.ok(list.length >= 2, `${slot} 至少要有"不戴 + 一个真配件"`);
    const ids = list.map(a => a.id);
    assert.equal(new Set(ids).size, ids.length, `${slot} 的 id 重复了`);
    assert.equal(ids[0], 'none', `${slot} 的第一项必须是 none（未知值回退到它）`);
    assert.equal(list[0].mesh, '', `${slot} 的 none 不该有网格`);
    for (const item of list.slice(1)) {
      assert.ok(item.mesh, `${slot}/${item.id} 没有 mesh（点了不会有反应）`);
      assert.ok(item.label.trim().length > 0, `${slot}/${item.id} 没有中文标签`);
    }
    assert.ok(SLOT_LABELS[slot], `${slot} 缺中文标签`);
  }
  // 每个配件的标签都要有对应缩略图（捏人面板上就是它）。
  for (const slot of SLOT_ORDER) {
    for (const item of ACCESSORIES[slot]) {
      if (!item.mesh) continue;
      const file = new URL(`wear-${slot}-${item.id}.png`, THUMBS);
      assert.ok(existsSync(file), `缺配件缩略图 wear-${slot}-${item.id}.png`);
    }
  }
  for (const color of PALETTE) {
    assert.ok(existsSync(new URL(`body-${color.id}.png`, THUMBS)), `缺配色缩略图 body-${color.id}.png`);
    assert.ok(existsSync(new URL(`full-${color.id}.png`, THUMBS)), `缺头像图 full-${color.id}.png`);
    // 小窗（任务栏头像条）用的头肩图：没有它就得拿全身图放大取头，尺子角色会取到板身。
    assert.ok(existsSync(new URL(`head-${color.id}.png`, THUMBS)), `缺头肩图 head-${color.id}.png`);
  }
});

test('认不出来的值一律收敛成可用外观，不抛错', () => {
  // **空载荷 = 全新的人**：必须拿到 DEFAULT_APPEARANCE 本身（默认是带短发的），
  // 不是"各槽位第一项"（那就是光头）。这条在多人同步里实测抓到过光头 bug。
  for (const empty of [null, undefined, {}, { accessories: {} }, { color: 'kraft' }]) {
    assert.deepEqual(resolveAppearance(empty), DEFAULT_APPEARANCE,
      `空载荷 ${JSON.stringify(empty)} 没有回退到默认外观`);
  }
  // 各种脏数据
  for (const junk of [undefined, 0, '', 'kraft', [], { color: 42 }, { accessories: 'x' },
    { color: 'bogus', accessories: { hair: 'nope', beard: null, hat: {}, glasses: 7 } }]) {
    const look = resolveAppearance(junk);
    assert.ok(PALETTE.some(c => c.id === look.color), '配色必须落在表里：' + JSON.stringify(junk));
    for (const slot of SLOT_ORDER) {
      assert.ok(ACCESSORIES[slot].some(a => a.id === look.accessories[slot]),
        `${slot} 必须落在表里：` + JSON.stringify(junk));
    }
  }
  // 认不出来的配件回**默认配件**（不是"不戴"）：头发回短发、眼镜回不戴。
  const junkLook = resolveAppearance({ accessories: { hair: 'nope', glasses: 'nope' } });
  assert.equal(junkLook.accessories.hair, DEFAULT_APPEARANCE.accessories.hair);
  assert.equal(junkLook.accessories.glasses, DEFAULT_APPEARANCE.accessories.glasses);
  // 多余字段不要留下来（存档会被它撑大，也会随广播发出去）。
  const extra = resolveAppearance({ color: 'sage', junk: 1, accessories: { hair: 'bob', extra: 'x' } });
  assert.deepEqual(Object.keys(extra).sort(), ['accessories', 'color']);
  assert.deepEqual(Object.keys(extra.accessories).sort(), [...SLOT_ORDER].sort());
  // 合法值原样保留，且幂等。
  const good = { color: 'navy', accessories: { glasses: 'black', hair: 'long', beard: 'full', hat: 'beret' } };
  assert.deepEqual(resolveAppearance(good), good);
  assert.deepEqual(resolveAppearance(resolveAppearance(good)), good);
});

test('配色与配件真的落到颜色/显隐上', () => {
  assert.equal(colorHex('rose'), '#e0a0a8');
  assert.equal(colorNumber('rose'), 0xe0a0a8);
  assert.equal(colorNumber('bogus'), colorNumber(DEFAULT_APPEARANCE.color), '认不出的配色回默认色');
  // 深色零件默认是黑；亮色配色可以单独给近黑。
  assert.equal(accentNumber('kraft'), 0x000000);
  assert.equal(accentNumber('snow'), 0x43434a);
  assert.equal(accentNumber('bogus'), 0x000000);
  // 认不出的配件在"取值"层面当不戴（getAccessory 的兜底），
  // 但 resolveAppearance 会先把未知值换成默认配件，所以这里用显式的 'none' 验。
  assert.equal(getAccessory('beard', 'nope').id, 'none');
  assert.equal(hasAccessory(resolveAppearance({ accessories: { beard: 'full' } }), 'beard'), true);
  assert.equal(hasAccessory(resolveAppearance({ accessories: { beard: 'none' } }), 'beard'), false);
  assert.equal(hasAccessory(resolveAppearance({ accessories: { beard: 'nope' } }), 'beard'), false,
    '胡子的默认是"不戴"，所以认不出来的胡子值等于不戴');
});

test('比对与指纹：只在外观真的变了的时候才广播/重渲染', () => {
  const a = resolveAppearance({ color: 'sage', accessories: { hair: 'bob' } });
  const b = resolveAppearance({ color: 'sage', accessories: { hair: 'bob', extra: 'ignored' } });
  const c = resolveAppearance({ color: 'sage', accessories: { hair: 'long' } });
  assert.equal(sameAppearance(a, b), true, '等价的外观要判等（否则每次广播都重画）');
  assert.equal(sameAppearance(a, c), false);
  assert.equal(sameAppearance(a, null), false);
  assert.equal(sameAppearance(a, resolveAppearance({ color: 'rose', accessories: { hair: 'bob' } })), false);
  assert.equal(appearanceKey(a), appearanceKey(b), '指纹也要一致');
  assert.notEqual(appearanceKey(a), appearanceKey(c));
});

test('本机缓存读坏了也不能崩', () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
  };
  assert.equal(readStoredAppearance().color, DEFAULT_APPEARANCE.color, '空缓存回默认');
  store.set('office-appearance', '{ this is not json');
  assert.equal(readStoredAppearance().color, DEFAULT_APPEARANCE.color, '坏 JSON 回默认');
  store.set('office-appearance', JSON.stringify({ color: 'mint', accessories: { hat: 'straw' } }));
  const stored = readStoredAppearance();
  assert.equal(stored.color, 'mint');
  assert.equal(stored.accessories.hat, 'straw');
  delete globalThis.localStorage;
});

test('服务端白名单与 src/look.ts 是同一份（漂了就红）', () => {
  // 生成物 look.mjs 由 tools/build_look_manifest.mjs 从 look.ts 生成；这里逐项比对。
  assert.deepEqual([...server.COLORS].sort(), PALETTE.map(c => c.id).sort(),
    '服务端配色白名单与 look.ts 不一致：重跑 node tools/build_look_manifest.mjs');
  assert.deepEqual(server.SLOT_ORDER, SLOT_ORDER);
  for (const slot of SLOT_ORDER) {
    assert.deepEqual(server.SLOTS[slot], ACCESSORIES[slot].map(a => a.id),
      `${slot} 的配件白名单与 look.ts 不一致`);
  }
  // 默认外观两边也必须一致：服务端用列表第一项当默认曾经造成"服务端光头、客户端短发"。
  assert.deepEqual([...server.COLORS].sort(), PALETTE.map(c => c.id).sort());
  assert.equal(server.DEFAULT_APPEARANCE.color, DEFAULT_APPEARANCE.color, '默认配色两边不一致');
  for (const slot of SLOT_ORDER) {
    assert.equal(server.DEFAULT_APPEARANCE.accessories[slot], DEFAULT_APPEARANCE.accessories[slot],
      `默认 ${slot} 两边不一致（服务端拿列表第一项就是错的）`);
  }
  // **空载荷必须收敛成 DEFAULT_APPEARANCE 本身**：老客户端、以及刚注册还没选过外观的账号
  // 都会发这种情况。以前服务端回退到"各槽位第一项"（也就是 none），于是那些人在别人眼里
  // 全是光头（实测抓到过）。
  for (const empty of [null, undefined, {}, { accessories: {} }, { color: "kraft" }]) {
    assert.deepEqual(server.sanitizeAppearance(empty), server.DEFAULT_APPEARANCE,
      `空载荷 ${JSON.stringify(empty)} 没有回退到默认外观`);
  }
  assert.deepEqual(server.DEFAULT_APPEARANCE, DEFAULT_APPEARANCE,
    "服务端与客户端的 DEFAULT_APPEARANCE 必须逐字段一致");
  // 服务端的收敛函数与客户端同规则：对同一份脏数据必须给出**同一个**结果（两边都回默认外观）。
  const raw = { color: 'bogus', accessories: { glasses: 'x', hair: 'y', beard: 'z', hat: 'w' } };
  const client = resolveAppearance(raw);
  const serve = server.sanitizeAppearance(raw);
  assert.equal(serve.color, client.color, '认不出的配色两边都要回默认');
  for (const slot of SLOT_ORDER) {
    assert.equal(serve.accessories[slot], client.accessories[slot], `${slot} 两边回退不一致`);
  }
  assert.equal(server.sameAppearance(serve, { ...serve }), true);
  assert.equal(server.sameAppearance(serve, { ...serve, color: 'rose' }), false);
  assert.equal(server.sameAppearance(serve, null), false);
});

test('动作直接用 Blender 里做好的那几条（用户 2026-09-23：「文件里面的动作库都可以直接用」）', () => {
  const model = readFileSync(new URL('../src/characterModel.ts', import.meta.url), 'utf8');
  // 站立待机 / 走路 / 跑步 都按动作库里的真名去找（先找尺子的中文名，再兼容旧命名）。
  for (const clip of ['站立待机_Idle', '走路循环_Walk', '跑步循环_Run']) {
    assert.ok(model.includes(clip), `characterModel.ts 没有找动作「${clip}」`);
  }
  // 坐下用已授权的坐姿动作，而不是硬摆骨骼；没有它才退回程序化姿势。
  const avatar = readFileSync(new URL('../src/OfficeAvatar.ts', import.meta.url), 'utf8');
  assert.match(readFileSync(new URL('../src/seatedAnimation.ts', import.meta.url), 'utf8'), /action\('坐姿打字_Type'\)/, '坐下要用「坐姿打字_Type」');
  assert.match(avatar, /this\.seatedClipHip/, '坐姿动作要量一次髋高，才能对齐工位高度');
  assert.match(avatar, /this\.run \? this\.run : this\.walk/, '长距离移动要用跑步循环');
  assert.match(avatar, /RUN_DISTANCE/, '要按距离决定跑还是走');
  // 远端也要跑步：这一位随运动快照广播出去，`RemoteAvatars` 按它选跑步循环。
  assert.match(avatar, /running: this\.moving && this\.speed > WALK_SPEED/,
    '运动快照要带 running 位');
  const remotes = readFileSync(new URL('../src/RemoteAvatars.ts', import.meta.url), 'utf8');
  assert.match(remotes, /target\.running && character\.run \? character\.run : character\.walk/,
    '远端要按 running 位放跑步循环');
  // 坐姿动作本身就是 current，别把它一起 stop 掉。
  assert.match(avatar, /if \(this\.current === this\.seatedClip\) return;/,
    'stopClips 不能把坐姿动作停掉（停了就是站着不动）');
  // 角色 GLB 里真的要有这些动作（名字写错了这里就会红）。
  const glb = readFileSync(new URL('../public/assets/characters/ruler.glb', import.meta.url));
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
  const names = (json.animations || []).map(a => a.name);
  for (const clip of ['坐姿打字_Type', '站立待机_Idle', '走路循环_Walk', '跑步循环_Run']) {
    assert.ok(names.includes(clip), `GLB 里没有动作「${clip}」，实际：${names.join(', ')}`);
  }
});

test('板身配色走"贴图像素重算"，并且垃圾几何在导出阶段就删干净', () => {
  const source = readFileSync(new URL('../src/characterLook.ts', import.meta.url), 'utf8');
  // 注释里会提到走过的弯路，所以断言"代码里不许再有它"之前先把注释剥掉。
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  // 板身材质按"顶点最多"认，不写死材质名（元绘那边改槽顺序就全错）。
  assert.match(source, /weights\.set/, '要统计各材质槽的顶点数，用来认板身');
  assert.match(source, /bodyMaterial/, '要能认出板身材质');
  // **2026-09-28 报障后改的路子**：板身贴图实测是纯灰度（逐像素 R=G=B、色偏 0.00），
  // 颜色只能来自这张图。原来在 `onBeforeCompile` 里改 `diffuseColor`——uniform 设对了、
  // 逐像素 A/B 也证明那段 GLSL 会改画面，但**场景里的角色就是不变色**（实测采样完全相同）。
  // 现在直接把配色算进像素、换掉 `material.map`，与着色器无关，不要再改回去。
  assert.match(source, /material\.map = cached/, '配色要落到贴图上（换 material.map）');
  assert.match(source, /tintTexture/, '要有把贴图像素重算一遍的函数');
  assert.match(source, /context\.getImageData/, '要真的逐像素读出来算');
  // **不许用 `source.clone()` 再改 `copy.image`**：three 的 `Texture.copy()` 里
  // `this.source = source.source` 是共享的，`texture.image` 又是 `source.data` 的读写口，
  // 于是"给副本换图"会把原图也换掉 —— 实测第二套配色开始就是拿上一套的结果再乘一次，
  // 一次比一次黑（原色正常、雪白渲成深灰）。要新建一张 CanvasTexture。
  assert.match(source, /new THREE\.CanvasTexture\(canvas\)/, '要新建 CanvasTexture，不能改副本的 image');
  assert.doesNotMatch(code, /copy\.image = canvas/, '不许给 clone 出来的副本换图（会连原图一起换）');
  assert.doesNotMatch(code, /source\.clone\(\)/, '不许用 Texture.clone() 当可写副本');
  // 灰度当遮罩、配色当颜色：`出 = 配色 × (明度 / 纸面亮度)`。
  // 纸（亮度 = 基准）正好是配色本身 —— 所以雪白真的白、墨黑真的黑（早先"保明度只换色相"
  // 把墨黑渲成了浅灰）；全黑的地方（明度 0）算出来还是 0，满足「不要动黑的地方」。
  assert.match(source, /lum \/ PAPER_LEVEL/, '要按纸面亮度归一化，纸才等于配色');
  assert.match(source, /PAPER_LEVEL = 206 \/ 255/, '纸面亮度基准要有实测来源');
  assert.match(source, /target\[0\] \* k \* 255/, '出的颜色 = 配色 × 比例');
  // 不去读原图色相：这张图是灰的，JPEG 给灰像素带的 1~3/255 色偏是噪声。
  // 早先按"原色相 + 目标色相"转，等于给每个像素加一个**随机**色相
  // （实测：薄荷渲成黄绿、藏蓝渲成品红，十套配色平均下来全糊成灰）。
  assert.doesNotMatch(code, /delta/, '不许再按原图色相转（灰贴图的色偏是噪声）');
  assert.match(source, /tintTexture\(source, hex\)/, '上色只吃配色，不再吃 hue/saturation');
  // **必须以原图为源**：`material.map` 换过之后就是算过的图，拿它当源会把上一种配色乘进来
  // （实测：原色正常，之后每换一次纸面就更黑一层，雪白渲成深灰）。
  assert.match(source, /userData\.lookSource/, '要把原图记下来，不能拿算过的图当源');
  assert.match(source, /tintTexture\(source, hex\)[\s\S]{0,120}material\.map = cached/,
    '每次都以原图重算，然后用算好的图替换 map');
  assert.doesNotMatch(code, /onBeforeCompile/, '废弃的着色器色相补丁不许回来（它在场景里不生效）');
  assert.doesNotMatch(code, /applyHueShift/, '废弃的 applyHueShift 不许回来');
  // 那四个"眼球"是别的模型遗留的垃圾几何（中心离板身 0.85m、蒙的骨头不存在），
  // 已在导出阶段整个删除；网页侧不该再有隐藏补丁。
  assert.doesNotMatch(source, /HIDDEN_MATERIALS|LEG_MATERIAL|tintLeg/,
    '垃圾几何要在导出阶段删掉，不要再留运行时的隐藏补丁');
  // 用绝对路径拼，别数 `../`（数错过一次，读到别的目录去了）。
  const exporter = readFileSync(join(__dirname, '..', '..', 'Build', 'ruler', 'export_ruler.py'), 'utf8');
  assert.match(exporter, /for name in EYES:[\s\S]{0,220}dropped stray eye geometry/,
    '导出脚本要逐个删掉那四个球（球体.004~007）');
});

test('界面是两步的：先配色，再配件', () => {
  const chooser = readFileSync(new URL('../src/LookChooser.tsx', import.meta.url), 'utf8');
  assert.match(chooser, /useState<LookStep>\("color"\)/, '打开就是第 1 步配色');
  assert.match(chooser, /1 配色/, '步骤按钮要写清 1 配色');
  assert.match(chooser, /2 配件/, '步骤按钮要写清 2 配件');
  assert.match(chooser, /ColorChooser/, '第 1 步是配色');
  assert.match(chooser, /AccessoryChooser/, '第 2 步是配件');
  // 着色/显隐只改材质与 visible，不许重新加载模型。
  const model = readFileSync(new URL('../src/characterLook.ts', import.meta.url), 'utf8');
  assert.match(model, /object\.visible = wanted\.has\(name\)/, '配件靠 visible 切换，不重新加载');
  assert.doesNotMatch(model, /loadAsync|GLTFLoader/, '应用外观不该碰加载器');
  const avatar = readFileSync(new URL('../src/OfficeAvatar.ts', import.meta.url), 'utf8');
  assert.match(avatar, /applyAppearance\(appearance: Appearance\)[\s\S]*setCharacterAppearance/,
    '本人换装走 applyAppearance');
});

