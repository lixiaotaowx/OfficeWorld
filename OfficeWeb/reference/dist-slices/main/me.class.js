class me extends Error {
    constructor(e, t, n) {
        super(t), this.code = e, this.message = go(t, me.MAX_MESSAGE_BYTES), this.data = n ? go(n, me.MAX_DATA_BYTES) : void 0
    }
    static fromProto(e) {
        return new me(e.code, e.message, e.data)
    }
    toProto() {
        return new ya({
            code: this.code,
            message: this.message,
            data: this.data
        })
    }
    static builtIn(e, t) {
        return new me(me.ErrorCode[e], me.ErrorMessage[e], t)
    }
}
me.MAX_MESSAGE_BYTES = 256;
me.MAX_DATA_BYTES = 15360;
me.ErrorCode = {
    APPLICATION_ERROR: 1500,
    CONNECTION_TIMEOUT: 1501,
    RESPONSE_TIMEOUT: 1502,
    RECIPIENT_DISCONNECTED: 1503,
    RESPONSE_PAYLOAD_TOO_LARGE: 1504,
    SEND_FAILED: 1505,
    UNSUPPORTED_METHOD: 1400,
    RECIPIENT_NOT_FOUND: 1401,
    REQUEST_PAYLOAD_TOO_LARGE: 1402,
    UNSUPPORTED_SERVER: 1403,
    UNSUPPORTED_VERSION: 1404
};
me.ErrorMessage = {
    APPLICATION_ERROR: "Application error in method handler",
    CONNECTION_TIMEOUT: "Connection timeout",
    RESPONSE_TIMEOUT: "Response timeout",
    RECIPIENT_DISCONNECTED: "Recipient disconnected",
    RESPONSE_PAYLOAD_TOO_LARGE: "Response payload too large",
    SEND_FAILED: "Failed to send",
    UNSUPPORTED_METHOD: "Method not supported at destination",
    RECIPIENT_NOT_FOUND: "Recipient not found",
    REQUEST_PAYLOAD_TOO_LARGE: "Request payload too large",
    UNSUPPORTED_SERVER: "RPC not supported by server",
    UNSUPPORTED_VERSION: "Unsupported RPC version"
};
