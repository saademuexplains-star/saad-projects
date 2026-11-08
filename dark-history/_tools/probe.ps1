param([string[]]$Paths)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, $type) {
    $t = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
    $t.Wait(-1) | Out-Null
    $t.Result
}
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaClip,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
foreach ($p in $Paths) {
    $f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($p)) ([Windows.Storage.StorageFile])
    $clip = Await ([Windows.Media.Editing.MediaClip]::CreateFromFileAsync($f)) ([Windows.Media.Editing.MediaClip])
    $vp = $clip.GetVideoEncodingProperties()
    $fr = $vp.FrameRate
    "{0}: {1}x{2} dur={3}s fps={4}/{5} audioTracks={6}" -f (Split-Path $p -Leaf), $vp.Width, $vp.Height, $clip.OriginalDuration.TotalSeconds, $fr.Numerator, $fr.Denominator, $clip.EmbeddedAudioTracks.Count
}
