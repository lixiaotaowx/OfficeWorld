import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';

export function createPresenceStatus(path) {
  let rows = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
  return async (req, res, accounts) => {
    if (new URL(req.url, 'http://office').pathname !== '/api/presence-status') return false;
    const send = (code, value) => {
      res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(value));
    };
    const user = accounts?.authenticate(req);
    if (!user) { send(401, { error: '请先登录' }); return true; }
    if (req.method === 'GET') { send(200, { statuses: rows }); return true; }
    if (req.method !== 'POST') { send(405, { error: '不支持的请求' }); return true; }
    if (!accounts.originAllowed(req)) { send(403, { error: '来源不允许' }); return true; }
    try {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 2048) { send(413, { error: '状态太长' }); return true; }
        chunks.push(chunk);
      }
      const raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (typeof raw.text !== 'string') { send(400, { error: '请填写状态文字' }); return true; }
      const text = raw.text.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
      if ([...text].length > 40) { send(400, { error: '状态最多40个字' }); return true; }
      // Identity always comes from the authenticated session, never the request body.
      const next = { ...rows };
      if (text) next[user.id] = text;
      else delete next[user.id];
      writeFileSync(path + '.next', JSON.stringify(next));
      renameSync(path + '.next', path);
      rows = next;
      send(200, { statuses: rows });
    } catch { send(400, { error: '状态未能保存，请重试' }); }
    return true;
  };
}
