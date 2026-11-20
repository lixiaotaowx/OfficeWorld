import {
  o as Hf
} from "./chatLocal.js";
import { React as gr, JsxRuntime as X } from "../vendor/react.js";
function Kf(p) {
  return p && p.__esModule && Object.prototype.hasOwnProperty.call(p, "default") ? p.default : p
}
const Wf = "modulepreload",
  Qf = function(p) {
    return "/" + p
  },
  Pa = {},
  dd = function(S, f, R) {
    let E = Promise.resolve();
    if (f && f.length > 0) {
      document.getElementsByTagName("link");
      const F = document.querySelector("meta[property=csp-nonce]"),
        O = (F == null ? void 0 : F.nonce) || (F == null ? void 0 : F.getAttribute("nonce"));
      E = Promise.allSettled(f.map(M => {
        if (M = Qf(M), M in Pa) return;
        Pa[M] = !0;
        const A = M.endsWith(".css"),
          ae = A ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${M}"]${ae}`)) return;
        const V = document.createElement("link");
        if (V.rel = A ? "stylesheet" : Wf, A || (V.as = "script"), V.crossOrigin = "", V.href = M, O && V.setAttribute("nonce", O), document.head.appendChild(V), A) return new Promise((q, Le) => {
          V.addEventListener("load", q), V.addEventListener("error", () => Le(new Error(`Unable to preload CSS for ${M}`)))
        })
      }))
    }

    function z(F) {
      const O = new Event("vite:preloadError", {
        cancelable: !0
      });
      if (O.payload = F, window.dispatchEvent(O), !O.defaultPrevented) throw F
    }
    return E.then(F => {
      for (const O of F || []) O.status === "rejected" && z(O.reason);
      return S().catch(z)
    })
  };

import { hydrateEntry as bf, createRootEntry as $a } from '../vendor/react-dom.js';

var ed = bf();
const pd = Kf(ed),
  td = 16;

function md(p, S) {
  const f = S && typeof S == "object" ? S : nd;
  return Array.isArray(f.people) ? f.connected === !1 && f.hidden !== !0 && f.people.length === 0 && p.people.length > 0 ? {
    ...f,
    people: p.people,
    missed: p.missed
  } : f : p
}
const nd = {
  people: [],
  sharing: !1,
  missed: 0,
  hidden: !1
};

function hd(p) {
  const S = (p == null ? void 0 : p.light) === !0,
    f = S ? "0, 0, 0" : "255, 255, 255",
    R = "transparent",
    E = (p == null ? void 0 : p.transparent) === !1 ? .04 : 0,
    z = (S ? .05 : .04) + E,
    F = /^#[0-9a-f]{6}$/i.test((p == null ? void 0 : p.accent) || "") ? String(p.accent).toLowerCase() : "",
    O = p != null && p.tinted && F ? rd(F, S ? .4 : .5) : `rgba(${f}, ${(S?.12:.14)+E})`;
  return {
    background: `rgba(${f}, ${z})`,
    backgroundHover: `rgba(${f}, ${z+.02})`,
    chip: R,
    border: O,
    shadow: S ? "0 6px 18px rgba(0, 0, 0, .16)" : "0 6px 18px rgba(0, 0, 0, .32)"
  }
}

function rd(p, S) {
  const f = /^#?([0-9a-f]{6})$/i.exec(String(p || ""));
  if (!f) return `rgba(255, 255, 255, ${S})`;
  const R = Number.parseInt(f[1], 16);
  return `rgba(${R>>>16&255}, ${R>>>8&255}, ${R&255}, ${S})`
}
const ld = 3600,
  Fa = 2e3,
  ud = 1500,
  vd = 2e3;

function yd(p, S, f) {
  const E = !p || p.id !== S || f - p.last > ud ? f : p.since,
    z = f - E;
  return {
    dwell: {
      id: S,
      since: E,
      last: f
    },
    watching: z >= Fa,
    waitMs: Math.max(0, Fa - z)
  }
}

