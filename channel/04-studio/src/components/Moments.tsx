// Explainer moments: visuals that appear on the word the narrator says and leave when the next one takes their place,
// so every sentence is seen as well as heard (a name becomes a profile card, a "no" gets stamped, a number counts up,
// a share fills a map). Each one has its own sound (Sfx). Drawn from plain shapes in our palette.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoContains, geoEqualEarth, geoMercator, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {C, EASE_IN_OUT, EASE_OUT, FONT} from '../theme';
import type {Moment, MomentSlot, Tone} from '../types';
import type {ScenePlan} from '../lib/plan';
import {cueAt, wordFrames} from '../scenes/common';
import {usePortrait} from './ui';
import {PeopleGrid, Person} from './Silhouettes';
import {Sfx, type SfxName} from './Sfx';

export const TONE: Record<Tone, {main: string; soft: string}> = {
  neg: {main: C.red, soft: C.redSoft},
  pos: {main: C.green, soft: C.greenSoft},
  accent: {main: C.blue, soft: C.blueSoft},
  gold: {main: '#C98A00', soft: C.yellowSoft},
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const DEEP = '0 2px 6px rgba(28,35,51,0.08), 0 30px 60px rgba(28,35,51,0.18)';
const CARD: React.CSSProperties = {background: C.surface, borderRadius: 32, boxShadow: DEEP, direction: 'rtl', fontFamily: FONT, color: C.ink};
const LTR: React.CSSProperties = {direction: 'ltr', unicodeBidi: 'isolate'};
/** 0 → 1 over `dur` frames from frame `at`; stays 0 when `at` never comes (Infinity). */
const ramp = (f: number, at: number, dur: number, easing = EASE_OUT) => (Number.isFinite(at) ? interpolate(f, [at, at + dur], [0, 1], {...clamp, easing}) : 0);

const SLOTS: Record<MomentSlot, [number, number]> = {
  'top-right': [1440, 280],
  top: [960, 280],
  'top-left': [480, 280],
  right: [1440, 540],
  center: [960, 540],
  left: [480, 540],
  'bottom-right': [1440, 800],
  bottom: [960, 800],
  'bottom-left': [480, 800],
  floor: [960, 975],
  stage: [960, 540],
};
// Shorts (9:16): one column, three bands.
const SLOTS_PORTRAIT: Record<MomentSlot, [number, number]> = {
  'top-right': [540, 560],
  top: [540, 560],
  'top-left': [540, 560],
  right: [540, 960],
  center: [540, 960],
  left: [540, 960],
  'bottom-right': [540, 1380],
  bottom: [540, 1380],
  'bottom-left': [540, 1380],
  floor: [540, 1640],
  stage: [540, 960],
};

type Clock = {f: number; inAt: number; at: (cue: string | undefined, fallback?: number) => number};

/** The leading number of a value ("37 سنة", "250 مليون") counted up from 0 over `dur` frames. */
const counted = (value: string, p: number) => {
  const m = value.match(/^(\d+)(.*)$/s);
  if (!m) return value;
  const target = parseInt(m[1], 10);
  const start = target > 1900 && target < 2100 ? target - 30 : 0;
  return `${Math.round(start + (target - start) * p)}${m[2]}`;
};

const Avatar: React.FC<{icon: 'person' | 'pair' | 'building' | 'chat'; size: number; tone: {main: string; soft: string}}> = ({icon, size, tone}) => (
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
    {icon === 'chat' ? (
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" style={{marginBottom: size * 0.2}}>
        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" fill={tone.main} />
        <path d="M8 10.5h8M8 13.5h5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ) : null}
  </div>
);

// ------------------------------------------------------------------ date: a calendar page (and years flipping)
const STEP = 7; // frames per year when the years flip

const DateCard: React.FC<{m: Extract<Moment, {kind: 'date'}>; c: Clock}> = ({m, c}) => {
  const from = parseInt(m.year, 10);
  const to = m.to ? parseInt(m.to, 10) : from;
  const toAt = m.to ? c.at(m.toCue, 0.5) : Infinity;
  const steps = Math.abs(to - from);
  const k = c.f < toAt ? 0 : Math.min(steps, Math.floor((c.f - toAt) / STEP) + 1);
  const year = from + Math.sign(to - from) * k;
  const slide = c.f < toAt || (k === steps && c.f > toAt + steps * STEP) ? 1 : interpolate((c.f - toAt) % STEP, [0, STEP * 0.7], [0, 1], clamp);
  const noteAt = m.note ? c.at(m.noteCue, 0.8) : Infinity;
  const note = ramp(c.f, noteAt, 12);
  const done = k === steps && steps > 0;
  return (
    <div style={{position: 'relative'}}>
      <div style={{...CARD, width: 360, overflow: 'hidden', borderRadius: 34}}>
        <div style={{background: done ? C.green : C.red, color: '#fff', fontSize: 48, fontWeight: 700, padding: '24px 0 18px', textAlign: 'center', position: 'relative'}}>
          {[0, 1].map((r) => (
            <div key={r} style={{position: 'absolute', top: -10, [r ? 'left' : 'right']: 76, width: 18, height: 38, borderRadius: 9, background: C.ink, opacity: 0.8}} />
          ))}
          {m.month ?? ''}
        </div>
        <div style={{height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
          <span style={{...LTR, fontSize: 134, fontWeight: 700, color: C.ink, display: 'inline-block', transform: `translateY(${(1 - slide) * 60}px)`, opacity: 0.3 + 0.7 * slide}}>{year}</span>
        </div>
      </div>
      {note > 0 ? (
        <div style={{position: 'absolute', top: '100%', left: '50%', marginTop: 22, transform: `translate(-50%, ${(1 - note) * 16}px)`, opacity: note, whiteSpace: 'nowrap', fontSize: 34, fontWeight: 700, background: C.yellowSoft, color: C.ink, borderRadius: 999, padding: '10px 28px', boxShadow: DEEP}}>
          {m.note}
        </div>
      ) : null}
      <Sfx at={c.inAt} name="paper" />
      {Array.from({length: steps}, (_, s) => <Sfx key={s} at={toAt + s * STEP} name="tick" volume={0.8} />)}
      {Number.isFinite(noteAt) ? <Sfx at={noteAt} name="pop" /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ profile: who (or what) is this, in numbers
const ProfileCard: React.FC<{m: Extract<Moment, {kind: 'profile'}>; c: Clock}> = ({m, c}) => {
  const tone = TONE[m.tone ?? 'accent'];
  const titleAt = m.titleCue ? c.at(m.titleCue, 0.2) : c.inAt;
  const typed = Math.round(m.title.length * interpolate(c.f, [titleAt, titleAt + 14], [0, 1], clamp));
  const fields = m.fields ?? [];
  const compact = fields.length === 0;
  return (
    <div style={{...CARD, width: compact ? 640 : 600, padding: compact ? '26px 32px' : '32px 36px', display: 'flex', flexDirection: 'column', gap: 18}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <Avatar icon={m.icon ?? 'person'} size={compact ? 104 : 120} tone={tone} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0}}>
          {m.tag ? <div style={{alignSelf: 'flex-start', fontSize: 24, fontWeight: 600, color: tone.main, background: tone.soft, borderRadius: 999, padding: '4px 16px'}}>{m.tag}</div> : null}
          <div style={{fontSize: 48, fontWeight: 700, lineHeight: 1.2, minHeight: 58, position: 'relative'}}>
            {typed > 0 ? m.title.slice(0, typed) : <div style={{width: 230, height: 30, marginTop: 14, borderRadius: 12, background: C.line}} />}
          </div>
          {m.subtitle ? <div style={{fontSize: 30, fontWeight: 500, color: C.ink2}}>{m.subtitle}</div> : null}
        </div>
      </div>
      {fields.map((fd, i) => {
        const at = c.at(fd.cue, 0.3 + i * 0.2);
        const p = interpolate(c.f, [at, at + 12], [0, 1], {...clamp, easing: EASE_OUT});
        const noteAt = fd.note ? c.at(fd.noteCue, 0.9) : Infinity;
        const note = ramp(c.f, noteAt, 12);
        return (
          <div key={i} style={{borderTop: `2px solid ${C.line}`, paddingTop: 14, opacity: c.f < at ? 0.35 : 1}}>
            <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20}}>
              <div style={{fontSize: 28, fontWeight: 500, color: C.ink3}}>{fd.label}</div>
              {c.f >= at ? (
                <div style={{fontSize: 40, fontWeight: 700, color: tone.main, transform: `translateX(${(1 - p) * -30}px)`, opacity: p}}>{counted(fd.value, interpolate(c.f, [at, at + 18], [0, 1], clamp))}</div>
              ) : (
                <div style={{width: 170, height: 24, borderRadius: 10, background: C.line}} />
              )}
            </div>
            {note > 0 ? (
              <div style={{marginTop: 10, fontSize: 26, fontWeight: 600, background: C.yellowSoft, borderRadius: 16, padding: '8px 16px', opacity: note, transform: `translateY(${(1 - note) * 10}px)`}}>{fd.note}</div>
            ) : null}
            <Sfx at={at} name="tick" />
            {Number.isFinite(noteAt) ? <Sfx at={noteAt} name="pop" volume={0.8} /> : null}
          </div>
        );
      })}
      <Sfx at={c.inAt} name="pop" />
      {m.titleCue ? <Sfx at={titleAt} name="type" /> : null}
      {m.titleCue ? <Sfx at={titleAt + 5} name="type2" /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ stamp: slammed onto what's under it
const StampMark: React.FC<{m: Extract<Moment, {kind: 'stamp'}>; c: Clock}> = ({m, c}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: c.f - c.inAt, fps, config: {damping: 9, stiffness: 190, mass: 0.6}});
  const tone = TONE[m.tone ?? 'neg'];
  return (
    <div
      style={{
        border: `9px solid ${tone.main}`,
        color: tone.main,
        borderRadius: 22,
        padding: '4px 40px 10px',
        fontFamily: FONT,
        fontSize: 92,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: 'rgba(255,255,255,0.82)',
        transform: `rotate(-11deg) scale(${2.3 - 1.3 * p})`,
        opacity: Math.min(1, (c.f - c.inAt) / 4),
        boxShadow: `0 0 0 6px rgba(255,255,255,0.6)`,
      }}
    >
      {m.text}
      <Sfx at={c.inAt + 3} name="stamp" />
    </div>
  );
};

// ------------------------------------------------------------------ quote: typed word by word as it is read
const QuoteCard: React.FC<{m: Extract<Moment, {kind: 'quote'}>; c: Clock; plan: ScenePlan; narration: string}> = ({m, c, plan, narration}) => {
  const words = m.text.split(' ');
  const said = wordFrames(plan, narration, m.textCue ?? words.slice(0, 2).join(' '), words.length);
  const frames = said.length ? said : words.map((_, k) => c.inAt + 20 + k * 8);
  const lastAt = frames[frames.length - 1];
  const dots = c.f < frames[0];
  const orig = interpolate(c.f, [lastAt + 12, lastAt + 26], [0, 1], clamp);
  return (
    <div style={{...CARD, width: 760, padding: '30px 38px 34px', display: 'flex', flexDirection: 'column', gap: 18}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Avatar icon="person" size={78} tone={TONE.accent} />
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{fontSize: 34, fontWeight: 700}}>{m.who}</div>
          {m.meta ? <div style={{fontSize: 24, color: C.ink3}}>{m.meta}</div> : null}
        </div>
      </div>
      <div style={{fontSize: 44, fontWeight: 600, lineHeight: 1.5, minHeight: 66}}>
        {dots ? (
          <div style={{display: 'flex', gap: 12, padding: '22px 4px'}}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{width: 16, height: 16, borderRadius: 99, background: C.ink3, transform: `translateY(${Math.sin((c.f - c.inAt) / 4 - k) * 6}px)`}} />
            ))}
          </div>
        ) : (
          words.map((w, k) => {
            const p = interpolate(c.f, [frames[k], frames[k] + 6], [0, 1], clamp);
            return (
              <span key={k} style={{opacity: p, display: 'inline-block', transform: `translateY(${(1 - p) * 10}px)`, marginLeft: 12}}>
                {w}
              </span>
            );
          })
        )}
      </div>
      {m.original ? <div style={{...LTR, fontSize: 24, color: C.ink3, fontStyle: 'italic', opacity: orig, textAlign: 'left'}}>{m.original}</div> : null}
      <Sfx at={c.inAt} name="pop" />
      {frames.map((at, k) => <Sfx key={k} at={at} name={k % 2 ? 'type2' : 'type'} />)}
    </div>
  );
};

// ------------------------------------------------------------------ count: one big number
const CountCard: React.FC<{m: Extract<Moment, {kind: 'count'}>; c: Clock}> = ({m, c}) => {
  const tone = TONE[m.tone ?? 'accent'];
  const p = interpolate(c.f, [c.inAt, c.inAt + 26], [0, 1], {...clamp, easing: EASE_OUT});
  return (
    <div style={{...CARD, padding: '28px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14, color: tone.main}}>
        <span style={{...LTR, fontSize: 110, fontWeight: 700, lineHeight: 1}}>{counted(m.value, p)}</span>
        {m.unit ? <span style={{fontSize: 42, fontWeight: 700}}>{m.unit}</span> : null}
      </div>
      {m.label ? <div style={{fontSize: 32, color: C.ink2, fontWeight: 500}}>{m.label}</div> : null}
      <Sfx at={c.inAt} name="pop" />
      <Sfx at={c.inAt + 2} name="roll" />
    </div>
  );
};

// ------------------------------------------------------------------ question: a pause for the viewer to guess
const QuestionMark: React.FC<{m: Extract<Moment, {kind: 'question'}>; c: Clock}> = ({m, c}) => {
  const pulse = 1 + 0.06 * Math.sin((c.f - c.inAt) / 5);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, fontFamily: FONT}}>
      <div style={{width: 210, height: 210, borderRadius: 999, background: C.yellow, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 150, fontWeight: 700, transform: `scale(${pulse})`, boxShadow: '0 20px 50px rgba(201,138,0,0.35)'}}>
        ؟
      </div>
      {m.text ? <div style={{fontSize: 48, fontWeight: 700, color: C.ink, background: C.surface, borderRadius: 999, padding: '8px 34px', boxShadow: DEEP}}>{m.text}</div> : null}
      <Sfx at={c.inAt} name="question" />
    </div>
  );
};

// ------------------------------------------------------------------ share: a map made of dots, a part of it filling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = world as any;
type Dots = {pts: [number, number][]; outline: string};
const dotCache: Record<string, Dots> = {};

const dotsFor = (shape: 'saudi' | 'world', w: number, h: number): Dots => {
  const key = `${shape}-${w}-${h}`;
  if (dotCache[key]) return dotCache[key];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geo: GeoPermissibleObjects =
    shape === 'saudi'
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((feature(topo, topo.objects.countries) as any).features.find((x: {id?: string}) => x.id === '682') as GeoPermissibleObjects)
      : (feature(topo, topo.objects.land) as unknown as GeoPermissibleObjects);
  const projection = shape === 'saudi' ? geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], geo) : geoEqualEarth().fitExtent([[6, 6], [w - 6, h - 6]], {type: 'Sphere'});
  const step = shape === 'saudi' ? 13 : 9;
  const pts: [number, number][] = [];
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const ll = projection.invert?.([x, y]);
      if (ll && geoContains(geo, ll)) pts.push([x, y]);
    }
  }
  pts.sort((a, b) => b[0] - a[0] || a[1] - b[1]); // fill from the right, like Arabic reading
  const outline = geoPath(projection)(shape === 'saudi' ? geo : {type: 'Sphere'}) ?? '';
  dotCache[key] = {pts, outline};
  return dotCache[key];
};

