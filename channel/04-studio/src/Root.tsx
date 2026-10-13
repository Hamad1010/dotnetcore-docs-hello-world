import React from 'react';
import {Composition, Still, staticFile, type CalculateMetadataFunction} from 'remotion';
import {buildPlan, FPS, type Timings} from './lib/plan';
import {EpisodeVideo, type EpisodeData, type EpisodeProps} from './Episode';
import {Thumbnail, type ThumbProps} from './Thumbnail';
import {ensureFonts} from './fonts';
import type {Brand, Episode} from './types';

ensureFonts();

const exists = async (path: string) => {
  try {
    const r = await fetch(staticFile(path), {method: 'HEAD'});
    return r.ok;
  } catch {
    return false;
  }
};

// Loads 03-episodes/<episodeId>/episode.json (+ audio/timings.json when a voice exists)
const loadEpisode = async (episodeId: string): Promise<EpisodeData> => {
  const [episode, brand] = (await Promise.all([
    fetch(staticFile(`${episodeId}/episode.json`)).then((r) => r.json()),
    fetch(staticFile('channel.json')).then((r) => r.json()),
  ])) as [Episode, Brand];
  let timings: Timings | null = null;
  if (await exists(`${episodeId}/audio/timings.json`)) {
    timings = await fetch(staticFile(`${episodeId}/audio/timings.json`)).then((r) => r.json());
  }
  const plan = buildPlan(episode, timings, FPS);
  // Background sound is a channel-wide setting in 03-episodes/channel.json → "background": none | humming | calm
  const file = {humming: '_assets/music/humming.mp3', calm: '_assets/music/calm-pad.mp3', none: null}[brand.background ?? 'none'] ?? null;
  const music = file && (await exists(file)) ? file : null;
  const sfx = await exists('_assets/sfx/whoosh.mp3');
  return {episode, plan, brand, music, sfx};
};

const episodeMeta: CalculateMetadataFunction<EpisodeProps> = async ({props}) => {
  const data = await loadEpisode(props.episodeId);
  return {durationInFrames: data.plan.total, props: {...props, data}};
};

type ShortProps = EpisodeProps & {sceneIds: string[]};
// Shorts always burn in captions (many people watch on mute); long videos get the SRT file instead.
const ShortVideo: React.FC<ShortProps> = (props) => <EpisodeVideo {...props} showCaptions={props.showCaptions ?? true} />;

// A vertical Short cut from an episode: the chosen scenes + a 3-second "full lesson on the channel" card.
const shortMeta: CalculateMetadataFunction<ShortProps> = async ({props}) => {
  const full = await loadEpisode(props.episodeId);
  const scenes = full.episode.scenes.filter((s) => props.sceneIds.includes(s.id));
  const episode: Episode = {...full.episode, scenes: [...scenes, {id: 'end', type: 'endcard', narration: '', minSeconds: 3}]};
  let timings: Timings | null = null;
  if (await exists(`${props.episodeId}/audio/timings.json`)) {
    timings = await fetch(staticFile(`${props.episodeId}/audio/timings.json`)).then((r) => r.json());
  }
  const plan = buildPlan(episode, timings, FPS);
  return {durationInFrames: plan.total, props: {...props, data: {...full, episode, plan}}};
};

const thumbMeta: CalculateMetadataFunction<ThumbProps> = async ({props}) => {
  const data = await loadEpisode(props.episodeId);
  return {props: {...props, data}};
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Episode"
      component={EpisodeVideo}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{episodeId: 'EP001'} as EpisodeProps}
      calculateMetadata={episodeMeta}
    />
    <Composition
      id="Short"
      component={ShortVideo}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{episodeId: 'EP001', sceneIds: ['s4']} as ShortProps}
      calculateMetadata={shortMeta}
    />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} defaultProps={{episodeId: 'EP001'} as ThumbProps} calculateMetadata={thumbMeta} />
  </>
);
