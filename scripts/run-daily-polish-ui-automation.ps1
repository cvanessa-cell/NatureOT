param(
  [switch]$DryRun,
  [string]$BaseBranch = "main",
  [string]$Remote = "origin",
  [string]$BranchPrefix = "automation/polish-ui",
  [switch]$KeepWorktree
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

function Add-ReportLine {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [string]$Value = ""
  )

  Add-Content -Path $Path -Value $Value
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Cwd,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
  )

  $output = & git -C $Cwd @Args 2>&1
  $exitCode = $LASTEXITCODE
  foreach ($line in $output) {
    Write-Log ([string]$line)
  }
  if ($exitCode -ne 0) {
    throw "git $($Args -join ' ') failed with exit code $exitCode"
  }
  return @($output)
}

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Cwd,
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [string[]]$Arguments = @()
  )

  Write-Log "Running $Label`: $Command $($Arguments -join ' ')"
  Push-Location $Cwd
  try {
    $output = & $Command @Arguments 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    Pop-Location
  }
  foreach ($line in $output) {
    Write-Log ([string]$line)
  }
  if ($exitCode -ne 0) {
    throw "$Label failed with exit code $exitCode"
  }
}

function Invoke-FallbackCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Cwd,
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [string[]]$Arguments = @()
  )

  Write-Log "Fallback check: $Label"
  Push-Location $Cwd
  try {
    $output = & $Command @Arguments 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    Pop-Location
  }

  [pscustomobject]@{
    label = $Label
    command = ((@($Command) + $Arguments) -join " ")
    exitCode = $exitCode
    output = @($output)
  }
}

function Get-MeaningfulStatus {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Cwd
  )

  $status = @(& git -C $Cwd status --porcelain 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw ($status -join [Environment]::NewLine)
  }

  return @(
    $status | Where-Object {
      $line = [string]$_
      $path = $line.Substring([Math]::Min(3, $line.Length)).Trim()
      $path -and
        -not $path.StartsWith(".cursor-sdk-state/") -and
        -not $path.StartsWith(".cursor-sdk-state\") -and
        -not $path.StartsWith("automations/daily-nature-ot-ui-functionality-polish/logs/") -and
        -not $path.StartsWith("automations\daily-nature-ot-ui-functionality-polish\logs\")
    }
  )
}

function Assert-BaseWorktreeReady {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RepoRoot
  )

  $current = (& git -C $RepoRoot branch --show-current 2>&1 | Select-Object -First 1).Trim()
  if ($LASTEXITCODE -ne 0) {
    throw "Could not determine current branch in $RepoRoot"
  }
  if ($current -ne $BaseBranch) {
    throw "Base checkout must be on $BaseBranch before publish; current branch is $current"
  }

  $dirty = @(Get-MeaningfulStatus -Cwd $RepoRoot)
  if ($dirty.Count -gt 0) {
    throw "Base checkout has uncommitted user changes. Preserve them, then rerun automation. Dirty paths: $($dirty -join '; ')"
  }
}

function New-ReviewWorktree {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RepoRoot
  )

  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $branchName = "$BranchPrefix-$stamp"
  $parent = Split-Path $RepoRoot -Parent
  $worktreeParent = Join-Path $parent "texas-nature-ot-leads--automation-polish-ui-run"
  $worktreePath = Join-Path $worktreeParent $stamp

  New-Item -ItemType Directory -Force -Path $worktreeParent | Out-Null
  Write-Log "Creating review worktree $worktreePath on $branchName"
  Invoke-Git -Cwd $RepoRoot fetch $Remote $BaseBranch | Out-Null
  Invoke-Git -Cwd $RepoRoot worktree add -b $branchName $worktreePath $BaseBranch | Out-Null

  [pscustomobject]@{
    Branch = $branchName
    Path = [System.IO.Path]::GetFullPath($worktreePath)
  }
}

function Ensure-Dependencies {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath
  )

  $nextPath = Join-Path $WorktreePath "node_modules\next"
  if (Test-Path -LiteralPath $nextPath) {
    return
  }
  Invoke-CheckedCommand -Cwd $WorktreePath -Label "dependency install" -Command "npm.cmd" -Arguments @("ci")
}

