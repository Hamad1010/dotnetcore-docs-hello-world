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

export const SHADOW = '0 1px 3px rgba(28,35,51,0.08), 0 12px 32px rgba(28,35,51,0.10)';
export const SHADOW_SOFT = '0 1px 2px rgba(28,35,51,0.06), 0 6px 16px rgba(28,35,51,0.06)';

// Material-style motion curves
export const EASE_OUT = Easing.bezier(0.05, 0.7, 0.1, 1);
export const EASE_IN_OUT = Easing.bezier(0.2, 0, 0, 1);
export const EASE_IN = Easing.bezier(0.3, 0, 0.8, 0.15);
