interface Laptop { group: THREE.Group; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; screen: THREE.Mesh; image: string; away: boolean; bulb: THREE.Mesh; light: THREE.PointLight }\
interface Laptop { group: THREE.Group; canvas: HTMLCanvasElement | null; texture: THREE.CanvasTexture | null; screen: THREE.Mesh; image: string; away: boolean; bulb: THREE.Mesh; light: THREE.PointLight; disposed: boolean }\
const W = 320, H = 200;\
const KEY_GEOMETRY = new THREE.BoxGeometry(0.028, 0.002, 0.023);\
const BLANK_SCREEN = new THREE.DataTexture(new Uint8Array([0x1b,0x1d,0x20,0xff]),1,1);\
BLANK_SCREEN.colorSpace=THREE.SRGBColorSpace;BLANK_SCREEN.needsUpdate=true;\
    for (const [id, l] of this.laptops) if (!parts.has(id)) { l.group.removeFromParent(); this.laptops.delete(id); }\
    for (const [id, l] of this.laptops) if (!parts.has(id)) { this.release(l); this.laptops.delete(id); }\
      const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;\
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;\
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(ws.monitor.size[0], ws.monitor.size[1]), decal(new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })));\
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(ws.monitor.size[0], ws.monitor.size[1]), decal(new THREE.MeshBasicMaterial({ map: BLANK_SCREEN, toneMapped: false })));\
      const laptop = { group, canvas, texture, screen, image: '', away: true, bulb, light };\
      this.laptops.set(id, laptop); this.paint(laptop);\
      const laptop = { group, canvas: null, texture: null, screen, image: '', away: true, bulb, light, disposed: false };\
      this.laptops.set(id, laptop);\
      if (img.complete) this.paint(l, img); else img.onload = () => { if (l.image === image) this.paint(l, img); };\
      if (img.complete) this.paint(l, img); else img.addEventListener('load', () => { if (!l.disposed && l.image === image) this.paint(l, img); }, {once:true});\
  private paint(l: Laptop, img?: HTMLImageElement) {\
    const x = l.canvas.getContext('2d')!;\
    if (img) {\
      x.drawImage(img, 0, 0, W, H);\
      if (l.away) { x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, W, H); }\
    } else { x.fillStyle = '#1b1d20'; x.fillRect(0, 0, W, H); }\
    l.texture.needsUpdate = true;\
    if (l.disposed) return;\
    const material=l.screen.material as THREE.MeshBasicMaterial;\
    if (!img) {\
      material.map=BLANK_SCREEN; material.needsUpdate=true;\
      l.texture?.dispose();l.texture=null;\
      if(l.canvas){l.canvas.width=l.canvas.height=0;l.canvas=null;}\
      return;\
    }\
    if (!l.canvas || !l.texture) {\
      l.canvas=document.createElement('canvas');l.canvas.width=W;l.canvas.height=H;\
      l.texture=new THREE.CanvasTexture(l.canvas);l.texture.colorSpace=THREE.SRGBColorSpace;\
      material.map=l.texture;material.needsUpdate=true;\
    }\
    const x=l.canvas.getContext('2d')!;x.drawImage(img,0,0,W,H);\
    if(l.away){x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,W,H);}\
    l.texture.needsUpdate=true;\
  }\
  private release(l: Laptop) {\
    l.disposed=true;l.group.removeFromParent();l.texture?.dispose();\
    if(l.canvas)l.canvas.width=l.canvas.height=0;\
    l.group.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.isMesh && mesh.geometry!==KEY_GEOMETRY)mesh.geometry.dispose();});\
    (l.screen.material as THREE.Material).dispose();(l.bulb.material as THREE.Material).dispose();\
    l.light.dispose();\
  }\
  dispose() { for(const laptop of this.laptops.values())this.release(laptop);this.laptops.clear();this.images.clear(); }\
