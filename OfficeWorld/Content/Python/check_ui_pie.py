import unreal as u,json,pathlib,traceback
r={}
try:
 w=u.EditorLevelLibrary.get_game_world();pc=u.GameplayStatics.get_player_controller(w,0);p=u.GameplayStatics.get_player_pawn(w,0)
 r.update(world=str(w),pc=str(pc),pawn=str(p),cursor=pc.show_mouse_cursor)
 cls=u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C')
 lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'))
 widgets=lib.call_method('GetAllWidgetsOfClass',(w,cls,False))
 r['widgets']=[]
 for h in widgets:r['widgets'].append({'path':h.get_path_name(),'owner':str(h.get_owning_player()),'pawn':str(h.get_owning_player_pawn()),'near':h.get_editor_property('NearbyIndex'),'seated':h.get_editor_property('Seated'),'request':h.get_editor_property('RequestState'),'sharing':h.get_editor_property('Sharing'),'screen':h.is_in_viewport()})
 if p:r['location']=str(p.get_actor_location())
 r['menu_open']=widgets[0].get_editor_property('MenuOpen')
except Exception:r['error']=traceback.format_exc()
pathlib.Path(u.Paths.project_saved_dir(),'ui-pie-check.json').write_text(json.dumps(r,indent=2))
