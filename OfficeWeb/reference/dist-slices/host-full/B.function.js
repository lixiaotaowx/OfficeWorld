function B(e) {
    var t;
    return {
        identity: {
            myId: e.myId,
            name: e.name,
            accountId: e.clientId,
            connected: e.connected,
            appearance: (t = e.people.find(s => s.id === e.myId)) == null ? void 0 : t.appearance
        },
        presence: {
            people: e.people,
            seats: e.seats,
            cat: e.cat,
            catSpeech: e.catSpeech,
            billiards: Object.fromEntries(e.billiards.states())
        },
        calls: {
            sessions: e.sessions,
            callStates: e.callStates,
            requests: e.requests,
            outgoing: e.outgoing,
            callAlerts: e.callAlerts,
            muted: e.muted,
            voiceStatus: e.voiceStatus,
            micLive: e.micLive
        },
        meetings: {
            active: e.meetings.active,
            invitations: e.meetings.invitations,
            huddles: e.meetings.huddles || [],
            status: e.meetings.status,
            mic: e.meetings.mic,
            sharing: e.meetings.sharing
        },
        chat: {
            contacts: e.contacts,
            hiddenContacts: e.hiddenContacts
        },
        files: {
            transfers: e.files.rows
        },
        media: {
            sharing: e.sharing,
            previewReason: e.previewReason,
            boardScope: e.boardScope,
            signal: e.signal
        },
        desktop: {
            deskSensorLabel: e.deskSensorLabel,
            systemIdleSensor: e.systemIdleSensor
        },
        notice: e.notice
    }
}

