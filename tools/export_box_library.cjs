// Export the actual web geometry, rather than maintain a second set of models.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('../OfficeWeb/node_modules/typescript');
const root = path.resolve(__dirname, '..');
const dest = path.join(root, 'Build/BoxLibraryModules', String(process.pid));
const sources = ['buildFixtures', 'buildColors', 'buildArchitecture', 'buildOrientation', 'buildArch', 'buildPropFurniture', 'buildPropDetails', 'buildMeshes'];
async function loadMeshes() {
  fs.mkdirSync(dest, { recursive: true });
  const three = pathToFileURL(path.join(root, 'OfficeWeb/node_modules/three/build/three.module.js')).href;
  for (const name of sources) {
    const source = fs.readFileSync(path.join(root, 'OfficeWeb/src', name+'.ts'), 'utf8');
    let js = ts.transpileModule(source, { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    }}).outputText.replace(/from 'three'/g, `from '${three}'`);
    js=js.replace(/import (\w+) from '(\.\.\/[^']+\.json)';/g,(_,name,file)=>`const ${name}=${fs.readFileSync(path.resolve(root,'OfficeWeb/src',file),'utf8')};`);
    for (const dependency of sources) js = js.replaceAll(`'./${dependency}'`, `'./${dependency}.mjs'`);
    fs.writeFileSync(path.join(dest, name+'.mjs'), js);
  }
  return import(pathToFileURL(path.join(dest, 'buildMeshes.mjs')));
}
async function exportLibrary() {
  const { createPart } = await loadMeshes();
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'OfficeWeb/build-catalog.json'), 'utf8'));
  const assets = catalog.map(item => {
    const group = createPart({ id:item.id, kind:item.id, color:'#e9b8b5', x:0, y:0, z:0, rotation:0 });
    return {...item, boxes:group.children.map(m => ({ size:m.scale.toArray(), position:m.position.toArray(),
      ...(m.userData.flagPanel!==undefined ? {flagPanel:m.userData.flagPanel} : {}),
      ...(m.userData.arrowNudge ? {arrowNudge:true} : {}),
      color:'#'+m.material.color.getHexString(), glow:m.material.emissiveIntensity===0.65,
      ...(m.geometry.type!=='BoxGeometry' ? {vertices:Array.from(m.geometry.attributes.position.array),
        indices:m.geometry.index ? Array.from(m.geometry.index.array) : Array.from({length:m.geometry.attributes.position.count},(_,i)=>i)} : {}) }))};
  });
  fs.writeFileSync(path.join(root, 'AssetSources/BoxWorld/BoxParts.json'), JSON.stringify(assets,null,2));
  console.log('Exported', assets.length, 'editable models (boxes + round opening arch)');
}
module.exports = { loadMeshes, exportLibrary };
if (require.main === module) exportLibrary();
