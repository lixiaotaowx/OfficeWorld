// The right-hand sidebar: member seats, the selected desk's detail, and chat.
//
// Extracted from App.tsx, which was approaching the project's 500 line ceiling.
import { WORKSTATIONS } from "./seats";
import type { Message, Person } from "./types";

interface Props {
  people: Person[];
  messages: Message[];
  previews: Record<string, string>;
  myId: string;
  mySeat: number | null;
  selected: number;
  tab: "people" | "chat";
  panelOpen: boolean;
  connected: boolean;
  text: string;
  onTab: (tab: "people" | "chat") => void;
  onSelect: (seat: number) => void;
  onOpenDesks: () => void;
  onRequest: (target: string, kind: "screen" | "voice") => void;
  onText: (text: string) => void;
  onSend: (event: React.FormEvent) => void;
}

export default function SidePanel({
  people,
  messages,
  previews,
  myId,
  mySeat,
  selected,
  tab,
  panelOpen,
  connected,
  text,
  onTab,
  onSelect,
  onOpenDesks,
  onRequest,
  onText,
  onSend,
}: Props) {
  const person = people.find((p) => p.seat === selected);
  return (
    <aside id="office-side-panel" className="sidebar" hidden={!panelOpen}>
      <div className="side-tabs">
        <button
          className={tab === "people" ? "selected" : ""}
          onClick={() => onTab("people")}
        >
          空间成员 <span>{people.length}</span>
        </button>
        <button
          className={tab === "chat" ? "selected" : ""}
          onClick={() => onTab("chat")}
        >
          聊天
        </button>
      </div>
      {tab === "people" ? (
        <>
          <div className="side-title">
            <h3>开放工位</h3>
            <span>每个人一个工位</span>
          </div>
          <div className="seat-grid">
            {WORKSTATIONS.map((workstation) => {
              const i = workstation.index;
              const occupant = people.find((x) => x.seat === i);
              const mine = mySeat === i;
              return (
                <button
                  key={i}
                  className={
                    "seat " +
                    (i === selected ? "chosen" : "") +
                    (mine ? " mine" : "")
                  }
                  onClick={() => {
                    onSelect(i);
                    onOpenDesks();
                  }}
                >
                  <span className="seat-num">{workstation.label}</span>
                  <span className={"seat-state " + (occupant ? "occupied" : "")}>
                    {occupant ? "●" : "○"}
                  </span>
                  <strong>{occupant?.name || "空闲工位"}</strong>
                  <small>
                    {mine
                      ? "这是我的工位"
                      : occupant?.sharing
                        ? "屏幕共享中"
                        : occupant
                          ? "在线 · 可交流"
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
            <h3>{person?.name || "给灵感留一个位置"}</h3>
            {/* The primary action comes before the preview on purpose: on a
                short laptop screen the preview would push it below the fold. */}
            <div className="detail-actions">
              {/* A desk belongs to whoever picked it, so there is no take-over
                  button and none to give it up either. Seat actions (return to
                  it, stand up) live with the avatar controls under the scene. */}
              <button
                disabled={!person || person.id === myId || !person.sharing}
                onClick={() => person && onRequest(person.id, "screen")}
              >
                请求看屏幕
              </button>
              <button
                disabled={!person || person.id === myId}
                onClick={() => person && onRequest(person.id, "voice")}
              >
                邀请语音
              </button>
            </div>
            {person && previews[person.id] ? (
              <img
                className="screen-preview"
                src={previews[person.id]}
                alt="对方主动共享的屏幕预览"
              />
            ) : (
              <div className="empty-screen">
                <span>▱</span>
                {person ? "尚未共享屏幕" : "这个工位暂时无人"}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="chat">
          <div className="messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                让交流自然发生。
                <small>消息会发送给当前连接的伙伴。</small>
              </div>
            ) : (
              messages.map((m) => (
                <article key={m.id}>
                  <strong>{m.name}</strong>
                  <p>{m.text}</p>
                </article>
              ))
            )}
          </div>
          <form onSubmit={onSend}>
            <input
              value={text}
              onChange={(e) => onText(e.target.value)}
              placeholder="给伙伴留句话…"
              maxLength={1000}
              aria-label="聊天消息"
            />
            <button disabled={!connected || !text.trim()} type="submit">
              发送
            </button>
          </form>
        </div>
      )}
      <div className="side-foot">
        <span className="dot" /> 一个可以一起专注的地方
      </div>
    </aside>
  );
}
