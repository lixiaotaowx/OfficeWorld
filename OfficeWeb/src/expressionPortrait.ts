import { type Appearance, type AvatarExpression, appearanceKey, colorHex, SLOT_ORDER } from './look';

export const EXPRESSION_ROOT = '/assets/avatars/expressions-v2';
export const EXPRESSION_LABELS: Record<AvatarExpression, string> = {
  happy: '开心中', busy: '忙碌中', sleepy: '困倦中', focused: '专注中', wave: '打招呼', away: '休息中',
};
export function activityExpression(activity: { greeting?: boolean; inCall?: boolean; sharing?: boolean;
  atDesk?: boolean; autoExpression?: AvatarExpression } = {}): AvatarExpression {
  if (activity.greeting) return 'wave';
  if (activity.inCall || activity.sharing) return 'focused';
  if (activity.autoExpression) return activity.autoExpression;
  if (activity.atDesk === false) return 'away';
  return 'focused';
}

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(url: string) {
  let promise = images.get(url);
  if (!promise) {
    promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { images.delete(url); reject(new Error('Avatar asset unavailable')); };
      image.src = url;
    });
    images.set(url, promise);
  }
  return promise;
}

/** Gold-only pigment replacement; skin shading and all original alpha survive. */
function tintBody(context: CanvasRenderingContext2D, color: string) {
  if (color === 'kraft') return;
  const hex = colorHex(color).slice(1);
  const target = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const frame = context.getImageData(0, 0, 512, 512);
  const data = frame.data;
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    // The yellow plate is much brighter and greener than brown irises/tick marks.
    const pigment = Math.min(1, Math.max(0, (r - 95) / 40))
      * Math.min(1, Math.max(0, (g / Math.max(r, 1) - .52) / .16))
      * Math.min(1, Math.max(0, (Math.min(r, g) - b - 20) / 30));
    if (!pigment) continue;
    const shade = Math.min(1.18, (r * .3 + g * .59 + b * .11) / 206);
    for (let c = 0; c < 3; c++) {
      const value = target[c] * Math.min(1, shade) + Math.max(0, shade - 1) * 160;
      data[i + c] = data[i + c] * (1 - pigment) + Math.min(255, value) * pigment;
    }
  }
  context.putImageData(frame, 0, 0);
}

const portraits = new Map<string, Promise<string>>();
/** All overlays are independently rendered RGBA, aligned in a common 512 frame. */
export function renderExpressionPortrait(look: Appearance, expression: AvatarExpression = 'happy') {
  const key = `${appearanceKey(look)}:${expression}`;
  const cached = portraits.get(key);
  if (cached) return cached;
  const promise = (async () => {
    const base = await loadImage(`${EXPRESSION_ROOT}/${expression}.png`);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    context.save();
    if (expression === 'sleepy') {
      context.translate(512 * .54, 512 * .475);
      context.scale(.925, .925);
      context.translate(-512 * .537, -512 * .458);
    }
    context.drawImage(base, 0, 0, 512, 512);
    context.restore();
    tintBody(context, look.color);
    // Hair sits behind headwear; eyes/glasses and the mouth/beard remain separate.
    const order = ['hair', 'hat', 'beard', 'glasses'] as typeof SLOT_ORDER;
    for (const slot of order) {
      const id = look.accessories[slot];
      if (id === 'none') continue;
      const image = await loadImage(`${EXPRESSION_ROOT}/layers/${slot}-${id}.png?v=fit-20260928`);
      context.drawImage(image, 0, 0, 512, 512);
    }
    return canvas.toDataURL('image/png');
  })();
  portraits.set(key, promise);
  if (portraits.size > 96) portraits.delete(portraits.keys().next().value!);
  promise.catch(() => portraits.delete(key));
  return promise;
}
