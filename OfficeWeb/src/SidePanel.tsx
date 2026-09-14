// The right-hand sidebar: member seats, the selected desk's detail, and chat.
//
// Extracted from App.tsx, which was approaching the project's 500 line ceiling.
import { useState } from "react";
import type { ChatFileActions } from "./ChatPanel";
import ChatInbox from "./ChatInbox";
import { WORKSTATIONS } from "./seats";
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
  onMessage: (text: string, recipientId?: string) => Promise<boolean>;
  onTab: (tab: "people" | "chat") => void;
  onSelect: (seat: number) => void;
  onOpenDesks: () => void;
  onRequest: (target: string, kind: "screen" | "voice", offer?: boolean) => void;
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
  onMessage,
  onTab,
  onSelect,
  onOpenDesks,
  onRequest,
  onFile,
  loadFile,
}: Props) {
  const [unread, setUnread] = useState(0);
  // The desk's permanent owner (may be offline), and its online person if any.
  const onlinePerson = people.find((p) => p.seat === selected);
  const owner = seats[selected] || (onlinePerson && { id: onlinePerson.clientId, name: onlinePerson.name, online: true });
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
                >
                  <span className="seat-num">{workstation.id === "Manager" ? "09" : workstation.label}</span>
                  <span className="seat-state" aria-hidden="true">
                    {isOnline ? "●" : "○"}
                  </span>
                  <strong>{occupant?.name || (workstation.id === "Manager" ? "老板工位" : "空闲工位")}</strong>
                  <small>
                    {occupant && <span className="presence-label">{isOnline ? "在线" : "离线"}</span>}
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
          <div className="detail">
            <div className="eyebrow">
              DESK {WORKSTATIONS[selected]?.label ?? selected + 1}
            </div>
            <h3>{owner?.name || "给灵感留一个位置"}</h3>
            {/* The primary action comes before the preview on purpose: on a
                short laptop screen the preview would push it below the fold. */}
            <div className="detail-actions">
              {/* A desk belongs to whoever picked it, so there is no take-over
                  button and none to give it up either. Seat actions (return to
                  it, stand up) live with the avatar controls under the scene. */}
              <button
                disabled={
                  !onlinePerson || onlinePerson.id === myId
                }
                onClick={() => onlinePerson && onRequest(onlinePerson.id, "screen")}
              >
                请求观看对方屏幕
              </button>
              <button disabled={!onlinePerson || onlinePerson.id === myId}
                onClick={() => onlinePerson && onRequest(onlinePerson.id, 'screen', true)}>
                分享我的屏幕给对方
              </button>
              <button
                disabled={!onlinePerson || onlinePerson.id === myId}
                onClick={() => onlinePerson && onRequest(onlinePerson.id, "voice")}
              >
                邀请语音
              </button>
            </div>
            {onlinePerson && previews[onlinePerson.id] ? (
              <img
                className="screen-preview"
                src={previews[onlinePerson.id]}
                alt="工位屏幕的低清预览"
              />
            ) : (
              <div className="empty-screen">
                <span>▱</span>
                {owner
                  ? onlinePerson
                    ? "尚未共享屏幕"
                    : "对方离线，工位已保留"
                  : "这个工位暂时无人"}
              </div>
            )}
          </div>
        </>
      ) : null}
      <ChatInbox accountId={accountId} messages={messages} contacts={contacts} people={people}
        connected={connected} visible={panelOpen && tab === "chat"} onMessage={onMessage}
        visitor={visitor}
        onFile={onFile} loadFile={loadFile} onUnread={setUnread} />
      <div className="side-foot">
        <span className="dot" /> 各自专注，随时连接。
      </div>
    </aside>
  );
}
