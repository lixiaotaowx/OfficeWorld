import { useRef, useState } from 'react';
import type { Person } from './types';
import type { useMeetings } from './useMeetings';
import type { DockCommand } from './desktop';
import type { DockMeetingState } from './dock-meeting-contract';
import { useDockMeetingVideo } from './useDockMeetingVideo';

export function useDockMeetings(client: ReturnType<typeof useMeetings>, videos: Record<string, MediaStream>,
  people: Person[], myId: string | undefined, accountId: string, onOpen: () => void,
  onView: (id: string, fullscreen: boolean) => void) {
  const executing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const streams: Record<string, MediaStream> = {};
  if (client.active) for (const [key, stream] of Object.entries(videos)) {
    if (!key.startsWith(client.active.room + ':') || !stream.getVideoTracks().some(track => track.readyState === 'live')) continue;
    const id = key.slice(client.active.room.length + 1) === 'local' ? myId : key.slice(client.active.room.length + 1);
    if (id) streams[id] = stream;
  }
  useDockMeetingVideo(streams);
  const state: DockMeetingState = {
    active: !!client.active, title: client.active?.title || '', mic: client.mic,
    id: client.active?.id, host: client.active?.host === accountId,
    members: client.active?.members.map(({ id, name, status }) => ({ id, name, status })) || [],
    invitations: client.invitations.filter(invitation => invitation.id !== client.active?.id &&
      invitation.members.some(member => member.id === accountId && member.status === 'invited'))
      .map(invitation => ({ id: invitation.id,
        personId: people.find(person => person.clientId === invitation.host)?.id || invitation.host,
        name: invitation.members.find(member => member.id === invitation.host)?.name || '同事' })),
    sharing: client.sharing, busy, error,
    candidates: people.filter(person => person.clientId !== accountId).map(person => ({
      id: person.clientId, personId: person.id, name: person.name,
    })),
    screens: Object.keys(streams).map(id => ({ id, streamId: streams[id].id, name: people.find(person => person.id === id)?.name || '同事' })),
  };
  const command = (value: DockCommand) => {
    if (!value.kind.startsWith('meeting')) return false;
    if (value.kind === 'meeting' || value.kind === 'meeting-view' || value.kind === 'meeting-fullscreen') {
      if (value.kind !== 'meeting' && streams[value.personId]) onView(value.personId, value.kind === 'meeting-fullscreen');
      else onOpen();
      return true;
    }
    if (executing.current) return true;
    executing.current = true;
    setBusy(true); setError('');
    const run = async () => {
      if (value.kind === 'meeting-create' && value.meeting && !client.active) {
        const allowed = new Set(state.candidates.map(person => person.id));
        await client.act({ action: 'create', ...value.meeting,
          invitees: value.meeting.invitees.filter(id => allowed.has(id)) });
      } else if (client.active && value.kind === 'meeting-mute') await client.toggleMic();
      else if (client.active && value.kind === 'meeting-share') await client.toggleShare();
      else if (client.active && value.personId === client.active.id && value.kind === 'meeting-leave')
        await client.act({ action: 'leave', id: client.active.id });
      else if (client.active && value.personId === client.active.id && value.kind === 'meeting-end') {
        if (!state.host) throw Error('只有主持人可以结束会议');
        await client.act({ action: 'end', id: client.active.id });
      } else if (state.invitations?.some(invitation => invitation.id === value.personId)) {
        if (value.kind === 'meeting-accept') {
          if (client.active) throw Error('请先离开当前会议再接听');
          await client.act({ action: 'accept', id: value.personId, microphone: false });
        } else if (value.kind === 'meeting-decline') await client.act({ action: 'decline', id: value.personId });
      }
    };
    void run().catch(e => setError(e instanceof Error ? e.message : '会议操作失败，请重试'))
      .finally(() => { executing.current = false; setBusy(false); });
    return true;
  };
  return { state, command, streams };
}
