import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile} from 'remotion';
import {ACCENTS, C} from './theme';
import type {Plan} from './lib/plan';
import type {Brand, Episode} from './types';
import {Hook, Lesson, Title} from './scenes/IntroScenes';
import {StoryScene} from './scenes/StoryScene';
import {EndCard, Outro, Practice, Recap} from './scenes/ClosingScenes';
import {Journey, Overview, StoryHook} from './scenes/BizScenes';

export type EpisodeData = {episode: Episode; plan: Plan; brand: Brand; music: string | null; sfx: boolean};
export type EpisodeProps = {episodeId: string; showCaptions?: boolean; data?: EpisodeData};

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
  const musicBase = hasVoice ? 0.07 : 0.2;

  return (
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
        }
        return (
          <Sequence key={scene.id} from={sp.from} durationInFrames={sp.frames} name={`${scene.id} · ${scene.type}`}>
            {el}
            {sp.audio ? (
              <Sequence from={sp.speechStart} name="voice">
                <Html5Audio src={staticFile(`${episodeId}/audio/${sp.audio}`)} />
              </Sequence>
            ) : null}
            {sfx && i > 0 && (scene.type === 'story' || scene.type === 'title' || scene.type === 'recap' || scene.type === 'overview' || scene.type === 'journey') ? (
              <Html5Audio src={staticFile('_assets/sfx/whoosh.mp3')} volume={0.22} />
            ) : null}
          </Sequence>
        );
      })}
      {music ? (
        <Html5Audio
          src={staticFile(music)}
          loop
          volume={(f) => interpolate(f, [0, 45, plan.total - 75, plan.total], [0, musicBase, musicBase, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      ) : null}
    </AbsoluteFill>
  );
};
