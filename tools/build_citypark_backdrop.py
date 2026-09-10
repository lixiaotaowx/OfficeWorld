import bpy, math, pathlib, json
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'Design/Generated/CityPark'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
radius=80; arc=math.radians(160); height=radius*arc/3; bottom=1.6-height*.46
verts=[];faces=[]
for i in range(129):
    a=-arc/2+arc*i/128
    for z in (bottom,bottom+height):verts.append((-radius*math.cos(a),radius*math.sin(a),z))
for i in range(128):faces.append((2*i,2*i+1,2*i+3,2*i+2))
m=bpy.data.meshes.new('CityParkArc');m.from_pydata(verts,[],faces);m.update()
o=bpy.data.objects.new('CityParkArc',m);bpy.context.collection.objects.link(o)
uv=m.uv_layers.new(name='PanoramaUV')
for poly in m.polygons:
    for li in poly.loop_indices:
        vi=m.loops[li].vertex_index;uv.data[li].uv=(vi//2/128,vi%2)
bpy.context.view_layer.objects.active=o;o.select_set(True)
bpy.ops.export_scene.fbx(filepath=str(out/'CityParkArc.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False)
(out/'geometry.json').write_text(json.dumps({'radius_m':radius,'arc_degrees':160,'height_m':height,'bottom_m':bottom,'texture_resolution':[2172,724],'type':'LDR generated scenic backdrop, not a lighting HDRI'},indent=2))
