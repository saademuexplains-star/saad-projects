param(
    [string]$Video,
    [string]$OutDir,
    [double]$Step = 0.25,
    [int]$Width = 180,
    [int]$Height = 320,
    [double[]]$Times = @()
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, $type) {
    $t = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
    $t.Wait(-1) | Out-Null
    $t.Result
}
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaClip,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaComposition,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.ImageStream,Windows.Graphics,ContentType=WindowsRuntime] | Out-Null

New-Item -ItemType Directory -Force $OutDir | Out-Null
$f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Video)) ([Windows.Storage.StorageFile])
$clip = Await ([Windows.Media.Editing.MediaClip]::CreateFromFileAsync($f)) ([Windows.Media.Editing.MediaClip])
$comp = New-Object Windows.Media.Editing.MediaComposition
[System.Collections.Generic.ICollection[Windows.Media.Editing.MediaClip]].GetMethod('Add').Invoke($comp.Clips, @($clip)) | Out-Null
$dur = $clip.OriginalDuration.TotalSeconds

if ($Times.Count -eq 0) {
    $list = New-Object System.Collections.Generic.List[double]
    for ($t = 0.0; $t -lt $dur - 0.05; $t += $Step) { $list.Add([math]::Round($t, 3)) }
    $Times = $list.ToArray()
}
foreach ($t in $Times) {
    $op = $comp.GetThumbnailAsync([TimeSpan]::FromSeconds($t), $Width, $Height, [Windows.Media.Editing.VideoFramePrecision]::NearestFrame)
    $img = Await $op ([Windows.Graphics.Imaging.ImageStream])
    $src = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($img)
    $name = Join-Path $OutDir ("t{0:000.00}.jpg" -f $t)
    $dst = [System.IO.File]::Create($name)
    $src.CopyTo($dst)
    $dst.Close(); $src.Close()
}
"{0}: wrote {1} frames to {2}" -f (Split-Path $Video -Leaf), $Times.Count, $OutDir


