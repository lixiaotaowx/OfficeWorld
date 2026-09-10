import unreal as u
import os,json

E=u.get_editor_subsystem(u.EditorActorSubsystem)
L=u.get_editor_subsystem(u.LevelEditorSubsystem)
world=u.get_editor_subsystem(u.UnrealEditorSubsystem).get_editor_world()
assert world.get_outermost().get_name()=='/Game/Maps/OfficeCampus_A'
actors=E.get_all_level_actors()
def find(label):return next(a for a in actors if a.get_actor_label()==label)
sun=find('AfternoonSun').light_component
sun.set_editor_property('atmosphere_sun_light',True)
sun.set_editor_property('intensity',25000.0)
sky=find('SoftSky').light_component
sky.set_editor_property('intensity',1.0)
sky.set_editor_property('real_time_capture',True)
extended=u.SystemLibrary.get_console_variable_int_value('r.DefaultFeature.AutoExposure.ExtendDefaultLuminanceRange')
pp=find('Exposure')
s=pp.settings
s.set_editor_property('auto_exposure_min_brightness',11.0 if extended else 1000.0)
s.set_editor_property('auto_exposure_max_brightness',11.0 if extended else 1000.0)
pp.set_editor_property('settings',s)

# Warm, subdued leaf colors replace the imported cyan palette materials.
report={'extended_luminance':extended,'material_slots':{},'game_mode':None}
foliage=u.load_asset('/Game/Campus/Materials/Sage')
wood=u.load_asset('/Game/Campus/Materials/Oak')
for a in actors:
    if isinstance(a,u.StaticMeshActor) and a.get_actor_label().startswith(('ParkTree','StreetTree','ParkShrub','IndoorPlant')):
        c=a.static_mesh_component
        slots=c.static_mesh.static_materials
        report['material_slots'][a.get_actor_label()]=[str(s.material_slot_name) for s in slots]
        for idx,slot in enumerate(slots):
            n=str(slot.material_slot_name).lower()
            if any(k in n for k in ['leaf','leaves','green','plant','blue']):c.set_material(idx,foliage)
            elif any(k in n for k in ['wood','bark','trunk']):c.set_material(idx,wood)

def cube(label,xyz,size,mat):
    a=E.spawn_actor_from_class(u.StaticMeshActor,u.Vector(*xyz))
    a.set_actor_label(label)
    a.set_folder_path('Campus/Architecture')
    a.static_mesh_component.set_static_mesh(u.load_asset('/Engine/BasicShapes/Cube.Cube'))
    a.static_mesh_component.set_material(0,u.load_asset('/Game/Campus/Materials/'+mat))
    a.set_actor_scale3d(u.Vector(*(v/100 for v in size)))
    return a

# Replace only our generated solid bathroom frontage with two clear doorways.
wall=find('RestroomNorth')
E.destroy_actor(wall)
for x,width in [(575,110),(860,230),(1150,100)]:cube('WashroomFrontPier',(x,-280,150),(width,14,300),'Cream')
for x in [685,1030]:cube('WashroomDoorHeader',(x,-280,270),(120,14,60),'Cream')
for a in actors:
    label=a.get_actor_label()
    if label.startswith('Washbasin'):
        p=a.get_actor_location()
        a.set_actor_location(u.Vector(p.x,-600,p.z),False,False)
        a.set_actor_rotation(u.Rotator(yaw=90),False)
    if label.startswith('WashroomMirror'):
        p=a.get_actor_location()
        a.set_actor_location(u.Vector(p.x+95,-600,p.z),False,False)
        a.set_actor_rotation(u.Rotator(yaw=90),False)

registry=u.AssetRegistryHelpers.get_asset_registry()
registry.scan_paths_synchronous(['/Game/FirstPerson','/Game/Characters','/Game/Input'],True)
gm=u.load_class(None,'/Game/FirstPerson/Blueprints/BP_FirstPersonGameMode.BP_FirstPersonGameMode_C')
if not gm:raise RuntimeError('First-person game mode failed loading')
world.get_world_settings().set_editor_property('default_game_mode',gm)
report['game_mode']=gm.get_path_name()
input_settings=u.get_default_object(u.InputSettings)
for key,path in [('default_player_input_class','/Script/EnhancedInput.EnhancedPlayerInput'),('default_input_component_class','/Script/EnhancedInput.EnhancedInputComponent')]:
    try:input_settings.set_editor_property(key,u.load_class(None,path))
    except Exception as exc:report[key]=str(exc)
for a in actors:
    if isinstance(a,u.PlayerStart):
        a.set_actor_location(u.Vector(0,-1050,110),False,False)
        a.set_actor_rotation(u.Rotator(yaw=90),False)
E.clear_actor_selection_set()
u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-3700,-4900,3300),u.Rotator(pitch=-31,yaw=46,roll=0))
L.save_current_level()
u.EditorAssetLibrary.save_directory('/Game/Campus',only_if_is_dirty=True,recursive=True)
with open(os.path.join(u.Paths.project_saved_dir(),'campus-polish.json'),'w') as f:json.dump(report,f,indent=2)
u.log('CAMPUS_POLISH_COMPLETE')
