// The presenter (framework v7, from EP006): the owner's stand-in, standing beside the page for most of the video and
// explaining with his hands. Five ways to draw him, for the owner to choose one (EP006, 17 Nov 2026). Every option keeps
// what the channel's avatar says about him (03-episodes/_assets/brand/avatar.png): a young man with a swept-up quiff and
// round gold glasses, no face drawn. Coordinates: feet on (0, 0), the top of the hair near y = -1000; x grows to the right.
import React from 'react';
import {limb, SK, SketchFilters} from './Sketchbook';

export type PresenterStyle = 'shadow' | 'pencil' | 'stick' | 'sketchnote' | 'thobe';
export type PresenterPose = 'point' | 'open' | 'count';
type Pt = [number, number];

type Skeleton = {head: Pt; sl: Pt; sr: Pt; el: Pt; er: Pt; hl: Pt; hr: Pt; hipL: Pt; hipR: Pt; kl: Pt; kr: Pt; fl: Pt; fr: Pt};

const BASE = {head: [0, -870] as Pt, sl: [-100, -748] as Pt, sr: [100, -748] as Pt, hipL: [-50, -446] as Pt, hipR: [50, -446] as Pt, kl: [-58, -236] as Pt, kr: [60, -236] as Pt, fl: [-64, -20] as Pt, fr: [68, -20] as Pt};

export const POSES: Record<PresenterPose, Skeleton> = {
  // points to the page on his left (the screen's left), the other hand holds a stylus at the waist
  point: {...BASE, head: [-6, -870], el: [-206, -790], hl: [-322, -846], er: [130, -600], hr: [104, -476]},
  // both arms open: "look at this"
  open: {...BASE, el: [-158, -612], hl: [-238, -540], er: [158, -612], hr: [238, -540]},
  // counts on the raised hand, the other on his chest
  count: {...BASE, head: [4, -872], el: [-126, -600], hl: [-40, -640], er: [176, -770], hr: [196, -906]},
};

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const seg = (...p: Pt[]) => 'M' + p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L');

type Role = 'skin' | 'hair' | 'top' | 'insert' | 'bottom' | 'shoe' | 'cloth' | 'scarf' | 'agal' | 'sandal';
type Shape = {role: Role; d: string; w?: number};

/** The modern outfit (V-neck sweater, trousers, shoes), back to front. */
const casual = (k: Skeleton, headScale = 1): Shape[] => {
  const wristL = lerp(k.el, k.hl, 0.8);
  const wristR = lerp(k.er, k.hr, 0.8);
  const [hx, hy] = k.head;
  const hs = headScale;
  const shapes: Shape[] = [
    // legs and shoes
    {role: 'bottom', d: seg(k.hipL, k.kl, lerp(k.kl, k.fl, 0.93)), w: 76},
    {role: 'bottom', d: seg(k.hipR, k.kr, lerp(k.kr, k.fr, 0.93)), w: 76},
    {role: 'bottom', d: 'M-100 -472 L100 -472 L98 -396 L-98 -396 Z'},
    {role: 'shoe', d: `M${k.fl[0] - 44} ${k.fl[1] + 8} Q${k.fl[0] - 46} ${k.fl[1] - 26} ${k.fl[0] - 6} ${k.fl[1] - 26} Q${k.fl[0] + 26} ${k.fl[1] - 26} ${k.fl[0] + 30} ${k.fl[1] + 8} Z`},
    {role: 'shoe', d: `M${k.fr[0] - 30} ${k.fr[1] + 8} Q${k.fr[0] - 26} ${k.fr[1] - 26} ${k.fr[0] + 6} ${k.fr[1] - 26} Q${k.fr[0] + 46} ${k.fr[1] - 26} ${k.fr[0] + 44} ${k.fr[1] + 8} Z`},
    // the arm behind (right), the body, then the arm in front (left)
    {role: 'top', d: seg(k.sr, k.er, wristR), w: 52},
    {role: 'skin', d: hand(k.er, k.hr, false)},
    {role: 'skin', d: 'M-20 -812 L20 -812 L22 -760 L-22 -760 Z'},
    {role: 'top', d: 'M-38 -778 C-70 -776 -96 -768 -110 -746 C-112 -690 -106 -600 -104 -560 C-102 -500 -100 -470 -98 -440 L98 -440 C100 -470 102 -500 104 -560 C106 -600 112 -690 110 -746 C96 -768 70 -776 38 -778 L0 -700 Z'},
    {role: 'insert', d: 'M-30 -776 L0 -712 L30 -776 C14 -766 -14 -766 -30 -776 Z'},
    {role: 'top', d: seg(k.sl, k.el, wristL), w: 52},
    {role: 'skin', d: hand(k.el, k.hl, k === POSES.point || k.hl[0] < -300)},
    // head: ears, face, hair
    {role: 'skin', d: ellipse(hx - 63 * hs, hy + 6 * hs, 12 * hs, 19 * hs)},
    {role: 'skin', d: ellipse(hx + 63 * hs, hy + 6 * hs, 12 * hs, 19 * hs)},
    {role: 'skin', d: egg(hx, hy, hs)},
    {role: 'hair', d: quiff(hx, hy, hs)},
  ];
  return shapes;
};

