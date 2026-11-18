function te(i) {
    return "mediaStreamTrack" in i ? {
        trackID: i.sid,
        source: i.source,
        muted: i.isMuted,
        enabled: i.mediaStreamTrack.enabled,
        kind: i.kind,
        streamID: i.mediaStreamID,
        streamTrackID: i.mediaStreamTrack.id
    } : {
        trackID: i.trackSid,
        enabled: i.isEnabled,
        muted: i.isMuted,
        trackInfo: Object.assign({
            mimeType: i.mimeType,
            name: i.trackName,
            encrypted: i.isEncrypted,
            kind: i.kind,
            source: i.source
        }, i.track ? te(i.track) : {})
    }
}

