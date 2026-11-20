import { r as React } from '../chunks/dockGreeting.js';
function collectDroppedFiles(t) {
  var c, r;
  const s = {
    files: [],
    folders: 0
  };
  if (!t) return s;
  const n = Array.from(t.files || []);
  if (n.length) return s.files.push(...n), s;
  for (const i of Array.from(t.items || [])) {
    if (i != null && i.kind && i.kind !== "file") continue;
    const o = (c = i.webkitGetAsEntry) == null ? void 0 : c.call(i);
    if (o != null && o.isDirectory) {
      s.folders += 1;
      continue;
    }
    const d = (r = i.getAsFile) == null ? void 0 : r.call(i);
    d && s.files.push(d);
  }
  return s;
}
function describeDragSelection(t) {
  return t.folders && !t.files.length ? "文件夹不能直接发，先压缩成一个文件" : t.files.length ? t.folders ? "文件夹已跳过，先压缩成一个文件再发" : "" : "没读到文件，请从资源管理器拖文件进来";
}
function observeDockRects(t) {
  let s = 0,
    n = !1,
    c;
  const r = ".dock, .dock-card, .dock-status-menu, .dock-meeting-panel, .dock-share-bubble, .dock button, .dock input, .dock select, .dock textarea, .dock a[href]";
  function i() {
    if (s = 0, n) return;
    const b = [...document.querySelectorAll(r)].map(g => g.getBoundingClientRect()).filter(g => g.width > 0 && g.height > 0).map(g => new DOMRect(Math.max(0, g.x), Math.max(0, g.y), Math.max(0, Math.min(innerWidth, g.right) - Math.max(0, g.x)), Math.max(0, Math.min(innerHeight, g.bottom) - Math.max(0, g.y))));
    t(b.filter((g, R) => g.width > 0 && g.height > 0 && !b.some((N, C) => C < R && N.left <= g.left && N.top <= g.top && N.right >= g.right && N.bottom >= g.bottom)));
  }
  function o() {
    s || (s = requestAnimationFrame(i));
  }
  const d = () => {
      n = !0, clearTimeout(c);
    },
    m = () => {
      c = setTimeout(() => {
        n = !1, o();
      }, 0);
    };
  document.addEventListener("pointerdown", d, !0), document.addEventListener("pointerup", m, !0), document.addEventListener("pointercancel", m, !0), window.addEventListener("blur", m);
  const h = new ResizeObserver(o),
    k = new MutationObserver(() => {
      h.disconnect(), document.querySelectorAll(r).forEach(b => h.observe(b)), o();
    });
  k.observe(document.getElementById("root"), {
    childList: !0,
    subtree: !0,
    attributes: !0,
    attributeFilter: ["class", "style"]
  }), document.querySelectorAll(r).forEach(b => h.observe(b)), window.addEventListener("resize", o), document.addEventListener("scroll", o, !0);
  const f = window.setInterval(o, 100);
  return o(), () => {
    cancelAnimationFrame(s), k.disconnect(), h.disconnect(), window.removeEventListener("resize", o), document.removeEventListener("scroll", o, !0), clearInterval(f), clearTimeout(c), document.removeEventListener("pointerdown", d, !0), document.removeEventListener("pointerup", m, !0), document.removeEventListener("pointercancel", m, !0), window.removeEventListener("blur", m);
  };
}
function computePanelBottom(t, s) {
  return Math.max(256, t, s ? 340 : 0) + 16;
}
function measureDockWindow(t, s) {
  const n = Math.max(280, Math.min(4080, Math.round((t || 1366) / 2))),
    c = Math.max(200, Math.min(640, (s || 768) - 80));
  return {
    width: n,
    height: c,
    pictureHeight: Math.max(120, c - 164)
  };
}
const clampPanelHeight = t => Math.min(340, Math.max(0, t - 16));
function clampPanelLeft(t, s, n) {
  const c = Math.min(s, Math.max(0, n - 16));
  return Math.max(8, Math.min(n - c - 8, t - c / 2));
}
function useDockHover(t) {
  const [s, n] = React.useState(""),
    c = React.useRef(),
    r = React.useRef(),
    i = React.useRef(!1),
    o = React.useCallback(() => {
      clearTimeout(c.current), c.current = void 0, clearTimeout(r.current), r.current = void 0;
    }, []);
  React.useEffect(() => {
    const f = R => {
        i.current = R.key === "Tab";
      },
      b = () => {
        i.current = !1;
      },
      g = () => {
        b(), o();
      };
    return document.addEventListener("keydown", f, !0), document.addEventListener("pointerdown", g, !0), document.addEventListener("pointermove", b, !0), window.addEventListener("blur", b), () => {
      o(), document.removeEventListener("keydown", f, !0), document.removeEventListener("pointerdown", g, !0), document.removeEventListener("pointermove", b, !0), window.removeEventListener("blur", b);
    };
  }, [o]);
  const d = React.useCallback((f, b = !1) => {
      t || (o(), b ? c.current = setTimeout(() => n(f), 80) : n(f));
    }, [t, o]),
    m = React.useCallback(f => {
      i.current && d(f);
    }, [d]),
    h = React.useCallback(() => {
      o(), n("");
    }, [o]),
    k = React.useCallback(() => {
      o(), r.current = setTimeout(h, 350);
    }, [o, h]);
  return {
    hovered: s,
    open: d,
    focus: m,
    close: h,
    scheduleClose: k
  };
}

export { collectDroppedFiles, describeDragSelection, observeDockRects, computePanelBottom, measureDockWindow, clampPanelHeight, clampPanelLeft, useDockHover };
