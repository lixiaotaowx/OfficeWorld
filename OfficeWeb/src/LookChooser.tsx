// 捏人面板：两步——先选配色，再选配件；左边一张**大图**实时显示当前效果。
//
// 用户 2026-09-28：「选角要放一个大图看当前效果 选项配件也大一点」「选角的图不要用抽象图，写实的」。
// 大图直接渲染角色模型，配件通过真实深度关系显示，不叠加带身体底图的 PNG。
import { useState } from "react";
import AccessoryChooser from "./AccessoryChooser";
import ColorChooser from "./ColorChooser";
import LookPreview from "./LookPreview";
import { appearanceKey, type Appearance } from "./look";
import { PALETTE } from './look';

interface Props {
  value: Appearance;
  onChange: (next: Appearance) => void;
  /** 面板下方的额外内容（确认/取消按钮之类），由调用方决定。 */
  footer?: (step: LookStep, goTo: (step: LookStep) => void) => React.ReactNode;
}

export type LookStep = "color" | "accessory";

export default function LookChooser({ value, onChange, footer }: Props) {
  const [step, setStep] = useState<LookStep>("color");
  return (
    <div className="look-chooser" data-step={step} data-look={appearanceKey(value)}>
      <div className="look-body">
        {/* 大图：当前效果 */}
        <div className="look-stage">
          <LookPreview value={value} size="large" face={step === "accessory"} />
          <strong>{PALETTE.find(color => color.id === value.color)?.label}</strong>
          <small>当前搭配 · 即时预览</small>
        </div>
        <div className="look-options">
          <div className="look-steps" role="tablist" aria-label="捏人步骤">
            <button
              type="button"
              role="tab"
              aria-selected={step === "color"}
              className={step === "color" ? "chosen" : ""}
              onClick={() => setStep("color")}
            >
              1 配色
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={step === "accessory"}
              className={step === "accessory" ? "chosen" : ""}
              onClick={() => setStep("accessory")}
            >
              2 配件
            </button>
          </div>
          {step === "color" ? (
            <ColorChooser value={value} onChange={onChange} />
          ) : (
            <AccessoryChooser value={value} onChange={onChange} />
          )}
        </div>
      </div>
      {footer?.(step, setStep)}
    </div>
  );
}

