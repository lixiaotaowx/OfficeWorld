import base64
import json
import pathlib
import sys
from ue_mcp import UnrealMCP

client = UnrealMCP()
result = client.request('tools/call', {
    'name': 'call_tool', 'arguments': {
        'toolset_name': 'EditorToolset.EditorAppToolset',
        'tool_name': 'CaptureViewport',
        'arguments': {'captureTransform': None, 'annotations': None, 'bShowUI': False},
    },
})
path = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'OfficeWorld/Saved/campus-overview.png')
for block in result.get('content', []):
    if block['type'] == 'image':
        path.write_bytes(base64.b64decode(block['data']))
        print(path.resolve())
    elif block['type'] == 'text':
        try:
            raw = json.loads(block['text'])['returnValue']['image']['data']
        except (KeyError, TypeError, ValueError):
            print(block['text'][:300])
        else:
            path.write_bytes(base64.b64decode(raw))
            print(path.resolve())
