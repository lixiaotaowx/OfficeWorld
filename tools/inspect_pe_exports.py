import struct,pathlib,sys,bisect
b=pathlib.Path(sys.argv[1]).read_bytes()
u16=lambda o:struct.unpack_from('<H',b,o)[0]
u32=lambda o:struct.unpack_from('<I',b,o)[0]
pe=u32(60);n=u16(pe+6);sz=u16(pe+20);opt=pe+24
sects=[]
for i in range(n):
 o=opt+sz+i*40;sects.append((u32(o+12),u32(o+8),u32(o+20)))
def off(r):
 for a,s,p in sects:
  if a<=r<a+s:return p+r-a
 raise ValueError(r)
exp=off(u32(opt+(112 if u16(opt)==0x20b else 96)))
cnt=u32(exp+24);func=off(u32(exp+28));names=off(u32(exp+32));ords=off(u32(exp+36))
out=[]
for i in range(cnt):
 pos=off(u32(names+i*4));name=b[pos:b.index(b'\0',pos)].decode('ascii');addr=u32(func+u16(ords+i*2)*4);out.append((addr,name))
out.sort()
for arg in sys.argv[2:]:
 target=int(arg,16);idx=bisect.bisect_right(out,(target,chr(0x7f)))
 print(arg,[(hex(a),hex(target-a),name) for a,name in out[max(0,idx-2):idx+1]])
