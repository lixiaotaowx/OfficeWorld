"""Build the approved warm office + street + park prototype in UE Editor."""
import unreal as u
import os
import json
import math
import traceback

ROOT = os.path.abspath(u.Paths.convert_relative_path_to_full(u.Paths.project_dir()))
SOURCES = os.path.join(os.path.dirname(ROOT), 'AssetSources')
REPORT = os.path.join(ROOT, 'Saved', 'campus-build.json')
E = u.get_editor_subsystem(u.EditorActorSubsystem)
L = u.get_editor_subsystem(u.LevelEditorSubsystem)
A = u.AssetToolsHelpers.get_asset_tools()
ML = u.MaterialEditingLibrary
materials = {}
assets = {}
created = []

def say(text):
    u.log('CAMPUS: ' + text)

def material(name, color, rough=0.65, metal=0.0):
    path = '/Game/Campus/Materials/' + name
    m = u.load_asset(path)
    if not m:
        m = A.create_asset(name, '/Game/Campus/Materials', u.Material, u.MaterialFactoryNew())
        c = ML.create_material_expression(m, u.MaterialExpressionConstant3Vector, -400, 0)
        c.set_editor_property('constant', u.LinearColor(*color, 1))
        ML.connect_material_property(c, '', u.MaterialProperty.MP_BASE_COLOR)
        r = ML.create_material_expression(m, u.MaterialExpressionConstant, -400, 140)
        r.set_editor_property('r', rough)
        ML.connect_material_property(r, '', u.MaterialProperty.MP_ROUGHNESS)
        if metal:
            k = ML.create_material_expression(m, u.MaterialExpressionConstant, -400, 260)
            k.set_editor_property('r', metal)
            ML.connect_material_property(k, '', u.MaterialProperty.MP_METALLIC)
        ML.recompile_material(m)
    materials[name] = m
    return m

def spawn(cls, label, xyz, rotation=(0,0,0), folder='Campus'):
    a = E.spawn_actor_from_class(cls, u.Vector(*xyz), u.Rotator(pitch=rotation[0],yaw=rotation[1],roll=rotation[2]))
    a.set_actor_label(label)
    a.set_folder_path(folder)
    created.append(a)
    return a

def box(label, xyz, size, mat, folder='Campus/Architecture', mesh='/Engine/BasicShapes/Cube.Cube'):
    a = spawn(u.StaticMeshActor, label, xyz, folder=folder)
    a.static_mesh_component.set_static_mesh(u.load_asset(mesh))
    a.set_actor_scale3d(u.Vector(*(v / 100 for v in size)))
    a.static_mesh_component.set_material(0, materials[mat])
    return a

def import_mesh(pack, name):
    folder = '/Game/Campus/Assets/' + pack.replace('-', '_')
    path = folder + '/' + name
    mesh = u.load_asset(path)
    if not mesh:
        src = os.path.join(SOURCES, pack, 'Models', 'FBX format', name + '.fbx')
        if not os.path.isfile(src):
            raise RuntimeError('Missing source ' + src)
        opts = u.FbxImportUI()
        opts.set_editor_property('import_mesh', True)
        opts.set_editor_property('import_as_skeletal', False)
        opts.set_editor_property('import_animations', False)
        opts.set_editor_property('import_materials', True)
        opts.set_editor_property('import_textures', True)
        opts.set_editor_property('mesh_type_to_import', u.FBXImportType.FBXIT_STATIC_MESH)
        opts.static_mesh_import_data.set_editor_property('combine_meshes', True)
        opts.static_mesh_import_data.set_editor_property('auto_generate_collision', True)
        t = u.AssetImportTask()
        t.filename = src
        t.destination_path = folder
        t.destination_name = name
        t.automated = True
        t.replace_existing = False
        t.save = True
        t.factory = u.FbxFactory()
        t.options = opts
        A.import_asset_tasks([t])
        candidates = [u.load_asset(p) for p in t.imported_object_paths]
        mesh = next((x for x in candidates if isinstance(x, u.StaticMesh)), None)
        if not mesh:
            mesh = u.load_asset(path)
        if not isinstance(mesh, u.StaticMesh):
            raise RuntimeError('No static mesh imported: ' + name)
    assets[name] = mesh
    say('Imported ' + name)

