function Ht(i, e) {
    if (e.srcObject instanceof MediaStream) {
        const t = e.srcObject;
        t.removeTrack(i), t.getTracks().length > 0 ? e.srcObject = t : e.srcObject = null
    }
}(function(i) {
    let e;
    (function(d) {
        d.Audio = "audio", d.Video = "video", d.Unknown = "unknown"
    })(e = i.Kind || (i.Kind = {}));
    let t;
    (function(d) {
        d.Camera = "camera", d.Microphone = "microphone", d.ScreenShare = "screen_share", d.ScreenShareAudio = "screen_share_audio", d.Unknown = "unknown"
    })(t = i.Source || (i.Source = {}));
    let n;
    (function(d) {
        d.Active = "active", d.Paused = "paused", d.Unknown = "unknown"
    })(n = i.StreamState || (i.StreamState = {}));

    function s(d) {
        switch (d) {
            case e.Audio:
                return Ve.AUDIO;
            case e.Video:
                return Ve.VIDEO;
            default:
                return Ve.DATA
        }
    }
    i.kindToProto = s;

    function r(d) {
        switch (d) {
            case Ve.AUDIO:
                return e.Audio;
            case Ve.VIDEO:
                return e.Video;
            default:
                return e.Unknown
        }
    }
    i.kindFromProto = r;

    function a(d) {
        switch (d) {
            case t.Camera:
                return ye.CAMERA;
            case t.Microphone:
                return ye.MICROPHONE;
            case t.ScreenShare:
                return ye.SCREEN_SHARE;
            case t.ScreenShareAudio:
                return ye.SCREEN_SHARE_AUDIO;
            default:
                return ye.UNKNOWN
        }
    }
    i.sourceToProto = a;

    function o(d) {
        switch (d) {
            case ye.CAMERA:
                return t.Camera;
            case ye.MICROPHONE:
                return t.Microphone;
            case ye.SCREEN_SHARE:
                return t.ScreenShare;
            case ye.SCREEN_SHARE_AUDIO:
                return t.ScreenShareAudio;
            default:
                return t.Unknown
        }
    }
    i.sourceFromProto = o;

    function c(d) {
        switch (d) {
            case Gn.ACTIVE:
                return n.Active;
            case Gn.PAUSED:
                return n.Paused;
            default:
                return n.Unknown
        }
    }
    i.streamStateFromProto = c
})(O || (O = {}));
