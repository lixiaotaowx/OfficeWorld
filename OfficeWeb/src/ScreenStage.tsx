import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  colorFor, contentBox, denormalize, normalizePoint, strokesFor, type Stroke,
} from './annotations';
import { CloseIcon, ScreenIcon } from './icons';
import './screen-stage.css';

export interface ScreenStageProps {
  stream: MediaStream;
  /** `call-…` / `meeting-…`: which shared screen this board belongs to. */
  scope: string;
  label: string;
  strokes: Stroke[];
  myClientId: string;
  onDraw: (scope: string, points: [number, number][], done: boolean) => void;
  onClear: (scope: string) => void;
  onUndo: (scope: string) => void;
  /** Call controls rendered next to the stage buttons (mute, hang up, takeover). */
  actions?: ReactNode;
  hint?: string;
}

/** Points are batched so drawing stays smooth without flooding the socket. */
const FLUSH_POINTS = 6;
const FLUSH_MS = 70;

export default function ScreenStage(props: ScreenStageProps) {
  const { stream, scope, strokes } = props;
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const board = useRef<HTMLCanvasElement>(null);
  const pending = useRef<[number, number][]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const local = useRef<[number, number][] | null>(null);
  const [annotating, setAnnotating] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const visible = strokesFor(strokes, scope);

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

  const paint = useCallback(() => {
    const canvas = board.current;
    const element = video.current;
    if (!canvas || !element) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    // Strokes are normalised to the picture, so letterboxing is handled here.
    const box = contentBox(element, element.videoWidth, element.videoHeight);
    if (!box) return;
    const draw = (points: [number, number][], color: string, name: string) => {
      if (points.length < 2) return;
      context.strokeStyle = color;
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      points.forEach((point, index) => {
        const [x, y] = denormalize(box, point[0], point[1]);
        if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      });
      context.stroke();
      const [firstX, firstY] = denormalize(box, points[0][0], points[0][1]);
      context.font = '600 12px "Segoe UI","Microsoft YaHei",sans-serif';
      const labelWidth = context.measureText(name).width + 14;
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(firstX + 8, firstY - 26, labelWidth, 20, 10);
      context.fill();
      context.fillStyle = '#fffef9';
      context.fillText(name, firstX + 15, firstY - 12);
    };
    for (const stroke of visible) draw(stroke.points, stroke.color, stroke.name);
    if (local.current) draw(local.current, colorFor(props.myClientId), '我');
  }, [visible, props.myClientId]);

  useLayoutEffect(() => {
    paint();
    const canvas = board.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => paint());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paint]);

  const flush = useCallback((done: boolean) => {
    clearTimeout(timer.current);
    const points = pending.current;
    pending.current = [];
    if (!points.length && !done) return;
    props.onDraw(scope, points, done);
  }, [props, scope]);

  const point = (event: React.PointerEvent<HTMLDivElement>): [number, number] | null => {
    const element = video.current;
    const canvas = board.current;
    if (!element || !canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const box = contentBox(element, element.videoWidth, element.videoHeight);
    if (!box) return null;
    return normalizePoint(box, event.clientX - rect.left, event.clientY - rect.top);
  };

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!annotating) return;
    const first = point(event);
    if (!first) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    local.current = [first];
    pending.current = [first];
    paint();
  };
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!annotating || !local.current) return;
    const next = point(event);
    if (!next) return;
    local.current.push(next);
    pending.current.push(next);
    paint();
    if (pending.current.length >= FLUSH_POINTS) flush(false);
    else {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => flush(false), FLUSH_MS);
    }
  };
  const finish = () => {
    if (!local.current) return;
    local.current = null;
    flush(true);
    paint();
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggleFullscreen = () => {
    const element = host.current;
    if (!element) return;
    // Whole screen: native window full screen in the desktop app, DOM full screen in
    // a browser. "Maximise" is the separate app-level mode that only fills the window.
    const bridge = window.officeDesktop;
    if (bridge?.setFullscreen) {
      void bridge.setFullscreen(!fullscreen).then((value) => setFullscreen(value === true))
        .catch(() => undefined);
      return;
    }
    if (document.fullscreenElement === element) void document.exitFullscreen().catch(() => undefined);
    else void element.requestFullscreen().catch(() => undefined);
  };

  const enlarge = () => {
    if (fullscreen) toggleFullscreen();
    setMaximized(true);
  };

  const enlarged = maximized || fullscreen;

  return <div ref={host}
    className={`screen-stage${maximized ? ' maximized' : ''}${annotating ? ' annotating' : ''}`}>
    <video ref={video} autoPlay muted playsInline aria-label={props.label} />
    <canvas ref={board} className="screen-stage-board" aria-hidden="true" />
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
      <button type="button" aria-pressed={annotating} title="在画面上标注，别人也能看到"
        onClick={() => { setAnnotating(!annotating); local.current = null; }}>标注</button>
      {annotating && <>
        <button type="button" title="撤销我画的上一条" onClick={() => props.onUndo(scope)}>撤销</button>
        <button type="button" title="清空所有人的标注" onClick={() => props.onClear(scope)}>清空</button>
      </>}
      <button type="button" onClick={() => (maximized ? setMaximized(false) : enlarge())}
        title={maximized ? '退出窗口内占满' : '在软件窗口内占满'}>
        {maximized ? '还原窗口' : '最大化'}</button>
      <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen}
        title="占满整个屏幕">{fullscreen ? '退出全屏' : '全屏'}</button>
      {props.actions}
      <button type="button" className="screen-stage-close" onClick={() => {
        if (fullscreen && window.officeDesktop?.setFullscreen) void window.officeDesktop.setFullscreen(false);
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
        setMaximized(false);
      }} aria-label="关闭放大视图"><CloseIcon /></button>
    </div>}
    {enlarged && props.hint && <p className="screen-stage-hint">{props.hint}</p>}
    {annotating && enlarged && <p className="screen-stage-tip">标注中：在画面上拖动即可画线，所有人都能看到</p>}
  </div>;
}
