function Dh() {
    return Hr || (Hr = 1, function(i) {
        const e = {};
        e.generateIdentifier = function() {
            return Math.random().toString(36).substring(2, 12)
        }, e.localCName = e.generateIdentifier(), e.splitLines = function(t) {
            return t.trim().split(`
`).map(n => n.trim())
        }, e.splitSections = function(t) {
            return t.split(`
m=`).map((s, r) => (r > 0 ? "m=" + s : s).trim() + `\r
`)
        }, e.getDescription = function(t) {
            const n = e.splitSections(t);
            return n && n[0]
        }, e.getMediaSections = function(t) {
            const n = e.splitSections(t);
            return n.shift(), n
        }, e.matchPrefix = function(t, n) {
            return e.splitLines(t).filter(s => s.indexOf(n) === 0)
        }, e.parseCandidate = function(t) {
            let n;
            t.indexOf("a=candidate:") === 0 ? n = t.substring(12).split(" ") : n = t.substring(10).split(" ");
            const s = {
                foundation: n[0],
                component: {
                    1: "rtp",
                    2: "rtcp"
                } [n[1]] || n[1],
                protocol: n[2].toLowerCase(),
                priority: parseInt(n[3], 10),
                ip: n[4],
                address: n[4],
                port: parseInt(n[5], 10),
                type: n[7]
            };
            for (let r = 8; r < n.length; r += 2) switch (n[r]) {
                case "raddr":
                    s.relatedAddress = n[r + 1];
                    break;
                case "rport":
                    s.relatedPort = parseInt(n[r + 1], 10);
                    break;
                case "tcptype":
                    s.tcpType = n[r + 1];
                    break;
                case "ufrag":
                    s.ufrag = n[r + 1], s.usernameFragment = n[r + 1];
                    break;
                default:
                    s[n[r]] === void 0 && (s[n[r]] = n[r + 1]);
                    break
            }
            return s
        }, e.writeCandidate = function(t) {
            const n = [];
            n.push(t.foundation);
            const s = t.component;
            s === "rtp" ? n.push(1) : s === "rtcp" ? n.push(2) : n.push(s), n.push(t.protocol.toUpperCase()), n.push(t.priority), n.push(t.address || t.ip), n.push(t.port);
            const r = t.type;
            return n.push("typ"), n.push(r), r !== "host" && t.relatedAddress && t.relatedPort && (n.push("raddr"), n.push(t.relatedAddress), n.push("rport"), n.push(t.relatedPort)), t.tcpType && t.protocol.toLowerCase() === "tcp" && (n.push("tcptype"), n.push(t.tcpType)), (t.usernameFragment || t.ufrag) && (n.push("ufrag"), n.push(t.usernameFragment || t.ufrag)), "candidate:" + n.join(" ")
        }, e.parseIceOptions = function(t) {
            return t.substring(14).split(" ")
        }, e.parseRtpMap = function(t) {
            let n = t.substring(9).split(" ");
            const s = {
                payloadType: parseInt(n.shift(), 10)
            };
            return n = n[0].split("/"), s.name = n[0], s.clockRate = parseInt(n[1], 10), s.channels = n.length === 3 ? parseInt(n[2], 10) : 1, s.numChannels = s.channels, s
        }, e.writeRtpMap = function(t) {
            let n = t.payloadType;
            t.preferredPayloadType !== void 0 && (n = t.preferredPayloadType);
            const s = t.channels || t.numChannels || 1;
            return "a=rtpmap:" + n + " " + t.name + "/" + t.clockRate + (s !== 1 ? "/" + s : "") + `\r
`
        }, e.parseExtmap = function(t) {
            const n = t.substring(9).split(" ");
            return {
                id: parseInt(n[0], 10),
                direction: n[0].indexOf("/") > 0 ? n[0].split("/")[1] : "sendrecv",
                uri: n[1],
                attributes: n.slice(2).join(" ")
            }
        }, e.writeExtmap = function(t) {
            return "a=extmap:" + (t.id || t.preferredId) + (t.direction && t.direction !== "sendrecv" ? "/" + t.direction : "") + " " + t.uri + (t.attributes ? " " + t.attributes : "") + `\r
`
        }, e.parseFmtp = function(t) {
            const n = {};
            let s;
            const r = t.substring(t.indexOf(" ") + 1).split(";");
            for (let a = 0; a < r.length; a++) s = r[a].trim().split("="), n[s[0].trim()] = s[1];
            return n
        }, e.writeFmtp = function(t) {
            let n = "",
                s = t.payloadType;
            if (t.preferredPayloadType !== void 0 && (s = t.preferredPayloadType), t.parameters && Object.keys(t.parameters).length) {
                const r = [];
                Object.keys(t.parameters).forEach(a => {
                    t.parameters[a] !== void 0 ? r.push(a + "=" + t.parameters[a]) : r.push(a)
                }), n += "a=fmtp:" + s + " " + r.join(";") + `\r
`
            }
            return n
        }, e.parseRtcpFb = function(t) {
            const n = t.substring(t.indexOf(" ") + 1).split(" ");
            return {
                type: n.shift(),
                parameter: n.join(" ")
            }
        }, e.writeRtcpFb = function(t) {
            let n = "",
                s = t.payloadType;
            return t.preferredPayloadType !== void 0 && (s = t.preferredPayloadType), t.rtcpFeedback && t.rtcpFeedback.length && t.rtcpFeedback.forEach(r => {
                n += "a=rtcp-fb:" + s + " " + r.type + (r.parameter && r.parameter.length ? " " + r.parameter : "") + `\r
`
            }), n
        }, e.parseSsrcMedia = function(t) {
            const n = t.indexOf(" "),
                s = {
                    ssrc: parseInt(t.substring(7, n), 10)
                },
                r = t.indexOf(":", n);
            return r > -1 ? (s.attribute = t.substring(n + 1, r), s.value = t.substring(r + 1)) : s.attribute = t.substring(n + 1), s
        }, e.parseSsrcGroup = function(t) {
            const n = t.substring(13).split(" ");
            return {
                semantics: n.shift(),
                ssrcs: n.map(s => parseInt(s, 10))
            }
        }, e.getMid = function(t) {
            const n = e.matchPrefix(t, "a=mid:")[0];
            if (n) return n.substring(6)
        }, e.parseFingerprint = function(t) {
            const n = t.substring(14).split(" ");
            return {
                algorithm: n[0].toLowerCase(),
                value: n[1].toUpperCase()
            }
        }, e.getDtlsParameters = function(t, n) {
            return {
                role: "auto",
                fingerprints: e.matchPrefix(t + n, "a=fingerprint:").map(e.parseFingerprint)
            }
        }, e.writeDtlsParameters = function(t, n) {
            let s = "a=setup:" + n + `\r
`;
            return t.fingerprints.forEach(r => {
                s += "a=fingerprint:" + r.algorithm + " " + r.value + `\r
`
            }), s
        }, e.parseCryptoLine = function(t) {
            const n = t.substring(9).split(" ");
            return {
                tag: parseInt(n[0], 10),
                cryptoSuite: n[1],
                keyParams: n[2],
                sessionParams: n.slice(3)
            }
        }, e.writeCryptoLine = function(t) {
            return "a=crypto:" + t.tag + " " + t.cryptoSuite + " " + (typeof t.keyParams == "object" ? e.writeCryptoKeyParams(t.keyParams) : t.keyParams) + (t.sessionParams ? " " + t.sessionParams.join(" ") : "") + `\r
`
        }, e.parseCryptoKeyParams = function(t) {
            if (t.indexOf("inline:") !== 0) return null;
            const n = t.substring(7).split("|");
            return {
                keyMethod: "inline",
                keySalt: n[0],
                lifeTime: n[1],
                mkiValue: n[2] ? n[2].split(":")[0] : void 0,
                mkiLength: n[2] ? n[2].split(":")[1] : void 0
            }
        }, e.writeCryptoKeyParams = function(t) {
            return t.keyMethod + ":" + t.keySalt + (t.lifeTime ? "|" + t.lifeTime : "") + (t.mkiValue && t.mkiLength ? "|" + t.mkiValue + ":" + t.mkiLength : "")
        }, e.getCryptoParameters = function(t, n) {
            return e.matchPrefix(t + n, "a=crypto:").map(e.parseCryptoLine)
        }, e.getIceParameters = function(t, n) {
            const s = e.matchPrefix(t + n, "a=ice-ufrag:")[0],
                r = e.matchPrefix(t + n, "a=ice-pwd:")[0];
            return s && r ? {
                usernameFragment: s.substring(12),
                password: r.substring(10)
            } : null
        }, e.writeIceParameters = function(t) {
            let n = "a=ice-ufrag:" + t.usernameFragment + `\r
a=ice-pwd:` + t.password + `\r
`;
            return t.iceLite && (n += `a=ice-lite\r
`), n
        }, e.parseRtpParameters = function(t) {
            const n = {
                    codecs: [],
                    headerExtensions: [],
                    fecMechanisms: [],
                    rtcp: []
                },
                r = e.splitLines(t)[0].split(" ");
            n.profile = r[2];
            for (let o = 3; o < r.length; o++) {
                const c = r[o],
                    d = e.matchPrefix(t, "a=rtpmap:" + c + " ")[0];
                if (d) {
                    const l = e.parseRtpMap(d),
                        u = e.matchPrefix(t, "a=fmtp:" + c + " ");
                    switch (l.parameters = u.length ? e.parseFmtp(u[0]) : {}, l.rtcpFeedback = e.matchPrefix(t, "a=rtcp-fb:" + c + " ").map(e.parseRtcpFb), n.codecs.push(l), l.name.toUpperCase()) {
                        case "RED":
                        case "ULPFEC":
                            n.fecMechanisms.push(l.name.toUpperCase());
                            break
                    }
                }
            }
            e.matchPrefix(t, "a=extmap:").forEach(o => {
                n.headerExtensions.push(e.parseExtmap(o))
            });
            const a = e.matchPrefix(t, "a=rtcp-fb:* ").map(e.parseRtcpFb);
            return n.codecs.forEach(o => {
                a.forEach(c => {
                    o.rtcpFeedback.find(l => l.type === c.type && l.parameter === c.parameter) || o.rtcpFeedback.push(c)
                })
            }), n
        }, e.writeRtpDescription = function(t, n) {
            let s = "";
            s += "m=" + t + " ", s += n.codecs.length > 0 ? "9" : "0", s += " " + (n.profile || "UDP/TLS/RTP/SAVPF") + " ", s += n.codecs.map(a => a.preferredPayloadType !== void 0 ? a.preferredPayloadType : a.payloadType).join(" ") + `\r
`, s += `c=IN IP4 0.0.0.0\r
`, s += `a=rtcp:9 IN IP4 0.0.0.0\r
`, n.codecs.forEach(a => {
                s += e.writeRtpMap(a), s += e.writeFmtp(a), s += e.writeRtcpFb(a)
            });
            let r = 0;
            return n.codecs.forEach(a => {
                a.maxptime > r && (r = a.maxptime)
            }), r > 0 && (s += "a=maxptime:" + r + `\r
`), n.headerExtensions && n.headerExtensions.forEach(a => {
                s += e.writeExtmap(a)
            }), s
        }, e.parseRtpEncodingParameters = function(t) {
            const n = [],
                s = e.parseRtpParameters(t),
                r = s.fecMechanisms.indexOf("RED") !== -1,
                a = s.fecMechanisms.indexOf("ULPFEC") !== -1,
                o = e.matchPrefix(t, "a=ssrc:").map(h => e.parseSsrcMedia(h)).filter(h => h.attribute === "cname"),
                c = o.length > 0 && o[0].ssrc;
            let d;
            const l = e.matchPrefix(t, "a=ssrc-group:FID").map(h => h.substring(17).split(" ").map(f => parseInt(f, 10)));
            l.length > 0 && l[0].length > 1 && l[0][0] === c && (d = l[0][1]), s.codecs.forEach(h => {
                if (h.name.toUpperCase() === "RTX" && h.parameters.apt) {
                    let m = {
                        ssrc: c,
                        codecPayloadType: parseInt(h.parameters.apt, 10)
                    };
                    c && d && (m.rtx = {
                        ssrc: d
                    }), n.push(m), r && (m = JSON.parse(JSON.stringify(m)), m.fec = {
                        ssrc: c,
                        mechanism: a ? "red+ulpfec" : "red"
                    }, n.push(m))
                }
            }), n.length === 0 && c && n.push({
                ssrc: c
            });
            let u = e.matchPrefix(t, "b=");
            return u.length && (u[0].indexOf("b=TIAS:") === 0 ? u = parseInt(u[0].substring(7), 10) : u[0].indexOf("b=AS:") === 0 ? u = parseInt(u[0].substring(5), 10) * 1e3 * .95 - 50 * 40 * 8 : u = void 0, n.forEach(h => {
                h.maxBitrate = u
            })), n
        }, e.parseRtcpParameters = function(t) {
            const n = {},
                s = e.matchPrefix(t, "a=ssrc:").map(o => e.parseSsrcMedia(o)).filter(o => o.attribute === "cname")[0];
            s && (n.cname = s.value, n.ssrc = s.ssrc);
            const r = e.matchPrefix(t, "a=rtcp-rsize");
            n.reducedSize = r.length > 0, n.compound = r.length === 0;
            const a = e.matchPrefix(t, "a=rtcp-mux");
            return n.mux = a.length > 0, n
        }, e.writeRtcpParameters = function(t) {
            let n = "";
            return t.reducedSize && (n += `a=rtcp-rsize\r
`), t.mux && (n += `a=rtcp-mux\r
`), t.ssrc !== void 0 && t.cname && (n += "a=ssrc:" + t.ssrc + " cname:" + t.cname + `\r
`), n
        }, e.parseMsid = function(t) {
            let n;
            const s = e.matchPrefix(t, "a=msid:");
            if (s.length === 1) return n = s[0].substring(7).split(" "), {
                stream: n[0],
                track: n[1]
            };
            const r = e.matchPrefix(t, "a=ssrc:").map(a => e.parseSsrcMedia(a)).filter(a => a.attribute === "msid");
            if (r.length > 0) return n = r[0].value.split(" "), {
                stream: n[0],
                track: n[1]
            }
        }, e.parseSctpDescription = function(t) {
            const n = e.parseMLine(t),
                s = e.matchPrefix(t, "a=max-message-size:");
            let r;
            s.length > 0 && (r = parseInt(s[0].substring(19), 10)), isNaN(r) && (r = 65536);
            const a = e.matchPrefix(t, "a=sctp-port:");
            if (a.length > 0) return {
                port: parseInt(a[0].substring(12), 10),
                protocol: n.fmt,
                maxMessageSize: r
            };
            const o = e.matchPrefix(t, "a=sctpmap:");
            if (o.length > 0) {
                const c = o[0].substring(10).split(" ");
                return {
                    port: parseInt(c[0], 10),
                    protocol: c[1],
                    maxMessageSize: r
                }
            }
        }, e.writeSctpDescription = function(t, n) {
            let s = [];
            return t.protocol !== "DTLS/SCTP" ? s = ["m=" + t.kind + " 9 " + t.protocol + " " + n.protocol + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctp-port:" + n.port + `\r
`] : s = ["m=" + t.kind + " 9 " + t.protocol + " " + n.port + `\r
`, `c=IN IP4 0.0.0.0\r
`, "a=sctpmap:" + n.port + " " + n.protocol + ` 65535\r
`], n.maxMessageSize !== void 0 && s.push("a=max-message-size:" + n.maxMessageSize + `\r
`), s.join("")
        }, e.generateSessionId = function() {
            return Math.random().toString().substr(2, 22)
        }, e.writeSessionBoilerplate = function(t, n, s) {
            let r;
            const a = n !== void 0 ? n : 2;
            return t ? r = t : r = e.generateSessionId(), `v=0\r
o=` + (s || "thisisadapterortc") + " " + r + " " + a + ` IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
`
        }, e.getDirection = function(t, n) {
            const s = e.splitLines(t);
            for (let r = 0; r < s.length; r++) switch (s[r]) {
                case "a=sendrecv":
                case "a=sendonly":
                case "a=recvonly":
                case "a=inactive":
                    return s[r].substring(2)
            }
            return n ? e.getDirection(n) : "sendrecv"
        }, e.getKind = function(t) {
            return e.splitLines(t)[0].split(" ")[0].substring(2)
        }, e.isRejected = function(t) {
            return t.split(" ", 2)[1] === "0"
        }, e.parseMLine = function(t) {
            const s = e.splitLines(t)[0].substring(2).split(" ");
            return {
                kind: s[0],
                port: parseInt(s[1], 10),
                protocol: s[2],
                fmt: s.slice(3).join(" ")
            }
        }, e.parseOLine = function(t) {
            const s = e.matchPrefix(t, "o=")[0].substring(2).split(" ");
            return {
                username: s[0],
                sessionId: s[1],
                sessionVersion: parseInt(s[2], 10),
                netType: s[3],
                addressType: s[4],
                address: s[5]
            }
        }, e.isValidSDP = function(t) {
            if (typeof t != "string" || t.length === 0) return !1;
            const n = e.splitLines(t);
            for (let s = 0; s < n.length; s++)
                if (n[s].length < 2 || n[s].charAt(1) !== "=") return !1;
            return !0
        }, i.exports = e
    }(bn)), bn.exports
}
var yc = Dh(),
    Wt = Sh(yc),
    Ah = Ul({
        __proto__: null,
        default: Wt
    }, [yc]);

