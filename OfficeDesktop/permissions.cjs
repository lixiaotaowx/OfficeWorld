const { desktopCapturer, screen } = require('electron');
const { trusted, microphoneOnly, hostUrl } = require('./policy.cjs');
const { consumeDockCapture } = require('./dock-capture-intent.cjs');

function configurePermissions(session, getWindow, hooks = {}) {
  const getHost = hooks.getHost || (() => undefined);
  const windowFor = kind => kind === 'host' ? getHost() : getWindow();
  const kindOf = wc => {
    if (!wc || wc.isDestroyed?.()) return null;
    for (const [kind, get] of [['main', getWindow], ['host', getHost]]) {
      const target = get();
      if (target && !target.isDestroyed?.() && wc === target.webContents) return kind;
    }
    return null;
  };
  const kindForFrame = frame => {
    for (const [kind, get] of [['main', getWindow], ['host', getHost]]) {
      const target = get();
      if (target && !target.isDestroyed?.() && frame === target.webContents?.mainFrame) return kind;
    }
    return null;
  };
  const hostOrigin = value => !value || value === 'file://' || value === 'null' || value === hostUrl();
  const originAllowed = (kind, value) => kind === 'host' ? hostOrigin(value) : trusted(value);
  const allowed = (kind, permission, details) => {
    if (kind !== 'main') return false;
    if (permission === 'notifications' || permission === 'display-capture' || permission === 'pointerLock') return true;
    if (permission !== 'media') return false;
    if (details.mediaType === 'audio') return true;
    if (Array.isArray(details.mediaTypes) && details.mediaTypes.length === 0) return true;
    return microphoneOnly(details.mediaTypes);
  };

  session.setPermissionCheckHandler((wc, permission, origin, details) => {
    const kind = kindOf(wc);
    const requestingOrigin = origin || details.securityOrigin || details.requestingUrl || details.embeddingOrigin;
    if (!kind || !originAllowed(kind, requestingOrigin) || details.isMainFrame === false) return false;
    return allowed(kind, permission, details);
  });

  session.setPermissionRequestHandler((wc, permission, callback, details) => {
    const kind = kindOf(wc);
    if (!kind || !originAllowed(kind, details.requestingUrl) || details.isMainFrame === false) {
      callback(false); return;
    }
    callback(allowed(kind, permission, details));
  });

  session.setDisplayMediaRequestHandler(async (request, callback) => {
    const frame = request.frame;
    const kind = kindForFrame(frame);
    if (kind !== 'main' || !originAllowed(kind, request.securityOrigin) || !request.videoRequested) {
      callback({}); return;
    }
    const wc = windowFor(kind)?.webContents;
    if (!wc || kindOf(wc) !== kind || frame !== wc.mainFrame) { callback({}); return; }
    const dockClick = consumeDockCapture(wc);
    if (!request.userGesture && !dockClick) { callback({}); return; }
    try {

      const source = await hooks.displays?.source(desktopCapturer, screen);
      if (!source || kindOf(wc) !== kind || request.frame !== wc.mainFrame) { callback({}); return; }
      hooks.onDisplayChosen?.(source.display_id || '');

      callback({ video: source, ...(request.audioRequested ? { audio: 'loopbackWithoutChrome' } : {}) });
    } catch { callback({}); }
  });

}

module.exports = { configurePermissions };
