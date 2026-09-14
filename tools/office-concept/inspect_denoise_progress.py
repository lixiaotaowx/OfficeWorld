import bpy
step=bpy.app.driver_namespace.get('office_denoise_step')
if step:
 state=step.__globals__['state'];processor=step.__globals__['processor']
 processor[0].cycles.device='GPU'
 print('Progress',len(state['done']),state['current'],'processing device',processor[0].cycles.device)
