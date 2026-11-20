import { r as React, j as jsxRuntime } from '../chunks/dockGreeting.js';
import { subscribeToHostAccount, readHostAccount, restoreLogin } from './authSession.js';
import { RoleSelection } from './RoleSelection.js';
export function AccountGate({
  isHostEnabled,
  chooseHostRole,
  logoutHost,
  OfficeSpace
}) {
  var D, C, M;
  const [account, setAccount] = React.useState(null),
    [restoring, setRestoring] = React.useState(!0),
    [authMode, setAuthMode] = React.useState("login"),
    [name, setName] = React.useState(""),
    [password, setPassword] = React.useState(""),
    [error, setError] = React.useState(""),
    [submitting, setSubmitting] = React.useState(!1),
    [choosingRole, setChoosingRole] = React.useState(!1),
    [recoveryEnabled, setRecoveryEnabled] = React.useState(!1),
    cancelRestore = React.useRef(),
    usesHostAccount = isHostEnabled() && !!((D = window.officeHost) != null && D.state || (M = (C = window.officeHost) == null ? void 0 : C.auth) != null && M.get);
  React.useEffect(() => {
    let g = !1;
    return fetch("/api/auth/me").then(T => T.json()).then(T => {
      g || setRecoveryEnabled(T.recoveryEnabled === !0);
    }).catch(() => {}), () => {
      g = !0;
    };
  }, []);
  async function chooseRole(g) {
    if (!(!account || choosingRole)) {
      setChoosingRole(!0), setError("");
      try {
        if (usesHostAccount) {
          setAccount(await chooseHostRole(g));
          return;
        }
        const T = await fetch("/api/auth/role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              role: g
            })
          }),
          A = await T.json();
        if (!T.ok) throw Error((A == null ? void 0 : A.error) || "身份没存上，再试一次");
        setAccount(A.user);
      } catch (T) {
        setError(T instanceof Error ? T.message : "身份没存上，再试一次");
      } finally {
        setChoosingRole(!1);
      }
    }
  }
  async function refreshHostAccount(g) {
    var A;
    const T = await readHostAccount().catch(() => null);
    ((A = T == null ? void 0 : T.user) == null ? void 0 : A.id) === g && setAccount(T.user);
  }
  React.useEffect(() => {
    const g = async A => {
        var H, N, Q;
        (H = cancelRestore.current) == null || H.call(cancelRestore);
        const F = A.detail || {};
        if (F.forget === !0) await ((N = window.officeDesktop) == null ? void 0 : N.clearLogin().catch(() => {})), setPassword("");else {
          const Z = await ((Q = window.officeDesktop) == null ? void 0 : Q.readLogin().catch(() => null));
          Z && (setName(Z.name), setPassword(Z.password));
        }
        setAccount(null), setAuthMode("login"), setError(window.officeDesktop ? "" : F.message || "登录过期了，请重新登录");
      },
      T = A => {
        g(A);
      };
    return window.addEventListener("office-session-ended", T), () => window.removeEventListener("office-session-ended", T);
  }, []), React.useEffect(() => {
    if (usesHostAccount) {
      let g = !0;
      const T = async () => {
          var N;
          const H = await ((N = window.officeDesktop) == null ? void 0 : N.readLogin().catch(() => null));
          !g || !(H != null && H.name) || (setName(Q => Q || H.name), setPassword(Q => Q || H.password));
        },
        A = H => {
          if (g) {
            if (!H) {
              setRestoring(!1), T();
              return;
            }
            H.user ? (setAccount(H.user), setError("")) : (H.status === "expired" && setError(H.message || "登录过期了，请重新登录"), T()), setRestoring(!1);
          }
        };
      readHostAccount().then(A).catch(() => {
        setRestoring(!1), T();
      });
      const F = subscribeToHostAccount(A);
      return () => {
        g = !1, F == null || F();
      };
    }
    return cancelRestore.current = restoreLogin({
      user: setAccount,
      loading: setRestoring,
      error: setError,
      credentials: g => {
        setName(g.name), setPassword(g.password);
      }
    }), () => {
      var g;
      return (g = cancelRestore.current) == null ? void 0 : g.call(cancelRestore);
    };
  }, [usesHostAccount]);
  async function submitCredentials(g) {
    var T, A;
    g.preventDefault(), setSubmitting(!0), setError(""), (T = cancelRestore.current) == null || T.call(cancelRestore);
    try {
      const F = await fetch(`/api/auth/${authMode}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            password: password
          })
        }),
        H = await F.json();
      if (!F.ok) throw Error(H.error || "现在登录不了，等一下再试");
      await ((A = window.officeDesktop) == null ? void 0 : A.saveLogin({
        name: H.user.name,
        password: password
      }).catch(() => {})), setName(H.user.name), setAccount(H.user), usesHostAccount && refreshHostAccount(H.user.id);
    } catch (F) {
      setError(F instanceof Error ? F.message : "连不上，再试一次");
    } finally {
      setSubmitting(!1);
    }
  }
  async function logout() {
    var g, T;
    setSubmitting(!0);
    try {
      if (usesHostAccount) {
        await logoutHost(), setName((account == null ? void 0 : account.name) ?? name), setPassword(""), setAccount(null), setAuthMode("login"), setError("");
        return;
      }
      if (!(await fetch("/api/auth/logout", {
        method: "POST"
      })).ok) throw Error();
      (g = cancelRestore.current) == null || g.call(cancelRestore), await ((T = window.officeDesktop) == null ? void 0 : T.clearLogin().catch(() => {})), setName((account == null ? void 0 : account.name) ?? name), setPassword(""), setAccount(null), setAuthMode("login"), setError("");
    } catch {
      window.alert("没退出成功，检查一下网络再试");
    } finally {
      setSubmitting(!1);
    }
  }
  return account && !account.role ? jsxRuntime.jsx(RoleSelection, {
    busy: choosingRole,
    error: error,
    choose: chooseRole
  }) : account ? jsxRuntime.jsx(OfficeSpace, {
    account: account,
    onLogout: () => void logout()
  }) : jsxRuntime.jsxs("main", {
    className: "account-page",
    children: [jsxRuntime.jsxs("section", {
      className: "account-intro",
      children: [jsxRuntime.jsxs("div", {
        className: "account-brand",
        children: [jsxRuntime.jsxs("span", {
          className: "brand-mark",
          children: ["i", jsxRuntime.jsx("span", {
            children: "·"
          })]
        }), jsxRuntime.jsxs("span", {
          children: ["iruler dream", jsxRuntime.jsx("small", {
            children: "在一起"
          })]
        })]
      }), jsxRuntime.jsxs("div", {
        className: "intro-copy",
        children: [jsxRuntime.jsx("span", {
          className: "eyebrow",
          children: "隔得再远，也在一起"
        }), jsxRuntime.jsxs("div", {
          className: "account-manifesto",
          "aria-hidden": "true",
          children: ["好好工作，", jsxRuntime.jsx("br", {}), jsxRuntime.jsx("em", {
            children: "有人作伴。"
          })]
        }), jsxRuntime.jsxs("h1", {
          children: ["一个更好的", jsxRuntime.jsx("br", {}), "工作的地方"]
        }), jsxRuntime.jsxs("p", {
          children: ["回到自己的工位，跟大家打个招呼。", jsxRuntime.jsx("br", {}), "一起看屏幕、说说话、交换想法。"]
        })]
      }), jsxRuntime.jsx(OfficeArtwork, {}), jsxRuntime.jsxs("div", {
        className: "account-space",
        children: [jsxRuntime.jsx("span", {
          children: "01 / 书馆大厅"
        }), jsxRuntime.jsxs("strong", {
          children: ["各做各的事，但在一起。", jsxRuntime.jsx("span", {
            "aria-hidden": "true",
            children: "↗"
          })]
        }), jsxRuntime.jsx("small", {
          children: "自己的工位 / 共享屏幕 / 随时说话"
        })]
      })]
    }), jsxRuntime.jsxs("form", {
      className: "account-card",
      onSubmit: submitCredentials,
      children: [jsxRuntime.jsx("span", {
        className: "eyebrow",
        children: "欢迎来到 iruler dream"
      }), jsxRuntime.jsx("h2", {
        children: restoring ? "正在恢复登录…" : authMode === "login" ? "欢迎回来" : authMode === "reset-password" ? "重设密码" : "初次见面"
      }), jsxRuntime.jsx("p", {
        children: authMode === "login" ? "用名字和密码登录。" : authMode === "reset-password" ? "确认名字，输入新密码就能回到办公室。" : "注册后挑一个形象，再选一张工位。"
      }), jsxRuntime.jsxs("div", {
        className: "account-tabs",
        children: [jsxRuntime.jsx("button", {
          type: "button",
          disabled: submitting,
          "aria-pressed": authMode === "login",
          onClick: () => {
            setAuthMode("login"), setError("");
          },
          children: "登录"
        }), jsxRuntime.jsx("button", {
          type: "button",
          disabled: submitting,
          "aria-pressed": authMode === "register",
          onClick: () => {
            setAuthMode("register"), setError("");
          },
          children: "注册"
        })]
      }), jsxRuntime.jsxs("label", {
        children: ["名字", jsxRuntime.jsx("input", {
          autoComplete: "username",
          value: name,
          onChange: g => setName(g.target.value),
          minLength: 2,
          maxLength: 24,
          required: !0,
          placeholder: "同事认识你的名字"
        })]
      }), jsxRuntime.jsxs("label", {
        children: [authMode === "reset-password" ? "新密码" : "密码", jsxRuntime.jsx("input", {
          type: "password",
          autoComplete: authMode !== "login" ? "new-password" : "current-password",
          value: password,
          onChange: g => setPassword(g.target.value),
          minLength: 1,
          maxLength: 16,
          required: !0,
          placeholder: "输入密码（1 到 16 个字符）"
        })]
      }), authMode === "login" && recoveryEnabled && jsxRuntime.jsx("button", {
        type: "button",
        className: "account-recovery",
        disabled: submitting,
        onClick: () => {
          var g;
          (g = cancelRestore.current) == null || g.call(cancelRestore), setRestoring(!1), setAuthMode("reset-password"), setPassword(""), setError("");
        },
        children: "忘了密码"
      }), jsxRuntime.jsx("p", {
        className: "account-error",
        role: "alert",
        children: error
      }), jsxRuntime.jsx("button", {
        className: "primary account-submit",
        disabled: submitting || restoring,
        children: submitting ? "请稍等…" : authMode === "login" ? "进入办公室 →" : authMode === "reset-password" ? "重设密码并进入 →" : "注册并进入 →"
      }), jsxRuntime.jsxs("small", {
        children: ["名字就是登录账号，被人用过了可以加上团队名。", jsxRuntime.jsx("br", {}), window.officeDesktop ? "会记住登录，下次打开自动进入。" : "登录保持 30 天，在公用电脑上记得退出。"]
      })]
    })]
  });
}
function OfficeArtwork() {
  return jsxRuntime.jsxs("svg", {
    className: "space-artwork",
    viewBox: "0 0 640 360",
    fill: "none",
    "aria-hidden": "true",
    children: [jsxRuntime.jsx("defs", {
      children: jsxRuntime.jsxs("linearGradient", {
        id: "space-floor",
        x1: "120",
        y1: "170",
        x2: "450",
        y2: "350",
        gradientUnits: "userSpaceOnUse",
        children: [jsxRuntime.jsx("stop", {
          stopColor: "#b4b89c",
          stopOpacity: ".3"
        }), jsxRuntime.jsx("stop", {
          offset: "1",
          stopColor: "#b4b89c",
          stopOpacity: ".03"
        })]
      })
    }), jsxRuntime.jsxs("g", {
      stroke: "#d0d3b9",
      strokeWidth: "1",
      strokeLinejoin: "round",
      children: [jsxRuntime.jsx("path", {
        d: "M74 224 321 96 571 224 323 352Z",
        fill: "url(#space-floor)"
      }), jsxRuntime.jsx("path", {
        d: "M74 224V92L321 12V96M321 12 571 92V224",
        opacity: ".35"
      }), jsxRuntime.jsx("path", {
        d: "M94 213V104L301 36V107M122 198V94M160 179V82M198 159V69M237 140V56M275 120V44",
        opacity: ".3"
      }), jsxRuntime.jsx("path", {
        d: "M339 36 549 104V212M339 36V105M380 50V125M422 64V148M464 77V168M506 90V191",
        opacity: ".3"
      }), jsxRuntime.jsx("path", {
        d: "m174 208 107-55 116 60-108 57Z",
        fill: "#7c8469"
      }), jsxRuntime.jsx("path", {
        d: "M174 208v9l115 60 108-55v-9M184 222v52M289 277v51M387 227v48"
      }), jsxRuntime.jsx("path", {
        d: "m219 192 43-22 1-35-44 22Z",
        fill: "#263a31"
      }), jsxRuntime.jsx("path", {
        d: "m237 187 1 14 14 7 17-8M304 235l42-22",
        opacity: ".7"
      }), jsxRuntime.jsx("path", {
        d: "M442 243v-37m-12 48 12-11 14 4"
      }), jsxRuntime.jsx("path", {
        d: "M420 191q22-15 43 0v29q-22 16-43 0Z",
        fill: "#596850"
      }), jsxRuntime.jsx("path", {
        d: "M136 145v-34m0 20q-29-3-25-26 25 0 25 26Zm0-9q27-4 24-26-24 2-24 26Z",
        fill: "#768565"
      }), jsxRuntime.jsx("path", {
        d: "m123 143 26-2-4 29-18 1Z",
        fill: "#b39e7c"
      }), jsxRuntime.jsx("path", {
        d: "m449 113 32 10M431 121l32 10M413 129l32 10",
        opacity: ".35"
      })]
    }), jsxRuntime.jsx("circle", {
      cx: "514",
      cy: "46",
      r: "24",
      fill: "#ceb98f",
      opacity: ".75"
    }), jsxRuntime.jsx("path", {
      d: "M52 286h66m-33-33v66M518 298h66m-33-33v66",
      stroke: "#d0d3b9",
      opacity: ".2"
    })]
  });
}
