import bpy,pathlib,json
from mathutils import Vector
p=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/WorkstationUpgrade/keyboard'
bpy.ops.wm.open_mainfile(filepath=str(p/'keyboard.blend'),load_ui=False,use_scripts=False)
r=[]
for o in bpy.context.scene.objects:
    if o.type=='MESH':r.append({'name':o.name,'uv':[(x.name,x.active_render) for x in o.data.uv_layers],'hide':o.hide_render,'scale':list(o.scale)})
for m in bpy.data.materials:
    if m.name=='Keycaps':
        for n in m.node_tree.nodes:
            if n.type=='MAPPING':r.append({'node':n.name,'values':[(i.name,list(i.default_value) if hasattr(i.default_value,'__len__') else i.default_value) for i in n.inputs]})
for im in bpy.data.images:
    if im.name=='layout.png':im.filepath_raw=str(p/'original-layout.png');im.file_format='PNG';im.save()
(p/'uv-debug.json').write_text(json.dumps(r,indent=2))
