    return supportHeight(position.x, position.z, position.y) === null;\
    const floor=supportBelow(position.x,position.z,position.y+0.255);\
    if(floor===null || floor<position.y-0.255)return true;\
    // 地板被抬高/落格时，脚点跟随近邻顶面，不留在地板内部继续穿透。\
    position.y=floor;\
    return false;\