function gd(p, S) {
  return !!p && S - p.at < ld
}

function wd(p) {
  const S = p.missed || new Set,
    f = p.unread || {},
    R = (p.people || []).filter(E => E && E.id).map(E => {
      var z;
      return {
        id: E.id,
        account: E.clientId,
        name: E.name || "Colleague",
        character: "look:" + JSON.stringify({
          ...E.appearance,
          autoExpression: E.autoExpression
        }),
        appearance: E.appearance,
        atDesk: E.atDesk !== !1,
        sharing: E.sharing === !0,
        inCall: E.inCall === !0 || E.meeting === !0,
        hasPreview: E.role !== "visitor",
        role: E.role,
        unread: Math.max(0, Number(f[E.id]) || 0),
        missed: S.has(E.id),
        self: E.id === p.myId,
        away: (z = p.away) == null ? void 0 : z[E.id]
      }
    }).sort((E, z) => Number(z.self) - Number(E.self) || Number(z.missed) - Number(E.missed) || z.unread - E.unread || Number(z.sharing) - Number(E.sharing) || Number(z.atDesk) - Number(E.atDesk) || E.name.localeCompare(z.name, "en"));
  return {
    people: R.slice(0, p.max ?? td),
    sharing: p.sharing === !0,
    missed: R.filter(E => E.missed).length,
    hidden: p.hidden === !0,
    connected: p.connected !== !1,
    transfers: (p.transfers || []).slice(0, 8)
  }
}
const kd = "public",
  Ba = "office-chat-media-v1";

function Sd(p, S = () => {}) {
  return new Promise((f, R) => {
    const E = new BroadcastChannel(Ba),
      z = crypto.randomUUID();
    let F;
    const O = (A, ae) => {
        clearTimeout(F), E.close(), A ? R(Error(A)) : f(ae)
      },
      M = () => {
        clearTimeout(F), F = setTimeout(() => O("聊天附件连接超时，请刷新主窗口后重试"), 45e3)
      };
    E.onmessage = ({
      data: A
    }) => {
      (A == null ? void 0 : A.id) !== z || A.account !== p.account || (A.kind === "progress" && (M(), S(A.percent)), A.kind === "result" && O(A.error, A.blob))
    }, M();
    try {
      E.postMessage({
        ...p,
        id: z
      })
    } catch {
      O("附件未能读取，请重新选择文件")
    }
  })
}

function Ed(p, S) {
  const f = new BroadcastChannel(Ba);
  let R = !1;
  const E = z => {
    R || f.postMessage(z)
  };
  return f.onmessage = async ({
    data: z
  }) => {
    if ((z == null ? void 0 : z.account) !== p || !["upload", "load", "view", "open", "reveal"].includes(z.kind) || typeof z.id != "string") return;
    const F = M => E({
        id: z.id,
        account: p,
        kind: "progress",
        percent: M
      }),
      O = setInterval(() => F(-1), 1e4);
    try {
      const M = await S(z, F);
      E({
        id: z.id,
        account: p,
        kind: "result",
        blob: M
      })
    } catch (M) {
      E({
        id: z.id,
        account: p,
        kind: "result",
        error: M instanceof Error ? M.message : "附件处理失败，请重试"
      })
    } finally {
      clearInterval(O)
    }
  }, () => {
    R = !0, f.close()
  }
}
const Cd = p => /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(p);
var _d = $a();
const Va = p => `office-chat-local:${p}`;

function To(p) {
  try {
    return JSON.parse(localStorage.getItem(Va(p)) || "{}")
  } catch {
    return {}
  }
}

function od(p, S, f) {
  const R = To(p);
  R[S] = {
    ...R[S],
    ...f
  }, localStorage.setItem(Va(p), JSON.stringify(R)), window.dispatchEvent(new Event("office-chat-local"))
}