def prop(name, label, xyz, height, yaw=0, folder='Campus/Furniture'):
    a = spawn(u.StaticMeshActor, label, xyz, rotation=(0,yaw,0), folder=folder)
    a.static_mesh_component.set_static_mesh(assets[name])
    center, extent = a.get_actor_bounds(False)
    scale = height / max(extent.z * 2, 0.01)
    a.set_actor_scale3d(u.Vector(scale, scale, scale))
    center, extent = a.get_actor_bounds(False)
    a.set_actor_location(u.Vector(xyz[0] + xyz[0]-center.x, xyz[1]+xyz[1]-center.y, xyz[2] + xyz[2]-(center.z-extent.z)), False, False)
    return a

def sign(text, xyz, yaw=90, size=30, color=(58,77,60)):
    a = spawn(u.TextRenderActor, 'Sign_' + text, xyz, rotation=(0,yaw,0), folder='Campus/Signs')
    c = a.text_render
    c.set_text(text)
    c.set_world_size(size)
    c.set_text_render_color(u.Color(*color,255))
    c.set_horizontal_alignment(u.HorizTextAligment.EHTA_CENTER)
    return a

def build():
    map_path = '/Game/Maps/OfficeCampus_A'
    if u.EditorAssetLibrary.does_asset_exist(map_path):
        raise RuntimeError('OfficeCampus already exists; use a targeted update, not a rebuild.')
    L.save_current_level()
    if not L.new_level(map_path):
        raise RuntimeError('Could not create OfficeCampus')
    material('Cream', (0.77,0.72,0.60))
    material('Oak', (0.40,0.235,0.105))
    material('LightOak', (0.62,0.43,0.24))
    material('Sage', (0.19,0.29,0.18))
    material('Grass', (0.15,0.255,0.11))
    material('Path', (0.56,0.49,0.37))
    material('Road', (0.055,0.067,0.074))
    material('White', (0.82,0.83,0.78))
    material('Black', (0.035,0.044,0.04),0.4)
    material('Carpet', (0.28,0.36,0.25))
    material('Water', (0.09,0.28,0.32),0.15,0.25)
    glass=material('Glass',(0.5,0.7,0.7),0.12)
    glass.set_editor_property('blend_mode',u.BlendMode.BLEND_TRANSLUCENT)
    glass.set_editor_property('two_sided',True)
    opacity=ML.create_material_expression(glass,u.MaterialExpressionConstant,-400,400)
    opacity.set_editor_property('r',0.12)
    ML.connect_material_property(opacity,'',u.MaterialProperty.MP_OPACITY)
    ML.recompile_material(glass)
    # Keep a fixed exposure so the indoor/outdoor prototype stays readable.
    sky = spawn(u.SkyAtmosphere,'Sky',(0,0,0),folder='Campus/Lighting')
    sun = spawn(u.DirectionalLight,'AfternoonSun',(0,0,1000),rotation=(-42,-32,0),folder='Campus/Lighting')
    sun.light_component.set_editor_property('intensity', 5.0)
    sun.light_component.set_editor_property('light_color',u.Color(255,237,211,255))
    skylight = spawn(u.SkyLight,'SoftSky',(0,0,800),folder='Campus/Lighting')
    skylight.light_component.set_editor_property('intensity',1.1)
    skylight.light_component.set_editor_property('real_time_capture',True)
    pp=spawn(u.PostProcessVolume,'Exposure',(0,0,0),folder='Campus/Lighting')
    pp.set_editor_property('unbound',True)
    settings=pp.settings
    for key,value in [('override_auto_exposure_min_brightness',True),('override_auto_exposure_max_brightness',True),('auto_exposure_min_brightness',1.0),('auto_exposure_max_brightness',1.0)]:
        settings.set_editor_property(key,value)
    pp.set_editor_property('settings',settings)
    # A 24 x 16 metre office. The front entrance is open; the presentation roof is a timber pergola.
    box('CampusGround',(0,-1300,-35),(7600,6500,50),'Grass','Campus/Exterior')
    box('OfficeFoundation',(0,0,-12),(2440,1640,24),'Cream')
    box('OakFloor',(0,0,1),(2400,1600,2),'LightOak')
    for x in range(-1170,1200,120):
        box('FloorJoint',(x,0,2.1),(1.2,1600,0.5),'Oak')
    box('BackWall',(0,800,165),(2420,20,330),'Cream')
    for x in [-1200,1200]:
        box('SideBase',(x,0,42),(20,1600,84),'Cream')
        box('SideHeader',(x,0,310),(20,1600,40),'Cream')
        for y in [-760,-380,0,380,760]:
            box('WindowMullion',(x,y,195),(24,12,230),'Oak')
        for y in [-570,-190,190,570]:
            box('SideGlass',(x,y,187),(3,365,208),'Glass')
    for x in [-720,720]:
        box('FrontBase',(x,-800,38),(960,20,76),'Cream')
        box('FrontHeader',(x,-800,310),(960,26,40),'Oak')
        for dx in [-450,-150,150,450]:
            box('FrontMullion',(x+dx,-800,188),(10,18,225),'Oak')
        box('FrontGlass',(x,-800,187),(930,3,210),'Glass')
    box('EntranceHeader',(0,-800,310),(480,26,40),'Oak')
    for x in [-1200,-600,0,600,1200]:
        box('RoofBeam',(x,0,335),(22,1660,28),'Oak')
    # Conference suite on the right, with an open doorway.
    box('MeetingCarpet',(790,360,3),(780,820,3),'Carpet')
    for y in [-60,220,500,780]:box('MeetingPost',(390,y,165),(12,12,330),'Oak')
    box('MeetingHeader',(390,360,317),(14,840,26),'Oak')
    for y in [360,640]:box('MeetingGlass',(390,y,158),(3,266,310),'Glass')
    box('MeetingDivider',(790,-60,165),(780,10,330),'Cream')
    # Two restrooms with open doorways, opaque partitions and complete fixtures.
    box('RestroomNorth',(860,-280,150),(680,14,300),'Cream')
    box('RestroomMiddle',(860,-530,150),(14,500,300),'Cream')
    for y in [-655,-345]:box('RestroomEntryWall',(520,y,150),(14,150,300),'Cream')
    box('RestroomDoorLintel',(520,-500,270),(14,160,60),'Cream')
    box('RestroomFloor',(860,-535,4),(660,480,4),'White')
    # Reception and a continuous level route to the public pavement.
    box('ReceptionBase',(-280,-575,50),(220,75,100),'Sage')
    box('ReceptionTop',(-280,-575,103),(230,85,6),'LightOak')
    box('EntryMat',(0,-710,4),(240,150,4),'Carpet')
    box('FrontPavement',(0,-990,-1),(7200,380,14),'Path','Campus/Street')
    box('RoadBase',(0,-1530,-6),(7200,700,12),'Road','Campus/Street')
    box('ParkPavement',(0,-1980,-1),(7200,180,14),'Path','Campus/Street')
    for x in range(-3400,3500,400):box('LaneDash',(x,-1530,1),(180,9,2),'White','Campus/Street')
    for y in range(-1850,-1190,85):box('Crosswalk',(0,y,2),(235,40,3),'White','Campus/Street')
    # Park loop, benches and planted islands.
    box('ParkEntry',(0,-2380,-1),(260,720,14),'Path','Campus/Park')
    box('ParkPromenade',(0,-2850,-1),(3900,260,14),'Path','Campus/Park')
    for x in [-1900,1900]:box('ParkSidePath',(x,-2850,-1),(240,1450,14),'Path','Campus/Park')
    box('ParkBackPath',(0,-3520,-1),(3900,220,14),'Path','Campus/Park')
    box('ReflectingPool',(780,-3220,-1),(780,380,12),'Cream','Campus/Park')
    box('PoolWater',(780,-3220,7),(740,340,3),'Water','Campus/Park')
    # First save exposes the blockout while imports finish.
    L.save_current_level()
    say('BLOCKOUT_SAVED')
    furniture=['desk','chairDesk','computerScreen','computerKeyboard','computerMouse','pottedPlant','plantSmall1','table','chairCushion','loungeSofa','tableCoffee','bookcaseOpen','books','kitchenCabinet','kitchenCoffeeMachine','kitchenFridge','bathroomSink','bathroomMirror','toilet','bench','trashcan','lampRoundFloor']
    nature=['tree_default','tree_detailed','tree_cone','plant_bush','flower_yellowA']
    for name in furniture:import_mesh('furniture-kit',name)
    for name in nature:import_mesh('nature-kit',name)
    import_mesh('city-kit-roads','light-curved')
    # Twelve full workstations in three paired islands.
    for col,x in enumerate([-820,-370,80]):
        for row,y in enumerate([-150,260]):
            for side in [-1,1]:
                xx=x+side*90
                prop('desk','Desk_%s_%s_%s'%(col,row,side),(xx,y,3),75,90 if side==1 else -90)
                prop('chairDesk','OfficeChair',(xx+side*110,y,3),105,90 if side==1 else -90)
                prop('computerScreen','Monitor',(xx-side*25,y,79),40,90 if side==1 else -90)
                prop('computerKeyboard','Keyboard',(xx+side*20,y,79),3,90 if side==1 else -90)
                box('DeskDivider',(x,y,101),(4,145,45),'Sage','Campus/Workstations')
    # Conference table and eight seats.
    table=prop('table','MeetingTable',(810,360,6),75)
    table.set_actor_scale3d(table.get_actor_scale3d()*u.Vector(1.1,2.2,1))
    for y in [100,270,440,610]:
        for x,yaw in [(575,90),(1045,-90)]:prop('chairCushion','MeetingChair',(x,y,6),92,yaw)
    box('PresentationScreen',(807,785,185),(320,6,170),'Black','Campus/Meeting')
    # Social corner and kitchenette.
    prop('loungeSofa','LoungeSofa',(-810,610,4),88,180)
    prop('tableCoffee','CoffeeTable',(-800,420,4),42)
    prop('bookcaseOpen','Library',(-1130,460,4),195,90)
    for x in [-330,-190,-50]:prop('kitchenCabinet','KitchenCabinet',(x,705,4),90)
    prop('kitchenCoffeeMachine','CoffeeMachine',(-200,700,95),43)
    prop('kitchenFridge','Fridge',(160,700,4),185)
    for x in [685,1030]:
        prop('toilet','Toilet',(x,-695,6),80)
        prop('bathroomSink','Washbasin',(x,-335,6),85)
        prop('bathroomMirror','WashroomMirror',(x,-289,116),80)
    for x,y in [(-1080,-630),(-1090,80),(310,-190),(1150,730),(320,720),(1100,-180)]:
        prop('pottedPlant','IndoorPlant',(x,y,4),145)
    for x in [-2250,-1350,1350,2250]:
        prop('light-curved','StreetLamp',(x,-1120,7),460,0,'Campus/Street')
        prop('tree_default','StreetTree',(x,-2130,0),430,0,'Campus/Park')
    for i,(x,y) in enumerate([(-1600,-2460),(-1150,-3200),(-2300,-3200),(1520,-2440),(2400,-2750),(-2500,-2250),(2300,-3650),(-1600,-3750),(1450,-3750)]):
        prop(['tree_default','tree_detailed','tree_cone'][i%3],'ParkTree',(x,y,0),450+(i%3)*70,i*37,'Campus/Park')
    for x in [-1200,-550,500,1200]:
        prop('bench','ParkBench',(x,-2610,7),90,180,'Campus/Park')
        prop('plant_bush','ParkShrub',(x,-3070,0),75,0,'Campus/Park')
    for x in [-1600,-900,900,1600]:
        for offset in [-35,35]:prop('flower_yellowA','Flowers',(x+offset,-2220,0),40,0,'Campus/Park')
    prop('trashcan','PublicBin',(-220,-2140,7),95,0,'Campus/Park')
    sign('COMMON GROUND',(0,-817,270),-90,46)
    sign('MEETING',(790,-70,260),-90,24)
    sign('COFFEE & CONVERSATION',(-260,783,245),-90,24)
    sign('PARK',(0,-2110,80),-90,35)
    start=spawn(u.PlayerStart,'CampusStart',(0,-1050,110),rotation=(0,90,0),folder='Campus/Gameplay')
    # Persist all generated/imported assets and use an architectural overview camera.
    u.EditorAssetLibrary.save_directory('/Game/Campus',only_if_is_dirty=True,recursive=True)
    L.save_current_level()
    u.EditorLevelLibrary.set_level_viewport_camera_info(u.Vector(-2700,-3400,2450),u.Rotator(pitch=-30,yaw=48,roll=0))
    report={'status':'complete','map':map_path,'actors_created':len(created),'imported_meshes':{k:v.get_path_name() for k,v in assets.items()},'scope':'Visual environment prototype; multiplayer, walking controller and character animations not implemented.'}
    with open(REPORT,'w',encoding='utf-8') as f:json.dump(report,f,indent=2)
    say('BUILD_COMPLETE actors='+str(len(created)))

try:
    build()
except Exception:
    err=traceback.format_exc()
    say(err)
    with open(REPORT,'w',encoding='utf-8') as f:json.dump({'status':'error','error':err,'actors_created':len(created)},f,indent=2)
    raise
