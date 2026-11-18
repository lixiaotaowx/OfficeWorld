import { createOfficeServer } from './server.mjs';
import { livekit } from './livekit.mjs';
const port = Number(process.env.PORT || 3108);
const host = process.env.HOST || '127.0.0.1';
const loopback = ['127.0.0.1', 'localhost', '::1'].includes(host);
const { http, io, stopCat } = createOfficeServer({ secureCookies: process.env.SECURE_COOKIES === 'true' || !loopback });
http.listen(port, host, () => {
  console.log('iruler dream ready on http://' + host + ':' + port);
  console.log('Media service: ' + (livekit.ready ? 'configured' : 'not configured'));
});

// Save the simulation before systemd terminates the process.
let stopping = false;
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
  if (stopping) return;
  stopping = true;
  try { stopCat(); } catch (error) { console.error('Could not save cat checkpoint:', error.message); }
  io.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
});
