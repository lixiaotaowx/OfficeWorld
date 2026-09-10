"""Actual UE viewport evidence, no user input/focus control."""
from ue_mcp import UnrealMCP
import json,base64,pathlib
root=pathlib.Path(__file__).resolve().parents[1];out=root/'Design/ExtensionEvidence';out.mkdir(exist_ok=True);c=UnrealMCP()
views=[('Billiards',(865,-1010,175),(-16,-35,0)),('Fitness',(865,-480,170),(-13,-35,0)),('Meeting',(860,0,170),(-14,-35,0)),('Restroom',(1130,250,160),(-22,10,0)),('Restroom_Vanity',(1000,175,160),(-15,-35,0)),('Corridor',(700,530,170),(-4,-90,0))]
for name,p,r in views:
 result=c.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'EditorToolset.EditorAppToolset','tool_name':'CaptureViewport','arguments':{'captureTransform':{'location':dict(zip(['x','y','z'],p)),'rotation':dict(zip(['pitch','yaw','roll'],r))},'annotations':None,'bShowUI':False}}})
 for item in result.get('content',[]):
  im=item if item.get('type')=='image' else json.loads(item['text']).get('returnValue',{}).get('image') if item.get('type')=='text' else None
  if im:(out/(name+'.png')).write_bytes(base64.b64decode(im['data']));print(name,flush=True)
