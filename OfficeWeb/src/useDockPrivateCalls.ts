import { useRef, useState } from 'react';
import type { useOffice } from './useOffice';
import type { DockCommand } from './desktop';
import type { DockPrivateState } from './dock-private-contract';

type Client = Pick<ReturnType<typeof useOffice>, 'requests' | 'sessions' | 'people' | 'callStates' |
  'connected' | 'meetings' | 'respond' | 'shareInCall' | 'stopShare' | 'mute'>;

/** All media and signaling stay in the main window's existing private-call commands. */
export function useDockPrivateCalls(client: Client) {
  const executing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const state: DockPrivateState = {
    invitations: client.connected ? client.requests.map(row => ({ id: row.id, personId: row.from,
      name: row.name, kind: row.kind, offer: row.offer === true })) : [],
    sessions: client.sessions.filter(row => row.kind !== 'meeting').map(row => ({
      id: row.id, name: client.people.find(person => person.id === row.peer)?.name || '对方',
      connected: client.connected && client.callStates[row.id]?.connected === true,
      mic: client.callStates[row.id]?.voice === '已开启',
      sharing: client.callStates[row.id]?.sharing === true,
    })), busy, error,
  };
  const run = (operation: () => Promise<unknown>) => {
    if (executing.current) return;
    executing.current = true; setBusy(true); setError('');
    void operation().catch(e => setError(e instanceof Error ? e.message : '通话操作失败，请重试'))
      .finally(() => { executing.current = false; setBusy(false); });
  };
  const command = (value: DockCommand) => {
    if (value.kind !== 'private-share' && value.kind !== 'private-mute') return false;
    const session = state.sessions.find(row => row.id === value.personId);
    if (!session?.connected || client.meetings.active) return true;
    run(async () => {
      if (value.kind === 'private-mute') {
        if (await client.mute(session.id) === false) throw Error('麦克风切换失败，请检查权限或设备');
      } else if (session.sharing) client.stopShare();
      else if (await client.shareInCall(session.id) === false) throw Error('未开始共享，请重新选择屏幕');
    });
    return true;
  };
  const answer = (id: string, accept: boolean) => {
    if (!state.invitations.some(row => row.id === id)) return;
    run(() => client.respond(id, accept));
  };
  return { state, command, answer };
}
