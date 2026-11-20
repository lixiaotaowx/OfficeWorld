import { r as React, j as jsxRuntime, a as stopPropagation, c as decorateDockState } from '../chunks/dockGreeting.js';
function ChatTransferCard({
  account: t,
  conversation: s,
  file: n
}) {
  var T, D;
  const [c, r] = React.useState(""),
    [i, o] = React.useState(""),
    [d, m] = React.useState(!1),
    [h, k] = React.useState(!1),
    [f, b] = React.useState(0),
    g = React.useRef(null),
    R = React.useRef(null),
    N = ((T = g.current) == null ? void 0 : T.closest(".dk-fly")) || ((D = g.current) == null ? void 0 : D.closest(".dk"));
  React.useEffect(() => {
    var E;
    if (!h) return;
    (E = R.current) == null || E.focus({
      preventScroll: !0
    });
    const w = L => {
      L.key === "Escape" && (L.preventDefault(), L.stopImmediatePropagation(), k(!1));
    };
    return document.addEventListener("keydown", w, !0), () => {
      var L, U;
      document.removeEventListener("keydown", w, !0), (U = (L = g.current) == null ? void 0 : L.querySelector("button")) == null || U.focus({
        preventScroll: !0
      });
    };
  }, [h]);
  const [C, I] = React.useState(!1),
    [j, _] = React.useState(""),
    V = async () => {
      if (!C) {
        I(!0), _("");
        try {
          await decorateDockState({
            kind: "view",
            account: t,
            conversation: s,
            file: n
          }), k(!1);
        } catch {
          _("全屏打开失败，请确认主窗口已连接后重试");
        } finally {
          I(!1);
        }
      }
    },
    W = () => {
      var w, E, L;
      m(!1), (L = (E = (w = window.officeDock) == null ? void 0 : w.action) == null ? void 0 : E.call(w, "chat-file", n.id)) == null || L.catch(() => o("下载失败，请重试"));
    };
  return React.useEffect(() => {
    if (!d) return;
    const w = E => {
      var L;
      (L = g.current) != null && L.contains(E.target) || m(!1);
    };
    return document.addEventListener("pointerdown", w), () => document.removeEventListener("pointerdown", w);
  }, [d]), React.useEffect(() => {
    let w = !0,
      E = "";
    if (r(""), o(""), n.size > 20 * 1024 * 1024) {
      o("图片较大，请下载原图查看");
      return;
    }
    return decorateDockState({
      kind: "load",
      account: t,
      conversation: s,
      file: n
    }).then(L => {
      !w || !L || (E = URL.createObjectURL(L), r(E));
    }).catch(L => {
      w && o(L instanceof Error ? L.message : "图片加载失败，请重新加载");
    }), () => {
      w = !1, E && URL.revokeObjectURL(E);
    };
  }, [t, s, n.id, n.size, f]), jsxRuntime.jsxs("div", {
    className: "dk-image-wrap",
    ref: g,
    onKeyDownCapture: w => {
      w.key === "Escape" && (d || h) && (w.preventDefault(), w.stopPropagation(), m(!1), k(!1));
    },
    children: [jsxRuntime.jsx("button", {
      className: "dk-image",
      type: "button",
      "aria-label": "查看图片",
      title: "点击查看大图，右键显示操作",
      onClick: () => c && !i ? k(!0) : m(w => !w),
      onContextMenu: w => {
        w.preventDefault(), w.stopPropagation(), m(!0);
      },
      children: c && !i ? jsxRuntime.jsx("img", {
        src: c,
        alt: "聊天图片",
        onError: () => o("图片无法预览")
      }) : jsxRuntime.jsx("span", {
        className: "dk-image-placeholder",
        children: i || "图片加载中…"
      })
    }), d && jsxRuntime.jsxs("div", {
      className: "dk-image-menu",
      role: "menu",
      "aria-label": "图片操作",
      children: [jsxRuntime.jsx("button", {
        type: "button",
        role: "menuitem",
        disabled: !c || !!i,
        onClick: () => {
          m(!1), k(!0);
        },
        children: "查看大图"
      }), jsxRuntime.jsx("button", {
        type: "button",
        role: "menuitem",
        onClick: W,
        children: "下载原图"
      }), i && jsxRuntime.jsx("button", {
        type: "button",
        role: "menuitem",
        onClick: () => {
          m(!1), b(w => w + 1);
        },
        children: "重新加载"
      }), jsxRuntime.jsx("button", {
        type: "button",
        role: "menuitem",
        onClick: () => m(!1),
        children: "取消"
      })]
    }), h && N && stopPropagation.createPortal(jsxRuntime.jsxs("div", {
      className: "dk-image-viewer",
      role: "dialog",
      "aria-label": "图片预览",
      onClick: () => k(!1),
      children: [jsxRuntime.jsxs("div", {
        className: "dk-image-toolbar",
        onClick: w => w.stopPropagation(),
        children: [jsxRuntime.jsx("span", {
          children: "图片预览"
        }), jsxRuntime.jsx("button", {
          type: "button",
          disabled: C,
          onClick: () => void V(),
          children: C ? "打开中…" : "全屏观看"
        }), jsxRuntime.jsx("button", {
          type: "button",
          onClick: W,
          children: "下载原图"
        }), jsxRuntime.jsx("button", {
          ref: R,
          type: "button",
          onClick: () => k(!1),
          "aria-label": "关闭图片预览",
          children: "×"
        })]
      }), j && jsxRuntime.jsx("p", {
        role: "alert",
        children: j
      }), jsxRuntime.jsx("img", {
        src: c,
        alt: "图片预览",
        onClick: w => w.stopPropagation()
      })]
    }), N)]
  });
}
function DockFileEntry({
  account: t,
  conversation: s,
  file: n
}) {
  const [c, r] = React.useState(!1),
    [i, o] = React.useState(""),
    d = async h => {
      if (!c) {
        r(!0), o("");
        try {
          await decorateDockState({
            kind: h,
            account: t,
            conversation: s,
            file: n
          });
        } catch (k) {
          o(k instanceof Error ? k.message : "操作失败，请重试");
        } finally {
          r(!1);
        }
      }
    },
    m = n.size >= 1024 ** 2 ? `${(n.size / 1024 ** 2).toFixed(1)} MB` : `${Math.ceil(n.size / 1024)} KB`;
  return jsxRuntime.jsxs("div", {
    className: "dk-file-entry",
    children: [jsxRuntime.jsxs("div", {
      className: "dk-file-row",
      children: [jsxRuntime.jsxs("button", {
        type: "button",
        className: "dk-file",
        disabled: c,
        title: n.name,
        onClick: () => void d("open"),
        children: [jsxRuntime.jsx("span", {
          className: "ext",
          children: (n.name.split(".").pop() || "").slice(0, 4).toUpperCase()
        }), jsxRuntime.jsxs("span", {
          children: [jsxRuntime.jsx("b", {
            children: n.name
          }), jsxRuntime.jsxs("small", {
            children: [m, " · ", c ? "正在处理…" : n.state || "点击下载并打开"]
          })]
        })]
      }), jsxRuntime.jsxs("div", {
        className: "dk-file-actions",
        children: [jsxRuntime.jsx("button", {
          type: "button",
          disabled: c,
          title: "打开文件",
          "aria-label": "打开文件",
          onClick: () => void d("open"),
          children: jsxRuntime.jsx("svg", {
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            children: jsxRuntime.jsx("path", {
              d: "m8 4 12 8-12 8Z"
            })
          })
        }), jsxRuntime.jsx("button", {
          type: "button",
          disabled: c,
          title: "打开文件夹",
          "aria-label": "打开文件夹",
          onClick: () => void d("reveal"),
          children: jsxRuntime.jsx("svg", {
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            children: jsxRuntime.jsx("path", {
              d: "M3 7V4h6l3 3h9v13H3V7Zm0 3h18"
            })
          })
        })]
      })]
    }), i && jsxRuntime.jsx("small", {
      className: "dk-file-error",
      role: "alert",
      children: i
    })]
  });
}

export { ChatTransferCard, DockFileEntry };
