const Wf = "modulepreload",
    Qf = function(p) {
        return "/" + p
    },
    Pa = {},
    dd = function(S, f, R) {
        let E = Promise.resolve();
        if (f && f.length > 0) {
            document.getElementsByTagName("link");
            const F = document.querySelector("meta[property=csp-nonce]"),
                O = (F == null ? void 0 : F.nonce) || (F == null ? void 0 : F.getAttribute("nonce"));
            E = Promise.allSettled(f.map(M => {
                if (M = Qf(M), M in Pa) return;
                Pa[M] = !0;
                const A = M.endsWith(".css"),
                    ae = A ? '[rel="stylesheet"]' : "";
                if (document.querySelector(`link[href="${M}"]${ae}`)) return;
                const V = document.createElement("link");
                if (V.rel = A ? "stylesheet" : Wf, A || (V.as = "script"), V.crossOrigin = "", V.href = M, O && V.setAttribute("nonce", O), document.head.appendChild(V), A) return new Promise((q, Le) => {
                    V.addEventListener("load", q), V.addEventListener("error", () => Le(new Error(`Unable to preload CSS for ${M}`)))
                })
            }))
        }

        function z(F) {
            const O = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (O.payload = F, window.dispatchEvent(O), !O.defaultPrevented) throw F
        }
        return E.then(F => {
            for (const O of F || []) O.status === "rejected" && z(O.reason);
            return S().catch(z)
        })
    };

