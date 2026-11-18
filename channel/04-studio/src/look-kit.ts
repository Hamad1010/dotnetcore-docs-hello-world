// Small helpers of the watercolor look (look.ts), kept apart so drawing components can use them without importing the
// look switch itself (it reads the moment kit when it loads).
import type React from 'react';
import {staticFile} from 'remotion';
import {aquarelle, C, watercolor} from './theme';

/** Indigo ink at an opacity; in the pure watercolor look a soft sepia pencil line instead (the underdrawing). The
 * ink shadows below are made once, as the anime line, and never follow it. */
export const ink = (a: number) => (aquarelle() ? `rgba(104,82,58,${+(a * 0.42).toFixed(3)})` : `rgba(38,41,74,${a})`);
/** The anime line: an ink outline (a shadow with no blur that follows the corners), then a hard cel shadow down to
 * the left (the light comes from the top right). */
const outline = (w: number, dx: number, dy: number, a: number) => `0 0 0 ${w}px ${ink(0.9)}, ${-dx}px ${dy}px 0 ${w}px ${ink(a)}`;
export const INK_SHADOW = outline(3, 10, 12, 0.12);
export const INK_SHADOW_SOFT = outline(2.5, 6, 7, 0.1);
export const INK_DEEP = outline(3, 12, 14, 0.13);

/** The look's textures, in 03-episodes/_assets/look/. */
export const texture = (name: 'paper.jpg' | 'paper-tile.jpg' | 'deckle.png' | `${'wash' | 'stroke'}-${'blue' | 'gold' | 'green' | 'rose'}.png`) =>
  staticFile(`_assets/look/${name}`);
/** A card's background: paper with its grain (watercolor), or plain. */
export const paperCard = (color: string = C.surface) =>
  aquarelle()
    ? `${BLOOMS}, url("${texture('paper-tile.jpg')}") 0 0 / 512px 512px repeat ${color}`
    : watercolor()
      ? `${color} url("${texture('paper-tile.jpg')}") 0 0 / 512px 512px repeat`
      : color;

// ------------------------------------------------------------------ the pure watercolor look ("aquarelle")
/** Soft shadows of wet paper lifting off the sheet: no ink line, no cel shadow. */
export const AQUA_SHADOW = '0 2px 4px rgba(90,70,40,0.06), 0 14px 30px rgba(90,70,40,0.10)';
export const AQUA_SHADOW_SOFT = '0 1px 3px rgba(90,70,40,0.05), 0 8px 18px rgba(90,70,40,0.08)';
/** Pigment pooled at the edges where the wash dried (inside the card, so the torn edge keeps it). */
export const POOLED = 'inset 0 0 0 1.5px rgba(150,118,72,0.10), inset 0 0 30px rgba(160,124,74,0.16)';
/** Two soft blooms of colour that bled into the paper: gamboge at the top right, ultramarine at the bottom left. */
export const BLOOMS =
  'radial-gradient(120% 90% at 92% 0%, rgba(232,170,53,0.12), rgba(232,170,53,0) 55%), radial-gradient(110% 90% at 0% 100%, rgba(58,120,194,0.09), rgba(58,120,194,0) 60%)';
/** A band whose bottom edge is torn (the date card's painted header): a clip-path, the same for a given seed. */
export const tornBottom = (seed: number, depth = 9, points = 30) => {
  const r = (k: number) => {
    const x = Math.sin(seed * 91.7 + k * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const edge = Array.from({length: points + 1}, (_, k) => `${(((points - k) / points) * 100).toFixed(2)}% calc(100% - ${(2 + r(k) * depth).toFixed(1)}px)`);
  return `polygon(0 0, 100% 0, ${edge.join(', ')})`;
};
/** A soft shadow under a torn card, set on its wrapper (the card's own mask would cut a shadow of its own). */
export const LIFT = 'drop-shadow(0 3px 3px rgba(90,70,40,0.10)) drop-shadow(0 14px 16px rgba(90,70,40,0.13))';
/** A hand-torn (deckled) paper edge at any size: a 9-slice mask (06-tools/watercolor_textures.py → deckle.png). */
export const deckle = (slice = 56): React.CSSProperties =>
  aquarelle() ? ({WebkitMaskBoxImage: `url("${texture('deckle.png')}") 96 / ${slice}px round`} as React.CSSProperties) : {};
