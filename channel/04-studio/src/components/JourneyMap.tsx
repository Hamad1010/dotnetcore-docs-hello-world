// The journey map (framework v3 §1): every video is a road from "أنت هنا" to a destination, with the parts as stations.
// Drawn from plain shapes in our palette; the road starts on the right, like Arabic reading. Three shapes (framework
// v5.2): the winding road of EP001–EP002, a trail that climbs a mountain to the flag on its summit, and a staircase whose
// top step is the destination. Shorts (portrait) always use the winding road.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, watercolor} from '../theme';
import {ink, INK_SHADOW_SOFT, paperCard} from '../look-kit';
import {WashMountain} from './Watercolor';
import type {MapShape} from '../types';
import {Person} from './Silhouettes';

type Pt = {x: number; y: number};
export type MapStop = {label: string; shown: number; mark?: 'loop' | 'puzzle'; markShown?: number; markPulse?: number};

const SAMPLES = 28;
// the mountain: its summit (the destination) and how wide it is at its foot
const PEAK = {x: 960, y: 370};
const FOOT = {y: 1040, half: 760};
const mountainHalf = (y: number) => ((y - PEAK.y) / (FOOT.y - PEAK.y)) * FOOT.half;

const catmull = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return {x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y)};
};

/** Where the stops sit: a winding road from right to left (landscape) or top to bottom (portrait); switchbacks up the
 * mountain from its right foot to the summit; or one stop on each step of a staircase climbing to the left. */
const stopPoints = (count: number, portrait: boolean, shape: MapShape): Pt[] =>
  Array.from({length: count}, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    if (portrait) return {x: i % 2 ? 300 : 780, y: 430 + t * 1060};
    if (shape === 'mountain') {
      const y = 950 - t * (950 - PEAK.y);
      return {x: i === count - 1 ? PEAK.x : PEAK.x + (i % 2 ? -1 : 1) * 0.78 * mountainHalf(y), y};
    }
    if (shape === 'stairs') return {x: 1640 - t * 1380, y: 850 - t * 520};
    return {x: 1730 - t * 1540, y: i % 2 ? 450 : 720};
  });

const withLengths = (seg: Pt[]) => {
  const lens = [0];
  for (let k = 1; k < seg.length; k++) lens.push(lens[k - 1] + Math.hypot(seg[k].x - seg[k - 1].x, seg[k].y - seg[k - 1].y));
  return {seg, lens};
};

/** The road as one polyline per segment (stop i → stop i+1), so every stop sits exactly on it: a smooth curve, or for
 * the staircase a tread, a riser and the next tread. */
const sampleRoad = (pts: Pt[], stairs: boolean) =>
  pts.slice(0, -1).map((_, i) => {
    if (stairs) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      return withLengths([pts[i], {x: mx, y: pts[i].y}, {x: mx, y: pts[i + 1].y}, pts[i + 1]]);
    }
    const p0 = pts[Math.max(0, i - 1)];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    return withLengths(Array.from({length: SAMPLES + 1}, (__, k) => catmull(p0, pts[i], pts[i + 1], p3, k / SAMPLES)));
  });

/** Point and road distance at a position measured in stops (1.5 = halfway between stops 1 and 2). */
const locate = (road: ReturnType<typeof sampleRoad>, v: number) => {
  const i = Math.min(road.length - 1, Math.max(0, Math.floor(v)));
  const {seg, lens} = road[i];
  const want = Math.min(1, Math.max(0, v - i)) * lens[lens.length - 1];
  let k = 1;
  while (k < lens.length - 1 && lens[k] < want) k++;
  const span = lens[k] - lens[k - 1] || 1;
  const u = (want - lens[k - 1]) / span;
  const before = road.slice(0, i).reduce((a, r) => a + r.lens[r.lens.length - 1], 0);
  return {x: seg[k - 1].x + (seg[k].x - seg[k - 1].x) * u, y: seg[k - 1].y + (seg[k].y - seg[k - 1].y) * u, dist: before + want};
};

