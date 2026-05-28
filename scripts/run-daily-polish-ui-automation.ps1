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

function Invoke-FallbackCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [string[]]$Arguments = @()
  )

  Write-Log "Fallback check: $Label"
  $output = & $Command @Arguments 2>&1
  $exitCode = $LASTEXITCODE

  [pscustomobject]@{
    label = $Label
    command = ((@($Command) + $Arguments) -join " ")
    exitCode = $exitCode
    output = @($output)
  }
}

function Add-ReportLine {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [string]$Value = ""
  )

  Add-Content -Path $Path -Value $Value
}

function Invoke-NoAuthFallback {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath,
    [Parameter(Mandatory = $true)]
    [string]$RepoRoot,
    [Parameter(Mandatory = $true)]
    [string]$LogDir
  )

  $reportPath = Join-Path $LogDir ("{0}-fallback-report.md" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))
  $targetPaths = @(
    "src/app/page.tsx",
    "src/components/marketing/hero-section.tsx",
    "src/components/marketing/sticky-cta-bar.tsx",
    "src/components/services/service-card.tsx",
    "src/components/services/checkout-form.tsx",
    "src/components/site-header.tsx",
    "src/components/site-footer.tsx",
    "src/app/provider-referral/page.tsx",
    "src/app/checkout/[service]/page.tsx",
    "src/app/faq/page.tsx"
  )

  Write-Log "CURSOR_API_KEY is not set. Running local fallback inspection instead of starting the headless agent."
  Write-Log "Fallback report: $reportPath"

  Push-Location $WorktreePath
  try {
    $branch = (& git branch --show-current 2>&1 | Select-Object -First 1)
    $checks = @()
    $checks += Invoke-FallbackCommand -Label "Git working tree status" -Command "git" -Arguments @("status", "--short")
    $checks += Invoke-FallbackCommand -Label "Package script inventory" -Command "npm.cmd" -Arguments @("pkg", "get", "scripts")

    $checks += [pscustomobject]@{
      label = "ESLint"
      command = "npm.cmd run lint"
      exitCode = $null
      output = @("Skipped in automated fallback mode to avoid a long-running full-repo lint. Run npm.cmd run lint manually during human follow-up.")
    }
    Write-Log "Fallback check: ESLint skipped in automated fallback mode"

    $targetRows = foreach ($relativePath in $targetPaths) {
      $fullPath = Join-Path $WorktreePath $relativePath
      if (Test-Path -LiteralPath $fullPath) {
        $item = Get-Item -LiteralPath $fullPath
        $matches = @(& rg -n "TODO|FIXME|Coming soon|placeholder|aria-|button|href=|form|input|Contact|Schedule|Referral|Waitlist" $relativePath 2>$null | Select-Object -First 8)
        [pscustomobject]@{
          path = $relativePath
          exists = $true
          size = $item.Length
          modified = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
          signals = $matches
        }
      } else {
        [pscustomobject]@{
          path = $relativePath
          exists = $false
          size = $null
          modified = $null
          signals = @()
        }
      }
    }

    $candidate = $targetRows |
      Where-Object { $_.exists -and $_.signals.Count -gt 0 } |
      Select-Object -First 1
    if (-not $candidate) {
      $candidate = $targetRows | Where-Object { $_.exists } | Select-Object -First 1
    }

    Add-ReportLine -Path $reportPath -Value "# Daily Nature OT UI Polish Fallback Report"
    Add-ReportLine -Path $reportPath
    Add-ReportLine -Path $reportPath -Value "- Run time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Add-ReportLine -Path $reportPath -Value "- Reason: CURSOR_API_KEY was not available, so the headless Cursor agent was not started."
    Add-ReportLine -Path $reportPath -Value "- Safety mode: no files were intentionally edited; this fallback only ran checks and inspected UI targets."
    Add-ReportLine -Path $reportPath -Value "- Repo root: $RepoRoot"
    Add-ReportLine -Path $reportPath -Value "- Active working directory: $WorktreePath"
    Add-ReportLine -Path $reportPath -Value "- Branch: $branch"
    Add-ReportLine -Path $reportPath

    Add-ReportLine -Path $reportPath -Value "## Lightweight Checks"
    foreach ($check in $checks) {
      $exitText = if ($null -eq $check.exitCode) { "skipped" } else { $check.exitCode }
      Add-ReportLine -Path $reportPath -Value "### $($check.label)"
      Add-ReportLine -Path $reportPath -Value "- Command: $($check.command)"
      Add-ReportLine -Path $reportPath -Value "- Exit code: $exitText"
      Add-ReportLine -Path $reportPath -Value '```text'
      if ($check.output.Count -gt 0) {
        foreach ($line in ($check.output | Select-Object -First 80)) {
          Add-ReportLine -Path $reportPath -Value ([string]$line)
        }
        if ($check.output.Count -gt 80) {
          Add-ReportLine -Path $reportPath -Value "... output truncated in fallback report ..."
        }
      } else {
        Add-ReportLine -Path $reportPath -Value "(no output)"
      }
      Add-ReportLine -Path $reportPath -Value '```'
      Add-ReportLine -Path $reportPath
    }

    Add-ReportLine -Path $reportPath -Value "## Likely UI Targets Inspected"
    foreach ($target in $targetRows) {
      if ($target.exists) {
        Add-ReportLine -Path $reportPath -Value "- $($target.path) exists ($($target.size) bytes, modified $($target.modified))"
        foreach ($signal in $target.signals) {
          Add-ReportLine -Path $reportPath -Value "  - $signal"
        }
      } else {
        Add-ReportLine -Path $reportPath -Value "- $($target.path) missing in this checkout"
      }
    }
    Add-ReportLine -Path $reportPath

    Add-ReportLine -Path $reportPath -Value "## Fallback Recommendation"
    if ($candidate) {
      Add-ReportLine -Path $reportPath -Value "Review $($candidate.path) first. It is present in the UI lane and contains the strongest quick-scan signals for CTA, form, accessibility, placeholder, or conversion copy work. Choose one small edit from that file, then run npm.cmd run lint and the narrowest relevant test/build command before committing."
    } else {
      Add-ReportLine -Path $reportPath -Value "No expected UI target files were found. Refresh the active checkout from main, confirm the app structure, then re-run the automation."
    }
    Add-ReportLine -Path $reportPath
    Add-ReportLine -Path $reportPath -Value "## Auth Recovery"
    Add-ReportLine -Path $reportPath -Value "Create an API key at https://cursor.com/settings, add CURSOR_API_KEY=... to .env.local in the repo root, then run npm run automation:polish-ui:run."

    Write-Log "Fallback inspection finished. Report written to $reportPath"
    $failedChecks = @($checks | Where-Object { $null -ne $_.exitCode -and $_.exitCode -ne 0 })
    if ($failedChecks.Count -gt 0) {
      Write-Log "Fallback completed with check failures. See report for details."
    } else {
      Write-Log "Fallback completed without check failures."
    }
  } finally {
    Pop-Location
  }
}

