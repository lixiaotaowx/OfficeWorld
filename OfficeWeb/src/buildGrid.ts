import catalog from '../build-catalog.json';

/** Shared installation/translation grid, including vertical stair layers. */
export const BUILD_GRID = .25;
/** `+ 0` 把 `-0` 归一成 `0`：`-0` 存进 JSON 会变成 `0`，不归一的话"存档里"和"内存里"会差一个符号位
 *  （测试里 `deepStrictEqual` 会因此报错，线上则是白写一次存档）。 */
export const gridSnap = (value:number) => Math.round(value/BUILD_GRID)*BUILD_GRID + 0;

/**
 * 水平两轴永远是 0.25 的整数倍——**这是"部件不会离格"的那条不变量**。
 *
 * 用户 2026-10-09：「将来确保不会有步长不统一的部件 所以就不需要对齐网格的按钮 … 根源修复 而不是打补丁」。
 * 所以不是"事后把离格的挑出来对齐"，而是**任何写进存档的位置都必须先过这道**：安装（地面/贴面/顶面辅助/
 * 两侧搭桥）、拖动（含贴面磁吸）、复制、撤销重放，最后一律落格；服务端 `build-store.mjs` 的 `cleanPart()`
 * 再兜一层（旧客户端、漏掉的路径都跑不出网格）。
 */
export function snapHorizontal<T extends { x:number; z:number }>(part:T):T {
  return { ...part, x: gridSnap(part.x), z: gridSnap(part.z) };
}

/**
 * **结构件**（目录分类「建筑」「玩法」）：墙、地板、方块、柱、梁、拱门、楼梯、门、窗、屋顶、直梯、传送点…
 * 这些是拿来"搭"的，所以**三轴都严格落在 0.25 格上**。
 *
 * 为什么高度也要落格（用户 2026-10-09 报「我有两个拱门 差距一直都是一个小缝 对不齐」）：高度的步长是
 * "从**各自的原点**加整格"，两件如果原本就差 0.041（各自站在略微不同的面上），再怎么拖都永远凑不到同一
 * 高度。落格之后一次拖动就能对齐，而且结构件之间层层叠上去仍然是精确接触（结构件的高度本来就是整格）。
 *
 * **家具/摆件（桌椅、杯子、书、屏幕…）的高度不落格**：它们的尺寸不是整格（书桌 1.42m、圆桌 0.8m），
 * 强行取整会让杯子浮在桌面之上或陷进桌面里。所以那条规则是"结构对齐优先、摆件精确贴面"。
 */
const STRUCTURAL = new Set(catalog.filter(item => item.category === '建筑' || item.category === '玩法').map(item => item.id));
export const isStructural = (kind:string) => STRUCTURAL.has(kind);

/** 放置/拖动/复制的**唯一出口**：结构件三轴落格，其余部件水平两轴落格、高度保持精确。 */
export function snapPart<T extends { kind:string; x:number; y:number; z:number }>(part:T):T {
  return isStructural(part.kind)
    ? { ...part, x: gridSnap(part.x), y: gridSnap(part.y), z: gridSnap(part.z) }
    : snapHorizontal(part);
}

/** 位置是否已经满足不变量（测试与自查用）。 */
export const onGrid = (part:{kind:string;x:number;y:number;z:number}) =>
  Math.abs(part.x - gridSnap(part.x)) < 1e-9 && Math.abs(part.z - gridSnap(part.z)) < 1e-9
  && (!isStructural(part.kind) || Math.abs(part.y - gridSnap(part.y)) < 1e-9);
