"""Preserve licensed source geometry; bake source shaders to portable PBR atlases."""
import bpy,pathlib,json,math,sys
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished/Extension'
kinds=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else ['pool_table','treadmill','cue_rack','toilet','multigym','dumbbells']
for kind in kinds:
    dest=root/kind
    bpy.ops.wm.open_mainfile(filepath=str(dest/(kind+'.blend')),load_ui=False,use_scripts=False)
    scene=bpy.context.scene
    meshes=[o for o in scene.objects if o.type=='MESH']
    for o in meshes:
        o.hide_set(False);o.hide_viewport=False;o.hide_render=False
        if not o.data.uv_layers:o.data.uv_layers.new(name='SourceUV')
        old=o.data.uv_layers.active.name
        for mat in o.data.materials:
            if not mat or not mat.use_nodes:continue
            nt=mat.node_tree
            uv=nt.nodes.new('ShaderNodeUVMap');uv.uv_map=old
            for n in list(nt.nodes):
                if n.type=='TEX_IMAGE' and not n.inputs['Vector'].is_linked:nt.links.new(uv.outputs['UV'],n.inputs['Vector'])
                if n.type=='TEX_COORD':
                    for link in list(n.outputs['UV'].links):nt.links.new(uv.outputs['UV'],link.to_socket)
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
        for m in list(o.modifiers):
            if m.type=='SUBSURF':m.levels=min(m.levels,1)
            try:bpy.ops.object.modifier_apply(modifier=m.name)
            except RuntimeError:pass
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:o.select_set(True)
    bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();obj=bpy.context.object
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    bounds=[obj.matrix_world@Vector(p) for p in obj.bound_box]
    lo=Vector([min(p[i] for p in bounds) for i in range(3)]);hi=Vector([max(p[i] for p in bounds) for i in range(3)])
    obj.location-=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z));bpy.ops.object.transform_apply(location=True,rotation=False,scale=False)
    obj.data.uv_layers.new(name='BakeUV');obj.data.uv_layers.active_index=len(obj.data.uv_layers)-1;obj.data.uv_layers.active.active_render=True
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.008,scale_to_bounds=True);bpy.ops.object.mode_set(mode='OBJECT')
    scene.render.engine='CYCLES';scene.cycles.samples=1;scene.cycles.device='CPU';scene.render.bake.margin=8
    # Render only these assets. Other source cameras/lights never enter UE.
    for index,mat in enumerate(obj.data.materials):
        if mat is None:
            mat=bpy.data.materials.new('UnassignedSourcePlastic');mat.use_nodes=True;mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.018,.022,.025,1);obj.data.materials[index]=mat
    materials=list(obj.data.materials);original=[]
    for mat in materials:
        mat.use_nodes=True;nt=mat.node_tree;output=next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL');bs=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
        original.append((mat,output,bs,[l.from_socket for l in output.inputs['Surface'].links]))
    for channel,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic'),('Emissive','Emission Color')]:
        path=dest/(kind+'_'+channel+'.png')
        im=bpy.data.images.new(kind+'_'+channel,2048,2048,alpha=False)
        im.colorspace_settings.name='sRGB' if channel in ['BaseColor','Emissive'] else 'Non-Color'
        for mat,output,bs,links in original:
            nt=mat.node_tree;em=nt.nodes.new('ShaderNodeEmission');em.inputs['Strength'].default_value=1
            src=bs.inputs.get(socket) if bs else None
            if src and src.is_linked:nt.links.new(src.links[0].from_socket,em.inputs['Color'])
            elif src:
                val=src.default_value
                em.inputs['Color'].default_value=(val,val,val,1) if isinstance(val,(int,float)) else val
            else:em.inputs['Color'].default_value=(.03,.03,.03,1) if channel=='BaseColor' else ((.55,.55,.55,1) if channel=='Roughness' else (0,0,0,1))
            if channel=='Emissive':
                strength=bs.inputs.get('Emission Strength') if bs else None
                em.inputs['Strength'].default_value=min(float(strength.default_value),1.0) if strength else 0
            # Source keyboard legends use the texture-driven shader mix mask.
            if kind=='keyboard' and mat.name=='Keycaps' and channel=='BaseColor':
                mix=next((n for n in nt.nodes if n.type=='MIX_SHADER'),None)
                if mix and mix.inputs[0].is_linked:
                    ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.012,.016,.019,1);ramp.color_ramp.elements[1].color=(.65,.76,.78,1)
                    nt.links.new(mix.inputs[0].links[0].from_socket,ramp.inputs[0]);nt.links.new(ramp.outputs['Color'],em.inputs['Color'])
            nt.links.new(em.outputs[0],output.inputs['Surface'])
            target=nt.nodes.new('ShaderNodeTexImage');target.image=im;nt.nodes.active=target
        bpy.ops.object.bake(type='EMIT')
        im.filepath_raw=str(path);im.file_format='PNG';im.save()
        for mat,output,bs,links in original:
            if links:mat.node_tree.links.new(links[0],output.inputs['Surface'])
        print(kind,channel,'baked',flush=True)
    # Geometry carries the bevels and keycap relief; keep the source normal maps archived.
    portable=bpy.data.materials.new('M_'+kind+'_PBR');portable.use_nodes=True
    bs=portable.node_tree.nodes.get('Principled BSDF')
    for channel,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic'),('Emissive','Emission Color')]:
        im=bpy.data.images.load(str(dest/(kind+'_'+channel+'.png')),check_existing=True)
        if channel in ['Roughness','Metallic']:im.colorspace_settings.name='Non-Color'
        n=portable.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;portable.node_tree.links.new(n.outputs['Color'],bs.inputs[socket])
    bs.inputs['Emission Strength'].default_value=.2
    obj.data.materials.clear();obj.data.materials.append(portable)
    for face in obj.data.polygons:face.material_index=0
    # Make the baked atlas the first (UE UV0) layer.
    for layer in list(obj.data.uv_layers):
        if layer.name!='BakeUV':obj.data.uv_layers.remove(layer)
    bpy.ops.export_scene.fbx(filepath=str(dest/(kind+'_UE.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',bake_anim=False,path_mode='STRIP')
    (dest/'conversion.json').write_text(json.dumps({'source_parts':len(meshes),'dimensions_m':list(obj.dimensions),'vertices':len(obj.data.vertices),'bounds_before_centering':[list(lo),list(hi)],'modification':'source modifiers evaluated, subdivision capped at 1, origin centered on footprint, source shaders baked to 2K PBR; keyboard legend mask preserved; no source normal bake yet'},indent=2))
    # Offscreen source-derived model review, without opening a Blender window.
    for other in list(scene.objects):
        if other!=obj:bpy.data.objects.remove(other,do_unlink=True)
    size=max(obj.dimensions);center=Vector((0,0,obj.dimensions.z*.48))
    bpy.ops.object.camera_add(location=center+Vector((size*.75,-size*1.6,size*.95)))
    cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=size*1.45;scene.camera=cam
    for loc,power in [((1,-2,3),450),((-2,-1,1),220),((1,2,2),350)]:
        bpy.ops.object.light_add(type='AREA',location=center+Vector(loc)*size);light=bpy.context.object;light.data.energy=power*size*size;light.data.shape='DISK';light.data.size=size*2
        light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
    scene.world=bpy.data.worlds.new('ReviewWorld');scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.12,.15,.18,1)
    scene.render.engine='CYCLES';scene.cycles.samples=16;scene.render.resolution_x=900;scene.render.resolution_y=700;scene.render.resolution_percentage=100;scene.render.film_transparent=False
    scene.render.filepath=str(dest/'review.png');bpy.ops.render.render(write_still=True)
    print(kind,'converted and rendered',flush=True)

