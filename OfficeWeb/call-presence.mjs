// 谁正在一通通话里。
//
// 通话本身是一对人的私事——`session` 事件只发给当事人；但"这个人现在正忙着通话"是所有人都
// 该看得到的公共状态，和 `person.sharing` 一个道理：任务栏头像条要在他/她的头像上标一个
// 话筒（用户 2026-09-23：「需要加上语音通话中的人都有语音的图标」）。
//
// 所以这里**不在人身上存字段**（存了就会在某个忘记更新的分支里变味），而是每次广播 `people`
// 时从 `sessions` 那份唯一的真相里现算一遍。纯函数，好测。
//
// 会议不走 `sessions`（由 `meetings.mjs` 管，人手上有 `person.meeting`），客户端把两者一起看：
// `inCall || meeting`。
export function markCallPresence(people, sessions) {
  const busy = new Set();
  for (const session of sessions.values()) {
    for (const peer of session.peers || []) busy.add(peer);
  }
  return people.map((person) => ({ ...person, inCall: busy.has(person.id) }));
}
