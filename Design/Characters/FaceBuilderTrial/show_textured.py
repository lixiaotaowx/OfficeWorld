import bpy
obj=bpy.data.objects['FBHead'];obj.hide_set(False);obj.hide_viewport=False
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        space=area.spaces.active
        if space.local_view:obj.local_view_set(space,True)
        space.overlay.show_overlays=False
        space.shading.type='MATERIAL'
        space.shading.use_scene_world=False
        space.shading.use_scene_lights=False
        space.shading.studiolight_rotate_z=0
        space.shading.studiolight_background_alpha=0
print('VISIBLE',obj.visible_get(),obj.hide_get())
