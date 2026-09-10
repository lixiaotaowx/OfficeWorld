from pathlib import Path
import json
from collections import Counter

root = Path('AssetSources/Decor/TinyTreats_HousePlants')
files = [p for p in (root / 'Models').rglob('*') if p.is_file()]
triangles = []
missing = []
for path in files:
    if path.suffix != '.gltf':
        continue
    data = json.loads(path.read_text())
    count = sum(data['accessors'][primitive['indices']]['count'] // 3
                for mesh in data.get('meshes', [])
                for primitive in mesh['primitives']
                if 'indices' in primitive)
    triangles.append(count)
    for item in data.get('buffers', []) + data.get('images', []):
        uri = item.get('uri', '')
        if uri and not uri.startswith('data:') and not (path.parent / uri).exists():
            missing.append(str(path.parent / uri))
report = {'file_formats': dict(Counter(p.suffix for p in files)),
          'gltf_count': len(triangles), 'missing_references': missing,
          'triangle_range': [min(triangles), max(triangles)] if triangles else []}
(root / 'audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report))
