import unreal as u
lib=u.get_default_object(u.load_class(None,'/Script/UMG.WidgetBlueprintLibrary'))
lib.call_method('SetFocusToGameViewport')
