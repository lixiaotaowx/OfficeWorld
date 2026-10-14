export function cleanCinemaContent(raw) {
  if(raw===null)return null;
  if(!raw || !['image','video'].includes(raw.type) || !['contain','cover','stretch'].includes(raw.fit)
    || typeof raw.src!=='string')throw Error('影院内容或显示方式无效');
  const src=raw.src.trim();
  const image=/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(src);
  const local=/^\/api\/build\?cinemaFile=[a-f0-9-]{36}\.(?:mp4|webm)$/.test(src);
  if(image) {
    if(raw.type!=='image' || src.length>220000)throw Error('影院图片过大或无效');
    const bytes=Buffer.from(src.slice(src.indexOf(',')+1),'base64');
    if(!(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
      (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) ||
      (bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP')))throw Error('图片数据无效');
  }else if(local){if(raw.type!=='video')throw Error('影片类型无效');}
  else {
    let url;try{url=new URL(src);}catch{throw Error('请输入有效的图片或视频地址');}
    if(url.protocol!=='https:' || url.username || url.password || src.length>2000)throw Error('仅支持 HTTPS 图片或视频地址');
  }
  return {type:raw.type,src,fit:raw.fit};
}
