/** 大厅时段（morning / afternoon / night）的天空、光照与曝光表。 */
import * as THREE from "three";

export type TimeOfDay = "morning" | "afternoon" | "night";

export interface TimeSpec {
  /** 平行光位置。 */
  key: [number, number, number];
  /** 平行光颜色 / 强度。 */
  kc: string;
  ki: number;
  /** 半球光天空色 / 地面色 / 强度。 */
  hs: string;
  hg: string;
  hi: number;
  /** 天空渐变 [顶, 底]。 */
  sky: [string, string];
  /** 色调曝光。 */
  exp: number;
  /** 台灯亮度（0 全关）。 */
  lamps: number;
}

export const TIME_TABLE: Record<TimeOfDay, TimeSpec> = {
  morning: {
    key: [-3, 11, 7],
    kc: "#fff2e1",
    ki: 3,
    hs: "#e3ecf5",
    hg: "#b1a18b",
    hi: .5,
    sky: ["#a9cde2", "#f3e7d3"],
    exp: 1,
    lamps: 0,
  },
  afternoon: {
    key: [-7, 9, 6],
    kc: "#ffe3bf",
    ki: 3.2,
    hs: "#dbe7f4",
    hg: "#af987c",
    hi: .45,
    sky: ["#bcd6e6", "#f6e9d2"],
    exp: 1,
    lamps: .1,
  },
  night: {
    key: [-4, 9, 5],
    kc: "#c3d3ed",
    ki: 1.1,
    hs: "#9daec9",
    hg: "#726659",
    hi: .28,
    sky: ["#121826", "#2c3b50"],
    exp: 1.05,
    lamps: 1,
  },
};

/** 默认相机姿态：从东南上方俯视大厅中心。 */
export const DEFAULT_VIEW = {
  yaw: .72,
  pitch: .6,
  zoom: .6,
  target: new THREE.Vector3(0, 1.5, 0),
};

/** 现在的时段：19 点后或 6 点前是夜里。 */
export function autoTime(now = new Date()): TimeOfDay {
  const hour = now.getHours();
  return hour >= 19 || hour < 6 ? "night" : hour < 12 ? "morning" : "afternoon";
}

/** 时段循环顺序（建造面板上的那个按钮）。 */
export function cycleTime(current: TimeOfDay): TimeOfDay {
  const order: TimeOfDay[] = ["auto", "morning", "afternoon", "night"] as TimeOfDay[];
  const index = order.indexOf(current as TimeOfDay);
  return order[(index + 1) % order.length] as TimeOfDay;
}

/** 顶底两色烘焙一张 1×64 的渐变贴图当天空。 */
export function makeSkyTexture(top: string, bottom: string): THREE.DataTexture {
  const data = new Uint8Array(256);
  const bottomColor = new THREE.Color(bottom);
  const topColor = new THREE.Color(top);
  const mixed = new THREE.Color();
  for (let row = 0; row < 64; row++) {
    const t = row / 63;
    mixed.copy(bottomColor).lerp(topColor, t * t * (3 - 2 * t));
    data.set([Math.round(mixed.r * 255), Math.round(mixed.g * 255), Math.round(mixed.b * 255), 255], row * 4);
  }
  const texture = new THREE.DataTexture(data, 1, 64);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
