import { $n } from '../app/dockChatPanel.js';
import { Vn } from '../app/dockRoot.js';
import { collectDroppedFiles as Dt, describeDragSelection as Lt, observeDockRects as Qt, computePanelBottom as en, measureDockWindow as kt, clampPanelHeight as tn, clampPanelLeft as nn, useDockHover as sn } from '../app/dockGeometry.js';
import { readAvatarAppearance as Ye } from '../app/dockAvatarArt.js';
import { AvatarCanvas as Ie, PersonChip as hn, RoundTableChip as mn } from '../app/dockAvatarCanvas.js';
import { mentionedMembers as bn, insertMentionText as It, MessageBody as yn, formatTimestampLabel as jn, isNewChatDay as wn, formatChatTime as Cn } from '../app/dockMessageText.js';
import { ChatTransferCard as En, DockFileEntry as Mn } from '../app/dockTransferCards.js';
import { ChatComposer as Sn } from '../app/dockComposer.js';
import { PendingImagePreview as In, CallCard as Rn } from '../app/dockCallPanels.js';
import { DOCK_ICONS as ae, sendDockAction as G, formatTransferSize as Dn, describeGatherAction as Ln, GreetingAvatar as Nn, GreetingAvatarMount as On, EMPTY_DOCK_STATE as Wn, PREVIEW_REFRESH_MS as _n, PREVIEW_TIMEOUT_MS as Un, unreadThreadKey as st, pickMissedThread as zn, DockRadar as Pn } from '../app/dockShared.js';
import { ScreenShareButton as At, ScreenViewer as wt } from '../app/dockScreenViewer.js';
import { D as Et, M as Mt } from "./chatLocal.js";
import { r as u, j as e, c as Le, P as ie, u as _t, i as ke, d as Ut, b as xt, f as Kt, l as Gt, g as pt, h as Yt, k as Zt, M as Jt } from "./dockGreeting.js";






















































const gn = t => {
  const s = Math.floor(t / 6e4),
    n = Math.floor(t / 1e3) % 60;
  return `${String(s).padStart(2,"0")}:${String(n).padStart(2,"0")}`
};

function xn({
  huddle: t,
  people: s,
  mine: n,
  now: c,
  onClick: r,
  drag: i
}) {
  var h;
  const o = t.members.map(k => s.find(f => f.account === k.id) || {
      id: k.id,
      account: k.id,
      name: k.name,
      character: "",
      atDesk: !0,
      sharing: !1,
      inCall: !0,
      hasPreview: !1,
      unread: 0,
      missed: !1
    }),
    d = t.members.map(k => k.name).join("、"),
    m = (h = t.members.find(k => k.id === t.sharing)) == null ? void 0 : h.name;
  return e.jsxs("button", {
    type: "button",
    "data-huddle": t.id,
    className: "dk-bubble" + (n ? " mine" : ""),
    onClick: r,
    "aria-label": n ? `我的通话：${d}` : `${d}正在聊，点一下加入`,
    title: n ? "点开通话控制，或把头像拖进来拉人" : `${d}正在聊${m?` · ${m}在共享屏幕`:""} · 点一下加入`,
    ...i,
    children: [o.map(k => e.jsx(Ie, {
      person: k,
      size: 22
    }, k.id)), t.ringing.length > 0 && e.jsx("span", {
      className: "dk-ringing",
      "aria-hidden": "true",
      children: "·".repeat(Math.min(3, t.ringing.length))
    }), t.sharing && e.jsx("svg", {
      className: "dk-sharing",
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      children: e.jsx("path", {
        fill: "currentColor",
        d: "M3 4h18v12H3zM8 20h8v-2H8z"
      })
    }), e.jsx("span", {
      className: "dk-time",
      children: gn(Math.max(0, c - t.since))
    })]
  })
}



































