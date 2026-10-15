// Presentation-only IPC. The main renderer remains the sole meeting/media owner.
function cleanMeeting(value) {
  if (!value || typeof value !== 'object') return undefined;
  const text = (value, max = 64) => String(value || '').slice(0, max);
  // 音量（0..1）：静音按钮里那层填充按它涨。**这个字段必须留在这里** —— 这层清洗是按字段
  // 重建的，漏一个就是"页面在推、小窗永远收 0"（`self`/`missed`/`away`/`transfers` 都这么
  // 漏过，2026-10-15 又漏了一次 `micLevel`：填充一直不显示）。非数字/越界一律当 0。
  const level = value.micLevel === undefined ? undefined : Math.min(1, Math.max(0, Number(value.micLevel) || 0));
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
    ...(level === undefined ? {} : { micLevel: level }),
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
