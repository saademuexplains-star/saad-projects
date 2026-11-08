# Which sentence does a short VO clip say? Grammar-constrained recognition (16 kHz mono copy, padded with silence).
# -Phrases: whole candidate sentences; -Suffix: a known ending, with free dictation for whatever comes before it.
param([string]$Wav, [string[]]$Phrases = @(), [string]$Suffix = '', [string]$Prefix = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
. "$PSScriptRoot\audiotool.ps1" -Mode none -In $Wav -Out 'x'
$w = [AudioTool]::Read($Wav)
$step = $w.Rate / 16000.0; $nFr = [int]($w.S.Length / $w.Ch)
$mono = New-Object 'System.Collections.Generic.List[int16]'
for ($t = 0.0; $t -lt $nFr - 1; $t += $step) { $i = [int]$t * $w.Ch; $v = 0; for ($c = 0; $c -lt $w.Ch; $c++) { $v += $w.S[$i + $c] }; $mono.Add([int16]($v / $w.Ch)) }
$pad = New-Object 'int16[]' 4800
$arr = $pad + $mono.ToArray() + $pad
$m = New-Object Wav; $m.Rate = 16000; $m.Ch = 1; $m.Bits = 16; $m.S = [int16[]]$arr
$f = Join-Path $env:TEMP 'whichline16k.wav'; [AudioTool]::Write($f, $m)
$eng = New-Object System.Speech.Recognition.SpeechRecognitionEngine ([System.Globalization.CultureInfo]'en-US')
$gb = New-Object System.Speech.Recognition.GrammarBuilder
if ($Phrases.Count) { $ch = New-Object System.Speech.Recognition.Choices; foreach ($p in $Phrases) { $ch.Add($p) }; $gb.Append($ch) }
else { if ($Prefix) { $gb.Append($Prefix) } else { $gb.AppendDictation() }; if ($Suffix) { $gb.Append($Suffix) } else { $gb.AppendDictation() } }
$eng.LoadGrammar((New-Object System.Speech.Recognition.Grammar $gb)); $eng.SetInputToWaveFile($f)
# accept low-confidence matches too: we want the ranking, not a yes/no
try { $eng.UpdateRecognizerSetting('CFGConfidenceRejectionThreshold', 0) } catch { }
$eng.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(500); $eng.InitialSilenceTimeout = [TimeSpan]::FromSeconds(2)
$r = $eng.Recognize()
if ($r) { "best: '{0}' confidence {1:0.00}" -f $r.Text, $r.Confidence; foreach ($a in $r.Alternates) { "  alt: '{0}' {1:0.00}" -f $a.Text, $a.Confidence } } else { 'no match' }
$eng.Dispose()
