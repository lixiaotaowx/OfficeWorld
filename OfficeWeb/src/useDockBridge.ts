// 主窗口这边把状态推给头像条、并接收它的点击。
//
// 铁律：小窗不连 socket、不碰媒体。所以这里由主窗口（唯一的连接与媒体拥有者）负责：
//   每 1 秒（或状态变化时）推一份 buildDockState 的快照给主进程转发；
//   悬停时把那个人的最近一帧交给主进程；
//   收到点击就发起邀请（看对方屏幕 / 把我的屏幕给他 / 语音），主进程已经把办公室窗口
//   抬到前面了。
import { useEffect, useRef } from 'react';
import { buildDockState } from './dockRules';
import type { Person } from './types';

const PUSH_MS = 1000;

export type DockCommandKind = 'watch' | 'share' | 'call';

export function useDockBridge(input: {
  enabled: boolean;
  people: Person[];
  myId?: string;
  previews: Record<string, string>;
  unread: Record<string, number>;
  missed: Set<string>;
  sharing: boolean;
  hidden?: boolean;
  onCommand: (kind: DockCommandKind, personId: string) => void;
}) {
  // 用 ref 保存最新输入，节流定时器只建一个。
  const latest = useRef(input);
  latest.current = input;
  const lastSent = useRef('');

  useEffect(() => {
    const bridge = typeof window === 'undefined' ? undefined : window.officeDesktop;
    if (!bridge?.dockState) return;
    if (!input.enabled) {
      // 没登录/不是客户端：让主进程把头像是清空并藏起来。
      void bridge.dockState({ people: [], sharing: false, missed: 0, hidden: true });
      return;
    }
    const push = () => {
      const current = latest.current;
      const state = buildDockState({
        people: current.people, myId: current.myId, previews: current.previews,
        unread: current.unread, missed: current.missed,
        sharing: current.sharing, hidden: current.hidden,
      });
      const serialized = JSON.stringify(state);
      if (serialized === lastSent.current) return;   // 没变就不打扰主进程
      lastSent.current = serialized;
      void bridge.dockState?.(state).catch(() => undefined);
    };
    push();
    const timer = setInterval(push, PUSH_MS);
    return () => clearInterval(timer);
  }, [input.enabled]);

  useEffect(() => {
    const bridge = typeof window === 'undefined' ? undefined : window.officeDesktop;
    if (!bridge?.onDockPreviewWant || !bridge.onDockCommand) return;
    const offWant = bridge.onDockPreviewWant((personId) => {
      const image = latest.current.previews?.[personId] || '';
      void bridge.dockPreview?.({ id: personId, image }).catch(() => undefined);
    });
    const offCommand = bridge.onDockCommand((payload) => {
      const kind = payload?.kind as DockCommandKind;
      const personId = String(payload?.personId || '');
      if (!personId || !['watch', 'share', 'call'].includes(kind)) return;
      latest.current.onCommand(kind, personId);
    });
    return () => { offWant?.(); offCommand?.(); };
  }, [input.enabled]);
}
