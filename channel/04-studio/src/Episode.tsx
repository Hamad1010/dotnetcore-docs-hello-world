import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile} from 'remotion';
import {ACCENTS, C} from './theme';
import type {Plan} from './lib/plan';
import type {Brand, Episode} from './types';
import {Hook, Lesson, Title} from './scenes/IntroScenes';
import {StoryScene} from './scenes/StoryScene';
import {EndCard, Outro, Practice, Recap} from './scenes/ClosingScenes';
import {Journey, Overview, Stage, StoryHook} from './scenes/BizScenes';
import {Sfx, SfxOn} from './components/Sfx';

export type EpisodeData = {episode: Episode; plan: Plan; brand: Brand; music: string | null; sfx: boolean};
export type EpisodeProps = {episodeId: string; showCaptions?: boolean; background?: string; data?: EpisodeData};

const HOME = {lat: 24.71, lon: 46.68}; // the globe always starts from Riyadh

export const EpisodeVideo: React.FC<EpisodeProps> = ({episodeId, showCaptions, data}) => {
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
  const musicVolume = (f: number) => {
    // distance (in frames) to the nearest stretch of speech: 0 while the voice is on
    const away = Math.min(...speaking.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)));
    const level = interpolate(away, [0, 8, 18], [under, under, gap], {extrapolateRight: 'clamp'});
    return level * interpolate(f, [0, 45, plan.total - 75, plan.total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };

  return (
    <SfxOn.Provider value={sfx}>
    <AbsoluteFill style={{background: C.bg}}>
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
            {el}
            {sp.audio ? (
              <Sequence from={sp.speechStart} name="voice">
                <Html5Audio src={staticFile(`${episodeId}/audio/${sp.audio}`)} />
              </Sequence>
            ) : null}
            {i > 0 ? <Sfx at={0} name="whoosh" /> : null}
          </Sequence>
        );
      })}
      {music ? <Html5Audio src={staticFile(music)} loop volume={musicVolume} /> : null}
    </AbsoluteFill>
    </SfxOn.Provider>
  );
};
