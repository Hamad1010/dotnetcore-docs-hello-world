import React from 'react';
import {Composition, Still, staticFile, type CalculateMetadataFunction} from 'remotion';
import {buildPlan, FPS, type Timings} from './lib/plan';
import {EpisodeVideo, type EpisodeData, type EpisodeProps} from './Episode';
import {Thumbnail, type ThumbProps} from './Thumbnail';
import {LogoSheet, LogoSingle} from './Brandkit';
import {AvatarStill} from './Avatars';
import {BannerStill} from './Banners';
import {ThumbVariant, thumbVariantMeta, type ThumbVariantProps} from './ThumbVariants';
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

// Loads 03-episodes/<episodeId>/episode.json (+ audio/timings.json when a voice exists).
// `background` overrides channel.json's (to compare backgrounds, or to render the voice without one).
const loadEpisode = async (episodeId: string, background?: string): Promise<EpisodeData> => {
  const [episode, brand] = (await Promise.all([
    fetch(staticFile(`${episodeId}/episode.json`)).then((r) => r.json()),
    fetch(staticFile('channel.json')).then((r) => r.json()),
  ])) as [Episode, Brand];
  let timings: Timings | null = null;
  if (await exists(`${episodeId}/audio/timings.json`)) {
    timings = await fetch(staticFile(`${episodeId}/audio/timings.json`)).then((r) => r.json());
  }
  const plan = buildPlan(episode, timings, FPS);
  // Background sound is a channel-wide setting in 03-episodes/channel.json → "background": a file in
  // _assets/music/ (without .mp3), or "none"
  const name = background ?? brand.background ?? 'none';
  const file = name === 'none' ? null : `_assets/music/${name === 'calm' ? 'calm-pad' : name}.mp3`;
  const music = file && (await exists(file)) ? file : null;
  const sfx = await exists('_assets/sfx/pop.mp3');
  const level = episode.backgroundLevel ?? brand.backgroundLevel;
  return {episode, plan, brand: {...brand, backgroundLevel: level}, music, sfx};
};

const episodeMeta: CalculateMetadataFunction<EpisodeProps> = async ({props}) => {
  const data = await loadEpisode(props.episodeId, props.background);
  return {durationInFrames: data.plan.total, props: {...props, data}};
};

type ShortProps = EpisodeProps & {sceneIds: string[]};
// Shorts always burn in captions (many people watch on mute); long videos get the SRT file instead.
const ShortVideo: React.FC<ShortProps> = (props) => <EpisodeVideo {...props} showCaptions={props.showCaptions ?? true} />;

// A vertical Short cut from an episode: the chosen scenes + a 3-second "full lesson on the channel" card.
const shortMeta: CalculateMetadataFunction<ShortProps> = async ({props}) => {
  const full = await loadEpisode(props.episodeId);
  const scenes = full.episode.scenes
    .filter((s) => props.sceneIds.includes(s.id))
    .map((s) => (s.shortNarration ? {...s, id: `${s.id}-short`, narration: s.shortNarration} : s));
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
    {/* The publish kit's three thumbnails (scripts/thumbs.mjs) and the logo concepts (scripts/brandkit.mjs) */}
    <Still id="ThumbVariant" component={ThumbVariant} width={1280} height={720} defaultProps={{episodeId: 'EP001', index: 0} as ThumbVariantProps} calculateMetadata={thumbVariantMeta} />
    <Still id="LogoSheet" component={LogoSheet} width={1920} height={1080} />
    <Still id="Logo" component={LogoSingle} width={800} height={800} defaultProps={{n: 1}} />
    {/* The launch kit (scripts/launchkit.mjs): channel avatars and banners */}
    <Still id="Avatar" component={AvatarStill} width={800} height={800} defaultProps={{id: 'host-01'}} />
    <Still id="Banner" component={BannerStill} width={2560} height={1440} defaultProps={{n: 1, guides: false}} />
  </>
);
