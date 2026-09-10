"""Native dark spatial HUD. Existing input and consent graphs stay intact."""
import unreal as u
import pathlib,json,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
from editor_toolset.toolsets.object import ObjectTools as O

def build():
    bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD')
    T=u.get_default_object(u.UMGToolSet)
    W={str(i.widget_name):i.widget for i in T.call_method('GetWidgets',(bp,)).widgets}
    white=(.84,.94,.96,1); muted=(.34,.49,.54,1); neon=(.08,.95,.62,1)
    dark=(.004,.012,.019,.97); stroke=(.065,.22,.25,.8)
    def col(c):return u.SlateColor(specified_color=u.LinearColor(*c))
    def brush(c,r=16,line=stroke,width=1):
        b=u.SlateBrush();b.set_editor_property('draw_as',u.SlateBrushDrawType.ROUNDED_BOX);b.set_editor_property('tint_color',col(c))
        o=b.get_editor_property('outline_settings');o.set_editor_property('corner_radii',u.Vector4(r,r,r,r));o.set_editor_property('rounding_type',u.SlateBrushRoundingType.FIXED_RADIUS)
        o.set_editor_property('color',col(line));o.set_editor_property('width',width);b.set_editor_property('outline_settings',o);return b
    def rect(n,x,y,w,h,ax=None,ay=None,z=None):
        s=W[n].slot;s.set_position(u.Vector2D(x,y));s.set_size(u.Vector2D(w,h))
        if ax is not None:s.set_anchors(u.Anchors(u.Vector2D(ax,ay),u.Vector2D(ax,ay)))
        if z is not None:s.set_z_order(z)
    def add(cls,n,parent):
        if n not in W:
            i=T.call_method('AddWidget',(bp,cls.static_class(),n,W[parent],-1));W[n]=i.widget;O.list_properties(i.widget);O.list_properties(i.slot)
        return W[n]
    def font(w,size,bold=False):
        f=w.font;f.size=size;f.typeface_font_name='Bold' if bold else 'Regular';w.set_font(f)
    def text(n,value,parent,x,y,w,h,size=14,c=white,bold=False):
        a=add(u.TextBlock,n,parent);a.set_text(value);a.set_color_and_opacity(col(c));font(a,size,bold);a.set_auto_wrap_text(True);a.set_visibility(u.SlateVisibility.HIT_TEST_INVISIBLE);rect(n,x,y,w,h);return a
    def box(n,parent,x,y,w,h,c=dark,r=16,line=stroke,lw=1,z=-1):
        a=add(u.Border,n,parent);a.set_brush(brush(c,r,line,lw));a.set_visibility(u.SlateVisibility.HIT_TEST_INVISIBLE);rect(n,x,y,w,h,z=z);return a
    primary=['SeatButton','InteractButton','AllowIncoming','CloseHelp','DemoAllow']
    for n,w in list(W.items()):
        if isinstance(w,u.Border):w.set_brush(brush(dark))
        if isinstance(w,u.TextBlock):w.set_color_and_opacity(col(white))
        if isinstance(w,u.Button):
            p=n in primary;s=w.widget_style
            s.set_editor_property('normal',brush(neon if p else (.015,.032,.043,1),10,neon if p else stroke))
            s.set_editor_property('hovered',brush((.28,1,.78,1) if p else (.027,.095,.10,1),10,neon,2))
            s.set_editor_property('pressed',brush((.04,.47,.32,1) if p else (.008,.025,.03,1),10,neon))
            s.set_editor_property('disabled',brush((.035,.055,.06,1),10,stroke))
            w.set_style(s);w.set_background_color(u.LinearColor(1,1,1,1))
    for n in primary:W[n+'Label'].set_color_and_opacity(col((.002,.023,.018,1)));font(W[n+'Label'],16,True)
    for n in ['ConnectionStatus','NearbyDetail','NearbyHint','RequestMeta','IncomingFoot','PeopleSubtitle','HelpPrivacy','HelpIntro','KeyboardGuide']:
        W[n].set_color_and_opacity(col(muted))
    rect('OfficeHeader',32,28,382,130,0,0)
    text('BrandEnglish','O F F I C E   /   W O R L D','OfficeHeaderContent',24,18,320,25,11,neon,True)
    text('OfficeTitle','林间空间','OfficeHeaderContent',24,47,300,48,30,white,True)
    text('ConnectionStatus','空间 01    /    本地演示','OfficeHeaderContent',24,100,300,24,12,muted)
    box('BrandRail','OfficeHeaderContent',0,42,3,46,neon,1,neon,0,1)
    rect('SessionStatusPanel',-362,28,330,48,1,0)
    W['SessionStatusText'].set_color_and_opacity(col(neon));font(W['SessionStatusText'],13)
    rect('Toolbar',-393,-112,786,86,.5,1)
    box('DockGlow','RootCanvas',-399,-118,798,98,(.025,.4,.25,.10),23,(.05,.85,.56,.25),1,-2)
    W['DockGlow'].slot.set_anchors(u.Anchors(u.Vector2D(.5,1),u.Vector2D(.5,1)))
    for n,x,width in [('PeopleButton',14,128),('SeatButton',152,156),('ShareButton',318,138),('RequestsButton',466,138),('HelpButton',614,158)]:rect(n,x,20,width,52)
    box('DockActiveLine','ToolbarContent',182,0,96,2,neon,1,neon,0,2)
    W['PeopleButtonLabel'].set_text('空间成员');W['HelpButtonLabel'].set_text('探索指南')
    rect('KeyboardGuide',-238,-147,476,25,.5,1);W['KeyboardGuide'].set_color_and_opacity(col((.67,.85,.81,1)))
    # Context panel: distinct eyebrow and luminous side rail.
    rect('NearbyCard',-408,-408,376,248,1,1)
    text('ContextEyebrow','WORKSTATION  /  交互','NearbyCardContent',24,18,330,22,10,neon,True)
    rect('NearbyTitle',24,52,328,38);rect('NearbyDetail',24,96,328,38)
    rect('InteractButton',24,143,328,48);rect('NearbyHint',24,211,332,26)
    box('ContextRail','NearbyCardContent',0,52,3,48,neon,1,neon,0,1)
    rect('PeoplePanel',-362,94,330,422,1,0)
    for i in range(4):
        W['MemberAvatar'+str(i)].set_brush(brush((.013,.075,.065,1) if i<2 else (.045,.04,.065,1),10))
        W['MemberInitial'+str(i)].set_color_and_opacity(col(neon if i<2 else (.62,.50,.94,1)))
        W['MemberState'+str(i)].set_color_and_opacity(col(neon if i<2 else muted))
        W['MemberSeat'+str(i)].set_color_and_opacity(col(muted))
    # Editorial split-panel welcome card, with native concentric orbital motif.
    rect('HelpPanel',-410,-254,820,508,.5,.5)
    text('HelpEyebrow','THE SPATIAL WORKSPACE','HelpPanelContent',34,30,490,24,11,neon,True)
    text('HelpTitle','进入空间。\n连接灵感。','HelpPanelContent',34,78,462,128,40,white,True)
    text('HelpIntro','你的下一次协作，从这里开始。','HelpPanelContent',34,215,462,30,16,muted)
    W['HelpInstructionTile'].set_visibility(u.SlateVisibility.COLLAPSED)
    text('HelpBody','W A S D   自由移动      TAB   切换鼠标\n靠近自己的工位坐下，或向同事发起观看申请。','HelpPanelContent',34,281,474,76,14,white)
    text('HelpPrivacy','由你掌控分享，每次观看都需要许可。','HelpPanelContent',34,378,472,28,12,muted)
    rect('CloseHelp',34,430,458,48);W['CloseHelpLabel'].set_text('开始探索    →')
    box('OrbitBackdrop','HelpPanelContent',524,16,280,476,(.006,.026,.035,1),15,stroke,1,-2)
    for i,(s,l) in enumerate([(228,(.025,.15,.16,1)),(172,(.04,.33,.29,1)),(108,(.08,.64,.48,1))]):
        box('OrbitRing'+str(i),'HelpPanelContent',664-s/2,222-s/2,s,s,(0,0,0,0),s/2,l,1,0)
    box('OrbitCore','HelpPanelContent',632,190,64,64,neon,32,neon,0,1)
    text('OrbitCoreText','林','HelpPanelContent',650,202,45,44,26,(.002,.023,.018,1),True)
    W['OrbitCoreText'].slot.set_z_order(2)
    box('OrbitSatellite','HelpPanelContent',754,151,10,10,(.42,.26,.95,1),5,(.42,.26,.95,1),0,2)
    box('OrbitSatellite2','HelpPanelContent',568,272,7,7,neon,4,neon,0,2)
    text('OrbitTop','S P A C E  /  0 1','HelpPanelContent',556,45,220,26,11,muted)
    text('OrbitCaption','在场，即连接','HelpPanelContent',570,367,218,40,21,white,True)
    text('OrbitFooter','LOCAL EXPERIENCE','HelpPanelContent',575,411,222,25,10,neon)
    for n in ['ScreenPlaceholderTile']:W[n].set_brush(brush((.008,.028,.039,1),12))
    W['NoticePanel'].set_brush(brush((.007,.043,.032,.98),12,(.07,.55,.34,1)))
    W['NoticeText'].set_color_and_opacity(col(neon))
    B.compile_blueprint(bp)
    errors=u.BlueprintGraphEditor.get_graph_editor(B.get_graph(bp,'EventGraph')).list_nodes_with_errors()
    assert not errors,str(errors)
    u.EditorAssetLibrary.save_loaded_asset(bp)
    return {'saved':True,'widget_count':len(W),'graph_errors':str(errors)}

try:result_neon=build()
except Exception:result_neon={'error':traceback.format_exc()}
pathlib.Path(u.Paths.project_saved_dir(),'office-ui-neon.json').write_text(json.dumps(result_neon,ensure_ascii=False,indent=2),encoding='utf-8')
