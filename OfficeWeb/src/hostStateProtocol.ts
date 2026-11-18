import type { Appearance } from './look';
import type {
  Message,
  Motion,
  Person,
  Request,
  SeatOwner,
  Session
} from './types';
import { createBilliardsClient, type BilliardsClient as BilliardsClientApi } from './billiardsClient';

/** Everything the hidden host publishes to the views, in one snapshot.
 *  Sections mirror the host-side state; previews and messages stream as
 *  separate channels so a busy office does not re-send the whole world. */
export interface HostViewSnapshot {
  identity: {
    myId: string;
    accountId: string;
    name: string;
    appearance: Appearance | null;
    connected: boolean;
  };
  presence: {
    people: Person[];
    seats: (SeatOwner | null)[];
    previews: Record<string, string>;
    motions: Record<string, Motion>;
    cat: unknown;
    catSpeech: { text: string; at: number; to: string } | null;
    billiards: Record<string, { tableId: string } & Record<string, unknown>>;
  };
  calls: {
    sessions: Session[];
    requests: Request[];
    outgoing: Request[];
    callAlerts: { id: string; kind: 'screen' | 'voice'; name: string; at: number }[];
  };
  chat: {
    messages: Message[];
    contacts: { id: string; name: string }[];
    hiddenContacts: string[];
  };
  meetings: {
    active: { room: string; id: string } | null;
    invitations: { room: string; id: string }[];
    huddles: { id: string; members: string[] }[];
    status: string;
    mic: boolean;
    sharing: boolean;
  };
  media: { previewReason: string; signal: unknown; boardScope?: string };
  desktop: { deskSensorLabel: string; systemIdleSensor: boolean };
  notice: string;
}

export interface HostEnvelope {
  kind: 'full' | 'full-chunk' | 'state' | 'preview' | 'motion' | 'chat';
  epoch: number;
  seq: number;
  snapshot?: HostViewSnapshot;
  patch?: Partial<HostViewSnapshot>;
  batch?: Record<string, unknown>;
  upserts?: Message[];
  removed?: string[];
  index?: number;
  total?: number;
  data?: string;
}

/** View-side store for the host's channel stream. Chunks reassemble full
 *  snapshots; per-channel sequences gate replays; epoch bumps reset state. */
export class HostStateStore {
  private epoch = 0;
  private seq: Record<string, number> = {
    state: 0, preview: 0, motion: 0, chat: 0, full: 0, 'full-chunk': 0,
  };
  private base: (Omit<HostViewSnapshot, 'presence' | 'chat'> & { presence: Omit<HostViewSnapshot['presence'], 'previews' | 'motions'>; chat: Omit<HostViewSnapshot['chat'], 'messages'> }) | null = null;
  private previews: Record<string, string> = {};
  private motions: Record<string, Motion> = {};
  private messages: Message[] = [];
  private chunks: { epoch: number; seq: number; total: number; parts: Map<number, string> } | null = null;
  private snapshot: HostViewSnapshot | null = null;
  private listeners = new Set<() => void>();

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  ingest(envelope: HostEnvelope): boolean {
    if (envelope.epoch < this.epoch) return false;
    if (envelope.epoch > this.epoch) {
      const had = this.snapshot !== null;
      this.reset(envelope.epoch);
      if (had) for (const listener of this.listeners) listener();
    }
    if (envelope.kind === 'full-chunk') return this.ingestChunk(envelope);
    if (envelope.seq <= this.seq[envelope.kind]) return false;
    this.seq[envelope.kind] = envelope.seq;
    let publish = true;
    switch (envelope.kind) {
      case 'full':
        try { this.applyFull(envelope.snapshot!); }
        catch { this.seq.full = 0; return false; }
        this.markSeq(envelope.seq);
        break;
      case 'state':
        if (!this.base) return false;
        if (!Object.keys(envelope.patch ?? {}).length) { publish = false; break; }
        this.base = { ...this.base, ...envelope.patch };
        break;
      case 'preview':
        for (const [id, frame] of Object.entries(envelope.batch ?? {})) {
          if (frame) this.previews[id] = frame as string;
          else delete this.previews[id];
        }
        break;
      case 'motion':
        for (const [id, motion] of Object.entries(envelope.batch ?? {})) {
          if (motion) this.motions[id] = motion as Motion;
          else delete this.motions[id];
        }
        break;
      case 'chat': {
        const merged = new Map(this.messages.map(row => [row.id, row]));
        for (const row of envelope.upserts ?? []) merged.set(row.id, row);
        for (const id of envelope.removed ?? []) merged.delete(id);
        this.messages = [...merged.values()].sort((a, b) => a.id.localeCompare(b.id));
        break;
      }
    }
    if (publish) this.rebuild();
    return true;
  }

