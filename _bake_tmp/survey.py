import bpy, json, os, collections

scene = bpy.context.scene
lines = []
P = lines.append

P("scene=%s" % scene.name)
P("engine=%s" % scene.render.engine)
P("objects=%d" % len(bpy.data.objects))
P("materials=%d" % len(bpy.data.materials))
P("images=%d" % len(bpy.data.images))

types = collections.Counter(o.type for o in bpy.data.objects)
P("types=%s" % dict(types))

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
P("mesh_objs=%d" % len(mesh_objs))

# mesh data sharing => duplicates
datablocks = collections.Counter(o.data.name for o in mesh_objs if o.data)
shared = {k: v for k, v in datablocks.items() if v > 1}
P("unique_meshes=%d  shared_mesh_datablocks=%d" % (len(datablocks), len(shared)))

# material users
mat_users = collections.Counter()
for o in mesh_objs:
    for slot in o.material_slots:
        if slot.material:
            mat_users[slot.material.name] += 1
P("materials_used_by_meshes=%d" % len(mat_users))

P("")
P("=== MATERIALS ===")
for m in sorted(bpy.data.materials, key=lambda x: x.name):
    if not m.use_nodes:
        P("%-45s NO_NODES" % m.name)
        continue
    img_nodes = [n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE']
    proc_nodes = [n for n in m.node_tree.nodes
                  if n.type in ('TEX_NOISE', 'TEX_VORONOI', 'TEX_MUSGRAVE', 'TEX_WAVE',
                                'TEX_COORD', 'TEX_BRICK', 'TEX_GRADIENT', 'TEX_MAGIC',
                                'TEX_CHECKER', 'TEX_SKY', 'TEX_ENVIRONMENT', 'ATTRIBUTE',
                                'SHADER_TO_RGB', 'VERTEX_COLOR')]
    bsdf = [n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED']
    imgs = []
    for n in img_nodes:
        if n.image:
            imgs.append("%s[%s]" % (n.image.name, n.image.source))
        else:
            imgs.append("<no image>")
    pn = sorted({n.type for n in proc_nodes})
    P("%-45s users=%-3d bsdf=%d imgs=%s proc=%s" % (
        m.name, mat_users.get(m.name, 0), len(bsdf), ",".join(imgs) or "-", ",".join(pn) or "-"))

P("")
P("=== EXISTING IMAGES ===")
for im in bpy.data.images:
    P("%-45s size=%sx%s src=%s path=%s" % (im.name, im.size[0], im.size[1], im.source, im.filepath))

P("")
P("=== PROCEDURAL-ONLY MATERIALS (no image texture) ===")
proc_only = []
for m in bpy.data.materials:
    if not m.use_nodes:
        continue
    has_img = any(n.type == 'TEX_IMAGE' and n.image for n in m.node_tree.nodes)
    has_proc = any(n.type in ('TEX_NOISE', 'TEX_VORONOI', 'TEX_MUSGRAVE', 'TEX_WAVE',
                              'TEX_BRICK', 'TEX_CHECKER', 'TEX_COORD', 'TEX_MAGIC',
                              'TEX_GRADIENT', 'SHADER_TO_RGB') for n in m.node_tree.nodes)
    if has_proc:
        proc_only.append((m.name, has_img, mat_users.get(m.name, 0)))
for n, hi, u in sorted(proc_only):
    P("  %-45s has_image=%-5s users=%d" % (n, hi, u))
P("procedural_material_count=%d" % len(proc_only))

P("")
P("=== UV LAYERS on meshes with UV ===")
no_uv = []
for o in mesh_objs:
    if not o.data.uv_layers:
        no_uv.append(o.name)
P("meshes_without_uv=%d" % len(no_uv))
P("sample_no_uv=%s" % no_uv[:25])

out = os.path.join(os.path.dirname(bpy.data.filepath) or ".", "..", "..", "_bake_tmp", "survey.txt")
out = r"G:\C\wendang\ChatGPT\youxi\_bake_tmp\survey.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("SURVEY_WRITTEN", out, len(lines))
