const N = 512;\
const SPRITE = 256;\
const rotated = (source: CanvasImageSource, angle: number, cx: number, cy: number) => {\
};\
const crop = (b: Box) => { const bw = b.x1 - b.x0, w = bw * .94; return { x: (b.x0 + b.x1) / 2 - w / 2, y: b.y0 - bw * .14, w, bw }; };\
/** Keep only the visible face, at enough resolution for a 56px avatar on a 4× display. */\
function compact(source: HTMLCanvasElement, box: Box) {\
  const out=document.createElement('canvas');out.width=out.height=SPRITE;\
  const x=ctx(out), v=crop(box);x.imageSmoothingQuality='high';\
  x.drawImage(source,v.x,v.y,v.w,v.w,0,0,SPRITE,SPRITE);\
  source.width=source.height=0;\
  return out;\
}\
const images = new Map<string, Promise<HTMLImageElement>>();\
const load = (url: string) => {\
  if (!images.has(url)) images.set(url, new Promise((resolve, reject) => {\
  const cached=images.get(url); if(cached)return cached;\
  const work=new Promise<HTMLImageElement>((resolve, reject) => {\
    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url;\
  }));\
  return images.get(url)!;\
  });\
  // Generated portrait data URLs are unique per look; retaining their decoded\
  // images forever duplicates the compact face cache.\
  if(!url.startsWith('data:')) {\
    images.set(url,work);work.catch(()=>{if(images.get(url)===work)images.delete(url)});\
    if(images.size>48)images.delete(images.keys().next().value!);\
  }\
  return work;\
    return { angle, cx, cy, box, eyes };\
    c.width=c.height=0;up.width=up.height=0;\
    return { angle, cx, cy, box, eyes };\
      x.drawImage(rotated(layers, focus.angle, focus.cx, focus.cy), 0, 0);\
      return { front, closed, back, geo, backBox: b };\
      const backLayers=rotated(layers, focus.angle, focus.cx, focus.cy);x.drawImage(backLayers, 0, 0);\
      layers.width=layers.height=0;backLayers.width=backLayers.height=0;\
      return { front:compact(front,geo.box), closed:closed?compact(closed,geo.box):null, back:compact(back,b), geo, backBox: b };\
    work.catch(() => sets.delete(key));\
    if (sets.size > 64) sets.delete(sets.keys().next().value!);\
    work.catch(() => { if(sets.get(key)===work)sets.delete(key); });\
    if (sets.size > 32) sets.delete(sets.keys().next().value!);\
  const crop = (b: Box) => { const bw = b.x1 - b.x0, w = bw * .94; return { x: (b.x0 + b.x1) / 2 - w / 2, y: b.y0 - bw * .14, w, bw }; };\
  if (opts.turned) {\
    const v = crop(faces.backBox);\
    x.save(); x.translate(size / 2, 0); x.transform(.8, -.06, 0, 1, 0, 0); x.translate(-size / 2, size * .03);\
    x.drawImage(faces.back, v.x, v.y, v.w, v.w, 0, 0, size, size); x.restore(); return;\
    x.drawImage(faces.back, 0, 0, size, size); x.restore(); return;\
  x.drawImage(faces.front, v.x, v.y, v.w, v.w, 0, 0, size, size);\
  x.drawImage(faces.front, 0, 0, size, size);\
    x.drawImage(faces.closed, v.x, v.y, v.w, v.w, 0, 0, size, size); x.restore();\
    x.drawImage(faces.closed, 0, 0, size, size); x.restore();\