/** The thobe and shemagh: a long white robe, the red-checked scarf over the head and shoulders, the black agal. */
const thobe = (k: Skeleton): Shape[] => {
  const wristL = lerp(k.el, k.hl, 0.8);
  const wristR = lerp(k.er, k.hr, 0.8);
  const [hx, hy] = k.head;
  return [
    {role: 'sandal', d: `M${k.fl[0] - 40} ${k.fl[1] + 10} Q${k.fl[0] - 40} ${k.fl[1] - 14} ${k.fl[0] - 4} ${k.fl[1] - 14} Q${k.fl[0] + 24} ${k.fl[1] - 14} ${k.fl[0] + 26} ${k.fl[1] + 10} Z`},
    {role: 'sandal', d: `M${k.fr[0] - 26} ${k.fr[1] + 10} Q${k.fr[0] - 24} ${k.fr[1] - 14} ${k.fr[0] + 4} ${k.fr[1] - 14} Q${k.fr[0] + 40} ${k.fr[1] - 14} ${k.fr[0] + 40} ${k.fr[1] + 10} Z`},
    {role: 'cloth', d: seg(k.sr, k.er, wristR), w: 56},
    {role: 'skin', d: hand(k.er, k.hr, false)},
    {role: 'cloth', d: 'M-40 -780 C-72 -778 -100 -768 -112 -746 C-118 -600 -122 -420 -126 -300 C-130 -180 -134 -90 -136 -22 L136 -22 C134 -90 130 -180 126 -300 C122 -420 118 -600 112 -746 C100 -768 72 -778 40 -780 Z'},
    {role: 'cloth', d: seg(k.sl, k.el, wristL), w: 56},
    {role: 'skin', d: hand(k.el, k.hl, k.hl[0] < -300)},
    // the scarf's back and the drape on the shoulders, then the face in its opening, then the agal
    {role: 'scarf', d: `M${hx - 84} ${hy - 30} C${hx - 92} ${hy - 136} ${hx + 92} ${hy - 136} ${hx + 84} ${hy - 30} C${hx + 98} ${hy + 20} ${hx + 118} ${hy + 92} ${hx + 138} ${hy + 140} C${hx + 148} ${hy + 186} ${hx + 132} ${hy + 236} ${hx + 112} ${hy + 258} L${hx + 62} ${hy + 160} C${hx + 54} ${hy + 120} ${hx + 50} ${hy + 80} ${hx + 50} ${hy + 50} L${hx - 50} ${hy + 50} C${hx - 50} ${hy + 80} ${hx - 54} ${hy + 120} ${hx - 62} ${hy + 160} L${hx - 112} ${hy + 258} C${hx - 132} ${hy + 236} ${hx - 148} ${hy + 186} ${hx - 138} ${hy + 140} C${hx - 118} ${hy + 92} ${hx - 98} ${hy + 20} ${hx - 84} ${hy - 30} Z`},
    {role: 'skin', d: ellipse(hx, hy + 8, 52, 68)},
    {role: 'scarf', d: `M${hx - 60} ${hy - 50} C${hx - 40} ${hy - 76} ${hx + 40} ${hy - 76} ${hx + 60} ${hy - 50} C${hx + 66} ${hy - 20} ${hx + 66} ${hy + 30} ${hx + 58} ${hy + 76} L${hx + 50} ${hy + 76} C${hx + 54} ${hy + 30} ${hx + 54} ${hy - 20} ${hx + 46} ${hy - 44} C${hx + 20} ${hy - 58} ${hx - 20} ${hy - 58} ${hx - 46} ${hy - 44} C${hx - 54} ${hy - 20} ${hx - 54} ${hy + 30} ${hx - 50} ${hy + 76} L${hx - 58} ${hy + 76} C${hx - 66} ${hy + 30} ${hx - 66} ${hy - 20} ${hx - 60} ${hy - 50} Z`},
    {role: 'agal', d: ellipse(hx, hy - 84, 80, 15), w: 9},
    {role: 'agal', d: ellipse(hx, hy - 70, 82, 15), w: 9},
  ];
};

