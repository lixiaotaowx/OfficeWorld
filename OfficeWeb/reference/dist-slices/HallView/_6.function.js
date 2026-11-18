function _6({
    office: r,
    accountId: e,
    appearance: t,
    onAppearance: s,
    onLogout: i,
    update: n
}) {
    const o = _.useRef(null),
        [a, l] = _.useState(null),
        [A, c] = _.useState(!0),
        h = _.useRef(null),
        u = _.useRef(null),
        d = _.useRef(null),
        g = _.useRef(null),
        [p, I] = _.useState({
            pick: "auto",
            name: "morning"
        }),
        [C, E] = _.useState(!1),
        [x, B] = _.useState(!1),
        [b, v] = _.useState(null),
        [L, D] = _.useState(null),
        [P, U] = _.useState(null),
        [R, Q] = _.useState(!1),
        [H, N] = _.useState(C5),
        [G, q] = _.useState(null),
        [j, h0] = _.useState(null),
        [i0, u0] = _.useState(null),
        [W, t0] = _.useState(!1),
        o0 = _.useRef({
            office: r,
            accountId: e,
            moving: W
        });
    o0.current = {
        office: r,
        accountId: e,
        moving: W
    };
    const d0 = r.people.find(F => F.id === r.myId),
        Re = r.seats.findIndex(F => (F == null ? void 0 : F.id) === e),
        Z = (d0 == null ? void 0 : d0.seat) ?? (Re >= 0 ? Re : null),
        le = (d0 == null ? void 0 : d0.role) === "visitor";
    _.useEffect(() => {
        var V, p0;
        if (!((V = window.officeDesktop) != null && V.mainWindowVisible) || !((p0 = window.officeDesktop) != null && p0.onMainWindowVisibility)) return;
        let F, z = !0;
        const a0 = y5(document, window, A0 => {
            if (z = A0, clearTimeout(F), A0) {
                c(!0);
                return
            }
            F = setTimeout(() => {
                var C0;
                if (z || !o0.current.office.connected) return;
                const Q0 = (C0 = h.current) == null ? void 0 : C0.snapshotForSleep();
                Q0 && (u.current = Q0, c(!1))
            }, G6)
        });
        return () => {
            clearTimeout(F), a0()
        }
    }, []);

    function H0(F) {
        var V;
        if (!F || !F.world || !F.actor || h.current !== F.scene) return;
        const z = (V = F.snapshot.actor) == null ? void 0 : V.sittingSpot,
            a0 = o0.current.office.people.find(p0 => p0.id === o0.current.office.myId);
        z && (a0 == null ? void 0 : a0.sittingSpot) === z && F.scene.sitMeAt(z)
    }
    _.useEffect(() => {
        if (!A) {
            l(null);
            return
        }
        const F = new x6(o.current);
        h.current = F;
        const z = u.current;
        u.current = null, z && F.restoreSleepSnapshot(z);
        const a0 = z ? {
            scene: F,
            snapshot: z,
            world: !1,
            actor: !z.actor
        } : null;
        g.current = a0;
        const V = n0 => {
                d.current = n0, F.shellRemoval.sync(n0.removedShell || []), F.setParts(n0.parts, n0.models, n0.revision)
            },
            p0 = new yo(V);
        let A0 = !1,
            Q0 = !1;
        const C0 = () => {
            A0 || Q0 || (Q0 = !0, F.attachBuild(p0, () => o0.current.accountId))
        };
        return d.current && (V(d.current), C0(), a0 && (a0.world = !0, H0(a0))), p0.load().catch(() => {}).finally(() => {
            A0 || (C0(), p0.follow(), a0 && (a0.world = !0, H0(a0)))
        }), F.onNotice = n0 => q({
            text: n0,
            key: Date.now()
        }), F.onHover = h0, F.onCatClick = () => B(!0), F.onBilliardsClick = v, F.onBuildChange = E, F.onMotion = n0 => o0.current.office.reportMotion(n0), F.onSit = n0 => o0.current.office.sitSpot(n0), F.ownerOf = n0 => {
            const {
                office: R0,
                accountId: Ee
            } = o0.current, Ae = R0.seats[n0];
            if (!Ae) return null;
            const $0 = R0.people.find(y0 => y0.seat === n0);
            return {
                name: Ae.name,
                mine: Ae.id === Ee,
                preview: $0 && R0.previews[$0.id] || "",
                atDesk: !!($0 && $0.atDesk !== !1)
            }
        }, F.onOfferClaim = n0 => {
            const {
                office: R0,
                accountId: Ee,
                moving: Ae
            } = o0.current;
            (!R0.seats.some(y0 => (y0 == null ? void 0 : y0.id) === Ee) || Ae) && u0(n0)
        }, l(F), window.__hall = F, () => {
            var R0;
            A0 = !0, p0.stop(), b6(window, F), h.current === F && (h.current = null), ((R0 = g.current) == null ? void 0 : R0.scene) === F && (g.current = null), F.dispose()
        }
    }, [A]), _.useEffect(() => {
        a && r.cat && a.cat.set(r.cat)
    }, [a, r.cat]), _.useEffect(() => {
        if (!a) return;
        const F = () => a.setBilliardsStates(r.billiards.states());
        return F(), r.billiards.subscribe(F)
    }, [a, r.billiards]), _.useEffect(() => {
        if (!a || !r.catSpeech) return;
        let F = 0;
        const z = performance.now() + 4500,
            a0 = () => {
                if (performance.now() > z) {
                    D(null);
                    return
                }
                const V = a.cat.root.position.clone();
                V.y += .9, V.project(a.camera), D(Math.abs(V.x) > 1 || Math.abs(V.y) > 1 ? null : {
                    text: r.catSpeech.text,
                    x: (V.x + 1) * a.host.clientWidth / 2,
                    y: (1 - V.y) * a.host.clientHeight / 2
                }), F = requestAnimationFrame(a0)
            };
        return a0(), () => cancelAnimationFrame(F)
    }, [a, r.catSpeech]);
    const Z0 = _.useRef(!1);
    _.useEffect(() => {
        var a0;
        if (!a || !r.myId) return;
        const F = ((a0 = g.current) == null ? void 0 : a0.scene) === a ? g.current : null,
            z = F && !F.actor ? F.snapshot.actor : null;
        a.setMe(r.myId, t, z || void 0).then(V => {
            if (F && z && h.current === a && !F.actor && (V.holder.rotation.y = z.rotation, F.actor = !0, H0(F)), Z0.current || !a.me || !o0.current.office.people.some(C0 => C0.id === o0.current.office.myId)) return;
            Z0.current = !0;
            const p0 = o0.current.office,
                A0 = p0.people.find(C0 => C0.id === p0.myId),
                Q0 = A0.seat ?? p0.seats.findIndex(C0 => (C0 == null ? void 0 : C0.id) === o0.current.accountId);
            if (A0.sittingSpot) a.sitMeAt(A0.sittingSpot);
            else if (Q0 >= 0) {
                let C0 = 0;
                const n0 = () => {
                    h.current === a && (a.seats().some(R0 => R0.workstation === Q0) ? a.goToDesk(Q0) : ++C0 < 40 && setTimeout(n0, 250))
                };
                setTimeout(n0, 400)
            } else A0.role !== "visitor" && q({
                text: "点一张没人用的工位坐下，就能把它设为你的工位",
                key: Date.now()
            })
        })
    }, [a, r.myId, t, !!d0, Z]), _.useEffect(() => {
        a && (d0 != null && d0.sittingSpot) && a.sitMeAt(d0.sittingSpot)
    }, [a, d0 == null ? void 0 : d0.sittingSpot]), _.useEffect(() => {
        a == null || a.setPeople(r.people.filter(F => F.id !== r.myId).map(F => ({
            id: F.id,
            name: F.name,
            appearance: F.appearance,
            seat: F.seat,
            sittingSpot: F.sittingSpot ?? void 0,
            atDesk: F.atDesk
        })))
    }, [a, r.people, r.myId]);
    const j0 = _.useRef(new Map);
    _.useEffect(() => {
        j0.current.clear()
    }, [a]), _.useEffect(() => {
        if (a)
            for (const [F, z] of Object.entries(r.motions)) F === r.myId || j0.current.get(F) === z || (j0.current.set(F, z), a.remoteMotion(F, z))
    }, [a, r.motions, r.myId]), _.useEffect(() => {
        a && (a.paused = R)
    }, [a, R]), _.useEffect(() => {
        const F = z => {
            var a0, V, p0;
            (V = (a0 = z.target) == null ? void 0 : a0.closest) != null && V.call(a0, "input, textarea, select") || z.ctrlKey || z.metaKey || z.altKey || !a || (z.key === "t" || z.key === "T" ? (p0 = a.build) != null && p0.active || Je() : z.key === "," && U(A0 => A0 ? null : "look"))
        };
        return window.addEventListener("keydown", F), () => window.removeEventListener("keydown", F)
    });

    function Je() {
        if (!a) return;
        const F = a.cycleTime();
        I({
            pick: a.timePick,
            name: F
        })
    }
    _.useEffect(() => {
        a && I({
            pick: a.timePick,
            name: a.timeName()
        })
    }, [a]), _.useEffect(() => {
        if (!G) return;
        const F = setTimeout(() => q(null), 5e3);
        return () => clearTimeout(F)
    }, [G]), _.useEffect(() => {
        r.notice && q({
            text: r.notice,
            key: Date.now()
        })
    }, [r.notice]);
    async function gt(F) {
        u0(null);
        const z = await r.claimSeat(F);
        z || q({
            text: "刚被别人占了，换一张吧",
            key: Date.now()
        }), z && t0(!1)
    }
    const z0 = j && (j.id === r.myId || j.id === e ? d0 : r.people.find(F => F.id === j.id)),
        Ke = p.pick === "auto" ? `跟随真实时间 · 现在${l4[p.name]}` : l4[p.name];
    return y.jsxs("div", {
        className: "hall-view",
        ref: o,
        children: [b && a && y.jsx(G3, {
            tableId: b,
            hall: a,
            client: r.billiards,
            myId: r.myId,
            online: r.connected,
            onClose: () => v(null)
        }, b), L && y.jsx("div", {
            className: "cat-bubble",
            role: "status",
            style: {
                left: L.x,
                top: L.y
            },
            children: L.text
        }), x && y.jsx(P3, {
            onClose: () => B(!1),
            interact: r.interactCat
        }), R && y.jsxs("div", {
            className: "hall-paused",
            children: [y.jsx("p", {
                children: "3D 画面已暂停"
            }), y.jsx("button", {
                type: "button",
                onClick: () => Q(!1),
                children: "继续"
            })]
        }), z0 && j && y.jsxs("div", {
            className: "hall-tag",
            style: {
                left: j.x,
                top: j.y
            },
            children: [z0.name, z0.id === r.myId && y.jsx("small", {
                children: "我"
            }), z0.id !== r.myId && y.jsx("small", {
                children: z0.meeting ? "在开会" : z0.inCall ? "在通话" : z0.atDesk === !1 ? "暂时离开" : z0.seat !== null ? "在工位" : ""
            })]
        }), G && !C && y.jsx("div", {
            className: "hall-ticker",
            role: "status",
            children: G.text
        }, G.key), i0 !== null && y.jsxs("div", {
            className: "hall-claim",
            role: "dialog",
            "aria-label": "认领工位",
            children: [y.jsx("strong", {
                children: Z === null ? "这张桌子还没人用" : "换到这张桌子？"
            }), y.jsx("small", {
                children: Z === null ? "设为你的工位后会一直给你留着，桌上的屏幕显示你的工作画面" : "原来的工位会空出来给别人"
            }), y.jsxs("div", {
                children: [y.jsx("button", {
                    type: "button",
                    onClick: () => u0(null),
                    children: "先不用"
                }), y.jsx("button", {
                    type: "button",
                    className: "go",
                    onClick: () => void gt(i0),
                    children: Z === null ? "设为我的工位" : "换到这里"
                })]
            })]
        }), y.jsxs("div", {
            className: "hall-ctl",
            children: [y.jsxs("button", {
                type: "button",
                className: "cb",
                "aria-label": "时间",
                onClick: Je,
                children: [y.jsx("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.8",
                    children: z6[p.pick === "auto" ? "auto" : p.name]
                }), y.jsxs("span", {
                    className: "tip",
                    children: [Ke, y.jsx("kbd", {
                        children: "T"
                    })]
                })]
            }), y.jsxs("button", {
                type: "button",
                className: "cb",
                "aria-label": "视角回正",
                onClick: () => a == null ? void 0 : a.home(),
                children: [y.jsx("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.8",
                    children: y.jsx("path", {
                        d: "M4 11 12 4l8 7M6 10v9h12v-9"
                    })
                }), y.jsxs("span", {
                    className: "tip",
                    children: ["视角回正", y.jsx("kbd", {
                        children: "Home"
                    })]
                })]
            }), y.jsxs("button", {
                type: "button",
                className: "cb",
                "aria-label": "设置",
                "aria-pressed": !!P,
                onClick: () => U(F => F ? null : "look"),
                children: [y.jsxs("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.8",
                    children: [y.jsx("circle", {
                        cx: "12",
                        cy: "12",
                        r: "3"
                    }), y.jsx("path", {
                        d: "M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                    })]
                }), y.jsxs("span", {
                    className: "tip",
                    children: ["设置", y.jsx("kbd", {
                        children: ","
                    })]
                })]
            }), y.jsxs("button", {
                type: "button",
                className: "cb",
                "aria-label": "装修",
                "aria-pressed": C,
                onClick: () => a == null ? void 0 : a.toggleBuild(),
                children: [y.jsx("svg", {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.8",
                    children: y.jsx("path", {
                        d: "M14 4l6 6-3 3-6-6zM11 7 3 15l3 3 8-8"
                    })
                }), y.jsxs("span", {
                    className: "tip",
                    children: ["装修", y.jsx("kbd", {
                        children: "Tab"
                    })]
                })]
            })]
        }), P && y.jsx(T6, {
            page: P,
            onPage: U,
            onClose: () => U(null),
            office: r,
            appearance: t,
            onAppearance: s,
            mySeat: Z,
            isVisitor: le,
            paused: R,
            onPaused: Q,
            timeTip: Ke,
            onTime: Je,
            update: n,
            onLogout: i,
            quality: H,
            onQuality: F => {
                N(F), a == null || a.setRenderQuality(F)
            },
            onGoToDesk: () => {
                U(null), Z !== null && (a == null || a.goToDesk(Z))
            },
            onMove: () => {
                U(null), t0(!0), q({
                    text: Z === null ? "在大厅里点一张空着的工位坐下，就能设为你的" : "在大厅里点一张空着的工位坐下，就能换过去",
                    key: Date.now()
                })
            }
        })]
    })
}
