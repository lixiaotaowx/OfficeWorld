import * as THREE from "three";

type Wall = {
  axis: "x" | "z";
  position: number;
  min: number;
  max: number;
  height: number;
  plane: THREE.Plane;
  level: number;
};

// Coordinates follow the preserved office model. Only architectural surfaces
// receive cloned clipping materials; furniture and the floor remain intact.
const definitions = [
  { axis: "x", position: 10.95, min: -8.3, max: 6.6 },
  { axis: "z", position: -8.18, min: -10.1, max: 11.1 },
  { axis: "z", position: -3.8, min: 0.9, max: 11.1 },
  { axis: "x", position: 1, min: -8.3, max: -3.5 },
  { axis: "x", position: 6.55, min: -8.3, max: -3.7 },
  { axis: "x", position: -10, min: -8.3, max: 6.6 },
  { axis: "z", position: 6.48, min: -10.1, max: 11 },
] as const;

// Include separate inner wall skins and every frame layer, not just solid walls.
const architecture = /architecture.*(?:wall|divider)|interior color panel|coffee backing wall|front (?:low wall|oak slat|cutaway base)|right cutaway perimeter|left window|window (?:continuous glass|lower sill|upper beam|vertical frame)|open top room beam|rear open top beam|(?:manager office|meeting room) (?:glazing|open glass door|door handle|mullion|top rail|bottom rail)|meeting (?:left glass|side frame)/i;
const wallDecoration = /abstract print|wall shelf|blackboard|meeting.*(?:presentation display|display surface)/i;

export function obstructsView(wall: Pick<Wall, "axis" | "position" | "min" | "max" | "height">,
  camera: THREE.Vector3, target: THREE.Vector3) {
  const axis = wall.axis, along = axis === "x" ? "z" : "x";
  const delta = target[axis] - camera[axis];
  if (Math.abs(delta) < 0.001) return false;
  const t = (wall.position - camera[axis]) / delta;
  if (t <= 0 || t >= 1) return false;
  const cross = THREE.MathUtils.lerp(camera[along], target[along], t);
  const y = THREE.MathUtils.lerp(camera.y, target.y, t);
  return cross >= wall.min - 0.5 && cross <= wall.max + 0.5 && y < wall.height + 0.25;
}

export class WallCutaway {
  private walls: Wall[] = [];
  private materials: THREE.Material[] = [];

  attach(root: THREE.Object3D) {
    root.updateMatrixWorld(true);
    this.walls = definitions.map(definition => ({ ...definition, height: 0,
      plane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 10), level: 10 }));
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      let name = object.name;
      for (let parent = object.parent; parent && parent !== root; parent = parent.parent)
        name += " " + parent.name;
      // GLTFLoader sanitizes spaces and slashes in exported object names.
      name = name.replaceAll("_", " ");
      if (!architecture.test(name) && !wallDecoration.test(name)) return;
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const wall = this.walls.filter(w => {
        const along = w.axis === "x" ? "z" : "x";
        return Math.abs(center[w.axis] - w.position) < 0.85 &&
          center[along] >= w.min && center[along] <= w.max;
      }).sort((a, b) => Math.abs(center[a.axis] - a.position) -
        Math.abs(center[b.axis] - b.position))[0];
      if (!wall) return;
      wall.height = Math.max(wall.height, box.max.y);
      const clone = (source: THREE.Material) => {
        const material = source.clone();
        material.clippingPlanes = [wall.plane];
        material.clipShadows = true;
        this.materials.push(material);
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(clone) : clone(object.material);
    });
    for (const wall of this.walls) wall.level = wall.plane.constant = wall.height + 0.5;
  }

  update(camera: THREE.Camera, target: THREE.Vector3, dt: number) {
    for (const wall of this.walls) {
      const cut = obstructsView(wall, camera.position, target);
      const goal = cut ? 0.35 : wall.height + 0.5;
      wall.level = THREE.MathUtils.damp(wall.level, goal, 12, dt);
      wall.plane.constant = wall.level;
    }
  }

  dispose() {
    for (const material of this.materials) material.dispose();
    this.materials = [];
    this.walls = [];
  }
}
