import { readFileSync } from 'node:fs';

// Read at import time, so a broken file must not abort the process: the desk
// seats below stay valid, only the extra public spots are lost.
let publicSeats = [];
try {
  const parsed = JSON.parse(readFileSync(new URL('./public-seats.json', import.meta.url), 'utf8'));
  if (Array.isArray(parsed)) publicSeats = parsed.filter(seat => seat && typeof seat.id === 'string');
  else throw Error('public-seats.json 不是数组');
} catch (error) {
  console.error('OfficeWeb: public-seats.json 无法读取，本次仅提供工位座位', error?.message || error);
}

/** Temporary reservations belong to a live socket, independently of the permanent roster. */
export function createSitting(people, roster, publish, seatCount, extraSeat) {
  const valid = new Set(publicSeats.map(s => s.id));
  for (let i = 0; i < seatCount; i++) valid.add(`desk-${i}`);
  const occupant = id => [...people.values()].find(p => p.sittingSpot === id);
  const blocked = (id, person) => {
    const owner = id.startsWith('desk-') ? roster[Number(id.slice(5))] : null;
    if (owner && owner.id !== person.clientId) return `${owner.name} 已占用这个工位`;
    const other = occupant(id);
    if (other && other.id !== person.id) return `${other.name} 正在使用这个座位`;
    return null;
  };
  return {
    blocked,
    /**
     * The first free public sofa. A visiting client is placed here on arrival
     * instead of at a desk, so they can sit down without taking anybody's seat.
     */
    freeSofa(person) {
      for (const seat of publicSeats) {
        if (extraSeat && !extraSeat(seat.id)) continue;
        if (!seat.id.startsWith('sofa-')) continue;
        const other = occupant(seat.id);
        if (!other || other.id === person.id) return seat.id;
      }
      return null;
    },
    attach(socket) {
      socket.on('sit', (id, reply) => {
        if (typeof reply !== 'function') return;
        const person = people.get(socket.id);
        if (!person) return reply({ ok: false, error: '请先进入空间' });
        if (id !== null && !(extraSeat ? extraSeat(id) : valid.has(id))) return reply({ ok: false, error: '无效的座位' });
        const error = id === null ? null : blocked(id, person);
        if (error) return reply({ ok: false, error });
        person.sittingSpot = id;
        publish();
        reply({ ok: true });
      });
    },
  };
}
