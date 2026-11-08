# Local pop and blink finder: the glitches a two-pass diff can't see, because they render the same way every time
# (a shadow switching on, a tree or a shutter jumping in front of a wall, a figure vanishing near the lens, a face
# flickering for one frame). Frames are compared at 270x480 (luma) in 6x6 blocks (24x24 px of the real frame):
#   pop   - a block jumps between frames t-1 and t much more than it moved just before and just after (an element
#           appears, disappears or jumps; smooth motion, fades and pans change every step about equally);
#   blink - frame t differs from both neighbours while they agree (a one-frame flicker).
# Neighbouring flagged blocks are merged into one event, reported in real-frame pixels. Frames are decoded in
# parallel, in chunks.
# .\_tools\pops.ps1 -Dir _render\frames18b [-From 0 -To 2978] [-Thr 7] [-Out events.csv]
param([string]$Dir, [int]$From = 0, [int]$To = 999999, [double]$Thr = 7.0, [string]$Out = '')
Add-Type -AssemblyName System.Drawing
if (-not ('PopScan2' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Collections.Generic; using System.Drawing; using System.Drawing.Imaging; using System.Threading.Tasks;
public static class PopScan2 {
  public const int W = 270, H = 480, K = 6, BW = W / K, BH = H / K;
  static byte[] Px(string p) {
    using (var b0 = (Bitmap)Image.FromFile(p)) using (var b = new Bitmap(W, H, PixelFormat.Format24bppRgb)) {
      using (var g = Graphics.FromImage(b)) { g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.Bilinear; g.DrawImage(b0, 0, 0, W, H); }
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
      var row = new byte[W * 3]; var a = new byte[W * H];
      for (int y = 0; y < H; y++) { System.Runtime.InteropServices.Marshal.Copy(d.Scan0 + y * d.Stride, row, 0, W * 3); for (int x = 0; x < W; x++) a[y * W + x] = (byte)((row[x * 3] * 29 + row[x * 3 + 1] * 150 + row[x * 3 + 2] * 77) >> 8); }
      b.UnlockBits(d); return a;
    }
  }
  static double[] D(byte[] x, byte[] y) {
    var r = new double[BW * BH];
    for (int by = 0; by < BH; by++) for (int bx = 0; bx < BW; bx++) {
      int s = 0;
      for (int j = by * K; j < by * K + K; j++) { int o = j * W + bx * K; for (int i = 0; i < K; i++) s += Math.Abs(x[o + i] - y[o + i]); }
      r[by * BW + bx] = s / (double)(K * K);
    }
    return r;
  }
  static void Events(int t, double[] dPrev, double[] dCur, double[] dNext, double[] dSkip, double thr, List<string> res) {
    var kind = new int[BW * BH]; var score = new double[BW * BH];
    for (int i = 0; i < kind.Length; i++) {
      double pop = dCur[i] - Math.Max(dPrev[i], dNext[i]) * 1.6 - 1.0;
      double blink = Math.Min(dCur[i], dNext[i]) - dSkip[i] * 1.25 - 1.0;
      if (blink > thr && blink >= pop) { kind[i] = 2; score[i] = blink; }
      else if (pop > thr) { kind[i] = 1; score[i] = pop; }
    }
    var seen = new bool[kind.Length];
    for (int i = 0; i < kind.Length; i++) {
      if (kind[i] == 0 || seen[i]) continue;
      int k = kind[i], x0 = 9999, y0 = 9999, x1 = -1, y1 = -1, n = 0; double best = 0; var st = new Stack<int>(); st.Push(i); seen[i] = true;
      while (st.Count > 0) {
        int c = st.Pop(), cx = c % BW, cy = c / BW; n++; if (score[c] > best) best = score[c];
        x0 = Math.Min(x0, cx); y0 = Math.Min(y0, cy); x1 = Math.Max(x1, cx); y1 = Math.Max(y1, cy);
        for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
          int nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= BW || ny >= BH) continue; int q = ny * BW + nx;
          if (!seen[q] && kind[q] != 0) { seen[q] = true; st.Push(q); }
        }
      }
      int s4 = K * 4;
      res.Add(string.Format("{0},{1},{2},{3},{4},{5},{6},{7:0.0}", t, k == 1 ? "pop" : "blink", x0 * s4, y0 * s4, (x1 + 1) * s4, (y1 + 1) * s4, n, best));
    }
  }
  // files sorted by frame; frames[i] = frame number of files[i]
  public static List<string> Scan(string[] files, int[] frames, double thr) {
    var res = new List<string>(); int n = files.Length, CH = 240;
    byte[][] buf = new byte[n][];
    for (int c0 = 0; c0 < n; c0 += CH) {
      int c1 = Math.Min(n, c0 + CH + 2);
      Parallel.For(c0, c1, i => { if (buf[i] == null) buf[i] = Px(files[i]); });
      for (int i = Math.Max(2, c0); i < Math.Min(n - 1, c0 + CH); i++) Events(frames[i], D(buf[i - 2], buf[i - 1]), D(buf[i - 1], buf[i]), D(buf[i], buf[i + 1]), D(buf[i - 1], buf[i + 1]), thr, res);
      for (int i = 0; i < c0 + CH - 3 && i < n; i++) buf[i] = null;
    }
    return res;
  }
}
'@
}
$files = @(Get-ChildItem $Dir -Filter *.jpg | Where-Object { $k = [int]$_.BaseName.Substring(1); $k -ge $From -and $k -le $To } | Sort-Object Name)
$ev = [PopScan2]::Scan([string[]]($files | ForEach-Object FullName), [int[]]($files | ForEach-Object { [int]$_.BaseName.Substring(1) }), $Thr)
if ($Out) { Set-Content -Path $Out -Value (@('frame,kind,x0,y0,x1,y1,blocks,score') + $ev) -Encoding UTF8 }
$frames = ($ev | ForEach-Object { ($_ -split ',')[0] } | Select-Object -Unique).Count
"{0} events in {1} frames (of {2} scanned); pops {3}, blinks {4}" -f $ev.Count, $frames, $files.Count, @($ev | Where-Object { $_ -match ',pop,' }).Count, @($ev | Where-Object { $_ -match ',blink,' }).Count
