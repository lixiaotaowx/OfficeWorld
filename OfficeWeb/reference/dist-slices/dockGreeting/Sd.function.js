function Sd(p, S = () => {}) {
    return new Promise((f, R) => {
        const E = new BroadcastChannel(Ba),
            z = crypto.randomUUID();
        let F;
        const O = (A, ae) => {
                clearTimeout(F), E.close(), A ? R(Error(A)) : f(ae)
            },
            M = () => {
                clearTimeout(F), F = setTimeout(() => O("聊天附件连接超时，请刷新主窗口后重试"), 45e3)
            };
        E.onmessage = ({
            data: A
        }) => {
            (A == null ? void 0 : A.id) !== z || A.account !== p.account || (A.kind === "progress" && (M(), S(A.percent)), A.kind === "result" && O(A.error, A.blob))
        }, M();
        try {
            E.postMessage({
                ...p,
                id: z
            })
        } catch {
            O("附件未能读取，请重新选择文件")
        }
    })
}

