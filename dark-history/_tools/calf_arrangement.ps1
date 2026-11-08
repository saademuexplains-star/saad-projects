# The arrangement for "The Calf's Blood" (dot-sourced by mix_calf.ps1, which defines E, $T and [LeechMix]).
$music = @(
  # the street and the study: the eerie harpsichord
  (E 'cm1_paris' 0 0.55 @{ Loop = $true; Len = 8.0; FadeIn = 0.01; FadeOut = 0.9; AutoT = [double[]](0, 3.6, 6.0, 7.4); AutoG = [double[]](0.95, 0.85, 1.0, 1.1) }),
  # the transfusion: the pulse building to the heartbeat, held through "he doesn't stop"
  (E 'cm2_trans' 7.1 0.55 @{ Loop = $true; Len = 12.9; FadeIn = 0.8; FadeOut = 0.7; AutoT = [double[]](7.1, 9.2, 12.8, 14.7, 16.0, 17.9, 19.2); AutoG = [double[]](0.65, 0.8, 0.95, 1.1, 1.2, 1.25, 1.1) }),
  # the vigil: the harpsichord again, low and slow
  (E 'cm1_paris' 19.5 0.42 @{ Loop = $true; Off = 9.0; Len = 4.9; FadeIn = 0.6; FadeOut = 1.2 }),
  # the morning and the miracle
  (E 'cm3_dawn' 23.4 0.55 @{ Loop = $true; Len = 5.6; FadeIn = 1.0; FadeOut = 0.6; AutoT = [double[]](23.4, 24.6, 26.6, 28.0); AutoG = [double[]](0.7, 0.95, 1.1, 1.05) }),
  # the relapse, the door, the second dose, the death (it drops out under "you die"), the court
  (E 'cm4_doom' 28.3 0.5 @{ Loop = $true; Len = 11.15; FadeIn = 0.5; FadeOut = 0.35; AutoT = [double[]](28.3, 30.2, 32.5, 34.8, 37.2, 38.6); AutoG = [double[]](0.75, 0.9, 0.8, 0.95, 1.2, 1.25) }),
  # (a second pass 11 s further into the cue fills the drum cue's own breaks)
  (E 'cm4_doom' 28.3 0.32 @{ Loop = $true; Off = 11.0; Len = 11.15; FadeIn = 0.6; FadeOut = 0.35; AutoT = [double[]](28.3, 31.0, 32.3, 33.8, 36.5, 38.0); AutoG = [double[]](0.6, 1.0, 1.75, 1.25, 1.1, 1.2) }),
  (E 'cm4_doom' 39.75 0.55 @{ Loop = $true; Off = 11.0; Len = 4.6; FadeIn = 0.5; FadeOut = 0.6; AutoT = [double[]](39.75, 41.6, 42.8, 44.0); AutoG = [double[]](0.8, 1.05, 1.15, 1.0) }),
  # the reveal: the music box under the wife's cold look, running into the loop seam
  (E 'cm5_reveal' 43.95 0.6 @{ Len = ($T - 43.95); FadeIn = 0.5; FadeOut = 0.01; AutoT = [double[]](43.95, 45.6, 46.5); AutoG = [double[]](0.85, 1.1, 1.2) })
)
$amb = @(
  (E 'ca1_night' 0 1.0 @{ Loop = $true; Len = 4.3; FadeOut = 0.5 }),
  (E 'ca2_study' 3.6 1.0 @{ Loop = $true; Len = 4.3; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca3_surgery' 7.3 1.0 @{ Loop = $true; Len = 12.6; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'ca4_home' 19.45 1.0 @{ Loop = $true; Len = 7.3; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'ca5_crowd' 26.5 1.0 @{ Loop = $true; Len = 2.5; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'ca8_hearth' 28.4 0.6 @{ Loop = $true; Len = 3.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca6_dusk' 31.95 1.0 @{ Loop = $true; Len = 2.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca3_surgery' 34.3 0.85 @{ Loop = $true; Off = 3.0; Len = 5.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca7_court' 39.7 1.0 @{ Loop = $true; Len = 4.6; FadeIn = 0.4; FadeOut = 0.4; AutoT = [double[]](39.7, 42.8, 43.3); AutoG = [double[]](1.0, 1.0, 0.45) }),
  (E 'ca8_hearth' 43.9 1.0 @{ Loop = $true; Len = ($T - 43.9 - 0.4); FadeIn = 0.4; FadeOut = 0.4 }),
  # the street at night comes back under the loop dissolve and runs straight on into t = 0
  (E 'ca1_night' ($T - 0.6) 1.0 @{ Loop = $true; Off = [LeechMix]::Dur('ca1_night') - 0.6; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  # the street: the downbeat, the mad laugh, the muttering, the crow off the lamp, the tilt up
  @('cs2_boom', 0.02, 0.45, 'p'), @('cs5_madlaugh', 0.45, 0.7, 's'), @('cs3_heart', 1.3, 0.4, 'p'), @('cs7_crow', 1.95, 0.55, 's'), @('cs6_mutter', 2.1, 0.5, 's'), @('cs1_whoosh', 3.9, 0.45, 'p'),
  # the study: the quill on the drawing, the push into the calf's eye
  @('cs8_quill', 4.75, 0.45, 's'), @('cs8_quill', 5.9, 0.4, 's'), @('cs4_riser', 7.55, 0.4, 'p'), @('cs1_whoosh', 7.55, 0.3, 'p'),
  # the transfusion: the gentle calf, your struggle, the silver tube, the puncture, the blood, the burn, the scream, the heart
  @('cs9_calf', 8.15, 0.55, 's'), @('cs11_struggle', 9.35, 0.65, 's'), @('cs12_metal', 10.55, 0.5, 's'), @('cs13_pierce', 11.35, 0.9, 'p'), @('cs17_groan', 11.45, 0.55, 's'),
  @('cs3_heart', 12.3, 0.45, 'p'), @('cs14_flow', 12.85, 0.7, 's', @{ Len = 2.0; FadeOut = 0.4 }), @('cs10_calfscared', 13.35, 0.5, 's'), @('cs16_burn', 14.7, 0.6, 's'), @('cs2_boom', 14.85, 0.3, 'p'),
  @('cs15_scream', 15.9, 0.5, 's'), @('cs3_heart', 16.98, 0.8, 'p'), @('cs2_boom', 16.98, 0.3, 'p'), @('cs3_heart', 17.33, 0.75, 'p'), @('cs3_heart', 17.68, 0.7, 'p'), @('cs12_metal', 18.6, 0.4, 's'),
  @('cs4_riser', 19.7, 0.35, 'p'), @('cs18_drip', 19.95, 0.65, 's'),
  # the vigil: the drip in the pot, the priest's prayer, the heart at "die", the rooster and the birds, your calm breath
  @('cs18_drip', 20.95, 0.5, 's'), @('cs19_pray', 21.8, 0.5, 's'), @('cs3_heart', 23.15, 0.45, 'p'), @('cs20_rooster', 23.85, 0.45, 's'), @('cs21_birds', 24.2, 0.55, 's'), @('cs22_breath', 24.9, 0.65, 's'), @('cs1_whoosh', 26.85, 0.35, 'p'),
  # the miracle: the bells, the cheer
  @('cs23_bells', 26.7, 0.55, 's'), @('cs24_cheer', 27.0, 0.55, 's'),
  # the relapse: the snarl, the bowl smashing, the struggle as she drags you, the sheet across the lens
  @('cs1_whoosh', 28.7, 0.3, 'p'), @('cs26_snarl', 29.15, 0.65, 's'), @('cs25_smash', 29.91, 0.9, 'p'), @('cs2_boom', 29.91, 0.3, 'p'), @('cs11_struggle', 30.6, 0.45, 's'), @('cs1_whoosh', 32.3, 0.4, 'p'),
  # the door: it swings half shut, she begs
  @('cs27_door', 32.85, 0.5, 's'), @('cs28_womancry', 33.7, 0.55, 's'), @('cs3_heart', 34.05, 0.45, 'p'),
  # the second dose: the tube, the puncture, the blood, the fit, the calf, your last breath, the boom on "die", the candle
  @('cs12_metal', 35.2, 0.45, 's'), @('cs13_pierce', 36.0, 0.85, 'p'), @('cs14_flow', 36.05, 0.55, 's', @{ Len = 1.2; FadeOut = 0.3 }), @('cs4_riser', 37.2, 0.4, 'p'),
  @('cs29_convulse', 37.2, 0.85, 's'), @('cs10_calfscared', 37.35, 0.45, 's'), @('cs30_lastbreath', 38.75, 0.7, 's'), @('cs2_boom', 39.4, 0.7, 'p'), @('cs31_snuff', 39.15, 0.6, 's'), @('cs1_whoosh', 40.0, 0.4, 'p'),
  # the court: the doors, the dragging, the hit on "murder", the paper, the gasp, the push into the paper
  @('cs32_doors', 39.95, 0.55, 'p'), @('cs33_drag', 40.05, 0.55, 's'), @('cs2_boom', 42.1, 0.5, 'p'), @('cs35_paper', 43.0, 0.6, 's'), @('cs34_gasp', 43.2, 0.55, 's'), @('cs1_whoosh', 44.1, 0.35, 'p'),
  # the hearth: the powder, the spoon, the sting on "the whole time", a last heartbeat into the loop
  @('cs36_powder', 44.6, 0.6, 's'), @('cs37_stir', 45.2, 0.5, 's'), @('cs38_sting', 45.7, 0.7, 'p'), @('cs3_heart', 46.35, 0.45, 'p')
)
$seamKey = 'cm1_paris'; $seamGain = 0.55 * 0.95
