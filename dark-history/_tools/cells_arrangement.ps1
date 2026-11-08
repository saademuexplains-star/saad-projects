# The arrangement for "The Cells That Never Died" (dot-sourced by mix_cells.ps1, which defines E, $T and [LeechMix]).
# One constant score (ElevenLabs music model) under the whole film, a room tone per place, hits in the breaths.
# The score starts $seamOff in, so the loop seam crossfades into its own first moments.
$seamKey = 'cm1_score'; $seamOff = 0.7; $seamGain = 0.6
$music = @(
  (E 'cm1_score' 0 0.6 @{ Off = $seamOff; Len = $T; FadeIn = 0.005; FadeOut = 0.01 })
)
$D = { param($k) [LeechMix]::Dur($k) }
$amb = @(
  (E 'ha2_bedroom' 0 0.55 @{ Loop = $true; Len = 2.6; FadeIn = 0.005; FadeOut = 0.4 }),
  (E 'ca2_ward' 2.0 0.45 @{ Loop = $true; Len = 1.6; FadeIn = 0.3; FadeOut = 0.3 }),
  (E 'ha6_drone' 2.9 0.6 @{ Loop = $true; Len = 2.1; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ra1_wind' 4.3 0.5 @{ Loop = $true; Len = 4.3; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca1_or' 7.9 0.8 @{ Loop = $true; Len = 5.2; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca2_ward' 12.4 0.6 @{ Loop = $true; Off = 3; Len = 2.4; FadeIn = 0.3; FadeOut = 0.3 }),
  (E 'ca2_ward' 14.2 0.8 @{ Loop = $true; Len = 2.4; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ha6_drone' 15.9 0.6 @{ Loop = $true; Off = 1; Len = 2.3; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ca2_ward' 17.6 0.7 @{ Loop = $true; Off = 5; Len = 3.5; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ha7_rain' 20.5 0.8 @{ Loop = $true; Len = 2.2; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ca3_drum' 22.0 0.8 @{ Loop = $true; Len = 6.3; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ha6_drone' 27.7 0.45 @{ Loop = $true; Off = 2; Len = 5.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ha5_study' 33.0 0.6 @{ Loop = $true; Len = 2.6; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ca4_kids' 34.9 0.7 @{ Loop = $true; Len = 2.4; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ca5_line' 36.7 0.8 @{ Loop = $true; Len = 3.2; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'wa2_fields' 39.2 0.7 @{ Loop = $true; Len = 3.5; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca6_lab' 42.0 0.7 @{ Loop = $true; Len = 2.4; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ha6_drone' 43.8 0.55 @{ Loop = $true; Off = 3; Len = 2.9; FadeIn = 0.4; FadeOut = 0.4 }),
  (E 'ca6_lab' 46.1 0.6 @{ Loop = $true; Off = 2; Len = 2.7; FadeIn = 0.3; FadeOut = 0.5 }),
  # the front room again under the photograph coming alive (runs straight on into t = 0)
  (E 'ha2_bedroom' 48.5 0.55 @{ Loop = $true; Off = (& $D 'ha2_bedroom') - ($T - 48.5) % (& $D 'ha2_bedroom'); FadeIn = 0.5; FadeOut = 0.002 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  @('hs7_shimmer', 48.9, 0.3, 'p'),
  @('hs27_sweep', 2.31, 0.28, 'p'), @('hs38_soft', 3.0, 0.3, 'p'), @('ws3_lens', 3.24, 0.32, 'p'),
  @('hs25_heart', 3.7, 0.38, 'p'), @('hs25_heart', 4.35, 0.36, 'p'), @('hs35_impact', 4.66, 0.32, 'p'), @('hs37_boom', 4.66, 0.28, 'p'), @('hs6_swell', 4.75, 0.3, 'p'),
  @('hs51_bell', 6.78, 0.25, 'p', @{ Lp = 2600 }), @('hs7_shimmer', 8.3, 0.25, 'p'), @('hs38_soft', 10.05, 0.28, 'p'),
  @('hs27_sweep', 11.06, 0.25, 'p'), @('s17_shing', 11.3, 0.22, 'p', @{ Lp = 6000 }), @('s39_vial', 12.58, 0.3, 'p'), @('ts30_impact', 12.76, 0.3, 'p'), @('s24_swoosh', 12.76, 0.22, 'p'),
  @('ts16_steps', 13.0, 0.28, 's', @{ Len = 1.4; FadeOut = 0.3 }), @('hs36_reverse', 14.5, 0.28, 'p'), @('hs42_breath', 14.75, 0.25, 's', @{ Lp = 3500 }),
  @('hs37_boom', 15.43, 0.28, 'p'), @('hs35_impact', 16.26, 0.32, 'p'), @('s37_spill', 16.3, 0.2, 'p', @{ Lp = 2500 }),
  @('hs25_heart', 16.75, 0.4, 'p'), @('hs25_heart', 17.25, 0.42, 'p'), @('hs25_heart', 17.7, 0.44, 'p'),
  @('hs19_timelapse', 17.85, 0.32, 's', @{ Len = 2.0; FadeOut = 0.4 }), @('hs21_clockfast', 18.0, 0.3, 's', @{ Len = 2.0; FadeOut = 0.4 }),
  @('hs25_heart', 20.2, 0.42, 'p'), @('hs51_bell', 20.76, 0.38, 'p', @{ Lp = 3000 }), @('rs4_sob', 21.3, 0.18, 's', @{ Lp = 3000 }),
  @('ws25_sweep', 22.35, 0.28, 'p'), @('s1_shimmer', 23.55, 0.3, 'p'), @('hs34_riser', 25.1, 0.3, 'p', @{ FadeOut = 0.2 }), @('hs4_lens', 25.13, 0.28, 'p'),
  @('s39_vial', 25.6, 0.14, 'p'), @('s39_vial', 26.4, 0.12, 'p'), @('s39_vial', 27.2, 0.12, 'p'),
  @('ws3_lens', 28.03, 0.28, 'p'), @('hs35_impact', 29.03, 0.3, 'p'), @('hs18_magic', 29.3, 0.22, 's'), @('hs7_shimmer', 29.5, 0.38, 'p'),
  @('cs1_cells', 30.66, 0.25, 'p'), @('cs1_cells', 31.02, 0.25, 'p'), @('cs1_cells', 31.38, 0.25, 'p'), @('cs1_cells', 31.74, 0.25, 'p'), @('cs1_cells', 32.1, 0.25, 'p'), @('cs1_cells', 32.45, 0.22, 'p'), @('cs1_cells', 32.7, 0.22, 'p'), @('cs1_cells', 32.95, 0.22, 'p'),
  @('hs27_sweep', 33.3, 0.28, 'p'), @('hs5_globe', 33.35, 0.3, 's'), @('s1_shimmer', 33.9, 0.25, 'p'),
  @('ws25_sweep', 35.27, 0.28, 'p'), @('ts21_gasp', 36.05, 0.2, 's', @{ Lp = 3000 }), @('s24_swoosh', 37.04, 0.22, 'p'),
  @('hs37_boom', 39.38, 0.32, 'p'), @('hs35_impact', 39.38, 0.28, 'p'), @('hs19_timelapse', 39.7, 0.3, 's', @{ Len = 2.4; FadeOut = 0.5 }),
  @('hs51_bell', 42.4, 0.3, 'p', @{ Lp = 3000 }), @('hs27_sweep', 42.39, 0.24, 'p'), @('hs6_swell', 44.13, 0.32, 'p'), @('s1_shimmer', 44.6, 0.28, 's'),
  @('hs35_impact', 46.3, 0.3, 'p'), @('hs37_boom', 47.7, 0.28, 'p'), @('hs34_riser', 48.88, 0.24, 'p', @{ FadeOut = 0.2 })
)