function Tn({
  me: t,
  onClose: s,
  quick: n = !1
}) {
  return e.jsxs("section", {
    className: "dock-card dk-fly dk-me",
    role: "dialog",
    "aria-label": "我",
    children: [e.jsxs("header", {
      children: [e.jsx("strong", {
        children: n ? "快捷操作" : t.name
      }), e.jsx("small", {
        children: t.status || (t.atDesk ? "在座" : "离开")
      }), e.jsx("button", {
        type: "button",
        className: "dk-icon",
        title: "收起（Esc）",
        "aria-label": "收起",
        onClick: s,
        children: ae.close
      })]
    }), !n && e.jsxs("div", {
      className: "dk-profile",
      children: [e.jsx(Ie, {
        person: t,
        size: 56
      }), e.jsxs("div", {
        children: [e.jsx("strong", {
          children: t.name
        }), e.jsx("p", {
          children: t.status || (t.atDesk ? "在座 · 这是你的个人面板" : "离开座位")
        })]
      })]
    }), e.jsxs("div", {
      className: "dk-menu",
      children: [e.jsxs("button", {
        type: "button",
        onClick: () => {
          G("status", t.id), s()
        },
        children: ["写个状态", e.jsx("small", {
          children: t.status ? "改一下" : "别人在你脸上看到"
        })]
      }), t.status && e.jsx("button", {
        type: "button",
        onClick: () => {
          G("status-clear", t.id), s()
        },
        children: "清除状态"
      }), e.jsxs("button", {
        type: "button",
        onClick: () => {
          G("focus", t.id), s()
        },
        children: ["去办公室走走", e.jsx("small", {
          children: "打开 3D 空间"
        })]
      }), e.jsx("button", {
        type: "button",
        onClick: () => {
          G("focus", t.id), s()
        },
        children: "设置"
      })]
    })]
  })
}

function An({
  person: t,
  image: s,
  waiting: n
}) {
  return e.jsx("div", {
    className: "dock-card dk-peek",
    "aria-hidden": "true",
    children: s ? e.jsx("img", {
      src: s,
      alt: ""
    }) : e.jsx("span", {
      children: t.hasPreview ? n ? "正在读取工位预览…" : "暂未收到画面，正在重试。点击头像仍可打开聊天。" : "访客不提供屏幕预览"
    })
  })
}

function Tt({
  name: t,
  text: s,
  person: n,
  action: c,
  onAccept: r,
  onDismiss: i,
  busy: o = !1,
  showAvatar: d = !0
}) {
  return e.jsxs("div", {
    className: "dk-greeting",
    role: "region",
    "aria-label": `${t}的提醒`,
    children: [d && e.jsx(u.Suspense, {
      fallback: e.jsx("div", {
        className: "dk-greeting-avatar"
      }),
      children: e.jsx(Nn, {
        appearance: n ? Ye(n) : Et
      })
    }), e.jsxs("div", {
      className: "dock-card dk-invite",
      role: "status",
      children: [e.jsx("button", {
        className: "dk-greeting-face",
        "aria-label": `${c}：${t}`,
        disabled: o,
        onClick: r,
        children: n ? e.jsx(Ie, {
          person: n,
          size: 36
        }) : e.jsx("span", {
          "aria-hidden": "true",
          children: "@"
        })
      }), e.jsxs("div", {
        className: "dk-invite-copy",
        children: [e.jsx("b", {
          children: t
        }), e.jsx("span", {
          children: s
        })]
      }), e.jsx("button", {
        type: "button",
        className: "yes",
        disabled: o,
        onClick: r,
        children: c
      }), e.jsx("button", {
        type: "button",
        disabled: o,
        onClick: i,
        children: "稍后"
      })]
    })]
  })
}

function Bn({
  call: t,
  person: s,
  busy: n,
  onAnswer: c
}) {
  return e.jsx(Tt, {
    name: t.name,
    text: t.text,
    person: s,
    busy: n,
    action: t.meeting ? "加入会议" : "接听",
    onAccept: () => c(!0),
    onDismiss: () => c(!1)
  })
}













const Ct = document.getElementById("root");
Ct && Kt.createRoot(Ct).render(e.jsx(Vn, {}));
export { Tn, An, Tt, Bn, xn };
