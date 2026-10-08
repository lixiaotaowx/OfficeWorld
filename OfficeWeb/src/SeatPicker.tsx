// First-visit seat picker. It is a floating hint rather than a blocking modal,
// in two steps: 先捏人（1 配色 → 2 配件）并确认，然后在三维场景里点一张真实椅子认领工位。
// Clicking a chair is the only way to take one; the desk then belongs to that
// player until they explicitly re-pick.
import { useState } from "react";
import type { Appearance } from "./look";
import LookChooser from "./LookChooser";

interface Props {
  /** 这个人的配色与配件；首次进空间就在这里定。 */
  appearance: Appearance;
  onAppearance: (next: Appearance) => void;
  /** Error from the last failed claim, shown until the next pick. */
  failed: string;
  onDone: () => void;
  /** False on a first visit, where there is nothing sensible to go back to. */
  dismissable: boolean;
}

export default function SeatPicker({
  appearance,
  onAppearance,
  failed,
  onDone,
  dismissable,
}: Props) {
  // Step 1 is 捏人（配色 + 配件）; confirming moves to step 2, where a chair
  // click claims the desk.
  const [confirmed, setConfirmed] = useState(false);

  if (!confirmed) {
    return (
      <div className="seat-picker-hint" role="dialog" aria-label="选择角色">
        <strong>先捏一个角色</strong>
        <LookChooser
          value={appearance}
          onChange={onAppearance}
          footer={(step, goTo) => (
            <div className="hint-actions">
              {dismissable && <button onClick={onDone}>取消</button>}
              {step === "color" ? (
                <button className="primary" onClick={() => goTo("accessory")}>下一步：选配件</button>
              ) : (
                <>
                  <button onClick={() => goTo("color")}>上一步</button>
                  <button className="primary" onClick={() => setConfirmed(true)}>确认，去选工位</button>
                </>
              )}
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="seat-picker-hint" role="dialog" aria-label="选择工位">
      <strong>点击场景里你想坐的椅子</strong>
      <p>
        工位选定后就是你的，别人无法再占用，你的共享画面也会显示在这张桌子上。
      </p>
      {failed && <p className="pick-error">{failed}</p>}
      <div className="hint-actions">
        <button onClick={() => setConfirmed(false)}>换角色</button>
        {dismissable && <button onClick={onDone}>取消选座</button>}
      </div>
    </div>
  );
}
