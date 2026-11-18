const unit = new THREE.BoxGeometry(1, 1, 1);\
// Reuse the face layout instead of creating and expanding a new box for each book.\
const bakeUnit = unit.toNonIndexed();\
const bakePositions = bakeUnit.getAttribute('position').array;\
const bakeNormals = bakeUnit.getAttribute('normal').array;\
export function bake(list: BakeBox[], parent: THREE.Object3D, o: { cast?: boolean; nohit?: boolean } = {}) {\
  const pos: number[] = [], nor: number[] = [], col: number[] = [], c = new THREE.Color();\
  for (const [w, h, d, x, y, z, hex] of list) {\
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.translate(x, y, z); c.set(hex);\
    const p = g.attributes.position.array, n = g.attributes.normal.array;\
    for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); }\
    for (let i = 0; i < p.length / 3; i++) col.push(c.r, c.g, c.b);\
    g.dispose();\
  const stride=bakePositions.length, pos=new Float32Array(list.length*stride), nor=new Float32Array(list.length*stride), col=new Float32Array(list.length*stride), c=new THREE.Color();\
  for (let index=0; index<list.length; index++) {\
    const [w,h,d,x,y,z,hex]=list[index], offset=index*stride;c.set(hex);\
    for (let i=0; i<stride; i+=3) {\
      // BoxGeometry rounds its original coordinates to float32 before translate().\
      pos[offset+i]=Math.fround(bakePositions[i]*w)+x;\
      pos[offset+i+1]=Math.fround(bakePositions[i+1]*h)+y;\
      pos[offset+i+2]=Math.fround(bakePositions[i+2]*d)+z;\
      nor[offset+i]=bakeNormals[i];nor[offset+i+1]=bakeNormals[i+1];nor[offset+i+2]=bakeNormals[i+2];\
      col[offset+i]=c.r;col[offset+i+1]=c.g;col[offset+i+2]=c.b;\
    }\
  }\
  const g = new THREE.BufferGeometry();\
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));\
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));\
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));\
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));\
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));\
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));\
