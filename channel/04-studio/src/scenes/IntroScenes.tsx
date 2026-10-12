import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_OUT} from '../theme';
import type {HookScene, LessonScene, TitleScene} from '../types';
import {Backdrop, Brand, Captions, Card, Chip, Icon, SceneFrame, fadeUp, useIn, usePop, usePortrait} from '../components/ui';
import {at, lessonNumber, TopBar, type SceneProps} from './common';

// ------------------------------------------------------------------ HOOK
export const Hook: React.FC<SceneProps<HookScene> & {showCaptions: boolean}> = ({scene, episode, plan, showCaptions}) => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [6, 40], [0, 1], {easing: EASE_OUT, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const big = usePop(14, 12);
  const label = useIn(30, 18);
  const cite = useIn(at(plan, 0.3), 16);
  const qIn = useIn(at(plan, 0.5), 18);
  const crossAt = [0.62, 0.69, 0.76].map((x) => at(plan, x));
  const outro = usePop(at(plan, 0.86), 14);
  const portrait = usePortrait();
  const R = portrait ? 220 : 250;
  const circ = 2 * Math.PI * R;
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      {/* stopwatch */}
      <div style={{position: 'absolute', left: portrait ? 540 - R - 30 : 180, top: portrait ? 150 : 190, width: 2 * R + 60, height: 2 * R + 60}}>
        <svg width={2 * R + 60} height={2 * R + 60}>
          <circle cx={R + 30} cy={R + 30} r={R} fill={C.surface} stroke={C.line} strokeWidth={22} />
          <circle
            cx={R + 30}
            cy={R + 30}
            r={R}
            fill="none"
            stroke={C.blue}
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={`${circ * ring} ${circ}`}
            transform={`rotate(-90 ${R + 30} ${R + 30})`}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{fontSize: portrait ? 180 : 210, fontWeight: 700, color: C.blue, lineHeight: 1, direction: 'ltr', transform: `scale(${big})`}}>{scene.bigValue}</div>
          <div style={{fontSize: 64, fontWeight: 600, color: C.ink, marginTop: 10, opacity: label}}>{scene.bigUnit}</div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: portrait ? 60 : 140,
          top: portrait ? 690 : 230,
          width: portrait ? 960 : 900,
          display: 'flex',
          flexDirection: 'column',
          gap: portrait ? 24 : 30,
          alignItems: portrait ? 'center' : 'stretch',
          textAlign: portrait ? 'center' : 'right',
        }}
      >
        <div style={{fontSize: portrait ? 58 : 64, fontWeight: 700, lineHeight: 1.3, ...fadeUp(label, 30)}}>{scene.bigLabel}</div>
        {scene.citation ? (
          <div style={{...fadeUp(cite, 16)}}>
            <Chip size={26} color={C.ink2}>
              <Icon name="doc" size={26} /> {scene.citation}
            </Chip>
          </div>
        ) : null}
        <Card style={{padding: '34px 40px', ...fadeUp(qIn, 30)}}>
          <div style={{fontSize: 48, fontWeight: 700}}>{scene.question}</div>
          <div style={{display: 'flex', gap: 16, marginTop: 24, justifyContent: portrait ? 'center' : 'flex-start'}}>
            {scene.crossed.map((w, i) => {
              const strike = interpolate(f, [crossAt[i], crossAt[i] + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <div key={i} style={{position: 'relative', opacity: 0.4 + 0.6 * Math.min(1, qIn)}}>
                  <Chip size={34} bg={C.redSoft} color={C.red}>
                    {w}
                  </Chip>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 10,
                      height: 5,
                      width: `calc(${strike * 100}% - 20px)`,
                      background: C.red,
                      borderRadius: 4,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: portrait ? 'center' : 'flex-start', gap: 16, opacity: outro, transform: `scale(${0.9 + 0.1 * outro})`, transformOrigin: portrait ? 'center' : 'right center'}}>
          <Chip size={34} bg={C.blue} color="#fff">
            {episode.kicker}
          </Chip>
          <Chip size={34} bg={C.yellowSoft} color={C.ink}>
            <Icon name="globe" size={32} /> قصص حقيقية بالأرقام
          </Chip>
        </div>
      </div>
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ TITLE
export const Title: React.FC<SceneProps<TitleScene> & {showCaptions: boolean}> = ({episode, brand, plan, showCaptions}) => {
  const f = useCurrentFrame();
  const chip = usePop(4, 12);
  const t = useIn(10, 22);
  const k = useIn(22, 20);
  const bar = interpolate(f, [18, 50], [0, 1], {easing: EASE_OUT, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
        <div style={{transform: `scale(${chip})`}}>
          <Chip size={40} bg={C.blue} color="#fff">
            الدرس {lessonNumber(episode)}
          </Chip>
        </div>
        <div style={{fontSize: 124, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, ...fadeUp(t, 40)}}>{episode.title}</div>
        <div style={{display: 'flex', gap: 10, height: 12, width: 520 * bar}}>
          <div style={{flex: 3, background: C.blue, borderRadius: 99}} />
          <div style={{flex: 1, background: C.yellow, borderRadius: 99}} />
        </div>
        <div style={{fontSize: 50, color: C.ink2, fontWeight: 500, ...fadeUp(k, 24)}}>{episode.kicker}</div>
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k}}>
        <Brand name={brand.name} size={30} />
      </div>
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ LESSON
export const Lesson: React.FC<SceneProps<LessonScene> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, showCaptions} = props;
  const head = useIn(6, 20);
  const q1 = usePop(at(plan, 0.24), 13);
  const q2 = usePop(at(plan, 0.38), 13);
  const cite = useIn(at(plan, 0.45), 16);
  const rule = usePop(at(plan, 0.58), 12);
  const exAt = [0.7, 0.76, 0.82].map((x) => at(plan, x));
  const e0 = usePop(exAt[0]);
  const e1 = usePop(exAt[1]);
  const e2 = usePop(exAt[2]);
  const ex = [e0, e1, e2];
  const colors = [
    {main: C.green, soft: C.greenSoft},
    {main: C.blue, soft: C.blueSoft},
  ];
  const portrait = usePortrait();
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.green} />
      <TopBar episode={props.episode} brand={props.brand} />
      <div style={{position: 'absolute', top: portrait ? 300 : 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: portrait ? 54 : 60, fontWeight: 700, ...fadeUp(head, 26)}}>عقلك يسأل سؤالين… بالترتيب</div>
        <div style={{display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: portrait ? 14 : 40, marginTop: portrait ? 30 : 44, alignItems: 'center'}}>
          {scene.questions.map((q, i) => {
            const p = i === 0 ? q1 : q2;
            return (
              <React.Fragment key={i}>
                {i === 1 ? <div style={{fontSize: portrait ? 56 : 70, color: C.ink3, opacity: q2}}>{portrait ? '↓' : '←'}</div> : null}
                <Card style={{width: portrait ? 900 : 620, padding: '34px 40px', opacity: p, transform: `scale(${0.85 + 0.15 * p})`}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                    <div
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 999,
                        background: colors[i].main,
                        color: '#fff',
                        fontSize: 48,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        direction: 'ltr',
                      }}
                    >
                      {q.n}
                    </div>
                    <div style={{fontSize: 48, fontWeight: 700}}>{q.q}</div>
                  </div>
                  <div style={{marginTop: 22}}>
                    <Chip size={30} bg={colors[i].soft} color={colors[i].main}>
                      {q.tag}
                    </Chip>
                  </div>
                </Card>
              </React.Fragment>
            );
          })}
        </div>
        {scene.citation ? (
          <div style={{marginTop: 26, ...fadeUp(cite, 14)}}>
            <Chip size={24} color={C.ink2}>
              <Icon name="doc" size={26} /> {scene.citation}
            </Chip>
          </div>
        ) : null}
        <div
          style={{
            marginTop: 34,
            background: C.ink,
            color: '#fff',
            borderRadius: 30,
            padding: '22px 56px',
            fontSize: 64,
            fontWeight: 700,
            opacity: rule,
            transform: `scale(${0.8 + 0.2 * rule})`,
          }}
        >
          {scene.rule}
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: portrait ? 960 : 1700, gap: 18, marginTop: 30}}>
          {scene.examples.map((e, i) => (
            <div key={i} style={{opacity: ex[i], transform: `translateY(${(1 - ex[i]) * 20}px)`}}>
              <Chip size={34} bg={C.surface} color={C.ink}>
                <Icon name="heart" size={28} color={C.red} /> {e}
              </Chip>
            </div>
          ))}
        </div>
      </div>
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};
