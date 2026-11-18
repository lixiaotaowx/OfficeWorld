function N6(r) {
    const {
        office: e,
        mySeat: t,
        isVisitor: s,
        update: i
    } = r, [n, o] = _.useState(null);
    _.useEffect(() => {
        var A;
        (A = window.officeDesktop) == null || A.readLogin().then(c => o(!!c)).catch(() => o(!1))
    }, []);
    const [a, l] = _.useState(!1);
    return y.jsxs(y.Fragment, {
        children: [y.jsx(G0, {
            title: "工位",
            children: s ? y.jsx(g0, {
                label: "访客",
                sub: "访客坐在休息区的沙发上，开会、聊天、通话和共享都能用"
            }) : t === null ? y.jsx(g0, {
                label: "还没有工位",
                sub: "在大厅里点一张空着的工位坐下，就能设为你的",
                children: y.jsx("button", {
                    type: "button",
                    onClick: r.onMove,
                    children: "去选"
                })
            }) : y.jsxs(y.Fragment, {
                children: [y.jsx(g0, {
                    label: `我的工位：${t+1} 号`,
                    sub: "一直为你保留，桌上的屏幕显示你的工作画面",
                    children: y.jsx("button", {
                        type: "button",
                        onClick: r.onGoToDesk,
                        children: "回工位"
                    })
                }), y.jsx(g0, {
                    label: "换个位置",
                    sub: "在大厅里点一张空着的工位坐下",
                    children: y.jsx("button", {
                        type: "button",
                        onClick: r.onMove,
                        children: "换位置"
                    })
                })]
            })
        }), y.jsxs(G0, {
            title: "账号",
            children: [window.officeDesktop && y.jsx(g0, {
                label: "记住登录",
                sub: n === null ? "查看中…" : n ? "下次打开自动进入" : "没有保存"
            }), y.jsx(g0, {
                label: "退出登录",
                children: y.jsx("button", {
                    type: "button",
                    onClick: r.onLogout,
                    children: "退出"
                })
            })]
        }), y.jsxs(G0, {
            title: "其他",
            children: [y.jsx(g0, {
                label: "客户端版本",
                sub: i.currentVersion ? `${i.currentVersion}${i.copy?"":" · 已是最新"}` : "浏览器版",
                children: i.copy && y.jsx("button", {
                    type: "button",
                    onClick: () => void i.start(),
                    children: "更新"
                })
            }), y.jsx(g0, {
                label: "管理员",
                sub: "查看和释放工位，要管理员密码",
                children: y.jsx("button", {
                    type: "button",
                    onClick: () => l(A => !A),
                    children: a ? "收起" : "打开"
                })
            }), a && y.jsx(P6, {
                office: e
            })]
        })]
    })
}

