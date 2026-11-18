// Screenshot a page at an exact size with Chromium (Playwright): node shot.cjs <in.html> <out.png> <width> <height>
// Used by build_store.py for the store's cover and thumbnail.
const {chromium} = require('playwright');

(async () => {
  const [input, output, w, h] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: Number(w), height: Number(h)}, deviceScaleFactor: 1});
  await page.goto('file://' + input, {waitUntil: 'load'});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
  });
  await page.screenshot({path: output});
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
