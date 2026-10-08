import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { catalog, createBuildStore } from '../build-store.mjs';
const require = createRequire(import.meta.url);
const { loadMeshes } = require('../../Tools/export_box_library.cjs');
const { createPart } = await loadMeshes();
test('new models fit declared collision envelopes in every rotation and use shared boxes', () => {
  let geometry;
  for (const item of catalog.slice(20)) for (let rotation=0;rotation<4;rotation++) {
    const group=createPart({id:item.id,kind:item.id,color:'#e9b8b5',x:0,y:0,z:0,rotation});
    assert(group.children.length>1, item.id+' cannot fall back to a single generic cube');
    for(const mesh of group.children) {
      geometry ||= mesh.geometry;
      assert.equal(mesh.geometry,geometry,'geometry must be shared');
      for(let i=0;i<3;i++) {
        const p=mesh.position.getComponent(i),s=mesh.scale.getComponent(i);
        assert(s>0 && Number.isFinite(s),item.id);
        assert(p+s/2<=item.size[i]*(i===1?1:0.5)+1e-6,item.id+' positive bound');
        assert(p-s/2>=-(i===1?0:item.size[i]/2)-1e-6,item.id+' negative bound');
      }
    }
  }
});
test('every new kind survives server add, move, reload and remove', () => {
  const dir=mkdtempSync(join(tmpdir(),'props-'));
  try {
    const file=join(dir,'world.json'),store=createBuildStore(file),user={id:'props-qa',name:'QA'};
    for(const item of catalog.slice(20)) {
      const part={kind:item.id,color:'#b4c5a0',x:-8,y:2,z:3,rotation:1};
      const added=store.mutate({action:'add',part},user).changed;
      store.mutate({action:'move',id:added.id,version:1,part:{...part,x:-9,rotation:3}},user);
      const saved=createBuildStore(file).snapshot().parts.find(p=>p.id===added.id);
      assert.equal(saved.kind,item.id);assert.equal(saved.rotation,3);
      store.mutate({action:'remove',id:added.id,version:2},user);
      assert(!createBuildStore(file).snapshot().parts.some(p=>p.id===added.id));
    }
  } finally {rmSync(dir,{recursive:true,force:true});}
});
