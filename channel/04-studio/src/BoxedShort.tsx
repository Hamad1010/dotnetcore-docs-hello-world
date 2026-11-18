// A Short cut from wide scenes (the stage scenes of EP003 on, whose cards are laid out for 16:9): the scenes keep their
// layout in a band across the middle of the vertical frame, the Short's title above it and big captions under it, and
// the last 3 seconds are the vertical end card. The sound is the episode's own: voice, hum and sounds.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {EpisodeVideo, type EpisodeProps} from './Episode';
import {applyLook} from './look';
import {ACCENTS, C, FONT} from './theme';
import type {EndCardScene} from './types';
import {Backdrop, Captions} from './components/ui';
import {FrameSize} from './components/frame';
import {DEEP} from './components/moment-kit';
import {EndCard} from './scenes/ClosingScenes';
import {episodeTag} from './scenes/common';

const WIDE = {width: 1920, height: 1080};
// the band: the full width, 16:9, its top leaving room for the title under the app's top bar
const BAND = {top: 560, width: 1080, height: (1080 * 9) / 16};
// the captions just under the band, still well above the app's title and buttons at the bottom
const CAPTIONS_BOTTOM = 470;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const BoxedShort: React.FC<EpisodeProps & {title?: string}> = (props) => {
  const f = useCurrentFrame();
  const {data, title} = props;
  if (!data) return <AbsoluteFill style={{background: C.bg}} />;
  const {episode, plan, brand} = data;
  // the look before anything is drawn (the band's EpisodeVideo sets it too, but after the backdrop)
  applyLook(episode.look);
  const last = plan.scenes.length - 1; // the end card the Short adds
  const endAt = plan.scenes[last].from;
  // on screen from the very first frame (the feed shows it before anyone taps), gone into the end card
  const shown = interpolate(f, [endAt, endAt + 10], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', top: 200, left: 70, right: 70, height: BAND.top - 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, direction: 'rtl', fontFamily: FONT, textAlign: 'center', opacity: shown}}>
        <div style={{fontSize: 32, fontWeight: 600, color: C.ink2}}>
          {brand.name} · {episodeTag(episode, brand)}
        </div>
        {title ? <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.3, color: C.ink, textWrap: 'balance'}}>{title}</div> : null}
      </div>
      <div style={{position: 'absolute', top: BAND.top, left: 0, width: BAND.width, height: BAND.height, overflow: 'hidden', boxShadow: DEEP, opacity: shown}}>
        <div style={{position: 'relative', ...WIDE, transform: `scale(${BAND.width / WIDE.width})`, transformOrigin: 'top left'}}>
          <FrameSize.Provider value={WIDE}>
            <EpisodeVideo {...props} showCaptions={false} />
          </FrameSize.Provider>
        </div>
      </div>
      {plan.scenes.slice(0, last).map((sp, i) => (
        <Sequence key={i} from={sp.from} durationInFrames={sp.frames} layout="none">
          <Captions captions={sp.captions} bottom={CAPTIONS_BOTTOM} />
        </Sequence>
      ))}
      <Sequence from={endAt} durationInFrames={plan.scenes[last].frames}>
        <EndCard
          scene={episode.scenes[last] as EndCardScene}
          plan={plan.scenes[last]}
          episode={episode}
          brand={brand}
          storyIndex={0}
          storyCount={0}
          accent={ACCENTS[0]}
          prevPos={{lat: 24.71, lon: 46.68}}
          showCaptions={false}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
