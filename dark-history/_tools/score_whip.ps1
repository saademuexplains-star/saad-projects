# Sound design for "The Whipping Boy" (no music): reuses the instrument library from score.ps1 with a new arrangement.
param([string]$Vo = '_vo2\vo_cut.wav', [string]$Out = '_vo2\mix.wav', [int]$Frames = 3002, [int]$Fps = 60, [string]$VoOut = '', [string]$SfxOut = '')
$ErrorActionPreference = 'Stop'
$OutPath = $Out; $VoPath = (Resolve-Path $Vo).Path
. "$PSScriptRoot\audiotool.ps1" -Mode none
$src = Get-Content "$PSScriptRoot\score.ps1" -Raw
$a = $src.IndexOf("Add-Type -TypeDefinition @'") + "Add-Type -TypeDefinition @'".Length; $b = $src.IndexOf("'@", $a)
$cs = $src.Substring($a, $b - $a).Replace('Score2', 'ScoreW').Replace('class Bus ', 'class BusW ').Replace('public Bus(int n)', 'public BusW(int n)').Replace('Bus G', 'BusW G').Replace('new Bus(', 'new BusW(').Replace('(Bus b,', '(BusW b,')
$i0 = $cs.IndexOf('  // ---------------- arrangement ----------------'); $i1 = $cs.IndexOf('  // ---------------- final mix ----------------')
$arr = @'
  // ---------------- extra instruments for this story ----------------
  public void Chirp(BusW b, double t, double f0, double f1, double dur, double g, double pan) {
    int a = (int)Math.Round(t * SR), n = (int)(dur * SR); double ph = 0;
    for (int k = 0; k < n; k++) { double u = (double)k / n; ph += 2 * Math.PI * (f0 + (f1 - f0) * u) / SR; double v = Math.Sin(ph) * Math.Sin(Math.PI * u) * (0.7 + 0.3 * Math.Sin(ph * 0.05)); if (a + k < N && a + k >= 0) { double ang = (pan + 1) * Math.PI / 4; b.L[a + k] += v * g * Math.Cos(ang) * 1.41; b.R[a + k] += v * g * Math.Sin(ang) * 1.41; RV.L[a + k] += v * g * 0.2; RV.R[a + k] += v * g * 0.2; } }
  }
  public void Birds(BusW b, double t0, double t1, double dens, double g, int seed) {
    var r = new Random(seed); double t = t0;
    while (t < t1) { double f = 2600 + r.NextDouble() * 1800; int nn = 2 + r.Next(4); for (int i = 0; i < nn; i++) Chirp(b, t + i * 0.07, f, f * (1.15 + r.NextDouble() * 0.3), 0.05, g * (0.6 + r.NextDouble() * 0.4), r.NextDouble() * 1.6 - 0.8); t += (0.3 + r.NextDouble() * 1.2) / dens; }
  }
  public void Glass(BusW b, double t, double g) {
    Impact(b, t, g * 0.5); Noise(b, t, t + 0.35, 5500, 0.3, g * 0.9, 0, 0.3, 0, 0.004);
    var r = new Random(7); for (int i = 0; i < 26; i++) { double tt = t + 0.02 + r.NextDouble() * 0.7; Bell(b, tt, 2600 + r.NextDouble() * 3600, new double[] { 1, 2.4, 4.1 }, new double[] { 1, 0.4, 0.2 }, 0.09, g * (0.2 + r.NextDouble() * 0.25), r.NextDouble() * 1.4 - 0.7, 0.3); }
  }
  public void Ceramic(BusW b, double t, double g) {
    Thud(b, t, g * 0.6, 220, 120, 0.06, 0.2); Noise(b, t, t + 0.18, 2200, 0.4, g * 0.7, 0, 0.2, 0, 0.003);
    var r = new Random(3); for (int i = 0; i < 12; i++) { double tt = t + 0.03 + r.NextDouble() * 0.45; Bell(b, tt, 900 + r.NextDouble() * 1400, new double[] { 1, 2.1, 3.3 }, new double[] { 1, 0.5, 0.2 }, 0.05, g * 0.25, r.NextDouble() - 0.5, 0.2); Thud(b, tt + 0.02, g * 0.15, 300, 180, 0.03, 0); }
  }
  // whip / rod strike: a fast swish leading into a sharp, bassy crack
  public void Strike(BusW b, double t, double g) {
    Noise(b, t - 0.16, t, 1800, 0.5, g * 0.35, 0.3, 0.1, 0, 0.12);
    int a = (int)Math.Round(t * SR), n = (int)(0.06 * SR); double hp = 0, pv = 0;
    for (int k = 0; k < n; k++) { double x = Rnd(); hp = 0.85 * (hp + x - pv); pv = x; double v = hp * Math.Exp(-(double)k / (SR * 0.006)); if (a + k < N) { b.L[a + k] += v * g * 1.6; b.R[a + k] += v * g * 1.6; RV.L[a + k] += v * g * 0.5; RV.R[a + k] += v * g * 0.5; } }
    Kick(b, t, g * 0.75, 0.3); SubDrop(b, t, g * 0.5, 0.5);
  }
  public void Slap(BusW b, double t, double g) { Noise(b, t, t + 0.05, 1400, 0.6, g * 0.8, 0, 0.15, 0, 0.002); Thud(b, t, g * 0.4, 160, 100, 0.04, 0.1); }
  public void Drip(BusW b, double t, double g) { Chirp(b, t, 1500, 700, 0.06, g, 0); Thud(b, t, g * 0.25, 400, 200, 0.02, 0.4); }
  public void Water(BusW b, double t0, double t1, double g) { Noise(b, t0, t1, 2600, 0.25, g, 0.3, 0.15, 7, 0.4); Noise(b, t0, t1, 600, 0.4, g * 0.6, 0.3, 0.1, 3, 0.4); }
  public void Wind(BusW b, double t0, double t1, double g) { Noise(b, t0, t1, 320, 0.35, g, 0, 0.3, 0.4, 0.6); }
  public void Crickets(BusW b, double t0, double t1, double g) { var r = new Random(5); for (double t = t0; t < t1; t += 0.11 + r.NextDouble() * 0.06) for (int i = 0; i < 3; i++) Chirp(b, t + i * 0.018, 4300, 4300, 0.012, g, r.NextDouble() - 0.5); }
  public void Creak(BusW b, double t, double dur, double g) { Syl(b, t, dur, 70, 55, new double[] { 420, 1300, 2600 }, new double[] { 60, 120, 200 }, g, 0.6, 0.0, 0.2, 1.2); }
  public void Choir(BusW b, double t0, double t1, double g) { foreach (double f in new double[] { 220, 277.2, 329.6, 440 }) Syl(b, t0, t1 - t0, f, f * 1.005, new double[] { 750, 1150, 2600 }, new double[] { 90, 110, 160 }, g, 0.45, 0.0, f > 300 ? 0.3 : -0.3); }
  public void Crow(BusW b, double t, double g, double pan) { for (int i = 0; i < 2; i++) Syl(b, t + i * 0.32, 0.22, 560, 470, new double[] { 900, 1500, 2700 }, new double[] { 200, 260, 300 }, g, 0.5, 0.0, pan, 0.9); }
  public void Steps(BusW b, double t0, double t1, double rate, double g, double hiMix) { for (double s = t0; s < t1; s += 1.0 / rate) { Thud(b, s, g, 110, 65, 0.06, 0.2); if (hiMix > 0) Noise(b, s, s + 0.12, 7500, 0.5, g * hiMix, 0.2, 0.1, 0, 0.01); } }

  // ---------------- arrangement: The Whipping Boy ----------------
  public void Build(bool music) {
    // loop landing + transitions (soft, bassy, only on the big moves)
    Impact(F, 0.0, 0.45);
    foreach (double w in new double[] { 2.6, 7.17, 15.62, 22.3, 37.45, 40.2, 48.43 }) DeepWhoosh(F, w, 0.8, 0.32, -0.4, 0.4);
    // S1 castle gate: birds, flags, crowd murmur, guards come to attention
    Birds(F, 0.0, 2.7, 1.4, 0.08, 1); Noise(F, 0.0, 2.7, 900, 0.4, 0.05, 0, 0.1, 5, 0.3);
    Mutter(V, 0.1, 2.5, 140, 0.012, -0.6); Mutter(V, 0.3, 2.5, 190, 0.01, 0.6);
    Thud(F, 0.45, 0.35, 140, 80, 0.05, 0.3); Thud(F, 0.5, 0.3, 150, 85, 0.05, 0.3); Noise(F, 0.42, 0.62, 7000, 0.5, 0.08, 0, 0.1, 0, 0.01);
    // S2 silk: a silky sweep and a sparkle on the reveal
    Noise(F, 2.85, 3.4, 4200, 0.6, 0.22, 0, 0.2, 0, 0.2); Bell(F, 3.15, 1318.5, new double[] { 1, 2 }, new double[] { 1, 0.3 }, 0.6, 0.07, -0.2, 0.4); Bell(F, 3.25, 1760, new double[] { 1, 2 }, new double[] { 1, 0.3 }, 0.6, 0.06, 0.2, 0.4);
    Laugh(V, 3.5, 2, 0.15, 420, 380, "aa", 0.06, 0.1, 0.5, 0);                            // delighted giggle
    // S3 throne: the Prince's sly snicker; "one catch" -> a low swell
    Laugh(V, 5.2, 3, 0.15, 400, 360, "eee", 0.07, 0.15, 0.55, 0);
    Reverse(F, 5.85, 6.6, 0.25); SubDrop(F, 6.6, 0.35, 0.8); Noise(F, 3.8, 7.2, 450, 0.4, 0.035, 0, 0.15, 0, 0.4);
    // S5 chapel: holy choir swell + shimmer
    Choir(F, 7.17, 9.5, 0.035); Bell(F, 7.5, 659.3, new double[] { 1, 2, 3 }, new double[] { 1, 0.4, 0.2 }, 1.6, 0.05, 0, 0.6);
    // S6 garden: fountain, birds, the urn smash, a gasp, the guard's spear thump, a bratty laugh
    Water(F, 9.3, 11.95, 0.07); Birds(F, 9.3, 11.9, 1.0, 0.06, 2);
    Ceramic(F, 9.92, 0.45); Gasp(V, 10.12, 0.12, 0.3); Thud(F, 10.45, 0.35, 120, 70, 0.06, 0.2); Laugh(V, 10.55, 4, 0.14, 430, 380, "aaee", 0.07, -0.2, 0.5, 0);
    // S7 classroom: lecture mutter, the book slams to the floor, the apple, the window shatters
    Mutter(V, 11.9, 12.8, 120, 0.06, 0.3); Noise(F, 11.86, 37.45, 500, 0.4, 0.035, 0, 0.1, 0, 0.5); Thud(F, 13.72, 0.4, 160, 90, 0.05, 0.3); Noise(F, 13.75, 13.9, 2400, 0.5, 0.1, -0.3, 0.2, 0, 0.01);
    Noise(F, 14.78, 15.1, 1200, 0.6, 0.12, 0.2, 0.1, 0, 0.1); Glass(F, 15.12, 0.45); Gasp(V, 15.2, 0.12, 0.2);
    // S8 the door bangs open, boots, chainmail, the boy whimpers
    Thud(F, 15.62, 0.6, 90, 50, 0.12, 0.4); Creak(F, 15.65, 0.5, 0.05); Steps(F, 15.8, 17.4, 3.2, 0.35, 0.07);
    Laugh(V, 16.0, 4, 0.3, 470, 420, "oooo", 0.05, 0, 0.6, 0);
    // S9 / S14 grapes: soft wet munching
    for (double s = 17.5 + 0.56; s < 19.85; s += 1.25) { Noise(F, s, s + 0.08, 2600, 0.5, 0.18, -0.3, 0.05, 0, 0.005); Noise(F, s + 0.2, s + 0.5, 1800, 0.5, 0.1, -0.3, 0.02, 9, 0.03); }
    for (double s = 28.55 + 0.3; s < 30.9; s += 1.4) { Noise(F, s, s + 0.08, 2600, 0.5, 0.18, -0.3, 0.05, 0, 0.005); Noise(F, s + 0.2, s + 0.5, 1800, 0.5, 0.1, -0.3, 0.02, 9, 0.03); }
    // S10 the rod: leather creak on the pick-up, slaps into the palm, an ominous swell
    Pad(F, 19.85, 22.3, new double[] { 55.0, 82.4 }, 0.06, 300); Creak(F, 20.3, 0.45, 0.08); Slap(F, 21.5, 0.7); Slap(F, 22.0, 0.8);
    // S11 / S15 strikes
    foreach (double h in new double[] { 22.82, 23.86 }) { Strike(F, h, 0.7); Laugh(V, h + 0.12, 1, 0.25, 520, 470, "a", 0.05, -0.2, 0.5, 0); }
    foreach (double h in new double[] { 31.25, 32.1, 32.95 }) Strike(F, h, 0.55);
    // S12 trembling breaths, heartbeat, then the scream
    foreach (double h in new double[] { 24.7, 25.25, 25.75 }) { Thud(F, h, 0.4, 60, 45, 0.1, 0); Thud(F, h + 0.2, 0.25, 58, 44, 0.08, 0); }
    Syl(V, 24.75, 0.45, 300, 330, new double[] { 340, 2200, 2900 }, new double[] { 70, 110, 140 }, 0.05, 0.95, 0.4, 0);
    Syl(V, 25.4, 0.4, 300, 280, new double[] { 340, 2200, 2900 }, new double[] { 70, 110, 140 }, 0.05, 0.95, 0.4, 0);
    Syl(V, 26.0, 1.0, 520, 640, new double[] { 900, 1300, 2900, 3800 }, new double[] { 120, 140, 180, 220 }, 0.1, 0.35, 0.02, 0, 0.35);
    Impact(F, 26.02, 0.35);
    // S13 corridor: the echo, the maids gasp, linens rustle, torches
    Gasp(V, 26.98, 0.1, -0.4); Gasp(V, 27.1, 0.09, 0.4); Noise(F, 27.0, 27.4, 3000, 0.7, 0.05, 0, 0.1, 10, 0.05); Crackle(F, 26.9, 28.55, 0.03, 4);
    // ticking clock under "the sick rule"
    for (double s = 28.6; s < 33.1; s += 0.5) Tick(F, s, 0.32, ((int)(s * 2)) % 2 == 0 ? -0.3 : 0.3);
    Noise(F, 30.9, 33.1, 5200, 0.4, 0.025, 0.4, 0.05, 0, 0.3);   // sand trickling
    // S16 the Prince cries; the grapes drop
    Sob(V, 34.3, 0.028, 0); Sob(V, 34.85, 0.028, 0); Thud(F, 34.88, 0.15, 200, 120, 0.04, 0.1);
    // S17 the Prince laughs
    SubDrop(F, 35.3, 0.25, 0.6); Laugh(V, 35.5, 10, 0.17, 440, 360, "aaaaaaaaaa", 0.09, -0.1, 0.4, 0.2);
    // S18 marble: heartbeat, drips, sand
    foreach (double h in new double[] { 37.6, 38.5, 39.4 }) { Thud(F, h, 0.35, 58, 44, 0.1, 0); Thud(F, h + 0.22, 0.22, 56, 42, 0.08, 0); }
    foreach (double d in new double[] { 37.85, 38.75, 39.55 }) Drip(F, d + 0.18, 0.3);
    Noise(F, 37.45, 40.2, 5200, 0.4, 0.025, 0.2, 0.1, 0, 0.3); Pad(F, 37.45, 40.2, new double[] { 49.0, 73.4 }, 0.05, 260);
    // S19 attic: seasons pass (wind -> birds -> crickets -> leaves -> dawn), the sigh of relief
    Wind(F, 40.2, 41.4, 0.18); Birds(F, 41.3, 42.1, 1.6, 0.07, 3); Crickets(F, 42.0, 42.7, 0.05); Wind(F, 42.5, 43.2, 0.1); Birds(F, 43.2, 44.7, 0.8, 0.07, 4);
    Reverse(F, 40.9, 42.3, 0.2); Sigh(V, 43.35, 0.14, 0);
    // S20 garden: the son's tantrum, the urn smash, the King's proud laugh
    Water(F, 44.4, 48.5, 0.07); Birds(F, 44.6, 48.4, 0.8, 0.06, 5);
    Steps(F, 44.7, 45.3, 4.4, 0.25, 0); Syl(V, 45.1, 0.3, 460, 400, new double[] { 800, 1250, 2600 }, new double[] { 100, 120, 160 }, 0.06, 0.3, 0.02, 0.3, 0.2);
    Ceramic(F, 45.42, 0.4); Laugh(V, 45.6, 6, 0.16, 150, 130, "aaaaaa", 0.07, 0.2, 0.35, 0);
    // S21 the bag of gold
    foreach (double c in new double[] { 47.3, 47.36, 47.45, 47.6 }) Coin(F, c, 2100 + (c * 1000 % 500), 0.06, 0.1);
    Pad(F, 46.9, 48.5, new double[] { 55.0, 77.8 }, 0.05, 300); Mutter(V, 47.75, 48.3, 120, 0.02, 0.2);
    // S22 the street: wind, crows, his slow footsteps; a riser carries the loop into frame 0
    Wind(F, 48.3, T, 0.06); Crow(F, 48.8, 0.04, -0.5); Steps(F, 48.45, 49.6, 1.7, 0.18, 0);
    Riser(F, 48.6, T - 0.005, 0.32);
    // room tone / fire crackle under the classroom stretch
    Crackle(F, 11.9, 37.45, 0.012, 2);
  }

