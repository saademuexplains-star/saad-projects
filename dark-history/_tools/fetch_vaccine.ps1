# Download finished ElevenLabs generations for "The First Vaccine" (saved creative_get_flow_run_status JSON files), naming them by prompt.
param([string[]]$Json, [string]$OutDir = '_sfx9')
$ErrorActionPreference = 'Stop'
$map = [ordered]@{
  'Dark cinematic 18th-century underscore' = 'vm1_surgery'; 'Feverish horror tension music' = 'vm2_fever'; 'Epic cinematic triumph music' = 'vm3_triumph'; 'Mournful plague-town music' = 'vm4_plague'
  "doctor's study room tone" = 'va1_study'; 'Grim village street during a plague' = 'va2_street'; 'Cow barn ambience' = 'va3_barn'; 'Night sickroom ambience' = 'va4_sick'; 'Dark hovel ambience' = 'va5_hovel'; 'Inside the human bloodstream' = 'va6_blood'
  'leather strap pulled tight' = 'vs1_strap'; "frightened sharp gasp" = 'vs2_gasp'; 'surgical lancet lifted' = 'vs3_lancet'; 'Deep cinematic impact boom' = 'vs4_boom'; 'slicing slowly through skin' = 'vs5_slice'
  'crying out in pain through clenched' = 'vs6_cry'; 'metallic blade shing' = 'vs7_shing'; 'blister being pierced' = 'vs8_squelch'; 'Young woman wincing' = 'vs9_wince'; 'rubbing and squishing in a fresh wound' = 'vs10_rub'
  'Deep low whoosh riser' = 'vs11_riser'; 'church bell toll' = 'vs12_bell'; 'Sick man groaning' = 'vs13_collapse'; 'Sick woman coughing' = 'vs14_cough'; 'Boy struggling and straining' = 'vs15_struggle'
  'A cow mooing' = 'vs16_moo'; 'Single deep heavy heartbeat' = 'vs17_heart'; 'Feverish child shivering' = 'vs18_shiver'; 'A rooster crowing' = 'vs19_rooster'; 'Old wooden door creaking' = 'vs20_door'
  "Dying man's wet rattling" = 'vs21_rattle'; 'Small blade scraping' = 'vs22_scrape'; 'pocket watch ticking' = 'vs23_watch'; 'Fast heavy heartbeat' = 'vs24_heartfast'; 'Deep sub bass drop' = 'vs25_drop'
  'Organic crunching and crackling' = 'vs26_crunch'; 'Quill pen scratching' = 'vs27_quill'; 'Huge final cinematic impact' = 'vs28_final'; 'Soft deep air whoosh' = 'vs29_whoosh'; 'Warm soft shimmering swell' = 'vs30_shimmer'
  'viscous liquid gloop' = 'vs31_gloop'; 'Low reverse swell' = 'vs32_reverse'; 'Young boy waking and sighing' = 'vs33_sigh'; "Mother's soft relieved sob" = 'vs34_relief'
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
