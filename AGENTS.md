# OfficeWorld project guidance

## 最重要的规则：只改本地源码，不要在打包产物 / 已装客户端上花功夫

**用户 2026-10-15 原话**：「是让你检查本地的源码，不是让你检查已经打包好的软件。已经打包好的
软件是一个垃圾品啊，你不要在它上面花功夫。你要把本地的代码弄好之后，然后构建、确定、上传，
就这么简单的事情。」

- **判断对错只以工作区里的源码为准**（`OfficeWeb/src`、`OfficeDesktop/*.cjs`、`test/`）。
  用户报障时**先读源码把结论坐实**；不要为了"核实"去解包 `Build/…/app.asar`、比对已安装的
  客户端、或反编译线上 bundle 的细节 —— 那些都是**过期产物**，看它们只会得到误导性结论、白花时间。
- 流程固定四步，不要绕：**①把本地代码改对（并核对每个字段/契约都对得上）→ ②构建 → ③上传
  （前端 `node Build/deploy-web.cjs --upload --verify`；安装包
  `cd OfficeDesktop && npm run publish:update -- --notes "…" --verify full`）→ ④报结果。**
- **不要「先发一版看看」**：发之前就把本地该检查的检查完，尤其是"新增字段有没有被 IPC 白名单
  清洗掉"这类**页面在推、对面永远收不到**的问题（`dock-meeting-bridge.cjs` /
  `dock-private-bridge.cjs` 就是按字段重建的，漏一个字段等于功能静默失效）。
  发一版再补一版是纯浪费。
- 唯一允许看产物的场合：**用户明确要求**，或要证明"上传的字节与本地构建一致"
  —— 那时比的是**哈希**，不是读内容。

## New web project file-size rule

For the new project in `OfficeWeb`, every file must be no more than 500 lines.
Read `OfficeWeb/AGENTS.md` before working there; the taskbar dock and file-transfer
rules live in `OfficeWeb/AGENTS-dock.md` (split out 2026-10-14 when `AGENTS.md` hit
516 lines). Split growing files by clear responsibility before they exceed the
limit; do not compress code into long lines to evade it. Do not silently exempt
generated text or reference copies. The preserved UE project and external original
projects are not to be rewritten as part of applying this rule to the new web
project.

## OfficeWeb deployment target

The authoritative user-facing website is https://115.159.43.237/.
Read `OfficeWeb/AGENTS.md` and `Design/Deployment.md` before deployment work.
Do not confuse this Ubuntu VPS with the separate Windows `iruler-test` machine.
Do not assume the test-machine SSH key authenticates to the VPS.
The verified VPS identity is `ubuntu@115.159.43.237` using
`C:/Users/Administrator/.ssh/id_ed25519_aiwb` (login verified 2026-09-12).
Explicitly select that key with `IdentitiesOnly=yes`; preserve host-key checking.
Use the recorded configuration before asking for connection details again.
Never read or print private-key contents. The `id_ed25519_irulerdream` key is
for the separate Windows test machine and must not substitute for the VPS key.
Local exports, builds and screenshots are not evidence of a live-site update.
Report an update as deployed only after uploading the actual build/assets and
verifying the new version at the authoritative website. If blocked, explicitly
state that the website still has the previous version.

Before changing office visuals, view the approved concept image at
[Design/References/Approved_Natural_Office_Concept.png](Design/References/Approved_Natural_Office_Concept.png).
This is the user's accepted design reference and must remain in the project.

Aim for a natural, young, thoughtfully designed realistic office: soft sage/olive
walls, selective timber slats and ceiling baffles, thin black glass frames,
natural wood flooring, dark wood desks with white cabinets, black ergonomic
chairs, realistic plants, restrained office accessories, daylight and warm lamps.
Avoid a generic all-white office, heavy old-fashioned executive styling, and
coarse noisy materials. Check real texture scale, normal strength, roughness,
exposure, furniture proportions, seating direction and usable circulation.

Prefer finished free models with appropriate licenses and original PBR textures.
Record authors, source URLs, licenses and modifications. The user has authorized
autonomous selection, downloading, adaptation and implementation of suitable free
assets; do not reintroduce per-item approval. Do not purchase assets. Preserve
unrelated files and back up scene content before replacing it.

The concept image is a design target, never evidence of UE implementation.
Inspect real UE screenshots after changes before reporting a visible result.
Do not describe prototype furniture or procedural foliage as finished assets.
Keep the user's existing UE instance visible; do not close or restart it casually.

Track incomplete and deferred work in [Design/TODO.md](Design/TODO.md).
Chair back transparency is explicitly deferred, not permanently waived.
