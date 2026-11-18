function yt(r, e) {
    if (Array.isArray(e))
        for (let t = 0; t < e.length; t++) r.push(e[t]);
    else r.push(e)
}
var Na = class {
        constructor(...r) {
            m(this, "defaults", mi());
            m(this, "options", this.setOptions);
            m(this, "parse", this.parseMarkdown(!0));
            m(this, "parseInline", this.parseMarkdown(!1));
            m(this, "Parser", Be);
            m(this, "Renderer", S9);
            m(this, "TextRenderer", xi);
            m(this, "Lexer", we);
            m(this, "Tokenizer", Zt);
            m(this, "Hooks", B1);
            this.use(...r)
        }
        walkTokens(r, e) {
            var s, i;
            let t = [];
            for (let n of r) switch (yt(t, e.call(this, n)), n.type) {
                case "table": {
                    let o = n;
                    for (let a of o.header) yt(t, this.walkTokens(a.tokens, e));
                    for (let a of o.rows)
                        for (let l of a) yt(t, this.walkTokens(l.tokens, e));
                    break
                }
                case "list": {
                    let o = n;
                    yt(t, this.walkTokens(o.items, e));
                    break
                }
                default: {
                    let o = n;
                    (i = (s = this.defaults.extensions) == null ? void 0 : s.childTokens) != null && i[o.type] ? this.defaults.extensions.childTokens[o.type].forEach(a => {
                        let l = o[a].flat(1 / 0);
                        yt(t, this.walkTokens(l, e))
                    }) : o.tokens && yt(t, this.walkTokens(o.tokens, e))
                }
            }
            return t
        }
        use(...r) {
            let e = this.defaults.extensions || {
                renderers: {},
                childTokens: {}
            };
            return r.forEach(t => {
                let s = {
                    ...t
                };
                if (s.async = this.defaults.async || s.async || !1, t.extensions && (t.extensions.forEach(i => {
                        if (!i.name) throw new Error("extension name required");
                        if ("renderer" in i) {
                            let n = e.renderers[i.name];
                            n ? e.renderers[i.name] = function(...o) {
                                let a = i.renderer.apply(this, o);
                                return a === !1 && (a = n.apply(this, o)), a
                            } : e.renderers[i.name] = i.renderer
                        }
                        if ("tokenizer" in i) {
                            if (!i.level || i.level !== "block" && i.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
                            let n = e[i.level];
                            n ? n.unshift(i.tokenizer) : e[i.level] = [i.tokenizer], i.start && (i.level === "block" ? e.startBlock ? e.startBlock.push(i.start) : e.startBlock = [i.start] : i.level === "inline" && (e.startInline ? e.startInline.push(i.start) : e.startInline = [i.start]))
                        }
                        "childTokens" in i && i.childTokens && (e.childTokens[i.name] = i.childTokens)
                    }), s.extensions = e), t.renderer) {
                    let i = this.defaults.renderer || new S9(this.defaults);
                    for (let n in t.renderer) {
                        if (!(n in i)) throw new Error(`renderer '${n}' does not exist`);
                        if (["options", "parser"].includes(n)) continue;
                        let o = n,
                            a = t.renderer[o],
                            l = i[o];
                        i[o] = (...A) => {
                            let c = a.apply(i, A);
                            return c === !1 && (c = l.apply(i, A)), c || ""
                        }
                    }
                    s.renderer = i
                }
                if (t.tokenizer) {
                    let i = this.defaults.tokenizer || new Zt(this.defaults);
                    for (let n in t.tokenizer) {
                        if (!(n in i)) throw new Error(`tokenizer '${n}' does not exist`);
                        if (["options", "rules", "lexer"].includes(n)) continue;
                        let o = n,
                            a = t.tokenizer[o],
                            l = i[o];
                        i[o] = (...A) => {
                            let c = a.apply(i, A);
                            return c === !1 && (c = l.apply(i, A)), c
                        }
                    }
                    s.tokenizer = i
                }
                if (t.hooks) {
                    let i = this.defaults.hooks || new B1;
                    for (let n in t.hooks) {
                        if (!(n in i)) throw new Error(`hook '${n}' does not exist`);
                        if (["options", "block"].includes(n)) continue;
                        let o = n,
                            a = t.hooks[o],
                            l = i[o];
                        B1.passThroughHooks.has(n) ? i[o] = A => {
                            if (i.options.async && B1.passThroughHooksRespectAsync.has(n)) return (async () => {
                                let h = await a.call(i, A);
                                return l.call(i, h)
                            })();
                            let c = a.call(i, A);
                            return l.call(i, c)
                        } : i[o] = (...A) => {
                            if (i.options.async) return (async () => {
                                let h = await a.apply(i, A);
                                return h === !1 && (h = await l.apply(i, A)), h
                            })();
                            let c = a.apply(i, A);
                            return c === !1 && (c = l.apply(i, A)), c
                        }
                    }
                    s.hooks = i
                }
                if (t.walkTokens) {
                    let i = this.defaults.walkTokens,
                        n = t.walkTokens;
                    s.walkTokens = function(o) {
                        let a = [];
                        return a.push(n.call(this, o)), i && yt(a, i.call(this, o)), a
                    }
                }
                this.defaults = {
                    ...this.defaults,
                    ...s
                }
            }), this
        }
        setOptions(r) {
            return this.defaults = {
                ...this.defaults,
                ...r
            }, this
        }
        lexer(r, e) {
            return we.lex(r, e ?? this.defaults)
        }
        parser(r, e) {
            return Be.parse(r, e ?? this.defaults)
        }
        parseMarkdown(r) {
            return (e, t) => {
                let s = {
                        ...t
                    },
                    i = {
                        ...this.defaults,
                        ...s
                    },
                    n = this.onError(!!i.silent, !!i.async);
                if (this.defaults.async === !0 && s.async === !1) return n(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
                if (typeof e > "u" || e === null) return n(new Error("marked(): input parameter is undefined or null"));
                if (typeof e != "string") return n(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(e) + ", string expected"));
                if (i.hooks && (i.hooks.options = i, i.hooks.block = r), i.async) return (async () => {
                    let o = i.hooks ? await i.hooks.preprocess(e) : e,
                        a = await (i.hooks ? await i.hooks.provideLexer(r) : r ? we.lex : we.lexInline)(o, i),
                        l = i.hooks ? await i.hooks.processAllTokens(a) : a;
                    i.walkTokens && await Promise.all(this.walkTokens(l, i.walkTokens));
                    let A = await (i.hooks ? await i.hooks.provideParser(r) : r ? Be.parse : Be.parseInline)(l, i);
                    return i.hooks ? await i.hooks.postprocess(A) : A
                })().catch(n);
                try {
                    i.hooks && (e = i.hooks.preprocess(e));
                    let o = (i.hooks ? i.hooks.provideLexer(r) : r ? we.lex : we.lexInline)(e, i);
                    i.hooks && (o = i.hooks.processAllTokens(o)), i.walkTokens && this.walkTokens(o, i.walkTokens);
                    let a = (i.hooks ? i.hooks.provideParser(r) : r ? Be.parse : Be.parseInline)(o, i);
                    return i.hooks && (a = i.hooks.postprocess(a)), a
                } catch (o) {
                    return n(o)
                }
            }
        }
        onError(r, e) {
            return t => {
                if (t.message += `
Please report this to https://github.com/markedjs/marked.`, r) {
                    let s = "<p>An error occurred:</p><pre>" + se(t.message + "", !0) + "</pre>";
                    return e ? Promise.resolve(s) : s
                }
                if (e) return Promise.reject(t);
                throw t
            }
        }
    },
    Rt = new Na;

