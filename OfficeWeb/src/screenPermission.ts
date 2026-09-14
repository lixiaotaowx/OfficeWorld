import type { Room } from 'livekit-client';

// LiveKit's protobuf TrackSource.SCREEN_SHARE is 3 (not the client source string).
// The business-channel ACK may arrive before the SFU's permission update.
export async function waitForScreenPermission(room: Room, valid: () => boolean) {
  const deadline = Date.now() + 10000;
  while (valid() && room.state === 'connected') {
    const permission = room.localParticipant.permissions;
    if (permission?.canPublish && (!permission.canPublishSources.length ||
        permission.canPublishSources.includes(3))) return;
    if (Date.now() >= deadline) throw Error('共享权限尚未就绪，请重试');
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  throw Error('共享已取消或被替换');
}
