

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

export function sanitizeAppearance(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const rawAcc = source.accessories && typeof source.accessories === "object"
    ? source.accessories : {};
  const accessories = {};
  for (const slot of SLOT_ORDER) {
    const allowed = new Set(SLOTS[slot]);

    accessories[slot] = pickId(allowed, String(rawAcc[slot] ?? ""), DEFAULT_APPEARANCE.accessories[slot]);
  }
  return {
    color: pickId(COLORS, String(source.color ?? ""), DEFAULT_APPEARANCE.color),
    accessories,
  };
}

export function sameAppearance(a, b) {
  if (!a || !b || a.color !== b.color) return false;
  return SLOT_ORDER.every((slot) => a.accessories?.[slot] === b.accessories?.[slot]);
}
