import sys, os, glob
sys.path.insert(0, os.path.dirname(__file__))
import shade
from multiprocessing import Pool
d = sys.argv[1]
def job(fl):
    tid = fl.split('flat_')[1][:-4]
    shade.shade_file(fl, f'{d}/nrm_{tid}.png', f'{d}/rig_{tid}.json', f'{d}/lit_{tid}.jpg', seed=1)
    return tid
if __name__ == '__main__':
    fls = sorted(glob.glob(f'{d}/flat_*.jpg'))
    with Pool(4) as p: print(len(list(p.imap_unordered(job, fls))), 'shaded')
