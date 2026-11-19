function $n({
    state: t,
    convo: s,
    person: n,
    big: c,
    free: r,
    inCallWith: i,
    meeting: o,
    onBig: d,
    onClose: m,
    onCall: h,
    onSwitch: k,
    notice: f,
    mention: b,
    onPersonMenu: g,
    onMentionUsed: R,
    media: N
}) {
    var Se, Ne, fe, he, _e;
    const C = t.chat,
        I = (C == null ? void 0 : C.open) === s,
        j = t.people.find(l => l.self),
        _ = (C == null ? void 0 : C.members) || [],
        W = [...(Se = C == null ? void 0 : C.directory) != null && Se.length ? C.directory : _, ...j != null && j.account ? [{
            id: j.account,
            name: j.name
        }] : []],
        T = I ? C.messages.map(l => {
            const A = l.mentions ?? (s === ie ? bn(l.text, W) : []);
            return {
                ...l,
                mentions: A,
                mentionedMe: l.mentionedMe ?? (!l.mine && A.some(B => B.id === (j == null ? void 0 : j.account)))
            }
        }) : [],
        [D, w] = u.useState({}),
        [E, L] = u.useState(!1),
        [U, K] = u.useState(null),
        [p, $] = u.useState(!1),
        S = async l => {
            var B;
            const A = (B = t.people.find(P => P.self)) == null ? void 0 : B.account;
            if (!(!A || !U)) try {
                l ? await Ut(A, U.id, U.at) : xt(A, U.id, {
                    hiddenAt: U.at
                }), !l && U.id === s && m(), f(l ? "已删除本设备的聊天记录" : "已清除会话，聊天记录仍保留"), K(null), $(!1)
            } catch {
                f("本地保存失败，请重试")
            }
        }, O = u.useRef(null), F = u.useRef(null), oe = u.useRef(null), q = u.useRef(null), ne = u.useRef();
    u.useEffect(() => {
        if (!b || s !== ie || ne.current === b.nonce) return;
        ne.current = b.nonce, R == null || R();
        const l = D[ie] || "",
            A = It(l, l.length, l.length, b.name);
        if (A.text.length > 1e3) {
            f("消息已达到长度上限，请先精简内容");
            return
        }
        w(B => ({
            ...B,
            [ie]: A.text
        })), requestAnimationFrame(() => {
            var B, P;
            (B = F.current) == null || B.focus(), (P = F.current) == null || P.setSelectionRange(A.caret, A.caret)
        })
    }, [b == null ? void 0 : b.nonce, s]);
    const se = _t((j == null ? void 0 : j.account) || ""),
        [ve, Y] = u.useState({}),
        Pe = `${(j==null?void 0:j.account)||""}:${s}`,
        Re = [((Ne = se[s]) == null ? void 0 : Ne.mentionsReadThrough) || "", ve[Pe] || ""].sort().at(-1),
        ye = T.filter(l => l.mentionedMe && l.id > Re),
        Te = () => {
            var P;
            const l = ye[0];
            if (!l) return;
            const A = ye.reduce((J, le) => le.id > J ? le.id : J, Re);
            if (Y(J => ({
                    ...J,
                    [Pe]: A
                })), j != null && j.account) try {
                xt(j.account, s, {
                    mentionsReadThrough: A
                })
            } catch {
                f("提醒已查看，但本地保存失败，重启后可能再次显示")
            }
            const B = [...((P = O.current) == null ? void 0 : P.querySelectorAll("[data-message-id]")) || []].find(J => J.dataset.messageId === l.id);
            B == null || B.scrollIntoView({
                block: "center",
                behavior: "smooth"
            }), B == null || B.focus({
                preventScroll: !0
            })
        };
    u.useEffect(() => {
        G("chat-open", s), L(!1), setTimeout(() => {
            var l;
            return (l = F.current) == null ? void 0 : l.focus({
                preventScroll: !0
            })
        }, 30)
    }, [s]), u.useEffect(() => () => G("chat-open", ""), []), u.useEffect(() => {
        const l = O.current;
        l && (l.scrollTop = l.scrollHeight)
    }, [T.length, s]);
    const de = s === ie,
        Ce = de ? "iruler" : (n == null ? void 0 : n.name) || ((fe = C == null ? void 0 : C.threads.find(l => l.id === s)) == null ? void 0 : fe.name) || "同事",
        Z = de ? "群聊 · 也是开会的地方" : n ? i ? "正在和你通话" : o ? "在开会，可能回得慢" : n.atDesk ? n.status || "在座" : n.away ? `离开 ${n.away}` : "离开" : "不在线",
        [Ae, Q] = u.useState({}),
        [re, ce] = u.useState(null),
        pe = u.useRef(!1),
        [ue, ze] = u.useState({}),
        Ee = Ae[s] || [],
        Me = l => {
            const A = l.filter(P => P.size >= 0 && P.size <= Mt && P.name.length <= 200);
            A.length !== l.length && f("附件最大 2 GB，文件名最多 200 个字");
            const B = A.map(P => ({
                id: crypto.randomUUID(),
                file: P
            }));
            return Q(P => ({
                ...P,
                [s]: [...P[s] || [], ...B]
            })), B
        },
        Fe = l => {
            const A = Dt(l);
            A.files.length && Me(A.files);
            const B = Lt(A);
            B && f(B)
        },
        Oe = async (l = Ee, A = !0) => {
            if (pe.current) return;
            const B = A ? (D[s] || "").trim() : "";
            if (!(!B && !l.length) && (B && (G("chat-send", s, {
                    text: B
                }), w(P => ({
                    ...P,
                    [s]: ""
                }))), !!l.length)) {
                if (!(j != null && j.account)) {
                    f("请登录后再发送附件");
                    return
                }
                pe.current = !0, ze(P => ({
                    ...P,
                    [s]: ""
                }));
                try {
                    for (const P of l) ce({
                        conversation: s,
                        label: `正在发送 ${ke(P.file.name)?"图片":P.file.name} · 0%`
                    }), await Le({
                        kind: "upload",
                        account: j.account,
                        conversation: s,
                        file: P.file
                    }, J => {
                        J >= 0 && ce({
                            conversation: s,
                            label: `正在发送 ${ke(P.file.name)?"图片":P.file.name} · ${J}%`
                        })
                    }), Q(J => ({
                        ...J,
                        [s]: (J[s] || []).filter(le => le.id !== P.id)
                    }))
                } catch (P) {
                    ze(J => ({
                        ...J,
                        [s]: P instanceof Error ? P.message : "附件发送失败，请重试"
                    }))
                } finally {
                    pe.current = !1, ce(null)
                }
            }
        }, We = Ln(t, r);
    return e.jsxs("section", {
        "data-office-editing": !!re || Object.values(D).some(l => l.trim()) || Object.values(Ae).some(l => l.length > 0),
        className: "dock-card dk-fly" + (c ? " big" : ""),
        role: "dialog",
        "aria-label": de ? "iruler" : `和${Ce}的对话`,
        onPaste: l => {
            var B;
            const A = [...l.clipboardData.files];
            A.length && (l.preventDefault(), Me(A), (B = F.current) == null || B.focus())
        },
        onDragOver: l => {
            l.dataTransfer.types.includes("Files") && (l.preventDefault(), l.dataTransfer.dropEffect = "copy")
        },
        onDrop: l => {
            l.dataTransfer.types.includes("Files") && (l.preventDefault(), Fe(l.dataTransfer))
        },
        children: [c && e.jsx("aside", {
            className: "dk-convs",
            "aria-label": "所有对话",
            children: ((C == null ? void 0 : C.threads) || []).map(l => e.jsxs("button", {
                type: "button",
                className: "dk-conv" + (l.id === s ? " on" : ""),
                onContextMenu: A => {
                    A.preventDefault(), K({
                        id: l.id,
                        at: l.at,
                        name: l.name
                    }), $(!1)
                },
                onClick: () => {
                    K(null), k(l.id)
                },
                children: [e.jsx("strong", {
                    children: l.id === ie ? "iruler" : l.name
                }), e.jsx("small", {
                    children: l.last
                }), l.unread > 0 && e.jsx("i", {
                    children: l.unread > 99 ? "99+" : l.unread
                })]
            }, l.id))
        }), U && e.jsxs("div", {
            className: "dk-chat-context",
            role: "menu",
            "aria-label": `${U.name}的会话操作`,
            children: [e.jsx("strong", {
                children: U.name
            }), p ? e.jsxs(e.Fragment, {
                children: [e.jsx("p", {
                    children: "删除本设备中此会话的已有记录？对方和其他设备不受影响。"
                }), e.jsx("button", {
                    type: "button",
                    onClick: () => S(!0),
                    children: "确认删除本地聊天记录"
                })]
            }) : e.jsxs(e.Fragment, {
                children: [e.jsx("button", {
                    type: "button",
                    onClick: () => S(!1),
                    children: "清除当前会话（保留记录）"
                }), e.jsx("button", {
                    type: "button",
                    onClick: () => $(!0),
                    children: "删除本地聊天记录…"
                })]
            }), e.jsx("button", {
                type: "button",
                onClick: () => {
                    K(null), $(!1)
                },
                children: "取消"
            })]
        }), e.jsxs("header", {
            children: [e.jsx("strong", {
                children: Ce
            }), e.jsx("small", {
                children: Z
            }), de && ye.length > 0 && e.jsxs("button", {
                type: "button",
                className: "dk-mention-jump",
                onClick: Te,
                title: "查看未读的 @ 我的消息，并清除当前提醒",
                children: ["@ 我的 ", ye.length]
            }), de ? e.jsxs("button", {
                type: "button",
                className: "dk-gather",
                title: We.title,
                disabled: We.off || ((he = t.meeting) == null ? void 0 : he.busy),
                onClick: () => G("gather"),
                children: [ae.mic, "开会"]
            }) : n && e.jsxs(e.Fragment, {
                children: [e.jsx("button", {
                    type: "button",
                    className: "dk-icon" + (i ? " on" : ""),
                    title: i ? "正在通话" : "开始说话",
                    "aria-label": "开始说话",
                    onClick: h,
                    children: ae.mic
                }), e.jsx("button", {
                    type: "button",
                    className: "dk-icon",
                    title: "看屏幕",
                    "aria-label": "看屏幕",
                    onClick: () => L(l => !l),
                    children: ae.screen
                })]
            }), e.jsx("button", {
                type: "button",
                className: "dk-icon",
                title: c ? "缩小" : "放大",
                "aria-label": c ? "缩小" : "放大",
                onClick: d,
                children: c ? ae.shrink : ae.grow
            }), e.jsx("button", {
                type: "button",
                className: "dk-icon",
                title: "收起（Esc）",
                "aria-label": "收起",
                onClick: m,
                children: ae.close
            })]
        }), N, e.jsxs("div", {
            className: "dk-msgs",
            ref: O,
            "aria-live": "polite",
            children: [E && n && e.jsxs("div", {
                className: "dk-menu",
                children: [e.jsxs("button", {
                    type: "button",
                    onClick: () => {
                        L(!1), G("watch", n.id), f(`想去${n.name}那看看，等他同意…`)
                    },
                    children: [ae.screen, "去", n.name, "那看看", e.jsx("small", {
                        children: "要等他同意"
                    })]
                }), e.jsxs("button", {
                    type: "button",
                    onClick: () => {
                        L(!1), G("share", n.id), f(`邀请${n.name}来看你的屏幕…`)
                    },
                    children: [ae.screen, "快来看这个", e.jsx("small", {
                        children: "邀请他看我的屏幕"
                    })]
                })]
            }), !I && e.jsx("div", {
                className: "dk-day",
                children: "正在打开…"
            }), I && !T.length && e.jsx("div", {
                className: "dk-day",
                children: de ? "iruler 群聊，说点什么吧" : "还没有消息"
            }), T.map((l, A) => {
                var J;
                const B = jn(l.time),
                    P = l.mine ? j : t.people.find(le => le.account === l.from || le.id === l.from);
                return e.jsxs(u.Fragment, {
                    children: [wn(l.time, (J = T[A - 1]) == null ? void 0 : J.time) && e.jsx("time", {
                        className: "dk-time-divider",
                        dateTime: B.iso,
                        title: B.label,
                        children: Cn(l.time)
                    }), e.jsxs("div", {
                        title: B.label,
                        "data-message-id": l.id,
                        tabIndex: -1,
                        className: "dk-message-row" + (l.mine ? " mine" : ""),
                        children: [e.jsx("span", {
                            className: "dk-message-avatar",
                            onContextMenu: le => {
                                l.mine || (le.preventDefault(), g == null || g(P || {
                                    id: l.from,
                                    account: l.from,
                                    name: l.name
                                }))
                            },
                            role: "img",
                            "aria-label": `${l.mine?"我":l.name}的头像`,
                            children: P && typeof P.character == "string" ? e.jsx(Ie, {
                                person: P,
                                size: 32
                            }) : e.jsx("span", {
                                children: Array.from(l.name || "同事")[0]
                            })
                        }), e.jsxs("div", {
                            className: "dk-message-content",
                            children: [de && !l.mine && e.jsx("small", {
                                className: "dk-message-name",
                                children: l.name
                            }), e.jsxs("div", {
                                className: "dk-m" + (l.mine ? " me" : "") + (l.file ? ke(l.file.name) ? " picture" : " file" : ""),
                                children: [l.mentionedMe && e.jsx("small", {
                                    className: "dk-mentioned-me",
                                    children: "有人 @ 你"
                                }), l.text && e.jsx(yn, {
                                    text: l.text,
                                    mentions: l.mentions,
                                    conversation: s,
                                    messageId: l.id
                                }), l.file && ke(l.file.name) && (j == null ? void 0 : j.account) && e.jsx(En, {
                                    account: j.account,
                                    conversation: s,
                                    file: l.file
                                }), l.file && !ke(l.file.name) && e.jsx(Mn, {
                                    account: (j == null ? void 0 : j.account) || "",
                                    conversation: s,
                                    file: l.file
                                })]
                            })]
                        })]
                    })]
                }, l.id)
            }), (C == null ? void 0 : C.error) && I && e.jsx("div", {
                className: "dk-day err",
                role: "alert",
                children: C.error
            }), de && ((_e = t.meeting) == null ? void 0 : _e.error) && e.jsx("div", {
                className: "dk-day err",
                role: "alert",
                children: t.meeting.error
            })]
        }), e.jsxs("footer", {
            children: [Ee.length > 0 && e.jsx("div", {
                className: "dk-attachments",
                "aria-label": "待发送附件",
                children: Ee.map(l => e.jsxs("div", {
                    className: "dk-pending-file",
                    children: [ke(l.file.name) && e.jsx(In, {
                        file: l.file
                    }), e.jsxs("span", {
                        title: ke(l.file.name) ? void 0 : l.file.name,
                        children: [ke(l.file.name) ? "图片 · 待发送" : l.file.name, e.jsx("small", {
                            children: Dn(l.file.size)
                        })]
                    }), e.jsx("button", {
                        type: "button",
                        className: "dk-icon",
                        "aria-label": `移除 ${l.file.name}`,
                        disabled: !!re,
                        onClick: () => Q(A => ({
                            ...A,
                            [s]: (A[s] || []).filter(B => B.id !== l.id)
                        })),
                        children: "×"
                    })]
                }, l.id))
            }), (re == null ? void 0 : re.conversation) === s && e.jsx("small", {
                className: "dk-upload",
                role: "status",
                children: re.label
            }), ue[s] && e.jsx("small", {
                className: "dk-upload err",
                role: "alert",
                children: ue[s]
            }), e.jsxs(Sn, {
                inputRef: F,
                enabled: de && (j == null ? void 0 : j.role) !== "visitor",
                members: _,
                placeholder: "输入消息，按住 Ctrl + Windows 语音输入",
                value: D[s] || "",
                onChange: l => w(A => ({
                    ...A,
                    [s]: l
                })),
                onSend: () => void Oe(),
                onClose: m,
                children: [e.jsx("button", {
                    type: "button",
                    className: "dk-icon",
                    title: "添加图片（Ctrl+V 粘贴后确认发送）",
                    "aria-label": "发送图片",
                    onClick: () => {
                        var l;
                        return (l = q.current) == null ? void 0 : l.click()
                    },
                    children: e.jsxs("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "1.8",
                        "aria-hidden": "true",
                        children: [e.jsx("rect", {
                            x: "3",
                            y: "3",
                            width: "18",
                            height: "18",
                            rx: "3"
                        }), e.jsx("circle", {
                            cx: "8",
                            cy: "8",
                            r: "1.5"
                        }), e.jsx("path", {
                            d: "m4 18 5-5 3 3 4-6 5 8"
                        })]
                    })
                }), e.jsx("input", {
                    ref: q,
                    type: "file",
                    accept: "image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif",
                    multiple: !0,
                    hidden: !0,
                    onChange: l => {
                        Me([...l.target.files || []]), l.target.value = ""
                    }
                }), e.jsx("button", {
                    type: "button",
                    className: "dk-icon",
                    title: "添加图片或文件（也支持粘贴、拖入）",
                    "aria-label": "发送文件",
                    onClick: () => {
                        var l;
                        return (l = oe.current) == null ? void 0 : l.click()
                    },
                    children: ae.clip
                }), e.jsx("button", {
                    type: "button",
                    className: "dk-icon dk-dictation",
                    "aria-label": "语音输入提示",
                    title: "按住 Ctrl + Windows 语音输入，松开后检查文字再发送",
                    onClick: () => {
                        var l;
                        (l = F.current) == null || l.focus(), f("按住 Ctrl + Windows 说话，松开后检查文字，点击发送")
                    },
                    children: ae.mic
                }), e.jsx("button", {
                    type: "button",
                    className: "dk-send-message",
                    "aria-label": "发送消息",
                    title: "Enter 发送，Shift + Enter 换行",
                    disabled: !!re || !(D[s] || "").trim() && !Ee.length,
                    onClick: () => void Oe(),
                    children: "发送"
                }), e.jsx("input", {
                    ref: oe,
                    type: "file",
                    multiple: !0,
                    hidden: !0,
                    onChange: l => {
                        Me([...l.target.files || []]), l.target.value = ""
                    }
                })]
            }, s), e.jsx("small", {
                className: "dk-compose-help",
                children: "按住 Ctrl + Windows 语音输入 · Shift + Enter 换行"
            })]
        })]
    })
}