const sourceByTrack = new WeakMap(),
  activeTracks = new Map();
let pickingScreen = !1,
  indicatorTimer,
  shownSources;
const getDesktopIndicator = () => {
  var i;
  return typeof window > "u" || (i = window.officeDesktop) == null ? void 0 : i.screenShareIndicator;
};
async function captureWithSource(i, e) {
  var s;
  const t = getDesktopIndicator();
  if (!t) return i();
  if (pickingScreen) throw Error("已经打开了一个选屏幕的窗口，等一下再试");
  pickingScreen = !0;
  let n;
  try {
    const r = (s = window.officeDesktop) == null ? void 0 : s.displays;
    if (r && !(await r()).some(c => c.selected)) throw Error("设置里保存的屏幕当前不可用，请先选择可用屏幕");
    n = await i();
    const a = await t.source();
    if (!a) throw Error("认不出共享的是哪块屏幕，再选一次");
    for (const o of e(n)) o.kind === "video" && sourceByTrack.set(o, a);
    return n;
  } catch (r) {
    throw n !== void 0 && e(n).forEach(a => a.stop()), r;
  } finally {
    pickingScreen = !1;
  }
}
function cloneScreenTrack(i) {
  const e = i.clone(),
    t = sourceByTrack.get(i);
  return t && sourceByTrack.set(e, t), e;
}
function removeIndicatorTrack(i) {
  const e = activeTracks.get(i);
  e && i.removeEventListener("ended", e), activeTracks.delete(i);
}
function refreshIndicator() {
  for (const n of activeTracks.keys()) n.readyState === "ended" && removeIndicatorTrack(n);
  const i = [...new Set([...activeTracks.keys()].map(n => sourceByTrack.get(n)))].sort(),
    e = JSON.stringify(i),
    t = getDesktopIndicator();
  t && e !== shownSources && (shownSources = e, t.show(i).catch(() => {
    shownSources === e && (shownSources = void 0);
  })), activeTracks.size || (clearInterval(indicatorTimer), indicatorTimer = void 0);
}
function showScreenTrack(i) {
  if (!sourceByTrack.has(i) || i.readyState === "ended" || activeTracks.has(i)) return;
  const e = () => hideScreenTrack(i);
  activeTracks.set(i, e), i.addEventListener("ended", e, {
    once: !0
  }), indicatorTimer ?? (indicatorTimer = setInterval(refreshIndicator, 250)), refreshIndicator();
}
function hideScreenTrack(i) {
  activeTracks.has(i) && (removeIndicatorTrack(i), refreshIndicator());
}
function replaceIndicatorTrack(i, e) {
  activeTracks.has(i) && (removeIndicatorTrack(i), showScreenTrack(e), refreshIndicator());
}

export { captureWithSource, cloneScreenTrack, showScreenTrack, hideScreenTrack, replaceIndicatorTrack };
