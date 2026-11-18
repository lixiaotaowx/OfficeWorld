function O2(r, e, t, s) {
    if (!e.includes("<")) return !1;
    for (let i = 0; i < e.length; i++) {
        if (e[i] === "\\") {
            i++;
            continue
        }
        if (e[i] === "`") {
            let a = s.inline.code.exec(e.slice(i));
            if (a) {
                i += a[0].length - 1;
                continue
            }
        }
        if (e[i] !== "<") continue;
        let n = r.slice(t + i),
            o = s.inline.tag.exec(n) || s.inline.autolink.exec(n);
        if (o) {
            if (o[0].length > e.length - i) return !0;
            i += o[0].length - 1
        }
    }
    return !1
}
var Zt = class {
        constructor(r) {
            m(this, "options");
            m(this, "rules");
            m(this, "lexer");
            this.options = r || Ft
        }
        space(r) {
            let e = this.rules.block.newline.exec(r);
            if (e && e[0].length > 0) return {
                type: "space",
                raw: e[0]
            }
        }
        code(r) {
            let e = this.rules.block.code.exec(r);
            if (e) {
                let t = this.options.pedantic ? e[0] : G2(e[0]),
                    s = t.replace(this.rules.other.codeRemoveIndent, "");
                return {
                    type: "code",
                    raw: t,
                    codeBlockStyle: "indented",
                    text: s
                }
            }
        }
        fences(r) {
            let e = this.rules.block.fences.exec(r);
            if (e) {
                let t = e[0],
                    s = Fa(t, e[3] || "", this.rules);
                return {
                    type: "code",
                    raw: t,
                    lang: e[2] ? e[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : e[2],
                    text: s
                }
            }
        }
        heading(r) {
            let e = this.rules.block.heading.exec(r);
            if (e) {
                let t = e[2].trim();
                if (this.rules.other.endingHash.test(t)) {
                    let s = at(t, "#");
                    (this.options.pedantic || !s || this.rules.other.endingSpaceTabChar.test(s)) && (t = s.trim())
                }
                return {
                    type: "heading",
                    raw: at(e[0], `
`),
                    depth: e[1].length,
                    text: t,
                    tokens: this.lexer.inline(t)
                }
            }
        }
        hr(r) {
            let e = this.rules.block.hr.exec(r);
            if (e) return {
                type: "hr",
                raw: at(e[0], `
`)
            }
        }
        blockquote(r) {
            let e = this.rules.block.blockquote.exec(r);
            if (e) {
                let t = at(e[0], `
`).split(`
`),
                    s = "",
                    i = "",
                    n = [];
                for (; t.length > 0;) {
                    let o = !1,
                        a = [],
                        l;
                    for (l = 0; l < t.length; l++)
                        if (this.rules.other.blockquoteStart.test(t[l])) a.push(t[l]), o = !0;
                        else if (!o) a.push(t[l]);
                    else break;
                    t = t.slice(l);
                    let A = a.join(`
`),
                        c = A.replace(this.rules.other.blockquoteMarkerWhitespace, (d, g, p) => g + A9(p, g.length)).replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
                    s = s ? `${s}
${A}` : A, i = i ? `${i}
${c}` : c;
                    let h = this.lexer.state.top;
                    if (this.lexer.state.top = !0, this.lexer.blockTokens(c, n, !0), this.lexer.state.top = h, t.length === 0) break;
                    let u = n.at(-1);
                    if ((u == null ? void 0 : u.type) === "code" || (u == null ? void 0 : u.type) === "heading" || (u == null ? void 0 : u.type) === "hr" || (u == null ? void 0 : u.type) === "html") break;
                    if ((u == null ? void 0 : u.type) === "blockquote") {
                        let d = u,
                            g = t.join(`
`),
                            p = d.raw + `
` + g.replace(this.rules.other.blockquoteSetextReplace2, ""),
                            I = this.blockquote(p);
                        n[n.length - 1] = I;
                        let C = p.substring(I.raw.length).replace(/^\n/, ""),
                            E = C ? C.split(`
`).length : 0,
                            x = E ? t.slice(0, -E) : t;
                        x.length > 0 && (s = `${s}
${x.join(`
`)}`), i = i.substring(0, i.length - d.text.length) + I.text;
                        break
                    } else if ((u == null ? void 0 : u.type) === "list") {
                        let d = u,
                            g = d.raw + `
` + t.join(`
`),
                            p = this.list(g);
                        n[n.length - 1] = p;
                        let I = p.raw.length > d.raw.length ? g.slice(d.raw.length + 1, p.raw.length).split(`
`).length : 0;
                        if (I > 0) {
                            let C = t.slice(0, I).join(`
`);
                            s = `${s}
${C}`, i = `${i}
${C}`
                        }
                        t = t.slice(I);
                        continue
                    }
                }
                return {
                    type: "blockquote",
                    raw: s,
                    tokens: n,
                    text: i
                }
            }
        }
        list(r) {
            let e = this.rules.block.list.exec(r);
            if (e) {
                let t = r,
                    s = () => t.length - r.length,
                    i = e[1].trim(),
                    n = i.length > 1,
                    o = {
                        type: "list",
                        raw: "",
                        ordered: n,
                        start: n ? +i.slice(0, -1) : "",
                        loose: !1,
                        items: []
                    };
                i = n ? `\\d{1,9}\\${i.slice(-1)}` : `\\${i}`, this.options.pedantic && (i = n ? i : "[*+-]");
                let a = this.rules.other.listItemRegex(i),
                    l = !1;
                for (; r;) {
                    let c = !1,
                        h = "";
                    if (!(e = a.exec(r)) || this.rules.block.hr.test(r)) break;
                    let u = s();
                    r = r.substring(e[0].length);
                    let d = e[2].split(`
`, 1)[0],
                        g = e[1].length,
                        p = this.options.pedantic ? A9(d, g) : d.replace(this.rules.other.leadingSpaceTab, B => A9(B, g)),
                        I = r.split(`
`, 1)[0],
                        C = !p.trim(),
                        E = 0;
                    if (this.options.pedantic ? (E = 2, h = p.trimStart()) : C ? E = g + 1 : (E = p.search(this.rules.other.nonSpaceChar), E = E > 4 ? 1 : E, h = p.slice(E), E += g), C && this.rules.other.blankLine.test(I) && (r = r.substring(I.length + 1), c = !0), !c) {
                        let B = this.rules.other.nextBulletRegex(E),
                            b = this.rules.other.hrRegex(E),
                            v = this.rules.other.fencesBeginRegex(E),
                            L = this.options.pedantic ? this.rules.other.pedanticHeadingBeginRegex(E) : this.rules.other.headingBeginRegex(E),
                            D = this.rules.other.htmlBeginRegex(E),
                            P = this.rules.other.blockquoteBeginRegex(E);
                        for (; r;) {
                            let U = r.split(`
`, 1)[0],
                                R;
                            if (I = U, this.options.pedantic ? (I = I.replace(this.rules.other.listReplaceNesting, "  "), R = I) : R = I.replace(this.rules.other.leadingSpaceTab, Q => A9(Q)), v.test(I) || L.test(I) || D.test(I) || P.test(I) || B.test(I) || b.test(I)) break;
                            if (R.search(this.rules.other.nonSpaceChar) >= E || !I.trim()) h += `
` + R.slice(E);
                            else {
                                if (C || p.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || v.test(p) || L.test(p) || b.test(p)) break;
                                let Q = !this.options.pedantic && /^ {0,3}(?:=+|-+) *$/.test(I) && this.rules.block.lheading.test(`${p}
${I}`) ? `    ${R.replace(/^ {0,3}/,"")}` : I;
                                h += `
` + Q
                            }
                            C = !I.trim(), r = r.substring(U.length + 1), p = R.slice(E)
                        }
                    }
                    let x = t.slice(u, s());
                    o.loose || (l ? o.loose = !0 : this.rules.other.doubleBlankLine.test(x) && (l = !0)), o.items.push({
                        type: "list_item",
                        raw: x,
                        task: !!this.options.gfm && this.rules.other.listIsTask.test(h),
                        loose: !1,
                        text: h,
                        tokens: []
                    })
                }
                let A = o.items.at(-1);
                if (A) A.raw = A.raw.trimEnd(), A.text = A.text.trimEnd();
                else return;
                o.raw = t.slice(0, s()).trimEnd();
                for (let c of o.items)
                    if (this.lexer.state.top = !1, c.tokens = this.lexer.blockTokens(c.text, []), !o.loose) {
                        let h = c.tokens.filter(d => d.type === "space"),
                            u = h.length > 0 && h.some(d => this.rules.other.anyLine.test(d.raw));
                        o.loose = u
                    } for (let c of o.items) {
                    let h = c.tokens[0];
                    if (c.task && ((h == null ? void 0 : h.type) === "text" || (h == null ? void 0 : h.type) === "paragraph")) {
                        c.text = c.text.replace(this.rules.other.listReplaceTask, ""), h.raw = h.raw.replace(this.rules.other.listReplaceTask, ""), h.text = h.text.replace(this.rules.other.listReplaceTask, "");
                        for (let d = this.lexer.inlineQueue.length - 1; d >= 0; d--)
                            if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[d].src)) {
                                this.lexer.inlineQueue[d].src = this.lexer.inlineQueue[d].src.replace(this.rules.other.listReplaceTask, "");
                                break
                            } let u = this.rules.other.listTaskCheckbox.exec(c.raw);
                        if (u) {
                            let d = {
                                type: "checkbox",
                                raw: u[0] + " ",
                                checked: u[0] !== "[ ]"
                            };
                            c.checked = d.checked, o.loose ? c.tokens[0] && ["paragraph", "text"].includes(c.tokens[0].type) && "tokens" in c.tokens[0] && c.tokens[0].tokens ? (c.tokens[0].raw = d.raw + c.tokens[0].raw, c.tokens[0].text = d.raw + c.tokens[0].text, c.tokens[0].tokens.unshift(d)) : c.tokens.unshift({
                                type: "paragraph",
                                raw: d.raw,
                                text: d.raw,
                                tokens: [d]
                            }) : c.tokens.unshift(d)
                        }
                    } else c.task && (c.task = !1)
                }
                if (o.loose)
                    for (let c of o.items) {
                        c.loose = !0;
                        for (let h of c.tokens) h.type === "text" && (h.type = "paragraph")
                    }
                return o
            }
        }
        html(r) {
            let e = this.rules.block.html.exec(r);
            if (e) {
                let t = G2(e[0]);
                return {
                    type: "html",
                    block: !0,
                    raw: t,
                    pre: e[1] === "pre" || e[1] === "script" || e[1] === "style",
                    text: t
                }
            }
        }
        def(r) {
            let e = this.rules.block.def.exec(r);
            if (e) {
                if (!this.rules.other.startAngleBracket.test(e[2]) && z2(e[2], "()") !== -1) return;
                let t = Q9(e[1]).replace(this.rules.other.multipleSpaceGlobal, " "),
                    s = e[2] ? e[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "",
                    i = e[3] ? e[3].substring(1, e[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : e[3];
                return {
                    type: "def",
                    tag: t,
                    raw: at(e[0], `
`),
                    href: s,
                    title: i
                }
            }
        }
        table(r) {
            var o;
            let e = this.rules.block.table.exec(r);
            if (!e || !this.rules.other.tableDelimiter.test(e[2])) return;
            let t = U2(e[1]),
                s = e[2].replace(this.rules.other.tableAlignChars, "").split("|"),
                i = (o = e[3]) != null && o.trim() ? e[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [],
                n = {
                    type: "table",
                    raw: at(e[0], `
`),
                    header: [],
                    align: [],
                    rows: []
                };
            if (t.length === s.length) {
                for (let a of s) this.rules.other.tableAlignRight.test(a) ? n.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? n.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? n.align.push("left") : n.align.push(null);
                for (let a = 0; a < t.length; a++) n.header.push({
                    text: t[a],
                    tokens: this.lexer.inline(t[a]),
                    header: !0,
                    align: n.align[a]
                });
                for (let a of i) n.rows.push(U2(a, n.header.length).map((l, A) => ({
                    text: l,
                    tokens: this.lexer.inline(l),
                    header: !1,
                    align: n.align[A]
                })));
                return n
            }
        }
        lheading(r) {
            let e = this.rules.block.lheading.exec(r);
            if (e) {
                let t = e[1].trim();
                return {
                    type: "heading",
                    raw: at(e[0], `
`),
                    depth: e[2].charAt(0) === "=" ? 1 : 2,
                    text: t,
                    tokens: this.lexer.inline(t)
                }
            }
        }
        paragraph(r) {
            let e = this.rules.block.paragraph.exec(r);
            if (e) {
                let t = e[1].charAt(e[1].length - 1) === `
` ? e[1].slice(0, -1) : e[1];
                return {
                    type: "paragraph",
                    raw: e[0],
                    text: t,
                    tokens: this.lexer.inline(t)
                }
            }
        }
        text(r) {
            let e = this.rules.block.text.exec(r);
            if (e) return {
                type: "text",
                raw: e[0],
                text: e[0],
                tokens: this.lexer.inline(e[0])
            }
        }
        escape(r) {
            let e = this.rules.inline.escape.exec(r);
            if (e) return {
                type: "escape",
                raw: e[0],
                text: e[1]
            }
        }
        tag(r) {
            let e = this.rules.inline.tag.exec(r);
            if (e) return !this.lexer.state.inLink && this.rules.other.startATag.test(e[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(e[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(e[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(e[0]) && (this.lexer.state.inRawBlock = !1), {
                type: "html",
                raw: e[0],
                inLink: this.lexer.state.inLink,
                inRawBlock: this.lexer.state.inRawBlock,
                block: !1,
                text: e[0]
            }
        }
        link(r) {
            if (this.lexer.state.linkParenPossible === !1) return;
            let e = this.rules.inline.link.exec(r);
            if (e) {
                let t = e[0].charAt(0) === "!" ? 2 : 1;
                if (!this.options.pedantic && O2(r, e[1], t, this.rules)) return;
                let s = e[2].trim();
                if (!this.options.pedantic && this.rules.other.startAngleBracket.test(s)) {
                    if (!this.rules.other.endAngleBracket.test(s)) return;
                    let o = at(s.slice(0, -1), "\\");
                    if ((s.length - o.length) % 2 === 0) return
                } else {
                    let o = z2(e[2], "()");
                    if (o === -2) return;
                    if (o > -1) {
                        let a = (e[0].indexOf("!") === 0 ? 5 : 4) + e[1].length + o;
                        e[2] = e[2].substring(0, o), e[0] = e[0].substring(0, a).trim(), e[3] = ""
                    }
                }
                let i = e[2],
                    n = "";
                if (this.options.pedantic) {
                    let o = this.rules.other.pedanticHrefTitle.exec(i);
                    o && (i = o[1], n = o[3])
                } else n = e[3] ? e[3].slice(1, -1) : "";
                return i = i.trim(), this.rules.other.startAngleBracket.test(i) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(s) ? i = i.slice(1) : i = i.slice(1, -1)), _2(e, {
                    href: i && i.replace(this.rules.inline.anyPunctuation, "$1"),
                    title: n && n.replace(this.rules.inline.anyPunctuation, "$1")
                }, e[0], this.lexer, this.rules)
            }
        }
        reflink(r, e) {
            let t;
            if ((t = this.rules.inline.reflink.exec(r)) || (t = this.rules.inline.nolink.exec(r))) {
                let s = t[0].charAt(0) === "!" ? 2 : 1;
                if (!this.options.pedantic && O2(r, t[1], s, this.rules)) return;
                let i = (t[2] || t[1]).replace(this.rules.other.multipleSpaceGlobal, " "),
                    n = e[Q9(i)];
                if (!n) {
                    let o = t[0].charAt(0);
                    return {
                        type: "text",
                        raw: o,
                        text: o
                    }
                }
                return _2(t, n, t[0], this.lexer, this.rules)
            }
        }
        emStrong(r, e, t = "") {
            let s = this.rules.inline.emStrongLDelim.exec(r);
            if (!s || !s[1] && !s[2] && !s[3] && !s[4]) return;
            let i = s[0][0],
                n = t === i,
                o = e.length - r.length,
                a = o;
            for (; !this.options.pedantic && a > 0 && e[a - 1] === i;) a--;
            let l = [...e.slice(Math.max(0, a - 2), a)].at(-1) ?? "",
                A = l === "*" || l === "_" || !!this.rules.inline.punctuation.exec(l);
            a < o && (t = l);
            let c = a < o ? A : !!this.rules.inline.punctuation.exec(t);
            if (s[4] && t.match(this.rules.other.unicodeAlphaNumeric)) return;
            let h = s[1] || s[3] || "";
            if (!h || !t || c) {
                let u = [...s[0]].length - 1,
                    d, g, p = u,
                    I = 0,
                    C = o - a + u,
                    E = !this.options.pedantic && !!l.trim() && (!!h || i === "*" && !A),
                    x = i === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
                for (x.lastIndex = 0, e = e.slice(-1 * r.length + u);
                    (s = x.exec(e)) !== null;) {
                    if (d = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !d) continue;
                    if (g = [...d].length, s[3] || s[4]) {
                        p += g;
                        continue
                    } else if (s[5] || s[6] || E) {
                        if (n && (s[5] || s[6])) break;
                        if (C % 3 && !((C + g) % 3)) {
                            I += g;
                            continue
                        }
                    }
                    if (p -= g, p > 0) continue;
                    g = Math.min(g, g + p + I);
                    let B = [...s[0]][0].length,
                        b = r.slice(0, u + s.index + B + g);
                    if (Math.min(u, g) % 2) {
                        let L = b.slice(1, -1);
                        return {
                            type: "em",
                            raw: b,
                            text: L,
                            tokens: this.lexer.inlineTokens(L)
                        }
                    }
                    let v = b.slice(2, -2);
                    return {
                        type: "strong",
                        raw: b,
                        text: v,
                        tokens: this.lexer.inlineTokens(v)
                    }
                }
            }
        }
        codespan(r) {
            let e = this.rules.inline.code.exec(r);
            if (e) {
                let t = e[2].replace(this.rules.other.newLineCharGlobal, " "),
                    s = this.rules.other.nonSpaceChar.test(t),
                    i = this.rules.other.startingSpaceChar.test(t) && this.rules.other.endingSpaceChar.test(t);
                return s && i && (t = t.substring(1, t.length - 1)), {
                    type: "codespan",
                    raw: e[0],
                    text: t
                }
            }
        }
        br(r) {
            let e = this.rules.inline.br.exec(r);
            if (e) return {
                type: "br",
                raw: e[0]
            }
        }
        del(r, e, t = "") {
            let s = this.rules.inline.delLDelim.exec(r);
            if (s && (!s[1] || !t || this.rules.inline.punctuation.exec(t))) {
                let i = [...s[0]].length - 1,
                    n, o, a = i,
                    l = this.rules.inline.delRDelim;
                for (l.lastIndex = 0, e = e.slice(-1 * r.length + i);
                    (s = l.exec(e)) !== null;) {
                    if (n = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !n || (o = [...n].length, o !== i)) continue;
                    if (s[3] || s[4]) {
                        a += o;
                        continue
                    }
                    if (a -= o, a > 0) continue;
                    o = Math.min(o, o + a);
                    let A = [...s[0]][0].length,
                        c = r.slice(0, i + s.index + A + o),
                        h = c.slice(i, -i);
                    return {
                        type: "del",
                        raw: c,
                        text: h,
                        tokens: this.lexer.inlineTokens(h)
                    }
                }
            }
        }
        autolink(r) {
            let e = this.rules.inline.autolink.exec(r);
            if (e) {
                let t, s;
                return e[2] === "@" ? (t = e[1], s = "mailto:" + t) : (t = e[1], s = t), {
                    type: "link",
                    raw: e[0],
                    text: t,
                    href: s,
                    autolink: !0,
                    tokens: [{
                        type: "text",
                        raw: t,
                        text: t
                    }]
                }
            }
        }
        url(r) {
            var t;
            let e;
            if (e = this.rules.inline.url.exec(r)) {
                let s, i;
                if (e[2] === "@") s = e[0], i = "mailto:" + s;
                else {
                    let n;
                    do n = e[0], e[0] = ((t = this.rules.inline._backpedal.exec(e[0])) == null ? void 0 : t[0]) ?? ""; while (n !== e[0]);
                    s = e[0], e[1] === "www." ? i = "http://" + e[0] : i = e[0]
                }
                return {
                    type: "link",
                    raw: e[0],
                    text: s,
                    href: i,
                    autolink: !0,
                    tokens: [{
                        type: "text",
                        raw: s,
                        text: s
                    }]
                }
            }
        }
        inlineText(r) {
            let e = this.rules.inline.text.exec(r);
            if (e) {
                let t = this.lexer.state.inRawBlock;
                return {
                    type: "text",
                    raw: e[0],
                    text: t ? e[0] : Ra(e[0]),
                    escaped: t
                }
            }
        }
    },
    r1, V5, Y5, Lt, we = (Lt = class {
        constructor(e) {
            Vi(this, r1);
            m(this, "tokens");
            m(this, "options");
            m(this, "state");
            m(this, "inlineQueue");
            m(this, "tokenizer");
            this.tokens = [], this.tokens.links = Object.create(null), this.options = e || Ft, this.options.tokenizer = this.options.tokenizer || new Zt, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
                inLink: !1,
                inRawBlock: !1,
                linkEmitted: !1,
                linkParenPossible: !0,
                top: !0
            };
            let t = {
                other: D0,
                block: l9.normal,
                inline: d1.normal
            };
            this.options.pedantic ? (t.block = l9.pedantic, t.inline = d1.pedantic) : this.options.gfm && (t.block = l9.gfm, this.options.breaks ? t.inline = d1.breaks : t.inline = d1.gfm), this.tokenizer.rules = t
        }
        static get rules() {
            return {
                block: l9,
                inline: d1
            }
        }
        static lex(e, t) {
            return new Lt(t).lex(e)
        }
        static lexInline(e, t) {
            return new Lt(t).inlineTokens(e)
        }
        lex(e) {
            e = e.replace(D0.carriageReturn, `
`), this.blockTokens(e, this.tokens);
            for (let t = 0; t < this.inlineQueue.length; t++) {
                let s = this.inlineQueue[t];
                this.state.inRawBlock = !1, this.inlineTokens(s.src, s.tokens)
            }
            return this.inlineQueue = [], this.tokens
        }
        blockTokens(e, t = [], s = !1) {
            var n, o, a;
            this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(D0.tabCharGlobal, "    ").replace(D0.spaceLine, ""));
            let i = 1 / 0;
            for (; e;) {
                if (e.length < i) i = e.length;
                else {
                    this.infiniteLoopError(e.charCodeAt(0));
                    break
                }
                let l;
                if ((o = (n = this.options.extensions) == null ? void 0 : n.block) != null && o.some(c => (l = c.call({
                        lexer: this
                    }, e, t)) ? (e = e.substring(l.raw.length), t.push(l), !0) : !1)) continue;
                if (l = this.tokenizer.space(e)) {
                    e = e.substring(l.raw.length);
                    let c = t.at(-1);
                    l.raw.length === 1 && c !== void 0 ? c.raw += `
` : t.push(l);
                    continue
                }
                if (l = this.tokenizer.code(e)) {
                    e = e.substring(l.raw.length);
                    let c = t.at(-1);
                    (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += (c.raw.endsWith(`
`) ? "" : `
`) + l.raw, c.text += `
` + l.text, this.inlineQueue.at(-1).src = c.text) : t.push(l);
                    continue
                }
                if (l = this.tokenizer.fences(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.heading(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.hr(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.blockquote(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.list(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.html(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.def(e)) {
                    e = e.substring(l.raw.length);
                    let c = t.at(-1);
                    (c == null ? void 0 : c.type) === "paragraph" || (c == null ? void 0 : c.type) === "text" ? (c.raw += (c.raw.endsWith(`
`) ? "" : `
`) + l.raw, c.text += `
` + l.raw, this.inlineQueue.at(-1).src = c.text) : (this.tokens.links[l.tag] || (this.tokens.links[l.tag] = {
                        href: l.href,
                        title: l.title
                    }), t.push(l));
                    continue
                }
                if (l = this.tokenizer.table(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                if (l = this.tokenizer.lheading(e)) {
                    e = e.substring(l.raw.length), t.push(l);
                    continue
                }
                let A = e;
                if ((a = this.options.extensions) != null && a.startBlock) {
                    let c = 1 / 0,
                        h = e.slice(1),
                        u;
                    this.options.extensions.startBlock.forEach(d => {
                        u = d.call({
                            lexer: this
                        }, h), typeof u == "number" && u >= 0 && (c = Math.min(c, u))
                    }), c < 1 / 0 && c >= 0 && (A = e.substring(0, c + 1))
                }
                if (this.state.top && (l = this.tokenizer.paragraph(A))) {
                    let c = t.at(-1);
                    s && (c == null ? void 0 : c.type) === "paragraph" ? (c.raw += (c.raw.endsWith(`
`) ? "" : `
`) + l.raw, c.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : t.push(l), s = A.length !== e.length, e = e.substring(l.raw.length);
                    continue
                }
                if (l = this.tokenizer.text(e)) {
                    e = e.substring(l.raw.length);
                    let c = t.at(-1);
                    (c == null ? void 0 : c.type) === "text" ? (c.raw += (c.raw.endsWith(`
`) ? "" : `
`) + l.raw, c.text += `
` + l.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = c.text) : t.push(l);
                    continue
                }
                if (e) {
                    this.infiniteLoopError(e.charCodeAt(0));
                    break
                }
            }
            return this.state.top = !0, t
        }
        inline(e, t = []) {
            return this.inlineQueue.push({
                src: e,
                tokens: t
            }), t
        }
        linkInText(e) {
            if (!e.includes("[")) return !1;
            let t = this.tokenizer.rules.inline.link;
            for (let s of e.matchAll(this.tokenizer.rules.inline.blockSkip))
                if (t.test(s[0]) && e.charAt(s.index - 1) !== "!") return !0;
            for (let s of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
                let i = s[0],
                    n = i.lastIndexOf("[");
                if (!(i.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, Q9(i.slice(n + 1, -1)))) && !(n > 1 && this.linkInText(i.slice(1, n - 1)))) return !0
            }
            return !1
        }
        inlineTokens(e, t = []) {
            this.tokenizer.lexer = this;
            let s = this.state.linkParenPossible;
            this.state.linkParenPossible = s && e.includes(")");
            try {
                return Z9(this, r1, V5).call(this, e, t)
            } finally {
                this.state.linkParenPossible = s
            }
        }
        infiniteLoopError(e) {
            let t = "Infinite loop on byte: " + e;
            if (this.options.silent) console.error(t);
            else throw new Error(t)
        }
    }, r1 = new WeakSet, V5 = function(e, t) {
        var a, l, A, c;
        let s = e.includes("*") || e.includes("_") || e.includes("~") || (a = this.options.hooks) != null && a.emStrongMask || this.tokenizer.emStrong !== Zt.prototype.emStrong || this.tokenizer.del !== Zt.prototype.del ? Z9(this, r1, Y5).call(this, e) : e,
            i = !1,
            n = "",
            o = 1 / 0;
        for (; e;) {
            if (e.length < o) o = e.length;
            else {
                this.infiniteLoopError(e.charCodeAt(0));
                break
            }
            i || (n = ""), i = !1;
            let h;
            if ((A = (l = this.options.extensions) == null ? void 0 : l.inline) != null && A.some(d => (h = d.call({
                    lexer: this
                }, e, t)) ? (e = e.substring(h.raw.length), t.push(h), !0) : !1)) continue;
            if (h = this.tokenizer.escape(e)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.tag(e)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.link(e)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.reflink(e, this.tokens.links)) {
                e = e.substring(h.raw.length);
                let d = t.at(-1);
                h.type === "text" && (d == null ? void 0 : d.type) === "text" ? (d.raw += h.raw, d.text += h.text) : t.push(h);
                continue
            }
            if (h = this.tokenizer.emStrong(e, s, n)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.codespan(e)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.br(e)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.del(e, s, n)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (h = this.tokenizer.autolink(e)) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            if (!this.state.inLink && (h = this.tokenizer.url(e))) {
                e = e.substring(h.raw.length), t.push(h);
                continue
            }
            let u = e;
            if ((c = this.options.extensions) != null && c.startInline) {
                let d = 1 / 0,
                    g = e.slice(1),
                    p;
                this.options.extensions.startInline.forEach(I => {
                    p = I.call({
                        lexer: this
                    }, g), typeof p == "number" && p >= 0 && (d = Math.min(d, p))
                }), d < 1 / 0 && d >= 0 && (u = e.substring(0, d + 1))
            }
            if (h = this.tokenizer.inlineText(u)) {
                e = e.substring(h.raw.length), h.raw.slice(-1) !== "_" && (n = h.raw.slice(-1)), i = !0;
                let d = t.at(-1);
                (d == null ? void 0 : d.type) === "text" ? (d.raw += h.raw, d.text += h.text) : t.push(h);
                continue
            }
            if (e) {
                this.infiniteLoopError(e.charCodeAt(0));
                break
            }
        }
        return t
    }, Y5 = function(e) {
        var s, i;
        let t = e;
        if (this.tokens.links && e.includes("[")) {
            let n = this.tokenizer.rules.inline.reflinkSearch,
                o = a => {
                    let l = a.lastIndexOf("[");
                    if (!Object.hasOwn(this.tokens.links, Q9(a.slice(l + 1, -1)))) return a;
                    if (l > 1 && a.charAt(0) !== "!") {
                        let A = a.slice(1, l - 1);
                        if (this.linkInText(A)) return "[" + A.replace(n, o) + "][" + "a".repeat(a.length - l - 2) + "]"
                    }
                    return "[" + "a".repeat(a.length - 2) + "]"
                };
            t = t.replace(n, o)
        }
        return t = t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (n, o, a) => a ? "+".repeat(n.length) : o ? o + n.slice(o.length, -o.length).replace(/`/g, "+") + o : n), t = t.replace(this.tokenizer.rules.inline.blockSkip, (n, o, a) => {
            let l = a ? a.length : 0;
            return n.slice(0, l) + "[" + "a".repeat(n.length - l - 2) + "]"
        }), t = ((i = (s = this.options.hooks) == null ? void 0 : s.emStrongMask) == null ? void 0 : i.call({
            lexer: this
        }, t)) ?? t, t
    }, Lt),
    S9 = class {
        constructor(r) {
            m(this, "options");
            m(this, "parser");
            this.options = r || Ft
        }
        space(r) {
            return ""
        }
        code({
            text: r,
            lang: e,
            escaped: t
        }) {
            var n;
            let s = (n = (e || "").match(D0.notSpaceStart)) == null ? void 0 : n[0],
                i = r ? r.replace(D0.endingNewline, "") + `
` : "";
            return s ? '<pre><code class="language-' + se(s) + '">' + (t ? i : se(i, !0)) + `</code></pre>
` : "<pre><code>" + (t ? i : se(i, !0)) + `</code></pre>
`
        }
        blockquote({
            tokens: r
        }) {
            return `<blockquote>
${this.parser.parse(r)}</blockquote>
`
        }
        html({
            text: r
        }) {
            return r
        }
        def(r) {
            return ""
        }
        heading({
            tokens: r,
            depth: e
        }) {
            return `<h${e}>${this.parser.parseInline(r)}</h${e}>
`
        }
        hr(r) {
            return `<hr>
`
        }
        list(r) {
            let e = r.ordered,
                t = r.start,
                s = "";
            for (let o = 0; o < r.items.length; o++) {
                let a = r.items[o];
                s += this.listitem(a)
            }
            let i = e ? "ol" : "ul",
                n = e && t !== 1 ? ' start="' + t + '"' : "";
            return "<" + i + n + `>
` + s + "</" + i + `>
`
        }
        listitem(r) {
            return `<li>${this.parser.parse(r.tokens)}</li>
`
        }
        checkbox({
            checked: r
        }) {
            return "<input " + (r ? 'checked="" ' : "") + 'disabled="" type="checkbox"> '
        }
        paragraph({
            tokens: r
        }) {
            return `<p>${this.parser.parseInline(r)}</p>
`
        }
        table(r) {
            let e = "",
                t = "";
            for (let i = 0; i < r.header.length; i++) t += this.tablecell(r.header[i]);
            e += this.tablerow({
                text: t
            });
            let s = "";
            for (let i = 0; i < r.rows.length; i++) {
                let n = r.rows[i];
                t = "";
                for (let o = 0; o < n.length; o++) t += this.tablecell(n[o]);
                s += this.tablerow({
                    text: t
                })
            }
            return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + e + `</thead>
` + s + `</table>
`
        }
        tablerow({
            text: r
        }) {
            return `<tr>
${r}</tr>
`
        }
        tablecell(r) {
            let e = this.parser.parseInline(r.tokens),
                t = r.header ? "th" : "td";
            return (r.align ? `<${t} align="${r.align}">` : `<${t}>`) + e + `</${t}>
`
        }
        strong({
            tokens: r
        }) {
            return `<strong>${this.parser.parseInline(r)}</strong>`
        }
        em({
            tokens: r
        }) {
            return `<em>${this.parser.parseInline(r)}</em>`
        }
        codespan({
            text: r
        }) {
            return `<code>${se(r,!0)}</code>`
        }
        br(r) {
            return "<br>"
        }
        del({
            tokens: r
        }) {
            return `<del>${this.parser.parseInline(r)}</del>`
        }
        link({
            href: r,
            title: e,
            text: t,
            tokens: s,
            autolink: i
        }) {
            let n = i ? se(t, !0) : this.parser.parseInline(s),
                o = P2(r);
            if (o === null) return n;
            r = se(o, i);
            let a = '<a href="' + r + '"';
            return e && (a += ' title="' + se(e) + '"'), a += ">" + n + "</a>", a
        }
        image({
            href: r,
            title: e,
            text: t,
            tokens: s
        }) {
            s && (t = this.parser.parseInline(s, this.parser.textRenderer));
            let i = P2(r);
            if (i === null) return se(t);
            r = i;
            let n = `<img src="${se(r)}" alt="${se(t)}"`;
            return e && (n += ` title="${se(e)}"`), n += ">", n
        }
        text(r) {
            return "tokens" in r && r.tokens ? this.parser.parseInline(r.tokens) : "escaped" in r && r.escaped ? r.text : se(r.text)
        }
    },
    xi = class {
        constructor() {
            m(this, "parser")
        }
        strong({
            text: r,
            tokens: e
        }) {
            return e ? this.parser.parseInline(e, this) : r
        }
        em({
            text: r,
            tokens: e
        }) {
            return e ? this.parser.parseInline(e, this) : r
        }
        codespan({
            text: r
        }) {
            return r
        }
        del({
            text: r,
            tokens: e
        }) {
            return e ? this.parser.parseInline(e, this) : r
        }
        html({
            text: r
        }) {
            return r
        }
        text({
            text: r
        }) {
            return r
        }
        link({
            text: r,
            tokens: e
        }) {
            return e ? this.parser.parseInline(e, this) : r
        }
        image({
            text: r,
            tokens: e
        }) {
            return e ? this.parser.parseInline(e, this) : r
        }
        br() {
            return ""
        }
        checkbox({
            raw: r
        }) {
            return r
        }
    },
    Be = class $s {
        constructor(e) {
            m(this, "options");
            m(this, "renderer");
            m(this, "textRenderer");
            this.options = e || Ft, this.options.renderer = this.options.renderer || new S9, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new xi, this.textRenderer.parser = this
        }
        static parse(e, t) {
            return new $s(t).parse(e)
        }
        static parseInline(e, t) {
            return new $s(t).parseInline(e)
        }
        parse(e) {
            var s, i;
            this.renderer.parser = this;
            let t = "";
            for (let n = 0; n < e.length; n++) {
                let o = e[n];
                if ((i = (s = this.options.extensions) == null ? void 0 : s.renderers) != null && i[o.type]) {
                    let l = o,
                        A = this.options.extensions.renderers[l.type].call({
                            parser: this
                        }, l);
                    if (A !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(l.type)) {
                        t += A || "";
                        continue
                    }
                }
                let a = o;
                switch (a.type) {
                    case "space": {
                        t += this.renderer.space(a);
                        break
                    }
                    case "hr": {
                        t += this.renderer.hr(a);
                        break
                    }
                    case "heading": {
                        t += this.renderer.heading(a);
                        break
                    }
                    case "code": {
                        t += this.renderer.code(a);
                        break
                    }
                    case "table": {
                        t += this.renderer.table(a);
                        break
                    }
                    case "blockquote": {
                        t += this.renderer.blockquote(a);
                        break
                    }
                    case "list": {
                        t += this.renderer.list(a);
                        break
                    }
                    case "checkbox": {
                        t += this.renderer.checkbox(a);
                        break
                    }
                    case "html": {
                        t += this.renderer.html(a);
                        break
                    }
                    case "def": {
                        t += this.renderer.def(a);
                        break
                    }
                    case "paragraph": {
                        t += this.renderer.paragraph(a);
                        break
                    }
                    case "text": {
                        t += this.renderer.text(a);
                        break
                    }
                    default: {
                        let l = 'Token with "' + a.type + '" type was not found.';
                        if (this.options.silent) return console.error(l), "";
                        throw new Error(l)
                    }
                }
            }
            return t
        }
        parseInline(e, t = this.renderer) {
            var i, n;
            this.renderer.parser = this;
            let s = "";
            for (let o = 0; o < e.length; o++) {
                let a = e[o];
                if ((n = (i = this.options.extensions) == null ? void 0 : i.renderers) != null && n[a.type]) {
                    let A = this.options.extensions.renderers[a.type].call({
                        parser: this
                    }, a);
                    if (A !== !1 || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(a.type)) {
                        s += A || "";
                        continue
                    }
                }
                let l = a;
                switch (l.type) {
                    case "escape": {
                        s += t.text(l);
                        break
                    }
                    case "html": {
                        s += t.html(l);
                        break
                    }
                    case "link": {
                        s += t.link(l);
                        break
                    }
                    case "image": {
                        s += t.image(l);
                        break
                    }
                    case "checkbox": {
                        s += t.checkbox(l);
                        break
                    }
                    case "strong": {
                        s += t.strong(l);
                        break
                    }
                    case "em": {
                        s += t.em(l);
                        break
                    }
                    case "codespan": {
                        s += t.codespan(l);
                        break
                    }
                    case "br": {
                        s += t.br(l);
                        break
                    }
                    case "del": {
                        s += t.del(l);
                        break
                    }
                    case "text": {
                        s += t.text(l);
                        break
                    }
                    default: {
                        let A = 'Token with "' + l.type + '" type was not found.';
                        if (this.options.silent) return console.error(A), "";
                        throw new Error(A)
                    }
                }
            }
            return s
        }
    },
    h9, B1 = (h9 = class {
        constructor(r) {
            m(this, "options");
            m(this, "block");
            this.options = r || Ft
        }
        preprocess(r) {
            return r
        }
        postprocess(r) {
            return r
        }
        processAllTokens(r) {
            return r
        }
        emStrongMask(r) {
            return r
        }
        provideLexer(r = this.block) {
            return r ? we.lex : we.lexInline
        }
        provideParser(r = this.block) {
            return r ? Be.parse : Be.parseInline
        }
    }, m(h9, "passThroughHooks", new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"])), m(h9, "passThroughHooksRespectAsync", new Set(["preprocess", "postprocess", "processAllTokens"])), h9);

