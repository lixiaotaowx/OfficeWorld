function Mc(s, e, t, n) {
    const i = Ip(n);
    switch (t) {
        case uh:
            return s * e;
        case Po:
            return s * e / i.components * i.byteLength;
        case Io:
            return s * e / i.components * i.byteLength;
        case ui:
            return s * e * 2 / i.components * i.byteLength;
        case No:
            return s * e * 2 / i.components * i.byteLength;
        case dh:
            return s * e * 3 / i.components * i.byteLength;
        case ln:
            return s * e * 4 / i.components * i.byteLength;
        case Do:
            return s * e * 4 / i.components * i.byteLength;
        case _r:
        case xr:
            return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 8;
        case vr:
        case Mr:
            return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
        case Ba:
        case ka:
            return Math.max(s, 16) * Math.max(e, 8) / 4;
        case Oa:
        case za:
            return Math.max(s, 8) * Math.max(e, 8) / 2;
        case Ha:
        case Ga:
        case Wa:
        case Xa:
            return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 8;
        case Va:
        case Tr:
        case qa:
            return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
        case Ya:
            return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
        case Ka:
            return Math.floor((s + 4) / 5) * Math.floor((e + 3) / 4) * 16;
        case Ja:
            return Math.floor((s + 4) / 5) * Math.floor((e + 4) / 5) * 16;
        case Za:
            return Math.floor((s + 5) / 6) * Math.floor((e + 4) / 5) * 16;
        case $a:
            return Math.floor((s + 5) / 6) * Math.floor((e + 5) / 6) * 16;
        case Qa:
            return Math.floor((s + 7) / 8) * Math.floor((e + 4) / 5) * 16;
        case ja:
            return Math.floor((s + 7) / 8) * Math.floor((e + 5) / 6) * 16;
        case eo:
            return Math.floor((s + 7) / 8) * Math.floor((e + 7) / 8) * 16;
        case to:
            return Math.floor((s + 9) / 10) * Math.floor((e + 4) / 5) * 16;
        case no:
            return Math.floor((s + 9) / 10) * Math.floor((e + 5) / 6) * 16;
        case io:
            return Math.floor((s + 9) / 10) * Math.floor((e + 7) / 8) * 16;
        case so:
            return Math.floor((s + 9) / 10) * Math.floor((e + 9) / 10) * 16;
        case ro:
            return Math.floor((s + 11) / 12) * Math.floor((e + 9) / 10) * 16;
        case ao:
            return Math.floor((s + 11) / 12) * Math.floor((e + 11) / 12) * 16;
        case oo:
        case lo:
        case co:
            return Math.ceil(s / 4) * Math.ceil(e / 4) * 16;
        case ho:
        case uo:
            return Math.ceil(s / 4) * Math.ceil(e / 4) * 8;
        case Er:
        case fo:
            return Math.ceil(s / 4) * Math.ceil(e / 4) * 16
    }
    throw new Error(`Unable to determine texture byte length for ${t} format.`)
}

