export async function uploadCinemaVideo(id:string,file:File,signal:AbortSignal,progress:(n:number)=>void) {
  if(!['video/mp4','video/webm'].includes(file.type) || file.size>100*1024*1024 || !file.size)
    throw Error('请选择 100 MB 以内的 MP4 或 WebM 视频');
  let uploadId='';
  for(let offset=0;offset<file.size;){
    signal.throwIfAborted();
    const bytes=new Uint8Array(await file.slice(offset,offset+128*1024).arrayBuffer());
    let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    await new Promise(resolve=>setTimeout(resolve,130));signal.throwIfAborted();
    const response=await fetch('/api/build?cinemaUpload='+encodeURIComponent(id),{method:'POST',credentials:'same-origin',signal,
      headers:{'Content-Type':'application/json'},body:JSON.stringify({uploadId,offset,total:file.size,type:file.type,bytes:btoa(binary)})});
    const data=await response.json();if(!response.ok)throw Error(data.error || '视频上传失败');
    uploadId=data.uploadId;offset=data.offset;progress(Math.round(offset/file.size*100));
    if(data.src)return data.src as string;
  }
  throw Error('视频上传未完成');
}
