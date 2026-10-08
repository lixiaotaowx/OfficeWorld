import { randomUUID } from 'node:crypto';

/** Every accepted pair owns one room, independent of other viewers of a screen. */
export function createPrivateSessions(io, people, sessions, invites, end, updatePermissions = async () => {},
  { ringMs = 30000, publish = () => {} } = {}) {
  let tail = Promise.resolve();
  const emitSession = session => {
    for (const peer of session.peers) io.to(peer).emit('session', {
      ...session, peer: session.peers.find(id => id !== peer), initiator: peer === session.peers[0],
    });
    // 通话的成立/改变要广播一次 `people`：头像条靠它知道谁在通话里（用户 2026-09-23）。
    publish();
  };
  /**
   * Stop an invite. `reason` tells the two sides apart without guessing: `timeout` is a
   * call nobody answered (a missed call), `cancelled` is the caller giving up and
   * `answered` is a session being created (user, 2026-09-15).
   */
  const expire = (invite, reason = 'cancelled') => {
    invites.delete(invite.id);
    for (const id of [invite.from, invite.target]) io.to(id).emit('request-expired', { id: invite.id, reason });
  };
  function attach(socket) {
    socket.on('request', data => {
      if (!people.has(socket.id) || !people.has(data?.target) || socket.id === data.target ||
          !['screen', 'voice'].includes(data.kind)) return;
      if ([...invites.values()].some(i => i.from === socket.id && i.target === data.target && i.kind === data.kind)) return;
      const invite = { id: randomUUID(), from: socket.id, target: data.target,
        kind: data.kind, offer: data.kind === 'screen' && data.offer === true,
        name: people.get(socket.id).name };
      invites.set(invite.id, invite);
      socket.emit('request-sent', invite); io.to(invite.target).emit('request', invite);
      socket.emit('notice', '请求已发送，等待对方同意（屏幕邀请包含双向语音）');
      // Nobody answered within the ring: the caller is told to try again and the callee
      // is told it was a missed call (user, 2026-09-15: "拨打时间30秒没人接就提示未接通，
      // 稍后重试").
      setTimeout(() => {
        if (!invites.has(invite.id)) return;
        expire(invite, 'timeout');
        socket.emit('notice', '未接通，稍后重试');
      }, ringMs).unref();
    });
    socket.on('respond', (data, reply) => {
      const answer = value => { if (typeof reply === 'function') reply(value); };
      const invite = invites.get(data?.id);
      if (!invite || invite.target !== socket.id) return answer({ ok: false, error: "邀请已取消或过期" });
      expire(invite, 'answered');
      if (data.accept !== true) { io.to(invite.from).emit('notice', '对方婉拒了请求'); answer({ ok: true, accepted: false }); return; }
      tail = tail.catch(() => {}).then(async () => {
        if (!people.has(invite.from) || !people.has(invite.target)) return answer({ ok: false, error: "对方已离线" });
        const existing = [...sessions.values()].find(c => c.peers.length === 2 &&
          c.peers.includes(invite.from) && c.peers.includes(invite.target));
        const owner = invite.offer ? invite.from : invite.target;
        if (invite.kind === "screen" && !people.get(owner)?.sharing) {
          for (const id of [invite.from, invite.target]) io.to(id).emit("notice", "屏幕采集已取消，请重新邀请");
          return answer({ ok: false, error: "屏幕采集已取消" });
        }
        const screens = new Set(invite.kind === 'screen' ? [owner] : existing?.screenOwners || []);
        const session = { id: existing?.id || invite.id, peers: [invite.target, invite.from],
          kind: screens.size ? 'screen' : 'voice', owner,
          screenOwners: [...screens], room: existing?.room || `call-${invite.id}` };
        // Grant upgrades before telling the connected client to publish a screen.
        try { if (existing) await updatePermissions(session); }
        catch { io.to(invite.from).emit('notice', '共享权限更新失败，请重新邀请'); return answer({ ok: false, error: '共享权限更新失败' }); }
        if (!people.has(invite.from) || !people.has(invite.target) || (existing && !sessions.has(existing.id))) return answer({ ok: false, error: "通话已结束" });
        sessions.set(session.id, session); emitSession(session);
        answer({ ok: true, accepted: true });
      });
    });
    socket.on('end', id => { if (sessions.get(id)?.peers.includes(socket.id)) end(id); });
    socket.on('cancel-request', id => {
      const invite = invites.get(id);
      if (invite?.from === socket.id) expire(invite);
    });
  }
  // Stopping capture is not hanging up: keep the same room and voice permission.
  function screenStopped(owner) {
    tail = tail.catch(() => {}).then(async () => {
      for (const session of sessions.values()) {
        if (!session.screenOwners?.includes(owner)) continue;
        const next = { ...session, screenOwners: session.screenOwners.filter(id => id !== owner) };
        next.kind = next.screenOwners.length ? 'screen' : 'voice';
        try { await updatePermissions(next); }
        catch {
          // Fail closed if the SFU cannot revoke a former screen permission.
          for (const peer of session.peers) io.to(peer).emit('notice', '屏幕权限撤销失败，已结束通话');
          end(session.id); continue;
        }
        if (sessions.has(session.id)) { sessions.set(session.id, next); emitSession(next); }
      }
    });
  }
  function claim(socket, id) {
    const operation = tail.catch(() => {}).then(async () => {
      const current = sessions.get(id);
      if (!current?.peers.includes(socket.id) || !people.get(socket.id)?.sharing)
        throw Error('通话已结束或屏幕未选择');
      const next = { ...current, kind: 'screen', owner: socket.id, screenOwners: [socket.id] };
      await updatePermissions(next);
      if (sessions.get(id) !== current || !people.get(socket.id)?.sharing) throw Error('共享已取消');
      sessions.set(id, next); emitSession(next);
      return next;
    });
    tail = operation.catch(() => {});
    return operation;
  }
  return { attach, screenStopped, claim };
}
