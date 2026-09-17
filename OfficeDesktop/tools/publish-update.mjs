// 一条命令把新安装器推到服务器（用户 2026-09-17：「直接用命令推送到我的服务器安装器」）。
//
//   npm run publish:update -- --notes "修了什么"
//
// 做四件事：算 sha256 → 上传安装器到 ~/officeweb/dist/download/ → 写并上传
// latest.json（网页就是读它判断有没有新版本）→ 从公网核验大小与哈希。
// 默认取 Build/OfficeDesktopRelease 里跟 package.json 版本一致的那个安装器。
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DESKTOP = resolve(HERE, '..');
const ROOT = resolve(DESKTOP, '..');
const RELEASES = join(ROOT, 'Build', 'OfficeDesktopRelease');
const STAGE = join(ROOT, 'Build', 'update-publish');

export const HOST = 'ubuntu@115.159.43.237';
export const KEY = 'C:/Users/Administrator/.ssh/id_ed25519_aiwb';
/** Public origin the clients already trust; the manifest keeps paths relative to it. */
export const SITE = 'https://115.159.43.237';
export const REMOTE_DIR = 'officeweb/dist/download';

/** Same ssh options as Design/Deployment.md: explicit key, host keys checked. */
const SSH = ['-i', KEY, '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes'];

export function parseArgs(argv) {
  const options = { notes: '', file: '', verify: 'head', dryRun: false, version: '' };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--file') options.file = argv[++index] || '';
    else if (arg === '--notes') options.notes = argv[++index] || '';
    else if (arg === '--version') options.version = argv[++index] || '';
    else if (arg === '--verify') options.verify = argv[++index] || 'head';
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw Error('未知参数：' + arg);
  }
  return options;
}

/** The manifest the page reads; `url` stays relative so it follows the origin. */
export function buildManifest({ version, file, size, sha256, notes = '', releasedAt }) {
  if (!version || !file || !Number.isFinite(size) || size <= 0 || !/^[0-9a-f]{64}$/.test(sha256)) {
    throw Error('清单字段不完整：' + JSON.stringify({ version, file, size, sha256 }));
  }
  return {
    version,
    file,
    url: `/download/${file}`,
    size,
    sha256,
    notes: String(notes).slice(0, 200),
    releasedAt: releasedAt || new Date().toISOString(),
  };
}

export async function hashFile(path) {
  const hash = createHash('sha256');
  let size = 0;
  await new Promise((done, fail) => {
    createReadStream(path).on('data', chunk => { hash.update(chunk); size += chunk.length; })
      .on('error', fail).on('end', done);
  });
  return { size, sha256: hash.digest('hex') };
}

/** Digest of the first `bytes` of a file, to compare against a ranged read of the URL. */
export async function hashHead(path, bytes = 1024 * 1024) {
  const hash = createHash('sha256');
  const stream = createReadStream(path, { start: 0, end: bytes - 1 });
  await new Promise((done, fail) => {
    stream.on('data', chunk => hash.update(chunk)).on('error', fail).on('end', done);
  });
  return hash.digest('hex');
}

const USAGE = `推送安装器到服务器并发布更新清单。

  npm run publish:update -- [--notes "更新说明"] [--file 安装器] [--verify head|full|none]
                           [--version 0.1.15] [--dry-run]

默认取 Build/OfficeDesktopRelease 里与 package.json 版本一致的安装器。
推送后网页会在 download/latest.json 里看到新版本并提示更新。`;

/** Default target: the installer whose name carries the current package version. */
export async function findInstaller(version) {
  const candidates = [
    join(RELEASES, `iruler-dream-Setup-${version}-x64.exe`),
    join(RELEASES, `iruler-dream-${version}-Windows-x64.exe`),
  ];
  for (const candidate of candidates) {
    try { if ((await stat(candidate)).isFile()) return candidate; } catch { /* try the next */ }
  }
  throw Error(`没找到 ${version} 的安装器，先打包（npm run dist:installer）或用 --file 指定`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`${command} 退出码 ${result.status}`);
}

