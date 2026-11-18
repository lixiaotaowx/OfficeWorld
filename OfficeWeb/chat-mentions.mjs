/** Mentions are resolved against the server directory, never caller-supplied identities. */
export function resolveMentions(text, contacts) {
  const members = contacts.filter(p => p.id && p.name);
  const names = [...new Set(members.map(p => p.name))].sort((a, b) => b.length - a.length)
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!names.length) return [];
  const pattern = new RegExp(`(^|[\\s，。！？、：；（(])[@＠](${names.join('|')})(?=$|[\\s，。！？、：；,.!?;:）)])`, 'gu');
  const matched = new Set([...text.matchAll(pattern)].map(match => match[2]));
  return [...new Map(members.filter(p => matched.has(p.name)).map(p => [p.id, { id: p.id, name: p.name }])).values()];
}
