# The arrangement for "The Royal Astrologer" (dot-sourced by mix_astro.ps1, which defines E, $T and [LeechMix]).
# Music is reused from the library (Royal Taster and Worm cues); the wind and six one-shots were generated for this video.
# The opening cue starts 0.7 s in, so the loop seam crossfades into the cue's own first 0.7 s and the music never jumps.
$seamKey = 'm1_underscore'; $seamOff = 0.7; $seamGain = 0.5 * 0.85
# the tension cue's hard stop (16.75 s into it) lands right after "...when will you die?" (35.10)
$tStop = 35.12; $tStart = 23.0; $tOff = $tStart - ($tStop - 16.75)
$music = @(
  # the tower and the gate: the dark court underscore (its own dip thins it under the warning); gone by "foretell"
  (E 'm1_underscore' 0 0.5 @{ Loop = $true; Off = $seamOff; Len = 13.5; FadeIn = 0.01; FadeOut = 0.9; AutoT = [double[]](0, 5.0, 7.6, 8.4, 11.0, 12.6); AutoG = [double[]](0.85, 1.0, 1.0, 0.85, 0.75, 0.75) }),
  # "until you foretell": the suspense pulse (entered part-way up its build) runs under the feast, sinks under
  # "trapped", and is gone before "she does"
  (E 'm2_suspense' 12.4 0.55 @{ Off = 3.8; Len = 9.6; FadeIn = 0.3; FadeOut = 0.6; AutoT = [double[]](12.4, 13.8, 15.0, 15.9, 16.3, 17.2, 17.6, 19.3, 20.0, 20.95, 21.4); AutoG = [double[]](1.25, 1.2, 1.0, 1.0, 0.45, 0.45, 1.0, 1.0, 0.7, 1.0, 0.9) }),
  # midnight: the horror build from the corridor to the question (held under the voice where the cue is loudest),
  # then its own dead stop and reverb tail
  (E 'wm3_tension' $tStart 0.55 @{ Off = $tOff; Len = 14.6; FadeIn = 0.5; FadeOut = 1.0; AutoT = [double[]](23.0, 25.6, 27.3, 28.2, 31.1, 31.5, 32.7, 33.4, 35.1); AutoG = [double[]](0.7, 0.75, 0.9, 1.0, 1.0, 0.8, 0.85, 0.8, 0.85) }),
  # the answer: nothing but the riser under the line, then the orchestral climax lands at full (entered past its
  # swell) the instant "Majesty" ends; its re-hit (2.52 s in, the clip's loudest point) meets the shutters, and it
  # decays into the day
  (E 'm4_climax' 38.63 0.6 @{ Off = 0.55; Len = 5.0; FadeIn = 0.03; FadeOut = 1.5; AutoT = [double[]](38.6, 39.4, 40.6, 41.6); AutoG = [double[]](0.5, 1.0, 0.9, 0.5) }),
  # the rest of his life: the minstrels, warm and silly; they hold their breath at the sniffle, then play on into the loop
  (E 'm3_minstrels' 40.75 0.5 @{ Len = ($T - 40.75); FadeIn = 0.6; FadeOut = 0.01; AutoT = [double[]](40.75, 41.6, 42.6, 42.8, 43.4, 43.8); AutoG = [double[]](0.7, 1.0, 1.0, 0.35, 0.35, 1.0) })
)
$amb = @(
  # the tower at night
  (E 'ta3_night' 0 0.9 @{ Loop = $true; Len = 8.5; FadeIn = 0.01; FadeOut = 0.5 }),
  # the gate: wind round the walls, the night town below
  (E 'ra1_wind' 8.0 0.85 @{ Loop = $true; Len = 4.3; FadeIn = 0.4; FadeOut = 0.5 }),
  (E 'a2_village' 8.0 0.55 @{ Loop = $true; Len = 4.3; FadeIn = 0.4; FadeOut = 0.5 }),
  # your desk
  (E 'ta3_night' 11.85 0.8 @{ Loop = $true; Off = 2.0; Len = 1.8; FadeIn = 0.3; FadeOut = 0.3 }),
  # the feast: the hall goes quiet after "will die", then falls away (muffled) as you're trapped
  (E 'a1_hall' 13.3 0.9 @{ Loop = $true; Len = 3.2; FadeIn = 0.3; FadeOut = 0.3; AutoT = [double[]](13.3, 14.6, 15.1); AutoG = [double[]](1.0, 1.0, 0.3) }),
  (E 'a1_hall' 16.2 0.27 @{ Loop = $true; Off = 2.9; Len = 1.4; FadeIn = 0.3; FadeOut = 0.4; Lp = 600 }),
  # the visions on your wall
  (E 'ta4_tomb' 17.2 0.55 @{ Loop = $true; Off = 1.5; Len = 4.2; FadeIn = 0.4; FadeOut = 0.4 }),
  # the bedroom
  (E 'ta3_night' 21.0 0.7 @{ Loop = $true; Off = 1.0; Len = 2.2; FadeIn = 0.3; FadeOut = 0.3 }),
  # the corridor
  (E 'ta4_tomb' 22.9 0.9 @{ Loop = $true; Off = 3.0; Len = 2.1; FadeIn = 0.3; FadeOut = 0.4 }),
  # the king's chamber: the wind at the open window (loudest in the silence after the question; it dies when the
  # shutters close) and the room
  (E 'ra1_wind' 24.6 0.9 @{ Loop = $true; Off = 1.0; Len = 16.5; FadeIn = 0.4; FadeOut = 0.3; AutoT = [double[]](24.6, 25.6, 26.4, 28.2, 34.9, 35.3, 36.6, 37.6, 40.1, 40.75); AutoG = [double[]](0.55, 0.7, 1.0, 0.8, 0.8, 1.05, 1.05, 0.7, 0.7, 0.08) }),
  (E 'ta3_night' 24.6 0.6 @{ Loop = $true; Off = 3.0; Len = 16.5; FadeIn = 0.4; FadeOut = 0.4 }),
  # the day, years later
  (E 'wa2_fields' 40.8 0.45 @{ Loop = $true; Len = ($T - 40.8 - 0.4); FadeIn = 0.5; FadeOut = 0.4 }),
  # the tower at night comes back under the loop push and runs straight on into t = 0
  (E 'ta3_night' ($T - 0.6) 0.9 @{ Loop = $true; Off = [LeechMix]::Dur('ta3_night') - 0.6; FadeIn = 0.5 })
)
# one-shots: [key, time, gain, 'p' = the clip's peak lands on the time | 's' = the clip starts there, optional options]
$hits = @(
  # the tower: the downbeat, the purse, the tilt up to the crown of stars, back down to the instruments, the armillary spun
  @('s25_subboom', 0.06, 0.35, 'p'), @('ts2_coins', 0.4, 0.45, 'p'), @('ws24_sunrise', 2.2, 0.4, 'p'), @('s1_shimmer', 2.3, 0.45, 'p'),
  @('ws25_sweep', 3.35, 0.35, 'p'), @('s9_spoonspin', 3.4, 0.35, 's'),
  # the warning: the blade-glint of the slash, then the impact in the breath after "costs your head."
  @('s17_shing', 7.27, 0.35, 'p'), @('s19_impactrev', 7.93, 0.5, 'p'), @('ts30_impact', 7.93, 0.7, 'p'), @('s25_subboom', 7.93, 0.45, 'p'),
  # down to the gate: the crows off the pike, the sting on the head, the pull back, the zoom into your window
  @('ts3_descend', 8.35, 0.45, 'p'), @('rs2_crows', 8.55, 0.55, 's'), @('ws4_sting', 9.1, 0.45, 'p'), @('s11_tiltwhoosh', 9.9, 0.25, 'p'), @('ws3_lens', 12.15, 0.5, 'p'),
  # your desk: the quill scratching, the doom planet and the cross
  @('ts7_brush', 11.7, 0.45, 's'), @('ts7_brush', 12.3, 0.4, 's'), @('ts29_sting', 12.95, 0.6, 'p'), @('ts15_heart', 13.1, 0.5, 'p'),
  # the feast: the light opens, the toast, her laugh; "will die": the goblet tips, the court gasps; his glare; trapped
  @('ws30_morph', 13.55, 0.3, 'p'), @('ts14_toast', 13.4, 0.35, 's'), @('rs3_laugh', 13.7, 0.55, 's', @{ Len = 0.98; FadeOut = 0.12 }),
  @('s37_spill', 14.75, 0.6, 'p'), @('ts21_gasp', 14.78, 0.45, 'p'), @('ws9_heart', 15.3, 0.5, 'p'), @('s15_vertigo', 16.1, 0.7, 's'),
  # the visions: in, her laugh far off as she dances, the chart torn on "fraud", the mob and its fire on "murderer"
  @('s26_darkwhoosh', 17.6, 0.45, 'p'), @('rs3_laugh', 17.55, 0.25, 's', @{ Lp = 2200 }), @('rs5_tear', 18.8, 0.75, 'p'),
  @('s38_chaos', 20.05, 0.22, 's', @{ Len = 1.7; FadeOut = 0.5 }), @('s31_firecandle', 20.1, 0.3, 's'), @('ts30_impact', 20.95, 0.5, 'p'),
  # the eighth day: the eyelid, the days racing, the king's sob, the knell in the breath after "she does."
  @('ts6_silk', 21.45, 0.4, 'p'), @('ws29_lapse', 21.0, 0.4, 's', @{ Len = 1.3; FadeOut = 0.3 }), @('rs4_sob', 22.45, 0.55, 's'), @('rs1_bell', 22.8, 0.6, 'p'),
  # midnight: the flame flares into the guard's torch, the march, the second toll far off, the curtain wipe
  @('ts5_flare', 23.15, 0.5, 'p'), @('ts16_steps', 23.18, 0.3, 'p'), @('ts16_steps', 23.71, 0.3, 'p'), @('ts16_steps', 24.24, 0.3, 'p'),
  @('rs1_bell', 24.0, 0.45, 'p', @{ Lp = 1600 }), @('s24_swoosh', 25.0, 0.5, 'p'),
  # the chamber: heartbeats under the guards' stare, they close in with their halberds, the fall from the window, his smile,
  # the question
  @('ts15_heart', 27.6, 0.5, 'p'), @('ws9_heart', 28.35, 0.5, 'p'), @('ts16_steps', 28.7, 0.35, 'p'), @('ts32_halberd', 29.05, 0.6, 'p'), @('s11_tiltwhoosh', 29.95, 0.35, 'p'),
  @('ws4_sting', 31.55, 0.4, 'p'), @('ws9_heart', 34.45, 0.45, 'p'), @('ts15_heart', 34.95, 0.55, 'p'),
  # the silence after it: your swallow, the bow, one heartbeat, the riser into the answer
  @('ws5_swallow', 35.25, 0.6, 'p'), @('s24_swoosh', 35.4, 0.3, 'p'), @('ts15_heart', 35.95, 0.55, 'p'), @('ts27_riser', 38.6, 0.4, 'p'),
  # "...Majesty." the boom the instant the word ends; he turns pale (his sharp breath, the veil slips), the guards
  # step back, the shutters slam
  @('s25_subboom', 38.6, 0.6, 's'), @('ws31_impact', 38.6, 0.3, 's'), @('ws28_hiss', 38.9, 0.25, 's'), @('ts6_silk', 38.85, 0.2, 's'),
  @('ts16_steps', 39.95, 0.5, 'p'), @('ts16_steps', 40.35, 0.45, 'p'), @('ws27_creak', 40.1, 0.4, 's'), @('ts10_trapdoor', 40.74, 0.6, 'p'),
  # the rest of his life: the warm swell into the day, the years racing; the sniffle and the panic; the purse; the push
  # into the loop
  @('ws24_sunrise', 41.15, 0.45, 'p'), @('ws32_tlvillage', 40.9, 0.22, 's', @{ Len = 1.8; FadeOut = 0.6 }),
  @('rs6_sneeze', 43.08, 0.7, 'p'), @('ts21_gasp', 43.25, 0.35, 'p'), @('ts2_coins', 43.75, 0.45, 'p'), @('ts31_suck', 44.58, 0.5, 'p')
)
