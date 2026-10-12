// Writes 03-episodes/<EP>/script.md: the readable script (for review, or to record with your own voice).
//   node scripts/script-md.mjs EP001
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPlan, display} from '../src/lib/plan.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const episodeId = process.argv[2] || 'EP001';
const epDir = path.resolve(here, '../../03-episodes', episodeId);
const ep = JSON.parse(fs.readFileSync(path.join(epDir, 'episode.json'), 'utf8'));
const timingsFile = path.join(epDir, 'audio/timings.json');
const timings = fs.existsSync(timingsFile) ? JSON.parse(fs.readFileSync(timingsFile, 'utf8')) : null;
const plan = buildPlan(ep, timings);
const mmss = (f) => `${Math.floor(f / 30 / 60)}:${String(Math.floor((f / 30) % 60)).padStart(2, '0')}`;

const out = [
  `# ${ep.id} · ${ep.title}`,
  '',
  `- **Lesson:** ${ep.lesson} · season ${ep.season} · source ${ep.sourceRef || ''}`,
  `- **YouTube title:** ${ep.youtubeTitle || ''}`,
  `- **Length:** ${mmss(plan.total)} (${timings ? 'real voice timing' : 'estimated from text; real voice may differ by ±10%'})`,
  `- **Words:** ${ep.scenes.reduce((a, s) => a + display(s.narration).split(' ').length, 0)}`,
  '',
  '> Recording tip (if you use your own voice): one file per scene, named after the scene id',
  '> (e.g. `audio/s1.m4a`), phone in a quiet room 20 cm from your mouth, then run',
  `> \`npm run voice -- ${ep.id} --provider=recorded\`.`,
  '',
];
ep.scenes.forEach((s, i) => {
  const p = plan.scenes[i];
  out.push(`## ${mmss(p.from)} · \`${s.id}\` · ${s.chapter || s.type}`, '', display(s.narration), '');
  if (s.type === 'story') {
    out.push(`*On screen:* ${s.country} ${s.year} · ${s.headline} · ${s.stats.map((x) => `${x.value}${x.unit ? ' ' + x.unit : ''} ${x.label}`).join(' / ')} · takeaway: **${s.takeaway}**`, '');
  }
});
fs.writeFileSync(path.join(epDir, 'script.md'), out.join('\n'));
console.log('wrote', path.relative(process.cwd(), path.join(epDir, 'script.md')));
