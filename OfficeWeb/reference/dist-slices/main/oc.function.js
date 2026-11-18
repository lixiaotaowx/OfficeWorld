function oc(i) {
    if (!(typeof i == "object" && i.RTCPeerConnection)) return;
    const e = i.RTCPeerConnection.prototype.addTransceiver;
    e && (i.RTCPeerConnection.prototype.addTransceiver = function() {
        this.setParametersPromises = [];
        let n = arguments[1] && arguments[1].sendEncodings;
        n === void 0 && (n = []), n = [...n];
        const s = n.length > 0;
        s && n.forEach(a => {
            if ("rid" in a && !/^[a-z0-9]{0,16}$/i.test(a.rid)) throw new TypeError("Invalid RID value provided.");
            if ("scaleResolutionDownBy" in a && !(parseFloat(a.scaleResolutionDownBy) >= 1)) throw new RangeError("scale_resolution_down_by must be >= 1.0");
            if ("maxFramerate" in a && !(parseFloat(a.maxFramerate) >= 0)) throw new RangeError("max_framerate must be >= 0.0")
        });
        const r = e.apply(this, arguments);
        if (s) {
            const {
                sender: a
            } = r, o = a.getParameters();
            (!("encodings" in o) || o.encodings.length === 1 && Object.keys(o.encodings[0]).length === 0) && (o.encodings = n, a.sendEncodings = n, this.setParametersPromises.push(a.setParameters(o).then(() => {
                delete a.sendEncodings
            }).catch(() => {
                delete a.sendEncodings
            })))
        }
        return r
    })
}

