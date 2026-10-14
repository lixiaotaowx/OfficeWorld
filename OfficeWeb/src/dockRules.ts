import type { DockPrivateState } from './dock-private-contract';
import type { DockMeetingState } from './dock-meeting-contract';
// 任务栏头像条要显示什么——纯规则，方便单测。
//
// 小窗只做"显示 + 遥控"，所以这里把主窗口手里的东西压成一份小快照：谁在线、在不在座、
// 有没有未读/未接来电、有没有可能拿到工位预览，以及我自己是不是在共享屏幕（在共享就
// 把头像条藏起来，免得它一起被共享出去）。
import type { Person } from './types';
import type { Appearance } from './look';

import type { DockTransferRow } from './fileTransferRules';

export interface DockPerson {
  status?: string;
  id: string;
  name: string;
  /** 兼容旧桌面桥的外观字符串；旧版也可传单个配色 id。 */
  character: string;
  appearance?: Appearance;
  atDesk: boolean;
  sharing: boolean;
  /**
   * 正在一通通话里：私聊的语音/屏幕通话（谁发起的都算），或者会议。
   * 头像上标一个话筒，和「正在共享」那个标记并排（用户 2026-09-23）。
   */
  inCall: boolean;
  /** 有可能拿到工位预览：成员 + 有工位（访客永远没有，浏览器登录的人也没有）。 */
  hasPreview: boolean;
  unread: number;
  missed: boolean;
  /** 是不是我自己：自己的头像排在最前面，卡片上不给"呼叫自己"的按钮。 */
  self?: boolean;
  /** 离座多久了（在座时为空）：悬停卡片上跟在名字后面（用户 2026-09-18）。 */
  away?: string;
}

export interface DockState {
  privateCalls?: DockPrivateState;
  statusControl?: { busy: boolean; error: string };
  meeting?: DockMeetingState;
  people: DockPerson[];
  sharing: boolean;
  missed: number;
  hidden: boolean;
  /** 任务栏在哪条边（主进程在转发时补上）：卡片据此决定朝上还是朝下。 */
  edge?: string;
  /**
   * 卡片/舞台画在头像条的哪一侧（主进程补上）：`left` 是往左画（老样子），
   * `right` 是往右画——头像条在屏幕最左端（Win11）时左边没地方（用户 2026-09-20
   * 「小窗口出现的方向多变一下」）。
   */
  popup?: 'left' | 'right';
  /** 头像条高度（= 任务栏厚度，主进程补上）：头像和条子做成一样高。 */
  stripHeight?: number;
  /**
   * 任务栏现在的颜色（主进程读注册表补上）：外面那圈框据此配色。
   * 读不到就是 null/缺省 —— 按深色任务栏画（用户 2026-09-20「要根据当前状态栏的颜色去适配」）。
   */
  theme?: DockTheme | null;
  /**
   * 主窗口跟服务器还连着吗。**短暂掉线时小窗不要把名单抹掉**：以前一掉线 `people` 就空了，
   * 头像整排消失、连上又冒出来，看起来就是"头像会消失闪烁"（用户 2026-09-20）。缺省当连着。
   */
  connected?: boolean;
  /**
   * 正在传的文件（用户 2026-09-22）：小窗在头像条底下画一条细进度线，两端都看得到。
   * 只传"要画的东西"，摘要由主窗口算好（和 `away` 那句离座文案一个做法）。
   */
  transfers?: DockTransferRow[];
}

/** 任务栏的样子：明暗、有没有被强调色着色、强调色本身。 */
export interface DockTheme {
  /** 实际底色是浅色（浅色任务栏 / 浅色强调色）。 */
  light?: boolean;
  /** 任务栏被"强调色"着色了（这时底色是强调色，不是黑/白）。 */
  tinted?: boolean;
  /** 强调色 `#rrggbb`（没有就是空串）。 */
  accent?: string;
  /** 任务栏开着透明效果（关掉时框要画实一点才看得清）。 */
  transparent?: boolean;
  /** 这个结论是哪来的（`registry` / `native` / `default`，只为排查）。 */
  source?: string;
}

/** 头像条最多显示多少个（超出只保留最需要被看到的那些）。 */
export const DOCK_MAX_PEOPLE = 16;

