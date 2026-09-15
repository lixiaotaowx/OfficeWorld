// Shared test helpers. Not a test file itself (the runner only globs
// `test/*.test.mjs`), so it can hold setup code without being executed.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { io } from "socket.io-client";
import { createOfficeServer } from "../server.mjs";

/**
 * Boot a signaling server on an ephemeral port, hand the callback a `connect`
 * helper that joins a client and resolves once the room has been published,
 * and tear everything down afterwards. A fresh state file keeps the permanent
 * seat roster from leaking between runs.
 */
export async function withServer(run, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), "office-test-"));
  const { http } = createOfficeServer({ authentication: false, privatePermissions: async () => {},
    meetingPermissions: async () => {}, closePrivateMedia: async () => {}, statePath: join(dir, "state.json"),
    ...options });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  const sockets = [];
  const latest = new Map();
  const connect = (name, extra = {}) =>
    new Promise((resolve) => {
      const socket = io(`http://127.0.0.1:${port}`, {
        transports: ["websocket"],
      });
      sockets.push(socket);
      socket.on("connect", () => {
        socket.emit("join", { name, ...extra });
        socket.on("people", (people) => {
          latest.set(socket, people);
          if (people.length) resolve(socket);
        });
      });
    });
  try {
    await run({
      connect,
      port,
      peopleOf: (socket) => latest.get(socket) ?? [],
    });
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    http.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
