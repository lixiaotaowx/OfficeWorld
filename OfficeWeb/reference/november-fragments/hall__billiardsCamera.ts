export function frameBilliardsPlayer(camera:PerspectiveCamera,root:Object3D,cue:{x:number;z:number},angle:number,width:number,height:number) {\
export function frameBilliardsPlayer(camera:PerspectiveCamera,root:Object3D,cue:{x:number;z:number},angle:number,width:number,height:number,lookHeight=0) {\
  const target=root.localToWorld(new Vector3(cue.x+dx*.65,TABLE.height+TABLE.radius,cue.z+dz*.65));\
  const target=root.localToWorld(new Vector3(cue.x+dx*.65,TABLE.height+TABLE.radius+lookHeight,cue.z+dz*.65));\
export functio<truncated omitted_approx_tokens="259" />().setFromPoints([new THREE.Vector3(),new THREE.Vector3()])),aimMat);\
    this.aimLine.userData.nohit=true;this.root.add(this.aimLine);\
    this.ghost=new THREE.Mesh(geometry(new THREE.TorusGeometry(TABLE.radius,.004,6,32)),material('#f7e5b0'));\
    this.ghost.rotation.x=Math.PI/2;this.ghost.userData.nohit=true;this.root.add(this.ghost);\
    const dotMaterial=new THREE.MeshBasicMaterial({color:'#fff3b5',toneMapped:false});this.materials.add(dotMaterial);\
    this.aimPoint=new THREE.Mesh(geometry(new THREE.SphereGeometry(.006,12,8)),dotMaterial);\
    this.aimPoint.name='billiards-aim-point';this.aimPoint.userData.nohit=true;this.root.add(this.aimPoint);\
    this.cue.visible=this.aimLine.visible=this.ghost.visible=visible;if(!visible)return;\
    const {dx,dz}=this.direction();let distance=3;\
    for(const [p,d,edge] of [[cue.x,dx,TABLE.halfX-TABLE.radius],[cue.z,dz,TABLE.halfZ-TABLE.radius]])if(Math.abs(d)>.0001)distance=Math.min(distance,((d>0?edge:-edge)-p)/d);\
    for(const b of this.state?.balls||[]){if(!b.id||b.pocketed)continue;const x=b.x-cue.x,z=b.z-cue.z,along=x*dx+z*dz,side=x*x+z*z-along*along;\
      if(along>0&&side<4*TABLE.radius**2)distance=Math.min(distance,Math.max(0,along-Math.sqrt(4*TABLE.radius**2-side)));}\
    const y=TABLE.height+.014, endX=cue.x+dx*distance,endZ=cue.z+dz*distance;\
    const attr=this.aimLine.geometry.getAttribute('position');attr.setXYZ(0,cue.x,y,cue.z);attr.setXYZ(1,endX,y,endZ);attr.needsUpdate=true;this.aimLine.computeLineDistances();this.aimLine.geometry.computeBoundingSphere();\
    this.ghost.position.set(endX,y,endZ);\
    this.cue.visible=this.aimPoint.visible=visible;if(!visible)return;\
    const {dx,dz}=this.direction(),contact=billiardsContact(this.state?.balls||createRack(),this.angle);\
    this.aimPoint.visible=!!contact;\
    if(contact)this.aimPoint.position.set(contact.x+contact.nx*.002,TABLE.height+TABLE.radius,contact.z+contact.nz*.002);\
