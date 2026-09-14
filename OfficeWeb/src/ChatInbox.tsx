import { useEffect, useMemo, useState } from 'react';
import ChatPanel, { type ChatFileActions } from './ChatPanel';
import type { ChatContact, Message, Person } from './types';
import './chat-inbox.css';

interface Props extends ChatFileActions {
  contacts: ChatContact[];
  people: Person[];
  accountId: string;
  messages: Message[];
  connected: boolean;
  visible: boolean;
  /** A visiting client has no public channel, only private threads (user, 2026-09-15). */
  visitor: boolean;
  /** Accounts shown out of the space: their threads are not offered at all. */
  hidden: string[];
  onMessage: (text: string, recipientId?: string) => Promise<boolean>;
  onUnread: (count: number) => void;
}
export const conversationKey = (message: Message, accountId: string) =>
  !message.recipientId ? 'public' : message.senderId === accountId ? message.recipientId : message.senderId || '';

export default function ChatInbox(props: Props) {
  const { accountId, messages, contacts, people, visible, visitor, hidden } = props;
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [read, setRead] = useState<Record<string, string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`office-chat-read:${accountId}`) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    }
    catch { return {}; }
  });
  const threads = useMemo(() => {
    // Only people who are here now, plus colleagues this device really has a
    // conversation with. The account roster lists everybody who ever registered,
    // which used to fill the list with names from months ago (user, 2026-09-15).
    const directory = new Map<string, string>();
    for (const person of people) if (person.clientId !== accountId) directory.set(person.clientId, person.name);
    for (const m of messages) {
      const key = conversationKey(m, accountId);
      if (key === 'public' || directory.has(key)) continue;
      const known = contacts.find(c => c.id === key);
      directory.set(key, known?.name || (m.senderId === accountId ? m.recipientName || '同事' : m.name));
    }
    const rows = (visitor ? [...directory].map(([id, name]) => ({ id, name }))
      : [{ id: 'public', name: '公共聊天' }, ...[...directory].map(([id, name]) => ({ id, name }))])
      // Somebody shown out of the space is not offered, even though their older
      // messages are still in this device's archive.
      .filter(row => !hidden.includes(row.id));
    return rows.map(row => {
      const history = messages.filter(m => conversationKey(m, accountId) === row.id);
      return { ...row, history, last: history.at(-1),
        online: people.some(p => p.clientId === row.id),
        unread: history.filter(m => m.senderId !== accountId && m.id > (read[row.id] || '')).length };
    }).sort((a, b) => a.id === 'public' ? -1 : b.id === 'public' ? 1 :
      (b.last?.time || 0) - (a.last?.time || 0) || a.name.localeCompare(b.name, 'zh-CN'));
  }, [contacts, people, messages, accountId, read, visitor, hidden]);
  const current = threads.find(t => t.id === active);
  const last = current?.last?.id;
  useEffect(() => {
    if (!visible || !active || !last || (read[active] || '') >= last) return;
    setRead(previous => {
      const next = { ...previous, [active]: last };
      try { localStorage.setItem(`office-chat-read:${accountId}`, JSON.stringify(next)); } catch { /* storage may be disabled */ }
      return next;
    });
  }, [visible, active, last, accountId, read]);
  const unread = threads.reduce((sum, t) => sum + t.unread, 0);
  useEffect(() => props.onUnread(unread), [unread, props.onUnread]);
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!active || sending || !props.connected) return;
    const key = active, draft = drafts[key] || '';
    if (!draft.trim()) return;
    setSending(true);
    try {
      if (await props.onMessage(draft, key === 'public' ? undefined : key)) {
        setDrafts(old => old[key] === draft ? { ...old, [key]: '' } : old);
      }
    } finally { setSending(false); }
  }
  return <section className="chat-inbox" hidden={!visible} aria-label="聊天会话">
    {current ? <>
      <div className="conversation-heading">
        <button type="button" onClick={() => setActive(null)} aria-label="返回会话列表">‹ 返回</button>
        <div><h3>{current.name}</h3><small>{active === 'public' ? '公共空间 · 所有人可见' :
          `私聊 · 仅你们两人可见 · ${current.online ? '在线' : '离线，可留言'}`}</small></div>
      </div>
      <ChatPanel key={active} accountId={accountId} messages={current.history} privateChat={active !== 'public'}
        connected={props.connected && !sending} text={drafts[active!] || ''}
        onText={text => setDrafts(old => ({ ...old, [active!]: text }))} onSend={send}
        onFile={(file, progress) => props.onFile(file, progress, active === 'public' ? undefined : active!)}
        loadFile={props.loadFile} />
    </> : <>
      <div className="conversation-list-heading"><h3>会话</h3><small>{visitor
        ? '和同事单独聊聊' : '公共交流，也能单独聊聊'}</small></div>
      <input className="conversation-search" aria-label="搜索聊天会话" placeholder="搜索同事或会话" value={search}
        onChange={event => setSearch(event.target.value)} />
      <div className="conversation-list">
        {threads.filter(t => t.name.includes(search.trim())).map(thread => <button type="button"
          className="conversation-row" key={thread.id} onClick={() => setActive(thread.id)}
          aria-label={`打开${thread.name}${thread.id === 'public' ? '' : '的私聊'}${thread.unread ? `，${thread.unread}条未读` : ''}`}>
          <span className={'conversation-avatar' + (thread.id === 'public' ? ' public' : '')}>
            {thread.id === 'public' ? '公' : thread.name.slice(0, 1)}
            {thread.online && <i aria-label="在线" />}</span>
          <span className="conversation-copy"><strong>{thread.name}</strong><small>
            {thread.last ? `${thread.id === 'public' ? thread.last.name + '：' : ''}${thread.last.text || '[文件] ' + thread.last.attachment?.name}` :
              thread.id === 'public' ? '所有人的公共聊天' : '点击开始私聊'}</small></span>
          <span className="conversation-meta"><time>{thread.last && new Date(thread.last.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</time>
            {thread.unread > 0 && <b>{thread.unread > 99 ? '99+' : thread.unread}</b>}</span>
        </button>)}
        {!threads.some(t => t.name.includes(search.trim())) && <p className="conversation-empty">没有找到这位同事</p>}
      </div>
    </>}
  </section>;
}
