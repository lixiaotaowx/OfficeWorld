

import { randomUUID } from 'node:crypto';
export const MAX_FILE_BYTES = 2 * 1024 ** 3;

export const CHUNK_BYTES = 512 * 1024;

export const WINDOW = 4;

const MAX_PER_SENDER = 3;

const MAX_TOTAL = 24;

const ACK_MS = 60000;

const validId = value => typeof value === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(value);

function cleanName(value) {
  if (typeof value !== 'string') return '';
  const name = value.replace(/[\\/\u0000-\u001f\u007f]/g, '_').trim();
  return name.length > 0 && name.length <= 200 ? name : '';
}

const fail = message => ({ ok: false, error: message });

const firstAck = value => (Array.isArray(value) ? value[0] : value);

export function createFileRelay({ io, people, onDelivered }) {

  const transfers = new Map();
  const key = (socketId, transferId) => `${socketId}:${transferId}`;

  function countFor(socketId) {
    let total = 0;
    for (const transfer of transfers.values()) if (transfer.senderId === socketId) total += 1;
    return total;
  }

  function drop(socketId, transferId) {
    transfers.delete(key(socketId, transferId));
  }

  async function toTarget(transfer, event, payload) {
    try {

      return firstAck(await io.to(transfer.targetId).timeout(ACK_MS).emitWithAck(event, payload));
    } catch {
      return null;
    }
  }

  function tellOther(transfer, from, reason) {
    const to = from === 'sender' ? transfer.targetId : transfer.senderId;
    io.to(to).emit('file-in-cancel', { transferId: transfer.transferId, reason });
  }

  function forget(socketId) {

    for (const transfer of [...transfers.values()]) {
      if (transfer.senderId !== socketId && transfer.targetId !== socketId) continue;
      tellOther(transfer, transfer.senderId === socketId ? 'sender' : 'target',
        transfer.senderId === socketId ? 'The other member is offline' : 'The other member is offline');
      drop(transfer.senderId, transfer.transferId);
    }
  }

  function attach(socket) {
    socket.on('file-offer', async (data, reply) => {
      if (typeof reply !== 'function') return;
      try {
        const sender = people.get(socket.id);
        if (!sender) return reply(fail('Join the space first'));
        const transferId = String(data?.transferId || '');
        if (!validId(transferId)) return reply(fail('Invalid transfer'));
        const target = people.get(String(data?.targetId || ''));
        if (!target) return reply(fail('Recipient is offline. File was not sent'));
        if (target.clientId === sender.clientId) return reply(fail('You cannot send files to yourself'));
        const name = cleanName(data?.name);
        if (!name) return reply(fail('Invalid file name'));
        const size = Number(data?.size);
        if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES)
          return reply(fail('File must be 1 byte to 2 GB'));
        if (transfers.has(key(socket.id, transferId))) return reply(fail('Duplicate transfer'));
        if (countFor(socket.id) >= MAX_PER_SENDER) return reply(fail('Too many outgoing files. Please try again'));
        if (transfers.size >= MAX_TOTAL) return reply(fail('Too many active transfers. Please try again'));

        const attachmentId = onDelivered ? `direct-${randomUUID()}` : '';
        let answer;
        try {

          answer = firstAck(await io.to(target.id).timeout(ACK_MS).emitWithAck('file-in', {
            transferId, name, size,
            fromId: socket.id, fromName: sender.name, fromCharacter: sender.character || '',
            ...(attachmentId ? { attachmentId } : {}),
          }));
        } catch { return reply(fail('Recipient did not respond. File was not sent')); }
        if (!answer?.ok) {

          console.warn('[file-relay] file-in rejected: %s', JSON.stringify({
            target: target.name || '', to: target.id,
            kind: typeof answer, isArray: Array.isArray(answer),
            keys: answer && typeof answer === 'object' ? Object.keys(answer) : null,
            error: answer?.error ?? null,
          }));
          return reply(fail(answer?.error || 'Recipient cannot receive the file'));
        }
        transfers.set(key(socket.id, transferId), {
          transferId, senderId: socket.id, targetId: target.id, name, size,
          attachmentId, sender: { clientId: sender.clientId, name: sender.name }, recipient: { id: target.clientId, name: target.name },

          expect: 0, sent: 0, inflight: 0,
        });
        return reply({ ok: true, ...(attachmentId ? { attachmentId } : {}) });
      } catch (error) { return reply(fail(error?.message || 'File transfer failed')); }
    });

    socket.on('file-chunk', async (data, reply) => {
      if (typeof reply !== 'function') return;
      const transfer = transfers.get(key(socket.id, String(data?.transferId || '')));
      if (!transfer) return reply(fail('Transfer expired. Drag the file again'));
      try {
        const bytes = data?.bytes;
        const length = bytes?.length ?? bytes?.byteLength ?? 0;
        if (!length || length > CHUNK_BYTES) return reply(fail('Invalid file chunk'));
        if (transfer.inflight >= WINDOW) return reply(fail('Sending too quickly'));
        if (data?.offset !== transfer.expect) return reply(fail('File chunks are out of order'));
        if (transfer.expect + length > transfer.size) return reply(fail('File chunk exceeds declared size'));
        transfer.expect += length;
        transfer.inflight += 1;
        const answer = await toTarget(transfer, 'file-in-part',
          { transferId: transfer.transferId, offset: data.offset, bytes });
        transfer.inflight -= 1;
        if (!answer?.ok) {
          drop(transfer.senderId, transfer.transferId);
          tellOther(transfer, 'sender', answer?.error || 'Recipient interrupted the transfer');
          return reply(fail(answer?.error || 'Recipient interrupted the transfer'));
        }
        transfer.sent += length;
        return reply({ ok: true, sent: transfer.sent });
      } catch (error) {
        drop(transfer.senderId, transfer.transferId);
        tellOther(transfer, 'sender', error?.message || 'Transfer error');
        return reply(fail(error?.message || 'File transfer failed'));
      }
    });

    socket.on('file-end', async (data, reply) => {
      if (typeof reply !== 'function') return;
      const transfer = transfers.get(key(socket.id, String(data?.transferId || '')));
      if (!transfer) return reply(fail('Transfer expired. Drag the file again'));
      drop(transfer.senderId, transfer.transferId);
      if (transfer.sent !== transfer.size) return reply(fail('File is incomplete. Please send it again'));
      const answer = await toTarget(transfer, 'file-in-end', { transferId: transfer.transferId });
      if (!answer?.ok) return reply(fail(answer?.error || 'Recipient could not save the file'));
      try { await onDelivered?.(transfer); }
      catch { return reply({ ok: true, warning: '文件已送达，但聊天记录未能保存，请告知对方查看收件文件夹', path: answer.path || '', savedName: answer.savedName || '' }); }
      return reply({ ok: true, path: answer.path || '', savedName: answer.savedName || '' });
    });

    socket.on('file-cancel', (data, reply) => {
      const transferId = String(data?.transferId || '');
      const transfer = transfers.get(key(socket.id, transferId)) ||
        [...transfers.values()].find(row => row.transferId === transferId &&
          (row.senderId === socket.id || row.targetId === socket.id));
      if (!transfer) { if (typeof reply === 'function') reply({ ok: true }); return; }
      drop(transfer.senderId, transfer.transferId);
      tellOther(transfer, transfer.senderId === socket.id ? 'sender' : 'target',
        String(data?.reason || 'Sender cancelled the transfer'));
      if (typeof reply === 'function') reply({ ok: true });
    });

    socket.on('disconnect', () => forget(socket.id));
  }

  return { attach, forget, size: () => transfers.size };
}
