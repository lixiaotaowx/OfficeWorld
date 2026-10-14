import { useState } from 'react';
import MeetingStartForm from './MeetingStartForm';
import type { DockMeetingState } from './dock-meeting-contract';
export default function DockMeetingPanel({ meeting, initialPerson, onClose }: {
  meeting?: DockMeetingState; initialPerson: string; onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [folded, setFolded] = useState(false);
  const [confirm, setConfirm] = useState<'leave' | 'end' | null>(null);
  const candidates = meeting?.candidates || [];
  if (meeting?.active && folded) return <button className="dock-meeting-folded"
    aria-label="展开会议小窗口" title="展开会议" onClick={() => setFolded(false)}>▴</button>;
  return <section className={`dock-meeting-panel${meeting?.active ? ' active' : ''}`} role="dialog" aria-label="发起会议">
    <header><strong>{meeting?.active ? '会议进行中' : '发起会议'}</strong>
      {meeting?.active ? <button onClick={() => setFolded(true)} aria-label="折叠会议小窗口">▾</button> :
        <button onClick={onClose} aria-label="关闭会议小窗口">×</button>}</header>
    {(error || meeting?.error) && <p role="alert">{error || meeting?.error}</p>}
    {meeting?.active ? <><div className="dock-meeting-members" aria-label="会议成员">
      {(meeting.members || []).filter(member => member.status !== 'removed').map(member => {
        const label = { joined: '已加入', invited: '等待加入', declined: '已拒绝', left: '已离开', removed: '已移除' }[member.status];
        return <span key={member.id} className="dock-meeting-member" data-status={member.status}
          title={`${member.name} · ${label}`} aria-label={`${member.name}，${label}`}>
          <span>{member.name}</span><i aria-hidden="true">{member.status === 'joined' ? '✓' : member.status === 'invited' ? '◷' : '−'}</i>
        </span>;
      })}
    </div><div className="dock-meeting-actions">
      <button onClick={() => { void window.officeDock?.action?.('meeting', initialPerson); }}>管理会议与邀请</button>
      <button disabled={meeting.busy} onClick={() => setConfirm('leave')}>离开会议</button>
      <button disabled={meeting.busy || !meeting.host} title={meeting.host ? '结束所有人的会议' : '仅主持人可结束会议'}
        onClick={() => setConfirm('end')}>结束会议</button>
    </div>{confirm && <div role="alert" className="dock-meeting-confirm">
      <p>{confirm === 'end' ? '结束后所有人都会退出，确定结束？' : '确定离开当前会议？'}</p>
      <button disabled={meeting.busy} onClick={() => setConfirm(null)}>取消</button>
      <button disabled={meeting.busy} onClick={() => {
        void window.officeDock?.action?.(confirm === 'end' ? 'meeting-end' : 'meeting-leave', meeting.id || '')
          ?.catch(() => setError('操作失败，请重试。'));
        setConfirm(null);
      }}>确认{confirm === 'end' ? '结束' : '离开'}</button>
    </div>}</> : <MeetingStartForm
      candidates={candidates} busy={meeting?.busy === true}
      initialSelected={candidates.filter(row => row.personId === initialPerson).map(row => row.id)}
      onCreate={value => {
        setError('');
        void window.officeDock?.action?.('meeting-create', initialPerson, value)
          ?.catch(() => setError('无法发起会议，请更新客户端或返回主窗口重试。'));
      }} />}
  </section>;
}