/** A hand just past the cuff, along the forearm; `point` adds the index finger. */
function hand(elbow: Pt, tip: Pt, point: boolean) {
  const dx = tip[0] - elbow[0];
  const dy = tip[1] - elbow[1];
  const l = Math.hypot(dx, dy);
  const u = [dx / l, dy / l];
  const n = [-u[1], u[0]];
  const c: Pt = [tip[0] + u[0] * 6, tip[1] + u[1] * 6];
  const at = (a: number, b: number) => `${(c[0] + u[0] * a + n[0] * b).toFixed(1)} ${(c[1] + u[1] * a + n[1] * b).toFixed(1)}`;
  const palm = `M${at(-16, -19)} C${at(10, -24)} ${at(30, -16)} ${at(32, 0)} C${at(30, 16)} ${at(10, 24)} ${at(-16, 19)} Z`;
  if (!point) return palm;
  return palm + ` M${at(20, -10)} L${at(62, -14)} C${at(70, -14)} ${at(70, -3)} ${at(62, -3)} L${at(24, 2)} Z`;
}

/** The head, wider at the temples than at the chin. */
function egg(hx: number, hy: number, s: number) {
  const p = (x: number, y: number) => `${(hx + x * s).toFixed(1)} ${(hy + y * s).toFixed(1)}`;
  return `M${p(-64, -10)} C${p(-66, -70)} ${p(-40, -84)} ${p(0, -84)} C${p(40, -84)} ${p(66, -70)} ${p(64, -10)} C${p(62, 40)} ${p(38, 80)} ${p(0, 84)} C${p(-38, 80)} ${p(-62, 40)} ${p(-64, -10)} Z`;
}

function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

/** The swept-up quiff of the avatar: short at the sides, volume over the forehead, leaning to his left. */
function quiff(hx: number, hy: number, s: number) {
  const p = (x: number, y: number) => `${(hx + x * s).toFixed(1)} ${(hy + y * s).toFixed(1)}`;
  return `M${p(-66, -26)} C${p(-74, -76)} ${p(-50, -112)} ${p(-6, -122)} C${p(30, -134)} ${p(72, -128)} ${p(92, -104)} C${p(100, -90)} ${p(94, -78)} ${p(80, -76)} C${p(84, -60)} ${p(76, -44)} ${p(66, -26)} C${p(62, -42)} ${p(50, -56)} ${p(30, -60)} C${p(8, -66)} ${p(-22, -62)} ${p(-42, -52)} C${p(-56, -44)} ${p(-62, -36)} ${p(-66, -26)} Z`;
}