const Contours: React.FC<{w: number; h: number}> = ({w, h}) => (
  <g opacity={0.5}>
    {Array.from({length: 9}, (_, k) => {
      const y0 = (h / 9) * (k + 0.5);
      const d = Array.from({length: 25}, (__, j) => {
        const x = (w / 24) * j;
        const y = y0 + Math.sin(j * 0.55 + k * 1.7) * 26 + Math.sin(j * 0.21 + k) * 18;
        return `${j ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');
      return <path key={k} d={d} fill="none" stroke={C.graticule} strokeWidth={2} />;
    })}
  </g>
);

/** A mountain in our palette: two paler peaks behind, the main one shaded on its right, snow on the summit. */
const Mountain: React.FC = () => {
  const {x, y} = PEAK;
  const left = x - FOOT.half;
  const right = x + FOOT.half;
  // the snow line: a jagged edge about 110 px under the summit
  const snowY = y + 110;
  const snowHalf = mountainHalf(snowY);
  const snow = `M${x} ${y} L${x + snowHalf} ${snowY} L${x + snowHalf * 0.55} ${snowY - 22} L${x + snowHalf * 0.2} ${snowY + 8} L${x - snowHalf * 0.25} ${snowY - 18} L${x - snowHalf * 0.6} ${snowY + 6} L${x - snowHalf} ${snowY} Z`;
  return (
    <g>
      <defs>
        <linearGradient id="mountain-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D6E2F5" />
          <stop offset="1" stopColor="#EDF2FA" />
        </linearGradient>
      </defs>
      <path d={`M${left - 260} ${FOOT.y + 40} L${left + 180} ${y + 230} L${left + 520} ${FOOT.y + 40} Z`} fill="#E6EDF8" />
      <path d={`M${right - 480} ${FOOT.y + 40} L${right + 40} ${y + 160} L${right + 420} ${FOOT.y + 40} Z`} fill="#E6EDF8" />
      <path d={`M${left} ${FOOT.y} L${x} ${y} L${right} ${FOOT.y} Z`} fill="url(#mountain-fill)" stroke={C.landStroke} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${x} ${y} L${right} ${FOOT.y} L${x + 120} ${FOOT.y} L${x + 60} ${y + 420} L${x + 30} ${y + 180} Z`} fill={C.graticule} opacity={0.55} />
      <path d={snow} fill="#fff" />
    </g>
  );
};

/** The staircase's body under its steps, so the steps read as solid stairs. */
const StairBody: React.FC<{pts: Pt[]; h: number}> = ({pts, h}) => {
  const n = pts.length;
  const half = (pts[0].x - pts[n - 1].x) / (n - 1) / 2;
  let d = `M${pts[0].x + half} ${h} L${pts[0].x + half} ${pts[0].y}`;
  pts.forEach((p, i) => {
    const mx = i < n - 1 ? (p.x + pts[i + 1].x) / 2 : p.x - half;
    d += ` L${mx} ${p.y}`;
    if (i < n - 1) d += ` L${mx} ${pts[i + 1].y}`;
  });
  d += ` L${pts[n - 1].x - half} ${h} Z`;
  return (
    <g>
      <defs>
        <linearGradient id="stairs-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE6F7" />
          <stop offset="1" stopColor="#F0F4FB" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#stairs-fill)" stroke={C.landStroke} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

const Badge: React.FC<{kind: 'loop' | 'puzzle'; size: number}> = ({kind, size}) =>
  kind === 'loop' ? (
    <div style={{width: size, height: size, borderRadius: 99, background: C.yellow, color: C.ink, fontSize: size * 0.62, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: watercolor() ? INK_SHADOW_SOFT : '0 6px 16px rgba(201,138,0,0.35)'}}>
      ؟
    </div>
  ) : (
    <div style={{width: size, height: size, borderRadius: 99, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: watercolor() ? INK_SHADOW_SOFT : '0 6px 16px rgba(28,35,51,0.35)'}}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24">
        <circle cx="10" cy="10" r="6.5" fill="none" stroke="#fff" strokeWidth="2.6" />
        <path d="M15 15l6 6" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>
  );

export const JourneyMap: React.FC<{
  start: MapStop;
  stations: MapStop[];
  destination: MapStop;
  /** 0 → 1: how much of the road is drawn */
  reveal: number;
  /** 0 → 1: the whole route shown faintly as a dashed line (the road ahead, before it is told) */
  ghost?: number;
  /** a light travelling along the road, in stops (0 = start … stations + 1 = destination); null = none */
  glow?: number | null;
  /** where the traveller stands, in stops (0 = start … stations + 1 = destination) */
  traveller: number;
  /** which station is highlighted (1-based), 0 = none */
  active: number;
  portrait: boolean;
  shape?: MapShape;
}> = ({start, stations, destination, reveal, ghost = 0, glow = null, traveller, active, portrait, shape: wanted = 'wave'}) => {
  const f = useCurrentFrame();
  const W = portrait ? 1080 : 1920;
  const H = portrait ? 1920 : 1080;
  const shape: MapShape = portrait ? 'wave' : wanted;
  const stops = [start, ...stations, destination];
  const pts = stopPoints(stops.length, portrait, shape);
  const road = sampleRoad(pts, shape === 'stairs');
  const total = road.reduce((a, r) => a + r.lens[r.lens.length - 1], 0);
  const d = road.map((r, i) => r.seg.map((p, k) => `${i === 0 && k === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')).join(' ');
  const me = locate(road, traveller);
  const done = me.dist / total;
  const last = stops.length - 1;
  const wc = watercolor();
  const line = wc ? ink(0.9) : undefined;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="road-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1C2333" floodOpacity="0.16" />
          </filter>
        </defs>
        {wc ? null : <Contours w={W} h={H} />}
        {shape === 'mountain' ? (wc ? <WashMountain x={PEAK.x} y={PEAK.y} footY={FOOT.y} half={FOOT.half} snowHalf={mountainHalf(PEAK.y + 110)} /> : <Mountain />) : null}
        {shape === 'stairs' ? <StairBody pts={pts} h={H + 20} /> : null}
        {ghost > 0 ? <path d={d} fill="none" stroke={C.ink3} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={f * 1.2} opacity={0.45 * ghost} /> : null}
        {wc ? (
          <>
            {/* the road inked: a hard shadow down to the left, an ink edge, the paper road */}
            <path d={d} pathLength={1} fill="none" stroke={ink(0.14)} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${reveal} 2`} transform="translate(-8 10)" />
            <path d={d} pathLength={1} fill="none" stroke={ink(0.9)} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${reveal} 2`} />
            <path d={d} pathLength={1} fill="none" stroke="#FFF9EC" strokeWidth={39} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${reveal} 2`} />
          </>
        ) : (
          <>
            <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${reveal} 2`} filter="url(#road-shadow)" />
            <path d={d} pathLength={1} fill="none" stroke={C.ink3} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${reveal} 2`} opacity={0.35} />
          </>
        )}
        <path d={d} pathLength={1} fill="none" stroke={C.blue} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${Math.min(done, reveal)} 2`} />
        {glow !== null ? (
          <path d={d} pathLength={1} fill="none" stroke={C.yellow} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${locate(road, glow).dist / total} 2`} opacity={0.75} />
        ) : null}
        {stops.map((s, i) => {
          const p = pts[i];
          const sc = s.shown;
          if (sc <= 0) return null;
          if (i === 0) {
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
                <circle r={22} fill={C.red} opacity={0.18} />
                <circle r={11} fill={C.red} stroke={line} strokeWidth={line ? 3.5 : 0} />
              </g>
            );
          }
          if (i === last) {
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
                <circle r={26} fill={C.green} opacity={0.18} />
                <rect x={-3} y={-92} width={6} height={92} rx={3} fill={C.ink} />
                <path d="M3 -90 L60 -72 L3 -54 Z" fill={C.green} stroke={line} strokeWidth={line ? 3 : 0} strokeLinejoin="round" />
              </g>
            );
          }
          const on = i === active;
          return (
            <g key={i} transform={`translate(${p.x} ${p.y}) scale(${sc * (on ? 1.15 : 1)})`}>
              <circle r={34} fill={on || i < traveller ? C.blue : C.surface} stroke={line ?? C.blue} strokeWidth={wc ? 5 : 7} />
              <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={on || i < traveller ? '#fff' : C.blue}>
                {i}
              </text>
            </g>
          );
        })}
      </svg>
      {stops.map((s, i) => {
        if (s.shown <= 0) return null;
        const p = pts[i];
        const above = portrait ? false : p.y < 600;
        const edge = i === 0 || i === last;
        // The winding road: the start label hangs to the right edge's inside, the destination's to the left edge's
        // inside, the rest centre. The mountain: each label on the outer side of its switchback, the destination's
        // beside the flag. The staircase: each label on the front of its step, under the tread.
        const place: React.CSSProperties = portrait
          ? {...(p.x < 540 ? {left: p.x + 60} : {right: W - p.x + 60}), top: p.y, transform: `translateY(-50%) scale(${s.shown})`}
          : shape === 'mountain'
            ? i === last
              ? {left: p.x + 76, top: p.y - 78, transform: `translateY(-50%) scale(${s.shown})`}
              : {...(p.x > PEAK.x ? {left: p.x + 52} : {right: W - p.x + 52}), top: p.y, transform: `translateY(-50%) scale(${s.shown})`}
            : shape === 'stairs'
              ? {left: p.x, top: p.y + 44, transform: `translateX(-50%) scale(${s.shown})`}
              : {
                  ...(i === 0 ? {right: W - p.x - 46} : i === last ? {left: p.x - 46} : {left: p.x}),
                  top: above ? p.y - 62 : p.y + (i === 0 ? 40 : 56),
                  transform: `translate(${edge ? '0' : '-50%'}, ${above ? '-100%' : '0'}) scale(${s.shown})`,
                };
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                ...place,
                transformOrigin: 'center',
                direction: 'rtl',
                whiteSpace: 'pre',
                textAlign: 'center',
                lineHeight: 1.35,
                fontSize: edge ? 32 : 30,
                fontWeight: 700,
                color: i === 0 ? C.red : i === last ? (wc ? C.green : '#1F8A52') : C.ink,
                background: wc ? paperCard() : '#fff',
                padding: '10px 22px',
                borderRadius: s.label.includes('\n') ? 26 : 999,
                boxShadow: wc ? INK_SHADOW_SOFT : '0 2px 6px rgba(28,35,51,0.08), 0 10px 24px rgba(28,35,51,0.10)',
                opacity: Math.min(1, s.shown * 1.4),
              }}
            >
              {s.label}
            </div>
            {s.mark && (s.markShown ?? 1) > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: i === last ? p.x + 64 : p.x + 30,
                  top: i === last ? p.y - 112 : p.y - 64,
                  transform: `scale(${(s.markShown ?? 1) * (1 + 0.25 * (s.markPulse ?? 0))})`,
                }}
              >
                <Badge kind={s.mark} size={56} />
                {s.mark === 'puzzle' ? (
                  <div style={{position: 'absolute', left: 68, top: 6, whiteSpace: 'nowrap', direction: 'rtl', fontSize: 28, fontWeight: 700, color: '#fff', background: C.ink, borderRadius: 999, padding: '6px 20px'}}>لغز الحلقة</div>
                ) : null}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      {glow !== null ? (
        (() => {
          const g = locate(road, glow);
          return <div style={{position: 'absolute', left: g.x - 60, top: g.y - 60, width: 120, height: 120, borderRadius: 99, background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(245,183,36,0.95) 22%, rgba(245,183,36,0.4) 48%, rgba(245,183,36,0) 70%)'}} />;
        })()
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: me.x - 38,
          top: me.y - 128,
          filter: wc ? 'drop-shadow(-6px 8px 0 rgba(38,41,74,0.18))' : 'drop-shadow(0 14px 16px rgba(28,35,51,0.30))',
          opacity: Math.min(1, start.shown * 1.5),
        }}
      >
        <Person size={106} color={C.ink} />
      </div>
    </div>
  );
};
