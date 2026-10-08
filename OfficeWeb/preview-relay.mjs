// 低清工位预览的中继（工位小屏 + 任务栏头像条那个悬停小图）。
//
// 三件事：
//   1. 校验并限速客户端推来的 JPEG（访客一律不广播、每 400ms 最多一帧、体积封顶）；
//   2. 转发给"能看的人"（分享者自己 + 开着接收的人）——分享者也要收到，他桌上那块
//      显示器才照得出自己的屏幕；
//   3. **记住每个人的最后一张**。有人走开、采集被暂停、或者看的人刚启动，都该看到
//      "最后那一张"，而不是一块黑屏（用户 2026-09-18：「不在的话用最后一张 不要
//      在办公室还关着屏幕」）。按账号 `clientId` 记，所以断线重连也还在。
//
// 什么时候才把最后一张丢掉：客户端**明说**停止广播（`ambient-sharing:false`，关掉预览
// 或关窗）时。人只是离开电脑时客户端什么都不发（见 `useDesktopPreview`），于是最后一张
// 会一直留着——这正是要的效果。
const MAX_IMAGE = 250000;
const MIN_INTERVAL_MS = 400;
const MAX_SENDERS = 256;
/** 「有人在看你」的对同一目标最小间隔：小窗悬停时每 800ms 会问一次帧。 */
const WATCH_INTERVAL_MS = 700;

export function createPreviewRelay({ io, people }) {
  /** clientId -> 最后一张 data:image/jpeg。 */
  const frames = new Map();
  /** socketId -> 上一次收帧的时间（限速用；断线要清掉，别越攒越多）。 */
  const sentAt = new Map();
  /** `${from}->${to}` -> 上一次"有人在看你"的时间。 */
  const watchedAt = new Map();

  const send = (socketId, image) => {
    for (const person of people.values()) {
      if (person.id === socketId || person.previewAllowed) {
        io.to(person.id).emit("preview", { id: socketId, image });
      }
    }
  };

  return {
    /** 收到一帧：校验、限速、记下来、转给该看的人。返回是否收下。 */
    push(socket, image) {
      const person = people.get(socket.id);
      // 访客不广播低清预览（客户端本来也不采集，这里是服务端兜底）。
      if (person?.role === "visitor") return false;
      if (!(person?.sharing || person?.previewSharing)) return false;
      if (typeof image !== "string" || image.length > MAX_IMAGE) return false;
      if (!image.startsWith("data:image/jpeg;base64,")) return false;
      if (Date.now() - (sentAt.get(socket.id) || 0) < MIN_INTERVAL_MS) return false;
      sentAt.set(socket.id, Date.now());
      // 缓存有上限：记不下新的也照常转发——当前这一帧别人还是看得到。
      if (frames.has(person.clientId) || frames.size < MAX_SENDERS) {
        frames.set(person.clientId, image);
      }
      send(socket.id, image);
      return true;
    },
    /**
     * 对方不再广播了（关掉预览、关窗、采集失败）：当场发一帧 null 告诉别人"现在没有实时
     * 画面"，但**缓存留着**——用户要的就是"不在就用最后那一张"（2026-09-18）。人真的离开
     * 空间时就不会再出现在 people 里，快照自然也不会带上他。
     */
    stop(socketId) {
      sentAt.delete(socketId);
      send(socketId, null);
    },
    /**
     * 刚进来的人先收一份"每个人的最后一张"——否则新开的客户端要等每个人的下一次采集
     * （最长 12 秒，人不在电脑前就永远不采），整间办公室的屏幕都是黑的。
     */
    snapshot(socketId) {
      for (const person of people.values()) {
        if (person.id === socketId) continue;
        const image = frames.get(person.clientId);
        if (image) io.to(socketId).emit("preview", { id: person.id, image });
      }
    },
    /** 断线：人可能马上回来，最后一张留着；只清限速表，免得越积越多。 */
    forget(socketId) {
      sentAt.delete(socketId);
    },
    /**
     * 「有人在看你的工位」：小窗里鼠标悬停某人的头像时，主窗口每次索取那一帧都会报一次。
     * 服务端只做两件事——校验目标确实有工位预览、把它转给那个人（他自己的客户端据此在
     * 屏幕上闪一圈绿光）。同一个人对同一个目标 700ms 内只转一次，免得刷屏。
     */
    watch(socket, rawTarget) {
      const from = people.get(socket.id);
      const targetId = String(rawTarget?.target ?? rawTarget ?? "");
      const target = people.get(targetId);
      // 看自己不算「有人来了」；访客/没工位的人没有工位预览，别人是在看别人的东西。
      if (!from || !target || target.id === from.id) return false;
      if (target.role === "visitor" || target.seat == null) return false;
      const key = `${from.id}->${target.id}`;
      const now = Date.now();
      if (now - (watchedAt.get(key) || 0) < WATCH_INTERVAL_MS) return false;
      watchedAt.set(key, now);
      // 带上他自己的配色与配件：被看的人据此把小窗里"来看我的那个人"照原样拉出来演一段动作。
      io.to(target.id).emit("watched",
        { from: from.id, name: from.name, appearance: from.appearance ?? null });
      return true;
    },
    /** 断线：把这个人相关的限速记录清掉。 */
    forgetWatch(socketId) {
      for (const key of [...watchedAt.keys()]) {
        if (key.startsWith(`${socketId}->`) || key.endsWith(`->${socketId}`)) watchedAt.delete(key);
      }
    },
    /** 测试用：现在记着几张。 */
    size: () => frames.size,
  };
}
