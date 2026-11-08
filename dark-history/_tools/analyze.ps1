param([string]$Name)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
if (-not ('VA' -as [type])) {
$cp = New-Object System.CodeDom.Compiler.CompilerParameters
$cp.CompilerOptions = '/unsafe'
$cp.ReferencedAssemblies.Add('System.dll') | Out-Null
$cp.ReferencedAssemblies.Add('System.Drawing.dll') | Out-Null
Add-Type -CompilerParameters $cp -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class VA {
    public static float[] Gray(string path, int w, int h) {
        using (var src = new Bitmap(path))
        using (var bmp = new Bitmap(w, h, PixelFormat.Format24bppRgb)) {
            using (var g = Graphics.FromImage(bmp)) {
                g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBilinear;
                g.DrawImage(src, 0, 0, w, h);
            }
            var r = new float[w * h];
            var d = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
            unsafe {
                for (int y = 0; y < h; y++) {
                    byte* row = (byte*)d.Scan0 + y * d.Stride;
                    for (int x = 0; x < w; x++) r[y * w + x] = 0.114f * row[x * 3] + 0.587f * row[x * 3 + 1] + 0.299f * row[x * 3 + 2];
                }
            }
            bmp.UnlockBits(d);
            return r;
        }
    }
    public static double[] MeanRGB(string path) {
        using (var bmp = new Bitmap(path)) {
            double R = 0, G = 0, B = 0; int n = 0;
            for (int y = 0; y < bmp.Height; y += 2) for (int x = 0; x < bmp.Width; x += 2) {
                var c = bmp.GetPixel(x, y); R += c.R; G += c.G; B += c.B; n++;
            }
            return new double[] { R / n, G / n, B / n };
        }
    }
    public static double Mean(float[] a) { double s = 0; foreach (var v in a) s += v; return s / a.Length; }
    public static double Diff(float[] a, float[] b) {
        double s = 0; for (int i = 0; i < a.Length; i++) s += Math.Abs(a[i] - b[i]); return s / a.Length;
    }
    static float Sample(float[] a, int w, int h, double x, double y) {
        if (x < 0) x = 0; if (y < 0) y = 0; if (x > w - 1.001) x = w - 1.001; if (y > h - 1.001) y = h - 1.001;
        int x0 = (int)x, y0 = (int)y; double fx = x - x0, fy = y - y0;
        double v = a[y0 * w + x0] * (1 - fx) * (1 - fy) + a[y0 * w + x0 + 1] * fx * (1 - fy) + a[(y0 + 1) * w + x0] * (1 - fx) * fy + a[(y0 + 1) * w + x0 + 1] * fx * fy;
        return (float)v;
    }
    // best (scale, dx, dy, err, err0): B(p) ~ A((p-c)/s + c - d). s>1 = zoom in, dx>0 = content moved right
    public static double[] Motion(float[] a, float[] b, int w, int h) {
        double cx = (w - 1) / 2.0, cy = (h - 1) / 2.0;
        int mx = w / 6, my = h / 6;
        double best = double.MaxValue, bs = 1, bdx = 0, bdy = 0, e0 = 0;
        for (int pass = 0; pass < 2; pass++) {
            double sLo = pass == 0 ? 0.90 : bs - 0.008, sHi = pass == 0 ? 1.10 : bs + 0.008, sSt = pass == 0 ? 0.01 : 0.002;
            double dLo = pass == 0 ? -8 : -1, dHi = pass == 0 ? 8 : 1, dSt = pass == 0 ? 1 : 0.25;
            double pdx = bdx, pdy = bdy;
            for (double s = sLo; s <= sHi + 1e-9; s += sSt)
            for (double ddx = dLo; ddx <= dHi + 1e-9; ddx += dSt)
            for (double ddy = dLo; ddy <= dHi + 1e-9; ddy += dSt) {
                double dx = pass == 0 ? ddx : pdx + ddx, dy = pass == 0 ? ddy : pdy + ddy;
                double err = 0; int n = 0;
                for (int y = my; y < h - my; y += 2) for (int x = mx; x < w - mx; x += 2) {
                    double sx = (x - cx) / s + cx - dx, sy = (y - cy) / s + cy - dy;
                    err += Math.Abs(b[y * w + x] - Sample(a, w, h, sx, sy)); n++;
                }
                err /= n;
                if (pass == 0 && Math.Abs(s - 1) < 1e-6 && dx == 0 && dy == 0) e0 = err;
                if (err < best) { best = err; bs = s; bdx = dx; bdy = dy; }
            }
        }
        return new double[] { bs, bdx, bdy, best, e0 };
    }
}
'@
}

