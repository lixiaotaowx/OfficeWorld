# One-off verification: does the pushed repo actually work on a clean machine?
#
# Clones origin/main into a fresh directory OUTSIDE the working copy, installs
# dependencies from the lockfile, builds the web app, and runs the unit tests.
# This is deliberately outside the repo so it cannot pick up local files.
$ErrorActionPreference = 'Continue'
$target = 'G:\C\wendang\ChatGPT\_clonecheck'
$log = Join-Path $env:TEMP 'clone-verify.log'

function Say($text) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $text
  Write-Output $line
  Add-Content -LiteralPath $log -Value $line -Encoding UTF8
}

if (Test-Path $log) { Remove-Item -Force $log }
if (Test-Path $target) { Remove-Item -Recurse -Force $target }

Say "clone start"
git clone --quiet https://github.com/lixiaotaowx/OfficeWorld.git $target 2>&1 | ForEach-Object { Say "  $_" }
Say "clone exit=$LASTEXITCODE"

if (!(Test-Path "$target\OfficeWeb\package.json")) { Say "ABORT: no OfficeWeb/package.json in clone"; exit 1 }
Say ("clone HEAD = " + (git -C $target rev-parse HEAD))
Say ("tracked files = " + (git -C $target ls-files).Count)
$dirty = git -C $target status --porcelain
Say ("working tree dirty entries = " + ($dirty | Measure-Object).Count)
foreach ($p in @('SETUP.md', '.gitattributes', 'OfficeWeb/.env.example', 'OfficeWeb/public/assets/characters/ruler.glb', 'OfficeWeb/src/App.tsx', 'OfficeDesktop/main.cjs', 'Design/References/Approved_Natural_Office_Concept.png')) {
  if (Test-Path (Join-Path $target $p)) { Say "present  $p" } else { Say "MISSING  $p" }
}

Push-Location "$target\OfficeWeb"
Say "npm install start"
npm install --no-audit --no-fund 2>&1 | ForEach-Object { Say "  $_" }
Say "npm install exit=$LASTEXITCODE"

Say "npm run build start"
npm run build 2>&1 | ForEach-Object { Say "  $_" }
Say "npm run build exit=$LASTEXITCODE"

Say "npm test start"
npm test 2>&1 | Select-Object -Last 45 | ForEach-Object { Say "  $_" }
Say "npm test exit=$LASTEXITCODE"
Pop-Location

Say "DONE"
