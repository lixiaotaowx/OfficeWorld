import { createOfficeServer } from "../../OfficeWeb/server.mjs";
import { resolve } from "node:path";
const server = createOfficeServer({
  statePath: resolve("Build/Audit/auth-dev/state.json"),
  accountsPath: resolve("Build/Audit/auth-dev/accounts.json"),
  secureCookies: false,
});
server.http.listen(3108, "127.0.0.1", () => console.log("Isolated account QA server: 3108"));
