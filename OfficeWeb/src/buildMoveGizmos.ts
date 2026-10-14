import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { applyGizmoLook, styleGizmo, type GizmoKind } from './buildGizmoStyle';

export function createMoveGizmos(camera:THREE.Camera,element:HTMLElement,root:THREE.Group) {
  const translate=new TransformControls(camera);
  const rotate=new TransformControls(camera);
  const resize=new TransformControls(camera);
  const controls:[GizmoKind,TransformControls][]=[
    ['translate',translate],['rotate',rotate],['scale',resize]];
  for(const [kind,control] of controls) {
    // Events are routed here so orbit/selection never start on a handle drag.
    control.domElement=element;
    control.setSpace('world');
    control.setSize(kind==='translate'? .7:kind==='scale'?1.15:.9);
    styleGizmo(control,kind);
    const helper=control.getHelper();
    const update=helper.updateMatrixWorld.bind(helper);
    helper.updateMatrixWorld=(force?:boolean)=>{
    update(force);
    // Single axes only: hidden plane slabs, free-rotation ball and the drag
    // helper lines stay out of the way. The translate centre diamond is kept
    // as the styled pivot hub.
    helper.traverse(o=>{
      if(kind==='translate' && o.name==='XYZ')return;
      if(['XY','YZ','XZ','XYZ','E','XYZE','START','END','DELTA','AXIS'].includes(o.name))o.visible=false;
    });
    applyGizmoLook(control);
    };
    helper.traverse(o=>{
    const material=(o as THREE.Mesh).material;
    // Handles draw over their own part: depthTest off keeps them grabbable
    // even when the selected geometry would swallow them.
    if(material)for(const m of Array.isArray(material)?material:[material]){m.depthTest=false;m.depthWrite=false;}
    });
    root.add(helper);
  }
  translate.setMode('translate');translate.setTranslationSnap(null);
  rotate.setMode('rotate');rotate.setRotationSnap(Math.PI/2);
  resize.setMode('scale');resize.setSpace('local');
  return {translate,rotate,resize};
}
