import * as THREE from 'three';
import type { BuildPart, ChestPerson } from './buildTypes';
import { chestPortrait } from './chestPortrait';

export class BuildChestPeople {
  private rows = new Map<string, { key: string; sprite: THREE.Sprite }>();
  constructor(private world: THREE.Scene) {}
  private remove(id: string) {
    const row = this.rows.get(id);
    if (!row) return;
    row.sprite.removeFromParent();
    row.sprite.material.map?.dispose(); row.sprite.material.dispose();
    this.rows.delete(id);
  }
  sync(parts: BuildPart[], objects: Map<string, THREE.Group>) {
    const chests = parts.filter(p => p.kind === 'chest');
    for (const id of this.rows.keys()) if (!chests.some(p => p.id === id)) this.remove(id);
    for (const part of chests) {
      const key = JSON.stringify(part.chestPeople || {});
      let row = this.rows.get(part.id);
      if (row?.key !== key) {
        this.remove(part.id);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: true, depthWrite: false }));
        sprite.name = 'chest-people-' + part.id;
        sprite.visible = false;
        sprite.raycast = () => {};
        this.world.add(sprite);
        row = { key, sprite }; this.rows.set(part.id, row);
        void this.draw(part, row);
      }
      const object = objects.get(part.id);
      if (object && row) {
        const box = new THREE.Box3().setFromObject(object);
        row.sprite.position.set(part.x, box.max.y + .35, part.z);
      }
    }
  }
  private async draw(part: BuildPart, row: { key: string; sprite: THREE.Sprite }) {
    const people: (ChestPerson | undefined)[] = [part.chestPeople?.creator, ...(part.chestPeople?.readers || []).slice(0,7)];
    const extra = Math.max(0, (part.chestPeople?.readers.length || 0) - 7);
    const slots = people.length + (extra ? 1 : 0);
    const canvas = document.createElement('canvas'); canvas.width = slots * 72; canvas.height = 72;
    const ctx = canvas.getContext('2d')!;
    for (const [i, person] of people.entries()) {
      ctx.save(); ctx.beginPath(); ctx.arc(i*72+36,36,31,0,Math.PI*2);
      ctx.fillStyle = '#f4f2e8'; ctx.fill(); ctx.lineWidth=4;
      ctx.strokeStyle = i === 0 ? '#d5a850' : '#82ad85'; ctx.stroke(); ctx.clip();
      try {
        if (!person) throw Error('Unknown creator');
        const img = new Image(); img.src = await chestPortrait(person); await img.decode();
        ctx.drawImage(img,i*72+5,5,62,62);
      } catch { ctx.fillStyle='#526348'; ctx.font='28px sans-serif'; ctx.textAlign='center'; ctx.fillText(person?.name?.slice(0,1) || '?',i*72+36,46); }
      ctx.restore();
    }
    if (extra) { ctx.fillStyle='#f4f2e8'; ctx.font='24px sans-serif'; ctx.textAlign='center'; ctx.fillText('+'+extra,(slots-.5)*72,46); }
    if (this.rows.get(part.id) !== row) return;
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    row.sprite.material.map = texture; row.sprite.material.needsUpdate = true;
    row.sprite.visible = true;
    row.sprite.scale.set(slots*.4,.4,1);
  }
  dispose() { for (const id of this.rows.keys()) this.remove(id); }
}
