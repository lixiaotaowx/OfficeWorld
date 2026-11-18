export const HALL_ACTIVE_FRAME_MS=31;\
export const HALL_IDLE_FRAME_MS=100;\
export const HALL_IDLE_CAT_FRAME_MS=1000/24;\
\
export function hallFrameInterval(now:number,lastInteraction:number,busy:boolean,moving:boolean,video:boolean) {\
export function hallFrameInterval(now:number,lastInteraction:number,busy:boolean,moving:boolean,video:boolean,catMoving=false) {\
  if(busy)return 0;\
  if(now-lastInteraction>=HALL_IDLE_AFTER_MS&&!moving&&!video)return HALL_IDLE_FRAME_MS;\
  if(now-lastInteraction>=HALL_IDLE_AFTER_MS&&!moving&&!video)return catMoving ? HALL_IDLE_CAT_FRAME_MS : HALL_IDLE_FRAME_MS;\
  return HALL_ACTIVE_FRAME_MS;\
}\
\
/** Carry the small display-frame remainder so 24 fps does not round down to 20 on a 60 Hz display. */\
export function catFrameTimestamp(now:number,lastFrame:number) {\
  return now-Math.min(HALL_IDLE_CAT_FRAME_MS,Math.max(0,now-lastFrame-HALL_IDLE_CAT_FRAME_MS));\
}\
\
