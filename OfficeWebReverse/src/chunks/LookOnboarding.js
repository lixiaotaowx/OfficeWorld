/**
 * 形象选择（Look chooser）。
 *
 * 结构：
 *   LookChooser     两步流程 —— 第 1 步颜色，第 2 步配饰（眼镜/发型/胡子/帽子）
 *   ColorPicker     颜色网格，每格显示小尺寸预览 + 色块
 *   AccessoryPicker 按种类分页的配饰网格，`mesh` 为空的一项表示「不戴」
 *   LookPreview     大尺寸走 3D 实时预览，小尺寸走缩略图
 *   LookOnboarding  首次进入时的弹窗（还没确认过形象才出现），默认导出
 *
 * 数据源都在 chatLocal.js：COLOR_PALETTE、ACCESSORY_KINDS / _LABELS / _OPTIONS、
 * normalizeLook、lookSignature。缩略图路径带 THUMBNAIL_VERSION，换素材时改这个
 * 版本号，客户端就会重新取图而不是吃缓存。
 */
import { j as jsx, r as React } from "./dockGreeting.js";
import { L as LiveLookPreview } from "./LiveLookPreview.js";
import {
  S as ACCESSORY_KINDS,
  z as ACCESSORY_LABELS,
  y as ACCESSORY_OPTIONS,
  x as COLOR_PALETTE,
  a as lookSignature,
  r as normalizeLook,
} from "./chatLocal.js";
import "./portraitLighting.js";

const THUMBNAIL_VERSION = "20260928-fit";

/** 缩略图地址：`full-<color>` 为整身，`wear-<kind>-<id>` 为单个配饰。 */
function thumbnailUrl(name) {
  return `/media/characters/thumbnails/${name}.png?v=${THUMBNAIL_VERSION}`;
}

/** 预览：大尺寸用 3D 实时预览，小尺寸用缩略图（颜色小方块用得到）。 */
function LookPreview({ value, size = "large", face = false }) {
  if (size === "large") return jsx.jsx(LiveLookPreview, { value, face });
  return jsx.jsx("span", {
    className: "look-preview small",
    "data-color": value.color,
    children: jsx.jsx("img", {
      src: thumbnailUrl(`full-${value.color}`),
      alt: "",
      draggable: false,
    }),
  });
}

/** 配饰选择：顶部按种类切页，下方网格；点中项写回 value.accessories[kind]。 */
function AccessoryPicker({ value, onChange }) {
  const [activeKind, setActiveKind] = React.useState("hair");

  /** 把某个种类选成 optionId；`"none"` 之类表示不戴的那一项也在 ACCESSORY_OPTIONS 里。 */
  function pick(kind, optionId) {
    onChange({
      ...value,
      accessories: { ...value.accessories, [kind]: optionId },
    });
  }

  return jsx.jsxs("div", {
    className: "accessory-list",
    role: "group",
    "aria-label": "选配饰",
    children: [
      jsx.jsx("div", {
        className: "accessory-tabs",
        "aria-label": "配饰种类",
        children: ACCESSORY_KINDS.map((kind) =>
          jsx.jsx(
            "button",
            {
              "aria-pressed": activeKind === kind,
              className: activeKind === kind ? "chosen" : "",
              onClick: () => setActiveKind(kind),
              children: ACCESSORY_LABELS[kind],
            },
            kind,
          ),
        ),
      }),
      [activeKind].map((kind) =>
        jsx.jsxs(
          "section",
          {
            className: "accessory-row",
            children: [
              jsx.jsx("span", {
                className: "accessory-slot",
                children: ACCESSORY_LABELS[kind],
              }),
              jsx.jsx("div", {
                className: "accessory-grid",
                role: "listbox",
                "aria-label": ACCESSORY_LABELS[kind],
                children: ACCESSORY_OPTIONS[kind].map((option) =>
                  jsx.jsxs(
                    "button",
                    {
                      type: "button",
                      role: "option",
                      "aria-selected": value.accessories[kind] === option.id,
                      className: value.accessories[kind] === option.id ? "chosen" : "",
                      onClick: () => pick(kind, option.id),
                      title: option.label,
                      children: [
                        option.mesh
                          ? jsx.jsx("img", {
                              src: thumbnailUrl(`wear-${kind}-${option.id}`),
                              alt: "",
                              draggable: false,
                            })
                          : jsx.jsx("i", {
                              className: "none-mark",
                              "aria-hidden": "true",
                              children: "—",
                            }),
                        jsx.jsx("span", { children: option.label }),
                      ],
                    },
                    option.id,
                  ),
                ),
              }),
            ],
          },
          kind,
        ),
      ),
    ],
  });
}

