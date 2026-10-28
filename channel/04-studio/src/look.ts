// An episode's look (episode.json "look"). "material" is the channel's clean look (EP001–EP002). "watercolor" is an
// experiment from EP003, at the owner's request: the same layouts, moved slightly between watercolor and anime. Warm
// cold-press paper and pigment washes (06-tools/watercolor_textures.py), an ink line and a hard cel shadow around every
// card and chip, pigment colours, an anime sky with cel-shaded clouds over the journey map, sparkles on the big reveals.
// Components read C, SHADOW, DEEP, CARD and TONE when a frame is drawn, so applyLook (called by the episode before
// anything else) reaches all of them.
import {ACCENTS, C, DARK, LOOK, ON_STAGE, SHADOW, SHADOW_SOFT, setShadows, type LookName} from './theme';
import {CARD, DEEP, setDeep, TONE} from './components/moment-kit';
import {INK_DEEP, INK_SHADOW, INK_SHADOW_SOFT, paperCard} from './look-kit';

const MATERIAL = {...C};
const MATERIAL_DARK = {...DARK};
// the material values, as the modules set them when they load
const MATERIAL_SHADOWS = {shadow: SHADOW, soft: SHADOW_SOFT, deep: DEEP, gold: TONE.gold.main};

/** Pigments on paper: ultramarine, vermilion, gamboge, sap green; indigo ink for the lines. */
const WATERCOLOR: typeof C = {
  bg: '#F6F0E4',
  surface: '#FFFCF5',
  ink: '#26294A',
  ink2: '#575D78',
  ink3: '#8D91A5',
  line: '#E7DECC',
  blue: '#3A78C2',
  red: '#D9573F',
  yellow: '#E8AA35',
  green: '#3C9660',
  blueSoft: '#E2ECF6',
  redSoft: '#F9E2DA',
  yellowSoft: '#FBEDCF',
  greenSoft: '#E0EFE2',
  ocean: '#D3E3EF',
  land: '#FFFCF5',
  landStroke: '#A99F8C',
  graticule: '#E4DAC8',
};
const WATERCOLOR_DARK: typeof DARK = {bg: '#171A31', glow: '#2E3666', ink: '#F4F0E6', ink2: '#C3C1D2', ink3: '#9A9CB8'};

export const applyLook = (name: LookName = 'material') => {
  if (LOOK.name === name) return;
  LOOK.name = name;
  const w = name === 'watercolor';
  Object.assign(C, w ? WATERCOLOR : MATERIAL);
  Object.assign(DARK, w ? WATERCOLOR_DARK : MATERIAL_DARK);
  const accents: [string, string][] = [
    [C.blue, C.blueSoft],
    [C.red, C.redSoft],
    [C.green, C.greenSoft],
    [C.yellow, C.yellowSoft],
  ];
  accents.forEach(([main, soft], i) => Object.assign(ACCENTS[i], {main, soft}));
  Object.assign(ON_STAGE, {ink: `var(--stage-ink, ${C.ink})`, ink2: `var(--stage-ink2, ${C.ink2})`, ink3: `var(--stage-ink3, ${C.ink3})`});
  Object.assign(TONE.neg, {main: C.red, soft: C.redSoft});
  Object.assign(TONE.pos, {main: C.green, soft: C.greenSoft});
  Object.assign(TONE.accent, {main: C.blue, soft: C.blueSoft});
  Object.assign(TONE.gold, {main: w ? '#B57F12' : MATERIAL_SHADOWS.gold, soft: C.yellowSoft});
  setShadows(w ? INK_SHADOW : MATERIAL_SHADOWS.shadow, w ? INK_SHADOW_SOFT : MATERIAL_SHADOWS.soft);
  setDeep(w ? INK_DEEP : MATERIAL_SHADOWS.deep);
  Object.assign(CARD, {background: paperCard(), boxShadow: w ? INK_DEEP : MATERIAL_SHADOWS.deep, color: C.ink});
};
