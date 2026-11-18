class se {
    static fetchRegionSettings(e, t, n) {
        return b(this, void 0, void 0, function*() {
            const s = yield se.fetchLock.lock();
            try {
                const r = yield fetch("".concat(Xm(e), "/regions"), {
                    headers: {
                        authorization: "Bearer ".concat(t)
                    },
                    signal: n
                });
                if (r.ok) {
                    const a = km(r.headers),
                        o = a ? a * 1e3 : Mc;
                    return {
                        regionSettings: yield r.json(),
                        updatedAtInMs: Date.now(),
                        maxAgeInMs: o
                    }
                } else throw r.status === 401 ? $.notAllowed("Could not fetch region settings: ".concat(r.statusText), r.status) : $.internal("Could not fetch region settings: ".concat(r.statusText))
            } catch (r) {
                throw r instanceof $ ? r : n != null && n.aborted ? $.cancelled("Region fetching was aborted") : $.serverUnreachable("Could not fetch region settings, ".concat(r instanceof Error ? "".concat(r.name, ": ").concat(r.message) : r))
            } finally {
                s()
            }
        })
    }
    static scheduleRefetch(e, t, n) {
        return b(this, void 0, void 0, function*() {
            const s = se.settingsTimeouts.get(e.hostname);
            clearTimeout(s), se.settingsTimeouts.set(e.hostname, setTimeout(() => b(this, void 0, void 0, function*() {
                try {
                    const r = yield se.fetchRegionSettings(e, t);
                    se.updateCachedRegionSettings(e, t, r)
                } catch (r) {
                    if (r instanceof $ && r.reason === ce.NotAllowed) {
                        X.debug("token is not valid, cancelling auto region refresh");
                        return
                    }
                    X.debug("auto refetching of region settings failed", {
                        error: r
                    }), se.scheduleRefetch(e, t, n)
                }
            }), n))
        })
    }
    static updateCachedRegionSettings(e, t, n) {
        se.cache.set(e.hostname, n), se.scheduleRefetch(e, t, n.maxAgeInMs)
    }
    static stopRefetch(e) {
        const t = se.settingsTimeouts.get(e);
        t && (clearTimeout(t), se.settingsTimeouts.delete(e))
    }
    static scheduleCleanup(e) {
        let t = se.connectionTrackers.get(e);
        t && (t.cleanupTimeout && clearTimeout(t.cleanupTimeout), t.cleanupTimeout = setTimeout(() => {
            const n = se.connectionTrackers.get(e);
            n && n.connectionCount === 0 && (X.debug("stopping region refetch after disconnect delay", {
                hostname: e
            }), se.stopRefetch(e)), n && (n.cleanupTimeout = void 0)
        }, Ym))
    }
    static cancelCleanup(e) {
        const t = se.connectionTrackers.get(e);
        t != null && t.cleanupTimeout && (clearTimeout(t.cleanupTimeout), t.cleanupTimeout = void 0)
    }
    notifyConnected() {
        const e = this.serverUrl.hostname;
        let t = se.connectionTrackers.get(e);
        t || (t = {
            connectionCount: 0
        }, se.connectionTrackers.set(e, t)), t.connectionCount++, se.cancelCleanup(e)
    }
    notifyDisconnected() {
        const e = this.serverUrl.hostname,
            t = se.connectionTrackers.get(e);
        t && (t.connectionCount = Math.max(0, t.connectionCount - 1), t.connectionCount === 0 && se.scheduleCleanup(e))
    }
    constructor(e, t) {
        this.attemptedRegions = [], this.serverUrl = new URL(e), this.token = t
    }
    updateToken(e) {
        this.token = e
    }
    isCloud() {
        return zt(this.serverUrl)
    }
    getServerUrl() {
        return this.serverUrl
    }
    fetchRegionSettings(e) {
        return b(this, void 0, void 0, function*() {
            return se.fetchRegionSettings(this.serverUrl, this.token, e)
        })
    }
    getNextBestRegionUrl(e) {
        return b(this, void 0, void 0, function*() {
            if (!this.isCloud()) throw Error("region availability is only supported for LiveKit Cloud domains");
            let t = se.cache.get(this.serverUrl.hostname);
            (!t || Date.now() - t.updatedAtInMs > t.maxAgeInMs) && (t = yield this.fetchRegionSettings(e), se.updateCachedRegionSettings(this.serverUrl, this.token, t));
            const n = t.regionSettings.regions.filter(s => !this.attemptedRegions.find(r => r.url === s.url));
            if (n.length > 0) {
                const s = n[0];
                return this.attemptedRegions.push(s), X.debug("next region: ".concat(s.region)), s.url
            } else return null
        })
    }
    resetAttempts() {
        this.attemptedRegions = []
    }
    setServerReportedRegions(e) {
        se.updateCachedRegionSettings(this.serverUrl, this.token, e)
    }
}
se.cache = new Map;
se.settingsTimeouts = new Map;
se.connectionTrackers = new Map;
se.fetchLock = new _e;

