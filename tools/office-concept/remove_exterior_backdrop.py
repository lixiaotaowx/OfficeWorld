import bpy
for name in ['Park city panorama ring','Exterior park ground']:
 o=bpy.data.objects.get(name)
 if o:bpy.data.objects.remove(o,do_unlink=True)
bpy.context.scene['exterior_backdrop_cancelled']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Backdrop and ground removed; six exterior trees retained.')
