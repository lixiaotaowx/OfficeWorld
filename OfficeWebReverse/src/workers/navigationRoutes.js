import { CollisionGrid } from './collisionGrid.js';

const SEARCH_STEP = 0.5;
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

function findWalkingPath(world, start, target, maxNodes = 20_000) {
  if (world.waterAt(target.x, target.z, target.y)) return null;
  const cachedSteps = new Map();

  function walkStep(from, x, z) {
    const key = `${from.x.toFixed(2)},${from.y.toFixed(2)},${from.z.toFixed(2)}>${x.toFixed(2)},${z.toFixed(2)}`;
    if (cachedSteps.has(key)) return cachedSteps.get(key);
    const y = world.groundAt(x, z, from.y + 0.42 + 0.05);
    const step = y !== null && y <= from.y + 0.42 && y >= from.y - 0.42 && !world.blocksAt(x, z, y)
      ? { x, y, z } : null;
    cachedSteps.set(key, step);
    return step;
  }

  function walkSegment(from, x, z) {
    const count = Math.max(1, Math.ceil(Math.hypot(x - from.x, z - from.z) / 0.26));
    let step = from;
    for (let index = 1; index <= count && step; index++) {
      step = walkStep(step, from.x + (x - from.x) * index / count, from.z + (z - from.z) * index / count);
    }
    return step && { x, y: step.y, z };
  }

  function canWalkDirectly(from, to) {
    const count = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / 0.2));
    let step = from;
    for (let index = 1; index <= count && step; index++) {
      step = walkSegment(step, from.x + (to.x - from.x) * index / count, from.z + (to.z - from.z) * index / count);
    }
    return !!step && Math.abs(step.y - to.y) < 0.1;
  }

  const keyOf = point => `${Math.round(point.x / SEARCH_STEP)},${Math.round(point.z / SEARCH_STEP)},${Math.round(point.y * 10)}`;
  const estimate = point => Math.hypot(target.x - point.x, target.z - point.z) + Math.abs(target.y - point.y);
  const first = { ...start, g: 0, f: estimate(start) };
  const queue = [first];
  const bestCost = new Map([[keyOf(first), 0]]);

  function enqueue(node) {
    queue.push(node);
    for (let index = queue.length - 1; index > 0;) {
      const parent = (index - 1) >> 1;
      if (queue[parent].f <= queue[index].f) break;
      [queue[parent], queue[index]] = [queue[index], queue[parent]];
      index = parent;
    }
  }

  function dequeue() {
    const first = queue[0];
    const last = queue.pop();
    if (queue.length) {
      queue[0] = last;
      for (let index = 0;;) {
        const left = index * 2 + 1;
        const right = left + 1;
        let lowest = index;
        if (left < queue.length && queue[left].f < queue[lowest].f) lowest = left;
        if (right < queue.length && queue[right].f < queue[lowest].f) lowest = right;
        if (lowest === index) break;
        [queue[lowest], queue[index]] = [queue[index], queue[lowest]];
        index = lowest;
      }
    }
    return first;
  }

  for (let count = 0; queue.length && count < maxNodes; count++) {
    const node = dequeue();
    if (Math.hypot(node.x - target.x, node.z - target.z) < 0.45 && Math.abs(node.y - target.y) < 0.15) {
      const path = [];
      for (let point = node; point; point = point.parent) path.unshift({ x: point.x, y: point.y, z: point.z });
      path.push({ x: target.x, y: node.y, z: target.z });
      const simplified = [];
      for (let index = 0; index < path.length - 1;) {
        let next = path.length - 1;
        while (next > index + 1 && !canWalkDirectly(path[index], path[next])) next--;
        simplified.push(path[next]);
        index = next;
      }
      return simplified;
    }
    const cellX = Math.round(node.x / SEARCH_STEP) * SEARCH_STEP;
    const cellZ = Math.round(node.z / SEARCH_STEP) * SEARCH_STEP;
    for (const [dx, dz] of DIRECTIONS) {
      const x = cellX + dx * SEARCH_STEP;
      const z = cellZ + dz * SEARCH_STEP;
      let step = walkSegment(node, x, z);
      let penalty = 0;
      if (!step) {
        const jumpY = world.jumpLanding(node, x, z);
        if (jumpY !== null) {
          step = { x, y: jumpY, z };
          penalty = 6;
        }
      }
      if (!step) {
        const dropY = world.groundAt(x, z, node.y + 0.05);
        if (dropY !== null && dropY < node.y - 0.42 && dropY >= node.y - 1.7 && !world.blocksAt(x, z, dropY)) {
          step = { x, y: dropY, z };
          penalty = 3;
        }
      }
      if (!step) continue;
      const cost = node.g + Math.hypot(x - node.x, z - node.z) + Math.abs(step.y - node.y) * 0.2 + penalty;
      const key = keyOf(step);
      if (cost >= (bestCost.get(key) ?? Infinity)) continue;
      bestCost.set(key, cost);
      enqueue({ ...step, g: cost, f: cost + estimate(step) * 1.5, parent: node });
    }
  }
  return null;
}

