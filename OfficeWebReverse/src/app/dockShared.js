import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
const GreetingAvatar = React.lazy(() => import("../chunks/DockGreetingAvatar.js")),
  DOCK_ICONS = {
    mic: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"
      })
    }),
    micOff: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M15 10.6V5a3 3 0 0 0-5.9-.8L15 10.6ZM19 11h-2c0 .8-.2 1.5-.5 2.2l1.5 1.5A7 7 0 0 0 19 11ZM4.3 3 3 4.3l6 6V11a3 3 0 0 0 4.4 2.6l1.5 1.5A5 5 0 0 1 7 11H5a7 7 0 0 0 6 6.9V21h2v-3.1c1-.1 1.9-.5 2.7-1l3 3L20 18.7 4.3 3Z"
      })
    }),
    screen: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M3 4h18v12H3zM8 20h8v-2H8z"
      })
    }),
    clip: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3l8-8"
      })
    }),
    close: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M6 6l12 12M18 6 6 18"
      })
    }),
    grow: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"
      })
    }),
    shrink: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"
      })
    }),
    leave: jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      children: jsxRuntime.jsx("path", {
        d: "M12 9c-1.6 0-3.1.3-4.6.8v3.1c0 .4-.2.7-.6.9-1 .5-1.9 1.1-2.6 1.8-.2.2-.4.3-.7.3s-.5-.1-.7-.3L.3 13.1A1 1 0 0 1 0 12.4c0-.3.1-.5.3-.7C3.3 8.8 7.5 7 12 7s8.7 1.8 11.7 4.7c.2.2.3.4.3.7s-.1.5-.3.7l-2.5 2.5c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.8-.7-1.7-1.3-2.6-1.8-.3-.2-.6-.5-.6-.9V9.8C15.1 9.3 13.6 9 12 9Z"
      })
    })
  },
  sendDockAction = (t, s = "", n) => {
    var c, r, i;
    return void ((i = (r = (c = window.officeDock) == null ? void 0 : c.action) == null ? void 0 : r.call(c, t, s, void 0, n)) == null ? void 0 : i.catch(() => {}));
  },
  formatTransferSize = t => t > 1e6 ? `${(t / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(t / 1e3))} KB`;
function describeGatherAction(t, s) {
  var r;
  const n = (r = t.meeting) == null ? void 0 : r.active,
    c = (t.huddles || [])[0];
  return s.length ? {
    label: n ? "拉大家进来" : "叫大家围过来",
    title: `会响铃：${s.map(i => i.name).join("、")}`,
    off: !1
  } : c && !n ? {
    label: "加入他们",
    title: `${c.members.map(i => i.name).join("、")}正在聊`,
    off: !1
  } : n ? {
    label: "大家都在了",
    title: "在座又空着的人都叫过了",
    off: !0
  } : {
    label: "开始会议",
    title: "先进入会议，其他人可以稍后加入",
    off: !1
  };
}
function DockRadar() {
  return jsxRuntime.jsxs("div", {
    className: "dk-radar",
    "aria-hidden": "true",
    children: [jsxRuntime.jsx("i", {}), jsxRuntime.jsx("i", {}), jsxRuntime.jsx("i", {})]
  });
}
const unreadThreadKey = t => `${t.id}:${t.at}:${t.unread}`;
function pickMissedThread(t, s, n) {
  var c;
  return (((c = t.chat) == null ? void 0 : c.threads) || []).filter(r => r.unread > 0 && r.id !== s && n[r.id] !== unreadThreadKey(r)).sort((r, i) => i.at - r.at)[0] || null;
}
function useDockScreenVideo(t, s = !0) {
  const n = React.useRef(null),
    [c, r] = React.useState("正在接收画面…"),
    [i, o] = React.useState(0);
  return React.useEffect(() => {
    if (!s) {
      r("");
      return;
    }
    if (!t.streamId) {
      r("语音通话中，对方尚未共享屏幕");
      return;
    }
    const d = n.current,
      m = window.officeDock;
    if (!d || !(m != null && m.onVideo) || !m.videoWant || typeof MediaSource > "u") {
      r("此客户端暂不支持小窗视频，请更新客户端");
      return;
    }
    let h = !0,
      k = "",
      f = "",
      b,
      g,
      R = [],
      N = 0;
    const C = () => {
        R = [], N = 0, g = void 0, f && URL.revokeObjectURL(f), f = "", b = void 0;
      },
      I = () => {
        h && r("画面连接中断，点击重试");
      },
      j = () => {
        if (!(!h || !g || g.updating || (b == null ? void 0 : b.readyState) !== "open")) try {
          if (g.buffered.length && d.currentTime - g.buffered.start(0) > 12) {
            g.remove(0, d.currentTime - 6);
            return;
          }
          const T = R.shift();
          if (T && (N -= T.byteLength, g.appendBuffer(T)), d.buffered.length) {
            const D = d.buffered.end(d.buffered.length - 1);
            D - d.currentTime > 1.8 && (d.currentTime = Math.max(0, D - .5)), d.play().catch(I);
          }
        } catch {
          I();
        }
      };
    r("正在接收画面…");
    const _ = m.onVideo(T => {
        if (!(!h || T.id !== t.id)) {
          if (T.reset) {
            if (C(), k = T.epoch, !MediaSource.isTypeSupported(T.mime)) {
              I();
              return;
            }
            const D = new MediaSource();
            b = D, f = URL.createObjectURL(D), d.src = f, D.addEventListener("sourceopen", () => {
              if (!(!h || b !== D)) try {
                g = D.addSourceBuffer(T.mime), g.addEventListener("updateend", j), g.addEventListener("error", I), j();
              } catch {
                I();
              }
            }, {
              once: !0
            });
          }
          if (!(T.epoch !== k || !T.bytes)) {
            if (N += T.bytes.byteLength, N > 12 * 1024 ** 2) {
              C(), I();
              return;
            }
            R.push(T.bytes), j();
          }
        }
      }),
      V = () => r("");
    d.addEventListener("playing", V), d.addEventListener("error", I), m.videoWant(t.id).catch(I);
    const W = setTimeout(() => {
      d.videoWidth || I();
    }, 15e3);
    return () => {
      var T;
      h = !1, _(), clearTimeout(W), d.removeEventListener("playing", V), d.removeEventListener("error", I), (T = m.videoWant) == null || T.call(m, "-" + t.id).catch(() => {}), d.pause(), d.removeAttribute("src"), d.load(), C();
    };
  }, [t.id, t.streamId, i, s]), {
    video: n,
    status: c,
    retry: () => o(d => d + 1)
  };
}
const GreetingAvatarMount = React.lazy(() => import("../chunks/DockGreetingAvatar.js")),
  EMPTY_DOCK_STATE = {
    people: [],
    sharing: !1,
    missed: 0,
    hidden: !1
  },
  PREVIEW_REFRESH_MS = 800,
  PREVIEW_TIMEOUT_MS = 15e3;

export { DOCK_ICONS, sendDockAction, formatTransferSize, describeGatherAction, GreetingAvatar, GreetingAvatarMount, EMPTY_DOCK_STATE, PREVIEW_REFRESH_MS, PREVIEW_TIMEOUT_MS, unreadThreadKey, pickMissedThread, useDockScreenVideo, DockRadar };
