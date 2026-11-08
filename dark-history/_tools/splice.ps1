# Replace a stretch of the trimmed VO with a new clip: keep [0, CutA), insert the patch [PatchA, PatchB) level-matched, resume at CutB.
# Short fades at every join; writes the new VO and prints its length and frame count.
param([string]$Vo, [string]$Patch, [string]$Out, [double]$CutA, [double]$CutB, [double]$PatchA, [double]$PatchB, [double]$Gap = 0.0)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\audiotool.ps1" -Mode none -In $Vo -Out $Out
$v = [AudioTool]::Read($Vo); $p = [AudioTool]::Read($Patch)
if ($v.Rate -ne $p.Rate -or $v.Ch -ne $p.Ch) { throw 'rate/channels differ' }
$R = $v.Rate; $ch = $v.Ch
$slice = { param($w, $a, $b) $i0 = [int]([math]::Round($a * $R)) * $ch; $i1 = [math]::Min($w.S.Length, [int]([math]::Round($b * $R)) * $ch); ,($w.S[$i0..($i1 - 1)]) }
$rms = { param($s) $acc = 0.0; $n = 0; for ($i = 0; $i -lt $s.Length; $i += 2) { $x = $s[$i] / 32768.0; if ([math]::Abs($x) -gt 0.02) { $acc += $x * $x; $n++ } }; [math]::Sqrt($acc / [math]::Max(1, $n)) }
$A = & $slice $v 0 $CutA; $B = & $slice $v $CutB ($v.S.Length / $ch / $R); $P = & $slice $p $PatchA $PatchB
# level match: the patch's speech RMS to the VO's speech RMS around the splice
$ctx = & $slice $v ($CutA - 6) ($CutB + 6); $g = (& $rms $ctx) / [math]::Max(1e-6, (& $rms $P))
"patch gain {0:0.000} ({1:0.0} dB)" -f $g, (20 * [math]::Log10($g))
$fade = [int](0.008 * $R)
$fadeIt = { param($s, $gain, $in, $outF) $n = $s.Length / $ch; $o = New-Object 'int16[]' $s.Length; for ($f = 0; $f -lt $n; $f++) { $k = $gain; if ($in -and $f -lt $fade) { $k *= $f / $fade }; if ($outF -and ($n - $f) -lt $fade) { $k *= ($n - $f) / $fade }; for ($c = 0; $c -lt $ch; $c++) { $o[$f * $ch + $c] = [int16][math]::Max(-32767, [math]::Min(32767, $s[$f * $ch + $c] * $k)) } }; ,$o }
$A2 = & $fadeIt $A 1.0 $false $true; $P2 = & $fadeIt $P $g $true $true; $B2 = & $fadeIt $B 1.0 $true $false
$silence = New-Object 'int16[]' ([int]($Gap * $R) * $ch)
$o = New-Object Wav; $o.Rate = $R; $o.Ch = $ch; $o.Bits = 16; $o.S = [int16[]]($A2 + $silence + $P2 + $B2)
[AudioTool]::Write($Out, $o)
$len = $o.S.Length / $ch / $R
"new VO {0:0.000}s (was {1:0.000}s, shift {2:+0.000}s after the splice); frames {3}" -f $len, ($v.S.Length / $ch / $R), ($len - $v.S.Length / $ch / $R), [math]::Ceiling($len * 60)
