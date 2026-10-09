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
 * 两侧搭桥）、拖动（含贴面磁吸）、复制、撤销重放，最后一律 `snapHorizontal`；服务端 `build-store.mjs`
 * 的 `cleanPart()` 再兜一层（旧客户端、漏掉的路径都跑不出网格）。
 *
 * **y 刻意不动**：接触高度是毫米级的（叠在 1.42m 桌面、0.34m 方块顶、地下 −1.855 那一簇上必须精确落层），
 * 强行取整会让叠着的东西浮起或陷进去；y 的**步长**仍然是整格（`snapMove` 保证），所以"移动单位"是一致的。
 */
export function snapHorizontal<T extends { x:number; z:number }>(part:T):T {
  return { ...part, x: gridSnap(part.x), z: gridSnap(part.z) };
}
/** 水平位置是否已经整格（测试与自查用：`offGridParts(parts)` 就靠它）。 */
export const onHorizontalGrid = (part:{x:number;z:number}) =>
  Math.abs(part.x - gridSnap(part.x)) < 1e-9 && Math.abs(part.z - gridSnap(part.z)) < 1e-9;
