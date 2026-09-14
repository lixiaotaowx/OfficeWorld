/** Whether this client should be capturing its screen at all.
 *
 * Kept free of React so the rule itself can be unit-tested. Capturing used to run
 * whenever the client held a desk, even with nobody able to watch, and one frame
 * cost 552ms of main-process time - so the answer matters.
 */
export function shouldPreview(input: {
  desktop: boolean; connected: boolean; seated: boolean; wanted: boolean; mayBroadcast?: boolean;
}) {
  // A visiting client never broadcasts a low-resolution preview of their screen
  // (the server refuses the frames as well); everybody else follows the four rules.
  if (input.mayBroadcast === false) return false;
  return input.desktop && input.connected && input.seated && input.wanted;
}

/** Who is allowed to broadcast the low-resolution preview: every member, plus the
 *  boss even when they came in as a visitor (user, 2026-09-15). The server applies
 *  the same rule in `preview-policy.mjs`; keep the two in step. */
export function mayBroadcastPreview(role: string | undefined, seat: number | null | undefined,
  bossSeat: number) {
  return role !== 'visitor' || seat === bossSeat;
}
