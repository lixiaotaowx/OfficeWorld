import { j as jsxRuntime } from '../chunks/dockGreeting.js';
const SETTINGS_TABS = [["look", "我的形象"], ["notify", "通知"], ["files", "文件"], ["screen", "屏幕与预览"], ["view", "显示与操作"], ["account", "工位与账号"]],
  SETTINGS_TAB_DETAILS = {
    look: {
      description: "选一个喜欢的颜色，搭配你的日常形象。",
      icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2"
    },
    notify: {
      description: "安排消息和来电提醒，保持联系。",
      icon: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"
    },
    files: {
      description: "管理同事发来的文件和本机保存位置。",
      icon: "M3 7V4h7l2 3h9v13H3V7Z"
    },
    screen: {
      description: "选择共享屏幕，调整工位画面的预览方式。",
      icon: "M3 3h18v13H3V3ZM12 16v5M8 21h8"
    },
    view: {
      description: "调整大厅画面、窗口和操作习惯。",
      icon: "M4 7h16M4 17h16M8 4v6M16 14v6"
    },
    account: {
      description: "管理你的工位、登录状态和客户端。",
      icon: "M3 10 12 3l9 7v11H3V10ZM9 21v-7h6v7"
    }
  },
  ACCESSORY_LABELS = {
    hair: "发型",
    hat: "帽子",
    glasses: "眼镜",
    beard: "胡子"
  },
  KEYBOARD_SHORTCUTS = [["旋转视角", "左键拖动 / 中键拖动"], ["平移视角", "右键拖动 / Shift+拖动"], ["缩放", "滚轮"], ["视角回正", "Home"], ["走路", "点地面 / WASD"], ["跑", "按住 Shift"], ["全屏", "F11"], ["重新连接", "Ctrl+R"], ["放大 / 缩小界面", "Ctrl+= / Ctrl+-"], ["正对展示物", "双击"], ["时间", "T"], ["设置", ","], ["装修开关", "Tab"], ["加零件", "Shift+A"], ["移动 / 旋转 / 缩放", "G / R / S"], ["锁轴", "X / Y / Z"], ["复制", "Shift+D"], ["吸取零件和颜色", "E"], ["聚焦", "F"], ["删除", "Delete"], ["撤销 / 重做", "Ctrl+Z / Ctrl+Y"]],
  SettingRow = ({
    label: r,
    sub: e,
    children: t
  }) => jsxRuntime.jsxs("div", {
    className: "row2",
    children: [jsxRuntime.jsxs("span", {
      children: [r, e && jsxRuntime.jsx("small", {
        children: e
      })]
    }), t]
  }),
  SettingToggle = ({
    label: r,
    sub: e,
    checked: t,
    onChange: s,
    disabled: i
  }) => jsxRuntime.jsxs("label", {
    className: "row2",
    children: [jsxRuntime.jsxs("span", {
      children: [r, e && jsxRuntime.jsx("small", {
        children: e
      })]
    }), jsxRuntime.jsx("input", {
      type: "checkbox",
      className: "toggle",
      checked: t,
      disabled: i,
      onChange: n => s(n.target.checked)
    })]
  }),
  SettingGroup = ({
    title: r,
    children: e
  }) => jsxRuntime.jsxs("div", {
    className: "grp",
    children: [jsxRuntime.jsx("h4", {
      children: r
    }), e]
  });

export { SETTINGS_TABS, SETTINGS_TAB_DETAILS, ACCESSORY_LABELS, KEYBOARD_SHORTCUTS, SettingRow, SettingToggle, SettingGroup };
