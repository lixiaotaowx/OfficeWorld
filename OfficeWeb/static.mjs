// Serves the built frontend from the same process and the same port as the
// signaling server, so the page, its assets and its websocket share one origin
// (no CORS, and later one certificate covers everything).
//
// Three things here are about client bytes and CPU: text is compressed (the 1.4MB
// bundle is ~400KB on the wire), content-hashed names are cached for a year, and
// everything else answers conditional requests with a 304 so a 14MB model is not
// re-sent just because an hour passed.
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
/** Vite writes the content hash into the name, so the name is the version. */
const HASHED = /-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2)$/;
const COMPRESS_MIN_BYTES = 1024;
const CACHE_BUDGET_BYTES = 32 * 1024 * 1024;
/** Compressed bodies keyed by file + size + mtime, so repeats cost nothing. */
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

/**
 * Parse a single-range `Range` header. Returns null when the header is absent
 * or not a form we serve (RFC 9110 allows ignoring it), undefined when it is
 * well-formed but unsatisfiable, and `{ start, end }` when it can be served.
 */
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

/**
 * Serve a file from `root` if the request maps to one. Returns false when the
 * caller should handle the request itself (unknown path, or a non-GET verb).
 */
export async function serveStatic(root, req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return false;
  }
  if (pathname === "/") pathname = "/index.html";
  // Resolve inside the root only; anything escaping it is refused.
  const rootPath = resolve(root);
  const file = resolve(join(rootPath, normalize(pathname)));
  if (file !== rootPath && !file.startsWith(rootPath + sep)) return false;

  let info;
  try {
    info = await stat(file);
  } catch {
    return false;
  }
  if (!info.isFile()) return false;

  const extension = extname(file).toLowerCase();
  const type = TYPES[extension] || "application/octet-stream";
  // Weak validator from size + mtime: turns an expired 14MB model into a 304.
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
  // A byte range of the encoded body is not what the client asked for, so ranges
  // and compression never combine.
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
    // Large models are fetched whole today, but Range keeps media elements and
    // resumable downloads working without a second code path.
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
  // A stream error without a listener would throw an uncaught exception and end
  // the process, and an aborted download would leave the descriptor open until
  // the whole file had been read. Both are handled explicitly here.
  const stream = createReadStream(file, range ? { start: range.start, end: range.end } : undefined);
  stream.on("error", () => {
    if (!res.headersSent) { res.removeHeader("Content-Length"); res.writeHead(404); res.end(); }
    else res.destroy();
  });
  res.on("close", () => stream.destroy());
  stream.pipe(res);
  return true;
}
