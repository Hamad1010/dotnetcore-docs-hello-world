// Season 2's map (framework v6 §1, the owner's choice of 10 Nov 2026): a corridor of doors in one-point perspective,
// painted in the aquarelle look. Every story is a door on a side wall (the first on the right, as Arabic reads), the far
// door is the room the episode promised, and the viewer stands at the near end. As the traveller moves on, the view
// walks down the corridor toward the next door, which opens with warm light; the doors already passed stay ajar.
import React from 'react';
import {Img, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {deckle, ink, LIFT, paperCard, POOLED, texture} from '../look-kit';
import type {MapStop} from './JourneyMap';
import {Person} from './Silhouettes';

const W = 1920;
const H = 1080;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// the far wall (the room's door is on it) and the depth scale: a door at world depth z sits at t(z) on the walls
const FAR = {l: 800, r: 1120, t: 360, b: 730};
const D = 2.2;
const DOOR_Z = (k: number) => 0.55 + k * 1.15;
const DOOR_W = 0.75;
const DOOR_H = 0.68;
// door paint, one pigment each: vermilion, ultramarine, sap green, gamboge, violet, plum
const PAINT = ['#D9573F', '#3A78C2', '#3C9660', '#E0A23A', '#8E6BB8', '#B85C7A'];

type Pt = {x: number; y: number};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A point on a side wall: depth t (0 = the near edge of the frame, 1 = the far wall), height h (0 = floor, 1 = ceiling). */
const wallPt = (side: 'l' | 'r', t: number, h: number): Pt => {
  const x = side === 'l' ? lerp(0, FAR.l, t) : lerp(W, FAR.r, t);
  const top = lerp(0, FAR.t, t);
  const bottom = lerp(H, FAR.b, t);
  return {x, y: bottom - (bottom - top) * h};
};
const poly = (pts: Pt[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** A paper tag on the corridor (a door's name, «أنت هنا», the room). */
const Tag: React.FC<{x: number; y: number; size: number; shown: number; tone?: string; children: React.ReactNode}> = ({x, y, size, shown, tone, children}) =>
  shown > 0 ? (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) translateY(${(1 - shown) * 14}px)`, opacity: shown, filter: LIFT}}>
      <div
        style={{
          fontFamily: FONT,
          direction: 'rtl',
          whiteSpace: 'pre',
          textAlign: 'center',
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.3,
          color: tone ?? C.ink,
          background: paperCard(),
          boxShadow: POOLED,
          borderRadius: 12,
          padding: `${size * 0.35}px ${size * 0.8}px ${size * 0.45}px`,
          ...deckle(Math.max(18, size * 0.7)),
        }}
      >
        {children}
      </div>
    </div>
  ) : null;

export const DoorsCorridor: React.FC<{
  start: MapStop;
  stations: MapStop[];
  destination: MapStop;
  /** 0 → 1: how much of the corridor is drawn (the runner on the floor unrolls with it) */
  reveal: number;
  /** a light running down the runner, in stops; null = none */
  glow?: number | null;
  /** where the traveller stands, in stops (0 = the near end … stations + 1 = the room) */
  traveller: number;
  /** which door is highlighted (1-based), 0 = none */
  active: number;
}> = ({start, stations, destination, reveal, glow = null, traveller, active}) => {
  const f = useCurrentFrame();
  const n = stations.length;
  const zEnd = DOOR_Z(n - 1) + DOOR_W + 0.9;
  const tOf = (z: number) => z / (z + D) / (zEnd / (zEnd + D));
  const doors = stations.map((s, k) => {
    const side: 'l' | 'r' = k % 2 ? 'l' : 'r';
    const t1 = tOf(DOOR_Z(k));
    const t2 = tOf(DOOR_Z(k) + DOOR_W);
    const frame = [wallPt(side, t1, 0), wallPt(side, t2, 0), wallPt(side, t2, DOOR_H), wallPt(side, t1, DOOR_H)];
    const cx = (frame[0].x + frame[1].x) / 2;
    const top = (frame[2].y + frame[3].y) / 2;
    const bottom = (frame[0].y + frame[1].y) / 2;
    // opens as the traveller arrives (from stop k to stop k + 1), and stays ajar after
    const open = interpolate(traveller, [k + 0.35, k + 1], [0, 1], {...clamp});
    const leafT2 = lerp(t2, t1 + (t2 - t1) * 0.18, open);
    const leaf = [wallPt(side, t1, 0), wallPt(side, leafT2, 0), wallPt(side, leafT2, DOOR_H * (1 - 0.04 * open)), wallPt(side, t1, DOOR_H)];
    return {s, k, side, t1, t2, frame, leaf, cx, top, bottom, open, height: bottom - top};
  });
  // the far door: the room
  const fd = {l: 905, r: 1015, t: 500, b: FAR.b};
  const roomOpen = interpolate(traveller, [n + 0.3, n + 1], [0, 1], clamp);

  // the camera: at the near end the whole corridor; at a door, closer and turned toward it; at the room, close to it
  const camAt = (stop: number) => {
    if (stop <= 0) return {s: 1, x: W / 2, y: H / 2};
    if (stop >= n + 1) return {s: 1.85, x: (fd.l + fd.r) / 2, y: (fd.t + fd.b) / 2 + 10};
    const d = doors[Math.min(n - 1, stop - 1)];
    return {s: 1.18 + 0.1 * Math.min(3, stop), x: lerp(W / 2, d.cx, 0.62), y: lerp(H / 2, (d.top + d.bottom) / 2, 0.5)};
  };
  const a = camAt(Math.floor(traveller));
  const b = camAt(Math.ceil(traveller));
  const u = traveller - Math.floor(traveller);
  const s = lerp(a.s, b.s, u);
  // keep the frame inside the painted corridor: the view's edges never pass the corridor's
  const cam = {s, x: Math.min(W - W / 2 / s, Math.max(W / 2 / s, lerp(a.x, b.x, u))), y: Math.min(H - H / 2 / s, Math.max(H / 2 / s, lerp(a.y, b.y, u)))};
  const walking = Math.abs(traveller - Math.round(traveller)) > 0.02;
  const bob = walking ? Math.sin(f / 3.2) * 4 : 0;

  // the runner on the floor, unrolling with `reveal`, and the light running on it
  const runner = (t: number, w: number) => {
    const y0 = H;
    const y1 = lerp(H, FAR.b, t);
    const half0 = 260;
    const half1 = lerp(260, 52, t);
    return [{x: W / 2 - half0 * w, y: y0}, {x: W / 2 + half0 * w, y: y0}, {x: W / 2 + half1 * w, y: y1}, {x: W / 2 - half1 * w, y: y1}];
  };
  const glowT = glow === null ? null : tOf(lerp(0, zEnd, glow / (n + 1)));

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s + bob}px) scale(${cam.s})`}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <linearGradient id="dc-floor" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#E3D3B6" />
              <stop offset="1" stopColor="#EFE6D5" />
            </linearGradient>
            <linearGradient id="dc-wall-l" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#CFD8E8" />
              <stop offset="1" stopColor="#E6EAF1" />
            </linearGradient>
            <linearGradient id="dc-wall-r" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#D8DFEC" />
              <stop offset="1" stopColor="#ECEEF3" />
            </linearGradient>
            <radialGradient id="dc-light" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0" stopColor="#FFF4D2" />
              <stop offset="0.6" stopColor="#F6D27E" />
              <stop offset="1" stopColor="#E8AA35" />
            </radialGradient>
            <radialGradient id="dc-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* ceiling, walls, floor and the far wall */}
          <polygon points={poly([{x: 0, y: 0}, {x: W, y: 0}, {x: FAR.r, y: FAR.t}, {x: FAR.l, y: FAR.t}])} fill="#F3EDE1" />
          <polygon points={poly([{x: 0, y: 0}, {x: FAR.l, y: FAR.t}, {x: FAR.l, y: FAR.b}, {x: 0, y: H}])} fill="url(#dc-wall-l)" />
          <polygon points={poly([{x: W, y: 0}, {x: FAR.r, y: FAR.t}, {x: FAR.r, y: FAR.b}, {x: W, y: H}])} fill="url(#dc-wall-r)" />
          <polygon points={poly([{x: 0, y: H}, {x: W, y: H}, {x: FAR.r, y: FAR.b}, {x: FAR.l, y: FAR.b}])} fill="url(#dc-floor)" />
          <rect x={FAR.l} y={FAR.t} width={FAR.r - FAR.l} height={FAR.b - FAR.t} fill="#EFE5D2" />
          {/* lamps along the ceiling, a soft pool of light under each */}
          {[0.2, 0.45, 0.68, 0.86].map((t, k) => {
            const y = lerp(0, FAR.t, t);
            const rx = lerp(120, 22, t);
            return <ellipse key={k} cx={W / 2} cy={y + rx * 0.25} rx={rx} ry={rx * 0.22} fill="#FFF6DD" opacity={0.85} />;
          })}
          {/* the pencil underdrawing: the corridor's edges */}
          <g stroke={ink(0.9)} strokeWidth={2.4} fill="none" strokeLinejoin="round">
            <line x1={0} y1={0} x2={FAR.l} y2={FAR.t} />
            <line x1={W} y1={0} x2={FAR.r} y2={FAR.t} />
            <line x1={0} y1={H} x2={FAR.l} y2={FAR.b} />
            <line x1={W} y1={H} x2={FAR.r} y2={FAR.b} />
            <rect x={FAR.l} y={FAR.t} width={FAR.r - FAR.l} height={FAR.b - FAR.t} />
          </g>
          {/* the runner, unrolling toward the room */}
          <polygon points={poly(runner(Math.max(0.02, reveal), 1))} fill="#B9503B" opacity={0.72} />
          <polygon points={poly(runner(Math.max(0.02, reveal), 0.82))} fill="#C9644C" opacity={0.6} />
          {glowT !== null ? (
            <ellipse cx={W / 2} cy={lerp(H, FAR.b, glowT)} rx={lerp(300, 60, glowT)} ry={lerp(70, 14, glowT)} fill="url(#dc-glow)" />
          ) : null}
          {/* the far door: the room, gold light when it opens */}
          <rect x={fd.l} y={fd.t} width={fd.r - fd.l} height={fd.b - fd.t} fill="url(#dc-light)" opacity={0.55 + 0.45 * roomOpen} />
          <rect x={fd.l} y={fd.t} width={(fd.r - fd.l) * (1 - 0.82 * roomOpen)} height={fd.b - fd.t} fill="#C99A45" stroke={ink(0.9)} strokeWidth={2} />
          <rect x={fd.l} y={fd.t} width={fd.r - fd.l} height={fd.b - fd.t} fill="none" stroke={ink(0.9)} strokeWidth={2.4} />
          {/* the side doors */}
          {doors.map((d) => {
            const shown = d.s.shown;
            if (shown <= 0) return null;
            const lit = d.open > 0;
            const isActive = active === d.k + 1;
            return (
              <g key={d.k} opacity={shown}>
                {/* the doorway: warm light behind the door */}
                <polygon points={poly(d.frame)} fill={lit ? 'url(#dc-light)' : '#5B5147'} opacity={lit ? 0.5 + 0.5 * d.open : 0.35} />
                {/* the door leaf, turning on its hinge (the near edge) */}
                <polygon points={poly(d.leaf)} fill={PAINT[d.k % PAINT.length]} opacity={0.9} />
                <polygon points={poly(d.leaf)} fill="#FFFFFF" opacity={0.12} />
                {/* its knob, and the frame in pencil */}
                <circle cx={lerp(d.leaf[1].x, d.leaf[0].x, 0.16)} cy={(d.leaf[1].y + d.leaf[2].y) / 2} r={Math.max(3, d.height * 0.025)} fill="#F2E3B5" />
                <polygon points={poly(d.frame)} fill="none" stroke={isActive ? '#E8AA35' : ink(0.9)} strokeWidth={isActive ? 6 : 2.4} strokeLinejoin="round" />
                {/* the door's number on a small plaque above it */}
                <circle cx={d.cx} cy={d.top - d.height * 0.09} r={d.height * 0.07} fill="#FFFCF5" stroke={ink(0.9)} strokeWidth={2} />
                <text x={d.cx} y={d.top - d.height * 0.09} fontFamily={FONT} fontWeight={700} fontSize={d.height * 0.085} fill={C.ink} textAnchor="middle" dominantBaseline="central">
                  {d.k + 1}
                </text>
                {d.s.mark === 'loop' && (d.s.markPulse ?? 0) > 0 ? (
                  <circle cx={d.cx} cy={(d.top + d.bottom) / 2} r={d.height * (0.32 + 0.06 * (d.s.markPulse ?? 0))} fill="none" stroke="#E8AA35" strokeWidth={5} opacity={d.s.markPulse} />
                ) : null}
              </g>
            );
          })}
        </svg>
        {/* washes of pigment on the walls and the floor, then the paper's grain over everything */}
        {([['blue', -260, -200, 900, 0.3, 10], ['rose', 1350, 520, 760, 0.18, 200], ['gold', 620, 760, 700, 0.2, 80], ['green', 1500, -260, 700, 0.2, 140]] as const).map(([pig, x, y, size, o, rot]) => (
          <Img key={pig} src={texture(`wash-${pig}.png`)} style={{position: 'absolute', left: x, top: y, width: size, height: size, opacity: o, mixBlendMode: 'multiply', transform: `rotate(${rot}deg)`, pointerEvents: 'none'}} />
        ))}
        {/* the paper texture over the painted corridor */}
        <Img src={texture('paper.jpg')} style={{position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.55, pointerEvents: 'none'}} />
        {/* the doors' names, the room, and «أنت هنا»; the doors' names fade as the camera closes in (the title names the
            door then, and a near door's name would grow into the top bar) */}
        {doors.map((d) => (
          <Tag key={d.k} x={d.cx} y={d.top - d.height * 0.2} size={Math.max(20, d.height * 0.085)} shown={d.s.shown * interpolate(cam.s, [1.03, 1.15], [1, 0], clamp)}>
            {d.s.label}
          </Tag>
        ))}
        <Tag x={(fd.l + fd.r) / 2} y={fd.t - 18} size={22} shown={destination.shown} tone="#8A5E00">
          {destination.label}
        </Tag>
      </div>
      {/* the viewer, at the near end, walking when the traveller moves */}
      <div style={{position: 'absolute', left: W / 2, bottom: -12, transform: `translateX(-50%) translateY(${Math.abs(bob)}px)`, opacity: 0.88}}>
        <Person size={230} color="#3A3557" />
      </div>
      <Tag x={W / 2} y={H - 250} size={30} shown={start.shown * interpolate(traveller, [0, 0.6], [1, 0], clamp)}>
        {start.label}
      </Tag>
    </div>
  );
};
