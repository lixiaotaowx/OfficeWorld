"""Native viewport capture only: never select windows or simulate input."""
from ue_mcp import UnrealMCP
import json,base64,pathlib
root=pathlib.Path(__file__).resolve().parents[1];client=UnrealMCP()
for name,location,rotation in [('UE_Window_Workstation',{'x':-200,'y':-75,'z':180},{'pitch':-12,'yaw':-140,'roll':0}),('UE_Panorama_Window',{'x':-200,'y':-75,'z':160},{'pitch':0,'yaw':180,'roll':0})]:
 r=client.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'EditorToolset.EditorAppToolset','tool_name':'CaptureViewport','arguments':{'captureTransform':{'location':location,'rotation':rotation},'annotations':None,'bShowUI':False}}})
 for c in r.get('content',[]):
  im=c if c.get('type')=='image' else json.loads(c['text']).get('returnValue',{}).get('image') if c.get('type')=='text' else None
  if im:
   p=root/'Design/Generated/CityPark'/(name+'.png');p.write_bytes(base64.b64decode(im['data']));print(str(p))