$repoRoot = Split-Path $PSScriptRoot -Parent
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

$worktreePath = $repoRoot
$mode = "active-working-directory"
$action = "direct-on-main"

Write-Log "Target path: $worktreePath ($mode / $action)"

if ($DryRun) {
  Write-Log "Dry run complete (target path ready, agent not started)"
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
  Write-Log "CURSOR_API_KEY found; starting SDK agent in the active working directory"
  $env:CURSOR_API_KEY = $apiKey
  Push-Location $worktreePath
  try {
    $runnerOutputPath = Join-Path $logDir ("{0}-sdk-runner.stdout.log" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))
    $runnerErrorPath = Join-Path $logDir ("{0}-sdk-runner.stderr.log" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))
    $runnerProcess = Start-Process -FilePath "node" `
      -ArgumentList @($runnerScript, "--prompt-file", $promptPath) `
      -WorkingDirectory $worktreePath `
      -NoNewWindow `
      -Wait `
      -PassThru `
      -RedirectStandardOutput $runnerOutputPath `
      -RedirectStandardError $runnerErrorPath

    foreach ($path in @($runnerOutputPath, $runnerErrorPath)) {
      if (Test-Path $path) {
        foreach ($line in Get-Content $path) {
          Write-Log $line
        }
      }
    }

    $runnerExitCode = $runnerProcess.ExitCode
    if ($runnerExitCode -eq 0) {
      Write-Log "SDK agent run finished"
      exit 0
    }

    Write-Log "SDK runner exited with code $runnerExitCode; switching to local fallback inspection"
  } finally {
    Pop-Location
  }

  Invoke-NoAuthFallback -WorktreePath $worktreePath -RepoRoot $repoRoot -LogDir $logDir
  exit 0
}

Invoke-NoAuthFallback -WorktreePath $worktreePath -RepoRoot $repoRoot -LogDir $logDir
exit 0
