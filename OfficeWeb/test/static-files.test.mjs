// Regression tests for the static file handler: byte ranges, HEAD, traversal
// refusal and the fall-through contract the server relies on.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseRange, serveStatic } from "../static.mjs";

const BODY = "0123456789".repeat(100); // 1000 bytes, position == digit value

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "office-static-"));
  writeFileSync(join(root, "data.bin"), BODY);
  writeFileSync(join(root, "index.html"), "<!doctype html><title>t</title>");
  return root;
}

async function withServer(root, run) {
  const server = createServer(async (req, res) => {
    if (await serveStatic(root, req, res)) return;
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("parseRange 只接受规范形式，越界返回不可满足", () => {
  assert.equal(parseRange(undefined, 1000), null);
  assert.equal(parseRange("items=0-1", 1000), null);
  assert.equal(parseRange("bytes=abc", 1000), null);
  assert.deepEqual(parseRange("bytes=10-19", 1000), { start: 10, end: 19 });
  assert.deepEqual(parseRange("bytes=990-", 1000), { start: 990, end: 999 });
  assert.deepEqual(parseRange("bytes=-5", 1000), { start: 995, end: 999 });
  assert.deepEqual(parseRange("bytes=0-99999", 1000), { start: 0, end: 999 });
  assert.equal(parseRange("bytes=1000-1200", 1000), undefined);
  assert.equal(parseRange("bytes=50-10", 1000), undefined);
  assert.equal(parseRange("bytes=-0", 1000), undefined);
});

test("完整请求返回 200、长度与可续传标记", async () => {
  const root = fixture();
  try {
    await withServer(root, async (url) => {
      const response = await fetch(`${url}/data.bin`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-length"), "1000");
      assert.equal(response.headers.get("accept-ranges"), "bytes");
      assert.equal((await response.text()).length, 1000);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("目录地址（/download/）返回它自己的 index.html，而不是 App 外壳", async () => {
  // 老客户端下载更新时会把浏览器指到 /download/，那里必须有真实的下载说明页（2026-09-17）。
  const root = fixture();
  mkdirSync(join(root, "download"), { recursive: true });
  writeFileSync(join(root, "download", "index.html"), "<!doctype html><title>下载</title>安装步骤");
  try {
    await withServer(root, async (url) => {
      for (const path of ["/download/", "/download/index.html"]) {
        const response = await fetch(`${url}${path}`);
        assert.equal(response.status, 200, path);
        assert.match(response.headers.get("content-type"), /text\/html/);
        assert.match(await response.text(), /安装步骤/, path + " 必须拿到下载说明页");
      }
      // 目录里没有 index.html 时仍然拒绝，而不是回落到 App。
      mkdirSync(join(root, "empty"), { recursive: true });
      const missing = await fetch(`${url}/empty/`);
      assert.equal(missing.status, 404);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Range 请求返回 206 与正确的字节区间", async () => {
  const root = fixture();
  try {
    await withServer(root, async (url) => {
      const range = await fetch(`${url}/data.bin`, { headers: { Range: "bytes=10-19" } });
      assert.equal(range.status, 206);
      assert.equal(range.headers.get("content-range"), "bytes 10-19/1000");
      assert.equal(range.headers.get("content-length"), "10");
      assert.equal(await range.text(), BODY.slice(10, 20));

      const suffix = await fetch(`${url}/data.bin`, { headers: { Range: "bytes=-5" } });
      assert.equal(suffix.status, 206);
      assert.equal(suffix.headers.get("content-range"), "bytes 995-999/1000");
      assert.equal(await suffix.text(), BODY.slice(995));
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("不可满足的 Range 返回 416，HEAD 不带正文", async () => {
  const root = fixture();
  try {
    await withServer(root, async (url) => {
      const bad = await fetch(`${url}/data.bin`, { headers: { Range: "bytes=5000-6000" } });
      assert.equal(bad.status, 416);
      assert.equal(bad.headers.get("content-range"), "bytes */1000");

      const head = await fetch(`${url}/data.bin`, { method: "HEAD" });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get("content-length"), "1000");
      assert.equal(await head.text(), "");
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("文本资源按 Accept-Encoding 压缩，已压缩格式不重复压缩", async () => {
  const root = fixture();
  const source = "const a = 1;\n".repeat(400);
  writeFileSync(join(root, "index-ABC123xy.js"), source);
  try {
    await withServer(root, async (url) => {
      // fetch decodes transparently, so the declared length is the evidence.
      const br = await fetch(`${url}/index-ABC123xy.js`, { headers: { "Accept-Encoding": "br" } });
      assert.equal(br.headers.get("content-encoding"), "br");
      assert.ok(Number(br.headers.get("content-length")) < source.length * 0.6, "压缩后应明显更小");
      assert.equal(br.headers.get("vary"), "Accept-Encoding");
      assert.equal(await br.text(), source);
      const gzip = await fetch(`${url}/index-ABC123xy.js`, { headers: { "Accept-Encoding": "gzip" } });
      assert.equal(gzip.headers.get("content-encoding"), "gzip");
      const none = await fetch(`${url}/index-ABC123xy.js`, { headers: { "Accept-Encoding": "" } });
      assert.equal(none.headers.get("content-encoding"), null);
      assert.equal(Number(none.headers.get("content-length")), source.length);
      // Already-compressed assets are served as they are.
      const binary = await fetch(`${url}/data.bin`, { headers: { "Accept-Encoding": "br" } });
      assert.equal(binary.headers.get("content-encoding"), null);
      assert.equal(Number(binary.headers.get("content-length")), BODY.length);
      // Ranges and compression never combine.
      const ranged = await fetch(`${url}/index-ABC123xy.js`, { headers: { "Accept-Encoding": "br", Range: "bytes=0-9" } });
      assert.equal(ranged.status, 206);
      assert.equal(ranged.headers.get("content-encoding"), null);
      assert.equal(await ranged.text(), source.slice(0, 10));
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("带内容哈希的文件长期缓存，其它资源用条件请求换 304", async () => {
  const root = fixture();
  writeFileSync(join(root, "app-DEADBEEF.css"), "body{color:#123}\n");
  try {
    await withServer(root, async (url) => {
      const hashed = await fetch(`${url}/app-DEADBEEF.css`);
      assert.equal(hashed.headers.get("cache-control"), "public, max-age=31536000, immutable");
      assert.ok(hashed.headers.get("etag"), "必须带 ETag，否则过期后只能重传整份");
      // An expired model must come back as a 304, not as the whole body.
      const model = await fetch(`${url}/data.bin`);
      assert.equal(model.headers.get("cache-control"), "public, max-age=3600", "没有名字哈希的资源仍按小时过期");
      const again = await fetch(`${url}/data.bin`, { headers: { "If-None-Match": model.headers.get("etag") } });
      assert.equal(again.status, 304);
      assert.equal(await again.text(), "");
      const miss = await fetch(`${url}/data.bin`, { headers: { "If-None-Match": 'W/"nope"' } });
      assert.equal(miss.status, 200);
      // A validator from a different file must not match.
      const crossed = await fetch(`${url}/data.bin`, { headers: { "If-None-Match": hashed.headers.get("etag") } });
      assert.equal(crossed.status, 200);
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("编码的路径穿越与未知路径都不会被本模块接管", async () => {
  const root = fixture();
  try {
    await withServer(root, async (url) => {
      const escaped = await fetch(`${url}/%2e%2e%2fsecret.txt`);
      assert.equal(escaped.status, 404);
      const missing = await fetch(`${url}/nope.bin`);
      assert.equal(missing.status, 404);
      // index.html is served with no-cache so a refresh always sees the new build.
      const page = await fetch(`${url}/`);
      assert.equal(page.headers.get("cache-control"), "no-cache");
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
