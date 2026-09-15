import NotificationSetting from './NotificationSetting';
import PrivateCallPanel from "./PrivateCallPanel";
import { useEffect, useRef, useState } from "react";
import OfficeScene, { View } from "./OfficeScene";
import SeatPicker from "./SeatPicker";
import SidePanel from "./SidePanel";
import type { Account } from "./AccountGate";
import MeetingCenter from "./MeetingCenter";
import SharingPreview from "./SharingPreview";
import AdminDialog from "./AdminDialog";
import CharacterSetting from "./CharacterSetting";
import {
  AdminIcon,
  ChatIcon,
  SettingsIcon,
  MembersIcon,
  OverviewIcon,
  PersonIcon,
  ScreenIcon,
  PreviewIcon,
} from "./icons";
import { WORKSTATIONS } from "./seats";
import { resolveCharacterId, type CharacterId } from "./characters";
import { useOffice } from "./useOffice";
import "./styles.css";
import "./workspace-ui.css";
import "./workspace-responsive.css";

function Stream({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline controls />;
}
export default function App({ account, onLogout }: { account: Account; onLogout: () => void }) {
  const office = useOffice(account);
  const [focusSeat, setFocusSeat] = useState<{ seat: number; nonce: number } | null>(null);
  // The camera can also be pointed at a person: a visitor holds no desk, so the
  // directory focuses them instead. Only one of the two targets is ever active.
  const [focusPerson, setFocusPerson] = useState<{ id: string; nonce: number } | null>(null);
  function focusPersonInScene(id: string) {
    setRenderPaused(false);
    setFocusSeat(null);
    setFocusPerson({ id, nonce: Date.now() });
  }
  // The open workstations are what a visitor comes for, so that is the camera
  // position the office opens on. 空间总览 stays one click away on the rail.
  const [view, setView] = useState<View>("desks");
  function chooseView(next: View) {
    setRenderPaused(false); setFocusSeat(null); setFocusPerson(null); setView(next);
  }
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"people" | "chat">("people");
  const [help, setHelp] = useState(false);
  const [renderPaused, setRenderPaused] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  // Whether this machine has the account saved, so "it forgot me again" can be checked
  // from inside the app instead of guessed at (user, 2026-09-15).
  const [remembered, setRemembered] = useState<boolean | null>(null);
  useEffect(() => {
    if (!help || !window.officeDesktop) return;
    let alive = true;
    void window.officeDesktop.readLogin()
      .then((saved) => { if (alive) setRemembered(!!saved); })
      .catch(() => { if (alive) setRemembered(false); });
    return () => { alive = false; };
  }, [help]);
  useEffect(() => {
    const openNotification = (event: Event) => {
      const section = (event as CustomEvent<string>).detail;
      if (section === 'meeting') setMeetingOpen(true);
      if (section === 'chat') { setTab('chat'); setPanelOpen(true); }
    };
    window.addEventListener('office-notification-open', openNotification);
    return () => window.removeEventListener('office-notification-open', openNotification);
  }, []);
  // Set while the player is deliberately re-picking a desk from the settings.
  const [rePicking, setRePicking] = useState(false);
  // Error from a failed chair click, shown inside the floating picker hint.
  const [pickError, setPickError] = useState("");
  // The avatar we wear. Owned here so the first-visit dialog can set it too.
  const [character, setCharacter] = useState<CharacterId>(() =>
    resolveCharacterId(
      account.character,
    ),
  );
  // Dialogs for naming (first visit and rename) and the admin panel.
  const [adminOpen, setAdminOpen] = useState(false);
  const me = office.people.find((p) => p.id === office.myId);
  const previewAllowed = me?.previewAllowed ?? true;
  const ownedSeat = office.seats.findIndex(owner => owner?.id === account.id);
  const mySeat = me?.seat ?? (ownedSeat >= 0 ? ownedSeat : null);
  // A visiting client is seated on a sofa by the server and never takes a desk, so
  // the seat picker must not ask them to click a chair (user, 2026-09-15).
  const isVisitor = me?.role === 'visitor';
  // A first-time visitor must name themselves before doing anything else.
  const needsName = false;
  // A member with no desk sees the picker until they take one. Derived from
  // server state rather than stored, so it cannot drift.
  const showPicker =
    !needsName && !isVisitor && (rePicking || (Boolean(me) && mySeat === null));
  function chooseCharacter(id: CharacterId) {
    setCharacter(id);
    office.setCharacter(id);
  }
  // Claim a chair clicked in the scene while the picker is up. The server does
  // the authoritative check, so a race is simply reported as a failed claim.
  async function pickSeat(seat: number) {
    setPickError("");
    const ok = await office.claimSeat(seat);
    if (ok) setRePicking(false);
    else setPickError("这张椅子刚刚被别人占了，换一张吧。");
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
  return (
    <div className="app">
      <header className="rail" aria-label="办公室导航">
        <a className="brand" href="/" aria-label="Office World">
          <span className="brand-mark">o<span>·</span></span>
          <span className="brand-wordmark">OFFICE<span>一起在场</span></span>
        </a>
        <button
          className={"rail-icon" + (view === "overview" ? " active" : "")}
          title="空间总览"
          aria-label="空间总览"
          onClick={() => chooseView("overview")}
        >
          <OverviewIcon /><span className="rail-label">空间</span>
        </button>
        <button
          className={
            "rail-icon" + (panelOpen && tab === "people" ? " active" : "")
          }
          title="团队成员"
          aria-label="团队成员"
          onClick={() => {
            setTab("people");
            setPanelOpen(true);
          }}
        >
          <MembersIcon /><span className="rail-label">成员</span>
        </button>
        <button
          className={"rail-icon" + (panelOpen && tab === "chat" ? " active" : "")}
          title="空间聊天"
          aria-label="空间聊天"
          onClick={() => {
            setTab("chat");
            setPanelOpen(true);
          }}
        >
          <ChatIcon /><span className="rail-label">聊天</span>
        </button>
        <div className="connection" role="status">
          <span className={"dot " + (!office.connected ? "offline" : "")} />
          <span className="connection-label">{office.connected ? "协作已连接" : "正在连接"}</span>
          <span>{office.people.length} 人在线</span>
        </div>
        <button className="focus-switch" aria-expanded={panelOpen} aria-controls="office-side-panel"
          aria-label={panelOpen ? '收起成员面板' : '展开成员面板'}
          onClick={() => setPanelOpen(open => !open)}>
          <span>{panelOpen ? '沉浸视图' : '协作视图'}</span> {panelOpen ? '↗' : '↙'}
        </button>
        <div className="rail-bottom">
          <button
            className="rail-icon"
            title="管理员"
            aria-label="管理员"
            onClick={() => setAdminOpen(true)}
          >
            <AdminIcon />
          </button>
          <button
            className="rail-icon"
            title="设置"
            aria-label="设置"
            onClick={() => setHelp(true)}
          >
            <SettingsIcon />
          </button>
          <button className="avatar" title={`${account.name} · 退出登录`} aria-label="退出登录" onClick={onLogout}>
            <PersonIcon width={19} height={19} />
          </button>
        </div>
      </header>
      <div className="workspace">
        {insecure && (
          <div className="insecure-banner" role="alert">
            <strong>当前是明文 HTTP，浏览器禁止网页采集屏幕与麦克风。</strong>
            <span>
              所以这里无法共享屏幕和语音。请改用{" "}
              <a href={httpsUrl}>{httpsUrl}</a>
              。
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
          <section className={"stage" + (focusSeat ? " screen-focused" : "")}>
            <div className="stage-heading">
              <span className="space-number" aria-hidden="true">{String(Object.keys(viewNames).indexOf(view) + 1).padStart(2, "0")}</span>
              <div>
                <span className="eyebrow">THE COMMON GROUND</span>
                <h2>{viewNames[view]}</h2>
              </div>
              <span className="tag">数字办公室 <span>↗</span><small>{WORKSTATIONS.length} 个专属工位 / 共享会议室</small></span>
            </div>
            <div className="view-tabs">
              {(Object.keys(viewNames) as View[]).map((v) => (
                <button
                  key={v}
                  className={view === v ? "selected" : ""}
                  aria-pressed={view === v}
                  onClick={() => chooseView(v)}
                >
                  <span className="view-index">{String(Object.keys(viewNames).indexOf(v) + 1).padStart(2, "0")}</span>{viewNames[v]}
                </button>
              ))}
            </div>
            <OfficeScene
              mySeat={mySeat}
              people={office.people}
              myId={office.myId}
              previews={office.previews}
              motions={office.motions}
              view={view}
              focusSeat={focusSeat}
              focusPerson={focusPerson}
              picking={showPicker}
              onPick={(seat) => void pickSeat(seat)}
              onSelect={setSelected}
              onFocusScreen={(seat) => {
                setRenderPaused(false); setSelected(seat); setFocusPerson(null);
                setFocusSeat({ seat, nonce: Date.now() });
              }}
              renderPaused={renderPaused}
              onResumeRendering={() => setRenderPaused(false)}
              // While our screen is being watched the 3D view must keep painting even
              // if this window is not focused, or viewers would see a frozen office.
              keepRendering={office.sharing}
              character={character}
              onMotion={office.reportMotion}
              onSit={office.sitSpot}
              // The office may seat us itself: a visiting client is placed on a sofa.
              sitSpot={office.people.find((person) => person.id === office.myId)?.sittingSpot ?? null}
            />
            <div className="bottom-bar">
              <div className="identity">
                <span className="avatar">{account.name.slice(0, 1)}</span>
                <div>
                  <strong>{me?.name || "正在进入空间"}</strong>
                  <small>
                    {me?.meeting
                      ? "在会议室"
                      : isVisitor
                        ? "公共区沙发"
                        : me?.seat === null || me?.seat === undefined
                          ? "还没选工位"
                          : `${WORKSTATIONS[me.seat]?.label ?? ""} 工位`}
                  </small>
                </div>
                <button
                  className="identity-rename"
                  onClick={onLogout}
                >
                  退出登录
                </button>
              </div>
              <div className="actions">
                <button
                  title="关闭后不再接收别人的工位预览，节省流量；仍显示自己并继续分享自己的小屏幕"
                  disabled={!office.connected}
                  onClick={() =>
                    office.setPreviewAllowed(!previewAllowed)
                  }
                >
                  <PreviewIcon />{previewAllowed ? "他人工位预览：开" : "他人工位预览：关"}
                </button>
                <small className="preview-state" role="status"
                  title="本机屏幕是否正在采集并显示在自己的工位显示器上">
                  {office.previewReason}
                </small>
                {!window.officeDesktop && !office.sharing && <button
                  className="primary" disabled={!office.connected || insecure || mySeat === null}
                  title="授权浏览器采集屏幕，用于自己的工位小预览"
                  onClick={() => void office.share()}>
                  <ScreenIcon />授权工位预览
                </button>}
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
                    chooseView("meeting");
                    setMeetingOpen(true);
                  }}
                >
                  <MembersIcon />{office.meetings.active ? "会议进行中" : "会议"}
                </button>
              </div>
            </div>
          </section>
          <SidePanel
            people={office.people}
            seats={office.seats}
            messages={office.messages}
            previews={office.previews}
            myId={office.myId}
            accountId={account.id}
            mySeat={mySeat}
            visitor={isVisitor}
            selected={selected}
            tab={tab}
            panelOpen={panelOpen}
            connected={office.connected}
            contacts={office.contacts}
            hiddenContacts={office.hiddenContacts}
            onTab={setTab}
            onSelect={(seat) => {
              setRenderPaused(false); setSelected(seat); setFocusPerson(null);
              setFocusSeat({ seat, nonce: Date.now() });
            }}
            onOpenDesks={() => {}}
            onFocusPerson={focusPersonInScene}
            focusedPerson={focusPerson?.id ?? null}
            onRequest={office.request}
            onMessage={office.chat}
            onFile={office.sendChatFile}
            loadFile={office.loadChatFile}
          />
        </main>
        <footer role="status">
          {office.notice}
          <span>A SPACE FOR PEOPLE. / OFFICE WORLD</span>
        </footer>
      </div>
      <PrivateCallPanel office={office} />
      <MeetingCenter client={office.meetings} people={office.people} accountId={account.id} open={meetingOpen} onOpen={() => setMeetingOpen(true)} onClose={() => setMeetingOpen(false)} videos={office.videos} />
      {office.videos['local-screen'] && Object.values(office.callStates).some(call => call.connected && call.sharing) &&
        !meetingOpen && !office.meetings.sharing &&
        <SharingPreview stream={office.videos['local-screen']} meeting={false} onStop={office.stopShare} />}
      {help && (
        <div className="modal-backdrop">
          <section className="modal settings-modal">
            <h2>设置</h2>
            <CharacterSetting value={character} onChange={chooseCharacter} />
            {window.officeDesktop && <p className="settings-note">
              登录记忆：<strong>{remembered === null ? "检查中…" : remembered
                ? "已保存，下次启动自动登录" : "未保存（只有主动退出登录才会清除）"}</strong>
            </p>}
            <NotificationSetting />
            <label className="settings-row">
              <span>暂停三维画面（语音、共享和聊天继续）</span>
              <input type="checkbox" checked={renderPaused} onChange={e => setRenderPaused(e.target.checked)} />
            </label>
            <p>
              中键拖动旋转，Shift＋中键平移，滚轮朝鼠标位置缩放。点击地面或 WASD 行走，点击自己的椅子或屏幕回座。坐下后会自动随机切换坐姿。
            </p>
            <p>
              {isVisitor
                ? "访客在公共区沙发就坐，不占用同事工位，会议、私聊、语音和共享屏幕都不受影响。"
                : "工位一旦选定就属于你，别人无法再占用，你的共享画面也会显示在那张桌子的屏幕上。"}
            </p>
            <div className="settings-row">
              <span>
                {isVisitor ? "我的座位：" : "我的工位："}
                <strong>
                  {isVisitor ? "公共区沙发" : mySeat === null ? "还没选" : WORKSTATIONS[mySeat]?.label}
                </strong>
              </span>
              {!isVisitor && (
                <button
                  className="primary"
                  onClick={() => {
                    setHelp(false);
                    setRePicking(true);
                  }}
                >
                  {mySeat === null ? "去选工位" : "重新选座"}
                </button>
              )}
            </div>
            <div className="actions">
              <button onClick={() => setHelp(false)}>关闭</button>
            </div>
          </section>
        </div>
      )}
      {showPicker && (
        <SeatPicker
          character={character}
          onCharacter={chooseCharacter}
          failed={pickError}
          onDone={() => setRePicking(false)}
          // On a first visit there is nothing to go back to, so the picker
          // cannot be dismissed until a desk has been taken.
          dismissable={mySeat !== null}
        />
      )}
      {adminOpen && (
        <AdminDialog
          seats={office.seats}
          onKick={office.adminKick}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}


