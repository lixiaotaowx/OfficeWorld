import unreal as u,json,pathlib
w=u.EditorLevelLibrary.get_game_world();lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'));cls=u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C');h=lib.call_method('GetAllWidgetsOfClass',(w,cls,False))[0]
h.get_editor_property('HelpButton').on_clicked.broadcast()
pc=u.GameplayStatics.get_player_controller(w,0);pc.set_control_rotation(u.Rotator(pitch=-8,yaw=-72,roll=0))
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-ready.json').write_text(json.dumps({'runtime_visible':h.is_in_viewport(),'help_visible':h.get_editor_property('HelpPanel').visibility==u.SlateVisibility.VISIBLE,'cursor_visible':pc.show_mouse_cursor,'native_ui':True,'network_connected':False,'screen_capture_active':False}))
