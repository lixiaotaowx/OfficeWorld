

import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".map", ".svg", ".txt"]);

const HASHED = /-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2)$/;
const COMPRESS_MIN_BYTES = 1024;
const CACHE_BUDGET_BYTES = 32 * 1024 * 1024;

const compressed = new Map();
let compressedBytes = 0;

function cachedCompressed(file, info, encoding) {
  return compressed.get(`${file}:${info.size}:${Math.round(info.mtimeMs)}:${encoding}`) || null;
}

function rememberCompressed(file, info, encoding, body) {
  if (compressedBytes + body.length > CACHE_BUDGET_BYTES) {
    compressed.clear();
    compressedBytes = 0;
  }
  compressed.set(`${file}:${info.size}:${Math.round(info.mtimeMs)}:${encoding}`, body);
  compressedBytes += body.length;
  return body;
}

export function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header ?? "").trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  if (rawStart === "" && rawEnd === "") return null;
  if (size === 0) return undefined;
  if (rawStart === "") {
    const suffix = Number(rawEnd);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return undefined;
    return { start: Math.max(0, size - suffix), end: size - 1 };
  }
  const start = Number(rawStart);
  if (!Number.isSafeInteger(start) || start >= size) return undefined;
  const end = rawEnd === "" ? size - 1 : Number(rawEnd);
  if (!Number.isSafeInteger(end) || end < start) return undefined;
  return { start, end: Math.min(end, size - 1) };
}

export async function serveStatic(root, req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return false;
  }
  if (pathname === "/") pathname = "/index.html";

  const rootPath = resolve(root);
  let file = resolve(join(rootPath, normalize(pathname)));
  if (file !== rootPath && !file.startsWith(rootPath + sep)) return false;

  let info;
  try {
    info = await stat(file);
  } catch {
    return false;
  }

  if (!info.isFile()) {
    file = join(file, "index.html");
    try {
      info = await stat(file);
    } catch {
      return false;
    }
    if (!info.isFile()) return false;
  }

  const extension = extname(file).toLowerCase();
  const type = TYPES[extension] || "application/octet-stream";

  const etag = `W/"${info.size.toString(16)}-${Math.round(info.mtimeMs).toString(16)}"`;
  const cacheControl = extension === ".html" ? "no-cache"
    : HASHED.test(file) ? "public, max-age=31536000, immutable"
      : "public, max-age=3600";
  const base = { "Content-Type": type, "Cache-Control": cacheControl, ETag: etag };
  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304, base);
    res.end();
    return true;
  }
  const range = parseRange(req.headers.range, info.size);
  if (range === undefined) {
    res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
    res.end();
    return true;
  }
  const accepts = String(req.headers["accept-encoding"] || "");

  const encoding = range || info.size < COMPRESS_MIN_BYTES || !COMPRESSIBLE.has(extension) ? ""
    : /\bbr\b/.test(accepts) ? "br" : /\bgzip\b/.test(accepts) ? "gzip" : "";
  if (encoding) {
    const body = cachedCompressed(file, info, encoding)
      || rememberCompressed(file, info, encoding, encoding === "br"
        ? brotliCompressSync(await readFile(file), { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
        : gzipSync(await readFile(file), { level: 6 }));
    res.writeHead(200, { ...base, "Content-Encoding": encoding, "Content-Length": body.length,
      Vary: "Accept-Encoding" });
    if (req.method === "HEAD") res.end();
    else res.end(body);
    return true;
  }
  const headers = {
    ...base,

    "Accept-Ranges": "bytes",
    Vary: "Accept-Encoding",
  };
  if (range) {
    headers["Content-Range"] = `bytes ${range.start}-${range.end}/${info.size}`;
    headers["Content-Length"] = range.end - range.start + 1;
  } else {
    headers["Content-Length"] = info.size;
  }
  res.writeHead(range ? 206 : 200, headers);
  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  const stream = createReadStream(file, range ? { start: range.start, end: range.end } : undefined);
  stream.on("error", () => {
    if (!res.headersSent) { res.removeHeader("Content-Length"); res.writeHead(404); res.end(); }
    else res.destroy();
  });
  res.on("close", () => stream.destroy());
  stream.pipe(res);
  return true;
}
