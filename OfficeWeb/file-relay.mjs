// 文件直传：把文件拖到任务栏头像条的某个人头上就开始发，**不需要对方同意**，
// 直接落进接收方自己设置好的接收文件夹（用户 2026-09-22 要求）。
//
// 服务器在这里只做**实时转发，不落盘**：发送方按分片读自己的文件发过来，这里校验之后
// 原样转给接收方那一端，接收方写盘成功再回执。所以 VPS 上不会攒文件、不会撑爆磁盘，
// 也不需要清理策略；代价是两端必须同时在线——而那时候头像条上本来就有这个人。
//
// 可靠性靠**端到端 ack**：每一片都要接收方确认才算送达，发送方的窗口（`WINDOW`）保证
// 同时最多只有几片在路上，接收方写得慢就自然把发送方拖慢（这就是背压）。

/** 单个文件上限：2 GB（用户 2026-09-21 要求，原为 4 GB）。
 *  **必须和 `OfficeDesktop/file-transfer.cjs` 的 `MAX_BYTES` 一致**，服务端这份是硬门。 */
export const MAX_FILE_BYTES = 2 * 1024 ** 3;
/** 一片最大多大（客户端发 256 KB，留一倍余量）。 */
export const CHUNK_BYTES = 512 * 1024;
/** 同时在路上的分片数：太少会被 RTT 拖死，太多就是往对方机器上灌。 */
export const WINDOW = 4;
/** 一个发送方同时能发几个文件。 */
const MAX_PER_SENDER = 3;
/** 整个服务器同时有多少个传输（有上限才不会被人拿来当跳板）。 */
const MAX_TOTAL = 24;
/** 等对端回执多久算超时。 */
const ACK_MS = 60000;

const validId = value => typeof value === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(value);

/** 文件名只在这里做基础清洗；真正决定能不能落盘的是接收端（它还会防路径穿越）。 */
function cleanName(value) {
  if (typeof value !== 'string') return '';
  const name = value.replace(/[\\/\u0000-\u001f\u007f]/g, '_').trim();
  return name.length > 0 && name.length <= 200 ? name : '';
}

// 头像条上拖一下就该有反应，脏数据没有意义，全部丢回一句人话。
const fail = message => ({ ok: false, error: message });

/**
 * **广播操作符上的 `emitWithAck` 永远回一个数组**，不是单个对象。
 *
 * `io.to(room).timeout(ms).emitWithAck(ev, payload)` —— 即使这个 room 里只有一个 socket，
 * 它解析出来也是 `[{ ok: true }]` 这种**数组**（每个客户端一个 ack；只有 `socket.emitWithAck`
 * 才是单个 ack）。我们只发给一个人，所以取第一个。
 *
 * 这个坑让"把文件拖到头像上发不出去"卡了很久（2026-09-21 真机排出来的）：`answer?.ok` 在数组上
 * 是 `undefined`，于是 `file-offer` 与每一片 `file-chunk` 都被判成"对方无法接收文件"，
 * 而对方其实每次都回了 `{ ok: true }`——传输根本没开始。服务端日志里 `isArray: true` 就是它。
 */
const firstAck = value => (Array.isArray(value) ? value[0] : value);

