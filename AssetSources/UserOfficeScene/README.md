# User-authored office scene

Original source copied without changes to OfficeScene_Original.blend; SHA-256 verified against the user's file. OfficeScene_Packed.blend also includes all three previously external image files. All FILE images are packed. The original outside this project was not modified.

Audit: 209 objects, 192 mesh objects, 15,501 base-mesh triangles, 22 materials, 21 image datablocks. Evaluated modifiers and browser performance have not yet been measured.

Good candidate for lightweight web reuse. Browser integration requires glTF/GLB export and material adaptation: 14 materials link baked image color directly to the material surface output. Convert these to supported unlit materials in an export copy to preserve baked lighting. Do not apply a second layer of scene lighting to baked light/shadow textures indiscriminately. Several textures are 2048 square; GPU memory and draw calls still require measurement. Two generated images appear in unused image nodes; do not label them missing external files.

No browser visual verification or GLB export has been completed yet. Preserve the packed Blender source for future work.

