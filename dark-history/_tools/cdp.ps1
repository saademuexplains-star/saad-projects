# Headless-Chrome frame renderer over the DevTools protocol (one browser, many frames).
param([string]$Page, [int]$From = 0, [int]$To = 0, [string]$OutDir, [int]$W = 1080, [int]$H = 1920, [int]$Port = 9333, [string]$Fmt = 'jpeg', [int]$Quality = 93, [string]$Query = '', [string]$List = '', [int]$Step = 1, [switch]$Gpu, [switch]$Sync, [switch]$Stable, [int]$StableMs = 350)
# -Stable: capture again and again (-StableMs apart) until two captures in a row are byte-identical, so a heavy frame
# whose raster is still finishing is never saved half-drawn (a whole room missing for one frame in a transition)
# -Sync: the compositor finishes every raster tile before it draws a frame (no half-rastered tiles in the screenshot of a
# very heavy frame, such as two sea shots inside a transition's mask)
$ErrorActionPreference = 'Stop'
if (-not ('Cdp' -as [type])) {
Add-Type -TypeDefinition @"
using System;
using System.Net.Sockets;
using System.Text;
using System.IO;
public class Cdp : IDisposable {
  TcpClient tcp; NetworkStream s; int id = 0; Random rnd = new Random();
  public Cdp(string url) {
    var u = new Uri(url); tcp = new TcpClient(u.Host, u.Port); tcp.ReceiveBufferSize = 1 << 20; s = tcp.GetStream();
    string req = "GET " + u.AbsolutePath + " HTTP/1.1\r\nHost: " + u.Host + ":" + u.Port + "\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n";
    var b = Encoding.ASCII.GetBytes(req); s.Write(b, 0, b.Length);
    var hdr = new StringBuilder(); int last4 = 0;
    while (true) { int ch = s.ReadByte(); if (ch < 0) throw new Exception("handshake eof"); hdr.Append((char)ch); last4 = (last4 << 8) | ch; if ((last4 & 0xFFFFFFFF) == 0x0D0A0D0A) break; }
    if (!hdr.ToString().StartsWith("HTTP/1.1 101")) throw new Exception("handshake failed: " + hdr);
  }
  void ReadExact(byte[] buf, int off, int n) { while (n > 0) { int r = s.Read(buf, off, n); if (r <= 0) throw new Exception("socket closed"); off += r; n -= r; } }
  void SendText(string msg) {
    var p = Encoding.UTF8.GetBytes(msg); var ms = new MemoryStream(); ms.WriteByte(0x81);
    if (p.Length < 126) ms.WriteByte((byte)(0x80 | p.Length));
    else if (p.Length < 65536) { ms.WriteByte(0x80 | 126); ms.WriteByte((byte)(p.Length >> 8)); ms.WriteByte((byte)p.Length); }
    else { ms.WriteByte(0x80 | 127); for (int i = 7; i >= 0; i--) ms.WriteByte((byte)((long)p.Length >> (8 * i))); }
    var mask = new byte[4]; rnd.NextBytes(mask); ms.Write(mask, 0, 4);
    for (int i = 0; i < p.Length; i++) p[i] ^= mask[i & 3];
    ms.Write(p, 0, p.Length); var a = ms.ToArray(); s.Write(a, 0, a.Length);
  }
  string ReadMessage() {
    var msg = new MemoryStream(); var h = new byte[8];
    while (true) {
      ReadExact(h, 0, 2); bool fin = (h[0] & 0x80) != 0; int op = h[0] & 0x0F; long len = h[1] & 0x7F;
      if (len == 126) { ReadExact(h, 0, 2); len = (h[0] << 8) | h[1]; }
      else if (len == 127) { ReadExact(h, 0, 8); len = 0; for (int i = 0; i < 8; i++) len = (len << 8) | h[i]; }
      var pl = new byte[len]; ReadExact(pl, 0, (int)len);
      if (op == 0x9) { continue; }
      if (op == 0x8) throw new Exception("ws closed");
      msg.Write(pl, 0, pl.Length);
      if (fin) return Encoding.UTF8.GetString(msg.ToArray());
    }
  }
  public string Call(string method, string paramsJson) {
    int my = ++id;
    SendText("{\"id\":" + my + ",\"method\":\"" + method + "\",\"params\":" + (paramsJson ?? "{}") + "}");
    while (true) { string r = ReadMessage(); if (r.StartsWith("{\"id\":" + my + ",")) return r; }
  }
  public static string Field(string json, string key) {
    string k = "\"" + key + "\":\""; int i = json.IndexOf(k); if (i < 0) return null; i += k.Length; int j = json.IndexOf('"', i); return json.Substring(i, j - i);
  }
  public void Dispose() { try { tcp.Close(); } catch { } }
}
"@
}
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$prof = Join-Path $env:TEMP ("cdp_prof_" + $Port)
$proc = Start-Process -FilePath $chrome -ArgumentList (@('--headless=new', "--remote-debugging-port=$Port", "--user-data-dir=$prof", '--hide-scrollbars', '--force-device-scale-factor=1', "--window-size=$W,$H", '--allow-file-access-from-files', '--remote-allow-origins=*') + $(if ($Gpu) { @('--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-zero-copy') } else { @('--disable-gpu') }) + $(if ($Sync) { @('--run-all-compositor-stages-before-draw', '--disable-checker-imaging') } else { @() }) + @('about:blank')) -PassThru -WindowStyle Hidden
try {
  $wsUrl = $null
  for ($k = 0; $k -lt 100 -and -not $wsUrl; $k++) {
    Start-Sleep -Milliseconds 250
    try {
      $content = (Invoke-WebRequest -UseBasicParsing -Method Put "http://127.0.0.1:$Port/json/new?about:blank" -TimeoutSec 5).Content
      $m = [regex]::Matches($content, '"webSocketDebuggerUrl"\s*:\s*"([^"]+)"')
      if ($m.Count -gt 0) { $wsUrl = $m[0].Groups[1].Value }
    } catch { if ($k % 20 -eq 19) { Write-Host "waiting for devtools: $($_.Exception.Message)" } }
  }  if (-not $wsUrl) { throw 'no devtools page' }
  $c = New-Object Cdp $wsUrl
  $c.Call('Emulation.setDeviceMetricsOverride', "{`"width`":$W,`"height`":$H,`"deviceScaleFactor`":1,`"mobile`":false}") | Out-Null
  $url = 'file:///' + (Resolve-Path $Page).Path.Replace('\', '/') + $(if ($Query) { '?' + $Query } else { '' })
  $c.Call('Page.navigate', "{`"url`":`"$url`"}") | Out-Null
  for ($k = 0; $k -lt 200; $k++) { Start-Sleep -Milliseconds 100; $r = $c.Call('Runtime.evaluate', '{"expression":"window.READY===true","returnByValue":true}'); if ($r -match '"value":true') { break } }
  New-Item -ItemType Directory -Force $OutDir | Out-Null
  $OutDir = (Resolve-Path $OutDir).Path   # absolute: .NET file APIs don't follow Set-Location
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $frames = if ($List) { $List -split ',' | ForEach-Object { [int]$_ } } else { for ($q = $From; $q -le $To; $q += $Step) { $q } }
  $done = 0; $script:unstable = 0
  foreach ($f in $frames) {
    $r = $c.Call('Runtime.evaluate', "{`"expression`":`"renderFrame($f)`",`"awaitPromise`":true,`"returnByValue`":true}")
    if ($r -match '"exceptionDetails"') { throw "renderFrame($f) failed: $($r.Substring(0, [math]::Min(600, $r.Length)))" }
    $shot = $c.Call('Page.captureScreenshot', "{`"format`":`"$Fmt`",`"quality`":$Quality,`"captureBeyondViewport`":false}")
    $data = [Cdp]::Field($shot, 'data')
    if ($Stable) {
      for ($k = 0; $k -lt 40; $k++) {
        Start-Sleep -Milliseconds $StableMs
        $d2 = [Cdp]::Field($c.Call('Page.captureScreenshot', "{`"format`":`"$Fmt`",`"quality`":$Quality,`"captureBeyondViewport`":false}"), 'data')
        if ($d2 -eq $data) { break }
        $data = $d2; $script:unstable++
      }
      if ($k -ge 40) { Write-Host "frame $f never settled" }
    }
    [IO.File]::WriteAllBytes((Join-Path $OutDir ("f{0:00000}.{1}" -f $f, $(if ($Fmt -eq 'jpeg') { 'jpg' } else { 'png' }))), [Convert]::FromBase64String($data))
    $done++; if (($done % 25) -eq 1) { Write-Host ("frame {0} ({1:0.00}s/frame)" -f $f, ($sw.Elapsed.TotalSeconds / $done)) }
  }
  "rendered $done frames in $([math]::Round($sw.Elapsed.TotalSeconds,1))s" + $(if ($Stable) { " (re-captures while settling: $script:unstable)" } else { '' })
  $c.Dispose()
} finally { Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like "*cdp_prof_$Port*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }



