# Download finished ElevenLabs generations for "The Worm" (saved creative_get_flow_run_status JSON), naming them by prompt.
param([string]$Json, [string]$OutDir = '_sfx4')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Ancient Middle Eastern cinematic underscore' = 'wm1_underscore'; 'Eerie microscopic underwater' = 'wm2_micro'; 'Horror tension music build' = 'wm3_tension'; 'Emotional cinematic resolution' = 'wm4_resolution'
  'Ancient bustling bazaar' = 'wa1_bazaar'; 'Village fields ambience' = 'wa2_fields'; 'Gentle river ambience' = 'wa3_river'; 'Quiet mud hut interior' = 'wa4_hut'; 'Rainy city street at night' = 'wa5_city'
  'Cool water poured' = 'ws1_pour'; 'Man drinking water' = 'ws2_gulps'; 'Deep zoom-in whoosh' = 'ws3_lens'; 'Creepy horror sting' = 'ws4_sting'; 'Single deep wet swallow' = 'ws5_swallow'
  'x-ray scanner sweep' = 'ws6_scan'; 'Iron hoe striking' = 'ws7_hoe'; 'Slow wet squirming worm' = 'ws8_squirm'; 'Single deep heartbeat' = 'ws9_heart'; 'Young man waking up' = 'ws10_groan'
  'Red-hot branding iron' = 'ws11_iron'; 'Thick liquid bubbling' = 'ws12_blister'; 'Warbling heat haze' = 'ws13_heat'; 'Limping footsteps' = 'ws14_splash'; 'Glowing hot metal plunged' = 'ws15_quench'
  'Muffled underwater pop' = 'ws16_pop'; 'Slimy worm pushing out' = 'ws17_wormout'; 'Man grunting and straining' = 'ws18_grunt'; 'One sharp loud slap' = 'ws19_slap'; 'Old man shouting' = 'ws20_shout'
  'x-ray zap flash' = 'ws21_zap'; 'Wet rubbery snap' = 'ws22_snap'; 'Dark creeping poison' = 'ws23_venom'; 'Ethereal sunrise swell' = 'ws24_sunrise'; 'Soft warm airy whoosh' = 'ws25_sweep'
  'Thin thread being wrapped' = 'ws26_thread'; 'Small wooden twig slowly turned' = 'ws27_creak'; 'Man sucking air' = 'ws28_hiss'; 'Fast time-lapse' = 'ws29_lapse'; 'Magical transformation shimmer' = 'ws30_morph'
  'Huge cinematic final impact' = 'ws31_impact'
  'Fast-forward time-lapse village' = 'ws32_tlvillage'; 'biting into fresh flatbread' = 'ws33_bite'; 'Very short swift air whoosh' = 'ws34_whip'; 'Rooster crowing' = 'ws35_rooster'
  'plunging inside a human body' = 'ws36_dive'; 'Inside the human body' = 'wa6_body'; 'Long descending wet whoosh' = 'ws37_descend'; 'Camera plunging under water' = 'ws38_dunk'
  'Underwater river ambience' = 'wa7_under'; 'A hand plunging into shallow water' = 'ws39_plunge'; 'Bursting up out of water' = 'ws40_surface'; 'Thick blood gushing whoosh' = 'ws41_gush'
  'Rubbery tendon stretching' = 'ws42_stretch'
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
