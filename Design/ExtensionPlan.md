# Office side wing — user request 2026-09-08

Status: integrated and saved to OfficeNatural_A. Eighty extension uassets verified on disk. Actual UE captures are in Design/ExtensionEvidence. Continuous possessed-character movement passed all 47 checkpoints through the four rooms and back to the original office, with no intermediate teleports (OfficeWorld/Saved/extension-route-tests.json). Final corridor lining and vanity light are saved and screenshot-checked. The thin lining's nearest face remains 83.5cm from the tested corridor centerline, versus the 30cm character radius; the 47-point movement run preceded this final lining addition.

Four independent rooms, each 6 × 5 m with 3.2 m ceiling: billiards (Y -1450 to -950 cm), fitness (-950 to -450), meeting (-450 to 50), restroom (50 to 550). Room X extent 800–1400 cm. A 2 m corridor at X 600–800 connects all 120 cm room openings, with a return to the existing office entry at (400,455). Original office architecture and character/HUD actors remain intact. New exterior entry remains available through the connector.

All four room windows reuse the existing generated city/park texture on a second curved backdrop. Restroom glazing starts at 155 cm for privacy. Do not call this panorama an explorable city or true HDR lighting map.

Finished free licensed assets are downloaded under AssetSources/Realistic/Finished/Extension; each includes author, source URL, license and SHA256 in SOURCE.json. Selected: pool_table, cue_rack, bench_press, multigym, dumbbells, toilet. The misleadingly named treadmill source proved to be an industrial conveyor and is explicitly rejected. pool_balls atlas preview is rejected; small original project ball dressing is separate, without physics gameplay. Original source files retained. Source reviews are Blender renders, not UE screenshots.

Previously approved CC0 Poly Haven decor is downloaded with original PBR: potted_plant_04, calathea_orbifolia_01 (variant a only, original alpha mask), decorative_book_set_01 (three selected covers only), ceramic_vase_01. Calathea receives original project ceramic pot geometry. Keep additions sparse and circulation clear.

Architecture, conference joinery, vanity fixtures, planter and small ball dressing are original measured project geometry, not downloaded finished models. The new restroom uses licensed toilets and screened cubicles with door leaves shown open. No new door interaction, pool physics or fitness activity system is promised.

Pre-change latest map is preserved in Backups/BeforeExtensionWing_20260908, including completed MetaHuman work. New wing meshes use lighting channel 1 and local rect lights use channels 0+1; original office lights and character assets are unchanged. The second backdrop uses the same image with its own emission material (100) to match the new rooms. Existing backdrop material is unchanged.

CaptureViewport's rapidly moved temporary view sometimes retained stale occlusion results, producing absent objects with shadows. The Nanite initial suspicion was not confirmed (equipment assets already had Nanite disabled). For final evidence only, r.AllowOcclusionQueries was temporarily set to 0, then restored to the recorded original value 1. New component disallow_nanite flags were restored to false. No project render console configuration was persisted. New meshes' render state was refreshed. Current captures show the actual assets, not composited imagery.

No package/reload validation is claimed for this extension. No pool physics, fitness gameplay or interactive door system was added.
