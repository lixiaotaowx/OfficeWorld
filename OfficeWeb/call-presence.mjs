

export function markCallPresence(people, sessions) {
  const busy = new Set();
  for (const session of sessions.values()) {
    for (const peer of session.peers || []) busy.add(peer);
  }
  return people.map((person) => ({ ...person, inCall: busy.has(person.id) }));
}
