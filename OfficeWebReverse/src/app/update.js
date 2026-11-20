import { Pi as formatByteCount, ll as getDownloadPercent, mr as parseVersionParts, qn as safeUpdateUrl } from './standalone.js';
import { j as jsxRuntime, v as DownloadIcon, r as React } from '../chunks/dockGreeting.js';
function compareVersions(i, e) {
  const t = parseVersionParts(i),
    n = parseVersionParts(e);
  for (let s = 0; s < Math.max(t.length, n.length); s++) {
    const r = (t[s] ?? 0) - (n[s] ?? 0);
    if (r) return r < 0 ? -1 : 1;
  }
  return 0;
}
function isNewerVersion(i, e) {
  return compareVersions(i, e) > 0;
}
const UPDATE_MANIFEST_PATH = "/download/latest.json";
function resolveUpdateManifestUrl(i, e) {
  return safeUpdateUrl(i, e) ?? safeUpdateUrl(UPDATE_MANIFEST_PATH, e) ?? new URL(UPDATE_MANIFEST_PATH, e).href;
}
const UPDATE_RETRY_DELAYS = [3e4, 2 * 6e4, 10 * 6e4, 30 * 6e4];
function getUpdatePollDelay(i) {
  return i <= 0 ? UPDATE_POLL_INTERVAL : UPDATE_RETRY_DELAYS[Math.min(i, UPDATE_RETRY_DELAYS.length) - 1];
}
const UPDATE_POLL_INTERVAL = 6 * 60 * 60 * 1e3,
  SKIPPED_VERSION_KEY = "officeworld-update-skipped";