const ShareCard: React.FC<{m: Extract<Moment, {kind: 'share'}>; c: Clock}> = ({m, c}) => {
  const tone = TONE[m.tone ?? (m.shape === 'world' ? 'pos' : 'accent')];
  const W = 440;
  const H = m.shape === 'world' ? 230 : 250;
  const {pts, outline} = dotsFor(m.shape, W, H);
  const fillAt = c.at(m.fillCue, 0.6);
  const fill = interpolate(c.f, [fillAt, fillAt + 30], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const lit = Math.round(pts.length * (m.part / m.whole) * fill);
  const appear = interpolate(c.f, [c.inAt, c.inAt + 20], [0, 1], clamp);
  return (
    <div style={{...CARD, width: 540, padding: '24px 30px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
      {m.title ? <div style={{fontSize: 28, fontWeight: 600, color: C.ink2}}>{m.title}</div> : null}
      <svg width={W} height={H}>
        <path d={outline} fill={m.shape === 'world' ? '#F3F6FB' : 'none'} stroke={C.landStroke} strokeWidth={2} opacity={0.8} />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={m.shape === 'saudi' ? 4.6 : 3.3} fill={i < lit ? tone.main : C.landStroke} opacity={i < lit ? 1 : 0.55 * Math.min(1, appear * 1.5 - (i / pts.length) * 0.5)} />
        ))}
      </svg>
      {m.value ? (
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
          <span style={{fontSize: 60, fontWeight: 700, color: tone.main}}>{m.value}</span>
        </div>
      ) : null}
      <div style={{fontSize: 32, fontWeight: 600, color: C.ink, opacity: interpolate(c.f, [fillAt, fillAt + 16], [0.25, 1], clamp)}}>{m.label}</div>
      <Sfx at={c.inAt} name="swish" />
      <Sfx at={fillAt} name="roll" />
      <Sfx at={fillAt + 30} name="ping" />
    </div>
  );
};

