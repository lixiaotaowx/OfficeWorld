// The right-hand sidebar: member seats, the selected desk's detail, and chat.
//
// Extracted from App.tsx, which was approaching the project's 500 line ceiling.
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { ChatFileActions } from "./ChatPanel";
import ChatInbox from "./ChatInbox";
import { WORKSTATIONS } from "./seats";
import { awayLabel, awayMilliseconds, isAtDesk } from "./awayTime";
import type { Message, Person, SeatOwner, ChatContact } from "./types";

interface Props extends ChatFileActions {
  people: Person[];
  /** Permanent ownership per seat, including owners who are offline. */
  seats: (SeatOwner | null)[];
  messages: Message[];
  previews: Record<string, string>;
  myId: string;
  accountId: string;
  mySeat: number | null;
  /** Visitors have no public chat channel, only private threads. */
  visitor: boolean;
  selected: number;
  tab: "people" | "chat";
  panelOpen: boolean;
  connected: boolean;
  contacts: ChatContact[];
  /** Accounts shown out of the space: their conversations stay hidden. */
  hiddenContacts: string[];
  onMessage: (text: string, recipientId?: string) => Promise<boolean>;
  onTab: (tab: "people" | "chat") => void;
  onSelect: (seat: number) => void;
  onOpenDesks: () => void;
  /** Point the camera at a person — visitors hold no desk to focus instead. */
  onFocusPerson: (id: string) => void;
  /** Whoever the camera was last pointed at, so the row can stay highlighted. */
  focusedPerson: string | null;
  onRequest: (target: string, kind: "screen" | "voice", offer?: boolean) => void;
  /** 右键自己的那一行：和右键画面里的显示器一样，切换共享/预览用的屏幕。 */
  onOpenScreenMenu?: (point: { x: number; y: number }) => void;
  /** 未读总数与按人分开的未读数：头像条要在每个人的头像上点红点。 */
  onUnread?: (count: number, byPerson: Record<string, number>) => void;
}

