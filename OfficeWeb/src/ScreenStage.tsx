import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { contentBox, normalizePoint } from './annotations';
import { CloseIcon, ScreenIcon } from './icons';
import InkPicker from './InkPicker';
import { DEFAULT_INK, inkColor } from './inkColors';
import './screen-stage.css';
import ScreenViewControls from './ScreenViewControls';
import { createPortal } from 'react-dom';
import { useScreenZoom } from './useScreenZoom';

export interface ScreenStageProps {
  initialMode?: 'maximized' | 'fullscreen';
  stream: MediaStream;
  /** `call-…` / `meeting-…`: which shared screen this board belongs to. */
  scope: string;
  label: string;
  onDraw: (scope: string, points: [number, number][], done: boolean, color?: string) => void;
  onClear: (scope: string) => void;
  onUndo: (scope: string) => void;
  /** Call controls rendered next to the stage buttons (mute, hang up, takeover). */
  actions?: ReactNode;
  hint?: string;
  /** Colour of my own ink, so the immediate local echo matches what other people see. */
  selfColor?: string;
  /**
   * Whether the sharer's client can host the annotation layer on its own screen. Only
   * the desktop app can; a browser tab has no native layer out there, so offering to
   * draw on it would promise something that can never appear.
   */
  annotatable?: boolean;
  /**
   * 分享者自己的那块预览：加上一个「清屏」。浮层是鼠标穿透的（`setIgnoreMouseEvents`），
   * 分享者没法在屏幕上点，只能从自己的页面擦（用户 2026-10-14：「分享者清屏按钮需要」）。
   */
  clearsOwnBoard?: boolean;
}

/** Points are batched so drawing stays smooth without flooding the socket. */
const FLUSH_POINTS = 6;
const FLUSH_MS = 70;
/** How long the local echo stays before the real layer arrives inside the picture. */
const ECHO_MS = 1400;
/** Longest stroke the local echo keeps; older points are dropped from the echo only. */
const ECHO_POINTS = 2000;

/**
 * The peer's shared screen, plus an invisible surface you draw on.
 *
 * Annotation works the way remote-desktop tools do (向日葵 / 腾讯会议): a drag is
 * relayed and painted onto the SHARER'S real display by the desktop layer, and the
 * screen share captures that layer, so everyone sees the strokes through the picture
 * itself. That round trip costs a few hundred milliseconds, so the person drawing
 * also gets an immediate local echo of their own stroke; it is handed over once the
 * picture catches up, which keeps the board to exactly one lasting copy.
 */
