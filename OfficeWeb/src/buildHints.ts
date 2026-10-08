// 三维场景里的提示胶囊（旋转快捷键、接点）。
//
// 用户要求：小、不抢戏、**像 Blender 的饼菜单那样按方位排开**，彼此不重叠、不互相
// 干扰（旧版把三条环提示都堆在环的上方，实测互相压在一起）。所以：
//   * 胶囊画得紧凑（画布 80 高、键帽 50、内边距 24），屏幕高度约 27px；
//   * 快捷键画成键帽（Q / R、X、Z、C），与说明文字分开；
//   * 位置由调用方按屏幕方位摆（上/下/左/右），这里只负责出图与缩放。
import * as THREE from 'three';

const HEIGHT = 80;
const PAD = 24;
const GAP = 12;
const DOT = 7;
const KEY_GAP = 14;
const CAP_HEIGHT = 50;
const TEXT_FONT = '600 38px "Inter","Segoe UI",system-ui,"PingFang SC","Microsoft YaHei",sans-serif';
const KEY_FONT = '600 32px ui-monospace,SFMono-Regular,Menlo,Consolas,"Courier New",monospace';
const INK = '#f7f3ea';

function rgba(hex: string, alpha: number) {
  const color = new THREE.Color(hex);
  const channel = (value: number) => Math.round(THREE.MathUtils.clamp(value, 0, 1) * 255);
  return `rgba(${channel(color.r)},${channel(color.g)},${channel(color.b)},${alpha})`;
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** 提示胶囊。key 有值时画键帽，否则画一个强调色圆点。 */
export function createGuideLabel(text: string, color: string, options: { key?: string } = {}) {
  const key = options.key;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = TEXT_FONT;
  const textWidth = ctx.measureText(text).width;
  let capWidth = 0;
  if (key) {
    ctx.font = KEY_FONT;
    capWidth = Math.ceil(ctx.measureText(key).width) + 22;
  }
  canvas.width = Math.ceil(PAD * 2 + (key ? capWidth + KEY_GAP : DOT * 2 + GAP) + textWidth);
  canvas.height = HEIGHT;
  const width = canvas.width, height = canvas.height, radius = height / 2 - 1.5;
  // 药丸底 + 轻投影（画布尺寸变了之后 context 状态会重置，这里重新设一遍）。
  ctx.shadowColor = 'rgba(20,28,25,.34)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'rgba(30,40,36,.84)';
  pill(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = rgba(color, .55);
  ctx.lineWidth = 2.5;
  pill(ctx, 1.5, 1.5, width - 3, height - 3, radius);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let x = PAD;
  if (key) {
    const y = (height - CAP_HEIGHT) / 2;
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    pill(ctx, x, y, capWidth, CAP_HEIGHT, 13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.24)';
    ctx.lineWidth = 1.5;
    pill(ctx, x, y, capWidth, CAP_HEIGHT, 13);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = KEY_FONT;
    ctx.fillText(key, x + 11, height / 2 + 1);
    x += capWidth + KEY_GAP;
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + DOT, height / 2, DOT, 0, Math.PI * 2);
    ctx.fill();
    x += DOT * 2 + GAP;
  }
  ctx.fillStyle = INK;
  ctx.font = TEXT_FONT;
  ctx.fillText(text, x, height / 2 + 1);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthTest: true, depthWrite: false, toneMapped: false }));
  sprite.userData.shortcut = key ? `${key} · ${text}` : text;
  sprite.userData.aspect = canvas.width / canvas.height;
  return sprite;
}

/** 想让提示在屏幕上保持恒定高度：世界高度 ≈ 0.027 × 距离（≈27px 高，不抢戏）。 */
export function guideLabelHeight(distance: number) {
  return THREE.MathUtils.clamp(distance * .027, .05, .45);
}

/** 按高度缩放（宽度随画布比例走，长文案自动变宽而不是被压扁）。 */
export function fitGuideLabel(sprite: THREE.Sprite, height: number) {
  const aspect = Number(sprite.userData.aspect) || 4;
  sprite.scale.set(height * aspect, height, 1);
}
