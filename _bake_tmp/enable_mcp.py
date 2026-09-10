import bpy
import addon_utils

addon_utils.enable("blender-mcp-main", default_set=False, persistent=True)

srv = getattr(bpy.types, "blendermcp_server", None)
print("MCP_SERVER_RUNNING:", bool(srv and srv.running))
print("MCP_PORT:", bpy.context.scene.blendermcp_port)

# Report GPU devices available for Cycles
prefs = bpy.context.preferences.addons.get("cycles")
if prefs:
    try:
        cprefs = prefs.preferences
        cprefs.get_devices()
        for d in cprefs.devices:
            print("CYCLES_DEVICE:", d.type, d.name, "use=", d.use)
    except Exception as e:
        print("CYCLES_DEVICE_ERROR:", e)
