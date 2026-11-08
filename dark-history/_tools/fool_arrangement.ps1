# The arrangement for "The Royal Fool" (dot-sourced by mix_fool.ps1, which defines E, $T and [LeechMix]).
# One continuous score (take B of the ElevenLabs music model) plays from 0.8 s into itself; its own tail fades, so from
# 52.6 s a second pass of it, 25 s (ten bars at 96 BPM) earlier - the nervous jester section - carries it on to the
# loop seam, where it crossfades into the score's opening.
$seamOff = 0.8
$music = @(
  (E 'fm1_score' 0 0.62 @{ Off = $seamOff; Len = 53.4; FadeIn = 0.01; FadeOut = 0.8;
    AutoT = [double[]](0, 10.35, 10.75, 12.3, 12.7, 16.3, 16.9, 25.0, 38.9, 39.5, 44.3, 44.8, 47.8, 50.2, 50.8, 52.6); AutoG = [double[]](1.0, 1.0, 0.55, 0.55, 0.78, 0.78, 0.9, 0.95, 0.95, 0.5, 0.55, 0.82, 0.9, 0.9, 0.62, 0.9) }),
  (E 'fm1_score' 52.6 0.62 @{ Off = (52.6 + $seamOff - 25.0); Len = ($T - 52.6); FadeIn = 0.8; FadeOut = 0.01; AutoT = [double[]](52.6, 54.0, 55.5); AutoG = [double[]](0.9, 1.0, 1.05) })
)
$amb = @(
  (E 'fa1_hall' 0 0.8 @{ Loop = $true; Len = 5.6; FadeOut = 0.5 }),
  (E 'fa2_feast' 5.0 1.0 @{ Loop = $true; Len = 7.9; FadeIn = 0.4; FadeOut = 0.5; AutoT = [double[]](5.0, 10.3, 10.8, 12.9); AutoG = [double[]](1.0, 1.0, 0.25, 0.25) }),
  (E 'fa3_rain' 12.2 0.4 @{ Loop = $true; Len = 4.9; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'fa4_battle' 16.4 0.65 @{ Loop = $true; Len = 4.1; FadeIn = 0.3; FadeOut = 0.6 }),
  (E 'fa5_after' 19.8 1.0 @{ Loop = $true; Len = 2.6; FadeIn = 0.5; FadeOut = 0.4 }),
  (E 'fa3_rain' 21.7 1.0 @{ Loop = $true; Off = 5.0; Len = 6.0; FadeIn = 0.4; FadeOut = 0.4; AutoT = [double[]](21.7, 24.6, 25.6, 27.6); AutoG = [double[]](0.36, 0.4, 0.75, 0.8) }),
  (E 'fa1_hall' 27.05 0.9 @{ Loop = $true; Off = 5.6; Len = 9.15; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'fa5_after' 36.1 1.0 @{ Loop = $true; Off = 8.0; Len = 2.1; FadeIn = 0.2; FadeOut = 0.3 }),
  (E 'fa1_hall' 37.7 0.9 @{ Loop = $true; Off = 14.0; Len = ($T - 37.7); FadeIn = 0.3; FadeOut = 0.5; AutoT = [double[]](37.7, 39.3, 39.8, 44.4, 45.0, 50.5, 52.6); AutoG = [double[]](1.0, 1.0, 0.35, 0.35, 0.8, 0.8, 1.0) }),
  # the hall comes back under the loop seam and runs straight on into t = 0
  (E 'fa1_hall' ($T - 0.6) 0.8 @{ Loop = $true; Off = [LeechMix]::Dur('fa1_hall') - 0.6; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  # the cap: settled, flicked, the bells; the court applauds; a low hit on "one strange right"
  @('fs1_bells', 0.95, 0.3, 's'), @('fs1_bells', 1.42, 0.85, 'p'), @('fs2_applause', 2.0, 0.6, 's'), @('fs4_boom', 4.45, 0.35, 'p'), @('fs3_whoosh', 5.4, 0.45, 'p'),
  # the feast and the juggling; the laugh cut dead; heartbeats; the dagger in the floor; the held breath
  @('fs3_whoosh', 8.06, 0.35, 'p'), @('fs7_juggle', 8.1, 0.6, 's'), @('fs7_juggle', 9.75, 0.55, 's', @{ Len = 0.7; FadeOut = 0.15 }), @('fs8_laugh', 8.4, 0.7, 's', @{ Len = 2.05; FadeOut = 0.25 }),
  @('fs5_heart', 10.75, 0.7, 'p'), @('fs5_heart', 11.15, 0.65, 'p'), @('fs9_thunk', 11.35, 0.55, 'p'), @('fs5_heart', 11.9, 0.6, 'p'), @('fs5_heart', 12.3, 0.55, 'p'),
  @('fs3_whoosh', 12.55, 0.3, 'p'),
  # the war room: the downbeat on 1340, the tokens, the door, the running messenger, the letter, the dive into the map
  @('fs4_boom', 12.68, 0.5, 'p'), @('fs11_tokens', 12.7, 0.4, 's'), @('fs11_tokens', 13.9, 0.3, 's'), @('fs12_door', 14.5, 0.42, 'p'), @('fs13_run', 14.95, 0.22, 's'), @('fs14_slap', 15.8, 0.42, 'p'), @('fs18_page', 15.84, 0.28, 's', @{ Len = 0.45; FadeOut = 0.15 }),
  @('fs6_riser', 16.75, 0.5, 'p'), @('fs3_whoosh', 16.75, 0.4, 'p'),
  # Sluys: the hit on "trapped", arrow volleys, the fire, the mast; the smoke into the evening; the sting on "dead"
  @('fs4_boom', 16.95, 0.55, 'p'), @('fs15_arrows', 17.3, 0.5, 's'), @('fs15_arrows', 18.6, 0.4, 's'), @('fs16_fire', 19.25, 0.4, 's'), @('fs17_mast', 19.6, 0.5, 's'), @('fs3_whoosh', 20.1, 0.24, 'p'),
  @('fs32_sting', 21.45, 0.6, 'p'),
  # the council: the page across the lens, the letter pushed about, out through the window, the rope, the crow, the sting
  @('fs18_page', 22.05, 0.7, 'p'), @('fs11_tokens', 22.2, 0.35, 's'), @('fs11_tokens', 23.25, 0.12, 's'), @('fs3_whoosh', 25.4, 0.35, 'p'), @('fs20_rope', 25.7, 0.6, 's'), @('fs19_crow', 26.0, 0.36, 's'),
  @('fs32_sting', 27.2, 0.3, 'p'),
  # the doors burst, the shove, the bells; the jig up the hall
  @('fs3_whoosh', 27.35, 0.4, 'p'), @('fs12_door', 27.28, 0.8, 'p'), @('fs21_shove', 27.45, 0.75, 's'), @('fs1_bells', 27.6, 0.5, 'p'), @('fs22_jig', 28.6, 0.65, 's'), @('fs22_jig', 29.4, 0.5, 's'),
  # the King laughs
  @('fs3_whoosh', 32.15, 0.35, 'p'), @('fs8_laugh', 32.2, 0.8, 's', @{ Len = 1.1; FadeOut = 0.3 }),
  # the ship your hand makes; into the sea; the men leaping; up again; your bells as you salute
  @('fs3_whoosh', 33.95, 0.3, 'p'), @('fs16_fire', 36.2, 0.4, 's'), @('fs25_plunge', 36.35, 0.6, 'p'), @('fs24_jumpers', 36.35, 0.7, 's'), @('fs26_surface', 37.9, 0.55, 'p'), @('fs1_bells', 38.2, 0.4, 'p'),
  # the laugh dies: the hit, the drone, the court's breath, the grip, the heart
  @('fs3_whoosh', 39.25, 0.3, 'p'), @('fs4_boom', 39.5, 0.55, 'p'), @('fs27_drone', 39.3, 0.6, 's'), @('fs23_gasp', 39.45, 0.4, 's'), @('fs5_heart', 40.5, 0.6, 'p'), @('fs28_grip', 41.25, 0.7, 's'),
  @('fs5_heart', 41.5, 0.6, 'p'), @('fs5_heart', 42.4, 0.42, 'p'), @('fs5_heart', 43.3, 0.65, 'p'), @('fs3_whoosh', 43.48, 0.35, 'p'), @('fs5_heart', 44.0, 0.7, 'p'),
  # the rage: his roars, the hit, the lords' gasp; your breath out
  @('fs3_whoosh', 44.62, 0.3, 'p'), @('fs29_roar', 44.4, 0.42, 's'), @('fs4_boom', 44.9, 0.4, 'p'), @('fs29_roar', 46.3, 0.28, 's'), @('fs23_gasp', 46.6, 0.3, 's'), @('fs30_relief', 51.25, 0.28, 's'),
  # the days pass; the doors again, the messenger, the shove, the bells, the riser into the loop
  @('fs31_time', 51.5, 0.18, 's'), @('fs3_whoosh', 51.67, 0.22, 'p'), @('fs12_door', 52.7, 0.75, 'p'), @('fs13_run', 52.85, 0.45, 's'), @('fs21_shove', 54.2, 0.52, 's'), @('fs1_bells', 54.45, 0.4, 'p'),
  @('fs5_heart', 55.9, 0.55, 'p'), @('fs6_riser', 56.1, 0.45, 'p')
)
$seamKey = 'fm1_score'; $seamGain = 0.62
