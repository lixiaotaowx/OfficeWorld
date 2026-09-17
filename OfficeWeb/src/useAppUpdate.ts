// 检查更新 + 下载 + 启动安装器（用户 2026-09-17 要求）。
//
// 站点上放一份 download/latest.json（由推送命令生成），页面拿自己客户端的版本跟它比：
// 有新的就弹提示，点「下载更新」由客户端下载并回传进度，下完点「立即安装」打开安装器、
// 客户端退出，安装器覆盖安装。浏览器里没有客户端，只能给一个直接下载的链接。
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  describeUpdate, formatBytes, isNewerVersion, progressPercent, AUTO_INSTALL_SECONDS, DOWNLOAD_PAGE,
  type UpdateCopy, type UpdateManifest, type UpdateStage,
} from './updateRules';

/** Where the push command leaves its manifest, next to the installers. */
export const MANIFEST_PATH = '/download/latest.json';
/** Someone leaving the app open for a week should still learn about a release. */
const RECHECK_MS = 6 * 60 * 60 * 1000;
/** "稍后" is remembered per version, so the prompt does not nag on every reload. */
const SKIP_KEY = 'iruler-update-skipped';

export interface AppUpdate {
  /** What the prompt should show, or null when there is nothing to show. */
  copy: UpdateCopy | null;
  /** The installed client's version, when it reports one (≥0.1.14 does). */
  currentVersion?: string;
  stage: UpdateStage;
  percent: number | null;
  received: number;
  total: number;
  error?: string;
  /** Download (desktop) or open the installer URL (browser). */
  start(): Promise<void>;
  /** Run the downloaded installer and quit. */
  install(): Promise<void>;
  /** Show the downloaded installer in Explorer. */
  reveal(): Promise<void>;
  /** Copy the installer URL, for a client that cannot install by itself. */
  copyLink(): Promise<void>;
  /** Hide this version until a newer one appears. */
  later(): void;
  /** True once the download finished and the installer is about to open by itself. */
  autoInstall: boolean;
}

function readSkipped(): string {
  try { return localStorage.getItem(SKIP_KEY) || ''; } catch { return ''; }
}

export function useAppUpdate(): AppUpdate {
  const [manifest, setManifest] = useState<UpdateManifest | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string | undefined>();
  const [stage, setStage] = useState<UpdateStage>('unavailable');
  const [progress, setProgress] = useState({ received: 0, total: 0, percent: null as number | null });
  const [error, setError] = useState<string>();
  const file = useRef<string>();
  /** Pending "open the installer by itself" timer, cancelled by 稍后安装. */
  const autoTimer = useRef<ReturnType<typeof setTimeout>>();
  const installRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const bridge = typeof window === 'undefined' ? undefined : window.officeDesktop;

  // The installed version, and the download progress the main process pushes back.
  useEffect(() => {
    let live = true;
    Promise.resolve(bridge?.appVersion?.()).then((version) => {
      if (live && typeof version === 'string' && version) setCurrentVersion(version);
    }).catch(() => { /* an older client has no version bridge: treat it as too old */ });
    const off = bridge?.onUpdateProgress?.((payload) => {
      const received = Number(payload?.received) || 0;
      const total = Number(payload?.total) || 0;
      setProgress({ received, total, percent: progressPercent(received, total) });
    });
    return () => { live = false; off?.(); };
  }, [bridge]);

  // One check when the app opens, then every few hours.
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const response = await fetch(`${MANIFEST_PATH}?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw Error('HTTP ' + response.status);
        const data = await response.json() as UpdateManifest;
        if (!live || !data?.version || !data?.url) return;
        setManifest(data);
        setStage(readSkipped() === data.version ? 'skipped' : 'available');
      } catch {
        // No manifest (or no network) is not an error the user needs to see.
        if (live) setStage(previous => (previous === 'available' ? previous : 'unavailable'));
      }
    };
    void load();
    const timer = setInterval(() => void load(), RECHECK_MS);
    return () => {
      live = false;
      clearInterval(timer);
      if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = undefined; }
    };
  }, []);

  const start = useCallback(async () => {
    if (!manifest) return;
    setError(undefined);
    const absolute = new URL(manifest.url, location.origin).href;
    if (!bridge?.downloadUpdate) {
      // No update bridge in this client (0.1.13 and older): the desktop app forwards an
      // http(s) URL to the system browser, which is the only place a download can happen.
      // Send it to the download PAGE, so the user gets the file, the file name and the
      // three steps for installing it (user, 2026-09-17: "老版本用户下载了找不到文件位置").
      window.open(new URL(DOWNLOAD_PAGE, location.origin).href, '_blank', 'noopener');
      setStage('browser');
      return;
    }
    setStage('downloading');
    try {
      const result = await bridge.downloadUpdate(absolute, manifest.sha256);
      file.current = result?.file;
      setStage('ready');
      // The user asked for "下载进度条，然后安装器打开": the installer opens by itself a
      // few seconds after the download, with 稍后安装 as the escape hatch.
      autoTimer.current = setTimeout(() => { void installRef.current?.(); }, AUTO_INSTALL_SECONDS * 1000);
    } catch (failure) {
      setStage('failed');
      setError(failure instanceof Error ? failure.message : '下载失败，请稍后重试');
    }
  }, [bridge, manifest]);

  const install = useCallback(async () => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = undefined; }
    if (!file.current || !bridge?.installUpdate) return;
    setStage('installing');
    try {
      await bridge.installUpdate(file.current);
    } catch (failure) {
      setStage('failed');
      setError(failure instanceof Error ? failure.message : '无法启动安装程序');
    }
  }, [bridge]);
  installRef.current = install;

  /** Show the installer in Explorer, for people who would rather run it themselves. */
  const reveal = useCallback(async () => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = undefined; }
    if (!file.current || !bridge?.revealUpdate) return;
    try { await bridge.revealUpdate(file.current); }
    catch { /* an old client without reveal still has 立即安装 */ }
  }, [bridge]);

  const copyLink = useCallback(async () => {
    if (!manifest) return;
    const absolute = new URL(manifest.url, location.origin).href;
    try { await navigator.clipboard.writeText(absolute); }
    catch { window.prompt('复制下载地址', absolute); }
  }, [manifest]);

  const later = useCallback(() => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = undefined; }
    if (manifest?.version) {
      try { localStorage.setItem(SKIP_KEY, manifest.version); } catch { /* private mode */ }
    }
    setStage('skipped');
  }, [manifest]);

  // A published version nobody needs (this client is same or newer) must not prompt.
  const effective: UpdateStage = manifest && currentVersion && !isNewerVersion(manifest.version, currentVersion)
    ? 'current' : stage;
  const copy = stage === 'failed'
    ? { title: '更新下载失败', detail: error || '请稍后重试', action: '重试',
        automatic: Boolean(bridge?.downloadUpdate), secondary: undefined, hint: undefined }
    : describeUpdate(manifest, currentVersion, effective);

  return {
    copy: effective === 'skipped' || effective === 'current' ? null : copy,
    currentVersion,
    stage: effective,
    percent: progress.percent,
    received: progress.received,
    total: progress.total,
    error,
    autoInstall: effective === 'ready',
    start, install, reveal, copyLink, later,
  };
}

/** "72.4 MB / 96.5 MB" while downloading, for the line under the bar. */
export function progressLabel(update: Pick<AppUpdate, 'received' | 'total' | 'percent'>): string {
  if (update.percent === null) return formatBytes(update.received);
  return update.total
    ? `${formatBytes(update.received)} / ${formatBytes(update.total)}`
    : `${update.percent}%`;
}
