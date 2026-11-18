import React from 'react';
import {C} from '../theme';
import type {StoryScene as Story} from '../types';
import {Backdrop, Captions, Card, Chip, CountUp, Dot, SceneFrame, Skeleton, fadeUp, useIn, usePop, usePortrait} from '../components/ui';
import {Globe, type Arc, type CameraKey} from '../components/Globe';
import {at, TopBar, type SceneProps} from './common';


export const StoryScene: React.FC<SceneProps<Story> & {showCaptions: boolean}> = (props) => {
  const {scene, plan, accent, storyIndex, storyCount, prevPos, showCaptions} = props;
  const main = {lat: scene.lat, lon: scene.lon};
  const portrait = usePortrait();
  const GLOBE = portrait ? 680 : 760;

  // ---- camera path over the globe ----
  const keys: CameraKey[] = [{at: 0, pos: prevPos}];
  const arcs: Arc[] = [];
  const labels: {lat: number; lon: number; text: string; at: number}[] = [];
  let arrive = 36;
  if (scene.arcFrom) {
    keys.push({at: 24, pos: scene.arcFrom});
    keys.push({at: 78, pos: main});
    arcs.push({from: scene.arcFrom, to: main, start: 30, end: 78});
    if (scene.arcFrom.label) labels.push({...scene.arcFrom, text: scene.arcFrom.label, at: 22});
    arrive = 78;
  } else {
    keys.push({at: arrive, pos: main});
  }
  if (scene.arcTo) {
    const s = Math.max(arrive + 20, at(plan, 0.58));
    keys.push({at: s, pos: main});
    keys.push({at: s + 66, pos: scene.arcTo});
    arcs.push({from: main, to: scene.arcTo, start: s, end: s + 66});
    if (scene.arcTo.label) labels.push({...scene.arcTo, text: scene.arcTo.label, at: s + 60});
  }

  const head = useIn(8, 20);
  const headline = useIn(16, 22);
  const statTimes = [0.06, 0.15, 0.24].map((x) => at(plan, x));
  const beatTimes = [0.28, 0.52, 0.74].map((x) => at(plan, x));
  const takeaway = usePop(at(plan, 0.9), 13);
  const s0 = usePop(statTimes[0]);
  const s1 = usePop(statTimes[1]);
  const s2 = usePop(statTimes[2]);
  const statPops = [s0, s1, s2];
  const b0 = useIn(beatTimes[0], 16);
  const b1 = useIn(beatTimes[1], 16);
  const b2 = useIn(beatTimes[2], 16);
  const beatIns = [b0, b1, b2];

  return (
    <SceneFrame frames={plan.frames}>
      <Backdrop tint={accent.main} />
      <TopBar episode={props.episode} brand={props.brand} storyIndex={storyIndex} storyCount={portrait ? 0 : storyCount} accent={accent.main} />

      {/* Globe on the left (RTL layout: content starts on the right) */}
      <div style={{position: 'absolute', left: portrait ? 200 : 90, top: portrait ? 250 : 168}}>
        <Globe
          size={GLOBE}
          keys={keys}
          accent={accent.main}
          highlight={scene.isoNumeric}
          pin={{...main, label: scene.place, at: arrive - 4}}
          arcs={arcs}
          labels={labels}
        />
      </div>

      {/* Story card */}
      <Card
        style={{
          position: 'absolute',
          right: portrait ? 60 : 80,
          top: portrait ? 880 : 140,
          width: portrait ? 960 : 900,
          padding: portrait ? '30px 40px' : '38px 48px',
          ...fadeUp(head, 50),
        }}
      >
        <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
          <Chip bg={accent.soft} color={accent.main} size={24}>
            {portrait ? 'قصة حقيقية' : `القصة ${storyIndex} من ${storyCount}`}
          </Chip>
          <Chip size={24} color={C.ink}>
            <Dot color={accent.main} /> {scene.country} · {scene.year}
          </Chip>
          <Chip size={24} color={C.ink2}>
            {scene.topic}
          </Chip>
        </div>

        <div style={{fontSize: portrait ? 52 : 58, fontWeight: 700, lineHeight: 1.25, marginTop: portrait ? 18 : 24, minHeight: 64, ...fadeUp(headline, 24)}}>{scene.headline}</div>

        <div style={{display: 'flex', gap: 16, marginTop: 24}}>
          {scene.stats.slice(0, 3).map((st, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i === 0 ? accent.soft : C.bg,
                borderRadius: 26,
                padding: '16px 20px',
                position: 'relative',
                transform: `scale(${0.94 + 0.06 * statPops[i]})`,
              }}
            >
              <Skeleton show={1 - statPops[i]} lines={[0.5, 0.8]} />
              <div style={{opacity: statPops[i]}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 8, direction: 'rtl'}}>
                <span style={{fontSize: 54, fontWeight: 700, color: accent.main, direction: 'ltr', unicodeBidi: 'isolate'}}>
                  <CountUp value={st.value} delay={statTimes[i]} />
                </span>
                {st.unit ? <span style={{fontSize: 26, fontWeight: 600, color: accent.main}}>{st.unit}</span> : null}
              </div>
              <div style={{fontSize: 22, color: C.ink2, marginTop: 2, lineHeight: 1.35}}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop: 26, display: portrait ? 'none' : 'flex', flexDirection: 'column', gap: 14}}>
          {scene.beats.slice(0, 3).map((b, i) => (
            <div key={i} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16, fontSize: 31, fontWeight: 500}}>
              <Skeleton show={1 - beatIns[i]} lines={[0.7]} inline />
              <div style={{display: 'flex', alignItems: 'center', gap: 16, ...fadeUp(beatIns[i], 18)}}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  flex: '0 0 42px',
                  borderRadius: 999,
                  background: accent.main,
                  color: '#fff',
                  fontSize: 24,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </div>
              <span>{b}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Takeaway: the lesson, repeated through this story */}
        <div style={{height: 92, marginTop: portrait ? 18 : 24, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              background: accent.main,
              color: '#fff',
              borderRadius: 28,
              padding: '16px 36px',
              fontSize: 38,
              fontWeight: 700,
              opacity: takeaway,
              transform: `translateY(${(1 - takeaway) * 24}px) scale(${0.9 + 0.1 * takeaway})`,
              boxShadow: '0 10px 26px rgba(28,35,51,0.16)',
            }}
          >
            {scene.takeaway}
          </div>
        </div>
      </Card>

      {showCaptions ? <Captions captions={plan.captions} /> : null}
    </SceneFrame>
  );
};
