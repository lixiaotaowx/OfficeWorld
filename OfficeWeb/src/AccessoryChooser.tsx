// 捏人面板 · 第 2 步：选配件（眼镜 / 头发 / 胡子 / 帽子，每个槽位单选，可不戴）。
//
// 缩略图也是**真实模型渲染的图**（`wear-<slot>-<id>.png`，底为原色、只戴那一件），
// 由 `test/browser/render-look-thumbs.cjs` 用应用自己的着色器渲的。
import { useState } from 'react';
import { thumbUrl } from "./LookPreview";
import { ACCESSORIES, SLOT_LABELS, SLOT_ORDER, type Appearance } from "./look";

interface Props {
  value: Appearance;
  onChange: (next: Appearance) => void;
}

export default function AccessoryChooser({ value, onChange }: Props) {
  const [active, setActive] = useState<(typeof SLOT_ORDER)[number]>('hair');
  function pick(slot: (typeof SLOT_ORDER)[number], id: string) {
    onChange({ ...value, accessories: { ...value.accessories, [slot]: id } });
  }
  return (
    <div className="accessory-list" role="group" aria-label="选择配件">
      <div className="accessory-tabs" aria-label="配件分类">
        {SLOT_ORDER.map(slot => <button key={slot} aria-pressed={active === slot}
          className={active === slot ? 'chosen' : ''} onClick={() => setActive(slot)}>
          {SLOT_LABELS[slot]}
        </button>)}
      </div>
      {[active].map((slot) => (
        <section className="accessory-row" key={slot}>
          <span className="accessory-slot">{SLOT_LABELS[slot]}</span>
          <div className="accessory-grid" role="listbox" aria-label={SLOT_LABELS[slot]}>
            {ACCESSORIES[slot].map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={value.accessories[slot] === item.id}
                className={value.accessories[slot] === item.id ? "chosen" : ""}
                onClick={() => pick(slot, item.id)}
                title={item.label}
              >
                {item.mesh ? <img src={thumbUrl(`wear-${slot}-${item.id}`)} alt="" draggable={false} />
                  : <i className="none-mark" aria-hidden="true">—</i>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
