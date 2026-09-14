const fs = require('node:fs');
const assert = require('node:assert/strict');
function read(file) {
  const bytes = fs.readFileSync(file), length = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  return { doc: JSON.parse(bytes.subarray(20, 20 + length)), bin: bytes.subarray(28 + length) };
}
const base = read('OfficeWeb/public/assets/office-baked.glb');
const images = new Set(base.doc.images.map(i => i.bufferView));
const bytes = (model, view) => model.bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
for (const name of ['office-balanced.glb', 'office-balanced-gpu.glb']) {
  const model = read('OfficeWeb/public/assets/' + name);
  for (const key of ['nodes', 'meshes', 'accessors', 'materials', 'scenes', 'scene', 'samplers']) {
    assert.deepEqual(model.doc[key], base.doc[key], key);
  }
  let geometry = 0;
  base.doc.bufferViews.forEach((view, index) => {
    if (images.has(index)) return;
    assert.ok(bytes(base, view).equals(bytes(model, model.doc.bufferViews[index])), 'geometry/UV changed: ' + index);
    geometry++;
  });
  if (name.includes('gpu')) {
    for (const image of model.doc.images) {
      const data = bytes(model, model.doc.bufferViews[image.bufferView]);
      assert.equal(data.subarray(0, 12).toString('hex'), 'ab4b5458203230bb0d0a1a0a');
      assert.ok(data.readUInt32LE(20) <= 2048);
      assert.ok(data.readUInt32LE(24) <= 2048);
      for (const offset of [20, 24]) {
        const dimension = data.readUInt32LE(offset);
        assert.equal(dimension & (dimension - 1), 0, 'GPU mip dimension must be power of two');
      }
      assert.ok(data.readUInt32LE(40) > 1, 'mipmaps absent');
    }
  }
  console.log(name + ': all nodes/materials/UV unchanged, ' + geometry + ' geometry buffers identical, 125 textures checked');
}
