// Self-hosted font (SIL Open Font License): works offline and renders identically everywhere.
import '@fontsource/readex-pro/400.css';
import '@fontsource/readex-pro/500.css';
import '@fontsource/readex-pro/600.css';
import '@fontsource/readex-pro/700.css';
import {continueRender, delayRender} from 'remotion';

let started = false;

// Block rendering until the Arabic glyphs of every weight are loaded,
// otherwise the first frames may render with a fallback font.
export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  const sample = 'الكاريزما تبدأ من الرحمة 0123456789 ABC';
  Promise.all(['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 48px "Readex Pro"`, sample)))
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
