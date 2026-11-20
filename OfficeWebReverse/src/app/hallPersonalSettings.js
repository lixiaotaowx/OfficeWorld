import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
import { L as LiveLookPreview } from '../chunks/LiveLookPreview.js';
import { x as COLOR_PALETTE, S as ACCESSORY_CATEGORIES, y as ACCESSORY_OPTIONS } from '../chunks/chatLocal.js';
import { z as getNotificationSound, M as NOTIFICATION_SOUNDS, A as setNotificationSound, B as previewNotificationSound, C as requestNotifications } from '../chunks/hostStateProtocol.js';
import { ACCESSORY_LABELS, SettingRow, SettingGroup } from './hallSettingsParts.js';
function AppearanceSettings({
  value: r,
  onChange: e
}) {
  const [t, s] = React.useState(!1);
  return jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [jsxRuntime.jsxs("div", {
      className: "settings-look-live",
      children: [jsxRuntime.jsx(LiveLookPreview, {
        value: r,
        face: t
      }), jsxRuntime.jsxs("div", {
        className: "settings-look-caption",
        children: [jsxRuntime.jsx("strong", {
          children: "实时预览"
        }), jsxRuntime.jsx("p", {
          children: "修改即刻显示，向下挑选配饰时也能看见。"
        }), jsxRuntime.jsxs("div", {
          className: "chips",
          role: "group",
          "aria-label": "预览视角",
          children: [jsxRuntime.jsx("button", {
            type: "button",
            "aria-pressed": !t,
            onClick: () => s(!1),
            children: "全身"
          }), jsxRuntime.jsx("button", {
            type: "button",
            "aria-pressed": t,
            onClick: () => s(!0),
            children: "配饰特写"
          })]
        })]
      })]
    }), jsxRuntime.jsx(SettingGroup, {
      title: "颜色",
      children: jsxRuntime.jsx("div", {
        className: "sw2",
        children: COLOR_PALETTE.map(i => jsxRuntime.jsx("button", {
          type: "button",
          title: i.label,
          "aria-label": i.label,
          "aria-pressed": r.color === i.id,
          style: {
            background: i.hex
          },
          onClick: () => e({
            ...r,
            color: i.id
          })
        }, i.id))
      })
    }), ["hair", "hat", "glasses", "beard"].filter(i => ACCESSORY_CATEGORIES.includes(i)).map(i => jsxRuntime.jsx(SettingGroup, {
      title: ACCESSORY_LABELS[i],
      children: jsxRuntime.jsx("div", {
        className: "chips",
        children: ACCESSORY_OPTIONS[i].map(n => jsxRuntime.jsx("button", {
          type: "button",
          "aria-pressed": r.accessories[i] === n.id,
          onClick: () => e({
            ...r,
            accessories: {
              ...r.accessories,
              [i]: n.id
            }
          }),
          children: n.label
        }, n.id))
      })
    }, i)), jsxRuntime.jsx("small", {
      className: "muted",
      children: "改动马上生效，Dock 头像也会一起换。"
    })]
  });
}
function NotificationSettings() {
  const [r, e] = React.useState("Notification" in window ? Notification.permission : "unsupported"),
    [t, s] = React.useState(getNotificationSound),
    [i, n] = React.useState(""),
    o = React.useRef(() => {});
  return React.useEffect(() => () => o.current(), []), jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [jsxRuntime.jsxs(SettingGroup, {
      title: "消息提示音",
      children: [jsxRuntime.jsx("p", {
        className: "settings-note",
        children: "12 种动物短拟声，选择后立即生效并保存在本机。来电铃声不受影响。"
      }), jsxRuntime.jsx("div", {
        className: "settings-sounds",
        children: NOTIFICATION_SOUNDS.map(([a, l]) => jsxRuntime.jsxs("div", {
          className: "settings-sound",
          children: [jsxRuntime.jsxs("button", {
            type: "button",
            "aria-pressed": t === a,
            onClick: () => {
              if (!setNotificationSound(a)) {
                n("保存失败，请检查本机存储后重试。");
                return;
              }
              s(a), n(""), o.current(), o.current = previewNotificationSound(a);
            },
            children: [l, jsxRuntime.jsx("small", {
              children: t === a ? "已选择" : "选择"
            })]
          }), jsxRuntime.jsx("button", {
            type: "button",
            "aria-label": `试听${l}`,
            onClick: () => {
              o.current(), o.current = previewNotificationSound(a);
            },
            children: "试听"
          })]
        }, a))
      }), i && jsxRuntime.jsx("p", {
        role: "alert",
        children: i
      })]
    }), jsxRuntime.jsx(SettingGroup, {
      title: "系统通知",
      children: jsxRuntime.jsx(SettingRow, {
        label: r === "granted" ? "已经打开" : r === "denied" ? "被系统挡住了" : "来电、会议邀请和新消息",
        sub: r === "denied" ? "在系统或浏览器的通知设置里允许 iruler dream" : "有声音提醒；自己发的和以前的消息不响",
        children: r !== "granted" && r !== "unsupported" && jsxRuntime.jsx("button", {
          type: "button",
          onClick: async () => {
            await requestNotifications(), e("Notification" in window ? Notification.permission : "unsupported");
          },
          children: "打开"
        })
      })
    })]
  });
}
function FileSettings() {
  var s;
  const r = (s = window.officeDesktop) == null ? void 0 : s.files,
    [e, t] = React.useState("");
  return React.useEffect(() => {
    var i;
    (i = r == null ? void 0 : r.settings) == null || i.call(r).then(n => t(String((n == null ? void 0 : n.receiveDir) || ""))).catch(() => {});
  }, [r]), r != null && r.settings ? jsxRuntime.jsxs(SettingGroup, {
    title: "接收和保存",
    children: [jsxRuntime.jsx(SettingRow, {
      label: "收文件的文件夹",
      sub: e || "读取中…",
      children: jsxRuntime.jsx("button", {
        type: "button",
        onClick: async () => {
          var n;
          const i = await ((n = r.chooseFolder) == null ? void 0 : n.call(r));
          i != null && i.receiveDir && t(String(i.receiveDir));
        },
        children: "更改"
      })
    }), jsxRuntime.jsx(SettingRow, {
      label: "打开这个文件夹",
      children: jsxRuntime.jsx("button", {
        type: "button",
        onClick: () => {
          var i;
          return void ((i = r.openFolder) == null ? void 0 : i.call(r, e));
        },
        children: "打开"
      })
    })]
  }) : jsxRuntime.jsx(SettingGroup, {
    title: "接收和保存",
    children: jsxRuntime.jsx(SettingRow, {
      label: "在浏览器里",
      sub: "同事发来的文件会下载到浏览器的下载文件夹。装了桌面客户端可以自己选文件夹"
    })
  });
}

export { AppearanceSettings, NotificationSettings, FileSettings };
