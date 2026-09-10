import { useEffect, useRef, useState } from "react";
import OfficeScene, { View } from "./OfficeScene";
import SeatPicker from "./SeatPicker";
import SidePanel from "./SidePanel";
import { WORKSTATIONS } from "./seats";
import type { CharacterKind } from "./characterModel";
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
  // Set while the player is deliberately re-picking a desk from the settings.
  const [rePicking, setRePicking] = useState(false);
  // The avatar we wear. Owned here so the first-visit dialog can set it too.
  const [character, setCharacter] = useState<CharacterKind>(() => {
    const saved =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("office-character")
        : null;
    return saved === "man" ? "man" : "woman";
  });
  const person = office.people.find((p) => p.seat === selected);
  const me = office.people.find((p) => p.id === office.myId);
  const mySeat = me?.seat ?? null;
  // A first-time visitor holds no desk, so the picker stays up until they take
  // one. Derived from server state rather than stored, so it cannot drift.
  const showPicker = rePicking || (Boolean(me) && mySeat === null);
  function chooseCharacter(kind: CharacterKind) {
    sessionStorage.setItem("office-character", kind);
    setCharacter(kind);
    office.setCharacter(kind);
  }
  // Screen capture and the microphone only exist in a secure context. Over
  // plain HTTP the browser hides them entirely, so a click would fail with no
  // picker at all. Say so plainly instead of failing silently.
  const insecure =
    typeof window !== "undefined" && window.isSecureContext === false;
  const httpsUrl =
    typeof location !== "undefined" ? `https://${location.host}/` : "";
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
        {insecure && (
          <div className="insecure-banner" role="alert">
            <strong>当前是明文 HTTP，浏览器禁止网页采集屏幕与麦克风。</strong>
            <span>
              所以这里无法共享屏幕和语音。请改用{" "}
              <a href={httpsUrl}>{httpsUrl}</a>
              （首次会提示证书不安全，点「继续访问」即可）。
            </span>
          </div>
        )}
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
              myId={office.myId}
              previews={office.previews}
              motions={office.motions}
              selected={selected}
              view={view}
              onSelect={setSelected}
              character={character}
              onMotion={office.reportMotion}
              onCharacter={chooseCharacter}
            />
            <div className="bottom-bar">
              <div className="identity">
                <span className="avatar">我</span>
                <div>
                  <strong>{me?.name || "正在进入空间"}</strong>
                  <small>
                    {me?.meeting
                      ? "在会议室"
                      : me?.seat === null || me?.seat === undefined
                        ? "还没选工位"
                        : `${WORKSTATIONS[me.seat]?.label ?? ""} 工位`}
                  </small>
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
                  title="缩略图很小、看不清，只用来表示工位有人在共享；真正的画面需要对方同意"
                  disabled={!office.connected}
                  onClick={() =>
                    office.setPreviewAllowed(!me?.previewAllowed)
                  }
                >
                  {me?.previewAllowed ? "工位预览：开" : "工位预览：关"}
                </button>
                <button
                  className={office.sharing ? "danger" : "primary"}
                  // Sharing is workstation-centric: your share appears on the
                  // screen of the desk you occupy, so a desk is required first.
                  // It also needs a secure context to reach the capture API.
                  disabled={
                    !office.connected ||
                    insecure ||
                    me?.seat === null ||
                    me?.seat === undefined
                  }
                  title={
                    insecure
                      ? "浏览器要求 HTTPS 才能采集屏幕，请改用 https 地址打开"
                      : me?.seat === null || me?.seat === undefined
                        ? "请先占用一个工位，你的共享画面会显示在该工位的屏幕上"
                        : "选择要共享的窗口或整个屏幕"
                  }
                  onClick={() => void office.share()}
                >
                  {office.sharing ? "停止共享" : "↗ 共享屏幕"}
                </button>
                <button
                  className={me?.meeting ? "danger" : ""}
                  // Joining needs the microphone, which plain HTTP cannot get.
                  disabled={!office.connected || (insecure && !me?.meeting)}
                  title={
                    insecure && !me?.meeting
                      ? "语音需要麦克风权限，浏览器要求 HTTPS，请改用 https 地址打开"
                      : undefined
                  }
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
          <SidePanel
            people={office.people}
            messages={office.messages}
            previews={office.previews}
            myId={office.myId}
            mySeat={mySeat}
            selected={selected}
            tab={tab}
            panelOpen={panelOpen}
            connected={office.connected}
            text={text}
            onTab={setTab}
            onSelect={setSelected}
            onOpenDesks={() => setView("desks")}
            onRequest={office.request}
            onText={setText}
            onSend={send}
          />
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
              中键拖动旋转，Shift＋中键平移，滚轮朝鼠标位置缩放。左键点击地面行走。
            </p>
            <p>
              工位一旦选定就属于你，别人无法再占用，你的共享画面也会显示在那张桌子的屏幕上。
            </p>
            <div className="settings-row">
              <span>
                我的工位：
                <strong>
                  {mySeat === null ? "还没选" : WORKSTATIONS[mySeat]?.label}
                </strong>
              </span>
              <button
                className="primary"
                onClick={() => {
                  setHelp(false);
                  setRePicking(true);
                }}
              >
                {mySeat === null ? "去选工位" : "重新选座"}
              </button>
            </div>
            <div className="actions">
              <button onClick={() => setHelp(false)}>关闭</button>
            </div>
          </section>
        </div>
      )}
      {showPicker && (
        <SeatPicker
          people={office.people}
          myId={office.myId}
          character={character}
          onCharacter={chooseCharacter}
          onPick={(seat) => office.claimSeat(seat)}
          onDone={() => setRePicking(false)}
          // On a first visit there is nothing to go back to, so the picker
          // cannot be dismissed until a desk has been taken.
          dismissable={mySeat !== null}
        />
      )}
    </div>
  );
}