function Invoke-DebugTests {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath
  )

  Ensure-Dependencies -WorktreePath $WorktreePath
  Invoke-CheckedCommand -Cwd $WorktreePath -Label "lint" -Command "npm.cmd" -Arguments @("run", "lint")
  Invoke-CheckedCommand -Cwd $WorktreePath -Label "test" -Command "npm.cmd" -Arguments @("test")
  Invoke-CheckedCommand -Cwd $WorktreePath -Label "build" -Command "npm.cmd" -Arguments @("run", "build")
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

  Write-Log "CURSOR_API_KEY is not set or SDK failed. Running local fallback inspection instead of editing files."
  Write-Log "Fallback report: $reportPath"

  $branch = (& git -C $WorktreePath branch --show-current 2>&1 | Select-Object -First 1)
  $checks = @()
  $checks += Invoke-FallbackCommand -Cwd $WorktreePath -Label "Git working tree status" -Command "git" -Arguments @("status", "--short")
  $checks += Invoke-FallbackCommand -Cwd $WorktreePath -Label "Package script inventory" -Command "npm.cmd" -Arguments @("pkg", "get", "scripts")

  $checks += [pscustomobject]@{
    label = "ESLint"
    command = "npm.cmd run lint"
    exitCode = $null
    output = @("Skipped in fallback inspection mode because no code edit was made.")
  }
  Write-Log "Fallback check: ESLint skipped because no code edit was made"

  $targetRows = foreach ($relativePath in $targetPaths) {
    $fullPath = Join-Path $WorktreePath $relativePath
    if (Test-Path -LiteralPath $fullPath) {
      $item = Get-Item -LiteralPath $fullPath
      $matches = @(& rg -n "TODO|FIXME|Coming soon|placeholder|aria-|button|href=|form|input|Contact|Schedule|Referral|Waitlist" $fullPath 2>$null | Select-Object -First 8)
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

  Add-ReportLine -Path $reportPath -Value "# Daily Nature OT UI Polish Fallback Report"
  Add-ReportLine -Path $reportPath
  Add-ReportLine -Path $reportPath -Value "- Run time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  Add-ReportLine -Path $reportPath -Value "- Reason: headless Cursor agent was unavailable or did not complete successfully."
  Add-ReportLine -Path $reportPath -Value "- Safety mode: no files were intentionally edited; this fallback only ran checks and inspected UI targets."
  Add-ReportLine -Path $reportPath -Value "- Repo root: $RepoRoot"
  Add-ReportLine -Path $reportPath -Value "- Review worktree: $WorktreePath"
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
  Add-ReportLine -Path $reportPath -Value "## Auth Recovery"
  Add-ReportLine -Path $reportPath -Value "Create an API key at https://cursor.com/settings, add CURSOR_API_KEY=... to .env.local in the repo root, then run npm run automation:polish-ui:run."
}

function Invoke-AgentOrFallback {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath,
    [Parameter(Mandatory = $true)]
    [string]$RepoRoot,
    [Parameter(Mandatory = $true)]
    [string]$PromptPath,
    [Parameter(Mandatory = $true)]
    [string]$RunnerScript,
    [Parameter(Mandatory = $true)]
    [string]$LogDir
  )

  $apiKey = $env:CURSOR_API_KEY
  if (-not $apiKey) {
    $envFile = Join-Path $RepoRoot ".env.local"
    if (Test-Path $envFile) {
      foreach ($line in Get-Content $envFile) {
        if ($line -match '^\s*CURSOR_API_KEY\s*=\s*(.+)\s*$') {
          $apiKey = $Matches[1].Trim().Trim('"').Trim("'")
          break
        }
      }
    }
  }

  if (-not $apiKey) {
    Invoke-NoAuthFallback -WorktreePath $WorktreePath -RepoRoot $RepoRoot -LogDir $LogDir
    return
  }

  Write-Log "CURSOR_API_KEY found; starting SDK agent in review worktree"
  $env:CURSOR_API_KEY = $apiKey
  $runnerOutputPath = Join-Path $LogDir ("{0}-sdk-runner.stdout.log" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))
  $runnerErrorPath = Join-Path $LogDir ("{0}-sdk-runner.stderr.log" -f (Get-Date -Format "yyyy-MM-dd_HHmmss"))
  $runnerProcess = Start-Process -FilePath "node" `
    -ArgumentList @($RunnerScript, "--prompt-file", $PromptPath) `
    -WorkingDirectory $WorktreePath `
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

  if ($runnerProcess.ExitCode -ne 0) {
    Write-Log "SDK runner exited with code $($runnerProcess.ExitCode); switching to local fallback inspection"
    Invoke-NoAuthFallback -WorktreePath $WorktreePath -RepoRoot $RepoRoot -LogDir $LogDir
  }
}

function Commit-ReviewChanges {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath
  )

  $dirty = @(Get-MeaningfulStatus -Cwd $WorktreePath)
  if ($dirty.Count -eq 0) {
    Write-Log "No changed UI artifacts to commit."
    return $false
  }

  Invoke-Git -Cwd $WorktreePath add -A | Out-Null
  & git -C $WorktreePath reset -q -- ".cursor-sdk-state" "automations/daily-nature-ot-ui-functionality-polish/logs" 2>$null
  Invoke-Git -Cwd $WorktreePath commit -m "Run daily Nature OT UI polish automation" | Out-Null
  return $true
}

function Publish-ReviewBranch {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RepoRoot,
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath,
    [Parameter(Mandatory = $true)]
    [string]$BranchName
  )

  Assert-BaseWorktreeReady -RepoRoot $RepoRoot
  Invoke-Git -Cwd $RepoRoot pull --ff-only $Remote $BaseBranch | Out-Null
  Invoke-Git -Cwd $RepoRoot merge --no-ff $BranchName -m "Merge $BranchName" | Out-Null
  Invoke-DebugTests -WorktreePath $RepoRoot
  Invoke-Git -Cwd $RepoRoot push $Remote $BaseBranch | Out-Null

  if (-not $KeepWorktree) {
    Invoke-Git -Cwd $RepoRoot worktree remove $WorktreePath | Out-Null
    Invoke-Git -Cwd $RepoRoot branch -d $BranchName | Out-Null
  } else {
    Write-Log "Keeping review worktree and branch because -KeepWorktree was supplied."
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
Write-Log "Publish target: $Remote/$BaseBranch"

if ($DryRun) {
  Write-Log "Dry run complete. Automation would create a review worktree, run the agent/fallback, verify, commit, merge to $BaseBranch, push, and delete the review branch."
  exit 0
}

$review = $null
try {
  $review = New-ReviewWorktree -RepoRoot $repoRoot
  Write-Log "Review branch: $($review.Branch)"
  Write-Log "Review worktree: $($review.Path)"

  Invoke-AgentOrFallback -WorktreePath $review.Path -RepoRoot $repoRoot -PromptPath $promptPath -RunnerScript $runnerScript -LogDir $logDir
  $pendingChanges = @(Get-MeaningfulStatus -Cwd $review.Path)
  if ($pendingChanges.Count -eq 0) {
    Write-Log "No review changes were produced; removing empty review branch/worktree."
    if (-not $KeepWorktree) {
      Invoke-Git -Cwd $repoRoot worktree remove $review.Path | Out-Null
      Invoke-Git -Cwd $repoRoot branch -D $review.Branch | Out-Null
    }
    exit 0
  }

  Invoke-DebugTests -WorktreePath $review.Path
  $committed = Commit-ReviewChanges -WorktreePath $review.Path
  Invoke-DebugTests -WorktreePath $review.Path

  if (-not $committed) {
    Write-Log "No review changes were committed; removing empty review branch/worktree."
    if (-not $KeepWorktree) {
      Invoke-Git -Cwd $repoRoot worktree remove $review.Path | Out-Null
      Invoke-Git -Cwd $repoRoot branch -D $review.Branch | Out-Null
    }
    exit 0
  }

  Publish-ReviewBranch -RepoRoot $repoRoot -WorktreePath $review.Path -BranchName $review.Branch
  Write-Log "Daily Nature OT UI polish run completed and pushed to $Remote/$BaseBranch"
  exit 0
} catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  if ($review) {
    Write-Log "Review branch preserved for debugging: $($review.Branch)"
    Write-Log "Review worktree preserved for debugging: $($review.Path)"
  }
  exit 1
}
