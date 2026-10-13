#!/usr/bin/env python3
"""Shade every frame whose passes exist:  shade_frames.py FROM TO [procs] [--force] [--wait]
flat/NNNNN.jpg + nrm/NNNNN.png + lights/NNNNN.json  ->  frames/NNNNN.jpg   (--wait: keep polling until all exist)"""
import sys, os, time
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(__file__))
import shade

def job(f):
    i = '%05d' % f
    out = f'frames/{i}.jpg'
    shade.shade_file(f'flat/{i}.jpg', f'nrm/{i}.png', f'lights/{i}.json', out + '.tmp.jpg', seed=f)
    os.replace(out + '.tmp.jpg', out)
    return f

if __name__ == '__main__':
    a, b = int(sys.argv[1]), int(sys.argv[2]); procs = int(sys.argv[3]) if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else 2
    force, wait = '--force' in sys.argv, '--wait' in sys.argv
    os.makedirs('frames', exist_ok=True)
    done = set()
    with Pool(procs) as pool:
        while True:
            todo = [f for f in range(a, b) if f not in done and (force or not os.path.exists('frames/%05d.jpg' % f))
                    and all(os.path.exists(p % f) for p in ('flat/%05d.jpg', 'nrm/%05d.png', 'lights/%05d.json'))]
            if todo:
                for f in pool.imap_unordered(job, todo): done.add(f)
                print('shaded', len(done), flush=True)
            missing = [f for f in range(a, b) if f not in done and (force or not os.path.exists('frames/%05d.jpg' % f))]
            if not missing or not wait: break
            time.sleep(5)
