/** Only real controls receive native mouse input; the greeting is decoration. */
export function watchDockHitRegions(report: (regions: DOMRect[]) => void) {
  let frame = 0;
  const selectors = '.dock, .dock-card, .dock-status-menu, .dock-meeting-panel, .dock-share-bubble, .dock button, .dock input, .dock select, .dock textarea, .dock a[href]';
  function measure() {
    frame = 0;
    const rects = [...document.querySelectorAll<HTMLElement>(selectors)]
      .map(element => element.getBoundingClientRect())
      .filter(rect => rect.width > 0 && rect.height > 0)
      .map(rect => new DOMRect(Math.max(0,rect.x),Math.max(0,rect.y),
        Math.max(0,Math.min(innerWidth,rect.right)-Math.max(0,rect.x)),
        Math.max(0,Math.min(innerHeight,rect.bottom)-Math.max(0,rect.y))));
    report(rects.filter((rect,index) => rect.width > 0 && rect.height > 0 &&
      !rects.some((outer,other) => other < index && outer.left <= rect.left &&
        outer.top <= rect.top && outer.right >= rect.right && outer.bottom >= rect.bottom)));
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure);
  }
  const resize = new ResizeObserver(schedule);
  const changes = new MutationObserver(() => {
    resize.disconnect();
    document.querySelectorAll(selectors).forEach(element => resize.observe(element));
    schedule();
  });
  changes.observe(document.getElementById('root')!, { childList: true, subtree: true,
    attributes: true, attributeFilter: ['class', 'style'] });
  document.querySelectorAll(selectors).forEach(element => resize.observe(element));
  window.addEventListener('resize', schedule);
  document.addEventListener('scroll', schedule, true);
  // Native bounds changes and CSS transitions can move controls without resizing
  // them. Refresh the final positions even while no DOM mutation is delivered.
  const refresh = window.setInterval(schedule, 100);
  schedule();
  return () => {
    cancelAnimationFrame(frame); changes.disconnect(); resize.disconnect();
    window.removeEventListener('resize', schedule);
    document.removeEventListener('scroll', schedule, true);
    clearInterval(refresh);
  };
}
