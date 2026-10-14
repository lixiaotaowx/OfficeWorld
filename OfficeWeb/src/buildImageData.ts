/** Shared by treasure chests and cinema screens. Never persist object URLs. */
export async function imageData(file:File) {
  if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>20*1024*1024)
    throw Error('请选择 20 MB 以内的 PNG、JPEG 或 WebP 图片');
  const bitmap=await createImageBitmap(file);
  try {
    const scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let data=canvas.toDataURL('image/webp',.8);
    for(let attempt=0;data.length>220000 && attempt<5;attempt++){
      canvas.width=Math.max(1,Math.round(canvas.width*.8));canvas.height=Math.max(1,Math.round(canvas.height*.8));
      canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);data=canvas.toDataURL('image/webp',.7);
    }
    if(data.length>220000)throw Error('图片内容较复杂，请选择更小的图片');
    return data;
  }finally{bitmap.close();}
}
