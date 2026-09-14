const OFFICE_URL = 'https://115.159.43.237/';
const OFFICE_ORIGIN = new URL(OFFICE_URL).origin;

function trusted(url) {
  try { return new URL(url).origin === OFFICE_ORIGIN; }
  catch { return false; }
}

function microphoneOnly(types) {
  return Array.isArray(types) && types.length > 0 && types.every(type => type === 'audio');
}

module.exports = { OFFICE_URL, OFFICE_ORIGIN, trusted, microphoneOnly };
