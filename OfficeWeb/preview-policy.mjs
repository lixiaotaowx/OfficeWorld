/** Who may broadcast the low-resolution workstation preview.
 *
 * A visiting client opts out of the ambient work-desk preview (see
 * `AGENTS.md` 身份：成员 / 访客) — with one exception the user asked for on
 * 2026-09-15: the boss shares it like any member. The boss is whoever sits in the
 * manager's chair, which the join rule fills for a name containing 文杰, so the
 * chair itself is the check and no extra state has to be persisted.
 *
 * The client enforces the same rule in `src/previewGate.ts`; keep the two in step.
 */
export function broadcastsPreview(person, bossSeat) {
  if (!person) return false;
  return person.role !== "visitor" || person.seat === bossSeat;
}
