import sys,json,pathlib
from ue_mcp import UnrealMCP
p=pathlib.Path(sys.argv[1]).resolve().as_posix()
c=UnrealMCP()
c.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'SlateInspectorToolset.SlateInspectorToolset','tool_name':'Click','arguments':{'ref':'tb2'}}})
c.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'SlateInspectorToolset.SlateInspectorToolset','tool_name':'PressKey','arguments':{'key':'Ctrl+A'}}})
r=c.request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'SlateInspectorToolset.SlateInspectorToolset','tool_name':'Type','arguments':{'ref':'tb2','text':'py '+p,'submit':True}}})
print(json.dumps(r))
