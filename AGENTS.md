# OfficeWorld project guidance

## New web project file-size rule

For the new project in `OfficeWeb`, every file must be no more than 500 lines.
Read `OfficeWeb/AGENTS.md` before working there. Split growing files by clear
responsibility before they exceed the limit; do not compress code into long
lines to evade it. Do not silently exempt generated text or reference copies.
The preserved UE project and external original projects are not to be rewritten
as part of applying this rule to the new web project.

## OfficeWeb deployment target

The authoritative user-facing website is https://115.159.43.237/.
Read `OfficeWeb/AGENTS.md` and `Design/Deployment.md` before deployment work.
Do not confuse this Ubuntu VPS with the separate Windows `iruler-test` machine.
Do not assume the test-machine SSH key authenticates to the VPS.
The verified VPS identity is `ubuntu@115.159.43.237` using
`C:/Users/Administrator/.ssh/id_ed25519_aiwb` (login verified 2026-09-12).
Explicitly select that key with `IdentitiesOnly=yes`; preserve host-key checking.
Use the recorded configuration before asking for connection details again.
Never read or print private-key contents. The `id_ed25519_irulerdream` key is
for the separate Windows test machine and must not substitute for the VPS key.
Local exports, builds and screenshots are not evidence of a live-site update.
Report an update as deployed only after uploading the actual build/assets and
verifying the new version at the authoritative website. If blocked, explicitly
state that the website still has the previous version.

Before changing office visuals, view the approved concept image at
[Design/References/Approved_Natural_Office_Concept.png](Design/References/Approved_Natural_Office_Concept.png).
This is the user's accepted design reference and must remain in the project.

Aim for a natural, young, thoughtfully designed realistic office: soft sage/olive
walls, selective timber slats and ceiling baffles, thin black glass frames,
natural wood flooring, dark wood desks with white cabinets, black ergonomic
chairs, realistic plants, restrained office accessories, daylight and warm lamps.
Avoid a generic all-white office, heavy old-fashioned executive styling, and
coarse noisy materials. Check real texture scale, normal strength, roughness,
exposure, furniture proportions, seating direction and usable circulation.

Prefer finished free models with appropriate licenses and original PBR textures.
Record authors, source URLs, licenses and modifications. The user has authorized
autonomous selection, downloading, adaptation and implementation of suitable free
assets; do not reintroduce per-item approval. Do not purchase assets. Preserve
unrelated files and back up scene content before replacing it.

The concept image is a design target, never evidence of UE implementation.
Inspect real UE screenshots after changes before reporting a visible result.
Do not describe prototype furniture or procedural foliage as finished assets.
Keep the user's existing UE instance visible; do not close or restart it casually.

Track incomplete and deferred work in [Design/TODO.md](Design/TODO.md).
Chair back transparency is explicitly deferred, not permanently waived.
