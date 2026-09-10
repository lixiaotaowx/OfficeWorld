"""Build native UMG assets; no browser UI and no desktop capture."""
import unreal as u,json,pathlib,traceback
from editor_toolset.toolsets.blueprint import BlueprintTools as B
from editor_toolset.toolsets.object import ObjectTools as O
r={};root=pathlib.Path(u.Paths.project_saved_dir());T=u.get_default_object(u.UMGToolSet)
bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');seen=set();W={}
def add(cls,name,parent=None):
 info=T.call_method('AddWidget',(bp,cls.static_class(),name,parent,-1));w=info.widget;W[name]=w
 if cls not in seen:
  seen.add(cls);O.list_properties(w)
 if info.slot:O.list_properties(info.slot)
 T.call_method('ToggleWidgetAsVariable',(bp,w,True));return w
def place(w,x,y,width,height,ax=0,ay=0):
 s=w.slot;s.set_anchors(u.Anchors(u.Vector2D(ax,ay),u.Vector2D(ax,ay)));s.set_position(u.Vector2D(x,y));s.set_size(u.Vector2D(width,height));return w
def text(name,value,x,y,width,size=18,parent=None,color=(.91,.94,.90,1)):
 w=add(u.TextBlock,name,parent or canvas);w.set_text(value);f=w.font;f.size=size;f.typeface_font_name='Regular';w.set_font(f);w.set_color_and_opacity(u.SlateColor(specified_color=u.LinearColor(*color)));w.set_auto_wrap_text(True);place(w,x,y,width,60);return w
def panel(name,x,y,width,height,ax=0,ay=0,hidden=False):
 w=add(u.Border,name,canvas);w.set_brush_color(u.LinearColor(.035,.048,.041,.96));w.set_padding(u.Margin(0));place(w,x,y,width,height,ax,ay)
 if hidden:w.set_visibility(u.SlateVisibility.COLLAPSED)
 return add(u.CanvasPanel,name+'Content',w)
def button(name,label,x,y,width=160,parent=None,primary=False):
 w=add(u.Button,name,parent or canvas);place(w,x,y,width,46)
 w.set_background_color(u.LinearColor(*((.32,.51,.35,1) if primary else (.17,.22,.18,1))))
 tx=add(u.TextBlock,name+'Label',w);tx.set_text(label);f=tx.font;f.size=16;f.typeface_font_name='Regular';tx.set_font(f)
 T.call_method('BindToEventProperty',(bp,'OnClicked',name,u.Button.static_class()));return w
try:
 assert not list(T.call_method('GetWidgets',(bp,)).widgets),'Layout already exists; edit instead of replacing'
 canvas=add(u.CanvasPanel,'RootCanvas')
 p=panel('OfficeHeader',24,24,380,90)
 text('OfficeTitle','林间 · 虚拟办公室',20,14,340,23,p)
 text('ConnectionStatus','本地交互演示  ·  屏幕传输未连接',20,52,345,14,p,(.63,.73,.63,1))
 p=panel('Toolbar',-370,-90,740,66,.5,1)
 button('PeopleButton','同事',12,10,106,p);button('SeatButton','坐下 / 站起',130,10,158,p,True)
 button('ShareButton','我的分享',300,10,132,p);button('RequestsButton','请求中心',444,10,132,p);button('HelpButton','操作帮助',588,10,140,p)
 p=panel('NearbyCard',-398,-336,374,222,1,1,True)
 text('NearbyTitle','靠近工位',22,18,330,23,p)
 text('NearbyDetail','靠近工位后可以发起协作',22,60,330,16,p)
 button('InteractButton','申请观看屏幕',22,113,330,p,True)
 text('NearbyHint','观看需要对方同意 · 仅观看',22,177,330,14,p,(.65,.75,.65,1))
 p=panel('PeoplePanel',-342,24,318,294,1,0,True)
 text('PeopleTitle','办公室同事 · 演示数据',20,18,280,21,p)
 text('PeopleList','你                 A-01  自己\n\n林可               A-02  可协作\n\n周晨               A-03  专注中\n\n陈一               A-04  离线',20,62,280,17,p)
 button('ClosePeople','收起',20,232,278,p)
 p=panel('RequestPanel',-240,-186,480,372,.5,.5,True)
 text('RequestTitle','观看屏幕请求',26,24,428,25,p)
 text('RequestBody','等待对方回应。对方可以拒绝。',26,78,428,18,p)
 text('RequestMeta','本地流程测试 · 不会获取真实屏幕',26,164,428,14,p,(.72,.78,.68,1))
 button('CancelRequest','取消请求',26,216,428,p)
 button('DemoAllow','演示：对方允许',26,280,208,p,True)
 button('DemoDeny','演示：对方拒绝',246,280,208,p)
 p=panel('IncomingPanel',-240,-185,480,370,.5,.5,True)
 text('IncomingTitle','林可想观看你的屏幕',26,24,428,25,p)
 text('IncomingBody','权限：仅观看\n你可以随时停止分享。\n本次为本地请求演示。',26,82,428,18,p)
 button('AllowIncoming','允许本次观看',26,206,208,p,True);button('DenyIncoming','拒绝',246,206,208,p)
 text('IncomingFoot','真实连接时，允许后仍需选择分享窗口。',26,284,428,15,p,(.70,.77,.69,1))
 p=panel('ViewingPanel',-340,-212,680,424,.5,.5,True)
 text('ViewingTitle','林可的屏幕  ·  仅观看',26,22,620,24,p)
 text('ViewingPlaceholder','授权流程已通过\n\n屏幕传输尚未连接\n这里将显示对方明确选择的窗口。',26,108,620,22,p)
 button('EndViewing','结束观看',26,346,628,p)
 p=panel('SharePanel',-230,-166,460,332,.5,.5,True)
 text('ShareTitle','我的屏幕分享',26,24,408,25,p)
 text('ShareStatus','当前没有人在观看。',26,85,408,18,p)
 button('StopSharing','停止分享 / 关闭',26,180,408,p)
 button('DemoIncoming','演示：收到观看申请',26,244,408,p)
 p=panel('HelpPanel',-250,-175,500,350,.5,.5,True)
 text('HelpTitle','在办公室里协作',26,24,450,25,p)
 text('HelpBody','W A S D 移动 · 鼠标看向四周\n靠近工位，点击交互卡片\n自己的椅子：坐下 / 站起\n同事工位：申请观看屏幕\n专注或离线的同事暂不接受申请',26,84,448,18,p)
 button('CloseHelp','知道了',26,268,448,p,True)
 p=panel('NoticePanel',-320,128,640,62,.5,0,True)
 text('NoticeText','',18,17,610,17,p)
 B.compile_blueprint(bp);u.EditorAssetLibrary.save_loaded_asset(bp)
 g=B.get_graph(bp,'EventGraph')
 r['layout_saved']=True;r['widget_count']=len(W);r['events']=B.read_graph_dsl(g)
 queries=['创建','控件','ShowMouse','光标','IsInputKey','JustPressed','EventTick','Tick','Vector','Subtract','Distance','GetAllActors','ActorHasTag','SetIgnore','MovementMode','CharacterMovement','SetRelativeLocation']
 r['nodes']={q:list(B.find_node_types(g,q)) for q in queries}
except Exception:r['error']=traceback.format_exc()
(root/'office-ui-layout.json').write_text(json.dumps(r,ensure_ascii=False,indent=2,default=str),encoding='utf-8')
