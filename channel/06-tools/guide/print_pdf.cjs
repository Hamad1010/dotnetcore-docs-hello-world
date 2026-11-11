// Print a guide's HTML to an A4 PDF with Chromium (Playwright): node print_pdf.cjs <in.html> <out.pdf>
// Used by build_guide.py. The page sizes and margins come from the page's own @page rules.
const {chromium} = require('playwright');

(async () => {
  const [input, output] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + input, {waitUntil: 'load'});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
  });
  await page.pdf({path: output, printBackground: true, preferCSSPageSize: true, tagged: true});
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
