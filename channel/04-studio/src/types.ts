// Shape of 03-episodes/EPxxx/episode.json (the single source of truth for an episode).

export type Stat = {value: string; unit?: string; label: string};
export type Place = {lat: number; lon: number; label?: string};

type Base = {
  id: string;
  narration: string;
  /** Used instead of `narration` when this scene is cut into a Short (a stand-alone opening). Its audio is `<id>-short`. */
  shortNarration?: string;
  chapter?: string;
  minSeconds?: number;
};

export type HookScene = Base & {
  type: 'hook';
  bigValue: string;
  bigUnit: string;
  bigLabel: string;
  citation?: string;
  question: string;
  crossed: string[];
};

export type TitleScene = Base & {type: 'title'};

export type LessonScene = Base & {
  type: 'lesson';
  questions: {n: string; q: string; tag: string}[];
  citation?: string;
  rule: string;
  examples: string[];
};

export type StoryScene = Base & {
  type: 'story';
  country: string;
  isoNumeric: string;
  place: string;
  lat: number;
  lon: number;
  arcFrom?: Place;
  arcTo?: Place;
  year: string;
  topic: string;
  headline: string;
  stats: Stat[];
  beats: string[];
  takeaway: string;
};

export type RecapScene = Base & {
  type: 'recap';
  people: {name: string; where: string}[];
  rule: string;
};

export type PracticeScene = Base & {type: 'practice'; steps: string[]};
export type OutroScene = Base & {type: 'outro'};
export type EndCardScene = Base & {type: 'endcard'};

export type Scene = HookScene | TitleScene | LessonScene | StoryScene | RecapScene | PracticeScene | OutroScene | EndCardScene;

export type Episode = {
  id: string;
  lesson: string;
  season: number;
  title: string;
  kicker: string;
  youtubeTitle?: string;
  thumbnail?: {line1?: string; line2?: string; badge?: string; big?: string; bigUnit?: string};
  next?: {lesson: string; title: string; teaser: string};
  /** Shorts to cut from this episode: each entry is a list of scene ids, e.g. [["hook","lesson"],["s4"]] */
  shorts?: string[][];
  scenes: Scene[];
};

export type Brand = {name: string; nameEn: string; handle: string; tagline: string; background?: 'none' | 'humming' | 'calm'};
