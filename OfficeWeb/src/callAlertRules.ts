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
