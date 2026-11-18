/** 睡眠快照的准入规则（11 月 x6.snapshotForSleep 的判定层）：
 *  窗口要休眠（系统省电/失焦）时，只有在"没有进行中的事"的情况下才保存现场。 */

export interface SleepConditions {
  alive: boolean;
  billiardsId: string | null;
  billiardsLoadingId: string | null;
  buildActive: boolean;
  cardsOpen: boolean;
  watching: boolean;
  focusedDisplay: boolean;
  playingVideo: boolean;
  navigationPending: boolean;
  walkingRoute: boolean;
  falling: boolean;
  jumping: boolean;
}

export interface SleepView {
  yaw: number;
  pitch: number;
  zoom: number;
  target: [number, number, number];
}

export interface SleepActor {
  x: number;
  y: number;
  z: number;
  rotation: number;
  sittingSpot: string | null;
}

export interface SleepSnapshot {
  view: SleepView;
  goal: SleepView;
  time: string;
  actor: SleepActor | null;
}

/** 忙碌中的任何一个条件成立，就不休眠（返回 null，窗口保持渲染）。 */
export function canSleep(c: SleepConditions): boolean {
  return c.alive
    && !c.billiardsId
    && !c.billiardsLoadingId
    && !c.buildActive
    && !c.cardsOpen
    && !c.watching
    && !c.focusedDisplay
    && !c.playingVideo
    && !c.navigationPending
    && !c.walkingRoute
    && !c.falling
    && !c.jumping;
}

/** 打快照：相机双份（当前 + 目标）+ 时段 + 角色位置/朝向/座位。 */
export function makeSnapshot(input: {
  view: SleepView;
  goal: SleepView;
  time: string;
  me: { x: number; y: number; z: number; rotation: number } | null;
  mySpot: string | null;
}): SleepSnapshot {
  return {
    view: input.view,
    goal: input.goal,
    time: input.time,
    actor: input.me
      ? { ...input.me, sittingSpot: input.mySpot }
      : null,
  };
}

/** 回放快照：相机两份 + 时段都要还原。 */
export function applySnapshot(target: { view: SleepView; goal: SleepView; applyTime: () => void },
  snapshot: SleepSnapshot, setView: (which: 'view' | 'goal', value: SleepView) => void,
  setTime: (time: string) => void) {
  setView('view', snapshot.view);
  setView('goal', snapshot.goal);
  setTime(snapshot.time);
  target.applyTime();
}
