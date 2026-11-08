# Download finished ElevenLabs generations for "The King's Decoy" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx11')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark regal medieval cinematic music' = 'dm1_court'; 'Tense cinematic journey music' = 'dm2_pass'; 'Dark suspense horror underscore' = 'dm3_dread'; 'Epic dark cinematic climax music' = 'dm4_climax'
  'Quiet stone castle chamber' = 'da1_chamber'; 'Large medieval crowd cheering' = 'da2_crowd'; 'Inside a rolling wooden horse-drawn carriage' = 'da3_coach'; 'Windy high mountain pass' = 'da4_pass'
  'Strong howling wind on a high cliff' = 'da5_ridge'; 'Desolate crossroads at dusk' = 'da6_dusk'; 'Medieval village at sundown' = 'da7_village'
  'Heavy golden crown placed' = 'ds1_crown'; 'Rich heavy silk and velvet' = 'ds2_cloth'; 'Deep soft bassy cinematic whoosh' = 'ds3_whoosh'; 'Longbow string creaking' = 'ds4_bow'
  'Arrow whizzing fast' = 'ds5_arrowfly'; 'Arrow thudding hard' = 'ds6_arrowhit'; 'Grown man sharp frightened gasp' = 'ds7_gasp'; 'Short medieval royal fanfare' = 'ds8_fanfare'
  'Heavy wooden carriage wheels rolling' = 'ds9_wheels'; 'Arrow punching through a wooden wall' = 'ds10_punch'; 'Single deep heavy heartbeat' = 'ds11_heart'; 'Deep low cinematic riser' = 'ds12_riser'
  'Deep cinematic impact boom' = 'ds13_boom'; 'Burning torch whooshing' = 'ds14_torch'; 'Close dry nervous gulp' = 'ds15_swallow'; 'Old brass lever mechanism' = 'ds16_lever'
  'Heavy rope creaking slowly' = 'ds17_rope'; 'Crows suddenly taking flight' = 'ds18_crows'; 'Thatched roof bursting into flames' = 'ds19_roofire'; 'Frightened woman gasping' = 'ds20_woman'
  'Horse snorting and blowing' = 'ds21_snort'; 'Horse-drawn carriage pulling to a stop' = 'ds22_halt'; 'Single horse galloping hard' = 'ds23_gallop'; 'Rider kicking spurs' = 'ds24_spur'
  'Gunpowder fuse lit' = 'ds25_fuse'; 'Massive gunpowder barrel explosion' = 'ds26_explosion'; 'Large stone blocks and rocks crashing' = 'ds27_debris'; 'Horse screaming in terror' = 'ds28_horsescream'
  'Long deep descending whoosh' = 'ds29_fall'; 'Huge fireball erupting' = 'ds30_fireball'; 'Man screaming as he falls' = 'ds31_fallscream'; 'Crowd of people gasping' = 'ds32_crowdgasp'
  'Galloping horse hooves clattering' = 'ds33_stonehooves'; 'Deep sub bass rumble' = 'ds34_rumble'; 'Wooden carriage window frame creaking' = 'ds35_lean'; 'Heavy iron portcullis' = 'ds36_portcullis'
  'Huge final cinematic impact' = 'ds37_final'
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
