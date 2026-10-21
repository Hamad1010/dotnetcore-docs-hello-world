import React from 'react';
import {C} from '../theme';
import {spoken, type ScenePlan} from '../lib/plan';
import type {Brand, Episode} from '../types';
import {BrandMark, Chip, useIn, usePortrait} from '../components/ui';

export type SceneProps<T> = {
  scene: T;
  plan: ScenePlan;
  episode: Episode;
  brand: Brand;
  storyIndex: number; // 1-based for story scenes, 0 otherwise
  storyCount: number;
  accent: {main: string; soft: string};
  prevPos: {lat: number; lon: number};
};

/** Frame (relative to scene start) at a given fraction of the narration. */
export const at = (plan: ScenePlan, fraction: number) => Math.round(plan.speechStart + plan.speechFrames * fraction);

/** Where a cue starts in the spoken narration (character index), or -1. "phrase@2" = its second occurrence. */
const findCue = (text: string, cue: string) => {
  const m = cue.match(/^(.*)@(\d+)$/);
  const [want, nth] = m ? [m[1], parseInt(m[2], 10)] : [cue, 1];
  let i = -1;
  for (let k = 0; k < nth; k++) {
    i = text.indexOf(want, i + 1);
    if (i < 0) return -1;
  }
  return i;
};

/** Frame at which a cue word is spoken: from the aligned real voice when there is one, else estimated from its
 * position in the narration (else `fallback`). */
export const cueAt = (plan: ScenePlan, narration: string, cue: string | undefined, fallback: number) => {
  if (cue) {
    const text = spoken(narration);
    const i = findCue(text, cue);
    if (i >= 0 && plan.marks) return plan.marks[Math.min(plan.marks.length - 1, text.slice(0, i).split(' ').length - 1)];
    if (i >= 0) return at(plan, i / Math.max(1, text.length));
  }
  return at(plan, fallback);
};

/** Frames at which `count` spoken words starting at `cue` are said (a quote typed word by word as it is read). */
export const wordFrames = (plan: ScenePlan, narration: string, cue: string, count: number): number[] => {
  const text = spoken(narration);
  const i = findCue(text, cue);
  if (i < 0) return [];
  const words = text.split(' ');
  const first = text.slice(0, i).split(' ').length - 1;
  return Array.from({length: count}, (_, k) => {
    const w = Math.min(words.length - 1, first + k);
    if (plan.marks) return plan.marks[Math.min(plan.marks.length - 1, w)];
    return at(plan, words.slice(0, w).join(' ').length / Math.max(1, text.length));
  });
};

export const lessonNumber = (episode: Episode) => parseInt(episode.lesson.replace(/\D/g, ''), 10);

/** What viewers see: the episode number in publication order, e.g. "الملف 01" (lesson ids can be reordered). */
export const episodeTag = (episode: Episode, brand: Brand) =>
  `${brand.episodeLabel ?? 'الحلقة'} ${String(parseInt(episode.id.replace(/\D/g, ''), 10)).padStart(2, '0')}`;

export const TopBar: React.FC<{episode: Episode; brand: Brand; storyIndex?: number; storyCount?: number; accent?: string}> = ({
  episode,
  brand,
  storyIndex = 0,
  storyCount = 0,
  accent = C.blue,
}) => {
  const p = useIn(2, 16);
  const portrait = usePortrait();
  if (portrait) {
    return (
      <div style={{position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: p, direction: 'rtl'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <BrandMark size={58} />
          <div style={{fontSize: 34, fontWeight: 700}}>{brand.name}</div>
        </div>
        <Chip size={28} color={C.ink2}>
          {episodeTag(episode, brand)} · {episode.title}
        </Chip>
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        right: 72,
        left: 72,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: p,
        direction: 'rtl',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <BrandMark size={52} />
        <div style={{fontSize: 28, fontWeight: 700}}>{brand.name}</div>
        <Chip size={24} color={C.ink2}>
          {episodeTag(episode, brand)} · {episode.title}
        </Chip>
      </div>
      {storyCount > 0 ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl'}}>
          {Array.from({length: storyCount}, (_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === storyIndex ? 44 : 14,
                height: 14,
                borderRadius: 999,
                background: i + 1 <= storyIndex ? accent : C.line,
                opacity: i + 1 < storyIndex ? 0.45 : 1,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
