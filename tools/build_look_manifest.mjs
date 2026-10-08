// 生成 OfficeWeb/look.mjs：服务端用的外观白名单。
//
// 唯一数据源是 src/look.ts，这个脚本把它里面导出的 `PALETTE` / `ACCESSORIES`
// 原样搬过去（不手写第二份，避免两边漂移）。改了 look.ts 之后重跑：
//   node tools/build_look_manifest.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "OfficeWeb", "src", "look.ts");
const OUT = join(ROOT, "OfficeWeb", "look.mjs");

const text = readFileSync(SRC, "utf8");

/** 用带括号配平的切片，从 `const NAME = [` 抽到匹配的 `]`。 */
function slice(text, start) {
  // 注意 `PALETTE: ColorDef[]` 这种类型注解里也有 `[]`，必须从 `=` 之后找。
  const eq = text.indexOf("=", start);
  const open = text.indexOf("[", eq < 0 ? start : eq + 1);
  if (open < 0) throw new Error("no array start");
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  throw new Error("unbalanced array");
}

function idsFromArrayLiteral(literal) {
  const ids = [];
  for (const m of literal.matchAll(/id:\s*"([a-zA-Z0-9_]+)"/g)) ids.push(m[1]);
  return ids;
}

const paletteLiteral = slice(text, text.indexOf("export const PALETTE"));
const colors = idsFromArrayLiteral(paletteLiteral);
if (colors.length === 0) throw new Error("PALETTE 里没抓到配色");

// 每个槽位的 id 列表：切出 `slot: [ ... ]` 那一段（直到下一个 `slot:` 或对象结尾）。
const accessoriesStart = text.indexOf("export const ACCESSORIES");
const accessoriesBody = text.slice(accessoriesStart, text.indexOf("};", accessoriesStart));
const slots = {};
for (const slot of ["glasses", "beard", "hair", "hat"]) {
  const at = accessoriesBody.indexOf(`${slot}: [`);
  if (at < 0) throw new Error(`ACCESSORIES 缺少槽位 ${slot}`);
  slots[slot] = idsFromArrayLiteral(slice(accessoriesBody, at));
}
const slotOrder = (slice(text, text.indexOf("export const SLOT_ORDER"))
  .match(/"([a-zA-Z]+)"/g) ?? []).map((s) => s.replaceAll('"', ""));
if (slotOrder.length !== 4) throw new Error("SLOT_ORDER 解析失败");

const defaultSource = text.slice(text.indexOf("export const DEFAULT_APPEARANCE"));
const defaultColor = /color:\s*"([a-z0-9_]+)"/.exec(defaultSource)?.[1];
if (!defaultColor) throw new Error("DEFAULT_APPEARANCE.color 解析失败");
// 每个槽位的默认配件：**必须照抄 look.ts 里那一段**，不能想当然用列表第一项
// （第一项是 none；用户默认是带短发的，抄错就会出现"服务端光头、客户端短发"两边不一致）。
const accStart = defaultSource.indexOf("accessories");
const defaultBlock = defaultSource.slice(accStart, defaultSource.indexOf("}", accStart));
const defaultAccessories = {};
for (const slot of slotOrder) {
  const id = new RegExp(`${slot}:\\s*"([a-z0-9_]+)"`).exec(defaultBlock)?.[1];
  if (!id) throw new Error(`DEFAULT_APPEARANCE.accessories.${slot} 解析失败：${defaultBlock}`);
  if (!slots[slot].includes(id)) throw new Error(`默认配件 ${slot}=${id} 不在 ACCESSORIES 里`);
  defaultAccessories[slot] = id;
}

const body = `// 由 tools/build_look_manifest.mjs 从 src/look.ts 生成，请勿手改。
// 服务端不接受任何未登记的配色/配件 id：认不出来的一律退回默认值。
export const COLORS = new Set(${JSON.stringify(colors)});
export const SLOTS = ${JSON.stringify(slots, null, 2).replace(/\n/g, "\n")};
export const SLOT_ORDER = ${JSON.stringify(slotOrder)};
export const DEFAULT_APPEARANCE = ${JSON.stringify({
  color: defaultColor,
  accessories: defaultAccessories,
})};

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
`;

writeFileSync(OUT, body);
console.log(`wrote ${OUT}`);
console.log(`colors: ${colors.join(", ")}`);
for (const slot of slotOrder) console.log(`  ${slot}: ${slots[slot].join(", ")}`);
console.log(`default color: ${defaultColor}`);