function getSkippedVersion() {
  try {
    return localStorage.getItem(SKIPPED_VERSION_KEY) || "";
  } catch {
    return "";
  }
}
function useDesktopUpdate() {
  const [i, e] = React.useState(null),
    [t, n] = React.useState(),
    [s, r] = React.useState("unavailable"),
    [a, o] = React.useState({
      received: 0,
      total: 0,
      percent: null
    }),
    [c, d] = React.useState(),
    l = React.useRef(),
    u = React.useRef(!1),
    h = React.useRef(!1),
    m = React.useRef(void 0),
    f = typeof window > "u" ? void 0 : window.officeDesktop;
  React.useEffect(() => {
    var D, C;
    let E = !0;
    Promise.resolve((D = f == null ? void 0 : f.appVersion) == null ? void 0 : D.call(f)).then(M => {
      E && typeof M == "string" && M && n(M);
    }).catch(() => {});
    const x = (C = f == null ? void 0 : f.onUpdateProgress) == null ? void 0 : C.call(f, M => {
      const g = Number(M == null ? void 0 : M.received) || 0,
        T = Number(M == null ? void 0 : M.total) || 0;
      o({
        received: g,
        total: T,
        percent: getDownloadPercent(g, T)
      });
    });
    return () => {
      E = !1, x == null || x();
    };
  }, [f]), React.useEffect(() => {
    const E = resolveUpdateManifestUrl("/download/latest.json", location.origin);
    let x = !0,
      D = 0,
      C;
    const M = () => {
        x && (clearTimeout(C), C = setTimeout(() => void g(), getUpdatePollDelay(D)));
      },
      g = async () => {
        var A;
        if (u.current || h.current) {
          M();
          return;
        }
        try {
          const F = new URL(E);
          F.searchParams.set("t", String(Date.now()));
          const H = await fetch(F.href, {
            cache: "no-store"
          });
          if (!H.ok) throw Error("HTTP " + H.status);
          const N = await H.json(),
            Q = N != null && N.version && N != null && N.url ? safeUpdateUrl(N.url, location.origin) : null;
          if (!Q) throw Error("Bad manifest");
          D = 0;
          try {
            (A = f == null ? void 0 : f.updateChecked) == null || A.call(f, String(N.version));
          } catch {}
          if (!x || u.current || h.current) return;
          e({
            ...N,
            url: Q
          }), r(getSkippedVersion() === N.version ? "skipped" : "available");
        } catch {
          D += 1, x && !u.current && !h.current && r(F => F === "available" ? F : "unavailable");
        } finally {
          M();
        }
      };
    g();
    const T = () => {
      D > 0 && navigator.onLine !== !1 && g();
    };
    return window.addEventListener("online", T), () => {
      x = !1, clearTimeout(C), window.removeEventListener("online", T);
    };
  }, []);
  const p = React.useCallback(async () => {
      var x, D;
      if (!i || u.current || h.current) return;
      if (d(void 0), l.current) {
        await ((x = m.current) == null ? void 0 : x.call(m));
        return;
      }
      const E = new URL(i.url, location.origin).href;
      if (!(f != null && f.downloadUpdate) || !(f != null && f.installUpdate)) {
        window.open(E, "_blank", "noopener"), r("browser");
        return;
      }
      r("downloading"), u.current = !0, o({
        received: 0,
        total: 0,
        percent: null
      });
      try {
        const C = await f.downloadUpdate(E, i.sha256);
        if (!(C != null && C.ok) || !C.file) throw Error("下载没有完成，请重试");
        l.current = C.file, await ((D = m.current) == null ? void 0 : D.call(m));
      } catch (C) {
        r("failed"), d(C instanceof Error ? C.message : "下载失败了，等一下再试");
      } finally {
        u.current = !1;
      }
    }, [f, i]),
    _ = React.useCallback(async () => {
      if (!(!l.current || !(f != null && f.installUpdate) || h.current)) {
        h.current = !0, d(void 0), r("installing");
        try {
          const E = await f.installUpdate(l.current);
          if (!(E != null && E.ok)) throw Error("安装程序启动不了，请重试");
        } catch (E) {
          r("failed"), h.current = !1, l.current = void 0, d(E instanceof Error ? E.message : "安装程序启动不了");
        }
      }
    }, [f]);
  m.current = _;
  const w = React.useCallback(async () => {
      if (!(!l.current || !(f != null && f.revealUpdate))) try {
        await f.revealUpdate(l.current);
      } catch {}
    }, [f]),
    k = React.useCallback(async () => {
      if (!i) return;
      const E = new URL(i.url, location.origin).href;
      try {
        await navigator.clipboard.writeText(E);
      } catch {
        window.prompt("复制下载链接", E);
      }
    }, [i]),
    P = React.useCallback(() => {
      if (!(u.current || h.current)) {
        if (i != null && i.version) try {
          localStorage.setItem(SKIPPED_VERSION_KEY, i.version);
        } catch {}
        r("skipped");
      }
    }, [i]),
    y = i && t && !isNewerVersion(i.version, t) ? "current" : s,
    S = s === "failed" ? {
      title: "更新未完成",
      detail: c || "等一下再试",
      action: "重试更新",
      automatic: !!(f != null && f.downloadUpdate && f != null && f.installUpdate),
      secondary: void 0,
      hint: void 0
    } : getUpdatePromptCopy(i, t, y, !!(f != null && f.downloadUpdate && f != null && f.installUpdate));
  return {
    copy: y === "skipped" || y === "current" ? null : S,
    currentVersion: t,
    stage: y,
    percent: a.percent,
    received: a.received,
    total: a.total,
    error: c,
    autoInstall: y === "ready",
    start: p,
    install: _,
    reveal: w,
    copyLink: k,
    later: P
  };
}
function formatUpdateProgress(i) {
  return i.percent === null ? formatByteCount(i.received) : i.total ? `${formatByteCount(i.received)} / ${formatByteCount(i.total)}` : `${i.percent}%`;
}
function getUpdatePromptCopy(i, e, t, n = !!e) {
  if (!(i != null && i.version) || !["available", "downloading", "ready", "installing", "browser"].includes(t)) return null;
  const r = i.file || i.url.split("/").pop() || "",
    a = formatByteCount(i.size),
    o = [e ? `现在是 ${e}` : "这个客户端不能自动更新", a, i.notes].filter(Boolean);
  if (t === "browser") return {
    title: `正在下载安装包 ${i.version}`,
    detail: "下载好后，到“下载”文件夹里打开安装包。",
    action: "重新下载",
    secondary: "复制下载链接",
    automatic: !1,
    hint: `${r}${a ? "(" + a + ")" : ""}`
  };
  const c = t === "downloading" ? "下载中…" : t === "ready" ? "下载好了，正在准备安装…" : t === "installing" ? "正在安装，应用将退出并在完成后重新打开…" : n ? "点击后自动下载安装，完成后重新打开应用" : "";
  return {
    title: `有新版本：${i.version}`,
    detail: [...o, c].filter(Boolean).join(" · "),
    action: t === "downloading" ? "正在下载…" : t === "installing" ? "正在安装…" : t === "ready" ? "现在安装" : n ? "立即更新" : "下载安装包",
    secondary: t === "ready" ? "打开文件夹" : void 0,
    automatic: n
  };
}
;
function UpdatePrompt({
  update: i
}) {
  if (!i.copy) return null;
  const {
      title: e,
      detail: t,
      action: n,
      automatic: s,
      secondary: r,
      hint: a
    } = i.copy,
    o = i.stage === "downloading" || i.stage === "installing",
    c = i.stage === "ready";
  return jsxRuntime.jsxs("section", {
    className: `update-prompt ${i.stage}`,
    role: "alert",
    "aria-live": "polite",
    children: [jsxRuntime.jsx("div", {
      className: "update-icon",
      children: jsxRuntime.jsx(DownloadIcon, {})
    }), jsxRuntime.jsxs("div", {
      className: "update-body",
      children: [jsxRuntime.jsx("strong", {
        className: "update-title",
        children: e
      }), jsxRuntime.jsx("small", {
        className: "update-detail",
        children: t
      }), i.stage === "downloading" && jsxRuntime.jsx("div", {
        className: "update-bar",
        role: "progressbar",
        "aria-label": "下载进度",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": i.percent ?? void 0,
        children: jsxRuntime.jsx("div", {
          className: "update-bar-fill",
          style: {
            width: `${i.percent ?? 0}%`
          }
        })
      }), i.stage === "downloading" && jsxRuntime.jsx("small", {
        className: "update-bytes",
        children: formatUpdateProgress(i)
      }), jsxRuntime.jsxs("div", {
        className: "update-actions",
        children: [jsxRuntime.jsxs("button", {
          type: "button",
          className: "primary",
          disabled: o,
          onClick: () => void (c ? i.install() : i.start()),
          children: [jsxRuntime.jsx(DownloadIcon, {}), n]
        }), r && jsxRuntime.jsx("button", {
          type: "button",
          disabled: o,
          onClick: () => void (c ? i.reveal() : i.copyLink()),
          children: r
        }), jsxRuntime.jsx("button", {
          type: "button",
          onClick: i.later,
          disabled: o,
          children: c ? "以后再装" : "以后再说"
        })]
      }), a && jsxRuntime.jsx("small", {
        className: "update-hint",
        children: a
      }), !s && !a && jsxRuntime.jsx("small", {
        className: "update-hint",
        children: "这个客户端不能自动更新，请手动下载安装。"
      })]
    })]
  });
}
;
export { compareVersions, formatUpdateProgress, getUpdatePollDelay, getUpdatePromptCopy, resolveUpdateManifestUrl, UpdatePrompt, useDesktopUpdate };
