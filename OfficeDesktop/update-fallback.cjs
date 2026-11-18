'use strict';

/**
 * Second line of defence for updates.
 *
 * Normally the web page checks `download/latest.json` and shows the update prompt.
 * That page is remote code: one bad web release can silently switch its check off,
 * and then no installed client would ever learn about a new version. This module
 * lives in the installed app, so it keeps working whatever the page does: when the
 * page has not reported a successful check, the app checks the manifest itself and
 * offers the update with a native dialog.
 */

const START_DELAY_MS = 90 * 1000;
const RECHECK_MS = 6 * 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;
/** A page report older than this no longer counts as "the page is handling it". */
const PAGE_FRESH_MS = RECHECK_MS + 30 * 60 * 1000;

function versionParts(value) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(value || '').trim());
  return match ? match.slice(1).map(Number) : null;
}

function isNewer(candidate, current) {
  const a = versionParts(candidate), b = versionParts(current);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

function createUpdateFallback(dependencies) {
  const { app, net, dialog, updater, officeUrl, trusted } = dependencies;
  const getWindow = dependencies.getWindow || (() => null);
  const now = dependencies.now || (() => Date.now());
  const setTimer = dependencies.setTimeout || setTimeout;
  const clearTimer = dependencies.clearTimeout || clearTimeout;
  const log = dependencies.log || (() => {});
  const startDelayMs = dependencies.startDelayMs ?? START_DELAY_MS;

  let pageCheckedAt = 0;
  let timer;
  let stopped = false;
  let working = false;
  /** Versions the person already answered "later" to in this run. */
  const declined = new Set();

  function schedule(delay) {
    if (stopped) return;
    clearTimer(timer);
    timer = setTimer(() => { void check(); }, delay);
    timer?.unref?.();
  }

  async function readManifest() {
    const url = new URL('download/latest.json', officeUrl);
    url.searchParams.set('t', String(now()));
    const response = await net.fetch(url.href, { cache: 'no-store' });
    if (!response.ok) throw Error('manifest HTTP ' + response.status);
    const data = await response.json();
    const target = data?.url ? new URL(String(data.url), url).href : '';
    if (!versionParts(data?.version) || !target || !trusted(target)) throw Error('manifest is not usable');
    return { version: String(data.version), url: target,
      sha256: typeof data.sha256 === 'string' ? data.sha256 : undefined };
  }

  async function check() {
    if (stopped || working) return { skipped: 'busy' };
    if (pageCheckedAt && now() - pageCheckedAt < PAGE_FRESH_MS) {
      schedule(RECHECK_MS);
      return { skipped: 'page' };
    }
    working = true;
    try {
      const manifest = await readManifest();
      if (!isNewer(manifest.version, app.getVersion()) || declined.has(manifest.version)) {
        schedule(RECHECK_MS);
        return { current: true, version: manifest.version };
      }
      const window = getWindow();
      const options = {
        type: 'info', noLink: true, defaultId: 0, cancelId: 1,
        title: '发现新版本',
        message: `iruler dream ${manifest.version} 可以更新了`,
        detail: `当前版本 ${app.getVersion()}。更新会自动下载并安装，完成后自动重新打开。`,
        buttons: ['立即更新', '稍后'],
      };
      const answer = window && !window.isDestroyed() && window.isVisible?.()
        ? await dialog.showMessageBox(window, options) : await dialog.showMessageBox(options);
      if (answer.response !== 0) {
        declined.add(manifest.version);
        schedule(RECHECK_MS);
        return { declined: true, version: manifest.version };
      }
      const result = await updater.download(manifest.url, manifest.sha256);
      await updater.install(result.file);
      return { installing: true, version: manifest.version };
    } catch (error) {
      log('update fallback failed: ' + String(error?.message || error));
      schedule(RETRY_MS);
      return { error: String(error?.message || error) };
    } finally { working = false; }
  }

  return {
    start() { schedule(startDelayMs); },
    stop() { stopped = true; clearTimer(timer); },
    /** The page fetched a valid manifest: it owns the prompt for now. */
    pageChecked() { pageCheckedAt = now(); },
    check,
  };
}

module.exports = { createUpdateFallback, isNewer, START_DELAY_MS, RECHECK_MS, RETRY_MS, PAGE_FRESH_MS };
