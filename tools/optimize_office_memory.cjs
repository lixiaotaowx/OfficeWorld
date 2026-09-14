// Offline texture-only conversion. Geometry, UVs, nodes and source GLB stay intact.
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { createHash } = require('node:crypto');
const sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const run = promisify(execFile);
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'OfficeWeb/public/assets/office-baked.glb'));
const length = source.readUInt32LE(12);
const doc = JSON.parse(source.subarray(20, 20 + length));
const bin = source.subarray(28 + length);
const identity = createHash('sha256').update(source).digest('hex');
const work = path.join(root, 'Build/OfficeMemoryBalanced-' + identity.slice(0, 12));
fs.mkdirSync(work, { recursive: true });
const names = doc.images.map(() => []);
for (const material of doc.materials) {
  const index = material.pbrMetallicRoughness?.baseColorTexture?.index;
  if (index == null) continue;
  const texture = doc.textures[index];
  const image = texture.extensions?.EXT_texture_webp?.source ?? texture.source;
  names[image].push(material.name || '');
}
function limit(name) {
  if (/ivory floor/i.test(name)) return 2048;
  if (/Keyboard|Island_[AB] top|Manager \/ desk\.|oval table|rug|floor tone/i.test(name)) return 1024;
  if (/wall|divider|color panel|continuous curved|coffee tabletop|Collaboration round table/i.test(name)) return 512;
  if (/monitor|approved chair|Leaf|tiny_treats/i.test(name)) return 512;
  return 256;
}
const report = { source: identity, rows: [], beforeRGBA: 0, afterRGBA: 0, outputs: {} };
const compressed = new Map(), fallback = new Map();
async function convert(i) {
  const image = doc.images[i], view = doc.bufferViews[image.bufferView];
  const data = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  const info = await sharp(data).metadata();
  const cap = limit(names[i].join(' ') + ' ' + image.name);
  const factor = Math.min(1, cap / Math.max(info.width, info.height));
  // S3TC mip uploads require compatible block dimensions on Windows GPUs.
  // Resampling each axis preserves normalized UV placement on the same mesh.
  const powerOfTwo = value => 2 ** Math.floor(Math.log2(Math.max(1, value)));
  const width = powerOfTwo(info.width * factor);
  const height = powerOfTwo(info.height * factor);
  const png = path.join(work, `${i}-${width}x${height}.png`);
  const ktx = png.replace('.png', '.ktx2');
  const webp = png.replace('.png', '.webp');
  if (!fs.existsSync(png)) await sharp(data).resize(width, height, { fit: 'fill', kernel: 'lanczos3' }).png().toFile(png);
  if (!fs.existsSync(webp)) await sharp(png).webp({ quality: 88, alphaQuality: 100, effort: 5 }).toFile(webp);
  if (!fs.existsSync(ktx)) await run(path.join(root, 'Build/KtxTools/bin/toktx.exe'), [
    '--t2', '--encode', 'uastc', '--uastc_quality', '2', '--zcmp', '18',
    '--genmipmap', '--assign_oetf', 'srgb', '--threads', '2', ktx, png,
  ], { windowsHide: true });
  compressed.set(image.bufferView, fs.readFileSync(ktx));
  fallback.set(image.bufferView, fs.readFileSync(webp));
  report.beforeRGBA += info.width * info.height * 4;
  report.afterRGBA += width * height * 4;
  report.rows.push({ index: i, name: names[i].join('; '), before: [info.width, info.height], after: [width, height] });
  if (i % 10 === 0) console.log(`Processed ${i + 1}/${doc.images.length}`);
}
function write(replacements, gpu) {
  const output = structuredClone(doc), parts = [];
  let size = 0;
  for (let i = 0; i < doc.bufferViews.length; i++) {
    const view = doc.bufferViews[i];
    const data = replacements.get(i) || bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    output.bufferViews[i].byteOffset = size;
    output.bufferViews[i].byteLength = data.length;
    parts.push(data); size += data.length;
    const padding = (4 - size % 4) % 4;
    if (padding) { parts.push(Buffer.alloc(padding)); size += padding; }
  }
  output.images.forEach(image => { image.mimeType = gpu ? 'image/ktx2' : 'image/webp'; });
  if (gpu) {
    for (const texture of output.textures) {
      const source = texture.extensions?.EXT_texture_webp?.source ?? texture.source;
      texture.extensions = { ...texture.extensions, KHR_texture_basisu: { source } };
      delete texture.extensions.EXT_texture_webp; delete texture.source;
    }
    for (const key of ['extensionsUsed', 'extensionsRequired']) {
      output[key] = [...new Set((output[key] || []).filter(x => x !== 'EXT_texture_webp').concat('KHR_texture_basisu'))];
    }
  }
  output.buffers[0].byteLength = size;
  let json = Buffer.from(JSON.stringify(output));
  json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const header = Buffer.alloc(20), binHeader = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + json.length + size, 8);
  header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  binHeader.writeUInt32LE(size); binHeader.writeUInt32LE(0x004e4942, 4);
  const filename = `office-balanced${gpu ? '-gpu' : ''}.glb`;
  const bytes = Buffer.concat([header, json, binHeader, ...parts]);
  fs.writeFileSync(path.join(root, 'OfficeWeb/public/assets', filename), bytes);
  report.outputs[filename] = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}
(async () => {
  for (let i = 0; i < doc.images.length; i += 2) {
    await Promise.all(doc.images.slice(i, i + 2).map((_, n) => convert(i + n)));
  }
  write(compressed, true); write(fallback, false);
  report.rows.sort((a, b) => a.index - b.index);
  fs.writeFileSync(path.join(work, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ beforeRGBA: report.beforeRGBA, afterRGBA: report.afterRGBA, outputs: report.outputs }));
})().catch(error => { console.error(error); process.exitCode = 1; });
