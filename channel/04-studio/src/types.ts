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
  note?: string; noteCue?: string;
  /** the question that comes before the reveal ("تتوقعون كم دفعت؟"): the empty card shows "؟" from this word */
  askCue?: string};

/** Where an explainer moment sits: a third of the middle band, the top or bottom band, the floor, or the whole stage. */
export type MomentSlot = 'right' | 'center' | 'left' | 'top-right' | 'top' | 'top-left' | 'bottom-right' | 'bottom' | 'bottom-left' | 'floor' | 'stage';

type MomentBase = {
  /** the spoken word that brings it in ("phrase@2" = the phrase's second occurrence) */
  cue: string;
  /** the spoken word that takes it away; default: when the next moment takes its slot, or at the end of the scene */
  until?: string;
  slot?: MomentSlot;
  /** sits on top of its slot's moment instead of replacing it (a stamp on a card) */
  over?: boolean;
  /** pixels to shift it from the slot's centre [x, y] */
  nudge?: [number, number];
  /** moves (and shrinks) to another slot when `moveCue` is said, making room for what comes next */
  moveTo?: MomentSlot;
  moveCue?: string;
  /** a made-up example, not a real case: labelled «مثال توضيحي» on screen (CLAUDE.md rule 1) */
  illustration?: boolean;
  /** where a number comes from, in a small line under the moment */
  source?: string;
  /** seconds into the scene, for a scene with no narration (an end card); replaces `cue` */
  at?: number;
};

/** One side of a comparison. */
export type Side = {title: string; value: string; unit?: string; note?: string; /** the note waits for this word */ noteCue?: string; tone?: Tone; cue?: string};

/** Explainer visuals that appear on the narrator's words, so every sentence is seen as well as heard. */
export type Moment = MomentBase &
  (
    | {kind: 'date'; month?: string; year: string; to?: string; toCue?: string; note?: string; noteCue?: string}
    | {
        kind: 'profile';
        icon?: 'person' | 'pair' | 'building' | 'chat' | 'camera';
        title: string;
        /** the title types in when this word is said (until then a blank bar: the name isn't known yet) */
        titleCue?: string;
        subtitle?: string;
        tag?: string;
        tone?: Tone;
        fields?: {label: string; value: string; cue?: string; note?: string; noteCue?: string}[];
      }
    | {kind: 'stamp'; text: string; tone?: Tone; /** a smaller stamp, for the corner of a card */ small?: boolean}
    | {kind: 'quote'; who: string; meta?: string; text: string; textCue?: string; original?: string}
    | {kind: 'count'; value: string; unit?: string; label?: string; tone?: Tone}
    | {kind: 'question'; text?: string}
    | {kind: 'share'; shape: 'saudi' | 'world'; part: number; whole: number; title?: string; value?: string; label: string; fillCue?: string; tone?: Tone}
    | {kind: 'chips'; title?: string; items: {text: string; cue?: string; crossed?: boolean}[]; /** bigger chips, for a punchline on the stage */ big?: boolean}
    | {
        kind: 'people';
        count: number;
        cols?: number;
        value?: string;
        label?: string;
        tone?: Tone;
        /** the last `subs` people in another colour (the two reserves of a football team) */
        subs?: number;
        /** the last `fade` people fade and get crossed out when `fadeCue` is said (3 of 4 visitors lost) */
        fade?: number;
        fadeCue?: string;
        /** the first person lights up when `highlightCue` is said ("one device for every 6 people") */
        highlightCue?: string;
      }
    | {
        kind: 'tally';
        /** "one riyal every second": coins drop each second from `startCue`, race from `fastCue`, `total` lands at `resultCue` */
        unit: string;
        per: string;
        total: number;
        startCue: string;
        fastCue: string;
        resultCue: string;
        result: string;
        resultUnit: string;
        note?: string;
      }
    | {kind: 'send'; item: string; from: MomentSlot; to: MomentSlot; tone?: Tone}
    | {kind: 'mystery'; label?: string; /** the hidden thing is shown (a phone) when this word is said */ revealCue?: string}
    /** a big title on the stage, with an optional number badge and a line under it */
    | {kind: 'headline'; text: string; sub?: string; /** the sub line waits for this word */ subCue?: string; badge?: string; tone?: Tone}
    /** a nut and a wrench: the hand tries (`tryCue`) and fails (`stuckCue`), the handle grows (`longCue`), the nut
     * turns (`turnCue`) or the wrench slips (`slipCue`) */
    | {kind: 'wrench'; tryCue?: string; stuckCue?: string; longCue?: string; turnCue?: string; slipCue?: string; label?: string; doneLabel?: string}
    /** a day as a 24-hour dial that fills */
    | {kind: 'clock'; hours?: number; label?: string; labelCue?: string}
    /** many copies of one shape: "15 times the population of Saudi Arabia" */
    | {kind: 'times'; count: number; shape: 'saudi' | 'person' | 'device' | 'door'; value?: string; label?: string; tone?: Tone; mark?: string; /** the marks land one by one from this word ("no… no… no") */ markCue?: string}
    /** a self-check: one question at a time with progress dots, then the result bands */
    | {
        kind: 'quiz';
        title?: string;
        hint?: string;
        items: {cue: string; text: string; sub?: string; subCue?: string}[];
        /** the question that closes the self-check ("كم إصبع نزلت؟"), shown before the bands */
        ask?: {cue: string; text: string};
        bands?: {cue: string; range: string; text: string; tone?: Tone}[];
      }
    /** two things side by side */
    | {kind: 'versus'; title?: string; a: Side; b: Side; mid?: string}
    /** a phone with chat bubbles arriving on their words */
    | {kind: 'chat'; title?: string; bubbles: {cue: string; text: string; me?: boolean}[]; badge?: string; badgeCue?: string}
    /** a sum built term by term; `blank` terms stay empty boxes (a puzzle); `group` frames terms i..j (brackets) */
    | {kind: 'math'; title?: string; terms: {text?: string; cue?: string; blank?: boolean; label?: string; op?: boolean}[]; group?: [number, number]; result?: {text: string; cue?: string; tone?: Tone}}
    /** numbered steps, each on its word; the earlier ones get a tick */
    | {kind: 'steps'; title?: string; items: {cue: string; text: string; sub?: string; subCue?: string}[]; tone?: Tone}
    /** a phone's emergency alert, typed as it is read */
    | {kind: 'alert'; title: string; text: string; textCue?: string; original?: string; time?: string; date?: string}
    /** a big button pressed on a word */
    | {kind: 'button'; text: string; pressCue?: string; tone?: Tone}
    /** a globe that turns from Riyadh to a place and drops a pin */
    | {kind: 'globe'; lat: number; lon: number; label: string; sub?: string; subCue?: string}
    /** a search bar typing a query, with a rising trend line */
    | {kind: 'search'; query: string; note?: string; noteCue?: string}
    /** a case file: the next episode */
    | {kind: 'file'; title: string; text: string; note?: string}
    /** a verse or a hadith, its words lit as they are read (`textCue` = the first word as spoken, without tashkeel),
     * with its reference ("الزخرف: 32", "رواه البخاري (2262)"). A hadith told in pieces, with the narrator's words
     * between them, puts each piece on its own line of `text` and gives `textCue` one first word per line. */
    | {kind: 'scripture'; book: 'quran' | 'hadith'; text: string; ref: string; intro?: string; textCue?: string | string[]}
    /** the «فيه مشهد في النهاية» pop-up in the corner, from `cue` until the teaser starts (`until`) */
    | {kind: 'endscene'; text: string}
  );

