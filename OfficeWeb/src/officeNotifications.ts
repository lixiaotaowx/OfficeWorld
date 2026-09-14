import type { Socket } from 'socket.io-client';
import type { Message, Request } from './types';
import type { MeetingState } from './meetingTypes';

let audio: AudioContext | undefined;
export async function enableNotifications() {
  try {
    audio ??= new AudioContext();
    const resumed = audio.resume();
    const permission = 'Notification' in window && Notification.permission === 'default'
      ? Notification.requestPermission() : Promise.resolve();
    await Promise.all([resumed, permission]);
  } catch { /* Denied permissions never interrupt chat or calls. */ }
}
function beep() {
  try {
    audio ??= new AudioContext();
    void audio.resume().then(() => {
      if (!audio || audio.state !== 'running') return;
      const tone = audio.createOscillator(), gain = audio.createGain();
      tone.type = 'sine'; tone.frequency.value = 660;
      const now = audio.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.12, now + .015);
      gain.gain.exponentialRampToValueAtTime(.001, now + .18);
      tone.connect(gain); gain.connect(audio.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(now); tone.stop(now + .2);
    }).catch(() => {});
  } catch { /* Browser autoplay may require one user interaction. */ }
}
export function attachOfficeNotifications(socket: Socket, accountId: string) {
  const seen = new Set<string>();
  const notices = new Map<string, Notification>();
  let disposed = false, lastSound = 0;
  const activate = () => { void enableNotifications(); };
  window.addEventListener('pointerdown', activate, { once: true });
  window.addEventListener('keydown', activate, { once: true });
  if (window.officeDesktop) void enableNotifications();
  function notify(id: string, title: string, body: string, section: string) {
    if (disposed || seen.has(id)) return;
    seen.add(id);
    if (seen.size > 500) seen.delete(seen.values().next().value!);
    if (Date.now() - lastSound > 500) { beep(); lastSound = Date.now(); }
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const item = new Notification(title, { body: body.slice(0, 160), tag: id, silent: true });
      notices.set(id, item);
      item.onclose = () => notices.delete(id);
      item.onclick = () => {
        void window.officeDesktop?.focusWindow?.();
        window.focus();
        window.dispatchEvent(new CustomEvent('office-notification-open', { detail: section }));
        item.close();
      };
      if (notices.size > 20) { const first = notices.keys().next().value!; notices.get(first)?.close(); notices.delete(first); }
    } catch { /* Unsupported system notifications keep the in-app invitation. */ }
  }
  const chat = (m: Message) => {
    if (m.senderId === accountId) return;
    notify('chat:' + m.id, m.recipientId ? m.name + ' 发来消息' : m.name + ' · 公共聊天',
      m.attachment ? '发来文件：' + m.attachment.name : m.text, 'chat');
  };
  const call = (r: Request) => notify('call:' + r.id, r.name + ' 邀请你通话',
    r.kind === 'screen' ? '屏幕共享与语音通话 · 点击查看邀请' : '语音来电 · 点击查看邀请', 'call');
  const meeting = (state: MeetingState) => {
    for (const m of state.invitations) {
      if (m.members.find(p => p.id === accountId)?.status !== 'invited') continue;
      notify('meeting:' + m.id, '收到会议邀请', m.title, 'meeting');
    }
  };
  const expired = (id: string) => notices.get('call:' + id)?.close();
  socket.on('chat', chat); socket.on('request', call);
  socket.on('meeting-state', meeting); socket.on('request-expired', expired);
  return () => {
    disposed = true;
    window.removeEventListener('pointerdown', activate); window.removeEventListener('keydown', activate);
    socket.off('chat', chat); socket.off('request', call);
    socket.off('meeting-state', meeting); socket.off('request-expired', expired);
    for (const item of notices.values()) item.close();
    notices.clear();
    if (audio) { void audio.close().catch(() => {}); audio = undefined; }
  };
}
