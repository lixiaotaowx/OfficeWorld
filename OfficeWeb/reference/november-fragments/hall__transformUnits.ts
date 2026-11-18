  for (const [w,h,d,x,y,z] of def?.boxes || []) add([x,y,z], [w/2,h/2,d/2]);\
  if (def?.arch) {\
    const { outerRadius, springHeight, depth } = def.arch;\
    const height = springHeight + outerRadius;\
    add([0, height / 2, 0], [outerRadius, height / 2, depth / 2]);\
  }\
