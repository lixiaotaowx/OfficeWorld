import { useEffect, useRef, useState } from "react";
import { restoreLogin } from './restoreLogin';
import App from "./App";
import SpaceArtwork from "./SpaceArtwork";
import "./styles.css";
import "./account.css";

export type Role = "employee" | "visitor";
export interface Account { id: string; name: string; character: string; role?: Role | "" }

/** Asked once on the way in: a colleague, or somebody visiting the office. */
function RoleChoice({ busy, error, choose }: {
  busy: boolean; error: string; choose: (role: Role) => void;
}) {
  return <main className="account-page role-page">
    <section className="role-card">
      <span className="eyebrow">WHO IS COMING IN</span>
      <h2>你是哪一位？</h2>
      <p>成员进工位办公；访客直接到公共区就坐。两种身份都能开会、私聊、语音与共享屏幕。</p>
      <div className="role-options">
        <button type="button" className="role-option" disabled={busy} onClick={() => choose("employee")}>
          <strong>iruler 成员</strong>
          <small>使用自己的专属工位，并广播工位小屏幕预览</small>
        </button>
        <button type="button" className="role-option" onClick={() => choose("visitor")} disabled={busy}>
          <strong>访问人（客户）</strong>
          <small>在公共区沙发就坐，不广播小屏幕预览</small>
        </button>
      </div>
      {error && <p className="account-error" role="alert">{error}</p>}
      <small className="role-note">身份会记住，之后可由管理员调整。</small>
    </section>
  </main>;
}

export default function AccountGate() {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [roleBusy, setRoleBusy] = useState(false);
  const stopRestore = useRef<() => void>();
  /** Chosen once, on the way in; the server remembers it from then on. */
  async function chooseRole(role: Role) {
    if (!user || roleBusy) return;
    setRoleBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/role", { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const data = await response.json();
      if (!response.ok) throw Error(data?.error || "身份未保存，请重试");
      setUser(data.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "身份未保存，请重试");
    } finally { setRoleBusy(false); }
  }
  useEffect(() => {
    const ended = async (event: Event) => {
      stopRestore.current?.();
      const detail = (event as CustomEvent<{ message?: string; forget?: boolean }>).detail || {};
      if (detail.forget === true) {
        // Only a deliberate exit forgets the account (see logout below).
        await window.officeDesktop?.clearLogin().catch(() => {});
        setPassword("");
      } else {
        // Displaced by another device, an expired session or a revoked cookie: keep the
        // saved account and hand the form back already filled in, so coming back is one
        // click instead of retyping. Clearing it here is what made the desktop app look
        // like it never remembered anything (user, 2026-09-15).
        const saved = await window.officeDesktop?.readLogin().catch(() => null);
        if (saved) { setName(saved.name); setPassword(saved.password); }
      }
      setUser(null); setMode("login");
      setError(window.officeDesktop ? "" : detail.message || "登录已失效，请重新登录");
    };
    const onEnded = (event: Event) => { void ended(event); };
    window.addEventListener("office-session-ended", onEnded);
    return () => window.removeEventListener("office-session-ended", onEnded);
  }, []);
  useEffect(() => {
    stopRestore.current = restoreLogin<Account>({ user: setUser, loading: setLoading, error: setError,
      credentials: saved => { setName(saved.name); setPassword(saved.password); } });
    return () => stopRestore.current?.();
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    stopRestore.current?.();
    try {
      // Remember the user's input even if the network or authentication fails. A machine
      // that cannot encrypt the file still gets to log in - refusing here would lock
      // somebody out of their own account (user, 2026-09-15).
      if (window.officeDesktop) await window.officeDesktop.saveLogin({ name, password }).catch(() => false);
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "暂时无法登录");
      await window.officeDesktop?.saveLogin({ name: data.user.name, password }).catch(() => {});
      setName(data.user.name); setUser(data.user);
    } catch (e) { setError(e instanceof Error ? e.message : "连接失败，请重试"); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok) throw Error();
      stopRestore.current?.();
      // An explicit exit clears the saved desktop login too, and the password is
      // never written back into the form; only the name stays as a convenience.
      await window.officeDesktop?.clearLogin().catch(() => {});
      setName(user?.name ?? name);
      setPassword("");
      setUser(null); setMode("login"); setError("");
    } catch { window.alert("退出失败，请检查连接后重试"); }
    finally { setBusy(false); }
  }
  if (user && !user.role) return <RoleChoice busy={roleBusy} error={error} choose={chooseRole} />;
  if (user) return <App account={user} onLogout={() => void logout()} />;
  return <main className="account-page">
    <section className="account-intro">
      <div className="account-brand"><span className="brand-mark">o<span>·</span></span><span>OFFICE WORLD<small>一起在场</small></span></div>
      <div className="intro-copy"><span className="eyebrow">LESS DISTANCE. MORE POSSIBILITY.</span>
      <div className="account-manifesto" aria-hidden="true">Good work.<br /><em>Great company.</em></div>
      <h1>让工作，<br />有个好地方。</h1>
      <p>回到熟悉的工位，和同事打个招呼。<br />屏幕、声音与灵感，在这里相遇。</p>
      </div>
      <SpaceArtwork />
      <div className="account-space"><span>01 / THE COMMON GROUND</span><strong>各自专注。一起在场。<span aria-hidden="true">↗</span></strong><small>专属工位 / 屏幕共享 / 随时交流</small></div>
    </section>
    <form className="account-card" onSubmit={submit}>
      <span className="eyebrow">MAKE ROOM FOR GOOD WORK</span>
      <h2>{loading ? "正在恢复登录…" : mode === "login" ? "欢迎回来" : "认识一下"}</h2>
      <p>{mode === "login" ? "用姓名和密码回到办公室。" : "注册后，选择你的角色和专属工位。"}</p>
      <div className="account-tabs">
        <button type="button" aria-pressed={mode === "login"} onClick={() => { setMode("login"); setError(""); }}>登录</button>
        <button type="button" aria-pressed={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>注册</button>
      </div>
      <label>姓名<input autoComplete="username" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={24} required placeholder="同事认识你的名字" /></label>
      <label>密码<input type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} minLength={1} maxLength={16} required placeholder="输入密码（1–16 个字符）" /></label>
      <p className="account-error" role="alert">{error}</p>
      <button className="primary account-submit" disabled={busy || loading}>{busy ? "请稍候…" : mode === "login" ? "进入办公室 →" : "注册并进入 →"}</button>
      <small>姓名作为登录名；同名可加团队简称区分。<br />{window.officeDesktop ? "默认记住账号和密码，下次启动自动登录。" : "登录状态保留 30 天，公共电脑用完请退出。"}</small>
    </form>
  </main>;
}
