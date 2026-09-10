import json,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
p=root/'Design/Characters/office_people.json';d=json.loads(p.read_text(encoding='utf-8'))
d['status']='Four final identities assembled and saved; wardrobe adaptation incomplete. Paused after character-only work.'
outfits={'Office_M01_Aoi':'navy native MetaHuman T-shirt, CC0 dark jeans and black shoes','Office_F01':'sage native MetaHuman T-shirt, CC0 denim trousers and black shoes; trouser/foot clipping remains','Office_M02':'grey native MetaHuman T-shirt, CC0 blue jeans and brown shoes; foot clipping remains','Office_F02':'tan native MetaHuman T-shirt, CC0 dark skirt and black shoes; foot clipping remains'}
for c in d['characters']:
 c['outfit_current']=outfits[c['id']]
 c['outfit_acceptance']='Not final: different-cut external shirts failed shoulder/arm fit; candidates retained, native tops installed.'
 if c['id']=='Office_M01_Aoi':c['revision_note']='Aoi assembled, installed as final player and saved. Kelvin-based Office_M01 retained only as fallback.'
d['license_note']='Epic terms for MetaHuman sources and native shirts; CC0 MakeHuman trousers/skirt/shoes. See AssetSources/Realistic/OfficePeople/SOURCES.md.'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
p=root/'Design/TODO.md';s=p.read_text(encoding='utf-8');start=s.index('  Progress at 12:35:');end=s.index('  Cache mitigation:',start)
note='  Character-only pause, 2026-09-08: all four final identities (Aoi, Aera, Bo, Tuya) assembled, installed and saved. Full CC0 archive downloaded and checked. Native MetaHuman tops replace external shirts that failed shoulder/arm fit; trousers/skirt/shoes installed as adaptation candidates. Actual PIE 00031-00038 exposed remaining F01 trouser and shoe/foot clipping, so wardrobe is NOT accepted. M01 joined suit required waist separation; jeans restored and visible in 00037. Dynamic SetMaterialAttributes caused an array assertion crash at 13:16; old script disabled. Fixed-layout alternative saved but changed skin appearance and failed masking QA; reverted F01 to original skin. Do not rerun either mask script as a final solution. Five missing Common groom dependencies recovered from autosaves. Saved-map reload clears duplicate PIE child actors after blueprint recompilation. Pause after saving and necessary movement regression; do not expand rooms/network/packaging.\n'
s=s[:start]+note+s[end:];p.write_text(s,encoding='utf-8')
p=root/'AssetSources/Realistic/OfficePeople/SOURCES.md';s=p.read_text(encoding='utf-8')
s+='\n## Character fitting checkpoint, 2026-09-08\n\nFour final MetaHumans: Aoi, Aera, Bo, Tuya. Runtime tops copy each character native MetaHuman shirt geometry and weights, with individual fabric colors; Epic terms apply. CC0 lower garments and shoes are recorded in each Fitting/{id}/fitting.json. Modifications include landmark fitting, weight transfer, native-top substitution, separating joined shirt/jeans at waist, trouser clearance and shoe toe/width adjustments. Original files retained. External shirts failed shoulder/arm runtime fit. Current lower garments/shoes still have clipping; no finished wardrobe claim. Skin masking withdrawn from runtime; original F01 skin restored.\n'
p.write_text(s,encoding='utf-8')
