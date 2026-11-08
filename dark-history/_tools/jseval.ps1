# Evaluate JavaScript expressions in a page under headless Chrome and print each result as text (debug helper).
# -Exprs: one or more expressions, evaluated in order in the same page (awaited, returned by value).
# Example (whole-film SVG hashes, see nh.js):  .\_tools\jseval.ps1 -Page _render\video\pick19.html -Exprs (Get-Content _tools\nh.js -Raw), 'NH(0,3370)'
# Example (per-arm log): -Exprs 'window.__HANDLOG=[];ENG.svgFrame(500);JSON.stringify(window.__HANDLOG)'
param([string]$Page, [string[]]$Exprs, [int]$Port = 9371, [string]$Query = '')
$ErrorActionPreference = 'Stop'
if (-not ('Cdp' -as [type])) {
  $src = Get-Content (Join-Path $PSScriptRoot 'cdp.ps1') -Raw
  $a = $src.IndexOf('-TypeDefinition @"') + '-TypeDefinition @"'.Length; $b = $src.IndexOf('"@', $a)
  Add-Type -TypeDefinition $src.Substring($a, $b - $a)
}
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$prof = Join-Path $env:TEMP ("cdp_prof_" + $Port)
$proc = Start-Process -FilePath $chrome -ArgumentList @('--headless=new', "--remote-debugging-port=$Port", "--user-data-dir=$prof", '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920', '--allow-file-access-from-files', '--remote-allow-origins=*', '--disable-gpu', 'about:blank') -PassThru -WindowStyle Hidden
try {
  $wsUrl = $null
  for ($k = 0; $k -lt 100 -and -not $wsUrl; $k++) {
    Start-Sleep -Milliseconds 250
    try { $content = (Invoke-WebRequest -UseBasicParsing -Method Put "http://127.0.0.1:$Port/json/new?about:blank" -TimeoutSec 5).Content; $m = [regex]::Matches($content, '"webSocketDebuggerUrl"\s*:\s*"([^"]+)"'); if ($m.Count -gt 0) { $wsUrl = $m[0].Groups[1].Value } } catch { }
  }
  if (-not $wsUrl) { throw 'no devtools page' }
  $c = New-Object Cdp $wsUrl
  $url = 'file:///' + (Resolve-Path $Page).Path.Replace('\', '/') + $(if ($Query) { '?' + $Query } else { '' })
  $c.Call('Page.navigate', "{`"url`":`"$url`"}") | Out-Null
  for ($k = 0; $k -lt 300; $k++) { Start-Sleep -Milliseconds 100; $r = $c.Call('Runtime.evaluate', '{"expression":"window.READY===true","returnByValue":true}'); if ($r -match '"value":true') { break } }
  foreach ($e in $Exprs) {
    $p = '{"expression":' + (ConvertTo-Json $e -Compress) + ',"awaitPromise":true,"returnByValue":true}'
    $r = $c.Call('Runtime.evaluate', $p)
    if ($r -match '"exceptionDetails"') { "EXC: " + $r.Substring(0, [math]::Min(800, $r.Length)); continue }
    $mm = [regex]::Match($r, '"value":"((?:[^"\\]|\\.)*)"')
    if ($mm.Success) { [regex]::Unescape($mm.Groups[1].Value) } else { $r.Substring(0, [math]::Min(800, $r.Length)) }
  }
  $c.Dispose()
} finally { Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like "*cdp_prof_$Port*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }
