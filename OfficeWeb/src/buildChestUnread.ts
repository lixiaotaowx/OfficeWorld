import * as THREE from 'three';
import type { BuildPart } from './buildTypes';
import { arrowGeometry, buildArchitecture } from './buildArchitecture';
import { buildColor } from './buildColors';

export function chestUnread(part: BuildPart, accountId: string) {
  const people = part.chestPeople;
  return part.kind === 'chest' && Boolean(accountId && people?.creator?.id) &&
    people!.creator!.id !== accountId && !people!.readers.some(row => row.id === accountId);
}

/** Viewer-local decoration: never saved as a build part or included in picking. */
export class BuildChestUnread {
  private rows = new Map<string, { root: THREE.Group; color: string }>();
  constructor(private world: THREE.Scene, private accountId: string) {}
  private remove(id: string) {
    this.rows.get(id)?.root.removeFromParent();
    this.rows.delete(id);
  }
  sync(parts: BuildPart[], objects: Map<string, THREE.Group>) {
    const unread = parts.filter(part => chestUnread(part, this.accountId));
    const live = new Set(unread.map(part => part.id));
    for (const id of this.rows.keys()) if (!live.has(id)) this.remove(id);
    for (const part of unread) {
      const object = objects.get(part.id);
      if (!object) { this.remove(part.id); continue; }
      let row = this.rows.get(part.id);
      if (row?.color !== part.color) {
        this.remove(part.id);
        const root = new THREE.Group();
        const source = new THREE.MeshStandardMaterial({ color: buildColor(part.color) });
        buildArchitecture('flow-arrow', root, () => {
          const mesh = new THREE.Mesh(arrowGeometry, source);
          root.add(mesh); return mesh;
        });
        source.dispose(); // arrowLook owns the shared colored body and halo.
        root.name = 'chest-unread-' + part.id;
        root.userData.chestUnread = true;
        root.rotation.x = Math.PI / 2; // the existing +Z arrow points down.
        root.traverse(child => { child.raycast = () => {}; });
        this.world.add(root);
        row = { root, color: part.color }; this.rows.set(part.id, row);
      }
      const box = new THREE.Box3().setFromObject(object);
      row.root.position.set(part.x, box.max.y + .95, part.z);
    }
  }
  dispose() { for (const id of this.rows.keys()) this.remove(id); }
}
