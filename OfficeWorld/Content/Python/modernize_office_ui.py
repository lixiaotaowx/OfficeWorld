"""Restyle the existing HUD without replacing widget identities or event graphs."""
import unreal as u
import json, pathlib, traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
from editor_toolset.toolsets.object import ObjectTools as O

root = pathlib.Path(u.Paths.project_saved_dir())
result = {}
try:
    bp = u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD')
    T = u.get_default_object(u.UMGToolSet)
    W = {str(i.widget_name): i.widget for i in T.call_method('GetWidgets', (bp,)).widgets}
    ink = (.026, .047, .037, 1)
    muted = (.20, .25, .22, 1)
    paper = (.94, .945, .91, .985)
    green = (.035, .115, .075, 1)
    pale = (.79, .845, .77, 1)
    def color(c): return u.SlateColor(specified_color=u.LinearColor(*c))
    def brush(c, radius=16, border=True):
        b = u.SlateBrush()
        b.set_editor_property('draw_as', u.SlateBrushDrawType.ROUNDED_BOX)
        b.set_editor_property('tint_color', color(c))
        o = b.get_editor_property('outline_settings')
        o.set_editor_property('corner_radii', u.Vector4(radius,radius,radius,radius))
        o.set_editor_property('rounding_type', u.SlateBrushRoundingType.FIXED_RADIUS)
        o.set_editor_property('width', 1 if border else 0)
        o.set_editor_property('color', color((.57,.64,.55,.42)))
        b.set_editor_property('outline_settings', o)
        return b
    def rect(name,x,y,w,h,ax=None,ay=None):
        s=W[name].slot
        if ax is not None: s.set_anchors(u.Anchors(u.Vector2D(ax,ay),u.Vector2D(ax,ay)))
        s.set_position(u.Vector2D(x,y)); s.set_size(u.Vector2D(w,h))
    def font(w,size,bold=False):
        f=w.font; f.size=size; f.typeface_font_name='Bold' if bold else 'Regular'; w.set_font(f)
    def label(name,value,x,y,width,size=15,parent=None,c=ink,bold=False,height=32):
        if name not in W:
            info=T.call_method('AddWidget',(bp,u.TextBlock.static_class(),name,W[parent],-1))
            W[name]=info.widget; O.list_properties(info.widget); O.list_properties(info.slot)
        w=W[name]; w.set_text(value);font(w,size,bold);w.set_color_and_opacity(color(c))
        w.set_auto_wrap_text(True);rect(name,x,y,width,height)
        w.set_visibility(u.SlateVisibility.HIT_TEST_INVISIBLE)
        return w
    def tile(name,parent,x,y,width,height,c):
        if name not in W:
            info=T.call_method('AddWidget',(bp,u.Border.static_class(),name,W[parent],-1))
            W[name]=info.widget;O.list_properties(info.widget);O.list_properties(info.slot)
        W[name].set_brush(brush(c,12,False));rect(name,x,y,width,height)
        W[name].set_visibility(u.SlateVisibility.HIT_TEST_INVISIBLE)
        W[name].slot.set_z_order(-1)
    for name,w in list(W.items()):
        if isinstance(w,u.Border):w.set_brush(brush(paper,20));w.set_padding(u.Margin(0))
        if isinstance(w,u.TextBlock):
            w.set_color_and_opacity(color(ink));font(w,16)
            w.set_shadow_offset(u.Vector2D(0,0))
        if isinstance(w,u.Button):
            primary=name in ['SeatButton','InteractButton','AllowIncoming','CloseHelp','DemoAllow']
            s=w.widget_style
            s.set_editor_property('normal',brush(green if primary else (.84,.875,.82,1),12,False))
            s.set_editor_property('hovered',brush((.07,.20,.12,1) if primary else (.72,.80,.70,1),12,False))
            s.set_editor_property('pressed',brush((.018,.07,.04,1) if primary else (.63,.72,.61,1),12,False))
            s.set_editor_property('disabled',brush((.75,.77,.73,1),12,False))
            w.set_style(s);w.set_background_color(u.LinearColor(1,1,1,1))
            if name+'Label' in W:
                tx=W[name+'Label'];font(tx,15,True);tx.set_color_and_opacity(color((.98,.99,.96,1) if primary else ink))
    # Apply label colors after the generic text pass, which also visits children.
    for n in ['SeatButton','InteractButton','AllowIncoming','CloseHelp','DemoAllow']:
        W[n+'Label'].set_color_and_opacity(color((.98,.99,.96,1)))
        font(W[n+'Label'],15,True)
    rect('OfficeHeader',28,26,320,100,0,0)
    label('OfficeTitle','林间',24,18,100,27,bold=True)
    label('BrandEnglish','OFFICE / WORLD',116,28,185,11,parent='OfficeHeaderContent',c=muted)
    label('ConnectionStatus','共享空间  /  本地演示',24,65,272,13,c=muted)
    rect('SessionStatusPanel',-354,26,326,48,1,0)
    W['SessionStatusPanel'].set_padding(u.Margin(18,12,18,8))
    font(W['SessionStatusText'],13);W['SessionStatusText'].set_color_and_opacity(color(ink))
    rect('Toolbar',-352,-104,704,76,.5,1)
    for n,x,width in [('PeopleButton',12,104),('SeatButton',124,152),('ShareButton',284,124),('RequestsButton',416,124),('HelpButton',548,144)]:rect(n,x,12,width,52)
    W['PeopleButtonLabel'].set_text('同事');W['HelpButtonLabel'].set_text('操作指南')
    label('KeyboardGuide','W A S D  移动     /     TAB  切换鼠标与视角',-220,-145,440,12,parent='RootCanvas',c=(.96,.98,.93,1))
    W['KeyboardGuide'].slot.set_anchors(u.Anchors(u.Vector2D(.5,1),u.Vector2D(.5,1)))
    rect('NearbyCard',-388,-374,360,220,1,1)
    rect('NearbyTitle',24,22,312,36);font(W['NearbyTitle'],23,True)
    rect('NearbyDetail',24,68,312,40);W['NearbyDetail'].set_color_and_opacity(color(muted))
    rect('InteractButton',24,116,312,48)
    rect('NearbyHint',24,181,316,28);font(W['NearbyHint'],12);W['NearbyHint'].set_color_and_opacity(color(muted))
    rect('PeoplePanel',-354,94,326,412,1,0)
    label('PeopleTitle','空间成员',24,24,260,23,bold=True)
    label('PeopleSubtitle','4 个工位  ·  演示成员',24,62,275,13,parent='PeoplePanelContent',c=muted)
    W['PeopleList'].set_visibility(u.SlateVisibility.COLLAPSED)
    for i,(initial,name,seat,status,tint) in enumerate([
        ('我','你','A-01','我的工位',pale),('林','林可','A-02','可协作',pale),
        ('周','周晨','A-03','专注中',(.89,.82,.65,1)),('陈','陈一','A-04','离线',(.80,.82,.79,1))]):
        y=108+i*60
        tile('MemberAvatar'+str(i),'PeoplePanelContent',24,y,40,40,tint)
        label('MemberInitial'+str(i),initial,35,y+8,25,17,parent='PeoplePanelContent',bold=True)
        label('MemberName'+str(i),name,78,y-1,120,16,parent='PeoplePanelContent',bold=True)
        label('MemberSeat'+str(i),seat,78,y+25,110,11,parent='PeoplePanelContent',c=muted)
        label('MemberState'+str(i),status,224,y+10,90,12,parent='PeoplePanelContent',c=muted)
    rect('ClosePeople',24,354,278,38)
    for n in ['RequestTitle','IncomingTitle','ViewingTitle','ShareTitle','HelpTitle']:
        font(W[n],25,True)
    for n in ['RequestMeta','IncomingFoot','NearbyHint']:
        font(W[n],13);W[n].set_color_and_opacity(color(muted))
    rect('HelpPanel',-270,-228,540,456,.5,.5)
    label('HelpEyebrow','QUICK START',28,25,400,11,parent='HelpPanelContent',c=muted,bold=True)
    label('HelpTitle','进入你的工作节奏',28,57,484,27,bold=True,height=44)
    label('HelpIntro','自由走动，找到工位，与身边的同事协作。',28,113,484,14,parent='HelpPanelContent',c=muted)
    label('HelpBody','W A S D     自由移动，鼠标环顾四周\nTAB            切换鼠标操作 / 视角控制\n自己的工位    坐下或站起\n同事的工位    发起屏幕观看申请',40,179,465,16,height=154)
    tile('HelpInstructionTile','HelpPanelContent',28,164,484,166,(.84,.88,.81,1))
    label('HelpPrivacy','分享由你决定。观看前需要对方同意。',28,347,484,13,parent='HelpPanelContent',c=muted)
    rect('CloseHelp',28,390,484,44);W['CloseHelpLabel'].set_text('开始探索')
    rect('ViewingPanel',-340,-232,680,464,.5,.5)
    tile('ScreenPlaceholderTile','ViewingPanelContent',26,88,628,274,(.82,.86,.80,1))
    rect('ViewingPlaceholder',52,128,570,205);font(W['ViewingPlaceholder'],20)
    rect('EndViewing',26,392,628,46)
    rect('NoticePanel',-300,144,600,64,.5,0)
    W['NoticePanel'].set_brush(brush(green,16));W['NoticeText'].set_color_and_opacity(color((.98,.99,.96,1)))
    for n in ['RequestPanel','IncomingPanel','ViewingPanel','SharePanel','HelpPanel']:W[n].slot.set_z_order(20)
    W['NoticePanel'].slot.set_z_order(30)
    B.compile_blueprint(bp)
    errors=u.BlueprintGraphEditor.get_graph_editor(B.get_graph(bp,'EventGraph')).list_nodes_with_errors()
    assert not errors,str(errors)
    u.EditorAssetLibrary.save_loaded_asset(bp)
    result.update(saved=True,widget_count=len(W),graph_errors=str(errors))
except Exception:
    result['error']=traceback.format_exc()
(root/'office-ui-modern.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
