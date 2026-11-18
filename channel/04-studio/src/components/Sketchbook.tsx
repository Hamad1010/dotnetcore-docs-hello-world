// The «sketchbook» look (framework v7, from EP006): the four styles the owner chose blended into one page. Warm cream
// paper with a faint dot grid (sketchnote); graphite lines with a little wobble and grain (tablet sketch); translucent
// watercolour washes laid under the line and shifted off it, with pooled edges (watercolour brush + tablet sketch);
// plain stick people with round heads and no faces (stick-figure explainer); banners, fat arrows, numbered boxes and
// one yellow marker for the thing that matters (sketchnote). Coral is the "explaining" colour (arrows, underlines).
// Everything is our own drawing in SVG; the styles' guides were read, not copied (their docs are CC BY-NC).
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const SK = {
  paper: '#F4ECDD',
  paper2: '#EFE5D3',
  dot: 'rgba(120, 98, 74, 0.20)',
  graphite: '#3F342D',
  graphite2: '#7A6C60',
  light: '#B5A796',
  coral: '#DC6A4C',
  yellow: 'rgba(246, 196, 62, 0.78)',
  yellowSolid: '#F1C04F',
  navy: '#22314F',
  navy2: '#3A4B6E',
  slate: '#6E7F9E',
  gold: '#D4A72C',
  skin: '#E8C4A0',
  skin2: '#D9AE86',
  sand: '#C9B28E',
  blueWash: '#8FB0CF',
  greenWash: '#9DBB8C',
  roseWash: '#E2A08E',
  white: '#FBF8F1',
  red: '#C8463A',
};

/** Hand lettering: Marhey (a marker hand) for banners and keywords, Aref Ruqaa (the everyday handwriting of Arabic) for
 * notes and quotes, Caveat for English names. All SIL OFL, self-hosted (fonts.ts). */
export const HAND = '"Marhey", "Readex Pro", sans-serif';
export const RUQAA = '"Aref Ruqaa", "Amiri", serif';
export const LATIN_HAND = '"Caveat", "Readex Pro", sans-serif';

/** The SVG filters every sketchbook drawing uses; put once in each <svg> that draws (ids are per-svg, so prefix them). */
export const SketchFilters: React.FC<{id: string; seed?: number}> = ({id, seed = 3}) => (
  <defs>
    {/* graphite: a slow wobble along the line, then the paper's tooth eats the light parts (grain) */}
    <filter id={`${id}-pencil`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="wob" />
      <feDisplacementMap in="SourceGraphic" in2="wob" scale={4.5} xChannelSelector="R" yChannelSelector="G" result="moved" />
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={seed + 11} result="tooth" />
      <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="toothA" />
      <feComposite in="moved" in2="toothA" operator="in" />
    </filter>
    {/* fineliner: a wobble only, crisp ink */}
    <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={seed + 5} result="wob" />
      <feDisplacementMap in="SourceGraphic" in2="wob" scale={3} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* watercolour: a ragged edge that follows the paper, as pigment does */}
    <filter id={`${id}-wash`} x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={3} seed={seed + 2} result="edge" />
      <feDisplacementMap in="SourceGraphic" in2="edge" scale={13} xChannelSelector="R" yChannelSelector="G" result="ragged" />
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={seed + 9} result="bloom" />
      <feColorMatrix in="bloom" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0.35" result="bloomA" />
      <feComposite in="ragged" in2="bloomA" operator="in" />
    </filter>
    {/* a calmer wash for large areas of one pigment: the same ragged edge, less mottling */}
    <filter id={`${id}-calm`} x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={3} seed={seed + 2} result="edge" />
      <feDisplacementMap in="SourceGraphic" in2="edge" scale={10} xChannelSelector="R" yChannelSelector="G" result="ragged" />
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed + 9} result="bloom" />
      <feColorMatrix in="bloom" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0.68" result="bloomA" />
      <feComposite in="ragged" in2="bloomA" operator="in" />
    </filter>
    {/* the pooled edge of a dried wash: a thin darker ring, broken up */}
    <filter id={`${id}-pool`} x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={3} seed={seed + 2} result="edge" />
      <feDisplacementMap in="SourceGraphic" in2="edge" scale={13} xChannelSelector="R" yChannelSelector="G" result="ragged" />
      <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves={1} seed={seed + 4} result="dry" />
      <feColorMatrix in="dry" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.3" result="dryA" />
      <feComposite in="ragged" in2="dryA" operator="in" />
    </filter>
    {/* marker: streaky, see-through */}
    <filter id={`${id}-marker`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.18" numOctaves={1} seed={seed + 7} result="streak" />
      <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0.55" result="streakA" />
      <feDisplacementMap in="SourceGraphic" in2="streak" scale={5} xChannelSelector="R" yChannelSelector="G" result="moved" />
      <feComposite in="moved" in2="streakA" operator="in" />
    </filter>
  </defs>
);

