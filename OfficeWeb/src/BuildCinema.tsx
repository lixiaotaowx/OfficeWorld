import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {buildRequest} from './buildRequest';
import {imageData} from './buildImageData';
import {uploadCinemaVideo} from './cinemaUpload';
import {chestVideo} from './chestVideo';
import {ChestVideoFrame} from './ChestVideoFrame';
import {ScreenIcon} from './icons';
import {useCinemaSource} from './useCinemaSource';
import {cinemaInput,cinemaSourceName} from './cinemaSource';
import type {CinemaContent,CinemaFit} from './cinemaTypes';
import './chestVideo.css';
import './cinema.css';

const fits=[{value:'contain',name:'自适应',detail:'完整显示'},
  {value:'cover',name:'填充',detail:'裁边铺满'},{value:'stretch',name:'拉伸',detail:'铺满尺寸'}] as const;

export function BuildCinema({id,onClose}:{id:string;onClose:()=>void}){
  const [src,setSrc]=useState(''),[fit,setFit]=useState<CinemaFit>('contain');
  const [version,setVersion]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [filename,setFilename]=useState(''),[loaded,setLoaded]=useState(false);
  const {kind,detecting,error:detectError}=useCinemaSource(src);
  const abort=useRef(new AbortController()),fileInput=useRef<HTMLInputElement>(null);
  const previewVideo=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const video=previewVideo.current;
    return()=>{if(video){video.pause();video.removeAttribute('src');video.load();}};
  },[src,kind]);
  useEffect(()=>{
    const controller=new AbortController();abort.current=controller;let stopped=false;
    void buildRequest('?cinema='+encodeURIComponent(id)).then(data=>{
      if(stopped)return;setVersion(data.version);setLoaded(true);
      if(data.content){setSrc(data.content.src);setFit(data.content.fit);}
    }).catch(e=>{if(!stopped)setError(e.message);});
    return()=>{stopped=true;controller.abort();};
  },[id]);
  async function choose(file:File){
    setBusy(true);setError('');setNotice('');
    try{
      const mime=file.type || ({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',mp4:'video/mp4',webm:'video/webm'} as Record<string,string>)[file.name.split('.').at(-1)?.toLowerCase() || ''];
      if(!mime || !['image/png','image/jpeg','image/webp','video/mp4','video/webm'].includes(mime))throw Error('请选择 PNG、JPEG、WebP 图片，或 MP4、WebM 视频');
      const normalized=file.type?file:new File([file],file.name,{type:mime});
      const value=mime.startsWith('image/')?await imageData(normalized):await uploadCinemaVideo(id,normalized,abort.current.signal,n=>setNotice(`上传视频 ${n}%`));
      if(!abort.current.signal.aborted){setSrc(value);setFilename(file.name);setNotice('已准备好，保存后会显示在屏幕上');}
    }catch(e){if(!abort.current.signal.aborted)setError((e as Error).message);}
    finally{if(!abort.current.signal.aborted)setBusy(false);}
  }
  async function save(clear=false){
    setBusy(true);setError('');setNotice('');
    try{
      let value=src.trim();
      if(!clear && !kind)throw Error('正在识别内容，请稍候');
      if(!clear && /^https:\/\/(?:b23\.tv|v\.douyin\.com)\//.test(value))value=(await buildRequest('?resolveLink='+encodeURIComponent(value))).url;
      const platform=kind==='video'?chestVideo(value):null;
      if(!clear && platform && !platform.embed)throw Error(platform.message || '请使用完整的视频地址');
      await new Promise(resolve=>setTimeout(resolve,130));
      await buildRequest('',{action:'cinema',id,version,content:clear?null:{type:kind!,src:value,fit} satisfies CinemaContent});
      const data=await buildRequest('?cinema='+encodeURIComponent(id));setVersion(data.version);
      setSrc(clear?'':value);if(clear)setFilename('');setNotice(clear?'已清空屏幕':'已保存，空间内所有人可看到');
    }catch(e){setError((e as Error).message);}
    finally{setBusy(false);}
  }
  const info=kind==='video'?chestVideo(src):null,name=cinemaSourceName(src,kind);
  const local=src.startsWith('data:') || src.startsWith('/api/build?cinemaFile=');
  const caption=info?'屏幕显示视频封面，使用上方官方播放器观看。':kind==='video'?'地图中静音循环播放，预览中可手动开启声音。':kind==='image'?'图片会按所选方式显示在影院屏幕上。':'粘贴图片、视频或 B站 / 抖音链接，自动识别内容。';
  return createPortal(<div className="cinema-backdrop" onClick={onClose}>
    <section className="cinema-panel" role="dialog" aria-modal="true" aria-label="影院屏幕设置" onClick={e=>e.stopPropagation()}>
      <header className="cinema-heading"><span className="cinema-heading-icon"><ScreenIcon /></span>
        <div><h2>影院屏幕</h2><p>放上喜欢的内容，分享给空间里的人。</p></div>
        <button className="cinema-close" aria-label="关闭影院屏幕" onClick={onClose}>×</button></header>
      <div className="cinema-body">
        <div className="cinema-view"><div className="cinema-preview">
          {src && kind==='image'?<img src={src} alt="影院图片预览" style={{objectFit:fit==='stretch'?'fill':fit}} onError={()=>setError('图片暂时无法加载，请检查地址')} />:
            src && info?.embed?<ChestVideoFrame title="影院平台播放器" src={info.embed} portrait={info.portrait} />:
            src && kind==='video' && !info?<video key={src} ref={previewVideo} src={src} controls playsInline preload="metadata" style={{objectFit:fit==='stretch'?'fill':fit}} onError={()=>setError('视频暂时无法加载，请检查文件格式或地址')} />:
            <div className="cinema-empty"><ScreenIcon /><strong>{detecting?'正在识别内容…':'让这块屏幕亮起来'}</strong><p>{info?.message || '贴个链接，或从电脑里选一个文件。'}</p></div>}
        </div><div className="cinema-preview-caption"><span>屏幕预览</span>{name && <span className="cinema-kind">{name}</span>}</div><p className="cinema-caption">{caption}</p></div>
        <div className="cinema-settings">
          <label className="cinema-link">内容链接<input aria-label="内容链接" disabled={busy || !loaded} value={local?'':src}
            placeholder="粘贴图片、视频、B站或抖音链接"
            onChange={e=>{setSrc(cinemaInput(e.target.value));setFilename('');setError('');setNotice('');}} /></label>
          <div className="cinema-recognition" aria-live="polite">{detecting?'正在自动识别链接…':name?`已识别为${name}`:'无需选择类型，自动识别图片与视频'}</div>
          <div className="cinema-or"><span>或者</span></div>
          <button className="cinema-upload" disabled={busy || !loaded} onClick={()=>fileInput.current?.click()}>
            <span className="cinema-upload-symbol" aria-hidden="true">↥</span><span><strong>{filename || (local?'更换本地文件':'选择本地文件')}</strong><small>图片 ≤ 20 MB · 视频 ≤ 100 MB</small></span></button>
          <input ref={fileInput} type="file" className="cinema-file" aria-label="选择本地文件" disabled={busy || !loaded}
            accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" onChange={e=>{const file=e.target.files?.[0];if(file)void choose(file);e.target.value='';}} />
          <fieldset className="cinema-fit"><legend>显示方式</legend><div>{fits.map(choice=><label key={choice.value} data-fit={choice.value}>
            <input type="radio" name="cinema-fit" aria-label={choice.name} checked={fit===choice.value} disabled={busy} onChange={()=>setFit(choice.value)} />
            <span className="cinema-fit-icon" aria-hidden="true"><i /></span><strong>{choice.name}</strong><small>{choice.detail}</small>
          </label>)}</div></fieldset>
          {(error || detectError) && <p className="cinema-error" role="alert">{error || detectError}</p>}
        </div>
      </div>
      <footer className="cinema-footer"><div><button className="cinema-clear" disabled={busy || !loaded} onClick={()=>void save(true)}>清空屏幕</button>
        {notice && <span role="status">{notice}</span>}</div>
        <button className="cinema-save" disabled={busy || !loaded || !kind || Boolean(error || detectError)} onClick={()=>void save()}>{busy?'处理中…':'保存到屏幕'}</button></footer>
    </section></div>,document.body);
}
