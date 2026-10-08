// 别人工位小画面的入口：把服务端推来的一帧帧 JPEG 批量合并进 state。
//
// 拆出来有两个原因（2026-09-18）：`useOffice.ts` 已经顶到 500 行上限，而且这段规则
// 是**纯逻辑**、值得单独测。两条规则都带着用户的明确要求：
//   * 我没开接收就不留别人的画面（自己的留着，自己桌上的显示器还要亮）；
//   * `null`（对方走开停采、采集失败、关窗）**不删手里那一张**——用户要的就是
//     「不在的话用最后一张 不要在办公室还关着屏幕」（2026-09-18）。人真的离开空间时
//     由 `retainPresent` 把整条清掉。
import type { Socket } from 'socket.io-client';

/** 多个 JPEG 合成一批再进 state：否则几个人同时广播就是每个 JPEG 一次渲染。 */
export const PREVIEW_FLUSH_MS = 200;

export interface PreviewBatchResult {
  /** 合并后的完整画面表（要拿它替换旧的）。 */
  next: Record<string, string>;
  /** 这一批里"对方不再广播"的人（画面留着，只是没有实时画面了）。 */
  cleared: string[];
}

/** 合并一批预览帧；`null` 表示对方不再广播，**保留旧的画面**。 */
export function mergePreviewBatch(old: Record<string, string>,
  batch: Record<string, string | null>,
  options: { selfId?: string; receiving: boolean }): PreviewBatchResult {
  const next = { ...old };
  const cleared: string[] = [];
  for (const [key, value] of Object.entries(batch)) {
    if (key !== options.selfId && !options.receiving) { delete next[key]; continue; }
    if (value === null) { cleared.push(key); continue; }
    next[key] = value;
  }
  return { next, cleared };
}

/** 装上预览入口：批量合并后交给 `onBatch`；返回卸载函数。 */
export function attachPreviewIncoming(socket: Socket,
  onBatch: (batch: Record<string, string | null>) => void) {
  const pending: Record<string, string | null> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    timer = undefined;
    const batch = { ...pending };
    for (const key of Object.keys(pending)) delete pending[key];
    onBatch(batch);
  };
  const handler = ({ id, image }: { id: string; image?: string | null }) => {
    pending[id] = image ? String(image) : null;
    timer ??= setTimeout(flush, PREVIEW_FLUSH_MS);
  };
  socket.on('preview', handler);
  return () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    socket.off('preview', handler);
  };
}
