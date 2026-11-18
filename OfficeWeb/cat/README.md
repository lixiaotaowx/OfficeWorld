# Office cat — M1 prototype (2026-10-26)

This is a random-policy engineering prototype, not the trained lifelong cat from the specification.
No neural network, drives, learning, social interaction or personality metrics exist yet.

## Run locally

From OfficeWeb, run `node test/browser/office-cat-preview.mjs` and `npm run dev -- --host 127.0.0.1`.
Open http://127.0.0.1:5173/test/browser/office-cat-preview.html.
The preview server binds 127.0.0.1:3319 and persists an independent prototype checkpoint.
Closing the browser does not stop it. Stop the preview process when finished.
For the integrated office, explicitly set OFFICE_CAT_ENABLED=true before starting the server.
Default is disabled until rollout validation completes. Production has not been changed.

## Implemented

- A single server-owned 5 Hz loop per office server, Socket.IO snapshots to joined users.
- Geometry-only adapter, conservative rotated/scaled furniture AABBs and structural surfaces.
- Random primitive directions and postures; step collision and simple jump feasibility checks.
- Client-only procedural model and pose/movement interpolation.
- Versioned checkpoint with position, posture, age, action duration and PRNG state, every ten simulated minutes.
- Tests cover ten minutes of accelerated client-free progression, checkpoint continuation, collision and identical multiplayer snapshots.

## Limits and next work

- M1 is not yet accepted as a complete production implementation: jumping needs a swept collision trajectory and better animation;
  geometry must match railings, pillars, shelves and imported models more closely; furniture moved onto the cat needs recovery handling.
- No 10-minute real-time closed-client acceptance run or production resource soak yet.
- Loop age advances per tick; this prototype does not simulate process downtime.
- Node module is a temporary low-memory host, not the final Python learner service.
- Local checkpoint is a single atomic file; rolling disaster backups and shutdown integration are pending.
- Full suite currently has three failures (file-transfer feedback, seat layout, visitor private chat); isolate before rollout.
- Next: finish M1 physics and acceptance, M2 physiological drives/perception, M5 offline training, then M3/M4 learning and interactions.
- Birth weights and reward parameters must be frozen only after experiments. Disaster backups must never be used to change personality.
