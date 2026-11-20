import { r as React, j as jsxRuntime, e as createScreenScaler, D as DEFAULT_INK_COLOR, S as personColor } from '../chunks/dockGreeting.js';
import { S as ScreenPicker } from '../chunks/ScreenPicker.js';
import { useDockScreenVideo } from './dockShared.js';
function ScreenShareButton({
  screen: t,
  state: s,
  className: n
}) {
  var r;
  const c = t.meeting ? s.meeting : (r = s.privateCalls) == null ? void 0 : r.sessions.find(i => i.id === t.sessionId);
  return jsxRuntime.jsx("button", {
    type: "button",
    className: n,
    disabled: t.busy,
    title: c != null && c.sharing ? "停止共享我的屏幕" : "共享我的屏幕，接替当前分享",
    onClick: () => {
      var i, o;
      (o = (i = window.officeDock) == null ? void 0 : i.action) == null || o.call(i, "screen-control", t.id, void 0, {
        text: "share"
      });
    },
    children: c != null && c.sharing ? "退出共享" : "抢占屏幕分享"
  });
}
function ScreenViewer({
  screen: t,
  state: s,
  compact: n = !1,
  showTitle: c = !0,
  pictureHeight: r
}) {
  var $;
  const [i, o] = React.useState(!1),
    [d, m] = React.useState(!1),
    {
      video: h,
      status: k,
      retry: f
    } = useDockScreenVideo(t, n || !i),
    b = React.useRef(null),
    [g] = createScreenScaler(b, !!t.streamId && (n || !i), t.streamId),
    [R, N] = React.useState(!1),
    [C, I] = React.useState(!1),
    [j, _] = React.useState(DEFAULT_INK_COLOR),
    [V, W] = React.useState([]),
    [T, D] = React.useState(16 / 9),
    w = React.useRef([]),
    E = React.useRef(!1),
    L = t.meeting ? s.meeting : ($ = s.privateCalls) == null ? void 0 : $.sessions.find(S => S.id === t.sessionId),
    U = S => {
      var O, F;
      (F = (O = window.officeDock) == null ? void 0 : O.action) == null || F.call(O, "screen-control", t.id, void 0, {
        text: S
      });
    },
    K = (S, O = !1) => {
      var F, oe;
      (oe = (F = window.officeDock) == null ? void 0 : F.action) == null || oe.call(F, "screen-ink", t.id, void 0, {
        text: JSON.stringify({
          action: S,
          points: w.current,
          done: O,
          color: j
        })
      }), w.current = [];
    },
    p = S => {
      const O = S.currentTarget.getBoundingClientRect();
      return [Math.max(0, Math.min(1, (S.clientX - O.left) / O.width)), Math.max(0, Math.min(1, (S.clientY - O.top) / O.height))];
    };
  return jsxRuntime.jsxs("div", {
    className: "dk-screen" + (n ? " dk-screen-compact" : ""),
    "aria-label": t.name,
    children: [!n && (c || t.own) && jsxRuntime.jsxs("div", {
      className: "dk-screen-title",
      children: [c && jsxRuntime.jsx("strong", {
        children: t.name
      }), t.own && jsxRuntime.jsxs(jsxRuntime.Fragment, {
        children: [jsxRuntime.jsx("button", {
          type: "button",
          "aria-expanded": !i,
          onClick: () => o(S => !S),
          children: i ? "展开" : "最小化"
        }), jsxRuntime.jsx("button", {
          type: "button",
          "aria-expanded": d,
          onClick: () => m(S => !S),
          children: "切换屏幕"
        }), i && jsxRuntime.jsx("button", {
          type: "button",
          disabled: t.busy,
          onClick: () => U("share"),
          children: "停止共享"
        })]
      })]
    }), !n && t.own && d && jsxRuntime.jsx(ScreenPicker, {
      bridge: window.officeDock,
      onSelected: () => m(!1)
    }), jsxRuntime.jsxs("div", {
      hidden: !n && i,
      children: [jsxRuntime.jsx("div", {
        className: "dk-screen-scroll",
        style: r && !n ? {
          maxHeight: r
        } : void 0,
        children: jsxRuntime.jsx("div", {
          ref: b,
          className: "dk-screen-picture",
          title: "向上滚动放大画面，向下滚动缩小",
          style: {
            width: n ? "100%" : r ? `min(100%, ${r * T}px)` : "100%",
            aspectRatio: n ? 16 / 9 : T
          },
          children: jsxRuntime.jsxs("div", {
            className: "dk-screen-content",
            style: {
              transform: `scale(${g})`
            },
            children: [jsxRuntime.jsx("video", {
              ref: h,
              autoPlay: !0,
              muted: !0,
              playsInline: !0,
              "aria-label": t.name,
              onLoadedMetadata: S => {
                S.currentTarget.videoHeight && D(S.currentTarget.videoWidth / S.currentTarget.videoHeight);
              }
            }), !n && R && jsxRuntime.jsx("svg", {
              viewBox: "0 0 1000 562.5",
              preserveAspectRatio: "none",
              "aria-label": "在共享画面上标注",
              onPointerDown: S => {
                S.currentTarget.setPointerCapture(S.pointerId), E.current = !0;
                const O = p(S);
                w.current = [O], W([O]), K("draw");
              },
              onPointerMove: S => {
                if (!E.current) return;
                const O = p(S);
                w.current.push(O), W(F => [...F.slice(-1e3), O]), w.current.length >= 6 && K("draw");
              },
              onPointerUp: S => {
                E.current && (w.current.push(p(S)), K("draw", !0), E.current = !1, W([]));
              },
              onPointerCancel: () => {
                E.current && K("draw", !0), E.current = !1, W([]);
              },
              children: jsxRuntime.jsx("polyline", {
                points: V.map(([S, O]) => `${S * 1e3},${O * 562.5}`).join(" "),
                fill: "none",
                stroke: j,
                strokeWidth: "3"
              })
            })]
          })
        })
      }), k && jsxRuntime.jsxs("div", {
        className: "dk-screen-status",
        role: "status",
        children: [k, k === "画面连接中断，点击重试" && jsxRuntime.jsx("button", {
          type: "button",
          onClick: f,
          children: "重试"
        })]
      }), t.error && jsxRuntime.jsx("div", {
        className: "dk-screen-status",
        role: "alert",
        children: t.error
      }), !n && jsxRuntime.jsxs("div", {
        className: "dk-screen-tools",
        children: [jsxRuntime.jsx("button", {
          type: "button",
          disabled: t.busy,
          "aria-pressed": (L == null ? void 0 : L.mic) === !0,
          onClick: () => U("mute"),
          children: L != null && L.mic ? "麦克风开" : "麦克风关"
        }), jsxRuntime.jsx("button", {
          type: "button",
          "aria-pressed": C,
          onClick: () => {
            U(C ? "listen" : "silence"), I(S => !S);
          },
          children: C ? "恢复声音" : "静音对方"
        }), jsxRuntime.jsx(ScreenShareButton, {
          screen: t,
          state: s
        }), jsxRuntime.jsx(personColor, {
          enabled: t.annotatable && !!t.streamId,
          own: t.own,
          active: R,
          color: j,
          onToggle: () => {
            N(S => !S), E.current = !1;
          },
          onColor: _,
          onUndo: () => K("undo"),
          onClear: () => K("clear")
        }), jsxRuntime.jsx("button", {
          type: "button",
          disabled: t.busy,
          className: "dk-screen-end",
          onClick: () => U("end"),
          children: t.meeting ? "离开通话" : "挂断"
        })]
      })]
    })]
  });
}

export { ScreenShareButton, ScreenViewer };
