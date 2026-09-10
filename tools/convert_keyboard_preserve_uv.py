import bpy,pathlib,json
from mathutils import Vector
p=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/WorkstationUpgrade/keyboard'
bpy.ops.wm.open_mainfile(filepath=str(p/'keyboard.blend'),load_ui=False,use_scripts=False)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
layout=bpy.data.images.get('layout.png');layout.filepath_raw=str(p/'G915_Legends.png');layout.file_format='PNG';layout.save()
def mat(name,c,metal,rough):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough;return m
mats={
 'Keys':mat('G915_Keys',(.025,.03,.032),0,.54),
 'Metal':mat('G915_Metal',(.08,.095,.10),.75,.35),
 'Plastic':mat('G915_Plastic',(.012,.016,.018),0,.55),
 'Rubber':mat('G915_Rubber',(.008,.008,.009),0,.8),
 'Light':mat('G915_Light',(.10,.32,.25),0,.35)}
m=mats['Keys'];n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=layout
inv=m.node_tree.nodes.new('ShaderNodeInvert');m.node_tree.links.new(n.outputs['Color'],inv.inputs['Color'])
mix=m.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MIX';mix.inputs[1].default_value=(.012,.018,.021,1);mix.inputs[2].default_value=(.65,.78,.80,1)
m.node_tree.links.new(inv.outputs[0],mix.inputs[0]);m.node_tree.links.new(mix.outputs[0],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
for o in meshes:
    o.hide_set(False);o.hide_render=False
    if not o.data.materials:o.data.materials.append(mats['Plastic'])
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    for mod in list(o.modifiers):
        if mod.type=='NODES':o.modifiers.remove(mod);continue
        if mod.type=='SUBSURF':mod.levels=min(mod.levels,1)
        try:bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError:pass
    for i,m in enumerate(o.data.materials):
        name=m.name if m else ''
        key='Keys' if name=='Keycaps' else ('Metal' if name=='Stainless Steel' else ('Light' if name in ['LEDs','logo'] else ('Rubber' if name=='rubberfeet' else 'Plastic')))
        o.data.materials[i]=mats[key]
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();o=bpy.context.object
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bounds=[Vector(x) for x in o.bound_box];lo=Vector([min(x[i] for x in bounds) for i in range(3)]);hi=Vector([max(x[i] for x in bounds) for i in range(3)])
o.location-=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z));bpy.ops.object.transform_apply(location=True,rotation=False,scale=False)
bpy.ops.export_scene.fbx(filepath=str(p/'G915_OriginalUV.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False,path_mode='STRIP')
(p/'direct-conversion.json').write_text(json.dumps({'dimensions_m':list(o.dimensions),'vertices':len(o.data.vertices),'slots':[m.name for m in o.data.materials],'source_uv_preserved':True,'modifications':'Original geometry evaluated; geometry-node auto smooth replaced with source shading; source key legend texture inverted to light legends on graphite keycaps; neutral PBR materials; no UV repack.'},indent=2))
scene=bpy.context.scene
for other in list(scene.objects):
    if other!=o:bpy.data.objects.remove(other,do_unlink=True)
size=max(o.dimensions);center=Vector((0,0,.02));bpy.ops.object.camera_add(location=center+Vector((.10,-.25,.30)))
cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=.46;scene.camera=cam
for loc,power in [((.1,-.2,.4),35),((-.3,.2,.3),20)]:
    bpy.ops.object.light_add(type='AREA',location=loc);a=bpy.context.object;a.data.energy=power;a.data.size=.4;a.rotation_euler=(center-a.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Review');scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.13,.15,.18,1)
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.render.resolution_x=1000;scene.render.resolution_y=650;scene.render.resolution_percentage=100;scene.render.filepath=str(p/'review-original-uv.png');bpy.ops.render.render(write_still=True)
