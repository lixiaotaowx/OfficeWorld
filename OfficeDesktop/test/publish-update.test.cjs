// 推送命令的纯逻辑：参数解析、哈希、清单结构、默认安装器选择。
// 真正的上传与公网核验在 npm run publish:update 时执行（这里不碰网络）。
const { test } = require('node:test');
const assert = require('node:assert/strict');

(async () => {
  const publish = await import('../tools/publish-update.mjs');
  const { parseArgs, buildManifest, hashFile, hashHead, findInstaller } = publish;
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');

  test('参数解析：安装器、说明、核验方式、试运行', () => {
    const options = parseArgs(['--file', 'a.exe', '--notes', '修了键盘', '--verify', 'full', '--dry-run']);
    assert.deepEqual(options, { file: 'a.exe', notes: '修了键盘', verify: 'full', dryRun: true, version: '' });
    assert.equal(parseArgs([]).verify, 'head', '默认核验前 1MB，不重下 96MB');
    assert.throws(() => parseArgs(['--wat']), /未知参数/);
  });

  test('清单：相对下载地址、字段齐全，缺字段直接报错', () => {
    const manifest = buildManifest({ version: '0.1.15', file: 'iruler-dream-Setup-0.1.15-x64.exe',
      size: 101_000_000, sha256: 'a'.repeat(64), notes: 'x', releasedAt: '2026-09-17T00:00:00.000Z' });
    assert.equal(manifest.url, '/download/iruler-dream-Setup-0.1.15-x64.exe');
    assert.equal(manifest.version, '0.1.15');
    assert.equal(manifest.releasedAt, '2026-09-17T00:00:00.000Z');
    assert.throws(() => buildManifest({ version: '', file: 'x', size: 1, sha256: 'a'.repeat(64) }), /清单字段不完整/);
    assert.throws(() => buildManifest({ version: '1', file: 'x', size: 0, sha256: 'a'.repeat(64) }), /清单字段不完整/);
    assert.throws(() => buildManifest({ version: '1', file: 'x', size: 5, sha256: 'nope' }), /清单字段不完整/);
    assert.equal(buildManifest({ version: '1', file: 'x', size: 5, sha256: 'b'.repeat(64),
      notes: 'y'.repeat(500) }).notes.length, 200, '说明不会把清单撑爆');
  });

  test('哈希：整包与头部摘要都要对得上文件内容', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'office-publish-'));
    const file = path.join(dir, 'fake-installer.exe');
    fs.writeFileSync(file, Buffer.alloc(4096, 3));
    try {
      const whole = await hashFile(file);
      assert.equal(whole.size, 4096);
      assert.equal(whole.sha256, require('node:crypto').createHash('sha256').update(Buffer.alloc(4096, 3)).digest('hex'));
      const head = await hashHead(file, 1024);
      assert.equal(head, require('node:crypto').createHash('sha256').update(Buffer.alloc(1024, 3)).digest('hex'));
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });

  test('默认安装器：先找跟版本号一致的那个，找不到要说清楚怎么办', async () => {
    await assert.rejects(findInstaller('99.99.99'), /没找到 99\.99\.99 的安装器/);
    const found = await findInstaller('0.1.13').catch(() => null);
    if (found) assert.match(found.replace(/\\/g, '/'), /Build\/OfficeDesktopRelease\/.*0\.1\.13.*\.exe$/);
  });

  test('服务器与密钥沿用部署文档里的那一套', () => {
    assert.equal(publish.HOST, 'ubuntu@115.159.43.237');
    assert.match(publish.KEY, /id_ed25519_aiwb$/);
    assert.equal(publish.SITE, 'https://115.159.43.237');
    assert.equal(publish.REMOTE_DIR, 'officeweb/dist/download');
  });
})();
