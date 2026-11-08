# The arrangement for "The Heroin Bottle" (dot-sourced by mix_heroin.ps1, which defines E, $T and [LeechMix]).
# All music, ambience and SFX were generated for this video (music with the ElevenLabs music model).
# The opening underscore starts $seamOff in, so the loop seam crossfades into the cue's own first moments.
$seamKey = 'hm1_under'; $seamOff = 2.4; $seamGain = 0.55
$music = @(
  # frame 0 (and, on the loop, right after "Heroin"): the orchestral impact and its long dark tail
  (E 'hm5_reveal' 0 0.5 @{ Off = 1.12; Len = 4.5; FadeIn = 0.005; FadeOut = 1.8 }),
  # the shelf and the globe: the dark chamber underscore (entered past its silent intro), gone into the stamp after "ban"
  (E 'hm1_under' 0 0.55 @{ Off = $seamOff; Len = 5.75; FadeIn = 0.01; FadeOut = 0.5; AutoT = [double[]](0, 3.0, 4.6, 5.4); AutoG = [double[]](0.9, 1.0, 1.15, 0.9) }),
  # the pharmacy: the cheerful advertising rag (ironic), thinning under "safer than morphine"
  (E 'hm7_parlour' 5.95 0.5 @{ Len = 5.85; FadeIn = 0.25; FadeOut = 0.6; AutoT = [double[]](5.95, 6.6, 9.3, 10.4, 11.5); AutoG = [double[]](0.8, 1.0, 1.0, 0.7, 0.45) }),
  # the sick child: the music-box lullaby, rising at "like magic" and holding the sleep under the angel
  (E 'hm2_lullaby' 11.6 0.55 @{ Len = 8.1; FadeIn = 0.5; FadeOut = 0.7; AutoT = [double[]](11.6, 14.0, 15.6, 16.8, 18.6, 19.5); AutoG = [double[]](0.7, 0.75, 1.0, 1.1, 1.0, 0.7) }),
  # the next night: the lullaby again, warped and out of tune
  (E 'hm4_broken' 19.45 0.5 @{ Len = 5.0; FadeIn = 0.4; FadeOut = 0.8; AutoT = [double[]](19.45, 21.0, 23.0, 24.4); AutoG = [double[]](0.8, 1.0, 1.0, 0.7) }),
  # taking it yourself, mornings and nights racing: the ticking spiral
  (E 'hm8_spiral' 23.6 0.5 @{ Len = 4.3; FadeIn = 0.5; FadeOut = 0.5; AutoT = [double[]](23.6, 24.7, 26.3, 27.6); AutoG = [double[]](0.7, 1.0, 1.15, 0.6) }),
  # the empty bottle, the shaking, the pain, the scream from the next room (the cue's climax, 16 s in, on the scream)
  (E 'hm9_withdraw' 27.2 0.5 @{ Off = 11.7; Len = 7.4; FadeIn = 0.6; FadeOut = 0.6; AutoT = [double[]](27.2, 28.4, 30.0, 32.4, 34.2); AutoG = [double[]](0.55, 0.8, 0.9, 0.9, 0.8) }),
  # the night queue and the doctors: the dirge, its peak (16.6 s in) on "admit what they've done"; it thins to nothing
  # under "printed on the bottle was Heroin"
  (E 'hm10_dirge' 34.1 0.45 @{ Off = 10.3; Len = 8.6; FadeIn = 0.5; FadeOut = 1.0; AutoT = [double[]](34.1, 36.0, 38.4, 39.6, 40.4, 41.4, 42.4); AutoG = [double[]](0.85, 0.95, 0.9, 0.7, 0.75, 0.55, 0.15) })
)
$amb = @(
  # the kitchen at night (the clock, the stove)
  (E 'ha1_kitchen' 0 0.85 @{ Loop = $true; Len = 3.3; FadeIn = 0.01; FadeOut = 0.4 }),
  # the study and its globe
  (E 'ha5_study' 2.8 0.7 @{ Loop = $true; Len = 3.4; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ha6_drone' 2.9 0.5 @{ Loop = $true; Len = 3.1; FadeIn = 0.4; FadeOut = 0.4 }),
  # the busy pharmacy by day
  (E 'ha3_shopday' 5.9 0.8 @{ Loop = $true; Len = 6.1; FadeIn = 0.3; FadeOut = 0.4 }),
  # the bedroom: wind at the window, the old house
  (E 'ha2_bedroom' 11.6 0.8 @{ Loop = $true; Len = 11.9; FadeIn = 0.4; FadeOut = 0.4 }),
  # the kitchen again (through the wall), then the pain
  (E 'ha1_kitchen' 23.0 0.8 @{ Loop = $true; Off = 2.0; Len = 8.6; FadeIn = 0.5; FadeOut = 0.5 }),
  # back in the bedroom
  (E 'ha2_bedroom' 31.4 0.7 @{ Loop = $true; Off = 3.0; Len = 3.1; FadeIn = 0.4; FadeOut = 0.3 }),
  # the pharmacy at night: rain on the glass, the anxious queue
  (E 'ha4_shopnight' 34.1 0.9 @{ Loop = $true; Len = 4.5; FadeIn = 0.3; FadeOut = 0.4 }),
  (E 'ha7_rain' 34.1 0.45 @{ Loop = $true; Len = 7.3; FadeIn = 0.3; FadeOut = 0.5; AutoT = [double[]](34.1, 38.3, 38.9); AutoG = [double[]](1.0, 1.0, 0.6) }),
  # the doctors' room: the fire and the clock
  (E 'ha5_study' 38.3 0.7 @{ Loop = $true; Off = 1.5; Len = 3.2; FadeIn = 0.3; FadeOut = 0.4 }),
  # the empty kitchen at the end (it runs straight on into t = 0)
  (E 'ha1_kitchen' 41.1 0.85 @{ Loop = $true; Off = [LeechMix]::Dur('ha1_kitchen') - ($T - 41.1) % [LeechMix]::Dur('ha1_kitchen'); FadeIn = 0.5; FadeOut = 0.002 }),
  (E 'ha6_drone' 41.2 0.45 @{ Loop = $true; Len = ($T - 41.2); FadeIn = 0.6; FadeOut = 0.15 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  # frame 0: the hit (on the loop it lands right after "Heroin"), the cough from the next room, the bottle off the shelf
  @('hs35_impact', 0.04, 0.45, 'p'), @('hs37_boom', 0.04, 0.4, 'p'), @('hs1_cough', 0.2, 0.22, 's', @{ Lp = 2000; Len = 1.6; FadeOut = 0.3 }), @('hs3_shelf', 0.38, 0.4, 's'),
  # into the glass, the globe turning, the red spreading, the stamp in the breath after "ban"
  @('hs4_lens', 3.0, 0.5, 'p'), @('hs5_globe', 3.1, 0.4, 's'), @('hs6_swell', 4.9, 0.45, 'p'), @('hs43_stamp', 5.55, 0.75, 'p'), @('hs37_boom', 5.55, 0.35, 'p'),
  # the show globe, the shop: the bell, the bottle shown off, the coins, the till, the taps on the carton, the morphine slid away
  @('hs38_soft', 6.05, 0.45, 'p'), @('hs8_shopbell', 6.7, 0.2, 's'), @('hs16_spoon', 6.66, 0.22, 's'), @('hs9_coins', 8.48, 0.38, 's'), @('hs10_register', 9.22, 0.38, 's'),
  @('hs12_tap', 9.98, 0.5, 's'), @('hs13_glassslide', 10.55, 0.45, 's'),
  # the cherub becomes your daughter: her coughing fits (kept under the voice, louder in its gaps)
  @('hs7_shimmer', 11.85, 0.35, 'p'), @('hs1_cough', 11.62, 0.36, 's', @{ Lp = 3500 }), @('hs2_cough2', 12.84, 0.28, 's', @{ Lp = 3500 }), @('hs2_cough2', 13.66, 0.42, 's'), @('hs2_cough2', 14.52, 0.24, 's', @{ Lp = 2400 }),
  # the pour: in close, the thick syrup into the spoon
  @('hs27_sweep', 14.1, 0.38, 'p'), @('hs15_pour', 14.9, 0.5, 'p'),
  # like magic: the spoon, the swallow, the cough stops, your sigh, her sleeping breath
  @('hs18_magic', 15.85, 0.28, 's'), @('hs16_spoon', 16.15, 0.32, 's'), @('hs17_swallow', 16.35, 0.38, 'p'), @('hs20_sigh', 17.5, 0.28, 's', @{ Lp = 3500 }), @('hs39_sleep', 17.6, 0.22, 's'),
  # the day passing; the next night: the cough again, one spoon, your breath, the second spoon
  @('hs19_timelapse', 19.45, 0.35, 's', @{ Len = 1.0; FadeOut = 0.3 }), @('hs2_cough2', 20.42, 0.28, 's', @{ Lp = 3500 }), @('hs16_spoon', 21.1, 0.3, 's'), @('hs17_swallow', 21.18, 0.32, 's', @{ Len = 0.7; FadeOut = 0.15 }),
  @('hs1_cough', 21.42, 0.26, 's', @{ Len = 1.1; FadeOut = 0.3; Lp = 3000 }), @('hs42_breath', 21.74, 0.3, 's'), @('hs16_spoon', 22.35, 0.3, 's'), @('hs17_swallow', 22.44, 0.32, 's', @{ Len = 0.7; FadeOut = 0.15 }),
  # through the wall into the kitchen; your own swig; the days and nights racing (the clock, the swigs)
  @('hs27_sweep', 23.45, 0.4, 'p'), @('hs41_gulp', 24.46, 0.6, 's'), @('hs21_clockfast', 24.75, 0.4, 's', @{ Len = 1.6; FadeOut = 0.3 }), @('hs19_timelapse', 24.8, 0.3, 's'),
  @('hs41_gulp', 25.33, 0.4, 's'), @('hs41_gulp', 26.05, 0.4, 's'),
  # until one day: the eyes close; the bottle shaken; one drop; the heartbeat; the shaking hands and her trembling breath
  @('hs36_reverse', 26.6, 0.45, 'p'), @('hs22_drop', 27.88, 0.6, 'p'), @('hs25_heart', 28.2, 0.6, 'p'), @('hs23_rattle', 28.5, 0.4, 's', @{ Lp = 4000 }), @('hs42_breath', 28.75, 0.35, 's'), @('hs25_heart', 29.2, 0.5, 'p'),
  # it slips and falls; the pain
  @('hs32_bottledrop', 29.82, 0.45, 'p'), @('hs33_roll', 29.95, 0.25, 's', @{ Len = 1.2; FadeOut = 0.4 }), @('hs24_groan', 30.1, 0.34, 's', @{ Lp = 2200 }),
  # from the next room: through the wall, your daughter screaming for it (as if through the wall, then close)
  @('hs38_soft', 31.8, 0.35, 'p'), @('hs26_scream', 32.4, 0.4, 's', @{ Lp = 3200 }), @('hs49_sob', 33.95, 0.3, 's', @{ Lp = 3500 }),
  # the night queue: the empty bottles rattling in shaking hands, a cough in the line, heartbeats
  @('hs6_swell', 34.35, 0.4, 'p'), @('hs28_bottles', 35.04, 0.45, 's'), @('hs2_cough2', 35.95, 0.2, 's', @{ Lp = 3000 }), @('hs28_bottles', 36.85, 0.4, 's'), @('hs25_heart', 37.35, 0.45, 'p'),
  # the newspaper page; the report dropped; the old doctor's sigh; the knell in the breath after "too late"
  @('hs29_page', 38.6, 0.5, 'p'), @('hs46_papers', 39.78, 0.4, 'p'), @('hs31_mansigh', 40.5, 0.32, 's', @{ Lp = 3500 }), @('hs51_bell', 41.06, 0.45, 'p', @{ Lp = 3000 }),
  # into the kitchen: the bottle on the shelf turns; the riser crests before "was Heroin" and leaves it in silence
  @('hs38_soft', 41.35, 0.3, 'p'), @('hs34_riser', 43.25, 0.35, 'p', @{ FadeOut = 0.25 }), @('hs36_reverse', 44.18, 0.2, 'p', @{ Lp = 1800 })
)
