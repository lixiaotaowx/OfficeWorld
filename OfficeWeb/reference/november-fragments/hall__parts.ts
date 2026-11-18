  shapes?: (string | number)[][];\
  arch?: { outerRadius: number; innerRadius: number; springHeight: number; depth: number };\
export function partMeshes(def: PartDef, color: string): THREE.Group {\
  const g = new THREE.Group();\
  if (def.arch) {\
    const { outerRadius: outer, innerRadius: inner, springHeight: rise, depth } = def.arch;\
    const outline = new THREE.Shape();\
    outline.moveTo(-outer, 0); outline.lineTo(-outer, rise);\
    outline.absarc(0, rise, outer, Math.PI, 0, true);\
    outline.lineTo(outer, 0); outline.lineTo(inner, 0); outline.lineTo(inner, rise);\
    outline.absarc(0, rise, inner, 0, Math.PI, false);\
    outline.lineTo(-inner, 0); outline.closePath();\
    const geometry = new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: false, curveSegments: 32, steps: 1 });\
    geometry.translate(0, 0, -depth / 2);\
    const mesh = new THREE.Mesh(geometry, material(color, false, 'plaster'));\
    mesh.castShadow = mesh.receiveShadow = true; mesh.userData.token = 'c'; g.add(mesh);\
  }\