/** A station of the journey (or any part) told only through explainer moments, under a chip saying where we are. */
export type StageScene = Base & {
  type: 'stage';
  /** e.g. "المحطة 3 · الرافعة 1" */
  label?: string;
  /** the journey's station (1-based) for the little progress row; 0 = none */
  station?: number;
  moments: Moment[];
  /** the screen turns dark when this word is said: the teaser (framework v5 §3.16) */
  darkCue?: string;
  /** dark from the first frame (the end card after a dark teaser) */
  dark?: boolean;
  /** no sound effects and the background fades out: the «وقفة» (framework v5 §3.15) */
  quiet?: boolean;
};

/** Business format, part 1: the "stop scrolling" short story told as a timeline of numbers over silhouettes. */
export type StoryHookScene = Base & {
  type: 'storyhook';
  place?: string;
  beats: Beat[];
  phoneCue?: string;
  /** explainer moments that tell the story before the timeline of numbers takes the screen */
  moments?: Moment[];
  /** the word that brings in the timeline of beats; default: it is there from the start */
  timelineCue?: string;
};

/** Business format, part 2: the smart transition. A before/after comparison, the topic, and what's coming. */
export type OverviewScene = Base & {
  type: 'overview';
  /** `highlightCue`: one person of the team lights up ("كل موظف…") */
  compare?: {from: {value: string; label: string; count: number; cue?: string; highlightCue?: string}; to: {value: string; label: string; cue?: string}};
  topic: string;
  topicSub?: string;
  roadmap?: string[];
  roadmapCue?: string;
  /** the case file, e.g. "الملف 01 · لغز الـ55", shown when `fileCue` is spoken */
  file?: string;
  fileCue?: string;
  moments?: Moment[];
};

/** The journey map's shape (framework v5.2): the winding road of EP001–EP002, a trail up a mountain to the flag on its
 * summit, or a staircase whose top step is the destination. */
export type MapShape = 'wave' | 'mountain' | 'stairs';

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
  /** the word that sends a light along the whole road ("وخلك معي للآخر…"), and the word where it arrives */
  glowCue?: string;
  glowEndCue?: string;
  /** from this word the map steps back (fades) so the moments take the stage */
  focusCue?: string;
  moments?: Moment[];
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
  | JourneyScene
  | StageScene;

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
  /** dB under the voice for this episode only, overriding channel.json (EP001 keeps the 25 it was published with) */
  backgroundLevel?: number;
  /** the journey map's shape; default the winding road */
  map?: MapShape;
  /** the look: "material" (default) or "watercolor", between watercolor and anime (an experiment from EP003) */
  look?: 'material' | 'watercolor';
  scenes: Scene[];
};

export type Brand = {
  name: string;
  nameEn: string;
  handle: string;
  tagline: string;
  /** a file in 03-episodes/_assets/music/ without ".mp3" (normalised to -18 LUFS), or "none" */
  background?: string;
  /** how many dB the background sits under the voice while it speaks (default 21) */
  backgroundLevel?: number;
  /** shown before the episode number, e.g. "الملف" → "الملف 01" */
  episodeLabel?: string;
};
