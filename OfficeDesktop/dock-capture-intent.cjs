// A trusted dock click cannot carry Chromium's transient activation across IPC.
// Bind its intent to the receiving main webContents, one request, and five seconds.
function createCaptureIntents(now = Date.now) {
  const pending = new WeakMap();
  return {
    grant(webContents) { if (webContents) pending.set(webContents, now() + 5000); },
    consume(webContents) {
      if (!webContents) return false;
      const deadline = pending.get(webContents);
      pending.delete(webContents);
      return deadline !== undefined && now() < deadline;
    },
  };
}
const intents = createCaptureIntents();
module.exports = { createCaptureIntents, grantDockCapture: intents.grant, consumeDockCapture: intents.consume };
