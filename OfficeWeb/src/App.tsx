import { useBuildWorkstations } from './buildWorkstations';
import FileTransferPanel from "./FileTransferPanel";
import PrivateCallPanel from "./PrivateCallPanel";
import CallFloatingPanels from "./CallFloatingPanels";
import MonitorContextMenu from "./MonitorContextMenu";
import UpdatePrompt from "./UpdatePrompt";
import { useAppUpdate } from "./useAppUpdate";
import { useDockBridge } from "./useDockBridge";
import { useCallAttention } from "./useCallAttention";
import { mergeUnreadCounts } from "./unreadCounts";
import { useCallback, useEffect, useRef, useState } from "react";
import OfficeScene, { View } from "./OfficeScene";
import SeatPicker from "./SeatPicker";
import LookOnboarding from "./LookOnboarding";
import SidePanel from "./SidePanel";
import type { Account } from "./AccountGate";
import MeetingCenter from "./MeetingCenter";
import SharingPreview from "./SharingPreview";
import AdminDialog from "./AdminDialog";
import SettingsDialog from "./SettingsDialog";
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
import { WORKSTATIONS, workstationAt } from "./seats";
import { readStoredAppearance, resolveAppearance, type Appearance } from "./look";
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
  useBuildWorkstations();
  // 有人用三种方式打过来：所有屏幕绿起来 + 头像条把那个人的角色用当前大小拉出来招手
  // （用户 2026-09-20）。只看"还有没有没处理的邀请"，一通电话响多久就提醒多久。
  useCallAttention({ requests: office.requests, people: office.people, sharing: office.sharing });
  // 有新版本就弹提示、下载、启动安装器（用户 2026-09-17）。
  const update = useAppUpdate();
  // 头像条要的"每人多少条未读"（总数在 SidePanel 里显示）。
  const [unreadByPerson, setUnreadByPerson] = useState<Record<string, number>>({});
  // **必须是稳定引用 + 内容相同就返回旧对象**：这个回调会被 ChatInbox 的 effect 调用，
  // 每次渲染都给新函数的话就会"渲染 → setState → 再渲染"空转（2026-09-20 的 CPU/内存爆表）。
  const handleUnread = useCallback((_count: number, byPerson: Record<string, number>) => {
    setUnreadByPerson(previous => mergeUnreadCounts(previous, byPerson));
  }, []);
  // 任务栏头像条：把在线状态与缩略图推给那个小窗，并接收它的点击（用户 2026-09-17）。
  useDockBridge({
    enabled: Boolean(window.officeDesktop?.dockState),
    people: office.people,
    myId: office.myId,
    previews: office.previews,
    unread: unreadByPerson,
    missed: new Set(office.callAlerts.map(alert => alert.target)),
    sharing: office.sharing,
    // 短暂掉线时小窗保留上一次的名单，别让头像整排闪掉（用户 2026-09-20）。
    connected: office.connected,
    // 有人在小窗里看我/别人的工位：告诉服务端，被看的人屏幕闪一圈绿光（别人来看我了）。
    onPreviewWant: office.notifyWatching,
    // 头像条上直接按了「接听 / 拒绝」（用户 2026-09-21）：跟通话面板上那两个按钮同一条路。
    onAnswer: (requestId, accept) => { void office.respond(requestId, accept); },
    onCommand: (kind, personId) => {
      // 看对方屏幕 / 把我的屏幕给他 / 语音通话——和右侧详情卡上的三个按钮同一条路。
      if (kind === 'call') office.request(personId, 'voice');
      else office.request(personId, 'screen', kind === 'share');
    },
    // 有人把文件拖到了某个头像上（用户 2026-09-22）：交给唯一的 socket 拥有者去发。
    onFiles: (personId, paths) => void office.files.sendFiles(personId, paths,
      office.people.find(person => person.id === personId)?.name || ''),
    transfers: office.files.dockRows(),
  });
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
  const [view, setView] = useState<View>("overview");
  function chooseView(next: View) {
    setRenderPaused(false); setFocusSeat(null); setFocusPerson(null); setView(next);
  }
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"people" | "chat">("people");
  const [help, setHelp] = useState(false);
  const [renderPaused, setRenderPaused] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  // 切换"共享 / 预览"用哪块屏幕的菜单，右键自己的显示器或成员列表里的自己都会打开它。
  const [screenMenu, setScreenMenu] = useState<{ x: number; y: number } | null>(null);
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
  // The look we wear: 配色 + 配件. Owned here so the first-visit dialog can set it too.
  // 服务端那份（`account.appearance`）优先，本机缓存只是进页面时先用着的兜底。
  const [appearance, setAppearance] = useState<Appearance>(() =>
    account.appearance ? resolveAppearance(account.appearance) : readStoredAppearance(),
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
  function chooseAppearance(next: Appearance) {
    setAppearance(next);
    office.setAppearance(next);
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
    overview: "方块共创空间",
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
              accountId={account.id}
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
              appearance={appearance}
              onMotion={office.reportMotion}
              onSit={office.sitSpot}
              // The office may seat us itself: a visiting client is placed on a sofa.
              sitSpot={office.people.find((person) => person.id === office.myId)?.sittingSpot ?? null}
              onOpenScreenMenu={setScreenMenu}
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
                          : `${workstationAt(me.seat)?.label ?? ""} 工位`}
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
                <small className="preview-state" role="status"
                  title="在座 / 离桌怎么判定：客户端问 Windows 的全局空闲时间，所以在别的软件里工作也算在座；浏览器只能看见发到本窗口的输入，换到别的软件就会被判离桌">
                  {office.deskSensorLabel}
                </small>
                {update.currentVersion && <small className="preview-state" role="status"
                  title="已安装的客户端版本；有更新时右下角会弹出提示">
                  客户端 {update.currentVersion}
                </small>}
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
            files={office.files}
            onOpenScreenMenu={setScreenMenu}
            onUnread={handleUnread}
          />
        </main>
        <footer role="status">
          {office.notice}
          <span>A SPACE FOR PEOPLE. / OFFICE WORLD</span>
        </footer>
      </div>
      <CallFloatingPanels>
        <PrivateCallPanel office={office} />
        {office.videos['local-screen'] && Object.values(office.callStates).some(call => call.connected && call.sharing) &&
          !meetingOpen && !office.meetings.sharing &&
          <SharingPreview stream={office.videos['local-screen']} meeting={false} onStop={office.stopShare} />}
      </CallFloatingPanels>
      <UpdatePrompt update={update} />
      {/* 文件直传：进度 + 完事的「打开 / 打开文件夹」（用户 2026-09-22）。 */}
      <FileTransferPanel files={office.files} />
      {screenMenu && <MonitorContextMenu point={screenMenu} close={() => setScreenMenu(null)} />}
      <MeetingCenter client={office.meetings} people={office.people} accountId={account.id} open={meetingOpen} onOpen={() => setMeetingOpen(true)} onClose={() => setMeetingOpen(false)} videos={office.videos} annotation={office.annotation} />
      {help && (
        <SettingsDialog
          appearance={appearance}
          onAppearance={chooseAppearance}
          remembered={remembered}
          renderPaused={renderPaused}
          onRenderPaused={setRenderPaused}
          isVisitor={isVisitor}
          mySeat={mySeat}
          onRepick={() => setRePicking(true)}
          onClose={() => setHelp(false)}
        />
      )}
      {showPicker && (
        <SeatPicker
          appearance={appearance}
          onAppearance={chooseAppearance}
          failed={pickError}
          onDone={() => setRePicking(false)}
          // On a first visit there is nothing to go back to, so the picker
          // cannot be dismissed until a desk has been taken.
          dismissable={mySeat !== null}
        />
      )}
      {/* 从没捏过角色的账号：登录后弹一次捏人面板（选过就不再见）。
          选座面板开着的时候不叠着弹，避免两个对话框打架。 */}
      {!showPicker && (
        <LookOnboarding account={account} appearance={appearance} onAppearance={chooseAppearance} />
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


