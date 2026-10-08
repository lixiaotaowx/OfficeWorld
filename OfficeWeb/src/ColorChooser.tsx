// 捏人面板 · 第 1 步：选配色。
//
// 用户 2026-09-23：「1 先选择配色」。用户 2026-09-28：「选角的图不要用抽象图，写实的」
// —— 色卡用**真实模型渲染的图**（`full-<color>.png`，由 `render-look-thumbs.cjs`
// 用应用自己的着色器渲的），所以与选中的效果完全一致。
import LookPreview from "./LookPreview";
import { PALETTE, type Appearance } from "./look";

interface Props {
  value: Appearance;
  onChange: (next: Appearance) => void;
}

export default function ColorChooser({ value, onChange }: Props) {
  return (
    <div className="color-grid" role="listbox" aria-label="选择配色">
      {PALETTE.map((color) => (
        <button
          key={color.id}
          type="button"
          role="option"
          aria-selected={value.color === color.id}
          aria-label={color.label}
          className={value.color === color.id ? "chosen" : ""}
          onClick={() => onChange({ ...value, color: color.id })}
          title={color.label}
        >
          <LookPreview value={{ ...value, color: color.id }} size="small" />
          <span>{color.label}</span>
          <i className="swatch" style={{ background: color.hex }} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
