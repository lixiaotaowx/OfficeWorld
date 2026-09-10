# Lightweight web direction — 2026-09-09

User selected Quaternius Ultimate Modular Women and Ultimate Modular Men as the character libraries for the next lightweight web prototype. Both official pages list CC0, 24 animations and glTF availability. Assets have not yet been downloaded or tested in the project.

- Women: https://quaternius.com/packs/ultimatemodularwomen.html
- Men: https://quaternius.com/packs/ultimatemodularcharacters.html
- The separately demonstrated Universal Animation Library viewer does not establish which clips ship with these packs or which additional clips are free.

## Preserved UE project

The existing project remains in `OfficeWorld/OfficeWorld.uproject`. Content, Config, Build, project descriptor, saved evidence, autosaves and backups are retained. `ue-preserved-manifest.json` records SHA-256 hashes of the project source assets before cleanup; `cleanup-report.json` records verification after cleanup.

Only rebuildable DDC, intermediate files, cooked/staged outputs, shader caches, temporary output and the old packaged build were selected for removal. Opening UE again may require cache regeneration. This is an in-place preservation, not a separate full archive or a successful post-cleanup UE launch test.

Original licensed asset sources, character fitting files, references, credits, scripts, Git history and existing backups remain for reuse. Uncertain source assets were not discarded as unused. Cleanup frees disk space, not measured runtime memory.

## Next work

- Download the selected character packs and retain their original licenses.
- Inspect included animation names, triangle counts, textures, bones and file sizes.
- Build a small browser preview and verify locomotion and office seating before choosing runtime budgets.
- UE reference-woman preview actors were transient; the saved character assets remain, but persistent level placement was not fixed.
