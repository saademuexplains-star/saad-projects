# Mux JPEG frames + 16-bit PCM WAV into an MJPEG AVI (frame-exact), then optionally transcode to H.264 MP4.
param([string]$FramesDir, [string]$Wav, [string]$OutAvi, [string]$OutMp4 = '', [int]$Fps = 30, [int]$W = 1080, [int]$H = 1920, [int]$Kbps = 18000)
$ErrorActionPreference = 'Stop'
if (-not ('AviMux' -as [type])) {
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
public static class AviMux {
  static void FourCC(BinaryWriter w, string s) { w.Write(Encoding.ASCII.GetBytes(s)); }
  public static void Write(string outPath, string[] jpgs, byte[] pcm, int rate, int ch, int fps, int width, int height) {
    int blockAlign = ch * 2, bytesPerSec = rate * blockAlign; int nFrames = jpgs.Length;
    using (var fs = new FileStream(outPath, FileMode.Create)) using (var w = new BinaryWriter(fs)) {
      FourCC(w, "RIFF"); long riffSizePos = fs.Position; w.Write(0); FourCC(w, "AVI ");
      // hdrl
      FourCC(w, "LIST"); long hdrlSizePos = fs.Position; w.Write(0); FourCC(w, "hdrl");
      FourCC(w, "avih"); w.Write(56);
      w.Write((int)(1000000 / fps)); w.Write(0); w.Write(0); w.Write(0x10 | 0x100); w.Write(nFrames); w.Write(0); w.Write(2); w.Write(1 << 20); w.Write(width); w.Write(height); w.Write(0); w.Write(0); w.Write(0); w.Write(0);
      // video stream
      FourCC(w, "LIST"); long s1 = fs.Position; w.Write(0); FourCC(w, "strl");
      FourCC(w, "strh"); w.Write(56); FourCC(w, "vids"); FourCC(w, "MJPG"); w.Write(0); w.Write((short)0); w.Write((short)0); w.Write(0);
      w.Write(1); w.Write(fps); w.Write(0); w.Write(nFrames); w.Write(1 << 20); w.Write(-1); w.Write(0); w.Write((short)0); w.Write((short)0); w.Write((short)width); w.Write((short)height);
      FourCC(w, "strf"); w.Write(40); w.Write(40); w.Write(width); w.Write(height); w.Write((short)1); w.Write((short)24); FourCC(w, "MJPG"); w.Write(width * height * 3); w.Write(0); w.Write(0); w.Write(0); w.Write(0);
      long e1 = fs.Position; fs.Position = s1; w.Write((int)(e1 - s1 - 4)); fs.Position = e1;
      // audio stream
      int audioLen = pcm.Length / blockAlign;
      FourCC(w, "LIST"); long s2 = fs.Position; w.Write(0); FourCC(w, "strl");
      FourCC(w, "strh"); w.Write(56); FourCC(w, "auds"); w.Write(0); w.Write(0); w.Write((short)0); w.Write((short)0); w.Write(0);
      w.Write(blockAlign); w.Write(bytesPerSec); w.Write(0); w.Write(audioLen); w.Write(bytesPerSec); w.Write(-1); w.Write(blockAlign); w.Write((short)0); w.Write((short)0); w.Write((short)0); w.Write((short)0);
      FourCC(w, "strf"); w.Write(18); w.Write((short)1); w.Write((short)ch); w.Write(rate); w.Write(bytesPerSec); w.Write((short)blockAlign); w.Write((short)16); w.Write((short)0);
      long e2 = fs.Position; fs.Position = s2; w.Write((int)(e2 - s2 - 4)); fs.Position = e2;
      long eh = fs.Position; fs.Position = hdrlSizePos; w.Write((int)(eh - hdrlSizePos - 4)); fs.Position = eh;
      // movi
      FourCC(w, "LIST"); long moviSizePos = fs.Position; w.Write(0); long moviStart = fs.Position; FourCC(w, "movi");
      var idx = new List<int[]>(); // [type(0=v,1=a), offset, size]
      long audioPos = 0;
      for (int f = 0; f < nFrames; f++) {
        byte[] jpg = File.ReadAllBytes(jpgs[f]);
        long off = fs.Position - moviStart; FourCC(w, "00dc"); w.Write(jpg.Length); w.Write(jpg); if ((jpg.Length & 1) == 1) w.Write((byte)0);
        idx.Add(new int[] { 0, (int)off, jpg.Length });
        long aEnd = (long)Math.Round((f + 1) * (double)rate / fps) * blockAlign; if (f == nFrames - 1) aEnd = pcm.Length; aEnd = Math.Min(aEnd, pcm.Length);
        int alen = (int)(aEnd - audioPos);
        if (alen > 0) { long aoff = fs.Position - moviStart; FourCC(w, "01wb"); w.Write(alen); w.Write(pcm, (int)audioPos, alen); if ((alen & 1) == 1) w.Write((byte)0); idx.Add(new int[] { 1, (int)aoff, alen }); audioPos = aEnd; }
      }
      long em = fs.Position; fs.Position = moviSizePos; w.Write((int)(em - moviSizePos - 4)); fs.Position = em;
      FourCC(w, "idx1"); w.Write(idx.Count * 16);
      foreach (var e in idx) { FourCC(w, e[0] == 0 ? "00dc" : "01wb"); w.Write(0x10); w.Write(e[1]); w.Write(e[2]); }
      long end = fs.Position; fs.Position = riffSizePos; w.Write((int)(end - 8)); fs.Position = end;
    }
  }
}
"@
}
. "$PSScriptRoot\audiotool.ps1" -Mode none -In 'x' -Out 'x' | Out-Null
$frames = @(Get-ChildItem (Join-Path $FramesDir '*.jpg') | Sort-Object Name | ForEach-Object { $_.FullName })
$wv = [AudioTool]::Read((Resolve-Path $Wav).Path)
$pcm = New-Object byte[] ($wv.S.Length * 2); [Buffer]::BlockCopy($wv.S, 0, $pcm, 0, $pcm.Length)
# pad or cut audio to exactly the video length
$need = [long][math]::Round($frames.Count * $wv.Rate / $Fps) * $wv.Ch * 2
if ($pcm.Length -ne $need) { $p2 = New-Object byte[] $need; [Array]::Copy($pcm, $p2, [math]::Min($pcm.Length, $need)); $pcm = $p2 }
$aviFull = [IO.Path]::GetFullPath((Join-Path (Get-Location).Path $OutAvi))
[AviMux]::Write($aviFull, $frames, $pcm, $wv.Rate, $wv.Ch, $Fps, $W, $H)
"avi: $($frames.Count) frames, $([math]::Round($frames.Count / $Fps, 3))s -> $aviFull ($([math]::Round((Get-Item $aviFull).Length / 1MB, 1)) MB)"
if ($OutMp4) {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime
  $methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
  $asTaskOp = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
  $asTaskActProg = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1' })[0]
  function Await($op, $type) { $t = $asTaskOp.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
  [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
  [Windows.Storage.StorageFolder,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
  [Windows.Media.Transcoding.MediaTranscoder,Windows.Media.Transcoding,ContentType=WindowsRuntime] | Out-Null
  [Windows.Media.MediaProperties.MediaEncodingProfile,Windows.Media.MediaProperties,ContentType=WindowsRuntime] | Out-Null
  $srcFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($aviFull)) ([Windows.Storage.StorageFile])
  $mp4Full = [IO.Path]::GetFullPath((Join-Path (Get-Location).Path $OutMp4))
  $folder = Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync((Split-Path $mp4Full))) ([Windows.Storage.StorageFolder])
  $dst = Await ($folder.CreateFileAsync((Split-Path $mp4Full -Leaf), [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
  $prof = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp4([Windows.Media.MediaProperties.VideoEncodingQuality]::HD1080p)
  $prof.Video.Width = $W; $prof.Video.Height = $H; $prof.Video.Bitrate = $Kbps * 1000; $prof.Video.FrameRate.Numerator = $Fps; $prof.Video.FrameRate.Denominator = 1
  $prof.Audio.SampleRate = 48000; $prof.Audio.ChannelCount = 2; $prof.Audio.Bitrate = 192000
  $tc = New-Object Windows.Media.Transcoding.MediaTranscoder; $tc.HardwareAccelerationEnabled = $true
  $prep = Await ($tc.PrepareFileTranscodeAsync($srcFile, $dst, $prof)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
  if (-not $prep.CanTranscode) { throw "Cannot transcode AVI: $($prep.FailureReason)" }
  $task = $asTaskActProg.MakeGenericMethod([double]).Invoke($null, @($prep.TranscodeAsync())); $task.Wait(-1) | Out-Null
  "mp4 -> $mp4Full ($([math]::Round((Get-Item $mp4Full).Length / 1MB, 1)) MB)"
}
