// The desktop annotation layer: the transparent overlay the Electron app paints onto the
// screen it is sharing.
//
// Everything that talks to that layer lives here, so `useOffice` only has to wire the
// socket and hand out the board actions. Drawing itself never happens in this file: a
// stroke is relayed to the sharer, painted on the sharer's own screen, and comes back to
// everybody inside the shared picture. That is also why a browser sharer can never be
// annotated — there is no layer out there to paint on (`person.annotate` says which
// clients have one, and the call panel only offers the tools for those).
import type { Socket } from 'socket.io-client';

export interface AnnotationChannelOptions {
  /** The live socket, so a finished share can clear its board for everybody. */
  socket: { current: Socket | null | undefined };
  /** Say why the layer could not be shown. */
  notify: (message: string) => void;
  /** Whether this client is the one sharing a screen right now. */
  sharingScreen: () => boolean;
}

/** The Electron overlay bridge, when this build has one. */
function layer() {
  return window.officeDesktop?.annotations;
}

export function createAnnotationChannel({ socket, notify, sharingScreen }: AnnotationChannelOptions) {
  let ready = false;
  let stroke: { scope: string; id: string } | null = null;
  let sequence = 0;

  const channel = {
    /** Show the desktop layer over the shared display (Electron app only). */
    attach() {
      const bridge = layer();
      if (!bridge || ready) return;
      ready = true;
      void bridge.attach().then((result) => {
        if (result && result.ok === false) notify(result.reason === 'window-share'
          ? '当前共享的是一个窗口，标注只显示在共享画面上。'
          : '这台设备无法在桌面上显示标注层。');
      }).catch(() => { ready = false; });
    },
    detach() {
      ready = false;
      // Wipe the layer's canvas before hiding it: a stale board would otherwise be
      // shown again the next time a share starts.
      void layer()?.clear().catch(() => undefined);
      void layer()?.detach().catch(() => undefined);
    },
    /**
     * Marks belong to one shared screen, so they must not survive the share: a meeting
     * reuses its room name, and the next share there would otherwise start with the
     * previous person's strokes still on it.
     */
    clearShareMarks(scopes: string[]) {
      if (scopes.length && socket.current?.connected)
        for (const scope of scopes) socket.current.emit('annotate-clear', { scope });
      channel.detach();
    },
    /** Mirror one relayed message onto the layer: the sharer's own screen only. */
    mirror(message: Record<string, unknown>) {
      if (!layer() || !sharingScreen()) return;
      channel.attach();
      void layer()?.draw(message).catch(() => undefined);
    },
    /** An undo travels straight to the layer, like the relayed strokes do. */
    undoOnLayer(id?: string) {
      void layer()?.draw({ type: 'undo', id }).catch(() => undefined);
    },
    /** Board actions for one shared screen. The server relays to the other peers only. */
    draw(scope: string, points: [number, number][], done = false) {
      const active = socket.current;
      if (!active?.connected) return;
      // A release that carries no new points still has to go out. Dropping it left the
      // stroke id in place, so the NEXT stroke reused it and the sharer's overlay joined
      // the two with a straight line (user, 2026-09-15). Only "no points and not a
      // release" is empty.
      if (!points.length && !done) return;
      if (!stroke || stroke.scope !== scope) stroke = { scope, id: `st${(sequence += 1)}` };
      active.emit('annotate', { scope, stroke: stroke.id, points, done });
      if (done) stroke = null;
    },
    clear(scope: string) {
      socket.current?.emit('annotate-clear', { scope });
      void layer()?.clear().catch(() => undefined);
    },
    undo(scope: string) {
      socket.current?.emit('annotate-undo', { scope });
    },
  };
  return channel;
}
