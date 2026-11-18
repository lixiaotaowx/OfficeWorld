class i8 {
    init() {
        return is || (is = typeof fetch < "u" ? fetch("data:application/wasm;base64," + l2).then(e => e.arrayBuffer()).then(e => WebAssembly.instantiate(e, ns)).then(this._init) : WebAssembly.instantiate(Buffer.from(l2, "base64"), ns).then(this._init), is)
    }
    _init(e) {
        _e = e.instance, ns.env.emscripten_notify_memory_growth(0)
    }
    decode(e, t = 0) {
        if (!_e) throw new Error("ZSTDDecoder: Await .init() before decoding.");
        const s = e.byteLength,
            i = _e.exports.malloc(s);
        qs.set(e, i), t = t || Number(_e.exports.ZSTD_findDecompressedSize(i, s));
        const n = _e.exports.malloc(t),
            o = _e.exports.ZSTD_decompress(n, t, i, s),
            a = qs.slice(n, n + o);
        return _e.exports.free(i), _e.exports.free(n), a
    }
}
