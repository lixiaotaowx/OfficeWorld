const Nn = u.lazy(() => Nt(() => import("./DockGreetingAvatar-C8R77b_0.js"), __vite__mapDeps([0, 1, 2, 3, 4]))),
    ae = {
        mic: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"
            })
        }),
        micOff: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M15 10.6V5a3 3 0 0 0-5.9-.8L15 10.6ZM19 11h-2c0 .8-.2 1.5-.5 2.2l1.5 1.5A7 7 0 0 0 19 11ZM4.3 3 3 4.3l6 6V11a3 3 0 0 0 4.4 2.6l1.5 1.5A5 5 0 0 1 7 11H5a7 7 0 0 0 6 6.9V21h2v-3.1c1-.1 1.9-.5 2.7-1l3 3L20 18.7 4.3 3Z"
            })
        }),
        screen: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M3 4h18v12H3zM8 20h8v-2H8z"
            })
        }),
        clip: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3l8-8"
            })
        }),
        close: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M6 6l12 12M18 6 6 18"
            })
        }),
        grow: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"
            })
        }),
        shrink: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"
            })
        }),
        leave: e.jsx("svg", {
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: e.jsx("path", {
                d: "M12 9c-1.6 0-3.1.3-4.6.8v3.1c0 .4-.2.7-.6.9-1 .5-1.9 1.1-2.6 1.8-.2.2-.4.3-.7.3s-.5-.1-.7-.3L.3 13.1A1 1 0 0 1 0 12.4c0-.3.1-.5.3-.7C3.3 8.8 7.5 7 12 7s8.7 1.8 11.7 4.7c.2.2.3.4.3.7s-.1.5-.3.7l-2.5 2.5c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.8-.7-1.7-1.3-2.6-1.8-.3-.2-.6-.5-.6-.9V9.8C15.1 9.3 13.6 9 12 9Z"
            })
        })
    },
    G = (t, s = "", n) => {
        var c, r, i;
        return void((i = (r = (c = window.officeDock) == null ? void 0 : c.action) == null ? void 0 : r.call(c, t, s, void 0, n)) == null ? void 0 : i.catch(() => {}))
    },
    Dn = t => t > 1e6 ? `${(t/1e6).toFixed(1)} MB` : `${Math.max(1,Math.round(t/1e3))} KB`;

