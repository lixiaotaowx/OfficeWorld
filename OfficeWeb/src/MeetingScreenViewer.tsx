import { useEffect } from 'react';
import ScreenStage from './ScreenStage';
export default function MeetingScreenViewer({ stream, label, fullscreen, onClose }: {
  stream: MediaStream; label: string; fullscreen: boolean; onClose: () => void;
}) {
  useEffect(() => {
    const track = stream.getVideoTracks()[0];
    if (!track || track.readyState === 'ended') { onClose(); return; }
    track.addEventListener('ended', onClose);
    return () => track.removeEventListener('ended', onClose);
  }, [stream, onClose]);
  return <ScreenStage stream={stream} scope="dock-meeting-view" label={label}
    initialMode={fullscreen ? 'fullscreen' : 'maximized'}
    actions={<button onClick={onClose}>返回头像条</button>}
    onDraw={() => undefined} onClear={() => undefined} onUndo={() => undefined} />;
}
