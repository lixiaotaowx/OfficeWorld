/** 三格会议/共享信号条：数据来自 `useMeetingSignal` 的快照，没有数据就不显示。 */
import type { ConnectionQuality, MeetingSignalState } from './connectionQuality';
import { signalLevel } from './connectionQuality';

/** quality → 点亮的格数；unknown 不点亮。 */
const LEVELS: Record<ConnectionQuality, number> = {
  excellent: 3, good: 2, poor: 1, lost: 0, unknown: 0,
};

export default function SignalBars({ state, summary, title }: {
  state: MeetingSignalState; summary: string; title?: string;
}) {
  const level = LEVELS[signalLevel(state.quality)] ?? 0;
  const names = state.participants.map(p => `${p.name}: ${LEVELS[p.quality] >= 2 ? '信号好' : LEVELS[p.quality] === 1 ? '信号弱' : '断开了'}`).join('\n');
  return <span className="signal-bars-panel" role="status"
    title={`${title || 'Meeting connection'}: ${summary}${names ? '\n' + names : ''}`}>
    <span className="signal-bars" data-level={state.quality} aria-hidden="true">
      {[1, 2, 3].map(i => <i key={i} className={i <= level ? 'on' : ''} />)}
    </span>
    <span>{summary}</span>
  </span>;
}
