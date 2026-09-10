"""Run project Python via the registered native toolset without UI input."""
import sys,json
from ue_mcp import UnrealMCP
print(json.dumps(UnrealMCP().request('tools/call',{'name':'call_tool','arguments':{'toolset_name':'office_asset_automation.OfficeAssetAutomation','tool_name':'run_project_script','arguments':{'script_name':sys.argv[1]}}})))
