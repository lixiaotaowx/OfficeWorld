"""Local project-script bridge for background UE asset work through native MCP."""
import unreal
import toolset_registry
import pathlib
import runpy

@unreal.uclass()
class OfficeAssetAutomation(unreal.ToolsetDefinition):
    @toolset_registry.tool_call
    def run_project_script(script_name: str) -> str:
        """Run a named Python asset script from this project's Content/Python directory."""
        root = pathlib.Path(unreal.Paths.convert_relative_path_to_full(unreal.Paths.project_content_dir())).resolve() / 'Python'
        path = (root / script_name).resolve()
        if path.parent != root or path.suffix != '.py' or not path.is_file():
            raise ValueError('Expected an existing script directly in project Content/Python')
        runpy.run_path(str(path), run_name='__main__')
        return 'Script returned: ' + path.name

unreal.ToolsetRegistry.register_toolset_class(OfficeAssetAutomation)
print('OfficeAssetAutomation registered')
