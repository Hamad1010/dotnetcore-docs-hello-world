// Rich motion (episode.json "motion": "rich", the owner's request after EP003): the watercolor-anime look as it was,
// with more life on top. Brushes pulled across the frame between scenes, headlines that land word by word over a
// painted underline, an impact burst when a number lands, a bounce when a card arrives, ink splatter and a shake under a
// stamp, and the light of the paper: sun rays from the top right (where the cel shadows say the light is) and motes
// drifting up through them. All of it plain shapes and moving images, no SVG filters, so a render costs what it did.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE_IN_OUT, EASE_OUT} from '../theme';
import {ink, texture} from '../look-kit';
import {useFrameSize} from './frame';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PIGMENTS = ['blue', 'gold', 'green', 'rose'] as const;
/** Frames the wipe starts before the cut (its Sequence begins there) and lasts in all. */
export const WIPE_LEAD = 11;
export const WIPE_FRAMES = 30;

/** The wipe between two scenes: two loaded brushes pulled across from right to left, the second a beat behind, so the
 * old scene goes under paint; then the paint flies off to the left and the new scene is there. The cut is at frame
 * WIPE_LEAD of its Sequence. `index` picks the pigments, so each cut has its own pair. */
export const BrushWipe: React.FC<{index: number}> = ({index}) => {
  const f = useCurrentFrame();
  const {width, height} = useFrameSize();
  const t = f - WIPE_LEAD;
  const stroke = (k: number, top: number, delay: number) => {
    const cover = interpolate(t - delay, [-WIPE_LEAD + 1, 0], [0, 1], {...clamp, easing: EASE_IN_OUT});
    const lift = interpolate(t - delay, [2, 14], [0, 1], {...clamp, easing: EASE_IN_OUT});
    if (cover <= 0 || lift >= 1) return null;
    return (
      <div
        key={k}
        style={{
          position: 'absolute',
          left: -0.1 * width,
          top: top * height,
          width: 1.2 * width,
          height: 0.8 * height,
          clipPath: `inset(0 ${lift * 100}% 0 ${(1 - cover) * 100}%)`,
          transform: `rotate(${k ? 4 : -5}deg)`,
        }}
      >
        {/* flipped: the loaded start of the stroke on the right, its dry end on the left */}
        <Img src={texture(`stroke-${PIGMENTS[(index + k * 2) % 4]}.png`)} style={{width: '100%', height: '100%', transform: 'scaleX(-1)'}} />
      </div>
    );
  };
  return <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', zIndex: 20}}>{[stroke(0, -0.2, 0), stroke(1, 0.38, 3)]}</AbsoluteFill>;
};

// The motes: [x, y] as fractions of the frame, size in px, how fast they rise (px a second), how far they sway
const MOTES = Array.from({length: 26}, (_, k) => ({
  x: random(`mote-x-${k}`),
  y: random(`mote-y-${k}`),
  size: 3 + random(`mote-s-${k}`) * 5,
  rise: 8 + random(`mote-r-${k}`) * 22,
  sway: 10 + random(`mote-w-${k}`) * 26,
  phase: random(`mote-p-${k}`) * Math.PI * 2,
  gold: random(`mote-g-${k}`) < 0.4,
}));

/** The light on the paper: three soft sun rays from the top right breathing slowly, motes drifting up through them. */
export const Atmosphere: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useFrameSize();
  const t = f / 30;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: width * (0.52 + 0.17 * k) + Math.sin(t * 0.13 + k * 1.7) * 36,
            top: -height * 0.35,
            width: width * (0.09 + 0.05 * k),
            height: height * 2,
            transform: 'rotate(34deg)',
            transformOrigin: 'top center',
            // warm sunlight: a gold tint reads as light on the cream paper, where white would not show
            background: 'linear-gradient(90deg, rgba(255,214,130,0) 0%, rgba(255,222,150,0.42) 50%, rgba(255,214,130,0) 100%)',
            opacity: 0.55 + 0.2 * Math.sin(t * 0.35 + k * 2.1),
          }}
        />
      ))}
      {MOTES.map((m, k) => {
        const span = height + 60;
        const y = ((((m.y * span - m.rise * t) % span) + span) % span) - 30;
        const x = m.x * width + Math.sin(t * 0.6 + m.phase) * m.sway;
        const glow = m.gold ? 'rgba(232,170,53,0.55)' : 'rgba(255,253,245,0.9)';
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: m.size * 3,
              height: m.size * 3,
              borderRadius: 999,
              background: `radial-gradient(circle, ${glow} 0%, ${glow.replace(/[\d.]+\)$/, '0)')} 60%)`,
              opacity: 0.55 + 0.35 * Math.sin(t * 1.3 + m.phase),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** An anime impact frame where a number lands: ink speed lines bursting out of the card's centre and a ring. */
export const ImpactBurst: React.FC<{at: number; color?: string}> = ({at, color = C.yellow}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 16) return null;
  const p = interpolate(t, [0, 9], [0, 1], {...clamp, easing: EASE_OUT});
  const fade = interpolate(t, [5, 16], [1, 0], clamp);
  return (
    <svg width={900} height={900} viewBox="-450 -450 900 900" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible', pointerEvents: 'none', zIndex: -1}}>
      {Array.from({length: 18}, (_, k) => {
        const a = (k / 18) * Math.PI * 2 + random(`burst-a-${k}`) * 0.25;
        const r0 = 170 + 40 * p + random(`burst-r-${k}`) * 30;
        const r1 = r0 + (60 + random(`burst-l-${k}`) * 90) * p;
        return (
          <line key={k} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={k % 3 ? ink(0.85) : color}
            strokeWidth={k % 3 ? 5 : 9} strokeLinecap="round" opacity={fade} />
        );
      })}
      <circle r={150 + 210 * p} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 2} opacity={fade * 0.8} />
    </svg>
  );
};

/** The pure watercolor look's reveal, in place of the anime impact: a drop of pigment touching wet paper behind the
 * card, blooming out, then drying back to a pale stain that stays while the card does. */
export const PaintBloom: React.FC<{at: number; pigment: 'blue' | 'gold' | 'green' | 'rose'; size?: number}> = ({at, pigment, size = 1000}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0) return null;
  const grow = interpolate(t, [0, 28], [0.42, 1], {...clamp, easing: EASE_OUT});
  const o = interpolate(t, [0, 5, 36], [0, 0.75, 0.32], clamp);
  return (
    <Img
      src={texture(`wash-${pigment}.png`)}
      style={{position: 'absolute', left: '50%', top: '50%', width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, transform: `scale(${grow}) rotate(${(at * 47) % 360}deg)`, opacity: o, pointerEvents: 'none', zIndex: -1}}
    />
  );
};

