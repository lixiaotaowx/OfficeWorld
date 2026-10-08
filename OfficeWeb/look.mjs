// 由 tools/build_look_manifest.mjs 从 src/look.ts 生成，请勿手改。
// 服务端不接受任何未登记的配色/配件 id：认不出来的一律退回默认值。
export const COLORS = new Set(["kraft","ink","snow","sage","sky","mint","rose","lilac","navy","rust"]);
export const SLOTS = {
  "glasses": [
    "none",
    "black"
  ],
  "beard": [
    "none",
    "mustache",
    "goatee",
    "full",
    "longwhite",
    "handlebar",
    "squared"
  ],
  "hair": [
    "none",
    "short",
    "bangs",
    "afro",
    "long",
    "bob",
    "twintails"
  ],
  "hat": [
    "none",
    "cap",
    "tophat",
    "beanie",
    "straw",
    "party",
    "beret"
  ]
};
export const SLOT_ORDER = ["glasses","hair","beard","hat"];
export const DEFAULT_APPEARANCE = {"color":"kraft","accessories":{"glasses":"none","hair":"none","beard":"none","hat":"none"}};

function pickId(list, value, fallback) {
  return list.has(value) ? value : fallback;
}

/** 把任意客户端载荷收敛成合法外观（幂等，永远返回可用对象）。 */
export function sanitizeAppearance(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const rawAcc = source.accessories && typeof source.accessories === "object"
    ? source.accessories : {};
  const accessories = {};
  for (const slot of SLOT_ORDER) {
    const allowed = new Set(SLOTS[slot]);
    // 回退到 **DEFAULT_APPEARANCE**，不是列表第一项（第一项是 none）。
    // 用第一项当回退时，任何不带外观的客户端（老客户端、或者刚注册还没选过的账号）
    // 在别人眼里都会变成光头——实测踩过。
    accessories[slot] = pickId(allowed, String(rawAcc[slot] ?? ""), DEFAULT_APPEARANCE.accessories[slot]);
  }
  return {
    color: pickId(COLORS, String(source.color ?? ""), DEFAULT_APPEARANCE.color),
    accessories,
  };
}

/** 两套外观是否一样（服务端只在真的变了的时候广播）。 */
export function sameAppearance(a, b) {
  if (!a || !b || a.color !== b.color) return false;
  return SLOT_ORDER.every((slot) => a.accessories?.[slot] === b.accessories?.[slot]);
}
