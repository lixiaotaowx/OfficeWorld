import bpy,sys,importlib
sys.path.insert(0,r'G:/C/wendang/ChatGPT/youxi/tools/office-concept')
import primitives,furniture
importlib.reload(primitives);importlib.reload(furniture)
from primitives import *
from furniture import *
scene=bpy.data.scenes.new('Office_Concept_FinalLayout')
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC'
m={
 'cream':material('Ivory porcelain',(.83,.79,.69)),
 'wood':material('Pale natural oak',(.62,.43,.24)),
 'sage':material('Muted sage upholstery',(.30,.40,.28)),
 'frame':material('Warm graphite',(.075,.085,.075),.4),
 'dark':material('Graphite rubber',(.035,.04,.035)),
 'green':material('Foliage olive',(.20,.34,.105)),
 'terra':material('Muted terracotta',(.56,.25,.12)),
 'screen':material('Display background',(.16,.28,.30)),
 'ui0':material('UI mint',(.47,.69,.58)),
 'ui1':material('UI blue',(.23,.42,.58)),
 'ui2':material('UI white',(.85,.89,.85)),
 'glass':material('Clear glass',(.83,.95,.92),.06),
 'rug':material('Sage woven rug',(.25,.32,.22),.95),
}
glass=next(n for n in m['glass'].node_tree.nodes if n.type=='BSDF_PRINCIPLED')
glass.inputs['Transmission Weight'].default_value=1
glass.inputs['IOR'].default_value=1.45
box('Architecture / ivory floor',(.5,0,-.12),(21,13,.24),m['cream'])
box('Architecture / rear room wall',(6,6.48,1.6),(10,.15,3.2),m['sage'])
box('Architecture / manager side wall',(10.95,4.2,1.6),(.15,4.6,3.2),m['cream'])
box('Architecture / room divider',(6.55,4.3,1.6),(.15,4.35,3.2),m['cream'])
room_front('Meeting room',1,6.5,2.1,3.2,m)
room_front('Manager office',6.65,10.9,2.1,3.2,m)
box('Meeting left glass',(1,4.3,1.6),(.018,4.4,3.2),m['glass'],0)
for y in [2.1,4.3,6.5]:box('Meeting side frame',(1,y,1.6),(.055,.045,3.2),m['frame'],.005)
for x in [-10,-7.25,-4.5,-1.75,1]:
 box('Window vertical frame',(x,6.48,1.8),(.065,.065,3.6),m['cream'],.012)
box('Window upper beam',(-4.5,6.48,3.6),(11,.18,.20),m['cream'])
box('Window lower sill',(-4.5,6.48,.13),(11,.22,.12),m['wood'])
box('Window continuous glass',(-4.5,6.50,1.85),(10.9,.012,3.35),m['glass'],0)
# Architectural perimeter beams only: no ceilings above either room.
for x in [1,6.55,10.95]:box('Open top room beam',(x,4.3,3.23),(.16,4.5,.16),m['wood'])
box('Rear open top beam',(6,6.45,3.23),(10,.18,.16),m['wood'])
box('Front cutaway base',(.5,-6.44,.28),(21,.12,.55),m['cream'])
for i in range(44):box('Front oak slat',(3.4+i*.17,-6.44,.92),(.065,.1,1.1),m['wood'],.01)
data=bpy.data.cameras.new('Overview camera')
cam=bpy.data.objects.new('Overview camera',data);scene.collection.objects.link(cam)
cam.location=(25,-29,27);aim(cam,(.5,.6,.2));data.type='ORTHO';data.ortho_scale=28.7;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Soft daylight world');scene.world.use_nodes=True
world=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND')
world.inputs[0].default_value=(.62,.75,.9,1);world.inputs[1].default_value=.35
area('Daylight - adjustable',(-5,8,8),(0,0,0),2000,8,(1,.90,.76))
area('Soft front fill',(1,-5,9),(0,1,0),1300,10,(.88,.94,1))
sun_data=bpy.data.lights.new('Afternoon sun - adjustable','SUN');sun_data.energy=2;sun_data.angle=.12
sun=bpy.data.objects.new('Afternoon sun - adjustable',sun_data);scene.collection.objects.link(sun);sun.rotation_euler=(.6,-.55,-.6)
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   a.spaces.active.region_3d.view_perspective='CAMERA'
   a.spaces.active.region_3d.view_camera_zoom=2
   a.spaces.active.shading.type='MATERIAL'
   a.spaces.active.overlay.show_overlays=False
bpy.ops.wm.save_as_mainfile(filepath=r'G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/OfficeConcept_08Seats.blend')
print('PHASE 1: open-roof architecture, meeting room and manager office saved.')
