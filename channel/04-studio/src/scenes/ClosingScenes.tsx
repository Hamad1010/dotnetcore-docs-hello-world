import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ACCENTS, C} from '../theme';
import type {EndCardScene, OutroScene, PracticeScene, RecapScene} from '../types';
import {Backdrop, Brand, Captions, Card, Chip, Icon, SceneFrame, fadeUp, useIn, usePop} from '../components/ui';
import {at, TopBar, type SceneProps} from './common';

// ------------------------------------------------------------------ RECAP
export const Recap: React.FC<SceneProps<RecapScene> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, showCaptions} = props;
  const f = useCurrentFrame();
  const head = useIn(4, 18);
  const n = scene.people.length;
  const rule = usePop(at(plan, 0.8), 12);
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.yellow} />
      <TopBar episode={props.episode} brand={props.brand} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontSize: 58, fontWeight: 700, ...fadeUp(head, 24)}}>وش الشي المشترك بينهم؟</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 380px)', gap: 22, marginTop: 40, direction: 'rtl'}}>
          {scene.people.map((p, i) => {
            const t = at(plan, 0.05 + (0.5 * i) / Math.max(1, n - 1));
            const o = interpolate(f, [t, t + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <Card key={i} soft style={{padding: '24px 28px', opacity: 0.25 + 0.75 * o, transform: `scale(${0.94 + 0.06 * o})`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <div style={{width: 18, height: 18, borderRadius: 99, background: a.main}} />
                  <div style={{fontSize: 34, fontWeight: 700}}>{p.name}</div>
                </div>
                <div style={{fontSize: 26, color: C.ink2, marginTop: 8}}>{p.where}</div>
              </Card>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 54,
            background: C.blue,
            color: '#fff',
            borderRadius: 34,
            padding: '24px 64px',
            fontSize: 72,
            fontWeight: 700,
            opacity: rule,
            transform: `scale(${0.8 + 0.2 * rule})`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <Icon name="heart" size={64} color="#fff" /> {scene.rule}
        </div>
      </div>
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ PRACTICE
export const Practice: React.FC<SceneProps<PracticeScene> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, showCaptions} = props;
  const f = useCurrentFrame();
  const card = useIn(6, 20);
  const times = [0.12, 0.42, 0.7].map((x) => at(plan, x));
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.green} />
      <TopBar episode={props.episode} brand={props.brand} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Card style={{width: 1180, padding: '50px 64px', ...fadeUp(card, 40)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <Chip size={34} bg={C.green} color="#fff">
              تمرين اليوم
            </Chip>
            <div style={{fontSize: 32, color: C.ink2}}>5 دقايق بس</div>
          </div>
          <div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 26}}>
            {scene.steps.map((s, i) => {
              const done = interpolate(f, [times[i], times[i] + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: 0.35 + 0.65 * done}}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      flex: '0 0 64px',
                      borderRadius: 18,
                      border: `4px solid ${done > 0.5 ? C.green : C.line}`,
                      background: done > 0.5 ? C.green : C.surface,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {done > 0.5 ? <Icon name="check" size={40} color="#fff" /> : null}
                  </div>
                  <div style={{fontSize: 46, fontWeight: 600}}>{s}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ OUTRO
export const Outro: React.FC<SceneProps<OutroScene> & {showCaptions: boolean}> = (props) => {
  const {plan, episode, brand, showCaptions} = props;
  const f = useCurrentFrame();
  const next = useIn(at(plan, 0.25), 20);
  const sub = usePop(at(plan, 0.75), 11);
  const glow = (Math.sin(f / 8) + 1) / 2;
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50}}>
        <Brand name={brand.name} size={54} />
        {episode.next ? (
          <Card style={{width: 1100, padding: '40px 54px', ...fadeUp(next, 40)}}>
            <Chip size={30} bg={C.blueSoft} color={C.blue}>
              <Icon name="play" size={26} color={C.blue} /> الدرس الجاي
            </Chip>
            <div style={{fontSize: 64, fontWeight: 700, marginTop: 22}}>{episode.next.title}</div>
            <div style={{fontSize: 38, color: C.ink2, marginTop: 14, lineHeight: 1.45}}>{episode.next.teaser}</div>
          </Card>
        ) : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            background: C.blue,
            color: '#fff',
            padding: '22px 56px',
            borderRadius: 999,
            fontSize: 48,
            fontWeight: 700,
            opacity: sub,
            transform: `scale(${0.85 + 0.15 * sub})`,
            boxShadow: `0 0 0 ${10 + 14 * glow}px rgba(59,125,246,${0.18 - 0.1 * glow})`,
          }}
        >
          <Icon name="bell" size={52} color="#fff" /> اشترك وفعّل الجرس
        </div>
      </div>
      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};

// ------------------------------------------------------------------ END CARD (Shorts)
export const EndCard: React.FC<SceneProps<EndCardScene> & {showCaptions: boolean}> = ({episode, brand, plan}) => {
  const a = usePop(4, 12);
  const b = useIn(12, 18);
  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={C.blue} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 44, padding: 60, textAlign: 'center'}}>
        <div style={{transform: `scale(${a})`}}>
          <Brand name={brand.name} size={52} />
        </div>
        <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.3, ...fadeUp(b, 30)}}>الدرس كامل على القناة</div>
        <Chip size={40} bg={C.blue} color="#fff" style={{opacity: b}}>
          <Icon name="play" size={34} color="#fff" /> الدرس {parseInt(episode.lesson.replace(/\D/g, ''), 10)} · {episode.title}
        </Chip>
      </div>
    </SceneFrame>
  );
};
