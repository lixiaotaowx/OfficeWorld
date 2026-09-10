"""Native Blueprint state machine and UMG event bindings, local consent demo only."""
import unreal as u,json,pathlib,traceback,re
from editor_toolset.toolsets.blueprint import BlueprintTools as B,_BlueprintCache
root=pathlib.Path(u.Paths.project_saved_dir());r={};lang=u.InternationalizationLibrary.get_current_language()
def q(s):return json.dumps(s,ensure_ascii=False)
try:
 u.InternationalizationLibrary.set_current_language('en')
 bp=u.load_asset('/Game/OfficeInteraction/UI/WBP_OfficeHUD');g=B.get_graph(bp,'EventGraph')
 for name,kind in [('NearbyIndex','int'),('Seated','bool'),('RequestState','int'),('RequestDeadline','float'),('Sharing','bool'),('NoticeDeadline','float'),('ReturnLocation','Vector'),('MenuOpen','bool')]:
  if name not in list(B.list_variables(bp)):B.add_variable(bp,name,kind)
 if 'SeatCamera' not in list(B.list_variables(bp)):B.add_object_variable(bp,'SeatCamera',u.Actor.static_class())
 _BlueprintCache.invalidate(bp)
 def typ(suffix):
  vals=list(B.find_node_types(g,suffix));exact=[v for v in vals if v.rsplit('|',1)[-1].lower()==suffix.lower()]
  if not exact:raise RuntimeError('Missing type '+suffix+' '+str(vals[:8]))
  return exact[0]
 def get(n):return '('+typ('Get'+n)+')'
 def setv(n,v):return '('+typ('Set'+n)+' '+v+')'
 def vis(n,on=True):return '(Widget|SetVisibility :self '+get(n)+' :InVisibility '+q('Visible' if on else 'Collapsed')+')'
 def txt(n,v):return '(Widget|SetText(Text) :self '+get(n)+' :InText '+q(v)+')'
 def ev(n,s):return '(event '+q('UserInterface|'+n if n in ['EventConstruct','EventTick'] else n)+'\n'+s+'\n)'
 def call(suffix,**kw):return '('+typ(suffix)+' '+ ' '.join(':'+k+' '+v for k,v in kw.items())+')'
 def notice(s):return txt('NoticeText',s)+'\n'+vis('NoticePanel')+'\n'+setv('NoticeDeadline','(+ (Utilities|Time|GetGameTimeinSeconds) 4.0)')
 panels=['RequestPanel','IncomingPanel','ViewingPanel','SharePanel','HelpPanel','PeoplePanel']
 def close():return '\n'.join(vis(p,False) for p in panels)
 pc='(Widget|GetOwningPlayer)';pawn='(Player|GetOwningPlayerPawn)'
 # Save discovered exact pins for calls used below; errors are reported before claiming success.
 keytypes=['SetActorLocation','SetActorEnableCollision','SetViewTargetwithBlend','SetIgnoreMoveInput','GetActorLocation','SetInputModeGameAndUI','SetInputModeGameOnly','SetShowMouseCursor','WasInputKeyJustPressed']
 r['pin_docs']={t:str(B.get_node_type_pins(g,typ(t))) for t in keytypes}
 nodes=[]
 nodes.append(ev('EventConstruct',setv('NearbyIndex','0')+'\n'+setv('MenuOpen','true')+'\n'+call('SetShowMouseCursor',self=pc,bShowMouseCursor='true')+'\n'+call('SetInputModeGameAndUI',PlayerController=pc)))
 nodes.append(ev('OnClicked(PeopleButton)',close()+'\n'+vis('PeoplePanel')))
 nodes.append(ev('OnClicked(ClosePeople)',vis('PeoplePanel',False)))
 nodes.append(ev('OnClicked(HelpButton)',close()+'\n'+vis('HelpPanel')))
 nodes.append(ev('OnClicked(CloseHelp)',vis('HelpPanel',False)))
 nodes.append(ev('OnClicked(ShareButton)',close()+'\n'+vis('SharePanel')))
 nodes.append(ev('OnClicked(RequestsButton)',close()+'\n(if (== '+get('RequestState')+' 1) '+vis('RequestPanel')+' (else '+notice('没有等待中的请求。靠近同事工位可以申请观看。')+'))'))
 request='''(if (== NEAR 2)
 (if (== STATE 1) SHOW (else CLOSE START DEADLINE BODY SHOW))
 (else NOTICE))'''.replace('NEAR',get('NearbyIndex')).replace('STATE',get('RequestState')).replace('SHOW',vis('RequestPanel')).replace('CLOSE',close()).replace('START',setv('RequestState','1')).replace('DEADLINE',setv('RequestDeadline','(+ (Utilities|Time|GetGameTimeinSeconds) 30.0)')).replace('BODY',txt('RequestBody','已向林可申请仅观看屏幕。\n等待回应，30 秒后自动结束。')).replace('NOTICE',notice('此工位暂不能申请观看。自己的屏幕请使用“我的分享”。'))
 nodes.append(ev('OnClicked(InteractButton)',request))
 nodes.append(ev('OnClicked(CancelRequest)',setv('RequestState','4')+'\n'+vis('RequestPanel',False)+'\n'+notice('已取消观看请求，权限没有开启。')))
 valid='(and (== '+get('RequestState')+' 1) (< (Utilities|Time|GetGameTimeinSeconds) '+get('RequestDeadline')+'))'
 nodes.append(ev('OnClicked(DemoAllow)','(if '+valid+' '+setv('RequestState','2')+' '+vis('RequestPanel',False)+' '+vis('ViewingPanel')+' (else '+notice('请求已失效，请重新发起。')+'))'))
 nodes.append(ev('OnClicked(DemoDeny)','(if '+valid+' '+setv('RequestState','3')+' '+vis('RequestPanel',False)+' '+notice('林可拒绝了本次观看请求。')+')'))
 nodes.append(ev('OnClicked(EndViewing)',setv('RequestState','0')+' '+vis('ViewingPanel',False)+' '+notice('观看已结束，本次授权已撤销。')))
 nodes.append(ev('OnClicked(DemoIncoming)',close()+' '+vis('IncomingPanel')))
 nodes.append(ev('OnClicked(AllowIncoming)',setv('Sharing','true')+' '+vis('IncomingPanel',False)+' '+txt('ShareStatus','演示授权已允许：林可 · 仅观看\n尚未捕获或传输真实屏幕。')+' '+vis('SharePanel')))
 nodes.append(ev('OnClicked(DenyIncoming)',vis('IncomingPanel',False)+' '+notice('已拒绝本次观看申请。')))
 nodes.append(ev('OnClicked(StopSharing)',setv('Sharing','false')+' '+txt('ShareStatus','当前没有人在观看。')+' '+vis('SharePanel',False)+' '+notice('分享已停止，观看权限已撤销。')))
 # Seat camera is injected by the level bootstrap. Player returns to their exact pre-seat position.
 sit='\n'.join([setv('ReturnLocation',call('GetActorLocation',self=pawn)),call('SetIgnoreMoveInput',self=pc,bNewMoveInput='true'),call('SetActorEnableCollision',self=pawn,bNewActorEnableCollision='false'),call('SetActorLocation',self=pawn,NewLocation='(Math|Vector|MakeVector :X -355.0 :Y -125.0 :Z 88.0)',bSweep='false',bTeleport='true'),call('SetViewTargetwithBlend',self=pc,NewViewTarget=get('SeatCamera'),BlendTime='0.35'),setv('Seated','true'),txt('SeatButtonLabel','站起来'),notice('已坐在自己的工位。点击“站起来”离开。')])
 stand='\n'.join([call('SetActorLocation',self=pawn,NewLocation=get('ReturnLocation'),bSweep='false',bTeleport='true'),call('SetActorEnableCollision',self=pawn,bNewActorEnableCollision='true'),call('ResetIgnoreMoveInput',self=pc),call('SetViewTargetwithBlend',self=pc,NewViewTarget=pawn,BlendTime='0.35'),setv('Seated','false'),txt('SeatButtonLabel','坐下 / 站起'),notice('已站起，可以继续走动。')])
 nodes.append(ev('OnClicked(SeatButton)','(if '+get('Seated')+' '+stand+' (elif (== '+get('NearbyIndex')+' 1) '+sit+' (else '+notice('请先走到自己的 A-01 椅子旁，同事的座位不能直接占用。')+')))'))
 # Poll spatial context. All participant data below is deliberately local demo data.
 tick='(bind loc '+call('GetActorLocation',self=pawn)+')\n'+setv('NearbyIndex','0')+'\n'
 for i,(x,y,title,detail,label) in enumerate([(-355,-125,'你的工位 · A-01','自己的座位 · 可以坐下办公','我的工位'),(-25,-125,'林可 · A-02','可协作 · 观看需要本人允许','申请观看屏幕'),(-355,275,'周晨 · A-03','专注中 · 暂不接受观看申请','专注中'),(-25,275,'陈一 · A-04','离线 · 暂时无法联系','同事离线')],1):
  dist='(Math|Vector|VectorLengthXY (- loc (Math|Vector|MakeVector :X '+str(x)+'.0 :Y '+str(y)+'.0 :Z 88.0)))'
  tick+='(if (< '+dist+' 155.0) '+setv('NearbyIndex',str(i))+' '+txt('NearbyTitle',title)+' '+txt('NearbyDetail',detail)+' '+txt('InteractButtonLabel',label)+')\n'
 tick+='(if (> '+get('NearbyIndex')+' 0) '+vis('NearbyCard')+' (else '+vis('NearbyCard',False)+'))\n'
 tick+='(if (and (== '+get('RequestState')+' 1) (>= (Utilities|Time|GetGameTimeinSeconds) '+get('RequestDeadline')+')) '+setv('RequestState','5')+' '+vis('RequestPanel',False)+' '+notice('对方未回应，请求已超时。你可以稍后重试。')+')\n'
 tick+='(if (> (Utilities|Time|GetGameTimeinSeconds) '+get('NoticeDeadline')+') '+vis('NoticePanel',False)+')\n'
 key=call('WasInputKeyJustPressed',self=pc,Key='"Tab"')
 tick+='(if '+key+' (if '+get('MenuOpen')+' '+call('SetInputModeGameOnly',PlayerController=pc)+' '+call('SetShowMouseCursor',self=pc,bShowMouseCursor='false')+' '+setv('MenuOpen','false')+' (else '+call('SetInputModeGameAndUI',PlayerController=pc)+' '+call('SetShowMouseCursor',self=pc,bShowMouseCursor='true')+' '+setv('MenuOpen','true')+')))'
 nodes.append(ev('EventTick',tick))
 code='\n\n'.join(nodes);(root/'office-ui-logic.dsl').write_text(code,encoding='utf-8')
 from editor_toolset.toolsets import blueprint_dsl as D
 def create(graph,type_id,pos=u.Vector2D(),declaring_class=None):
  if type_id=='Utilities|FlowControl|Branch':return u.BlueprintGraphEditor.get_graph_editor(graph).add_branch_node()
  node=B.create_node(graph,type_id,pos,declaring_class)
  assert node,'Cannot create '+type_id
  return node
 D.Transpiler(g,create,B.connect_pins,B._get_node_info,B.set_pin_value,lambda graph:B.find_nodes(graph),delete_node_fn=B.delete_node,find_node_types_fn=lambda f:B.find_node_types(g,f)).transpile(code)
 B.compile_blueprint(bp)
 errors=u.BlueprintGraphEditor.get_graph_editor(g).list_nodes_with_errors();assert not errors,str(errors)
 u.EditorAssetLibrary.save_loaded_asset(bp);r['compiled']=True;r['events']=len(nodes)
except Exception:r['error']=traceback.format_exc()
finally:u.InternationalizationLibrary.set_current_language(lang)
(root/'office-ui-wiring.json').write_text(json.dumps(r,indent=2,ensure_ascii=False,default=str),encoding='utf-8')
