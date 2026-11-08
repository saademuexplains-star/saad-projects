# Download finished ElevenLabs generations for "The Royal Astrologer" (saved creative_get_flow_run_status JSON files),
# naming them by prompt. Only six clips were generated (tight credit budget); everything else reuses the earlier library.
param([string[]]$Json, [string]$OutDir = '_sfx13')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'One huge deep cathedral bell toll' = 'rs1_bell'; 'Crows cawing harshly at night' = 'rs2_crows'; 'Young noblewoman laughing lightly' = 'rs3_laugh'
  'Grown man sobbing in grief' = 'rs4_sob'; 'Thick parchment ripped in half' = 'rs5_tear'; 'Man sniffles then one small stifled sneeze' = 'rs6_sneeze'
}
New-Item -ItemType Directory -Force $OutDir | Out-Null
$mp3 = Join-Path (Resolve-Path $OutDir).Path 'mp3'; New-Item -ItemType Directory -Force $mp3 | Out-Null
$got = 0; $pending = @()
foreach ($jf in $Json) {
  $j = [IO.File]::ReadAllText((Resolve-Path $jf).Path) | ConvertFrom-Json
  foreach ($g in $j.generations) {
    $key = $null; foreach ($k in $map.Keys) { if ($g.prompt -like "*$k*") { $key = $map[$k]; break } }
    if (-not $key) { continue }
    if ($g.status -ne 'completed' -or -not $g.content_url) { $pending += $key; continue }
    $dst = Join-Path $mp3 "$key.mp3"
    if (-not (Test-Path $dst)) { Invoke-WebRequest -Uri $g.content_url -OutFile $dst -UseBasicParsing }
    $got++
  }
}
"downloaded/present: $got ; not ready: $($pending -join ', ')"
