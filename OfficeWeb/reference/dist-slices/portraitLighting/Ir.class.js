class Ir extends pi {
    constructor(e) {
        super(e), this.mimeType = "", this.responseType = "", this._abortController = new AbortController
    }
    load(e, t, n, i) {
        e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
        const r = Dn.get(`file:${e}`);
        if (r !== void 0) {
            this.manager.itemStart(e), setTimeout(() => {
                t && t(r), this.manager.itemEnd(e)
            }, 0);
            return
        }
        if (In[e] !== void 0) {
            In[e].push({
                onLoad: t,
                onProgress: n,
                onError: i
            });
            return
        }
        In[e] = [], In[e].push({
            onLoad: t,
            onProgress: n,
            onError: i
        });
        const a = new Request(e, {
                headers: new Headers(this.requestHeader),
                credentials: this.withCredentials ? "include" : "same-origin",
                priority: this.priority,
                cache: this.cache,
                signal: typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal
            }),
            o = this.mimeType,
            l = this.responseType;
        fetch(a).then(c => {
            if (c.status === 200 || c.status === 0) {
                if (c.status === 0 && Ce("FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || c.body === void 0 || c.body.getReader === void 0) return c;
                const h = In[e],
                    u = c.body.getReader(),
                    d = c.headers.get("X-File-Size") || c.headers.get("Content-Length"),
                    f = d ? parseInt(d) : 0,
                    p = f !== 0;
                let x = 0;
                const m = new ReadableStream({
                    start(g) {
                        M();

                        function M() {
                            u.read().then(({
                                done: E,
                                value: v
                            }) => {
                                if (E) g.close();
                                else {
                                    x += v.byteLength;
                                    const A = new ProgressEvent("progress", {
                                        lengthComputable: p,
                                        loaded: x,
                                        total: f
                                    });
                                    for (let b = 0, _ = h.length; b < _; b++) {
                                        const T = h[b];
                                        T.onProgress && T.onProgress(A)
                                    }
                                    g.enqueue(v), M()
                                }
                            }, E => {
                                g.error(E)
                            })
                        }
                    }
                });
                return new Response(m)
            } else throw new lp(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`, c)
        }).then(c => {
            switch (l) {
                case "arraybuffer":
                    return c.arrayBuffer();
                case "blob":
                    return c.blob();
                case "document":
                    return c.text().then(h => new DOMParser().parseFromString(h, o));
                case "json":
                    return c.json();
                default:
                    if (o === "") return c.text();
                    {
                        const u = /charset="?([^;"\s]*)"?/i.exec(o),
                            d = u && u[1] ? u[1].toLowerCase() : void 0,
                            f = new TextDecoder(d);
                        return c.arrayBuffer().then(p => f.decode(p))
                    }
            }
        }).then(c => {
            Dn.add(`file:${e}`, c);
            const h = In[e];
            delete In[e];
            for (let u = 0, d = h.length; u < d; u++) {
                const f = h[u];
                f.onLoad && f.onLoad(c)
            }
        }).catch(c => {
            const h = In[e];
            if (h === void 0) throw this.manager.itemError(e), c;
            delete In[e];
            for (let u = 0, d = h.length; u < d; u++) {
                const f = h[u];
                f.onError && f.onError(c)
            }
            this.manager.itemError(e)
        }).finally(() => {
            this.manager.itemEnd(e)
        }), this.manager.itemStart(e)
    }
    setResponseType(e) {
        return this.responseType = e, this
    }
    setMimeType(e) {
        return this.mimeType = e, this
    }
    abort() {
        return this._abortController.abort(), this._abortController = new AbortController, this
    }
}
