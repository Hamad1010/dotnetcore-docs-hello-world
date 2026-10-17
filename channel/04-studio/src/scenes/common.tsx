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

/** Frame at which a cue word is spoken, estimated from its position in the narration (else `fallback`). */
export const cueAt = (plan: ScenePlan, narration: string, cue: string | undefined, fallback: number) => {
  if (cue) {
    const text = spoken(narration);
    const i = text.indexOf(cue);
    if (i >= 0) return at(plan, i / Math.max(1, text.length));
  }
  return at(plan, fallback);
};

export const lessonNumber = (episode: Episode) => parseInt(episode.lesson.replace(/\D/g, ''), 10);

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
          الدرس {lessonNumber(episode)} · {episode.title}
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
          الدرس {lessonNumber(episode)} · {episode.title}
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
