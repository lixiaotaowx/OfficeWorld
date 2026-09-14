// First-visit seat picker. It is a floating hint rather than a blocking modal,
// in two steps: pick a character and confirm, then click a real chair in the
// 3D scene to claim a desk. Clicking a chair is the only way to take one; the
// desk then belongs to that player until they explicitly re-pick.
import { useState } from "react";
import {
  CHARACTERS_BY_GENDER,
  getCharacter,
  type CharacterId,
  type Gender,
} from "./characters";

interface Props {
  /** Which avatar the player wears; they choose it here on a first visit. */
  character: CharacterId;
  onCharacter: (id: CharacterId) => void;
  /** Error from the last failed claim, shown until the next pick. */
  failed: string;
  onDone: () => void;
  /** False on a first visit, where there is nothing sensible to go back to. */
  dismissable: boolean;
}

export default function SeatPicker({
  character,
  onCharacter,
  failed,
  onDone,
  dismissable,
}: Props) {
  const current = getCharacter(character);
  const [gender, setGender] = useState<Gender>(current.gender);
  // Step 1 is "choose a character"; confirming moves to step 2, where a chair
  // click claims the desk.
  const [confirmed, setConfirmed] = useState(false);
  const list = CHARACTERS_BY_GENDER[gender];

  if (!confirmed) {
    return (
      <div className="seat-picker-hint" role="dialog" aria-label="选择角色">
        <strong>先选一个角色</strong>
        <div className="character-picker" role="group" aria-label="选择角色">
          <div className="gender-tabs" role="tablist" aria-label="选择性别">
            <button
              role="tab"
              aria-selected={gender === "woman"}
              className={gender === "woman" ? "chosen" : ""}
              onClick={() => setGender("woman")}
            >
              女角色
            </button>
            <button
              role="tab"
              aria-selected={gender === "man"}
              className={gender === "man" ? "chosen" : ""}
              onClick={() => setGender("man")}
            >
              男角色
            </button>
          </div>
          <div className="character-grid" role="listbox" aria-label="选择外观">
            {list.map((c) => (
              <button
                key={c.id}
                role="option"
                aria-selected={character === c.id}
                className={character === c.id ? "chosen" : ""}
                onClick={() => onCharacter(c.id)}
                title={c.label}
              >
                <img src={c.thumb} alt={c.label} loading="lazy" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="hint-actions">
          {dismissable && <button onClick={onDone}>取消</button>}
          <button
            className="primary"
            onClick={() => setConfirmed(true)}
          >
            确认
          </button>
        </div>
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
