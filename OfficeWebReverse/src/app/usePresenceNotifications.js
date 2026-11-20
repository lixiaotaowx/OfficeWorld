import { r as React, E as ks } from '../chunks/dockGreeting.js';
const RING_REFRESH_MS = 3e3,
  GLOW_FADE_MS = 150;
function getIncomingGreeting(i, e) {
  var n;
  const t = (i || []).find(s => s && s.id && s.from);
  return t ? {
    id: t.from,
    name: t.name,
    appearance: (n = (e || []).find(s => s.id === t.from)) == null ? void 0 : n.appearance,
    mode: "call",
    requestId: t.id,
    kind: t.kind === "voice" ? "voice" : "screen",
    offer: t.offer === !0
  } : null;
}
function usePresenceNotifications(i) {
  const e = React.useRef(i);
  e.current = i;
  const t = [...i.requests.map(n => n.id), ...(i.ringing || [])].join(",");
  React.useEffect(() => {
    if (!t) return;
    const n = typeof window > "u" ? void 0 : window.officeDesktop;
    if (!(n != null && n.previewGlow) && !(n != null && n.dockGreet)) return;
    const s = () => {
      var o, c;
      const a = getIncomingGreeting(e.current.requests, e.current.people);
      !a && !((o = e.current.ringing) != null && o.length) || ((c = n.previewGlow) == null || c.call(n, {
        sharing: e.current.sharing,
        fade: GLOW_FADE_MS,
        tone: "call"
      }).catch(() => {}), a && ks({
        id: a.id,
        name: a.name,
        appearance: a.appearance,
        mode: a.mode,
        requestId: a.requestId,
        kind: a.kind,
        offer: a.offer
      }));
    };
    s();
    const r = setInterval(s, RING_REFRESH_MS);
    return () => clearInterval(r);
  }, [t]);
}

export { usePresenceNotifications };
