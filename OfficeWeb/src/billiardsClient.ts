import type { Socket } from 'socket.io-client';
import type { BilliardsAction, BilliardsState } from '../billiards/table.mjs';

/** View-side client for the pool tables: reads the last state the host
 *  published, subscribes listeners, and forwards actions over the socket. */
export interface BilliardsClient {
  snapshot(tableId: string): BilliardsState | null;
  states(): Map<string, BilliardsState>;
  subscribe(listener: () => void): () => void;
  receive(state: BilliardsState | { removed: string }): void;
  act(tableId: string, command: BilliardsAction): Promise<void>;
}

export function createBilliardsClient(socket: { current: Socket | undefined },
  notify: (message: string) => void): BilliardsClient {
  const tables = new Map<string, BilliardsState>();
  const listeners = new Set<() => void>();
  return {
    snapshot: tableId => tables.get(tableId) || null,
    states: () => tables,
    subscribe: listener => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    receive: state => {
      if ('removed' in state) tables.delete(state.tableId);
      else tables.set(state.tableId, state);
      listeners.forEach(listener => listener());
    },
    async act(tableId: string, command: BilliardsAction) {
      const active = socket.current;
      if (!active?.connected) throw Error('连接已断开，请等重新连接后再试');
      let reply;
      try {
        reply = await active.timeout(6000).emitWithAck('billiards-action', { ...command, tableId });
      } catch {
        active.emit('billiards-sync');
        throw Error('操作没有确认，请等待球桌同步后再试');
      }
      if (!reply?.ok) throw Error(reply?.error || '操作没有完成，请重试');
    },
  };
}
