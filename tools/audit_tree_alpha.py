import bpy,pathlib,json
p=pathlib.Path('G:/C/wendang/ChatGPT/youxi');im=bpy.data.images.load(str(p/'AssetSources/Realistic/Finished/tree_small_02/textures/tree_small_02_leaves_alpha_2k.png'));im.scale(256,256);v=list(im.pixels);print('range',min(v[::4]),max(v[::4]),sum(v[::4])/len(v[::4]));im.filepath_raw=str(p/'OfficeWorld/Saved/tree-alpha.png');im.file_format='PNG';im.save()
