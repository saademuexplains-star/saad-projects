# Duration, peak time and onset of every clip; a 0.5 s RMS strip for beds (music/ambience).
param([string]$Dir, [string]$Tools)
$ErrorActionPreference = 'Stop'
. "$Tools\audiotool.ps1" -Mode none
foreach ($f in (Get-ChildItem $Dir -Filter *.wav | Sort-Object Name)) {
  $w = [AudioTool]::Read($f.FullName); $n = $w.S.Length / $w.Ch; $dur = $n / $w.Rate
  $pk = 0; $pi = 0; for ($i = 0; $i -lt $w.S.Length; $i += $w.Ch) { $v = [math]::Abs([int]$w.S[$i]); if ($v -gt $pk) { $pk = $v; $pi = $i / $w.Ch } }
  # onset: first time the 10 ms RMS exceeds -30 dB below the peak
  $thr = $pk / 31.6; $on = -1; $win = [int]($w.Rate / 100)
  for ($a = 0; $a + $win -lt $n -and $on -lt 0; $a += $win) { $acc = 0.0; for ($i = $a; $i -lt $a + $win; $i++) { $v = $w.S[$i * $w.Ch]; $acc += $v * $v }; if ([math]::Sqrt($acc / $win) -gt $thr) { $on = $a / $w.Rate } }
  $line = "{0,-16} dur {1,6:0.00}  peak@{2,6:0.00}  onset {3,5:0.00}  pk {4,5:0.00}" -f $f.BaseName, $dur, ($pi / $w.Rate), $on, ($pk / 32768)
  if ($f.BaseName -match '^[a-z]?(m|a)\d') {
    $strip = @(); for ($t = 0; $t -lt $dur; $t += 0.5) { $a = [int]($t * $w.Rate); $b = [math]::Min($n, [int](($t + 0.5) * $w.Rate)); $acc = 0.0; $c = 0; for ($i = $a; $i -lt $b; $i += 4) { $v = $w.S[$i * $w.Ch] / 32768.0; $acc += $v * $v; $c++ }; $strip += [int](20 * [math]::Log10([math]::Sqrt($acc / [math]::Max(1, $c)) + 1e-9)) }
    $line += "`n    " + ($strip -join ' ')
  }
  $line
}
