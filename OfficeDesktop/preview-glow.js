// 绿光层页面：收到一次"有人来看我了"就亮起来，最后一次信号之后自己淡下去。
//
// 亮起用多久由主进程给（`fade`，毫秒）：鼠标停在头像上是**慢慢亮**（2 秒，用户 2026-09-20
// 「亮起的时间会很慢 大概用2秒才渐渐亮起」），有人打电话过来是**立刻亮**。
// 主进程负责到点把窗口收掉（`GLOW_MS`），这里只管画那一圈光——连点几十下（好几个人同时在
// 看、或者一通电话响 30 秒里每 3 秒补一次）也只是一直亮着，不会堆出好几个层。
//
// **"这是不是要重新亮一次"由主进程说了算**（`payload.restart`）：窗口一藏起来，页面里的
// 计时器就会被节流甚至冻住，淡出那一步可能根本没跑；页面自己记的"我还亮着"是错的，于是第二
// 次悬停时会以为已经亮着、不再淡入，看起来还是"啪一下亮起来"（2026-09-20 实测）。
(() => {
  const glow = document.getElementById('glow');
  if (!glow) return;
  /** 最后一次信号之后自己还亮多久：要短于主进程的 GLOW_MS，好留出淡出的时间。 */
  const HOLD_MS = 3600;
  /** 收的时候淡出多久（收得快一点，别拖到窗口都藏了还没淡完）。 */
  const FADE_OUT_MS = 500;
  let hold;
  /** 排查用：最近收到过哪些信号、当时读到的不透明度（`Build/glow-fade-check.mjs` 会读它）。 */
  const log = [];
  window.__glowLog = log;

  const opacity = () => Number(getComputedStyle(glow).opacity) || 0;
  const darken = () => {
    // 变成"真的全透明"：先把这一帧算出去（读 offsetWidth 强制一次样式/布局），
    // 否则紧接着设成不透明时浏览器认为"没有上一帧"，直接跳到 1（实测过）。
    glow.style.transitionTimingFunction = 'linear';
    glow.style.transitionDuration = '0ms';
    glow.style.opacity = '0';
    void glow.offsetWidth;
  };
  const fadeIn = fade => {
    // 慢慢亮：用 ease-in-out，两头都慢，看起来才是"渐渐亮起来"（默认的 ease-out 前 1/3
    // 就冲到一半了，实测 2 秒的过渡在 0.6 秒就已经半亮）。
    glow.style.transitionTimingFunction = 'ease-in-out';
    glow.style.transitionDuration = `${fade}ms`;
    glow.style.opacity = '1';
  };

  window.officeGlow?.onFlash?.((payload = {}) => {
    const fade = Math.max(0, Number(payload.fade) || 0);
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
    // 还亮着（悬停的心跳每 800ms 一次）：只把目标重新指到"全亮"，别重置成透明，否则会闪。
    fadeIn(fade);
  });

  // 窗口被藏起来时顺手把状态清干净（主进程下次会让它 restart，这里只是别留着"我还亮着"）。
  document.addEventListener('visibilitychange', () => {
    log.push({ at: Date.now(), visibility: document.visibilityState });
    if (log.length > 40) log.shift();
    if (document.visibilityState === 'visible') return;
    if (hold) { clearTimeout(hold); hold = undefined; }
    darken();
  });
})();
