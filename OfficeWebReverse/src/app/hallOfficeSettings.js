import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
import { S as ScreenPicker } from '../chunks/ScreenPicker.js';
import { Q6 as getWorkstationSitter, S6 as describeWorkstation } from '../chunks/HallView.js';
import { SettingRow, SettingToggle, SettingGroup } from './hallSettingsParts.js';
function ScreenSettings({
  office: r
}) {
  const e = r.people.find(t => t.id === r.myId);
  return jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [window.officeDesktop && jsxRuntime.jsxs(SettingGroup, {
      title: "屏幕",
      children: [jsxRuntime.jsx(SettingRow, {
        label: "共享和预览用哪块屏幕",
        sub: "已保存在本机；下次启动、缩略图和视频共享都使用这块屏幕"
      }), jsxRuntime.jsx(ScreenPicker, {})]
    }), jsxRuntime.jsxs(SettingGroup, {
      title: "在不在工位",
      children: [jsxRuntime.jsx(SettingRow, {
        label: "离开的判断方式",
        sub: r.deskSensorLabel
      }), jsxRuntime.jsx(SettingRow, {
        label: "我的工位屏幕",
        sub: r.previewReason
      })]
    }), jsxRuntime.jsxs(SettingGroup, {
      title: "预览",
      children: [jsxRuntime.jsx(SettingToggle, {
        label: "看别人的工位预览",
        sub: "关掉可以省流量，你自己的预览照常给别人看",
        checked: (e == null ? void 0 : e.previewAllowed) ?? !0,
        disabled: !r.connected,
        onChange: t => r.setPreviewAllowed(t)
      }), !window.officeDesktop && !r.sharing && jsxRuntime.jsx(SettingRow, {
        label: "让工位屏幕显示我的画面",
        sub: "浏览器里要先允许共享屏幕",
        children: jsxRuntime.jsx("button", {
          type: "button",
          disabled: !r.connected,
          onClick: () => void r.share(),
          children: "允许"
        })
      })]
    })]
  });
}
function AccountSettings(r) {
  const {
      office: e,
      mySeat: t,
      isVisitor: s,
      update: i
    } = r,
    [n, o] = React.useState(null);
  React.useEffect(() => {
    var A;
    (A = window.officeDesktop) == null || A.readLogin().then(c => o(!!c)).catch(() => o(!1));
  }, []);
  const [a, l] = React.useState(!1);
  return jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [jsxRuntime.jsx(SettingGroup, {
      title: "工位",
      children: s ? jsxRuntime.jsx(SettingRow, {
        label: "访客",
        sub: "访客坐在休息区的沙发上，开会、聊天、通话和共享都能用"
      }) : t === null ? jsxRuntime.jsx(SettingRow, {
        label: "还没有工位",
        sub: "在大厅里点一张空着的工位坐下，就能设为你的",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: r.onMove,
          children: "去选"
        })
      }) : jsxRuntime.jsxs(jsxRuntime.Fragment, {
        children: [jsxRuntime.jsx(SettingRow, {
          label: `我的工位：${t + 1} 号`,
          sub: "一直为你保留，桌上的屏幕显示你的工作画面",
          children: jsxRuntime.jsx("button", {
            type: "button",
            onClick: r.onGoToDesk,
            children: "回工位"
          })
        }), jsxRuntime.jsx(SettingRow, {
          label: "换个位置",
          sub: "在大厅里点一张空着的工位坐下",
          children: jsxRuntime.jsx("button", {
            type: "button",
            onClick: r.onMove,
            children: "换位置"
          })
        })]
      })
    }), jsxRuntime.jsxs(SettingGroup, {
      title: "账号",
      children: [window.officeDesktop && jsxRuntime.jsx(SettingRow, {
        label: "记住登录",
        sub: n === null ? "查看中…" : n ? "下次打开自动进入" : "没有保存"
      }), jsxRuntime.jsx(SettingRow, {
        label: "退出登录",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: r.onLogout,
          children: "退出"
        })
      })]
    }), jsxRuntime.jsxs(SettingGroup, {
      title: "其他",
      children: [jsxRuntime.jsx(SettingRow, {
        label: "客户端版本",
        sub: i.currentVersion ? `${i.currentVersion}${i.copy ? "" : " · 已是最新"}` : "浏览器版",
        children: i.copy && jsxRuntime.jsx("button", {
          type: "button",
          onClick: () => void i.start(),
          children: "更新"
        })
      }), jsxRuntime.jsx(SettingRow, {
        label: "管理员",
        sub: "查看和释放工位，要管理员密码",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: () => l(A => !A),
          children: a ? "收起" : "打开"
        })
      }), a && jsxRuntime.jsx(WorkstationSettings, {
        office: e
      })]
    })]
  });
}
function WorkstationSettings({
  office: r
}) {
  const [e, t] = React.useState(""),
    [s, i] = React.useState(""),
    [n, o] = React.useState(null);
  return jsxRuntime.jsxs("div", {
    className: "admin",
    children: [jsxRuntime.jsx("input", {
      type: "password",
      placeholder: "管理员密码",
      "aria-label": "管理员密码",
      value: e,
      onChange: a => {
        t(a.target.value), i("");
      }
    }), r.seats.map((a, l) => {
      const A = describeWorkstation(l, a, getWorkstationSitter(r.people, l));
      return jsxRuntime.jsx(SettingRow, {
        label: A.label,
        sub: A.sub,
        children: jsxRuntime.jsx("button", {
          type: "button",
          disabled: !a || n !== null || !e,
          onClick: async () => {
            o(l);
            const c = await r.adminKick(l, e);
            o(null), i(c.ok ? `已释放 ${l + 1} 号工位（${c.name}）` : c.error || "没成功");
          },
          children: n === l ? "…" : "释放"
        })
      }, l);
    }), s && jsxRuntime.jsx("small", {
      className: "muted",
      role: "status",
      children: s
    })]
  });
}
function ClientSettings({
  act: r
}) {
  const e = t => () => void r(t).catch(() => {});
  return jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [jsxRuntime.jsxs(SettingGroup, {
      title: "窗口",
      children: [jsxRuntime.jsx(SettingRow, {
        label: "全屏",
        sub: "F11",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("fullscreen"),
          children: "切换"
        })
      }), jsxRuntime.jsx(SettingRow, {
        label: "最小化",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("minimize"),
          children: "最小化"
        })
      }), jsxRuntime.jsx(SettingRow, {
        label: "重新连接",
        sub: "Ctrl+R",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("reload"),
          children: "重连"
        })
      }), jsxRuntime.jsx(SettingRow, {
        label: "在浏览器里打开",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("browser"),
          children: "打开"
        })
      }), jsxRuntime.jsx(SettingRow, {
        label: "退出 iruler dream",
        sub: "关掉窗口只是回到托盘，这里是真的退出",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("quit"),
          children: "退出"
        })
      })]
    }), jsxRuntime.jsxs(SettingGroup, {
      title: "声音和共享",
      children: [jsxRuntime.jsx(SettingRow, {
        label: "扬声器和麦克风",
        sub: "打开 Windows 的声音设置",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("devices"),
          children: "打开"
        })
      }), jsxRuntime.jsx(SettingRow, {
        label: "麦克风隐私设置",
        children: jsxRuntime.jsx("button", {
          type: "button",
          onClick: e("microphone"),
          children: "打开"
        })
      })]
    })]
  });
}

export { ScreenSettings, AccountSettings, ClientSettings };
