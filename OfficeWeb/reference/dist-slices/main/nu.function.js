function nu(i, e) {
    if (!e.repeated && (e.kind == "enum" || e.kind == "scalar")) {
        for (let t = i.length - 1; t >= 0; --t)
            if (i[t].no == e.no) return [i[t]];
        return []
    }
    return i.filter(t => t.no === e.no)
}
let rt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
    nn = [];
for (let i = 0; i < rt.length; i++) nn[rt[i].charCodeAt(0)] = i;
nn[45] = rt.indexOf("+");
nn[95] = rt.indexOf("/");
