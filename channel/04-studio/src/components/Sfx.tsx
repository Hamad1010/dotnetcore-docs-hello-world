// Sound effects (made by scripts/music.mjs → 03-episodes/_assets/sfx/): each one marks something that appears,
// moves, lands or counts on screen. Levels sit well under the voice.
import React from 'react';
import {Html5Audio, Sequence, staticFile, useVideoConfig} from 'remotion';

export type SfxName =
  | 'pop'
  | 'bubble'
  | 'tick'
  | 'type'
  | 'type2'
  | 'swish'
  | 'whoosh'
  | 'strike'
  | 'stamp'
  | 'impact'
  | 'riser'
  | 'shimmer'
  | 'paper'
  | 'roll'
  | 'ping'
  | 'coin'
  | 'thud'
  | 'question'
  | 'buzz'
  | 'click';

const SECONDS: Record<SfxName, number> = {
  pop: 0.21,
  bubble: 0.16,
  tick: 0.08,
  type: 0.13,
  type2: 0.13,
  swish: 0.4,
  whoosh: 0.74,
  strike: 0.21,
  stamp: 0.63,
  impact: 1.55,
  riser: 1.65,
  shimmer: 1.05,
  paper: 0.37,
  roll: 1.0,
  ping: 0.95,
  coin: 0.5,
  thud: 0.34,
  question: 0.42,
  buzz: 0.58,
  click: 0.1,
};

// Default level of each sound under a voice at -16 LUFS.
const LEVEL: Record<SfxName, number> = {
  pop: 0.32,
  bubble: 0.3,
  tick: 0.3,
  type: 0.34,
  type2: 0.34,
  swish: 0.26,
  whoosh: 0.34,
  strike: 0.3,
  stamp: 0.5,
  impact: 0.42,
  riser: 0.3,
  shimmer: 0.4,
  paper: 0.34,
  roll: 0.34,
  ping: 0.3,
  coin: 0.42,
  thud: 0.4,
  question: 0.2,
  buzz: 0.4,
  click: 0.45,
};

/** True when the sound effects exist (`npm run music -- sfx`); Episode.tsx provides it. */
export const SfxOn = React.createContext(false);

/** One sound at frame `at` of the current scene. */
export const Sfx: React.FC<{at: number; name: SfxName; volume?: number}> = ({at, name, volume = 1}) => {
  const on = React.useContext(SfxOn);
  const {fps} = useVideoConfig();
  if (!on || !Number.isFinite(at)) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={Math.ceil(SECONDS[name] * fps) + 2} layout="none" name={`sfx ${name}`}>
      <Html5Audio src={staticFile(`_assets/sfx/${name}.mp3`)} volume={LEVEL[name] * volume} />
    </Sequence>
  );
};
