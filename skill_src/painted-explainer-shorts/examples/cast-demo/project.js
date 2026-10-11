// Cast demo: four very different characters built with person() and the same finishing/lighting rules.
// Shows that the look carries over to any topic. Render with:
//   node scripts/render_stills.cjs examples/cast-demo/index.html out/ --stills

const CAST = {
  napoleon: { hair: 'forelock', hairColor: 'brown', beard: 'stubble', hat: 'bicorne', top: 'military', coat: '#26355a', accent: '#9b2d2b',
    legs: 'breeches', foot: 'boots', armLeft: 'tucked', hands: 'gloves' },
  inventor: { hair: 'short', hairColor: 'grey', beard: 'mustache', hat: 'tophat', top: 'jacket', coat: '#3b3a36', under: '#d9cfb8',
    tie: '#7a2e2a', legs: 'trousers', pants: '#4a4640', foot: 'shoes', eyeColor: '#4a3a2a' },
  queen: { skin: 'medium', hair: 'long', hairColor: 'black', hat: 'crown', top: 'robe', robe: '#e6dcc2', trim: '#c49a3c', necklace: true, eyeColor: '#3a2a1a' },
  farmer: { skin: 'deep', hair: 'short', hairColor: 'black', beard: 'full', hat: 'cap', hatColor: '#4a4238', top: 'vest', coat: '#5a4630',
    under: '#d8cbb0', legs: 'trousers', pants: '#4a5a6a', eyeColor: '#2a1a10' },
};
const SETS = {
  napoleon: () => background({ preset: 'day', horizon: 1130 }),
  inventor: () => interior({ wall: ['#b9a888', '#6e5c44'] }),
  queen: () => background({ preset: 'desert', horizon: 1150, trees: false }),
  farmer: () => background({ preset: 'golden', horizon: 1100 }),
};
const full = (k, pose = {}) => () => showStill(SETS[k]() + placePerson(540, FRAMING.wide.y, FRAMING.wide.s, CAST[k], pose));
const close = (k, pose = {}, bg = 'dofHeavy') => () => showStill(
  (k === 'inventor' ? interior({ blur: bg, horizon: 1500 }) : background({ preset: k === 'queen' ? 'desert' : k === 'farmer' ? 'golden' : 'day', horizon: 1350, blur: bg, trees: k !== 'queen' })) +
  `<g transform="translate(540 ${FRAMING.close.y}) scale(${FRAMING.close.s})">${lit(person(CAST[k], pose))}</g>`);

window.STILLS = {};
for (const k of Object.keys(CAST)) {
  STILLS[`${k}_full`] = full(k);
  STILLS[`${k}_smug`] = close(k, { lid: .55, smirk: 1.5, browR: 9, tilt: -4 });
  STILLS[`${k}_shock`] = close(k, { shock: 1, sweat: 1, browL: 6, browR: 6 });
  STILLS[`${k}_talk`] = close(k, { talk: .7, look: 3, browL: 4 });
}
STILLS.inventor_wave = full('inventor', { raiseRight: 120, talk: .5 });
STILLS.queen_wave = full('queen', { raiseLeft: 110, lid: .4, smirk: 1.4 });
