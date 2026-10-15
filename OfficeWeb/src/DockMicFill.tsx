import { meterLevel } from './micLevel';

/**
 * 静音按钮里那层**跟着音量从下往上涨的填充**（用户 2026-10-14：「麦克风图标里面会根据音量的
 * 大小来填充颜色的高度，就像腾讯会议那样的功能」）。
 *
 * 几个刻意的选择：
 *   * 填充在**图标后面**（`z-index: 0`，图标抬到 1），所以话筒形状始终看得清、不会被糊掉；
 *   * 画成一个**满高的元素靠 CSS 裁切**（`height: 100%` + `scaleY`），不是每次改 height：
 *     transform 走合成层，60ms 一帧不重排；
 *   * 静音时 `meterLevel` 给 0，整层不渲染（那正是"没在收音"最直白的表示）；
 *   * `bottom` 顶到按钮底边（负 offset 抵消按钮 padding），液面才是**从底部**涨起来的。
 */
export default function DockMicFill({ level }: { level?: number }) {
  const height = meterLevel(level, true);
  if (!height) return null;
  return <i className="dock-mic-fill" data-mic-fill={height}
    style={{ transform: `scaleY(${height})` }} aria-hidden="true" />;
}
