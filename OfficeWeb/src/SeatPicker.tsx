// First-visit seat picker. Choosing a desk here is the only way to take one:
// picking it claims it on the server, and from then on it belongs to that
// player until they explicitly re-pick from the settings panel.
import { useState } from "react";
import { WORKSTATIONS } from "./seats";
import type { CharacterKind } from "./characterModel";
import type { Person } from "./types";

interface Props {
  people: Person[];
  myId: string;
  /** Which avatar the player wears; they choose it here on a first visit. */
  character: CharacterKind;
  onCharacter: (kind: CharacterKind) => void;
  /** Claims the desk; resolves false when somebody else got there first. */
  onPick: (seat: number) => Promise<boolean>;
  onDone: () => void;
  /** False on a first visit, where there is nothing sensible to go back to. */
  dismissable: boolean;
}

export default function SeatPicker({
  people,
  myId,
  character,
  onCharacter,
  onPick,
  onDone,
  dismissable,
}: Props) {
  const [busy, setBusy] = useState<number | null>(null);
  const [failed, setFailed] = useState("");

  return (
    <div className="modal-backdrop">
      <section className="modal seat-picker">
        <h2>先选个角色，再选一个工位</h2>
        <p>
          工位选定后就是你的，别人无法再占用，你的共享画面也会显示在这张桌子上。
        </p>
        <div className="character-picker" role="group" aria-label="选择角色">
          {(["woman", "man"] as CharacterKind[]).map((kind) => (
            <button
              key={kind}
              className={character === kind ? "chosen" : ""}
              aria-pressed={character === kind}
              onClick={() => onCharacter(kind)}
            >
              {kind === "woman" ? "女角色" : "男角色"}
            </button>
          ))}
        </div>
        <div className="seat-picker-grid">
          {WORKSTATIONS.map((workstation) => {
            const taken = people.find((p) => p.seat === workstation.index);
            const mine = taken?.id === myId;
            const free = !taken;
            return (
              <button
                key={workstation.index}
                className={mine ? "mine" : ""}
                disabled={!free || busy !== null}
                onClick={async () => {
                  setBusy(workstation.index);
                  setFailed("");
                  const ok = await onPick(workstation.index);
                  setBusy(null);
                  if (ok) onDone();
                  else setFailed("这个工位刚刚被别人占用了，换一个吧。");
                }}
              >
                <span className="pick-label">{workstation.label}</span>
                <strong>
                  {taken ? (mine ? "你的工位" : taken.name) : "空闲"}
                </strong>
                <small>
                  {busy === workstation.index
                    ? "占用中…"
                    : taken
                      ? mine
                        ? "已属于你"
                        : "已被占用"
                      : "可以选"}
                </small>
              </button>
            );
          })}
        </div>
        {failed && <p className="pick-error">{failed}</p>}
        {dismissable && (
          <div className="actions">
            <button onClick={onDone}>先不选</button>
          </div>
        )}
      </section>
    </div>
  );
}
