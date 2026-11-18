// What the dock may show of chat and huddles. The main window owns both; the dock gets a bounded,
// plain-text snapshot: conversation summaries, the one open thread, and who is in which huddle.
const text = (value, max = 64) => (typeof value === 'string' ? value.slice(0, max) : '');
const time = value => (Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0);
const people = rows => (Array.isArray(rows) ? rows : []).slice(0, 32)
  .map(row => ({ id: text(row?.id), name: text(row?.name, 24) })).filter(row => row.id);

function cleanHuddles(raw) {
  return (Array.isArray(raw) ? raw : []).filter(row => row?.id).slice(0, 16).map(row => ({
    id: text(row?.id), since: time(row?.since), sharing: text(row?.sharing),
    members: people(row?.members), ringing: people(row?.ringing),
  })).filter(row => row.id);
}

function cleanChat(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const file = value => (value && typeof value === 'object' ? {
    id: text(value.id), name: text(value.name, 120), size: Math.max(0, Number(value.size) || 0),
    state: text(value.state, 40),
  } : undefined);
  return {
    open: text(raw.open),
    ...(Array.isArray(raw.members) ? { members: people(raw.members) } : {}),
    threads: (Array.isArray(raw.threads) ? raw.threads : []).slice(0, 64).map(row => ({
      id: text(row?.id), name: text(row?.name, 24), unread: Math.max(0, Math.min(999, Number(row?.unread) || 0)),
      last: text(row?.last, 120), at: time(row?.at), online: row?.online === true,
      ...(row?.lastFrom ? { lastFrom: text(row.lastFrom), lastName: text(row.lastName, 24) } : {}),
    })).filter(row => row.id),
    messages: (Array.isArray(raw.messages) ? raw.messages : []).slice(-120).map(row => ({
      id: text(row?.id, 80), from: text(row?.from), name: text(row?.name, 24), mine: row?.mine === true,
      text: text(row?.text, 1000), time: time(row?.time), ...(row?.file ? { file: file(row.file) } : {}),
      ...(Array.isArray(row?.mentions) ? { mentions: people(row.mentions), mentionedMe: row.mentionedMe === true } : {}),
    })).filter(row => row.id),
    error: text(raw.error, 180),
  };
}

// Extra fields a dock command may carry: message text, or the people a huddle should ring.
function cleanCommandExtra(kind, payload) {
  if (kind === 'screen-control') return { text: ['mute', 'share', 'end', 'silence', 'listen'].includes(payload?.text) ? payload.text : '' };
  if (kind === 'screen-ink') return { text: text(payload?.text, 5000) };
  if (kind === 'chat-send') return { text: text(payload?.text, 1000) };
  if (kind === 'huddle-start' || kind === 'huddle-invite') {
    return { ids: (Array.isArray(payload?.ids) ? payload.ids : []).filter(id => typeof id === 'string')
      .slice(0, 16).map(id => id.slice(0, 64)) };
  }
  return {};
}

module.exports = { cleanHuddles, cleanChat, cleanCommandExtra };
