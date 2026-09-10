import { useEffect, useRef, useState } from "react";
import OfficeScene, { View } from "./OfficeScene";
import { useOffice } from "./useOffice";
import "./styles.css";

function Stream({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline controls />;
}
export default function App() {
  const office = useOffice();
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"people" | "chat">("people");
  const [text, setText] = useState("");
  const [help, setHelp] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const person = office.people.find((p) => p.seat === selected);
  const me = office.people.find((p) => p.id === office.myId);
  const viewNames: Record<View, string> = {
    overview: "空间总览",
    desks: "开放工位",
    meeting: "会议空间",
    lounge: "休闲角落",
  };
  function send(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() && office.connected) {
      office.chat(text);
      setText("");
    }
  }
  return (
    <div className="app">
      <aside className="rail">
        <a className="brand" href="/" aria-label="Office World">
          o<span>·</span>
        </a>
        <button
          className="rail-icon active"
          title="空间总览"
          onClick={() => setView("overview")}
        >
          ▦
        </button>
        <button
          className="rail-icon"
          title="团队成员"
          onClick={() => {
            setTab("people");
            setPanelOpen(true);
          }}
        >
          ♧
        </button>
        <button
          className="rail-icon"
          title="空间聊天"
          onClick={() => {
            setTab("chat");
            setPanelOpen(true);
          }}
        >
          ☷
        </button>
        <div className="rail-bottom">
          <button
            className="rail-icon"
            title="使用说明"
            onClick={() => setHelp(true)}
          >
            ?
          </button>
          <span className="avatar">我</span>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <div>
            <span className="eyebrow">OFFICE WORLD / WORKSPACE</span>
            <h1>
              一起，在这里工作<span className="version">空间原型</span>
            </h1>
          </div>
          <div className="connection">
            <span className={"dot " + (!office.connected ? "offline" : "")} />
            {office.connected ? "本地协作已连接" : "正在连接"}
            <span className="divider" />
            {office.people.length} 人在线
          </div>
          <button
            aria-expanded={panelOpen}
            aria-controls="office-side-panel"
            onClick={() => setPanelOpen((open) => !open)}
          >
            {panelOpen ? "收起侧栏 ›" : "‹ 展开成员与聊天"}
          </button>
        </header>
        <main className={panelOpen ? "panel-open" : "panel-closed"}>
          <button
            className="panel-seam-toggle"
            aria-label={panelOpen ? "收起侧栏" : "展开侧栏"}
            title={panelOpen ? "收起侧栏" : "展开侧栏"}
            aria-expanded={panelOpen}
            aria-controls="office-side-panel"
            onClick={() => setPanelOpen(open => !open)}
          >
            {panelOpen ? "▶" : "◀"}
          </button>
          <section className="stage">
            <div className="stage-heading">
              <div>
                <span className="eyebrow">THE COMMON ROOM</span>
                <h2>我们的办公室</h2>
              </div>
              <span className="tag">8 工位 · 1 会议室</span>
            </div>
            <div className="view-tabs">
              {(Object.keys(viewNames) as View[]).map((v) => (
                <button
                  key={v}
                  className={view === v ? "selected" : ""}
                  onClick={() => setView(v)}
                >
                  {viewNames[v]}
                </button>
              ))}
            </div>
            <OfficeScene
              people={office.people}
              previews={office.previews}
              selected={selected}
              view={view}
              onSelect={setSelected}
            />
            <div className="bottom-bar">
              <div className="identity">
                <span className="avatar">我</span>
                <div>
                  <strong>{me?.name || "正在进入空间"}</strong>
                  <small>{me?.meeting ? "在会议室" : "在开放办公区"}</small>
                </div>
              </div>
              <div className="actions">
                <button
                  onClick={office.mute}
                  disabled={!office.sessions.length && !me?.meeting}
                >
                  {office.muted ? "打开麦克风" : "麦克风"}
                </button>
                <button
                  className={office.sharing ? "danger" : "primary"}
                  disabled={!office.connected}
                  onClick={() => void office.share()}
                >
                  {office.sharing ? "停止共享" : "↗ 共享屏幕"}
                </button>
                <button
                  className={me?.meeting ? "danger" : ""}
                  disabled={!office.connected}
                  onClick={() => {
                    setView("meeting");
                    void office.meeting();
                  }}
                >
                  {me?.meeting ? "离开会议" : "加入会议"}
                </button>
              </div>
            </div>
          </section>
          <aside id="office-side-panel" className="sidebar" hidden={!panelOpen}>
            <div className="side-tabs">
              <button
                className={tab === "people" ? "selected" : ""}
                onClick={() => setTab("people")}
              >
                空间成员 <span>{office.people.length}</span>
              </button>
              <button
                className={tab === "chat" ? "selected" : ""}
                onClick={() => setTab("chat")}
              >
                聊天
              </button>
            </div>
            {tab === "people" ? (
              <>
                <div className="side-title">
                  <h3>开放工位</h3>
                  <span>选择一个位置</span>
                </div>
                <div className="seat-grid">
                  {Array.from({ length: 8 }, (_, i) => {
                    const p = office.people.find((x) => x.seat === i);
                    return (
                      <button
                        key={i}
                        className={"seat " + (i === selected ? "chosen" : "")}
                        onClick={() => {
                          setSelected(i);
                          setView("desks");
                        }}
                      >
                        <span className="seat-num">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={"seat-state " + (p ? "occupied" : "")}>
                          {p ? "●" : "○"}
                        </span>
                        <strong>{p?.name || "空闲工位"}</strong>
                        <small>
                          {p?.sharing
                            ? "屏幕共享中"
                            : p
                              ? "在线 · 可交流"
                              : "等待伙伴加入"}
                        </small>
                      </button>
                    );
                  })}
                </div>
                <div className="detail">
                  <div className="eyebrow">
                    DESK {String(selected + 1).padStart(2, "0")}
                  </div>
                  <h3>{person?.name || "给灵感留一个位置"}</h3>
                  {person && office.previews[person.id] ? (
                    <img
                      className="screen-preview"
                      src={office.previews[person.id]}
                      alt="对方主动共享的屏幕预览"
                    />
                  ) : (
                    <div className="empty-screen">
                      <span>▱</span>
                      {person ? "尚未共享屏幕" : "这个工位暂时无人"}
                    </div>
                  )}
                  <div className="detail-actions">
                    <button
                      disabled={
                        !person || person.id === office.myId || !person.sharing
                      }
                      onClick={() =>
                        person && office.request(person.id, "screen")
                      }
                    >
                      请求看屏幕
                    </button>
                    <button
                      disabled={!person || person.id === office.myId}
                      onClick={() =>
                        person && office.request(person.id, "voice")
                      }
                    >
                      邀请语音
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="chat">
                <div className="messages">
                  {office.messages.length === 0 ? (
                    <div className="chat-empty">
                      让交流自然发生。
                      <small>消息会发送给当前连接的伙伴。</small>
                    </div>
                  ) : (
                    office.messages.map((m) => (
                      <article key={m.id}>
                        <strong>{m.name}</strong>
                        <p>{m.text}</p>
                      </article>
                    ))
                  )}
                </div>
                <form onSubmit={send}>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="给伙伴留句话…"
                    maxLength={1000}
                    aria-label="聊天消息"
                  />
                  <button
                    disabled={!office.connected || !text.trim()}
                    type="submit"
                  >
                    发送
                  </button>
                </form>
              </div>
            )}
            <div className="side-foot">
              <span className="dot" /> 一个可以一起专注的地方
            </div>
          </aside>
        </main>
        <footer role="status">
          {office.notice}
          <span>白模交互阶段 · 材质稍后接入</span>
        </footer>
      </div>
      {office.requests.map((r) => (
        <div className="modal-backdrop" key={r.id}>
          <section className="modal">
            <h2>
              {r.name} 想与你{r.kind === "voice" ? "语音交流" : "共享看屏幕"}
            </h2>
            <p>只有同意后才会建立连接。</p>
            <div className="actions">
              <button onClick={() => office.respond(r.id, false)}>
                暂时不方便
              </button>
              <button
                className="primary"
                onClick={() => office.respond(r.id, true)}
              >
                同意
              </button>
            </div>
          </section>
        </div>
      ))}
      {(office.sessions.length > 0 || me?.meeting) && (
        <div className="session-panel">
          {me?.meeting && (
            <div>
              <span>
                语音会议 · {office.people.filter((p) => p.meeting).length} 人在线
              </span>
              <button onClick={() => void office.meeting()}>离开</button>
            </div>
          )}
          {office.sessions.map((s) => (
            <div key={s.id}>
              <span>
                {s.kind === "screen" ? "屏幕连接" : "语音连接"} ·{" "}
                {office.people.find((p) => p.id === s.peer)?.name}
              </span>
              {office.videos[s.id] && <Stream stream={office.videos[s.id]} />}
              <button onClick={() => office.end(s.id)}>结束</button>
            </div>
          ))}
        </div>
      )}
      {help && (
        <div className="modal-backdrop">
          <section className="modal">
            <h2>欢迎来到 Office World</h2>
            <p>
              中键拖动旋转，Shift＋中键平移，滚轮朝鼠标位置缩放。左键点击地面行走。选择工位查看成员，点击共享屏幕后由浏览器选择共享内容。
            </p>
            <p>
              打开第二个标签页可测试本机聊天与请求流程。跨网络语音和屏幕共享还需要后续部署与连接验证。
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              开始探索
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