export function createFileRelay({ io, people }) {
  /** key = `${发送方 socket id}:${transferId}`，所以两端的 id 不会互相撞。 */
  const transfers = new Map();
  const key = (socketId, transferId) => `${socketId}:${transferId}`;

  function countFor(socketId) {
    let total = 0;
    for (const transfer of transfers.values()) if (transfer.senderId === socketId) total += 1;
    return total;
  }

  /** 一个传输结束了（成功、失败、取消都一样）：从表里删掉，不让它泄漏。 */
  function drop(socketId, transferId) {
    transfers.delete(key(socketId, transferId));
  }

  /** 转发一片给接收方，返回接收方的回执；对方不在/没响应就是失败。 */
  async function toTarget(transfer, event, payload) {
    try {
      // 广播操作符回的是数组，取第一个（见 firstAck）。
      return firstAck(await io.to(transfer.targetId).timeout(ACK_MS).emitWithAck(event, payload));
    } catch {
      return null;
    }
  }

  /** 把"这一趟没了"告诉另一端（对方已经走开、或者自己取消）。 */
  function tellOther(transfer, from, reason) {
    const to = from === 'sender' ? transfer.targetId : transfer.senderId;
    io.to(to).emit('file-in-cancel', { transferId: transfer.transferId, reason });
  }

  function forget(socketId) {
    // 断线就是这一趟结束：留着的话表会越来越大，对端也会一直等。
    for (const transfer of [...transfers.values()]) {
      if (transfer.senderId !== socketId && transfer.targetId !== socketId) continue;
      tellOther(transfer, transfer.senderId === socketId ? 'sender' : 'target',
        transfer.senderId === socketId ? '对方已离线' : '对方已离线');
      drop(transfer.senderId, transfer.transferId);
    }
  }

  function attach(socket) {
    socket.on('file-offer', async (data, reply) => {
      if (typeof reply !== 'function') return;
      try {
        const sender = people.get(socket.id);
        if (!sender) return reply(fail('请先进入空间'));
        const transferId = String(data?.transferId || '');
        if (!validId(transferId)) return reply(fail('无效的传输'));
        const target = people.get(String(data?.targetId || ''));
        if (!target) return reply(fail('对方不在线，文件没有发出去'));
        if (target.clientId === sender.clientId) return reply(fail('不能给自己发文件'));
        const name = cleanName(data?.name);
        if (!name) return reply(fail('文件名无效'));
        const size = Number(data?.size);
        if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES)
          return reply(fail('文件需为 1 字节至 2 GB'));
        if (transfers.has(key(socket.id, transferId))) return reply(fail('重复的传输'));
        if (countFor(socket.id) >= MAX_PER_SENDER) return reply(fail('同时发送的文件太多，请稍后重试'));
        if (transfers.size >= MAX_TOTAL) return reply(fail('同时传输的文件太多，请稍后重试'));
        // 先问接收方收不收（不是征求同意，是确认它那端真的接得住：能开文件、有地方放）。
        let answer;
        try {
          // **广播操作符回的是数组**（见 firstAck）——这里原来直接当对象用，于是每一趟都
          // 被判成"对方无法接收文件"。
          answer = firstAck(await io.to(target.id).timeout(ACK_MS).emitWithAck('file-in', {
            transferId, name, size,
            fromId: socket.id, fromName: sender.name, fromCharacter: sender.character || '',
          }));
        } catch { return reply(fail('对方没有响应，文件未发送')); }
        if (!answer?.ok) {
          // **把对方到底回了什么写进服务日志**（用户 2026-09-21 报"拖上去发不出去"，真机复现出的
          // 就是这句 `对方无法接收文件`，而它意味着"ack 里既没有 ok 也没有 error"——光看客户端
          // 根本查不出来对方那端是什么版本、回了什么形状）。排障时先看 journalctl 这一行。
          console.warn('[file-relay] file-in 被拒绝：%s', JSON.stringify({
            target: target.name || '', to: target.id,
            kind: typeof answer, isArray: Array.isArray(answer),
            keys: answer && typeof answer === 'object' ? Object.keys(answer) : null,
            error: answer?.error ?? null,
          }));
          return reply(fail(answer?.error || '对方无法接收文件'));
        }
        transfers.set(key(socket.id, transferId), {
          transferId, senderId: socket.id, targetId: target.id, name, size,
          // `expect` 是下一片应该在的偏移，`sent` 是真正被接收方确认过的字节数。
          expect: 0, sent: 0, inflight: 0,
        });
        return reply({ ok: true });
      } catch (error) { return reply(fail(error?.message || '文件发送失败')); }
    });

    socket.on('file-chunk', async (data, reply) => {
      if (typeof reply !== 'function') return;
      const transfer = transfers.get(key(socket.id, String(data?.transferId || '')));
      if (!transfer) return reply(fail('传输已失效，请重新拖一次'));
      try {
        const bytes = data?.bytes;
        const length = bytes?.length ?? bytes?.byteLength ?? 0;
        if (!length || length > CHUNK_BYTES) return reply(fail('无效的文件分片'));
        if (transfer.inflight >= WINDOW) return reply(fail('发送过快'));
        if (data?.offset !== transfer.expect) return reply(fail('文件分片顺序错误'));
        if (transfer.expect + length > transfer.size) return reply(fail('文件分片超出大小'));
        transfer.expect += length;
        transfer.inflight += 1;
        const answer = await toTarget(transfer, 'file-in-part',
          { transferId: transfer.transferId, offset: data.offset, bytes });
        transfer.inflight -= 1;
        if (!answer?.ok) {
          drop(transfer.senderId, transfer.transferId);
          tellOther(transfer, 'sender', answer?.error || '接收方中断了传输');
          return reply(fail(answer?.error || '接收方中断了传输'));
        }
        transfer.sent += length;
        return reply({ ok: true, sent: transfer.sent });
      } catch (error) {
        drop(transfer.senderId, transfer.transferId);
        tellOther(transfer, 'sender', error?.message || '传输出错');
        return reply(fail(error?.message || '文件发送失败'));
      }
    });

    socket.on('file-end', async (data, reply) => {
      if (typeof reply !== 'function') return;
      const transfer = transfers.get(key(socket.id, String(data?.transferId || '')));
      if (!transfer) return reply(fail('传输已失效，请重新拖一次'));
      drop(transfer.senderId, transfer.transferId);
      if (transfer.sent !== transfer.size) return reply(fail('文件没有传完，请重新发送'));
      const answer = await toTarget(transfer, 'file-in-end', { transferId: transfer.transferId });
      if (!answer?.ok) return reply(fail(answer?.error || '接收方保存文件失败'));
      return reply({ ok: true, path: answer.path || '', savedName: answer.savedName || '' });
    });

    // 取消：发送方和接收方用同一个事件，服务器按 transferId 认出自己在哪一端。
    socket.on('file-cancel', (data, reply) => {
      const transferId = String(data?.transferId || '');
      const transfer = transfers.get(key(socket.id, transferId)) ||
        [...transfers.values()].find(row => row.transferId === transferId &&
          (row.senderId === socket.id || row.targetId === socket.id));
      if (!transfer) { if (typeof reply === 'function') reply({ ok: true }); return; }
      drop(transfer.senderId, transfer.transferId);
      tellOther(transfer, transfer.senderId === socket.id ? 'sender' : 'target',
        String(data?.reason || '对方取消了发送'));
      if (typeof reply === 'function') reply({ ok: true });
    });

    socket.on('disconnect', () => forget(socket.id));
  }

  return { attach, forget, size: () => transfers.size };
}
