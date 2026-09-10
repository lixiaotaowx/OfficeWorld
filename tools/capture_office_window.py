import sys,json,base64,pathlib
from ue_mcp import UnrealMCP
c=UnrealMCP()
c.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'SlateInspectorToolset.SlateInspectorToolset','tool_name':'Windows','arguments':{'action':'select','index':0}}})
r=c.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'SlateInspectorToolset.SlateInspectorToolset','tool_name':'Screenshot','arguments':{'ref':'w1'}}})
for b in r.get('content',[]):
 if b['type']=='text':
  try:
   v=json.loads(b['text'])['returnValue'];pathlib.Path(sys.argv[1]).write_bytes(base64.b64decode(v['data']));print(sys.argv[1])
  except Exception:print(b['text'][:400])
