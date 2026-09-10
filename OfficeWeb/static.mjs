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

  const type = TYPES[extname(file).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": info.size,
    // Hashed asset names are safe to cache; index.html must not be.
    "Cache-Control":
      extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
  });
  if (req.method === "HEAD") {
    res.end();
    return true;
  }
  createReadStream(file).pipe(res);
  return true;
}
