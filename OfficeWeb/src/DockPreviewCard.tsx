import { useEffect, useState } from 'react';
import { cardActions, cardTipOffset, previewPlaceholder, type DockPerson } from './dockRules';
import { PhoneIcon, PreviewIcon, ScreenIcon } from './icons';

export type DockPreviewAction = 'watch' | 'share' | 'call';

/** The identity belongs to this card, never to a mutable global hover ref. */
export default function DockPreviewCard({ person, image, waiting, onEnter, onLeave, onAction, onMeeting }: {
  person: DockPerson; image: string; waiting: boolean;
  onEnter: () => void; onLeave: () => void;
  onAction: (kind: DockPreviewAction, personId: string) => void;
  onMeeting: (personId: string) => void;
}) {
  const [tipOffset, setTipOffset] = useState<number | null>(null);
  useEffect(() => {
    const avatar = [...document.querySelectorAll('.dock-avatar')]
      .find(node => node.getAttribute('data-person-id') === person.id);
    const card = document.querySelector('.dock-card');
    if (!avatar || !card) { setTipOffset(null); return; }
    const box = avatar.getBoundingClientRect(), frame = card.getBoundingClientRect();
    setTipOffset(cardTipOffset(frame.left, frame.width, box.left + box.width / 2));
  }, [person.id, image]);
  return <div className={`dock-card ${image ? 'has-image' : ''}`} role="dialog"
    data-card-person-id={person.id}
    aria-label={person.self ? '我的工位预览' : `${person.name} 的屏幕预览`}
    onMouseEnter={onEnter} onMouseLeave={onLeave}>
    <div className="dock-shot">
      {image ? <img src={image} alt={person.self ? '我的工位小图' : `${person.name} 的屏幕小图`} />
        : <span className="dock-shot-empty">{previewPlaceholder(person, !waiting)}</span>}
    </div>
    {person.status && <p className="dock-person-status">{person.status}</p>}
    {cardActions(person).length > 0 && <div className="dock-card-actions">
      <button type="button" title="请求观看对方屏幕" onClick={() => onAction('watch', person.id)}><PreviewIcon /><span>看屏幕</span></button>
      <button type="button" title="把我的屏幕分享给对方" onClick={() => onAction('share', person.id)}><ScreenIcon /><span>分享屏幕</span></button>
      <button type="button" title="邀请语音通话" onClick={() => onAction('call', person.id)}><PhoneIcon /><span>语音通话</span></button>
    </div>}
    <div className="dock-card-name">
      <span className="dock-card-who">{person.self ? `${person.name}（我 · 我的工位）` : person.name}</span>
      <button className="dock-start-meeting" onClick={() => onMeeting(person.id)}>发起会议</button>
      <span className={`dock-card-state ${person.atDesk ? 'here' : 'away'}`}>
        {person.atDesk ? '在座' : (person.away || '离座')}
      </span>
    </div>
    {tipOffset !== null && <i className="dock-card-tip" aria-hidden="true" style={{ left: `${tipOffset}px` }} />}
  </div>;
}
