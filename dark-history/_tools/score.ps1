# Score v2 for "The Messenger": dark trap groove (bar-locked so the music loops with the video), bassy trailer
# hits, risers, character vocal sounds (formant synthesis) and foley, mixed under the voiceover.
param([string]$Vo = '_vo\vo_tight.wav', [string]$Out = '_vo\mix2.wav', [int]$Frames = 2743, [int]$Fps = 60, [double]$Master = 1.0, [string]$Stems = '', [switch]$NoMusic, [string]$VoOut = '', [string]$SfxOut = '')
$ErrorActionPreference = 'Stop'
$OutPath = $Out; $VoPath = (Resolve-Path $Vo).Path; $StemDir = $Stems
. "$PSScriptRoot\audiotool.ps1" -Mode none
if (-not ('Score2' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
public class Bus { public double[] L, R; public Bus(int n) { L = new double[n]; R = new double[n]; } }
public class Score2 {
  public int SR = 48000, N; public Bus G, F, V, RV; uint rs = 2463534242; public double T, Bar;
  public Score2(int n, int sr) { N = n; SR = sr; G = new Bus(n); F = new Bus(n); V = new Bus(n); RV = new Bus(n); T = (double)n / sr; Bar = T / 19.0; }
  public double Rnd() { rs ^= rs << 13; rs ^= rs >> 17; rs ^= rs << 5; return (rs / 4294967296.0) * 2 - 1; }
  int I(double t) { return (int)Math.Round(t * SR); }
  void Put(Bus b, int i, double v, double pan, double send) {
    if (i < 0 || i >= N) return; double a = (pan + 1) * Math.PI / 4, gl = Math.Cos(a) * 1.41421, gr = Math.Sin(a) * 1.41421;
    b.L[i] += v * gl; b.R[i] += v * gr; if (send > 0) { RV.L[i] += v * gl * send; RV.R[i] += v * gr * send; }
  }
  static bool In(double t, double[] r) { for (int i = 0; i + 1 < r.Length; i += 2) if (t >= r[i] && t < r[i + 1]) return true; return false; }

  // ---------------- drums ----------------
  public void Kick(Bus b, double t, double g, double send = 0.04) {
    int a = I(t), n = I(0.5); double ph = 0, hp = 0, prev = 0;
    for (int k = 0; k < n; k++) {
      double tt = (double)k / SR, f = 44 + 140 * Math.Exp(-tt * 30); ph += 2 * Math.PI * f / SR;
      double x = Rnd(); hp = 0.6 * (hp + x - prev); prev = x;
      double v = Math.Sin(ph) * Math.Exp(-tt / 0.3) + hp * Math.Exp(-tt / 0.0022) * 0.7;
      Put(b, a + k, Math.Tanh(v * 2.0) * 0.85 * g, 0, send);
    }
  }
  public void Sub(Bus b, double t, double f, double dur, double g, double fromF) {
    int a = I(t), n = I(dur + 0.25); double ph = 0;
    for (int k = 0; k < n; k++) {
      double tt = (double)k / SR, fr = f + (fromF - f) * Math.Exp(-tt * 22); ph += 2 * Math.PI * fr / SR;
      double amp = Math.Min(1, tt / 0.004) * Math.Exp(-tt / 1.6) * (tt < dur ? 1 : Math.Exp(-(tt - dur) / 0.05));
      double s = Math.Sin(ph); double v = (Math.Tanh(s * 2.8) * 0.55 + s * 0.45) * amp;
      Put(b, a + k, v * g, 0, 0);
    }
  }
  public void Clap(Bus b, double t, double g, double pan = 0) {
    int a = I(t), n = I(0.32); double lo = 0, bp = 0, F = 2 * Math.Sin(Math.PI * 1500.0 / SR), ph = 0;
    for (int k = 0; k < n; k++) {
      double tt = (double)k / SR, x = Rnd(), hi = x - lo - 0.75 * bp; bp += F * hi; lo += F * bp;
      double e = 0; foreach (double o in new double[] { 0, 0.011, 0.022 }) if (tt >= o) e += Math.Exp(-(tt - o) / 0.0055);
      if (tt > 0.026) e += 0.9 * Math.Exp(-(tt - 0.026) / 0.12);
      ph += 2 * Math.PI * 205 / SR; double body = Math.Sin(ph) * Math.Exp(-tt / 0.035) * 0.35;
      Put(b, a + k, (bp * e * 1.6 + body) * g, pan, 0.32);
    }
  }
  public void Hat(Bus b, double t, double g, double dec, double pan) {
    int a = I(t), n = I(dec * 6); double h1 = 0, p1 = 0, h2 = 0, p2 = 0;
    for (int k = 0; k < n; k++) {
      double x = Rnd(); h1 = 0.82 * (h1 + x - p1); p1 = x; h2 = 0.82 * (h2 + h1 - p2); p2 = h1;
      Put(b, a + k, h2 * Math.Exp(-(double)k / SR / dec) * g, pan, 0.05);
    }
  }
  public void Tick(Bus b, double t, double g, double pan) {
    int a = I(t), n = I(0.04); double ph = 0;
    for (int k = 0; k < n; k++) { double tt = (double)k / SR; ph += 2 * Math.PI * 2900 / SR; Put(b, a + k, (Math.Sin(ph) * 0.7 + Rnd() * 0.3) * Math.Exp(-tt / 0.005) * g, pan, 0.15); }
  }
  // ---------------- tonal beds ----------------
  public void Pad(Bus b, double t0, double t1, double[] fr, double g, double cut) {
    int a = I(t0), n = I(t1 - t0 + 0.8); double[] ph = new double[fr.Length * 3]; double l1 = 0, l2 = 0, F = 2 * Math.Sin(Math.PI * cut / SR);
    for (int k = 0; k < n; k++) {
      double tt = (double)k / SR, s = 0;
      for (int j = 0; j < fr.Length; j++) for (int d = 0; d < 3; d++) { int q = j * 3 + d; ph[q] += fr[j] * (1 + (d - 1) * 0.004) / SR; ph[q] -= Math.Floor(ph[q]); s += (ph[q] * 2 - 1) / (fr.Length * 3); }
      l1 += F * (s - l1); l2 += F * (l1 - l2);
      double amp = Math.Min(1, tt / 0.35) * (tt < t1 - t0 ? 1 : Math.Exp(-(tt - (t1 - t0)) / 0.25));
      Put(b, a + k, l2 * amp * g, Math.Sin(tt * 0.6) * 0.3, 0.45);
    }
  }
  public void Braam(Bus b, double t, double g, double dur) {
    double[] fr = { 73.42, 110.0, 146.83, 174.61 }; int a = I(t), n = I(dur + 1.0); double[] ph = new double[8]; double l1 = 0, l2 = 0;
    for (int k = 0; k < n; k++) {
      double tt = (double)k / SR, s = 0;
      for (int j = 0; j < 4; j++) for (int d = 0; d < 2; d++) { int q = j * 2 + d; ph[q] += fr[j] * (1 + (d == 0 ? -0.006 : 0.006)) / SR; ph[q] -= Math.Floor(ph[q]); s += (ph[q] * 2 - 1) * 0.125; }
      double cut = tt < 0.12 ? 150 + 2100 * (tt / 0.12) : 300 + 1950 * Math.Exp(-(tt - 0.12) / (dur * 0.4));
      double F = 2 * Math.Sin(Math.PI * cut / SR); l1 += F * (s - l1); l2 += F * (l1 - l2);
      double amp = Math.Min(1, tt / 0.025) * (tt < dur ? Math.Exp(-tt / (dur * 1.2)) : Math.Exp(-dur / (dur * 1.2)) * Math.Exp(-(tt - dur) / 0.35));
      Put(b, a + k, Math.Tanh(l2 * 3.2) * amp * g, 0, 0.5);
    }
    SubDrop(b, t, g * 1.7, 1.6);
  }
  public void SubDrop(Bus b, double t, double g, double dec) {
    int a = I(t), n = I(dec * 3); double ph = 0;
    for (int k = 0; k < n; k++) { double tt = (double)k / SR, f = 27 + 85 * Math.Exp(-tt * 2.2); ph += 2 * Math.PI * f / SR; double s = Math.Sin(ph); Put(b, a + k, (Math.Tanh(s * 2) * 0.6 + s * 0.4) * Math.Min(1, tt / 0.003) * Math.Exp(-tt / dec) * g, 0, 0); }
  }
  public void Impact(Bus b, double t, double g) {
    Kick(b, t, g * 1.1, 0.25); SubDrop(b, t, g * 0.85, 1.1);
    int a = I(t), n = I(0.5); double lo = 0, bp = 0, F = 2 * Math.Sin(Math.PI * 700.0 / SR);
    for (int k = 0; k < n; k++) { double x = Rnd(), hi = x - lo - 0.9 * bp; bp += F * hi; lo += F * bp; Put(b, a + k, bp * Math.Exp(-(double)k / SR / 0.09) * 0.9 * g, 0, 0.55); }
  }
  public void Riser(Bus b, double t0, double t1, double g) {
    int a = I(t0), n = I(t1 - t0); double lo = 0, bp = 0, ph = 0, am = 0;
    for (int k = 0; k < n; k++) {
      double u = (double)k / n, fc = 200 * Math.Pow(40, Math.Pow(u, 1.5)), F = 2 * Math.Sin(Math.PI * Math.Min(fc, SR / 6.0) / SR), x = Rnd();
      double hi = x - lo - 0.6 * bp; bp += F * hi; lo += F * bp;
      ph += 2 * Math.PI * 110 * Math.Pow(8, u) / SR; am += 2 * Math.PI * (4 + 22 * u * u) / SR;
      double trem = 0.75 + 0.25 * Math.Sin(am), env = Math.Pow(u, 2.2);
      Put(b, a + k, (bp * 0.9 + Math.Sin(ph) * 0.22) * env * trem * g, Math.Sin(u * 9) * 0.3, 0.3);
    }
  }
  public void Reverse(Bus b, double t0, double t1, double g) {
    int a = I(t0), n = I(t1 - t0); double l1 = 0, l2 = 0, ph1 = 0, ph2 = 0;
    for (int k = 0; k < n; k++) {
      double u = (double)k / n, x = Rnd(), F = 2 * Math.Sin(Math.PI * (300 + 3000 * u * u) / SR); l1 += F * (x - l1); l2 += F * (l1 - l2);
      ph1 += 2 * Math.PI * 146.83 / SR; ph2 += 2 * Math.PI * 220 / SR;
      Put(b, a + k, (l2 * 1.4 + (Math.Sin(ph1) + Math.Sin(ph2)) * 0.12) * Math.Pow(u, 3) * g, 0, 0.35);
    }
  }
  public void DeepWhoosh(Bus b, double tc, double dur, double g, double p0, double p1) {
    int a = I(tc - dur / 2), n = I(dur); double lo = 0, bp = 0, ph = 0;
    for (int k = 0; k < n; k++) {
      double u = (double)k / n, fc = u < 0.5 ? 110 + 450 * (u * 2) : 560 - 430 * ((u - 0.5) * 2), F = 2 * Math.Sin(Math.PI * fc / SR), x = Rnd();
      double hi = x - lo - 0.8 * bp; bp += F * hi; lo += F * bp;
      ph += 2 * Math.PI * (75 - 35 * u) / SR; double env = Math.Pow(Math.Sin(Math.PI * u), 2);
      Put(b, a + k, (bp * 1.3 + Math.Sin(ph) * 0.35) * env * g, p0 + (p1 - p0) * u, 0.2);
    }
  }
  public void Bell(Bus b, double t, double f, double[] r, double[] amp, double dec, double g, double pan, double send) {
    int a = I(t), n = I(dec * 5);
    for (int j = 0; j < r.Length; j++) { double w = 2 * Math.PI * f * r[j] / SR, d = dec / (1 + j * 0.35); for (int k = 0; k < n; k++) { double tt = (double)k / SR; Put(b, a + k, Math.Sin(w * k) * amp[j] * Math.Exp(-tt / d) * Math.Min(1, tt * 500) * g, pan, send); } }
  }
  public void Coin(Bus b, double t, double f, double g, double pan) { Bell(b, t, f, new double[] { 1, 2.76, 5.4 }, new double[] { 1, 0.5, 0.25 }, 0.16, g, pan, 0.15); }
  public void Noise(Bus b, double t0, double t1, double fc, double q, double g, double pan, double send, double rate, double fade) {
    int a = I(t0), n = I(t1 - t0); double lo = 0, bp = 0, F = 2 * Math.Sin(Math.PI * fc / SR), ph = 0, fd = SR * fade;
    for (int k = 0; k < n; k++) {
      double x = Rnd(), hi = x - lo - q * bp; bp += F * hi; lo += F * bp;
      ph += rate / SR; double burst = rate > 0 ? 0.3 + Math.Pow(Math.Max(0, Math.Sin(2 * Math.PI * ph)), 3) : 1;
      double edge = Math.Min(1, Math.Min(k / fd, (n - k) / fd));
      Put(b, a + k, bp * burst * edge * g, pan, send);
    }
  }
  public void Thud(Bus b, double t, double g, double f0, double f1, double dec, double send) {
    int a = I(t), n = I(dec * 5); double ph = 0, lo = 0;
    for (int k = 0; k < n; k++) { double tt = (double)k / SR, f = f1 + (f0 - f1) * Math.Exp(-tt * 40); ph += 2 * Math.PI * f / SR; lo += 0.05 * (Rnd() - lo); Put(b, a + k, (Math.Sin(ph) + lo * 2 * Math.Exp(-tt * 60)) * Math.Exp(-tt / dec) * Math.Min(1, tt * 800) * g, 0, send); }
  }
  public void Crackle(Bus b, double t0, double t1, double g, double dens) {
    int a = I(t0), n = I(t1 - t0); double lo = 0;
    for (int k = 0; k < n; k++) {
      lo += 0.003 * (Rnd() - lo); double edge = Math.Min(1, Math.Min(k / (SR * 0.5), (n - k) / (SR * 0.5)));
      Put(b, a + k, lo * 4 * g * edge, 0, 0);
      if ((Rnd() + 1) / 2 < dens / SR) { int m = I(0.012); double hp = 0, pv = 0, gg = g * (0.3 + (Rnd() + 1) * 0.6), pn = Rnd() * 0.6; for (int j = 0; j < m; j++) { double x = Rnd(); hp = 0.7 * (hp + x - pv); pv = x; Put(b, a + k + j, hp * Math.Exp(-(double)j / (SR * 0.002)) * gg, pn, 0.1); } }
    }
  }
  // record stop on a bus: playback slows to a halt over dur, then silence until t0+dur+hold
  public void TapeStop(Bus b, double t0, double dur, double hold) {
    int a = I(t0), n = I(dur), m = I(dur + hold); var L = new double[m]; var R = new double[m]; double pos = 0;
    for (int k = 0; k < m; k++) { if (k < n) { double u = (double)k / n, rate = 1 - u * u; int i0 = a + (int)pos; double fr = pos - Math.Floor(pos); if (i0 + 1 < N) { L[k] = b.L[i0] * (1 - fr) + b.L[i0 + 1] * fr; R[k] = b.R[i0] * (1 - fr) + b.R[i0 + 1] * fr; } L[k] *= 1 - u * 0.3; R[k] *= 1 - u * 0.3; pos += rate; } }
    for (int k = 0; k < m && a + k < N; k++) { b.L[a + k] = L[k]; b.R[a + k] = R[k]; }
  }
  public void LowpassRange(Bus b, double t0, double t1, double fc, double ramp) {
    int a = I(t0 - ramp), n = I(t1 - t0 + 2 * ramp); double l1 = 0, l2 = 0, r1 = 0, r2 = 0;
    for (int k = 0; k < n; k++) {
      int i = a + k; if (i < 0 || i >= N) continue; double tt = t0 - ramp + (double)k / SR;
      double w = tt < t0 ? (tt - (t0 - ramp)) / ramp : tt > t1 ? 1 - (tt - t1) / ramp : 1; w = Math.Max(0, Math.Min(1, w));
      double F = 2 * Math.Sin(Math.PI * (fc + (12000 - fc) * (1 - w)) / SR);
      l1 += F * (b.L[i] - l1); l2 += F * (l1 - l2); r1 += F * (b.R[i] - r1); r2 += F * (r1 - r2);
      b.L[i] = b.L[i] * (1 - w) + l2 * w; b.R[i] = b.R[i] * (1 - w) + r2 * w;
    }
  }

  // ---------------- voices (formant synthesis) ----------------
  // one voiced/breathy syllable: f0 from f0a to f0b, vowel formants, aspirated onset
  public void Syl(Bus b, double t, double dur, double f0a, double f0b, double[] Fm, double[] Bw, double g, double breath, double asp, double pan, double rough = 0) {
    int a = I(t), n = I(dur); double ph = 0, src = 0; int nf = Fm.Length;
    double[] y1 = new double[nf], y2 = new double[nf], A1 = new double[nf], A2 = new double[nf], Gn = new double[nf];
    double[] fg = { 1.0, 0.55, 0.28, 0.14, 0.08 };
    for (int j = 0; j < nf; j++) { double r = Math.Exp(-Math.PI * Bw[j] / SR); A1[j] = -2 * r * Math.Cos(2 * Math.PI * Fm[j] / SR); A2[j] = r * r; Gn[j] = (1 - r) * fg[Math.Min(j, 4)]; }
    double na = asp * SR;
    for (int k = 0; k < n; k++) {
      double u = (double)k / n, tt = (double)k / SR;
      double f0 = (f0a + (f0b - f0a) * u) * (1 + 0.012 * Rnd() * 0.3 + 0.015 * Math.Sin(tt * 2 * Math.PI * 5.5));
      ph += f0 / SR; if (ph >= 1) ph -= 1;
      double pulse = ph < 0.6 ? Math.Sin(Math.PI * ph / 0.6) : 0; pulse = pulse * pulse;           // Rosenberg-ish glottal pulse
      double voiced = (pulse - 0.3) * (1 + rough * Math.Sin(tt * 2 * Math.PI * f0 * 0.5));
      double onset = k < na ? 1.0 : Math.Exp(-(k - na) / (SR * 0.01));                            // the "h"
      double vAmt = k < na ? 0.15 : 1.0;
      double x = voiced * vAmt * (1 - breath) + Rnd() * (breath * 0.6 + onset * 0.9);
      src += 0.6 * (x - src);
      double y = 0; for (int j = 0; j < nf; j++) { double yy = Gn[j] * src * 8 - A1[j] * y1[j] - A2[j] * y2[j]; y2[j] = y1[j]; y1[j] = yy; y += yy; }
      double env = Math.Min(1, tt / 0.012) * Math.Pow(1 - u, 0.6) * (u > 0.85 ? (1 - u) / 0.15 : 1);
      Put(b, a + k, y * env * g, pan, 0.22);
    }
  }
  static double[] FA = { 800, 1200, 2500, 3500 }, BA = { 90, 100, 130, 180 };
  static double[] FE = { 550, 1800, 2500, 3500 }, BE = { 80, 100, 130, 180 };
  static double[] FI = { 320, 2250, 2950, 3600 }, BI = { 70, 110, 140, 180 };
  static double[] FO = { 480, 820, 2450, 3300 }, BO = { 80, 90, 130, 170 };
  static double[] FU = { 340, 780, 2300, 3200 }, BU = { 70, 90, 130, 170 };
  static double[] FM = { 250, 1100, 2500 }, BM = { 60, 300, 400 };     // closed-mouth hum
  static double[] FS = { 500, 1500, 2500, 3400 }, BS = { 90, 110, 140, 180 }; // schwa
  public void Laugh(Bus b, double t, int nSyl, double per, double f0Start, double f0End, string vowels, double g, double pan, double breath, double accel) {
    double tt = t;
    for (int i = 0; i < nSyl; i++) {
      double u = nSyl > 1 ? (double)i / (nSyl - 1) : 0, f0 = f0Start + (f0End - f0Start) * u;
      char v = vowels[Math.Min(i, vowels.Length - 1)];
      double[] Fm = v == 'a' ? FA : v == 'e' ? FE : v == 'i' ? FI : v == 'o' ? FO : v == 'u' ? FU : v == 'm' ? FM : FS;
      double[] Bw = v == 'a' ? BA : v == 'e' ? BE : v == 'i' ? BI : v == 'o' ? BO : v == 'u' ? BU : v == 'm' ? BM : BS;
      double d = per * (0.62 + 0.1 * Rnd());
      Syl(b, tt, d, f0 * 1.04, f0 * 0.93, Fm, Bw, g * (1 - 0.35 * u), breath, v == 'm' ? 0.0 : 0.028, pan);
      tt += per * (1 + accel * (u - 0.5)) * (0.94 + 0.12 * (Rnd() + 1) / 2);
    }
  }
  public void Gasp(Bus b, double t, double g, double pan) { Syl(b, t, 0.32, 300, 340, FA, BA, g, 0.92, 0.3, pan); }
  public void Sigh(Bus b, double t, double g, double pan) { Syl(b, t, 0.75, 210, 150, FA, BA, g, 0.7, 0.06, pan); }
  public void Gulp(Bus b, double t, double g, double pan) {
    Syl(b, t, 0.09, 180, 140, FU, BU, g * 0.6, 0.3, 0.0, pan);
    int a = I(t + 0.07), n = I(0.12); double ph = 0;
    for (int k = 0; k < n; k++) { double tt = (double)k / SR; ph += 2 * Math.PI * (260 - 900 * tt) / SR; Put(b, a + k, Math.Sin(ph) * Math.Exp(-tt / 0.03) * g, pan, 0.1); }
  }
  // muffled angry muttering under the narration (syllables of random vowels, low pitch, low-passed later by the mix)
  public void Mutter(Bus b, double t0, double t1, double f0, double g, double pan) {
    string vs = "aseoaeuo"; double t = t0; int i = 0;
    while (t < t1) { char v = vs[i % vs.Length]; double d = 0.11 + 0.08 * (Rnd() + 1) / 2;
      double[] Fm = v == 'a' ? FA : v == 'e' ? FE : v == 'o' ? FO : v == 'u' ? FU : FS; double[] Bw = v == 'a' ? BA : v == 'e' ? BE : v == 'o' ? BO : v == 'u' ? BU : BS;
      Syl(b, t, d, f0 * (1.1 + 0.15 * Rnd()), f0 * 0.9, Fm, Bw, g, 0.25, 0.012, pan, 0.25); t += d + 0.02 + 0.05 * (Rnd() + 1) / 2; i++; }
  }
  public void Sob(Bus b, double t, double g, double pan) {
    Syl(b, t, 0.22, 380, 300, FU, BU, g * 0.8, 0.55, 0.02, pan);                          // whimper
    Syl(b, t + 0.28, 0.3, 300, 360, FI, BI, g * 0.6, 0.95, 0.25, pan);                     // shaky inhale
  }

  // ---------------- reverb (Freeverb-style) ----------------
  public void Reverb(double room, double damp, double wet) {
    int[] cl = { 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 }, al = { 556, 441, 341, 225 };
    double sc = SR / 44100.0;
    for (int ch = 0; ch < 2; ch++) {
      double[] inp = ch == 0 ? RV.L : RV.R, outp = new double[N]; int sp = ch * 23;
      for (int c = 0; c < cl.Length; c++) { int len = (int)((cl[c] + sp) * sc); var buf = new double[len]; int idx = 0; double fs = 0;
        for (int k = 0; k < N; k++) { double o = buf[idx]; fs = o * (1 - damp) + fs * damp; buf[idx] = inp[k] * 0.015 + fs * room; idx = (idx + 1) % len; outp[k] += o; } }
      for (int c = 0; c < al.Length; c++) { int len = (int)((al[c] + sp) * sc); var buf = new double[len]; int idx = 0;
        for (int k = 0; k < N; k++) { double bo = buf[idx], o = -outp[k] + bo; buf[idx] = outp[k] + bo * 0.5; idx = (idx + 1) % len; outp[k] = o; } }
      double[] dst = ch == 0 ? F.L : F.R; for (int k = 0; k < N; k++) dst[k] += outp[k] * wet;
    }
  }

  // ---------------- arrangement ----------------
  public void Build(bool music) {
    double b16 = Bar / 16;
    double[] KICK = { 0, 10.3, 14.2, 17.85, 19.3, 23.94, 33.16, 36.33, 38.01, 99 };
    double[] HEART = { 10.3, 12.83, 23.94, 26.95, 30.6, 33.16 };
    double[] CLAP = { 0, 10.3, 14.2, 17.85, 19.3, 20.95, 33.16, 36.33, 38.01, 40.04, 42.18, 99 };
    double[] HAT = { 0, 10.3, 14.2, 17.85, 19.3, 23.94, 33.16, 36.33, 38.01, 99 };
    double[] HAT16 = { 6.7, 10.3, 33.16, 36.33, 42.18, 99 };
    double[] ROLL = { 33.16, 36.33, 43.3, 99 };
    double[] BASS = { 0, 12.83, 14.2, 17.85, 19.3, 23.94, 33.16, 36.33, 38.01, 99 };
    double[] TICK = { 10.3, 12.83, 20.95, 23.94, 26.95, 29.3, 30.6, 33.16 };
    double[][] roots = { new[] { 73.42 }, new[] { 73.42 }, new[] { 58.27 }, new[] { 55.0 } };      // D, D, Bb, A
    double[][] chords = { new[] { 146.83, 174.61, 220.0 }, new[] { 146.83, 174.61, 220.0 }, new[] { 116.54, 146.83, 174.61 }, new[] { 110.0, 138.59, 164.81 } };
    double lastF = 73.42;
    for (int bar = 0; bar < 19; bar++) {
      double tb = bar * Bar; double root = roots[bar % 4][0];
      bool padOn = !In(tb + 0.1, new double[] { 12.83, 14.2, 23.94, 33.16 });
      if (padOn && music) Pad(G, tb, tb + Bar, chords[bar % 4], 0.11, 900);
      for (int s = 0; s < 16; s++) {
        double t = tb + s * b16;
        if (In(t, TICK) && s % 2 == 0) Tick(F, t, s % 4 == 0 ? 0.1 : 0.06, s % 4 == 0 ? -0.3 : 0.3);   // ticking clock is a sound effect, kept without music
        if (!music) continue;
        bool hot = In(t, new double[] { 42.18, 99, 33.16, 36.33 });
        if (In(t, KICK) && (s == 0 || s == 7 || s == 10 || (hot && s == 14))) Kick(G, t, s == 0 ? 1.0 : 0.85);
        if (In(t, HEART) && (s % 4 == 0)) Kick(G, t, s == 0 ? 0.75 : 0.55);
        if (In(t, BASS) && (s == 0 || s == 7 || s == 10 || (hot && s == 14))) {
          double f = (s == 10 && bar % 2 == 1) ? root * 1.335 : root; double dur = s == 0 ? 0.75 : s == 7 ? 0.25 : 0.42;
          double gg = In(t, new double[] { 40.04, 42.18 }) ? 0.55 : 1.0;
          Sub(G, t, f, dur, 0.62 * gg, lastF); lastF = f;
        }
        if (In(t, CLAP) && (s == 4 || s == 12)) Clap(G, t, 0.55);
        if (In(t, HAT) && s % 2 == 0) Hat(G, t, (s % 4 == 2 ? 0.22 : 0.15), s == 14 && bar % 2 == 1 ? 0.12 : 0.028, 0.2);
        if (In(t, HAT16) && s % 2 == 1) Hat(G, t, 0.1, 0.022, -0.2);
        if (In(t, ROLL) && s >= 12 && bar % 2 == 1) for (int r = 0; r < 3; r++) Hat(G, t + r * b16 / 3, 0.09 + r * 0.03, 0.018, 0.1);

      }
    }
    if (music) {
    // dark drones under the ominous stretches
    Pad(G, 12.83, 14.2, new[] { 73.42, 110.0 }, 0.16, 420);
    Pad(G, 23.94, 30.34, new[] { 73.42, 103.83, 146.83 }, 0.14, 520);
    Pad(G, 30.34, 33.16, new[] { 73.42, 110.0 }, 0.12, 480);
    // groove treatments
    TapeStop(G, 36.33, 0.38, 1.3);
    LowpassRange(G, 20.95, 23.94, 650, 0.25);
    LowpassRange(G, 40.04, 42.18, 420, 0.3);
    }

    // ---------------- trailer hits & transitions ----------------
    Impact(F, 0.0, 0.85);                                                     // the loop lands here (riser at the end builds into it)
    DeepWhoosh(F, 2.03, 0.8, 0.5, -0.6, 0.6);
    Bell(F, 3.62, 98, new[] { 0.5, 1, 1.183, 1.506, 2, 2.514 }, new[] { 0.7, 1, 0.7, 0.5, 0.4, 0.3 }, 2.2, 0.22, -0.2, 0.4);  // funeral bell
    DeepWhoosh(F, 4.06, 0.7, 0.45, 0.6, -0.6);
    Braam(F, 6.72, 0.3, 2.2);                                                 // the axe
    Bell(F, 7.64, 820, new[] { 1, 1.5, 2.71 }, new[] { 1, 0.4, 0.3 }, 0.6, 0.06, 0.3, 0.3);
    Riser(F, 8.6, 10.3, 0.28);
    DeepWhoosh(F, 10.30, 0.7, 0.4, 0, 0);
    Thud(F, 10.55, 0.35, 220, 120, 0.05, 0.2); Noise(F, 10.53, 10.7, 2500, 0.7, 0.35, 0, 0.1, 0, 0.005);   // wax crack
    Noise(F, 10.95, 11.6, 2800, 0.9, 0.12, 0, 0.1, 18, 0.05);                  // unrolling
    Riser(F, 11.2, 12.83, 0.42);
    Braam(F, 12.83, 0.42, 2.6);                                                 // stomach drops
    foreach (double h in new[] { 13.05, 13.65 }) { Thud(F, h, 0.55, 70, 48, 0.1, 0); Thud(F, h + 0.2, 0.35, 66, 46, 0.08, 0); }
    Reverse(F, 13.7, 14.2, 0.5); Impact(F, 14.2, 0.55);
    DeepWhoosh(F, 16.0, 0.7, 0.4, 0, 0);
    Noise(F, 16.0, 16.95, 3800, 0.7, 0.05, 0.15, 0.05, 12, 0.03);
    foreach (double[] w in new[] { new[] { 17.78, 18.12 }, new[] { 18.3, 18.58 }, new[] { 18.76, 19.18 }, new[] { 19.45, 20.65 } }) Noise(F, w[0], w[1], 3800, 0.7, 0.06, 0.15, 0.05, 14, 0.02);
    foreach (double[] s in new[] { new[] { 18.04, 0.75 }, new[] { 18.5, 0.8 }, new[] { 18.92, 1.0 } }) { Kick(F, s[0], s[1], 0.3); Clap(F, s[0], 0.5 * s[1]); Sub(F, s[0], 73.42, 0.3, 0.5 * s[1], 90); }   // FAT BALD COWARD
    Bell(F, 19.4, 293.66, new[] { 1, 2.0, 3.0 }, new[] { 1, 0.3, 0.1 }, 0.5, 0.08, -0.2, 0.3); Bell(F, 19.55, 246.94, new[] { 1, 2.0, 3.0 }, new[] { 1, 0.3, 0.1 }, 0.6, 0.07, 0.2, 0.3);   // sad little "wah-wah"
    Noise(F, 21.0, 21.9, 3200, 0.9, 0.07, 0, 0.05, 26, 0.05);                  // trembling page
    Riser(F, 22.4, 23.94, 0.32);
    DeepWhoosh(F, 23.94, 0.9, 0.45, 0.6, -0.6);
    foreach (double c in new[] { 24.4, 25.3, 26.2 }) Bell(F, c, 1350, new[] { 1, 2.3, 3.9 }, new[] { 1, 0.5, 0.3 }, 0.18, 0.035, -0.4, 0.4);
    Noise(F, 23.94, 26.95, 380, 0.5, 0.1, 0, 0.2, 0, 0.6);                    // cold wind through the hall
    Impact(F, 26.95, 0.6); DeepWhoosh(F, 26.95, 1.0, 0.55, 0, 0);              // fire flare
    foreach (double s in new[] { 27.2, 27.55, 27.9, 28.3 }) Thud(F, s, 0.4, 110, 60, 0.07, 0.2);
    Noise(F, 28.0, 28.7, 1800, 0.5, 0.08, -0.3, 0.2, 6, 0.1);                 // ladle scrape
    Riser(F, 27.9, 29.3, 0.4);
    Braam(F, 29.3, 0.45, 2.2); Noise(F, 29.3, 30.25, 6000, 0.35, 0.1, 0, 0.1, 3, 0.15);   // molten pour + hiss
    SubDrop(F, 30.34, 0.6, 1.0);
    Riser(F, 32.0, 33.16, 0.38); Impact(F, 33.16, 0.7);
    Bell(F, 37.22, 1174.66, new[] { 1, 2.0 }, new[] { 1, 0.2 }, 0.6, 0.06, -0.3, 0.4); Bell(F, 37.32, 1479.98, new[] { 1, 2.0 }, new[] { 1, 0.2 }, 0.6, 0.055, 0.0, 0.4); Bell(F, 37.42, 1760.0, new[] { 1, 2.0 }, new[] { 1, 0.2 }, 0.8, 0.05, 0.3, 0.4);   // blush chime
    Impact(F, 38.01, 0.5); DeepWhoosh(F, 38.43, 0.5, 0.3, 0.5, -0.5);
    foreach (double c in new[] { 38.45, 38.5, 38.56 }) Coin(F, c, 2300 + (c * 1000 % 400), 0.08, 0.3);
    Thud(F, 39.02, 0.5, 150, 90, 0.06, 0.1); foreach (double c in new[] { 39.03, 39.07, 39.12 }) Coin(F, c, 2100 + (c * 1000 % 500), 0.09, -0.4);
    foreach (double c in new[] { 39.33, 39.5, 39.63 }) Coin(F, c, 1700 + (c * 1000 % 300), 0.07, -0.5);
    Reverse(F, 39.5, 40.04, 0.35); DeepWhoosh(F, 40.04, 1.0, 0.35, 0, 0);       // door light
    Reverse(F, 41.6, 42.18, 0.6); Impact(F, 42.18, 0.85);                      // beat slams back: the worse letter
    Noise(F, 42.25, 43.6, 3600, 0.7, 0.08, 0.15, 0.05, 16, 0.03);
    DeepWhoosh(F, 43.8, 0.8, 0.5, 0, 0); Impact(F, 43.82, 0.6);
    for (double s = 43.95; s < 45.5; s += 1 / 1.9) { Thud(F, s, 0.55, 120, 62, 0.07, 0.15); Noise(F, s, s + 0.14, 7500, 0.5, 0.08, 0.2, 0.15, 0, 0.01); }   // boots + chainmail
    Riser(F, 44.0, T - 0.005, 0.5);
    // fire ambience in the hall scenes
    Crackle(F, 4.06, 14.2, 0.03, 5); Crackle(F, 20.95, 30.34, 0.035, 6); Crackle(F, 30.34, 40.04, 0.025, 4);

    // ---------------- character voices ----------------
    Sob(V, 2.15, 0.04, -0.2); Sob(V, 2.85, 0.036, -0.2); Sob(V, 3.5, 0.032, -0.2);      // the mother
    Laugh(V, 0.95, 3, 0.15, 210, 180, "eee", 0.2, -0.2, 0.55, 0);                     // the king's sly "heh-heh" as he hands it over
    for (double s = 4.4; s < 5.6; s += 0.53) Thud(F, s, 0.25, 100, 60, 0.06, 0.45);   // footsteps echoing into the hall
    Mutter(V, 5.95, 6.6, 95, 0.045, 0.1);                                               // the warlord grumbles at the scroll
    Gulp(V, 8.12, 0.14, -0.1);
    Mutter(V, 8.9, 10.2, 92, 0.045, 0.25);                                              // "read it out loud"
    Gasp(V, 12.78, 0.15, 0);
    Gulp(V, 13.86, 0.14, 0);
    Laugh(V, 14.45, 4, 0.2, 190, 165, "eeee", 0.13, 0.1, 0.5, 0);                      // the king snickers while writing
    Laugh(V, 15.12, 5, 0.17, 230, 180, "eeeee", 0.15, 0.1, 0.45, 0.2);
    Laugh(V, 20.05, 4, 0.22, 215, 150, "aaou", 0.14, 0.2, 0.45, 0);                    // the king giggles at his doodle
    Syl(V, 23.08, 0.4, 105, 145, FM, BM, 0.025, 0.2, 0.0, 0);                          // the warlord: "hmm?"
    Laugh(V, 32.5, 2, 0.22, 175, 160, "ee", 0.2, 0, 0.6, 0);                         // forced nervous chuckle
    Laugh(V, 37.62, 5, 0.16, 125, 160, "ooooo", 0.2, 0, 0.4, -0.3);                   // the warlord's bashful giggle
    Laugh(V, 40.45, 3, 0.18, 330, 290, "aaa", 0.18, -0.3, 0.55, 0);                    // the mother laughs through tears
    Sigh(V, 41.35, 0.2, 0.2);                                                          // relief
    Laugh(V, 42.3, 9, 0.16, 270, 190, "iiieaaaaa", 0.05, 0, 0.35, 0.25);                // the king's cackle
    Laugh(V, 42.55, 6, 0.19, 150, 140, "mmmmmm", 0.02, 0.4, 0.3, 0);                    // the herald snickers behind his hand
    foreach (double s in new[] { 44.1, 44.65, 45.2 }) Syl(V, s, 0.16, 230, 200, FA, BA, 0.2, 0.45, 0.03, 0);   // strained grunts while dragged
  }

  // ---------------- final mix ----------------
  // part: 0 = full mix, 1 = voiceover only, 2 = sound effects only (as heard in the mix, ducked under the voice)
  public short[] Mix(short[] vo, int ch, double gG, double gF, double gV, double master, int part = 0) {
    var o = new short[N * 2]; double e = 0;
    double vl0 = 0, vr0 = 0;
    for (int k = 0; k < N; k++) {
      int i = k * ch; double vl = 0, vr = 0;
      if (i < vo.Length) { vl = vo[i] / 32768.0; vr = ch > 1 && i + 1 < vo.Length ? vo[i + 1] / 32768.0 : vl; }
      e = Math.Max(Math.Abs(vl), e * 0.99988);
      double duck = 1.0 - 0.32 * Math.Min(1.0, e * 6), duckF = 1.0 - 0.18 * Math.Min(1.0, e * 6);
      vl0 += 0.25 * (V.L[k] - vl0); vr0 += 0.25 * (V.R[k] - vr0);                       // soften the synthetic voices a touch
      double kv = part == 2 ? 0 : 1.12, kb = part == 1 ? 0 : 1;
      double l = vl * kv + (G.L[k] * gG * duck + F.L[k] * gF * duckF + vl0 * gV) * kb;
      double r = vr * kv + (G.R[k] * gG * duck + F.R[k] * gF * duckF + vr0 * gV) * kb;
      l = Math.Tanh(l * master * 1.1) / 1.1; r = Math.Tanh(r * master * 1.1) / 1.1;
      o[k * 2] = (short)Math.Max(-32767, Math.Min(32767, l * 32767)); o[k * 2 + 1] = (short)Math.Max(-32767, Math.Min(32767, r * 32767));
    }
    return o;
  }
  public short[] Stem(Bus b, double g) { var o = new short[N * 2]; for (int k = 0; k < N; k++) { o[k * 2] = (short)Math.Max(-32767, Math.Min(32767, b.L[k] * g * 32767)); o[k * 2 + 1] = (short)Math.Max(-32767, Math.Min(32767, b.R[k] * g * 32767)); } return o; }
}
'@
}
$voW = [AudioTool]::Read($VoPath); $sr = $voW.Rate
$N = [int][Math]::Round($Frames / [double]$Fps * $sr)
$sc = New-Object Score2 $N, $sr
$sc.Build(-not $NoMusic)
$sc.Reverb(0.84, 0.35, 0.9)
$w = New-Object Wav; $w.Rate = $sr; $w.Ch = 2; $w.Bits = 16
$gG = if ($NoMusic) { 0.0 } else { 0.3 }
$w.S = $sc.Mix($voW.S, $voW.Ch, $gG, 0.5, 0.35, $Master)
[AudioTool]::Write((Join-Path (Get-Location) $OutPath), $w)
if ($StemDir) {
  New-Item -ItemType Directory -Force $StemDir | Out-Null
  foreach ($b in @(@('groove', $sc.G, 0.3), @('fx', $sc.F, 0.5), @('voices', $sc.V, 0.35))) { $s = New-Object Wav; $s.Rate = $sr; $s.Ch = 2; $s.Bits = 16; $s.S = $sc.Stem($b[1], $b[2]); [AudioTool]::Write((Join-Path (Get-Location) (Join-Path $StemDir ($b[0] + '.wav'))), $s) }
}
foreach ($pt in @(@($VoOut, 1), @($SfxOut, 2))) { if ($pt[0]) { $x = New-Object Wav; $x.Rate = $sr; $x.Ch = 2; $x.Bits = 16; $x.S = $sc.Mix($voW.S, $voW.Ch, $gG, 0.5, 0.35, $Master, $pt[1]); [AudioTool]::Write((Join-Path (Get-Location) $pt[0]), $x); "wrote $($pt[0])" } }
"wrote $OutPath ($([Math]::Round($N / $sr, 4))s, bar $([Math]::Round($sc.Bar, 4))s)"





