import { j as jsxRuntime } from '../chunks/dockGreeting.js';

export function RoleSelection({ busy, error, choose }) {
  return jsxRuntime.jsx("main", {
    className: "account-page role-page",
    children: jsxRuntime.jsxs("section", {
      className: "role-card",
      children: [jsxRuntime.jsx("span", {
        className: "eyebrow",
        children: "先认识一下"
      }), jsxRuntime.jsx("h2", {
        children: "你是以什么身份进来的？"
      }), jsxRuntime.jsx("p", {
        children: "成员有自己的工位；访客坐在公共区域。大家都能开会、聊天、通话和共享屏幕。"
      }), jsxRuntime.jsxs("div", {
        className: "role-options",
        children: [jsxRuntime.jsxs("button", {
          type: "button",
          className: "role-option",
          disabled: busy,
          onClick: () => choose("employee"),
          children: [jsxRuntime.jsx("strong", {
            children: "iruler dream 成员"
          }), jsxRuntime.jsx("small", {
            children: "有自己的工位，桌上的屏幕显示你的工作画面"
          })]
        }), jsxRuntime.jsxs("button", {
          type: "button",
          className: "role-option",
          onClick: () => choose("visitor"),
          disabled: busy,
          children: [jsxRuntime.jsx("strong", {
            children: "访客"
          }), jsxRuntime.jsx("small", {
            children: "坐在公共区域，不显示屏幕画面"
          })]
        })]
      }), error && jsxRuntime.jsx("p", {
        className: "account-error",
        role: "alert",
        children: error
      }), jsxRuntime.jsx("small", {
        className: "role-note",
        children: "选好后会记住，之后管理员可以帮你改。"
      })]
    })
  })
}
