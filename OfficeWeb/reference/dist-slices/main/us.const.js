const us = "vp8",
    zm = {
        audioPreset: is.music,
        dtx: !0,
        red: !0,
        forceStereo: !1,
        simulcast: !0,
        screenShareEncoding: ln.h1080fps15.encoding,
        stopMicTrackOnMute: !1,
        videoCodec: us,
        backupCodec: !0,
        preConnectBuffer: !1
    },
    Ic = {
        deviceId: {
            ideal: "default"
        },
        autoGainControl: !0,
        echoCancellation: !0,
        noiseSuppression: !0,
        voiceIsolation: !0
    },
    xc = {
        deviceId: {
            ideal: "default"
        },
        resolution: gi.h720.resolution
    },
    $m = {
        adaptiveStream: !1,
        dynacast: !1,
        stopLocalTrackOnUnpublish: !0,
        reconnectPolicy: new Ph,
        disconnectOnPageLeave: !0,
        webAudioMix: !1,
        singlePeerConnection: !0
    },
    zs = {
        autoSubscribe: !0,
        maxRetries: 1,
        peerConnectionTimeout: 15e3,
        websocketTimeout: 15e3
    };
var le;
(function(i) {
    i[i.NEW = 0] = "NEW", i[i.CONNECTING = 1] = "CONNECTING", i[i.CONNECTED = 2] = "CONNECTED", i[i.FAILED = 3] = "FAILED", i[i.CLOSING = 4] = "CLOSING", i[i.CLOSED = 5] = "CLOSED"
})(le || (le = {}));
