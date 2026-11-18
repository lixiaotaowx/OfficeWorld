const Em = 10,
    ii = "lk_e2ee",
    Pm = "LKFrameEncryptionKey",
    Rm = {
        sharedKey: !1,
        ratchetSalt: Pm,
        ratchetWindowSize: 8,
        failureTolerance: Em,
        keyringSize: 16
    };
var yt;
(function(i) {
    i.SetKey = "setKey", i.RatchetRequest = "ratchetRequest", i.KeyRatcheted = "keyRatcheted"
})(yt || (yt = {}));
var no;
(function(i) {
    i.KeyRatcheted = "keyRatcheted"
})(no || (no = {}));
var vt;
(function(i) {
    i.ParticipantEncryptionStatusChanged = "participantEncryptionStatusChanged", i.EncryptionError = "encryptionError"
})(vt || (vt = {}));
var so;
(function(i) {
    i.Error = "cryptorError"
})(so || (so = {}));

