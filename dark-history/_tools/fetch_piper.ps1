# Download finished ElevenLabs generations for "The Pied Piper" (saved creative_get_flow_run_status JSON files),
# naming them by prompt, then convert them to 48 kHz WAV in <OutDir>\wav. Also copies the reused clips from earlier
# productions into the same folder.
param([string[]]$Json, [string]$OutDir = '_sfx16')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark cinematic medieval suspense score' = 'pm1_score'; 'A lone medieval wooden pipe' = 'pm2_pipe'; 'A slow, delicate music box' = 'pm3_box'
  'Medieval town square ambience' = 'pa1_square'; 'A long line of many children skipping' = 'pa2_dance'; 'Lonely wind gusting over a bare grassy hilltop' = 'pa3_wind'
  'Dawn in a medieval walled town' = 'pa4_dawn'; 'Medieval street ambience heard from an upstairs window' = 'pa5_street'
  'A small leather ball dropping' = 'ps1_ball'; 'A wooden hoop wobbling' = 'ps2_hoop'; 'Hands kneading soft bread dough' = 'ps3_knead'
  "A mother's single anguished wordless scream" = 'ps4_scream'; 'A woman running fast on a dirt road' = 'ps5_run'; 'A woman completely out of breath' = 'ps6_pant'
  'A wooden walking stick tapping' = 'ps7_stick'; 'Dark cinematic stinger' = 'ps8_sting'
}
$reuse = @{
  '_sfx13\wav' = @('ra1_wind', 'wa2_fields', 'ws35_rooster', 'ts31_suck', 'ts15_heart', 'ts30_impact', 's25_subboom', 's26_darkwhoosh', 's24_swoosh', 'ws25_sweep', 's11_tiltwhoosh', 's43_riser', 's1_shimmer', 'ws30_morph', 'rs4_sob', 'ts21_gasp', 'ts16_steps', 's13_tinnitus', 'ws31_impact', 'ts29_sting', 's19_impactrev')
  '_sfx14\wav' = @('ha1_kitchen', 'ha2_bedroom', 'ha6_drone', 'hs25_heart', 'hs35_impact', 'hs37_boom', 'hs27_sweep', 'hs36_reverse', 'hs34_riser', 'hs7_shimmer', 'hs18_magic', 'hs29_page', 'hs49_sob', 'hs20_sigh', 'hs42_breath', 'hs52_braam', 'hs6_swell', 'hs38_soft')
}
New-Item -ItemType Directory -Force $OutDir | Out-Null
$root = (Resolve-Path $OutDir).Path; $mp3 = Join-Path $root 'mp3'; $wav = Join-Path $root 'wav'
New-Item -ItemType Directory -Force $mp3, $wav | Out-Null
foreach ($d in $reuse.Keys) { foreach ($k in $reuse[$d]) { $s = Join-Path $d "$k.wav"; if ((Test-Path $s) -and -not (Test-Path (Join-Path $wav "$k.wav"))) { Copy-Item $s $wav } } }
$got = 0; $pending = @()
foreach ($jf in $Json) {
  $j = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $jf).Path) | ConvertFrom-Json
  foreach ($g in $j.generations) {
    $key = $null; foreach ($k in $map.Keys) { if ($g.prompt -like "*$k*") { $key = $map[$k]; break } }
    if (-not $key) { "unmapped prompt: $($g.prompt)"; continue }
    if ($g.status -ne 'completed' -or -not $g.content_url) { $pending += $key; continue }
    $dst = Join-Path $mp3 "$key.mp3"
    if (-not (Test-Path $dst)) { Invoke-WebRequest -Uri $g.content_url -OutFile $dst -UseBasicParsing }
    if (-not (Test-Path (Join-Path $wav "$key.wav"))) { & "$PSScriptRoot\towavhq.ps1" -Src $dst -OutDir $wav -OutName "$key.wav" | Out-Null }
    $got++
  }
}
"downloaded/present: $got ; not ready: $($pending -join ', ') ; wav total: $((Get-ChildItem $wav -Filter *.wav).Count)"