/**
 * 新状态进来时要不要保留上一份名单（小窗自己的一份纯规则）。
 *
 * 用户 2026-09-20：「有时候头像会消失闪烁」——真因之一是**短暂掉线**（休眠、切网、服务器
 * 重启）时主窗口把 `people` 清空推过来，几秒后连上又推回来，头像看起来就是"整排消失再
 * 冒出来"。所以**断开期间**（`connected === false`）这份名单是空的、上一份还有人，就沿用
 * 上一份；连着的时候照旧以服务器为准（真没人了就该显示"现在没有其他人在线"）。
 */
export function mergeState(previous: DockState, next: unknown): DockState {
  const incoming = (next && typeof next === 'object' ? next : EMPTY_DOCK_STATE) as DockState;
  if (!Array.isArray(incoming.people)) return previous;
  if (incoming.connected === false && incoming.hidden !== true &&
      incoming.people.length === 0 && previous.people.length > 0) {
    return { ...incoming, people: previous.people, missed: previous.missed };
  }
  return incoming;
}

/** 什么都没有时的状态（小窗第一帧、以及收到脏数据时）。 */
export const EMPTY_DOCK_STATE: DockState = { people: [], sharing: false, missed: 0, hidden: false };

/**
 * 头像条的顺序要**粘住**（用户 2026-09-21：「状态栏的头像位置尽量不要频繁的切换顺序，不然本来
 * 鼠标看着一个人闪烁到另一个人了」）。
 *
 * 排名本身是有意义的（未接来电 → 未读 → 正在共享 → 在座 → 名字，见 `buildDockState`），但那几个
 * 键**随时会翻**：离座/在座（10 秒不操作就变）、别人开始/停止共享、未读数变化……每翻一次主窗口
 * 就重排一遍名单，小窗照着画，于是头像在鼠标底下换位——鼠标下的人跟着变，看起来就是"看着一个人
 * 突然闪成另一个"。
 *
 * 所以顺序和排名分开走，这里给两档防抖：
 *   1. `frozen`（指针正停在条子/卡片上）：**一个都不许挪**，新来的人接在最后，走掉的人立刻消失；
 *   2. 没停住也要**连续稳定 `ORDER_SETTLE_MS`** 才真的换序——返回 `waitMs`，让调用方到点再看一眼。
 */
export const ORDER_SETTLE_MS = 2000;

/** 当前显示顺序：一串 id + 「名次和它对不上」是从哪一刻开始的（一致时是 0）。 */
export interface DockOrder { ids: string[]; since: number }

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

/** 老的人保持原来的先后，新人接在最后，走掉的人直接去掉（名单变动是立刻生效的）。 */
export function keepOrder(previous: string[], target: string[]): string[] {
  const live = new Set(target);
  const out = previous.filter(id => live.has(id));
  for (const id of target) if (!out.includes(id)) out.push(id);
  return out;
}

/** 见上面那段注释：算这一帧该用什么顺序，以及要不要过一会儿再看一眼。 */
export function stickyOrder(previous: DockOrder | null, target: string[], now: number,
  frozen: boolean): { order: DockOrder; waitMs: number } {
  if (!previous) return { order: { ids: target, since: 0 }, waitMs: 0 };
  if (sameIds(previous.ids, target)) return { order: { ids: target, since: 0 }, waitMs: 0 };
  // 名次第一次和显示对不上：从这一刻开始数稳定时间（**不是**从上次换序算起，否则下一个
  // 心跳就会立刻换序，"稳住两秒"等于没做）。
  const since = previous.since || now;
  const kept = keepOrder(previous.ids, target);
  if (frozen) return { order: { ids: kept, since }, waitMs: 0 };
  const waited = now - since;
  if (waited >= ORDER_SETTLE_MS) return { order: { ids: target, since: 0 }, waitMs: 0 };
  return { order: { ids: kept, since }, waitMs: ORDER_SETTLE_MS - waited };
}

/** 按 `stickyOrder` 给的 id 摆人头；名单里有、顺序表里还没有的人接在最后。 */
export function orderPeople<T extends { id: string }>(people: T[], ids: string[]): T[] {
  const byId = new Map(people.map(person => [person.id, person]));
  const out: T[] = [];
  for (const id of ids) {
    const person = byId.get(id);
    if (person) { out.push(person); byId.delete(id); }
  }
  for (const person of people) {
    if (byId.has(person.id)) { out.push(person); byId.delete(person.id); }
  }
  return out;
}

