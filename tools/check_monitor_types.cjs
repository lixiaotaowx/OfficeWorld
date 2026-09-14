const path=require('node:path');
const ts=require('./WebRuntime/node_modules/typescript');
const root=path.resolve('OfficeWeb'),deps=path.resolve('tools/WebRuntime/node_modules');
const options={
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,
  moduleResolution:ts.ModuleResolutionKind.Bundler,jsx:ts.JsxEmit.ReactJSX,
  strict:true,skipLibCheck:true,esModuleInterop:true,noEmit:true,
  baseUrl:root,paths:{
    'react':[deps+'/@types/react/index.d.ts'],
    'react/*':[deps+'/@types/react/*'],
    'react-dom':[deps+'/@types/react-dom/index.d.ts'],
    'react-dom/*':[deps+'/@types/react-dom/*'],
    'three':[deps+'/@types/three/index.d.ts'],
    'three/addons/*':[deps+'/@types/three/examples/jsm/*'],
    '*':[deps+'/*'],
  },typeRoots:[deps+'/@types'],types:[],
};
const program=ts.createProgram([
  root+'/src/App.tsx',root+'/src/monitorScreens.ts',root+'/src/scenePicking.ts',
  deps+'/vite/client.d.ts',
],options);
const diagnostics=ts.getPreEmitDiagnostics(program);
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics.slice(0,15),{
  getCurrentDirectory:()=>root,getCanonicalFileName:f=>f,getNewLine:()=> '\n',
}));
console.log(`TypeScript diagnostics: ${diagnostics.length}`);
process.exitCode=diagnostics.length?1:0;