export default function ScreenStage(props: ScreenStageProps) {
  const { scope, stream } = props;
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  /** 本机即时回显那张画布（和"下一笔用什么颜色"的 `ink` 不是一回事）。 */
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const pending = useRef<[number, number][]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const drawing = useRef(false);
  /** Local echo of the stroke being drawn right now: drawn here, then handed over. */
  const echo = useRef<{ points: [number, number][]; color: string; timer?: ReturnType<typeof setTimeout> }>(
    { points: [], color: '' });
  /** True while this stage is the reason the window is in whole-screen mode. */
  const askedFullscreen = useRef(false);
  const [annotating, setAnnotating] = useState(false);
  const [maximized, setMaximized] = useState(Boolean(props.initialMode));
  const [fullscreen, setFullscreen] = useState(false);
  /**
   * 下一笔用什么颜色（用户 2026-10-14：「观众看别人时标记可以修改颜色」）。默认还是
   * 这个人的固定色，选一次就一直是它，直到再选 —— 换色只影响之后画的笔画。
   */
  const [ink, setInk] = useState(() => inkColor(props.selfColor, DEFAULT_INK));
  // 身份换了（换账号/换通话）就把颜色跟着换回那个人的默认色，别把上一个人的选择带过去。
  useEffect(() => { setInk(inkColor(props.selfColor, DEFAULT_INK)); }, [props.selfColor]);
  const enlarged = maximized || fullscreen;
  const zoom = useScreenZoom(host, enlarged && !annotating, stream);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.srcObject = stream;
    void element.play().catch(() => undefined);
    return () => { element.srcObject = null; };
  }, [stream, enlarged]);

  useEffect(() => {
    const change = () => setFullscreen(document.fullscreenElement === host.current);
    document.addEventListener('fullscreenchange', change);
    // In the desktop app the DOM Fullscreen API is a no-op (frameless + transparent
    // window), so whole-screen mode goes through Electron and reports back here.
    const unsubscribe = window.officeDesktop?.onFullscreenChange?.((value) => setFullscreen(value));
    return () => {
      document.removeEventListener('fullscreenchange', change);
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (props.initialMode === 'maximized') void window.officeDesktop?.focusWindow?.().catch(() => undefined);
    if (props.initialMode !== 'fullscreen' || !window.officeDesktop?.setFullscreen) return;
    askedFullscreen.current = true;
    void window.officeDesktop.setFullscreen(true).catch(() => {
      askedFullscreen.current = false;
    });
  }, [props.initialMode]);

  const leaveFullscreen = useCallback(() => {
    const bridge = window.officeDesktop;
    if (bridge?.setFullscreen && askedFullscreen.current) {
      askedFullscreen.current = false;
      void bridge.setFullscreen(false).catch(() => undefined);
    }
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setFullscreen(false);
  }, []);

  /**
   * A whole-screen stage must never outlive itself: hanging up, the share ending or
   * leaving the meeting destroyed the video but left the app window full screen with
   * its title bar and maximise button hidden, and there was no way back (user,
   * 2026-09-15).
   *
   * It must also not ask to leave when it never entered. `setFullScreen(false)` makes
   * Windows restore the window's saved placement, so firing it at a window that was
   * never full screen SHRINKS the window — which is exactly what a hung-up ordinary
   * call used to do (user, 2026-09-15: "挂断后为啥软件还变小了"). Hence the
   * `askedFullscreen` gate, the same one `leaveFullscreen` uses.
   */
  useEffect(() => () => {
    const bridge = window.officeDesktop;
    if (bridge?.setFullscreen && askedFullscreen.current) {
      void bridge.setFullscreen(false).catch(() => undefined);
    }
    askedFullscreen.current = false;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    clearTimeout(echo.current.timer);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') leaveFullscreen(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, leaveFullscreen]);

  /** Paint the local echo: the same letterboxed picture box the relayed points use. */
  const paintEcho = useCallback(() => {
    const canvas = inkCanvas.current, element = video.current, stage = host.current;
    if (!canvas || !element || !stage) return;
    const ratio = window.devicePixelRatio || 1;
    const width = stage.clientWidth, height = stage.clientHeight;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const { points, color } = echo.current;
    if (points.length < 2) return;
    const box = pictureBox(element);
    if (!box) return;
    // The canvas covers the stage, the picture sits inside the video element.
    const video2 = element.getBoundingClientRect();
    const stage2 = stage.getBoundingClientRect();
    const dx = video2.left - stage2.left, dy = video2.top - stage2.top;
    context.strokeStyle = color || '#f0d274';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    points.forEach(([x, y], index) => {
      const px = dx + box.x + x * box.width;
      const py = dy + box.y + y * box.height;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.stroke();
  }, []);

  /** Keep the echo a little longer than the round trip, then hand the stroke over. */
  const releaseEcho = useCallback(() => {
    clearTimeout(echo.current.timer);
    echo.current.timer = setTimeout(() => { echo.current.points = []; paintEcho(); }, ECHO_MS);
  }, [paintEcho]);

  const flush = useCallback((done: boolean) => {
    clearTimeout(timer.current);
    const points = pending.current;
    pending.current = [];
    if (!points.length && !done) return;
    // 颜色只在起笔那一条消息上带过去，浮层按"整条笔画一个颜色"画。
    props.onDraw(scope, points, done, done ? undefined : ink);
  }, [props, scope, ink]);

  /** Element-relative pixels -> 0..1 of the shared picture, or null when outside it. */
  const point = (event: React.PointerEvent<HTMLDivElement>): [number, number] | null => {
    const element = video.current;
    if (!element) return null;
    const box = pictureBox(element);
    if (!box) return null;
    // Measured against the video itself, not the drawing surface: the two boxes only
    // coincide while the layout holds, and every stroke would shift with the window.
    const rect = element.getBoundingClientRect();
    return normalizePoint(box, event.clientX - rect.left, event.clientY - rect.top);
  };

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!annotating) return;
    const first = point(event);
    if (!first) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    pending.current = [first];
    clearTimeout(echo.current.timer);
    echo.current.points = [first];
    echo.current.color = ink;
  };
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!annotating || !drawing.current) return;
    const next = point(event);
    if (!next) return;
    pending.current.push(next);
    echo.current.points.push(next);
    if (echo.current.points.length > ECHO_POINTS)
      echo.current.points.splice(0, echo.current.points.length - ECHO_POINTS);
    paintEcho();
    if (pending.current.length >= FLUSH_POINTS) flush(false);
    else {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => flush(false), FLUSH_MS);
    }
  };
  const finish = () => {
    if (!drawing.current) return;
    drawing.current = false;
    flush(true);
    releaseEcho();
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggleFullscreen = () => {
    const element = host.current;
    if (!element) return;
    // Whole screen: native window full screen in the desktop app, DOM full screen in
    // a browser. "Maximise" is the separate app-level mode that only fills the window.
    const bridge = window.officeDesktop;
    if (bridge?.setFullscreen) {
      const wanted = !fullscreen;
      askedFullscreen.current = wanted;
      void bridge.setFullscreen(wanted).then((value) => setFullscreen(value === true))
        .catch(() => undefined);
      return;
    }
    if (document.fullscreenElement === element) void document.exitFullscreen().catch(() => undefined);
    else {
      setMaximized(true);
      requestAnimationFrame(() => { void host.current?.requestFullscreen().catch(() => undefined); });
    }
  };

  const enlarge = () => {
    void window.officeDesktop?.focusWindow?.().catch(() => undefined);
    if (fullscreen) leaveFullscreen();
    setMaximized(true);
  };

  // Absent means "not told otherwise": the desktop bridge is the only thing that can
  // render a stroke anyway, so defaulting to the tools keeps every existing caller.
  const canAnnotate = props.annotatable !== false;

  const dropEcho = () => { echo.current.points = []; paintEcho(); };

  /**
   * 分享者自己也能擦掉板上的笔迹（用户 2026-10-14：「分享者清屏按钮需要」）。
   *
   * 这里和观众那条路的区别只在**谁来说清**：观众的「清空」要经 socket 中继到分享者的
   * 浮层；分享者自己点就直接擦本机浮层（`onClear` 里 `annotationChannel.clear` 本来就
   * 先擦本机再广播），顺带把本机即时回显一起清掉，不然会留下一条"幽灵笔迹"。
   */
  const clearBoard = () => { dropEcho(); props.onClear(scope); };

  const stage = <div ref={host}
    className={`screen-stage${maximized ? ' maximized' : ''}${fullscreen ? ' fullscreen' : ''}${annotating ? ' annotating' : ''}${props.clearsOwnBoard ? ' own-board' : ''}`}>
    <video ref={video} autoPlay muted playsInline aria-label={props.label}
      style={{ transform: `scale(${zoom})` }} />
    <canvas ref={inkCanvas} className="screen-stage-ink" aria-hidden="true" />
    <div className="screen-stage-draw" onPointerDown={start} onPointerMove={move}
      onPointerUp={finish} onPointerCancel={finish} />
    {/*
      分享者自己的那块预览不属于"别人的屏幕"，所以它不要这一整套工具（标注/撤销是
      观众的动作）；它只要一个「清屏」——浮层不听鼠标（`setIgnoreMouseEvents(true)`），
      分享者想擦掉别人画在他屏幕上的笔迹，只有从自己页面点这一条路。
    */}
    {props.clearsOwnBoard && <div className="screen-stage-own-clear">
      <button type="button" title="清空共享画面上的所有标注（所有人都会看到）"
        onClick={clearBoard}>清屏</button>
    </div>}
    {/* Inline the stage keeps two compact controls only: a row of buttons in a
        narrow panel overlapped the picture and buried the screen itself. */}
    {!enlarged && <ScreenViewControls onMaximize={enlarge} onFullscreen={toggleFullscreen} />}
    {enlarged && <div className="screen-stage-bar">
      <span className="screen-stage-name"><ScreenIcon />{props.label}</span>
      {/* Drawing needs a sharer that can actually put marks on its own screen, so the
          tools are simply not offered to a browser sharer. */}
      {canAnnotate && <button type="button" aria-pressed={annotating} title="在对方的共享屏幕上标注"
        onClick={() => { setAnnotating(!annotating); drawing.current = false; }}>标注</button>}
      {canAnnotate && annotating && <>
        {/* 颜色排在撤销/清空前面：先挑颜色再画，是这里的顺序（用户 2026-10-14）。 */}
        <InkPicker value={ink} onPick={setInk} />
        <button type="button" title="撤销我画的上一条" onClick={() => { dropEcho(); props.onUndo(scope); }}>撤销</button>
        <button type="button" title="清空所有人的标注" onClick={clearBoard}>清空</button>
      </>}
      <button type="button" onClick={() => (maximized ? setMaximized(false) : enlarge())}
        title={maximized ? '退出窗口内占满' : '在软件窗口内占满'}>
        {maximized ? '还原窗口' : '最大化'}</button>
      <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen}
        title="占满整个屏幕">{fullscreen ? '退出全屏' : '全屏'}</button>
      {props.actions}
      <span className="screen-stage-zoom">{Math.round(zoom * 100)}%</span>
      <button type="button" className="screen-stage-close" onClick={() => {
        leaveFullscreen();
        setMaximized(false);
      }} aria-label="关闭放大视图"><CloseIcon /></button>
    </div>}
    {enlarged && props.hint && <p className="screen-stage-hint">{props.hint}</p>}
    {annotating && enlarged && <p className="screen-stage-tip">标注中：拖动即可画线，笔迹画在对方的共享屏幕上</p>}
    {enlarged && !canAnnotate && (
      <p className="screen-stage-tip">对方在网页里共享屏幕，标注画不到他的屏幕上</p>
    )}
  </div>;
  return enlarged ? createPortal(stage, document.body) : stage;
}

/**
 * Where the shared picture sits inside the video element. Falls back to the whole
 * element while the first frame is still arriving (`videoWidth` is 0 then), so the
 * very first stroke is not silently dropped on an unusual resolution.
 */
function pictureBox(element: HTMLVideoElement) {
  const measured = contentBox(element, element.videoWidth, element.videoHeight);
  if (measured) return measured;
  const { clientWidth, clientHeight } = element;
  if (!clientWidth || !clientHeight) return null;
  return { x: 0, y: 0, width: clientWidth, height: clientHeight };
}
