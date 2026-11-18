import { mkdirSync, appendFileSync, renameSync, rmSync, statSync, existsSync, createReadStream, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
export const MAX_MODEL_FILE = 20 * 1024 * 1024;

// Imported models arrive as binary glTF (OBJ files are converted to GLB in the browser before upload),
// in base64 chunks like cinema videos, and are served back with a long cache since a file never changes.
export function createModelMedia(directory) {
  const pending = new Map();
  const valid = /^[a-f0-9-]{36}\.glb$/;
  const file = name => { if (!valid.test(name)) throw Error('Invalid model file'); return join(directory, name); };
  function discard(row) { rmSync(join(directory, row.id + '.part'), { force: true }); pending.delete(row.owner); }
  // a GLB starts with 'glTF', version 2, and states its own total length
  function header(bytes, total) {
    return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'glTF' && bytes.readUInt32LE(4) === 2
      && bytes.readUInt32LE(8) === total;
  }
  return {
    exists(name) { return valid.test(name) && existsSync(file(name)); },
    prune(keepNames) {
      if (!existsSync(directory)) return;
      const keep = new Set(keepNames);
      for (const name of readdirSync(directory)) {
        if (!valid.test(name) && !/^[a-f0-9-]{36}\.part$/.test(name)) continue;
        if (keep.has(name) || [...pending.values()].some(row => name === row.id + '.part')) continue;
        const path = join(directory, name);
        if (Date.now() - statSync(path).mtimeMs > 86400000) rmSync(path, { force: true });
      }
    },
    upload(user, input) {
      mkdirSync(directory, { recursive: true, mode: 0o700 });
      for (const row of pending.values()) if (Date.now() - row.at > 120000) discard(row);
      if (input?.type !== 'model/gltf-binary' || !Number.isSafeInteger(input.total) || input.total < 12
        || input.total > MAX_MODEL_FILE || typeof input.bytes !== 'string' || input.bytes.length > 175000
        || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.bytes)) throw Error('选一个 20 MB 以内的 GLB 或 OBJ 模型');
      const bytes = Buffer.from(input.bytes, 'base64');
      if (!bytes.length || bytes.length > 128 * 1024) throw Error('模型数据不对');
      let row = pending.get(user.id);
      if (input.offset === 0 && !input.uploadId) {
        if (row) discard(row);
        if (!header(bytes, input.total)) throw Error('这不是有效的 GLB 模型');
        row = { id: randomUUID(), owner: user.id, total: input.total, offset: 0, at: Date.now() };
        pending.set(user.id, row);
      }
      if (!row || (input.uploadId && input.uploadId !== row.id) || row.total !== input.total
        || input.offset !== row.offset || row.offset + bytes.length > row.total)
        throw Error('上传断了，重新选一次文件');
      try { appendFileSync(join(directory, row.id + '.part'), bytes, { mode: 0o600 }); }
      catch (error) { discard(row); throw error; }
      row.offset += bytes.length; row.at = Date.now();
      if (row.offset < row.total) return { uploadId: row.id, offset: row.offset };
      const name = row.id + '.glb';
      renameSync(join(directory, row.id + '.part'), file(name)); pending.delete(user.id);
      return { uploadId: row.id, offset: row.offset, file: name };
    },
    serve(req, res, name) {
      let path, info;
      try { path = file(name); info = statSync(path); } catch { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'model/gltf-binary', 'Content-Length': info.size,
        'Cache-Control': 'private, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = createReadStream(path);
      res.on('close', () => stream.destroy()); stream.on('error', () => res.destroy()); stream.pipe(res);
    },
  };
}
