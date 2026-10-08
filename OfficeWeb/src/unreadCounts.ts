// 「每个人多少条未读」的比较：只有真的变了才允许更新 state。
//
// 2026-09-20 用户报障「内存和cpu占比巨大 且头像没有出现」：ChatInbox 每次渲染都会算出一份
// 新的 `byPerson` 对象并 setState 回 App，而 App 每次渲染又给 `onUnread` 一个新的箭头函数
// ——两边一凑就是无限重渲染，主线程 100% 被占住，三维画面和头像条都被饿死。
// 所以这里给一个纯比较：内容一样就把旧对象原样返回，React 才会停下。
export function sameUnreadCounts(previous: Record<string, number>,
  next: Record<string, number>): boolean {
  const before = Object.keys(previous);
  const after = Object.keys(next);
  if (before.length !== after.length) return false;
  for (const key of after) if (previous[key] !== next[key]) return false;
  return true;
}

/** 有变化的才写进去，没有变化返回原对象（配合 setState(prev => …) 让 React 直接跳过）。 */
export function mergeUnreadCounts(previous: Record<string, number>,
  next: Record<string, number>): Record<string, number> {
  return sameUnreadCounts(previous, next) ? previous : next;
}
