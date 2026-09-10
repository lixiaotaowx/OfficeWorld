"""Export the baked office scene to glTF for the browser.

Keeps the custom properties the web client depends on (`role`, `seat_id`) and
the object names it looks up (`* approved monitor`, `* approved chair`), and
leaves out the lights and cameras because the web client does its own lighting
and the lighting is already baked into the albedos.
"""
import bpy
import os

OUT = r"G:\C\wendang\ChatGPT\youxi\OfficeWeb\public\assets\office-baked.glb"

# Report modifiers, because export_apply bakes them into the mesh.
modded = [o for o in bpy.data.objects if getattr(o, "modifiers", None) and len(o.modifiers)]
print("objects with modifiers:", len(modded))
for o in modded[:6]:
    print("   %-40s %s" % (o.name, [m.type for m in o.modifiers]))

# Drop what the web client must not receive.
drop_names = ("render", "backdrop", "panorama", "exterior", "park")
removed = []
for obj in list(bpy.data.objects):
    if obj.type in {"LIGHT", "CAMERA"}:
        removed.append((obj.type, obj.name))
        bpy.data.objects.remove(obj, do_unlink=True)
        continue
    if any(key in obj.name.lower() for key in drop_names):
        removed.append(("scene", obj.name))
        bpy.data.objects.remove(obj, do_unlink=True)

print("removed %d objects:" % len(removed))
for kind, name in removed[:15]:
    print("   %-8s %s" % (kind, name))

print("exporting ->", OUT)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_extras=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    # Baked albedos are opaque photographs of light; JPEG cuts the payload from
    # about 14MB to a few MB. Blender still writes PNG for images using alpha.
    export_image_format="JPEG",
    export_jpeg_quality=88,
    export_materials="EXPORT",
    export_texcoords=True,
    export_normals=True,
)

if os.path.exists(OUT):
    print("EXPORTED %.2f MB" % (os.path.getsize(OUT) / 1048576.0))
else:
    print("EXPORT FAILED")
