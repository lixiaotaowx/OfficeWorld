import bpy, collections

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
used = set()
for o in mesh_objs:
    for s in o.material_slots:
        if s.material:
            used.add(s.material.name)

types = collections.Counter()
lines = []
P = lines.append

for name in sorted(used):
    m = bpy.data.materials[name]
    if not m.use_nodes:
        continue
    nt = m.node_tree
    for n in nt.nodes:
        types[n.type] += 1

P("=== NODE TYPES ACROSS USED MATERIALS ===")
for k, v in types.most_common():
    P("  %-22s %d" % (k, v))

P("")
P("=== PER-MATERIAL SHADING SUMMARY ===")
for name in sorted(used):
    m = bpy.data.materials[name]
    if not m.use_nodes:
        P("%-46s NO NODES" % name)
        continue
    nt = m.node_tree
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf:
        P("%-46s no principled" % name)
        continue
    def d(k):
        if k not in bsdf.inputs:
            return "n/a"
        i = bsdf.inputs[k]
        if i.is_linked:
            l = i.links[0]
            return "LINK:%s(%s)" % (l.from_node.type, l.from_socket.name)
        v = i.default_value
        try:
            return "%.3f" % v
        except TypeError:
            return str(tuple(round(x, 3) for x in v))
    extra = [t for t in ("NORMAL_MAP", "BUMP") if any(n.type == t for n in nt.nodes)]
    P("%-46s base=%-26s rough=%-22s metal=%-18s emis=%-14s alpha=%-14s bump=%s" % (
        name, d('Base Color'), d('Roughness'), d('Metallic'),
        d('Emission Strength'), d('Alpha'), ",".join(extra) or "-"))

P("")
P("=== FLAT-COLOUR MATERIALS (constant base color, no texture) ===")
flat = collections.Counter()
for o in mesh_objs:
    for s in o.material_slots:
        if not s.material or not s.material.use_nodes:
            continue
        bsdf = next((n for n in s.material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf and not bsdf.inputs['Base Color'].is_linked:
            flat[s.material.name] += 1
for k, v in flat.most_common():
    P("  %-46s objects=%d" % (k, v))
P("flat_material_count=%d  total_slots=%d" % (len(flat), sum(flat.values())))

out = r"G:\C\wendang\ChatGPT\youxi\_bake_tmp\survey4.txt"
open(out, "w", encoding="utf-8").write("\n".join(lines))
print("WROTE", out, len(lines))
