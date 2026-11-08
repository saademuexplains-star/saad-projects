param([string]$Src, [string]$OutDir, [string]$OutName, [int]$Rate = 48000, [int]$Ch = 2)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskOp = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asTaskActProg = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1' })[0]
function Await($op, $type) { $t = $asTaskOp.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.StorageFolder,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Transcoding.MediaTranscoder,Windows.Media.Transcoding,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.MediaProperties.MediaEncodingProfile,Windows.Media.MediaProperties,ContentType=WindowsRuntime] | Out-Null
$srcFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Src)) ([Windows.Storage.StorageFile])
$folder = Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync($OutDir)) ([Windows.Storage.StorageFolder])
$dst = Await ($folder.CreateFileAsync($OutName, [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateWav([Windows.Media.MediaProperties.AudioEncodingQuality]::High)
$profile.Audio.SampleRate = $Rate; $profile.Audio.ChannelCount = $Ch; $profile.Audio.BitsPerSample = 16
$tc = New-Object Windows.Media.Transcoding.MediaTranscoder
$prep = Await ($tc.PrepareFileTranscodeAsync($srcFile, $dst, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
if (-not $prep.CanTranscode) { throw "Cannot transcode: $($prep.FailureReason)" }
$task = $asTaskActProg.MakeGenericMethod([double]).Invoke($null, @($prep.TranscodeAsync())); $task.Wait(-1) | Out-Null
"wrote $OutDir\$OutName"
