const CELL_STRIDE = 4096;

export class CollisionGrid {
  constructor(boxes) {
    this.boxes = boxes;
    this.cells = new Map();
    this.visited = new Uint32Array(boxes.length);
    this.queryId = 0;
    boxes.forEach((box, index) => {
      for (let x = Math.floor(box.x0); x <= Math.floor(box.x1); x++) {
        for (let z = Math.floor(box.z0); z <= Math.floor(box.z1); z++) {
          const key = x * CELL_STRIDE + z;
          let members = this.cells.get(key);
          if (!members) {
            members = [];
            this.cells.set(key, members);
          }
          members.push(index);
        }
      }
    });
  }

  near(x0, z0, x1, z1, minY, maxY) {
    const indices = [];
    const minX = Math.min(x0, x1) - 0.02;
    const maxX = Math.max(x0, x1) + 0.02;
    const minZ = Math.min(z0, z1) - 0.02;
    const maxZ = Math.max(z0, z1) + 0.02;
    this.queryId++;
    for (let x = Math.floor(minX); x <= Math.floor(maxX); x++) {
      for (let z = Math.floor(minZ); z <= Math.floor(maxZ); z++) {
        for (const index of this.cells.get(x * CELL_STRIDE + z) || []) {
          if (this.visited[index] === this.queryId) continue;
          this.visited[index] = this.queryId;
          const box = this.boxes[index];
          if (box.x1 < minX || box.x0 > maxX || box.z1 < minZ || box.z0 > maxZ || box.y1 < minY || box.y0 > maxY) continue;
          indices.push(index);
        }
      }
    }
    return indices;
  }

  groundAt(x, z, maxY) {
    let highest = null;
    for (const index of this.near(x, z, x, z, -99, maxY)) {
      const box = this.boxes[index];
      if (x < box.x0 - 0.03 || x > box.x1 + 0.03 || z < box.z0 - 0.03 || z > box.z1 + 0.03 || box.y1 > maxY + 0.001) continue;
      if (!box.water && (highest === null || box.y1 > highest)) highest = box.y1;
    }
    return highest !== null && this.waterAt(x, z, highest) ? null : highest;
  }

  waterAt(x, z, y) {
    return this.near(x - 0.22, z - 0.22, x + 0.22, z + 0.22, y - 0.05, y + 1.6).some(index => {
      const box = this.boxes[index];
      return box.water && y <= box.y1 + 0.05 && y >= box.y0 - 0.5;
    });
  }

  blocksAt(x, z, y) {
    return this.waterAt(x, z, y) || this.near(x - 0.2, z - 0.2, x + 0.2, z + 0.2, y + 0.42 + 0.01, y + 1.6).length > 0;
  }

  jumpLanding(from, x, z) {
    const y = this.groundAt(x, z, from.y + 1.7 + 0.05);
    if (y === null || y <= from.y + 0.42 || y > from.y + 1.7 + 0.001 || this.blocksAt(x, z, y)) return null;
    return this.near(from.x - 0.22, from.z - 0.22, from.x + 0.22, from.z + 0.22, from.y + 1.6, y + 1.6).length ? null : y;
  }
}
