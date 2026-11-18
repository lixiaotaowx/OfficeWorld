
/** The round table is the office group chat: every member may read and post there; only
 *  visitors are kept to private conversations. */

export const canReadChat = (row, accountId, visitor = false) => !row.recipientId
  ? !visitor
  : row.senderId === accountId || row.recipientId === accountId;

export function recipientFor(value, person, contacts) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value === person.clientId) throw Error('Choose another member');
  const target = contacts.find(contact => contact.id === value);
  if (!target) throw Error('Member not found. Refresh the conversation list');
  return target;
}

export function publishChat(io, people, message) {
  if (!message.recipientId) {
    for (const [socketId, person] of people) {
      if (person.role !== 'visitor') io.to(socketId).emit('chat', message);
    }
    return;
  }
  for (const [socketId, person] of people) {
    if (canReadChat(message, person.clientId)) io.to(socketId).emit('chat', message);
  }
}
