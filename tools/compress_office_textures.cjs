// Keep scene JSON, UVs and geometry byte-for-byte; replace only embedded images.
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { createHash } = require('node:crypto');
const sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const run = promisify(execFile);
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'OfficeWeb/public/assets/office-baked.glb');
const output = path.join(root, 'OfficeWeb/public/assets/office-baked-ktx2.glb');
const codec = process.env.TEXTURE_CODEC || 'etc1s';
const quality = process.env.TEXTURE_QUALITY || '255';
const work = path.join(root, `Build/OfficeTextureCompression-${codec}-${quality}`);
fs.mkdirSync(work, { recursive: true });
const source = fs.readFileSync(input);
const cacheIdentity = createHash('sha256').update(source).digest('hex');
const manifest = path.join(work, 'source.sha256');
if (fs.existsSync(manifest) && fs.readFileSync(manifest, 'utf8') !== cacheIdentity) {
  throw Error('Source GLB changed. Use a new conversion cache directory before rebuilding.');
}
fs.writeFileSync(manifest, cacheIdentity);
const jsonLength = source.readUInt32LE(12);
const doc = JSON.parse(source.subarray(20, 20 + jsonLength));
const bin = source.subarray(28 + jsonLength);
const replacements = new Map();
async function encode(index) {
  const image = doc.images[index], view = doc.bufferViews[image.bufferView];
  const original = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  const png = path.join(work, `${index}.png`), ktx = path.join(work, `${index}.ktx2`);
  if (!fs.existsSync(ktx)) {
    await sharp(original).png().toFile(png);
    const settings = codec === 'uastc' ? ['--uastc_quality', '2', '--zcmp', '18'] : ['--qlevel', quality, '--clevel', '2'];
    await run(path.join(root, 'Build/KtxTools/bin/toktx.exe'), [
      '--t2', '--encode', codec, ...settings,
      '--genmipmap', '--assign_oetf', 'srgb', '--threads', '2', ktx, png,
    ], { windowsHide: true });
  }
  replacements.set(image.bufferView, fs.readFileSync(ktx));
  image.mimeType = 'image/ktx2';
  if (index % 10 === 0) console.log(`Encoded ${index + 1}/${doc.images.length}`);
}
(async () => {
  for (let i = 0; i < doc.images.length; i += 2) {
    await Promise.all(doc.images.slice(i, i + 2).map((_, n) => encode(i + n)));
  }
  const parts = []; let size = 0;
  for (let i = 0; i < doc.bufferViews.length; i++) {
    const view = doc.bufferViews[i];
    const data = replacements.get(i) || bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    view.byteOffset = size; view.byteLength = data.length;
    parts.push(data); size += data.length;
    const padding = (4 - size % 4) % 4;
    if (padding) { parts.push(Buffer.alloc(padding)); size += padding; }
  }
  for (const texture of doc.textures) {
    const source = texture.extensions?.EXT_texture_webp?.source ?? texture.source;
    texture.extensions = { ...texture.extensions, KHR_texture_basisu: { source } };
    delete texture.extensions.EXT_texture_webp; delete texture.source;
  }
  for (const key of ['extensionsUsed', 'extensionsRequired']) {
    doc[key] = [...new Set(doc[key].filter(x => x !== 'EXT_texture_webp').concat('KHR_texture_basisu'))];
  }
  doc.buffers[0].byteLength = size;
  let json = Buffer.from(JSON.stringify(doc));
  json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const header = Buffer.alloc(20), binHeader = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + json.length + size, 8);
  header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  binHeader.writeUInt32LE(size); binHeader.writeUInt32LE(0x004e4942, 4);
  fs.writeFileSync(output, Buffer.concat([header, json, binHeader, ...parts]));
  console.log(JSON.stringify({ inputBytes: source.length, outputBytes: fs.statSync(output).size, images: doc.images.length }));
})().catch(error => { console.error(error); process.exitCode = 1; });
