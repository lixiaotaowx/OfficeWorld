// 「尺子角色」的外观模型：先选配色，再选配件。
//
// 这是唯一的数据源：UI 的色卡/配件面板、服务端校验、账号存档、多人同步、
// 以及 model 上的材质与可见性都从这里取值。加/改配色或配件**只改这个文件**，
// 服务端的白名单由 test/look.test.mjs 与本文件比对，漂了就会红。
//
// 命名对应 Blender 里的对象名（`跑步循环_修网格.blend`）：
//   胡子_小胡子 / 头发_短发 / 帽子_棒球帽 … 导出时原样带进 GLB。
export type AccessorySlot = "glasses" | "beard" | "hair" | "hat";
export const EXPRESSION_IDS = ["happy", "busy", "sleepy", "focused", "wave", "away"] as const;
export type AvatarExpression = typeof EXPRESSION_IDS[number];

export interface Appearance {
  /** 配色 id（见 PALETTE）。 */
  color: string;
  /** 每个槽位选中的配件 id，"none" = 不戴。 */
  accessories: Record<AccessorySlot, string>;
}

/**
 * 一个配色：就是那个颜色本身。
 *
 * 板身那一层贴图是**纯灰度纸 + 深色刻度**（`ruler03_材质.002_BaseColor` 逐像素 R=G=B、
 * 平均色偏 0.00，纸面亮度 ≈ 206/255、刻度 ≈ 0~9），颜色只能来自这里。所以配色做的事是
 * **把灰度当遮罩、`hex` 当颜色**：`出 = hex × (像素明度 / 纸面亮度)`。纸就正好是 `hex`，
 * 全黑的地方（明度 0）算出来还是 0，满足「不要动黑的地方」。
 * 实现见 `characterLook.tintTexture()`。**不要再改回着色器色相补丁**：那版 uniform
 * 都设对了、逐像素 A/B 也证明 GLSL 会改画面，但角色在场景里就是不变色（2026-09-28 实测）。
 */
export interface ColorDef {
  id: string;
  label: string;
  /** 板身（尺子本体）的颜色。 */
  hex: string;
  /** 深色零件的颜色（默认黑，亮色配色可以给个近黑）。 */
  accentHex?: string;
}

export interface AccessoryDef {
  id: string;
  label: string;
  /** 对应 Blender 里的物体名；"none" 没有网格。 */
  mesh: string;
}

/** 板身配色，顺序就是色卡显示顺序。 */
export const PALETTE: ColorDef[] = [
  { id: "kraft", label: "原色", hex: "#d9a441" },
  { id: "ink", label: "墨黑", hex: "#3a3a3e", accentHex: "#141416" },
  { id: "snow", label: "雪白", hex: "#f2efe6", accentHex: "#43434a" },
  { id: "sage", label: "鼠尾草", hex: "#9db08a" },
  { id: "sky", label: "天蓝", hex: "#8fb6d9" },
  { id: "mint", label: "薄荷", hex: "#8ed0b4" },
  { id: "rose", label: "玫粉", hex: "#e0a0a8" },
  { id: "lilac", label: "丁香紫", hex: "#b3a3d9" },
  { id: "navy", label: "藏蓝", hex: "#3f5680" },
  { id: "rust", label: "赤陶", hex: "#c1613f" },
];

const COLOR_BY_ID = new Map(PALETTE.map((c) => [c.id, c]));

export const ACCESSORIES: Record<AccessorySlot, AccessoryDef[]> = {
  glasses: [
    { id: "none", label: "不戴", mesh: "" },
    { id: "black", label: "黑框眼镜", mesh: "眼镜" },
  ],
  beard: [
    { id: "none", label: "干净", mesh: "" },
    { id: "mustache", label: "小胡子", mesh: "胡子_小胡子" },
    { id: "goatee", label: "山羊胡", mesh: "胡子_山羊胡" },
    { id: "full", label: "络腮胡", mesh: "胡子_络腮胡" },
    { id: "longwhite", label: "长白胡", mesh: "胡子_长白胡" },
    { id: "handlebar", label: "八字胡", mesh: "胡子_八字胡" },
    { id: "squared", label: "方框胡", mesh: "胡子_方框胡" },
  ],
  hair: [
    { id: "none", label: "光头", mesh: "" },
    { id: "short", label: "短发", mesh: "头发_短发" },
    { id: "bangs", label: "刘海", mesh: "头发_刘海" },
    { id: "afro", label: "爆炸头", mesh: "头发_爆炸头" },
    { id: "long", label: "长直发", mesh: "头发_长直发" },
    { id: "bob", label: "蘑菇头", mesh: "头发_蘑菇头" },
    { id: "twintails", label: "双马尾", mesh: "头发_双马尾" },
  ],
  hat: [
    { id: "none", label: "不戴", mesh: "" },
    { id: "cap", label: "棒球帽", mesh: "帽子_棒球帽" },
    { id: "tophat", label: "礼帽", mesh: "帽子_礼帽" },
    { id: "beanie", label: "毛线帽", mesh: "帽子_毛线帽" },
    { id: "straw", label: "草帽", mesh: "帽子_草帽" },
    { id: "party", label: "派对帽", mesh: "帽子_派对帽" },
    { id: "beret", label: "贝雷帽", mesh: "帽子_贝雷帽" },
  ],
};

