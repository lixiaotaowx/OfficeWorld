class Ut extends Tt {
    constructor(e) {
        super(18, e), this.name = "SignalReconnectError"
    }
}
var zi;
(function(i) {
    i.PermissionDenied = "PermissionDenied", i.NotFound = "NotFound", i.DeviceInUse = "DeviceInUse", i.Other = "Other"
})(zi || (zi = {}));
(function(i) {
    function e(t) {
        if (t && "name" in t) return t.name === "NotFoundError" || t.name === "DevicesNotFoundError" ? i.NotFound : t.name === "NotAllowedError" || t.name === "PermissionDeniedError" ? i.PermissionDenied : t.name === "NotReadableError" || t.name === "TrackStartError" ? i.DeviceInUse : i.Other
    }
    i.getFailure = e
})(zi || (zi = {}));
