const T = 1.3;
window.STILLS = {
  boys: () => showStill(homeNight({ t: T, blur: 'dofHeavy' }) +
    kid(160, 1850, .62, BOY, { smirk: .4 }) + kid(400, 1850, .62, BOY, { shock: 1, bIn: 10, bOut: 8 }) + kid(640, 1850, .62, BOY, { smirk: -1, bIn: 14, bOut: -4, tear: 1, tearRun: .6, lid: .3 }) +
    kid(880, 1850, .62, BOY_CAMP, { grit: 1, bIn: 12, bOut: -6, lid: .7, tear: .8 }) +
    kid(300, 1000, .5, BOY_BARE, { smirk: -.5, bIn: 6, lookY: 4 }) + kid(560, 1000, .5, { ...BOY, faceExtra: boyFace(false), body: childBody({ cloak: 1 }) }, { hair: .5 }) + foxBody(860, 860, .9, { snarl: 1, t: T })),
  closeboy: () => showStill(homeNight({ t: T, blur: 'dofHeavy', open: .8 }) + kid(540, 3150, 2.6, BOY, { shock: 1, bIn: 10, bOut: 8, tear: .6, look: 6 })),
  adults: () => showStill(campDawn({ t: T, blur: 'dofHeavy' }) +
    at(130, 1900, .55, P(SOLDIER, {})) + at(390, 1900, .55, P(MAN30, { smirk: -.3, bIn: -6, bOut: 2, lid: .3 })) + at(650, 1900, .55, P(YOUTH, { smirk: -.2, bIn: -4 })) + at(910, 1900, .55, P(TRAINER, { smirk: 1.2, bIn: -6, bOut: 4 })) +
    at(200, 1050, .45, P(MOTHER, { smirk: -1.1, bIn: 14, bOut: -2, tear: 1, lid: .2 })) + at(440, 1050, .45, P(GUARD, { talk: .4, bIn: -8 })) + at(680, 1050, .45, P(HELOT, { shock: 1, bIn: 10, bOut: 10 })) + at(920, 1050, .45, P(PRIEST, { smirk: -.3, bIn: -6 }))),
  closemom: () => showStill(homeNight({ t: T, blur: 'dofHeavy' }) + at(540, 3300, 2.4, P(MOTHER, { smirk: -1.2, bIn: 16, bOut: -4, tear: 1, tearRun: .5, lid: .25, talk: .08 }))),
  sets1: () => showStill(`<g transform="scale(.5)">${campDawn({ t: T })}</g><g transform="translate(540 0) scale(.5)">${riverDusk({ t: T })}</g>
    <g transform="translate(0 960) scale(.5)">${barracksDawn({ t: T })}</g><g transform="translate(540 960) scale(.5)">${farmNight({ t: T, torch: 1 })}</g>`),
  sets2: () => showStill(`<g transform="scale(.5)">${altarDay({ t: T })}${altarStone(540, 1800, 1.2, .7)}</g><g transform="translate(540 0) scale(.5)">${nightField({ t: T })}</g>
    <g transform="translate(0 960) scale(.5)">${houseOutside({ t: T, open: .5 })}</g><g transform="translate(540 960) scale(.5)">${homeNight({ t: T, open: 1 })}</g>`),
};
