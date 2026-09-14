import { OfficeMedia } from '../../src/media';
import { io } from 'socket.io-client';
const s = io({ autoConnect: false });
const videos = new Map(); const sessions = new Map(); const notices: string[] = [];
const media = new OfficeMedia(s, message => notices.push(message), (id, stream) => {
  document.getElementById(id)?.remove();
  if (!stream) { videos.delete(id); return; }
  videos.set(id, stream); const video = document.createElement('video');
  video.id = id; video.autoplay = true; video.muted = true; video.srcObject = stream;
  document.body.appendChild(video);
}, () => {});
s.on('connect', () => s.emit('join', {}));
s.on('notice', message => notices.push(message));
s.on('session', async session => { sessions.set(session.id, session); await media.start(session); });
s.on('disconnect', () => { media.signalingDisconnected(); sessions.clear(); });
s.on('session-end', id => { sessions.delete(id); media.end(id); });
s.on('request', request => s.emit('respond', { id: request.id, accept: true }));
(window as any).qa = { media, s, videos, sessions, notices };
s.connect();

