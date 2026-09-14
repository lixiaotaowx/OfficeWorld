import { randomUUID } from "node:crypto";
import { recipientFor, publishChat } from './chat-access.mjs';
export function attachChat(io, socket, people, store, contacts = () =>
  [...people.values()].map(p => ({ id: p.clientId, name: p.name })), hidden = () => []) {
  socket.on('chat-contacts', reply => {
    if (typeof reply !== 'function') return;
    if (!people.has(socket.id)) return reply({ ok: false });
    // `hidden` lists accounts shown out of the space: they disappear from every
    // conversation list until they log in again (user, 2026-09-15).
    reply({ ok: true, contacts: contacts(), hidden: hidden() });
  });
  let windowStart = 0, count = 0;
  socket.on("chat-history", (after, reply) => {
    if (typeof reply !== "function") return;
    if (!people.has(socket.id)) return reply({ ok: false, error: "请先进入空间" });
    if (typeof after !== "string" || after.length > 100)
      return reply({ ok: false, error: "无效的消息游标" });
    try {
      const person = people.get(socket.id);
      reply(store.page(after, person.clientId, person.role === "visitor"));
    }
    catch { reply({ ok: false, error: "聊天存档暂不可用，请稍后重试" }); }
  });
  socket.on("chat", (payload, reply) => {
    const respond = result => {
      if (typeof reply === "function") reply(result);
      else if (!result.ok) socket.emit("notice", result.error);
    };
    const person = people.get(socket.id);
    const text = typeof payload === "string" ? payload : payload?.text;
    const requestId = typeof payload === "string" ? randomUUID() : payload?.requestId;
    if (!person || typeof text !== "string" || !text.trim() || text.length > 1000 ||
        typeof requestId !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(requestId))
      return respond({ ok: false, error: "消息无效或超过 1000 字" });
    if (Date.now() - windowStart > 10000) { windowStart = Date.now(); count = 0; }
    if (++count > 20) return respond({ ok: false, error: "发送过快，请稍后重试" });
    try {
      const recipient = recipientFor(payload?.recipientId, person, contacts());
      // A visiting client has no public channel; private messages are how they talk
      // to the office (user, 2026-09-15).
      if (!recipient && person.role === "visitor")
        return respond({ ok: false, error: "访客不能发公共聊天，请私聊同事" });
      const message = store.append(person, text.trim(), requestId, undefined, recipient);
      publishChat(io, people, message);
      respond({ ok: true, message });
    } catch {
      respond({ ok: false, error: "服务器未保存消息，请重试" });
    }
  });
}
