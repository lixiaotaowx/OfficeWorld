import DockCallControls from './DockCallControls';
import { dockGreeting } from './dock-private-contract';
import DockGreetingStage from './DockGreetingStage';
import DockStatusMenu from './DockStatusMenu';
import DockMeetingPanel from './DockMeetingPanel';
import DockMeetingScreens from './DockMeetingScreens';
import DockPreviewCard, { type DockPreviewAction } from './DockPreviewCard';
import { useDockHover } from './useDockHover';
import './dock-meeting.css';
// 任务栏头像条（小窗里的页面）。
//
// 它只做两件事：把主窗口推来的状态画成一排头像；把鼠标悬停/点击变成"要一帧""发起邀请"
// 的请求发回去。不连 socket、不认识业务（用户 2026-09-17 定的方案 B）。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { greetAlive, greetMode, frameColors, mergeState,
  callLabel, CALL_BAR_HEIGHT, GREET_CANVAS, stickyOrder, orderPeople,
  type DockGreet, type DockOrder, type DockPerson, type DockState } from './dockRules';
import { MicIcon, PhoneIcon, ScreenIcon } from './icons';
import './dock.css';
import { useDockPortrait } from './useDockPortrait';
import { greetingAppearance } from './dockAppearance';
import { listenDockGreeting } from './dockGreeting';
import { watchDockHitRegions } from './dockHitRegions';

const EMPTY: DockState = { people: [], sharing: false, missed: 0, hidden: false };
/** 悬停多久还没等到画面就显示占位说明。 */
const PLACEHOLDER_MS = 900;
/** 悬停期间多久再要一次画面（对方的采集间隔是 6～12 秒，所以要反复问）。 */
const PREVIEW_POLL_MS = 800;
/** 条子上那句拖拽结果留多久。 */
const DROP_NOTICE_MS = 6000;
/** 舞台亮着的这段时间里多久检查一次"人还在看我吗"。 */
const GREET_TICK_MS = 400;

/**
 * 小窗的头像：**每个配色一张专门渲的头肩图**（`head-<color>.png`，来自应用自己的渲染管线）。
 * 版本号同 `LookPreview.THUMB_VERSION`：文件名不变时客户端会拿旧缓存。
 */


function initials(name: string) {
  return (name || '?').trim().slice(0, 1);
}

