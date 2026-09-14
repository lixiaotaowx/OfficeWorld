import { randomUUID, randomInt } from 'node:crypto';

export function createMeetings(io, people, publish, removeMedia = async () => {}, updatePermissions = async () => {}) {
  const meetings = new Map();
  const removals = new Map();
  function revoke(room, identity) {
    const key = `${room}:${identity}`;
    const pending = (removals.get(key) || Promise.resolve())
      .then(() => removeMedia(room, identity));
    removals.set(key, pending);
    const clear = () => { if (removals.get(key) === pending) removals.delete(key); };
    void pending.then(clear, error => {
      console.warn('Meeting media removal failed:', error.message); clear();
    });
    return pending;
  }
  const uid = p => p.clientId || p.id;
  const online = id => [...people.values()].find(p => uid(p) === id);
  const activeFor = id => [...meetings.values()].find(m => m.members.get(id)?.status === 'joined');
  function snapshot(m) {
    return { id: m.id, code: m.code, title: m.title, host: m.host, room: m.room,
      createdAt: m.createdAt, members: [...m.members.values()].map(p => ({ ...p, online: !!online(p.id) })) };
  }
  function sync() {
    for (const m of meetings.values()) {
      const publisher = people.get(m.screenOwner);
      if (m.screenOwner && (!publisher || m.members.get(uid(publisher))?.status !== 'joined')) {
        m.screenOwner = null; m.screenLease = null;
      }
    }
    for (const p of people.values()) {
      const id = uid(p), active = activeFor(id);
      p.meeting = !!active; p.meetingRoom = active?.room || null;
      io.to(p.id).emit('meeting-state', {
        active: active ? snapshot(active) : null,
        invitations: [...meetings.values()].filter(m => ['invited', 'left'].includes(m.members.get(id)?.status)).map(snapshot),
      });
    }
    publish();
  }
  function end(m) {
    meetings.delete(m.id);
    for (const p of m.members.values()) {
      const target = online(p.id);
      if (target) io.to(target.id).emit('notice', `会议「${m.title}」已结束`);
    }
    void removeMedia(m.room).catch(() => {});
  }
  function invite(m, ids) {
    if (!Array.isArray(ids) || ids.length > 50) throw Error('请选择至多 50 位成员');
    for (const id of new Set(ids)) {
      const person = online(id);
      if (!person || id === m.host || m.members.get(id)?.status === 'joined') continue;
      m.members.set(id, { id, name: person.name, status: 'invited' });
    }
  }
  function attach(s) {
    s.on('meeting-screen', (data, ack) => {
      if (typeof ack !== 'function') return;
      const m = [...meetings.values()].find(m => m.room === data?.room);
      if (!m) return ack({ ok: false, error: '会议已结束' });
      m.screenTail = (m.screenTail || Promise.resolve()).catch(() => {}).then(async () => {
        const person = people.get(s.id);
        if (!person || meetings.get(m.id) !== m || m.members.get(uid(person))?.status !== 'joined')
          throw Error('你当前不在会议中');
        if (!['claim', 'release'].includes(data.action) || typeof data.lease !== 'string' ||
            !/^[a-zA-Z0-9-]{1,80}$/.test(data.lease)) throw Error('无效的共享操作');
        if (data.action === 'release' && (m.screenOwner !== s.id || m.screenLease !== data.lease))
          return ack({ ok: true });
        const oldOwner = m.screenOwner, oldLease = m.screenLease;
        const nextOwner = data.action === 'claim' ? s.id : null;
        const peers = [...people.values()].filter(p => m.members.get(uid(p))?.status === 'joined').map(p => p.id);
        await updatePermissions({ room: m.room, peers, screenOwners: nextOwner ? [nextOwner] : [] });
        if (meetings.get(m.id) !== m || !people.has(s.id) || m.members.get(uid(person))?.status !== 'joined')
          throw Error('会议或连接已结束');
        m.screenOwner = nextOwner; m.screenLease = nextOwner ? data.lease : null;
        if (oldOwner && oldOwner !== nextOwner) io.to(oldOwner).emit('meeting-screen-replaced',
          { room: m.room, lease: oldLease });
        ack({ ok: true });
      }).catch(error => ack({ ok: false, error: error.message }));
    });
    let last = 0;
    s.on('meeting-action', async (data, ack) => {
      if (typeof ack !== 'function') return;
      try {
        const p = people.get(s.id); if (!p) throw Error('请先连接办公室');
        if (Date.now() - last < 150) throw Error('操作太快，请稍后重试');
        last = Date.now();
        const id = uid(p), action = data?.action;
        let m = meetings.get(data?.id);
        if (action === 'create') {
          if (activeFor(id)) throw Error('请先离开当前会议');
          if (meetings.size >= 50) throw Error('当前会议过多，请稍后再试');
          const title = String(data.title || '').trim();
          if (!title || title.length > 60) throw Error('会议主题需 1–60 个字符');
          const mid = randomUUID();
          let code; do { code = String(randomInt(100000000, 1000000000)); }
          while ([...meetings.values()].some(x => x.code === code));
          m = { id: mid, code, title, room: `meeting-${mid}`, host: id, createdAt: Date.now(), members: new Map() };
          m.members.set(id, { id, name: p.name, status: 'joined' });
          invite(m, data.invitees || []); meetings.set(mid, m);
        } else {
          if (!m) throw Error('会议已结束或不存在');
          const member = m.members.get(id);
          if (!member) throw Error('你没有收到该会议的邀请');
          if (action === 'accept') {
            const key = `${m.room}:${s.id}`;
            const pending = removals.get(key);
            if (pending) {
              await pending;
              if (removals.get(key) === pending) removals.delete(key);
            }
            if (meetings.get(m.id) !== m || !people.has(s.id)) throw Error('会议或连接已结束');
            if (activeFor(id) && activeFor(id) !== m) throw Error('请先离开当前会议');
            if (!['invited', 'left', 'joined'].includes(member.status)) throw Error('请让主持人重新邀请');
            member.status = 'joined';
          } else if (action === 'decline') {
            if (member.status !== 'invited') throw Error('邀请已处理');
            member.status = 'declined';
          } else if (action === 'leave') {
            if (member.status !== 'joined') throw Error('你当前不在会议中');
            member.status = 'left';
            revoke(m.room, s.id);
            if (m.host === id) {
              const successor = [...m.members.values()].find(x => x.status === 'joined');
              if (successor) m.host = successor.id; else end(m);
            }
          } else if (action === 'invite' || action === 'end' || action === 'remove') {
            if (m.host !== id) throw Error('只有主持人可以执行此操作');
            if (action === 'invite') invite(m, data.invitees || []);
            if (action === 'end') end(m);
            if (action === 'remove') {
              const target = m.members.get(data.target);
              if (!target || target.id === id) throw Error('无效的成员');
              target.status = 'removed';
              const person = online(target.id);
              if (person) {
                io.to(person.id).emit('notice', '主持人已将你移出会议');
                revoke(m.room, person.id);
              }
            }
          } else throw Error('无效的会议操作');
        }
        sync(); ack({ ok: true, id: m.id });
      } catch (e) { ack({ ok: false, error: e.message }); }
    });
    s.on('meeting-sync', sync);
    s.on('disconnect', () => {
      // Rejoin with the same account within a minute restores membership.
      const id = uid(people.get(s.id) || { id: s.id, clientId: s.data.account?.id });
      const timer = setTimeout(() => {
        if (online(id)) return;
        const m = activeFor(id);
        if (m) {
          m.members.get(id).status = 'left';
          if (m.host === id) {
            const next = [...m.members.values()].find(x => x.status === 'joined' && online(x.id));
            if (next) m.host = next.id; else end(m);
          }
          sync();
        }
      }, 60000); timer.unref();
    });
  }
  return { attach, sync, screenOwner: room => [...meetings.values()].find(m => m.room === room)?.screenOwner };
}