/** 颜色选择：整格按钮，选中项加 chosen 类。 */
function ColorPicker({ value, onChange }) {
  return jsx.jsx("div", {
    className: "color-grid",
    role: "listbox",
    "aria-label": "选颜色",
    children: COLOR_PALETTE.map((color) =>
      jsx.jsxs(
        "button",
        {
          type: "button",
          role: "option",
          "aria-selected": value.color === color.id,
          "aria-label": color.label,
          className: value.color === color.id ? "chosen" : "",
          onClick: () => onChange({ ...value, color: color.id }),
          title: color.label,
          children: [
            jsx.jsx(LookPreview, { value: { ...value, color: color.id }, size: "small" }),
            jsx.jsx("span", { children: color.label }),
            jsx.jsx("i", {
              className: "swatch",
              style: { background: color.hex },
              "aria-hidden": "true",
            }),
          ],
        },
        color.id,
      ),
    ),
  });
}

/** 两步选择器外壳：左预览、右步骤条；footer 回调把当前步骤和切步函数透出去。 */
function LookChooser({ value, onChange, footer }) {
  const [step, setStep] = React.useState("color");
  return jsx.jsxs("div", {
    className: "look-chooser",
    "data-step": step,
    "data-look": lookSignature(value),
    children: [
      jsx.jsxs("div", {
        className: "look-body",
        children: [
          jsx.jsxs("div", {
            className: "look-stage",
            children: [
              jsx.jsx(LookPreview, { value, size: "large", face: step === "accessory" }),
              jsx.jsx("strong", {
                children: COLOR_PALETTE.find((color) => color.id === value.color)?.label,
              }),
              jsx.jsx("small", { children: "现在的样子 · 实时预览" }),
            ],
          }),
          jsx.jsxs("div", {
            className: "look-options",
            children: [
              jsx.jsxs("div", {
                className: "look-steps",
                role: "tablist",
                "aria-label": "形象设置步骤",
                children: [
                  jsx.jsx("button", {
                    type: "button",
                    role: "tab",
                    "aria-selected": step === "color",
                    className: step === "color" ? "chosen" : "",
                    onClick: () => setStep("color"),
                    children: "1 颜色",
                  }),
                  jsx.jsx("button", {
                    type: "button",
                    role: "tab",
                    "aria-selected": step === "accessory",
                    className: step === "accessory" ? "chosen" : "",
                    onClick: () => setStep("accessory"),
                    children: "2 配饰",
                  }),
                ],
              }),
              step === "color"
                ? jsx.jsx(ColorPicker, { value, onChange })
                : jsx.jsx(AccessoryPicker, { value, onChange }),
            ],
          }),
        ],
      }),
      footer?.(step, setStep),
    ],
  });
}

/**
 * 首次进入的「挑一个形象」弹窗。
 *
 * 只在账号还没确认过形象时出现（account.lookConfirmed !== true）；
 * 一旦账号侧确认了（比如别处改了），effect 会把已确认标记置位并收起弹窗。
 * 点「好了，进去吧」会把草稿规范化后通过 onAppearance 交回去。
 */
function LookOnboarding({ account, appearance, onAppearance }) {
  const [showHint, setShowHint] = React.useState(() => account.lookConfirmed !== true);
  const [draft, setDraft] = React.useState(() => normalizeLook(appearance));
  const confirmedRef = React.useRef(account.lookConfirmed === true);

  React.useEffect(() => {
    if (account.lookConfirmed === true) {
      confirmedRef.current = true;
      setShowHint(false);
    }
  }, [account.lookConfirmed]);

  if (!showHint || confirmedRef.current) return null;

  return jsx.jsxs("div", {
    className: "seat-picker-hint",
    role: "dialog",
    "aria-label": "挑一个形象",
    children: [
      jsx.jsx("strong", { children: "挑一个你自己的形象" }),
      jsx.jsx("p", {
        children: "先挑颜色，再挑眼镜、发型、胡子和帽子。以后可以在 设置 → 我的形象 里改。",
      }),
      jsx.jsx(LookChooser, { value: draft, onChange: setDraft }),
      jsx.jsx("div", {
        className: "hint-actions",
        children: jsx.jsx("button", {
          className: "primary",
          onClick: () => {
            confirmedRef.current = true;
            setShowHint(false);
            onAppearance(normalizeLook(draft));
          },
          children: "好了，进去吧",
        }),
      }),
    ],
  });
}

export { LookOnboarding as default };
