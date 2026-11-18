export function ChatFly({ state, convo, person, big, free, inCallWith, meeting, onBig, onClose, onCall, onSwitch, notice, mention, onPersonMenu, onMentionUsed }: {\
export function ChatFly({ state, convo, person, big, free, inCallWith, meeting, onBig, onClose, onCall, onSwitch, notice, mention, onPersonMenu, onMentionUsed, media }: {\
  media?: React.ReactNode;\
    <div className="dk-msgs" ref={list} aria-live="polite">\
    {media}\
    <div className="dk-msgs" ref={list} aria-live="polite">\
export function CallFly({ state, huddle, people, free, onClose }: {\
export function CallFly({ state, huddle, people, free, onClose, onView }: {\
  onView?: (id: string) => void;\
      <button type="button" className={meSharing ? 'on' : ''} onClick={() => sharer && !meSharing ? act('meeting-view', sharer.id) : act('meeting-share', m.id || '')}>\
      <button type="button" className={meSharing ? 'on' : ''} onClick={() => sharer && !meSharing ? onView?.(sharer.id) : act('meeting-share', m.id || '')}>\
