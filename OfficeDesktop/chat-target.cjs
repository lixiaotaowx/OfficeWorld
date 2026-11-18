const fs=require('node:fs/promises'),path=require('node:path');
function createChatTargetOpener(shell,stat=fs.stat){
 return async(state,input)=>{
  const target=input?.target;
  if(typeof target!=='string'||!target||target.length>1000||/[\x00-\x1f]/.test(target))return{ok:false,error:'地址格式不正确'};
  const message=state.chat?.open===input.conversation&&state.chat.messages?.find(m=>m.id===input.messageId);
  if(!message||!message.text.includes(target))return{ok:false,error:'消息已切换，请重新打开聊天后重试'};
  try{
   if(/^(https?:\/\/|www\.)/i.test(target)){
    const url=new URL(/^www\./i.test(target)?'https://'+target:target);
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('链接格式不正确');
    await shell.openExternal(url.href);return{ok:true};
   }
   if(!/^(?:[a-z]:[\\/]|\\\\[^\\/]+[\\/][^\\/]+)/i.test(target)||/^\\\\[?.]\\/.test(target)||target.slice(2).includes(':'))throw Error('仅支持完整的 Windows 文件或共享文件夹路径');
   let info, timer;try{info=await Promise.race([stat(target),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),8000);})]);}catch{throw Error('此电脑找不到该路径，或没有访问权限；请检查盘符和共享文件夹');}finally{clearTimeout(timer);}
   if(!info.isFile()&&!info.isDirectory())throw Error('该路径不是文件或文件夹');
   if(info.isFile()&&/\.(exe|com|bat|cmd|ps1|vbs|vbe|js|jse|wsf|wsh|msi|msp|scr|hta|lnk|url|reg|py|pyw|sh|bash|pl|rb|jar|appref-ms|application|gadget)$/i.test(path.win32.basename(target))){shell.showItemInFolder(target);return{ok:true};}
   const error=await shell.openPath(target);if(error)throw Error('无法打开该路径，请检查文件关联和访问权限');
   return{ok:true};
  }catch(e){return{ok:false,error:e.message||'无法打开该地址'};}
 };
}
module.exports={createChatTargetOpener};
