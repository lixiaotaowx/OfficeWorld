/** Bounded display-only private-call state; never forward media or arbitrary payload fields. */
function cleanPrivateCalls(raw) {
  const text = (value, max = 64) => typeof value === 'string' ? value.slice(0, max) : '';
  // 音量（0..1）：静音按钮里那层填充按它涨。**这层清洗是按字段重建的，漏一个就是"页面在推、
  // 小窗永远收 0"**（`micLevel` 在 2026-10-15 就这么漏过一次，填充一直不显示）。非数字当 0。
  const level = raw?.micLevel === undefined ? undefined
    : Math.min(1, Math.max(0, Number(raw.micLevel) || 0));
  return {
    invitations: (Array.isArray(raw?.invitations) ? raw.invitations : []).slice(0, 32)
      .filter(row => row && ['voice', 'screen'].includes(row.kind))
      .map(row => ({ id: text(row.id), personId: text(row.personId), name: text(row.name, 24),
        kind: row.kind, offer: row.offer === true })).filter(row => row.id && row.personId),
    sessions: (Array.isArray(raw?.sessions) ? raw.sessions : []).slice(0, 16)
      .filter(row => row && typeof row === 'object')
      .map(row => ({ id: text(row.id), name: text(row.name, 24), connected: row.connected === true,
        mic: row.mic === true, sharing: row.sharing === true })).filter(row => row.id),
    ...(level === undefined ? {} : { micLevel: level }),
    busy: raw?.busy === true, error: text(raw?.error, 160),
  };
}
module.exports = { cleanPrivateCalls };
