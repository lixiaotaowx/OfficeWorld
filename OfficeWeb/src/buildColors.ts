import * as THREE from 'three';
// Persisted palette IDs remain stable, so existing worlds receive the same art direction.
const palette: Record<string,string> = {
  '#f3dfc5':'#ffe6c7', '#e9b8b5':'#f2aaa6', '#b9c9df':'#a5bced',
  '#b4c5a0':'#abc477', '#cabddd':'#c8b2e8', '#c69770':'#dfad82', '#596679':'#657797',
};
export function buildColor(value: string) {
  if (palette[value]) return palette[value];
  const color = new THREE.Color(value), hsl = { h:0, s:0, l:0 };
  color.getHSL(hsl, THREE.SRGBColorSpace);
  if (hsl.l > .25) color.setHSL(hsl.h, Math.min(.65,hsl.s*1.12), Math.min(.92,hsl.l+.025), THREE.SRGBColorSpace);
  return '#' + color.getHexString();
}
