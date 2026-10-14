/** Bounded display-only private-call state; never forward media or arbitrary payload fields. */
function cleanPrivateCalls(raw) {
  const text = (value, max = 64) => typeof value === 'string' ? value.slice(0, max) : '';
  return {
    invitations: (Array.isArray(raw?.invitations) ? raw.invitations : []).slice(0, 32)
      .filter(row => row && ['voice', 'screen'].includes(row.kind))
      .map(row => ({ id: text(row.id), personId: text(row.personId), name: text(row.name, 24),
        kind: row.kind, offer: row.offer === true })).filter(row => row.id && row.personId),
    sessions: (Array.isArray(raw?.sessions) ? raw.sessions : []).slice(0, 16)
      .filter(row => row && typeof row === 'object')
      .map(row => ({ id: text(row.id), name: text(row.name, 24), connected: row.connected === true,
        mic: row.mic === true, sharing: row.sharing === true })).filter(row => row.id),
    busy: raw?.busy === true, error: text(raw?.error, 160),
  };
}
module.exports = { cleanPrivateCalls };
