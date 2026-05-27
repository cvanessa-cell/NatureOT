param(
  [string]$BranchName = "automation/polish-ui",
  [string]$BaseBranch = "main",
  [string]$WorktreePath = ""
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

function Invoke-Git {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
  )

  $output = & git @Args 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw ($output -join [Environment]::NewLine)
  }
  return $output
}

$repoRoot = (Invoke-Git rev-parse --show-toplevel | Select-Object -First 1).Trim()
$repoName = Split-Path $repoRoot -Leaf

if (-not $WorktreePath) {
  $parentDir = Split-Path $repoRoot -Parent
  $WorktreePath = Join-Path $parentDir "$repoName--polish-ui"
}

$worktreeList = Invoke-Git worktree list --porcelain
$existingPath = $null
for ($i = 0; $i -lt $worktreeList.Count; $i++) {
  if ($worktreeList[$i] -match "^worktree\s+(.+)$") {
    $candidate = $Matches[1].Trim()
    if ([System.IO.Path]::GetFullPath($candidate) -eq [System.IO.Path]::GetFullPath($WorktreePath)) {
      $existingPath = $candidate
      break
    }
  }
}

if ($existingPath) {
  [pscustomobject]@{
    mode = "worktree"
    action = "reused"
    repoRoot = $repoRoot
    worktreePath = [System.IO.Path]::GetFullPath($existingPath)
    branch = $BranchName
    promptPath = (Join-Path $repoRoot "automations/daily-nature-ot-ui-functionality-polish/PROMPT.md")
  } | ConvertTo-Json -Depth 4
  exit 0
}

try {
  $branchExists = $true
  & git show-ref --verify --quiet "refs/heads/$BranchName"
  if ($LASTEXITCODE -ne 0) {
    $branchExists = $false
  }

  if ($branchExists) {
    Invoke-Git worktree add $WorktreePath $BranchName | Out-Null
  } else {
    Invoke-Git worktree add -b $BranchName $WorktreePath $BaseBranch | Out-Null
  }

  [pscustomobject]@{
    mode = "worktree"
    action = "created"
    repoRoot = $repoRoot
    worktreePath = [System.IO.Path]::GetFullPath($WorktreePath)
    branch = $BranchName
    promptPath = (Join-Path $repoRoot "automations/daily-nature-ot-ui-functionality-polish/PROMPT.md")
  } | ConvertTo-Json -Depth 4
} catch {
  [pscustomobject]@{
    mode = "active-workdir-fallback"
    action = "worktree-unavailable"
    repoRoot = $repoRoot
    worktreePath = $repoRoot
    branch = (Invoke-Git branch --show-current | Select-Object -First 1).Trim()
    promptPath = (Join-Path $repoRoot "automations/daily-nature-ot-ui-functionality-polish/PROMPT.md")
    warning = $_.Exception.Message
  } | ConvertTo-Json -Depth 4
}