function xd(p) {
  const [S, f] = gr.useState(() => To(p));
  return gr.useEffect(() => {
    const R = () => f(To(p));
    return R(), window.addEventListener("storage", R), window.addEventListener("office-chat-local", R), () => {
      window.removeEventListener("storage", R), window.removeEventListener("office-chat-local", R)
    }
  }, [p]), S
}
async function Nd(p, S, f) {
  const R = await Hf(p);
  try {
    od(p, S, {
      deletedThrough: f
    }), await new Promise((E, z) => {
      const F = R.transaction(["messages", "files"], "readwrite"),
        O = F.objectStore("messages").openCursor();
      O.onsuccess = () => {
        var V;
        const M = O.result;
        if (!M) return;
        const A = M.value;
        (A.recipientId ? A.senderId === p ? A.recipientId : A.senderId : "public") === S && A.time <= f && (M.delete(), (V = A.attachment) != null && V.id && F.objectStore("files").delete(A.attachment.id)), M.continue()
      }, F.oncomplete = () => E(), F.onerror = F.onabort = () => z(F.error)
    })
  } finally {
    R.close()
  }
}
const Pd = 60,
  Ua = .008,
  id = 4;

function Ld(p) {
  const S = Number(p);
  return !Number.isFinite(S) || S <= Ua ? 0 : wr(Math.sqrt((S - Ua) * id))
}

function zd(p, S, f = .16) {
  const R = wr(p),
    E = wr(S);
  return E >= R ? E : wr(R + (E - R) * f)
}
const sd = .04;

function Td(p, S) {
  if (!S) return 0;
  const f = wr(Number(p) || 0);
  return f < sd ? 0 : Math.round(f * 100) / 100
}

function Rd(p) {
  let S = 0;
  for (const f of p) {
    const R = (f - 128) / 128;
    S += R * R
  }
  return Math.sqrt(S / p.length)
}

function wr(p) {
  return Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0
}

function ad(p, S, f) {
  const [R, E] = gr.useState(1);
  return gr.useEffect(() => {
    E(1)
  }, [S, f]), gr.useEffect(() => {
    const z = p.current;
    if (!S || !z) return;
    const F = O => {
      if (O.buttons || O.target.closest("button, .screen-stage-bar")) return;
      O.preventDefault();
      const M = O.deltaY * (O.deltaMode === 1 ? 16 : O.deltaMode === 2 ? innerHeight : 1);
      E(A => Math.max(1, Math.min(4, A * Math.exp(-M * .0015))))
    };
    return z.addEventListener("wheel", F, {
      passive: !1
    }), () => z.removeEventListener("wheel", F)
  }, [p, S, f]), [R, E]
}

function Md(p, S, f) {
  return ad(p, S, f)[0]
}
const Ha = ["#e0524a", "#e8a33d", "#f0d274", "#5fb96a", "#4a9fd8", "#b46fd0", "#f4f2eb"],
  Aa = {
    "#e0524a": "朱红",
    "#e8a33d": "琥珀",
    "#f0d274": "浅黄",
    "#5fb96a": "草绿",
    "#4a9fd8": "天蓝",
    "#b46fd0": "淡紫",
    "#f4f2eb": "象牙白"
  },
  Dd = "#f0d274";

function Id(p, S) {
  const f = typeof p == "string" ? p.trim().toLowerCase() : "";
  return Ha.includes(f) ? f : S
}

function cd({
  value: p,
  onPick: S
}) {
  return X.jsx("span", {
    className: "screen-stage-inks",
    role: "group",
    "aria-label": "画笔颜色",
    children: Ha.map(f => X.jsx("button", {
      type: "button",
      className: "screen-stage-ink-swatch",
      style: {
        background: f
      },
      "aria-label": `使用${Aa[f]||f}画笔`,
      "aria-pressed": p === f,
      title: `使用${Aa[f]||f}画笔`,
      onClick: () => S(f)
    }, f))
  })
}

