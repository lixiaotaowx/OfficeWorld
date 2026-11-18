import { seatCountOf } from './part-library.mjs';
import { createBuildWorkstations } from './build-workstations.mjs';
import { createBuildStore } from './build-store.mjs';
import { resolveBuildLink } from './build-link.mjs';
import { buildCover } from './build-cover.mjs';
import { createCinemaMedia } from './cinema-media.mjs';
import { createModelMedia } from './model-media.mjs';

// the seats a part offers: one for a chair or stool, one per place on a sofa, and imported models made to sit on
const seatIds=(p,model)=>{const n=seatCountOf(p.kind)||(model?.role==='seat'?1:0);
  return n<=1?(n?[`build-seat-${p.id}`]:[]):Array.from({length:n},(_,i)=>`build-seat-${p.id}:${i}`);};

export function createBuildHttp(path, occupied = () => false) {
  let store;
  const cinemaMedia=createCinemaMedia(path+'.media');
  const modelMedia=createModelMedia(path+'.models');
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
        if (!throttle('link:' + account.id, 1500)) { send(429, { error: 'Please try again later' }); return true; }
        send(200, { url: await resolveBuildLink(url.searchParams.get('resolveLink')) });
        return true;
      }

      if (req.method === 'GET' && url.searchParams.has('cover')) {
        const cover = await buildCover(url.searchParams.get('cover'));
        if (!cover) { res.writeHead(204, { 'Cache-Control': 'private, max-age=300' }); res.end(); return true; }
        res.writeHead(200, { 'Content-Type': cover.type, 'Content-Length': cover.body.length,
          'Cache-Control': 'private, max-age=86400' });
        res.end(cover.body);
        return true;
      }
      store ||= createBuildStore(path);
      if(['GET','HEAD'].includes(req.method) && url.searchParams.has('modelFile')) {
        modelMedia.serve(req,res,url.searchParams.get('modelFile'));return true;
      }
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
        if (!accounts.originAllowed(req)) { send(403, { error: 'Origin not allowed' }); return true; }
        if (!throttle(account.id, 120)) { send(429, { error: '太快了，等一下' }); return true; }
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 240000) { send(413, { error: '内容太大了' }); return true; }
          chunks.push(chunk);
        }
        const command = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if(url.searchParams.has('modelUpload')){
          if(command.offset===0)modelMedia.prune(store.modelFiles());
          send(200,modelMedia.upload(account,command));return true;
        }
        if(command.action==='model-add' && !modelMedia.exists(command.model?.file))throw Error('模型还没传完');
        if(url.searchParams.has('cinemaUpload')){
          const id=url.searchParams.get('cinemaUpload');store.screen(id);
          if(command.offset===0)cinemaMedia.prune(store.screenSources());
          send(200,cinemaMedia.upload(id,account,command));return true;
        }
        if(command.action==='cinema' && command.content?.src?.startsWith('/api/build?cinemaFile=')
          && !cinemaMedia.exists(command.content.src))throw Error('视频还没传完');
        const modifiedIds=['moveMany','removeMany'].includes(command.action) && Array.isArray(command.items)
          ? command.items.map(item=>item.id) : ['move','remove'].includes(command.action) ? [command.id] : [];
        const partOf=id=>store.snapshot().parts.find(p=>p.id===id);
        if (modifiedIds.some(id=>{const p=partOf(id);return (p && seatIds(p,store.model(p.kind.startsWith('model:')?p.kind.slice(6):'')).some(occupied)) || (registry.index(id)!==undefined && occupied(`desk-${registry.index(id)}`));})) {
          send(409, { error: '有人坐在这里，等空了再改' }); return true;
        }
        send(200, store.mutate(command, account));
      } else send(405, { error: 'Unsupported request' });
    } catch (error) {
      send(400, { error: error.code ? '没存上，等一下再试' : error.message });
    }
    return true;
  };
  handle.hasSeat = id => {
    if(typeof id==='string' && id.startsWith('desk-'))return registry.valid(Number(id.slice(5)));
    if (typeof id !== 'string') return false;
    try {
      store ||= createBuildStore(path);
      return store.snapshot().parts.some(p => !p.pitch && !p.roll
        && seatIds(p, store.model(p.kind.startsWith('model:') ? p.kind.slice(6) : '')).includes(id));
    } catch { return false; }
  };
  handle.sofaSeats = () => {
    try { store ||= createBuildStore(path); return store.snapshot().parts.filter(p => p.kind === 'sofa' && !p.pitch && !p.roll).flatMap(p => seatIds(p)); }
    catch { return []; }
  };
  /** True once, at start-up, when the save was replaced by the library hall: old desk numbers and claims are void. */
  handle.reset = () => {
    store ||= createBuildStore(path);
    if (!store.wasReset()) return false;
    registry.clear();
    return true;
  };
  handle.catWorld = () => {
    store ||= createBuildStore(path);
    const world = store.snapshot();
    return { revision: world.revision, models: world.models.map(({id,size})=>({id,size})),
      parts: world.parts.map(({id,kind,x,y,z,rotation,pitch,roll,scale})=>({id,kind,x,y,z,rotation,pitch,roll,scale})) };
  };
  handle.hasWorkstation=registry.valid;
  handle.seatCount=registry.count;
  return handle;
}
