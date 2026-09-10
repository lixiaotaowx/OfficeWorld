# OfficeWorld outstanding work

Updated 2026-09-08. Detailed evidence and acceptance limits: DeliveryAcceptance.md.

## Verified implementation
- [x] Four independent 6x5m extension rooms (billiards, fitness, restroom, meeting) with 2m corridor and existing city/park window image. Actual UE evidence: Design/ExtensionEvidence; 80 extension uassets and map saved.
- [x] Continuous possessed-character traversal: 47 checkpoints through all new rooms and back to original office, no intermediate teleports; Saved/extension-route-tests.json passed=true. Final thin corridor lining preserves 83.5cm clearance to the tested route centerline (capsule radius30cm).
- [x] Approved CC0 succulent, Calathea variant a with pot, three book covers and sparse ceramic vase installed with original PBR/alpha; actual screenshots inspected. Credits: Design/ExtensionCredits.md.
- [x] Generated city/park panorama installed on a 160-degree window backdrop; actual UE frontal/diagonal captures in Design/Generated/CityPark. Saved map and three backdrop uassets verified.
- [x] Correct floor world-coordinate graph connections and physical 170 cm tile scale; real UE screenshot shows plank seams at natural scale.
- [x] Replace all twelve workstation equipment actors with free licensed G8 monitor, G915 keyboard and MX4 mouse assets; real UE orientation/material check and 19 uassets on disk.
- [x] Preserve approved natural office reference and pre-change backups.
- [x] Four finished D1 desks / C1 chairs, licensed Poly Haven accessories and plants.
- [x] Visible third-person pawn and three native working demo colleagues.
- [x] Authored native work / sit-down / stand-up animation, measured seat placement.
- [x] Local HUD proximity and screen-request consent demo: 20 regression checks.
- [x] Eight native Enhanced Input/body checks: seated movement blocked, constrained observation, standing locomotion, actual second seating.
- [x] Save new meeting furniture, pantry, restroom, clear main entrance and connected exterior hardscape.
- [x] Import original CC0 PBR park trees and street seating; retain authors/licenses.
- [x] Correct default startup map and GameMode to current office / third person.

## Required completion
- [ ] Finish visual matching: sage/olive wall tone, natural daylight, foliage brightness, wood scale and furniture proportions. Current full scene not visually accepted.
- [ ] Verify new continuous routes through meeting / pantry / WC / main entrance / crosswalk / park.
- [ ] Finish restroom privacy door and functional shared-space interactions.
- [ ] Add verified colleague proximity responses and broader workplace activities; current periodic seated motion is local demo behavior.
- [x] Replace visible mannequins with assembled MetaHuman baseline; 290 assets saved, runtime contains four Body/Face/Clothing instances. Original native eight interaction checks passed again; actual seated image inspected. Baseline still shares one appearance and wears default shirt/shorts barefoot.
- [ ] Complete latest four-person appearance requirement: two distinct adult Asian men and two distinct adult Asian women, independent faces/hair, different office-casual clothing styles, shoes. Design/Characters/office_people.json tracks identities; FreeWardrobeSources.md lists official free candidates, not downloaded assets. Verify final four-person and close-up/full-body runtime images, seating/clothing fit, and movement again.
  Character-only pause, 2026-09-08: all four final identities (Aoi, Aera, Bo, Tuya) assembled, installed and saved. Full CC0 archive downloaded and checked. Native MetaHuman tops replace external shirts that failed shoulder/arm fit; trousers/skirt/shoes installed as adaptation candidates. Actual PIE 00031-00038 exposed remaining F01 trouser and shoe/foot clipping, so wardrobe is NOT accepted. M01 joined suit required waist separation; jeans restored and visible in 00037. Dynamic SetMaterialAttributes caused an array assertion crash at 13:16; old script disabled. Fixed-layout alternative saved but changed skin appearance and failed masking QA; reverted F01 to original skin. Do not rerun either mask script as a final solution. Five missing Common groom dependencies recovered from autosaves. Saved-map reload clears duplicate PIE child actors after blueprint recompilation. Pause after saving and necessary movement regression; do not expand rooms/network/packaging.
  Cache mitigation: normal saved editor shutdown and reopen recovered C drive space from 0.6GB to 31GB; OfficeWorldLocal DDC graph uses old Zen read-only and new writable cache on G. Launch with -DDC=OfficeWorldLocal.
- [ ] Check safe stand-up destination against dynamic obstacles.
- [ ] Verify UI at target resolutions and keep QA camera/HUD cleanup reliable.
- [ ] Implement authenticated online identities, replicated seat ownership and consent messaging.
- [ ] Implement actual explicitly authorized screen media transport; local consent demo is not real sharing.
- [ ] Verify saved scene reload, successful Win64 cook/package and independent runtime launch. Packaging in progress, no pass yet.
- [ ] Consolidate final credits, controls, limitations and delivery evidence.
- [ ] DEFERRED BY USER: chair back mesh transparency/holes.

