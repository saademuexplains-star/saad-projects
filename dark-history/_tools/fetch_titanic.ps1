# Download finished ElevenLabs generations for "The Stoker" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx6')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark cinematic suspense underscore' = 'm1_underscore'; 'Horror tension build music' = 'm2_build'; 'Epic cinematic action climax' = 'm3_climax'; 'Tragic cinematic music' = 'm4_tragic'; 'ballroom string quartet waltz' = 'm5_waltz'
  'Ship boiler room ambience' = 'a1_boiler'; 'Freezing calm ocean at night' = 'a2_ocean'; 'Flooding ship compartment' = 'a3_flood'; 'Chaotic ship deck at night' = 'a4_deck'; 'Echoing iron stairwell' = 'a5_stairs'
  'Deep cinematic bass hit impact' = 's1_impact'; 'Steel shovel scraping' = 's2_shovel'; 'Long deep cinematic riser' = 's3_riser'; 'Soft deep shimmering whoosh' = 's4_shimmer'; 'Huge iceberg scraping' = 's5_scrape'
  'Steel rivets popping' = 's6_rivets'; 'Massive torrent of seawater' = 's7_burst'; 'Deep wet zoom-in whoosh' = 's8_zoomhit'; 'Man startled sharp gasp' = 's9_gasp'; 'Loud old ship alarm bell' = 's10_bell'
  'Fast bassy swish whoosh moving upward' = 's11_upwhoosh'; 'Heavy brass lever' = 's12_lever'; 'Heavy iron door sliding slowly' = 's13_doorgrind'; 'Man sprinting through chest-deep water' = 's14_wade'; 'Body diving into water' = 's15_dive'
  'Massive heavy steel door slamming' = 's16_slam'; 'Man screaming in pain' = 's17_scream'; 'Desperate trapped men' = 's18_shouts'; 'Fabric tearing and men grunting' = 's19_struggle'; 'Wet leather boot' = 's20_rip'
  'Huge violent burst of steam' = 's21_steam'; 'Huge boiler explosion' = 's22_explosion'; 'Thick steel door bending' = 's23_bend'; 'Limping uneven footsteps' = 's24_steps'; 'Exhausted man panting' = 's25_breath'
  'Heavy ship door bursting open' = 's26_dooropen'; 'Single loud pistol gunshot' = 's27_gunshot'; 'Revolver hammer cocking' = 's28_cock'; 'Iron gate slamming shut' = 's29_gate'; 'Wooden lifeboat creaking' = 's30_lifeboat'
  'Reverse cymbal swell' = 's31_swell'; 'Two slow deep heavy heartbeats' = 's32_heartbeat'; 'Deep bassy cinematic whoosh passing' = 's33_whoosh'; 'Deep wet underwater whoosh' = 's34_wetwhoosh'
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

