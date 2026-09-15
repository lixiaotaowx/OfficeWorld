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
// Ring cadence for the ring-type events: a call, a voice invite, a meeting invite.
const RING_INTERVAL_MS = 2000;
const RING_TICKS = 15;
export function attachOfficeNotifications(socket: Socket, accountId: string) {
  const seen = new Set<string>();
  const notices = new Map<string, Notification>();
  let disposed = false, lastSound = 0, ringTimer: number | undefined, ringingId: string | undefined;
  const activate = () => { void enableNotifications(); };
  const stopRing = (id?: string) => {
    if (id !== undefined && ringingId !== id) return;
    if (ringTimer !== undefined) window.clearInterval(ringTimer);
    ringTimer = undefined; ringingId = undefined;
  };
  /** A ring-type event repeats its tone until answered, dismissed, or timed out. */
  const ring = (id: string) => {
    stopRing();
    ringingId = id; let ticks = 0; beep();
    ringTimer = window.setInterval(() => {
      if (disposed || ++ticks > RING_TICKS) { stopRing(); return; }
      beep();
    }, RING_INTERVAL_MS);
  };
  /** Any deliberate interaction answers the ring without touching the invitation. */
  const silence = () => { stopRing(); };
  window.addEventListener('pointerdown', activate, { once: true });
  window.addEventListener('keydown', activate, { once: true });
  window.addEventListener('pointerdown', silence);
  window.addEventListener('keydown', silence);
  if (window.officeDesktop) void enableNotifications();
  const openSection = (section: string) => {
    stopRing();
    window.focus();
    window.dispatchEvent(new CustomEvent('office-notification-open', { detail: section }));
  };
  // The desktop alert lives in the main process and reports its own click back
  // over IPC: a native toast click never reaches this renderer by itself.
  const disposeAlertOpen = window.officeDesktop?.onAlertOpen?.(openSection);
  function notify(id: string, title: string, body: string, section: string, urgent = false) {
    if (disposed || seen.has(id)) return;
    seen.add(id);
    if (seen.size > 500) seen.delete(seen.values().next().value!);
    if (urgent) ring(id);
    else if (Date.now() - lastSound > 500) { beep(); lastSound = Date.now(); }
    // The desktop main process owns the dependable alert: the HTML5 counterpart
    // below is exactly what Windows drops once this window is hidden in the tray.
    const desktop = window.officeDesktop;
    if (desktop?.alert) {
      // The main process owns the dependable alert. A build whose preload exposes
      // `alert` but whose main process registers no handler must still notify, so a
      // refused or failed bridge call falls back to the in-page notification.
      void desktop.alert({ title, body: body.slice(0, 220), section, urgent })
        .then(ok => { if (ok !== true) inPage(title, body, id, section); })
        .catch(() => inPage(title, body, id, section));
      return;
    }
    inPage(title, body, id, section);
  }
  function inPage(title: string, body: string, id: string, section: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const item = new Notification(title, { body: body.slice(0, 160), tag: id, silent: true });
      notices.set(id, item);
      item.onclose = () => notices.delete(id);
      item.onclick = () => { void window.officeDesktop?.focusWindow?.(); openSection(section); item.close(); };
      if (notices.size > 20) { const first = notices.keys().next().value!; notices.get(first)?.close(); notices.delete(first); }
    } catch { /* Unsupported system notifications keep the in-app invitation. */ }
  }
  const chat = (m: Message) => {
    if (m.senderId === accountId) return;
    notify('chat:' + m.id, m.recipientId ? m.name + ' 发来消息' : m.name + ' · 公共聊天',
      m.attachment ? '发来文件：' + m.attachment.name : m.text, 'chat');
  };
  const call = (r: Request) => notify('call:' + r.id, r.name + ' 邀请你通话',
    r.kind === 'screen' ? '屏幕共享与语音通话 · 点击查看邀请' : '语音来电 · 点击查看邀请', 'call', true);
  const meeting = (state: MeetingState) => {
    for (const m of state.invitations) {
      if (m.members.find(p => p.id === accountId)?.status !== 'invited') continue;
      notify('meeting:' + m.id, '收到会议邀请', m.title, 'meeting', true);
    }
  };
  const expired = (id: string) => { stopRing('call:' + id); notices.get('call:' + id)?.close(); };
  /**
   * A ring nobody answered also leaves a system/desktop toast, because the in-app popup
   * is invisible while the window sits in the tray (user, 2026-09-15).
   */
  const missed = (payload: { id?: string; reason?: string } | string) => {
    const id = typeof payload === 'string' ? payload : payload?.id;
    expired(id || '');
    if (!id || typeof payload === 'string' || payload?.reason !== 'timeout') return;
    notify('missed:' + id, '未接电话', '这次通话没有接通，可以再试一次', 'call');
  };
  socket.on('chat', chat); socket.on('request', call);
  socket.on('meeting-state', meeting); socket.on('request-expired', missed);
  return () => {
    disposed = true;
    stopRing();
    disposeAlertOpen?.();
    window.removeEventListener('pointerdown', activate); window.removeEventListener('keydown', activate);
    window.removeEventListener('pointerdown', silence); window.removeEventListener('keydown', silence);
    socket.off('chat', chat); socket.off('request', call);
    socket.off('meeting-state', meeting); socket.off('request-expired', missed);
    for (const item of notices.values()) item.close();
    notices.clear();
    if (audio) { void audio.close().catch(() => {}); audio = undefined; }
  };
}
