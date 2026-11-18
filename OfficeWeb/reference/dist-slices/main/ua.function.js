function ua(i) {
    let e = !1;
    const t = [];
    for (let n = 0; n < i.length; n++) {
        let s = i.charAt(n);
        switch (s) {
            case "_":
                e = !0;
                break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                t.push(s), e = !1;
                break;
            default:
                e && (e = !1, s = s.toUpperCase()), t.push(s);
                break
        }
    }
    return t.join("")
}
