# OfficeWeb completion audit — 2026-09-12

User priority: a complete, usable, attractive collaboration space; avoid adding
unnecessary features. Latest priority is visibly clean baked textures.

## Verified

- VPS identity: ubuntu@115.159.43.237 with id_ed25519_aiwb.
- Previous connection failure was a wrong key selection, not a user key change.
- New chairs, selective baked model and sitting fixes uploaded; model SHA256
  matches the built asset. Office service restarted and website model rendered.
- All 32 local signaling tests passed. All 126 character/pose checks passed.
- LiveKit actually runs as livekit.service; media ports 7880/7881 are listening.

## Active texture fix

- Previous bakes were only 96 samples and had no image-output denoising.
- Rebaking 131 selected surfaces at 256 samples with compositor High/Accurate
  denoising guided by albedo and object-space normals. Independent object UVs
  and the 2K/1K/512/256 allocation stay intact.
- Floor output visually inspected: grain reduced and grout lines retained.
- Completed 131/131 surfaces without errors; inspected maps and actual Blender
  close-up, exported and deployed 4,949,652-byte model. Remote disk and public
  HTTPS download SHA256 match. Reloaded live workstation view to inspect floor.
- Rear-facing walls render black in the web overview and need a separate
  backface/material investigation; do not treat sampling changes as fixing it.

## Concrete remaining findings

- Local server.mjs differs from deployed server.mjs: the deployed version lacks
  persistent seat ownership, rename/admin support, expanded character IDs and
  seated pose relays. Review and deploy compatible backend with a backup.
- Existing admin default password must not accidentally become a public default
  when the newer backend is enabled; fail closed if no configured password.
- Client sidebar can say "empty desk" while it is the user's desk due to the
  backend version mismatch.
- The first-visit name/character/seat sequence needs end-to-end testing. Existing
  old browser harnesses assume no naming dialog and need adaptation.
- Old "white model/materials later" footer and "local collaboration" connection
  labels are misleading on the deployed material version; replace them.
- media.ts caches a microphone after leaving calls; audit track teardown,
  pending joins, failed joins, disconnect cleanup and autoplay recovery.
- Validate real synthetic media tracks between isolated test clients, including
  receive, mute, end and reconnect, without broadcasting into user conversations.
- Recheck 3D chair seat tagging: third A chair is named as a duplicated first
  chair in Blender; handle its intended station without altering user geometry.
- Simplify sidebar/detail/actions and responsive layout after core flows work.
- Final acceptance must use the VPS, not only the Vite local preview.
