#!/usr/bin/env bash
# render + shade style frames at the given times:  tools/stills.sh out_dir t1,t2,...
cd "$(dirname "$0")/.."
NODE_PATH=$(npm root -g) node tools/test_times.cjs index.html "$1" "$2" && python3 tools/test_shade.py "$1"
