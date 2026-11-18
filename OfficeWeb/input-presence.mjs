

function settle(person) {
  person.onlineSince ??= Date.now();
  if (typeof person.atDesk !== "boolean") person.atDesk = true;
  if (person.atDesk) person.awaySince = null;
  else if (!person.awaySince) person.awaySince = Date.now();
  return person;
}

export function automaticExpression(person, now = Date.now()) {
  if (person.atDesk === false) return now - person.awaySince >= 300_000 ? 'sleepy' : 'away';
  if (person.busy === true) return 'busy';
  return now - person.onlineSince > 600_000 ? 'happy' : 'focused';
}

function idleOf(data) {
  const idle = Number(data?.idleMs);
  if (!Number.isFinite(idle) || idle <= 0) return 0;
  return Math.min(idle, 24 * 60 * 60 * 1000);
}

export function createInputPresence({ io, people, publish }) {
  io.on("connection", (socket) => {
    socket.on("input-state", (data) => {
      const person = people.get(socket.id);

      if (!person) return;
      const atDesk = data?.atDesk !== false;
      const busy = atDesk && data?.busy === true;

      if (person.atDesk === atDesk && (person.busy === true) === busy) return;
      person.busy = busy;
      person.atDesk = atDesk;
      person.awaySince = atDesk ? null : Date.now() - idleOf(data);
      publish();
    });
  });
  return {
    refresh() {
      if ([...people.values()].some(person =>
        automaticExpression(settle(person)) !== person.autoExpression)) publish();
    },

    view() {
      const now = Date.now();
      return [...people.values()].map((person) => {
        settle(person);
        person.autoExpression = automaticExpression(person, now);
        const { awaySince, onlineSince, ...rest } = person;
        return { ...rest, atDesk: person.atDesk, awayFor: person.atDesk ? 0 : now - awaySince };
      });
    },
  };
}
