// socket state sync + accumulators.
// Recovered verbatim from the production bundle; bindings renamed to semantic names.
function disposeSocketHooks(n) {
  if (typeof n == "string") return "login";
  switch (n == null ? void 0 : n.code) {
    case "login-rotated":
      return "reconnect";
    case "session-expired":
      return "recover-once";
    case "signed-in-elsewhere":
      return "login";
    default:
      return "ignore";
  }
}
function sameCursorPayload(n, e) {
  return typeof n == "string" ? n || e : (n == null ? void 0 : n.message) || e;
}
const Sn = 256 * 1024,
  An = 32 * 1024,
  Xe = (n, e) => n === e || JSON.stringify(n) === JSON.stringify(e);
function createDeskBookings(n, e) {
  const t = {};
  for (const s of Object.keys(e)) Xe(n[s], e[s]) || (t[s] = e[s]);
  return t;
}
function sameDeskBookings(n, e) {
  const t = {};
  for (const s of new Set([...Object.keys(n), ...Object.keys(e)])) n[s] !== e[s] && (t[s] = e[s] ?? null);
  return t;
}
function sameBuildState(n, e) {
  const t = {};
  for (const s of new Set([...Object.keys(n), ...Object.keys(e)])) Xe(n[s], e[s]) || (t[s] = e[s] ?? null);
  return t;
}
function sameCatState(n, e) {
  const t = new Map(n.map(o => [o.id, o])),
    s = new Map(e.map(o => [o.id, o])),
    r = e.filter(o => !t.has(o.id) || t.get(o.id) !== o),
    i = n.filter(o => !s.has(o.id)).map(o => o.id);
  return {
    upserts: r,
    removed: i
  };
}
function createCatFeeder(n, e, t) {
  const s = JSON.stringify(t);
  if (new TextEncoder().encode(s).length <= Sn) return [{
    kind: "full",
    epoch: n,
    seq: e,
    snapshot: t
  }];
  const r = sameScreenList(s, An);
  return r.map((i, o) => ({
    kind: "full-chunk",
    epoch: n,
    seq: e,
    index: o,
    total: r.length,
    data: i
  }));
}
function sameChatThreads(n) {
  const e = [...n].sort((t, s) => t.index - s.index);
  return JSON.parse(e.map(t => t.data).join(""));
}
function sameScreenList(n, e) {
  const t = [];
  for (let s = 0; s < n.length;) {
    let r = Math.min(s + e, n.length);
    const i = n.charCodeAt(r - 1);
    r < n.length && i >= 55296 && i <= 56319 && (r -= 1), t.push(n.slice(s, r)), s = r;
  }
  return t;
}
class StateAccumulator {
  epoch = 0;
  seq = {
    state: 0,
    preview: 0,
    motion: 0,
    chat: 0,
    full: 0,
    "full-chunk": 0
  };
  base = null;
  previews = {};
  motions = {};
  messages = [];
  chunks = null;
  snapshot = null;
  listeners = new Set();

