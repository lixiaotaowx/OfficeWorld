import bpy, collections

mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
lines = []
P = lines.append

def uv_stats(me, layer_index):
    uvl = me.uv_layers[layer_index]
    us = [d.uv[0] for d in uvl.data]
    vs = [d.uv[1] for d in uvl.data]
    if not us:
        return None
    return (min(us), max(us), min(vs), max(vs), len(us))

P("=== UV RANGE PER MATERIAL GROUP (layer 0 and layer 1) ===")
mat_objs = collections.defaultdict(list)
for o in mesh_objs:
    for s in o.material_slots:
        if s.material:
            mat_objs[s.material.name].append(o)

for mname in sorted(mat_objs):
    objs = mat_objs[mname]
    P("--- %s  (%d objs)" % (mname, len(objs)))
    for o in objs[:4]:
        me = o.data
        parts = []
        for i in range(len(me.uv_layers)):
            st = uv_stats(me, i)
            if st:
                parts.append("L%d u[%.2f..%.2f] v[%.2f..%.2f] n=%d" % (i, st[0], st[1], st[2], st[3], st[4]))
        P("    %-42s %s" % (o.name[:42], " | ".join(parts) or "NO UV"))

P("")
P("=== WHICH IMAGE NODE / UV MAP FEEDS EACH ATLAS MATERIAL ===")
for m in bpy.data.materials:
    if not m.use_nodes:
        continue
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE':
            vec = [l.from_node.name + ":" + l.from_socket.name for l in n.inputs['Vector'].links] if 'Vector' in n.inputs else []
            P("%-45s node=%-14s image=%-28s vector=%-24s interp=%s ext=%s" % (
                m.name, n.name, (n.image.name if n.image else None), ",".join(vec) or "-", n.interpolation, n.extension))

P("")
P("=== BRICK/COORD DETAIL ===")
for mname in ["Atlas stone / Floor - warm limestone 120cm", "Meeting olive plaster", "Manager deep sage plaster"]:
    m = bpy.data.materials.get(mname)
    if not m:
        continue
    P("--- " + mname)
    for n in m.node_tree.nodes:
        P("  node %-20s %-18s %s" % (n.name, n.type, {i.name: (tuple(round(x,3) for x in i.default_value) if hasattr(i.default_value,'__len__') else round(i.default_value,3) if isinstance(i.default_value,float) else i.default_value) for i in n.inputs if not i.is_linked and i.type not in ('SHADER','GEOMETRY','VECTOR','RGBA','STRING','BOOLEAN')}))
    for l in m.node_tree.links:
        P("   %s.%s -> %s.%s" % (l.from_node.name, l.from_socket.name, l.to_node.name, l.to_socket.name))

out = r"G:\C\wendang\ChatGPT\youxi\_bake_tmp\survey3.txt"
open(out, "w", encoding="utf-8").write("\n".join(lines))
print("WROTE", out, len(lines))
