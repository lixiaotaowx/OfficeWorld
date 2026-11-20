import { j as jsxRuntime } from '../chunks/dockGreeting.js';
import { getSignalLabel } from './signalLabels.js';
const getSignalBarCount = quality => ({
  unknown: 0,
  lost: 0,
  poor: 1,
  good: 2,
  excellent: 3,
})[quality];
function SignalBars({
  state: i,
  summary: e,
  title: t = "Meeting connection"
}) {
  const n = getSignalBarCount(i.quality),
    s = i.participants.map(r => r.name + ": " + getSignalLabel(r.quality)).join(`
`);
  return jsxRuntime.jsxs("span", {
    className: "signal-bars-panel",
    role: "status",
    title: t + ": " + e + (s ? `
` + s : ""),
    children: [jsxRuntime.jsx("span", {
      className: "signal-bars",
      "data-level": i.quality,
      "aria-hidden": "true",
      children: [1, 2, 3].map(r => jsxRuntime.jsx("i", {
        className: r <= n ? "on" : ""
      }, r))
    }), jsxRuntime.jsx("span", {
      children: e
    })]
  });
}

export { getSignalLabel, SignalBars };
