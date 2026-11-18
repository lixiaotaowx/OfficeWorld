  const selectors = '.dock, .dock-card, .dock-call-actions button';\
  const selectors = '.dock, .dock-card, .dock button, .dock input, .dock select, .dock textarea, .dock a[href]';\
    report([...document.querySelectorAll<HTMLElement>(selectors)]\
    const rects = [...document.querySelectorAll<HTMLElement>(selectors)]\
      .map(element => element.getBoundingClientRect())\
      .filter(rect => rect.width > 0 && rect.height > 0));\
      .filter(rect => rect.width > 0 && rect.height > 0)\
      .map(rect => new DOMRect(Math.max(0,rect.x),Math.max(0,rect.y),\
        Math.max(0,Math.min(innerWidth,rect.right)-Math.max(0,rect.x)),\
        Math.max(0,Math.min(innerHeight,rect.bottom)-Math.max(0,rect.y))));\
    report(rects.filter((rect,index) => rect.width > 0 && rect.height > 0 &&\
      !rects.some((outer,other) => other < index && outer.left <= rect.left &&\
        outer.top <= rect.top && outer.right >= rect.right && outer.bottom >= rect.bottom)));\