/** How much a number swells as it lands: 0 → 1 → 0 over a third of a second from `at`. */
export const punch = (f: number, at: number) => interpolate(f - at, [0, 3, 11], [0, 1, 0], clamp);

/** Ink thrown out by a stamp as it hits, and the shake of the hit: a translate in px for the stamp's frame. */
export const InkSplatter: React.FC<{at: number; color: string}> = ({at, color}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0) return null;
  const p = interpolate(t, [0, 4], [0, 1], {...clamp, easing: EASE_OUT});
  return (
    <svg width={700} height={420} viewBox="-350 -210 700 420" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible', pointerEvents: 'none'}}>
      {Array.from({length: 9}, (_, k) => {
        const a = random(`splat-a-${k}`) * Math.PI * 2;
        const r = (180 + random(`splat-r-${k}`) * 120) * (0.6 + 0.4 * p);
        const size = 5 + random(`splat-s-${k}`) * 12;
        return <ellipse key={k} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.62} rx={size * p} ry={size * 0.7 * p} fill={color} opacity={0.8} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * r} ${Math.sin(a) * r * 0.62})`} />;
      })}
    </svg>
  );
};

export const shake = (f: number, at: number) => {
  const t = f - at;
  if (t < 0 || t > 8) return 'none';
  const amp = 7 * (1 - t / 8);
  return `translate(${amp * Math.sin(t * 2.7)}px, ${amp * 0.6 * Math.cos(t * 3.3)}px)`;
};

/** A card arriving like an anime cel: a little wide and flat as it lands, a little tall as it bounces, then still.
 * Returns [scaleX, scaleY]. */
export const squash = (f: number, at: number, fps: number): [number, number] => {
  const w = spring({frame: f - at - 2, fps, config: {damping: 7, stiffness: 190, mass: 0.6}}) - 1;
  return [1 - 0.09 * w, 1 + 0.09 * w];
};

/** A headline that lands word by word (whole words, so the Arabic letters stay joined): each rises, turns upright and
 * settles a beat after the one before it, in reading order. */
export const KineticWords: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <>
      {words.map((w, k) => {
        const p = spring({frame: f - at - k * 3, fps, config: {damping: 12, stiffness: 170, mass: 0.6}});
        return (
          <span key={k} style={{display: 'inline-block', whiteSpace: 'pre', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 42}px) rotate(${(1 - p) * -7}deg) scale(${0.78 + 0.22 * p})`}}>
            {w}
            {k < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

/** The underline painted with one pull of a flat brush, from the right (the start of the line in Arabic): a body
 * that swells and thins, a dry streak riding on it. `p` 0 → 1 paints it in. */
export const BrushUnderline: React.FC<{p: number; color: string; width?: number}> = ({p, color, width = 420}) => (
  <svg width={width} height={30} viewBox="0 0 420 30" style={{overflow: 'visible', clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`}}>
    <path d="M418 13 C 360 6, 240 7, 120 10 C 70 11, 30 12, 2 17 C 40 22, 130 21, 220 20 C 300 19, 380 21, 416 19 Z" fill={color} />
    <path d="M410 9 C 330 4, 200 5, 60 9" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.55} />
    <path d="M400 24 C 300 25, 180 24, 90 22" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.4} />
  </svg>
);
