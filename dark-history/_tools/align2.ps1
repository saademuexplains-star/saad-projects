param([string]$Wav, [string]$ScriptFile, [string]$OutFile)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$OutPath = $OutFile
. "$PSScriptRoot\audiotool.ps1" -Mode none -In $Wav -Out 'x' | Out-Null
$w = [AudioTool]::Read($Wav)
# 16 kHz mono
$step = $w.Rate / 16000.0; $nFr = [int]($w.S.Length / $w.Ch)
$mono = New-Object 'System.Collections.Generic.List[int16]'
for ($t = 0.0; $t -lt $nFr - 1; $t += $step) { $i = [int]$t * $w.Ch; $v = 0; for ($c = 0; $c -lt $w.Ch; $c++) { $v += $w.S[$i + $c] }; $mono.Add([int16]($v / $w.Ch)) }
$S = $mono.ToArray(); $total = $S.Length / 16000.0
$m = New-Object Wav; $m.Rate = 16000; $m.Ch = 1; $m.Bits = 16; $m.S = $S
$env = [AudioTool]::Env($m)
$sil = [AudioTool]::Silences($env, -38, 0.07)
# phrase chunks between silences
$cuts = @(0.0); foreach ($sl in $sil) { $mid = ($sl[0] + $sl[1]) / 2; if ($mid -gt 0.2 -and $mid -lt $total - 0.2) { $cuts += $mid } }; $cuts += $total
$dir = Join-Path (Split-Path $Wav) 'chunks'; New-Item -ItemType Directory -Force $dir | Out-Null
$rec = New-Object System.Collections.Generic.List[object]; $chunks = @()
for ($k = 0; $k -lt $cuts.Count - 1; $k++) {
  $a = $cuts[$k]; $b = $cuts[$k + 1]; if ($b - $a -lt 0.15) { continue }
  $i0 = [int]($a * 16000); $i1 = [math]::Min($S.Length, [int]($b * 16000))
  $pad = 3200; $arr = New-Object 'int16[]' ($i1 - $i0 + 2 * $pad); [Array]::Copy($S, $i0, $arr, $pad, $i1 - $i0)
  $cw = New-Object Wav; $cw.Rate = 16000; $cw.Ch = 1; $cw.Bits = 16; $cw.S = $arr
  $f = Join-Path $dir ("c{0:000}.wav" -f $k); [AudioTool]::Write($f, $cw)
  $eng = New-Object System.Speech.Recognition.SpeechRecognitionEngine ([System.Globalization.CultureInfo]'en-US')
  $eng.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar)); $eng.SetInputToWaveFile($f)
  $eng.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(400); $eng.BabbleTimeout = [TimeSpan]::FromSeconds(5); $eng.InitialSilenceTimeout = [TimeSpan]::FromSeconds(2)
  $res = @(); for ($g = 0; $g -lt 6; $g++) { try { $r = $eng.Recognize() } catch { break }; if ($r -eq $null) { break }; $res += $r }
  $eng.Dispose()
  $texts = @()
  $nRes = $res.Count; $ri = 0
  foreach ($r in $res) {
    for ($q = 0; $q -lt $r.Words.Count; $q++) {
      $au = $r.GetAudioForWordRange($r.Words[$q], $r.Words[$q])
      if ($nRes -eq 1) { $s0 = $a + $au.AudioPosition.TotalSeconds - 0.2; $e0 = $s0 + $au.Duration.TotalSeconds }
      else { $span = ($b - $a) / $nRes; $s0 = $a + $ri * $span + ($q / [math]::Max(1, $r.Words.Count)) * $span; $e0 = $s0 + $span / [math]::Max(1, $r.Words.Count) }
      $rec.Add([pscustomobject]@{ w = ($r.Words[$q].Text.ToLower() -replace "[^a-z']", ''); s = [math]::Max($a, $s0); e = [math]::Min($b, $e0) })
    }
    $texts += $r.Text; $ri++
  }
  $chunks += ("{0,6:0.00}-{1,6:0.00} [{2}] {3}" -f $a, $b, $nRes, ($texts -join ' / '))
}
# align to script words
$txt = Get-Content $ScriptFile -Raw -Encoding UTF8
$sw = @([regex]::Matches($txt, "[A-Za-z']+|[,.—\-]+") | ForEach-Object { $_.Value })
$words = @(); $punctAfter = @{}
foreach ($tok in $sw) { if ($tok -match "^[A-Za-z']+$") { $words += $tok.ToLower() } elseif ($words.Count -gt 0) { $punctAfter[$words.Count - 1] = $tok } }
$n = $words.Count; $mm = $rec.Count
$D = New-Object 'double[,]' ($n + 1), ($mm + 1); $B = New-Object 'int[,]' ($n + 1), ($mm + 1)
for ($i = 0; $i -le $n; $i++) { $D[$i, 0] = $i; $B[$i, 0] = 1 }; for ($j = 0; $j -le $mm; $j++) { $D[0, $j] = $j; $B[0, $j] = 2 }
function sim($x, $y) { if ($x -eq $y) { return 0 } if ($x.Length -ge 3 -and $y.Length -ge 3 -and ($x.StartsWith($y.Substring(0, 3)) -or $y.StartsWith($x.Substring(0, 3)))) { return 0.4 } return 1 }
for ($i = 1; $i -le $n; $i++) { for ($j = 1; $j -le $mm; $j++) {
  $c0 = $D[($i - 1), ($j - 1)] + (sim $words[$i - 1] $rec[$j - 1].w); $c1 = $D[($i - 1), $j] + 1; $c2 = $D[$i, ($j - 1)] + 1
  if ($c0 -le $c1 -and $c0 -le $c2) { $D[$i, $j] = $c0; $B[$i, $j] = 0 } elseif ($c1 -le $c2) { $D[$i, $j] = $c1; $B[$i, $j] = 1 } else { $D[$i, $j] = $c2; $B[$i, $j] = 2 } } }
$st = New-Object 'double[]' $n; $en = New-Object 'double[]' $n; for ($i = 0; $i -lt $n; $i++) { $st[$i] = -1; $en[$i] = -1 }
$i = $n; $j = $mm
while ($i -gt 0 -and $j -gt 0) { $bb = $B[$i, $j]; if ($bb -eq 0) { $st[$i - 1] = $rec[$j - 1].s; $en[$i - 1] = $rec[$j - 1].e; $i--; $j-- } elseif ($bb -eq 1) { $i-- } else { $j-- } }
for ($i = 0; $i -lt $n; $i++) { if ($st[$i] -lt 0) {
  $p = $i - 1; while ($p -ge 0 -and $st[$p] -lt 0) { $p-- }; $q = $i + 1; while ($q -lt $n -and $st[$q] -lt 0) { $q++ }
  $t0 = if ($p -ge 0) { $en[$p] } else { 0 }; $t1 = if ($q -lt $n) { $st[$q] } else { $total }
  $span = $q - $p - 1; $kk = $i - $p; $st[$i] = $t0 + ($t1 - $t0) * ($kk - 1) / $span; $en[$i] = $t0 + ($t1 - $t0) * $kk / $span } }
$lines = @("# total $([math]::Round($total,3))s; chunks:") + ($chunks | ForEach-Object { "# $_" })
for ($i = 0; $i -lt $n; $i++) { $lines += "{0} {1:0.000} {2:0.000} {3}" -f $words[$i], $st[$i], $en[$i], $punctAfter[$i] }
$lines | Set-Content $OutPath -Encoding utf8
"aligned $n words ($mm recognised) -> $OutPath"
