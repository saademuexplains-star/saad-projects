# Minimal static file server for previewing render pages in a browser: serves -Root on http://localhost:-Port/
param([string]$Root = (Join-Path $PSScriptRoot '..\_render'), [int]$Port = 8765)
$root = (Resolve-Path $Root).Path
$l = New-Object System.Net.HttpListener; $l.Prefixes.Add("http://localhost:$Port/"); $l.Start()
Write-Host "serving $root on http://localhost:$Port/"
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'; '.jpg' = 'image/jpeg'; '.png' = 'image/png'; '.css' = 'text/css' }
while ($l.IsListening) {
  $ctx = $l.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/')); if (-not $rel) { $rel = 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if ($path.StartsWith($root) -and (Test-Path -LiteralPath $path -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($path); $ext = [IO.Path]::GetExtension($path).ToLower()
      $ctx.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $ctx.Response.StatusCode = 404 }
  } catch { $ctx.Response.StatusCode = 500 } finally { $ctx.Response.Close() }
}
