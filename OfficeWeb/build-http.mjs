import { fixtureFor } from './scene-fixtures.mjs';
import { createBuildWorkstations } from './build-workstations.mjs';
import { createBuildStore } from './build-store.mjs';
import { resolveBuildLink } from './build-link.mjs';
import { buildCover } from './build-cover.mjs';
import { createCinemaMedia } from './cinema-media.mjs';

const originalSeatId=p=>p && !p.fixtureCopy ? fixtureFor(p)?.seat?.id || '' : '';

export function createBuildHttp(path, occupied = () => false) {
  let store;
  const cinemaMedia=createCinemaMedia(path+'.media');
  const registry=createBuildWorkstations(path+'.seats.json',()=>{store ||= createBuildStore(path);return store.snapshot().parts;});
  const limits = new Map();
  const handle = async (req, res, accounts) => {
    const url = new URL(req.url, 'http://office');
    if (url.pathname !== '/api/build') return false;
    const send = (status, value) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(registry.decorate(value)));
    };
    const throttle = (key, gap) => {
      const now = Date.now();
      if (now - (limits.get(key) || 0) < gap) return false;
      limits.set(key, now);
      if (limits.size > 1000) for (const [id, time] of limits) if (now - time > 60000) limits.delete(id);
      return true;
    };
    const account = accounts?.authenticate(req);
    if (!account) { send(401, { error: '请先登录' }); return true; }
    try {
      if (req.method === 'GET' && url.searchParams.has('resolveLink')) {
        if (!throttle('link:' + account.id, 1500)) { send(429, { error: '请稍后重试' }); return true; }
        send(200, { url: await resolveBuildLink(url.searchParams.get('resolveLink')) });
        return true;
      }
      // 视频封面：服务端解析平台封面并代理图片字节，页面只认本站地址（见 build-cover.mjs）。
      // 这里**故意不做每账号限速**：一屏里可能同时有好几条视频链接，逐个 429 会让缩略图
      // 成片消失；上游压力改由 build-cover 的内存缓存 + 单链接合并 + 3 条并发闸门兜住。
      if (req.method === 'GET' && url.searchParams.has('cover')) {
        const cover = await buildCover(url.searchParams.get('cover'));
        if (!cover) { res.writeHead(204, { 'Cache-Control': 'private, max-age=300' }); res.end(); return true; }
        res.writeHead(200, { 'Content-Type': cover.type, 'Content-Length': cover.body.length,
          'Cache-Control': 'private, max-age=86400' });
        res.end(cover.body);
        return true;
      }
      store ||= createBuildStore(path);
      if(['GET','HEAD'].includes(req.method) && url.searchParams.has('cinemaFile')) {
        cinemaMedia.serve(req,res,url.searchParams.get('cinemaFile'));return true;
      }
      if (req.method === 'GET') {
        if(url.searchParams.has('cinema')){send(200,store.screen(url.searchParams.get('cinema')));return true;}
        const id = url.searchParams.get('chest');
        const snapshot = store.snapshot();
        send(200, id ? { entries: store.chest(id), people: store.people(id) } :
          url.searchParams.get('revision') === String(snapshot.revision) ? { unchanged: true } : snapshot);
      } else if (req.method === 'POST') {
        if (!accounts.originAllowed(req)) { send(403, { error: '来源不允许' }); return true; }
        if (!throttle(account.id, 120)) { send(429, { error: '操作太快，请稍候' }); return true; }
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 240000) { send(413, { error: '内容太大' }); return true; }
          chunks.push(chunk);
        }
        const command = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if(url.searchParams.has('cinemaUpload')){
          const id=url.searchParams.get('cinemaUpload');store.screen(id);
          if(command.offset===0)cinemaMedia.prune(store.screenSources());
          send(200,cinemaMedia.upload(id,account,command));return true;
        }
        if(command.action==='cinema' && command.content?.src?.startsWith('/api/build?cinemaFile=')
          && !cinemaMedia.exists(command.content.src))throw Error('影片尚未上传完成');
        const modifiedIds=command.action==='moveMany' && Array.isArray(command.items)
          ? command.items.map(item=>item.id) : ['move','remove'].includes(command.action) ? [command.id] : [];
        if (modifiedIds.some(id=>occupied(`build-seat-${id}`) || occupied(originalSeatId(store.snapshot().parts.find(p=>p.id===id))) || (registry.index(id)!==undefined && occupied(`desk-${registry.index(id)}`)))) {
          send(409, { error: '有人正在使用这个座位，请等他起身后再修改' }); return true;
        }
        send(200, store.mutate(command, account));
      } else send(405, { error: '不支持的请求' });
    } catch (error) {
      send(400, { error: error.code ? '存档暂时无法保存，请稍后重试' : error.message });
    }
    return true;
  };
  handle.hasSeat = id => {
    if(typeof id==='string' && id.startsWith('desk-'))return registry.valid(Number(id.slice(5)));
    if (typeof id !== 'string') return false;
    try {
      store ||= createBuildStore(path);
      return store.snapshot().parts.some(p => (originalSeatId(p) || `build-seat-${p.id}`) === id && !p.pitch && !p.roll && ['chair','sofa'].includes(p.kind));
    } catch { return false; }
  };
  handle.hasWorkstation=registry.valid;
  handle.seatCount=registry.count;
  return handle;
}
