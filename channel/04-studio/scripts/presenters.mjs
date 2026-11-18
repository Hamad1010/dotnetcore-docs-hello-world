// Renders the presenter's five options (src/PresenterSheet.tsx, framework v7) into 03-episodes/_brand/out/presenters/:
//   presenters-lineup.png (all five side by side), presenter-1.png … presenter-5.png (each beside a page of EP006)
//
//   node scripts/presenters.mjs            (REMOTION_BROWSER=… in a cloud session, as for a render)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
const episodes = path.resolve(studio, '../03-episodes');
const outDir = path.join(episodes, '_brand', 'out', 'presenters');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes, symlinkPublicDir: true});
// the bundle links 03-episodes instead of copying it: delete the small rest however the script ends
process.on('exit', () => fs.rmSync(serveUrl, {recursive: true, force: true}));

const only = process.argv.slice(2).map(Number);
for (let option = 0; option <= 5; option++) {
  if (only.length && !only.includes(option)) continue;
  const inputProps = {option};
  const composition = await selectComposition({serveUrl, id: 'PresenterSheet', inputProps, browserExecutable});
  const output = path.join(outDir, option === 0 ? 'presenters-lineup.png' : `presenter-${option}.png`);
  await renderStill({composition, serveUrl, output, inputProps, browserExecutable});
  console.log('wrote', path.relative(process.cwd(), output));
}
