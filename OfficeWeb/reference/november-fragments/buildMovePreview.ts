        row.preview.removeFromParent();\
        row.preview.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();});\
        row.preview=createPart({...target,color:row.part.color});delete row.preview.userData.buildId;\
        row.preview.name='build-multi-preview';row.preview.userData.preview=true;\
        row.preview.userData.partColor=row.part.color;row.preview.userData.partKey=key;\
        row.preview.traverse(o=>{o.raycast=()=>{};});world.add(row.preview);\
      }\
    row.preview.removeFromParent();\
    row.preview.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();});\
    row.preview=createPart({...target,color:row.part.color});delete row.preview.userData.buildId;\
    row.preview.name='build-multi-preview';row.preview.userData.preview=true;\
    row.preview.userData.partColor=row.part.color;row.preview.userData.partKey=key;\
    row.preview.traverse(o=>{o.raycast=()=>{};});world.add(row.preview);\
  }\
      const preview=createPart(row.part);delete preview.userData.buildId;\
      preview.name='build-multi-preview';preview.userData.preview=true;\
      preview.traverse(o=>{o.raycast=()=>{};});row.object.visible=false;\
      const outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);outline.raycast=()=>{};\
      world.add(preview,outline);return {...row,preview,outline};\
  const preview=createPart(row.part);delete preview.userData.buildId;\
  preview.name='build-multi-preview';preview.userData.preview=true;\
  preview.traverse(o=>{o.raycast=()=>{};});row.object.visible=false;\
  const outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);outline.raycast=()=>{};\
  world.add(preview,outline);return {...row,preview,outline};\
    const key=`${part.kind}:${part.color}:${angleKey(part)}:${part.scale?.join(',') || ''}`;\
    if(!preview || previousKey!==key){\
      preview?.removeFromParent();\
      preview?.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});\
      preview=createPart(part);\
      preview.name='build-move-preview';\
      delete preview.userData.buildId;preview.userData.preview=true;\
      preview.traverse(o=>{o.raycast=()=>{};});world.add(preview);\
    }else preview.position.set(part.x,part.y,part.z);\
  const key=`${part.kind}:${part.color}:${angleKey(part)}:${part.scale?.join(',') || ''}`;\
  if(!preview || previousKey!==key){\
    preview?.removeFromParent();\
    preview?.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});\
    preview=createPart(part);\
    preview.name='build-move-preview';\
    delete preview.userData.buildId;preview.userData.preview=true;\
    preview.traverse(o=>{o.raycast=()=>{};});world.add(preview);\
  }else preview.position.set(part.x,part.y,part.z);\
