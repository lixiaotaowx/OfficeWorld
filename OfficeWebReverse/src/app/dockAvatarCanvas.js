import { c as appearanceHex } from '../chunks/chatLocal.js';
import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
import { readAutoExpression, pickAvatarExpression, composeAvatarFaceplate, paintAvatarCanvas, prefersReducedMotion, readAvatarAppearance } from './dockAvatarArt.js';
function AvatarCanvas({
  person: t,
  size: s,
  turned: n = !1,
  blinks: c = !1
}) {
  const r = React.useRef(null),
    i = readAvatarAppearance(t),
    o = pickAvatarExpression({
      autoExpression: readAutoExpression(t.character),
      atDesk: t.atDesk,
      sharing: t.sharing
    }),
    d = JSON.stringify(i) + o + n + s;
  return React.useEffect(() => {
    let m = !0,
      h;
    return composeAvatarFaceplate(i, o).then(k => {
      if (!m || !r.current) return;
      const f = (g = !1) => r.current && paintAvatarCanvas(r.current, k, s, {
        blink: g,
        turned: n
      });
      if (f(), !c || n || prefersReducedMotion || o === "away") return;
      const b = () => {
        h = setTimeout(() => {
          f(!0), h = setTimeout(() => {
            f(), b();
          }, 150);
        }, 6e3 + Math.random() * 4e3);
      };
      b();
    }).catch(() => {}), () => {
      m = !1, h && clearTimeout(h);
    };
  }, [d, c]), jsxRuntime.jsx("canvas", {
    ref: r,
    "data-pid": t.account || t.id,
    "aria-hidden": "true",
    style: {
      width: s,
      height: s
    }
  });
}
function PersonChip({
  person: t,
  turned: s,
  inMine: n,
  active: c,
  dropping: r,
  onClick: i,
  onEnter: o,
  onLeave: d,
  onKeyboardFocus: m,
  onContextMenu: h,
  drag: k
}) {
  const f = !t.atDesk && !s;
  return jsxRuntime.jsxs("button", {
    type: "button",
    "data-person-id": t.id,
    draggable: !t.self,
    className: ["dk-chip", f ? "away" : "", c ? "active" : "", r ? "drop-on" : ""].filter(Boolean).join(" "),
    "aria-label": t.self ? "我" : `${t.name}${s ? "，在通话" : f ? "，不在座位" : ""}`,
    onClick: i,
    onContextMenu: h,
    onMouseEnter: o,
    onMouseLeave: d,
    onFocus: m,
    onBlur: d,
    ...k,
    children: [jsxRuntime.jsx(AvatarCanvas, {
      person: t,
      size: 32,
      turned: s,
      blinks: !0
    }), s && jsxRuntime.jsx("span", {
      className: "dk-busy" + (n ? " mine" : ""),
      "aria-hidden": "true"
    }), (t.unread > 0 || t.missed) && jsxRuntime.jsx("span", {
      className: "dk-pip",
      "aria-hidden": "true"
    })]
  });
}
function RoundTableChip({
  people: t,
  unread: s,
  active: n,
  dropping: c,
  onClick: r,
  drag: i
}) {
  const o = t.slice(0, 8),
    d = Math.max(4, o.length);
  return jsxRuntime.jsxs("button", {
    type: "button",
    "data-id": "table",
    className: "dk-chip dk-table" + (n ? " active" : "") + (c ? " drop-on" : ""),
    "aria-label": "圆桌：iruler 群聊与开会",
    title: "圆桌 · iruler 群聊，点开可以开会",
    onClick: r,
    ...i,
    children: [jsxRuntime.jsxs("svg", {
      viewBox: "0 0 32 32",
      "aria-hidden": "true",
      children: [jsxRuntime.jsx("circle", {
        cx: "16",
        cy: "16",
        r: "6.5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5"
      }), Array.from({
        length: d
      }, (m, h) => {
        const k = Math.PI / 2 + h * 2 * Math.PI / d,
          f = o[h];
        return jsxRuntime.jsx("circle", {
          cx: 16 + Math.cos(k) * 11.4,
          cy: 16 + Math.sin(k) * 11.4,
          r: "2.4",
          fill: f && f.atDesk ? appearanceHex(readAvatarAppearance(f).color) : "rgba(255,255,255,.16)"
        }, h);
      })]
    }), s && jsxRuntime.jsx("span", {
      className: "dk-pip",
      "aria-hidden": "true"
    })]
  });
}

export { AvatarCanvas, PersonChip, RoundTableChip };
