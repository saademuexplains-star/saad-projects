def patch(path, pairs):
    s=open(path).read()
    for a,b in pairs:
        assert s.count(a)==1, (path, s.count(a), a[:90]); s=s.replace(a,b)
    open(path,'w').write(s)

patch('sets.js', [
 ("extra = '', far = '', hills = true, front = '' } = {}) {", "extra = '', far = '', hills = true, front = '', smokeXs = [140, 520, 900] } = {}) {"),
 ("const bigSmoke = smokeAmt ? [140, 520, 900].map((x, i) => smoke(x, horizon - 40, t, { seed: i + 4, n: 12, H: horizon + 300, drift: 220, r0: 60, r1: 320, col: mood === 'noon' ? '#4a4540' : '#1a1210', op: .7 * smokeAmt, speed: .07 })).join('') : '';",
  "const bigSmoke = smokeAmt ? smokeXs.map((x, i) => smoke(x, horizon - 40, t, { seed: i + 4, n: 18, H: horizon + 300, drift: 220, r0: 70, r1: 340, col: mood === 'noon' ? '#6a645c' : '#1a1210', op: (mood === 'noon' ? .42 : .55) * smokeAmt, speed: .07, blur: 'smokeBlur2' })).join('') : '';"),
])
patch('fx.js', [
 ('<filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>',
  '<filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>\n  <filter id="smokeBlur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter>'),
])
patch('rigs.js', [
 ("function arrow(x, y, rot, len = 300, stuck = 1) {\n  return `<g transform=\"translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)})\">",
  "function arrow(x, y, rot, len = 300, stuck = 1, sc = 1) {\n  return `<g transform=\"translate(${F1(x)} ${F1(y)}) rotate(${F1(rot)}) scale(${sc})\">"),
 ("""    <path d="M-120 -280 C-180 -340 -200 -400 -230 -420 L-270 -400 C-280 -380 -250 -360 -230 -350 C-210 -300 -180 -260 -150 -230 Z" fill="${col}"/>
    <path d="M-225 -425 L-245 -455 L-215 -432 Z" fill="${col}"/>""",
  """    <path d="M-90 -300 C-120 -350 -150 -400 -170 -430 L-222 -408 C-206 -370 -180 -310 -160 -240 Z" fill="${col}"/>
    <path d="M-168 -436 C-196 -452 -232 -444 -250 -418 L-288 -362 C-296 -346 -282 -334 -266 -340 L-214 -372 C-200 -390 -186 -410 -168 -436 Z" fill="${col}"/>
    <path d="M-184 -440 L-178 -468 L-166 -440 Z M-198 -442 L-196 -468 L-184 -444 Z" fill="${col}"/>
    <path d="M-150 -420 C-130 -380 -110 -340 -96 -300" stroke="${col}" stroke-width="16" fill="none" stroke-dasharray="10 6"/>"""),
])
patch('project.js', [
 ("""      const far = `<g opacity=".55" filter="url(#b3)">${at(lerp(790, 820, t / 1.1), 1046, .09, `<g filter="url(#silh)">${longship({ t, wake: 0 })}</g>`)}</g>`;
      return `<g transform="${cam({ cx: 540, cy: 1000, s })}">
        ${village({ t, mood: 'predawn', moon: true, lights: 1, horizon: 1080, far, hills: false, fogAmt: .9 })}""",
  """      const far = `<g opacity=".7" filter="url(#b3)">${at(lerp(520, 560, t / 1.1), 1052, .13, `<g filter="url(#silh)">${longship({ t, wake: 0 })}</g>`)}</g>`;
      return `<g transform="${cam({ cx: 540, cy: 1000, s })}">
        ${village({ t, mood: 'predawn', moon: true, lights: 1, horizon: 1080, far, hills: false, fogAmt: .7, houses: [[90, 1150, .62, 4], [1000, 1160, .66, 5], [-150, 1290, 1.05, 7], [1230, 1300, 1.1, 8]] })}"""),
 ("""        <rect x="120" y="250" width="840" height="1900" rx="60" fill="#8f7a4e" filter="url(#pcl)"/>
        <rect x="120" y="250" width="840" height="1900" rx="60" filter="url(#grass)" opacity=".35"/>""",
  """        <rect x="80" y="200" width="920" height="2000" rx="40" fill="#3a2616" filter="url(#pcl)"/>
        <rect x="120" y="250" width="840" height="1900" rx="60" fill="#7a6640" filter="url(#pcl)"/>
        <rect x="120" y="250" width="840" height="1900" rx="60" filter="url(#grass)" opacity=".5"/>"""),
 ("""        <path d="M140 975 C330 930 760 930 940 975 L960 2100 L120 2100 Z" fill="#5a3e30" filter="url(#pcl)"/>
        <path d="M140 975 C330 930 760 930 940 975 L944 1046 C760 1004 330 1004 136 1046 Z" fill="#a08a6a" filter="url(#pcsl)"/>""",
  """        <path d="M140 975 C330 930 760 930 940 975 L960 2100 L120 2100 Z" fill="#6a2e26" filter="url(#pcl)"/>
        ${[1180, 1260, 1700, 1780].map(y => `<path d="M136 ${y} C330 ${y - 30} 760 ${y - 30} 950 ${y}" stroke="#c49a5a" stroke-width="16" fill="none" opacity=".55"/>`).join('')}
        <path d="M140 975 C330 930 760 930 940 975 L944 1046 C760 1004 330 1004 136 1046 Z" fill="#cdbf9f" filter="url(#pcsl)"/>
        <g filter="url(#pks_light)"><path d="M610 1110 C640 1090 700 1092 716 1118 C724 1140 700 1162 660 1160 C630 1158 606 1134 610 1110 Z" fill="${SKIN_TONES.light.mid}"/></g>
        <path d="M630 1120 L700 1126 M628 1134 L696 1142" stroke="${SKIN_TONES.light.line}" stroke-width="3" opacity=".5"/>"""),
 ("""        ${at(700, 1960, .78, `<g transform="scale(-1 1)">${dog({ t, lift: 0 })}</g>`)}""",
  """        ${at(720, 1720, .8, `<g transform="scale(-1 1)">${dog({ t, lift: 0 })}</g>`)}"""),
 ("""        ${grade('#2a3656', .35)}</g>`;
    } },
  // 3""", """        ${grade('#2a3656', .45)}</g>`;
    } },
  // 3"""),
 ("<g filter=\"url(#b14)\">${at(260, 2700, 2.1, youBack({}))}</g></g>`;", "<g filter=\"url(#b14)\">${at(120, 2750, 2.0, youBack({}))}</g></g>`;"),
 ("const line = [[170, .34, 0], [350, .38, 1], [540, .44, 2], [730, .38, 3], [905, .34, 4]];", "const line = [[330, .34, 0], [480, .38, 1], [640, .44, 2], [800, .38, 3], [950, .34, 4]];"),
 ("${flash(t, 20.6, .28, '#fff1d6', .8)}", "${flash(t, 20.6, .16, '#fff1d6', .75)}"),
 ("""      const lt = t - 21.48, up = easeOut(seg(t, 22.3, 22.62)), shine = bell(t, 22.5, 23.05), r = 30 + 95 * up;""",
  """      const lt = t - 21.48, up = easeOut(seg(t, 22.3, 22.6)), shine = bell(t, 22.48, 23.05), r = -38;"""),
 ("""${P(VIKINGS.red, { smirk: 1.5, lid: .45, browR: 9, browL: 2, raiseRight: r, raiseLeft: 10, look: 4 * up, lookY: -3 * up, tilt: -3 * up + swayT(t) })}</g>${chalice(hx - 6, hy - 14, 1.15, shine)}${coins}`)}""",
  """${P(VIKINGS.red, { smirk: 1.1 + .5 * up, lid: .45, browR: 9, browL: 2, raiseRight: r, raiseLeft: 10, look: -2 * up, lookY: 4 * up, tilt: 2 * up + swayT(t) })}${chalice(hx + 4, hy - 10 - 70 * up, 1.25, shine)}</g>${coins}`)}"""),
 ("const tipX = lerp(-950, -138, fly), tipY = lerp(-1250, -936, fly);", "const tipX = lerp(-1000, -150, fly), tipY = lerp(-1260, -905, fly);"),
 ("${t > 28.84 ? arrow(tipX, tipY, 21, 330, hit ? 1 : 0) : ''}", "${t > 28.84 ? arrow(tipX, tipY, 21, 260, hit ? 1 : 0, 1.7) : ''}"),
 ("${at(650, 3150, 2.2, P(YOU, { look: -5 * look, lookY: 1 * look, tilt: -7 * look + swayT(t, .8), browL: 7, browR: 11, smirk: -.9, lid: .25, tear: easeOut(seg(t, 36.9, 37.8)) }))}",
  "${at(650, 3150, 2.2, P(YOU, { look: -5 * look, lookY: 2 * look, tilt: -7 * look + swayT(t, .8), browL: 9, browR: 13, smirk: -1.3, lid: .38, tear: easeOut(seg(t, 36.9, 37.8)) }))}"),
 ("""      const far = `<g opacity=".7" filter="url(#b3)">${at(lerp(860, 940, lt / 2.8), 1062, lerp(.075, .06, lt / 2.8), `<g filter="url(#silh)">${longship({ t, wake: 0 })}</g>`)}</g>`;
      return `<g transform="${cam({ cx: 540, cy: 1100, s, x, y })}">
        ${village({ t, mood: 'noon', ruin: 1, smokeAmt: .8, horizon: 1100, sun: true, far, hills: false })}""",
  """      const far = `<g opacity=".8" filter="url(#b3)">${at(lerp(800, 880, lt / 2.8), 1068, lerp(.11, .085, lt / 2.8), `<g filter="url(#silh)">${longship({ t, wake: 0 })}</g>`)}</g>`;
      return `<g transform="${cam({ cx: 540, cy: 1100, s, x, y })}">
        ${village({ t, mood: 'noon', ruin: 1, smokeAmt: .7, smokeXs: [120, 420], horizon: 1100, sun: true, far, hills: false, houses: [[130, 1180, .75, 4], [560, 1260, 1.05, 6], [980, 1210, .8, 5]] })}"""),
])
print('patched')
