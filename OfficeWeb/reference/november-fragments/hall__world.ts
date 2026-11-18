export interface Box { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; partId?: string }\
export interface Box { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; partId?: string; water?: boolean }\
      if (top === null || b.y1 > top) top = b.y1;\
      if (!b.water && (top === null || b.y1 > top)) top = b.y1;\
    return top;\
    if (top !== null && this.waterAt(x, z, top)) return null;\
    return top;\
  }\
  /** Water masks the floor beneath it, while bridges above the surface stay usable. */\
  waterAt(x: number, z: number, feet: number): boolean {\
    return this.near(x - RADIUS, z - RADIUS, x + RADIUS, z + RADIUS, feet - .05, feet + BODY_H)\
      .some(i => { const b = this.boxes[i]; return b.water && feet <= b.y1 + .05 && feet >= b.y0 - .5; });\
  }\
    return this.near(x - r, z - r, x + r, z + r, feet + STEP + 0.01, feet + BODY_H).length > 0;\
    return this.waterAt(x, z, feet) || this.near(x - r, z - r, x + r, z + r, feet + STEP + 0.01, feet + BODY_H).length > 0;\
