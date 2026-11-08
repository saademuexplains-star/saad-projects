# Download finished ElevenLabs generations listed in a saved creative_get_flow_run_status JSON, naming them by prompt.
param([string]$Json, [string]$OutDir = '_sfx3')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark cinematic medieval underscore' = 'm1_underscore'; 'Suspense music build' = 'm2_suspense'; 'Medieval feast music' = 'm3_minstrels'; 'Dark orchestral climax' = 'm4_climax'
  'Medieval banquet hall ambience' = 'a1_hall'; 'Night village ambience' = 'a2_village'; 'Quiet castle dining room' = 'a3_dining'
  'Magical golden shimmer' = 's1_shimmer'; 'Metal spoon placed into a hand' = 's2_spoonclink'; 'Heavy silver platter' = 's3_platter'; 'Spoon scooping' = 's4_scoop'
  'chewing food nervously' = 's5_chewgulp'; "Old fat king's hearty" = 's6_kinglaugh'; 'revolver cylinder spinning' = 's7_spinwhoosh'; 'Single revolver cylinder click' = 's8_click'
  'Metal spoon spinning' = 's9_spoonspin'; 'Silver dome cloche' = 's10_cloche'; 'Fast deep downward' = 's11_tiltwhoosh'; 'Crunchy bite into roasted meat' = 's12_bite'
  'Tinnitus' = 's13_tinnitus'; 'Dreamy deep reverse swell' = 's14_bokeh'; 'Low ominous drone swelling' = 's15_vertigo'; 'Dagger slowly drawn' = 's16_dagger'
  'Sharp metallic blade glint' = 's17_shing'; 'Thick liquid drops' = 's18_drops'; 'Deep cinematic impact boom preceded' = 's19_impactrev'; 'Sizzling burning embers' = 's20_sizzle'
  'Glass slowly cracking' = 's21_glass'; 'Single small water droplet' = 's22_droplet'; 'suppressing a cough' = 's23_cough'; 'Cloth swoosh' = 's24_swoosh'
  'Deep menacing sub bass boom' = 's25_subboom'; 'Deep dark whoosh sucked' = 's26_darkwhoosh'; 'Hammer striking a nail' = 's27_hammer'; 'Muffled woman and children' = 's28_screams'
  'Burning torch thrown' = 's29_torch'; 'Dry thatched roof' = 's30_rooffire'; 'Big fire roar shrinking' = 's31_firecandle'; 'Fat old king bursting' = 's32_kinglaugh2'
  'Huge greedy bite' = 's33_bigbite'; 'Old man choking' = 's34_choke'; 'Heavy body collapsing' = 's35_collapse'; 'Heavy gold crown falling' = 's36_crown'
  'Metal goblet tipping' = 's37_spill'; 'Medieval banquet hall chaos' = 's38_chaos'; 'Small glass vial slipped' = 's39_vial'; 'Dark menacing male whisper' = 's40_whisper'
  'Short dark brass fanfare' = 's41_fanfare'; 'Armored guards kneeling' = 's42_kneel'; 'Dark cinematic riser' = 's43_riser'; 'Heavy metal spoon clinks' = 'x_spoonplate'
}
$j = Get-Content $Json -Raw | ConvertFrom-Json
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
