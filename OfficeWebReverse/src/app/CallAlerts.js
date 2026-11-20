import { r as React, j as jsxRuntime, H as CallAlertIcon, q as CallIcon } from '../chunks/dockGreeting.js';
function CallAlerts({
  alerts: i,
  onDismiss: e,
  onRetry: t
}) {
  return jsxRuntime.jsx("div", {
    className: "call-alerts",
    role: "log",
    "aria-live": "polite",
    children: i.map(n => jsxRuntime.jsx(CallAlert, {
      alert: n,
      onDismiss: e,
      onRetry: t
    }, n.id))
  });
}
function CallAlert({
  alert: i,
  onDismiss: e,
  onRetry: t
}) {
  return jsxRuntime.jsxs("section", {
    className: `call-alert ${i.kind}`,
    role: "alert",
    children: [jsxRuntime.jsx("div", {
      className: "call-alert-icon",
      children: jsxRuntime.jsx(CallAlertIcon, {})
    }), jsxRuntime.jsxs("div", {
      className: "call-alert-copy",
      children: [jsxRuntime.jsx("strong", {
        children: i.title
      }), jsxRuntime.jsx("small", {
        children: i.detail
      })]
    }), jsxRuntime.jsxs("div", {
      className: "call-alert-actions",
      children: [jsxRuntime.jsxs("button", {
        type: "button",
        className: "primary",
        onClick: () => t(i),
        children: [jsxRuntime.jsx(CallIcon, {}), "回拨"]
      }), jsxRuntime.jsx("button", {
        type: "button",
        onClick: () => e(i.id),
        children: "知道了"
      })]
    })]
  });
}
function FloatingCallPanels({
  children: i
}) {
  const e = React.useRef(null);
  return React.useLayoutEffect(() => {
    let t = 0;
    const n = new Set(),
      s = () => {
        if (t = 0, !e.current) return;
        const c = document.querySelector(".stage"),
          d = c == null ? void 0 : c.getBoundingClientRect();
        let l = Math.min(innerHeight - 12, d ? d.bottom - 12 : innerHeight - 88);
        for (const m of document.querySelectorAll(".stage, .build-ui, .bottom-bar")) {
          if (n.has(m) || (n.add(m), a.observe(m)), m === c) continue;
          const f = m.getBoundingClientRect();
          f.width && f.height && f.top < l && f.bottom > 0 && (l = f.top - 8);
        }
        const u = Math.max(12, d ? d.top + 12 : 12),
          h = Math.max(12, d ? innerWidth - d.right + 12 : 12);
        e.current.style.right = `${h}px`, e.current.style.bottom = `${Math.max(12, innerHeight - l)}px`, e.current.style.maxHeight = `${Math.max(80, l - u)}px`, e.current.style.maxWidth = `${Math.max(220, Math.min(innerWidth - h - 12, d ? d.width - 24 : 340))}px`;
      },
      r = () => {
        t || (t = requestAnimationFrame(s));
      },
      a = new ResizeObserver(r),
      o = new MutationObserver(r);
    return o.observe(document.body, {
      childList: !0,
      subtree: !0
    }), window.addEventListener("resize", r), window.addEventListener("scroll", r, !0), s(), () => {
      a.disconnect(), o.disconnect(), cancelAnimationFrame(t), window.removeEventListener("resize", r), window.removeEventListener("scroll", r, !0);
    };
  }, []), jsxRuntime.jsx("div", {
    className: "call-floating-panels",
    ref: e,
    children: i
  });
}

export { CallAlerts, FloatingCallPanels };
