// Silhouettes ("shadows" of places, people and things) drawn for this project.
// Plain shapes only: no photos, no faces, no logos, so they are safe in every video.
import React from 'react';
import {C} from '../theme';

type Base = {color?: string; opacity?: number; style?: React.CSSProperties};

const HEAD = {cx: 36, cy: 22, r: 17};
const BODY = 'M2 100 C2 64 16 46 36 46 C56 46 70 64 70 100 Z';

/** One person (head and shoulders). `size` is the height in px. */
export const Person: React.FC<Base & {size?: number}> = ({size = 300, color = C.ink, opacity = 1, style}) => (
  <svg width={size * 0.72} height={size} viewBox="0 0 72 100" style={{opacity, overflow: 'visible', ...style}}>
    <circle {...HEAD} fill={color} />
    <path d={BODY} fill={color} />
  </svg>
);

/** A small team: `count` people in a grid that fills in from the right as `progress` goes 0 → 1.
 * `highlight` (0 → 1) lights up the first person and dims the rest ("each one of them…"). */
export const PeopleGrid: React.FC<
  Base & {count: number; cols: number; cell?: number; progress?: number; highlight?: number; highlightColor?: string; subs?: number; fade?: number; fadeProgress?: number}
> = ({count, cols, cell = 30, progress = 1, highlight = 0, highlightColor = C.yellow, subs = 0, fade = 0, fadeProgress = 0, color = C.blue, opacity = 1, style}) => {
  const rows = Math.ceil(count / cols);
  const shown = Math.round(count * progress);
  return (
    <svg width={cols * cell} height={rows * cell * 1.25} viewBox={`0 0 ${cols * 72} ${rows * 90}`} style={{opacity, overflow: 'visible', ...style}}>
      {Array.from({length: count}, (_, i) => {
        const x = (cols - 1 - (i % cols)) * 72; // right to left, like Arabic reading
        const y = Math.floor(i / cols) * 90;
        const lit = i === 0 ? highlight : 0;
        const gone = i >= count - fade ? fadeProgress : 0;
        const fill = lit > 0.5 ? highlightColor : i >= count - subs ? highlightColor : color;
        return (
          <g key={i} transform={`translate(${x + 8 + 28} ${y + 4 + 39}) scale(${0.78 * (1 + 0.45 * lit)}) translate(-36 -50)`} opacity={(i < shown ? 1 : 0.12) * (i === 0 ? 1 : 1 - 0.7 * highlight) * (1 - 0.75 * gone)}>
            {lit > 0 ? <circle cx={36} cy={50} r={58} fill={highlightColor} opacity={0.25 * lit} /> : null}
            <circle {...HEAD} fill={fill} />
            <path d={BODY} fill={fill} />
            {gone > 0 ? <path d={`M8 12 L${8 + 56 * gone} ${12 + 76 * gone} M64 12 L${64 - 56 * gone} ${12 + 76 * gone}`} stroke={C.red} strokeWidth={9} strokeLinecap="round" /> : null}
          </g>
        );
      })}
    </svg>
  );
};

/** A huge crowd (a dense pattern of tiny people) revealed from the right as `reveal` goes 0 → 1. */
export const Crowd: React.FC<Base & {id: string; width: number; height: number; reveal?: number}> = ({
  id,
  width,
  height,
  reveal = 1,
  color = C.ink,
  opacity = 1,
  style,
}) => (
  <svg width={width} height={height} style={{opacity, ...style}}>
    <defs>
      <pattern id={`crowd-${id}`} width="18" height="22" patternUnits="userSpaceOnUse">
        <circle cx="9" cy="6" r="4" fill={color} />
        <path d="M2 22 C2 14 5 11 9 11 C13 11 16 14 16 22 Z" fill={color} />
      </pattern>
      <linearGradient id={`crowd-fade-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id={`crowd-mask-${id}`}>
        <rect width={width} height={height} fill={`url(#crowd-fade-${id})`} />
      </mask>
    </defs>
    <rect x={width * (1 - reveal)} y="0" width={width * reveal} height={height} fill={`url(#crowd-${id})`} mask={`url(#crowd-mask-${id})`} />
  </svg>
);

/** A phone with chat bubbles; `bubbles` (0–3) fades them in one by one. */
export const Phone: React.FC<Base & {size?: number; bubbles?: number}> = ({size = 260, color = C.ink, opacity = 1, bubbles = 3, style}) => (
  <svg width={size * 0.52} height={size} viewBox="0 0 52 100" style={{opacity, ...style}}>
    <rect x="1" y="1" width="50" height="98" rx="9" fill={color} />
    <rect x="5" y="9" width="42" height="80" rx="3" fill="#fff" opacity="0.16" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={i % 2 ? 9 : 19} y={18 + i * 16} width="24" height="10" rx="5" fill="#fff" opacity={0.6 * Math.max(0, Math.min(1, bubbles - i))} />
    ))}
  </svg>
);

/** A city skyline with lit windows. Deterministic, so every render looks the same. */
export const Skyline: React.FC<Base & {width: number; height: number; seed?: number}> = ({width, height, seed = 7, color = C.ink, opacity = 1, style}) => {
  const rand = (i: number) => {
    const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const buildings: {x: number; w: number; h: number}[] = [];
  for (let x = 0, i = 0; x < width; i++) {
    const w = 70 + rand(i) * 120;
    buildings.push({x, w, h: height * (0.35 + rand(i + 99) * 0.65)});
    x += w + 8;
  }
  return (
    <svg width={width} height={height} style={{opacity, ...style}}>
      {buildings.map((b, k) => (
        <g key={k}>
          <rect x={b.x} y={height - b.h} width={b.w} height={b.h} rx="4" fill={color} />
          {Array.from({length: Math.max(0, Math.floor((b.h - 30) / 36))}, (_, r) =>
            Array.from({length: Math.max(0, Math.floor((b.w - 16) / 28))}, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 12 + c * 28}
                y={height - b.h + 18 + r * 36}
                width="12"
                height="16"
                rx="2"
                fill="#fff"
                opacity={rand(k * 31 + r * 7 + c) > 0.55 ? 0.4 : 0.1}
              />
            )),
          )}
        </g>
      ))}
    </svg>
  );
};

/**
 * A lever on a fulcrum: a small weight on the long arm lifts a big weight on the short arm.
 * `tilt` 0 → 1 moves from "load down" to "load lifted".
 */
export const Lever: React.FC<Base & {width?: number; tilt?: number; accent?: string}> = ({
  width = 520,
  tilt = 1,
  color = C.ink,
  accent = C.blue,
  opacity = 1,
  style,
}) => {
  const angle = -9 + 19 * tilt;
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 200 100" style={{opacity, overflow: 'visible', ...style}}>
      <rect x="0" y="96" width="200" height="4" rx="2" fill={color} opacity="0.25" />
      <polygon points="60,62 44,96 76,96" fill={color} />
      <g transform={`rotate(${angle} 60 62)`}>
        <rect x="6" y="56" width="188" height="6" rx="3" fill={color} />
        <rect x="12" y="22" width="40" height="34" rx="4" fill={color} opacity="0.85" />
        <rect x="170" y="42" width="18" height="14" rx="3" fill={accent} />
      </g>
    </svg>
  );
};