const Glasses: React.FC<{k: Skeleton; scale?: number; rim?: string; lens?: string; rimW?: number; filter?: string}> = ({k, scale = 1, rim = SK.gold, lens = '#1D1D24', rimW = 6.5, filter}) => {
  const [hx, hy] = k.head;
  const s = scale;
  const y = hy - 4 * s;
  const lx = hx - 29 * s;
  const rx = hx + 29 * s;
  const r = 23 * s;
  return (
    <g filter={filter}>
      <path d={`M${lx - r} ${y} L${hx - 64 * s} ${y + 8 * s}`} stroke={rim} strokeWidth={rimW * 0.8} fill="none" strokeLinecap="round" />
      <path d={`M${rx + r} ${y} L${hx + 64 * s} ${y + 8 * s}`} stroke={rim} strokeWidth={rimW * 0.8} fill="none" strokeLinecap="round" />
      <circle cx={lx} cy={y} r={r} fill={lens} stroke={rim} strokeWidth={rimW} />
      <circle cx={rx} cy={y} r={r} fill={lens} stroke={rim} strokeWidth={rimW} />
      <path d={`M${lx + r} ${y - 2 * s} Q${hx} ${y - 10 * s} ${rx - r} ${y - 2 * s}`} stroke={rim} strokeWidth={rimW * 0.85} fill="none" />
      {lens !== 'none' ? (
        <>
          <path d={`M${lx - r * 0.55} ${y - r * 0.35} Q${lx - r * 0.2} ${y - r * 0.7} ${lx + r * 0.25} ${y - r * 0.62}`} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3.5 * s} fill="none" strokeLinecap="round" />
          <path d={`M${rx - r * 0.55} ${y - r * 0.35} Q${rx - r * 0.2} ${y - r * 0.7} ${rx + r * 0.25} ${y - r * 0.62}`} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3.5 * s} fill="none" strokeLinecap="round" />
        </>
      ) : null}
    </g>
  );
};

/** The stylus he explains with (the tablet-sketch explainer's one real object). */
const Stylus: React.FC<{k: Skeleton; color?: string}> = ({k, color = SK.graphite}) => {
  const a = k.hr;
  const dir = [k.hr[0] - k.er[0], k.hr[1] - k.er[1]];
  const len = Math.hypot(dir[0], dir[1]);
  const u = [dir[0] / len, dir[1] / len];
  // across the hand, slightly tilted
  const p1: Pt = [a[0] - u[1] * 46 - u[0] * 6, a[1] + u[0] * 46 - u[1] * 6];
  const p2: Pt = [a[0] + u[1] * 40 + u[0] * 8, a[1] - u[0] * 40 + u[1] * 8];
  return <path d={seg(p1, p2)} stroke={color} strokeWidth={9} strokeLinecap="round" />;
};

const PAINT: Record<Role, string> = {skin: SK.skin, hair: '#3B2E28', top: '#4A5F86', insert: '#A9B6CC', bottom: '#B79E78', shoe: '#5A4436', cloth: '#FBF8F1', scarf: '#C8463A', agal: '#1E1E22', sandal: '#8A6A4E'};

