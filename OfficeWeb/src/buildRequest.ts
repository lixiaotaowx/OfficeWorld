/** Authenticated build API, shared by presentation features and the React store. */
export async function buildRequest(query='',command?:unknown) {
  const response=await fetch(`/api/build${query}`,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000),
    ...(command?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)}:{})});
  const value=await response.json();if(!response.ok)throw Error(value.error || '暂时无法保存');return value;
}
