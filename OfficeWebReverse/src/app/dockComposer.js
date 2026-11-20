import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
import { findMentionQuery, insertMentionText } from './dockMessageText.js';
function ChatComposer({
  value: t,
  members: s,
  enabled: n,
  inputRef: c,
  placeholder: r,
  onChange: i,
  onSend: o,
  onClose: d,
  children: m
}) {
  const h = React.useId(),
    [k, f] = React.useState(0),
    [b, g] = React.useState(0),
    [R, N] = React.useState(!1),
    C = React.useRef(null),
    [I, j] = React.useState(!1);
  React.useEffect(() => {
    if (!I) return;
    const p = $ => {
      var S;
      (S = C.current) != null && S.contains($.target) || j(!1);
    };
    return document.addEventListener("pointerdown", p), () => document.removeEventListener("pointerdown", p);
  }, [I]);
  const [_, V] = React.useState(!1),
    W = n && !I && !R && !_ ? findMentionQuery(t, k) : null,
    D = W && s.some(p => W.query === p.name + " ") ? null : W,
    w = (D == null ? void 0 : D.query.toLocaleLowerCase()) || "",
    E = D ? [...new Map(s.map(p => [p.id, p])).values()].filter(p => p.name.toLocaleLowerCase().includes(w)).sort((p, $) => Number($.name.toLocaleLowerCase().startsWith(w)) - Number(p.name.toLocaleLowerCase().startsWith(w)) || p.name.localeCompare($.name, "zh")) : [],
    L = Math.min(b, Math.max(0, E.length - 1));
  React.useEffect(() => {
    var p;
    D && E.length && ((p = document.getElementById(`${h}-${L}`)) == null || p.scrollIntoView({
      block: "nearest"
    }));
  }, [h, L, D == null ? void 0 : D.query]);
  const U = p => requestAnimationFrame(() => {
      var $, S;
      ($ = c.current) == null || $.focus(), (S = c.current) == null || S.setSelectionRange(p, p), f(p);
    }),
    K = p => {
      if (!D) return;
      const $ = insertMentionText(t, D.start, D.end, p.name);
      $.text.length > 1e3 || (i($.text), N(!0), g(0), U($.caret));
    };
  return jsxRuntime.jsxs("div", {
    className: "dk-composer",
    ref: C,
    onKeyDownCapture: p => {
      var $;
      I && p.key === "Escape" && (p.preventDefault(), p.stopPropagation(), j(!1), ($ = c.current) == null || $.focus());
    },
    children: [I && jsxRuntime.jsx("div", {
      className: "dk-emojis",
      role: "group",
      "aria-label": "选择表情",
      children: ["😀", "😄", "😂", "🙂", "😊", "🥰", "😍", "😘", "😎", "🤔", "😅", "😭", "😮", "😴", "😤", "🥳", "👍", "👎", "👏", "🙌", "🙏", "🤝", "💪", "👌", "❤️", "💔", "🎉", "🎂", "🌹", "☕", "🔥", "✨", "💯", "✅", "👀", "🚀"].map(p => jsxRuntime.jsx("button", {
        type: "button",
        "aria-label": `表情 ${p}`,
        onPointerDown: $ => $.preventDefault(),
        onClick: () => {
          var F, oe;
          const $ = ((F = c.current) == null ? void 0 : F.selectionStart) ?? t.length,
            S = ((oe = c.current) == null ? void 0 : oe.selectionEnd) ?? $,
            O = t.slice(0, $) + p + t.slice(S);
          O.length > 1e3 || (i(O), j(!1), N(!0), U($ + p.length));
        },
        children: p
      }, p))
    }), D && jsxRuntime.jsxs("div", {
      className: "dk-mentions",
      id: h,
      role: "listbox",
      "aria-label": "选择要提到的成员",
      children: [jsxRuntime.jsx("small", {
        className: "dk-mention-help",
        children: "选择在线成员 · ↑↓ 选择，Enter 确认"
      }), E.length ? E.map((p, $) => jsxRuntime.jsxs("button", {
        id: `${h}-${$}`,
        type: "button",
        role: "option",
        "aria-selected": $ === L,
        className: $ === L ? "selected" : "",
        onPointerDown: S => S.preventDefault(),
        onPointerMove: () => g($),
        onClick: () => K(p),
        children: ["@", p.name]
      }, p.id)) : jsxRuntime.jsx("small", {
        children: s.length ? "没有匹配的成员，试试其他名字" : "现在没人在线，等同事上线后再 @"
      })]
    }), jsxRuntime.jsx("textarea", {
      ref: c,
      rows: 3,
      maxLength: 1e3,
      placeholder: r,
      "aria-label": "消息",
      value: t,
      role: n ? "combobox" : void 0,
      "aria-autocomplete": n ? "list" : void 0,
      "aria-expanded": n ? !!D : void 0,
      "aria-controls": D ? h : void 0,
      "aria-activedescendant": D && E.length ? `${h}-${L}` : void 0,
      onCompositionStart: () => V(!0),
      onCompositionEnd: p => {
        V(!1), N(!1), g(0), f(p.currentTarget.selectionStart || 0);
      },
      onBlur: () => N(!0),
      onFocus: p => {
        f(p.currentTarget.selectionStart || 0), N(!1);
      },
      onSelect: p => f(p.currentTarget.selectionStart || 0),
      onChange: p => {
        i(p.target.value), f(p.target.selectionStart || 0), g(0), N(!1), j(!1);
      },
      onKeyDown: p => {
        if (!(_ || p.nativeEvent.isComposing || p.keyCode === 229)) {
          if (D) {
            if (p.key === "Escape") {
              p.preventDefault(), p.stopPropagation(), N(!0);
              return;
            }
            if (E.length && (p.key === "ArrowDown" || p.key === "ArrowUp")) {
              p.preventDefault(), g((L + (p.key === "ArrowDown" ? 1 : -1) + E.length) % E.length);
              return;
            }
            if (E.length && (p.key === "Enter" || p.key === "Tab")) {
              p.preventDefault(), K(E[L]);
              return;
            }
          }
          p.key === "Enter" && !p.shiftKey && (p.preventDefault(), o()), p.key === "Escape" && d();
        }
      }
    }), jsxRuntime.jsxs("div", {
      className: "dk-compose-tools",
      children: [jsxRuntime.jsx("button", {
        type: "button",
        className: "dk-icon dk-at-button",
        "aria-label": "表情",
        title: "表情",
        "aria-expanded": I,
        onPointerDown: p => p.preventDefault(),
        onClick: () => j(p => !p),
        children: "☺"
      }), n && jsxRuntime.jsx("button", {
        type: "button",
        className: "dk-icon dk-at-button",
        "aria-label": "提到群成员",
        title: "提到群成员（@）",
        onPointerDown: p => p.preventDefault(),
        onClick: () => {
          var F, oe;
          j(!1);
          const p = ((F = c.current) == null ? void 0 : F.selectionStart) ?? t.length,
            $ = ((oe = c.current) == null ? void 0 : oe.selectionEnd) ?? p,
            S = p && !/[\s，。！？、：；（(]/.test(t[p - 1]) ? " @" : "@",
            O = t.slice(0, p) + S + t.slice($);
          O.length > 1e3 || (i(O), N(!1), g(0), U(p + S.length));
        },
        children: "@"
      }), m]
    })]
  });
}

export { ChatComposer };
