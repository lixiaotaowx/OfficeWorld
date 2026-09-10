import bpy
area=next(a for a in bpy.context.screen.areas if a.type=='VIEW_3D')
rv=area.spaces.active.region_3d
rv.view_camera_zoom=95
rv.view_camera_offset=(0,0.32)
area.tag_redraw()
