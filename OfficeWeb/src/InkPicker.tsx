import { INK_COLORS, INK_LABELS } from './inkColors';

/**
 * 标注笔的颜色（用户 2026-10-14：「观众看别人时标记可以修改颜色」）。
 *
 * 一整条笔画用一个颜色，所以这里选的是"下一笔用什么颜色"，不改已经画好的笔画。
 * 默认色仍然是这个人的固定色（`colorFor(accountId)`）——老用户看到的还是原来那一色，
 * 想换才换。
 */
export default function InkPicker({ value, onPick }: {
  value: string;
  onPick: (color: string) => void;
}) {
  return <span className="screen-stage-inks" role="group" aria-label="标注笔颜色">
    {INK_COLORS.map((color) => <button key={color} type="button"
      className="screen-stage-ink-swatch"
      style={{ background: color }}
      aria-label={`用${INK_LABELS[color] || color}画`}
      aria-pressed={value === color}
      title={`用${INK_LABELS[color] || color}画`}
      onClick={() => onPick(color)} />)}
  </span>;
}