/**
 * 头像条外面那圈框的颜色（用户 2026-09-20：「把所有的头像整体框起来，像是同一个系统内感觉，
 * 有个大的圆角框，另外要根据当前状态栏的颜色去适配」）。
 *
 * 规则简单但够用：任务栏深色就用**白色浮层**、浅色就用**黑色浮层**——同一层半透明蒙在
 * 任务栏上，看起来才像"系统自带的一块"；任务栏被强调色着色时，边框用强调色跟它对上。
 * 关掉透明效果（任务栏是不透明纯色）时浮层加一点浓度，不然在纯色上几乎看不见。
 *
 * **浓度压得很低**（深色 .04 / 浅色 .05，悬停各 +0.02）：2026-09-2X 用户说"太白了"——
 * 白色浮层 + 头像垫底叠起来整条像块白玻璃。要的是"一层很淡的玻璃"，靠边和阴影定型。
 * `chip` 是头像自己的垫底，**现在是完全透明**（用户 2026-09-2X：头像本身的小背景发黑，要去掉）。
 */
export function frameColors(theme?: DockTheme | null): {
  background: string; backgroundHover: string; chip: string; border: string; shadow: string;
} {
  const light = theme?.light === true;
  const ink = light ? '0, 0, 0' : '255, 255, 255';
  // 头像**不要**自己的小底色（用户 2026-09-2X：「头像本身的小背景有点黑啊 直接去掉内部小背景」）：
  // 贴图是透明底的，直接透出任务栏/条子最干净；深色垫底看起来就是每个头像戴了块黑牌。
  const chip = 'transparent';
  const solid = theme?.transparent === false ? 0.04 : 0;
  const base = (light ? 0.05 : 0.04) + solid;
  const accent = /^#[0-9a-f]{6}$/i.test(theme?.accent || '') ? String(theme!.accent).toLowerCase() : '';
  // 边要**细、不要太明显**（用户 2026-09-2X：「边缘细一些也不要太明显」）。
  const border = theme?.tinted && accent
    ? hexToRgba(accent, light ? 0.4 : 0.5)
    : `rgba(${ink}, ${(light ? 0.12 : 0.14) + solid})`;
  return {
    background: `rgba(${ink}, ${base})`,
    backgroundHover: `rgba(${ink}, ${base + 0.02})`,
    chip,
    border,
    shadow: light ? '0 6px 18px rgba(0, 0, 0, .16)' : '0 6px 18px rgba(0, 0, 0, .32)',
  };
}

/** `#rrggbb` + 透明度 → `rgba(...)`。 */export function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!match) return `rgba(255, 255, 255, ${alpha})`;
  const number = Number.parseInt(match[1], 16);
  return `rgba(${(number >>> 16) & 0xff}, ${(number >>> 8) & 0xff}, ${number & 0xff}, ${alpha})`;
}

/**
 * 「有人来看我了」那一小段动画：
 *   * 用动作库里的哪一条（尺子角色 GLB 自带 9 条，`招手_Wave` 就是招手）；
 *   * 最后一个人来看我之后，舞台还留多久（头像条那边同时收窗口）。
 */
export const GREET_CLIP = '招手_Wave';
export const GREET_MS = 3600;

/** 悬停卡片那个"指向头像"的尖：宽 16、往下探 10（见 `dock.css` 的 `.dock-card-tip`）。 */
export const CARD_TIP = { width: 16, peak: 10 };

/**
 * 卡片下方那个尖该放在卡片的第几像素上（用户 2026-09-2X：「我希望小窗有一个气泡指向的
 * 尖尖那个东西指向头像」）。
 *
 * 尖要**对准正在看的那个头像**：拿头像中点减去卡片左边界；但太靠边时会被卡片圆角切掉
 * （左边要留半个尖 + 圆角，右边也是），所以夹在 `[TIP_EDGE_PAD, 卡宽 - TIP_EDGE_PAD]`。
 * 卡片还没有宽度（第一帧）时返回 null，让页面用默认的居中。
 */
export function cardTipOffset(cardLeft: number, cardWidth: number, avatarCenterX: number): number | null {
  if (!Number.isFinite(cardLeft) || !Number.isFinite(avatarCenterX)) return null;
  if (!Number.isFinite(cardWidth) || cardWidth <= CARD_TIP.width * 2) return null;
  const wanted = Math.round(avatarCenterX - cardLeft - CARD_TIP.width / 2);
  const pad = CARD_TIP.width;
  return Math.max(pad, Math.min(Math.round(cardWidth) - pad, wanted));
}

