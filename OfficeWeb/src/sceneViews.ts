// Small pure helpers shared by the 3D scene: the camera presets, the map of
// remote players, and the name tag each character wears.
//
// Extracted from OfficeScene.tsx, which is by far the largest module in the
// project and must stay under the 500 line ceiling.
import type { OfficeAvatar } from "./OfficeAvatar";
import type { RemoteAvatars, RemoteState } from "./RemoteAvatars";
import type { NameTagItem } from "./nameTags";
import type { Motion, Person } from "./types";

export type View = "overview" | "desks" | "meeting" | "lounge";

/** Camera position, then look-at target, per view. */
export const VIEWS: Record<View, [number[], number[]]> = {
  overview: [
    [19, 23, 29],
    [0.5, 0, -0.5],
  ],
  desks: [
    [8, 12, 15],
    [0.6, 0.5, 1.8],
  ],
  meeting: [
    [12, 9, 5],
    [4.1, 1, -5.8],
  ],
  lounge: [
    [4, 10, 13],
    [-6, 0, 0],
  ],
};

/** Everyone except us is drawn from the last snapshot the server relayed. */
export function remoteStates(state: {
  people: Person[];
  motions: Record<string, Motion>;
  myId: string;
}): Map<string, RemoteState> {
  const out = new Map<string, RemoteState>();
  for (const person of state.people) {
    if (person.id === state.myId) continue;
    const motion = state.motions[person.id];
    if (!motion) continue;
    out.set(person.id, { ...motion, appearance: person.appearance });
  }
  return out;
}

/** One name tag per character: everybody in the office wears their own name. */
export function nameTagItems(
  state: { people: Person[]; motions: Record<string, Motion>; myId: string },
  avatar: OfficeAvatar,
  remotes: RemoteAvatars,
): NameTagItem[] {
  const items: NameTagItem[] = [];
  for (const person of state.people) {
    const mine = person.id === state.myId;
    const object = mine ? avatar.root : remotes.objectOf(person.id);
    if (!object) continue;
    const sitting = mine ? avatar.getState().sitting : Boolean(state.motions[person.id]?.sitting);
    items.push({
      id: person.id,
      name: person.name,
      kind: mine ? "me" : person.role === "visitor" ? "visitor" : "employee",
      object,
      // 在座 / 离桌, shown as a green or red dot on the tag itself.
      atDesk: person.atDesk !== false,
      // A seated head is much lower than a standing one.
      height: sitting ? 1.52 : 2.02,
    });
  }
  return items;
}
