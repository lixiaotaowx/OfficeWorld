 * 从 `fromY` 往下：`(x,z)` 处能站上去的最高那一层（没有就是 null）。\
 * 从 `fromY` 往下：`(x,z)` 处实体顶面的最高一层（没有就是 null）。\
  return levels.find(y => !solids.some(b => b.max.y > y+0.01 && b.min.y < y+BODY_HEIGHT-0.01)) ?? null;\
  // 重力只问脚下是否有实体；头顶/身体被家具挡住不能使地板失去承托。\
  // 行走与寻路仍使用 supportHeight / blocksBody 的净空判定。\
  return levels[0] ?? null;\
}\
/** 身体会不会被实体挡住：既抬不上去（顶面高过抬腿高度），又钻不过去（底面低过头顶）。 */\
