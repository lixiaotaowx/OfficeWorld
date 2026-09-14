import bpy,json
from pathlib import Path
root=Path('G:/C/wendang/ChatGPT/youxi')
state=json.loads((root/'AssetSources/OfficeConcept/Bakes_20260912/Denoised_256/progress.json').read_text(encoding='utf8'))
assert state['finished'] and not state['errors'] and len(state['done'])==131
assert not bpy.app.driver_namespace.get('office_bake_running')
def render_preview():
 s=bpy.context.scene
 old=(s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage,s.render.filepath,s.cycles.samples)
 s.render.resolution_x=1600;s.render.resolution_y=1000;s.render.resolution_percentage=100
 s.render.filepath=str(root/'Design/OfficeConcept/Denoised_Bake_Preview.png')
 s.cycles.samples=128;s.cycles.use_denoising=True
 try:bpy.ops.render.render(write_still=True)
 finally:
  s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage,s.render.filepath,s.cycles.samples=old
 return None
bpy.app.timers.register(render_preview,first_interval=1)
print('Queued actual scene render: 128 samples with denoising')
