// Scenes for the business format («غرفة الفرص»): the "stop scrolling" story, the smart transition and the journey map.
import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {C, DARK, EASE_IN_OUT, EASE_OUT} from '../theme';
import type {Beat, JourneyScene, OverviewScene, StageScene, StoryHookScene} from '../types';
import {Backdrop, Captions, Chip, CountUp, SceneFrame, fadeUp, useIn, usePop, usePortrait} from '../components/ui';
import {Crowd, Lever, PeopleGrid, Person, Phone, Skyline} from '../components/Silhouettes';
import {JourneyMap} from '../components/JourneyMap';
import {Moments, TONE as TONES} from '../components/Moments';
import {ramp} from '../components/moment-kit';
import {Sfx} from '../components/Sfx';
import {cueAt, TopBar, type SceneProps} from './common';

/** A slow push-in over the whole scene, so the frame is never perfectly still. */
const Drift: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.035 * Math.min(1, f / frames)})`}}>{children}</div>;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const DEEP = '0 2px 6px rgba(28,35,51,0.08), 0 30px 60px rgba(28,35,51,0.20)';
const SOFT = '0 1px 3px rgba(28,35,51,0.06), 0 10px 26px rgba(28,35,51,0.08)';

// Arrow pointing forward in time (to the left in an RTL timeline; down in a vertical one).
const Arrow: React.FC<{vertical?: boolean; color: string}> = ({vertical, color}) => (
  <svg width="54" height="24" viewBox="0 0 54 24" style={{transform: vertical ? 'rotate(-90deg)' : undefined}}>
    <path d="M52 12H6M16 3L6 12l10 9" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BeatCard: React.FC<{beat: Beat; shownAt: number; noteAt: number | null; askAt: number | null; active: boolean; portrait: boolean}> = ({
  beat,
  shownAt,
  noteAt,
  askAt,
  active,
  portrait,
}) => {
  const f = useCurrentFrame();
  const p = usePop(shownAt, 13);
  const asking = askAt !== null && f >= askAt && f < shownAt;
  const note = noteAt === null ? 0 : interpolate(f, [noteAt, noteAt + 14], [0, 1], clamp);
  const shown = f >= shownAt;
  const tone = TONES[beat.tone ?? 'accent'];
  const big = beat.value ?? '';
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: portrait ? 250 : 330,
        borderRadius: 36,
        padding: portrait ? '26px 34px' : '30px 26px',
        background: shown ? C.surface : asking ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
        border: shown ? 'none' : `3px dashed ${asking ? C.yellow : C.line}`,
        boxShadow: shown ? (active ? DEEP : SOFT) : 'none',
        opacity: shown ? (active ? 1 : 0.82) : 0.5,
        transform: shown ? `translateY(${(1 - p) * 30}px) scale(${(0.88 + 0.12 * p) * (active ? 1.03 : 1)})` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: portrait ? 'center' : 'flex-start',
        justifyContent: 'center',
        gap: 12,
        textAlign: portrait ? 'center' : 'right',
      }}
    >
      {shown ? (
        <>
          {beat.year ? (
            <Chip size={30} bg={tone.soft} color={tone.main} style={{fontWeight: 700}}>
              <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{beat.year}</span>
            </Chip>
          ) : null}
          {big ? (
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14, color: tone.main}}>
              <span style={{fontSize: portrait ? 112 : 112, fontWeight: 700, lineHeight: 1, direction: 'ltr', unicodeBidi: 'isolate'}}>
                <CountUp value={big} delay={shownAt} dur={26} />
              </span>
              {beat.unit ? <span style={{fontSize: portrait ? 44 : 40, fontWeight: 700, whiteSpace: 'nowrap'}}>{beat.unit}</span> : null}
            </div>
          ) : null}
          <div style={{fontSize: portrait ? 38 : 36, fontWeight: 500, color: C.ink2, lineHeight: 1.35}}>{beat.label}</div>
          {beat.note && note > 0 ? (
            <div style={{fontSize: portrait ? 30 : 27, fontWeight: 600, color: C.ink, background: C.yellowSoft, borderRadius: 18, padding: '8px 16px', lineHeight: 1.35, ...fadeUp(note, 14)}}>
              {beat.note}
            </div>
          ) : null}
        </>
      ) : asking ? (
        <div style={{alignSelf: 'center', fontSize: 150, fontWeight: 700, color: C.yellow, lineHeight: 1, transform: `scale(${1 + 0.08 * Math.sin((f - (askAt ?? 0)) / 4)})`}}>؟</div>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------------ STORY HOOK
export const StoryHook: React.FC<SceneProps<StoryHookScene> & {showCaptions: boolean}> = ({scene, plan, showCaptions}) => {
  const f = useCurrentFrame();
  const portrait = usePortrait();
  const n = scene.beats.length;
  const times = scene.beats.map((b, i) => cueAt(plan, scene.narration, b.cue, (i + 0.15) / n));
  const asks = scene.beats.map((b) => (b.askCue ? cueAt(plan, scene.narration, b.askCue, 0.5) : null));
  const active = times.reduce((a, t, i) => (f >= t ? i : a), -1);
  // With explainer moments, the story is told first and the timeline of numbers comes in later (`timelineCue`).
  const timelineAt = scene.timelineCue ? cueAt(plan, scene.narration, scene.timelineCue, 0.6) : 0;
  const timeline = scene.timelineCue ? interpolate(f, [timelineAt, timelineAt + 16], [0, 1], {...clamp, easing: EASE_OUT}) : 1;
  const city = useIn(0, 30);
  const person = useIn(4, 26);
  const drift = interpolate(f, [0, plan.frames], [0, -24]);
  const phoneAt = scene.phoneCue ? cueAt(plan, scene.narration, scene.phoneCue, 0.7) : null;
  const phone = phoneAt === null ? 0 : interpolate(f, [phoneAt, phoneAt + 16], [0, 1], clamp);
  const bubbles = phoneAt === null ? 0 : interpolate(f, [phoneAt + 10, phoneAt + 40], [0, 3], clamp);
  const place = useIn(6, 16);
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      <Drift frames={plan.frames}>
        {/* shadows of the place, the person and the thing */}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, opacity: 0.09 * city}}>
          <Skyline width={portrait ? 1080 : 1920} height={portrait ? 460 : 340} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: portrait ? 40 : 110,
            bottom: 0,
            opacity: 0.14 * person,
            transform: `translateX(${(1 - person) * -40 + drift}px)`,
            filter: 'drop-shadow(0 24px 30px rgba(28,35,51,0.35))',
          }}
        >
          <Person size={portrait ? 520 : 600} />
        </div>
        {scene.phoneCue ? (
          <div
            style={{
              position: 'absolute',
              left: portrait ? 330 : 470,
              bottom: portrait ? 210 : 230,
              opacity: phone,
              transform: `translateY(${(1 - phone) * 30}px) rotate(-8deg)`,
              filter: 'drop-shadow(0 18px 24px rgba(28,35,51,0.30))',
            }}
          >
            <Phone size={portrait ? 210 : 240} color={C.green} bubbles={bubbles} />
          </div>
        ) : null}
        {scene.place ? (
          <div style={{position: 'absolute', top: portrait ? 120 : 70, right: portrait ? 0 : 120, left: portrait ? 0 : undefined, display: 'flex', justifyContent: 'center', ...fadeUp(place, 14)}}>
            <Chip size={32} color={C.ink2}>
              {scene.place}
            </Chip>
          </div>
        ) : null}
        {timeline > 0 ? (
          <div
            style={{
              position: 'absolute',
              right: portrait ? 60 : 120,
              left: portrait ? 60 : 540,
              top: portrait ? 230 : 250,
              display: 'flex',
              flexDirection: portrait ? 'column' : 'row',
              alignItems: 'stretch',
              gap: 0,
              opacity: timeline,
              transform: `translateY(${(1 - timeline) * -40}px)`,
            }}
          >
            {scene.beats.map((b, i) => {
              const gapIn = interpolate(f, [times[i] - 8, times[i] + 6], [0, 1], clamp);
              return (
                <React.Fragment key={i}>
                  {i > 0 ? (
                    <div
                      style={{
                        flex: '0 0 auto',
                        width: portrait ? 'auto' : 92,
                        height: portrait ? 86 : 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        position: 'relative',
                        opacity: 0.35 + 0.65 * gapIn,
                      }}
                    >
                      {b.gapLabel ? (
                        <div
                          style={{
                            position: 'absolute',
                            ...(portrait ? {right: 'calc(50% + 50px)', top: '50%', transform: 'translateY(-50%)'} : {bottom: 'calc(100% + 14px)', left: '50%', transform: 'translateX(-50%)'}),
                            fontSize: 28,
                            fontWeight: 700,
                            color: C.ink2,
                            whiteSpace: 'nowrap',
                            opacity: gapIn,
                          }}
                        >
                          {b.gapLabel}
                        </div>
                      ) : null}
                      <Arrow vertical={portrait} color={C.ink3} />
                    </div>
                  ) : null}
                  <BeatCard
                    beat={b}
                    shownAt={times[i]}
                    noteAt={b.noteCue ? cueAt(plan, scene.narration, b.noteCue, 0.6) : null}
                    askAt={asks[i]}
                    active={i === active}
                    portrait={portrait}
                  />
                </React.Fragment>
              );
            })}
          </div>
        ) : null}
        <Moments moments={scene.moments} plan={plan} narration={scene.narration} />
      </Drift>
      {/* sounds: the place, the timeline arriving, each reveal (a riser into a big win, a stamp on a "no") */}
      {scene.place ? <Sfx at={6} name="tick" /> : null}
      {scene.timelineCue ? <Sfx at={timelineAt} name="swish" /> : null}
      {scene.beats.map((b, i) => {
        if (times[i] < timelineAt) return null;
        const big = b.tone === 'pos' || b.tone === 'gold';
        const ask = asks[i];
        const rise = big && ask !== null && times[i] - ask >= 30;
        return (
          <React.Fragment key={i}>
            {rise ? <Sfx at={Math.max(ask, times[i] - 48)} name="riser" /> : null}
            <Sfx at={times[i]} name={big ? 'impact' : b.tone === 'neg' ? 'stamp' : 'thud'} />
            {ask !== null && !rise ? <Sfx at={ask} name="question" /> : null}
          </React.Fragment>
        );
      })}
      {phoneAt !== null ? <Sfx at={phoneAt + 10} name="bubble" /> : null}
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ OVERVIEW (smart transition)
export const Overview: React.FC<SceneProps<OverviewScene> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, showCaptions} = props;
  const f = useCurrentFrame();
  const portrait = usePortrait();
  const cmp = scene.compare;
  const fromAt = cmp ? cueAt(plan, scene.narration, cmp.from.cue, 0) : 0;
  const toAt = cmp ? cueAt(plan, scene.narration, cmp.to.cue, 0.15) : 0;
  const topicAt = cueAt(plan, scene.narration, scene.topic, 0.4);
  const mapAt = cueAt(plan, scene.narration, scene.roadmapCue, 0.55);
  const fileAt = cueAt(plan, scene.narration, scene.fileCue, 0.85);
  const file = usePop(fileAt, 12);
  const highlightAt = cmp?.from.highlightCue ? cueAt(plan, scene.narration, cmp.from.highlightCue, 0.3) : null;
  // the one person lights up, then the team comes back when the topic arrives
  const highlight = highlightAt === null ? 0 : interpolate(f, [highlightAt, highlightAt + 10, topicAt - 10, topicAt], [0, 1, 1, 0], clamp);
  const team = interpolate(f, [fromAt, fromAt + 34], [0, 1], clamp);
  const crowd = interpolate(f, [toAt, toAt + 44], [0, 1], {...clamp, easing: EASE_OUT});
  const tilt = interpolate(f, [toAt + 6, topicAt], [0, 1], {...clamp, easing: EASE_OUT});
  const fromIn = useIn(fromAt, 16);
  const toIn = useIn(toAt, 16);
  const topic = usePop(topicAt, 12);
  const sub = useIn(topicAt + 10, 18);
  const top = cmp ? (portrait ? 1130 : 600) : portrait ? 640 : 360;
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      <TopBar episode={props.episode} brand={props.brand} />
      <Drift frames={plan.frames}>
      {cmp ? (
        <div
          style={{
            position: 'absolute',
            right: portrait ? 60 : 110,
            left: portrait ? 60 : 110,
            top: portrait ? 270 : 165,
            display: 'flex',
            flexDirection: portrait ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: portrait ? 30 : 20,
          }}
        >
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...fadeUp(fromIn, 20)}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14, color: C.blue}}>
              <span style={{fontSize: 108, fontWeight: 700, lineHeight: 1, direction: 'ltr', unicodeBidi: 'isolate'}}>
                <CountUp value={cmp.from.value} delay={fromAt} dur={30} />
              </span>
              <span style={{fontSize: 44, fontWeight: 700}}>{cmp.from.label}</span>
            </div>
            <PeopleGrid count={cmp.from.count} cols={11} cell={portrait ? 40 : 34} progress={team} color={C.blue} highlight={highlight} />
          </div>
          <div style={{opacity: 0.25 + 0.75 * Math.min(1, tilt * 2), filter: 'drop-shadow(0 16px 22px rgba(28,35,51,0.22))'}}>
            <Lever width={portrait ? 420 : 440} tilt={tilt} accent={C.blue} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...fadeUp(toIn, 20)}}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 14, color: C.ink}}>
              <span style={{fontSize: 96, fontWeight: 700, lineHeight: 1, direction: 'ltr', unicodeBidi: 'isolate'}}>{cmp.to.value}</span>
              <span style={{fontSize: 44, fontWeight: 700}}>{cmp.to.label}</span>
            </div>
            <Crowd id={`${scene.id}-crowd`} width={portrait ? 900 : 520} height={portrait ? 170 : 200} reveal={crowd} opacity={0.75} />
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <div style={{fontSize: portrait ? 132 : 140, fontWeight: 700, color: C.blue, lineHeight: 1.1, opacity: topic, transform: `scale(${0.75 + 0.25 * topic})`, textShadow: '0 18px 40px rgba(59,125,246,0.25)'}}>
          {scene.topic}
        </div>
        {scene.topicSub ? <div style={{fontSize: portrait ? 44 : 46, fontWeight: 500, color: C.ink2, ...fadeUp(sub, 16)}}>{scene.topicSub}</div> : null}
        {scene.file && f >= fileAt ? (
          <div style={{marginTop: 18, opacity: file, transform: `scale(${0.8 + 0.2 * file})`}}>
            <Chip size={portrait ? 40 : 38} bg={C.ink} color="#fff" style={{fontWeight: 700}}>
              <svg width="30" height="30" viewBox="0 0 24 24"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" fill={C.yellow} /></svg>
              {scene.file}
            </Chip>
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: 18, marginTop: portrait ? 40 : 30, alignItems: 'center'}}>
          {(scene.roadmap ?? []).map((r, i) => {
            const p = interpolate(f, [mapAt + i * 14, mapAt + i * 14 + 14], [0, 1], {...clamp, easing: EASE_OUT});
            return (
              <div key={i} style={{...fadeUp(p, 18)}}>
                <Chip size={portrait ? 40 : 34} color={C.ink}>
                  <span
                    style={{
                      width: portrait ? 50 : 44,
                      height: portrait ? 50 : 44,
                      borderRadius: 99,
                      background: C.blue,
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: portrait ? 28 : 24,
                    }}
                  >
                    {i + 1}
                  </span>
                  {r}
                </Chip>
              </div>
            );
          })}
        </div>
      </div>
      <Moments moments={scene.moments} plan={plan} narration={scene.narration} />
      </Drift>
      {/* sounds: the team fills in, the crowd sweeps in, one person lights up, the big word lands, the case file */}
      {cmp ? <Sfx at={fromAt} name="roll" /> : null}
      {cmp ? <Sfx at={toAt} name="swish" /> : null}
      {highlightAt !== null ? <Sfx at={highlightAt} name="ping" /> : null}
      <Sfx at={topicAt} name="impact" volume={0.8} />
      {scene.file ? <Sfx at={fileAt} name="stamp" volume={0.7} /> : null}
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ JOURNEY (the map, framework v3 §1)
export const Journey: React.FC<SceneProps<JourneyScene> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, showCaptions} = props;
  const f = useCurrentFrame();
  const portrait = usePortrait();
  const n = scene.stations.length;
  const at = scene.at ?? 0;
  const from = scene.from ?? at;
  const walking = from !== at;
  // Telling the road: each stop appears when it is named. Changing station: the road is known, the traveller walks.
  const startAt = walking ? 0 : cueAt(plan, scene.narration, scene.start.cue, 0.02);
  const times = scene.stations.map((s, i) => (walking ? 0 : cueAt(plan, scene.narration, s.cue, 0.15 + (0.45 * i) / Math.max(1, n))));
  const destAt = walking ? 0 : cueAt(plan, scene.narration, scene.destination.cue, 0.65);
  const pop = (t: number) => (walking ? 1 : interpolate(f, [t, t + 12], [0, 1], {...clamp, easing: EASE_OUT}));
  const reveal = walking ? 1 : interpolate(f, [startAt, destAt + 12], [0.03, 1], {...clamp, easing: EASE_IN_OUT});
  const traveller = interpolate(f, [plan.speechStart, plan.speechStart + 50], [from, at], {...clamp, easing: EASE_IN_OUT});
  const loopAt = scene.loopCue ? cueAt(plan, scene.narration, scene.loopCue, 0.8) : null;
  const loopPulse = loopAt === null ? 0 : Math.max(0, Math.sin(Math.max(0, f - loopAt) / 5)) * interpolate(f, [loopAt, loopAt + 6, loopAt + 70, loopAt + 90], [0, 1, 1, 0], clamp);
  const puzzleAt = scene.puzzleCue ? cueAt(plan, scene.narration, scene.puzzleCue, 0.95) : null;
  const glowAt = scene.glowCue ? cueAt(plan, scene.narration, scene.glowCue, 0.7) : null;
  const glowEnd = glowAt === null ? 0 : scene.glowEndCue ? Math.max(glowAt + 30, cueAt(plan, scene.narration, scene.glowEndCue, 0.8)) : glowAt + 60;
  const glow = glowAt !== null && f >= glowAt && f < glowEnd + 10 ? interpolate(f, [glowAt, glowEnd], [0, n + 1], {...clamp, easing: EASE_IN_OUT}) : null;
  const focusAt = scene.focusCue ? cueAt(plan, scene.narration, scene.focusCue, 0.6) : Infinity;
  const mapFade = Number.isFinite(focusAt) ? interpolate(f, [focusAt, focusAt + 14], [1, 0.08], clamp) : 1;
  const mark = (stop: {mark?: 'loop' | 'puzzle'}, shown: number) => ({
    mark: stop.mark,
    markShown: stop.mark === 'puzzle' && puzzleAt !== null ? interpolate(f, [puzzleAt, puzzleAt + 12], [0, 1], clamp) : shown,
    markPulse: stop.mark === 'loop' ? loopPulse : 0,
  });
  const title = useIn(0, 16);
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      <TopBar episode={props.episode} brand={props.brand} />
      <div style={{position: 'absolute', top: portrait ? 250 : 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...fadeUp(title, 16)}}>
        <div style={{fontSize: portrait ? 60 : 54, fontWeight: 700, color: C.ink}}>{scene.title ?? 'خريطة الرحلة'}</div>
      </div>
      <Drift frames={plan.frames}>
      <div style={{position: 'absolute', inset: 0, opacity: mapFade}}>
      <JourneyMap
        portrait={portrait}
        ghost={walking ? 0 : interpolate(f, [0, 12, destAt, destAt + 20], [0, 1, 1, 0], clamp)}
        glow={glow}
        reveal={reveal}
        traveller={traveller}
        active={walking || at > 0 ? at : 0}
        start={{label: scene.start.label, shown: pop(startAt), ...mark(scene.start, pop(startAt))}}
        stations={scene.stations.map((s, i) => ({label: s.label, shown: pop(times[i]), ...mark(s, pop(times[i]))}))}
        destination={{label: scene.destination.label, shown: pop(destAt), ...mark(scene.destination, pop(destAt))}}
      />
      </div>
      <Moments moments={scene.moments} plan={plan} narration={scene.narration} />
      </Drift>
      {/* sounds: each stop pops in as it is named, the destination chimes, the loop asks, the puzzle sparkles */}
      {walking ? null : (
        <>
          <Sfx at={startAt} name="pop" />
          {times.map((t, i) => <Sfx key={i} at={t} name="pop" />)}
          <Sfx at={destAt} name="ping" />
        </>
      )}
      {glowAt !== null ? <Sfx at={glowAt} name="whoosh" volume={0.8} /> : null}
      {loopAt !== null ? <Sfx at={loopAt} name="question" /> : null}
      {puzzleAt !== null ? <Sfx at={puzzleAt} name="shimmer" /> : null}
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ STAGE (a station told through explainer moments)
const StationChip: React.FC<{label: string; station: number; total: number; p: number}> = ({label, station, total, p}) => (
  <div style={{position: 'absolute', top: 116, right: 72, display: 'flex', alignItems: 'center', gap: 18, direction: 'rtl', opacity: p, transform: `translateY(${(1 - p) * -12}px)`}}>
    <Chip size={28} color={C.ink} style={{fontWeight: 700}}>
      {label}
    </Chip>
    {station > 0 ? (
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        {Array.from({length: total}, (_, i) => (
          <div key={i} style={{width: i + 1 === station ? 30 : 12, height: 12, borderRadius: 99, background: i + 1 <= station ? C.blue : C.line, opacity: i + 1 < station ? 0.45 : 1}} />
        ))}
        <svg width={22} height={26} viewBox="0 0 22 26">
          <rect x={2} y={2} width={3} height={22} rx={1.5} fill={C.ink3} />
          <path d="M5 3 L20 8 L5 13 Z" fill={C.green} />
        </svg>
      </div>
    ) : null}
  </div>
);

/** The teaser's dark screen (framework v5 §3.16): navy, a slow spotlight and a few specks of light. */
const DarkStage: React.FC<{p: number}> = ({p}) => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 90) * 14;
  return (
    <AbsoluteFill style={{opacity: p, background: `radial-gradient(ellipse 62% 74% at ${x}% 42%, ${DARK.glow} 0%, ${DARK.bg} 74%)`}}>
      {Array.from({length: 22}, (_, k) => (
        <div key={k} style={{position: 'absolute', left: (k * 397) % 1920, top: (k * 233 + 60) % 1080, width: 4, height: 4, borderRadius: 4, background: '#fff', opacity: 0.18 + 0.22 * Math.sin(f / 18 + k * 1.7)}} />
      ))}
    </AbsoluteFill>
  );
};

export const Stage: React.FC<SceneProps<StageScene> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, showCaptions} = props;
  const f = useCurrentFrame();
  const head = useIn(4, 16);
  // light → dark on the teaser's first word (or dark from the start: the end card after it)
  const darkAt = scene.darkCue ? cueAt(plan, scene.narration, scene.darkCue, 1) : Infinity;
  const dk = scene.dark ? 1 : ramp(f, darkAt, 26);
  const tone = {
    '--stage-ink': interpolateColors(dk, [0, 1], [C.ink, DARK.ink]),
    '--stage-ink2': interpolateColors(dk, [0, 1], [C.ink2, DARK.ink2]),
    '--stage-ink3': interpolateColors(dk, [0, 1], [C.ink3, DARK.ink3]),
    '--stage-file-border': `rgba(255,255,255,${0.22 * dk})`,
  } as React.CSSProperties;
  return (
    <SceneFrame frames={plan.frames}>
      <AbsoluteFill style={tone}>
        <Backdrop tint={C.blue} />
        {dk > 0 ? <DarkStage p={dk} /> : null}
        <div style={{opacity: 1 - dk}}>
          <TopBar episode={props.episode} brand={props.brand} />
        </div>
        {scene.label ? <StationChip label={scene.label} station={scene.station ?? 0} total={5} p={head * (1 - dk)} /> : null}
        <Drift frames={plan.frames}>
          <Moments moments={scene.moments} plan={plan} narration={scene.narration} />
        </Drift>
        {showCaptions ? <Captions captions={plan.captions} /> : null}
        {Number.isFinite(darkAt) ? <Sfx at={darkAt - 46} name="riser" volume={0.8} /> : null}
        {Number.isFinite(darkAt) ? <Sfx at={darkAt} name="impact" /> : null}
      </AbsoluteFill>
    </SceneFrame>
  );
};
