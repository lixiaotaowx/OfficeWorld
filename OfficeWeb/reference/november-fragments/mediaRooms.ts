  tail: Promise<unknown>;\
  audioTail: Promise<unknown>;\
/** One generation and one operation queue per room, including teardown. */\
/** One generation per room; audio and screen queues share cancellation and teardown. */\
    const entry: Connection = { room, ready: Promise.resolve(null), tail: Promise.resolve(), cancelled: false };\
    const entry: Connection = { room, ready: Promise.resolve(null), tail: Promise.resolve(), audioTail: Promise.resolve(), cancelled: false };\
  run<T>(name: string, action: (room: Room, valid: () => boolean) => Promise<T>): Promise<T> {\
  run<T>(name: string, action: (room: Room, valid: () => boolean) => Promise<T>, lane: 'screen' | 'audio' = 'screen'): Promise<T> {\
    const result = entry.tail.catch(() => undefined).then(async () => {\
    const tail = lane === 'audio' ? 'audioTail' : 'tail';\
    const result = entry[tail].catch(() => undefined).then(async () => {\
    entry.tail = result.catch(() => undefined);\
    entry[tail] = result.catch(() => undefined);\
    const done = Promise.allSettled([entry.ready, entry.tail])\
    const done = Promise.allSettled([entry.ready, entry.tail, entry.audioTail])\
