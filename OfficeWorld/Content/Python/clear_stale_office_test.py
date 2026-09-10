import unreal as u
import gc,types
for office_obj in gc.get_objects():
 if isinstance(office_obj,types.FunctionType) and office_obj.__name__=='tick' and office_obj.__code__.co_filename.endswith('test_office_interaction.py'):
  office_ctx=office_obj.__globals__.get('ctx',{})
  if office_ctx.get('handle'):
   try:u.unregister_slate_post_tick_callback(office_ctx['handle'])
   except Exception:pass
   office_ctx['handle']=None
if 'ctx' in globals() and isinstance(ctx,dict) and ctx.get('handle'):
 try:u.unregister_slate_post_tick_callback(ctx['handle'])
 except Exception:pass
 ctx['handle']=None
