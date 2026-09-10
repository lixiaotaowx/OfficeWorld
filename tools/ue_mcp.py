"""Small local MCP diagnostic client; only talks to the UE loopback endpoint."""
import argparse
import json
import urllib.request


class UnrealMCP:
    def __init__(self):
        self.session = None
        self.counter = 0
        self.protocol = "2025-03-26"
        initialized = self.request("initialize", {
            "protocolVersion": self.protocol,
            "capabilities": {},
            "clientInfo": {"name": "office-mcp-check", "version": "1.0"},
        })
        self.protocol = initialized.get("protocolVersion", self.protocol)
        self.request("notifications/initialized", {}, notification=True)

    def request(self, method, params, notification=False):
        self.counter += 1
        payload = {"jsonrpc": "2.0", "method": method, "params": params}
        if not notification:
            payload["id"] = self.counter
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "MCP-Protocol-Version": self.protocol,
        }
        if self.session:
            headers["Mcp-Session-Id"] = self.session
        request = urllib.request.Request(
            "http://127.0.0.1:8000/mcp",
            data=json.dumps(payload).encode("utf-8"), headers=headers,
        )
        with urllib.request.urlopen(request, timeout=45) as response:
            self.session = response.headers.get("Mcp-Session-Id", self.session)
            if "text/event-stream" in response.headers.get("Content-Type", ""):
                for line in response:
                    if line.startswith(b"data:"):
                        result = json.loads(line[5:])
                        if result.get("id") == payload.get("id"):
                            break
                else:
                    raise RuntimeError("No matching MCP response")
            else:
                body = response.read()
                if not body:
                    return None
                result = json.loads(body)
        if "error" in result:
            raise RuntimeError(result["error"])
        return result.get("result", result)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("method", nargs="?", default="tools/list")
    parser.add_argument("--params", default="{}")
    parser.add_argument("--params-file")
    parser.add_argument("--output")
    args = parser.parse_args()
    if args.params_file:
        with open(args.params_file, encoding="utf-8-sig") as source:
            params = json.load(source)
    else:
        params = json.loads(args.params)
    result = UnrealMCP().request(args.method, params)
    rendered = json.dumps(result, ensure_ascii=True, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as target:
            target.write(rendered + "\n")
    print(rendered)
