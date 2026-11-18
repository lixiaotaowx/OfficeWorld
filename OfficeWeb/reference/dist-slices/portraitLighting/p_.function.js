function P_(s) {
    const e = {
            geometries: 0,
            textures: 0
        },
        t = {
            frame: 0,
            calls: 0,
            triangles: 0,
            points: 0,
            lines: 0
        };

    function n(r, a, o) {
        switch (t.calls++, a) {
            case s.TRIANGLES:
                t.triangles += o * (r / 3);
                break;
            case s.LINES:
                t.lines += o * (r / 2);
                break;
            case s.LINE_STRIP:
                t.lines += o * (r - 1);
                break;
            case s.LINE_LOOP:
                t.lines += o * r;
                break;
            case s.POINTS:
                t.points += o * r;
                break;
            default:
                ze("WebGLInfo: Unknown draw mode:", a);
                break
        }
    }

    function i() {
        t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0
    }
    return {
        memory: e,
        render: t,
        programs: null,
        autoReset: !0,
        reset: i,
        update: n
    }
}

