import sys, subprocess, numpy as np, os
for f in sys.argv[1:]:
    x = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','22050','-f','f32le','-'],capture_output=True).stdout,np.float32)
    fr=441; env=np.array([np.sqrt(np.mean(x[i:i+fr]**2)) for i in range(0,len(x),fr)])
    pk=env.max(); on=[]; above=False
    for i,e in enumerate(env):
        if e>pk*.35 and not above: on.append(round(i*.02,2)); above=True
        elif e<pk*.15: above=False
    print(f'{os.path.basename(f):14s} dur {len(x)/22050:5.2f} peak@{env.argmax()*.02:5.2f} onsets {on[:10]}')
