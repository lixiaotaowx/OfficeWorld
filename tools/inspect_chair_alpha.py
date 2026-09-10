import bpy,pathlib,json,numpy as np
root=pathlib.Path(__file__).resolve().parents[1]/'AssetSources/Realistic/Finished';report={}
for p in (root/'OrthopedicChair/textures').glob('*Diffuse.png'):
 im=bpy.data.images.load(str(p));pixels=np.array(im.pixels[:]).reshape(-1,4);report[p.name]={'alpha_min':float(pixels[:,3].min()),'alpha_max':float(pixels[:,3].max()),'size':list(im.size)}
(root/'Converted/chair-alpha.json').write_text(json.dumps(report,indent=2))
