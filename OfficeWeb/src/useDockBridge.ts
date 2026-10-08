// 主窗口这边把状态推给头像条、并接收它的点击。
//
// 铁律：小窗不连 socket、不碰媒体。所以这里由主窗口（唯一的连接与媒体拥有者）负责：
//   每 1 秒（或状态变化时）推一份 buildDockState 的快照给主进程转发；
//   悬停时把那个人的最近一帧交给主进程；
//   收到点击就发起邀请（看对方屏幕 / 把我的屏幕给他 / 语音），主进程已经把办公室窗口
//   抬到前面了。
import { useEffect, useRef } from 'react';
import { buildDockState, dwellWatch, type WatchDwell } from './dockRules';
import type { DockTransferRow } from './fileTransferRules';
import { awayLabel, awayMilliseconds, isAtDesk } from './awayTime';
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
  /** 和服务器还连着吗：短暂掉线时小窗保留上一次的名单，别让头像整排闪掉（用户 2026-09-20）。 */
  connected?: boolean;
  hidden?: boolean;
  onCommand: (kind: DockCommandKind, personId: string) => void;
  /** 头像条上按了「接听 / 拒绝」（用户 2026-09-21）：`accept` 为真就是接听。 */
  onAnswer?: (requestId: string, accept: boolean) => void;
  /** 有人在小窗里看某个人的工位：报给服务端，让那个人闪一下绿光（用户 2026-09-18）。 */
  onPreviewWant?: (personId: string) => void;
  /**
   * 有人把文件拖到了某个头像上（用户 2026-09-22）。小窗只交得出路径，发送由主窗口做
   * （它是唯一的 socket 拥有者）——和三个通话按钮走同一条路。
   */
  onFiles?: (personId: string, paths: string[]) => void;
  /** 正在传的文件：小窗在头像条底下画一条细进度线（两端都推同一份）。 */
  transfers?: DockTransferRow[];
}) {
  // 用 ref 保存最新输入，节流定时器只建一个。
  const latest = useRef(input);
  latest.current = input;
  const lastSent = useRef('');
  /** 这份 people 是什么时候到的：离座时长 = awayFor + 距今（不比较双方时钟）。 */
  const pushedAt = useRef(Date.now());

  useEffect(() => { pushedAt.current = Date.now(); }, [input.people]);

  useEffect(() => {
    const bridge = typeof window === 'undefined' ? undefined : window.officeDesktop;
    if (!bridge?.dockState) return;
    if (!input.enabled) {
      // 没登录/不是客户端：让主进程把头像是清空并藏起来。
      // 顺手把"上一份推过什么"清掉：不然重新可用时那份状态和 `lastSent` 一模一样，
      // 会被当成"没变"跳过，小窗就一直停在"藏起来"那一份（2026-09-22 顺手修）。
      lastSent.current = '';
      void bridge.dockState({ people: [], sharing: false, missed: 0, hidden: true });
      return;
    }
    const push = () => {
      const current = latest.current;
      const now = Date.now();
      // 离座时长在这里算（小窗只拿到一句现成的字），缺席的人不写。
      const away: Record<string, string> = {};
      for (const person of current.people) {
        if (person?.id && !isAtDesk(person)) {
          away[person.id] = awayLabel(awayMilliseconds(person, pushedAt.current, now));
        }
      }
      const state = buildDockState({
        people: current.people, myId: current.myId, previews: current.previews,
        unread: current.unread, missed: current.missed,
        sharing: current.sharing, hidden: current.hidden, away,
        connected: current.connected,
        // 文件直传的进度（用户 2026-09-22）：小窗只画一条线，摘要这里算好给它。
        transfers: current.transfers,
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
    // 拖到头像上的文件（用户 2026-09-22）。这一条和下面那两条无关，所以单独挂：
    // 老客户端没有 `files` 桥时也不该把悬停/按钮那两条一起关掉。
    const offFiles = bridge?.files?.onDropped?.((payload) => {
      const personId = String(payload?.personId || '');
      const paths = (payload?.paths || []).filter(path => typeof path === 'string' && path);
      if (!personId || !paths.length) return;
      latest.current.onFiles?.(personId, paths);
    });
    if (!bridge?.onDockPreviewWant || !bridge.onDockCommand) return () => { offFiles?.(); };
    // 悬停多久才告诉服务端"我在看他"：小窗每 800ms 要一次画面，这个计时就建在这里——
    // 划过一排头像不该惊动别人，停够 2 秒才算（用户 2026-09-20：「鼠标停留在别人头像
    // 2秒后才开始亮起绿色」）。
    let dwell: WatchDwell | null = null;
    let dwellTimer: ReturnType<typeof setTimeout> | undefined;
    const offWant = bridge.onDockPreviewWant((personId) => {
      const state = dwellWatch(dwell, personId, Date.now());
      dwell = state.dwell;
      if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = undefined; }
      if (state.watching) {
        // 小窗悬停时会每 800ms 再问一次，这同时也是"我正在看他"的心跳：报给主窗口，
        // 由它转给服务端（服务端再转给被看的人，他的屏幕慢慢亮起绿光）。
        latest.current.onPreviewWant?.(personId);
      } else {
        // 刚好停满 2 秒就报，不用等下一次心跳（心跳 800ms 一次，等它就会晚半秒多）。
        dwellTimer = setTimeout(() => {
          dwellTimer = undefined;
          if (dwell?.id === personId) latest.current.onPreviewWant?.(personId);
        }, state.waitMs);
      }
      // 有画面才发：空帧只会把小窗手里的"最后一张"擦掉，而离座的人也要能看到最后那一张
      // （用户 2026-09-18：「不在的话用最后一张 不要在办公室还关着屏幕」）。
      const image = latest.current.previews?.[personId];
      if (!image) return;
      void bridge.dockPreview?.({ id: personId, image }).catch(() => undefined);
    });
    const offCommand = bridge.onDockCommand((payload) => {
      const kind = payload?.kind as DockCommandKind;
      const personId = String(payload?.personId || '');
      if (!personId || !['watch', 'share', 'call'].includes(kind)) return;
      latest.current.onCommand(kind, personId);
    });
    // 头像条上按了「接听 / 拒绝」（用户 2026-09-21）：把那一通邀请交给主窗口去应答。
    const offAnswer = bridge.onDockAnswer?.((payload) => {
      const requestId = String(payload?.requestId || '');
      if (!requestId) return;
      latest.current.onAnswer?.(requestId, payload?.accept === true);
    });
    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      offWant?.(); offCommand?.(); offAnswer?.(); offFiles?.();
    };
  }, [input.enabled]);
}
