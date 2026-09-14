import bpy
print('FILE',bpy.data.filepath,'DIRTY',bpy.data.is_dirty)
print('SCENE COMPOSITOR',[p.identifier for p in bpy.types.Scene.bl_rna.properties if 'compos' in p.identifier or 'node' in p.identifier])
print('NODE',[(p.identifier,p.description[:80]) for p in bpy.types.CompositorNodeDenoise.bl_rna.properties if p.identifier in ['prefilter','quality','use_hdr']])
g=bpy.data.node_groups.new('InspectDenoise','CompositorNodeTree')
for kind in ['CompositorNodeDenoise','CompositorNodeImage','NodeGroupOutput']:
 n=g.nodes.new(kind);print(kind,[(i.name,str(getattr(i,'default_value',''))) for i in n.inputs])
bpy.data.node_groups.remove(g)
