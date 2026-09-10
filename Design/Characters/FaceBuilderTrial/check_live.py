import bpy,sys,addon_utils
path='G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/addons'
if path not in sys.path:sys.path.insert(0,path)
addon_utils.enable('keentools',default_set=True)
from keentools.blender_independent_packages.pykeentools_loader import module
from keentools.facebuilder.fbloader import FBLoader
from keentools.addon_config import fb_settings
fb=FBLoader.get_builder()
lm=fb.license_manager()
result=lm.perform_license_and_trial_check(strategy=module().LicenseCheckStrategy.FORCE)
print('LICENSE',lm.license_status_text())
for field in ['license_status','trial_status']:
    item=getattr(result[0],field,None)
    print(field,[(k,getattr(item,k,None)) for k in ['status','message']])
print('HEADS',len(fb_settings().heads))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.show_region_ui=True