export default function SidePanel({
  people,
  seats,
  messages,
  previews,
  myId,
  accountId,
  mySeat,
  visitor,
  selected,
  tab,
  panelOpen,
  connected,
  contacts,
  hiddenContacts,
  onMessage,
  onTab,
  onSelect,
  onOpenDesks,
  onFocusPerson,
  focusedPerson,
  onRequest,
  onFile,
  loadFile,
  files,
  onOpenScreenMenu,
  onUnread,
}: Props) {
  const [unread, setUnread] = useState(0);
  // The server only sends `awayFor` (how long somebody had already been away)
  // when the `people` payload is pushed, so remember when that payload arrived
  // and add the time since. A one-second clock only runs while somebody is away.
  const pushedAt = useRef(Date.now());
  const [clock, setClock] = useState(() => Date.now());
  const anyoneAway = people.some((person) => !isAtDesk(person));
  useEffect(() => {
    pushedAt.current = Date.now();
  }, [people]);
  useEffect(() => {
    if (!anyoneAway) return;
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyoneAway]);
  /** "离座 6 分钟" / "离座 3.5 小时" for somebody who is not at their machine. */
  const awayText = (person: Person) =>
    awayLabel(awayMilliseconds(person, pushedAt.current, clock));
  // 只有客户端才有这块菜单（浏览器没有可切换的物理屏幕）。
  const ownScreenMenu = (event: MouseEvent) => {
    if (!window.officeDesktop || !onOpenScreenMenu) return;
    event.preventDefault();
    onOpenScreenMenu({ x: event.clientX, y: event.clientY });
  };
  // Guests of the office: they sit in the public area instead of at a desk, so
  // they would otherwise be missing from the directory altogether.
  const visitors = people.filter((person) => person.role === "visitor");
  // The desk's permanent owner (may be offline), and its online person if any.
  const onlinePerson = people.find((p) => p.seat === selected);
  const owner = seats[selected] || (onlinePerson && { id: onlinePerson.clientId, name: onlinePerson.name, online: true });
  // A visitor holds no desk, so the card has to follow the person the directory
  // focused - otherwise there is no way to call them at all (user, 2026-09-15).
  const focused = focusedPerson ? people.find((person) => person.id === focusedPerson) : undefined;
  const target = focused || onlinePerson;
  const callable = target && target.id !== myId ? target : undefined;
  return (
    <aside id="office-side-panel" className="sidebar" hidden={!panelOpen}>
      <div className="directory-heading">
        <div><span className="eyebrow">IN GOOD COMPANY</span><h2>人与空间</h2></div>
        <div className="directory-count"><strong>{String(people.length).padStart(2, "0")}</strong><small>当前在线</small></div>
      </div>
      <div className="side-tabs">
        <button
          className={tab === "people" ? "selected" : ""}
          aria-pressed={tab === "people"}
          onClick={() => onTab("people")}
        >
          空间成员 <span>{people.length}</span>
        </button>
        <button
          className={tab === "chat" ? "selected" : ""}
          aria-pressed={tab === "chat"}
          onClick={() => onTab("chat")}
        >
          聊天 {unread > 0 && <b className="chat-unread">{unread > 99 ? "99+" : unread}</b>}
        </button>
      </div>
      {tab === "people" ? (
        <>
          <div className="side-title">
            <h3>全部工位</h3>
            <span>{WORKSTATIONS.filter(w => !seats[w.index] && !people.some(p => p.seat === w.index)).length} 个空闲</span>
          </div>
          <div className="seat-grid">
            {WORKSTATIONS.map((workstation) => {
              const i = workstation.index;
              const mine = mySeat === i;
              const online = people.find((x) => x.seat === i);
              const occupant = seats[i] || (online && { id: online.clientId, name: online.name, online: true });
              const isOnline = !!online || occupant?.online === true;
              // 在座 / 离桌: only a client that is here can be away from its desk.
              const away = !!online && !isAtDesk(online);
              return (
                <button
                  key={i}
                  aria-pressed={i === selected}
                  className={
                    "seat " + (isOnline ? "is-online " : occupant ? "is-offline " : "") +
                    (workstation.id === "Manager" ? "manager-seat " : "") +
                    (i === selected ? "chosen" : "") +
                    (mine ? " mine" : "")
                  }
                  onClick={() => {
                    onSelect(i);
                    onOpenDesks();
                  }}
                  onContextMenu={mine ? ownScreenMenu : undefined}
                  title={mine ? "右键：切换共享/预览用的屏幕" : undefined}
                >
                  <span className="seat-num">{workstation.id === "Manager" ? "09" : workstation.label}</span>
                  <span className={"seat-state" + (isOnline ? (away ? " away" : " at-desk") : "")} aria-hidden="true">
                    {isOnline ? "●" : "○"}
                  </span>
                  <strong>{occupant?.name || (workstation.id === "Manager" ? "老板工位" : "空闲工位")}</strong>
                  <small>
                    {occupant && <span className="presence-label">{isOnline ? "在线" : "离线"}</span>}
                    {away && <span className="away-label">{awayText(online!)}</span>}
                    {mine
                      ? "这是我的工位"
                      : online?.sharing
                        ? "屏幕共享中"
                        : online && previews[online.id]
                          ? "工位预览中"
                        : occupant
                          ? isOnline
                            ? "可交流"
                            : "工位已保留"
                          : "暂无人使用"}
                  </small>
                </button>
              );
            })}
          </div>
          {visitors.length > 0 && (
            <>
              <div className="side-title">
                <h3>访客</h3>
                <span>公共区沙发 · {visitors.length} 位</span>
              </div>
              <div className="visitor-strip">
                {visitors.map((guest) => (
                  <button
                    key={guest.id}
                    aria-pressed={guest.id === focusedPerson}
                    className={"visitor" + (guest.id === focusedPerson ? " chosen" : "") +
                      (guest.id === myId ? " mine" : "")}
                    onClick={() => onFocusPerson(guest.id)}
                    onContextMenu={guest.id === myId ? ownScreenMenu : undefined}
                    title={guest.id === myId ? "右键：切换共享/预览用的屏幕" : "把镜头对到这个人"}
                  >
                    <span className={"visitor-dot" + (isAtDesk(guest) ? "" : " away")} aria-hidden="true" />
                    <strong>{guest.name}</strong>
                    <small>
                      {guest.id === myId ? "我 · " : "访客 · "}
                      {guest.sittingSpot ? "在公共区沙发" : "在空间里"}
                      {!isAtDesk(guest) && <> · {awayText(guest)}</>}
                    </small>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="detail">
            {target?.role === "visitor" && <span className="eyebrow">访客 · 在公共区沙发</span>}
            <h3>{target?.name || owner?.name || "给灵感留一个位置"}</h3>
            {target && !isAtDesk(target) && (
              <span className="away-label">{awayText(target)}</span>
            )}
            {/* The primary action comes before the preview on purpose: on a
                short laptop screen the preview would push it below the fold. */}
            <div className="detail-actions">
              {/* A desk belongs to whoever picked it, so there is no take-over
                  button and none to give it up either. Seat actions (return to
                  it, stand up) live with the avatar controls under the scene.
                  A visitor has no desk, so these act on whoever is focused. */}
              <button
                disabled={!callable}
                onClick={() => callable && onRequest(callable.id, "screen")}
              >
                请求观看对方屏幕
              </button>
              <button disabled={!callable}
                onClick={() => callable && onRequest(callable.id, 'screen', true)}>
                分享我的屏幕给对方
              </button>
              <button
                disabled={!callable}
                onClick={() => callable && onRequest(callable.id, "voice")}
              >
                邀请语音
              </button>
            </div>
            {callable && previews[callable.id] ? (
              <img
                className="screen-preview"
                src={previews[callable.id]}
                alt="对方屏幕的低清预览"
              />
            ) : (
              <div className="empty-screen">
                <span>▱</span>
                {target
                  ? target === focused
                    ? "点上面的按钮即可通话"
                    : "尚未共享屏幕"
                  : owner
                    ? "对方离线，工位已保留"
                    : "这个工位暂时无人"}
              </div>
            )}
          </div>
        </>
      ) : null}
      <ChatInbox accountId={accountId} messages={messages} contacts={contacts} people={people}
        seats={seats} connected={connected} visible={panelOpen && tab === "chat"} onMessage={onMessage}
        visitor={visitor} hidden={hiddenContacts}
        onFile={onFile} loadFile={loadFile} files={files}
        onUnread={(count, byPerson) => {
          // 数字没变就别碰 state：这个回调每次渲染都会重新创建，顺手 setState 容易和父组件空转
          // （2026-09-20 的 CPU/内存爆表就是这么来的）。
          setUnread(previous => (previous === count ? previous : count));
          onUnread?.(count, byPerson);
        }} />
      <div className="side-foot">
        <span className="dot" /> 各自专注，随时连接。
      </div>
    </aside>
  );
}