function Dock() {
  const [state, setState] = useState<DockState>(EMPTY);
  const [statusMenu, setStatusMenu] = useState(false);
  const closeStatus = useCallback(() => setStatusMenu(false), []);
  const [meetingPerson, setMeetingPerson] = useState<string | null>(null);
  const [cardPx, setCardPx] = useState(0);
  const { hovered, open, focus, close, scheduleClose } = useDockHover(meetingPerson !== null || statusMenu);
  const [frames, setFrames] = useState<Record<string, string>>({});
  const [waiting, setWaiting] = useState(false);
  /** 有人来看我了：那个人的角色蹦出来演一段（用户 2026-09-18）。 */
  const [eventGreet, setGreet] = useState<DockGreet | null>(null);
  const greet = dockGreeting(state, eventGreet);
  /** 文件正悬在谁的头像上（用户 2026-09-22）：那个头像亮起来，松手就开始发。 */
  const [dropTarget, setDropTarget] = useState('');
  /** 拖拽的结果/原因：条子上给一句话，别让失败是静默的（用户 2026-09-21 报障后加）。 */
  const [dropNotice, setDropNotice] = useState('');
  const dropNoticeTimer = useRef<ReturnType<typeof setTimeout>>();
  /**
   * 指针在不在条子上（含卡片/舞台）。在的时候**头像一个都不许换位**（用户 2026-09-21：
   * 「状态栏的头像位置尽量不要频繁的切换顺序，不然本来鼠标看着一个人闪烁到另一个人了」）。
   */
  const [pointerOn, setPointerOn] = useState(false);
  /** 当前显示顺序（和"排名"分开，见 `dockRules.stickyOrder`）。 */
  const [order, setOrder] = useState<DockOrder | null>(null);
  const orderRef = useRef<DockOrder | null>(null);
  const orderKey = useRef('');

  useEffect(() => {
    const dock = window.officeDock;
    if (!dock) return;
    let live = true, receivedState = false;
    void dock.state?.().then(next => { if (live && !receivedState && next) setState(old => mergeState(old, next as DockState)); }).catch(() => undefined);
    const offState = dock.onState?.(next => { receivedState = true; setState(old => mergeState(old, next as DockState)); });
    const offPreview = dock.onPreview?.(({ id, image }) => {
      if (!id) return;
      // 空帧（对方停采/还没采到）不要把已经拿到的"最后一张"顶掉——离座的人也要看得到他
      // 最后那一张工位画面（用户 2026-09-18：「不在的话用最后一张」）。
      if (!image) return;
      setFrames(old => ({ ...old, [id]: image }));
    });
    // 有人在看我的头像（主窗口收到服务端的 watched 后转过来）：同一个人连续看只刷新
    // 时间戳，别把正在演的动画打断重播；场合变了（鼠标停一下 → 有人打电话过来）要跟着换，
    // 那一会儿是"用当前角色大小打招呼"（用户 2026-09-20）。
    const receiveGreet = (payload: Partial<DockGreet>) => {
      const next = payload as Partial<DockGreet> | undefined;
      if (!next?.id) return;
      const mode = greetMode(next.mode);
      // 同一个人连续看：只刷新时间戳，别把正在演的动画打断重播（key 不变就不会重挂）。
      // 但真变了的东西要跟着走——换了角色、或者从"停一下"变成"打电话过来"（用户 2026-09-20）。
      setGreet(old => old && old.id === next.id
        ? { ...old, at: Date.now(), mode,
          name: next.name ?? old.name, appearance: next.appearance ?? old.appearance,
          requestId: next.requestId ?? old.requestId, kind: next.kind ?? old.kind,
          offer: next.offer ?? old.offer }
        : { id: String(next.id), name: next.name, appearance: next.appearance, mode,
          requestId: next.requestId, kind: next.kind, offer: next.offer, at: Date.now() });
    };
    const offGreet = dock.onGreet?.(receiveGreet);
    const offFullGreet = listenDockGreeting(receiveGreet);
    return () => { live = false; offState?.(); offPreview?.(); offGreet?.(); offFullGreet(); };
  }, []);

  // 顺序防抖：主窗口每秒推一次状态，排名一变就重排会让人在鼠标底下换位。指针停在条子上时完全
  // 冻结；没停住也要连续稳定 `ORDER_SETTLE_MS` 才换序（没稳就等着，`waitMs` 到点再看一眼）。
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const evaluate = () => {
      const next = stickyOrder(orderRef.current, state.people.map(row => row.id), Date.now(), pointerOn);
      orderRef.current = next.order;
      const key = next.order.ids.join('|');
      if (key !== orderKey.current) { orderKey.current = key; setOrder(next.order); }
      if (next.waitMs > 0) timer = setTimeout(evaluate, next.waitMs + 30);
    };
    evaluate();
    return () => { if (timer) clearTimeout(timer); };
  }, [state.people, pointerOn]);
  const people = useMemo(() => (order ? orderPeople(state.people, order.ids) : state.people),
    [state.people, order]);

  // 心跳停了（`GREET_MS` 内没人再看）就把舞台收起来，头像条回到原样。
  useEffect(() => {
    if (!eventGreet) return;
    const timer = setInterval(() => {
      setGreet(old => (greetAlive(old, Date.now()) ? old : null));
    }, GREET_TICK_MS);
    return () => clearInterval(timer);
  }, [eventGreet]);

  // 悬停：先要一帧；等不到就给一句解释，并且**一直要到拿到为止**。
  // 主窗口手里也可能还没有这个人的画面（对方 6～12 秒才采一帧、或者刚走开），
  // 只问一次的话"悬停早了"就永远是一片白（用户 2026-09-18「不要在办公室还关着屏幕」）。
  useEffect(() => {
    if (!hovered) { setWaiting(false); return; }
    const ask = () => window.officeDock?.requestPreview?.(hovered);
    ask();
    setWaiting(true);
    const poll = setInterval(ask, PREVIEW_POLL_MS);
    const timer = setTimeout(() => setWaiting(false), PLACEHOLDER_MS);
    return () => { clearInterval(poll); clearTimeout(timer); void window.officeDock?.requestPreview?.(''); };
  }, [hovered]);

  const person = useMemo(
    () => state.people.find(row => row.id === hovered) || null, [state.people, hovered]);
  const shares = state.meeting?.screens || [];
  const sharedHover = shares.some(screen => screen.id === hovered);
  const image = hovered ? frames[hovered] : '';
  const act = useCallback((kind: DockPreviewAction, personId: string) => {
    if (!state.people.some(row => row.id === personId && !row.self)) return;
    close();
    void window.officeDock?.action?.(kind, personId);
  }, [state.people, close]);
  // 头像条上直接接听/拒绝（用户 2026-09-21）：把这一通邀请交给主窗口去应答。
  // 老客户端没有这个桥（`answer` 不存在）就不显示按钮，免得点了没反应。
  const canAnswer = typeof window.officeDock?.answer === 'function';
  const answer = useCallback((requestId: string, accept: boolean) => {
    if (!requestId) return;
    if (greet?.kind === 'meeting') {
      void window.officeDock?.action?.(accept ? 'meeting-accept' : 'meeting-decline', requestId);
      return;
    }
    void window.officeDock?.answer?.(requestId, accept);
    setGreet(null);
  }, [greet?.kind]);

  // 把文件拖到某个头像上就开始发（用户 2026-09-22：「不需要对方同意，直接就发送到设置好的
  // 位置」）。小窗**只交路径**（Electron 里 `File.path` 已经没了，只有 `webUtils` 拿得到），
  // 读盘、分片、进度全由主窗口那一侧做——和小窗那三个通话按钮走的是同一条路。
  //
  // **拖拽失败必须说出来**（2026-09-21 用户报「头像拖拽上去发送的功能不行」）：原来做不到就
  // `return`，用户那边一点反应都没有，根本分不清是"拖拽没进来"还是"进来了但发不出去"。
  // 现在只要这一拖带着文件，头像就一定会亮；松手后条子上会给一句话说明结果——
  // 如果连亮都不亮，那就说明**拖拽根本没进到这个窗口**（系统层的问题），这条线索很值钱。
  const carriesFiles = useCallback((event: React.DragEvent) =>
    Array.from(event.dataTransfer?.types || []).includes('Files'), []);
  const canDrop = typeof window.officeDock?.dropFiles === 'function';
  const complain = useCallback((text: string) => {
    setDropNotice(text);
    if (dropNoticeTimer.current) clearTimeout(dropNoticeTimer.current);
    dropNoticeTimer.current = setTimeout(() => {
      dropNoticeTimer.current = undefined;
      setDropNotice('');
    }, DROP_NOTICE_MS);
  }, []);
  /** 这一拖是不是已经被某个头像接下了（给条子背景那条兜底提示用）。 */
  const dropHandled = useRef(false);
  const dropOn = useCallback((person: DockPerson, event: React.DragEvent) => {
    if (!carriesFiles(event)) return;
    event.preventDefault();
    dropHandled.current = true;
    setDropTarget('');
    if (!canDrop) return complain('客户端太旧 · 请更新');
    // 自己不能给自己发（服务端也会拒绝），但要把原因说出来，别让动作石沉大海。
    if (person.self) return complain('这是你自己');
    const files = Array.from(event.dataTransfer?.files || []);
    const paths = window.officeDock?.filePaths?.(files) || [];
    if (!paths.length) return complain('这一拖没有文件');
    void window.officeDock?.dropFiles?.(person.id, paths);
    close();
    complain(`正在发给 ${person.name || '同事'}`);
  }, [canDrop, carriesFiles, complain, close]);
  // 拖在头像之间的空隙上松手：别让用户以为"拖上去了却没反应"。
  const dropOnStrip = useCallback((event: React.DragEvent) => {
    if (!carriesFiles(event)) return;
    event.preventDefault();
    if (dropHandled.current) { dropHandled.current = false; return; }
    setDropTarget('');
    complain('请拖到同事的头像上');
  }, [carriesFiles, complain]);

  // 窗口跟着内容变大，同时上报真正的控件区域。主进程直接读取系统指针来切换穿透，
  // 不依赖不可靠的 ignore+forward；人物、来电文字与透明背景不占鼠标区域。
  // 顺便把条子的真实宽度报上去（头像数、条子高度、"暂无人在线"那句话都会影响宽度）。
  const layoutState = useRef({ hovered, state, greet, shares, cardPx, meetingPerson, statusMenu });
  layoutState.current = { hovered, state, greet, shares, cardPx, meetingPerson, statusMenu };
  const sentLayout = useRef('');
  useEffect(() => {
    // `stageMode` 让主进程知道这是哪种舞台：peek（鼠标停一下，窗口只留一半地方）
    // 还是 call（打电话过来，人物照现在这么大）。老客户端不认这个字段，按老样子放大舞台。
    return watchDockHitRegions(rects => {
      const { hovered, state, greet, shares, cardPx, meetingPerson, statusMenu } = layoutState.current;
      const strip = document.querySelector('.dock');
      const width = strip ? Math.ceil(strip.getBoundingClientRect().width) : 0;
      const mode: '' | 'call' | 'peek' = greet ? greetMode(greet.mode) : '';
      const stagePx = greet ? GREET_CANVAS[greetMode(greet.mode)].height +
        (greetMode(greet.mode) === 'call' ? CALL_BAR_HEIGHT : 0) + 10 : 0;
      const payload = { expanded: Boolean(statusMenu || state.people.some(p => p.status) || hovered || shares.length || meetingPerson !== null || state.meeting?.active), cardPx, stage: Boolean(greet),
        stageMode: mode, stagePx, width,
        hitRegions: rects.map(({ x, y, width, height }) => ({ x, y, width, height })) };
      const key = JSON.stringify(payload);
      if (key === sentLayout.current) return;
      sentLayout.current = key;
      void window.officeDock?.layout?.(payload)?.catch(() => { sentLayout.current = ''; });
    });
    // `dropNotice` 会改变条子宽度（多一句话），所以要跟着重报一次。
  }, []);

  useEffect(() => {
    const stack = document.querySelector('.dock-popup-stack');
    if (!stack) return;
    const measure = () => {
      const height = Math.max(stack.scrollHeight, stack.getBoundingClientRect().height);
      setCardPx(height > 0 ? Math.min(700, Math.ceil(height + 18)) : 0);
    };
    const observer = new ResizeObserver(measure); observer.observe(stack); measure();
    return () => observer.disconnect();
  }, [hovered, shares.length, meetingPerson, state.meeting?.active, statusMenu]);
  useEffect(() => {
    close();
    if (state.hidden || state.meeting?.active) setMeetingPerson(null);
    if (state.hidden) setStatusMenu(false);
  }, [state.hidden, state.meeting?.id, state.meeting?.active, close]);

  const height = state.stripHeight || 40;
  // 外面那圈框的颜色跟着任务栏走（用户 2026-09-20）：深色任务栏白色浮层、浅色黑色浮层，
  // 任务栏被强调色着色时边框用强调色。
  const frame = frameColors(state.theme);
  // 传文件的时候在头像条底下画一条细进度线（用户 2026-09-22：「双方要显示系统级进度条」）。
  // 同时传好几个也只画最靠前的那一个——条子只有一行，塞不下更多。
  const transfer = (state.transfers || [])[0] || null;
  if (state.hidden) return null;
  // `popup-right`：卡片/舞台画在条子右边，头像条就得钉在窗口的左边；不这么钉的话，
  // 窗口往右长、条子还靠右对齐，头像会整排位移（用户 2026-09-20 报的小 bug）。
  return <div className={['dock', state.edge === 'top' ? 'edge-top' : '',
    state.popup === 'right' ? 'popup-right' : ''].filter(Boolean).join(' ')} role="toolbar"
    aria-label="同事头像条" data-theme={state.theme?.light ? 'light' : 'dark'}
    onMouseEnter={() => setPointerOn(true)} onMouseLeave={() => setPointerOn(false)}
    style={{ ['--dock-h' as string]: `${height}px`,
      ['--dock-frame-bg' as string]: frame.background,
      ['--dock-frame-bg-hover' as string]: frame.backgroundHover,
      ['--dock-chip-bg' as string]: frame.chip,
      ['--dock-frame-line' as string]: frame.border,
      ['--dock-frame-shadow' as string]: frame.shadow,
      ['--dock-frame-accent' as string]: state.theme?.accent || 'transparent',
      ['--dock-call-fg' as string]: state.theme?.light ? '#20241f' : '#f4f7f2',
      // 头顶那条来电气泡就浮在角色画布上边缘之上（高度、宽度都跟着画布走，好挂在头顶正中）。
      ['--dock-stage-h' as string]:
        `${GREET_CANVAS[greet ? greetMode(greet.mode) : 'call'].height}px`,
      ['--dock-stage-w' as string]:
        `${GREET_CANVAS[greet ? greetMode(greet.mode) : 'call'].width}px` }}>
    <span className="dock-grip" title="拖动可以调整位置" aria-hidden="true">⠿</span>
    {/* 所有头像外面套一圈大的圆角框，看起来是"同一套系统里的一块"（用户 2026-09-20）。 */}
    <div className="dock-frame" onDrop={dropOnStrip}>
      {/* 这里画的是**粘住的顺序**（`people`），不是主窗口刚推来的排名（`state.people`）。 */}
      {people.length === 0 && <span className="dock-empty">现在没有其他人在线</span>}
      {people.map(row => <DockAvatar key={row.id} person={row} greeting={greet?.id === row.id}
        onSelf={() => {
          close(); setStatusMenu(true);
        }}
        dropping={dropTarget === row.id} open={hovered === row.id}
        onEnter={() => open(row.id, true)} onFocus={() => focus(row.id)} onLeave={scheduleClose}
        onDragOver={event => {
          // 只要这一拖带着文件就亮——**不看 `canDrop`**：亮不亮本身就是诊断信息
          // （连亮都不亮 = 拖拽根本没有进到这个窗口）。
          if (!carriesFiles(event)) return;
          event.preventDefault();
          // 拖拽时 Chromium 只给 `copy`，这里明确要一个"移动/发送"的反馈。
          event.dataTransfer.dropEffect = 'copy';
          if (row.self) return;
          setDropTarget(row.id);
        }}
        onDragLeave={() => setDropTarget(old => (old === row.id ? '' : old))}
        onDrop={event => dropOn(row, event)} />)}
      <DockCallControls state={state} />
      {/* 拖拽的结果：成功、自己、太旧、或者不是文件——都在条子上说一句（用户 2026-09-21 报障后加）。 */}
      {dropNotice && <span className="dock-notice" role="status">{dropNotice}</span>}
      {/* 正在传的文件：底部一条细线，发送是青色、接收是绿色，失败变红（用户 2026-09-22）。 */}
      {transfer && <span className={`dock-progress ${transfer.direction}` +
        (transfer.done ? ' done' : '') + (transfer.failed ? ' failed' : '')}
        role="progressbar" data-transfer={transfer.id}
        aria-label={`正在${transfer.direction === 'receive' ? '接收' : '发送'} ${transfer.name}`}
        aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={Math.round(transfer.percent * 100)}>
        <i style={{ width: `${Math.max(3, Math.round(transfer.percent * 100))}%` }} />
      </span>}
    </div>
    {greet && <DockGreetingStage
      key={greet.id + greetMode(greet.mode) + (greet.requestId || '')}
      appearance={greetingAppearance(greet.appearance, state.people.find(row => row.id === greet.id))}
      size={greetMode(greet.mode)}
      id={greet.id}
      name={greet.name || state.people.find(row => row.id === greet.id)?.name || ''} />}
    {/* 有人打电话过来：**在站着的那个人的头顶**挂一条气泡，写清是谁、怎么打过来的，并直接给
        接听/拒绝（用户 2026-09-21：「通话请求时，需要在人物上加上是谁来电，再加一个接听的
        按钮」→「我是说打招呼的人站在状态栏上的人物头顶」）。
        外层 `.dock-call-wrap` 和角色画布同一格（同样宽、同样贴着条子），气泡在里面居中 =
        正好挂在他头顶；老客户端没有 answer 桥就只显示文字，不给按不动的按钮。 */}
    {greet && greetMode(greet.mode) === 'call' &&
      <div className="dock-call-wrap" key={greet.requestId || greet.id}>
      <div className="dock-call" role="dialog" aria-label="来电">
      <span className="dock-call-text">{callLabel(greet)}</span>
      {canAnswer && greet.requestId && <div className="dock-call-actions">
        <button type="button" className="dock-call-decline" title="拒绝这一通" disabled={greet.kind === 'meeting' ? state.meeting?.busy : state.privateCalls?.busy}
          onClick={() => answer(greet.requestId!, false)}>拒绝</button>
        <button type="button" className="dock-call-answer" title={greet.kind === 'meeting' && state.meeting?.active ? '请先离开当前会议' : '接听'}
          disabled={greet.kind === 'meeting' ? (state.meeting?.busy || state.meeting?.active) : state.privateCalls?.busy}
          onClick={() => answer(greet.requestId!, true)}><PhoneIcon />接听</button>
      </div>}
    </div>
    </div>}
    <div className="dock-popup-stack">
    {statusMenu && people.find(row => row.self) && <DockStatusMenu person={people.find(row => row.self)!} control={state.statusControl} onClose={closeStatus} />}
    {(state.meeting?.active || meetingPerson !== null) && <DockMeetingPanel key={state.meeting?.id || 'create'}
      meeting={state.meeting} initialPerson={meetingPerson || ''}
      onClose={() => setMeetingPerson(null)} />}
    <DockMeetingScreens meeting={state.meeting} />
    {state.privateCalls?.error && <div className="dock-meeting-error" role="alert">{state.privateCalls.error}</div>}
    {state.meeting?.error && meetingPerson === null &&
      <div className="dock-meeting-error" role="alert">{state.meeting.error}</div>}
    {person && !statusMenu && !sharedHover && meetingPerson === null && <DockPreviewCard
      key={person.id} person={person} image={image} waiting={waiting}
      onEnter={() => open(person.id)} onLeave={scheduleClose} onAction={act}
      onMeeting={id => { close(); setMeetingPerson(id); }} />}
    </div>
  </div>;
}

