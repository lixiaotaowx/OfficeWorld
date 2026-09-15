// 构建产物完整性检查：public/ 的每个文件都必须以相同大小出现在 Build/OfficeWeb。
//
// 起因（2026-09-15）：两个 agent 同时 `vite build` 到同一个 outDir，`emptyOutDir`
// 把对方刚拷进去的文件删掉了，产物里 basis/ 两个转码器变成缺失/0 字节。缺失是
// **静默**的：浏览器里 KTX2 转码失败，代码回退去下 3.61MB 的备用模型，于是"加载
// 变慢"却看不出原因；而 scp 不会删除远端文件，线上反而是好的——本地测试与线上
// 跑的根本不是同一套资源。所以构建后必须验一次。
//
// 用法：npm run build 会自动跑（postbuild）；也可单独执行
//   node test/public-parity.mjs
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const PUBLIC = join(ROOT, "public");
const BUILD = join(ROOT, "..", "Build", "OfficeWeb");

function files(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files(full, base, out);
    else out.push(relative(base, full).split("\\").join("/"));
  }
  return out;
}

const problems = [];
let checked = 0;
for (const name of files(PUBLIC)) {
  const source = statSync(join(PUBLIC, name));
  let built;
  try {
    built = statSync(join(BUILD, name));
  } catch {
    problems.push(`缺失 ${name}`);
    continue;
  }
  checked++;
  if (built.size !== source.size) {
    problems.push(`大小不同 ${name}：public=${source.size} 产物=${built.size}`);
  }
}

if (problems.length) {
  console.error(`构建产物不完整（${problems.length} 个问题，已核对 ${checked} 个文件）：`);
  for (const line of problems.slice(0, 20)) console.error("  " + line);
  console.error("多半是与另一个构建同时写入 Build/OfficeWeb；重新构建一次即可。");
  process.exit(1);
}
console.log(`public/ 与构建产物一致：${checked} 个文件`);
