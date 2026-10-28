// Visual identity: clean "material-like" look with our own palette and font.
// Deliberately NOT Google's exact colors, logo shapes or Google Sans (trademark/licensing).
import {Easing} from 'remotion';

export const C = {
  bg: '#F5F7FB',
  surface: '#FFFFFF',
  ink: '#1C2333',
  ink2: '#5A6475',
  ink3: '#8A93A3',
  line: '#E2E7EF',
  blue: '#3B7DF6',
  red: '#EB5545',
  yellow: '#F5B724',
  green: '#2EA866',
  blueSoft: '#E7EFFE',
  redSoft: '#FDEBE8',
  yellowSoft: '#FEF4DA',
  greenSoft: '#E3F5EA',
  ocean: '#DCE7F8',
  land: '#FFFFFF',
  landStroke: '#B4C2D8',
  graticule: '#CBD8EC',
};

export const ACCENTS = [
  {main: C.blue, soft: C.blueSoft},
  {main: C.red, soft: C.redSoft},
  {main: C.green, soft: C.greenSoft},
  {main: C.yellow, soft: C.yellowSoft},
];

export const FONT = '"Readex Pro", "Noto Sans Arabic", sans-serif';
/** The verse in the «وقفة» (framework v5 §3.15): Amiri Quran, made for the mushaf's script and its marks. */
export const QURAN_FONT = '"Amiri Quran", "Amiri", serif';
/** A hadith: classic naskh with its tashkeel. */
export const NASKH_FONT = '"Amiri", serif';

/** The teaser's dark screen (framework v5 §3.16). */
export const DARK = {bg: '#0E1424', glow: '#23335A', ink: '#F2F5FA', ink2: '#B9C3D6', ink3: '#8EA0C0'};
/** Text drawn straight on the stage (not on a card) follows the stage from light to dark (set by Stage). */
export const ON_STAGE = {ink: `var(--stage-ink, ${C.ink})`, ink2: `var(--stage-ink2, ${C.ink2})`, ink3: `var(--stage-ink3, ${C.ink3})`};

export let SHADOW = '0 1px 3px rgba(28,35,51,0.08), 0 12px 32px rgba(28,35,51,0.10)';
export let SHADOW_SOFT = '0 1px 2px rgba(28,35,51,0.06), 0 6px 16px rgba(28,35,51,0.06)';
/** Set by applyLook (look.ts): the values above are read when a frame is drawn, so an episode's look reaches them. */
export const setShadows = (shadow: string, soft: string) => {
  SHADOW = shadow;
  SHADOW_SOFT = soft;
};

/** An episode's look (episode.json "look"): the channel's clean "material" look, or "watercolor", an experiment from
 * EP003 between watercolor and anime (look.ts). */
export type LookName = 'material' | 'watercolor';
export const LOOK: {name: LookName} = {name: 'material'};
export const watercolor = () => LOOK.name === 'watercolor';

// Material-style motion curves
export const EASE_OUT = Easing.bezier(0.05, 0.7, 0.1, 1);
export const EASE_IN_OUT = Easing.bezier(0.2, 0, 0, 1);
export const EASE_IN = Easing.bezier(0.3, 0, 0.8, 0.15);
