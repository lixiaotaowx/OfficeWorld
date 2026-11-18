// sofaSeats: the places on sofas in the world, where a visitor without a desk is seated
// extraSeat: whether a seat id exists in the world (chairs, stools and sofa places), beside the workstations
export function createSitting(people, roster, publish, seatCount, extraSeat, sofaSeats = () => []) {
  const valid = new Set();
  for (let i = 0; i < seatCount; i++) valid.add(`desk-${i}`);
  const occupant = id => [...people.values()].find(p => p.sittingSpot === id);
  const blocked = (id, person) => {
    const owner = id.startsWith('desk-') ? roster[Number(id.slice(5))] : null;
    if (owner && owner.id !== person.clientId) return `这是${owner.name}的工位`;
    const other = occupant(id);
    if (other && other.id !== person.id) return `${other.name}坐在这里`;
    return null;
  };
  return {
    blocked,

    freeSofa(person) {
      for (const id of sofaSeats()) {
        if (extraSeat && !extraSeat(id)) continue;
        const other = occupant(id);
        if (!other || other.id === person.id) return id;
      }
      return null;
    },
    attach(socket) {
      socket.on('sit', (id, reply) => {
        if (typeof reply !== 'function') return;
        const person = people.get(socket.id);
        if (!person) return reply({ ok: false, error: '先进入大厅' });
        if (id !== null && !(extraSeat ? extraSeat(id) : valid.has(id))) return reply({ ok: false, error: '没有这个座位' });
        const error = id === null ? null : blocked(id, person);
        if (error) return reply({ ok: false, error });
        person.sittingSpot = id;
        publish();
        reply({ ok: true });
      });
    },
  };
}
