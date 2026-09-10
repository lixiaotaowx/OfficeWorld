import unreal as u
import pathlib,json,traceback
def verify():
    world=u.EditorLevelLibrary.get_game_world()
    lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'))
    cls=u.load_class(None,'/Game/OfficeInteraction/UI/WBP_OfficeHUD.WBP_OfficeHUD_C')
    hud=lib.call_method('GetAllWidgetsOfClass',(world,cls,False))[0]
    checks=[]
    def visible(n):return hud.get_editor_property(n).is_visible()
    def click(n):hud.get_editor_property(n).on_clicked.broadcast()
    def expect(n,b):checks.append({'name':n,'passed':bool(b)});assert b,n
    expect('HUD mounted',hud.is_in_viewport())
    if visible('HelpPanel'):click('CloseHelp')
    click('PeopleButton');expect('members open',visible('PeoplePanel'))
    click('ClosePeople');expect('members close',not visible('PeoplePanel'))
    click('ShareButton');expect('share opens',visible('SharePanel'))
    click('StopSharing');expect('sharing stopped',not hud.get_editor_property('Sharing'))
    click('HelpButton');expect('guide opens',visible('HelpPanel'))
    # Repair the small decorative layer in both saved template and current instance.
    from editor_toolset.toolsets.blueprint import BlueprintTools as B
    bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');T=u.get_default_object(u.UMGToolSet)
    widgets={str(i.widget_name):i.widget for i in T.call_method('GetWidgets',(bp,)).widgets}
    widgets['OrbitCoreText'].slot.set_z_order(2)
    B.compile_blueprint(bp);u.EditorAssetLibrary.save_loaded_asset(bp)
    return {'passed':True,'checks':checks,'scope':'native button delegates and panel visibility; not full seat/network regression'}
try:neon_check=verify()
except Exception:neon_check={'error':traceback.format_exc()}
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-neon-check.json').write_text(json.dumps(neon_check,indent=2))