/** The presenter. `x`, `y`: where his feet stand, in the parent's units; `height`: his height in those units. */
export const Presenter: React.FC<{id: string; look: PresenterStyle; pose?: PresenterPose; x: number; y: number; height: number; flip?: boolean}> = ({id, look, pose = 'point', x, y, height, flip = false}) => {
  const k = POSES[pose];
  const s = height / 1000;
  const g = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
  return (
    <g transform={g}>
      <SketchFilters id={id} seed={look.length * 7} />
      {look === 'shadow' ? <Shadow id={id} k={k} /> : null}
      {look === 'pencil' ? <Pencil id={id} k={k} shapes={casual(k)} /> : null}
      {look === 'stick' ? <Stick id={id} k={k} /> : null}
      {look === 'sketchnote' ? <Sketchnote id={id} k={k} /> : null}
      {look === 'thobe' ? <Pencil id={id} k={k} shapes={thobe(k)} thobe /> : null}
    </g>
  );
};

/** 1 · «الظل»: the avatar's navy silhouette, painted: one pigment in two passes, a pooled rim, the gold glasses crisp. */
const Shadow: React.FC<{id: string; k: Skeleton}> = ({id, k}) => {
  const shapes = casual(k);
  const fill = (sh: Shape, color: string, opacity: number, filter: string, dx = 0, dy = 0) =>
    sh.w ? (
      <path d={sh.d} fill="none" stroke={color} strokeWidth={sh.w + 12} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} filter={filter} transform={`translate(${dx} ${dy})`} />
    ) : (
      <path d={sh.d} fill={color} opacity={opacity} filter={filter} transform={`translate(${dx} ${dy})`} />
    );
  return (
    <g>
      <ellipse cx={0} cy={-6} rx={190} ry={26} fill={SK.navy2} opacity={0.22} filter={`url(#${id}-wash)`} />
      <g style={{mixBlendMode: 'multiply'}}>
        {shapes.map((sh, i) => (
          <React.Fragment key={i}>{fill(sh, sh.role === 'insert' ? SK.slate : SK.navy, 0.9, `url(#${id}-calm)`)}</React.Fragment>
        ))}
        {/* a lighter second pass that dried a little off the first: the watercolour's own variation */}
        {shapes.map((sh, i) => (
          <React.Fragment key={`b${i}`}>{fill(sh, SK.navy2, 0.22, `url(#${id}-wash)`, 7, 5)}</React.Fragment>
        ))}
        {/* the rim where the pigment pooled */}
        {shapes.filter((sh) => !sh.w).map((sh, i) => <path key={`r${i}`} d={sh.d} fill="none" stroke="#141C30" strokeWidth={5} opacity={0.55} filter={`url(#${id}-pool)`} />)}
      </g>
      <Glasses k={k} />
    </g>
  );
};

