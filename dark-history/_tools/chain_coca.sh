#!/usr/bin/env bash
# The rest of the Coca-Cola render, unattended (runs detached; the session may be paused by a usage limit):
# wait for pass A to finish -> re-render the WINE frames (fixed after they were drawn) -> scan pass A -> pass B ->
# compare A and B. Reports land in _render/qa20/. Safe to run again: each step skips what is already done.
set -u
cd "$(dirname "$0")/.."
Q=_render/qa20; mkdir -p "$Q"
log() { echo "$(date -u +%H:%M:%S) $*" >> "$Q/chain.log"; }
log "chain start"
# 1. pass A: wait for the running renderers, then render whatever is still missing
while pgrep -f "cdp.cjs --page _render/video/main20.html" >/dev/null; do sleep 20; done
python3 -I - <<'PY' > "$Q/missA.txt"
import os
d='_render/frames20a'; have=set(int(f[1:6]) for f in os.listdir(d) if f.startswith('f') and f.endswith('.jpg'))
print(','.join(str(n) for n in range(2840) if n not in have))
PY
if [ -s "$Q/missA.txt" ] && [ "$(cat "$Q/missA.txt")" != "" ]; then log "pass A: rendering missing $(tr ',' '\n' < "$Q/missA.txt" | wc -l)"; _tools/render_list.sh _render/frames20a "$Q/missA.txt" 3 >> "$Q/chain.log" 2>&1; fi
# 2. the WINE frames again (once)
if [ ! -f "$Q/wine_done" ]; then seq -s, 1389 1706 > "$Q/wine.txt"; log "wine re-render"; _tools/render_list.sh _render/frames20a "$Q/wine.txt" 3 >> "$Q/chain.log" 2>&1 && touch "$Q/wine_done"; fi
# 3. scan pass A
python3 -I _tools/qa.py scan _render/frames20a > "$Q/scanA.txt" 2>&1; log "scan A done"
# 4. pass B (everything missing in frames20b)
mkdir -p _render/frames20b
python3 -I - <<'PY' > "$Q/missB.txt"
import os
d='_render/frames20b'; have=set(int(f[1:6]) for f in os.listdir(d) if f.startswith('f') and f.endswith('.jpg'))
print(','.join(str(n) for n in range(2840) if n not in have))
PY
if [ "$(cat "$Q/missB.txt")" != "" ]; then log "pass B: rendering $(tr ',' '\n' < "$Q/missB.txt" | wc -l)"; _tools/render_list.sh _render/frames20b "$Q/missB.txt" 3 >> "$Q/chain.log" 2>&1; fi
# 5. compare
python3 -I _tools/qa.py cmp _render/frames20a _render/frames20b > "$Q/cmpAB.txt" 2>&1; log "compare done"
touch "$Q/chain_done"; log "chain done"
