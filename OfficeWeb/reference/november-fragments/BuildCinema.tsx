  const abort=useRef(new AbortController());\
  const previewVideo=useRef<HTMLVideoElement>(null);\
  useEffect(()=>{\
    const video=previewVideo.current;\
    return()=>{if(video){video.pause();video.removeAttribute('src');video.load();}};\
  },[src,type]);\
          src && type==='video' && !info?<video src={src} controls playsInline preload="metadata" style={{objectFit:fit==='stretch'?'fill':fit}} onError={()=>setError('视频暂时无法加载，请检查文件格式或地址')} />:\
          src && type==='video' && !info?<video key={src} ref={previewVideo} src={src} controls playsInline preload="metadata" style={{objectFit:fit==='stretch'?'fill':fit}} onError={()=>setError('视频暂时无法加载，请检查文件格式或地址')} />:\
