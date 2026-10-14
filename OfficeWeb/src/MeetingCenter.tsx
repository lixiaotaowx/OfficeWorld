import MeetingStartForm from './MeetingStartForm';
import { useEffect, useState } from 'react';
import type { Person } from './types';
import type { useMeetings } from './useMeetings';
import './meetings.css';
import { MicIcon, MicOffIcon, ScreenIcon, HangupIcon, MembersIcon, CloseIcon } from './icons';
import SharingPreview, { SharingVideo } from './SharingPreview';
import ScreenStage from './ScreenStage';
import { colorFor } from './annotations';

type Client = ReturnType<typeof useMeetings>;
/** 画布上的三个动作；和私聊走的是同一条通道（annotationChannel）。 */
export interface MeetingAnnotation {
  draw: (scope: string, points: [number, number][], done: boolean) => void;
  clear: (scope: string) => void;
  undo: (scope: string) => void;
}
export default function MeetingCenter({ client, people, accountId, open, onClose, onOpen, videos, annotation }: {
  client: Client; people: Person[]; accountId: string; open: boolean;
  onClose: () => void; onOpen: () => void; videos: Record<string, MediaStream>;
  annotation: MeetingAnnotation;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [microphone, setMicrophone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<'leave' | 'end' | null>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, onClose]);
  const active = client.active;
  const localStream = active ? videos[`${active.room}:local`] : undefined;
  const host = active?.host === accountId;
  const pendingInvitation = client.invitations.some(m => m.members.some(p => p.id === accountId && p.status === 'invited'));
  const remoteStreams = active ? Object.entries(videos).filter(([key]) => key.startsWith(active.room + ':') && key !== `${active.room}:local`) : [];
  const candidates = people.filter(p => p.clientId !== accountId &&
    p.clientId !== active?.host &&
    !active?.members.some(m => m.id === p.clientId && ['joined', 'invited'].includes(m.status)));
  async function run(task: () => Promise<unknown>) {
    setBusy(true); setError('');
    try { await task(); setSelected([]); setConfirm(null); }
    catch (e) { setError(e instanceof Error ? e.message : '操作失败，请重试'); }
    finally { setBusy(false); }
  }
  const labels = { invited: '待回应', joined: '已入会', declined: '已拒绝', left: '已离开', removed: '已移出' };
  const invitePicker = <fieldset className="meeting-invite-picker" disabled={busy}>
    <legend>选择邀请成员</legend>
    {!candidates.length && <p>目前没有其他可邀请的在线同事。可以先创建会议，稍后邀请。</p>}
    {candidates.map(p => <label key={p.clientId}>
      <input type="checkbox" checked={selected.includes(p.clientId)} onChange={e => setSelected(old =>
        e.target.checked ? [...old, p.clientId] : old.filter(id => id !== p.clientId))} />
      {p.name}
    </label>)}
  </fieldset>;
  return <>
    {!open && active && <aside className="meeting-presence" aria-label="持续会议状态">
      <div><strong><MembersIcon />会议进行中</strong><small>{active.title} · {client.status}</small></div>
      <span>麦克风：{client.mic ? '开启' : '关闭'} · 屏幕：{client.sharing ? '共享中' : '未共享'}</span>
      <button onClick={onOpen}><MembersIcon />返回会议</button>
      <button disabled={busy} onClick={() => void run(client.toggleMic)}>{client.mic ? <MicIcon /> : <MicOffIcon />}{client.mic ? '静音' : '开启麦克风'}</button>
      <button onClick={() => { setConfirm('leave'); onOpen(); }}><HangupIcon />退出会议</button>
    </aside>}
    {!open && remoteStreams.length > 0 && <button className="meeting-notification" onClick={onOpen}>会议中有人正在共享屏幕 · 点击观看</button>}
    {!open && localStream && <SharingPreview stream={localStream} meeting onOpen={onOpen}
      scope={active?.room} onClear={annotation.clear}
      onStop={() => void run(client.stopShare)} />}
    {!open && client.invitations.some(m => m.members.find(p => p.id === accountId)?.status === 'invited') &&
      <button className="meeting-notification" onClick={onOpen}>收到会议邀请 · 查看</button>}
    {open && <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="modal meeting-center" role="dialog" aria-modal="true" aria-label="会议中心">
        <div className="meeting-heading"><div><small>MEETING ROOM</small><h2>{active?.title || '会议中心'}</h2></div>
          <button onClick={onClose} aria-label="收起会议面板"><CloseIcon /></button></div>
        {error && <p className="meeting-error" role="alert">{error}</p>}
        {active ? <>
          <p className="meeting-meta">会议号 {active.code} · {host ? '我是主持人' : '参会成员'} · {client.status}</p>
          <div className="meeting-member-list">
            {active.members.map(m => <div key={m.id}><span>{m.name}{m.id === active.host ? ' · 主持人' : ''}</span>
              <small>{m.online ? labels[m.status] : '暂时离线'}</small>
              {host && m.id !== accountId && m.status === 'joined' &&
                <button disabled={busy} onClick={() => void run(() => client.act({ action: 'remove', id: active.id, target: m.id }))}>移出</button>}
            </div>)}
          </div>
          {localStream && <figure className="meeting-local-preview">
            <figcaption>正在共享到会议 · 我的屏幕</figcaption>
            <SharingVideo stream={localStream} label="我正在共享的屏幕" />
          </figure>}
          {/* 会议的共享画面和私聊用同一个画布：能最大化/全屏放大看，也能标注
              （用户 2026-09-22：「视频会议的屏幕分享和私人要保持一样，可以放大观看
              可以标记，目前没有」）。键的后缀是共享者（LiveKit identity = socket id），
              所以查得到他的名字、也能判断他的客户端能不能显示标注。 */}
          <div className="meeting-streams">{remoteStreams.map(([key, stream]) => {
            const sharer = people.find(p => p.id === key.slice(active.room.length + 1));
            const canAnnotate = sharer?.annotate === true;
            return <ScreenStage key={key} stream={stream} scope={active.room}
              label={`${sharer?.name || '同事'}的共享屏幕`}
              selfColor={colorFor(accountId)}
              annotatable={canAnnotate}
              onDraw={annotation.draw} onClear={annotation.clear} onUndo={annotation.undo}
              hint={canAnnotate ? '可点「标注」，笔迹会画在对方的共享屏幕上' : undefined} />;
          })}</div>
          <div className="meeting-controls">
            <button disabled={busy} onClick={() => void run(client.toggleMic)}>{client.mic ? <MicIcon /> : <MicOffIcon />}{client.mic ? '静音' : '开启麦克风'}</button>
            <button disabled={busy} onClick={() => void run(client.toggleShare)}><ScreenIcon />{client.sharing ? '停止会议共享' : '共享屏幕到会议'}</button>
            <button disabled={busy} onClick={() => setConfirm('leave')}><HangupIcon />离开会议</button>
            {host && <button className="danger" disabled={busy} onClick={() => setConfirm('end')}><HangupIcon />结束会议</button>}
          </div>
          {confirm && <div className="meeting-confirm" role="alert">
            <p>{confirm === 'end' ? '结束后所有人都会退出，邀请也会失效。确定结束？' :
              host ? '离开后主持人会交给下一位参会者；没有其他人时会议将结束。' : '确定离开？会议未结束时，你可以从会议列表再次加入。'}</p>
            <button disabled={busy} onClick={() => setConfirm(null)}>取消</button>
            <button disabled={busy} onClick={() => void run(() => client.act({ action: confirm, id: active.id }))}>确认{confirm === 'end' ? '结束' : '离开'}</button>
          </div>}
          {host && <details><summary>邀请更多同事</summary>{invitePicker}
            <button disabled={busy || !selected.length} onClick={() => void run(() => client.act({ action: 'invite', id: active.id, invitees: selected }))}>发送邀请（{selected.length}）</button>
          </details>}
        </> : pendingInvitation ? <p>你收到了一份会议邀请，请在下方接受或拒绝。</p> : <MeetingStartForm candidates={candidates.map(p => ({ id: p.clientId, name: p.name }))}
          busy={busy} onMicrophoneChange={setMicrophone}
          onCreate={value => void run(() => client.act({ action: 'create', ...value }))} />}
        {client.invitations.length > 0 && <section className="meeting-invitations"><h3>邀请与可返回的会议</h3>
          {client.invitations.map(m => <article key={m.id}>
            <strong>{m.title}</strong><p>{m.members.find(p => p.id === m.host)?.name} 发起 · 会议号 {m.code}</p>
            <button disabled={busy || !!active} onClick={() => void run(() => client.act({ action: 'accept', id: m.id, microphone }))}>接受并加入</button>
            {m.members.find(p => p.id === accountId)?.status === 'invited' &&
              <button disabled={busy} onClick={() => void run(() => client.act({ action: 'decline', id: m.id }))}>拒绝邀请</button>}
            {active && <small>请先离开当前会议再加入</small>}
          </article>)}
        </section>}
      </section>
    </div>}
  </>;
}
