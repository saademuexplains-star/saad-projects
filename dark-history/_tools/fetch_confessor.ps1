# Download finished ElevenLabs generations for "The Confessor" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx8')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark sacred cinematic underscore' = 'cm1_choir'; 'Horror tension music build' = 'cm2_tension'; 'Dark cinematic war march' = 'cm3_march'; 'Mournful cinematic resolution' = 'cm4_resolve'
  'Empty stone chapel at night' = 'ca1_chapel'; 'Countryside at night before dawn' = 'ca2_valley'; 'Peaceful medieval village morning' = 'ca3_morning'
  'Deep cinematic boom impact with a long dark reverb' = 'cs1_boom'; 'Heavy velvet robe rustling' = 'cs2_kneel'; 'Low indistinct male voice whispering' = 'cs3_whisper'; 'Candle flame flaring' = 'cs4_candle'; 'Heavy iron tongs' = 'cs5_tongs'
  'muffled agonized scream' = 'cs6_scream'; 'Large bonfire roaring' = 'cs7_fire'; 'Ghostly overlapping whispers' = 'cs8_whispers'; 'Soft warm shimmering whoosh' = 'cs9_sweep'; 'Sudden low dark orchestral stinger' = 'cs10_stinger'
  'Group of soldiers marching' = 'cs11_march'; 'Dry straw roof catching fire' = 'cs12_thatch'; 'Deep magical zoom-in whoosh' = 'cs13_lens'; 'Heavy velvet curtain swishing' = 'cs14_curtain'; 'Slow heavy footsteps walking away' = 'cs15_steps'
  'Young boy quietly sobbing' = 'cs16_sob'; 'Small glass vial sliding' = 'cs17_slide'; 'Thick liquid poured from a small glass vial' = 'cs18_pour'; 'Slow heavy cinematic heartbeat' = 'cs19_heartbeat'; 'Man choking and gasping' = 'cs20_choke'
  'Gold metal chalice dropped' = 'cs21_clang'; 'Heavy body falling onto a stone floor' = 'cs22_thud'; 'Single distant church bell' = 'cs23_bell'; 'Deep cinematic reverse swell' = 'cs24_swell'; 'Deep soft cinematic whoosh' = 'cs25_whoosh'
  'sharp shocked inhale gasp' = 'cs26_gasp'; 'soft trembling sorrowful exhale' = 'cs27_exhale'; 'Dark deep whoosh fading' = 'cs28_darkwhoosh'; 'Old iron lantern handle' = 'cs29_lantern'; 'Warm rising shimmer swell' = 'cs30_heat'
}
New-Item -ItemType Directory -Force $OutDir | Out-Null
$mp3 = Join-Path (Resolve-Path $OutDir).Path 'mp3'; New-Item -ItemType Directory -Force $mp3 | Out-Null
$got = 0; $pending = @()
foreach ($jf in $Json) {
  $j = [IO.File]::ReadAllText($jf) | ConvertFrom-Json
  foreach ($g in $j.generations) {
    $key = $null; foreach ($k in $map.Keys) { if ($g.prompt -like "*$k*") { $key = $map[$k]; break } }
    if (-not $key) { Write-Host "unmapped: $($g.prompt)"; continue }
    if ($g.status -ne 'completed' -or -not $g.content_url) { $pending += $key; continue }
    $dst = Join-Path $mp3 "$key.mp3"
    if (-not (Test-Path $dst)) { Invoke-WebRequest -Uri $g.content_url -OutFile $dst -UseBasicParsing }
    $got++
  }
}
"downloaded/present: $got ; not ready: $($pending -join ', ')"

