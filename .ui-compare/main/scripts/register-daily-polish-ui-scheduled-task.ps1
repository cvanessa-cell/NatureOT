param(
  [string]$TaskName = "NatureOT-Daily-Polish-UI",
  [string]$Time = "06:00",
  [switch]$Unregister
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$runScript = Join-Path $repoRoot "scripts\run-daily-polish-ui-automation.ps1"

if ($Unregister) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "Unregistered scheduled task: $TaskName"
  exit 0
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runScript`"" `
  -WorkingDirectory $repoRoot

$trigger = New-ScheduledTaskTrigger -Daily -At $Time

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 3)

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Daily Nature OT UI + Functionality Polish (6:00 AM local; set Windows timezone to Pacific)" `
  -RunLevel Limited | Out-Null

Write-Host "Registered scheduled task: $TaskName"
Write-Host "  Runs daily at: $Time (local system clock)"
Write-Host "  Script: $runScript"
Write-Host ""
Write-Host "Verify: Get-ScheduledTask -TaskName $TaskName | Format-List"
Write-Host "Test now: powershell -NoProfile -ExecutionPolicy Bypass -File `"$runScript`" -DryRun"
Write-Host "Unregister: .\scripts\register-daily-polish-ui-scheduled-task.ps1 -Unregister"
