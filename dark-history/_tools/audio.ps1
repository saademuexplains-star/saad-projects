param([string]$Wav, [string]$Out)
$ErrorActionPreference = 'Stop'
$lines = New-Object System.Collections.Generic.List[string]

# --- loudness envelope (RMS dBFS per 100 ms) ---
$bytes = [System.IO.File]::ReadAllBytes($Wav)
$pos = 12; $dataOff = -1; $dataLen = 0; $rate = 16000
while ($pos -lt $bytes.Length - 8) {
    $id = [System.Text.Encoding]::ASCII.GetString($bytes, $pos, 4); $len = [BitConverter]::ToInt32($bytes, $pos + 4)
    if ($id -eq 'fmt ') { $rate = [BitConverter]::ToInt32($bytes, $pos + 12) }
    if ($id -eq 'data') { $dataOff = $pos + 8; $dataLen = [math]::Min($len, $bytes.Length - $dataOff); break }
    $pos += 8 + $len
}
$n = [int]($dataLen / 2); $win = [int]($rate / 10)
# plain 44-byte PCM header copy for System.Speech (it rejects JUNK chunks)
$clean = [IO.Path]::ChangeExtension($Wav, '.clean.wav')
$ms = New-Object System.IO.MemoryStream; $bw = New-Object System.IO.BinaryWriter $ms
$bw.Write([Text.Encoding]::ASCII.GetBytes('RIFF')); $bw.Write([int](36 + $dataLen)); $bw.Write([Text.Encoding]::ASCII.GetBytes('WAVEfmt '))
$bw.Write([int]16); $bw.Write([int16]1); $bw.Write([int16]1); $bw.Write([int]$rate); $bw.Write([int]($rate * 2)); $bw.Write([int16]2); $bw.Write([int16]16)
$bw.Write([Text.Encoding]::ASCII.GetBytes('data')); $bw.Write([int]$dataLen); $bw.Write($bytes, $dataOff, $dataLen); $bw.Flush()
[IO.File]::WriteAllBytes($clean, $ms.ToArray()); $bw.Dispose()
$db = New-Object System.Collections.Generic.List[double]
for ($s = 0; $s + $win -le $n; $s += $win) {
    $acc = 0.0
    for ($i = 0; $i -lt $win; $i += 2) { $v = [BitConverter]::ToInt16($bytes, $dataOff + 2 * ($s + $i)) / 32768.0; $acc += $v * $v }
    $rms = [math]::Sqrt($acc / ($win / 2)); $db.Add(20 * [math]::Log10([math]::Max($rms, 1e-6)))
}
$lines.Add("LOUDNESS (dBFS per 100ms; char scale: ' '<-50 .<-40 :<-32 -<-26 =<-20 +<-14 #>=-14)")
$chars = foreach ($d in $db) { if ($d -lt -50) { ' ' } elseif ($d -lt -40) { '.' } elseif ($d -lt -32) { ':' } elseif ($d -lt -26) { '-' } elseif ($d -lt -20) { '=' } elseif ($d -lt -14) { '+' } else { '#' } }
for ($sec = 0; $sec * 10 -lt $chars.Count; $sec++) {
    $seg = -join $chars[($sec * 10)..([math]::Min($chars.Count - 1, $sec * 10 + 9))]
    $lines.Add(("{0,3}s |{1}|" -f $sec, $seg))
}

# --- local speech recognition (System.Speech dictation) ---
Add-Type -AssemblyName System.Speech
$eng = New-Object System.Speech.Recognition.SpeechRecognitionEngine ([System.Globalization.CultureInfo]'en-US')
$eng.LoadGrammar((New-Object System.Speech.Recognition.DictationGrammar))
$eng.SetInputToWaveFile($clean)
$eng.InitialSilenceTimeout = [TimeSpan]::FromSeconds(3)
$eng.EndSilenceTimeout = [TimeSpan]::FromMilliseconds(300)
$eng.BabbleTimeout = [TimeSpan]::FromSeconds(3)
$lines.Add(""); $lines.Add("SPEECH (rough local dictation; start-end s : text)")
$total = $n / $rate; $guard = 0
while ($guard -lt 200) {
    $guard++
    try { $r = $eng.Recognize() } catch { break }
    if ($r -ne $null) {
        $st = $r.Audio.AudioPosition.TotalSeconds; $en = $st + $r.Audio.Duration.TotalSeconds
        $lines.Add(("  {0,5:0.0}-{1,5:0.0} : {2}" -f $st, $en, $r.Text))
    } elseif ($eng.AudioPosition.TotalSeconds -ge $total - 0.5) { break }
}
$eng.Dispose()
$lines | Set-Content $Out -Encoding utf8
"done $Out"
