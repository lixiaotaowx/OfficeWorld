import * as THREE from 'three';
import type {BuildPart} from './buildTypes';
import {buildRequest} from './buildRequest';
import {chestVideo} from './chestVideo';
import {cinemaRect,type CinemaContent} from './cinemaTypes';
type Row={key:string;object:THREE.Group;canvas:HTMLCanvasElement;texture:THREE.CanvasTexture;
  material:THREE.MeshBasicMaterial;media?:HTMLImageElement|HTMLVideoElement;content?:CinemaContent;platform:boolean};

/** Display-only resources. Content facts remain in the authenticated build store. */
export class BuildCinemaScreens {
  private rows=new Map<string,Row>();
  private timer:ReturnType<typeof setInterval>;
  private point=new THREE.Vector3();
  constructor(private camera:THREE.Camera){this.timer=setInterval(()=>this.tick(),100);}
  sync(parts:BuildPart[],objects:Map<string,THREE.Group>){
    const live=new Set(parts.filter(p=>p.kind==='cinema-screen').map(p=>p.id));
    for(const [id,row] of this.rows)if(!live.has(id) || row.object!==objects.get(id))this.release(id,row);
    for(const part of parts){
      if(part.kind!=='cinema-screen' || !part.cinemaVersion)continue;
      const object=objects.get(part.id);if(!object)continue;
      const key=String(part.cinemaVersion);const previous=this.rows.get(part.id);
      if(previous?.key===key)continue;
      if(previous)this.release(part.id,previous);
      const face=object.getObjectByName('cinema-display') as THREE.Mesh;
      if(!face)continue;
      const canvas=document.createElement('canvas');
      const w=3.78*(part.scale?.[0] || 1),h=2.13*(part.scale?.[1] || 1),max=Math.max(w,h);
      canvas.width=Math.max(1,Math.round(1024*w/max));canvas.height=Math.max(1,Math.round(1024*h/max));
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
      const row:Row={key,object,canvas,texture,material,platform:false};this.rows.set(part.id,row);
      face.material=material;
      object.traverse(o=>{if(o.name==='cinema-placeholder')o.visible=false;});
      this.message(row,'正在加载影院内容…');
      void buildRequest('?cinema='+encodeURIComponent(part.id)).then(data=>{
        if(this.rows.get(part.id)!==row)return;
        const content=data.content as CinemaContent|null;
        if(!content){this.message(row,'点击设置图片或视频');return;}
        row.content=content;row.platform=content.type==='video' && Boolean(chestVideo(content.src));
        const media=content.type==='video' && !row.platform?document.createElement('video'):new Image();
        row.media=media;media.crossOrigin='anonymous';
        media.onerror=()=>this.message(row,row.platform?'点击打开平台播放器':'无法加载内容 · 点击检查地址');
        if(media instanceof HTMLVideoElement){media.muted=true;media.loop=true;media.playsInline=true;media.preload='metadata';}
        else media.onload=()=>this.paint(row);
        media.src=row.platform?'/api/build?cover='+encodeURIComponent(content.src):content.src;
        object.userData.cinema={type:content.type,fit:content.fit,platform:row.platform};
      }).catch(()=>{if(this.rows.get(part.id)===row)this.message(row,'内容暂时无法加载 · 点击重试');});
    }
  }
  private message(row:Row,text:string){
    const c=row.canvas.getContext('2d')!,{width,height}=row.canvas;c.fillStyle='#182321';c.fillRect(0,0,width,height);
    c.fillStyle='#d4e2dc';c.font='30px sans-serif';c.textAlign='center';c.fillText(text,width/2,height/2);row.texture.needsUpdate=true;
  }
  private paint(row:Row){
    const media=row.media,content=row.content;if(!media || !content)return;
    const video=media instanceof HTMLVideoElement;
    const w=video?media.videoWidth:media.naturalWidth,h=video?media.videoHeight:media.naturalHeight;
    if(!w || !h)return;
    const c=row.canvas.getContext('2d')!,{width,height}=row.canvas;c.fillStyle='#111817';c.fillRect(0,0,width,height);
    try{const r=cinemaRect(w,h,width,height,content.fit);c.drawImage(media,r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7]);}
    catch{this.message(row,'图片或视频地址不允许跨站显示');return;}
    if(row.platform){c.fillStyle='#ffffff';c.font='60px sans-serif';c.textAlign='center';c.fillText('▶',width/2,height/2);}
    row.texture.needsUpdate=true;row.object.userData.cinemaFrame=(row.object.userData.cinemaFrame || 0)+1;
  }
  private tick(){for(const row of this.rows.values()){
    const video=row.media;if(!(video instanceof HTMLVideoElement))continue;
    row.object.getWorldPosition(this.point);this.point.project(this.camera);
    const visible=!document.hidden && row.object.visible && this.point.z>=-1 && this.point.z<=1 && Math.abs(this.point.x)<1.2 && Math.abs(this.point.y)<1.2;
    if(!visible){video.pause();continue;}
    if(video.paused && video.readyState>=1)void video.play().catch(()=>{});
    if(video.readyState>=2)this.paint(row);
  }}
  private release(id:string,row:Row){
    if(row.media){row.media.onerror=null;
      if(row.media instanceof HTMLVideoElement){row.media.pause();row.media.removeAttribute('src');row.media.load();}
      else {row.media.onload=null;row.media.src='';}}
    row.texture.dispose();row.material.dispose();this.rows.delete(id);
  }
  dispose(){clearInterval(this.timer);for(const [id,row] of this.rows)this.release(id,row);}
}
