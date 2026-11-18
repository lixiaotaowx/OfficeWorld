function Rr(i, e, t) {
    if (i.kind == "map") {
        he(typeof e == "object" && e != null);
        const n = {},
            s = Object.entries(e);
        switch (i.V.kind) {
            case "scalar":
                for (const [a, o] of s) n[a.toString()] = xi(i.V.T, o);
                break;
            case "message":
                for (const [a, o] of s) n[a.toString()] = o.toJson(t);
                break;
            case "enum":
                const r = i.V.T;
                for (const [a, o] of s) n[a.toString()] = vn(r, o, t.enumAsInteger);
                break
        }
        return t.emitDefaultValues || s.length > 0 ? n : void 0
    }
    if (i.repeated) {
        he(Array.isArray(e));
        const n = [];
        switch (i.kind) {
            case "scalar":
                for (let s = 0; s < e.length; s++) n.push(xi(i.T, e[s]));
                break;
            case "enum":
                for (let s = 0; s < e.length; s++) n.push(vn(i.T, e[s], t.enumAsInteger));
                break;
            case "message":
                for (let s = 0; s < e.length; s++) n.push(e[s].toJson(t));
                break
        }
        return t.emitDefaultValues || n.length > 0 ? n : void 0
    }
    switch (i.kind) {
        case "scalar":
            return xi(i.T, e);
        case "enum":
            return vn(i.T, e, t.enumAsInteger);
        case "message":
            return ca(i.T, e).toJson(t)
    }
}

