

(() => {
  const glow = document.getElementById('glow');
  if (!glow) return;

  const HOLD_MS = 3600;

  const FADE_OUT_MS = 500;
  let hold;

  const log = [];
  window.__glowLog = log;

  const opacity = () => Number(getComputedStyle(glow).opacity) || 0;
  const darken = () => {

    glow.style.transitionTimingFunction = 'linear';
    glow.style.transitionDuration = '0ms';
    glow.style.opacity = '0';
    void glow.offsetWidth;
  };
  const fadeIn = fade => {

    glow.style.transitionTimingFunction = 'ease-in-out';
    glow.style.transitionDuration = `${fade}ms`;
    glow.style.opacity = '1';
  };

  window.officeGlow?.onFlash?.((payload = {}) => {
    const fade = Math.max(0, Number(payload.fade) || 0);
    glow.classList.toggle('call', payload.tone === 'call');
    log.push({ at: Date.now(), fade, restart: payload.restart === true, was: opacity() });
    if (log.length > 40) log.shift();
    if (hold) clearTimeout(hold);
    hold = setTimeout(() => {
      hold = undefined;
      glow.style.transitionTimingFunction = 'ease-out';
      glow.style.transitionDuration = `${FADE_OUT_MS}ms`;
      glow.style.opacity = '0';
    }, HOLD_MS);
    if (payload.restart === true) { darken(); fadeIn(fade); return; }

    fadeIn(fade);
  });

  document.addEventListener('visibilitychange', () => {
    log.push({ at: Date.now(), visibility: document.visibilityState });
    if (log.length > 40) log.shift();
    if (document.visibilityState === 'visible') return;
    if (hold) { clearTimeout(hold); hold = undefined; }
    darken();
  });
})();
