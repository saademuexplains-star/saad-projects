# Render frame ranges of "The Royal Fool" ("a-b,c-d") into one folder with render_fool.ps1, surviving Chrome dropping the
# DevTools socket and the machine sleeping. Each attempt runs in its own process; a watchdog kills it (and its Chrome)
# when no new frame has been written for -StallSec seconds, then resumes from the first frame not yet written. A frame
# counts as done once it is written after this script started, so old frames in a range are always replaced. While it
# runs it asks Windows to keep the system awake (released when the script ends).
param([string]$Out, [string]$Ranges, [int]$Tries = 40, [int]$StallSec = 90, [int]$Port = 9362)
$t0 = Get-Date
$ps = (Get-Command powershell).Source
if (-not ('KA2.P' -as [type])) { Add-Type -Namespace KA2 -Name P -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);' }
$awake = { [KA2.P]::SetThreadExecutionState([uint32]2147483649) | Out-Null }
$killChrome = { Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like "*cdp_prof_$Port*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }
$nextFrom = { param($a, $b) $n = $a; while ($n -le $b) { $p = Join-Path $Out ('f{0:D5}.jpg' -f $n); if ((Test-Path $p) -and (Get-Item $p).LastWriteTime -ge $t0) { $n++ } else { break } }; $n }
try {
  foreach ($rg in $Ranges.Split(',')) {
    $ab = $rg.Split('-'); $a = [int]$ab[0]; $b = [int]$ab[1]
    for ($try = 1; $try -le $Tries; $try++) {
      & $awake
      $from = & $nextFrom $a $b
      if ($from -gt $b) { break }
      "attempt $try of $a-$b from $from at $(Get-Date -Format HH:mm:ss)"
      & $killChrome
      $proc = Start-Process -FilePath $ps -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "$PSScriptRoot\render_fool.ps1", '-Out', $Out, '-From', $from, '-To', $b) -PassThru -WindowStyle Hidden
      $last = $from; $lastT = Get-Date
      while (-not $proc.HasExited) {
        Start-Sleep -Seconds 10; & $awake
        $now = & $nextFrom $last $b
        if ($now -gt $last) { if ([int]($now / 100) -gt [int]($last / 100)) { "frame $now at $(Get-Date -Format HH:mm:ss)" }; $last = $now; $lastT = Get-Date }
        elseif (((Get-Date) - $lastT).TotalSeconds -gt $StallSec) { "stalled at $last for $StallSec s: restarting"; Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; break }
      }
      & $killChrome; Start-Sleep -Seconds 2
    }
  }
  "ranges done: $Ranges"
} finally { [KA2.P]::SetThreadExecutionState([uint32]2147483648) | Out-Null }
