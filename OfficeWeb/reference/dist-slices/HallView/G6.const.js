const G6 = 5e3,
    z6 = {
        morning: y.jsxs(y.Fragment, {
            children: [y.jsx("circle", {
                cx: "12",
                cy: "12",
                r: "4"
            }), y.jsx("path", {
                d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            })]
        }),
        afternoon: y.jsxs(y.Fragment, {
            children: [y.jsx("path", {
                d: "M4 18h16M7 18a5 5 0 0 1 10 0"
            }), y.jsx("path", {
                d: "M12 7v2M5.6 10.6l1.4 1.4M18.4 10.6 17 12"
            })]
        }),
        night: y.jsx("path", {
            d: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
        }),
        auto: y.jsxs(y.Fragment, {
            children: [y.jsx("circle", {
                cx: "12",
                cy: "12",
                r: "8"
            }), y.jsx("path", {
                d: "M12 7v5l3 2"
            })]
        })
    },
    l4 = {
        morning: "上午",
        afternoon: "下午",
        night: "晚上"
    };

