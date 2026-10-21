// Shared pieces of the explainer moments (Moments.tsx, MomentKinds.tsx): tones, the card look, timing helpers.
import React from 'react';
import {interpolate} from 'remotion';
import {C, EASE_OUT, FONT} from '../theme';
import type {Tone} from '../types';
import {Person} from './Silhouettes';

export const TONE: Record<Tone, {main: string; soft: string}> = {
  neg: {main: C.red, soft: C.redSoft},
  pos: {main: C.green, soft: C.greenSoft},
  accent: {main: C.blue, soft: C.blueSoft},
  gold: {main: '#C98A00', soft: C.yellowSoft},
};
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const DEEP = '0 2px 6px rgba(28,35,51,0.08), 0 30px 60px rgba(28,35,51,0.18)';
export const CARD: React.CSSProperties = {background: C.surface, borderRadius: 32, boxShadow: DEEP, direction: 'rtl', fontFamily: FONT, color: C.ink};
export const LTR: React.CSSProperties = {direction: 'ltr', unicodeBidi: 'isolate'};
/** 0 → 1 over `dur` frames from frame `at`; stays 0 when `at` never comes (Infinity). */
export const ramp = (f: number, at: number, dur: number, easing = EASE_OUT) => (Number.isFinite(at) ? interpolate(f, [at, at + dur], [0, 1], {...clamp, easing}) : 0);

export type Clock = {f: number; inAt: number; at: (cue: string | undefined, fallback?: number) => number};

/** The leading number of a value ("37 سنة", "+2000", "−75%") counted up from 0 as `p` goes 0 → 1. */
export const counted = (value: string, p: number) => {
  const m = value.match(/^([+\-−×]?)(\d+)(.*)$/s);
  if (!m) return value;
  const target = parseInt(m[2], 10);
  const start = target > 1900 && target < 2100 ? target - 30 : 0;
  return `${m[1]}${Math.round(start + (target - start) * p)}${m[3]}`;
};

/** Left-to-right only for a bare number ("+2000", "−75%"); a number with Arabic words ("745 ألف") reads right-to-left. */
export const numDir = (value: string): React.CSSProperties => (/[\u0600-\u06FF]/.test(value) ? {} : LTR);

export const Avatar: React.FC<{icon: 'person' | 'pair' | 'building' | 'chat' | 'camera'; size: number; tone: {main: string; soft: string}}> = ({icon, size, tone}) => (
  <div style={{width: size, height: size, borderRadius: 999, background: tone.soft, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', flex: `0 0 ${size}px`}}>
    {icon === 'person' ? <Person size={size * 0.86} color={C.ink} /> : null}
    {icon === 'pair' ? (
      <div style={{display: 'flex', alignItems: 'flex-end', marginBottom: -2}}>
        <Person size={size * 0.62} color={C.ink} />
        <Person size={size * 0.74} color={tone.main} style={{marginRight: -size * 0.18}} />
      </div>
    ) : null}
    {icon === 'building' ? (
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" style={{marginBottom: size * 0.19}}>
        <rect x="4" y="3" width="16" height="19" rx="2" fill={C.ink} />
        {[0, 1, 2, 3].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={7.5 + c * 6} y={6 + r * 3.6} width="3" height="2" rx="0.5" fill="#fff" opacity={0.7} />))}
        <rect x="10.5" y="18" width="3" height="4" fill={tone.main} />
      </svg>
    ) : null}
    {icon === 'camera' ? (
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" style={{marginBottom: size * 0.19}}>
        <rect x="2" y="6" width="20" height="15" rx="4" fill={tone.main} />
        <rect x="8" y="3" width="8" height="4" rx="1.5" fill={tone.main} />
        <circle cx="12" cy="13.5" r="4.6" fill="#fff" />
        <circle cx="12" cy="13.5" r="2.6" fill={C.ink} />
      </svg>
    ) : null}
    {icon === 'chat' ? (
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" style={{marginBottom: size * 0.2}}>
        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" fill={tone.main} />
        <path d="M8 10.5h8M8 13.5h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ) : null}
  </div>
);