function DockAvatar({ person, greeting, dropping, open, onEnter, onFocus, onLeave, onSelf, onDragOver, onDragLeave, onDrop }: {
  person: DockPerson; greeting?: boolean; dropping?: boolean; open?: boolean;
  onEnter: () => void; onFocus: () => void; onLeave: () => void;
  onSelf: () => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}) {
  const thumb = useDockPortrait(person.appearance, person.character, { ...person, greeting });
  // 不挂 title：系统的悬停提示会盖在头像条上，而卡片里已经写清名字、未读、离座时长了。
  // `open`：我正在看这个人的卡片——头像套一圈光圈（用户 2026-09-2X 要"灵动一些"）。
  // `alert`：有未读或未接来电的人轻轻呼吸，扫一眼就知道谁在等。
  return <button type="button"
    className={`dock-avatar ${person.atDesk ? 'here' : 'away'} ${person.self ? 'mine' : ''}` +
      (greeting ? ' greeting' : '') + (dropping ? ' dropping' : '') + (open ? ' open' : '') +
      (person.missed || person.unread > 0 ? ' alert' : '')}
    data-person-id={person.id}
    data-greeting={greeting ? '1' : undefined}
    data-dropping={dropping ? '1' : undefined}
    onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onFocus}
    onBlur={event => { if (!event.currentTarget.closest('.dock')?.contains(event.relatedTarget as Node | null)) onLeave(); }}
    onClick={() => { if (person.self) onSelf(); }}
    onContextMenu={event => { if (person.self) { event.preventDefault(); onSelf(); } }}
    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
    style={thumb ? { backgroundImage: `url(${JSON.stringify(thumb)})` } : undefined}
    aria-label={person.self ? '我' : person.name}>
    {!thumb && <span className="dock-initial">{initials(person.name)}</span>}
    {person.status && <span className="dock-status-bubble" aria-label={`状态：${person.status}`}><span>{person.status}</span></span>}
    <i className={`dock-dot ${person.atDesk ? 'here' : 'away'}`} aria-hidden="true" />
    {person.sharing && <i className="dock-sharing" aria-hidden="true"><ScreenIcon /></i>}
    {person.inCall && <i className="dock-voice" aria-hidden="true"><MicIcon /></i>}
    {(person.missed || person.unread > 0) && <b className="dock-unread">{person.missed ? '!' : (person.unread > 99 ? '99+' : person.unread)}</b>}
  </button>;
}

/**
 * 「有人来看我了」的舞台：把那个人的角色拉出来。
 *
 * 两种场合（用户 2026-09-20）：鼠标停在头像上只是 `peek`——人物**小一倍**、不演动作；
 * 有人用看屏幕/共享屏幕/语音三种方式打过来是 `call`——照现在这么大演一段招手。
 *
 * three.js 是**到这一刻才加载**的（动态 import），所以平时小窗还是几 KB；角色 GLB 走的
 * 是浏览器缓存，办公室里已经加载过一次了。
 */
const root = document.getElementById('root');
if (root) createRoot(root).render(<Dock />);

