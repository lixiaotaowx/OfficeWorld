// 服务器上跑：确认 LiveKit 重启后 API 与房间服务正常（不改任何数据）。
//
//   cd ~/officeweb && node livekit-api-check.mjs
import { RoomServiceClient } from 'livekit-server-sdk';

try { process.loadEnvFile(new URL('./.env', import.meta.url)); } catch { /* no .env */ }
const url = (process.env.LIVEKIT_URL || '').replace(/^ws/, 'http');
const key = process.env.LIVEKIT_API_KEY || '';
const secret = process.env.LIVEKIT_API_SECRET || '';
if (!url || !key || !secret) {
  console.error('缺少 LIVEKIT_* 环境变量');
  process.exit(2);
}
const client = new RoomServiceClient(url, key, secret);
const rooms = await client.listRooms();
console.log(JSON.stringify({
  url,
  keySuffix: key.slice(-4),
  rooms: rooms.length,
  names: rooms.slice(0, 5).map(room => room.name),
}));
