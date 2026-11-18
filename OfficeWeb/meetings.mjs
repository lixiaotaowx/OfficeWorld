import { randomUUID, randomInt } from 'node:crypto';

// A meeting is either a titled meeting with a host (the original flow) or a huddle: no title, no host,
// open to any member, invitations ring for a while, and it ends by itself once fewer than two people remain.
export function createMeetings(io, people, publish, removeMedia = async () => {}, updatePermissions = async () => {},
  { ringMs = 30000 } = {}) {
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
  const sharer = m => { const p = m.screenOwner && people.get(m.screenOwner); return p ? uid(p) : null; };
  function snapshot(m) {
    return { id: m.id, code: m.code, title: m.title, host: m.host, room: m.room, huddle: !!m.huddle, sharing: sharer(m),
      createdAt: m.createdAt, members: [...m.members.values()].map(p => ({ ...p, online: !!online(p.id) })) };
  }
  // What the dock draws as bubbles: who is in each huddle, who is still being rung, who is sharing. No room names.
  const bubble = m => ({ id: m.id, since: m.createdAt, sharing: sharer(m),
    members: [...m.members.values()].filter(x => x.status === 'joined').map(({ id, name }) => ({ id, name })),
    ringing: [...m.members.values()].filter(x => x.status === 'invited').map(({ id, name }) => ({ id, name })) });
  // Visitors only see the huddles they were asked into.
  const huddlesFor = (p, id) => [...meetings.values()]
    .filter(m => m.huddle && (p.role !== 'visitor' || m.members.has(id))).map(bubble);
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
        huddles: huddlesFor(p, id),
      });
    }
    publish();
  }
  function end(m) {
    meetings.delete(m.id);
    for (const t of m.rings?.values() || []) clearTimeout(t);
    if (!m.huddle) for (const p of m.members.values()) {
      const target = online(p.id);
      if (target) io.to(target.id).emit('notice', `会议“${m.title}”结束了`);
    }
    void removeMedia(m.room).catch(() => {});
  }
  // A huddle ends when nobody is left, or when one person is left and nobody is still being rung.
  function settle(m) {
    if (!m.huddle || meetings.get(m.id) !== m) return;
    const members = [...m.members.values()], joined = members.filter(x => x.status === 'joined');
    const ringing = members.some(x => x.status === 'invited');
    if (joined.length === 0 || (joined.length === 1 && !ringing)) {
      if (joined.length === 1 && members.length > 1) {
        const last = online(joined[0].id);
        if (last) io.to(last.id).emit('notice', '其他人都离开了');
      }
      end(m);
    }
  }
  function ring(m, id) {
    if (!m.huddle) return;
    m.rings ||= new Map();
    clearTimeout(m.rings.get(id));
    const timer = setTimeout(() => {
      m.rings.delete(id);
      const member = m.members.get(id);
      if (meetings.get(m.id) !== m || member?.status !== 'invited') return;
      member.status = 'missed'; settle(m); sync();
    }, ringMs);
    timer.unref?.();
    m.rings.set(id, timer);
  }
  function invite(m, ids) {
    if (!Array.isArray(ids) || ids.length > 50) throw Error('Choose up to 50 members');
    for (const id of new Set(ids)) {
      const person = online(id);
      if (!person || id === m.host || m.members.get(id)?.status === 'joined') continue;
      m.members.set(id, { id, name: person.name, status: 'invited' });
      ring(m, id);
    }
  }
  function attach(s) {
    s.on('meeting-screen', (data, ack) => {
      if (typeof ack !== 'function') return;
      const m = [...meetings.values()].find(m => m.room === data?.room);
      if (!m) return ack({ ok: false, error: 'Meeting has ended' });
      m.screenTail = (m.screenTail || Promise.resolve()).catch(() => {}).then(async () => {
        const person = people.get(s.id);
        if (!person || meetings.get(m.id) !== m || m.members.get(uid(person))?.status !== 'joined')
          throw Error('You are not in the meeting');
        if (!['claim', 'release'].includes(data.action) || typeof data.lease !== 'string' ||
            !/^[a-zA-Z0-9-]{1,80}$/.test(data.lease)) throw Error('Invalid sharing action');
        if (data.action === 'release' && (m.screenOwner !== s.id || m.screenLease !== data.lease))
          return ack({ ok: true });
        const oldOwner = m.screenOwner, oldLease = m.screenLease;
        const nextOwner = data.action === 'claim' ? s.id : null;
        const peers = [...people.values()].filter(p => m.members.get(uid(p))?.status === 'joined').map(p => p.id);
        await updatePermissions({ room: m.room, peers, screenOwners: nextOwner ? [nextOwner] : [] });
        if (meetings.get(m.id) !== m || !people.has(s.id) || m.members.get(uid(person))?.status !== 'joined')
          throw Error('Meeting or connection has ended');
        m.screenOwner = nextOwner; m.screenLease = nextOwner ? data.lease : null;
        if (oldOwner && oldOwner !== nextOwner) io.to(oldOwner).emit('meeting-screen-replaced',
          { room: m.room, lease: oldLease });
        ack({ ok: true });
        if (m.huddle) sync(); // the bubble shows who is sharing
      }).catch(error => ack({ ok: false, error: error.message }));
    });
    let last = 0;
    s.on('meeting-action', async (data, ack) => {
      if (typeof ack !== 'function') return;
      try {
        const p = people.get(s.id); if (!p) throw Error('Connect to the office first');
        if (Date.now() - last < 150) throw Error('Too many actions. Please try again');
        last = Date.now();
        const id = uid(p), action = data?.action;
        let m = meetings.get(data?.id);
        if (action === 'create' || action === 'huddle') {
          if (activeFor(id)) throw Error('Leave the current meeting first');
          if (meetings.size >= 50) throw Error('Too many active meetings. Please try again');
          const huddle = action === 'huddle';
          const title = huddle ? '' : String(data.title || '').trim();
          if (!huddle && (!title || title.length > 60)) throw Error('Meeting title must be 1-60 characters');
          const invitees = Array.isArray(data.invitees) ? data.invitees.filter(x => x !== id && online(x)) : [];
          const mid = randomUUID();
          let code; do { code = String(randomInt(100000000, 1000000000)); }
          while ([...meetings.values()].some(x => x.code === code));
          m = { id: mid, code, title, room: `meeting-${mid}`, host: huddle ? null : id, huddle, createdAt: Date.now(), members: new Map() };
          m.members.set(id, { id, name: p.name, status: 'joined' });
          invite(m, huddle ? invitees : data.invitees || []); meetings.set(mid, m);
        } else {
          if (!m) throw Error('Meeting has ended or does not exist');
          // walking into a huddle: any member may, a visitor only when asked
          if (action === 'join') {
            if (!m.huddle) throw Error('Ask the host to invite you');
            if (!m.members.has(id) && p.role === 'visitor') throw Error('Visitors join a huddle when someone invites them');
            if (!m.members.has(id)) m.members.set(id, { id, name: p.name, status: 'invited' });
          }
          const member = m.members.get(id);
          if (!member) throw Error('You are not invited to this meeting');
          if (action === 'accept' || action === 'join') {
            const key = `${m.room}:${s.id}`;
            const pending = removals.get(key);
            if (pending) {
              await pending;
              if (removals.get(key) === pending) removals.delete(key);
            }
            if (meetings.get(m.id) !== m || !people.has(s.id)) throw Error('Meeting or connection has ended');
            if (activeFor(id) && activeFor(id) !== m) throw Error('Leave the current meeting first');
            const again = m.huddle ? ['invited', 'left', 'joined', 'missed', 'declined'] : ['invited', 'left', 'joined'];
            if (!again.includes(member.status)) throw Error('Ask the host to invite you again');
            member.status = 'joined';
            clearTimeout(m.rings?.get(id)); m.rings?.delete(id);
          } else if (action === 'decline') {
            if (member.status !== 'invited') throw Error('Invitation already processed');
            member.status = 'declined';
            clearTimeout(m.rings?.get(id)); m.rings?.delete(id);
            settle(m);
          } else if (action === 'leave') {
            if (member.status !== 'joined') throw Error('You are not in the meeting');
            member.status = 'left';
            revoke(m.room, s.id);
            if (m.huddle) settle(m);
            else if (m.host === id) {
              const successor = [...m.members.values()].find(x => x.status === 'joined');
              if (successor) m.host = successor.id; else end(m);
            }
          } else if (action === 'invite' && m.huddle) {
            if (member.status !== 'joined') throw Error('Join the huddle first');
            invite(m, data.invitees || []);
          } else if (action === 'invite' || action === 'end' || action === 'remove') {
            if (m.huddle) throw Error('A huddle ends by itself when everyone leaves');
            if (m.host !== id) throw Error('Only the host can perform this action');
            if (action === 'invite') invite(m, data.invitees || []);
            if (action === 'end') end(m);
            if (action === 'remove') {
              const target = m.members.get(data.target);
              if (!target || target.id === id) throw Error('Invalid member');
              target.status = 'removed';
              const person = online(target.id);
              if (person) {
                io.to(person.id).emit('notice', '主持人把你移出了会议');
                revoke(m.room, person.id);
              }
            }
          } else throw Error('Invalid meeting action');
        }
        sync(); ack({ ok: true, id: m.id });
      } catch (e) { ack({ ok: false, error: e.message }); }
    });
    s.on('meeting-sync', sync);
    s.on('disconnect', () => {

      const id = uid(people.get(s.id) || { id: s.id, clientId: s.data.account?.id });
      const timer = setTimeout(() => {
        if (online(id)) return;
        const m = activeFor(id);
        if (m) {
          m.members.get(id).status = 'left';
          if (m.huddle) settle(m);
          else if (m.host === id) {
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
