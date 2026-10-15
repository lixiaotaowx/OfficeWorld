import { useEffect, useState } from 'react';
import { cardTipOffset } from './dockRules';
import DockMeetingVideo from './DockMeetingVideo';
import ScreenViewControls from './ScreenViewControls';
import type { DockMeetingState } from './dock-meeting-contract';
export default function DockMeetingScreens({ meeting }: { meeting?: DockMeetingState }) {
  const [tips, setTips] = useState<Record<string, number>>({});
  const key = meeting?.screens.map(screen => screen.id).join('|') || '';
  useEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {};
      document.querySelectorAll<HTMLElement>('.dock-share-bubble').forEach(bubble => {
        const avatar = [...document.querySelectorAll<HTMLElement>('.dock-avatar')]
          .find(row => row.dataset.personId === bubble.dataset.person);
        if (!avatar) return;
        const rect = bubble.getBoundingClientRect(), row = avatar.getBoundingClientRect();
        const offset = cardTipOffset(rect.left, rect.width, row.left + row.width / 2);
        if (offset !== null) next[bubble.dataset.person!] = offset;
      });
      setTips(next);
    };
    measure(); window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [key]);
  if (!meeting?.screens.length) return null;
  return <div className={`dock-meeting-screens${meeting.screens.length > 1 ? ' multiple' : ''}`} aria-label="会议共享屏幕">
    {meeting.screens.map(screen => <section className="dock-share-bubble" key={screen.id} data-person={screen.id}>
      <header><strong>{screen.name}</strong><span>共享中</span></header>
      <div className="dock-share-picture">
        <DockMeetingVideo id={screen.id} streamId={screen.streamId} />
        {/* 只剩全屏一个按钮（用户 2026-10-15：「把最大化去掉，现在只用全屏就可以了」）。
            两者现在开的是同一个全屏浮层，所以 `meeting-view` 与 `meeting-fullscreen`
            只需要发全屏那条。 */}
        <ScreenViewControls label={`${screen.name} 的共享屏幕`}
          onFullscreen={() => { void window.officeDock?.action?.('meeting-fullscreen', screen.id); }} />
      </div>
      {tips[screen.id] !== undefined && <i className="dock-card-tip" aria-hidden="true" style={{ left: tips[screen.id] }} />}
    </section>)}
  </div>;
}
