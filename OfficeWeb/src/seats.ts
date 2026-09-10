// Single source of truth for workstation geometry.
//
// Every coordinate below is derived from the authored asset, not hand-tuned:
// the office model carries one `shared_screen` node per seat whose extras are
// `{role: "shared_screen", seat_id: "Island_A_Seat_1"}` (and `"Manager"`), plus
// matching "approved chair" nodes. Reading those world transforms out of the
// GLB is what revealed that the old marker rings sat 0.53 m away from the real
// chairs, so both the ring and the avatar now come from this one table.
//
//   seat 0..3 = Island A (desk centre z = 3.8)   seat 4..7 = Island B (z = -1)
//   chairs sit on the outside of each half, monitors face them from the centre.

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export interface Workstation {
  /** 0-based seat index used by the socket protocol and the UI. */
  index: number;
  /** Matches `seat_id` in the GLB; also the key for the monitor mesh. */
  id: string;
  /** Short human label, e.g. "A-1". */
  label: string;
  /** Where the avatar sits, and which way it faces. */
  chair: { x: number; z: number; angle: number };
  /** Where the avatar stands before sitting down. */
  stand: { x: number; z: number };
  /** Centre of the monitor surface, for the shared-screen thumbnail. */
  display: XYZ;
}

const SEAT_ROWS: Array<{
  id: string;
  label: string;
  x: number;
  chairZ: number;
  displayZ: number;
}> = [
  // Island A: even seats face -z, odd seats face +z (across the desk).
  { id: "Island_A_Seat_1", label: "A-1", x: 0.267, chairZ: 4.98, displayZ: 4.01 },
  { id: "Island_A_Seat_2", label: "A-2", x: 0.267, chairZ: 2.62, displayZ: 3.59 },
  { id: "Island_A_Seat_3", label: "A-3", x: 1.987, chairZ: 4.98, displayZ: 4.01 },
  { id: "Island_A_Seat_4", label: "A-4", x: 1.987, chairZ: 2.62, displayZ: 3.59 },
  // Island B mirrors A four metres towards the window.
  { id: "Island_B_Seat_1", label: "B-1", x: -0.06, chairZ: 0.18, displayZ: -0.79 },
  { id: "Island_B_Seat_2", label: "B-2", x: -0.06, chairZ: -2.18, displayZ: -1.21 },
  { id: "Island_B_Seat_3", label: "B-3", x: 1.66, chairZ: 0.18, displayZ: -0.79 },
  { id: "Island_B_Seat_4", label: "B-4", x: 1.66, chairZ: -2.18, displayZ: -1.21 },
];

const DISPLAY_Y = 1.093;

export const WORKSTATIONS: Workstation[] = SEAT_ROWS.map((row, index) => ({
  index,
  id: row.id,
  label: row.label,
  chair: {
    x: row.x,
    z: row.chairZ,
    // Even seats look back across the desk, odd ones look the other way.
    angle: index % 2 === 0 ? Math.PI : 0,
  },
  stand: {
    x: row.x,
    z: row.chairZ + (index % 2 === 0 ? 0.8 : -0.8),
  },
  display: { x: row.x, y: DISPLAY_Y, z: row.displayZ },
}));

/** The manager office has a screen but is not claimable yet. */
export const MANAGER_DISPLAY: XYZ = {
  x: 8.65,
  y: DISPLAY_Y,
  z: -5.91,
};

export const SEAT_COUNT = WORKSTATIONS.length;

/** Chair transform in the shape the avatar code already expected. */
export const chairSeats = WORKSTATIONS.map((s) => ({
  x: s.chair.x,
  z: s.chair.z,
  angle: s.chair.angle,
}));

export function workstationAt(index: number) {
  return WORKSTATIONS[index];
}

/** Seat held by a participant, or -1 when they are not at a desk. */
export function seatOfSeatId(id: string) {
  return WORKSTATIONS.findIndex((s) => s.id === id);
}
