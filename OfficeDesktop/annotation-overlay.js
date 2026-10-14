// Draws the shared annotation board onto the transparent layer above the sharer's
// display. Points arrive normalised to the shared image (0..1), so they map
// straight onto this window, which is sized to exactly that display.
const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
/** key -> { color, points: [[x, y], ...], done }。笔画上没有署名 —— 用户 2026-10-14
 * 明确要求去掉（每一笔都顶着一个名字，画面全是标签）。 */
const strokes = new Map();
let boardVersion = 0;
/** The inks a viewer can pick; must stay in step with `src/inkColors.ts`. */
const INKS = ['#e0524a', '#e8a33d', '#f0d274', '#5fb96a', '#4a9fd8', '#b46fd0', '#f4f2eb'];

/**
 * Mirrors `colorFor` in OfficeWeb/src/annotations.ts: the same colleague must
 * keep the same colour on the sharer's desktop and in every viewer's page.
 */
function colorFor(clientId) {
  let hash = 7;
  for (let index = 0; index < clientId.length; index += 1)
    hash = (hash * 31 + clientId.charCodeAt(index)) % 360;
  return `hsl(${hash} 74% 46%)`;
}

/**
 * Mirrors `inkColor` in OfficeWeb/src/inkColors.ts: the colour the drawer chose wins;
 * anything that is not one of the offered inks falls back to the per-person colour,
 * so an old client (or a hand-made message) still draws exactly as it used to.
 */
function inkColor(chosen, clientId) {
  const value = String(chosen || '').trim().toLowerCase();
  return INKS.includes(value) ? value : colorFor(clientId);
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  redraw();
}

/**
 * Normalised point (0..1 of the shared picture) -> pixels of this window.
 *
 * The layer is kept exactly over the shared display by the main process, so its
 * content box IS the shared picture on every resolution and scaling factor. Falling
 * back to the backing store keeps the very first frames of a stroke in place if the
 * window is measured before layout has run.
 */
function pixels(point) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width / ratio;
  const height = canvas.clientHeight || canvas.height / ratio;
  return [point[0] * width, point[1] * height];
}

/**
 * One path through consecutive points of the stroke. The segment start MUST advance
 * with the loop: the earlier version resolved `startX/startY` once, before the loop,
 * so every segment was drawn from the stroke's FIRST point and one stroke rendered as
 * N-1 separate lines fanning out of its origin.
 */
function paint(points, color, from = 0) {
  if (points.length < 2) return;
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  const first = Math.max(0, from - 1);
  context.beginPath();
  for (let index = first; index < points.length; index += 1) {
    const [x, y] = pixels(points[index]);
    if (index === first) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
}

function redraw() {
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  for (const stroke of strokes.values()) paint(stroke.points, stroke.color);
}

/** Append one relayed message; only the new segment is painted in the common case. */
function receive(message) {
  if (!message) return;
  if (message.type === 'clear') {
    strokes.clear();
    boardVersion += 1;
    redraw();
    return;
  }
  if (message.type === 'undo') {
    // 优先按笔画 id 精确删（观众改了颜色以后，一条条对应才不会撤错别人/撤错自己的
    // 上一条）；老客户端不发 `stroke`，退回"这个人最后画的一条"。
    const own = [...strokes.keys()].filter((key) => key.startsWith(`${message.id}:`));
    const wanted = message.stroke ? `${message.id}:${message.stroke}` : '';
    const last = strokes.has(wanted) ? wanted : own[own.length - 1];
    if (last) strokes.delete(last);
    redraw();
    return;
  }
  if (message.type !== 'annotate' || !message.id || !message.stroke) return;
  const key = `${message.id}:${message.stroke}`;
  let stroke = strokes.get(key);
  const points = Array.isArray(message.points) ? message.points : [];
  if (!stroke) {
    if (!points.length || message.done) return;
    stroke = {
      // 画的人自己挑的颜色优先：观众可以改笔色（用户 2026-10-14），整条笔画用同一个颜色。
      color: inkColor(message.color, message.clientId || message.id),
      points: [],
      done: false,
    };
    strokes.set(key, stroke);
    boardVersion += 1;
  }
  const from = stroke.points.length;
  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const x = Number(point[0]);
    const y = Number(point[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    stroke.points.push([Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))]);
  }
  stroke.done = message.done === true;
  if (stroke.points.length > from) paint(stroke.points, stroke.color, from);
}

window.addEventListener('resize', resize);
window.annotationLayer.subscribe(receive);
resize();
