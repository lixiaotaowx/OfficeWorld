# Workstation upgrade credits — 2026-09-08

Downloaded originals and metadata/hash records: AssetSources/Realistic/Finished/WorkstationUpgrade/{monitor,keyboard,mouse}/SOURCE.json. All three were free downloads under BlenderKit royalty-free license, not CC0; no purchases. License reference: https://www.blendkit.com/docs/licenses/ . Do not redistribute standalone source models as an asset pack.

| Model | Author | Source |
| --- | --- | --- |
| Samsung Odyssey G8 Monitor 34inch | Steven Yap | https://www.blenderkit.com/asset-gallery-detail/ae1a4d88-b999-41d5-971b-2e54e38a2494/ |
| G915 keyboard | Patrik | https://www.blenderkit.com/asset-gallery-detail/1db0380b-c09a-43e6-94e7-fc85cd580b79/ |
| Logitech MX4 Black Ergonomic Mouse | Demycs | https://www.blenderkit.com/asset-gallery-detail/9701990b-0eac-4d85-abdf-811034e11450/ |

Adaptation: evaluated source geometry, reduced subdivision, centered base and exported FBX; monitor/mouse original shaders baked to 2K base/roughness/metal/emission maps. Keyboard retains original UVs and key legends with neutral graphite/metal PBR materials and 42 cm width. Rejected keyboard atlas experiment is not installed. Twelve existing actors replaced in place, other scene/gameplay content retained. Backups/BeforeWorkstationUpgrade_20260908 contains original map, material and actor reference records.

Floor: Poly Haven laminate_floor_02, CC0, Charlotte Baglioni (photography), Dario Barresi (processing), https://polyhaven.com/a/laminate_floor_02 . Corrected disconnected WorldPosition→ComponentMask and Multiply→TextureSample UVs inputs. 1.7 m tile / eight plank rows produces about 21.25 cm row width. Verified actual floor seams in UE_Window_Workstation.png.

Actual UE equipment and floor evidence: Design/Generated/CityPark/UE_Window_Workstation.png. Native API save succeeded and all 19 WorkstationUpgrade uassets exist on disk. Subsequent runtime hand alignment/reload/package checks remain separate acceptance work.
