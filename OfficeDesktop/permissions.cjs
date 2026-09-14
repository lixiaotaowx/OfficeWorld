const { desktopCapturer } = require('electron');
const { trusted, microphoneOnly } = require('./policy.cjs');
const { chooseSource } = require('./source-picker.cjs');

function configurePermissions(session, getWindow, hooks = {}) {
  let choosingScreen = false;
  const current = wc => wc && !wc.isDestroyed() && wc === getWindow()?.webContents && trusted(wc.getURL());

  session.setPermissionCheckHandler((wc, permission, origin, details) => {
    const requestingOrigin = origin || details.securityOrigin || details.requestingUrl || details.embeddingOrigin;
    if (!current(wc) || !trusted(requestingOrigin) || details.isMainFrame === false) return false;
    // Screen choice is handled separately; neither branch grants camera access.
    if (permission === 'notifications' || permission === 'display-capture') return true;
    return permission === 'media' && details.mediaType === 'audio';
  });

  session.setPermissionRequestHandler((wc, permission, callback, details) => {
    if (!current(wc) || !trusted(details.requestingUrl) || details.isMainFrame === false) {
      callback(false); return;
    }
    if (permission === 'notifications' || permission === 'display-capture') { callback(true); return; }
    // Electron 44 routes getDisplayMedia through a media request with no device
    // types before invoking setDisplayMediaRequestHandler. This only lets it
    // reach our explicit source picker; camera requests still include 'video'.
    if (permission === 'media' && Array.isArray(details.mediaTypes) && details.mediaTypes.length === 0) {
      callback(true); return;
    }
    // The user explicitly requested app-managed microphone permission.
    // This is restricted to the first-party main frame and audio only.
    callback(permission === 'media' && microphoneOnly(details.mediaTypes));
  });

  session.setDisplayMediaRequestHandler(async (request, callback) => {
    const frame = request.frame;
    const wc = getWindow()?.webContents;
    if (!current(wc) || !frame || frame !== wc.mainFrame || !trusted(request.securityOrigin) ||
        !request.userGesture || !request.videoRequested || choosingScreen) {
      callback({}); return;
    }
    choosingScreen = true;
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 360, height: 220 } });
      const source = await chooseSource(getWindow(), sources);
      if (!source || !current(wc) || request.frame !== wc.mainFrame) { callback({}); return; }
      // Remember what is being shared: the annotation layer covers exactly that
      // display, and an empty id (a window share) means it cannot cover anything.
      hooks.onDisplayChosen?.(source.display_id || '');
      // Screen sound and microphone are not implicitly bundled into capture.
      callback({ video: source });
    } catch { callback({}); }
    finally { choosingScreen = false; }
  });

}

module.exports = { configurePermissions };
