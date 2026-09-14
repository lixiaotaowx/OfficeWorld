// Serves the built frontend from the same process and the same port as the
// signaling server, so the page, its assets and its websocket share one origin
// (no CORS, and later one certificate covers everything).
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

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
  const base = resolve(root);
  const file = resolve(join(base, normalize(pathname)));
  if (file !== base && !file.startsWith(base + sep)) return false;

  let info;
  try {
    info = await stat(file);
  } catch {
    return false;
  }
  if (!info.isFile()) return false;

  const range = parseRange(req.headers.range, info.size);
  if (range === undefined) {
    res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
    res.end();
    return true;
  }
  const type = TYPES[extname(file).toLowerCase()] || "application/octet-stream";
  const headers = {
    "Content-Type": type,
    // Large models are fetched whole today, but Range keeps media elements and
    // resumable downloads working without a second code path.
    "Accept-Ranges": "bytes",
    // Hashed asset names are safe to cache; index.html must not be.
    "Cache-Control":
      extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
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
