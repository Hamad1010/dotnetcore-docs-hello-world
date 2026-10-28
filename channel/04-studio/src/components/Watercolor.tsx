// Pieces of the watercolor look (look.ts, episode.json "look": "watercolor"): the paper stage with its pigment washes,
// anime sparkles on a reveal, an anime sky with cel-shaded clouds and a painted mountain for the journey map.
// Textures from 06-tools/watercolor_textures.py; everything else drawn here from plain shapes.
import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {ink, texture} from '../look-kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Where the washes lie (fractions of the frame), how big (a fraction of its width), and how strong.
const WASHES = [
  {name: 'blue', x: -0.17, y: -0.36, size: 0.55, rot: 0, phase: 0, opacity: 0.55},
  {name: 'gold', x: 0.69, y: 0.55, size: 0.52, rot: 40, phase: 2, opacity: 0.5},
  {name: 'green', x: 0.76, y: -0.4, size: 0.45, rot: 110, phase: 4, opacity: 0.4},
  {name: 'rose', x: -0.16, y: 0.64, size: 0.4, rot: 200, phase: 1, opacity: 0.36},
] as const;

/** The stage: warm cold-press paper, four pigment washes drying at its corners, drifting very slowly. */
export const WashBackdrop: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = f / 30;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <Img src={texture('paper.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      {WASHES.map((w) => (
        <Img
          key={w.name}
          src={texture(`wash-${w.name}.png`)}
          style={{
            position: 'absolute',
            left: w.x * width + Math.sin(t * 0.22 + w.phase) * 26,
            top: w.y * height + Math.cos(t * 0.18 + w.phase) * 20,
            width: w.size * width,
            height: w.size * width,
            opacity: w.opacity,
            transform: `rotate(${w.rot + Math.sin(t * 0.05 + w.phase) * 2}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Preloads the look's textures, so no frame is drawn before the paper is there. */
export const WashTextures: React.FC = () => (
  <>
    {(['paper.jpg', 'paper-tile.jpg', 'wash-blue.png', 'wash-gold.png', 'wash-green.png', 'wash-rose.png'] as const).map((n) => (
      <Img key={n} src={texture(n)} style={{display: 'none'}} />
    ))}
  </>
);

// A four-point star, 1 unit from its centre to each tip.
const STAR = 'M0 -1 C0.1 -0.1 0.1 -0.1 1 0 C0.1 0.1 0.1 0.1 0 1 C-0.1 0.1 -0.1 0.1 -1 0 C-0.1 -0.1 -0.1 -0.1 0 -1 Z';
// around the box: [x, y] as fractions of it, size, delay in frames
const STARS: [number, number, number, number][] = [
  [-0.04, 0.1, 30, 0],
  [1.03, 0.22, 22, 4],
  [0.96, 1.02, 26, 8],
  [0.04, 0.94, 18, 3],
  [0.52, -0.08, 16, 6],
];

/** Anime sparkles ("kira"): gold four-point stars with an ink line twinkle around a reveal for about a second. */
export const Sparkles: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 44) return null;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {STARS.map(([x, y, size, delay], k) => {
        const p = interpolate(t - delay, [0, 9, 30], [0, 1, 0], clamp);
        if (p <= 0) return null;
        return (
          <svg key={k} width={size * 2} height={size * 2} viewBox="-1.2 -1.2 2.4 2.4" style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, transform: `translate(-50%, -50%) scale(${p}) rotate(${(t - delay) * 2}deg)`, overflow: 'visible'}}>
            <path d={STAR} fill={C.yellow} stroke={ink(0.9)} strokeWidth={0.12} strokeLinejoin="round" />
            <circle r={0.16} fill="#FFFBEA" />
          </svg>
        );
      })}
    </div>
  );
};

// Manga focus lines: [angle in degrees, length jitter, width], fixed so every render is the same
const LINES = Array.from({length: 56}, (_, k) => {
  const r = (n: number) => {
    const x = Math.sin(k * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return [k * (360 / 56) + r(1) * 4, r(2), 2 + r(3) * 5] as const;
});

/** Anime focus lines behind a question: ink lines rushing in from the edges toward it, for about a second. */
export const FocusLines: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 40) return null;
  const o = interpolate(t, [0, 4, 26, 40], [0, 1, 1, 0], clamp);
  const beat = Math.floor(t / 3); // the lines flicker, as anime draws them
  return (
    <svg width={2600} height={1600} viewBox="-1300 -800 2600 1600" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: o * 0.38, pointerEvents: 'none'}}>
      {LINES.map(([deg, jitter, w], k) => {
        const a = (deg * Math.PI) / 180;
        const inner = 260 + 120 * ((jitter + beat * 0.37 * (k % 3)) % 1);
        const x0 = Math.cos(a) * inner;
        const y0 = Math.sin(a) * inner * 0.62;
        const x1 = Math.cos(a) * 1300;
        const y1 = Math.sin(a) * 800;
        const nx = -Math.sin(a) * w;
        const ny = Math.cos(a) * w;
        return <path key={k} d={`M${x0} ${y0} L${x1 + nx} ${y1 + ny} L${x1 - nx} ${y1 - ny} Z`} fill={ink(0.55)} />;
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ the journey map's sky and mountain
type Puff = [number, number, number];
const CLOUD_SHAPES: Puff[][] = [
  [[-120, 12, 56], [-58, -22, 74], [16, -44, 86], [96, -18, 70], [152, 14, 50], [40, 18, 60]],
  [[-80, 8, 48], [-24, -26, 64], [44, -14, 58], [96, 10, 42]],
  [[-150, 14, 50], [-90, -12, 62], [-20, -34, 78], [60, -26, 72], [130, 0, 58], [180, 18, 40]],
];
const CLOUDS = [
  {x: 360, y: 210, s: 1.15, shape: 0, speed: 0.2},
  {x: 1500, y: 150, s: 0.95, shape: 2, speed: 0.13},
  {x: 1180, y: 330, s: 0.62, shape: 1, speed: 0.28},
  {x: 140, y: 430, s: 0.5, shape: 1, speed: 0.34},
];

/** One cumulus as anime paints it: white where the light (top right) reaches, a crisp lavender shade underneath. */
const Cloud: React.FC<{id: string; puffs: Puff[]; x: number; y: number; s: number}> = ({id, puffs, x, y, s}) => {
  const bottom = Math.max(...puffs.map(([, cy]) => cy)) + 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={id}>
          {puffs.map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} />)}
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-400} y={-200} width={800} height={400} fill="#BCCBE7" />
        {puffs.map(([cx, cy, r], k) => <circle key={k} cx={cx + 12} cy={cy - 18} r={r} fill="#FFFFFF" />)}
        <rect x={-400} y={bottom} width={800} height={200} fill="#AFC0E2" />
      </g>
    </g>
  );
};

/** An anime sky over the top of the map: deep blue fading to the paper at the horizon, clouds drifting left. Laid
 * behind the top bar and the title (BizScenes' Journey). */
export const AnimeSky: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const f = useCurrentFrame();
  const {width: w, height} = useVideoConfig();
  const horizon = height * 0.72;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{position: 'absolute', inset: 0, opacity}}>
      <defs>
        <linearGradient id="anime-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3F7DC4" />
          <stop offset="0.45" stopColor="#86B8E4" />
          <stop offset="0.8" stopColor="#D6E6EE" />
          <stop offset="1" stopColor="#F6F0E4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={w} height={horizon} fill="url(#anime-sky)" opacity={0.84} />
      {CLOUDS.map((c, k) => {
        const x = ((c.x - f * c.speed + 300) % (w + 600) + w + 600) % (w + 600) - 300;
        return <Cloud key={k} id={`anime-cloud-${k}`} puffs={CLOUD_SHAPES[c.shape]} x={x} y={c.y} s={c.s} />;
      })}
    </svg>
  );
};

/** A small pine as anime draws it: three tiers in sap green with an ink line, the light side a shade brighter. */
const Pine: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-4} y={-6} width={8} height={18} fill="#6B4B3A" stroke={ink(0.9)} strokeWidth={2.5} />
    {[0, 1, 2].map((k) => {
      const top = -40 - k * 26;
      const half = 34 - k * 8;
      return (
        <g key={k}>
          <path d={`M0 ${top} L${half} ${top + 44} L${-half} ${top + 44} Z`} fill="#2F7A55" stroke={ink(0.9)} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M0 ${top} L${half} ${top + 44} L${half * 0.2} ${top + 44} Z`} fill="#4E9C6F" />
        </g>
      );
    })}
  </g>
);

