// Entry point for running the office server.
//
// This is a separate file on purpose. server.mjs used to start itself behind an
// `import.meta.url === pathToFileURL(process.argv[1])` check, but PM2 runs
// scripts through its own container, so argv[1] points at that container and
// the check silently never fired: PM2 reported the process "online" while
// nothing was listening and no log line was ever printed.
import { createOfficeServer } from "./server.mjs";
import { livekit } from "./livekit.mjs";

const port = Number(process.env.PORT || 3108);
// Loopback by default for local development; a deployment sets HOST=0.0.0.0.
const host = process.env.HOST || "127.0.0.1";

const { http } = createOfficeServer();
http.listen(port, host, () =>
  console.log(
    `OfficeWeb ready on http://${host}:${port} (livekit: ${
      livekit.ready ? livekit.url : "not configured"
    })`,
  ),
);
