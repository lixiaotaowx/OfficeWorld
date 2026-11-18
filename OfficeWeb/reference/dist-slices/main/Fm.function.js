function Fm(i, e, t) {
    var n;
    const s = new URLSearchParams;
    return s.set("access_token", i), t.reconnect && (s.set("reconnect", "1"), t.sid && s.set("sid", t.sid)), s.set("auto_subscribe", t.autoSubscribe ? "1" : "0"), s.set("sdk", Xe() ? "reactnative" : "js"), s.set("version", e.version), s.set("protocol", e.protocol.toString()), e.deviceModel && s.set("device_model", e.deviceModel), e.os && s.set("os", e.os), e.osVersion && s.set("os_version", e.osVersion), e.browser && s.set("browser", e.browser), e.browserVersion && s.set("browser_version", e.browserVersion), t.adaptiveStream && s.set("adaptive_stream", "1"), t.reconnectReason && s.set("reconnect_reason", t.reconnectReason.toString()), !((n = navigator.connection) === null || n === void 0) && n.type && s.set("network", navigator.connection.type), s
}

