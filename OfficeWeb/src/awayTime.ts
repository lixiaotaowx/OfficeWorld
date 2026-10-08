// How long somebody has been away from their desk, in words.
//
// The user asked for minutes while the absence is short and hours once it
// reaches an hour (2026-09-15): a coffee break reads "离座 6 分钟" and a whole
// afternoon reads "离座 3.5 小时".
//
// The server publishes `awayFor` (milliseconds already away when it sent the
// `people` payload) rather than a timestamp, so a client only has to add the
// time since that payload arrived. That keeps every screen agreeing on the
// number without comparing anybody's clock with the server's.
import type { Person } from "./types";

/** Whether this person is sitting at their machine (missing = 在座). */
export function isAtDesk(person: Person): boolean {
  return person.atDesk !== false;
}

/** Milliseconds away, counted on from the moment the last payload arrived. */
export function awayMilliseconds(person: Person, pushedAt: number, now: number): number {
  if (isAtDesk(person)) return 0;
  return Math.max(0, (person.awayFor ?? 0) + Math.max(0, now - pushedAt));
}

/** "离座 55 秒" under a minute, "离座 6 分钟" under an hour, then hours. */
export function awayLabel(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  // One unit only (user, 2026-09-15): 55 秒, then 2 分钟, then 1 小时.
  if (seconds < 60) return `离座 ${Math.max(1, seconds)} 秒`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `离座 ${minutes} 分钟`;
  const hours = minutes / 60;
  // Tenths are enough for hours, and integers once the number gets long
  // ("离座 11 小时" rather than "离座 11.4 小时").
  const shown = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return `离座 ${shown} 小时`;
}
