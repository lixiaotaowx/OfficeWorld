"""Architectural replacement only. Finished furniture/foliage are external assets."""
from pathlib import Path
import bpy, os

root = Path(__file__).resolve().parents[1]
source = (root / 'tools/build_realistic_blender.py').read_text(encoding='utf-8')
# Reuse the measured shell and glazing, without the placeholder furniture/plants.
shell = source.split('# Acoustic ceiling tiles')[0]
shell = shell.replace("'Generated'", "'NaturalArchitecture'")
exec(compile(shell, str(root / 'tools/build_realistic_blender.py'), 'exec'))
M['Paint'].name = 'SagePlaster'
M['Paint'].diffuse_color = (.25, .30, .22, 1)
wood = bpy.data.materials.new('NaturalWood'); wood.diffuse_color = (.42,.29,.16,1)
M['NaturalWood'] = wood
sand = bpy.data.materials.new('SandPlaster'); sand.diffuse_color = (.58,.53,.43,1)
M['SandPlaster'] = sand
for obj in groups['Architecture']:
    if obj.name.startswith(('Ceiling slab','Left window header','Left sill')):
        obj.data.materials.clear(); obj.data.materials.append(sand)
# Timber ceiling baffles; all geometry is in metres with manufactured edge radii.
for i in range(19):
    x = -5.4+i*.58
    box('Timber ceiling baffle',(x,-.05,2.94),(.075,8.55,.17),'NaturalWood',.005)
# Restrained vertical wood panels against two walls, rather than an all-white shell.
for cx,width in [(-4.2,1.7),(.45,1.7)]:
    box('Acoustic backing',(cx,4.435,1.52),(width,.035,2.85),'Charcoal',.002)
    count=int(width/.065)
    for i in range(count):
        box('Feature wall slat',(cx-width/2+.035+i*.065,4.398,1.52),(.035,.05,2.85),'NaturalWood',.003)
box('Right wall wood backing',(5.947,-2,1.76),(.03,3.5,1.96),'Charcoal',.002)
for i in range(52):
    box('Right wall slat',(5.91,-3.7+i*.065,1.76),(.05,.035,1.96),'NaturalWood',.003)
box('Right wall ledge',(5.8,-2,.77),(.31,3.65,.045),'NaturalWood',.005)
box('Concealed warm strip',(5.89,-2,.795),(.016,3.45,.01),'Light',.001)
for x,y in [(-3,-1.5),(-.3,-1.5),(3.9,2.5)]:
    box('Linear pendant body',(x,y,2.66),(1.5,.065,.07),'Charcoal',.004)
    box('Linear pendant diffuser',(x,y,2.623),(1.45,.045,.008),'Light',.002)
    for dx in [-.55,.55]:
        cyl('Pendant suspension',(x+dx,y,2.70),(x+dx,y,3.05),.002,'Charcoal')
partition = source.split('# Glass meeting room right side')[1].split('\n',1)[1].split("group='Furniture'")[0]
exec(compile(partition, '<measured-glass-partition>', 'exec'))
for key, objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects: ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.fbx(filepath=os.path.join(OUT,key+'.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Y',axis_up='Z',apply_unit_scale=True,bake_anim=False,add_leaf_bones=False)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'NaturalArchitecture.blend'))
print('NATURAL_ARCHITECTURE_READY', {k:len(v) for k,v in groups.items()})
