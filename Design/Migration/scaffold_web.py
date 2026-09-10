import json,shutil
from pathlib import Path
r=Path('OfficeWeb');s=Path(r'G:/my/ai/code/iruler-desk_new')
(r/'reference/legacy').mkdir(parents=True,exist_ok=True)
for f in ['janusVideoBridge.ts','janusAudioBridge.ts','types.ts']:
 shutil.copy2(s/'src/pages/main-room'/f,r/'reference/legacy'/f)
p={'name':'office-web','version':'0.1.0','private':True,'type':'module','scripts':{'dev':'vite --host 127.0.0.1 --port 5188','server':'node server.mjs','build':'tsc --noEmit && vite build','test':'node --test test/*.test.mjs'},'dependencies':{'react':'18.2.0','react-dom':'18.2.0','three':'0.180.0','socket.io':'4.8.1','socket.io-client':'4.8.1'},'devDependencies':{'typescript':'5.7.3','vite':'6.1.0','@vitejs/plugin-react':'4.3.4','@types/react':'18.2.79','@types/react-dom':'18.2.25','@types/three':'0.180.0','@types/node':'22.10.1'}}
(r/'package.json').write_text(json.dumps(p,indent=2))
(r/'tsconfig.json').write_text(json.dumps({'compilerOptions':{'target':'ES2022','lib':['ES2022','DOM','DOM.Iterable'],'module':'ESNext','moduleResolution':'Bundler','jsx':'react-jsx','strict':True,'skipLibCheck':True,'esModuleInterop':True,'noEmit':True},'include':['src','vite.config.ts']},indent=2))
(r/'index.html').write_text('<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Office · 一起在场</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',encoding='utf8')
(r/'vite.config.ts').write_text("import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';export default defineConfig({plugins:[react()],server:{proxy:{'/socket.io':{target:'http://127.0.0.1:3108',ws:true}}}})")
