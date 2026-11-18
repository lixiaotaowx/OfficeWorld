function ru(i, e, t, n) {
    oa(e, i);
    const s = e.runtime.bin.makeReadOptions(n),
        r = e.runtime.bin.makeWriteOptions(n);
    if (ra(i, e)) {
        const d = i.getType().runtime.bin.listUnknownFields(i).filter(l => l.no != e.field.no);
        i.getType().runtime.bin.discardUnknownFields(i);
        for (const l of d) i.getType().runtime.bin.onUnknownField(i, l.no, l.wireType, l.data)
    }
    const a = r.writerFactory();
    let o = e.field;
    !o.opt && !o.repeated && (o.kind == "enum" || o.kind == "scalar") && (o = Object.assign(Object.assign({}, e.field), {
        opt: !0
    })), e.runtime.bin.writeField(o, t, a, r);
    const c = s.readerFactory(a.finish());
    for (; c.pos < c.len;) {
        const [d, l] = c.tag(), u = c.skip(l, d);
        i.getType().runtime.bin.onUnknownField(i, d, l, u)
    }
}

