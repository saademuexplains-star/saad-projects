# Download finished ElevenLabs generations for "The Calf's Blood" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx12')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark baroque cinematic underscore' = 'cm1_paris'; 'Tense cinematic suspense music' = 'cm2_trans'; 'Fragile bittersweet cinematic music' = 'cm3_dawn'; 'Dark cinematic tragedy music' = 'cm4_doom'; 'Sinister cinematic twist reveal' = 'cm5_reveal'
  'Old city street at night' = 'ca1_night'; 'Quiet candlelit study' = 'ca2_study'; 'Cold stone room interior' = 'ca3_surgery'; 'Small old cottage interior' = 'ca4_home'
  'Large excited crowd' = 'ca5_crowd'; 'Quiet town street at dusk' = 'ca6_dusk'; 'Large echoing courtroom' = 'ca7_court'; 'Fireplace crackling warmly' = 'ca8_hearth'
  'Deep soft bassy cinematic whoosh' = 'cs1_whoosh'; 'Deep cinematic impact boom' = 'cs2_boom'; 'Single deep heavy heartbeat' = 'cs3_heart'; 'Deep low cinematic riser' = 'cs4_riser'
  'Unhinged man laughing' = 'cs5_madlaugh'; 'Deranged man muttering' = 'cs6_mutter'; 'Single crow cawing' = 'cs7_crow'; 'Quill pen scratching' = 'cs8_quill'
  'Young calf mooing' = 'cs9_calf'; 'Frightened young calf' = 'cs10_calfscared'; 'Man struggling against leather' = 'cs11_struggle'; 'Small silver metal surgical' = 'cs12_metal'
  'Wet flesh puncture' = 'cs13_pierce'; 'Thick warm liquid flowing' = 'cs14_flow'; 'Grown man screaming in agony' = 'cs15_scream'; 'Searing burning sizzle' = 'cs16_burn'
  'Man groaning in deep pain' = 'cs17_groan'; 'Single thick dark liquid drip' = 'cs18_drip'; 'Old priest whispering' = 'cs19_pray'; 'Rooster crowing' = 'cs20_rooster'
  'Morning birds chirping' = 'cs21_birds'; 'Man waking and taking' = 'cs22_breath'; 'Church bells ringing joyfully' = 'cs23_bells'; 'Crowd erupting into loud cheers' = 'cs24_cheer'
  'Clay soup bowl smashing' = 'cs25_smash'; 'Man growling and snarling' = 'cs26_snarl'; 'Heavy old wooden door creaking' = 'cs27_door'; 'Woman sobbing and pleading' = 'cs28_womancry'
  'Body convulsing violently' = 'cs29_convulse'; "Man's last dying breath" = 'cs30_lastbreath'; 'Candle flame being snuffed' = 'cs31_snuff'; 'Heavy courtroom doors' = 'cs32_doors'
  'Man being dragged across' = 'cs33_drag'; 'Courtroom crowd gasping' = 'cs34_gasp'; 'Small folded paper packet' = 'cs35_paper'; 'Fine white powder pouring' = 'cs36_powder'
  'Wooden spoon slowly stirring' = 'cs37_stir'; 'Huge dark cinematic reveal hit' = 'cs38_sting'
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
