import unreal as u,gc,types,json,pathlib
def inspect_running_office_test():
 rows=[]
 for f in gc.get_objects():
  if isinstance(f,types.FunctionType) and f.__name__=='tick' and f.__code__.co_filename.endswith('test_office_interaction.py'):
   d=f.__globals__;row={'ctx':str(d.get('ctx')),'checks':d.get('result',{}).get('checks')}
   try:row['game_time']=u.GameplayStatics.get_time_seconds(d['w']);row['transition']=d['h'].get_editor_property('SeatTransition')
   except:pass
   rows.append(row)
 pathlib.Path(u.Paths.project_saved_dir(),'running-office-test.json').write_text(json.dumps(rows,indent=2))
inspect_running_office_test()
