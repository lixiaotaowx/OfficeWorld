// Administrator panel: type the password, then free any permanently held desk.
// The password is sent with every kick so the panel is stateless; a wrong
// password simply surfaces an error without doing anything.
import { useState } from "react";
import { WORKSTATIONS } from "./seats";
import type { SeatOwner } from "./types";

interface KickReply {
  ok: boolean;
  name?: string;
  error?: string;
}

interface Props {
  seats: (SeatOwner | null)[];
  onKick: (seat: number, password: string) => Promise<KickReply>;
  onClose: () => void;
}

export default function AdminDialog({ seats, onKick, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function kick(seat: number) {
    setBusy(seat);
    setError("");
    setNotice("");
    const reply = await onKick(seat, password);
    setBusy(null);
    if (reply.ok) {
      setNotice(`已请出「${reply.name}」（${WORKSTATIONS[seat]?.label}），他已离开空间`);
    } else {
      setError(reply.error || "请出失败");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="管理员">
      <section className="modal admin-modal">
        <h2>管理员</h2>
        <p>输入管理员密码后，可以把工位上的人「请出」：他会立刻离开空间（需要重新登录），工位同时变成空闲。</p>
        <label className="admin-password">
          <span>管理员密码（iruler 成员通用密码）</span>
          <input
            type="password"
            value={password}
            placeholder="请输入密码"
            aria-label="管理员密码（iruler 成员通用密码）"
            autoFocus
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </label>
        {error && <p className="pick-error">{error}</p>}
        {notice && <p className="admin-ok">{notice}</p>}
        <div className="admin-list">
          {WORKSTATIONS.map((w) => {
            const owner = seats[w.index];
            return (
              <div className="admin-row" key={w.index}>
                <span className="seat-num">{w.label}</span>
                <strong>{owner?.name || "空闲工位"}</strong>
                <small>{owner ? (owner.online ? "在线" : "离线") : ""}</small>
                <button
                  className="danger"
                  disabled={!owner || busy !== null}
                  onClick={() => void kick(w.index)}
                >
                  {busy === w.index ? "…" : "请出"}
                </button>
              </div>
            );
          })}
        </div>
        <div className="actions">
          <button onClick={onClose}>关闭</button>
        </div>
      </section>
    </div>
  );
}
