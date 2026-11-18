

const canvas = document.getElementById('board');
const context = canvas.getContext('2d');

const strokes = new Map();
let boardVersion = 0;

const INKS = ['#e0524a', '#e8a33d', '#f0d274', '#5fb96a', '#4a9fd8', '#b46fd0', '#f4f2eb'];

function colorFor(clientId) {
  let hash = 7;
  for (let index = 0; index < clientId.length; index += 1)
    hash = (hash * 31 + clientId.charCodeAt(index)) % 360;
  return `hsl(${hash} 74% 46%)`;
}

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

function pixels(point) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width / ratio;
  const height = canvas.clientHeight || canvas.height / ratio;
  return [point[0] * width, point[1] * height];
}

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

function receive(message) {
  if (!message) return;
  if (message.type === 'clear') {
    strokes.clear();
    boardVersion += 1;
    redraw();
    return;
  }
  if (message.type === 'undo') {

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
