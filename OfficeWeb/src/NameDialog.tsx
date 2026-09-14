// A small modal that asks for (or changes) the player's permanent name. Used on
// a first visit without a way to dismiss it, and again from the bottom bar to
// rename. The name is stored in localStorage and sent to the server, so it
// survives reloads and lets colleagues tell people apart.
import { useState } from "react";

interface Props {
  title: string;
  subtitle?: string;
  initial: string;
  /** Return false to keep the dialog open (e.g. an empty name). */
  onSave: (name: string) => boolean;
  onCancel?: () => void;
}

export default function NameDialog({
  title,
  subtitle,
  initial,
  onSave,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="modal">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return setError("名字不能为空");
            if (!onSave(value)) setError("保存失败，请重试");
          }}
        >
          <input
            className="name-input"
            autoFocus
            value={value}
            maxLength={24}
            placeholder="你的名字（永久保存）"
            aria-label="你的名字"
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
          />
          {error && <p className="pick-error">{error}</p>}
          <div className="actions">
            {onCancel && (
              <button type="button" onClick={onCancel}>
                取消
              </button>
            )}
            <button className="primary" type="submit" disabled={!value.trim()}>
              保存
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
