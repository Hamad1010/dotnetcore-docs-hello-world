// Shared artwork for the channel's avatars, banners and thumbnails (src/Avatars.tsx, Banners.tsx, ThumbDesigns.tsx):
// the host as a shadow figure with round glasses, and a few icons. Plain shapes in our palette: no photos, no faces,
// nobody else's logo, and nothing that copies a Google mark (the look is Material-like, the shapes are ours).
import React from 'react';
import {C} from './theme';

export const NAVY = '#121A2B';
export const NAVY2 = '#1B2540';
export const SKY = '#DCE7F8';

/** The host: head, ears, shoulders as one solid shadow, with round glasses as the only detail (a 200 × 220 box). */
export const HostGlyph: React.FC<{body?: string; glass?: string; lens?: string; glint?: string; rim?: string; rimOffset?: [number, number]; glow?: string; bleed?: number}> = ({
  body = C.ink,
  glass = '#FFFFFF',
  lens = 'rgba(255,255,255,0.05)',
  glint = '#FFFFFF',
  rim,
  rimOffset = [7, -6],
  glow,
  bleed = 0,
}) => {
  const silhouette = (fill: string) => (
    <g fill={fill}>
      <path d={`M6 ${220 + bleed} L6 220 C6 182 34 162 74 154 L126 154 C166 162 194 182 194 220 L194 ${220 + bleed} Z`} />
      <path d="M80 118 L80 160 C80 168 92 172 100 172 C108 172 120 168 120 160 L120 118 Z" />
      <ellipse cx="60" cy="96" rx="7" ry="12" />
      <ellipse cx="140" cy="96" rx="7" ry="12" />
      <path d="M100 44 C128 44 142 66 142 94 C142 118 132 138 114 144 L86 144 C68 138 58 118 58 94 C58 66 72 44 100 44 Z" />
      <path d="M56 92 C47 50 72 20 106 23 C136 26 152 52 144 92 C140 70 124 56 100 56 C76 56 60 70 56 92 Z" />
    </g>
  );
  return (
    <g>
      {rim ? <g transform={`translate(${rimOffset[0]} ${rimOffset[1]})`}>{silhouette(rim)}</g> : null}
      {silhouette(body)}
      <path d="M80 156 L100 190 L120 156 L111 153 L100 172 L89 153 Z" fill="#fff" opacity="0.16" />
      <g fill="none" stroke={glass} strokeWidth="5.5" strokeLinecap="round" style={glow ? {filter: `drop-shadow(0 0 5px ${glow})`} : undefined}>
        <circle cx="79" cy="94" r="16" fill={lens} />
        <circle cx="121" cy="94" r="16" fill={lens} />
        <path d="M95 92 C98 86 102 86 105 92" />
        <path d="M63.5 91 L56 88" />
        <path d="M136.5 91 L144 88" />
      </g>
      <g fill="none" stroke={glint} strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <path d="M69 88 A11 11 0 0 1 77 82" />
        <path d="M111 88 A11 11 0 0 1 119 82" />
      </g>
    </g>
  );
};

/** The host as a stand-alone picture; `width` is the rendered width (height = 1.1 × width). */
export const HostMark: React.FC<{width?: number; style?: React.CSSProperties} & React.ComponentProps<typeof HostGlyph>> = ({width = 400, style, ...rest}) => (
  <svg width={width} height={width * 1.1} viewBox="0 0 200 220" style={{overflow: 'visible', ...style}}>
    <HostGlyph {...rest} />
  </svg>
);

/** A door ajar with light spilling out: the "room" in «غرفة الفرص» (a 200 × 240 box). */
export const DoorGlyph: React.FC<{frame?: string; light?: string; leaf?: string; glow?: string}> = ({frame = '#FFFFFF', light = C.yellow, leaf = C.ink, glow = '#FCE29A'}) => (
  <g>
    <polygon points="48,222 152,222 196,240 4,240" fill={glow} opacity="0.85" />
    <path d="M44 232 V70 a56 56 0 0 1 112 0 V232 Z" fill={frame} />
    <path d="M54 232 V72 a46 46 0 0 1 92 0 V232 Z" fill={light} />
    <path d="M54 232 V72 a46 46 0 0 1 46 -44 L124 40 V222 Z" fill={leaf} />
    <circle cx="112" cy="136" r="5" fill={light} />
  </g>
);

/** An 8-point star (two squares), the Arabic geometric motif: used as a quiet pattern. */
export const Star8: React.FC<{cx: number; cy: number; r: number; fill?: string; opacity?: number}> = ({cx, cy, r, fill = '#fff', opacity = 1}) => (
  <g transform={`translate(${cx} ${cy})`} fill={fill} opacity={opacity}>
    <rect x={-r} y={-r} width={2 * r} height={2 * r} />
    <rect x={-r} y={-r} width={2 * r} height={2 * r} transform="rotate(45)" />
  </g>
);

/** A padlock (a 100 × 120 box). */
export const Padlock: React.FC<{body?: string; shackle?: string}> = ({body = C.red, shackle = C.ink}) => (
  <g>
    <path d="M26 54 V38 a24 24 0 0 1 48 0 V54" fill="none" stroke={shackle} strokeWidth="11" strokeLinecap="round" />
    <rect x="8" y="50" width="84" height="64" rx="14" fill={body} />
    <circle cx="50" cy="78" r="9" fill="#fff" />
    <rect x="46" y="82" width="8" height="18" rx="4" fill="#fff" />
  </g>
);

/** A tiny house shadow (a 120 × 110 box). */
export const HouseGlyph: React.FC<{fill?: string; door?: string}> = ({fill = C.ink, door = C.yellow}) => (
  <g>
    <path d="M10 56 L60 10 L110 56 Z" fill={fill} />
    <rect x="22" y="52" width="76" height="56" fill={fill} />
    <rect x="50" y="74" width="20" height="34" rx="3" fill={door} />
  </g>
);
