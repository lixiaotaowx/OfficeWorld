function Bc(i) {
    return i.map(e => {
        if (e) return Array.isArray(e) ? Bc(e) : typeof e == "object" ? "logContext" in e ? e.logContext : void 0 : e
    })
}
var Eo;
(function(i) {
    i[i.TooShort = 0] = "TooShort", i[i.HeaderOverrun = 1] = "HeaderOverrun", i[i.MissingExtWords = 2] = "MissingExtWords", i[i.UnsupportedVersion = 3] = "UnsupportedVersion", i[i.InvalidHandle = 4] = "InvalidHandle", i[i.MalformedExt = 5] = "MalformedExt"
})(Eo || (Eo = {}));
var Po;
(function(i) {
    i[i.TooSmallForHeader = 0] = "TooSmallForHeader", i[i.TooSmallForPayload = 1] = "TooSmallForPayload"
})(Po || (Po = {}));
var Xi;
(function(i) {
    i[i.UserTimestamp = 2] = "UserTimestamp", i[i.E2ee = 1] = "E2ee"
})(Xi || (Xi = {}));
Xi.UserTimestamp;
Xi.E2ee;
var Ro;
(function(i) {
    i[i.Reserved = 0] = "Reserved", i[i.TooLarge = 1] = "TooLarge"
})(Ro || (Ro = {}));
var _o;
(function(i) {
    i[i.Start = 0] = "Start", i[i.Inter = 1] = "Inter", i[i.Final = 2] = "Final", i[i.Single = 3] = "Single"
})(_o || (_o = {}));
var Io;
(function(i) {
    i[i.MtuTooShort = 0] = "MtuTooShort"
})(Io || (Io = {}));
Ye(Ue.DataTracks);
var xo;
(function(i) {
    i[i.Interrupted = 0] = "Interrupted", i[i.UnknownFrame = 1] = "UnknownFrame", i[i.BufferFull = 2] = "BufferFull", i[i.Incomplete = 3] = "Incomplete"
})(xo || (xo = {}));
var Be;
(function(i) {
    i[i.IDLE = 0] = "IDLE", i[i.RUNNING = 1] = "RUNNING", i[i.SKIPPED = 2] = "SKIPPED", i[i.SUCCESS = 3] = "SUCCESS", i[i.FAILED = 4] = "FAILED"
})(Be || (Be = {}));
