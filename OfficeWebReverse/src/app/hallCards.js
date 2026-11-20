// Hall floating cards UI: html sanitising (c0/Pa via DOMPurify), note cards
// (p6/Y/tn/si), contents/cinema cards (n4/m6), the cards manager (I6).
// Recovered verbatim from chunks/HallView.js.
import { Rt } from './hallSeats.js';
import { U5, mi, Ft } from './hallMarkdown.js';
import { Be, S9, xi, we, Zt, B1 } from './hallLoop.js';
import { DOMPurifyInstance as f6 } from '../vendor/dompurify.js';
import { ut, Xs, Ro, Fo } from './hallPartPanel.js';
import { definePrivate as m } from './hallPrelude.js';

function c0(r, e) {
  return Rt.parse(r, e)
}
c0.options = c0.setOptions = function(r) {
  return Rt.setOptions(r), c0.defaults = Rt.defaults, U5(c0.defaults), c0
};
c0.getDefaults = mi;
c0.defaults = Ft;

function Pa(...r) {
  return Rt.use(...r), c0.defaults = Rt.defaults, U5(c0.defaults), c0
}
c0.use = Pa;
c0.walkTokens = function(r, e) {
  return Rt.walkTokens(r, e)
};
c0.parseInline = Rt.parseInline;
c0.Parser = Be;
c0.parser = Be.parse;
c0.Renderer = S9;
c0.TextRenderer = xi;
c0.Lexer = we;
c0.lexer = we.lex;
c0.Tokenizer = Zt;
c0.Hooks = B1;
c0.parse = c0;
c0.options;
c0.setOptions;
c0.walkTokens;
c0.parseInline;
Be.parse;
function p6(r) {
  const e = document.createElement("div");
  e.className = "reader-prose reader-markdown", e.innerHTML = f6.sanitize(c0.parse(r, {
    async: !1,
    gfm: !0,
    breaks: !0
  }), {
    ALLOWED_TAGS: ["p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "del", "blockquote", "ul", "ol", "li", "pre", "code", "table", "thead", "tbody", "tr", "th", "td", "a", "img", "input"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "start", "align", "type", "checked", "disabled"],
    ALLOW_DATA_ATTR: !1
  });
  for (const t of e.querySelectorAll("a")) {
    const s = t.getAttribute("href") || "";
    /^(https?:\/\/|mailto:)/i.test(s) ? (t.target = "_blank", t.rel = "noopener noreferrer") : t.removeAttribute("href")
  }
  for (const t of e.querySelectorAll("input")) t.type = "checkbox", t.disabled = !0;
  for (const t of e.querySelectorAll("img")) {
    const s = t.getAttribute("src") || "";
    if (!/^https?:\/\//i.test(s) && !/^data:image\/(png|jpeg|webp);base64,/i.test(s)) {
      t.replaceWith(document.createTextNode(t.alt || "图片地址不支持"));
      continue
    }
    t.loading = "lazy", t.referrerPolicy = "no-referrer", t.onerror = () => t.replaceWith(document.createTextNode(`图片加载失败：${t.alt||"图片"}`));
    const i = document.createElement("a");
    i.href = s, i.target = "_blank", i.rel = "noopener noreferrer", i.title = "打开大图", t.replaceWith(i), i.append(t)
  }
  for (const t of e.querySelectorAll("table")) {
    const s = document.createElement("div");
    s.className = "reader-table", s.tabIndex = 0, s.setAttribute("role", "region"), s.setAttribute("aria-label", "表格，可横向滚动"), t.replaceWith(s), s.append(t)
  }
  return e
}
const Y = (r, e = "", t = "") => {
    const s = document.createElement(r);
    return s.className = e, s.textContent = t, s
  },
  v0 = (r, e) => {
    const t = Y("button", "", r);
    return t.type = "button", t.onclick = e, t
  };

function tn(r) {
  try {
    const e = new URL(r);
    return /^https?:$/.test(e.protocol) && /\.(mp4|webm|ogv)$/i.test(e.pathname)
  } catch {
    return !1
  }
}
const si = r => r.type === "image" ? "图片" : r.type === "note" ? "文章" : ut(r.value) || tn(r.value) ? "视频" : "链接",
  E9 = r => new Date(r).toLocaleDateString("zh-CN");

function n4(r, e, t, s = {}) {
  const i = Y("dialog", "hall-reader"),
    n = Y("header"),
    o = Y("h2"),
    a = Y("div", "library-actions"),
    l = Y("div", "reader-body"),
    A = Y("footer"),
    c = document.activeElement instanceof HTMLElement ? document.activeElement : null,
    h = Y("div", "reader-stage"),
    u = Y("aside", "reader-sidebar"),
    d = Y("input"),
    g = Y("nav"),
    p = Y("p", "reader-load-status");
  d.type = "search", d.placeholder = "搜索文章", d.setAttribute("aria-label", "搜索文章目录"), g.setAttribute("aria-label", "文章目录"), u.append(Y("strong", "reader-eyebrow", "文章目录"), d, p, g), h.append(u, l);
  let I = e,
    C = 1,
    E = 20,
    x = window.matchMedia("(max-width: 640px)").matches,
    B = !0,
    b = !1;
  const v = () => {
    g.replaceChildren();
    const R = t.filter(Q => Q.type === "note").filter(Q => `${Q.title} ${Q.author}`.toLowerCase().includes(d.value.toLowerCase().trim()));
    for (const Q of R) {
      const H = v0("", () => {
        I = Q, D()
      });
      H.setAttribute("aria-current", String(Q.id === I.id)), H.append(Y("span", "", Q.title), Y("small", "", `${Q.author} · ${E9(Q.at)}`)), g.append(H)
    }!R.length && !b && g.append(Y("p", "", "没有匹配的文章"))
  };
  d.oninput = v;
  const L = () => {
      B = !1, i.close(), i.remove(), c == null || c.focus()
    },
    D = () => {
      var R;
      l.replaceChildren(), l.scrollTop = 0, a.replaceChildren(), A.replaceChildren(), C = 1, i.classList.toggle("reader-document", I.type === "note"), u.hidden = I.type !== "note" || x, v(), o.textContent = I.title, i.setAttribute("aria-label", I.title), l.className = "reader-body";
      const U = Y("span", "", `${si(I)} · ${I.author} · ${E9(I.at)}`);
      if (A.append(U), I.type === "image") {
        l.classList.add("reader-image");
        const Q = Y("img");
        Q.alt = I.title, Q.src = I.value;
        const H = Y("span", "reader-status", "正在加载图片…"),
          N = () => {
            Q.style.width = "", Q.style.maxWidth = "100%", Q.style.maxHeight = "100%", C = 1
          },
          G = W => {
            C = Math.max(.25, Math.min(4, W)), Q.style.width = `${Q.naturalWidth*C}px`, Q.style.maxWidth = "none", Q.style.maxHeight = "none"
          };
        Q.onload = () => H.remove(), Q.onerror = () => {
          H.textContent = "图片加载失败，请关闭后重试"
        }, Q.onclick = () => Q.style.maxWidth === "none" ? N() : G(1), a.append(v0("−", () => G(C - .25)), v0("+", () => G(C + .25)), v0("原尺寸", () => G(1)), v0("适应窗口", N));
        const q = Y("a", "", "下载图片");
        q.href = I.value, q.download = I.title, a.append(q), l.append(Q, H);
        const j = t.filter(W => W.type === "image"),
          h0 = j.findIndex(W => W.id === I.id),
          i0 = v0("上一张", () => {
            I = j[h0 - 1], D()
          });
        i0.disabled = h0 <= 0;
        const u0 = v0("下一张", () => {
          I = j[h0 + 1], D()
        });
        u0.disabled = h0 < 0 || h0 >= j.length - 1, A.append(i0, Y("span", "", `${h0+1} / ${j.length}`), u0)
      } else if (I.type === "note") {
        o.textContent = "公告板 · 阅读室";
        const Q = Y("article", "reader-paper");
        Q.append(Y("div", "reader-eyebrow", "READING ROOM / 共享阅读"), Y("h1", "", I.title), Y("p", "reader-byline", `${I.author} · ${E9(I.at)} · ${I.value.length.toLocaleString()} 字 · 约 ${Math.max(1,Math.ceil(I.value.length/400))} 分钟`), p6(I.value)), Q.style.fontSize = `${E}px`;
        const H = W => {
            E = Math.max(16, Math.min(32, E + W)), Q.style.fontSize = `${E}px`, N.textContent = `${E}px`
          },
          N = Y("span", "reader-font-size", `${E}px`),
          G = v0(x ? "显示目录" : "专注阅读", () => {
            x = !x, u.hidden = x, G.textContent = x ? "显示目录" : "专注阅读"
          });
        a.append(G, v0("字号 −", () => H(-2)), N, v0("字号 +", () => H(2))), l.append(Q);
        const q = t.filter(W => W.type === "note"),
          j = q.findIndex(W => W.id === I.id),
          h0 = v0("← 上一篇", () => {
            I = q[j - 1], D()
          });
        h0.disabled = j <= 0;
        const i0 = v0("下一篇 →", () => {
          I = q[j + 1], D()
        });
        i0.disabled = j < 0 || j >= q.length - 1;
        const u0 = Y("span", "reader-progress", "阅读 0%");
        l.onscroll = () => {
          const W = l.scrollHeight - l.clientHeight;
          u0.textContent = `阅读 ${W>0?Math.round(l.scrollTop/W*100):100}%`
        }, A.append(u0, h0, Y("span", "", `${j+1} / ${q.length}`), i0)
      } else {
        const Q = ut(I.value);
        if (tn(I.value)) {
          const N = Y("video");
          N.controls = !0, N.preload = "metadata", N.src = I.value, N.onerror = () => {
            l.append(Y("p", "", "视频无法播放，可尝试打开原网页。"))
          }, l.append(N)
        } else if (Q != null && Q.embed) {
          const N = Y("iframe");
          N.title = I.title, N.src = Q.embed, N.allow = "fullscreen; picture-in-picture", N.referrerPolicy = "no-referrer", l.append(N)
        } else l.append(Y("h3", "", I.title), Y("p", "", "此内容保留在原网站，打开原网页阅读或观看。若想在这里放大阅读文章，可添加“文章”并粘贴正文。"));
        const H = Y("a", "reader-source", "打开原网页 ↗");
        H.href = I.value, H.target = "_blank", H.rel = "noopener noreferrer", l.append(H)
      }
      if (s.remove && I.owner === ((R = s.myId) == null ? void 0 : R.call(s))) {
        const Q = v0("移除", async () => {
          if (window.confirm(`移除“${I.title}”？`)) {
            Q.disabled = !0;
            try {
              await s.remove(I), L()
            } catch {
              Q.textContent = "移除失败，重试", Q.disabled = !1
            }
          }
        });
        a.append(Q)
      }
      a.append(v0("关闭 ×", L))
    };
  n.append(o, a), i.append(n, h, A);
  for (const U of ["pointerdown", "pointerup", "click", "wheel", "keydown"]) i.addEventListener(U, R => R.stopPropagation());
  i.addEventListener("cancel", U => {
    U.preventDefault(), L()
  }), i.addEventListener("click", U => {
    U.target === i && L()
  }), r.append(i), D(), i.showModal();
  const P = async () => {
    if (!(!s.load || b)) {
      b = !0, p.textContent = "正在加载文章目录…";
      try {
        const U = await s.load();
        if (!B) return;
        t = U.some(R => R.id === e.id) ? U : [e, ...U], p.textContent = "", D()
      } catch {
        B && p.replaceChildren(Y("span", "", "目录加载失败 "), v0("重试", () => void P()))
      } finally {
        b = !1
      }
    }
  };
  return P(), () => {
    B = !1, i.close(), i.remove()
  }
}

function m6(r, e, t, s) {
  let i = [],
    n = "全部",
    o = 0;
  const a = Y("div", "library-browser"),
    l = Y("input"),
    A = Y("div", "library-tabs"),
    c = Y("div", "library-grid"),
    h = Y("div", "library-pager");
  l.type = "search", l.placeholder = "搜索标题、正文或分享者", l.setAttribute("aria-label", "搜索资料");
  const u = () => {
    const d = l.value.trim().toLowerCase(),
      g = i.filter(E => (n === "全部" || si(E) === n) && `${E.title} ${E.author} ${E.type==="image"?"":E.value}`.toLowerCase().includes(d)),
      p = Math.max(1, Math.ceil(g.length / 12));
    o = Math.min(o, p - 1), c.replaceChildren(), h.replaceChildren();
    for (const E of g.slice(o * 12, o * 12 + 12)) {
      const x = Y("div", "library-item"),
        B = v0("", () => e(E, g));
      B.className = "library-open";
      const b = Y("div", `library-cover library-cover-${E.type}`);
      if (E.type === "image") {
        const v = Y("img");
        v.alt = E.title, v.src = E.value, v.loading = "lazy", v.onerror = () => {
          b.textContent = "图片暂不可用"
        }, b.append(v)
      } else b.append(Y("span", "library-kind", si(E)), Y("p", "", E.type === "note" ? E.value.slice(0, 110) : E.title));
      if (B.append(b, Y("strong", "", E.title), Y("small", "", `${E.author} · ${E9(E.at)}`)), x.append(B), E.owner === s()) {
        const v = v0("移除", () => t(E));
        v.className = "library-remove", x.append(v)
      }
      c.append(x)
    }
    g.length || c.append(Y("p", "library-empty", i.length ? "没有找到资料，试试其他关键词或分类。" : "这里还没有资料。添加第一篇文章、一张图片或一个视频链接吧。"));
    const I = v0("上一页", () => {
      o--, u()
    });
    I.disabled = o === 0;
    const C = v0("下一页", () => {
      o++, u()
    });
    C.disabled = o === p - 1, h.append(Y("span", "", `${g.length} 项资料 · ${o+1} / ${p}`), I, C)
  };
  for (const d of ["全部", "文章", "图片", "视频", "链接"]) {
    const g = v0(d, () => {
      n = d, o = 0;
      for (const p of A.querySelectorAll("button")) p.setAttribute("aria-pressed", String(p === g));
      u()
    });
    g.setAttribute("aria-pressed", String(d === n)), A.append(g)
  }
  return l.oninput = () => {
    o = 0, u()
  }, a.append(l, A, c, h), r.append(a), d => {
    i = [...d].reverse(), u()
  }
}
const f0 = (r, e = "", t = "") => {
    const s = document.createElement(r);
    return e && (s.className = e), t && (s.textContent = t), s
  },
  bt = (r, e, t = "") => {
    const s = f0("button", t, r);
    return s.type = "button", s.addEventListener("click", e), s
  },
  r4 = (r, e, t) => {
    const s = f0("div", "chips");
    for (const [i, n] of r) {
      const o = bt(n, () => {
        t(i), s.querySelectorAll("button").forEach(a => a.setAttribute("aria-pressed", String(a === o)))
      });
      o.setAttribute("aria-pressed", String(i === e)), s.appendChild(o)
    }
    return s
  },
  At = (r, e) => {
    const t = (r == null ? void 0 : r.message) || "";
    return /[一-鿿]/.test(t) ? t : e
  };
class I6 {
  constructor(e, t, s, i, n, o) {
    m(this, "card", null);
    m(this, "at", null);
    m(this, "closeReader", null);
    this.host = e, this.camera = t, this.api = s, this.myId = i, this.centred = n, this.notice = o
  }
  get open() {
    return !!this.card
  }
  clear() {
    var e, t;
    (e = this.closeReader) == null || e.call(this), this.closeReader = null, (t = this.card) == null || t.remove(), this.card = null, this.at = null
  }
  show(e, t) {
    this.clear(), this.card = e, e.classList.add("hall-card");
    for (const s of ["pointerdown", "wheel", "keydown"]) e.addEventListener(s, i => i.stopPropagation());
    e.addEventListener("keydown", s => {
      s.key === "Escape" && this.clear()
    }), this.centred() || !t ? e.classList.add("centered") : this.at = t.clone(), this.host.appendChild(e), this.frame()
  }
  frame() {
    if (!this.card || !this.at) return;
    const e = this.at.clone().project(this.camera),
      t = this.host.clientWidth,
      s = this.host.clientHeight,
      i = this.card.getBoundingClientRect();
    this.card.style.left = `${Math.max(i.width/2+8,Math.min(t-i.width/2-8,(e.x+1)/2*t))}px`, this.card.style.top = `${Math.max(i.height+20,Math.min(s-8,(1-e.y)/2*s))}px`
  }
  async contents(e, t, s, i, n = !1) {
    var R, Q, H;
    const o = f0("div", "hall-library"),
      a = f0("strong", "", t + (n ? " · 添加内容" : " · 资料库")),
      l = f0("small", "", s),
      A = f0("div", "list"),
      c = f0("small", "seen"),
      h = f0("div", "library-header");
    h.append(a, bt("关闭 ×", () => this.clear())), l.textContent = "收藏文章、图片与视频 · 点击卡片放大查看", o.append(h, l), n ? (o.classList.add("board-composer"), l.textContent = "把文章、图片或链接贴到板子上") : o.append(c, A);
    const u = m6(A, (N, G) => {
        var q;
        (q = this.closeReader) == null || q.call(this), this.closeReader = n4(this.host, N, G)
      }, N => {
        window.confirm(`移除“${N.title}”？`) && this.take(e, N, g)
      }, this.myId),
      d = (N, G) => {
        var j;
        u(N);
        const q = [(j = G.creator) == null ? void 0 : j.name, ...G.readers.map(h0 => h0.name)].filter(Boolean);
        c.textContent = q.length ? `${q.length} 人看过 · ${q.slice(0,4).join("、")}${q.length>4?" 等":""}` : ""
      },
      g = async () => {
        l.textContent = "正在加载资料…";
        try {
          const N = await this.api.contents(e);
          this.card === o && (d(N.entries, N.people), l.textContent = "点击卡片放大查看 · 图片支持原尺寸")
        } catch (N) {
          l.textContent = At(N, "读不出来")
        }
      }, p = bt("刷新资料", () => void g());
    n || o.append(p);
    let I = n ? "note" : "link";
    const C = f0("form", "add"),
      E = f0("input"),
      x = f0("textarea"),
      B = f0("input");
    E.placeholder = "起个名字", E.maxLength = 100, E.setAttribute("aria-label", "名字"), x.rows = 2, x.setAttribute("aria-label", "内容"), B.type = "file", B.accept = "image/png,image/jpeg,image/webp", B.hidden = !0;
    let b = "";
    const v = N => {
        I = N, b = "", x.hidden = N === "image", L.hidden = N !== "image", L.textContent = "选一张图片", x.placeholder = N === "link" ? "粘贴文章或视频链接 https://…" : "粘贴文章正文或 Markdown（最多 40000 字）…", x.maxLength = N === "link" ? 2048 : 4e4
      },
      L = bt("选一张图片", () => B.click(), "pick");
    B.addEventListener("change", async () => {
      var G;
      const N = (G = B.files) == null ? void 0 : G[0];
      if (B.value = "", !!N) try {
        b = await Xs(N), L.textContent = `✓ ${N.name}`, E.value || (E.value = N.name.replace(/\.[^.]+$/, "").slice(0, 100))
      } catch (q) {
        this.notice(At(q, "图片太大或格式不支持（PNG、JPEG、WebP）"))
      }
    });
    const D = f0("button", "go", n ? "贴上去" : "放进去");
    if (D.type = "submit", C.append(r4([
        ["link", "链接 / 视频"],
        ["note", "文章"],
        ["image", "图片"]
      ], I, v), E, x, L, B, D), C.addEventListener("submit", async N => {
        N.preventDefault();
        const G = I === "image" ? b : x.value.trim(),
          q = E.value.trim() || (I === "link" ? (() => {
            try {
              return new URL(G).host
            } catch {
              return ""
            }
          })() : G.slice(0, 20));
        if (!G) {
          this.notice(I === "image" ? "先选一张图片" : "写点内容");
          return
        }
        D.disabled = !0;
        try {
          await this.api.send({
            action: "put",
            id: e,
            entry: {
              type: I,
              title: q,
              value: G
            }
          }), E.value = "", x.value = "", v(I), n ? (this.clear(), this.notice("已贴到公告板")) : await g()
        } catch (j) {
          this.notice(At(j, "没放进去"))
        } finally {
          D.disabled = !1
        }
      }), v(n ? "note" : "link"), n) {
      x.rows = 8, o.append(C), this.show(o, null), E.focus();
      return
    }
    const P = f0("details", "library-composer"),
      U = f0("summary", "", "+ 添加资料");
    P.append(U, C), o.appendChild(P), this.show(o, null), l.textContent = "正在加载资料…";
    try {
      const N = await this.api.contents(e);
      if (this.card !== o) return;
      if (d(N.entries, N.people), l.textContent = "点击卡片放大查看 · 图片支持原尺寸", !N.people.readers.some(G => G.id === this.myId()) && ((R = N.people.creator) == null ? void 0 : R.id) !== this.myId()) {
        const q = (H = (Q = (await this.api.send({
          action: "read",
          id: e
        })).parts) == null ? void 0 : Q.find(j => j.id === e)) == null ? void 0 : H.chestPeople;
        q && this.card === o && d(N.entries, q)
      }
    } catch (N) {
      l.textContent = At(N, "读不出来")
    }
  }
  async take(e, t, s) {
    try {
      await this.api.send({
        action: "take",
        id: e,
        entryId: t.id
      }), await s(), this.notice(`拿走了“${t.title}”`)
    } catch (i) {
      this.notice(At(i, "没拿走"))
    }
  }
  note(e, t, s, i) {
    this.clear(), this.closeReader = n4(this.host, t, [t], {
      load: async () => (await this.api.contents(e)).entries,
      remove: async n => {
        await this.api.send({
          action: "take",
          id: e,
          entryId: n.id
        }), i()
      },
      myId: this.myId
    })
  }
  async cinema(e, t, s) {
    const i = f0("div", "wide"),
      n = f0("small", "status"),
      o = f0("input");
    o.placeholder = "粘贴图片、视频或 YouTube / Vimeo 链接", o.setAttribute("aria-label", "链接");
    const a = f0("input");
    a.type = "file", a.hidden = !0, a.accept = "image/png,image/jpeg,image/webp,video/mp4,video/webm";
    let l = "",
      A = null,
      c = "contain",
      h = 0;
    const u = f0("button", "go", "放到屏幕上");
    u.type = "button";
    const d = bt("清空屏幕", () => void p(null)),
      g = async () => {
        A = null, u.disabled = !0;
        const C = Ro(o.value);
        if (!C) {
          n.textContent = "";
          return
        }
        n.textContent = "正在识别…";
        try {
          A = await Fo(C, AbortSignal.timeout(9e3)), l = C, n.textContent = A === "image" ? "是一张图片" : `是视频${ut(C)?`（${ut(C).platform}）`:""}`, u.disabled = !1
        } catch {
          n.textContent = "认不出来：要 https 开头的图片或视频链接"
        }
      };
    o.addEventListener("change", () => void g()), o.addEventListener("paste", () => setTimeout(() => void g(), 0)), a.addEventListener("change", async () => {
      var E;
      const C = (E = a.files) == null ? void 0 : E[0];
      if (a.value = "", !!C) {
        u.disabled = !0;
        try {
          C.type.startsWith("image/") ? (l = await Xs(C), A = "image") : (l = await this.api.uploadVideo(e, C, x => {
            n.textContent = `上传中 ${x}%`
          }), A = "video"), o.value = "", n.textContent = `✓ ${C.name}`, u.disabled = !1
        } catch (x) {
          n.textContent = At(x, "传不上去：图片 20 MB、视频 100 MB 以内，MP4 或 WebM")
        }
      }
    });
    const p = async C => {
      u.disabled = d.disabled = !0;
      try {
        await this.api.send({
          action: "cinema",
          id: e,
          version: h,
          content: C
        }), h = (await this.api.screen(e)).version, n.textContent = C ? "放上去了，大家都能看到" : "清空了", s()
      } catch (E) {
        n.textContent = At(E, "没放上去")
      } finally {
        u.disabled = !A, d.disabled = !1
      }
    };
    u.addEventListener("click", () => {
      A && p({
        type: A,
        src: l,
        fit: c
      })
    }), u.disabled = !0;
    const I = f0("div", "row");
    I.append(d, u), i.append(f0("strong", "", "影院屏"), f0("small", "", "放一张图或一段视频，大厅里的人都能看到"), o, bt("或者从电脑里选一个文件", () => a.click(), "pick"), a, r4([
      ["contain", "完整显示"],
      ["cover", "铺满"],
      ["stretch", "拉伸"]
    ], c, C => {
      c = C
    }), n, I), this.show(i, t);
    try {
      const C = await this.api.screen(e);
      h = C.version, C.content && (c = C.content.fit, !C.content.src.startsWith("data:") && !C.content.src.startsWith("/api/") && (o.value = C.content.src), n.textContent = "现在在放：" + (C.content.type === "image" ? "图片" : "视频"))
    } catch (C) {
      n.textContent = At(C, "读不出来")
    }
  }
  player(e, t) {
    const s = ut(e);
    if (!(s != null && s.embed)) return null;
    const i = f0("div", "hall-player"),
      n = f0("iframe");
    return n.src = s.embed.replace("autoplay=0", "autoplay=1"), n.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen", n.title = "视频", i.append(n, bt("×", () => {
      i.remove(), t()
    }, "close")), i.addEventListener("pointerdown", o => o.stopPropagation()), this.host.appendChild(i), i
  }
}

export { c0, Pa, p6, Y, v0, tn, si, E9, n4, m6, f0, bt, r4, At, I6 };
