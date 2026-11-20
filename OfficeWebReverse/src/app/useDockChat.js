import { Pl as getDockChatSnapshot } from './attachments.js';
import { wl as buildChatThreads } from './files.js';
import { s as getFileTransferLabel } from '../chunks/chatLocal.js';
import { r as React, P as GROUP_THREAD_ID, u as readConversationPreferences, y as bindDockFileActions, b as updateConversationPreferences, i as isImageFile } from '../chunks/dockGreeting.js';
import { conversationOfMessage } from './chatConversation.js';
function getChatMembers(i, e) {
  const t = new Set([e]),
    n = [];
  for (const s of i) {
    const r = s.clientId || s.id;
    !r || t.has(r) || (t.add(r), n.push({
      id: r,
      name: s.name
    }));
  }
  return n;
}
function getChatDirectory(i, e) {
  const t = new Set([e]),
    n = [];
  for (const s of i) !(s != null && s.id) || t.has(s.id) || (t.add(s.id), n.push({
    id: s.id,
    name: s.name
  }));
  return n;
}
function getUnreadByPerson(i, e) {
  const t = {};
  for (const n of i) {
    if (n.id === GROUP_THREAD_ID || !n.unread) continue;
    const s = e.find(r => r.clientId === n.id);
    s && (t[s.id] = n.unread);
  }
  return t;
}
function useDockChat(options) {
  var C, M;
  const {
      messages: messages,
      contacts: contacts,
      hidden: hiddenContacts,
      people: people,
      seats: seats,
      accountId: accountId,
      visitor: visitor,
      files: files
    } = options,
    preferences = readConversationPreferences(accountId),
    visibleMessages = React.useMemo(() => messages.filter(g => {
      var T;
      return g.time > (((T = preferences[conversationOfMessage(g, accountId)]) == null ? void 0 : T.deletedThrough) ?? -1);
    }), [messages, preferences, accountId]),
    readKey = `office-chat-read:${accountId}`,
    [readMarkers, setReadMarkers] = React.useState(() => {
      try {
        const g = JSON.parse(localStorage.getItem(readKey) || "{}");
        return g && typeof g == "object" && !Array.isArray(g) ? g : {};
      } catch {
        return {};
      }
    }),
    [activeThread, setActiveThread] = React.useState(""),
    [error, setError] = React.useState(""),
    threads = React.useMemo(() => buildChatThreads({
      messages: visibleMessages,
      contacts: contacts,
      people: people,
      seats: seats,
      accountId: accountId,
      read: readMarkers,
      visitor: visitor,
      hidden: hiddenContacts
    }), [visibleMessages, contacts, people, seats, accountId, readMarkers, visitor, hiddenContacts]),
    latestMessageId = (M = (C = threads.find(g => g.id === activeThread)) == null ? void 0 : C.history.at(-1)) == null ? void 0 : M.id;
  React.useEffect(() => {
    !activeThread || !latestMessageId || (readMarkers[activeThread] || "") >= latestMessageId || setReadMarkers(g => {
      const T = {
        ...g,
        [activeThread]: latestMessageId
      };
      try {
        localStorage.setItem(readKey, JSON.stringify(T));
      } catch {}
      return T;
    });
  }, [activeThread, latestMessageId, readMarkers, readKey]);
  const fileState = g => {
      const T = files.lookup(g);
      return T ? getFileTransferLabel(T) : g.startsWith("direct-") ? "已送达 · 保存在接收设备" : "";
    },
    visibleThreads = threads.filter(g => {
      var T;
      return ((T = preferences[g.id]) == null ? void 0 : T.hiddenAt) == null || g.at > preferences[g.id].hiddenAt;
    }),
    chatSnapshot = getDockChatSnapshot(threads, activeThread, accountId, error, fileState);
  chatSnapshot.threads = chatSnapshot.threads.filter(g => visibleThreads.some(T => T.id === g.id)), chatSnapshot.members = visitor ? [] : getChatMembers(people, accountId), chatSnapshot.directory = visitor ? [] : getChatDirectory(contacts, accountId);
  const latest = React.useRef({
    threads: threads,
    send: options.send,
    sendFile: options.sendFile,
    loadFile: options.loadFile,
    files: files
  });
  return latest.current = {
    threads: threads,
    send: options.send,
    sendFile: options.sendFile,
    loadFile: options.loadFile,
    files: files
  }, React.useEffect(() => bindDockFileActions(accountId, async (g, T) => {
    var H, N;
    const A = latest.current,
      F = A.threads.find(Q => Q.id === g.conversation);
    if (!F) throw Error("这个会话不可用，请重新打开聊天");
    if (g.kind !== "upload") {
      const Q = "id" in g.file ? g.file.id : "",
        Z = (H = F.history.find(K => {
          var z;
          return ((z = K.attachment) == null ? void 0 : z.id) === Q;
        })) == null ? void 0 : H.attachment;
      if (!Z) throw Error("附件不在当前会话中");
      if (g.kind === "open" || g.kind === "reveal") {
        if (A.files.lookup(Z.id)) ((N = A.files.lookup(Z.id)) == null ? void 0 : N.status) === "failed" && !Z.id.startsWith("direct-") && (await A.files.downloadAttachment({
          ...Z,
          url: `/api/chat/files/${encodeURIComponent(Z.id)}`
        }));else {
          if (Z.id.startsWith("direct-")) throw Error("当前设备没有这份文件，请在接收文件的电脑上打开，或让对方重新发送");
          await A.files.downloadAttachment({
            ...Z,
            url: `/api/chat/files/${encodeURIComponent(Z.id)}`
          });
        }
        await A.files.fileAction(Z.id, g.kind);
        return;
      }
      const ue = () => Z.id.startsWith("direct-") ? A.files.localImage(Z.id) : A.loadFile(Z);
      if (g.kind === "view") {
        if (!isImageFile(Z.name)) throw Error("该附件不是可预览的图片");
        const K = await ue(),
          {
            openImageViewer: z
          } = await (async () => {
            const {
              openImageViewer: j
            } = await import("../chunks/ImageViewer.js");
            return {
              openImageViewer: j
            };
          })();
        z(K, Z.name);
        return;
      }
      return ue();
    }
    if (!(g.file instanceof File)) throw Error("没有可发送的文件");
    if (!(await A.sendFile(g.file, T, g.conversation === GROUP_THREAD_ID ? void 0 : g.conversation))) throw Error("附件未发送成功，文件仍保留，可以重试");
  }), [accountId]), {
    chat: chatSnapshot,
    command: g => {
      var H;
      if (!g.kind.startsWith("chat-")) return !1;
      const {
        threads: T,
        send: A,
        files: F
      } = latest.current;
      if (g.kind === "chat-open" && (g.personId && updateConversationPreferences(accountId, g.personId, {
        hiddenAt: void 0
      }), setActiveThread(T.some(N => N.id === g.personId) ? g.personId : ""), setError("")), g.kind === "chat-send") {
        const N = (g.text || "").trim();
        if (!N || !T.some(Q => Q.id === g.personId)) return !0;
        setError(""), A(N, g.personId === GROUP_THREAD_ID ? void 0 : g.personId).then(Q => {
          Q || setError("没发出去，再试一次");
        });
      }
      if (g.kind === "chat-file") {
        const N = (H = T.flatMap(Z => Z.history).find(Z => {
          var ue;
          return ((ue = Z.attachment) == null ? void 0 : ue.id) === g.personId;
        })) == null ? void 0 : H.attachment;
        if (!N) return !0;
        const Q = F.lookup(N.id);
        (Q == null ? void 0 : Q.status) === "done" ? F.fileAction(N.id, "open").catch(Z => setError(Z instanceof Error ? Z.message : "无法打开文件")) : N.id.startsWith("direct-") ? setError("当前设备没有这份文件，请在接收电脑上查看") : (Q == null ? void 0 : Q.status) !== "receiving" && F.downloadAttachment({
          id: N.id,
          name: N.name,
          size: N.size,
          url: `/api/chat/files/${encodeURIComponent(N.id)}`
        });
      }
      return !0;
    },
    unread: getUnreadByPerson(threads, people)
  };
}

export { useDockChat };
