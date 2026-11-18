      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=577;\
      const canvas=document.createElement('canvas');\
      const w=3.78*(part.scale?.[0] || 1),h=2.13*(part.scale?.[1] || 1),max=Math.max(w,h);\
      canvas.width=Math.max(1,Math.round(1024*w/max));canvas.height=Math.max(1,Math.round(1024*h/max));\
  private message(row:Row,text:string){\
    const c=row.canvas.getContext('2d')!;c.fillStyle='#182321';c.fillRect(0,0,1024,577);\
    c.fillStyle='#d4e2dc';c.font='30px sans-serif';c.textAlign='center';c.fillText(text,512,295);row.texture.needsUpdate=true;\
    const c=row.canvas.getContext('2d')!,{width,height}=row.canvas;c.fillStyle='#182321';c.fillRect(0,0,width,height);\
    c.fillStyle='#d4e2dc';c.font='30px sans-serif';c.textAlign='center';c.fillText(text,width/2,height/2);row.texture.needsUpdate=true;\
    const c=row.canvas.getContext('2d')!;c.fillStyle='#111817';c.fillRect(0,0,1024,577);\
    try{const r=cinemaRect(w,h,1024,577,content.fit);c.drawImage(media,r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7]);}\
    const c=row.canvas.getContext('2d')!,{width,height}=row.canvas;c.fillStyle='#111817';c.fillRect(0,0,width,height);\
    try{const r=cinemaRect(w,h,width,height,content.fit);c.drawImage(media,r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7]);}\
    if(row.platform){c.fillStyle='#ffffff';c.font='60px sans-serif';c.textAlign='center';c.fillText('▶',512,310);}\
    if(row.platform){c.fillStyle='#ffffff';c.font='60px sans-serif';c.textAlign='center';c.fillText('▶',width/2,height/2);}\
    const visible=row.object.visible && this.point.z>=-1 && this.point.z<=1 && Math.abs(this.point.x)<1.2 && Math.abs(this.point.y)<1.2;\
    const visible=!document.hidden && row.object.visible && this.point.z>=-1 && this.point.z<=1 && Math.abs(this.point.x)<1.2 && Math.abs(this.point.y)<1.2;\