const TREES: [number, number, number][] = [
  [-700, 1010, 0.9], [-640, 1028, 1.05], [-580, 1004, 0.8], [-520, 1030, 0.95],
  [560, 1024, 1], [622, 1004, 0.82], [680, 1030, 1.08], [742, 1012, 0.86],
];

/** The mountain, painted: paler peaks behind, the main one washed from blue at the top to the paper at its foot, its
 * left face in shadow (light from the top right), snow with a cel shade, an ink line, pines at its foot. */
export const WashMountain: React.FC<{x: number; y: number; footY: number; half: number; snowHalf: number}> = ({x, y, footY, half, snowHalf}) => {
  const left = x - half;
  const right = x + half;
  const snowY = y + 110;
  const snow = `M${x} ${y} L${x + snowHalf} ${snowY} L${x + snowHalf * 0.55} ${snowY - 22} L${x + snowHalf * 0.2} ${snowY + 8} L${x - snowHalf * 0.25} ${snowY - 18} L${x - snowHalf * 0.6} ${snowY + 6} L${x - snowHalf} ${snowY} Z`;
  return (
    <g>
      <defs>
        <linearGradient id="wash-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8EA5D4" />
          <stop offset="0.5" stopColor="#C2CBE2" />
          <stop offset="1" stopColor="#EFE6D4" />
        </linearGradient>
      </defs>
      <path d={`M${left - 260} ${footY + 40} Q${left + 150} ${y + 250} ${left + 180} ${y + 236} Q${left + 220} ${y + 250} ${left + 520} ${footY + 40} Z`} fill="#CBD4EA" opacity={0.85} />
      <path d={`M${right - 480} ${footY + 40} Q${right + 10} ${y + 176} ${right + 40} ${y + 162} Q${right + 76} ${y + 176} ${right + 420} ${footY + 40} Z`} fill="#D7DDED" opacity={0.85} />
      <path d={`M${left} ${footY} L${x} ${y} L${right} ${footY} Z`} fill="url(#wash-mountain)" />
      {/* the shadow side: the left face down to a ragged ridge */}
      <path d={`M${x} ${y} L${left} ${footY} L${x - 70} ${footY} L${x - 40} ${y + 430} L${x - 70} ${y + 260} L${x - 20} ${y + 150} Z`} fill="#56618F" opacity={0.24} />
      <path d={snow} fill="#FFFFFF" />
      <path d={`M${x} ${y} L${x - snowHalf} ${snowY} L${x - snowHalf * 0.6} ${snowY + 6} L${x - snowHalf * 0.25} ${snowY - 18} L${x - 6} ${y + 60} Z`} fill="#D3DBEE" />
      <path d={`M${left} ${footY} L${x} ${y} L${right} ${footY}`} fill="none" stroke={ink(0.9)} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />
      {TREES.map(([dx, ty, s], k) => <Pine key={k} x={x + dx} y={ty} s={s} />)}
    </g>
  );
};
