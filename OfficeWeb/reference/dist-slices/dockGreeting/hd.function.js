function hd(p) {
    const S = (p == null ? void 0 : p.light) === !0,
        f = S ? "0, 0, 0" : "255, 255, 255",
        R = "transparent",
        E = (p == null ? void 0 : p.transparent) === !1 ? .04 : 0,
        z = (S ? .05 : .04) + E,
        F = /^#[0-9a-f]{6}$/i.test((p == null ? void 0 : p.accent) || "") ? String(p.accent).toLowerCase() : "",
        O = p != null && p.tinted && F ? rd(F, S ? .4 : .5) : `rgba(${f}, ${(S?.12:.14)+E})`;
    return {
        background: `rgba(${f}, ${z})`,
        backgroundHover: `rgba(${f}, ${z+.02})`,
        chip: R,
        border: O,
        shadow: S ? "0 6px 18px rgba(0, 0, 0, .16)" : "0 6px 18px rgba(0, 0, 0, .32)"
    }
}

