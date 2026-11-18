const de = {
        type: "error",
        data: "parser error"
    },
    Fe = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]",
    De = typeof ArrayBuffer == "function",
    Ve = n => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(n) : n && n.buffer instanceof ArrayBuffer,
    we = ({
        type: n,
        data: e
    }, t, s) => Fe && e instanceof Blob ? t ? s(e) : Ne(e, s) : De && (e instanceof ArrayBuffer || Ve(e)) ? t ? s(e) : Ne(new Blob([e]), s) : s(H[n] + (e || "")),
    Ne = (n, e) => {
        const t = new FileReader;
        return t.onload = function() {
            const s = t.result.split(",")[1];
            e("b" + (s || ""))
        }, t.readAsDataURL(n)
    };