$W = 54; $H = 96
$files = Get-ChildItem "_frames\$Name\dense\*.jpg" | Sort-Object Name
$times = $files | ForEach-Object { [double]($_.BaseName.Substring(1)) }
$g = @(); foreach ($f in $files) { $g += , ([VA]::Gray($f.FullName, $W, $H)) }
$n = $g.Count
$diff = New-Object double[] $n; $lum = New-Object double[] $n
for ($i = 0; $i -lt $n; $i++) { $lum[$i] = [VA]::Mean($g[$i]); if ($i -gt 0) { $diff[$i] = [VA]::Diff($g[$i - 1], $g[$i]) } }

# cut = spike well above local median
$cuts = New-Object System.Collections.Generic.List[int]
for ($i = 1; $i -lt $n; $i++) {
    $lo = [math]::Max(1, $i - 6); $hi = [math]::Min($n - 1, $i + 6)
    $win = @(); for ($j = $lo; $j -le $hi; $j++) { if ($j -ne $i) { $win += $diff[$j] } }
    $med = ($win | Sort-Object)[[int]($win.Count / 2)]
    if ($diff[$i] -gt 9 -and $diff[$i] -gt 2.5 * $med + 2) { $cuts.Add($i) }
}
$out = New-Object System.Collections.Generic.List[string]
$out.Add("=== $Name : $n frames @0.1s ===")
$out.Add("Per-frame luminance/diff (t, lum, diff) where diff>4 or lum<25:")
for ($i = 0; $i -lt $n; $i++) { if ($diff[$i] -gt 4 -or $lum[$i] -lt 25) { $out.Add(("  t={0:0.0} lum={1:0} diff={2:0.0}{3}" -f $times[$i], $lum[$i], $diff[$i], $(if ($cuts.Contains($i)) { '  <== CUT' } else { '' }))) } }

$bounds = @(0) + $cuts + @($n)
$out.Add("")
$out.Add("SHOTS (start-end, dur) | motion per 0.5s window: zoom% / panX% / panY% (of frame; +x = content moves right, +y = content moves down) | fit err vs static err")
for ($k = 0; $k -lt $bounds.Count - 1; $k++) {
    $a = $bounds[$k]; $b = $bounds[$k + 1] - 1
    $t0 = $times[$a]; $t1 = $times[$b] + 0.1
    $line = "SHOT {0,2}: {1,5:0.0}-{2,5:0.0}s ({3:0.0}s)" -f ($k + 1), $t0, $t1, ($t1 - $t0)
    $out.Add($line)
    $totS = 1.0; $totX = 0.0; $totY = 0.0
    for ($i = $a; $i + 5 -le $b; $i += 5) {
        $m = [VA]::Motion($g[$i], $g[$i + 5], $W, $H)
        $totS *= $m[0]; $totX += $m[1] / $W * 100; $totY += $m[2] / $H * 100
        $out.Add(("    {0,5:0.0}s  zoom {1,6:+0.0;-0.0}%  panX {2,6:+0.0;-0.0}%  panY {3,6:+0.0;-0.0}%  err {4,5:0.0}/{5,5:0.0}" -f $times[$i], (($m[0] - 1) * 100), ($m[1] / $W * 100), ($m[2] / $H * 100), $m[3], $m[4]))
    }
    $out.Add(("    TOTAL zoom {0:+0.0;-0.0}%  panX {1:+0.0;-0.0}%  panY {2:+0.0;-0.0}%" -f (($totS - 1) * 100), $totX, $totY))
}
# shot colour from medium frames
$out.Add("")
$out.Add("Mean RGB per 0.5s (med frames):")
foreach ($f in (Get-ChildItem "_frames\$Name\med\*.jpg" | Sort-Object Name)) {
    $c = [VA]::MeanRGB($f.FullName)
    $out.Add(("  {0}  R{1,3:0} G{2,3:0} B{3,3:0}  #{4:X2}{5:X2}{6:X2}" -f $f.BaseName, $c[0], $c[1], $c[2], [int]$c[0], [int]$c[1], [int]$c[2]))
}
$out | Set-Content "_frames\$Name\analysis.txt" -Encoding utf8
"done $Name : $($cuts.Count) cuts"
