// Hall furniture catalog: color palette (er), fixed finishes (tr), part
// definitions (sr), the catalog object, and the derived lookup helpers plus
// the shared/finished material factories (b5/s9).
// Recovered verbatim from chunks/HallView.js; only imports/exports added.
import { f as U0, g as Ie, M as K } from '../chunks/portraitLighting.js';
import { D9, W8, w5 } from './hallMaterials.js';

const er = {
    top: "#e9d4aa",
    white: "#f4f1ea",
    wood: "#dcc08c",
    blue: "#5c6b9c",
    wall: "#7f8eb6",
    coral: "#ea9a84",
    sage: "#9cc7c0",
    ink: "#2c2e35",
    water: "#48aebd"
  },
  tr = {
    trim: "#c9a979",
    shade: "#f3ead8",
    plant: "#6f9468",
    cork: "#d8b98a",
    screen: "#1f2325",
    paper: "#f4efe4",
    terra: "#e08f78"
  },
  sr = [{
    id: "block",
    label: "方块",
    category: "build",
    color: "top",
    boxes: [
      [.5, .5, .5, 0, .25, 0, "c"]
    ]
  }, {
    id: "slab",
    label: "地台",
    category: "build",
    color: "top",
    boxes: [
      [1, .12, 1, 0, .06, 0, "c"]
    ]
  }, {
    id: "water",
    label: "水面",
    category: "build",
    color: "water",
    surface: "water",
    hint: "蓝绿水面 · 细波纹与水光 · 可缩放",
    boxes: [
      [1, .25, 1, 0, .125, 0, "c"]
    ]
  }, {
    id: "wall",
    label: "墙",
    category: "build",
    color: "white",
    boxes: [
      [1, 1.6, .14, 0, .8, 0, "c"]
    ]
  }, {
    id: "arch",
    label: "拱门",
    category: "build",
    color: "white",
    hint: "圆弧拱门 · 镂空门洞",
    arch: {
      outerRadius: 1.25,
      innerRadius: 1,
      springHeight: 1.75,
      depth: .25
    }
  }, {
    id: "stairs",
    label: "楼梯",
    category: "build",
    color: "white",
    boxes: [
      [1, .3, .3, 0, .15, .75, "c"],
      [1, .6, .3, 0, .3, .45, "c"],
      [1, .9, .3, 0, .45, .15, "c"],
      [1, 1.2, .3, 0, .6, -.15, "c"],
      [1, 1.5, .3, 0, .75, -.45, "c"],
      [1, 1.8, .3, 0, .9, -.75, "c"]
    ]
  }, {
    id: "column",
    label: "柱子",
    category: "build",
    color: "ink",
    boxes: [
      [.22, 1.8, .22, 0, .9, 0, "c"]
    ]
  }, {
    id: "railing",
    label: "栏杆",
    category: "build",
    color: "ink",
    boxes: [
      [1, .035, .035, 0, 1, 0, "c"],
      [1, .035, .035, 0, .5, 0, "c"],
      [.035, 1, .035, -.48, .5, 0, "c"],
      [.035, 1, .035, 0, .5, 0, "c"],
      [.035, 1, .035, .48, .5, 0, "c"]
    ]
  }, {
    id: "ladder",
    label: "梯子",
    category: "build",
    color: "wood",
    boxes: [
      [.06, 2, .06, -.25, 1, 0, "c"],
      [.06, 2, .06, .25, 1, 0, "c"],
      [.5, .04, .05, 0, .2, 0, "c"],
      [.5, .04, .05, 0, .52, 0, "c"],
      [.5, .04, .05, 0, .84, 0, "c"],
      [.5, .04, .05, 0, 1.16, 0, "c"],
      [.5, .04, .05, 0, 1.48, 0, "c"],
      [.5, .04, .05, 0, 1.8, 0, "c"]
    ]
  }, {
    id: "shelf",
    label: "书架",
    category: "build",
    color: "wood",
    holds: !0,
    boxes: [
      [1, 1.6, .35, 0, .8, 0, "c"],
      [.9, .04, .3, 0, .4, .03, "trim"],
      [.9, .04, .3, 0, .8, .03, "trim"],
      [.9, .04, .3, 0, 1.2, .03, "trim"]
    ]
  }, {
    id: "table",
    label: "桌子",
    category: "build",
    color: "top",
    holds: !0,
    boxes: [
      [1.2, .07, .7, 0, .74, 0, "c"],
      [.07, .7, .07, -.5, .36, -.28, "ink"],
      [.07, .7, .07, .5, .36, -.28, "ink"],
      [.07, .7, .07, -.5, .36, .28, "ink"],
      [.07, .7, .07, .5, .36, .28, "ink"]
    ]
  }, {
    id: "round-table",
    label: "圆桌",
    category: "build",
    color: "white",
    holds: !0,
    boxes: [
      [.06, .7, .06, 0, .36, 0, "ink"],
      [.4, .03, .4, 0, .015, 0, "ink"]
    ],
    shapes: [
      ["cyl", .45, .05, 0, .74, 0, "c"]
    ]
  }, {
    id: "chair",
    label: "椅子",
    category: "build",
    color: "coral",
    seat: {
      at: [0, .5, .02],
      face: 0
    },
    boxes: [
      [.42, .05, .42, 0, .45, 0, "c"],
      [.42, .42, .05, 0, .69, -.19, "c"],
      [.035, .43, .035, -.17, .215, -.17, "ink"],
      [.035, .43, .035, .17, .215, -.17, "ink"],
      [.035, .43, .035, -.17, .215, .17, "ink"],
      [.035, .43, .035, .17, .215, .17, "ink"]
    ]
  }, {
    id: "stool",
    label: "凳子",
    category: "build",
    color: "coral",
    seat: {
      at: [0, .44, 0],
      face: 0
    },
    boxes: [
      [.42, .07, .42, 0, .4, 0, "c"],
      [.05, .36, .05, 0, .2, 0, "ink"]
    ]
  }, {
    id: "plant",
    label: "植物",
    category: "build",
    color: "white",
    boxes: [
      [.34, .4, .34, 0, .2, 0, "c"]
    ],
    shapes: [
      ["ball", .3, 0, .72, 0, "plant"],
      ["ball", .21, .11, .95, .04, "plant"],
      ["ball", .2, -.1, .88, -.07, "plant"]
    ]
  }, {
    id: "lamp",
    label: "落地灯",
    category: "build",
    color: "white",
    light: {
      at: [0, 1.45, 0],
      power: 2.2
    },
    boxes: [
      [.04, 1.5, .04, 0, .75, 0, "ink"],
      [.3, .03, .3, 0, .015, 0, "ink"]
    ],
    shapes: [
      ["cone", .22, 0, 1.6, 0, "c"]
    ]
  }, {
    id: "rug",
    label: "地毯",
    category: "build",
    color: "coral",
    shapes: [
      ["cyl", 1.2, .02, 0, .01, 0, "c"]
    ]
  }, {
    id: "billiards",
    label: "台球桌",
    category: "live",
    color: "wood",
    hint: "点击开局 · 左键长按蓄力，松开击球 · 多人轮流",
    boxes: [
      [3.5, 1.12, 2.25, 0, .56, 0, "c"]
    ]
  }, {
    id: "desk",
    label: "工位",
    category: "live",
    color: "top",
    hint: "自己的位置 · 屏幕上是本人的工作画面",
    workstation: {
      sit: [0, .44, -.75],
      face: 0,
      monitor: {
        at: [0, 1.13, -.08],
        size: [.38, .24]
      },
      lamp: [.42, .99, .3]
    },
    boxes: [
      [1.1, .07, .9, 0, .94, 0, "c"],
      [.07, .9, .08, -.5, .46, -.36, "ink"],
      [.07, .9, .08, .5, .46, -.36, "ink"],
      [.07, .9, .08, -.5, .46, .36, "ink"],
      [.07, .9, .08, .5, .46, .36, "ink"],
      [.42, .025, .3, 0, .99, -.23, "ink"]
    ]
  }, {
    id: "screen",
    label: "影院屏",
    category: "live",
    color: "ink",
    cinema: {
      at: [0, 1.3, .034],
      size: [1.7, .95]
    },
    hint: "点一下一起看 · 双击正对",
    boxes: [
      [1.8, 1.05, .06, 0, 1.3, 0, "screen"],
      [.1, .8, .1, 0, .4, 0, "c"],
      [.6, .05, .4, 0, .03, 0, "c"],
      [1.94, 1.19, .05, 0, 1.3, -.045, "c"]
    ]
  }, {
    id: "board",
    label: "钉板",
    category: "live",
    color: "wood",
    notes: {
      at: [0, 1.15, .03],
      size: [1.6, 1]
    },
    hint: "大家贴的东西 · 双击正对",
    boxes: [
      [1.6, 1, .05, 0, 1.15, 0, "c"],
      [.06, 1.65, .06, -.7, .82, -.04, "ink"],
      [.06, 1.65, .06, .7, .82, -.04, "ink"]
    ]
  }, {
    id: "chest",
    label: "百宝箱",
    category: "live",
    color: "wood",
    holds: !0,
    hint: "收藏的片子和链接",
    boxes: [
      [.8, .45, .5, 0, .23, 0, "c"],
      [.84, .08, .54, 0, .49, 0, "c"]
    ]
  }, {
    id: "cabinet",
    label: "资料柜",
    category: "live",
    color: "wood",
    holds: !0,
    hint: "柜子里的资料 · 点开看",
    boxes: [
      [.9, 1.4, .45, 0, .7, 0, "c"],
      [.82, .38, .05, 0, .25, .235, "c"],
      [.82, .38, .05, 0, .7, .235, "c"],
      [.82, .38, .05, 0, 1.15, .235, "c"],
      [.2, .03, .03, 0, .25, .27, "ink"],
      [.2, .03, .03, 0, .7, .27, "ink"],
      [.2, .03, .03, 0, 1.15, .27, "ink"]
    ]
  }, {
    id: "doc-desk",
    label: "资料桌",
    category: "live",
    color: "top",
    holds: !0,
    hint: "桌上的资料 · 点开看",
    boxes: [
      [1.2, .07, .7, 0, .74, 0, "c"],
      [.07, .7, .07, -.5, .36, -.28, "ink"],
      [.07, .7, .07, .5, .36, -.28, "ink"],
      [.07, .7, .07, -.5, .36, .28, "ink"],
      [.07, .7, .07, .5, .36, .28, "ink"],
      [.3, .07, .22, -.25, .815, .05, "paper"],
      [.32, .03, .24, .22, .79, -.02, "terra"]
    ]
  }, {
    id: "sofa",
    label: "沙发",
    category: "live",
    color: "coral",
    seat: {
      at: [0, .64, .05],
      face: 0,
      count: 2,
      spread: .9
    },
    hint: "点一下坐下",
    boxes: [
      [1.9, .36, .8, 0, .25, 0, "c"],
      [1.9, .5, .22, 0, .55, -.3, "c"],
      [.22, .52, .8, -.95, .3, 0, "c"],
      [.22, .52, .8, .95, .3, 0, "c"]
    ]
  }, {
    id: "pad",
    label: "传送点",
    category: "live",
    color: "sage",
    teleport: !0,
    hint: "点一下传到下一个传送点",
    shapes: [
      ["disc", .42, 0, .03, 0, "c"]
    ]
  }],
  ir = {
    palette: er,
    fixed: tr,
    parts: sr
  },
  i1 = ir,
  Vs = Object.values(i1.palette),
  K0 = Math.PI / 12,
  nr = new Map(i1.parts.map(r => [r.id, r])),
  X0 = r => nr.get(r) || null,
  gs = (r, e) => r === "c" ? e : i1.palette[r] || i1.fixed[r] || r,
  rr = new U0(1, 1, 1),
  or = new Set(["block", "slab", "wall", "stairs", "column", "arch"]),
  fs = new Map,
  b5 = (r, e = !1, t = D9(r)) => {
    const s = r + e + t;
    if (!fs.has(s)) {
      const i = W8(r),
        n = new Ie({
          color: i,
          ...w5(t),
          ...e ? {
            emissive: i,
            emissiveIntensity: .25
          } : {}
        });
      n.userData.shared = !0, e && (n.userData.lit = !0), fs.set(s, n)
    }
    return fs.get(s)
  },
  s9 = (r, e, t, s = !1, i = null) => {
    const n = new K(r, b5(e, s, i ?? D9(e)));
    return n.userData.token = t, n.userData.finish = {
      emissive: s,
      surface: i
    }, n
  };

export { tr, i1, Vs, K0, X0, gs, rr, or, b5, s9 };
