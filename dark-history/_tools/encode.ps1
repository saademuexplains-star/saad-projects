# Encode an image sequence + WAV into H.264 MP4 using Windows MediaComposition (no ffmpeg needed).
param([string]$FramesDir, [string]$Audio, [string]$Out, [int]$Fps = 30, [int]$W = 1080, [int]$H = 1920, [int]$Kbps = 16000, [string]$Ext = 'jpg')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskOp = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asTaskOpProg = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperationWithProgress`2' })[0]
function Await($op, $type) { $t = $asTaskOp.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.StorageFolder,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaComposition,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaClip,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.BackgroundAudioTrack,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.MediaProperties.MediaEncodingProfile,Windows.Media.MediaProperties,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Transcoding.TranscodeFailureReason,Windows.Media.Transcoding,ContentType=WindowsRuntime] | Out-Null
$comp = New-Object Windows.Media.Editing.MediaComposition
$add = [System.Collections.Generic.ICollection[Windows.Media.Editing.MediaClip]].GetMethod('Add')
$files = Get-ChildItem (Join-Path $FramesDir "*.$Ext") | Sort-Object Name
$ticksPerFrame = [long](10000000 / $Fps)
$acc = 0.0; $sw = [Diagnostics.Stopwatch]::StartNew(); $i = 0
foreach ($fi in $files) {
  # exact frame boundaries: accumulate fractional ticks
  $t0 = [long][math]::Round($i * 10000000.0 / $Fps); $t1 = [long][math]::Round(($i + 1) * 10000000.0 / $Fps)
  $sf = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($fi.FullName)) ([Windows.Storage.StorageFile])
  $clip = Await ([Windows.Media.Editing.MediaClip]::CreateFromImageFileAsync($sf, [TimeSpan]::FromTicks($t1 - $t0))) ([Windows.Media.Editing.MediaClip])
  $add.Invoke($comp.Clips, @($clip)) | Out-Null
  $i++
  if ($i % 200 -eq 0) { Write-Host "added $i frames ($([math]::Round($sw.Elapsed.TotalSeconds))s)" }
}
if ($Audio) {
  $af = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path $Audio).Path)) ([Windows.Storage.StorageFile])
  $bg = Await ([Windows.Media.Editing.BackgroundAudioTrack]::CreateFromFileAsync($af)) ([Windows.Media.Editing.BackgroundAudioTrack])
  [System.Collections.Generic.ICollection[Windows.Media.Editing.BackgroundAudioTrack]].GetMethod('Add').Invoke($comp.BackgroundAudioTracks, @($bg)) | Out-Null
}
$prof = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp4([Windows.Media.MediaProperties.VideoEncodingQuality]::HD1080p)
$prof.Video.Width = $W; $prof.Video.Height = $H; $prof.Video.Bitrate = $Kbps * 1000
$prof.Video.FrameRate.Numerator = $Fps; $prof.Video.FrameRate.Denominator = 1
$prof.Audio.SampleRate = 48000; $prof.Audio.ChannelCount = 2; $prof.Audio.Bitrate = 192000
$outFull = [IO.Path]::GetFullPath($Out); $folder = Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync((Split-Path $outFull))) ([Windows.Storage.StorageFolder])
$of = Await ($folder.CreateFileAsync((Split-Path $outFull -Leaf), [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
$op = $comp.RenderToFileAsync($of, [Windows.Media.Editing.MediaTrimmingPreference]::Precise, $prof)
$task = $asTaskOpProg.MakeGenericMethod([Windows.Media.Transcoding.TranscodeFailureReason], [double]).Invoke($null, @($op))
$task.Wait(-1) | Out-Null
"encode result: $($task.Result); $i frames; duration $([math]::Round($comp.Duration.TotalSeconds,3))s; $([math]::Round($sw.Elapsed.TotalSeconds))s -> $outFull"