'@
$cs = $cs.Substring(0, $i0) + $arr + $cs.Substring($i1)
if (-not ('ScoreW' -as [type])) { Add-Type -TypeDefinition $cs }
$voW = [AudioTool]::Read($VoPath); $sr = $voW.Rate
$N = [int][Math]::Round($Frames / [double]$Fps * $sr)
$sc = New-Object ScoreW $N, $sr
$sc.Build($false)
$sc.Reverb(0.82, 0.35, 0.9)
$w = New-Object Wav; $w.Rate = $sr; $w.Ch = 2; $w.Bits = 16
$w.S = $sc.Mix($voW.S, $voW.Ch, 0.0, 0.5, 0.35, 1.0)
[AudioTool]::Write((Join-Path (Get-Location) $OutPath), $w)
foreach ($pt in @(@($VoOut, 1), @($SfxOut, 2))) { if ($pt[0]) { $x = New-Object Wav; $x.Rate = $sr; $x.Ch = 2; $x.Bits = 16; $x.S = $sc.Mix($voW.S, $voW.Ch, 0.0, 0.5, 0.35, 1.0, $pt[1]); [AudioTool]::Write((Join-Path (Get-Location) $pt[0]), $x); "wrote $($pt[0])" } }
"wrote $OutPath ($([Math]::Round($N / $sr, 4))s)"



