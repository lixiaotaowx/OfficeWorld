import bpy,math,sys
from pathlib import Path
from mathutils import Vector
root=Path('G:/C/wendang/ChatGPT/youxi')
sys.path.insert(0,str(root/'tools/office-concept'))
from primitives import area
s=bpy.context.scene
bpy.ops.wm.save_as_mainfile(filepath=str(root/'AssetSources/OfficeConcept/Before_Atmosphere_Lighting.blend'),copy=True)
sun=bpy.data.objects['Afternoon sun - adjustable']
sun.rotation_euler=Vector((1,-.48,-.80)).to_track_quat('-Z','Y').to_euler()
sun.data.energy=3.2;sun.data.color=(1,.86,.68);sun.data.angle=math.radians(1.6)
day=bpy.data.objects['Daylight - adjustable'];day.data.energy=500;day.data.color=(.78,.87,1);day.data.size=8
fill=bpy.data.objects['Soft front fill'];fill.data.energy=220;fill.data.color=(.83,.90,1);fill.data.size=10
bg=next(n for n in s.world.node_tree.nodes if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(.68,.78,1,1);bg.inputs['Strength'].default_value=.18
coffee=bpy.data.objects['Coffee warm wash'];coffee.data.energy=110;coffee.data.color=(1,.73,.45);coffee.data.size=1.5
pendant=bpy.data.objects['Meeting pendant light'];pendant.data.energy=170;pendant.data.color=(1,.79,.55);pendant.data.shape='RECTANGLE';pendant.data.size=1.6;pendant.data.size_y=.22
for name,loc,target,power,size in [
 ('Atmosphere manager wall wash',(8.8,7.15,2.95),(8.8,8,2.1),65,.65),
 ('Atmosphere coffee counter',(-9.23,4.28,1.87),(-9.05,4.28,.96),35,1.3),
 ('Atmosphere lounge warm bounce',(-7.8,-1.2,2.8),(-7.8,-1.2,.5),65,2)]:
 o=bpy.data.objects.get(name)
 if o: bpy.data.objects.remove(o,do_unlink=True)
 area(name,loc,target,power,size,(1,.76,.49))
s.view_settings.view_transform='AgX'
try:s.view_settings.look='AgX - Medium High Contrast'
except:pass
s.view_settings.exposure=-.15
s.cycles.preview_samples=96;s.cycles.use_preview_denoising=True
s.cycles.samples=96;s.cycles.use_denoising=True
s.cycles.max_bounces=8;s.cycles.diffuse_bounces=4;s.cycles.transmission_bounces=6
for a in bpy.context.screen.areas:
 if a.type=='VIEW_3D':
  sh=a.spaces.active.shading;sh.type='RENDERED';sh.use_scene_lights_render=True;sh.use_scene_world_render=True
s['atmosphere_lighting_v1']=True
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
print('Saved directional afternoon sun, cool soft fill and localized warm practical lights.')
