param(
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

function Write-Log([string]$Message) {
  $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
  Write-Host $line
  if ($script:LogFile) {
    Add-Content -Path $script:LogFile -Value $line
  }
}

$repoRoot = Split-Path $PSScriptRoot -Parent
$prepScript = Join-Path $repoRoot "scripts\prepare-polish-ui-worktree.ps1"
$promptPath = Join-Path $repoRoot "automations\daily-nature-ot-ui-functionality-polish\PROMPT.md"
$logDir = Join-Path $repoRoot "automations\daily-nature-ot-ui-functionality-polish\logs"
$runnerScript = Join-Path $repoRoot "scripts\run-daily-polish-ui-automation.mjs"

if (-not (Test-Path $promptPath)) {
  throw "Missing prompt file: $promptPath"
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$script:LogFile = Join-Path $logDir ("{0}.log" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))

Write-Log "Daily Nature OT UI polish run starting"
Write-Log "Repo root: $repoRoot"

$prepJson = & $prepScript | Select-Object -Last 1
$prep = $prepJson | ConvertFrom-Json
$worktreePath = $prep.worktreePath
$mode = $prep.mode
$action = $prep.action

Write-Log "Worktree: $worktreePath ($mode / $action)"

if ($DryRun) {
  Write-Log "Dry run complete (worktree ready, agent not started)"
  exit 0
}

$apiKey = $env:CURSOR_API_KEY
if (-not $apiKey) {
  $envFile = Join-Path $repoRoot ".env.local"
  if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
      if ($line -match '^\s*CURSOR_API_KEY\s*=\s*(.+)\s*$') {
        $apiKey = $Matches[1].Trim().Trim('"').Trim("'")
        break
      }
    }
  }
}

if ($apiKey) {
  Write-Log "CURSOR_API_KEY found; starting SDK agent in worktree"
  $env:CURSOR_API_KEY = $apiKey
  Push-Location $worktreePath
  try {
    & node $runnerScript --prompt-file $promptPath 2>&1 | ForEach-Object { Write-Log $_ }
    if ($LASTEXITCODE -ne 0) {
      throw "SDK runner exited with code $LASTEXITCODE"
    }
    Write-Log "SDK agent run finished"
    exit 0
  } finally {
    Pop-Location
  }
}

Write-Log @"
CURSOR_API_KEY is not set. Headless agent run skipped.

To enable scheduled runs from this machine:
  1. Create an API key at https://cursor.com/settings
  2. Add CURSOR_API_KEY=... to .env.local (repo root, not committed)
  3. Re-run: .\scripts\run-daily-polish-ui-automation.ps1

Or register this automation in Cursor (Automations UI) using:
  automations/daily-nature-ot-ui-functionality-polish/automation.manifest.json
"@

exit 2
