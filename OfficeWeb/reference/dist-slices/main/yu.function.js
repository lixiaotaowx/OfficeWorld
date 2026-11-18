function yu(i, e, t) {
    return {
        syntax: i,
        json: cu(),
        bin: mu(),
        util: Object.assign(Object.assign({}, bu()), {
            newFieldList: e,
            initFields: t
        }),
        makeMessageType(n, s, r) {
            return Jl(this, n, s, r)
        },
        makeEnum: Gl,
        makeEnumType: Xo,
        getEnumType: Kl,
        makeExtension(n, s, r) {
            return tu(this, n, s, r)
        }
    }
}
