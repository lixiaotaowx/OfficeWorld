# Downloaded character clothing sources

## MakeHuman system clothing pack

- Publisher: MakeHuman Community; copyright holders named inside files: Data Collection AB, Joel Palmius, Jonas Hauquier.
- Source: https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html
- Download: https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip
- Local archive: `makehuman_system_assets_cc0.zip`, 280,737,770 bytes.
- Integrity: Python ZipFile.testzip() returned None on 2026-09-08; 517 archive members.
- Extracted 153 clothing members into `MakeHumanCC0/clothes`, validated destination containment before extraction.
- License: CC0. The downloaded OBJ, MHCL0 and material headers explicitly record the September 2020 CC0 release and copyright holders. Original source headers are preserved.
- Original garment OBJ meshes and diffuse, normal, ambient occlusion textures retained.
- Status: downloaded reference garments; not yet accepted as fitted UE runtime clothing.
- Adaptation candidates: skeleton-landmark warp in Blender, bone weights, fitted trouser clearance, shortened exposed sock geometry; source mesh/UVs retained. F01 shirt uses a plain sage material while retaining denim and normal/AO textures. Original files remain unmodified; generated candidates live separately under `Fitting` and `/Game/OfficeInteraction/Clothing`.
- SHA256 record: `archive-sha256.json`.

## MakeHuman fitting reference mesh

- Source: https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj
- Local: `Fitting/MakeHuman_base.obj`.
- CC0 explicitly declared in original file header. Used as anatomical fitting reference, not as a replacement for the user's MetaHuman characters.

## MetaHuman

Epic Games installed UE 5.8 MetaHuman preset assets are subject to Epic's applicable terms, not CC0. Independently prepared characters and candidate official Fab wardrobe listings are tracked in `Design/Characters`. The exported `Fitting/OfficePerson01_Body.fbx` is a local fitting derivative of the project's MetaHuman body.

## Character fitting checkpoint, 2026-09-08

Four final MetaHumans: Aoi, Aera, Bo, Tuya. Runtime tops copy each character native MetaHuman shirt geometry and weights, with individual fabric colors; Epic terms apply. CC0 lower garments and shoes are recorded in each Fitting/{id}/fitting.json. Modifications include landmark fitting, weight transfer, native-top substitution, separating joined shirt/jeans at waist, trouser clearance and shoe toe/width adjustments. Original files retained. External shirts failed shoulder/arm runtime fit. Current lower garments/shoes still have clipping; no finished wardrobe claim. Skin masking withdrawn from runtime; original F01 skin restored.
