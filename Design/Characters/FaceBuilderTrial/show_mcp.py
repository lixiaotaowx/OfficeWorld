import bpy
print('CONNECTED',bpy.app.version_string,bpy.data.filepath)
def open_trial_visible():
    bpy.ops.wm.open_mainfile(filepath='G:/C/wendang/ChatGPT/youxi/Design/Characters/FaceBuilderTrial/FaceBuilder_Trial.blend')
    return None
bpy.app.timers.register(open_trial_visible,first_interval=0.5)
