import bpy, collections, os

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
lines = []
P = lines.append

# object -> materials
objmats = {}
for o in mesh_objs:
    sig = tuple(sorted({s.material.name for s in o.material_slots if s.material}))
    objmats.setdefault(sig, []).append(o.name)

P("=== MATERIAL SET SIGNATURES (same set => same texture bundle) ===")
for sig, objs in sorted(objmats.items(), key=lambda kv: -len(kv[1])):
    uv = set()
    for n in objs:
        o = bpy.data.objects[n]
        uv.add(len(o.data.uv_layers))
    P("%3d objects  uvlayers=%s  mats=%s" % (len(objs), sorted(uv), list(sig)))
    P("      e.g. %s" % (objs[:6],))

P("")
P("=== NODE GRAPHS for used materials ===")
used = set()
for o in mesh_objs:
    for s in o.material_slots:
        if s.material:
            used.add(s.material.name)

for name in sorted(used):
    m = bpy.data.materials[name]
    if not m.use_nodes:
        P("%s : NO NODES" % name)
        continue
    P("--- %s  blend=%s" % (name, m.blend_method if hasattr(m, "blend_method") else "?"))
    for n in m.node_tree.nodes:
        extra = ""
        if n.type == 'TEX_IMAGE':
            extra = " img=%s" % (n.image.name if n.image else None)
        if n.type == 'BSDF_PRINCIPLED':
            keys = []
            for k in ('Base Color', 'Metallic', 'Roughness', 'IOR', 'Alpha',
                      'Normal', 'Emission Color', 'Emission Strength', 'Specular IOR Level'):
                if k in n.inputs:
                    i = n.inputs[k]
                    src = [l.from_node.name + ":" + l.from_socket.name for l in i.links]
                    keys.append("%s=%s%s" % (k, tuple(round(v, 3) for v in i.default_value) if hasattr(i.default_value, '__len__') else round(i.default_value, 3), ("<-" + ",".join(src)) if src else ""))
            extra = " | " + " ; ".join(keys)
        if n.type == 'TEX_BRICK':
            extra = " brick"
        P("    %-22s %-20s%s" % (n.type, n.name, extra))
    for l in m.node_tree.links:
        P("      %s.%s -> %s.%s" % (l.from_node.name, l.from_socket.name, l.to_node.name, l.to_socket.name))

out = r"G:\C\wendang\ChatGPT\youxi\_bake_tmp\survey2.txt"
open(out, "w", encoding="utf-8").write("\n".join(lines))
print("WROTE", out, len(lines))