/**
 * 悬停多久才算"我在看他"（用户 2026-09-20：「鼠标停留在别人头像2秒后才开始亮起绿色」）。
 * 太短会在划过一排头像时误触发，太长又像没反应。
 */
export const WATCH_DWELL_MS = 2000;
/** 两次索要画面之间隔了这么久，说明指针离开过：重新悬停要重新计时。 */
export const WATCH_DWELL_GAP_MS = 1500;
/**
 * 悬停那一路的绿光是**慢慢亮**：用户 2026-09-20「亮起的时间会很慢 大概用2秒才渐渐亮起」。
 * （打电话过来是另一回事，见 `callAttention.ts` 的 `CALL_GLOW_FADE_MS`：立刻亮。）
 */
export const PEEK_GLOW_FADE_MS = 2000;

/** 一个人连续悬停看了多久（`last` 用来判断中间断没断过）。 */
export interface WatchDwell {
  id: string;
  since: number;
  last: number;
}

/**
 * 悬停计时：同一个人连着要画面就一直在计时，中间断过一次（超过 `WATCH_DWELL_GAP_MS`）
 * 或者换了人，就从这一下重新算。`watching` 为真时才对服务端说"我在看他"。
 */
export function dwellWatch(previous: WatchDwell | null, personId: string, now: number):
{ dwell: WatchDwell; watching: boolean; waitMs: number } {
  const fresh = !previous || previous.id !== personId || now - previous.last > WATCH_DWELL_GAP_MS;
  const since = fresh ? now : previous.since;
  const elapsed = now - since;
  return { dwell: { id: personId, since, last: now },
    watching: elapsed >= WATCH_DWELL_MS, waitMs: Math.max(0, WATCH_DWELL_MS - elapsed) };
}

/**
 * 舞台的两种场合（用户 2026-09-20）：
 *   * `peek`——只是鼠标停在头像上：人物**小一倍**，光也慢慢亮，不用打招呼；
 *   * `call`——有人用三种方式打过来：人物**照现在这么大**，演一段招手。
 */
export type GreetMode = 'peek' | 'call';
export const GREET_CANVAS: Record<GreetMode, { width: number; height: number }> = {
  peek: { width: 160, height: 190 },
  call: { width: 320, height: 380 },
};

/** 缺省当"只是看一眼"：老客户端/老页面没带 mode 时不会突然放一个大角色。 */
export function greetMode(mode: unknown): GreetMode {
  return mode === 'call' ? 'call' : 'peek';
}

/** 哪一种场合要用哪一条动作：只有打电话过来才招手。 */
export function greetClip(mode: GreetMode): string | undefined {
  return mode === 'call' ? GREET_CLIP : undefined;
}

/** 有人在看我的信号（主窗口 → 主进程 → 小窗）。 */
export interface DockGreet {
  id: string;
  name?: string;
  /** 那个人的配色与配件（尺子角色）：小窗要照着他自己的样子演。 */
  appearance?: Appearance;
  /** `peek`（鼠标停一下）/ `call`（有人打电话过来）：决定大人物、演不演动作。 */
  mode?: GreetMode;
  /**
   * 有人打电话过来时带上那一通邀请（用户 2026-09-21：「通话请求时，需要在人物上加上是谁
   * 来电，再加一个接听的按钮」）：头像条据此写清"是谁、怎么打过来的"，并直接把这一通接起来。
   */
  requestId?: string;
  kind?: 'screen' | 'voice' | 'meeting';
  offer?: boolean;
  /** 客户端收到的时间（心跳会不断刷新它，动画不会被打断着重播）。 */
  at: number;
}

/** 来电那一条气泡上写什么：谁 + 怎么打过来的（用户 2026-09-21）。 */
export function callLabel(call: { name?: string; kind?: string; offer?: boolean }): string {
  const who = call.name || '同事';
  if (call.kind === 'meeting') return `${who}发起的会议`;
  // 老客户端（≤0.1.26）不转发邀请的种类：那会儿就只说"谁来电"，别瞎猜是语音还是屏幕。
  if (call.kind !== 'voice' && call.kind !== 'screen') return `${who} 来电`;
  if (call.kind === 'voice') return `${who} 来电 · 语音通话`;
  return call.offer ? `${who} 来电 · 要给你看屏幕` : `${who} 来电 · 想看你的屏幕`;
}

