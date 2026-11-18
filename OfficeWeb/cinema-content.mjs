export function cleanCinemaContent(raw) {
  if(raw===null)return null;
  if(!raw || !['image','video'].includes(raw.type) || !['contain','cover','stretch'].includes(raw.fit)
    || typeof raw.src!=='string')throw Error('Invalid cinema content or display mode');
  const src=raw.src.trim();
  const image=/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(src);
  const local=/^\/api\/build\?cinemaFile=[a-f0-9-]{36}\.(?:mp4|webm)$/.test(src);
  if(image) {
    if(raw.type!=='image' || src.length>220000)throw Error('Cinema image is too large or invalid');
    const bytes=Buffer.from(src.slice(src.indexOf(',')+1),'base64');
    if(!(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
      (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) ||
      (bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP')))throw Error('Invalid image data');
  }else if(local){if(raw.type!=='video')throw Error('Invalid video type');}
  else {
    let url;try{url=new URL(src);}catch{throw Error('Enter a valid image or video URL');}
    if(url.protocol!=='https:' || url.username || url.password || src.length>2000)throw Error('Only HTTPS image and video URLs are supported');
  }
  return {type:raw.type,src,fit:raw.fit};
}
