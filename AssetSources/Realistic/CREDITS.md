# Current natural office sources

Active map: `/Game/Maps/OfficeNatural_A`. Original downloads and per-asset source
records are retained under `Finished/`. No paid assets were purchased.

| Asset | Author / source | License | Modifications |
| --- | --- | --- | --- |
| Office Desk 03 (D1) | WondieAlexio, https://www.fab.com/listings/d5deff3f-51b4-4414-88be-07cbc9d42084 | CC BY 4.0 | Joined source parts, normalized origin/orientation, baked authored materials to 2K PBR maps; four UE instances. |
| Orthopedic Chair (C1) | Kahyio, https://sketchfab.com/3d-models/orthopedic-chair-c4098270061e424baf41768f4fba73da | CC BY 4.0 | Preserved evaluated part transforms, joined geometry, normalized to 1.2 m; original PBR maps. Back mesh transparency deferred. |
| Potted Plant 01 and 02 | Rico Cilliers, https://polyhaven.com/a/potted_plant_01 and https://polyhaven.com/a/potted_plant_02 | CC0 | FBX coordinate normalization, original 2K textures, UE masked two-sided leaves, instance scaling. |
| Desk Lamp Arm 01 | Kuutti Siitonen; rig by Yann Kervran, https://polyhaven.com/a/desk_lamp_arm_01 | CC0 | Normalized FBX; charcoal base-color override and instance scaling; original surface maps retained. |
| Binder Notebook | DaDrood, https://polyhaven.com/a/binder_notebook | CC0 | Normalized FBX, original 2K PBR, varied rotation and scale. |
| Stationery Supplies | Mateusz Sadek, https://polyhaven.com/a/stationery_supplies | CC0 | Normalized FBX, original 2K PBR, varied instance placement. |

Poly Haven license: https://polyhaven.com/license . CC BY 4.0 terms:
https://creativecommons.org/licenses/by/4.0/ . Poly Haven downloads were checked
against API metadata for file size and MD5. Per-asset `SOURCE.json` records retain
the API's author data and source URL.

Architecture is original workspace geometry from `tools/build_natural_architecture.py`.
The former combined procedural Furniture and Plants actors are hidden and retained
under PendingReplacement/PrototypeOnly. They are not finished third-party assets.
The MetaHuman editor preview exists; runtime rig, assembly, clothing and movement
remain incomplete. MetaHuman assets are governed by Epic's applicable terms.

The notes below are historical connection-test records and do not describe the
current natural-office implementation.

## Historical prototype sources

- Architecture, furniture, plant meshes: original procedural Blender geometry created in this workspace by tools/build_realistic_blender.py; editable source Generated/OfficeSample.blend. These are prototype meshes, not purchased or third-party furniture. User has requested replacing them only after reviewing finished-asset choices.
- Laminate Floor 02 textures: Poly Haven, Charlotte Baglioni (photography), Dario Barresi (processing). https://polyhaven.com/a/laminate_floor_02 . CC0: https://polyhaven.com/license . Three 4K JPG maps downloaded from the asset page's dl.polyhaven.org links: diffuse, DirectX normal, roughness. Applied to floor and oak parts in UE.
- First-person controller/character/input: official UE 5.8 templates from the user's installed engine. Governed by Epic's Unreal Engine terms, not CC0.
- Fab and Sketchfab candidates in ASSET_REVIEW.md are not downloaded/imported. Their license obligations remain separate.
- No MetaHuman has been imported. MetaHuman Creator Core Data is absent locally at Engine/Plugins/MetaHuman/MetaHumanCharacter/Content/Optional.

# Current verified sample

- Map: /Game/Maps/OfficeRealisticSample, saved in UE 5.8.2.
- Four desk workstations plus glazed meeting room segment, original detailed furniture, PBR floor, local lighting.
- PIE spawned and possessed BP_FirstPersonCharacter; camera height ~167.5 cm, MOVE_WALKING.
- CharacterMovement test traversed ~1013 cm across the front aisle while keeping floor height. This verifies one route, not all collisions or doorways.
- Actual runtime screenshot: OfficeWorld/Saved/realistic-game.png (1600 x 900), HighResShot captured from PIE. No image generation or post-processing outside UE.
- PIE stopped after test. Current layout saved; new asset placement paused awaiting user selection.
- Not implemented: multiplayer, seated interactions, MetaHuman appearance/movement, packaging validation.

## Delivery additions (2026-09-08)

| Asset | Author / source | License | Adaptation |
|---|---|---|---|
| Furniture Kit 2.0 monitors, keyboard, mouse | Kenney; https://kenney.nl/assets/furniture-kit | CC0; local AssetSources/furniture-kit/License.txt | Adjusted pivots, real-world scale and neutral materials; low-poly equipment, not a realistic scanned asset. |
| Tree Small 02 | Rico Cilliers; https://polyhaven.com/a/tree_small_02 | CC0 | Flattened hierarchy, retained original PBR, Nanite enabled, placed in park. |
| Modular Street Seating | Stuart Attenborrow; https://polyhaven.com/a/modular_street_seating | CC0 | Flattened hierarchy, retained original PBR and source dimensions. |
| Third Person blueprints, Manny/Quinn and Unarmed base animation | Epic Games, installed UE 5.8 template | Applicable Epic Unreal Engine content terms; not CC0 | Visible third-person pawn, local demonstration colleagues; original OfficeWorld work/sit/stand motion baked to native AnimSequence tracks on Epic skeleton. Mannequins remain temporary. |
| Delivery architecture, meeting joinery, pantry/restroom fixtures, exterior hardscape | Original OfficeWorld authored geometry; tools/complete_office_shell.py | Original project work | Separate Blender source retained under DeliveryArchitecture; beveled geometry and measured circulation. Not downloaded third-party finished assets. |

Latest records above supersede historical prototype notes about absent Core Data or first-person-only implementation. The MetaHuman core data is now installed, but account authentication and runtime assembly remain unresolved.