/** 面板显示顺序（也是「选配件」这一步的分组顺序）。 */
export const SLOT_ORDER: AccessorySlot[] = ["glasses", "hair", "beard", "hat"];

export const SLOT_LABELS: Record<AccessorySlot, string> = {
  glasses: "眼镜",
  hair: "头发",
  beard: "胡子",
  hat: "帽子",
};

export const DEFAULT_APPEARANCE: Appearance = {
  color: "kraft",
  // 默认**一个配件都不戴**（用户 2026-09-28：「默认角色所有配件都没有」）。
  accessories: { glasses: "none", beard: "none", hair: "none", hat: "none" },
};

export function getColor(id: string | null | undefined): ColorDef {
  return COLOR_BY_ID.get(id ?? "") ?? COLOR_BY_ID.get(DEFAULT_APPEARANCE.color)!;
}

export function colorHex(id: string | null | undefined): string {
  return getColor(id).hex;
}

/** 板身颜色的十进制写法，three 的 `material.color.setHex` 直接用。 */
export function colorNumber(id: string | null | undefined): number {
  return parseInt(colorHex(id).slice(1), 16);
}

/** 深色零件（尺子的黑色刻印/边）的颜色。 */
export function accentNumber(id: string | null | undefined): number {
  const def = getColor(id);
  return parseInt((def.accentHex ?? "#000000").slice(1), 16);
}

/** 某个槽位里 id 对应的配件定义，未知一律当"不戴"。 */
export function getAccessory(slot: AccessorySlot, id: string | null | undefined): AccessoryDef {
  const list = ACCESSORIES[slot];
  return list.find((a) => a.id === id) ?? list[0];
}

/**
 * 某个槽位在**没有给出选择**时该戴什么：回退到 `DEFAULT_APPEARANCE`，而不是列表第一项
 * （第一项是 `none`）。用第一项当回退时，"全新的人"（没有 appearance 载荷）会变成光头 ——
 * 实测在多人同步里抓到过：客户端与**服务端**都犯过同一个错。
 */
function defaultAccessoryId(slot: AccessorySlot): string {
  return getAccessory(slot, DEFAULT_APPEARANCE.accessories[slot]).id;
}

/** 这个配件当前是否戴着。 */
export function hasAccessory(appearance: Appearance, slot: AccessorySlot): boolean {
  return getAccessory(slot, appearance.accessories[slot]).mesh !== "";
}

/**
 * 把任意来源（网络、localStorage、旧存档）的值收敛成合法外观。
 * 认不出来的配色回默认色，**认不出来的配件回默认配件**（不是"不戴"）——不抛错，永远可用。
 * 与服务端的 `look.mjs` 必须同规则，`test/look.test.mjs` 会比。
 */
export function resolveAppearance(raw: unknown): Appearance {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawAcc = (source.accessories && typeof source.accessories === "object"
    ? source.accessories : {}) as Record<string, unknown>;
  const accessories = {} as Record<AccessorySlot, string>;
  for (const slot of SLOT_ORDER) {
    const wanted = String(rawAcc[slot] ?? "");
    accessories[slot] = ACCESSORIES[slot].some((a) => a.id === wanted)
      ? wanted
      : defaultAccessoryId(slot);
  }
  return {
    color: getColor(String(source.color ?? "")).id,
    accessories,
  };
}

/** 两套外观是否完全一样（用于跳过无意义的广播与重渲染）。 */
export function sameAppearance(a: Appearance | null | undefined, b: Appearance | null | undefined): boolean {
  if (!a || !b) return false;
  if (a.color !== b.color) return false;
  return SLOT_ORDER.every((slot) => a.accessories[slot] === b.accessories[slot]);
}

/** 外观的稳定字符串（做缓存键、比对用）。 */
export function appearanceKey(a: Appearance): string {
  const parts = [a.color, ...SLOT_ORDER.map((slot) => a.accessories[slot])];
  return parts.join("|");
}

/** 本机缓存用的键（旧版的 `office-character` 只是 21 个角色 id，已经不用了）。 */
export const APPEARANCE_STORAGE_KEY = "office-appearance";

/** 读本机缓存的外观；读不到或坏了就回默认，绝不抛错。 */
export function readStoredAppearance(): Appearance {
  try {
    return resolveAppearance(JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY) ?? "null"));
  } catch {
    return resolveAppearance(null);
  }
}

/** 写本机缓存；存储不可用时静默跳过（服务端那份仍然有效）。 */
export function storeAppearance(appearance: Appearance) {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // ignore
  }
}