  getSnapshot = () => this.snapshot;
  subscribe = listener => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  ingest(e) {
    if (e.epoch < this.epoch) return !1;
    if (e.epoch > this.epoch) {
      const s = this.snapshot !== null;
      if (this.reset(e.epoch), s) for (const r of this.listeners) r();
    }
    if (e.kind === "full-chunk") return this.ingestChunk(e);
    if (e.seq <= this.seq[e.kind]) return !1;
    this.seq[e.kind] = e.seq;
    let t = !0;
    switch (e.kind) {
      case "full":
        try {
          this.applyFull(e.snapshot);
        } catch {
          return this.seq.full = 0, !1;
        }
        this.markSeq(e.seq);
        break;
      case "state":
        if (!this.base) return !1;
        if (!Object.keys(e.patch).length) {
          t = !1;
          break;
        }
        this.base = {
          ...this.base,
          ...e.patch
        };
        break;
      case "preview":
        for (const [s, r] of Object.entries(e.batch)) r ? this.previews[s] = r : delete this.previews[s];
        break;
      case "motion":
        for (const [s, r] of Object.entries(e.batch)) r ? this.motions[s] = r : delete this.motions[s];
        break;
      case "chat":
        {
          const s = new Map(this.messages.map(r => [r.id, r]));
          for (const r of e.upserts) s.set(r.id, r);
          for (const r of e.removed || []) s.delete(r);
          this.messages = [...s.values()].sort((r, i) => r.id.localeCompare(i.id));
          break;
        }
    }
    return t && this.rebuild(), !0;
  }
  ingestChunk(e) {
    var s;
    if (e.seq <= this.seq.full || ((((s = this.chunks) == null ? void 0 : s.epoch) !== e.epoch || this.chunks.seq !== e.seq) && (this.chunks = {
      epoch: e.epoch,
      seq: e.seq,
      total: e.total,
      parts: new Map()
    }), this.chunks.parts.set(e.index, e.data), this.chunks.parts.size < e.total)) return !1;
    const t = [...this.chunks.parts.entries()].sort(([r], [i]) => r - i).map(([, r]) => ({
      kind: "full-chunk",
      epoch: e.epoch,
      seq: e.seq,
      index: 0,
      total: e.total,
      data: r
    }));
    this.chunks = null;
    try {
      this.applyFull(sameChatThreads(t));
    } catch {
      return !1;
    }
    return this.seq.full = e.seq, this.markSeq(e.seq), this.rebuild(), !0;
  }
  markSeq(e) {
    this.seq = {
      state: e,
      preview: e,
      motion: e,
      chat: e,
      full: e,
      "full-chunk": e
    };
  }
  applyFull(e) {
    const {
        previews: t,
        motions: s,
        ...r
      } = e.presence,
      {
        messages: i,
        ...o
      } = e.chat;
    this.base = {
      ...e,
      presence: r,
      chat: o
    }, this.previews = {
      ...(t || {})
    }, this.motions = {
      ...(s || {})
    }, this.messages = Array.isArray(i) ? [...i] : [];
  }
  reset(e) {
    this.epoch = e, this.seq = {
      state: 0,
      preview: 0,
      motion: 0,
      chat: 0,
      full: 0,
      "full-chunk": 0
    }, this.base = null, this.previews = {}, this.motions = {}, this.messages = [], this.chunks = null, this.snapshot = null;
  }
  rebuild() {
    if (!this.base) {
      this.snapshot = null;
      return;
    }
    this.snapshot = {
      ...this.base,
      presence: {
        ...this.base.presence,
        previews: this.previews,
        motions: this.motions
      },
      chat: {
        ...this.base.chat,
        messages: this.messages
      },
      epoch: this.epoch,
      seq: Math.max(...Object.values(this.seq))
    };
    for (const e of this.listeners) e();
  }
}
const Me = [300, 1e3, 2e3, 5e3];
function createBilliardsPoller(n, e, t = {
  set: (s, r) => setTimeout(s, r),
  clear: s => clearTimeout(s)
}) {
  let s = !0,
    r = 0,
    i,
    o = !1;
  const a = () => {
      i = void 0, !(!s || o) && (o = !0, n.get().then(d => {
        if (s) for (const m of d) e.ingest(m);
      }).catch(() => {}).then(() => {
        if (o = !1, !!s) {
          if (e.getSnapshot()) {
            r = 0;
            return;
          }
          i = t.set(a, Me[Math.min(r++, Me.length - 1)]);
        }
      }));
    },
    f = n.onSnapshot(d => {
      e.ingest(d), !e.getSnapshot() && !o && i === void 0 && a();
    });
  return a(), () => {
    s = !1, t.clear(i), f();
  };
}

export { disposeSocketHooks, sameCursorPayload, createDeskBookings, sameDeskBookings, sameBuildState, sameCatState, createCatFeeder, StateAccumulator, createBilliardsPoller };
