import pathlib,json
root=pathlib.Path(__file__).resolve().parents[1];src=root/'AssetSources/Realistic/Finished'
lines=['# Extension asset credits — 2026-09-08','', 'Free downloads; no purchases. Originals and SHA256 metadata are retained beside every selected source. BlenderKit royalty-free assets are not CC0 and must not be redistributed as standalone models/asset packs.','', '| Model | Author | Source | License |','| --- | --- | --- | --- |']
for name in ['pool_table','cue_rack','bench_press','multigym','dumbbells','toilet']:
 m=json.loads((src/'Extension'/name/'SOURCE.json').read_text());lines.append('| '+m['name']+' | '+m['author'].strip()+' | '+m['source']+' | '+m['license']+' |')
lines+=['','License: https://www.blendkit.com/docs/licenses/ . Source shaders baked to 2K base/roughness/metal/emission, source geometry evaluated, subdivision capped at 1 and base-centered for UE. Baked normal maps are not claimed.','', 'Approved Poly Haven CC0 decor (original UV/PBR and leaf alpha retained):']
for name in ['potted_plant_04','calathea_orbifolia_01','decorative_book_set_01','ceramic_vase_01']:
 m=json.loads((src/name/'SOURCE.json').read_text());lines.append('- '+m['source']+' — '+json.dumps(m['metadata'].get('authors',{}),ensure_ascii=False))
lines+=['','Calathea uses variant a only, plus original project pot geometry. Three book variants selected; sparse arrangement.','', 'Architecture, conference table, vanity joinery, planter, dumbbell support and ball dressing are original project geometry. Existing C1 finished chair instances retain their original license. Rejected treadmill was an industrial conveyor; rejected pool-ball atlas was not installed. Do not describe those rejected models as part of the finished scene.','', 'Actual UE evidence and traversal status are tracked in Design/DeliveryAcceptance.md; source Blender renders are not evidence of engine implementation.']
(root/'Design/ExtensionCredits.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
