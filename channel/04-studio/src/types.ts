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

/** neg = a loss or a "no", pos = a win, accent = the key number, gold = money. */
export type Tone = 'neg' | 'pos' | 'accent' | 'gold';
/** One moment of a short story. `cue` = a word from the (spoken) narration: the card appears when it is said. */
export type Beat = {cue?: string; year?: string; value?: string; unit?: string; label: string; tone?: Tone; gapLabel?: string;
  /** a touchable comparison shown under the card when `noteCue` is spoken */
  note?: string; noteCue?: string};

/** Business format, part 1: the "stop scrolling" short story told as a timeline of numbers over silhouettes. */
export type StoryHookScene = Base & {type: 'storyhook'; place?: string; beats: Beat[]; phoneCue?: string};

/** Business format, part 2: the smart transition. A before/after comparison, the topic, and what's coming. */
export type OverviewScene = Base & {
  type: 'overview';
  compare?: {from: {value: string; label: string; count: number; cue?: string}; to: {value: string; label: string; cue?: string}};
  topic: string;
  topicSub?: string;
  roadmap?: string[];
  roadmapCue?: string;
  /** the case file, e.g. "الملف 01 · لغز الـ55", shown when `fileCue` is spoken */
  file?: string;
  fileCue?: string;
};

/** One stop on the journey map. `cue` = the spoken word that makes it appear. */
export type JourneyStop = {label: string; cue?: string; mark?: 'loop' | 'puzzle'};

/** Framework v3 §1: the journey map. Shown whole in the bridge, then at each station with the traveller moving on. */
export type JourneyScene = Base & {
  type: 'journey';
  title?: string;
  start: JourneyStop;
  stations: JourneyStop[];
  destination: JourneyStop;
  /** where the traveller stands: 0 = start, 1…n = stations, n + 1 = destination */
  at?: number;
  /** where the traveller walks from (a station change); default = `at`, which draws the road as it is told */
  from?: number;
  /** the word that makes the opening-loop badge ("؟") pulse */
  loopCue?: string;
  /** the word that shows the puzzle badge */
  puzzleCue?: string;
};

export type Scene =
  | HookScene
  | TitleScene
  | LessonScene
  | StoryScene
  | RecapScene
  | PracticeScene
  | OutroScene
  | EndCardScene
  | StoryHookScene
  | OverviewScene
  | JourneyScene;

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

export type Brand = {
  name: string;
  nameEn: string;
  handle: string;
  tagline: string;
  background?: 'none' | 'humming' | 'calm';
  /** shown before the episode number, e.g. "الملف" → "الملف 01" */
  episodeLabel?: string;
};
