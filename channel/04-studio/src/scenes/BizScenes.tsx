// Scenes for the business format («غرفة الفرص»): the "stop scrolling" story and the smart transition.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_OUT} from '../theme';
import type {Beat, OverviewScene, StoryHookScene, Tone} from '../types';
import {Backdrop, Captions, Chip, CountUp, SceneFrame, fadeUp, useIn, usePop, usePortrait} from '../components/ui';
import {Crowd, Lever, PeopleGrid, Person, Phone, Skyline} from '../components/Silhouettes';
import {cueAt, TopBar, type SceneProps} from './common';

const TONES: Record<Tone, {main: string; soft: string}> = {
  neg: {main: C.red, soft: C.redSoft},
  pos: {main: C.green, soft: C.greenSoft},
  accent: {main: C.blue, soft: C.blueSoft},
  gold: {main: '#C98A00', soft: C.yellowSoft},
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

const BeatCard: React.FC<{beat: Beat; shownAt: number; active: boolean; portrait: boolean}> = ({beat, shownAt, active, portrait}) => {
  const f = useCurrentFrame();
  const p = usePop(shownAt, 13);
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
        background: shown ? C.surface : 'rgba(255,255,255,0.35)',
        border: shown ? 'none' : `3px dashed ${C.line}`,
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
        </>
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
  const active = times.reduce((a, t, i) => (f >= t ? i : a), -1);
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
              <BeatCard beat={b} shownAt={times[i]} active={i === active} portrait={portrait} />
            </React.Fragment>
          );
        })}
      </div>
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
            <PeopleGrid count={cmp.from.count} cols={11} cell={portrait ? 40 : 34} progress={team} color={C.blue} />
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
        <div style={{display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: 18, marginTop: portrait ? 40 : 30, alignItems: 'center'}}>
          {scene.roadmap.map((r, i) => {
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
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};
