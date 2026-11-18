const configuredUrl = new URL(process.env.OFFICE_URL || 'https://115.159.43.237/');
if (!['http:', 'https:'].includes(configuredUrl.protocol) || configuredUrl.username || configuredUrl.password) {
  throw new Error('OFFICE_URL must be an HTTP or HTTPS URL without embedded credentials');
}
const OFFICE_URL = configuredUrl.href;
const OFFICE_ORIGIN = configuredUrl.origin;

function trusted(url) {
  try { return new URL(url).origin === OFFICE_ORIGIN; }
  catch { return false; }
}

// The host page is served from the same origin as the app so the socket
// handshake carries the persist:office-world cookie and a real Origin.
function hostUrl() {
  return new URL('host.html', OFFICE_URL).href;
}

function trustedHost(url) {
  try {
    const target = new URL(url);
    return target.origin === OFFICE_ORIGIN && target.pathname === new URL(hostUrl()).pathname;
  } catch { return false; }
}

function microphoneOnly(types) {
  return Array.isArray(types) && types.length > 0 && types.every(type => type === 'audio');
}

module.exports = { OFFICE_URL, OFFICE_ORIGIN, hostUrl, trusted, trustedHost, microphoneOnly };
