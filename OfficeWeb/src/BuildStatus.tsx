import { useEffect, useState } from 'react';

/** Keep operation feedback without the former construction toolbar. */
export function BuildStatus({hint,tip,message,ready}: {hint:string;tip:string;message:string;ready:boolean}) {
  const [banner,setBanner]=useState('');
  useEffect(()=>{
    if(!hint)return;
    setBanner(hint);
    const timer=setTimeout(()=>setBanner(''),4500);
    return ()=>clearTimeout(timer);
  },[hint]);
  const text=tip || banner || (!ready ? message : '');
  return text ? <span className="build-hint" role="status">{text}</span> : null;
}
