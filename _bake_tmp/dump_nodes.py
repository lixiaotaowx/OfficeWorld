import bpy

def dump(name):
    m = bpy.data.materials.get(name)
    print("=" * 70)
    print("MATERIAL", name, "users:", sum(1 for o in bpy.data.objects if o.type=='MESH' for s in o.material_slots if s.material==m))
    nt = m.node_tree
    for n in nt.nodes:
        info = []
        for i in n.inputs:
            if i.is_linked:
                info.append("%s<-%s.%s" % (i.name, i.links[0].from_node.name, i.links[0].from_socket.name))
            else:
                if not hasattr(i, "default_value"):
                    info.append("%s=<?>" % i.name)
                    continue
                v = i.default_value
                try:
                    info.append("%s=%s" % (i.name, tuple(round(x,3) for x in v)))
                except TypeError:
                    try:
                        info.append("%s=%s" % (i.name, round(v,3)))
                    except TypeError:
                        info.append("%s=%s" % (i.name, v))
        print("  NODE %-22s %-18s loc=%s" % (n.name, n.type, tuple(round(x) for x in n.location)))
        for s in info:
            print("        %s" % s)

dump("Atlas wood / Pale natural oak")
dump("Atlas stone / Floor - warm limestone 120cm")
dump("Atlas fabric / Muted sage upholstery")