Do not call the project complete while required items remain failed, unimplemented or unverified. Concept art is not evidence of UE implementation; authored fixtures are not downloaded third-party models.

- [ ] Character FaceBuilder trial: visible manual pin refinement completed (23 front/10 profile pins), 2048 projected texture packed in FaceBuilder_Refined_Textured.blend. Further likeness review, real hair geometry, unseen-side texture cleanup and downstream integration remain. See Characters/FaceBuilderTrial/README.md. Office scene is unchanged by this trial.

## Lightweight web transition — 2026-09-09
- [x] User selected Quaternius modular women and men; retain UE project in place. See Migration/README.md.
- [ ] Download selected CC0 character packs and verify bundled animations, model sizes and browser rendering.
- [ ] Validate sitting, standing, typing and conversation animation coverage; the separate universal animation viewer is not proof of bundled/free clips.
- [ ] Prototype one lightweight room and one character, then measure download and runtime resource use.

- [x] Preserve user-authored office Blender original and packed copy with all external images. See ../../AssetSources/UserOfficeScene/README.md. 15,501 base triangles; browser materials/export validation pending.
- [x] Delete 7,824,094,426 bytes of generated caches/old builds; 1,427 UE source files verified unchanged by SHA-256. See Migration/cleanup-report.json.


## Approved original office model — 2026-09-09
- [x] User approved concept with separate manager office and no roof; previous user scene kept only as backup.
- [x] Opened user-visible Blender 5.1; user confirmed visibility. Saved first editable layout with 8 workstation displays, glass meeting room, manager office, coffee bar and lounge.
- [ ] Refine furniture/proportions/glazing/foliage to approved image; current geometry is a blockout.
- [ ] Coordinate lighting and rendering with user; bake only after validation.
- [ ] Export new scene to web, replace old scene export only after validation, optimize draw calls and textures.

- [ ] Obtain visual acceptance of staggered layout; latest actual view Design/OfficeConcept/Layout_Corrected_v2.png. Plant modelling stopped by user; agent placeholder plants/wall art hidden. Prefer finished free decor if needed later.


- [x] User manually corrected the layout and declared modelling complete; further modelling stopped by explicit request.
- [ ] Source licensed free finished cartoon potted plants, wall decor and interior materials. Preserve user layout and lighting; no procedural foliage.


- [x] Download and CRC-check approved Tiny Treats House Plants free pack; archive license confirms Isa Lousberg, CC0. 113 glTF models, all external references resolve. See AssetSources/Decor/TinyTreats_HousePlants/audit.json. Not imported into user scene.


- [x] Apply user-approved office props and recolored plants to live scene; save backup, delete 586 obsolete scene objects, verify closeup.
- [ ] Validate updated scene in browser after export; no runtime performance claim yet.

- [x] Apply generated shared atlas/metric UVs, repair chair-back folds, warm lighting and room palette; retain approved concept.
- [ ] Bake/recreate atlas repeat and tile shader for browser; inspect UV seams and final lighting in exported scene.

- [x] Reference detail pass: thin framed desk dividers, eight downloaded small desktop plants, capsule meeting tabletop, two framed abstract prints and front collaboration blackboard. Actual viewport Reference_Details_Final.png inspected.
- [ ] Inspect these details at browser camera distance after export; lighting and external scenery still differ from the concept.

- [x] Lighting atmosphere pass: lower-angle warm sun, softened directional shadows, reduced cool fill, coffee/meeting/manager localized warm lighting; AgX contrast and exposure balanced. Saved backup Before_Atmosphere_Lighting.blend. Editable lights retained.
- [ ] Recheck baked lighting and performance in browser; current verification is Blender rendered viewport only.

- [x] Add six downloaded CC0 exterior trees. User cancelled panorama: ring and exterior ground removed. Keep trees only; do not reintroduce HDR/backdrop.

- [x] Replace rejected block trees with user-selected first/last Erce tree variants; correct texture paths and inspect rendered viewport.
- [ ] Check leaf alpha cards in browser export.

- [x] Browser white scene and UI running locally; dual-tab chat verified.
- [x] Add Quaternius male/female playable avatars, Walk/Idle animation, click navigation, camera-relative keyboard movement, eight-seat procedural seated pose. Type/build and browser checks pass.
- [ ] Full sit-down/stand-up transition clips, multiplayer avatar/seat synchronization and navigation updates for future layout edits.

- [x] Collapsible member/chat sidebar; fixed waypoint-induced walk/idle restart stutter. Continuous speed tested at 30/60/144 FPS; browser collapse and arrival checks.
