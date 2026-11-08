param([string]$Wav, [string]$ScriptFile, [string]$Out)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$OutPath = $Out
# 16 kHz mono clean copy for the recogniser
. "$PSScriptRoot\audiotool.ps1" -Mode none -In $Wav -Out '' | Out-Null
$w = [AudioTool]::Read($Wav)
$mono = New-Object 'System.Collections.Generic.List[int16]'
$step = $w.Rate / 16000.0; $nFr = [int]($w.S.Length / $w.Ch)
for ($t = 0.0; $t -lt $nFr - 1; $t += $step) { $i = [int]$t * $w.Ch; $v = 0; for ($c = 0; $c -lt $w.Ch; $c++) { $v += $w.S[$i + $c] }; $mono.Add([int16]($v / $w.Ch)) }
$m = New-Object Wav; $m.Rate = 16000; $m.Ch = 1; $m.Bits = 16; $m.S = $mono.ToArray()
$tmp = [IO.Path]::ChangeExtension($Wav, '.16k.wav'); [AudioTool]::Write($tmp, $m)

$eng = New-Object System.Speech.Recognition.SpeechRecognitionEngine ([System.Globalization.CultureInfo]'en-US')
$eng.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
$eng.SetInputToWaveFile($tmp)
$eng.InitialSilenceTimeout = [TimeSpan]::FromSeconds(3); $eng.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(200); $eng.BabbleTimeout = [TimeSpan]::FromSeconds(3)
$rec = New-Object System.Collections.Generic.List[object]
$total = $m.S.Length / 16000.0; $guard = 0
while ($guard -lt 400) {
  $guard++
  $posBefore = $eng.RecognizerAudioPosition.TotalSeconds; try { $r = $eng.Recognize() } catch { break }
  if ($r -ne $null) {
    for ($k = 0; $k -lt $r.Words.Count; $k++) {
      $a = $r.GetAudioForWordRange($r.Words[$k], $r.Words[$k]); $ws = $posBefore + $a.AudioPosition.TotalSeconds; if ($k -eq 0) { Write-Host ("call started at {0:0.00}s, first word rel {1:0.00}, recog pos now {2:0.00}" -f $posBefore, $a.AudioPosition.TotalSeconds, $eng.RecognizerAudioPosition.TotalSeconds) }
      $rec.Add([pscustomobject]@{ w = ($r.Words[$k].Text.ToLower() -replace "[^a-z']", ''); s = $ws; e = $ws + $a.Duration.TotalSeconds })
    }
  } elseif ($eng.AudioPosition.TotalSeconds -ge $total - 0.3) { break }
}
$eng.Dispose()
# script words
$txt = Get-Content $ScriptFile -Raw -Encoding UTF8
$sw = @([regex]::Matches($txt, "[A-Za-z']+|[,.—\-]+") | ForEach-Object { $_.Value })
$words = @(); $punctAfter = @{}
foreach ($tok in $sw) { if ($tok -match "^[A-Za-z']+$") { $words += $tok.ToLower() } elseif ($words.Count -gt 0) { $punctAfter[$words.Count - 1] = $tok } }
# DP alignment (edit distance with fuzzy match)
$n = $words.Count; $mm = $rec.Count
$D = New-Object 'double[,]' ($n + 1), ($mm + 1); $B = New-Object 'int[,]' ($n + 1), ($mm + 1)
for ($i = 0; $i -le $n; $i++) { $D[$i, 0] = $i; $B[$i, 0] = 1 }
for ($j = 0; $j -le $mm; $j++) { $D[0, $j] = $j; $B[0, $j] = 2 }
function sim($a, $b) { if ($a -eq $b) { return 0 } if ($a.Length -ge 3 -and $b.Length -ge 3 -and ($a.StartsWith($b.Substring(0, 3)) -or $b.StartsWith($a.Substring(0, 3)))) { return 0.4 } return 1 }
for ($i = 1; $i -le $n; $i++) { for ($j = 1; $j -le $mm; $j++) {
  $c0 = $D[($i - 1), ($j - 1)] + (sim $words[$i - 1] $rec[$j - 1].w); $c1 = $D[($i - 1), $j] + 1; $c2 = $D[$i, ($j - 1)] + 1
  if ($c0 -le $c1 -and $c0 -le $c2) { $D[$i, $j] = $c0; $B[$i, $j] = 0 } elseif ($c1 -le $c2) { $D[$i, $j] = $c1; $B[$i, $j] = 1 } else { $D[$i, $j] = $c2; $B[$i, $j] = 2 }
} }
$st = New-Object 'double[]' $n; $en = New-Object 'double[]' $n; for ($i = 0; $i -lt $n; $i++) { $st[$i] = -1; $en[$i] = -1 }
$i = $n; $j = $mm
while ($i -gt 0 -and $j -gt 0) { $bb = $B[$i, $j]; if ($bb -eq 0) { $st[$i - 1] = $rec[$j - 1].s; $en[$i - 1] = $rec[$j - 1].e; $i--; $j-- } elseif ($bb -eq 1) { $i-- } else { $j-- } }
# interpolate unmatched words
for ($i = 0; $i -lt $n; $i++) { if ($st[$i] -lt 0) {
  $p = $i - 1; while ($p -ge 0 -and $st[$p] -lt 0) { $p-- }; $q = $i + 1; while ($q -lt $n -and $st[$q] -lt 0) { $q++ }
  $t0 = if ($p -ge 0) { $en[$p] } else { 0 }; $t1 = if ($q -lt $n) { $st[$q] } else { $total }
  $span = $q - $p - 1; $k = $i - $p; $st[$i] = $t0 + ($t1 - $t0) * ($k - 1) / $span; $en[$i] = $t0 + ($t1 - $t0) * $k / $span } }
$lines = @("# word start end punct  (recognised $($rec.Count) words, script $n words, total $([math]::Round($total,3))s)")
for ($i = 0; $i -lt $n; $i++) { $lines += "{0} {1:0.000} {2:0.000} {3}" -f $words[$i], $st[$i], $en[$i], $punctAfter[$i] }
$lines | Set-Content $OutPath -Encoding utf8
"aligned $n words -> $OutPath"
