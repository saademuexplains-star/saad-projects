# Per-second RMS (dB) of several wav files side by side.
param([string[]]$Files, [double]$Step = 1.0)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none
$data = @(); foreach ($fl in $Files) { $data += ,([AudioTool]::Read((Resolve-Path $fl).Path)) }
"time  " + (($Files | ForEach-Object { "{0,10}" -f ([IO.Path]::GetFileNameWithoutExtension($_) -replace '^worm_', '').Substring(0, [math]::Min(10, ([IO.Path]::GetFileNameWithoutExtension($_) -replace '^worm_', '').Length)) }) -join '')
$len = ($data | ForEach-Object { $_.S.Length / $_.Ch / $_.Rate } | Measure-Object -Maximum).Maximum
for ($t = 0; $t -lt $len; $t += $Step) {
  $row = "{0,5:0.0}" -f $t
  foreach ($w in $data) {
    $arr = $w.S; $a = [int]($t * $w.Rate) * $w.Ch; $b = [math]::Min($arr.Length, [int](($t + $Step) * $w.Rate) * $w.Ch); $acc = 0.0; $n = 0
    for ($i = $a; $i -lt $b; $i += 4) { $v = $arr[$i] / 32768.0; $acc += $v * $v; $n++ }
    $row += " {0,9:0.0}" -f (20 * [math]::Log10([math]::Sqrt($acc / [math]::Max(1, $n)) + 1e-9))
  }
  $row
}
