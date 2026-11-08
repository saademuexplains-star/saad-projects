# Download finished ElevenLabs generations for "The Leech Collector" (saved creative_get_flow_run_status JSON), naming them by prompt.
param([string]$Json, [string]$OutDir = '_sfx5')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark cinematic folk underscore' = 'm1_underscore'; 'Horror tension music build' = 'm2_tension'
  'Cold misty swamp at dawn' = 'a1_swamp'; 'Quiet 18th-century apothecary' = 'a2_shop'
  'Deep cinematic bass hit impact' = 's1_impact'; 'Bare feet wading slowly' = 's2_wade'; 'Man shivering from freezing' = 's3_shiver'; 'Two slow deep heavy heartbeats' = 's4_heartbeat'
  'Low dark bassy whoosh descending' = 's5_downwhoosh'; 'Small slimy wet suction squelches' = 's6_latch'; 'Man short sharp pained gasp' = 's7_gasp'; 'Deep wet zoom-in whoosh' = 's8_zoomhit'
  'Sticky wet leech pulled off' = 's9_peelpop'; 'Fast bassy swish whoosh moving upward' = 's10_upswish'; 'Thick glass jar of water' = 's11_jar'; "Fat old man's low satisfied chuckle" = 's12_chuckle'
  'Single small copper coin' = 's13_coin'; 'Reverse cymbal swell' = 's14_swell'
}
$j = Get-Content -LiteralPath $Json -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force $OutDir | Out-Null
$mp3 = Join-Path (Resolve-Path $OutDir).Path 'mp3'; New-Item -ItemType Directory -Force $mp3 | Out-Null
$got = 0; $pending = @()
foreach ($g in $j.generations) {
  $key = $null; foreach ($k in $map.Keys) { if ($g.prompt -like "*$k*") { $key = $map[$k]; break } }
  if (-not $key) { Write-Host "unmapped: $($g.prompt)"; continue }
  if ($g.status -ne 'completed' -or -not $g.content_url) { $pending += $key; continue }
  $dst = Join-Path $mp3 "$key.mp3"
  if (-not (Test-Path $dst)) { Invoke-WebRequest -Uri $g.content_url -OutFile $dst -UseBasicParsing }
  $got++
}
"downloaded/present: $got ; not ready: $($pending -join ', ')"
