# Download the ElevenLabs generations for "The Royal Fool" (session/generation/signature per clip) and convert them to
# 48 kHz WAV in _sfx17\wav. Keys: fm* music, fa* ambience beds, fs* one-shots.
param([string]$OutDir = '_sfx17')
$ErrorActionPreference = 'Stop'
$base = 'https://elevenlabsusercontent.com/database/workspace/c3b65ba7fa3645889b631ecf682ef3d8/content_generation/'
$tail = '/content.mp3?Expires=1793800800&KeyName=assets-cdn-key-1&Signature='
$clips = [ordered]@{
  fa1_hall = 'rmga6dkQyinLZ8v0u2DN/iOwwuMyxrvPALNNcF7Pr|e44yuNisMb_NLxle4BkXzFoV0GY='; fa2_feast = 'D2UIvkVF0CC6vJOvrC3H/gYVn1puWZ8oHev3sh8Tq|-iE0plLYFzz885qeLbI2tnju6Uo='
  fa3_rain = 'U1zR6DME7p63fVp9AWV0/TuapKHd7h1kSE5jWIyU5|2Iz6zcAiYqKP6lUJXApqViyJzB0='; fa4_battle = 'Bceto86BKQkh9Pf2PqbM/ARz1BLThYsFbOMAdNMj6|2EipawKen6c1nwqI8MoJBatp9d0='
  fa5_after = '3jHXM8V0ZtupEBRpSPnu/H8PjsxbUVunpxpEswZjO|HkYvOrhaMaOfDd2cBDDgc6IEcqQ='; fs1_bells = 'SOgyE3AmW7aasi0ZkbO3/IeXtSHBUKgLGKSkvcsAo|bi_I9JVUste-GDF21p-FP04KaOA='
  fs2_applause = 'RnkqzipAyFfHrUqhdQuP/ynrATH0PuIhHp6nGEJyf|ynrTiF07ofH2PM_Uu4xLfKoZpLA='; fs3_whoosh = 'PK2WfcXja6Q1HYaTLave/MGkVN0HXb5V4lRr8NxGY|9ZyLanUfDF5EDv-NSH8g9hhMQZY='
  fs4_boom = 'xg0Fpb7dZiSma25WAZc6/6S0QrNvl5gwavcxxbLxU|znYyW_m1qBblDSgAOlm6IzasCX4='; fs5_heart = 'maZVWrtLLMq94obDn5YT/jvSAhfFAMkiqWO7fFvWj|sNFhuo0xZzAykQuQtS96ud09R9c='
  fs6_riser = 'ysNMokbaeFaVryqtbEy6/CiatEQx3rXG83KHxYwFk|Y8j16KsC59-anuaVXiRL4pgHliU='; fs7_juggle = 'x7ElV9mUJ5g6bSFmNYOG/UqdikXwDeHoYhJccKFGM|wqJDCv_awvyD3OY_y8kwqqxqQVs='
  fs8_laugh = 'jjSFv5rmM9OgLwHgWtyX/qNptyOdrNlalAAfbLeLo|T7oznvLWh_qN8jaQWSyjKKZB3Ng='; fs9_thunk = '7Ns3QepFwNjvAHLy9yVh/uCEinuwnfP74Hw2k6Vdv|5EaSZhe6PmakoSW3f4LaL-65mGQ='
  fs10_inhale = 'loelSiEhiE7SAwvYpJID/6S5XjraHPuQWEfuUPf1Q|HzMDc-ZGW48AUhiDGj_P3qkHpnw='; fs11_tokens = 'tB79kV50TXOXEAhuveU7/KduSOvPAmtYnahtiAMmz|km-An6RucjqAaMUXzu63_OwJ3SM='
  fs12_door = 'FI7O7DHvt7zCeOxOlxBm/uVywcD6oeIdrjyA8w73Y|E1ydvZBY_YcY_EZC53a6VQoy7rQ='; fs13_run = 'jhqSvgZGBiWhheBRT8F6/Zyvn27oHwUGpz2ggMzyJ|3C-FB03tCWcxvITNat6rzEqCNS4='
  fs14_slap = 'nMn26PYrCByvqfrKwB5D/vePedJ6nUryNGJENDTQW|wXCtIqkDUQxs3urV-SI-hEfovgE='; fs15_arrows = 'a221Br2keqRGq77NrJPP/r6lbcubu2C9HbN4TCxFV|0TmuhB8H4mtCKsnBifZ_o_HYsKI='
  fs16_fire = 'Mpv4UUZydfjpMO3lDV82/11OFuNaD8ltisv7Dezwm|9bevtJCOanBnGRm9CULocybglpk='; fs17_mast = 'V4NiAuY93r7tCbdFIPni/FV2OwjbvuEIUwJeofFZx|puntT7pDn3HYyBk0v3_aPB4RajY='
  fs18_page = 'f5rgoiRlh3efKweSrvXX/rEprL97bARIpgqmwlY3D|eWt4bYARF_YGnaJnns4id0wfEDg='; fs19_crow = '8HrQC8UUXzZ57y8433eg/JYVH2w9Q66nZH1g822BZ|coqxT-rkeOk49aKGUdnVP2K7JT0='
  fs20_rope = 'ItcYDzRtXF8zD6QhwufI/r0aLGSesXnFzWLqNjI3U|fVcKAZ18VJRcP9Be2LZNyULyfTM='; fs21_shove = '0SWo08WrbvAu66AAAaUg/Ey9IuU06uKTsUDSxp4y9|_SxNp5VbeTc63lzpP7bzpz132HQ='
  fs22_jig = 'gDIMdH2ySEn7MXjP5nOu/3ZEOQVwc2d9Us70gyJHB|jKiuMwD2ebBexvPTdCxHaAMj0GU='; fs23_gasp = 'Jqyfk3HpltD2yikjCfxn/V7SPEZ0j9eteayZKgVuS|UuXWADUJzvobZfDtcc3a732NDhA='
  fs24_jumpers = 'ysQMQAsRByk1tFUeN0f0/jev81kVxDUVsQYydcIs9|iGIB7vVPQAihgfZpvTnofB3zFP4='; fs25_plunge = '25rZ5Lg57kRpcSx7Wnkp/caDym1jRYEzjuLJzRKbj|WtPORqfktX-pZzknOqEFB6r0Mqo='
  fs26_surface = 'e9gOxGZPFnXtfNg0XgoI/hSW7ZXHQwEEHRHUpSBhu|RDX7ypQv9bRPyjaq1WldABEntG0='; fs27_drone = 'yKtzyLvc6ldsmfb00P4j/ZtHhU8iVFN7nEmEVOeqV|Pd-USuisyV7KJULPzzFy3RAfxeQ='
  fs28_grip = '7wM4B1Vid95dU12q9QQs/tEdU9hYNNJfFF8tVFRRV|-btCHZqFSkwYz9qSjtJlFCO53Vc='; fs29_roar = 'bXjtT5UFQWsHskkcDo8O/322MLYw66DfIW18nUy86|b1iBKiLrU1AD9PHFrV1vjW3XXeU='
  fs30_relief = 'tzp2VpiPIewUZd8r6zOL/GIj5vUjilzrWQMVwxmhF|Z2uVwE88vYhtoxHAfO6DFfEP3i4='; fs31_time = 'XA8DRg33Y0DP0jwpEtdB/RSaJU8gCFro1UdNIaphs|0qnVVNB2h3DZDCEN8ShezBxt8QU='
  fs32_sting = 'bxdwQOci4uR2UYbOhQ39/gHAgKwLLgZHBasjvVptw|CYMfIshNQ3LY4R3bi-JytV_P9vY='
}
$mp3 = Join-Path (Resolve-Path $OutDir).Path 'mp3'; $wav = Join-Path (Resolve-Path $OutDir).Path 'wav'
New-Item -ItemType Directory -Force $mp3, $wav | Out-Null
foreach ($k in $clips.Keys) {
  $p, $sig = $clips[$k].Split('|'); $dst = Join-Path $mp3 "$k.mp3"
  if (-not (Test-Path $dst)) { Invoke-WebRequest -Uri ($base + $p + $tail + $sig) -OutFile $dst -UseBasicParsing }
  if (-not (Test-Path (Join-Path $wav "$k.wav"))) { & "$PSScriptRoot\towavhq.ps1" -Src $dst -OutDir $wav -OutName "$k.wav" | Out-Null }
}
# the score: take B (it builds), as fm1_score
Copy-Item (Join-Path $wav 'score_b.wav') (Join-Path $wav 'fm1_score.wav') -Force
"clips: " + (Get-ChildItem $wav -Filter 'f*.wav').Count