/** The page: warm cream paper with a fine grain, a slow mottle and the faint dot grid of a notebook. */
export const SketchPaper: React.FC<{dots?: boolean}> = ({dots = true}) => (
  <AbsoluteFill style={{background: SK.paper}}>
    <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={21} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.25  0 0 0 0.10 0" />
        </filter>
        <filter id="paper-mottle">
          <feTurbulence type="fractalNoise" baseFrequency="0.0025" numOctaves={3} seed={8} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.52  0 0 0 0 0.38  0 0 0 0.16 0" />
        </filter>
        <pattern id="paper-dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1.6" fill={SK.dot} />
        </pattern>
        <radialGradient id="paper-falloff" cx="50%" cy="48%" r="75%">
          <stop offset="70%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#5a4630" stopOpacity={0.10} />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" filter="url(#paper-mottle)" />
      <rect width="1920" height="1080" filter="url(#paper-grain)" />
      {dots ? <rect width="1920" height="1080" fill="url(#paper-dots)" /> : null}
      <rect width="1920" height="1080" fill="url(#paper-falloff)" />
    </svg>
  </AbsoluteFill>
);

/** A watercolour bloom: two passes of one pigment with a ragged edge and a pooled rim (inside an svg with filters). */
export const WashBlob: React.FC<{id: string; d: string; color: string; opacity?: number; dx?: number; dy?: number}> = ({id, d, color, opacity = 0.55, dx = 0, dy = 0}) => (
  <g transform={`translate(${dx} ${dy})`} style={{mixBlendMode: 'multiply'}}>
    <path d={d} fill={color} opacity={opacity} filter={`url(#${id}-wash)`} />
    <path d={d} fill={color} opacity={opacity * 0.55} filter={`url(#${id}-wash)`} transform="translate(6 4) scale(0.985)" />
    <path d={d} fill="none" stroke={color} strokeWidth={5} opacity={Math.min(1, opacity * 1.2)} filter={`url(#${id}-pool)`} />
  </g>
);

/** A curved limb: from its root to its tip, bending towards the joint without passing through it (stick people). */
export const limb = (root: [number, number], joint: [number, number], tip: [number, number], k = 0.8) => {
  const mid: [number, number] = [(root[0] + tip[0]) / 2, (root[1] + tip[1]) / 2];
  const c: [number, number] = [mid[0] + (joint[0] - mid[0]) * 2 * k, mid[1] + (joint[1] - mid[1]) * 2 * k];
  return `M${root[0]} ${root[1]} Q${c[0]} ${c[1]} ${tip[0]} ${tip[1]}`;
};

export type StickPose = 'stand' | 'ask' | 'answer' | 'cheer' | 'walk';
/** A plain stick person, 380 units tall, feet at (0, 0): one even line, a round head, no face, no hands. */
export const StickPerson: React.FC<{
  id: string;
  x: number;
  y: number;
  size?: number;
  pose?: StickPose;
  accent?: string;
  ink?: string;
  flip?: boolean;
}> = ({id, x, y, size = 380, pose = 'stand', accent, ink = SK.graphite, flip = false}) => {
  const s = size / 380;
  const P = {
    stand: {la: [[-34, -200], [-52, -120]], ra: [[34, -200], [52, -120]], ll: [[-14, -110], [-32, 0]], rl: [[14, -110], [32, 0]], head: [0, -318]},
    ask: {la: [[-40, -205], [-62, -125]], ra: [[52, -250], [70, -300]], ll: [[-14, -110], [-30, 0]], rl: [[14, -110], [34, 0]], head: [6, -316]},
    answer: {la: [[-58, -230], [-96, -232]], ra: [[58, -230], [98, -236]], ll: [[-14, -110], [-34, 0]], rl: [[14, -110], [34, 0]], head: [-4, -318]},
    cheer: {la: [[-52, -262], [-74, -330]], ra: [[52, -262], [74, -330]], ll: [[-16, -110], [-36, 0]], rl: [[16, -110], [36, 0]], head: [0, -320]},
    walk: {la: [[-30, -190], [-12, -118]], ra: [[36, -196], [62, -130]], ll: [[-6, -112], [-44, 0]], rl: [[22, -100], [40, -4]], head: [8, -316]},
  }[pose] as {la: number[][]; ra: number[][]; ll: number[][]; rl: number[][]; head: number[]};
  const neck: [number, number] = [P.head[0] * 0.6, -272];
  const hip: [number, number] = [0, -122];
  const shoulder: [number, number] = [neck[0] * 0.9, -250];
  const w = 8.5;
  const line = {fill: 'none', stroke: ink, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter={`url(#${id}-ink)`}>
      <path d={limb(neck, [neck[0] + 6, -200], hip, 0.55)} {...line} />
      <path d={limb(shoulder, P.la[0] as [number, number], P.la[1] as [number, number])} {...line} stroke={accent && pose === 'ask' ? ink : ink} />
      <path d={limb(shoulder, P.ra[0] as [number, number], P.ra[1] as [number, number])} {...line} />
      <path d={limb(hip, P.ll[0] as [number, number], P.ll[1] as [number, number])} {...line} />
      <path d={limb(hip, P.rl[0] as [number, number], P.rl[1] as [number, number])} {...line} />
      <circle cx={P.head[0]} cy={P.head[1]} r={44} fill={accent ?? SK.paper} stroke={accent ?? ink} strokeWidth={w} />
    </g>
  );
};

/** A sketchnote banner: a ribbon with folded tails, paper inside, a grey shadow under it and one word on yellow. */
export const Banner: React.FC<{id: string; x: number; y: number; w: number; text: string; mark?: string; size?: number}> = ({id, x, y, w, text, mark, size = 66}) => {
  const h = size * 1.55;
  const tail = h * 0.55;
  const parts = mark ? text.split(mark) : [text];
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* tails */}
      <path d={`M${-tail * 0.2} ${h * 0.28} L${-tail * 1.25} ${h * 0.28} L${-tail * 0.85} ${h * 0.72} L${-tail * 1.25} ${h * 1.12} L${-tail * 0.2} ${h * 1.12} Z`} fill="rgba(80,80,92,0.28)" stroke={SK.graphite} strokeWidth={4} strokeLinejoin="round" filter={`url(#${id}-ink)`} />
      <path d={`M${w + tail * 0.2} ${h * 0.28} L${w + tail * 1.25} ${h * 0.28} L${w + tail * 0.85} ${h * 0.72} L${w + tail * 1.25} ${h * 1.12} L${w + tail * 0.2} ${h * 1.12} Z`} fill="rgba(80,80,92,0.28)" stroke={SK.graphite} strokeWidth={4} strokeLinejoin="round" filter={`url(#${id}-ink)`} />
      {/* shadow, then the paper of the ribbon, then its line */}
      <rect x={10} y={12} width={w} height={h} fill="rgba(80,80,92,0.20)" />
      <rect x={0} y={0} width={w} height={h} fill={SK.white} />
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={SK.graphite} strokeWidth={4.5} filter={`url(#${id}-ink)`} />
      <rect x={3} y={-3} width={w} height={h} fill="none" stroke={SK.graphite} strokeWidth={2} opacity={0.45} filter={`url(#${id}-ink)`} />
      <text x={w / 2} y={h * 0.7} textAnchor="middle" direction="rtl" fontFamily={HAND} fontWeight={600} fontSize={size} fill={SK.graphite}>
        {parts.length > 1 ? (
          <>
            {parts[0]}
            <tspan style={{paintOrder: 'stroke'}} stroke={SK.yellowSolid} strokeWidth={size * 0.55} strokeLinejoin="round" strokeOpacity={0.75} fill={SK.graphite}>
              {mark}
            </tspan>
            {parts[1]}
          </>
        ) : (
          text
        )}
      </text>
    </g>
  );
};

