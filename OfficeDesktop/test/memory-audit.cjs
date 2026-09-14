// Isolated real Electron memory audit; loads only local synthetic scene fixture.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
app.setPath('userData', path.resolve(__dirname, '../../Build/desktop-memory-profile'));
app.commandLine.appendSwitch('js-flags', '--expose-gc');
const report = { samples: [] };
app.whenReady().then(async () => {
  const window = new BrowserWindow({ show: false, width:1440,height:940,
    webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false,backgroundThrottling:false} });
  const sample = async name => {
    const heap = await window.webContents.executeJavaScript('window.gc?.();performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null');
    report.samples.push({name,heap,processes:app.getAppMetrics().map(p=>({type:p.type,memory:p.memory}))});
  };
  await window.loadURL('about:blank'); await sample('blank');
  await window.loadURL('http://127.0.0.1:5199/test/screen-click.html' +
    (process.env.TEXTURE_MODE ? '?textures=' + process.env.TEXTURE_MODE : process.env.COMPACT_TEXTURES ? '?textures=compact' : ''));
  for(let i=0;i<120;i++) {
    if(await window.webContents.executeJavaScript('!!window.__officeDebug?.monitors?.meshFor(0) && !!window.__officeDebug?.avatar?.model'))break;
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  await new Promise(resolve=>setTimeout(resolve,2000));
  report.scene = await window.webContents.executeJavaScript(`(()=>{
    const scene=window.__officeDebug.__scene, textures=new Set(), images=new Set(), geometries=new Set(), materials=new Set();
    let textureBytes=0,geometryBytes=0,bitmapBytes=0,meshes=0;
    scene.traverse(o=>{if(!o.isMesh)return;meshes++;geometries.add(o.geometry);
      for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)});
    for(const m of materials)for(const v of Object.values(m))if(v?.isTexture)textures.add(v);
    const dimensions=[];
    for(const t of textures){const im=t.image;if(!im)continue;const bytes=im.width*im.height*4;
      textureBytes+=t.isCompressedTexture?t.mipmaps.reduce((sum,m)=>sum+m.data.byteLength,0):bytes*(t.generateMipmaps?4/3:1);
      dimensions.push([im.width,im.height]);
      if(!images.has(im)){images.add(im);bitmapBytes+=t.isCompressedTexture?0:bytes}}
    for(const g of geometries){for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;if(g.index)geometryBytes+=g.index.array.byteLength}
    return {meshes,geometries:geometries.size,materials:materials.size,textures:textures.size,images:images.size,textureBytes,bitmapBytes,geometryBytes,dimensions};
  })()`);
  await sample('scene-one-avatar');
  fs.writeFileSync(path.resolve(__dirname,'../../Build/desktop-memory-view.png'),(await window.webContents.capturePage()).toPNG());
  await window.webContents.executeJavaScript(`window.__officeDebug.avatar.load('woman_casual')`);
  await new Promise(resolve=>setTimeout(resolve,1000)); await sample('changed-avatar');
  if (process.env.MEMORY_LIFECYCLE) {
    for (let i = 0; i < 6; i++) {
      await window.webContents.executeJavaScript(`window.__officeDebug.avatar.load('${i % 2 ? 'woman_casual' : 'man_suit'}')`);
      await new Promise(resolve => setTimeout(resolve, 500));
      await sample('avatar-cycle-' + i);
    }
    await window.loadURL('about:blank');
    await new Promise(resolve => setTimeout(resolve, 1500));
    await sample('released-page');
  }
  fs.writeFileSync(path.resolve(__dirname,'../../Build/desktop-memory-audit.json'),JSON.stringify(report,null,2));
  app.exit(0);
}).catch(error=>{fs.writeFileSync(path.resolve(__dirname,'../../Build/desktop-memory-audit.json'),JSON.stringify({error:error.stack,...report},null,2));app.exit(1)});
setTimeout(()=>app.exit(2),45000).unref();
