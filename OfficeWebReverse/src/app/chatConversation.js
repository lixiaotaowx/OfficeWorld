import { P as GROUP_THREAD_ID } from '../chunks/dockGreeting.js';

export function conversationOfMessage(message, accountId) {
  if (!message.recipientId) return GROUP_THREAD_ID;
  return message.senderId === accountId ? message.recipientId : message.senderId || '';
}