/** Upload the installer and the manifest; the site serves them as static files. */
export function upload({ file, manifestPath, dryRun }) {
  const remote = `${HOST}:~/`;
  if (dryRun) {
    console.log('[dry-run] 会上传:', basename(file), '与 latest.json ->', REMOTE_DIR);
    return;
  }
  run('ssh', [...SSH, HOST, `mkdir -p ~/${REMOTE_DIR}`]);
  run('scp', [...SSH, file, `${remote}${REMOTE_DIR}/`]);
  run('scp', [...SSH, manifestPath, `${remote}${REMOTE_DIR}/latest.json`]);
}

async function headSize(url) {
  const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
  return { status: response.status, length: Number(response.headers.get('content-length')) };
}

/** Real bytes from the live server: the first megabyte, hashed, must match the local one. */
async function rangedDigest(url, bytes, localDigest) {
  const response = await fetch(url, { headers: { Range: `bytes=0-${bytes - 1}` }, cache: 'no-store' });
  if (!response.ok && response.status !== 206) throw Error('分段下载失败：HTTP ' + response.status);
  const body = Buffer.from(await response.arrayBuffer());
  const digest = createHash('sha256').update(body).digest('hex');
  if (body.length !== bytes || digest !== localDigest) {
    throw Error(`线上前 ${bytes} 字节与本地不一致（收到 ${body.length} 字节）`);
  }
  return digest;
}

async function fullDigest(url, expected) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw Error('下载失败：HTTP ' + response.status);
  const hash = createHash('sha256');
  let size = 0;
  for await (const chunk of response.body) { hash.update(chunk); size += chunk.length; }
  const digest = hash.digest('hex');
  if (digest !== expected) throw Error('线上整包哈希与本地不一致');
  return { size, digest };
}

/** Verify what the world actually gets, not what we hoped we uploaded. */
export async function verify({ manifest, local, mode }) {
  if (mode === 'none') return '已跳过核验（--verify none）';
  const fileUrl = `${SITE}${manifest.url}`;
  const head = await headSize(fileUrl);
  if (head.status !== 200) throw Error('线上安装器返回 HTTP ' + head.status);
  if (head.length !== manifest.size) throw Error(`线上大小 ${head.length} != 本地 ${manifest.size}`);
  let tail = `大小 ${manifest.size} 字节一致`;
  if (mode === 'full') {
    const full = await fullDigest(fileUrl, manifest.sha256);
    tail += `，整包哈希 ${full.digest.slice(0, 16)}… 一致`;
  } else {
    const head1mb = await rangedDigest(fileUrl, Math.min(1024 * 1024, manifest.size), local.headDigest);
    tail += `，前 1MB 哈希 ${head1mb.slice(0, 12)}… 一致（Accept-Ranges 也在）`;
  }
  const live = await fetch(`${SITE}${'/download/latest.json'}?t=${Date.now()}`, { cache: 'no-store' });
  if (!live.ok) throw Error('线上 latest.json 返回 HTTP ' + live.status);
  const published = await live.json();
  if (published.version !== manifest.version || published.sha256 !== manifest.sha256) {
    throw Error('线上 latest.json 与刚推送的内容不一致');
  }
  return `${tail}，latest.json 已是 ${published.version}`;
}

export async function publish(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) { console.log(USAGE); return null; }
  const pkg = JSON.parse(await readFile(join(DESKTOP, 'package.json'), 'utf8'));
  const version = options.version || pkg.version;
  const file = options.file ? resolve(options.file) : await findInstaller(version);
  const name = basename(file);
  if (!name.includes(version)) {
    console.warn(`注意：文件名 ${name} 里没有版本号 ${version}，客户端仍会按清单里的 version 判断`);
  }
  const { size, sha256 } = await hashFile(file);
  const manifest = buildManifest({ version, file: name, size, sha256, notes: options.notes });
  await mkdir(STAGE, { recursive: true });
  const manifestPath = join(STAGE, 'latest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`安装器 ${name}  ${(size / 1048576).toFixed(1)} MB  sha256 ${sha256}`);
  console.log('清单', manifestPath);
  upload({ file, manifestPath, dryRun: options.dryRun });
  if (options.dryRun) return manifest;
  const headDigest = await hashHead(file);
  const summary = await verify({ manifest, local: { headDigest }, mode: options.verify });
  console.log('核验通过：' + summary);
  console.log(`下载地址 ${SITE}${manifest.url}`);
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  publish().catch(error => { console.error('推送失败：' + error.message); process.exitCode = 1; });
}
