import { arrowGeometry, buildArchitecture } from './buildArchitecture';\
import { buildColor } from './buildColors';\
        const source = new THREE.MeshStandardMaterial({ color: part.color });\
        const source = new THREE.MeshStandardMaterial({ color: buildColor(part.color) });\
