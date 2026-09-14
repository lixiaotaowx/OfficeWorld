// Regression tests for the static file handler: byte ranges, HEAD, traversal
// refusal and the fall-through contract the server relies on.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