/** 2 · «القلم» (and 5 · «الثوب»): graphite lines first, colour blocks after, shifted off the line and not quite filled. */
const Pencil: React.FC<{id: string; k: Skeleton; shapes: Shape[]; thobe?: boolean}> = ({id, k, shapes, thobe: isThobe = false}) => {
  const block = (sh: Shape, i: number) => {
    const color = PAINT[sh.role];
    if (sh.role === 'agal') return null;
    const style = {mixBlendMode: 'multiply' as const};
    // white cloth gets only a cool shadow wash on one side; everything else a flat block shifted down-right
    if (sh.role === 'cloth') {
      return sh.w ? (
        <path key={`c${i}`} d={sh.d} fill="none" stroke="#9FB2CC" strokeWidth={sh.w * 0.45} strokeLinecap="round" opacity={0.45} transform="translate(14 10)" filter={`url(#${id}-wash)`} style={style} />
      ) : (
        <path key={`c${i}`} d={sh.d} fill="#AFC0D8" opacity={0.38} transform="translate(40 10) scale(0.72 1)" filter={`url(#${id}-wash)`} style={style} />
      );
    }
    return sh.w ? (
      <path key={`c${i}`} d={sh.d} fill="none" stroke={color} strokeWidth={sh.w - 6} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} transform="translate(9 8)" filter={`url(#${id}-wash)`} style={style} />
    ) : (
      <path key={`c${i}`} d={sh.d} fill={color} opacity={sh.role === 'scarf' ? 0.82 : 0.85} transform="translate(9 8)" filter={`url(#${id}-wash)`} style={style} />
    );
  };
  return (
    <g>
      <ellipse cx={0} cy={-6} rx={180} ry={22} fill={SK.graphite2} opacity={0.16} filter={`url(#${id}-wash)`} />
      {shapes.map((sh, i) => (
        <g key={i}>
          {/* paper inside the line (so what is behind disappears), the colour block, then the graphite line */}
          {sh.role === 'agal' ? (
            <path d={sh.d} fill="none" stroke={PAINT.agal} strokeWidth={sh.w} filter={`url(#${id}-ink)`} />
          ) : sh.w ? (
            <>
              <path d={sh.d} fill="none" stroke={SK.graphite} strokeWidth={sh.w + 9} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-pencil)`} />
              <path d={sh.d} fill="none" stroke={SK.paper} strokeWidth={sh.w} strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <path d={sh.d} fill={SK.paper} />
              <path d={sh.d} fill="none" stroke={SK.graphite} strokeWidth={4.5} strokeLinejoin="round" filter={`url(#${id}-pencil)`} />
            </>
          )}
          {block(sh, i)}
          {sh.role === 'scarf' && !sh.w ? <path d={sh.d} fill={`url(#${id}-checks)`} opacity={0.7} /> : null}
        </g>
      ))}
      {isThobe ? (
        <g filter={`url(#${id}-pencil)`} stroke={SK.graphite} fill="none" strokeWidth={3.5} strokeLinecap="round">
          {/* the thobe's collar and buttoned placket */}
          <path d="M-26 -770 Q0 -756 26 -770" />
          <path d="M0 -760 V-620" />
          <circle cx={0} cy={-730} r={3} />
          <circle cx={0} cy={-690} r={3} />
          <circle cx={0} cy={-650} r={3} />
        </g>
      ) : (
        <Stylus k={k} />
      )}
      <defs>
        <pattern id={`${id}-checks`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="18" height="18" fill="none" />
          <path d="M0 9 H18 M9 0 V18" stroke="#FBF8F1" strokeWidth={3} opacity={0.75} />
        </pattern>
      </defs>
      <Glasses k={k} scale={isThobe ? 0.85 : 1} filter={`url(#${id}-ink)`} />
    </g>
  );
};

