function Mh(i) {
    const e = {
        browser: null,
        version: null
    };
    if (typeof i > "u" || !i.navigator || !i.navigator.userAgent) return e.browser = "Not a browser.", e;
    const {
        navigator: t
    } = i;
    if (t.userAgentData && t.userAgentData.brands) {
        const n = t.userAgentData.brands.find(s => s.brand === "Chromium");
        if (n) return {
            browser: "chrome",
            version: parseInt(n.version, 10)
        }
    }
    if (t.mozGetUserMedia) e.browser = "firefox", e.version = parseInt(oi(t.userAgent, /Firefox\/(\d+)\./, 1));
    else if (t.webkitGetUserMedia || i.isSecureContext === !1 && i.webkitRTCPeerConnection) e.browser = "chrome", e.version = parseInt(oi(t.userAgent, /Chrom(e|ium)\/(\d+)\./, 2));
    else if (i.RTCPeerConnection && t.userAgent.match(/AppleWebKit\/(\d+)\./)) e.browser = "safari", e.version = parseInt(oi(t.userAgent, /AppleWebKit\/(\d+)\./, 1)), e.supportsUnifiedPlan = i.RTCRtpTransceiver && "currentDirection" in i.RTCRtpTransceiver.prototype, e._safariVersion = oi(t.userAgent, /Version\/(\d+(\.?\d+))/, 1);
    else return e.browser = "Not a supported browser.", e;
    return e
}

