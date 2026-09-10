# Open the project visibly with its G-drive cache graph.
$projectFile = Join-Path $PSScriptRoot '../OfficeWorld/OfficeWorld.uproject'
$resolvedProject = (Resolve-Path -LiteralPath $projectFile).Path
$editorExe = 'G:/ruanjian/ue/UE_5.8/Engine/Binaries/Win64/UnrealEditor.exe'
Start-Process -FilePath $editorExe -ArgumentList ('"' + $resolvedProject + '"'), '-DDC=OfficeWorldLocal'