  private ingestChunk(envelope: HostEnvelope): boolean {
    const stale = envelope.seq <= this.seq.full
      || this.chunks?.epoch !== envelope.epoch || this.chunks.seq !== envelope.seq;
    if (stale) this.chunks = { epoch: envelope.epoch, seq: envelope.seq, total: envelope.total!, parts: new Map() };
    this.chunks!.parts.set(envelope.index!, envelope.data!);
    if (this.chunks!.parts.size < envelope.total!) return false;
    const ordered = [...this.chunks!.parts.entries()].sort(([a], [b]) => a - b).map(([, data]) => data);
    this.chunks = null;
    try { this.applyFull(JSON.parse(ordered.join('')) as HostViewSnapshot); }
    catch { return false; }
    this.seq.full = envelope.seq;
    this.markSeq(envelope.seq);
    this.rebuild();
    return true;
  }

  private markSeq(seq: number) {
    this.seq = { state: seq, preview: seq, motion: seq, chat: seq, full: seq, 'full-chunk': seq };
  }

  private applyFull(snapshot: HostViewSnapshot) {
    const { previews, motions, ...presence } = snapshot.presence;
    const { messages, ...chat } = snapshot.chat;
    this.base = { ...snapshot, presence, chat } as HostStateStore["base"];
    this.previews = { ...previews };
    this.motions = { ...motions };
    this.messages = Array.isArray(messages) ? [...messages] : [];
  }

  private reset(epoch: number) {
    this.epoch = epoch;
    this.seq = { state: 0, preview: 0, motion: 0, chat: 0, full: 0, 'full-chunk': 0 };
    this.base = null;
    this.previews = {};
    this.motions = {};
    this.messages = [];
    this.chunks = null;
    this.snapshot = null;
  }

  private rebuild() {
    if (!this.base) { this.snapshot = null; return; }
    this.snapshot = {
      ...this.base,
      presence: { ...this.base.presence, previews: this.previews, motions: this.motions },
      chat: { ...this.base.chat, messages: this.messages },
      epoch: this.epoch,
      seq: Math.max(...Object.values(this.seq)),
    } as HostViewSnapshot;
    for (const listener of this.listeners) listener();
  }
}

const BACKOFF_MS = [300, 1000, 2000, 5000];

export interface HostStateSource {
  get(): Promise<HostEnvelope[]>;
  onSnapshot(callback: (envelope: HostEnvelope) => void): () => void;
}

/** Attach a view to the host stream: pull the first snapshot (with backoff
 *  until one arrives), then ingest live envelopes. Returns a disposer. */
export function attachHostView(source: HostStateSource, store: HostStateStore,
  timers: { set: (fn: () => void, ms: number) => unknown; clear: (handle: unknown) => void } = {
    set: (fn, ms) => setTimeout(fn, ms),
    clear: handle => clearTimeout(handle as number),
  }) {
  let live = true;
  let retry = 0;
  let timer: unknown;
  let waiting = false;

  const pull = () => {
    timer = undefined;
    if (!live || waiting) return;
    waiting = true;
    source.get().then(batches => {
      waiting = false;
      if (!live) return;
      for (const envelope of batches) store.ingest(envelope);
      if (!store.getSnapshot()) {
        retry += 1;
        timer = timers.set(pull, BACKOFF_MS[Math.min(retry, BACKOFF_MS.length - 1)]);
      } else retry = 0;
    }).catch(() => {
      waiting = false;
      if (live && !store.getSnapshot()) {
        retry += 1;
        timer = timers.set(pull, BACKOFF_MS[Math.min(retry, BACKOFF_MS.length - 1)]);
      }
    });
  };

  const off = source.onSnapshot(envelope => {
    store.ingest(envelope);
    if (!store.getSnapshot() && !waiting && timer === undefined) pull();
  });
  pull();
  return () => {
    live = false;
    timers.clear(timer);
    off();
  };
}
