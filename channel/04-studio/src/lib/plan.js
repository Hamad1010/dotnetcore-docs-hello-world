// Timing plan for an episode: shared by the video (Remotion) and the Node scripts
// (subtitles, chapters). Plain JS so both sides can import it.

export const FPS = 30;

// Speaking speed used when there is no recorded/generated audio yet.
// ~13.5 characters per second is a calm Arabic narration pace.
export const CHARS_PER_SECOND = 13.5;

const LEAD_IN = 0.45; // seconds of visuals before the voice starts
const TAIL = 0.85; // seconds after the voice ends, before the next scene

const clean = (text) => text.replace(/\s+/g, ' ').trim();

// Narration can mark numbers as {display|spoken}: captions show "1987", the voice says
// "ألف وتسعمية وسبعة وثمانين" (TTS engines read Saudi-style numbers better as words).
const MARK = /\{([^|{}]*)\|([^{}]*)\}/g;
export const spoken = (text) => clean(text.replace(MARK, '$2'));
export const display = (text) => clean(text.replace(MARK, '$1'));

// Words separated by spaces, keeping each {display|spoken} mark whole (its spoken side may hold several words).
function tokens(text) {
  const out = [];
  let cur = '';
  let depth = 0;
  for (const ch of text) {
    if (ch === '{') depth += 1;
    if (ch === '}') depth = Math.max(0, depth - 1);
    if (/\s/.test(ch) && depth === 0) {
      if (cur) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

// For each word the captions show, the index of the first word the voice says: {55|خمسة وخمسين} is 1 shown, 2 said.
export function displayToSpoken(text) {
  const map = [];
  let said = 0;
  for (const tok of tokens(text)) {
    const shown = display(tok).split(' ').filter(Boolean).length;
    const n = spoken(tok).split(' ').filter(Boolean).length;
    for (let k = 0; k < shown; k++) map.push(said + Math.min(k, Math.max(0, n - 1)));
    said += n;
  }
  return map;
}

export function estimateSeconds(text) {
  return Math.max(1.2, spoken(text).length / CHARS_PER_SECOND);
}

// Split narration into subtitle-sized chunks at punctuation, then by words.
export function splitCaptions(text, maxLen = 64) {
  const parts = display(text)
    .split(/(?<=[.!؟?…،:])\s+/u)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = [];
  for (const part of parts) {
    if (part.length <= maxLen) {
      chunks.push(part);
      continue;
    }
    const words = part.split(' ');
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > maxLen && line) {
        chunks.push(line.trim());
        line = w;
      } else {
        line = (line + ' ' + w).trim();
      }
    }
    if (line) chunks.push(line);
  }
  // merge very short tails into the previous chunk
  const merged = [];
  for (const c of chunks) {
    const prev = merged[merged.length - 1];
    if (prev && c.length < 14 && prev.length + c.length < maxLen + 12) {
      merged[merged.length - 1] = prev + ' ' + c;
    } else {
      merged.push(c);
    }
  }
  return merged;
}

/**
 * @param {{scenes: Array<{id: string, narration: string, minSeconds?: number}>}} episode
 * @param {Record<string, {duration: number, file?: string, marks?: number[]}> | null} timings  from audio/timings.json.
 *   `marks` (written by 06-tools/clean_recording.py) = the second each spoken word starts: captions and cues follow them.
 */
export function buildPlan(episode, timings, fps = FPS) {
  const scenes = [];
  let cursor = 0;
  for (const s of episode.scenes) {
    const t = timings && timings[s.id];
    const speech = t && t.duration ? t.duration : estimateSeconds(s.narration);
    const total = Math.max(s.minSeconds || 0, LEAD_IN + speech + TAIL);
    const frames = Math.round(total * fps);
    const speechStart = Math.round(LEAD_IN * fps);
    const speechFrames = Math.round(speech * fps);

    const chunks = splitCaptions(s.narration);
    const said = spoken(s.narration).split(' ').filter(Boolean).length;
    const marks = t && Array.isArray(t.marks) && t.marks.length === said ? t.marks.map((m) => speechStart + Math.round(m * fps)) : null;
    let captions;
    if (marks) {
      // The real voice: each caption starts on its first word and ends where the next one starts.
      const map = displayToSpoken(s.narration);
      let shown = 0;
      captions = chunks.map((text) => {
        const first = map[shown] ?? 0;
        shown += text.split(' ').filter(Boolean).length;
        const start = marks[first];
        const end = shown < map.length ? marks[map[shown]] : speechStart + speechFrames;
        return { text, start, end: Math.min(frames, Math.max(start + 6, end)) };
      });
    } else {
      const weights = chunks.map((c) => c.length + 6); // +6 ~ the pause after each phrase
      const sum = weights.reduce((a, b) => a + b, 0);
      let at = speechStart;
      captions = chunks.map((text, i) => {
        const len = Math.round((speechFrames * weights[i]) / sum);
        const cap = { text, start: at, end: Math.min(frames, at + len) };
        at += len;
        return cap;
      });
    }

    scenes.push({
      id: s.id,
      from: cursor,
      frames,
      speechStart,
      speechFrames,
      captions,
      audio: t && t.file ? t.file : null,
      marks,
    });
    cursor += frames;
  }
  return { fps, total: cursor, scenes };
}

const pad = (n) => String(n).padStart(2, '0');

export function srtTime(frame, fps = FPS) {
  const ms = Math.round((frame / fps) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms % 1000).padStart(3, '0')}`;
}

export function toSrt(plan) {
  const lines = [];
  let i = 1;
  for (const sc of plan.scenes) {
    for (const c of sc.captions) {
      lines.push(String(i++), `${srtTime(sc.from + c.start, plan.fps)} --> ${srtTime(sc.from + c.end, plan.fps)}`, c.text, '');
    }
  }
  return lines.join('\n');
}

export function toChapters(episode, plan) {
  const out = [];
  plan.scenes.forEach((sc, idx) => {
    const chapter = episode.scenes[idx].chapter;
    if (!chapter) return;
    const sec = Math.floor(sc.from / plan.fps);
    out.push(`${Math.floor(sec / 60)}:${pad(sec % 60)} ${chapter}`);
  });
  if (out.length && !out[0].startsWith('0:00')) out[0] = '0:00' + out[0].slice(out[0].indexOf(' '));
  return out.join('\n');
}
