// Presentation-only IPC. The main renderer remains the sole meeting/media owner.
function cleanMeeting(value) {
  if (!value || typeof value !== 'object') return undefined;
  const text = (value, max = 64) => String(value || '').slice(0, max);
  return {
    active: value.active === true, title: text(value.title, 60),
    id: text(value.id), host: value.host === true,
    members: (Array.isArray(value.members) ? value.members : []).slice(0, 32)
      .filter(row => row && ['invited', 'joined', 'declined', 'left', 'removed'].includes(row.status))
      .map(row => ({ id: text(row.id), name: text(row.name, 24), status: row.status })).filter(row => row.id),
    invitations: (Array.isArray(value.invitations) ? value.invitations : []).slice(0, 32)
      .map(row => ({ id: text(row?.id), name: text(row?.name, 24), personId: text(row?.personId) }))
      .filter(row => row.id && row.personId),
    mic: value.mic === true, sharing: value.sharing === true,
    busy: value.busy === true, error: text(value.error, 180),
    candidates: (Array.isArray(value.candidates) ? value.candidates : []).slice(0, 32)
      .map(row => ({ id: text(row?.id), name: text(row?.name, 24), personId: text(row?.personId) }))
      .filter(row => row.id && row.personId),
    screens: (Array.isArray(value.screens) ? value.screens : []).slice(0, 16)
      .map(row => ({ id: text(row?.id), name: text(row?.name, 24), streamId: text(row?.streamId) })).filter(row => row.id),
  };
}
function installMeetingVideo({ ipcMain, allowApp, allowDock, toApp, getDock }) {
  ipcMain.handle('office:dock-video-want', (event, id) => {
    allowDock(event);
    return toApp('office:dock-video-want', String(id || '').slice(0, 64));
  });
  ipcMain.handle('office:dock-video', (event, value) => {
    allowApp(event);
    if (!value || typeof value.id !== 'string' || typeof value.epoch !== 'string') return false;
    if (value.bytes && (!(value.bytes instanceof ArrayBuffer) || value.bytes.byteLength > 2 * 1024 ** 2)) return false;
    if (!['video/webm;codecs=vp8', 'video/webm;codecs=vp9'].includes(value.mime)) return false;
    return getDock()?.send('office:dock-video', {
      id: value.id.slice(0, 64), epoch: value.epoch.slice(0, 64), mime: value.mime,
      reset: value.reset === true, bytes: value.bytes,
    }) || false;
  });
}
module.exports = { cleanMeeting, installMeetingVideo };