/** A fat sketchnote arrow, outlined in ink and filled with marker, along a gentle curve from `from` to `to`. */
export const FatArrow: React.FC<{id: string; from: [number, number]; to: [number, number]; bend?: number; color?: string; width?: number}> = ({id, from, to, bend = 0.18, color = SK.yellow, width = 30}) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const cx = (x1 + x2) / 2 + nx * len * bend;
  const cy = (y1 + y2) / 2 + ny * len * bend;
  // the body as a thick quadratic curve, the head as a triangle at the tip
  const tx = x2 - cx;
  const ty = y2 - cy;
  const tl = Math.hypot(tx, ty);
  const ux = tx / tl;
  const uy = ty / tl;
  const head = width * 1.9;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  const tri = `M${x2} ${y2} L${bx - uy * head * 0.75} ${by + ux * head * 0.75} L${bx + uy * head * 0.75} ${by - ux * head * 0.75} Z`;
  const body = `M${x1} ${y1} Q${cx} ${cy} ${bx} ${by}`;
  return (
    <g>
      <path d={body} fill="none" stroke={SK.graphite} strokeWidth={width + 9} strokeLinecap="round" filter={`url(#${id}-ink)`} />
      <path d={body} fill="none" stroke={SK.white} strokeWidth={width} strokeLinecap="round" />
      <path d={body} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" filter={`url(#${id}-marker)`} style={{mixBlendMode: 'multiply'}} />
      <path d={tri} fill={SK.white} stroke={SK.graphite} strokeWidth={4.5} strokeLinejoin="round" filter={`url(#${id}-ink)`} />
      <path d={tri} fill={color} filter={`url(#${id}-marker)`} style={{mixBlendMode: 'multiply'}} />
    </g>
  );
};

