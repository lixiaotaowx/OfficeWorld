import bpy,pathlib,json
from keentools.addon_config import fb_settings
from keentools.facebuilder.fbloader import FBLoader
root=pathlib.Path('G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial')
FBLoader.save_fb_serial_and_image_pathes(0)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'FaceBuilder_Anchor_Audit.blend'))
report=json.loads((root/'anchor_after.json').read_text())
print('MAX_RESIDUAL_PX',[max(r['residual_px'] for r in rows) for rows in report])
(root/'ANCHOR_AUDIT.md').write_text('''# Anchor audit correction

User rejected prior likeness. Prior manual additional pins were removed. Original automatic pin set retained except front inner eye corners 2 and 3 moved to image coordinates (608,168) and (638,168), based on the enlarged original reference overlay. Coordinates measured from top left of 1254-square original.

Candidate jaw anchors were inspected and rejected: initial points lay inside cheek rather than silhouette; later silhouette ray casts missed. No new jaw anchors retained. Front has 15 anchors; profile has 9. Numbered overlay was inspected in both views. See anchor_after.json for per-pin target, mesh projection and residual; low residual only measures fit to selected anchors, not correctness of anatomical selection or likeness.

FaceBuilder_Anchor_Audit.blend is the corrected geometry checkpoint. Earlier textured files are preserved but are superseded for geometry, and their textures have not been rebaked to this checkpoint. Remaining: reliable jaw/eyelid silhouette constraints and overall likeness review. Do not call the likeness accepted. Visible window left on front numbered overlay so alignment can be reviewed.
''',encoding='utf-8')
