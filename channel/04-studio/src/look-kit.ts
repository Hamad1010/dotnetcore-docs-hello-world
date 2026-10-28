// Small helpers of the watercolor look (look.ts), kept apart so drawing components can use them without importing the
// look switch itself (it reads the moment kit when it loads).
import {staticFile} from 'remotion';
import {C, LOOK} from './theme';

/** Indigo ink at an opacity. */
export const ink = (a: number) => `rgba(38,41,74,${a})`;
/** The anime line: an ink outline (a shadow with no blur that follows the corners), then a hard cel shadow down to
 * the left (the light comes from the top right). */
const outline = (w: number, dx: number, dy: number, a: number) => `0 0 0 ${w}px ${ink(0.9)}, ${-dx}px ${dy}px 0 ${w}px ${ink(a)}`;
export const INK_SHADOW = outline(3, 10, 12, 0.12);
export const INK_SHADOW_SOFT = outline(2.5, 6, 7, 0.1);
export const INK_DEEP = outline(3, 12, 14, 0.13);

/** The look's textures, in 03-episodes/_assets/look/. */
export const texture = (name: 'paper.jpg' | 'paper-tile.jpg' | `wash-${'blue' | 'gold' | 'green' | 'rose'}.png`) => staticFile(`_assets/look/${name}`);
/** A card's background: paper with its grain (watercolor), or plain. */
export const paperCard = (color: string = C.surface) => (LOOK.name === 'watercolor' ? `${color} url("${texture('paper-tile.jpg')}") 0 0 / 512px 512px repeat` : color);
