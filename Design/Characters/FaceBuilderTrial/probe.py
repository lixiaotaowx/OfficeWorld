import sys, pathlib, traceback
import bpy, addon_utils
root = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(root/'addons'))
try:
    addon_utils.enable('keentools', default_set=True)
    from keentools.blender_independent_packages.pykeentools_loader import module
    pkt = module()
    print('CORE_LOADED', pkt)
    from keentools.facebuilder.fbloader import FBLoader
    fb = FBLoader.get_builder()
    print('BUILDER_CREATED', [x for x in dir(fb) if not x.startswith('_')])
except Exception:
    traceback.print_exc()
