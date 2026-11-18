class $ extends Bs {
    constructor(e, t, n, s) {
        super(1, e), this.name = "ConnectionError", this.status = n, this.reason = t, this.context = s, this.reasonName = ce[t]
    }
    static notAllowed(e, t, n) {
        return new $(e, ce.NotAllowed, t, n)
    }
    static timeout(e) {
        return new $(e, ce.Timeout)
    }
    static leaveRequest(e, t) {
        return new $(e, ce.LeaveRequest, void 0, t)
    }
    static internal(e, t) {
        return new $(e, ce.InternalError, void 0, t)
    }
    static cancelled(e) {
        return new $(e, ce.Cancelled)
    }
    static serverUnreachable(e, t) {
        return new $(e, ce.ServerUnreachable, t)
    }
    static websocket(e, t, n) {
        return new $(e, ce.WebSocket, t, n)
    }
    static serviceNotFound(e, t) {
        return new $(e, ce.ServiceNotFound, void 0, t)
    }
}
