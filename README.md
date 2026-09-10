# OfficeWorld

Current update (2026-09-08): `OfficeNatural_A` contains four imported D1/C1
desk/chair pairs, original architectural shell, finished Poly Haven plants and
office accessories. D1/C1 have been downloaded and installed; C2 is still pending.
MetaHuman Core Data is installed and an editor preview is visible; this is not
yet a clothed playable avatar. Lighting/material matching is still in progress.

The first native virtual-office UI is implemented under `/Game/OfficeInteraction`, with source builders
in `OfficeWorld/Content/Python`. Interaction scope and network boundaries are in
`Design/OfficeInteraction.md`; incomplete work is tracked in `Design/TODO.md`.
Screen-consent demonstrations do not capture or transmit real desktop content.
Twenty PIE interaction tests passed, and Tab cursor/camera switching was verified
in both directions. Press Play in the existing editor, use WASD to approach a
station, and use Tab for the interaction buttons. The own-station button and the
toolbar both support sitting/standing. Real networking, media transport and
third-person seated avatar animation remain pending.

See `AssetSources/Realistic/CREDITS.md` for current asset provenance. The older
setup notes below are retained as history; their asset-download status is obsolete.

## Historical UE MCP connection notes

Current work (2026-09-07): `/Game/Maps/OfficeNatural_A` is the active architectural revision. The user authorized direct replacement using finished furniture/foliage and the approved sage/wood concept. D1/C1/C2 finished furniture is selected but NOT downloaded or installed: Fab's agreement and Sketchfab login are pending. Old furnishings remain explicitly temporary under `PendingReplacement/PrototypeOnly`, not final assets. The revised architectural shell, slats, ceiling and CC0 4K plaster/wood textures are imported. MetaHuman Creator Core Data installation passed verification at 22:17; Creator/Generator plugins are enabled and `/Game/MetaHumans/Office/OfficePerson01` was created. Runtime rig/assembly/walking/sitting are NOT yet verified. Full pre-change Content/Config/project backup is in `Backups/BeforeNaturalOffice_20260907_2218`. Installation heartbeat `metahuman` is paused after success. The older connection-test notes below describe initial setup, not the current scene.

Configured on 2026-09-07 using the installed Unreal Engine 5.8.2 official MCP plugin.

- Engine: `G:\ruanjian\ue\UE_5.8`
- Project: `OfficeWorld/OfficeWorld.uproject`
- MCP endpoint: `http://127.0.0.1:8000/mcp`
- Codex server name: `unreal`, registered in the user's Codex config.
- Enabled: ModelContextProtocol, AllToolsets, PythonScriptPlugin, EditorScriptingUtilities.
- The MCP server starts automatically while this project is open.

## Usage

Open `OfficeWorld/OfficeWorld.uproject` in UE 5.8. Once the editor is ready, restart the MCP connection in Codex's MCP settings, or restart Codex to load the newly registered tools.

The current task also has a local diagnostic client, requiring only Python's standard library:

```powershell
python tools/ue_mcp.py
python tools/ue_mcp.py tools/call --params '{"name":"list_toolsets","arguments":{}}'
```

UE tool calls should run sequentially. Discover schemas with `list_toolsets` and `describe_toolset`, then execute with `call_tool`.

## Verified

MCP initialization, tool discovery, current-level inspection, primitive and light creation, actor movement, transform readback, and map saving all succeeded. The test map `/Game/Maps/Entry` contains `MCP_Test_Floor`, `MCP_Connection_OK`, and `MCP_Test_Light`.

This is a connection test project, not the completed office game. UE 5.7 was not modified.

Known issue observed: duplicating the loaded Engine Entry map through AssetTools.duplicate left a private model reference and failed saving. The failed duplicate was deleted; the working test map uses a project-local copy of the original map file, edited and saved successfully through MCP.

References: https://dev.epicgames.com/documentation/unreal-engine/unreal-mcp-in-unreal-editor and https://learn.chatgpt.com/docs/extend/mcp?surface=cli
