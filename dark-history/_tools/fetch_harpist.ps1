# Download finished ElevenLabs generations for "The Blind Harpist" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx7')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark Byzantine cinematic underscore' = 'hm1_underscore'; 'Horror tension music build' = 'hm2_tension'; 'Dark cinematic climax music' = 'hm3_climax'; 'Solo harp playing a slow haunting' = 'hm4_harp'
  'Dungeon ambience' = 'ha1_cell'; 'Large stone palace hall at night' = 'ha2_hall'
  'Red-hot iron rod pulled' = 'hs1_iron'; 'Intense sizzle and hiss' = 'hs2_sizzle'; 'Young man crying out in agony' = 'hs3_scream'; 'Soft magical harp glissando' = 'hs4_gliss'; 'Heavy velvet curtain' = 'hs5_curtain'
  'Huge deep cinematic boom' = 'hs6_boom'; 'Dark cinematic riser' = 'hs7_riser'; 'Small wooden game piece' = 'hs8_block'; 'Heavy steel battle axe' = 'hs9_axe'; 'Slow heavy cinematic heartbeat' = 'hs10_heartbeat'
  'Linen bandage loosening' = 'hs11_cloth'; 'Eerie dreamy blurred vision' = 'hs12_blur'; 'Thin stream of liquid poured' = 'hs13_pour'; 'A single harp string plucked' = 'hs14_twang'; 'sharp startled inhale gasp' = 'hs15_gasp'
  'gripping a leather-wrapped dagger' = 'hs16_dagger'; 'Sudden low dark orchestral stinger' = 'hs17_stinger'; 'Old man choking' = 'hs18_choke'; 'Gold metal goblet knocked over' = 'hs19_goblet'; 'Heavy body collapsing' = 'hs20_thud'
  'Heavy gold crown placed' = 'hs21_crown'; 'Deep soft cinematic whoosh' = 'hs22_whoosh'; 'Deep liquid whoosh' = 'hs23_wetwhoosh'; 'Deep cinematic reverse swell' = 'hs24_swell'; 'Close fire flaring up' = 'hs25_fire'; 'quiet low cold chuckle' = 'hs26_laugh'
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

