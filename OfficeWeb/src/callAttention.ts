// 「有人打电话过来」这件事的纯规则：该提醒谁、提醒得多急。
//
// 用户 2026-09-20：「当用三个方式打电话过来需要屏幕里面绿起来，且用当前角色大小打招呼」。
// 三种方式就是头像条卡片上的三个按钮——请求观看我的屏幕、把他的屏幕分享给我、语音通话
// ——它们到服务端都是同一件事：一条等我处理的邀请（`requests`）。
//
// 规则与执行分开：这里只回答"现在该提醒谁"，怎么亮、怎么演由 `useCallAttention` 做。
import type { Person, Request } from './types';
import type { Appearance } from './look';

/** 补一次提醒的间隔：比绿光的存活时间（约 4 秒）短，一通电话响 30 秒也不会中途黑掉。 */
export const CALL_ATTENTION_MS = 3000;
/** 通话是急事，绿光立刻亮起来（悬停那一路才是慢慢亮 2 秒）。 */
export const CALL_GLOW_FADE_MS = 150;

export interface CallAttention {
  /** 打电话给我的那个人的在线 id（头像条用它把角色拉出来）。 */
  id: string;
  name?: string;
  /** 他那套配色与配件，头像条照着渲染（尺子角色的 `look`）。 */
  appearance?: Appearance;
  /** 永远是 `call`：用当前大小演一段招手（`peek` 那种小一倍、不演动作的场合只属于悬停）。 */
  mode: 'call';
  /**
   * 邀请的 id 与种类（用户 2026-09-21：「通话请求时，需要在人物上加上是谁来电，再加一个
   * 接听的按钮」）：头像条拿它写清"是谁、怎么打过来的"，并用它直接把这一通接起来。
   */
  requestId?: string;
  kind?: 'screen' | 'voice';
  /** 屏幕邀请里"是对方要分享给我"（true）还是"要看我的屏幕"（false）。 */
  offer?: boolean;
}

/**
 * 现在该提醒的是谁：正在响、我还没处理的邀请里最靠前的那一通。
 *
 * 同时来好几通也只提醒最前面的那一通——屏幕已经绿了，头像条上也只能站一个人；
 * 其余几通在通话面板里照常列着。没有邀请就返回 null（什么都不该亮）。
 */
export function callAttention(requests: Request[], people: Person[]): CallAttention | null {
  const first = (requests || []).find(row => row && row.id && row.from);
  if (!first) return null;
  return {
    id: first.from,
    name: first.name,
    appearance: (people || []).find(person => person.id === first.from)?.appearance,
    mode: 'call',
    requestId: first.id,
    // 老服务端只发 screen / voice；认不出来的一律当屏幕邀请（气泡上不会写错成语音）。
    kind: first.kind === 'voice' ? 'voice' : 'screen',
    offer: first.offer === true,
  };
}
