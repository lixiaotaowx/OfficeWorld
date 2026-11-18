class ps extends nt {
    get isUpstreamPaused() {
        var e;
        return (e = this.track) === null || e === void 0 ? void 0 : e.isUpstreamPaused
    }
    constructor(e, t, n, s) {
        super(e, t.sid, t.name, s), this.track = void 0, this.handleTrackEnded = () => {
            this.emit(B.Ended)
        }, this.handleCpuConstrained = () => {
            this.track && Ct(this.track) && this.emit(B.CpuConstrained, this.track)
        }, this.updateInfo(t), this.setTrack(n)
    }
    setTrack(e) {
        this.track && (this.track.off(B.Ended, this.handleTrackEnded), this.track.off(B.CpuConstrained, this.handleCpuConstrained)), super.setTrack(e), e && (e.on(B.Ended, this.handleTrackEnded), e.on(B.CpuConstrained, this.handleCpuConstrained))
    }
    get isMuted() {
        return this.track ? this.track.isMuted : super.isMuted
    }
    get audioTrack() {
        return super.audioTrack
    }
    get videoTrack() {
        return super.videoTrack
    }
    get isLocal() {
        return !0
    }
    mute() {
        return b(this, void 0, void 0, function*() {
            var e;
            return (e = this.track) === null || e === void 0 ? void 0 : e.mute()
        })
    }
    unmute() {
        return b(this, void 0, void 0, function*() {
            var e;
            return (e = this.track) === null || e === void 0 ? void 0 : e.unmute()
        })
    }
    pauseUpstream() {
        return b(this, void 0, void 0, function*() {
            var e;
            yield(e = this.track) === null || e === void 0 ? void 0 : e.pauseUpstream()
        })
    }
    resumeUpstream() {
        return b(this, void 0, void 0, function*() {
            var e;
            yield(e = this.track) === null || e === void 0 ? void 0 : e.resumeUpstream()
        })
    }
    getTrackFeatures() {
        var e;
        if (Qe(this.track)) {
            const t = this.track.getSourceTrackSettings(),
                n = new Set;
            return t.autoGainControl && n.add(ke.TF_AUTO_GAIN_CONTROL), t.echoCancellation && n.add(ke.TF_ECHO_CANCELLATION), t.noiseSuppression && n.add(ke.TF_NOISE_SUPPRESSION), t.channelCount && t.channelCount > 1 && n.add(ke.TF_STEREO), !((e = this.options) === null || e === void 0) && e.dtx || n.add(ke.TF_NO_DTX), this.track.enhancedNoiseCancellation && n.add(ke.TF_ENHANCED_NOISE_CANCELLATION), Array.from(n.values())
        } else return []
    }
}

