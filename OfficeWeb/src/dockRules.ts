// 任务栏头像条要显示什么——纯规则，方便单测。
//
// 小窗只做"显示 + 遥控"，所以这里把主窗口手里的东西压成一份小快照：谁在线、在不在座、
// 有没有未读/未接来电、有没有可能拿到工位预览，以及我自己是不是在共享屏幕（在共享就
// 把头像条藏起来，免得它一起被共享出去）。
import type { Person } from './types';

export interface DockPerson {
  id: string;
  name: string;
  character: string;
  atDesk: boolean;
  sharing: boolean;
  /** 有可能拿到工位预览：成员 + 有工位（访客永远没有，浏览器登录的人也没有）。 */
  hasPreview: boolean;
  unread: number;
  missed: boolean;
}

export interface DockState {
  people: DockPerson[];
  sharing: boolean;
  missed: number;
  hidden: boolean;
  /** 任务栏在哪条边（主进程在转发时补上）：卡片据此决定朝上还是朝下。 */
  edge?: string;
}

/** 头像条最多显示多少个（超出只保留最需要被看到的那些）。 */
export const DOCK_MAX_PEOPLE = 16;

export function buildDockState(input: {
  people: Person[];
  myId?: string;
  previews?: Record<string, string>;
  unread?: Record<string, number>;
  missed?: Set<string>;
  sharing: boolean;
  hidden?: boolean;
  max?: number;
}): DockState {
  const missed = input.missed || new Set<string>();
  const unread = input.unread || {};
  const rows = (input.people || [])
    .filter(person => person && person.id && person.id !== input.myId)
    .map(person => ({
      id: person.id,
      name: person.name || '同事',
      character: person.character || '',
      atDesk: person.atDesk !== false,
      sharing: person.sharing === true,
      // 访客不广播工位预览（服务端也会拒），浏览器登录的人不采集。
      hasPreview: person.role !== 'visitor' && person.seat != null,
      unread: Math.max(0, Number(unread[person.id]) || 0),
      missed: missed.has(person.id),
    }))
    // 有事找你的排前面，然后正在共享的、在座的，最后按名字稳定排序。
    .sort((a, b) =>
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
  };
}

/** 悬停卡片上那句"没有画面"的说明：说清是规则没有，而不是坏了。 */
export function previewPlaceholder(person: { hasPreview: boolean; atDesk?: boolean } | null,
  waited = false): string {
  if (!person) return '';
  if (!person.hasPreview) return '此人不广播屏幕预览';
  if (person.atDesk === false) return '此人不在电脑前，预览已暂停';
  return waited ? '暂时没有画面（对方可能没在采集）' : '正在获取屏幕预览…';
}

export interface DockBox { x: number; y: number; width: number; height: number }

const inside = (box: DockBox | null | undefined, x: number, y: number) =>
  Boolean(box) && x >= box!.x && x <= box!.x + box!.width && y >= box!.y && y <= box!.y + box!.height;

/**
 * 指针在不在头像条/卡片上。窗口比头像条大（卡片空间 + 为了放下卡片而变宽的透明区），
 * 透明的地方必须把点击透给任务栏——否则会盖住别人钉在任务栏上的图标。
 */
export function dockInteractive(strip: DockBox | null, card: DockBox | null, x: number, y: number): boolean {
  return inside(strip, x, y) || inside(card, x, y);
}
