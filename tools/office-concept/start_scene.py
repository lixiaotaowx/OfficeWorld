import bpy,sys
sys.path.insert(0,r'G:/C/wendang/ChatGPT/youxi/tools/office-concept')
import primitives,importlib;importlib.reload(primitives);from primitives import *
scene=bpy.data.scenes.new('OfficeConcept_08Seats')
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC'
cream=material('Warm ivory',(.82,.78,.68))
wood=material('Honey oak',(.58,.37,.17))
sage=material('Sage green',(.28,.37,.26))
dark=material('Graphite frames',(.065,.075,.07),.38)
box('Floor - new concept',(0,0,-.12),(18,13,.24),cream)
box('Meeting room rear wall',(5.4,6.4,1.65),(5.2,.18,3.3),sage)
box('Manager office rear wall',(.4,6.4,1.65),(4.5,.18,3.3),sage)
for x in [-1,4]:
 box('Four-seat desk island',(x,-2,.75),(3.5,1.65,.09),wood)
 for dx in [-1.55,1.55]:box('Desk end support',(x+dx,-2,.37),(.12,1.5,.72),wood)
for name,location,target in [('Concept_Camera',(21,-25,21),(0,0,0))]:
 data=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,data);scene.collection.objects.link(cam);cam.location=location;aim(cam,target);data.type='ORTHO';data.ortho_scale=23;scene.camera=cam
scene.world=bpy.data.worlds.new('Office daylight');scene.world.use_nodes=True;next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND').inputs[0].default_value=(.55,.65,.8,1);next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND').inputs[1].default_value=.35
area('Window softbox',(-7,2,8),(0,0,0),2200,8,(1,.9,.75))
area('Interior fill',(3,-2,8),(0,1,0),1200,7,(.85,.93,1))
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   a.spaces.active.region_3d.view_perspective='CAMERA'
   a.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=r'G:/C/wendang/ChatGPT/youxi/AssetSources/OfficeConcept/OfficeConcept_08Seats.blend')
print('New editable scene created; eight-seat desk islands laid out.')

