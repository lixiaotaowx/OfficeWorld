// 会议里共享画面这一路视频轨的键。
//
// 键的后缀是**共享者**（LiveKit identity = socket id，`server.mjs` 的 mintToken 用的
// 就是 `s.id`），而不是轨道 sid：界面只有知道"谁在共享"，才能写出他的名字、并判断
// 他的客户端能不能显示标注（`person.annotate`）。用户 2026-09-22：会议的屏幕共享
// 要和私聊一样能放大、能标注。
//
// 单独一个文件是因为 `media.ts` 已经贴着单文件 500 行的上限（2026-09-22 拆出来时
// 507 行），下次再往 media.ts 加东西请先按职责拆别的地方。
export function meetingVideoKey(roomName: string, participant: { identity?: string } | undefined,
  fallback: string | undefined) {
  return `${roomName}:${participant?.identity || fallback || 'unknown'}`;
}
