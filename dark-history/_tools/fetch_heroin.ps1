# Download finished ElevenLabs generations for "The Heroin Bottle" (saved creative_get_flow_run_status JSON files),
# naming them by prompt, then convert them to 48 kHz WAV in <OutDir>\wav.
param([string[]]$Json, [string]$OutDir = '_sfx14')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark Victorian chamber music underscore' = 'hm1_under'; 'Delicate antique music box lullaby' = 'hm2_lullaby'; 'Tense cinematic build, a steady ticking pulse' = 'hm3_spiral'
  'Warped detuned music box lullaby' = 'hm4_broken'; 'Dark orchestral reveal' = 'hm5_reveal'; 'Bright cheerful 1900s parlour piano' = 'hm6_parlour'
  'Quiet old kitchen at night' = 'ha1_kitchen'; "Silent child's bedroom at night" = 'ha2_bedroom'; 'Busy old pharmacy shop interior' = 'ha3_shopday'
  'Crowded shop at night in heavy rain' = 'ha4_shopnight'; "Old doctor's study at night" = 'ha5_study'; 'Deep dark ominous drone' = 'ha6_drone'
  'A little girl coughing hard' = 'hs1_cough'; "A small child's weak tired cough" = 'hs2_cough2'; 'picked up off a wooden shelf' = 'hs3_shelf'
  'Deep glassy zoom-in whoosh' = 'hs4_lens'; 'A large old wooden globe spinning' = 'hs5_globe'; 'Deep ominous bass swell' = 'hs6_swell'
  'Soft glassy shimmer whoosh' = 'hs7_shimmer'; 'Old shop door bell jingling' = 'hs8_shopbell'; 'A few heavy old coins' = 'hs9_coins'
  'Antique brass cash register' = 'hs10_register'; 'A small cardboard medicine box' = 'hs11_box'; 'A fingertip tapping twice' = 'hs12_tap'
  'A heavy glass bottle slid across' = 'hs13_glassslide'; 'A cork pulled out' = 'hs14_cork'; 'Thick syrup slowly poured' = 'hs15_pour'
  'A metal spoon lightly clinking' = 'hs16_spoon'; 'A small child swallowing' = 'hs17_swallow'; 'Gentle warm magical chime swell' = 'hs18_magic'
  'Fast cinematic time-lapse whoosh' = 'hs19_timelapse'; 'A tired woman exhaling' = 'hs20_sigh'; 'A wall clock ticking very fast' = 'hs21_clockfast'
  'A single drop of liquid falling' = 'hs22_drop'; 'A metal spoon rattling and trembling' = 'hs23_rattle'; 'A woman groaning in pain' = 'hs24_groan'
  'One heavy deep heartbeat thump' = 'hs25_heart'; 'A little girl screaming and sobbing' = 'hs26_scream'; 'Warm deep whoosh sweeping past' = 'hs27_sweep'
  'Many empty glass bottles clinking' = 'hs28_bottles'; 'A large newspaper page turned' = 'hs29_page'; 'Metal spectacles folded' = 'hs30_glasses'
  "An old man's heavy guilty sigh" = 'hs31_mansigh'; 'An empty glass bottle slipping' = 'hs32_bottledrop'; 'A small glass bottle rolling slowly' = 'hs33_roll'
  'Dark cinematic riser building tension' = 'hs34_riser'; 'Huge deep cinematic impact boom' = 'hs35_impact'; 'Deep reversed whoosh sucking inward' = 'hs36_reverse'
  'Deep cinematic sub bass boom hit' = 'hs37_boom'; 'Soft deep swoosh with a muffled bass thump' = 'hs38_soft'; 'A little girl breathing softly' = 'hs39_sleep'
  'A wooden door creaking slowly open' = 'hs40_door'; 'A woman gulping down a spoonful' = 'hs41_gulp'; "A woman's sharp shaky trembling breath" = 'hs42_breath'
  # second flow (music model cues and the new one-shots)
  'turn-of-the-century parlour piano rag' = 'hm7_parlour'; 'Tense cinematic build: a steady ticking clock pulse' = 'hm8_spiral'; 'Harrowing cinematic horror cue' = 'hm9_withdraw'
  'Slow mournful orchestral dirge' = 'hm10_dirge'; 'A heavy official stamp slammed' = 'hs43_stamp'; 'Heavy rain on a window pane at night' = 'ha7_rain'
  'A little girl sobbing weakly' = 'hs49_sob'; 'A deep church bell tolling once' = 'hs51_bell'; 'A deep cinematic braam' = 'hs52_braam'; 'A thick bundle of papers' = 'hs46_papers'
}
New-Item -ItemType Directory -Force $OutDir | Out-Null
$root = (Resolve-Path $OutDir).Path; $mp3 = Join-Path $root 'mp3'; $wav = Join-Path $root 'wav'
New-Item -ItemType Directory -Force $mp3, $wav | Out-Null
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
