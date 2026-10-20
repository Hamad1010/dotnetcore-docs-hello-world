// The journey map (framework v3 §1): every video is a road from "أنت هنا" to a destination, with the parts as stations.
// Drawn from plain shapes in our palette; the road starts on the right, like Arabic reading.
import React from 'react';
import {C, FONT} from '../theme';
import {Person} from './Silhouettes';

type Pt = {x: number; y: number};
export type MapStop = {label: string; shown: number; mark?: 'loop' | 'puzzle'; markShown?: number; markPulse?: number};

const SAMPLES = 28;

const catmull = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return {x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y)};
};

/** Where the stops sit: a winding road from right to left (landscape) or top to bottom (portrait). */
const stopPoints = (count: number, portrait: boolean): Pt[] =>
  Array.from({length: count}, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    return portrait ? {x: i % 2 ? 300 : 780, y: 430 + t * 1060} : {x: 1730 - t * 1540, y: i % 2 ? 450 : 720};
  });

/** The road as one polyline per segment (stop i → stop i+1), so every stop sits exactly on it. */
const sampleRoad = (pts: Pt[]) =>
  pts.slice(0, -1).map((_, i) => {
    const p0 = pts[Math.max(0, i - 1)];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const seg = Array.from({length: SAMPLES + 1}, (__, k) => catmull(p0, pts[i], pts[i + 1], p3, k / SAMPLES));
    const lens = [0];
    for (let k = 1; k < seg.length; k++) lens.push(lens[k - 1] + Math.hypot(seg[k].x - seg[k - 1].x, seg[k].y - seg[k - 1].y));
    return {seg, lens};
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

const Badge: React.FC<{kind: 'loop' | 'puzzle'; size: number}> = ({kind, size}) =>
  kind === 'loop' ? (
    <div style={{width: size, height: size, borderRadius: 99, background: C.yellow, color: C.ink, fontSize: size * 0.62, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(201,138,0,0.35)'}}>
      ؟
    </div>
  ) : (
    <div style={{width: size, height: size, borderRadius: 99, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(28,35,51,0.35)'}}>
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
  /** where the traveller stands, in stops (0 = start … stations + 1 = destination) */
  traveller: number;
  /** which station is highlighted (1-based), 0 = none */
  active: number;
  portrait: boolean;
}> = ({start, stations, destination, reveal, traveller, active, portrait}) => {
  const W = portrait ? 1080 : 1920;
  const H = portrait ? 1920 : 1080;
  const stops = [start, ...stations, destination];
  const pts = stopPoints(stops.length, portrait);
  const road = sampleRoad(pts);
  const total = road.reduce((a, r) => a + r.lens[r.lens.length - 1], 0);
  const d = road.map((r, i) => r.seg.map((p, k) => `${i === 0 && k === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')).join(' ');
  const me = locate(road, traveller);
  const done = me.dist / total;
  const last = stops.length - 1;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="road-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1C2333" floodOpacity="0.16" />
          </filter>
        </defs>
        <Contours w={W} h={H} />
        <path d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${reveal} 2`} filter="url(#road-shadow)" />
        <path d={d} pathLength={1} fill="none" stroke={C.ink3} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${reveal} 2`} opacity={0.35} />
        <path d={d} pathLength={1} fill="none" stroke={C.blue} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${Math.min(done, reveal)} 2`} />
        {stops.map((s, i) => {
          const p = pts[i];
          const sc = s.shown;
          if (sc <= 0) return null;
          if (i === 0) {
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
                <circle r={22} fill={C.red} opacity={0.18} />
                <circle r={11} fill={C.red} />
              </g>
            );
          }
          if (i === last) {
            return (
              <g key={i} transform={`translate(${p.x} ${p.y}) scale(${sc})`}>
                <circle r={26} fill={C.green} opacity={0.18} />
                <rect x={-3} y={-92} width={6} height={92} rx={3} fill={C.ink} />
                <path d="M3 -90 L60 -72 L3 -54 Z" fill={C.green} />
              </g>
            );
          }
          const on = i === active;
          return (
            <g key={i} transform={`translate(${p.x} ${p.y}) scale(${sc * (on ? 1.15 : 1)})`}>
              <circle r={34} fill={on || i < traveller ? C.blue : '#fff'} stroke={C.blue} strokeWidth={7} />
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
        // The start label hangs to the right edge's inside, the destination's to the left edge's inside, the rest centre.
        const place: React.CSSProperties = portrait
          ? {...(p.x < 540 ? {left: p.x + 60} : {right: W - p.x + 60}), top: p.y, transform: `translateY(-50%) scale(${s.shown})`}
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
                color: i === 0 ? C.red : i === last ? '#1F8A52' : C.ink,
                background: '#fff',
                padding: '10px 22px',
                borderRadius: s.label.includes('\n') ? 26 : 999,
                boxShadow: '0 2px 6px rgba(28,35,51,0.08), 0 10px 24px rgba(28,35,51,0.10)',
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
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: me.x - 38,
          top: me.y - 128,
          filter: 'drop-shadow(0 14px 16px rgba(28,35,51,0.30))',
          opacity: Math.min(1, start.shown * 1.5),
        }}
      >
        <Person size={106} color={C.ink} />
      </div>
    </div>
  );
};
