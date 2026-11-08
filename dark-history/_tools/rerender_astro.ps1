# Re-render only the listed frame ranges of "The Royal Astrologer" into one folder (e.g. after a fix): frames inside the
# heavy transitions go through the slow page, the rest through the normal one, at most 380 frames per Chrome session.
param([string]$Out, [string]$Ranges)
$ErrorActionPreference = 'Stop'
$slow = @(@(465, 501), @(693, 735), @(783, 825), @(1017, 1059), @(1251, 1287), @(1362, 1404), @(2433, 2481), @(2639, 2675))
$all = foreach ($r in ($Ranges -split ',')) { $ab = $r -split '-'; $a = [int]$ab[0]; $b = if ($ab.Count -gt 1) { [int]$ab[1] } else { $a }; $a..$b }
$all = @($all | Sort-Object -Unique)
$isSlow = { param($n) foreach ($s in $slow) { if ($n -ge $s[0] -and $n -le $s[1]) { return $true } }; $false }
$fast = @($all | Where-Object { -not (& $isSlow $_) }); $slowF = @($all | Where-Object { & $isSlow $_ })
"re-rendering $($all.Count) frames ($($fast.Count) normal, $($slowF.Count) slow) into $Out"
function Run($page, $frames) {
  for ($i = 0; $i -lt $frames.Count; $i += 380) {
    $part = $frames[$i..([Math]::Min($frames.Count, $i + 380) - 1)]
    for ($try = 0; $try -lt 3; $try++) {
      try { & "$PSScriptRoot\cdp.ps1" -Page $page -List ($part -join ',') -OutDir $Out -Port 9362 -Gpu | Select-Object -Last 1; break }
      catch { "retry $($part[0])-$($part[-1]) ($try): $($_.Exception.Message)" }
    }
  }
}
if ($fast.Count) { Run '_render\video\main13.html' $fast }
if ($slowF.Count) { Run '_render\video\main13slow.html' $slowF }
"done"
