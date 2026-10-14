import {mkdirSync,appendFileSync,renameSync,rmSync,statSync,existsSync,createReadStream,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {parseRange} from './static.mjs';
export const MAX_CINEMA_VIDEO=100*1024*1024;

/** Bounded chunks reuse the authenticated build endpoint and proxy body limit. */
export function createCinemaMedia(directory) {
  const pending=new Map();
  const valid=/^[a-f0-9-]{36}\.(mp4|webm)$/;
  const file=name=>{if(!valid.test(name))throw Error('影片地址无效');return join(directory,name);};
  function discard(row){rmSync(join(directory,row.id+'.part'),{force:true});pending.delete(row.owner);}
  return {
    prune(sources){
      if(!existsSync(directory))return;
      const keep=new Set(sources.map(src=>src.split('cinemaFile=')[1]));
      for(const name of readdirSync(directory)){
        if(!valid.test(name) && !/^[a-f0-9-]{36}\.part$/.test(name))continue;
        if(keep.has(name) || [...pending.values()].some(row=>name===row.id+'.part'))continue;
        const path=join(directory,name);
        if(Date.now()-statSync(path).mtimeMs>86400000)rmSync(path,{force:true});
      }
    },
    exists(src) {
      const name=src.split('cinemaFile=')[1];return Boolean(name && valid.test(name) && existsSync(file(name)));
    },
    upload(screenId,user,input) {
      mkdirSync(directory,{recursive:true,mode:0o700});
      for(const row of pending.values())if(Date.now()-row.at>120000)discard(row);
      if(!['video/mp4','video/webm'].includes(input.type) || !Number.isSafeInteger(input.total)
        || input.total<1 || input.total>MAX_CINEMA_VIDEO || typeof input.bytes!=='string'
        || input.bytes.length>175000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.bytes))throw Error('请选择 100 MB 以内的 MP4 或 WebM 视频');
      const bytes=Buffer.from(input.bytes,'base64');
      if(!bytes.length || bytes.length>128*1024)throw Error('影片分片无效');
      let row=pending.get(user.id);
      if(input.offset===0 && !input.uploadId) {
        if(row)discard(row);
        const magic=input.type==='video/mp4'?bytes.toString('ascii',4,8)==='ftyp':bytes.subarray(0,4).equals(Buffer.from([26,69,223,163]));
        if(!magic)throw Error('文件内容不是有效的 MP4 或 WebM');
        row={id:randomUUID(),owner:user.id,screenId,total:input.total,type:input.type,offset:0,at:Date.now()};
        pending.set(user.id,row);
      }
      if(!row || (input.uploadId && input.uploadId!==row.id) || row.screenId!==screenId
        || row.total!==input.total || row.type!==input.type || input.offset!==row.offset
        || row.offset+bytes.length>row.total)throw Error('影片上传进度不一致，请重新选择文件');
      try{appendFileSync(join(directory,row.id+'.part'),bytes,{mode:0o600});}
      catch(error){discard(row);throw error;}
      row.offset+=bytes.length;row.at=Date.now();
      if(row.offset<row.total)return {uploadId:row.id,offset:row.offset};
      const name=row.id+(row.type==='video/mp4'?'.mp4':'.webm');
      renameSync(join(directory,row.id+'.part'),file(name));pending.delete(user.id);
      return {uploadId:row.id,offset:row.offset,src:'/api/build?cinemaFile='+name};
    },
    serve(req,res,name) {
      let path,info;try{path=file(name);info=statSync(path);}catch{res.writeHead(404);res.end();return;}
      const range=parseRange(req.headers.range,info.size);
      if(range===undefined){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
      const start=range?.start || 0,end=range?.end ?? info.size-1;
      res.writeHead(range?206:200,{'Content-Type':name.endsWith('.mp4')?'video/mp4':'video/webm',
        'Content-Length':end-start+1,'Accept-Ranges':'bytes','Cache-Control':'private, max-age=86400',
        'X-Content-Type-Options':'nosniff',...(range?{'Content-Range':`bytes ${start}-${end}/${info.size}`}:{})});
      if(req.method==='HEAD'){res.end();return;}
      const stream=createReadStream(path,{start,end});
      res.on('close',()=>stream.destroy());stream.on('error',()=>res.destroy());stream.pipe(res);
    },
  };
}