/** A speech bubble drawn in fineliner, with hand lettering inside. */
export const Bubble: React.FC<{id: string; x: number; y: number; w: number; h: number; text: string; tail: 'left' | 'right'; size?: number; font?: string}> = ({id, x, y, w, h, text, tail, size = 48, font = RUQAA}) => {
  const r = Math.min(h / 2, 46);
  const tx = tail === 'left' ? w * 0.22 : w * 0.78;
  const d = `M${r} 0 H${w - r} Q${w} 0 ${w} ${r} V${h - r} Q${w} ${h} ${w - r} ${h} H${tx + 26} L${tx + (tail === 'left' ? -34 : 34)} ${h + 46} L${tx - 8} ${h} H${r} Q0 ${h} 0 ${h - r} V${r} Q0 0 ${r} 0 Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} fill={SK.white} transform="translate(8 9)" opacity={0.0} />
      <path d={d} fill="rgba(80,80,92,0.16)" transform="translate(9 10)" />
      <path d={d} fill={SK.white} />
      <path d={d} fill="none" stroke={SK.graphite} strokeWidth={4.5} strokeLinejoin="round" filter={`url(#${id}-ink)`} />
      <text x={w / 2} y={h / 2 + size * 0.36} textAnchor="middle" direction="rtl" fontFamily={font} fontSize={size} fill={SK.graphite}>
        {text}
      </text>
    </g>
  );
};

/** A door, pencilled, with a watercolour block shifted off its line (the season's corridor of doors, in this look). */
export const SketchDoor: React.FC<{id: string; x: number; y: number; w?: number; h?: number; color?: string; open?: number}> = ({id, x, y, w = 190, h = 330, color = SK.blueWash, open = 0}) => (
  <g transform={`translate(${x} ${y})`}>
    <WashBlob id={id} d={`M0 0 H${w} V${h} H0 Z`} color={color} opacity={0.6} dx={10} dy={9} />
    {open > 0 ? <path d={`M0 0 L${w * (1 - open * 0.55)} ${h * 0.06} V${h * 0.94} L0 ${h} Z`} fill={SK.paper2} opacity={0.9} /> : null}
    <g filter={`url(#${id}-pencil)`} fill="none" stroke={SK.graphite} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M-14 ${h + 6} V-14 H${w + 14} V${h + 6}`} />
      <path d={`M0 ${h} V0 H${w} V${h}`} />
      <path d={`M${w * 0.16} ${h * 0.12} H${w * 0.84} V${h * 0.42} H${w * 0.16} Z`} strokeWidth={3} opacity={0.7} />
      <path d={`M${w * 0.16} ${h * 0.54} H${w * 0.84} V${h * 0.88} H${w * 0.16} Z`} strokeWidth={3} opacity={0.7} />
      <circle cx={w * 0.84} cy={h * 0.5} r={7} strokeWidth={4} stroke={SK.coral} />
      <path d={`M-60 ${h + 6} H${w + 60}`} strokeWidth={4} opacity={0.6} />
    </g>
  </g>
);