function Od({
  enabled: p,
  own: S = !1,
  active: f,
  color: R,
  onToggle: E,
  onColor: z,
  onUndo: F,
  onClear: O
}) {
  return S ? X.jsx("button", {
    type: "button",
    title: "清掉所有人在共享屏幕上的标注",
    onClick: O,
    children: "清掉标注"
  }) : p ? X.jsxs(X.Fragment, {
    children: [X.jsx("button", {
      type: "button",
      "aria-pressed": f,
      title: "在共享的屏幕上标注",
      onClick: E,
      children: "标注"
    }), f && X.jsxs(X.Fragment, {
      children: [X.jsx(cd, {
        value: R,
        onPick: z
      }), X.jsx("button", {
        type: "button",
        title: "撤销我画的最后一笔",
        onClick: F,
        children: "撤销"
      }), X.jsx("button", {
        type: "button",
        title: "清掉所有人的标注",
        onClick: O,
        children: "清空"
      })]
    })]
  }) : null
}

function jd(p) {
  return X.jsxs(un, {
    ...p,
    children: [X.jsx("rect", {
      x: "9",
      y: "3",
      width: "6",
      height: "12",
      rx: "3"
    }), X.jsx("path", {
      d: "M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"
    })]
  })
}

function Fd(p) {
  return X.jsxs(un, {
    ...p,
    children: [X.jsx("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "13",
      rx: "2"
    }), X.jsx("path", {
      d: "M12 17v4m-4 0h8M9 10l3-3 3 3m-3-3v7"
    })]
  })
}

function Ud(p) {
  return X.jsx(un, {
    ...p,
    children: X.jsx("path", {
      d: "M12 3v11m0 0 4-4m-4 4-4-4M5 20h14"
    })
  })
}

function un(p) {
  return X.jsx("svg", {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    ...p
  })
}

function Ad(p) {
  return X.jsx(un, {
    ...p,
    children: X.jsx("path", {
      d: "m3 3 18 18M9 9v3a3 3 0 0 0 5 2M9 5a3 3 0 0 1 6 0v5M5 10v2a7 7 0 0 0 12 5M19 10v2M12 19v3m-4 0h8"
    })
  })
}

function $d(p) {
  return X.jsx(un, {
    ...p,
    children: X.jsx("path", {
      d: "M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z"
    })
  })
}

function Bd(p) {
  return X.jsx(un, {
    ...p,
    children: X.jsx("path", {
      d: "M3 16v-4c5-5 13-5 18 0v4h-5v-4M8 12v4H3"
    })
  })
}

function Vd(p) {
  return X.jsx(un, {
    ...p,
    children: X.jsx("path", {
      d: "M5 12h14"
    })
  })
}
const Wa = "office-dock-greeting-v1";

function Hd(p) {
  var S;
  if ((S = window.officeDesktop) != null && S.dockGreet) {
    try {
      const f = new BroadcastChannel(Wa);
      f.postMessage(p), f.close()
    } catch {}
    window.officeDesktop.dockGreet(p).catch(() => {})
  }
}

function Wd(p) {
  try {
    const S = new BroadcastChannel(Wa);
    return S.onmessage = f => {
      var R;
      typeof((R = f.data) == null ? void 0 : R.id) == "string" && f.data.id && p(f.data)
    }, () => S.close()
  } catch {
    return () => {}
  }
}
export {
  Ld as A, Rd as B, zd as C, Dd as D, Hd as E, vd as F, Bd as H, Vd as M, kd as P, pd as R, Od as S, dd as _, _d as a, od as b, Sd as c, Nd as d, ad as e, ed as f, md as g, gd as h, Cd as i, X as j, hd as k, Wd as l, Td as m, Id as n, Fd as o, Md as p, $d as q, gr as r, jd as s, Ad as t, xd as u, Ud as v, yd as w, wd as x, Ed as y, Pd as z
};
import { qf } from '../vendor/react-dom.js';
