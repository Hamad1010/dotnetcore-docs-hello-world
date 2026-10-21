// More explainer moments (see Moments.tsx for the layer that places and times them): a headline, a wrench that
// turns, a 24-hour day, many copies of a shape, a self-check, a side-by-side comparison, a phone chat, a sum built
// term by term, numbered steps, a phone's emergency alert, a button pressed, a globe flying to a place, a search
// trend and the next case file. Plain shapes in our palette; each one has its sound.
import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {geoMercator, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {C, EASE_IN_OUT, FONT} from '../theme';
import type {Moment} from '../types';
import type {ScenePlan} from '../lib/plan';
import {wordFrames} from '../scenes/common';
import {Globe} from './Globe';
import {Person} from './Silhouettes';
import {Sfx} from './Sfx';
import {CARD, clamp, DEEP, LTR, numDir, ramp, TONE, type Clock} from './moment-kit';

type K<T extends Moment['kind']> = {m: Extract<Moment, {kind: T}>; c: Clock};
const spr = (f: number, at: number, fps: number, damping = 14, stiffness = 130) =>
  Number.isFinite(at) ? spring({frame: f - at, fps, config: {damping, stiffness, mass: 0.7}}) : 0;

// ------------------------------------------------------------------ headline
export const Headline: React.FC<K<'headline'>> = ({m, c}) => {
  const tone = TONE[m.tone ?? 'accent'];
  const line = ramp(c.f, c.inAt + 4, 20);
  const subAt = m.subCue ? c.at(m.subCue, 0.6) : c.inAt + 10;
  const sub = ramp(c.f, subAt, 16);
  return (
    <div style={{width: 1560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, direction: 'rtl', fontFamily: FONT, textAlign: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}>
        {m.badge ? (
          <div style={{flex: '0 0 auto', width: 120, height: 120, borderRadius: 999, background: tone.main, color: '#fff', fontSize: 68, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 16px 34px ${tone.main}55`}}>
            <span style={LTR}>{m.badge}</span>
          </div>
        ) : null}
        <div style={{fontSize: 76, fontWeight: 700, color: C.ink, lineHeight: 1.25}}>{m.text}</div>
      </div>
      <div style={{width: 380 * line, height: 10, borderRadius: 6, background: tone.main}} />
      {m.sub ? <div style={{fontSize: 44, fontWeight: 500, color: C.ink2, opacity: sub, transform: `translateY(${(1 - sub) * 12}px)`}}>{m.sub}</div> : null}
      <Sfx at={c.inAt} name="swish" />
      {m.sub && m.subCue ? <Sfx at={subAt} name="pop" volume={0.7} /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ wrench: same force, longer handle
export const Wrench: React.FC<K<'wrench'>> = ({m, c}) => {
  const {fps} = useVideoConfig();
  const longAt = m.longCue ? c.at(m.longCue, 0.3) : -Infinity;
  const turnAt = m.turnCue ? c.at(m.turnCue, 0.5) : Infinity;
  const slipAt = m.slipCue ? c.at(m.slipCue, 0.5) : Infinity;
  const grow = Number.isFinite(longAt) ? spr(c.f, longAt, fps, 14, 120) : 1;
  const L = 150 + 270 * grow;
  const tryAt = m.tryCue ? c.at(m.tryCue, 0.15) : c.inAt;
  const stuckAt = m.stuckCue ? c.at(m.stuckCue, 0.2) : m.tryCue ? Infinity : -Infinity;
  const stuck = Boolean(m.longCue) && c.f < longAt;
  const trying = stuck && c.f >= tryAt ? Math.sin((c.f - tryAt) / 2.2) * 2.5 * ramp(c.f, tryAt, 10) : 0;
  const turn = spr(c.f, turnAt, fps, 12, 110);
  const slip = spr(c.f, slipAt, fps, 9, 170);
  const angle = trying - 38 * turn - 40 * slip;
  const nutAngle = -38 * turn;
  const hex = Array.from({length: 6}, (_, k) => `${190 + 54 * Math.cos((Math.PI / 3) * k)},${200 + 54 * Math.sin((Math.PI / 3) * k)}`).join(' ');
  const state = c.f >= slipAt ? 'slip' : c.f >= turnAt ? 'done' : !m.longCue || c.f >= longAt ? 'long' : c.f >= stuckAt ? 'short' : 'tight';
  const chip = {
    tight: {text: 'صامولة ماسكة', bg: C.surface, fg: C.ink2},
    short: {text: 'يد قصيرة… ما تتحرك', bg: C.redSoft, fg: C.red},
    long: {text: m.label ?? 'نفس القوة… يد أطول', bg: C.blueSoft, fg: C.blue},
    done: {text: m.doneLabel ?? 'تنفك ✓', bg: C.greenSoft, fg: '#1F8A52'},
    slip: {text: m.doneLabel ?? 'انزلق… والضربة أكبر', bg: C.redSoft, fg: C.red},
  }[state];
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: FONT, direction: 'rtl'}}>
      <svg width={760} height={400} viewBox="0 0 760 400" style={{overflow: 'visible'}}>
        <ellipse cx={380} cy={370} rx={300} ry={18} fill={C.ink} opacity={0.08} />
        <g transform={`rotate(${angle} 190 200)`}>
          <circle cx={190} cy={200} r={84} fill={C.ink2} />
          <rect x={250} y={180} width={L} height={40} rx={20} fill={state === 'slip' ? C.red : C.blue} />
          <g transform={`translate(${250 + L - 30} 128)`}>
            <path d="M0 0 v34 M-12 22 L0 36 L12 22" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        <g transform={`rotate(${nutAngle} 190 200)`}>
          <polygon points={hex} fill={C.ink} />
          <circle cx={190} cy={200} r={20} fill={C.ink3} />
        </g>
        {slip > 0.05 ? (
          <g transform={`translate(${190 + Math.cos(((angle) * Math.PI) / 180) * (250 + L - 190)} ${200 + Math.sin((angle * Math.PI) / 180) * (250 + L - 190)}) scale(${slip})`}>
            <polygon points="0,-46 12,-12 46,-14 18,8 30,42 0,20 -30,42 -18,8 -46,-14 -12,-12" fill={C.red} opacity={0.9} />
          </g>
        ) : null}
      </svg>
      <div style={{fontSize: 40, fontWeight: 700, color: chip.fg, background: chip.bg, borderRadius: 999, padding: '10px 34px', boxShadow: DEEP}}>{chip.text}</div>
      {m.stuckCue && Number.isFinite(stuckAt) ? <Sfx at={stuckAt} name="buzz" volume={0.6} /> : null}
      {Number.isFinite(longAt) ? <Sfx at={longAt} name="swish" /> : null}
      {Number.isFinite(turnAt) ? <Sfx at={turnAt + 4} name="thud" /> : null}
      {Number.isFinite(slipAt) ? <Sfx at={slipAt + 3} name="impact" volume={0.7} /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ clock: one day, 24 hours, for everyone
export const DayClock: React.FC<K<'clock'>> = ({m, c}) => {
  const p = ramp(c.f, c.inAt, 40, EASE_IN_OUT);
  const hours = m.hours ?? 24;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, fontFamily: FONT, direction: 'rtl'}}>
      <svg width={340} height={340} viewBox="-170 -170 340 340">
        <circle r={150} fill={C.surface} style={{filter: 'drop-shadow(0 18px 30px rgba(28,35,51,0.16))'}} />
        {Array.from({length: hours}, (_, k) => {
          const a = (2 * Math.PI * k) / hours - Math.PI / 2;
          const big = k % 6 === 0;
          return <line key={k} x1={Math.cos(a) * (big ? 112 : 122)} y1={Math.sin(a) * (big ? 112 : 122)} x2={Math.cos(a) * 136} y2={Math.sin(a) * 136} stroke={k / hours <= p ? C.blue : C.line} strokeWidth={big ? 7 : 4} strokeLinecap="round" />;
        })}
        <circle r={96} fill="none" stroke={C.blueSoft} strokeWidth={14} />
        <circle r={96} fill="none" stroke={C.blue} strokeWidth={14} pathLength={1} strokeDasharray={`${p} 1`} transform="rotate(-90)" strokeLinecap="round" />
        <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={84} fill={C.ink}>
          {Math.round(hours * p)}
        </text>
        <text y={64} textAnchor="middle" fontFamily={FONT} fontWeight={500} fontSize={30} fill={C.ink2}>
          ساعة
        </text>
      </svg>
      {m.label ? <div style={{fontSize: 38, fontWeight: 700, color: C.ink, textAlign: 'center', maxWidth: 820, lineHeight: 1.35, opacity: m.labelCue ? ramp(c.f, c.at(m.labelCue, 0.6), 12) : 1}}>{m.label}</div> : null}
      <Sfx at={c.inAt} name="roll" />
      {m.label && m.labelCue ? <Sfx at={c.at(m.labelCue, 0.6)} name="pop" volume={0.7} /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ times: many copies of one shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = world as any;
let saudiPath: string | null = null;
const saudi = () => {
  if (!saudiPath) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sa = (feature(topo, topo.objects.countries) as any).features.find((x: {id?: string}) => x.id === '682') as GeoPermissibleObjects;
    saudiPath = geoPath(geoMercator().fitExtent([[3, 3], [93, 79]], sa))(sa) ?? '';
  }
  return saudiPath;
};

const Shape: React.FC<{shape: 'saudi' | 'person' | 'device' | 'door'; color: string; mark?: string; markP?: number}> = ({shape, color, mark, markP = 1}) => {
  if (shape === 'person') return <Person size={74} color={color} />;
  if (shape === 'saudi')
    return (
      <svg width={96} height={82}>
        <path d={saudi()} fill={color} />
      </svg>
    );
  if (shape === 'device')
    return (
      <svg width={92} height={80} viewBox="0 0 46 40">
        <rect x={3} y={3} width={40} height={26} rx={3} fill={color} />
        <rect x={6} y={6} width={34} height={20} rx={1.5} fill="#fff" opacity={0.3} />
        <rect x={19} y={29} width={8} height={6} fill={color} />
        <rect x={13} y={35} width={20} height={3} rx={1.5} fill={color} />
      </svg>
    );
  return (
    <div style={{position: 'relative', width: 70, height: 108}}>
      <svg width={70} height={108} viewBox="0 0 35 54">
        <rect x={2} y={2} width={31} height={52} rx={2} fill={color} />
        <rect x={6} y={6} width={23} height={20} rx={1.5} fill="#fff" opacity={0.18} />
        <rect x={6} y={30} width={23} height={20} rx={1.5} fill="#fff" opacity={0.18} />
        <circle cx={27} cy={29} r={2} fill="#fff" opacity={0.8} />
      </svg>
      {mark && markP > 0 ? <div style={{position: 'absolute', top: 30, left: '50%', transform: `translateX(-50%) rotate(-12deg) scale(${1.8 - 0.8 * markP})`, opacity: Math.min(1, markP * 2), fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.red, background: '#fff', borderRadius: 10, padding: '0 8px', border: `3px solid ${C.red}`}}>{mark}</div> : null}
    </div>
  );
};

export const Times: React.FC<K<'times'>> = ({m, c}) => {
  const tone = TONE[m.tone ?? 'accent'];
  const per = m.count > 10 ? Math.ceil(m.count / 3) : m.count;
  const markAt = m.mark && m.markCue ? c.at(m.markCue, 0.6) : -Infinity;
  const markP = (k: number) => (Number.isFinite(markAt) ? ramp(c.f, markAt + k * 7, 6) : 1);
  return (
    <div style={{...CARD, padding: '30px 44px', display: 'flex', alignItems: 'center', gap: 40}}>
      {m.value ? <div style={{fontSize: 118, fontWeight: 700, color: tone.main, lineHeight: 1, whiteSpace: 'nowrap'}}><span style={numDir(m.value)}>{m.value}</span></div> : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'}}>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${per}, auto)`, gap: 10, direction: 'rtl'}}>
          {Array.from({length: m.count}, (_, k) => {
            const p = ramp(c.f, c.inAt + 6 + k * 2.5, 8);
            return (
              <div key={k} style={{opacity: p, transform: `scale(${0.6 + 0.4 * p})`}}>
                <Shape shape={m.shape} color={tone.main} mark={m.mark} markP={markP(k)} />
              </div>
            );
          })}
        </div>
        {m.label ? <div style={{fontSize: 36, fontWeight: 700, color: C.ink}}>{m.label}</div> : null}
      </div>
      <Sfx at={c.inAt} name="pop" />
      <Sfx at={c.inAt + 6} name="roll" />
      {Number.isFinite(markAt) ? Array.from({length: m.count}, (_, k) => <Sfx key={k} at={markAt + k * 7} name="thud" volume={0.55} />) : null}
    </div>
  );
};

// ------------------------------------------------------------------ quiz: one question at a time, then the bands
export const Quiz: React.FC<K<'quiz'>> = ({m, c}) => {
  const times = m.items.map((it, k) => c.at(it.cue, 0.1 + k * 0.12));
  const cur = times.reduce((a, t, k) => (c.f >= t ? k : a), -1);
  const bands = m.bands ?? [];
  const bandsAt = bands.length ? c.at(bands[0].cue, 0.8) : Infinity;
  const askAt = m.ask ? c.at(m.ask.cue, 0.75) : Infinity;
  const asking = c.f >= askAt && c.f < bandsAt;
  const showBands = c.f >= bandsAt;
  const q = cur >= 0 ? ramp(c.f, times[cur], 10) : 0;
  return (
    <div style={{...CARD, width: 1300, padding: '36px 48px 40px', display: 'flex', flexDirection: 'column', gap: 26}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20}}>
        <div style={{fontSize: 46, fontWeight: 700}}>{m.title ?? 'اختبر نفسك'}</div>
        {m.hint ? <div style={{fontSize: 30, fontWeight: 600, color: '#8A5E00', background: C.yellowSoft, borderRadius: 999, padding: '8px 24px'}}>{m.hint}</div> : null}
      </div>
      <div style={{display: 'flex', gap: 16}}>
        {m.items.map((_, k) => {
          const on = k <= cur;
          const now = k === cur && !showBands;
          return (
            <div key={k} style={{width: 64, height: 64, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700,
              background: on ? C.blue : C.surface, color: on ? '#fff' : C.ink3, border: `4px solid ${on ? C.blue : C.line}`,
              transform: `scale(${now ? 1.12 + 0.04 * Math.sin(c.f / 5) : 1})`}}>
              {k + 1}
            </div>
          );
        })}
      </div>
      <div style={{minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        {asking ? (
          <div style={{fontSize: 64, fontWeight: 700, color: C.blue, textAlign: 'center', opacity: ramp(c.f, askAt, 10)}}>
            {m.ask?.text}
            <Sfx at={askAt} name="question" />
          </div>
        ) : null}
        {!showBands && !asking && cur >= 0 ? (
          <div style={{opacity: q, transform: `translateX(${(1 - q) * -40}px)`}}>
            <div style={{fontSize: 30, fontWeight: 600, color: C.ink2}}>السؤال {['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'][cur]}</div>
            <div style={{fontSize: 54, fontWeight: 700, lineHeight: 1.4, marginTop: 8}}>{m.items[cur].text}</div>
            {m.items[cur].sub ? <div style={{fontSize: 34, fontWeight: 500, color: C.ink2, marginTop: 12, opacity: ramp(c.f, c.at(m.items[cur].subCue, 0.5), 12)}}>{m.items[cur].sub}</div> : null}
          </div>
        ) : null}
        {showBands ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {bands.map((b, k) => {
              const at = c.at(b.cue, 0.85 + k * 0.05);
              const p = ramp(c.f, at, 12);
              const tone = TONE[b.tone ?? 'accent'];
              return (
                <div key={k} style={{display: 'flex', alignItems: 'center', gap: 24, opacity: 0.2 + 0.8 * p, transform: `translateX(${(1 - p) * -30}px)`}}>
                  <div style={{flex: '0 0 170px', textAlign: 'center', fontSize: 40, fontWeight: 700, color: tone.main, background: tone.soft, borderRadius: 18, padding: '10px 0'}}>
                    <span style={LTR}>{b.range}</span>
                  </div>
                  <div style={{fontSize: 38, fontWeight: 600, lineHeight: 1.35}}>{b.text}</div>
                  <Sfx at={at} name="pop" />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      {times.map((t, k) => <Sfx key={k} at={t} name="tick" />)}
    </div>
  );
};

// ------------------------------------------------------------------ versus: two things side by side
export const Versus: React.FC<K<'versus'>> = ({m, c}) => {
  const bAt = m.b.cue ? c.at(m.b.cue, 0.5) : c.inAt + 18;
  const aAt = m.a.cue ? c.at(m.a.cue, 0.2) : c.inAt;
  const side = (s: typeof m.a, at: number) => {
    const p = ramp(c.f, at, 14);
    const tone = TONE[s.tone ?? 'accent'];
    const noteAt = s.noteCue ? c.at(s.noteCue, 0.6) : at;
    const note = s.noteCue ? ramp(c.f, noteAt, 12) : 1;
    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.12 + 0.88 * p, transform: `translateY(${(1 - p) * 20}px)`, textAlign: 'center'}}>
        <div style={{fontSize: 38, fontWeight: 700, color: C.ink2}}>{s.title}</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12, color: tone.main}}>
          <span style={{fontSize: s.value.length <= 5 ? 108 : s.value.length <= 9 ? 84 : 68, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{s.value}</span>
          {s.unit ? <span style={{fontSize: 40, fontWeight: 700}}>{s.unit}</span> : null}
        </div>
        {s.note ? <div style={{fontSize: 34, fontWeight: 600, color: C.ink, background: tone.soft, borderRadius: 999, padding: '6px 24px', marginTop: 6, opacity: note, transform: `translateY(${(1 - note) * 10}px)`}}>{s.note}</div> : null}
        {s.note && s.noteCue ? <Sfx at={noteAt} name="pop" volume={0.7} /> : null}
      </div>
    );
  };
  return (
    <div style={{position: 'relative'}}>
      {m.title ? (
        <div style={{position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 26, whiteSpace: 'nowrap', fontFamily: FONT, direction: 'rtl', fontSize: 46, fontWeight: 700, color: C.ink, background: C.yellow, borderRadius: 999, padding: '10px 40px', boxShadow: '0 14px 30px rgba(201,138,0,0.3)'}}>
          {m.title}
          <Sfx at={c.inAt} name="question" />
        </div>
      ) : null}
      <div style={{...CARD, width: 1340, padding: '40px 40px 44px', display: 'flex', alignItems: 'center', gap: 20}}>
        {side(m.a, aAt)}
        <div style={{flex: '0 0 auto', fontSize: 30, fontWeight: 700, color: C.ink3, border: `3px solid ${C.line}`, borderRadius: 999, padding: '6px 20px'}}>{m.mid ?? 'مقابل'}</div>
        {side(m.b, bAt)}
      </div>
      {m.title && aAt <= c.inAt + 2 ? null : <Sfx at={aAt} name="pop" />}
      <Sfx at={bAt} name="thud" />
    </div>
  );
};

// ------------------------------------------------------------------ chat: a phone, messages arriving on their words
export const Chat: React.FC<K<'chat'>> = ({m, c}) => {
  const badgeAt = m.badge ? c.at(m.badgeCue, 0.5) : Infinity;
  const badge = ramp(c.f, badgeAt, 12);
  return (
    <div style={{position: 'relative', fontFamily: FONT, direction: 'rtl'}}>
      <div style={{width: 380, height: 680, borderRadius: 56, background: C.ink, padding: 14, boxShadow: DEEP}}>
        <div style={{width: '100%', height: '100%', borderRadius: 44, background: C.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 92, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px 0', fontSize: 28, fontWeight: 700}}>
            <div style={{width: 46, height: 46, borderRadius: 99, background: 'rgba(255,255,255,0.3)'}} />
            {m.title ?? 'محادثة'}
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, padding: 18}}>
            {m.bubbles.map((b, k) => {
              const at = c.at(b.cue, 0.2 + k * 0.1);
              if (c.f < at) return null;
              const p = ramp(c.f, at, 8);
              return (
                <div key={k} style={{alignSelf: b.me ? 'flex-end' : 'flex-start', maxWidth: '84%', background: b.me ? C.greenSoft : C.surface, borderRadius: 20, padding: '12px 18px', fontSize: 27, fontWeight: 600, lineHeight: 1.35, boxShadow: '0 2px 6px rgba(28,35,51,0.08)', opacity: p, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: b.me ? 'left bottom' : 'right bottom'}}>
                  {b.text}
                  <Sfx at={at} name="bubble" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {m.badge && badge > 0 ? (
        <div style={{position: 'absolute', top: -96, left: '50%', marginLeft: -170, width: 340, textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.ink, background: C.yellowSoft, borderRadius: 26, padding: '14px 18px', boxShadow: DEEP, opacity: badge, transform: `scale(${0.8 + 0.2 * badge})`}}>
          {m.badge}
          <Sfx at={badgeAt} name="pop" />
        </div>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------------ math: a sum built term by term (blanks for a puzzle)
export const MathSum: React.FC<K<'math'>> = ({m, c}) => {
  const times = m.terms.map((t, k) => (t.cue ? c.at(t.cue, 0.3) : c.inAt + k * 5));
  const term = (t: (typeof m.terms)[number], k: number) => {
    const p = ramp(c.f, times[k], 10);
    if (t.op) return <div key={k} style={{fontSize: 70, fontWeight: 700, color: C.ink3, opacity: p, padding: '0 4px'}}>{t.text}</div>;
    return (
      <div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
        {t.blank ? (
          <div style={{minWidth: 150, height: 112, borderRadius: 24, border: `4px dashed ${C.ink3}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 700, color: C.ink3, background: 'rgba(255,255,255,0.6)'}}>؟</div>
        ) : (
          <div style={{...CARD, borderRadius: 24, padding: '16px 32px', fontSize: 52, fontWeight: 700, whiteSpace: 'nowrap'}}>{t.text}</div>
        )}
        {t.label ? <div style={{fontSize: 27, fontWeight: 600, color: C.ink2, whiteSpace: 'nowrap'}}>{t.label}</div> : null}
        <Sfx at={times[k]} name="tick" />
      </div>
    );
  };
  const [g0, g1] = m.group ?? [-1, -1];
  const parts: React.ReactNode[] = [];
  for (let k = 0; k < m.terms.length; k++) {
    if (k === g0) {
      const inner = m.terms.slice(g0, g1 + 1).map((t, j) => term(t, g0 + j));
      parts.push(
        <div key={`g${k}`} style={{display: 'flex', alignItems: 'center', gap: 18, border: `4px solid ${C.blue}`, borderRadius: 36, padding: '14px 22px', opacity: ramp(c.f, times[g0], 10)}}>
          {inner}
        </div>,
      );
      k = g1;
      continue;
    }
    parts.push(term(m.terms[k], k));
  }
  const resAt = m.result ? c.at(m.result.cue, 0.9) : Infinity;
  const res = ramp(c.f, resAt, 12);
  const tone = TONE[m.result?.tone ?? 'accent'];
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, fontFamily: FONT, direction: 'rtl'}}>
      {m.title ? <div style={{fontSize: 44, fontWeight: 700, color: C.ink}}>{m.title}</div> : null}
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        {parts}
        {m.result && res > 0 ? (
          <>
            <div style={{fontSize: 70, fontWeight: 700, color: C.ink3}}>=</div>
            <div style={{fontSize: 56, fontWeight: 700, color: tone.main, background: tone.soft, borderRadius: 24, padding: '16px 34px', whiteSpace: 'nowrap', opacity: res, transform: `scale(${0.8 + 0.2 * res})`}}>{m.result.text}</div>
          </>
        ) : null}
      </div>
      {Number.isFinite(resAt) ? <Sfx at={resAt} name="ping" /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ steps: numbered, each on its word
export const Steps: React.FC<K<'steps'>> = ({m, c}) => {
  const tone = TONE[m.tone ?? 'accent'];
  const times = m.items.map((it, k) => c.at(it.cue, 0.2 + k * 0.25));
  const last = times.reduce((a, t, k) => (c.f >= t ? k : a), -1);
  return (
    <div style={{...CARD, width: 1280, padding: '34px 46px 40px', display: 'flex', flexDirection: 'column', gap: 18}}>
      {m.title ? <div style={{fontSize: 44, fontWeight: 700, marginBottom: 6}}>{m.title}</div> : null}
      {m.items.map((it, k) => {
        const p = ramp(c.f, times[k], 12);
        const done = k < last;
        const now = k === last;
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 18px', borderRadius: 22, background: now ? tone.soft : 'transparent', opacity: 0.15 + 0.85 * p, transform: `translateX(${(1 - p) * -36}px)`}}>
            <div style={{flex: '0 0 68px', height: 68, borderRadius: 999, background: done ? C.green : now ? tone.main : C.line, color: '#fff', fontSize: 34, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {done ? '✓' : k + 1}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{fontSize: 42, fontWeight: 700, lineHeight: 1.3}}>{it.text}</div>
              {it.sub ? <div style={{fontSize: 30, fontWeight: 500, color: C.ink2, opacity: it.subCue ? ramp(c.f, c.at(it.subCue, 0.9), 12) : 1}}>{it.sub}</div> : null}
            </div>
            <Sfx at={times[k]} name="tick" />
            {it.sub && it.subCue ? <Sfx at={c.at(it.subCue, 0.9)} name="pop" volume={0.6} /> : null}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ alert: the emergency message on a phone
export const Alert: React.FC<K<'alert'> & {plan: ScenePlan; narration: string}> = ({m, c, plan, narration}) => {
  const words = m.text.split(' ');
  const said = wordFrames(plan, narration, m.textCue ?? words.slice(0, 2).join(' '), words.length);
  const frames = said.length ? said : words.map((_, k) => c.inAt + 10 + k * 6);
  const age = c.f - c.inAt;
  const shake = Math.sin(age * 2.3) * 12 * Math.exp(-age / 9);
  const orig = ramp(c.f, frames[frames.length - 1] + 14, 14);
  return (
    <div style={{width: 420, height: 760, borderRadius: 60, background: C.ink, padding: 14, boxShadow: DEEP, transform: `translateX(${shake}px)`, fontFamily: FONT}}>
      <div style={{width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: 'linear-gradient(180deg, #1C2333 0%, #34405C 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '54px 18px 0'}}>
        <div style={{...LTR, color: '#fff', fontSize: 92, fontWeight: 500, lineHeight: 1}}>{m.time ?? '8:07'}</div>
        {m.date ? <div style={{color: 'rgba(255,255,255,0.75)', fontSize: 26, marginTop: 10, direction: 'rtl'}}>{m.date}</div> : null}
        <div style={{marginTop: 40, width: '100%', background: 'rgba(255,255,255,0.96)', borderRadius: 26, padding: '18px 22px 22px', direction: 'rtl', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, fontWeight: 700, color: C.red}}>
            <div style={{width: 16, height: 16, borderRadius: 99, background: C.red}} />
            {m.title}
            <span style={{marginRight: 'auto', fontSize: 22, color: C.ink3, fontWeight: 500}}>الآن</span>
          </div>
          <div style={{fontSize: 33, fontWeight: 700, color: C.ink, lineHeight: 1.45, marginTop: 10}}>
            {words.map((w, k) => (
              <span key={k} style={{opacity: ramp(c.f, frames[k], 5), marginLeft: 9, display: 'inline-block'}}>
                {w}
              </span>
            ))}
          </div>
          {m.original ? <div style={{...LTR, fontSize: 17, color: C.ink3, marginTop: 12, textAlign: 'left', opacity: orig, lineHeight: 1.35}}>{m.original}</div> : null}
        </div>
      </div>
      <Sfx at={c.inAt} name="buzz" />
      <Sfx at={c.inAt + 16} name="buzz" />
    </div>
  );
};

// ------------------------------------------------------------------ button: pressed on a word
export const PressButton: React.FC<K<'button'>> = ({m, c}) => {
  const {fps} = useVideoConfig();
  const pressAt = m.pressCue ? c.at(m.pressCue, 0.5) : c.inAt + 20;
  const tone = TONE[m.tone ?? 'neg'];
  const toward = ramp(c.f, pressAt - 16, 16, EASE_IN_OUT);
  const press = c.f >= pressAt ? 1 - spr(c.f, pressAt, fps, 10, 200) : 0;
  const ring = interpolate(c.f, [pressAt, pressAt + 18], [0, 1], clamp);
  return (
    <div style={{position: 'relative', fontFamily: FONT, direction: 'rtl', padding: 40}}>
      {ring > 0 && ring < 1 ? <div style={{position: 'absolute', inset: 40 - 30 * ring, borderRadius: 999, border: `6px solid ${tone.main}`, opacity: 1 - ring}} /> : null}
      <div style={{background: tone.main, color: '#fff', fontSize: 64, fontWeight: 700, borderRadius: 999, padding: '28px 90px', boxShadow: `0 ${18 - 12 * (c.f >= pressAt ? 1 - press : 0)}px 36px ${tone.main}66`, transform: `scale(${1 - 0.07 * (c.f >= pressAt ? 1 - press : 0)})`}}>{m.text}</div>
      <svg width={90} height={110} viewBox="0 0 30 37" style={{position: 'absolute', left: 120 - 60 * toward, top: 150 - 70 * toward}}>
        <path d="M3 2 L3 28 L10 22 L15 34 L20 32 L15 20 L25 20 Z" fill="#fff" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
      <Sfx at={pressAt} name="click" />
    </div>
  );
};

// ------------------------------------------------------------------ globe: from Riyadh to the place
export const PlaceGlobe: React.FC<K<'globe'>> = ({m, c}) => {
  const arrive = c.inAt + 45;
  const label = ramp(c.f, arrive, 12);
  const subAt = m.subCue ? Math.max(arrive, c.at(m.subCue, 0.7)) : arrive;
  const sub = ramp(c.f, subAt, 12);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: FONT, direction: 'rtl'}}>
      <Globe size={460} accent={C.red} keys={[{at: c.inAt - 1, pos: {lat: 24.71, lon: 46.68}}, {at: arrive, pos: {lat: m.lat, lon: m.lon}}]} pin={{lat: m.lat, lon: m.lon, at: arrive}} />
      <div style={{textAlign: 'center', opacity: label, transform: `translateY(${(1 - label) * 14}px)`}}>
        <div style={{fontSize: 46, fontWeight: 700, color: C.ink}}>{m.label}</div>
        {m.sub ? <div style={{fontSize: 32, fontWeight: 500, color: C.ink2, marginTop: 4, opacity: sub}}>{m.sub}</div> : null}
      </div>
      <Sfx at={c.inAt} name="whoosh" />
      <Sfx at={arrive} name="pop" />
      {m.sub && m.subCue ? <Sfx at={subAt} name="tick" /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ search: a query typed, a trend rising
export const SearchTrend: React.FC<K<'search'>> = ({m, c}) => {
  const typed = Math.round(m.query.length * ramp(c.f, c.inAt + 4, 24));
  const line = ramp(c.f, c.inAt + 26, 36, EASE_IN_OUT);
  const noteAt = m.note ? c.at(m.noteCue, 0.6) : Infinity;
  const note = ramp(c.f, Number.isFinite(noteAt) ? noteAt : c.inAt + 40, 14);
  const pts = Array.from({length: 13}, (_, k) => [40 + k * 70, 150 - Math.pow(k / 12, 2.2) * 120 + Math.sin(k * 1.7) * 6]);
  const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x} ${y}`).join(' ');
  return (
    <div style={{...CARD, width: 1060, padding: '34px 44px 36px', display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, border: `3px solid ${C.line}`, borderRadius: 999, padding: '18px 30px'}}>
        <svg width={40} height={40} viewBox="0 0 24 24">
          <circle cx={10} cy={10} r={6.5} fill="none" stroke={C.ink2} strokeWidth={2.6} />
          <path d="M15 15l6 6" stroke={C.ink2} strokeWidth={2.8} strokeLinecap="round" />
        </svg>
        <div style={{fontSize: 42, fontWeight: 600}}>
          {m.query.slice(0, typed)}
          <span style={{opacity: Math.floor(c.f / 8) % 2 ? 0 : 1, color: C.blue}}>|</span>
        </div>
      </div>
      <svg width={970} height={170}>
        <path d={d} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${line} 1`} />
        {line > 0.98 ? <path d={`M${pts[12][0] - 18} ${pts[12][1] + 4} L${pts[12][0]} ${pts[12][1] - 16} L${pts[12][0] + 16} ${pts[12][1] + 6}`} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      {m.note ? <div style={{fontSize: 36, fontWeight: 700, color: C.ink, opacity: note}}>{m.note}</div> : null}
      <Sfx at={c.inAt + 4} name="type" />
      <Sfx at={c.inAt + 12} name="type2" />
      <Sfx at={c.inAt + 20} name="type" />
      <Sfx at={c.inAt + 60} name="ping" />
    </div>
  );
};

// ------------------------------------------------------------------ file: the next case file
export const CaseFile: React.FC<K<'file'>> = ({m, c}) => {
  const note = ramp(c.f, c.inAt + 14, 12);
  return (
    <div style={{position: 'relative', width: 820, fontFamily: FONT, direction: 'rtl'}}>
      <div style={{width: 260, height: 54, background: C.yellow, borderRadius: '22px 22px 0 0', marginRight: 40}} />
      <div style={{background: C.ink, borderRadius: 30, padding: '36px 48px 40px', color: '#fff', boxShadow: DEEP, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{fontSize: 40, fontWeight: 700, color: C.yellow}}>{m.title}</div>
        <div style={{fontSize: 70, fontWeight: 700, lineHeight: 1.2}}>{m.text}</div>
        {m.note ? <div style={{alignSelf: 'flex-start', marginTop: 8, fontSize: 32, fontWeight: 700, color: C.ink, background: C.yellow, borderRadius: 999, padding: '6px 26px', opacity: note}}>{m.note}</div> : null}
      </div>
      <Sfx at={c.inAt} name="paper" />
      <Sfx at={c.inAt + 14} name="pop" />
    </div>
  );
};
