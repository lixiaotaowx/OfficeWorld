// Draws the shared annotation board onto the transparent layer above the sharer's
// display. Points arrive normalised to the shared image (0..1), so they map
// straight onto this window, which is sized to exactly that display.
const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
/** key -> { name, color, points: [[x, y], ...], done } */
const strokes = new Map();
let boardVersion = 0;

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

function label(stroke) {
  const [first] = stroke.points;
  if (!first) return;
  const [x, y] = pixels(first);
  context.font = '600 12px "Segoe UI","Microsoft YaHei",sans-serif';
  const width = context.measureText(stroke.name).width + 14;
  context.fillStyle = stroke.color;
  context.beginPath();
  context.roundRect(x + 8, y - 26, width, 20, 10);
  context.fill();
  context.fillStyle = '#fffef9';
  context.fillText(stroke.name, x + 15, y - 12);
}

function redraw() {
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  for (const stroke of strokes.values()) {
    paint(stroke.points, stroke.color);
    label(stroke);
  }
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
    const keys = [...strokes.keys()].filter((key) => key.startsWith(`${message.id}:`));
    const last = keys[keys.length - 1];
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
      name: String(message.name || '同事').slice(0, 24),
      color: colorFor(message.clientId || message.id),
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
  if (from === 0) label(stroke);
}

window.addEventListener('resize', resize);
window.annotationLayer.subscribe(receive);
resize();
