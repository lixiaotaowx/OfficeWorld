import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
import { SETTINGS_TABS, SETTINGS_TAB_DETAILS, KEYBOARD_SHORTCUTS, SettingRow, SettingToggle, SettingGroup } from './hallSettingsParts.js';
import { AppearanceSettings, NotificationSettings, FileSettings } from './hallPersonalSettings.js';
import { ScreenSettings, AccountSettings, ClientSettings } from './hallOfficeSettings.js';
function HallSettings(r) {
  var i, n;
  const e = React.useRef(null),
    t = React.useRef(null),
    s = React.useId();
  return React.useEffect(() => {
    var o, a;
    (a = (o = t.current) == null ? void 0 : o.scrollTo) == null || a.call(o, 0, 0);
  }, [r.page]), React.useEffect(() => {
    const o = l => {
        l.key === "Escape" && (l.stopPropagation(), r.onClose());
      },
      a = l => {
        e.current && !e.current.contains(l.target) && r.onClose();
      };
    return window.addEventListener("keydown", o, !0), document.addEventListener("pointerdown", a, !0), () => {
      window.removeEventListener("keydown", o, !0), document.removeEventListener("pointerdown", a, !0);
    };
  }, [r.onClose]), jsxRuntime.jsxs("section", {
    ref: e,
    className: "hall-sheet",
    role: "dialog",
    "aria-label": "设置",
    onKeyDown: o => o.stopPropagation(),
    onPointerDown: o => o.stopPropagation(),
    children: [jsxRuntime.jsxs("header", {
      className: "settings-header",
      children: [jsxRuntime.jsxs("div", {
        children: [jsxRuntime.jsx("strong", {
          children: "设置"
        }), jsxRuntime.jsx("small", {
          children: "个人偏好与工作空间"
        })]
      }), jsxRuntime.jsx("button", {
        type: "button",
        "aria-label": "关闭设置",
        onClick: r.onClose,
        children: jsxRuntime.jsx("svg", {
          viewBox: "0 0 24 24",
          width: "15",
          height: "15",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          children: jsxRuntime.jsx("path", {
            d: "M6 6l12 12M18 6 6 18"
          })
        })
      })]
    }), jsxRuntime.jsx("nav", {
      className: "tabs",
      role: "tablist",
      "aria-label": "设置分类",
      children: SETTINGS_TABS.map(([o, a], l) => jsxRuntime.jsxs("button", {
        type: "button",
        role: "tab",
        id: `${s}-${o}`,
        "aria-controls": `${s}-panel`,
        tabIndex: r.page === o ? 0 : -1,
        "aria-selected": r.page === o,
        onClick: () => r.onPage(o),
        onKeyDown: A => {
          var u;
          const c = A.key === "ArrowRight" || A.key === "ArrowDown" ? 1 : A.key === "ArrowLeft" || A.key === "ArrowUp" ? -1 : 0;
          if (!c && A.key !== "Home" && A.key !== "End") return;
          A.preventDefault();
          const h = A.key === "Home" ? 0 : A.key === "End" ? SETTINGS_TABS.length - 1 : (l + c + SETTINGS_TABS.length) % SETTINGS_TABS.length;
          r.onPage(SETTINGS_TABS[h][0]), (u = document.getElementById(`${s}-${SETTINGS_TABS[h][0]}`)) == null || u.focus();
        },
        children: [jsxRuntime.jsx("svg", {
          "aria-hidden": "true",
          viewBox: "0 0 24 24",
          width: "18",
          height: "18",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.7",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: jsxRuntime.jsx("path", {
            d: SETTINGS_TAB_DETAILS[o].icon
          })
        }), a]
      }, o))
    }), jsxRuntime.jsxs("div", {
      ref: t,
      className: "pane",
      role: "tabpanel",
      id: `${s}-panel`,
      "aria-labelledby": `${s}-${r.page}`,
      tabIndex: 0,
      children: [jsxRuntime.jsxs("div", {
        className: "settings-page-heading",
        children: [jsxRuntime.jsx("h3", {
          children: (i = SETTINGS_TABS.find(([o]) => o === r.page)) == null ? void 0 : i[1]
        }), jsxRuntime.jsx("p", {
          children: SETTINGS_TAB_DETAILS[r.page].description
        })]
      }), r.page === "look" && jsxRuntime.jsx(AppearanceSettings, {
        value: r.appearance,
        onChange: r.onAppearance
      }), r.page === "notify" && jsxRuntime.jsx(NotificationSettings, {}), r.page === "files" && jsxRuntime.jsx(FileSettings, {}), r.page === "screen" && jsxRuntime.jsx(ScreenSettings, {
        office: r.office
      }), r.page === "view" && jsxRuntime.jsxs(jsxRuntime.Fragment, {
        children: [jsxRuntime.jsxs(SettingGroup, {
          title: "3D 画面",
          children: [jsxRuntime.jsx(SettingToggle, {
            label: "暂停 3D 渲染",
            sub: "语音、共享和聊天不受影响",
            checked: r.paused,
            onChange: r.onPaused
          }), jsxRuntime.jsx(SettingRow, {
            label: "渲染画质",
            sub: "高画质增加环境光、接触阴影和抗锯齿；标准模式更省显存",
            children: jsxRuntime.jsxs("select", {
              "aria-label": "渲染画质",
              value: r.quality,
              onChange: o => r.onQuality(o.target.value === "standard" ? "standard" : "high"),
              children: [jsxRuntime.jsx("option", {
                value: "high",
                children: "高画质"
              }), jsxRuntime.jsx("option", {
                value: "standard",
                children: "标准"
              })]
            })
          }), jsxRuntime.jsx("p", {
            className: "settings-note",
            children: "隐藏或最小化窗口后暂停绘制，30 秒后释放 3D 显存；返回时恢复画面。聊天和通话继续运行。"
          }), jsxRuntime.jsx(SettingRow, {
            label: "时间",
            sub: r.timeTip,
            children: jsxRuntime.jsx("button", {
              type: "button",
              onClick: r.onTime,
              children: "切换"
            })
          })]
        }), ((n = window.officeDesktop) == null ? void 0 : n.windowAction) && jsxRuntime.jsx(ClientSettings, {
          act: window.officeDesktop.windowAction
        }), jsxRuntime.jsx(SettingGroup, {
          title: "快捷键",
          children: jsxRuntime.jsx("dl", {
            className: "keys",
            children: KEYBOARD_SHORTCUTS.map(([o, a]) => jsxRuntime.jsxs("div", {
              style: {
                display: "contents"
              },
              children: [jsxRuntime.jsx("dt", {
                children: o
              }), jsxRuntime.jsx("dd", {
                children: a.split(" / ").map((l, A) => jsxRuntime.jsxs("span", {
                  children: [A ? " / " : "", jsxRuntime.jsx("kbd", {
                    children: l
                  })]
                }, l))
              })]
            }, o))
          })
        })]
      }), r.page === "account" && jsxRuntime.jsx(AccountSettings, {
        ...r
      })]
    })]
  });
}

export { HallSettings };
