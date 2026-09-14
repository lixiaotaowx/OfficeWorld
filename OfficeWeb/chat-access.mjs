/** Who may read a stored message.
 *
 * A public row (no recipient) belongs to the office's shared channel, which a
 * visiting client does not take part in (user, 2026-09-15); private threads stay
 * available to them. The visitor flag is passed in rather than looked up so the
 * same rule can be applied from a socket, a history page or a file download.
 */
export const canReadChat = (row, accountId, visitor = false) => !row.recipientId
  ? !visitor
  : row.senderId === accountId || row.recipientId === accountId;

export function recipientFor(value, person, contacts) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value === person.clientId) throw Error('请选择其他同事');
  const target = contacts.find(contact => contact.id === value);
  if (!target) throw Error('这位同事不存在，请刷新会话列表');
  return target;
}

export function publishChat(io, people, message) {
  if (!message.recipientId) {
    // The public channel reaches members only.
    for (const [socketId, person] of people) {
      if (person.role !== 'visitor') io.to(socketId).emit('chat', message);
    }
    return;
  }
  for (const [socketId, person] of people) {
    if (canReadChat(message, person.clientId)) io.to(socketId).emit('chat', message);
  }
}
