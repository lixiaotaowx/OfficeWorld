import { r as React, j as jsxRuntime, a as stopPropagation } from '../chunks/dockGreeting.js';
function ChatLinkPopover({
  text: t,
  children: s
}) {
  const [n, c] = React.useState(null),
    [r, i] = React.useState(""),
    [o, d] = React.useState(!1),
    m = React.useRef(null),
    h = React.useRef(null),
    k = React.useRef(null),
    f = () => {
      var g;
      c(null), (g = k.current) == null || g.focus({
        preventScroll: !0
      });
    };
  React.useEffect(() => {
    var C, I;
    if (!n) return;
    (I = (C = h.current) == null ? void 0 : C.querySelector("button")) == null || I.focus({
      preventScroll: !0
    });
    const g = j => {
        var _;
        (_ = h.current) != null && _.contains(j.target) || c(null);
      },
      R = j => {
        j.key === "Escape" && (j.preventDefault(), j.stopImmediatePropagation(), f());
      },
      N = () => c(null);
    return document.addEventListener("pointerdown", g, !0), document.addEventListener("contextmenu", g, !0), document.addEventListener("keydown", R, !0), document.addEventListener("scroll", N, !0), window.addEventListener("resize", N), window.addEventListener("blur", N), () => {
      document.removeEventListener("pointerdown", g, !0), document.removeEventListener("contextmenu", g, !0), document.removeEventListener("keydown", R, !0), document.removeEventListener("scroll", N, !0), window.removeEventListener("resize", N), window.removeEventListener("blur", N);
    };
  }, [n]), React.useEffect(() => {
    if (r === "已复制") {
      const g = setTimeout(() => i(""), 3e3);
      return () => clearTimeout(g);
    }
  }, [r]), React.useEffect(() => {
    c(null), i("");
  }, [t]);
  const b = async () => {
    if (!o) {
      d(!0), i("");
      try {
        await navigator.clipboard.writeText(t), i("已复制"), f();
      } catch {
        i("复制失败，请重试或选中文字后按 Ctrl+C");
      } finally {
        d(!1);
      }
    }
  };
  return jsxRuntime.jsxs("span", {
    ref: m,
    className: "dk-copy-text",
    tabIndex: 0,
    onContextMenu: g => {
      var I, j;
      g.preventDefault(), g.stopPropagation(), i(""), k.current = document.activeElement instanceof HTMLElement ? document.activeElement : m.current;
      const R = m.current.getBoundingClientRect(),
        N = g.clientX || R.left,
        C = g.clientY || R.top;
      c({
        x: Math.max(8, Math.min(N, window.innerWidth - 168)),
        y: Math.max(8, Math.min(C, window.innerHeight - 96)),
        theme: ((j = (I = m.current) == null ? void 0 : I.closest("[data-theme]")) == null ? void 0 : j.getAttribute("data-theme")) || "dark"
      });
    },
    children: [s, r && jsxRuntime.jsx("small", {
      className: "dk-copy-status",
      role: "status",
      children: r
    }), n && stopPropagation.createPortal(jsxRuntime.jsx("div", {
      className: "dk dk-copy-layer",
      "data-theme": n.theme,
      style: {
        left: n.x,
        top: n.y
      },
      children: jsxRuntime.jsxs("div", {
        ref: h,
        className: "dock-card dk-copy-menu",
        role: "menu",
        "aria-label": "消息操作",
        onContextMenu: g => {
          g.preventDefault(), g.stopPropagation();
        },
        children: [jsxRuntime.jsx("button", {
          type: "button",
          role: "menuitem",
          disabled: o,
          onClick: () => void b(),
          children: o ? "正在复制…" : "复制消息"
        }), jsxRuntime.jsx("button", {
          type: "button",
          role: "menuitem",
          onClick: f,
          children: "取消"
        })]
      })
    }), document.body)]
  });
}
function parseMessageTokens(t) {
  var r, i;
  const s = /https?:\/\/[^\s<>"“”]+|www\.[^\s<>"“”]+|["“](?:[a-z]:[\\/]|\\\\)[^\r\n"”]+["”]|(?:[a-z]:[\\/]|\\\\)[^\r\n<>"|?*]+/gi,
    n = [];
  let c = 0;
  for (const o of t.matchAll(s)) {
    const d = o.index;
    d > c && n.push({
      text: t.slice(c, d)
    });
    let m = o[0],
      h = m,
      k = /^(https?:\/\/|www\.)/i.test(m) ? "url" : "path";
    if (/^["“]/.test(m)) h = m.slice(1, -1);else {
      if (m = m.replace(/[\s，。；、！!？,;]+$/u, ""), k === "url") for (m = m.replace(/[.]+$/, ""); m.endsWith(")") && (((r = m.match(/\)/g)) == null ? void 0 : r.length) || 0) > (((i = m.match(/\(/g)) == null ? void 0 : i.length) || 0);) m = m.slice(0, -1);
      h = m;
    }
    h && n.push({
      text: m,
      target: h,
      kind: k
    }), c = d + m.length;
  }
  return c < t.length && n.push({
    text: t.slice(c)
  }), n;
}
function mentionedMembers(t, s) {
  const n = new Set(splitMentionSegments(t, s).filter(c => c.mention).map(c => c.text.slice(1)));
  return s.filter(c => n.has(c.name));
}
function findMentionQuery(t, s) {
  const n = t.slice(0, s),
    c = /[@＠]([^@＠\n\r]{0,60})$/.exec(n);
  return !c || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(n) ? null : {
    start: s - c[1].length - 1,
    end: s,
    query: c[1]
  };
}
function insertMentionText(t, s, n, c) {
  const i = `${s > 0 && !/[\s，。！？、：；（(]/.test(t[s - 1]) ? " " : ""}@${c} `;
  return {
    text: t.slice(0, s) + i + t.slice(n),
    caret: s + i.length
  };
}
function splitMentionSegments(t, s = []) {
  if (!s.length) return [{
    text: t,
    mention: !1
  }];
  const n = [...new Set(s.map(o => o.name))].filter(Boolean).sort((o, d) => d.length - o.length).map(o => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!n.length) return [{
    text: t,
    mention: !1
  }];
  const c = new RegExp(`(^|[\\s，。！？、：；（(])[@＠](${n.join("|")})(?=$|[\\s，。！？、：；,.!?;:）)])`, "gu"),
    r = [];
  let i = 0;
  for (const o of t.matchAll(c)) {
    const d = o.index + o[1].length,
      m = d + o[2].length + 1;
    d > i && r.push({
      text: t.slice(i, d),
      mention: !1
    }), r.push({
      text: t.slice(d, m),
      mention: !0
    }), i = m;
  }
  return i < t.length && r.push({
    text: t.slice(i),
    mention: !1
  }), r;
}
function MessageBody({
  text: t,
  mentions: s,
  conversation: n,
  messageId: c
}) {
  const [r, i] = React.useState(""),
    [o, d] = React.useState(!1),
    m = async h => {
      var k;
      if (!o) {
        d(!0), i("");
        try {
          if (!((k = window.officeDock) != null && k.openChatTarget)) throw Error("请安装 0.1.61 或更新版本后打开链接和路径");
          const f = await window.officeDock.openChatTarget({
            conversation: n,
            messageId: c,
            target: h
          });
          if (!f.ok) throw Error(f.error || "无法打开");
        } catch (f) {
          i(f instanceof Error ? f.message : "无法打开，请检查地址");
        } finally {
          d(!1);
        }
      }
    };
  return jsxRuntime.jsxs(ChatLinkPopover, {
    text: t,
    children: [jsxRuntime.jsx("span", {
      className: "txt",
      children: parseMessageTokens(t).map((h, k) => h.target ? jsxRuntime.jsx("button", {
        type: "button",
        className: "dk-message-link",
        title: h.kind === "url" ? "在浏览器打开链接" : "打开此电脑上的文件或文件夹",
        disabled: o,
        onClick: () => void m(h.target),
        children: h.text
      }, k) : jsxRuntime.jsx("span", {
        children: splitMentionSegments(h.text, s).map((f, b) => f.mention ? jsxRuntime.jsx("mark", {
          className: "dk-mention",
          children: f.text
        }, b) : f.text)
      }, k))
    }), r && jsxRuntime.jsx("small", {
      className: "dk-target-error",
      role: "alert",
      children: r
    })]
  });
}
function formatTimestampLabel(t) {
  const s = new Date(t);
  if (!Number.isFinite(s.getTime())) return {
    label: "时间未知"
  };
  const n = c => String(c).padStart(2, "0");
  return {
    label: `${s.getFullYear()}年${n(s.getMonth() + 1)}月${n(s.getDate())}日 ${n(s.getHours())}:${n(s.getMinutes())}`,
    iso: s.toISOString()
  };
}
function isNewChatDay(t, s) {
  return s == null || t - s >= 5 * 60 * 1e3 || new Date(t).toDateString() !== new Date(s).toDateString();
}
function formatChatTime(t, s = Date.now()) {
  const n = new Date(t),
    c = new Date(s);
  if (!Number.isFinite(n.getTime())) return "时间未知";
  const r = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  if (n.toDateString() === c.toDateString()) return r;
  const i = new Date(c);
  return i.setDate(i.getDate() - 1), n.toDateString() === i.toDateString() ? `昨天 ${r}` : `${n.getFullYear() === c.getFullYear() ? "" : `${n.getFullYear()}年`}${n.getMonth() + 1}月${n.getDate()}日 ${r}`;
}

export { mentionedMembers, findMentionQuery, insertMentionText, MessageBody, formatTimestampLabel, isNewChatDay, formatChatTime };
