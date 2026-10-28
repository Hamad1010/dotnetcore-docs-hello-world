import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from './theme';
import type {EpisodeData} from './Episode';
import {Globe} from './components/Globe';
import {episodeTag} from './scenes/common';

export type ThumbProps = {episodeId: string; data?: EpisodeData};

// 1280×720. Rules: max ~5 words, huge type, one strong visual, same layout every episode
// (recognizable series), and it must match what the video shows in its first seconds.
export const Thumbnail: React.FC<ThumbProps> = ({data}) => {
  if (!data) return <AbsoluteFill style={{background: C.bg}} />;
  const {episode, brand} = data;
  const th = episode.thumbnail ?? {};
  const story = episode.scenes.find((s) => s.type === 'story');
  const storyCount = episode.scenes.filter((s) => s.type === 'story').length;
  const line1 = th.line1 ?? episode.kicker;
  const badge = th.badge ?? `${storyCount} قصص حقيقية`;

  const R = 230;
  const visual = th.big ? (
    <div style={{position: 'absolute', left: 70, top: 105, width: 2 * R + 40, height: 2 * R + 40}}>
      <svg width={2 * R + 40} height={2 * R + 40}>
        <circle cx={R + 20} cy={R + 20} r={R} fill="#fff" stroke={C.blue} strokeWidth={30} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: 200, fontWeight: 700, color: C.blue, lineHeight: 1, direction: 'ltr'}}>{th.big}</div>
        <div style={{fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 6}}>{th.bigUnit}</div>
      </div>
    </div>
  ) : (
    <div style={{position: 'absolute', left: -40, top: 60}}>
      <Globe
        size={620}
        keys={[{at: 0, pos: story && story.type === 'story' ? {lat: story.lat, lon: story.lon} : {lat: 24.7, lon: 46.7}}]}
        accent={C.red}
        highlight={story && story.type === 'story' ? story.isoNumeric : undefined}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{background: '#FFFFFF', fontFamily: FONT, direction: 'rtl', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -170, top: -90, width: 860, height: 860, borderRadius: '50%', background: C.blueSoft}} />
      {visual}
      <div style={{position: 'absolute', right: 60, top: 58}}>
        <div style={{background: C.ink, color: '#fff', fontSize: 36, fontWeight: 700, padding: '8px 26px', borderRadius: 999}}>{episodeTag(episode, brand)}</div>
      </div>
      <div style={{position: 'absolute', right: 60, top: 175, width: 640}}>
        <div style={{fontSize: 104, fontWeight: 700, color: C.ink, lineHeight: 1.18}}>{line1}</div>
        {th.line2 ? <div style={{fontSize: 70, fontWeight: 700, color: C.blue, lineHeight: 1.2, marginTop: 16}}>{th.line2}</div> : null}
      </div>
      <div style={{position: 'absolute', right: 60, bottom: 64}}>
        <div style={{display: 'inline-flex', background: C.yellow, color: C.ink, fontSize: 44, fontWeight: 700, padding: '12px 34px', borderRadius: 22}}>{badge}</div>
      </div>
    </AbsoluteFill>
  );
};
