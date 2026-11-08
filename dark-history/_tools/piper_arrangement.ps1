# The arrangement for "The Pied Piper" (dot-sourced by mix_piper.ps1, which defines E, $T and [LeechMix]).
# One constant score under the film, and the Piper's own tune on top of it, heard in every place he passes (loud in the
# street, faint through the kitchen wall, distant on the hill). Both stop dead just before "the music has stopped":
# from there only the wind, a heartbeat on "No bodies. No footprints. Nothing.", a drone under the three left behind,
# a music box at bedtime. The score comes back at dusk and peaks on his name; his tune swells back in across the loop
# seam, so frame 0 starts with it again. (After a beat of dead silence a dark drone carries the music track through
# the empty hilltop, so the suspense never drops.)
$CUT = 27.0
# music elements playing at t = 0 (key, offset at t = 0, gain): the loop seam crossfades into exactly these
$seams = @(@('pm1_score', 0.7, 0.62), @('pm2_pipe', 0, 1.0))
$pipeEnd = 45.0
$music = @(
  (E 'pm1_score' 0 0.62 @{ Off = 0.7; Len = $CUT; FadeIn = 0.00001; FadeOut = 0.08 }),
  # the score returns under the dusk and builds into the name
  (E 'pm1_score' 42.0 0.62 @{ Off = 40.4; Len = $T - 42.0; FadeIn = 1.4; FadeOut = 0.01 }),
  # his tune: the street, through the kitchen wall (muffled), under the window, out on the road, far up the hill
  (E 'pm2_pipe' 0 1.0 @{ Off = 0; Len = 9.7; FadeIn = 0.00001; FadeOut = 0.12; AutoT = @(5.9, 6.6, 8.5); AutoG = @(1.0, 0.85, 0.85) }),
  (E 'pm2_pipe' 9.58 0.38 @{ Off = 9.58; Len = 2.66; FadeIn = 0.12; FadeOut = 0.15; Lp = 1400 }),
  (E 'pm2_pipe' 12.09 0.72 @{ Off = 12.09; Len = 3.91; FadeIn = 0.15; FadeOut = 0.15 }),
  (E 'pm2_pipe' 15.85 0.72 @{ Off = 0; Len = $CUT - 15.85; FadeIn = 0.15; FadeOut = 0.06; AutoT = @(18.2, 19.0, 22.2, 23.0); AutoG = @(1.0, 0.76, 0.76, 0.58) }),
  # after a beat of dead silence a low dark drone creeps in and holds the suspense under the empty hill and the three
  (E 'ha6_drone' 28.25 0.45 @{ Loop = $true; Len = 10.6; FadeIn = 1.6; FadeOut = 0.7; AutoT = @(31.0, 32.0); AutoG = @(1.0, 1.15) }),
  # the bedtime lullaby
  (E 'pm3_box' 38.5 0.7 @{ Off = 0.8; Len = 3.9; FadeIn = 0.3; FadeOut = 0.45 }),
  # his tune again, faint at first, under the reveal; it reaches the clip's end exactly at T and runs on into frame 0
  (E 'pm2_pipe' $pipeEnd 0.4 @{ Off = [LeechMix]::Dur('pm2_pipe') - ($T - $pipeEnd); Len = $T - $pipeEnd; FadeIn = 1.6; FadeOut = 0.00001; AutoT = @(46.5, 49.0); AutoG = @(1.0, 1.55) })
)
$D = { param($k) [LeechMix]::Dur($k) }
$amb = @(
  (E 'pa4_dawn' 0 0.8 @{ Loop = $true; Len = 6.4; FadeIn = 0.00001; FadeOut = 0.4 }),
  # the square: children at play, then nothing but the tune and the birds when they all stop at once
  (E 'pa1_square' 5.9 0.95 @{ Loop = $true; Len = 0.78; FadeIn = 0.25; FadeOut = 0.16 }),
  (E 'pa4_dawn' 6.4 0.5 @{ Loop = $true; Off = 2.0; Len = 3.3; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'pa2_dance' 8.1 0.42 @{ Loop = $true; Len = 1.8; FadeIn = 0.5; FadeOut = 0.4 }),
  (E 'ha1_kitchen' 9.5 0.7 @{ Loop = $true; Len = 2.9; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'pa5_street' 11.8 0.85 @{ Loop = $true; Len = 6.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'wa2_fields' 18.1 0.6 @{ Loop = $true; Len = 4.7; FadeIn = 0.3; FadeOut = 0.5 }),
  (E 'pa2_dance' 18.2 0.62 @{ Loop = $true; Off = 3.0; Len = 7.9; FadeIn = 0.4; FadeOut = 0.5; AutoT = @(22.2, 23.0); AutoG = @(1.0, 1.2) }),
  # the hill and the hilltop: the wind takes over when the music is gone
  (E 'pa3_wind' 22.2 0.4 @{ Loop = $true; Len = 19.9; FadeIn = 0.6; FadeOut = 0.5; AutoT = @(26.8, 27.3, 38.0, 38.9); AutoG = @(1.0, 1.9, 1.5, 0.75) }),
  (E 'ha2_bedroom' 38.4 0.6 @{ Loop = $true; Len = 3.95; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'pa3_wind' 41.7 0.42 @{ Loop = $true; Off = 4.0; Len = $T - 41.7 - 0.2; FadeIn = 0.4; FadeOut = 0.5 }),
  # the dawn street again under the last zoom into his eyes (it reaches its own start at T and runs on into frame 0)
  (E 'pa4_dawn' 49.03 0.8 @{ Loop = $true; Off = (& $D 'pa4_dawn') - ($T - 49.03); Len = $T - 49.03; FadeIn = 0.5; FadeOut = 0.00001 })
)
# (AutoG values multiply an event's gain over time: 1 = its base level)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  # the gate: a swell, his footsteps on the setts, the coat, the close-up, the sweep into the square
  @('hs6_swell', 0.35, 0.26, 'p'), @('ts16_steps', 1.2, 0.16, 's', @{ Len = 4.0; FadeOut = 0.6; Lp = 3000 }), @('s1_shimmer', 2.55, 0.2, 'p'),
  @('hs38_soft', 4.95, 0.24, 'p'), @('ws25_sweep', 6.2, 0.3, 'p'),
  # the spell: the children freeze; the ball drops and bounces three times (each bounce sliced onto the picture's),
  # the hoop spins down and clatters; the wipe of washing into the kitchen
  @('hs36_reverse', 6.6, 0.22, 'p'), @('s1_shimmer', 6.75, 0.16, 'p'),
  @('ps1_ball', 6.778, 0.5, 's', @{ Off = 0.20; Len = 0.42; FadeOut = 0.08 }), @('ps1_ball', 7.109, 0.36, 's', @{ Off = 0.62; Len = 0.30; FadeOut = 0.08 }), @('ps1_ball', 7.268, 0.26, 's', @{ Off = 0.95; Len = 0.42; FadeOut = 0.2 }),
  @('ps2_hoop', 6.68, 0.32, 's', @{ FadeOut = 0.3 }), @('s24_swoosh', 9.81, 0.28, 'p'),
  # the kitchen: kneading, she looks up, the pan to the window
  @('ps3_knead', 9.55, 0.5, 's', @{ Len = 1.45; FadeOut = 0.3 }), @('hs38_soft', 11.3, 0.24, 'p'), @('s26_darkwhoosh', 12.06, 0.28, 'p'),
  # the window: she sees him, her heart, she screams; the light opens onto the road
  @('ts21_gasp', 13.75, 0.3, 's', @{ Lp = 4500 }), @('hs25_heart', 14.35, 0.3, 'p'), @('hs25_heart', 15.05, 0.32, 'p'),
  @('ps4_scream', 16.95, 0.34, 's', @{ Lp = 5500; FadeOut = 0.4 }), @('hs35_impact', 17.05, 0.24, 'p'), @('hs27_sweep', 18.4, 0.28, 'p'),
  # the road: she runs; the push into the hill; a hundred and thirty children
  @('ps5_run', 18.5, 0.42, 's', @{ FadeOut = 0.5 }), @('ws25_sweep', 22.48, 0.28, 'p'), @('hs37_boom', 22.72, 0.26, 'p'),
  @('hs34_riser', 25.66, 0.2, 'p', @{ FadeOut = 0.15 }), @('s26_darkwhoosh', 25.7, 0.24, 'p'),
  # the top: panting; the music is sucked away into silence; gone; three heartbeats on the three short lines
  @('ps6_pant', 25.6, 0.45, 's', @{ Lp = 6500; FadeOut = 0.4 }), @('ts31_suck', $CUT, 0.4, 'p'),
  @('s13_tinnitus', 27.1, 0.11, 's', @{ Len = 1.8; FadeIn = 0.3; FadeOut = 0.8 }), @('s25_subboom', 28.3, 0.42, 'p'),
  @('ts15_heart', 29.0, 0.38, 'p'), @('ts15_heart', 29.82, 0.42, 'p'), @('ts15_heart', 30.74, 0.47, 'p'), @('hs27_sweep', 31.18, 0.28, 'p'),
  # the three: a low boom, the lame boy's sob, the deaf girl's ringing quiet, the blind boy's stick
  @('hs37_boom', 31.42, 0.22, 'p'), @('rs4_sob', 33.1, 0.3, 's', @{ Len = 1.6; FadeOut = 0.4; Lp = 4000 }),
  @('s13_tinnitus', 34.62, 0.15, 's', @{ Len = 1.8; FadeIn = 0.25; FadeOut = 0.5 }), @('ps7_stick', 36.4, 0.45, 's', @{ Len = 2.2; FadeOut = 0.4 }),
  # bedtime: the morph, a page turned; the story melts into the real hill
  @('hs7_shimmer', 38.69, 0.3, 'p'), @('hs29_page', 39.75, 0.35, 'p'), @('hs18_magic', 41.99, 0.28, 'p'), @('hs36_reverse', 41.99, 0.2, 'p'),
  # dusk: her sob, "your son was real", the tilt up to him
  @('hs49_sob', 42.3, 0.26, 's', @{ Len = 1.5; FadeOut = 0.4; Lp = 4000 }), @('hs6_swell', 43.7, 0.24, 'p'), @('s11_tiltwhoosh', 44.89, 0.3, 'p'),
  # the reveal: a riser into his name, the hit, and the sting on the zoom into his eyes that loops the film
  @('s43_riser', 47.84, 0.28, 'p', @{ FadeOut = 0.1 }), @('hs35_impact', 47.86, 0.4, 'p'), @('hs37_boom', 47.86, 0.34, 'p'),
  @('ps8_sting', 49.45, 0.4, 'p')
)
