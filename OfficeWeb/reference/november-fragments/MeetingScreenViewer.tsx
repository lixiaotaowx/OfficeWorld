export default function MeetingScreenViewer({ stream, label, onClose, signal, scope, annotation, selfColor, annotatable, own = false }: {\
export default function MeetingScreenViewer({ stream, label, onClose, signal, scope, annotation, selfColor, annotatable, own = false, shareControl }: {\
  selfColor?: string; annotatable: boolean; own?: boolean;\
  shareControl: { sharing: boolean; busy?: boolean; error?: string; onToggle: () => void };\
  if (!stream) return createPortal(<section className="meeting-screen-wait" role="dialog" aria-label={label}>\
  const shareButton = <button type="button" disabled={shareControl.busy} onClick={shareControl.onToggle}\
    title={shareControl.sharing ? '停止共享我的屏幕' : '共享我的屏幕，接替当前分享'}>\
    {shareControl.sharing ? '退出共享' : '抢占屏幕分享'}\
  </button>;\
  const shareError = shareControl.error && <span className="screen-stage-action-error" role="alert">{shareControl.error}</span>;\
  if (!stream) return createPortal(<section className="meeting-screen-wait" role="dialog" aria-label={label}>\
    <button type="button" onClick={onClose}>回到 Dock</button>\
    {shareButton}{shareError}\
    actions={<>\
      {shareButton}{shareError}\
      <button onClick={onClose}>回到 Dock</button>\
