function Bm(i, e, t) {
    const n = new URLSearchParams;
    n.set("access_token", i);
    const s = new vh({
        clientInfo: e,
        connectionSettings: new Va({
            autoSubscribe: !!t.autoSubscribe,
            adaptiveStream: !!t.adaptiveStream
        }),
        reconnect: !!t.reconnect,
        participantSid: t.sid ? t.sid : void 0
    });
    t.reconnectReason && (s.reconnectReason = t.reconnectReason);
    const r = new bh({
        joinRequest: s.toBinary()
    });
    return n.set("join_request", btoa(new TextDecoder("utf-8").decode(r.toBinary()))), n
}
