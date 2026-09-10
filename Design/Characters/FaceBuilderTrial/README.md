# Character FaceBuilder trial

Original front/profile references supplied by the user. Turnaround.png generated using the built-in image generation tool. Rear view is inferred, not measured geometry.

## Actual trial result, 2026-09-08

Blender 5.1.2 live MCP session successfully loaded KeenTools 2026.3.1. Official license check reports trial active, 14 days left. Earlier background-session license failure is superseded by this live check. Front and profile were recognized and fitted jointly with 15 and 9 pins. FaceBuilder_Multiview.blend preserves the fitted mesh and serialized FaceBuilder state. Live_Front.png and Live_Quarter.png are actual Blender viewport captures inspected after fitting.

## Visible refinement and texture pass

FaceBuilder_Refined_Textured.blend is the latest result. In the live Blender window, reference and wireframe were overlaid and zoomed to the face. Manually specified additional pin constraints adjusted upper/lower eyelids, nose wings, jaw sides and profile jaw underside. These were applied through FaceBuilder's MCP/Python API, not physical mouse drags. Changes and solve results are recorded in manual_eyes.json, manual_contours.json and manual_profile.json. One attempted profile nose bridge pin missed the mesh and was not applied. Final counts: 23 front pins and 10 profile pins, 18,024 vertices.

FaceBuilder projected both original images to a 2048-square texture, enabled gap filling and color/brightness equalization after inspection revealed missing coverage. Face_Projected.png is packed into the saved blend, along with the two original references. Textured_Quarter.png is the inspected final live viewport capture. Textured_Front.png predates gap filling and documents the intermediate issue.

This remains a likeness study, not a complete production character or verified exact likeness. The source face is only approximately 150 pixels wide; a 2048 texture does not recover missing source detail. Hair and collar are projected image colors on the head/neck mesh, not modeled hair or clothing. Further silhouette/likeness refinement, real hairstyle, unseen-side texture cleanup and downstream integration remain. Original references and earlier trials are preserved; the current Blender window is left open with the textured model visible.

Official plugin source: https://keentools.io/products/facebuilder-for-blender ; add-on adapter GPL, proprietary core used under its official trial. No license bypass or purchase. Plugin files are staged locally in this trial folder.

## Generation prompt

Use case: identity-preserve. Create a high resolution character modeling turnaround sheet based exactly on the two reference images: image 1 is authoritative front identity/body/outfit, image 2 authoritative left-facing profile and bun. Three full-body views in one wide image, front T pose, strict left-facing side T pose, back T pose. Same adult woman in all views, identical proportions, head size, aligned feet and eye height, orthographic studio rendering, neutral gray background. Preserve stylized polished 3D character aesthetic, large brown eyes, petite nose and lips, black swept-up bun with face strands, navy fitted mandarin collar jacket and straight trousers, black ankle boots, small chest badge, stud earrings and black wristwatch. Front and back arms horizontal extended, side arms properly foreshortened. No redesign, no different identity, no extra accessories, no scenery, no text, no watermark. Generously separated silhouettes, entire fingers and boots in frame. Back logically extrapolates same clothing and hair.
