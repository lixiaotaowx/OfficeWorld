import { showScreenTrack as Qt, cloneScreenTrack as Xs } from './screenShareIndicator.js';
import { stopPublishedScreen as tn } from './mediaPublishing.js';
import { SignalBars as tl } from './SignalBars.js';

import { CallAlerts as nl } from './CallAlerts.js';
import { LocalVideo as il, ScreenStage as ws } from './ScreenStage.js';
import { H as si, a as jo, j as v, o as pt, q as Ei, r as I, s as mn, t as fn } from '../chunks/dockGreeting.js';
import { Hc, Vn } from './standalone.js';

import { ki as publishScreenAudio } from './screen-share.js';
import { Track } from '../vendor/livekit.js';

function MeetingScreenView({
  stream: i,
  label: e,
  onClose: t,
  signal: n,
  scope: s,
  annotation: r,
  selfColor: a,
  annotatable: o,
  own: c = !1,
  shareControl: d
}) {
  const [l, u] = I.useState(!1);
  I.useEffect(() => {
    if (u(!1), i) return;
    const f = setTimeout(() => u(!0), 15e3);
    return () => clearTimeout(f);
  }, [i]), I.useEffect(() => {
    if (!i) return;
    const f = i.getVideoTracks()[0];
    if (!f || f.readyState === "ended") {
      t();
      return;
    }
    return f.addEventListener("ended", t), () => f.removeEventListener("ended", t);
  }, [i, t]);
  const h = v.jsx("button", {
      type: "button",
      disabled: d.busy,
      onClick: d.onToggle,
      title: d.sharing ? "停止共享我的屏幕" : "共享我的屏幕，接替当前分享",
      children: d.sharing ? "退出共享" : "抢占屏幕分享"
    }),
    m = d.error && v.jsx("span", {
      className: "screen-stage-action-error",
      role: "alert",
      children: d.error
    });
  return i ? v.jsx(ws, {
    stream: i,
    scope: s,
    label: e,
    selfColor: a,
    annotatable: o && !c,
    clearsOwnBoard: c,
    initialFullscreen: !0,
    onExitFullscreen: t,
    actions: v.jsxs(v.Fragment, {
      children: [h, m, v.jsx("button", {
        onClick: t,
        children: "回到 Dock"
      }), n ? v.jsx(tl, {
        state: n.state,
        summary: n.summary,
        title: "会议连接情况"
      }) : v.jsx("span", {
        className: "screen-stage-signal-wait",
        children: "检查信号中…"
      })]
    }),
    onDraw: r.draw,
    onClear: r.clear,
    onUndo: r.undo
  }) : jo.createPortal(v.jsxs("section", {
    className: "meeting-screen-wait",
    role: "dialog",
    "aria-label": e,
    children: [v.jsx("h2", {
      children: e
    }), v.jsx("p", {
      role: "status",
      children: l ? "还没收到画面，请对方确认共享仍在进行，或重新共享一次。语音通话不受影响。" : "正在接收共享画面…"
    }), v.jsx("button", {
      type: "button",
      onClick: t,
      children: "回到 Dock"
    }), h, m]
  }), document.body);
}
;
function LocalSharePreview({
  stream: i,
  meeting: e,
  onStop: t,
  onOpen: n,
  onClear: s,
  scope: r
}) {
  var c;
  const [a, o] = I.useState(!1);
  return v.jsxs("aside", {
    className: "sharing-preview" + (a ? " collapsed" : ""),
    "aria-label": "我正在共享的画面",
    children: [v.jsxs("header", {
      children: [v.jsxs("strong", {
        children: [v.jsx("i", {}), e ? "正在给会议共享" : "正在共享"]
      }), v.jsx("button", {
        onClick: () => o(!a),
        "aria-expanded": !a,
        "aria-label": a ? "展开共享预览" : "收起共享预览",
        children: a ? "展开" : "收起"
      }), a && s && r && v.jsx("button", {
        className: "clear-board",
        onClick: () => s(r),
        children: "清掉标注"
      }), a && v.jsx("button", {
        className: "stop-sharing",
        onClick: t,
        children: "停止共享"
      })]
    }), v.jsx("div", {
      hidden: a,
      children: s && r ? v.jsx(ws, {
        stream: i,
        scope: r,
        label: "我正在共享的屏幕",
        clearsOwnBoard: !0,
        onClear: s,
        onDraw: () => {},
        onUndo: () => {}
      }) : v.jsx(il, {
        stream: i,
        label: "我正在共享的屏幕"
      })
    }), v.jsxs("footer", {
      children: [v.jsxs("small", {
        children: ["My screen · ", ((c = i.getVideoTracks()[0]) == null ? void 0 : c.label) || "Screen"]
      }), n && v.jsx("button", {
        onClick: n,
        children: "看会议"
      }), v.jsx("button", {
        className: "stop-sharing",
        onClick: t,
        children: "停止共享"
      })]
    })]
  });
}
;
var CALL_AUDIO_LABELS = {
  On: "开着",
  Muted: "静音",
  "Audio paused": "暂停（在另一个通话里）",
  Connecting: "连接中",
  "Not in a call": "不在通话",
  Switching: "切换中",
  Off: "关着"
};
function PrivateCallPanels({
  office: i,
  dockMode: e = !1
}) {
  const [t, n] = I.useState(null),
    [s, r] = I.useState(null),
    [a, o] = I.useState({}),
    c = i.outgoing.length === 0 && i.sessions.length > 0 && i.sessions.every(l => a[l.id] === !0),
    d = async (l, u) => {
      if (!t) {
        n(l);
        try {
          await i.respond(l, u);
        } finally {
          n(null);
        }
      }
    };
  return v.jsxs(v.Fragment, {
    children: [v.jsx(nl, {
      alerts: i.callAlerts,
      onDismiss: i.dismissCallAlert,
      onRetry: l => {
        i.dismissCallAlert(l.id), i.request(l.target, l.callKind);
      }
    }), v.jsx("div", {
      className: "incoming-calls",
      children: i.requests.map(l => v.jsx("div", {
        className: "incoming-call",
        children: v.jsxs("section", {
          className: "call-invite",
          role: "dialog",
          "aria-label": "来电",
          children: [v.jsx("div", {
            className: "call-avatar",
            children: v.jsx(Ei, {})
          }), v.jsxs("h2", {
            children: [l.name, l.kind === "voice" ? " 想和你语音通话" : l.offer ? " 想给你看屏幕，边看边聊" : " 想看看你的屏幕，边看边聊"]
          }), v.jsxs("p", {
            children: [l.kind === "screen" && !l.offer ? "接通后选一块要共享的屏幕。" : "接通后就能说话。", "麦克风随时可以静音。"]
          }), v.jsxs("div", {
            className: "actions",
            children: [v.jsxs("button", {
              disabled: !!t,
              onClick: () => void d(l.id, !1),
              children: [v.jsx(si, {}), "拒绝"]
            }), v.jsxs("button", {
              className: "primary",
              disabled: !!t,
              onClick: () => void d(l.id, !0),
              children: [v.jsx(Ei, {}), t === l.id ? "等待授权…" : "接受并接通"]
            })]
          })]
        })
      }, l.id))
    }), (!e && i.sessions.length > 0 || i.outgoing.length > 0) && v.jsxs("div", {
      className: "session-panel private-calls" + (c ? " folded" : ""),
      children: [i.outgoing.map(l => {
        var u;
        return v.jsxs("div", {
          children: [v.jsxs("span", {
            children: ["等 ", ((u = i.people.find(h => h.id === l.target)) == null ? void 0 : u.name) || "对方", " 回应", l.kind === "screen" ? " · 屏幕和语音" : " · 语音"]
          }), v.jsx("button", {
            onClick: () => i.cancelRequest(l.id),
            children: "取消邀请"
          })]
        }, l.id);
      }), (e ? [] : i.sessions).map(l => {
        const u = i.callStates[l.id],
          h = (u == null ? void 0 : u.voice) || "Connecting",
          m = i.people.find(S => S.id === l.peer),
          f = (m == null ? void 0 : m.annotate) === !0,
          p = a[l.id] === !0,
          _ = (m == null ? void 0 : m.name) || "对方",
          w = () => o(S => ({
            ...S,
            [l.id]: !p
          })),
          k = h === "On" ? "静音" : h === "Audio paused" ? "切到这个通话并打开麦克风" : "打开或重试麦克风",
          P = async () => {
            n(l.id);
            try {
              await i.mute(l.id);
            } finally {
              n(null);
            }
          },
          y = async () => {
            n(l.id);
            try {
              await i.shareInCall(l.id);
            } finally {
              n(null);
            }
          };
        return v.jsxs("div", {
          className: p ? "call-folded" : void 0,
          children: [v.jsxs("header", {
            className: "call-heading",
            children: [v.jsx("div", {
              className: "call-avatar",
              children: v.jsx(Ei, {})
            }), v.jsxs("div", {
              children: [v.jsx("small", {
                children: "通话"
              }), v.jsx("strong", {
                children: _
              })]
            }), v.jsx("i", {
              className: u != null && u.connected ? "call-live" : ""
            }), v.jsx("button", {
              className: "call-fold",
              "aria-expanded": !p,
              onClick: w,
              title: p ? `${_} · 展开通话窗口` : "收起成一排按钮",
              "aria-label": p ? `展开和 ${_} 的通话窗口` : "收起通话窗口",
              children: p ? "Expand" : "Collapse"
            })]
          }), p ? v.jsxs("div", {
            className: "private-call-actions folded",
            children: [v.jsx("button", {
              disabled: !(u != null && u.connected) || t === l.id,
              onClick: () => void P(),
              title: k,
              "aria-label": k,
              children: h === "On" ? v.jsx(mn, {}) : v.jsx(fn, {})
            }), u != null && u.sharing ? v.jsx("button", {
              onClick: i.stopShare,
              title: "停止共享",
              "aria-label": "停止共享",
              children: v.jsx(pt, {})
            }) : v.jsx("button", {
              disabled: !(u != null && u.connected) || !!t,
              onClick: () => void y(),
              title: "共享屏幕",
              "aria-label": "共享屏幕",
              children: v.jsx(pt, {})
            }), v.jsx("button", {
              className: "call-hangup",
              onClick: () => i.end(l.id),
              title: "挂断",
              "aria-label": "挂断",
              children: v.jsx(si, {})
            })]
          }) : v.jsxs(v.Fragment, {
            children: [v.jsxs("span", {
              role: "status",
              children: [u != null && u.connected ? "已接通" : "连接中", " · 麦克风：", CALL_AUDIO_LABELS[h] || h]
            }), v.jsx("span", {
              children: u != null && u.sharing ? "正在共享你的屏幕" : i.videos[l.id] ? "正在看对方的屏幕" : l.kind === "screen" ? "等对方的屏幕 · 语音照常" : "只有语音 · 没有在共享屏幕"
            }), i.videos[l.id] && v.jsx(ws, {
              stream: i.videos[l.id],
              scope: l.room,
              label: "共享的屏幕",
              selfColor: Vn(i.accountId),
              annotatable: f,
              onDraw: i.annotation.draw,
              onClear: i.annotation.clear,
              onUndo: i.annotation.undo,
              hint: u != null && u.sharing || !f ? void 0 : "点“标注”可以在共享的屏幕上画",
              actions: v.jsxs(v.Fragment, {
                children: [v.jsxs("button", {
                  disabled: !(u != null && u.connected) || t === l.id,
                  onClick: () => void P(),
                  children: [h === "On" ? v.jsx(mn, {}) : v.jsx(fn, {}), h === "On" ? "我静音" : "打开麦克风"]
                }), v.jsx("button", {
                  "aria-pressed": s === l.id,
                  title: "只影响这台电脑上听到的声音",
                  onClick: () => {
                    const S = s === l.id ? null : l.id;
                    r(S), i.setRemoteAudioMuted(l.room, S !== null);
                  },
                  children: s === l.id ? "听对方" : "不听对方"
                }), u != null && u.sharing ? v.jsxs("button", {
                  onClick: i.stopShare,
                  children: [v.jsx(pt, {}), "退出共享"]
                }) : v.jsxs("button", {
                  disabled: !(u != null && u.connected) || !!t,
                  onClick: () => void y(),
                  children: [v.jsx(pt, {}), t === l.id ? "选屏幕中…" : "抢占屏幕分享"]
                }), v.jsxs("button", {
                  className: "call-hangup",
                  onClick: () => i.end(l.id),
                  children: [v.jsx(si, {}), "挂断"]
                })]
              })
            }), v.jsxs("div", {
              className: "private-call-actions",
              children: [v.jsxs("button", {
                disabled: !(u != null && u.connected) || t === l.id,
                onClick: () => void P(),
                children: [h === "On" ? v.jsx(mn, {}) : v.jsx(fn, {}), k]
              }), (u == null ? void 0 : u.sharing) && v.jsxs("button", {
                onClick: i.stopShare,
                children: [v.jsx(pt, {}), "停止共享"]
              }), v.jsxs("button", {
                className: "call-hangup",
                onClick: () => i.end(l.id),
                children: [v.jsx(si, {}), "挂断"]
              }), !(u != null && u.sharing) && v.jsxs("button", {
                disabled: !(u != null && u.connected) || !!t,
                onClick: () => void y(),
                children: [v.jsx(pt, {}), t === l.id ? "选屏幕中…" : "共享屏幕"]
              })]
            }), (u == null ? void 0 : u.sharing) && i.videos["local-screen"] && i.boardScope && v.jsx(LocalSharePreview, {
              stream: i.videos["local-screen"],
              meeting: !1,
              scope: i.boardScope,
              onClear: i.annotation.clear,
              onStop: i.stopShare
            })]
          })]
        }, l.id);
      })]
    })]
  });
}
;
async function publishCapturedMeetingScreen(i, e, t, n) {
  const s = e.getVideoTracks()[0];
  if (!s || s.readyState !== "live") throw Error("屏幕共享停了");
  if (i.localParticipant.getTrackPublication(Track.Source.ScreenShare)) return;
  await Hc(i, () => t() && s.readyState === "live", e.getAudioTracks().length > 0);
  const r = Xs(s);
  try {
    await i.localParticipant.publishTrack(r, {
      name: "screen",
      source: Track.Source.ScreenShare
    });
  } catch (a) {
    throw r.stop(), a;
  }
  Qt(r), t() && s.readyState === "live" && (await publishScreenAudio(i, e.getAudioTracks()[0]).catch(() => n("屏幕共享了，但声音没发出去。停止共享再试"))), (!t() || s.readyState !== "live") && (await tn(i));
}
;

;
export { MeetingScreenView as hr, LocalSharePreview as Ko, CALL_AUDIO_LABELS as rl, PrivateCallPanels as ol, publishCapturedMeetingScreen as fp };
