import { useState } from 'react';
import type { DockMeetingCreate } from './dock-meeting-contract';

/** Shared by the meeting center and the taskbar's small meeting window. */
export default function MeetingStartForm({ candidates, initialSelected = [], busy, onCreate, onMicrophoneChange }: {
  candidates: { id: string; name: string }[];
  initialSelected?: string[];
  busy: boolean;
  onCreate: (value: DockMeetingCreate) => void;
  onMicrophoneChange?: (value: boolean) => void;
}) {
  const [title, setTitle] = useState('办公室讨论');
  const [selected, setSelected] = useState(initialSelected);
  const [microphone, setMicrophone] = useState(false);
  const invitees = selected.filter(id => candidates.some(person => person.id === id));
  return <form onSubmit={event => {
    event.preventDefault();
    if (!busy && title.trim()) onCreate({ title: title.trim(), invitees, microphone });
  }}>
    <label className="meeting-title">会议主题
      <input value={title} onChange={event => setTitle(event.target.value)} maxLength={60} required disabled={busy} />
    </label>
    <fieldset className="meeting-invite-picker" disabled={busy}>
      <legend>选择邀请成员</legend>
      {!candidates.length && <p>目前没有其他可邀请的在线同事，可以先创建会议。</p>}
      {candidates.map(person => <label key={person.id}>
        <input type="checkbox" checked={invitees.includes(person.id)} onChange={event => setSelected(old =>
          event.target.checked ? [...old, person.id] : old.filter(id => id !== person.id))} />{person.name}
      </label>)}
    </fieldset>
    <label className="meeting-mic"><input type="checkbox" disabled={busy} checked={microphone} onChange={event => {
      setMicrophone(event.target.checked); onMicrophoneChange?.(event.target.checked);
    }} /> 入会时开启麦克风</label>
    <p className="meeting-meta">默认静音加入，开启麦克风时请求授权。</p>
    <button type="submit" className="primary" disabled={busy || !title.trim()}>
      {busy ? '处理中…' : '创建会议并发送邀请'}
    </button>
  </form>;
}
