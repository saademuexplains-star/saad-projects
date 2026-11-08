# Download finished ElevenLabs generations for "The Rabies Boy" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx10')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark cinematic underscore music for an 1880s' = 'rm1_lab'; 'Violent horror action music' = 'rm2_attack'; 'Ominous fragile dread music' = 'rm3_dread'; 'Warm emotional cinematic music' = 'rm4_hope'
  '1880s laboratory room tone' = 'ra1_lab'; 'Morning village road ambience' = 'ra2_village'; 'Old hospital ward ambience' = 'ra3_ward'; 'Night laboratory ambience' = 'ra4_nightlab'; 'Quiet night bedroom ambience' = 'ra5_room'; 'Sunny morning courtyard ambience' = 'ra6_court'
  'Deep low cinematic whoosh riser' = 'rs1_riser'; 'Hypodermic needle piercing skin' = 'rs2_needle'; 'Young boy sharp frightened gasp' = 'rs3_gasp'; 'Deep cinematic impact boom' = 'rs4_boom'; 'Glass syringe plunger' = 'rs5_plunger'
  'Stone mortar and pestle' = 'rs6_grind'; 'Glass laboratory flasks gently clinking' = 'rs7_glass'; 'Soft deep air whoosh' = 'rs8_whoosh'; 'Wooden walking cane' = 'rs9_cane'; 'Young boy crying softly' = 'rs10_sniff'
  'Low reverse swell' = 'rs11_reverse'; 'Child footsteps walking' = 'rs12_steps'; 'Rabid dog deep menacing growl' = 'rs13_growl'; 'Large dog galloping' = 'rs14_gallop'; 'Vicious dog attack' = 'rs15_snarl'
  'Young boy screaming in terror' = 'rs16_scream'; 'Heavy body impact thud' = 'rs17_thud'; 'Rapid savage dog bites' = 'rs18_bites'; 'Whoosh of dust and wind' = 'rs19_dust'; 'Feverish sick man groaning' = 'rs20_groan'
  'Man gurgling and choking' = 'rs21_froth'; 'Grown man screaming in terror' = 'rs22_mscream'; 'Water sloshing in a drinking glass' = 'rs23_slosh'; 'Glass of water spilling' = 'rs24_splash'; 'Linen curtain swished' = 'rs25_curtain'
  'Several dogs barking and whining' = 'rs26_kennel'; 'Young boy whimpering' = 'rs27_whimper'; 'Woman sobbing quietly' = 'rs28_sob'; 'Single quick chalk stroke' = 'rs29_chalk'; 'Single deep heavy heartbeat' = 'rs30_heart'
  'Calendar pages flipping' = 'rs31_pages'; 'A rooster crowing' = 'rs32_rooster'; "Mother's soft relieved sob" = 'rs33_relief'; 'Warm soft shimmering swell' = 'rs34_shimmer'; 'Heavy wrought iron gate' = 'rs35_gate'
  'Ring of heavy iron keys' = 'rs36_keys'; 'Huge final cinematic impact' = 'rs37_final'; 'Small animal slumping' = 'rs38_collapse'; 'Small wire animal cage' = 'rs39_cage'; 'Clock ticking fast' = 'rs40_tick'
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