function clearSegment(world, from, to, ignoredIds) {
  const count = Math.max(1, Math.ceil(distance(from, to) / 0.08));
  for (let index = 0; index <= count; index++) {
    const ratio = index / count;
    const x = from.x + (to.x - from.x) * ratio;
    const y = from.y + (to.y - from.y) * ratio;
    const z = from.z + (to.z - from.z) * ratio;
    if (world.boxes.some(box => !ignoredIds.includes(box.partId || '') && box.x1 > x - 0.22 && box.x0 < x + 0.22 && box.z1 > z - 0.22 && box.z0 < z + 0.22 && box.y1 > y + 0.04 && box.y0 < y + 1.6)) return false;
  }
  return true;
}

function canEnterLadder(world, from, to, ignoredIds) {
  if (distance(from, to) > 0.75 || !clearSegment(world, to, to, ignoredIds)) return false;
  const overlapping = world.boxes.filter(box => box.x1 > from.x - 0.22 && box.x0 < from.x + 0.22 && box.z1 > from.z - 0.22 && box.z0 < from.z + 0.22 && box.y1 > from.y + 0.04 && box.y0 < from.y + 1.6);
  return clearSegment(new CollisionGrid(world.boxes.filter(box => !overlapping.includes(box))), from, to, ignoredIds);
}

const nearLadderTop = (ladder, point) => Math.abs(point.y - ladder.top.y) <= 0.42;
const downwardPath = ladder => [...ladder.up.slice(0, -1).reverse(), { ...ladder.bottom, climb: ladder.ids, face: ladder.up[0].face }];

function climbFromLadder(world, ladder, from) {
  const { bottom, up, ids } = ladder;
  if (from.y < bottom.y - 0.42 || from.y > up[0].y + 0.42 || Math.hypot(from.x - bottom.x, from.z - bottom.z) > 0.7) return null;
  if (nearLadderTop(ladder, from)) {
    const down = downwardPath(ladder);
    return clearSegment(world, from, down[0], ids) ? down : null;
  }
  const entry = { x: bottom.x, y: Math.max(bottom.y, Math.min(from.y, up[0].y)), z: bottom.z, climb: ids, climbEntry: true, face: up[0].face };
  return canEnterLadder(world, from, entry, ids) ? [entry, ...up] : null;
}

function findLadderPath(world, ladders, from, ladderId) {
  let shortest = null;
  let minimumDistance = Infinity;
  for (const ladder of ladders.filter(item => item.ids.includes(ladderId))) {
    const directClimb = climbFromLadder(world, ladder, from);
    const fromTop = nearLadderTop(ladder, from);
    const approach = directClimb ? [] : findWalkingPath(world, from, fromTop ? ladder.top : ladder.bottom, 5_000);
    if (!approach) continue;
    const climb = directClimb || (fromTop ? downwardPath(ladder) : ladder.up);
    const path = [...approach, ...climb];
    let previous = from;
    let length = 0;
    for (const point of path) {
      length += distance(previous, point);
      previous = point;
    }
    if (length < minimumDistance) {
      minimumDistance = length;
      shortest = path;
    }
  }
  return shortest;
}

function routeThroughLadder(world, ladders, from, target) {
  const approachDistance = ladder => Math.min(distance(ladder.top, target), distance(ladder.bottom, target));
  for (const ladder of [...ladders].sort((a, b) => approachDistance(a) - approachDistance(b))) {
    const climb = findLadderPath(world, [ladder], from, ladder.ids[0]);
    if (!climb?.length) continue;
    const tail = findWalkingPath(world, climb[climb.length - 1], target, 5_000);
    if (tail) return [...climb, ...tail];
  }
  return null;
}

function blocked(world, point) {
  return world.blocksAt(point.x, point.z, point.y) || world.waterAt(point.x, point.z, point.y);
}

export function resolveNavigationRequest(request) {
  const { boxes, ladders, start, kind } = request;
  const world = new CollisionGrid(boxes);
  if (kind === 'walk') {
    const { target } = request;
    if (blocked(world, target)) return null;
    return findWalkingPath(world, start, target) || routeThroughLadder(world, ladders, start, target);
  }
  if (kind === 'seat') {
    const targets = request.targets.filter(target => !blocked(world, target));
    for (const target of targets) {
      const path = findWalkingPath(world, start, target);
      if (path) return path;
    }
    for (const target of targets) {
      const path = routeThroughLadder(world, ladders, start, target);
      if (path) return path;
    }
    return null;
  }
  return findLadderPath(world, ladders, start, request.id);
}
