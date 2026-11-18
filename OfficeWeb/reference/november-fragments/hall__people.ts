export class People {\
  private all = new Map<string, Someone>();\
  private alive = true;\
  set(people: HallPerson[]) {\
    if (!this.alive) return;\
    const here = new Set(people.map(p => p.id));\
    for (const [id, s] of this.all) if (!here.has(id)) { if (s.actor) this.parent.remove(s.actor.holder); this.all.delete(id); }\
    for (const [id, s] of this.all) if (!here.has(id)) { s.actor?.dispose(); this.all.delete(id); }\
        if (this.all.get(person.id) !== fresh) return;\
        if (this.all.get(person.id) !== fresh) { actor.dispose(); return; }\
  }\
  dispose() { this.alive=false; for(const s of this.all.values()) s.actor?.dispose(); this.all.clear(); }\
