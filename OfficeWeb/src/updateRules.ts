// "Is there a newer version of the app?" — pure rules, no DOM and no network.
//
// The office site publishes one small JSON next to the installer (`download/latest.json`,
// written by the push command). The page compares it with the version the desktop client
// reports about itself and decides whether to bother the user (user, 2026-09-17).
export interface UpdateManifest {
  /** Version of the published installer, e.g. "0.1.14". */
  version: string;
  /** File name (or path) under /download/. */
  file?: string;
  /** Either an absolute URL or a path like "/download/…exe". */
  url: string;
  size?: number;
  sha256?: string;
  notes?: string;
  releasedAt?: string;
}

export type UpdateStage =
  | 'unavailable'   // nothing published, or the page cannot read it
  | 'skipped'       // user already said 稍后 for this version
  | 'current'       // installed version is the published one (or newer)
  | 'available'     // a newer installer exists
  | 'downloading'
  | 'ready'         // downloaded and verified, waiting for the user
  | 'installing'
  | 'browser'       // no update bridge: the browser took the download over
  | 'failed';

/** Numeric parts of a version string; anything unparsable counts as zeros. */
export function versionParts(value: string | undefined | null): number[] {
  const text = String(value ?? '').trim().replace(/^v/i, '');
  if (!/^\d+(\.\d+)*$/.test(text)) return [0];
  return text.split('.').map(part => Number(part) || 0);
}

/** -1 / 0 / 1, the usual comparison, missing parts counted as 0. */
export function compareVersions(a: string, b: string): number {
  const left = versionParts(a), right = versionParts(b);
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference) return difference < 0 ? -1 : 1;
  }
  return 0;
}

/** True when `candidate` is strictly newer than `current`. */
export function isNewerVersion(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) > 0;
}

/** Bytes for humans: 96.5 MB, 512 KB, 900 B. */
export function formatBytes(bytes: number | undefined | null): string {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value < 1024) return Math.round(value) + ' B';
  if (value < 1024 * 1024) return Math.round(value / 1024) + ' KB';
  return Math.round((value / 1024 / 1024) * 10) / 10 + ' MB';
}

/** Whole percent 0..100, or null when the total is unknown. */
export function progressPercent(received: number | undefined, total: number | undefined): number | null {
  if (!Number.isFinite(Number(received)) || !Number.isFinite(Number(total)) || Number(total) <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((Number(received) / Number(total)) * 100)));
}

/** What the prompt should say; `title`/`detail` are shown verbatim. */
export interface UpdateCopy {
  title: string;
  detail: string;
  action: string;
  /** True when this client can download and run the installer by itself. */
  automatic: boolean;
  /** Optional second button, e.g. 打开文件夹 / 复制下载地址. */
  secondary?: string;
  /** Shown when the button cannot do the whole job by itself. */
  hint?: string;
}

/** How long the finished download waits before the installer opens on its own. */
export const AUTO_INSTALL_SECONDS = 3;

/**
 * Turn the manifest + this client's version into the sentence the user reads. Returns
 * null when there is nothing worth showing.
 */
export function describeUpdate(manifest: UpdateManifest | null, currentVersion: string | undefined,
  stage: UpdateStage): UpdateCopy | null {
  if (!manifest?.version) return null;
  const known: UpdateStage[] = ['available', 'downloading', 'ready', 'installing', 'browser'];
  if (!known.includes(stage)) return null;
  const automatic = Boolean(currentVersion);
  const fileName = manifest.file || manifest.url.split('/').pop() || '';
  const size = formatBytes(manifest.size);
  const base = [
    currentVersion ? `当前 ${currentVersion}` : '当前客户端太旧，无法自动更新',
    size,
    manifest.notes,
  ].filter(Boolean);
  if (stage === 'browser') {
    // The client has no update bridge (0.1.13 and older): the browser saved the file and
    // nothing here can run it, so say exactly where it went (user, 2026-09-17).
    return {
      title: `正在下载 ${manifest.version} 安装包`,
      detail: ['下载完成后到系统的「下载」文件夹双击安装'].filter(Boolean).join(' · '),
      action: '重新下载',
      secondary: '复制下载地址',
      automatic: false,
      hint: `安装包：${fileName}${size ? '（' + size + '）' : ''}；装好这一版之后就能在软件里一键更新`,
    };
  }
  const phase = stage === 'downloading' ? '正在下载…'
    : stage === 'ready' ? `下载完成，${AUTO_INSTALL_SECONDS} 秒后自动启动安装程序`
      : stage === 'installing' ? '正在启动安装程序…' : '';
  return {
    title: currentVersion ? `发现新版本 ${manifest.version}` : `有新版本 ${manifest.version}`,
    detail: [...base, phase].filter(Boolean).join(' · '),
    action: stage === 'ready' || stage === 'installing' ? '立即安装' : '下载更新',
    secondary: stage === 'ready' ? '打开文件夹' : undefined,
    automatic,
  };
}
