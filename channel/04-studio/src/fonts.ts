// Self-hosted font (SIL Open Font License): works offline and renders identically everywhere.
import '@fontsource/readex-pro/400.css';
import '@fontsource/readex-pro/500.css';
import '@fontsource/readex-pro/600.css';
import '@fontsource/readex-pro/700.css';
// The «وقفة» (framework v5 §3.15): the verse in Amiri Quran, a hadith in Amiri (both SIL OFL)
import '@fontsource/amiri-quran/400.css';
import '@fontsource/amiri/400.css';
import {continueRender, delayRender} from 'remotion';

let started = false;

// Block rendering until the Arabic glyphs of every weight are loaded,
// otherwise the first frames may render with a fallback font.
export const ensureFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  const sample = 'الكاريزما تبدأ من الرحمة 0123456789 ABC';
  const scripture = 'نَحْنُ قَسَمْنَا بَيْنَهُم ﴿﴾ ۚ';
  Promise.all([
    ...['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 48px "Readex Pro"`, sample)),
    document.fonts.load('48px "Amiri Quran"', scripture),
    document.fonts.load('48px "Amiri"', scripture),
  ])
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