// ------------------------------------------------------------------ chips: a short list, things crossed out
const ChipRow: React.FC<{m: Extract<Moment, {kind: 'chips'}>; c: Clock}> = ({m, c}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, direction: 'rtl', fontFamily: FONT}}>
    {m.title ? <div style={{fontSize: 38, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap'}}>{m.title}</div> : null}
    {m.items.map((it, i) => {
      const at = c.at(it.cue, 0.3 + i * 0.2);
      if (c.f < at) return null;
      const p = interpolate(c.f, [at, at + 10], [0, 1], {...clamp, easing: EASE_OUT});
      const cross = it.crossed ? interpolate(c.f, [at + 8, at + 16], [0, 1], {...clamp, easing: EASE_OUT}) : 0;
      return (
        <div key={i} style={{position: 'relative', fontSize: 38, fontWeight: 700, color: cross > 0.5 ? C.ink3 : C.ink, background: C.surface, borderRadius: 999, padding: '10px 32px', boxShadow: DEEP, whiteSpace: 'nowrap', opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
          {it.text}
          {cross > 0 ? <div style={{position: 'absolute', right: 14, top: '52%', height: 7, width: `calc(${cross} * (100% - 28px))`, background: C.red, borderRadius: 4, transform: 'rotate(-6deg)'}} /> : null}
          <Sfx at={at} name="tick" />
          {it.crossed ? <Sfx at={at + 8} name="strike" /> : null}
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ people: a whole team, counted
const PeopleCard: React.FC<{m: Extract<Moment, {kind: 'people'}>; c: Clock}> = ({m, c}) => {
  const tone = TONE[m.tone ?? 'accent'];
  const p = interpolate(c.f, [c.inAt, c.inAt + 30], [0, 1], {...clamp, easing: EASE_OUT});
  const cols = m.cols ?? 11;
  return (
    <div style={{...CARD, padding: '24px 40px', display: 'flex', alignItems: 'center', gap: 36}}>
      {m.value ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <span style={{...LTR, fontSize: 104, fontWeight: 700, lineHeight: 1, color: tone.main}}>{counted(m.value, p)}</span>
          {m.label ? <span style={{fontSize: 34, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap'}}>{m.label}</span> : null}
        </div>
      ) : null}
      <PeopleGrid count={m.count} cols={cols} cell={32} progress={p} color={tone.main} />
      <Sfx at={c.inAt} name="pop" />
      <Sfx at={c.inAt + 3} name="roll" />
    </div>
  );
};

// ------------------------------------------------------------------ tally: "count it one riyal a second…"
const big = (v: number) =>
  v >= 1e9 ? `${Math.round(v / 1e9)} مليار` : v >= 1e6 ? `${Math.round(v / 1e6)} مليون` : Math.round(v).toLocaleString('en-US');

const TallyCard: React.FC<{m: Extract<Moment, {kind: 'tally'}>; c: Clock}> = ({m, c}) => {
  const startAt = c.at(m.startCue, 0.3);
  const fastAt = Math.max(startAt + 30, c.at(m.fastCue, 0.6));
  const resultAt = Math.max(fastAt + 20, c.at(m.resultCue, 0.85));
  const ticks = Math.floor((fastAt - startAt) / 30) + 1;
  let value = 0;
  if (c.f >= resultAt) value = m.total;
  else if (c.f >= fastAt) {
    const u = (c.f - fastAt) / (resultAt - fastAt);
    value = ticks * Math.pow(m.total / ticks, Math.pow(u, 1.6));
  } else if (c.f >= startAt) value = Math.floor((c.f - startAt) / 30) + 1;
  const coinAge = c.f >= startAt && c.f < fastAt ? (c.f - startAt) % 30 : 99;
  // the sun and the moon cross a small sky: one turn = one day, slow at first, racing once the years fly by
  const turn = c.f < fastAt ? (c.f - c.inAt) / 240 : (fastAt - c.inAt) / 240 + Math.pow(Math.max(0, c.f - fastAt), 1.6) / 40;
  const a = 2 * Math.PI * turn;
  const sunUp = Math.cos(a);
  const sky = interpolate(sunUp, [-0.3, 0.3], [0, 1], clamp);
  const result = interpolate(c.f, [resultAt, resultAt + 14], [0, 1], {...clamp, easing: EASE_OUT});
  const words = value >= 1e6;
  return (
    <div style={{...CARD, width: 1180, height: 250, padding: '0 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{position: 'relative', width: 100, height: 100}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: '#F1C24B', border: '6px solid #C98A00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 700, color: '#8A5E00', transform: `translateY(${coinAge < 8 ? (8 - coinAge) * -9 : 0}px)`}}>
            1
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', minWidth: 300}}>
          <span style={{...(words ? {} : LTR), fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: '#C98A00', textAlign: 'right'}}>{big(value)}</span>
          <span style={{fontSize: 30, fontWeight: 600, color: C.ink2}}>
            {m.unit} · {m.per}
          </span>
        </div>
      </div>
      <svg width={220} height={130} viewBox="-110 -110 220 130">
        <defs>
          <clipPath id="tally-sky">
            <path d="M-100 0 A100 100 0 0 1 100 0 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#tally-sky)">
          <rect x={-110} y={-110} width={220} height={110} fill={C.ink} />
          <rect x={-110} y={-110} width={220} height={110} fill="#BFD6FA" opacity={sky} />
          {[[-60, -40], [-25, -75], [30, -55], [62, -30], [5, -25]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={3} fill="#fff" opacity={1 - sky} />
          ))}
          <circle cx={Math.sin(a) * 70} cy={-Math.cos(a) * 70} r={20} fill={C.yellow} />
          <g transform={`translate(${-Math.sin(a) * 70} ${Math.cos(a) * 70})`}>
            <circle r={16} fill="#F5F7FB" />
            <circle cx={7} cy={-5} r={14} fill={C.ink} opacity={1 - sky} />
            <circle cx={7} cy={-5} r={14} fill="#BFD6FA" opacity={sky} />
          </g>
        </g>
        <rect x={-108} y={-2} width={216} height={6} rx={3} fill={C.landStroke} />
      </svg>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 330, opacity: result, transform: `scale(${0.8 + 0.2 * result})`}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12, color: C.red}}>
          <span style={{...LTR, fontSize: 96, fontWeight: 700, lineHeight: 1}}>{m.result}</span>
          <span style={{fontSize: 44, fontWeight: 700}}>{m.resultUnit}</span>
        </div>
        {m.note ? <div style={{fontSize: 26, color: C.ink2, marginTop: 8, whiteSpace: 'nowrap'}}>{m.note}</div> : null}
      </div>
      <Sfx at={c.inAt} name="pop" />
      {Array.from({length: ticks}, (_, k) => <Sfx key={k} at={startAt + k * 30} name="coin" />)}
      <Sfx at={fastAt} name="swish" />
      <Sfx at={fastAt + 2} name="roll" />
      <Sfx at={resultAt} name="thud" />
    </div>
  );
};

// ------------------------------------------------------------------ send: an item travels from one slot to another
const SendItem: React.FC<{m: Extract<Moment, {kind: 'send'}>; c: Clock; portrait: boolean}> = ({m, c, portrait}) => {
  const slots = portrait ? SLOTS_PORTRAIT : SLOTS;
  const [x0, y0] = slots[m.from];
  const [x1, y1] = slots[m.to];
  const [dx, dy] = m.nudge ?? [0, 0];
  const u = interpolate(c.f, [c.inAt, c.inAt + 24], [0, 1], {...clamp, easing: EASE_IN_OUT});
  const x = x0 + (x1 - x0) * u + dx;
  const y = y0 + (y1 - y0) * u - Math.sin(Math.PI * u) * 130 + dy;
  const tone = TONE[m.tone ?? 'accent'];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${(1 - u) * (x1 < x0 ? 10 : -10)}deg) scale(${0.9 + 0.1 * Math.sin(Math.PI * u) + 0.05})`, zIndex: 3}}>
      <div style={{...CARD, borderRadius: 999, padding: '14px 30px', display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', fontSize: 34, fontWeight: 700}}>
        <svg width={36} height={36} viewBox="0 0 24 24">
          <path d="M6 3h8l4 4v14H6z" fill={tone.soft} stroke={tone.main} strokeWidth={2} strokeLinejoin="round" />
          <path d="M9 12h6M9 16h6" stroke={tone.main} strokeWidth={2} strokeLinecap="round" />
        </svg>
        {m.item}
      </div>
      <Sfx at={c.inAt} name="swish" />
      <Sfx at={c.inAt + 22} name="thud" volume={0.7} />
    </div>
  );
};

// ------------------------------------------------------------------ mystery: something in your hand you haven't noticed
const MysteryHand: React.FC<{m: Extract<Moment, {kind: 'mystery'}>; c: Clock}> = ({m, c}) => {
  const float = Math.sin((c.f - c.inAt) / 9) * 5;
  const glow = 0.16 + 0.08 * Math.sin((c.f - c.inAt) / 6);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 26, fontFamily: FONT, direction: 'rtl'}}>
      <svg width={190} height={165} viewBox="0 0 240 208" style={{overflow: 'visible', transform: `translateY(${float}px)`}}>
        <circle cx={120} cy={84} r={86} fill={C.yellow} opacity={glow} />
        <g style={{filter: 'blur(3.5px)'}}>
          <rect x={80} y={8} width={80} height={150} rx={16} fill={C.ink} />
          <rect x={88} y={22} width={64} height={118} rx={7} fill={C.ink2} />
        </g>
        <path d="M58 208 C56 168 70 140 98 132 L146 132 C174 140 188 168 186 208 Z" fill={C.ink2} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={56} y={70 + k * 20} width={46} height={18} rx={9} fill={C.ink2} stroke={C.bg} strokeWidth={2} />)}
        <rect x={140} y={92} width={50} height={20} rx={10} fill={C.ink2} stroke={C.bg} strokeWidth={2} transform="rotate(-38 165 102)" />
        <circle cx={120} cy={74} r={32} fill={C.yellow} />
        <text x={120} y={89} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={44} fill={C.ink}>
          ؟
        </text>
      </svg>
      {m.label ? <div style={{fontSize: 40, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap'}}>{m.label}</div> : null}
      <Sfx at={c.inAt} name="shimmer" />
    </div>
  );
};

// ------------------------------------------------------------------ the layer
type Timed = {m: Moment; inAt: number; outAt: number; moveAt: number};

const schedule = (moments: Moment[], plan: ScenePlan, narration: string): Timed[] => {
  const inAt = moments.map((m, i) => cueAt(plan, narration, m.cue, (i + 0.5) / Math.max(1, moments.length)));
  const until = moments.map((m) => (m.until ? cueAt(plan, narration, m.until, 1) : null));
  const slot = (m: Moment) => m.slot ?? 'stage';
  const out: number[] = moments.map((m, i) => {
    if (until[i] !== null) return until[i] as number;
    if (m.over) return plan.frames;
    const next = moments.findIndex((n, j) => j !== i && !n.over && n.kind !== 'send' && slot(n) === slot(m) && inAt[j] > inAt[i]);
    return next >= 0 ? inAt[next] : plan.frames;
  });
  // a moment sitting on another one leaves with it
  moments.forEach((m, i) => {
    if (!m.over || until[i] !== null) return;
    const base = moments.map((n, j) => j).filter((j) => j !== i && !moments[j].over && slot(moments[j]) === slot(m) && inAt[j] <= inAt[i]).pop();
    if (base !== undefined) out[i] = out[base];
  });
  return moments.map((m, i) => ({m, inAt: inAt[i], outAt: out[i], moveAt: m.moveTo ? cueAt(plan, narration, m.moveCue, 0.5) : Infinity}));
};

export const Moments: React.FC<{moments?: Moment[]; plan: ScenePlan; narration: string}> = ({moments, plan, narration}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const portrait = usePortrait();
  if (!moments || moments.length === 0) return null;
  const slots = portrait ? SLOTS_PORTRAIT : SLOTS;
  return (
    <>
      {schedule(moments, plan, narration).map(({m, inAt, outAt, moveAt}, i) => {
        const c: Clock = {f, inAt, at: (cue, fallback = 0.5) => cueAt(plan, narration, cue, fallback)};
        const shown = f >= inAt && f < outAt + 12;
        const sounds: SfxName | null = Number.isFinite(moveAt) ? 'swish' : null;
        if (m.kind === 'send') return shown ? <SendItem key={i} m={m} c={c} portrait={portrait} /> : null;
        let body: React.ReactNode = null;
        if (shown) {
          if (m.kind === 'date') body = <DateCard m={m} c={c} />;
          else if (m.kind === 'profile') body = <ProfileCard m={m} c={c} />;
          else if (m.kind === 'stamp') body = <StampMark m={m} c={c} />;
          else if (m.kind === 'quote') body = <QuoteCard m={m} c={c} plan={plan} narration={narration} />;
          else if (m.kind === 'count') body = <CountCard m={m} c={c} />;
          else if (m.kind === 'question') body = <QuestionMark m={m} c={c} />;
          else if (m.kind === 'share') body = <ShareCard m={m} c={c} />;
          else if (m.kind === 'chips') body = <ChipRow m={m} c={c} />;
          else if (m.kind === 'people') body = <PeopleCard m={m} c={c} />;
          else if (m.kind === 'tally') body = <TallyCard m={m} c={c} />;
          else if (m.kind === 'mystery') body = <MysteryHand m={m} c={c} />;
        }
        const [sx, sy] = slots[m.slot ?? 'stage'];
        const [mx, my] = m.moveTo ? slots[m.moveTo] : [sx, sy];
        const mv = ramp(f, moveAt, 20, EASE_IN_OUT);
        const [dx, dy] = m.nudge ?? [0, 0];
        const enter = m.kind === 'stamp' ? 1 : spring({frame: f - inAt, fps, config: {damping: 15, stiffness: 150, mass: 0.7}});
        const exit = interpolate(f, [outAt, outAt + 12], [0, 1], {...clamp, easing: EASE_OUT});
        return (
          <React.Fragment key={i}>
            {shown ? (
              <div
                style={{
                  position: 'absolute',
                  left: sx + (mx - sx) * mv + dx,
                  top: sy + (my - sy) * mv + dy,
                  transform: `translate(-50%, -50%) translateY(${(1 - enter) * 40 - exit * 30}px) scale(${(0.86 + 0.14 * enter) * (1 - 0.18 * mv) * (1 - 0.06 * exit)})`,
                  opacity: Math.min(1, enter * 1.3) * (1 - exit),
                  zIndex: m.over ? 6 : 2,
                }}
              >
                {body}
              </div>
            ) : null}
            {sounds && f < outAt ? <Sfx at={moveAt} name={sounds} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};
