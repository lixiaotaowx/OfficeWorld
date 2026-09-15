// What the bottom-right popup says when a call ends without being answered.
//
// A ring that nobody picks up is two different events: the caller is told to try again,
// the callee is told they missed a call (user, 2026-09-15: "添加一个未接电话提示…
// 拨打时间30秒没人接就提示未接通，稍后重试"). Cancelling your own call is neither.
import type { Request } from './types';

export interface CallAlert {
  id: string;
  kind: 'unanswered' | 'missed';
  /** Who the call was with. */
  name: string;
  /** Their socket id, so the popup can offer to call again. */
  target: string;
  callKind: 'screen' | 'voice';
  title: string;
  detail: string;
}

export interface ExpiryPayload {
  id: string;
  reason?: string;
}

/**
 * How many missed calls stay stacked in the corner. A missed call is easy to miss in a
 * workspace you glance at, so these do **not** fade on their own: they wait until somebody
 * reads them (user, 2026-09-15: "未接来电是否一直显示 只可以手动关闭"). The oldest falls
 * off only when the stack would grow past this.
 */
export const MAX_CALL_ALERTS = 5;

/** Add a popup: newest last, one entry per call, never more than MAX_CALL_ALERTS. */
export function withCallAlert(alerts: CallAlert[], alert: CallAlert): CallAlert[] {
  return [...alerts.filter((entry) => entry.id !== alert.id), alert].slice(-MAX_CALL_ALERTS);
}

/** One popup for an expired invite, or null when it should stay quiet. */
export function alertForExpiry(payload: ExpiryPayload | string, outgoing: Request[] = [],
  incoming: Request[] = [], nameOf: (id: string) => string = () => ''): CallAlert | null {
  const id = typeof payload === 'string' ? payload : payload?.id;
  const reason = typeof payload === 'string' ? 'cancelled' : payload?.reason;
  if (!id || reason !== 'timeout') return null;
  const mine = outgoing.find((request) => request.id === id);
  if (mine) {
    const name = nameOf(mine.target) || '对方';
    return {
      id: `${id}:unanswered`, kind: 'unanswered', name, target: mine.target, callKind: mine.kind,
      title: '未接通，稍后重试', detail: `${name} 暂时没有接听${mine.kind === 'screen' ? '（屏幕邀请）' : ''}`,
    };
  }
  const theirs = incoming.find((request) => request.id === id);
  if (theirs) {
    return {
      id: `${id}:missed`, kind: 'missed', name: theirs.name, target: theirs.from, callKind: theirs.kind,
      title: '未接来电', detail: `${theirs.name} 拨打过${theirs.kind === 'screen' ? '（屏幕邀请）' : '语音通话'}`,
    };
  }
  return null;
}
