import type { DockState } from './dockRules';
import { MicIcon, MutedMicIcon, ScreenIcon } from './icons';

/** Meeting and private sessions use the same compact controls and mute indication. */
export default function DockCallControls({ state }: { state: DockState }) {
  const meeting = state.meeting;
  const privateCalls = state.privateCalls;
  const rows = meeting?.active ? [{ id: '', name: meeting.title, mic: meeting.mic,
    sharing: meeting.sharing, connected: true, busy: meeting.busy, meeting: true }] :
    (privateCalls?.sessions || []).map(row => ({ ...row, busy: privateCalls?.busy, meeting: false }));
  return <>{rows.map(row => <div className="dock-meeting-controls" key={row.id || 'meeting'}
    role="group" aria-label={row.meeting ? '会议控制' : `与${row.name}的私人通话`}>
    {rows.length > 1 && <span>{row.name}</span>}
    <button disabled={row.busy || !row.connected} aria-pressed={row.sharing}
      onClick={() => void window.officeDock?.action?.(row.meeting ? 'meeting-share' : 'private-share', row.id)}>
      <ScreenIcon />{row.sharing ? '停止共享' : '屏幕分享'}</button>
    <button disabled={row.busy || !row.connected} aria-pressed={!row.mic} className="dock-meeting-mic"
      aria-label={row.mic ? '麦克风已开启，点击静音' : '麦克风已静音，点击开启'}
      title={row.mic ? '麦克风已开启，点击静音' : '麦克风已静音，点击开启'}
      onClick={() => void window.officeDock?.action?.(row.meeting ? 'meeting-mute' : 'private-mute', row.id)}>
      {row.mic ? <MicIcon /> : <MutedMicIcon />}</button>
  </div>)}</>;
}
