import { partOrientation, partQuaternion } from './buildPartPose';\
import { partCenter } from './buildPartCenter';\
    if(mode==='rotate') {\
      origin.copy(partCenter(part));\
      origin.sub(pivot).applyQuaternion(rotation).add(pivot);\
    }else{\
      origin.copy(partCenter(part));\
    next.x=origin.x;next.y=origin.y;next.z=origin.z;\
    // Meshes keep their bottom-origin storage convention. Rebase the transformed\
    // centre to that origin after dimensions and orientation have changed.\
    const offset=partCenter({...next,x:0,y:0,z:0});\
    origin.sub(offset);\
    next.x=origin.x;next.y=origin.y;next.z=origin.z;\
