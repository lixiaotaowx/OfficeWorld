/** 头像条的脸部预览：把捏人渲染的大图裁成 256×256 的正面/闭眼/背面三张，
 *  供 Dock 卡片在 4× 高分屏上也能显示 56px 的清晰头像。 */
export interface FaceBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface FaceFocus {
  angle: number;
  cx: number;
  cy: number;
  box: FaceBox;
  eyes: { x: number; y: number }[];
}

export interface FaceSet {
  front: HTMLCanvasElement;
  closed: HTMLCanvasElement | null;
  back: HTMLCanvasElement;
  geo: FaceFocus;
  backBox: FaceBox;
}

const SIZE = 512;
const SPRITE = 256;

const ctx2d = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (!context) throw Error('2d context unavailable');
  return context;
};

const rotated = (source: CanvasImageSource, angle: number, cx: number, cy: number) => {
  const layers = document.createElement('canvas');
  layers.width = layers.height = SIZE;
  const x = ctx2d(layers);
  x.translate(cx, cy);
  x.rotate(angle);
  x.translate(-cx, -cy);
  x.drawImage(source, 0, 0);
  return layers;
};

/** 只留看得见的脸，且分辨率足够 4× 屏上的 56px 头像。 */
function compact(source: HTMLCanvasElement, box: FaceBox) {
  const out = document.createElement('canvas');
  out.width = out.height = SPRITE;
  const x = ctx2d(out);
  const bw = box.x1 - box.x0;
  const w = bw * .94;
  const vx = (box.x0 + box.x1) / 2 - w / 2;
  const vy = box.y0 - bw * .14;
  x.imageSmoothingQuality = 'high';
  x.drawImage(source, vx, vy, w, w, 0, 0, SPRITE, SPRITE);
  source.width = source.height = 0;
  return out;
}

const images = new Map<string, Promise<HTMLImageElement>>();

const load = (url: string) => {
  const cached = images.get(url);
  if (cached) return cached;
  const work = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
  // 生成的头像 data URL 每个 look 都不同；长期保存解码后的图
  // 会和紧凑脸缓存重复占内存。
  if (!url.startsWith('data:')) {
    images.set(url, work);
    work.catch(() => { if (images.get(url) === work) images.delete(url); });
    if (images.size > 48) images.delete(images.keys().next().value!);
  }
  return work;
};

const cropBox = (box: FaceBox) => {
  const bw = box.x1 - box.x0;
  const w = bw * .94;
  return { x: (box.x0 + box.x1) / 2 - w / 2, y: box.y0 - bw * .14, w, bw };
};

/** 贴到目标尺寸； turned 时画背面并做透视变形（回头的效果）。 */
export function drawFace(target: HTMLCanvasElement, faces: FaceSet, size: number,
  opts: { turned?: boolean; closed?: boolean } = {}) {
  const x = ctx2d(target);
  const crop = cropBox(faces.geo.box);
  if (opts.turned) {
    const v = cropBox(faces.backBox);
    x.save();
    x.translate(size / 2, 0);
    x.transform(.8, -.06, 0, 1, 0, 0);
    x.translate(-size / 2, size * .03);
    x.drawImage(faces.back, v.x, v.y, v.w, v.w, 0, 0, size, size);
    x.restore();
    return;
  }
  if (opts.closed && faces.closed) {
    x.save();
    x.translate(size / 2, 0);
    x.transform(.8, -.06, 0, 1, 0, 0);
    x.translate(-size / 2, size * .03);
    x.drawImage(faces.closed, crop.x, crop.y, crop.w, crop.w, 0, 0, size, size);
    x.restore();
    return;
  }
  x.drawImage(faces.front, crop.x, crop.y, crop.w, crop.w, 0, 0, size, size);
}
