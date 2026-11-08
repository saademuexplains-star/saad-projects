# The arrangement for "The Pied Piper", third cut (dot-sourced by mix_piper.ps1 -Arr piper3_arrangement.ps1).
# One suspense score under the whole film, building to its peak on his name; his tune on top of it wherever he is:
# loud at the gate and in the square, faint through your window, loud as he passes below it, receding up the road,
# airy on the hill. It is sucked away on "the music has stopped": the score sinks to a held breath (wind, a ringing
# silence, three heartbeats), comes back low under the three, a music box at bedtime, and rises into the reveal; his
# tune swells back across the loop seam, so frame 0 starts with it again.
$CUT = 27.1
$PD = [LeechMix]::Dur('pm2_pipe')
# music elements playing at t = 0 (key, offset at t = 0, gain): the loop seam crossfades into exactly these
$seams = @(@('pm1_score', 0.7, 0.6), @('pm2_pipe', 0, 1.0))
# his tune, one continuous melody split into places (each piece takes up the melody where the last left it)
function Pipe($t0, $t1, $g, $x) { $o = @{ Loop = $true; Off = ($t0 % $PD); Len = $t1 - $t0; FadeIn = 0.25; FadeOut = 0.25 }; foreach ($k in $x.Keys) { $o[$k] = $x[$k] }; E 'pm2_pipe' $t0 $g $o }
$pipeEnd = 44.9
$music = @(
  (E 'pm1_score' 0 0.6 @{ Off = 0.7; Len = $T; FadeIn = 0.00001; FadeOut = 0.05; AutoT = @(26.9, 27.3, 29.7, 31.8, 38.4, 39.2, 41.9, 42.6); AutoG = @(1.0, 0.36, 0.36, 0.85, 0.85, 0.6, 0.6, 1.0) }),
  (Pipe 0 9.75 1.0 @{ FadeIn = 0.00001; AutoT = @(5.8, 6.6); AutoG = @(1.0, 0.82) }),
  (Pipe 9.55 12.25 0.34 @{ Lp = 1500 }),
  (Pipe 12.0 17.75 0.8 @{ AutoT = @(12.0, 13.4, 15.2, 16.6, 17.2); AutoG = @(0.6, 1.0, 1.0, 0.75, 0.55) }),
  (Pipe 17.7 20.1 0.42 @{ Lp = 2600 }),
  (Pipe 19.9 22.7 0.72 @{ AutoT = @(20.2, 21.6, 22.6); AutoG = @(0.8, 1.0, 0.8) }),
  (Pipe 22.5 26.0 0.55 @{ Lp = 5200 }),
  (Pipe 25.8 $CUT 0.4 @{ Lp = 3400; FadeOut = 0.06 }),
  # a low drone holds the empty hilltop and the three left behind
  (E 'ha6_drone' 27.5 0.42 @{ Loop = $true; Len = 11.3; FadeIn = 1.8; FadeOut = 0.8; AutoT = @(31.2, 32.4); AutoG = @(1.0, 1.15) }),
  # the bedtime music box
  (E 'pm3_box' 38.55 0.7 @{ Off = 0.8; Len = 3.95; FadeIn = 0.35; FadeOut = 0.5 }),
  # his tune again under the reveal, faint, swelling; it reaches the clip's end exactly at T and runs on into frame 0
  (E 'pm2_pipe' $pipeEnd 0.4 @{ Off = $PD - ($T - $pipeEnd); Len = $T - $pipeEnd; FadeIn = 1.4; FadeOut = 0.00001; AutoT = @(46.3, 49.2); AutoG = @(1.0, 2.5) })
)
$D = { param($k) [LeechMix]::Dur($k) }
$amb = @(
  (E 'pa4_dawn' 0 0.8 @{ Loop = $true; Len = 6.3; FadeIn = 0.00001; FadeOut = 0.4 }),
  # the square: children at play, cut dead when they freeze; then only the birds and the tune; their feet as they go
  (E 'pa1_square' 5.6 0.95 @{ Loop = $true; Len = 1.82; FadeIn = 0.3; FadeOut = 0.1 }),
  (E 'pa4_dawn' 6.3 0.42 @{ Loop = $true; Off = 2.0; Len = 4.0; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'pa2_dance' 8.55 0.38 @{ Loop = $true; Len = 1.8; FadeIn = 0.5; FadeOut = 0.35 }),
  # your street; the procession's feet passing under the window; out of the gate and up the hill
  (E 'pa5_street' 9.55 0.75 @{ Loop = $true; Len = 10.8; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'pa2_dance' 12.6 0.5 @{ Loop = $true; Off = 1.0; Len = 5.2; FadeIn = 0.8; FadeOut = 0.5; AutoT = @(14.5, 16.8); AutoG = @(1.0, 0.7) }),
  (E 'wa2_fields' 19.9 0.6 @{ Loop = $true; Len = 6.2; FadeIn = 0.35; FadeOut = 0.6 }),
  (E 'pa2_dance' 19.95 0.62 @{ Loop = $true; Off = 3.0; Len = 6.0; FadeIn = 0.35; FadeOut = 0.5; AutoT = @(22.4, 23.2); AutoG = @(1.0, 1.25) }),
  # the hill and the top: the wind takes over when the music is gone, softer down in the meadow
  (E 'pa3_wind' 22.5 0.4 @{ Loop = $true; Len = 16.2; FadeIn = 0.6; FadeOut = 0.5; AutoT = @(26.9, 27.4, 31.0, 31.8); AutoG = @(1.0, 2.0, 1.9, 1.0) }),
  (E 'ha2_bedroom' 38.5 0.6 @{ Loop = $true; Len = 3.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'pa5_street' 41.8 0.3 @{ Loop = $true; Off = 3.0; Len = 3.4; FadeIn = 0.4; FadeOut = 0.4; Lp = 2000 }),
  # the dawn street again under the reveal (it reaches its own start at T and runs on into frame 0)
  (E 'pa4_dawn' 44.7 0.7 @{ Loop = $true; Off = (& $D 'pa4_dawn') - ($T - 44.7); Len = $T - 44.7; FadeIn = 0.6; FadeOut = 0.00001 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  # the gate: the swell under the first frame, his steps on the setts, the coat, the pipe, pigeons and the tilt up
  @('hs6_swell', 0.35, 0.26, 'p'), @('ts16_steps', 1.0, 0.15, 's', @{ Len = 4.6; FadeOut = 0.6; Lp = 3000 }), @('s1_shimmer', 1.95, 0.2, 'p'),
  @('hs38_soft', 4.95, 0.22, 'p'), @('ws25_sweep', 5.95, 0.3, 'p'),
  # the square: the tune reaches them; they freeze (the play cut dead); the ball drops and bounces three times on the
  # picture's bounces (7.85, 8.36, 8.59), the hoop rolls on and clatters down; the coat sweeps past the lens
  @('hs36_reverse', 7.0, 0.22, 'p'), @('hs38_soft', 7.36, 0.22, 'p'), @('s1_shimmer', 7.45, 0.15, 'p'),
  @('ps1_ball', 7.854, 0.48, 's', @{ Off = 0.20; Len = 0.42; FadeOut = 0.08 }), @('ps1_ball', 8.358, 0.34, 's', @{ Off = 0.62; Len = 0.30; FadeOut = 0.08 }), @('ps1_ball', 8.585, 0.24, 's', @{ Off = 0.95; Len = 0.42; FadeOut = 0.2 }),
  @('ps2_hoop', 7.9, 0.3, 's', @{ FadeOut = 0.3 }), @('s24_swoosh', 9.95, 0.3, 'p'),
  # your window: you hear it; the camera falls to the street; he passes; your heart; the gasp, the scream, the impact;
  # the push into the dark window
  @('hs38_soft', 12.1, 0.2, 'p'), @('hs27_sweep', 12.9, 0.22, 'p'),
  @('hs25_heart', 15.1, 0.3, 'p'), @('hs25_heart', 15.85, 0.33, 'p'), @('ts21_gasp', 16.5, 0.3, 's', @{ Lp = 4500 }),
  @('ps4_scream', 16.72, 0.36, 's', @{ Lp = 5500; FadeOut = 0.45 }), @('hs35_impact', 16.8, 0.24, 'p'), @('s26_darkwhoosh', 17.95, 0.28, 'p'),
  # you run: the door bangs open, your feet on the setts; the camera carries on round, outside the walls
  @('ts30_impact', 18.05, 0.2, 'p', @{ Lp = 2400 }), @('ps5_run', 18.25, 0.42, 's', @{ Len = 2.0; FadeOut = 0.5 }), @('ws25_sweep', 19.95, 0.28, 'p'),
  # the corner of the wall rushes past the lens onto the hill and the long line of them; the warm sweep onto the top
  @('hs37_boom', 22.7, 0.24, 'p'), @('s26_darkwhoosh', 22.65, 0.24, 'p'), @('hs27_sweep', 25.78, 0.26, 'p'),
  # the top: panting; the music sucked away into silence; the ringing quiet; gone; three heartbeats on the short lines
  @('ps6_pant', 25.6, 0.45, 's', @{ Lp = 6500; FadeOut = 0.4; Len = 1.6 }), @('ts31_suck', $CUT, 0.4, 'p'),
  @('s13_tinnitus', 27.2, 0.1, 's', @{ Len = 1.8; FadeIn = 0.3; FadeOut = 0.8 }), @('s25_subboom', 28.3, 0.42, 'p'),
  @('ts15_heart', 28.62, 0.38, 'p'), @('ts15_heart', 29.25, 0.42, 'p'), @('ts15_heart', 30.0, 0.46, 'p'), @('hs38_soft', 31.2, 0.22, 'p'),
  # the three: a low boom under the wide; the lame boy's sob; the deaf girl's ringing quiet; the blind boy's stick
  @('hs37_boom', 31.5, 0.2, 'p'), @('rs4_sob', 33.25, 0.3, 's', @{ Len = 1.6; FadeOut = 0.4; Lp = 4000 }),
  @('s13_tinnitus', 35.05, 0.14, 's', @{ Len = 1.6; FadeIn = 0.25; FadeOut = 0.5 }), @('ps7_stick', 36.95, 0.45, 's', @{ Len = 1.9; FadeOut = 0.4 }),
  # bedtime: a page of the book turns past the lens; into the drawn children, out of a real one
  @('hs29_page', 38.75, 0.38, 'p'), @('hs7_shimmer', 38.95, 0.18, 'p'), @('hs18_magic', 42.1, 0.26, 'p'), @('hs36_reverse', 42.1, 0.18, 'p'),
  # your son: the swell on "your son", the low braam when he looks at us; his eye becomes the stranger's
  @('hs6_swell', 43.2, 0.24, 'p'), @('hs52_braam', 44.5, 0.2, 'p'), @('ws30_morph', 44.95, 0.24, 'p'),
  # the reveal: a riser into his name, the hit, the sting as his silhouette pulls into focus and the film loops
  @('s43_riser', 48.07, 0.28, 'p', @{ FadeOut = 0.1 }), @('hs35_impact', 48.1, 0.38, 'p'), @('hs37_boom', 48.1, 0.32, 'p'),
  @('ps8_sting', 49.45, 0.36, 'p')
)
