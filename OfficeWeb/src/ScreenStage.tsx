import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { contentBox, normalizePoint } from './annotations';
import { CloseIcon, ScreenIcon } from './icons';
import './screen-stage.css';

export interface ScreenStageProps {
  stream: MediaStream;
  /** `call-…` / `meeting-…`: which shared screen this board belongs to. */
  scope: string;
  label: string;
  onDraw: (scope: string, points: [number, number][], done: boolean) => void;
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
  const ink = useRef<HTMLCanvasElement>(null);
  const pending = useRef<[number, number][]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const drawing = useRef(false);
  /** Local echo of the stroke being drawn right now: drawn here, then handed over. */
  const echo = useRef<{ points: [number, number][]; color: string; timer?: ReturnType<typeof setTimeout> }>(
    { points: [], color: '' });
  /** True while this stage is the reason the window is in whole-screen mode. */
  const askedFullscreen = useRef(false);
  const [annotating, setAnnotating] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.srcObject = stream;
    void element.play().catch(() => undefined);
    return () => { element.srcObject = null; };
  }, [stream]);

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
    const canvas = ink.current, element = video.current, stage = host.current;
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
    props.onDraw(scope, points, done);
  }, [props, scope]);

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
    echo.current.color = props.selfColor || '#f0d274';
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
    else void element.requestFullscreen().catch(() => undefined);
  };

  const enlarge = () => {
    if (fullscreen) leaveFullscreen();
    setMaximized(true);
  };

  const enlarged = maximized || fullscreen;
  // Absent means "not told otherwise": the desktop bridge is the only thing that can
  // render a stroke anyway, so defaulting to the tools keeps every existing caller.
  const canAnnotate = props.annotatable !== false;

  return <div ref={host}
    className={`screen-stage${maximized ? ' maximized' : ''}${fullscreen ? ' fullscreen' : ''}${annotating ? ' annotating' : ''}`}>
    <video ref={video} autoPlay muted playsInline aria-label={props.label} />
    <canvas ref={ink} className="screen-stage-ink" aria-hidden="true" />
    <div className="screen-stage-draw" onPointerDown={start} onPointerMove={move}
      onPointerUp={finish} onPointerCancel={finish} />
    {/* Inline the stage keeps two compact controls only: a row of buttons in a
        narrow panel overlapped the picture and buried the screen itself. */}
    {!enlarged && <div className="screen-stage-bar minimal">
      <button type="button" className="screen-stage-expand" onClick={enlarge}
        title="在软件窗口内占满"><ScreenIcon />最大化</button>
      <button type="button" className="screen-stage-expand" onClick={toggleFullscreen}
        title="占满整个屏幕"><ScreenIcon />全屏</button>
    </div>}
    {enlarged && <div className="screen-stage-bar">
      <span className="screen-stage-name"><ScreenIcon />{props.label}</span>
      {/* Drawing needs a sharer that can actually put marks on its own screen, so the
          tools are simply not offered to a browser sharer. */}
      {canAnnotate && <button type="button" aria-pressed={annotating} title="在对方的共享屏幕上标注"
        onClick={() => { setAnnotating(!annotating); drawing.current = false; }}>标注</button>}
      {canAnnotate && annotating && <>
        <button type="button" title="撤销我画的上一条" onClick={() => {
          echo.current.points = [];
          paintEcho();
          props.onUndo(scope);
        }}>撤销</button>
        <button type="button" title="清空所有人的标注" onClick={() => {
          echo.current.points = [];
          paintEcho();
          props.onClear(scope);
        }}>清空</button>
      </>}
      <button type="button" onClick={() => (maximized ? setMaximized(false) : enlarge())}
        title={maximized ? '退出窗口内占满' : '在软件窗口内占满'}>
        {maximized ? '还原窗口' : '最大化'}</button>
      <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen}
        title="占满整个屏幕">{fullscreen ? '退出全屏' : '全屏'}</button>
      {props.actions}
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
