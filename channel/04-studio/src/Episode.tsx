import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ACCENTS, C, DARK} from './theme';
import type {Plan} from './lib/plan';
import type {Brand, Episode} from './types';
import {Hook, Lesson, Title} from './scenes/IntroScenes';
import {StoryScene} from './scenes/StoryScene';
import {EndCard, Outro, Practice, Recap} from './scenes/ClosingScenes';
import {Journey, Overview, Stage, StoryHook} from './scenes/BizScenes';
import {Sfx, SfxOn} from './components/Sfx';
import {cueAt} from './scenes/common';

export type EpisodeData = {episode: Episode; plan: Plan; brand: Brand; music: string | null; sfx: boolean};
export type EpisodeProps = {episodeId: string; showCaptions?: boolean; background?: string; data?: EpisodeData};

const HOME = {lat: 24.71, lon: 46.68}; // the globe always starts from Riyadh

export const EpisodeVideo: React.FC<EpisodeProps> = ({episodeId, showCaptions, data}) => {
  const frame = useCurrentFrame();
  if (!data) return <AbsoluteFill style={{background: C.bg}} />;
  const {episode, plan, brand, music, sfx} = data;
  const hasVoice = plan.scenes.some((s) => s.audio);
  // Without a voice track the captions carry the story, so they are always on.
  const caps = showCaptions ?? !hasVoice;
  const storyCount = episode.scenes.filter((s) => s.type === 'story').length;

  let camera = HOME;
  let storyNo = 0;
  // The background sits `backgroundLevel` dB under the voice (both measured as loudness: the voice at -16 LUFS, the
  // background files at -18 LUFS) and swells 4 dB in the pauses between scenes.
  const under = hasVoice ? Math.pow(10, (2 - (brand.backgroundLevel ?? 21)) / 20) : 0.2;
  const gap = hasVoice ? under * 1.58 : under;
  const speaking = plan.scenes.map((sp) => [sp.from + sp.speechStart, sp.from + sp.speechStart + sp.speechFrames] as const);
  // The «وقفة» (framework v5 §3.15) is quiet: no sound effects, and the background fades out around it.
  const isQuiet = (i: number) => {
    const s = episode.scenes[i];
    return s.type === 'stage' && !!s.quiet;
  };
  const quiet = plan.scenes.filter((_, i) => isQuiet(i)).map((sp) => [sp.from, sp.from + sp.frames] as const);
  const hush = (f: number) =>
    Math.min(1, ...quiet.map(([a, b]) => (f < a ? interpolate(f, [a - 40, a], [1, 0], {extrapolateLeft: 'clamp'}) : f > b ? interpolate(f, [b, b + 60], [0, 1], {extrapolateRight: 'clamp'}) : 0)));
  const musicVolume = (f: number) => {
    // distance (in frames) to the nearest stretch of speech: 0 while the voice is on
    const away = Math.min(...speaking.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)));
    const level = interpolate(away, [0, 8, 18], [under, under, gap], {extrapolateRight: 'clamp'});
    return level * hush(f) * interpolate(f, [0, 45, plan.total - 75, plan.total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };
  // From the teaser's first word the page under the scenes is dark too, so nothing flashes light between scenes.
  const darkIndex = episode.scenes.findIndex((s) => s.type === 'stage' && (s.darkCue || s.dark));
  const darkScene = darkIndex >= 0 ? episode.scenes[darkIndex] : null;
  const darkFrom =
    darkScene && darkScene.type === 'stage'
      ? plan.scenes[darkIndex].from + (darkScene.darkCue ? cueAt(plan.scenes[darkIndex], darkScene.narration, darkScene.darkCue, 1) : 0)
      : Infinity;

  return (
    <SfxOn.Provider value={sfx}>
    <AbsoluteFill style={{background: frame >= darkFrom ? DARK.bg : C.bg}}>
      {episode.scenes.map((scene, i) => {
        const sp = plan.scenes[i];
        let storyIndex = 0;
        const prevPos = camera;
        if (scene.type === 'story') {
          storyNo += 1;
          storyIndex = storyNo;
          camera = scene.arcTo ? {lat: scene.arcTo.lat, lon: scene.arcTo.lon} : {lat: scene.lat, lon: scene.lon};
        }
        const accent = scene.type === 'story' ? ACCENTS[(storyIndex - 1) % ACCENTS.length] : ACCENTS[0];
        const common = {plan: sp, episode, brand, storyIndex, storyCount, accent, prevPos, showCaptions: caps};
        let el: React.ReactNode = null;
        switch (scene.type) {
          case 'hook':
            el = <Hook scene={scene} {...common} />;
            break;
          case 'title':
            el = <Title scene={scene} {...common} />;
            break;
          case 'lesson':
            el = <Lesson scene={scene} {...common} />;
            break;
          case 'story':
            el = <StoryScene scene={scene} {...common} />;
            break;
          case 'recap':
            el = <Recap scene={scene} {...common} />;
            break;
          case 'practice':
            el = <Practice scene={scene} {...common} />;
            break;
          case 'outro':
            el = <Outro scene={scene} {...common} />;
            break;
          case 'endcard':
            el = <EndCard scene={scene} {...common} />;
            break;
          case 'storyhook':
            el = <StoryHook scene={scene} {...common} />;
            break;
          case 'overview':
            el = <Overview scene={scene} {...common} />;
            break;
          case 'journey':
            el = <Journey scene={scene} {...common} />;
            break;
          case 'stage':
            el = <Stage scene={scene} {...common} />;
            break;
        }
        return (
          <Sequence key={scene.id} from={sp.from} durationInFrames={sp.frames} name={`${scene.id} · ${scene.type}`}>
            <SfxOn.Provider value={sfx && !isQuiet(i)}>{el}</SfxOn.Provider>
            {sp.audio ? (
              <Sequence from={sp.speechStart} name="voice">
                <Html5Audio src={staticFile(`${episodeId}/audio/${sp.audio}`)} />
              </Sequence>
            ) : null}
            {i > 0 && !isQuiet(i) ? <Sfx at={0} name="whoosh" /> : null}
          </Sequence>
        );
      })}
      {music ? <Html5Audio src={staticFile(music)} loop volume={musicVolume} /> : null}
    </AbsoluteFill>
    </SfxOn.Provider>
  );
};