/** 3 · «العود»: a stick person like the ones he explains with, but his: a navy head, the quiff, the gold glasses. */
const Stick: React.FC<{id: string; k: Skeleton}> = ({id, k}) => {
  const w = 16;
  const line = {fill: 'none', stroke: SK.graphite, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  const [hx, hy] = k.head;
  const neck: Pt = [hx * 0.6, hy + 84];
  const shoulder: Pt = [hx * 0.5, -730];
  const hip: Pt = [0, -440];
  return (
    <g filter={`url(#${id}-ink)`}>
      <ellipse cx={0} cy={-4} rx={150} ry={18} fill={SK.graphite2} opacity={0.14} />
      <path d={limb(neck, [neck[0] + 10, -600], hip, 0.55)} {...line} />
      <path d={limb(shoulder, k.el, k.hl)} {...line} />
      <path d={limb(shoulder, k.er, k.hr)} {...line} />
      <path d={limb(hip, k.kl, k.fl)} {...line} />
      <path d={limb(hip, k.kr, k.fr)} {...line} />
      <circle cx={hx} cy={hy} r={74} fill={SK.navy} stroke={SK.graphite} strokeWidth={w * 0.8} />
      {/* his hair: the quiff as one darker cap on the head */}
      <path d={quiff(hx, hy, 1.12)} fill="#16203A" stroke={SK.graphite} strokeWidth={6} strokeLinejoin="round" />
      <Glasses k={k} scale={1.05} lens={SK.navy} />
    </g>
  );
};

/** 4 · «المذكرة»: a sketchnote cartoon: a bigger head, fineliner drawn twice, grey marker for volume, yellow on the
 * glasses, and the only option with a face (brows and a smile). */
const Sketchnote: React.FC<{id: string; k: Skeleton}> = ({id, k: k0}) => {
  // a bigger head on a slightly shorter neck
  const k: Skeleton = {...k0, head: [k0.head[0], k0.head[1] + 6]};
  const shapes = casual(k, 1.32);
  const grey: Partial<Record<Role, string>> = {top: 'rgba(80,80,92,0.30)', bottom: 'rgba(52,52,64,0.42)', hair: 'rgba(30,30,34,0.85)', shoe: 'rgba(30,30,34,0.75)', insert: 'rgba(255,205,40,0.55)'};
  const [hx, hy] = k.head;
  return (
    <g>
      <ellipse cx={0} cy={-6} rx={170} ry={20} fill="rgba(80,80,92,0.22)" />
      {shapes.map((sh, i) => (
        <g key={i}>
          {sh.w ? (
            <>
              <path d={sh.d} fill="none" stroke={SK.graphite} strokeWidth={sh.w + 9} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-ink)`} />
              <path d={sh.d} fill="none" stroke={SK.white} strokeWidth={sh.w} strokeLinecap="round" strokeLinejoin="round" />
              {grey[sh.role] ? <path d={sh.d} fill="none" stroke={grey[sh.role]} strokeWidth={sh.w - 2} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-marker)`} style={{mixBlendMode: 'multiply'}} /> : null}
            </>
          ) : (
            <>
              <path d={sh.d} fill={SK.white} />
              {grey[sh.role] ? <path d={sh.d} fill={grey[sh.role]} filter={`url(#${id}-marker)`} style={{mixBlendMode: 'multiply'}} /> : null}
              <path d={sh.d} fill="none" stroke={SK.graphite} strokeWidth={5} strokeLinejoin="round" filter={`url(#${id}-ink)`} />
              <path d={sh.d} fill="none" stroke={SK.graphite} strokeWidth={2.4} strokeLinejoin="round" opacity={0.5} transform="translate(2.5 -2)" filter={`url(#${id}-ink)`} />
            </>
          )}
        </g>
      ))}
      <Stylus k={k} color={SK.coral} />
      <Glasses k={k} scale={1.32} rim={SK.yellowSolid} lens="#2A2A30" rimW={7} filter={`url(#${id}-ink)`} />
      <g filter={`url(#${id}-ink)`} fill="none" stroke={SK.graphite} strokeWidth={5} strokeLinecap="round">
        <path d={`M${hx - 58} ${hy - 50} Q${hx - 38} ${hy - 62} ${hx - 14} ${hy - 52}`} />
        <path d={`M${hx + 16} ${hy - 52} Q${hx + 40} ${hy - 62} ${hx + 60} ${hy - 50}`} />
        <path d={`M${hx - 24} ${hy + 50} Q${hx} ${hy + 70} ${hx + 26} ${hy + 50}`} />
      </g>
    </g>
  );
};

export const PRESENTER_OPTIONS: {look: PresenterStyle; ar: string; en: string; note: string}[] = [
  {look: 'shadow', ar: 'الظل', en: 'Watercolour silhouette', note: 'شعار القناة نفسه… مرسوم بالألوان المائية'},
  {look: 'pencil', ar: 'القلم', en: 'Tablet sketch', note: 'خط رصاص… وألوان تحته مزحزحة شوي'},
  {look: 'stick', ar: 'العود', en: 'Stick figure', note: 'نفس أشخاص الشرح… بس بنظارتك'},
  {look: 'sketchnote', ar: 'المذكرة', en: 'Sketchnote cartoon', note: 'رسمة دفتر… راس أكبر وابتسامة'},
  {look: 'thobe', ar: 'الثوب', en: 'Thobe and shemagh', note: 'نفس الرسم… بالثوب والشماغ'},
];
