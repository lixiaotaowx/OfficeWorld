  let state: BilliardsState|null=null;\
  const states=new Map<string,BilliardsState>();\
    snapshot:()=>state,\
    snapshot:(tableId:string)=>states.get(tableId)||null,\
    states:()=>states,\
    receive:(next:BilliardsState)=>{state=next;listeners.forEach(fn=>fn());},\
    async act(command:BilliardsAction) {\
    receive:(next:(BilliardsState&{tableId:string})|{tableId:string;removed:true})=>{\
      if('removed' in next)states.delete(next.tableId);else states.set(next.tableId,next);listeners.forEach(fn=>fn());\
    },\
    async act(tableId:string,command:BilliardsAction) {\
      try {reply=await active.timeout(6000).emitWithAck('billiards-action',command);}\
      try {reply=await active.timeout(6000).emitWithAck('billiards-action',{...command,tableId});}\
