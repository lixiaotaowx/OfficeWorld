  const loader=new KTX2Loader().setWorkerLimit(1).detectSupport(renderer);\
  const manager=new THREE.LoadingManager();\
  const loader=new KTX2Loader(manager).setWorkerLimit(1).detectSupport(renderer);\
  let expired=false,timer:ReturnType<typeof setTimeout>|undefined;\
  try {\
    const texture=await loader.loadAsync(BILLIARDS_ATLAS);\
    const request=loader.loadAsync(BILLIARDS_ATLAS).then(texture=>{if(expired){texture.dispose();throw Error('Billiards atlas timed out');}return texture;});\
    const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{expired=true;manager.abort();reject(Error('Billiards atlas timed out'));},8000);});\
    const texture=await Promise.race([request,timeout]);\
  } finally { loader.dispose(); }\
  } finally { if(timer)clearTimeout(timer);loader.dispose(); }\
