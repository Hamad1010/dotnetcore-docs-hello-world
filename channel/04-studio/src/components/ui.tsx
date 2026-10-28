import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE_IN, EASE_OUT, FONT, SHADOW, SHADOW_SOFT, watercolor} from '../theme';
import {paperCard} from '../look-kit';
import {WashBackdrop} from './Watercolor';
import {useFrameSize} from './frame';

// ---------- motion helpers ----------

/** 0 → 1 over `dur` frames starting at `delay` (material "emphasized decelerate"). */
export const useIn = (delay = 0, dur = 18) => {
  const f = useCurrentFrame();
  return interpolate(f, [delay, delay + dur], [0, 1], {easing: EASE_OUT, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

export const usePop = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 140, mass: 0.7}});
};

export const fadeUp = (p: number, dist = 36): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

/** Scene-level enter/exit envelope so scenes blend into each other. */
export const SceneFrame: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 14], [0, 1], {easing: EASE_OUT, extrapolateRight: 'clamp'});
  const exit = interpolate(f, [frames - 12, frames], [1, 0], {easing: EASE_IN, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = Math.min(enter, exit);
  return (
    <AbsoluteFill style={{opacity: o, transform: `scale(${0.985 + 0.015 * o})`, direction: 'rtl', fontFamily: FONT, color: C.ink}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- building blocks ----------

export const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode; soft?: boolean}> = ({style, children, soft}) => (
  <div style={{background: paperCard(), borderRadius: 36, boxShadow: soft ? SHADOW_SOFT : SHADOW, ...style}}>{children}</div>
);

export const Chip: React.FC<{color?: string; bg?: string; children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({
  color = C.ink2,
  bg = C.surface,
  children,
  size = 28,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: `${size * 0.32}px ${size * 0.8}px`,
      borderRadius: 999,
      background: bg === C.surface ? paperCard() : bg,
      color,
      fontSize: size,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      boxShadow: bg === C.surface || watercolor() ? SHADOW_SOFT : 'none',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Dot: React.FC<{color: string; size?: number}> = ({color, size = 14}) => (
  <span style={{display: 'inline-block', width: size, height: size, borderRadius: 999, background: color}} />
);

/** Our own mark: a speech bubble with a heart (conversation + kindness). */
export const BrandMark: React.FC<{size?: number}> = ({size = 64}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M14 8h36a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H30l-12 10v-10h-4A10 10 0 0 1 4 38V18A10 10 0 0 1 14 8z" fill={C.blue} />
    <path
      d="M32 40c-7-5-12-9-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 5-5 9-12 14z"
      fill={C.surface}
    />
    <circle cx="50" cy="16" r="4" fill={C.yellow} />
  </svg>
);

export const Brand: React.FC<{name: string; size?: number; color?: string}> = ({name, size = 30, color = C.ink}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: size, fontWeight: 700, color}}>
    <BrandMark size={size * 1.6} />
    <span>{name}</span>
  </div>
);

/** Soft, slowly drifting color blobs + dot grid. Gives depth without noise. */
export const Backdrop: React.FC<{tint?: string}> = ({tint = C.blue}) => {
  const f = useCurrentFrame();
  if (watercolor()) return <WashBackdrop />;
  const t = f / 30;
  const blob = (x: number, y: number, r: number, color: string, phase: number): React.CSSProperties => ({
    position: 'absolute',
    left: x + Math.sin(t * 0.25 + phase) * 40,
    top: y + Math.cos(t * 0.2 + phase) * 30,
    width: r,
    height: r,
    borderRadius: '50%',
    background: color,
    opacity: 0.1,
    filter: 'blur(60px)',
  });
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={blob(-120, -160, 620, tint, 0)} />
      <div style={blob(1420, 640, 640, C.yellow, 2)} />
      <div style={blob(1500, -200, 420, C.green, 4)} />
      <div style={blob(-100, 760, 420, C.red, 1)} />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.line} 1.6px, transparent 1.6px)`,
          backgroundSize: '36px 36px',
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

/** Animates the numeric part of a stat value: "1987", "2-1", "10", "150". */
export const CountUp: React.FC<{value: string; delay?: number; dur?: number}> = ({value, delay = 0, dur = 28}) => {
  const p = useIn(delay, dur);
  if (!/^\d+$/.test(value)) return <span>{value}</span>;
  const target = parseInt(value, 10);
  // years count from a nearby value, other numbers from 0
  const start = target > 1900 && target < 2100 ? target - 40 : 0;
  const n = Math.round(start + (target - start) * p);
  return <span>{n}</span>;
};

/** True for vertical (Shorts) compositions. */
export const usePortrait = () => {
  const {width, height} = useFrameSize();
  return height > width;
};

export const Captions: React.FC<{captions: {text: string; start: number; end: number}[]; bottom?: number}> = ({captions, bottom}) => {
  const f = useCurrentFrame();
  const portrait = usePortrait();
  // Shorts: keep captions above the app's bottom UI and away from the right-side buttons
  const pos = bottom ?? (portrait ? 340 : 56);
  const cur = captions.find((c) => f >= c.start && f < c.end);
  if (!cur) return null;
  const p = interpolate(f, [cur.start, cur.start + 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: portrait ? 60 : 0, right: portrait ? 140 : 0, bottom: pos, display: 'flex', justifyContent: 'center', direction: 'rtl'}}>
      <div
        style={{
          maxWidth: portrait ? 880 : 1500,
          padding: '16px 34px',
          borderRadius: 26,
          background: 'rgba(28,35,51,0.86)',
          color: '#fff',
          fontSize: portrait ? 46 : 40,
          fontWeight: 500,
          lineHeight: 1.45,
          textAlign: 'center',
          opacity: p,
          transform: `translateY(${(1 - p) * 10}px)`,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};

/** Tiny line icons (drawn for this project, no external icon set needed). */
export const Icon: React.FC<{name: 'doc' | 'globe' | 'heart' | 'check' | 'bell' | 'play' | 'comment'; size?: number; color?: string}> = ({
  name,
  size = 30,
  color = 'currentColor',
}) => {
  const common = {fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{flex: `0 0 ${size}px`}}>
      {name === 'doc' ? (
        <>
          <path d="M6 3h8l4 4v14H6z" {...common} />
          <path d="M14 3v4h4M9 12h6M9 16h6" {...common} />
        </>
      ) : null}
      {name === 'globe' ? (
        <>
          <circle cx="12" cy="12" r="9" {...common} />
          <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" {...common} />
        </>
      ) : null}
      {name === 'heart' ? <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill={color} /> : null}
      {name === 'check' ? <path d="M5 12.5l4.5 4.5L19 7.5" {...common} strokeWidth={3} /> : null}
      {name === 'bell' ? (
        <>
          <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" {...common} />
          <path d="M10 20a2 2 0 0 0 4 0" {...common} />
        </>
      ) : null}
      {name === 'play' ? <path d="M8 5l11 7-11 7z" fill={color} /> : null}
      {name === 'comment' ? <path d="M4 5h16v10H10l-5 4v-4H4z" {...common} /> : null}
    </svg>
  );
};

/** Loading-style placeholder with a moving shimmer (shown until content pops in). */
export const Skeleton: React.FC<{show: number; lines: number[]; inline?: boolean}> = ({show, lines, inline}) => {
  const f = useCurrentFrame();
  if (show <= 0.01) return null;
  const x = ((f * 14) % 1400) - 400;
  return (
    <div
      style={{
        position: 'absolute',
        inset: inline ? '4px 0' : 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        justifyContent: 'center',
        opacity: show,
        overflow: 'hidden',
        borderRadius: 14,
      }}
    >
      {lines.map((w, i) => (
        <div key={i} style={{height: inline ? 30 : 26, width: `${w * 100}%`, borderRadius: 10, background: C.line, position: 'relative', overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 260,
              left: x,
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
        </div>
      ))}
    </div>
  );
};
