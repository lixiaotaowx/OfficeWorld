export const canReadChat = (row, accountId) => !row.recipientId ||
  row.senderId === accountId || row.recipientId === accountId;

export function recipientFor(value, person, contacts) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value === person.clientId) throw Error('请选择其他同事');
  const target = contacts.find(contact => contact.id === value);
  if (!target) throw Error('这位同事不存在，请刷新会话列表');
  return target;
}

export function publishChat(io, people, message) {
  if (!message.recipientId) { io.emit('chat', message); return; }
  for (const [socketId, person] of people) {
    if (canReadChat(message, person.clientId)) io.to(socketId).emit('chat', message);
  }
}