/** 头顶那条来电气泡占的高度（CSS 像素）：窗口要留出这么多地方，不然会被裁掉。 */
export const CALL_BAR_HEIGHT = 62;

/** 心跳还在（`GREET_MS` 内有人看过我）。 */
export function greetAlive(greet: DockGreet | null, now: number): boolean {
  return Boolean(greet) && now - (greet as DockGreet).at < GREET_MS;
}

export function buildDockState(input: {
  people: Person[];
  myId?: string;
  previews?: Record<string, string>;
  unread?: Record<string, number>;
  missed?: Set<string>;
  sharing: boolean;
  hidden?: boolean;
  /** 和服务器还连着吗：短暂掉线时小窗保留上一次的名单（缺省当连着）。 */
  connected?: boolean;
  max?: number;
  /** 每人一句离座文案（主窗口用 awayTime 算好；缺省就不显示）。 */
  away?: Record<string, string>;
  /** 正在传的文件（主窗口从 fileTransfer 通道拿；缺省就是没有传输）。 */
  transfers?: DockTransferRow[];
}): DockState {
  const missed = input.missed || new Set<string>();
  const unread = input.unread || {};
  const rows = (input.people || [])
    .filter(person => person && person.id)
    .map(person => ({
      id: person.id,
      name: person.name || '同事',
      // 旧桌面桥只转发 character 字符串，完整搭配编码在其中。
      character: 'look:' + JSON.stringify({ ...person.appearance, autoExpression: person.autoExpression }),
      appearance: person.appearance,
      atDesk: person.atDesk !== false,
      sharing: person.sharing === true,
      // 会议也算通话：参会的人就在通话里（`person.meeting` 由 meetings.mjs 写）。
      inCall: person.inCall === true || person.meeting === true,
      // 访客不广播工位预览（服务端也会拒），浏览器登录的人不采集。
      hasPreview: person.role !== 'visitor' && person.seat != null,
      unread: Math.max(0, Number(unread[person.id]) || 0),
      missed: missed.has(person.id),
      // 我自己也画出来（用户 2026-09-18：「也显示一下自己的头像」），排在最前面。
      self: person.id === input.myId,
      // 离座时长：名字后面要跟着"离座 12 分钟"（用户 2026-09-18 追加）。
      away: input.away?.[person.id],
    }))
    // 自己永远在最左，其余：有事找你的排前面，然后正在共享的、在座的，最后按名字。
    .sort((a, b) =>
      Number(b.self) - Number(a.self) ||
      Number(b.missed) - Number(a.missed) ||
      b.unread - a.unread ||
      Number(b.sharing) - Number(a.sharing) ||
      Number(b.atDesk) - Number(a.atDesk) ||
      a.name.localeCompare(b.name, 'zh-CN'));
  return {
    people: rows.slice(0, input.max ?? DOCK_MAX_PEOPLE),
    sharing: input.sharing === true,
    missed: rows.filter(row => row.missed).length,
    hidden: input.hidden === true,
    connected: input.connected !== false,
    transfers: (input.transfers || []).slice(0, 8),
  };
}

/** 自己的卡片上不提供"呼叫自己"的按钮。 */
export function cardActions(person: { self?: boolean } | null): ('watch' | 'share' | 'call')[] {
  if (!person || person.self) return [];
  return ['watch', 'share', 'call'];
}

/**
 * 悬停卡片上那句"没有画面"的说明：说清是规则没有，而不是坏了。
 *
 * **不再提"此人不在电脑前"**（用户 2026-09-18：「不要出现此人不在电脑前的文字 不在的话用最后
 * 一张」）：离座的人照样显示他最后那一张工位画面，画面真的没有时也只说"暂时没有画面"，
 * 不许把离座写成"预览已暂停"。
 */
export function previewPlaceholder(person: { hasPreview: boolean; atDesk?: boolean } | null,
  waited = false): string {
  if (!person) return '';
  if (!person.hasPreview) return '此人不广播屏幕预览';
  return waited ? '暂时没有画面（对方可能没在采集）' : '正在获取屏幕预览…';
}




