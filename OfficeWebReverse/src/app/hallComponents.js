import { r as I } from '../chunks/dockGreeting.js';
const HallView = I.lazy(() => import("../chunks/HallView.js").then(i => i.H)),
  LookOnboarding = I.lazy(() => import("../chunks/LookOnboarding.js")),
  isLeanStartup = () => {
    var i, e;
    return new URLSearchParams(window.location.search).get("officeLean") === "1" && !!((i = window.officeDesktop) != null && i.mainWindowVisible && (e = window.officeDesktop) != null && e.onMainWindowVisibility);
  };
function useHallVisibility() {
  const [i, e] = I.useState(() => !isLeanStartup());
  return I.useEffect(() => {
    if (i) return;
    const t = window.officeDesktop,
      n = r => {
        r === !0 && e(!0);
      },
      s = t.onMainWindowVisibility(n);
    return t.mainWindowVisible().then(n).catch(() => e(!0)), s;
  }, [i]), i;
}

export { HallView, LookOnboarding, useHallVisibility };
