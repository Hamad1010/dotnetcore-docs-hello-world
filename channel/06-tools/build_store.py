"""Make what the Gumroad store needs from the built guides: images and the day-3 email samples.

Run from channel/, after build_guide.py:   python3 06-tools/build_store.py [EP006 EP007 …]
  writes 07-products/out/store/EP00N/cover.png      1280×720, the product's cover
         07-products/out/store/EP00N/thumb.png      600×600, the square thumbnail
         07-products/out/store/EP00N/preview-1..3.png  three pages of the guide, for the gallery
         07-products/out/store/day3-samples.md      the scenario each day-3 email shares (07-products/store/emails.md)
Everything lands in out/, which git ignores: the previews and samples are pages of a paid guide.
"""
import html
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guide as bg  # noqa: E402

OUT = os.path.join(bg.PRODUCTS, 'out', 'store')
# the scenario each day-3 email shares, and the pages shown in the store's gallery (the map, a scenario page, the plan)
DAY3 = {'EP006': 13, 'EP007': 8, 'EP008': 1, 'EP009': 7, 'EP010': 14}
SHOT = os.path.join(bg.TOOLS, 'shot.cjs')


def scenarios(lines):
    """The guide's scenarios in order, as dicts of their fields."""
    out, i = [], 0
    while i < len(lines):
        if lines[i].strip() == '::: scenario':
            j = i + 1
            while lines[j].strip() != ':::':
                j += 1
            out.append(bg.fields(lines[i + 1:j], bg.FIELD_KEYS['scenario']))
            i = j
        i += 1
    return out


def plain_text(s):
    return re.sub(r'\*\*|==|`|\[مثال توضيحي\]', '', s).strip()


def day3_block(ep, meta, sc, n):
    return '\n'.join([
        f'## {ep} · الموقف {n}: {plain_text(sc["title"])}',
        '',
        '```',
        f'الموقف {n}: {plain_text(sc["title"])} ({plain_text(sc["who"])})',
        '',
        f'الموقف: {plain_text(sc["situation"])}',
        '',
        'وش لو…؟',
        f'✗ اللي يسويه أغلبنا: {plain_text(sc["usual"])}',
        f'وش يكلّفك: {plain_text(sc["cost"])}',
        '',
        f'✓ الحركة الصح: {plain_text(sc["right"])}',
        '',
        f'ليش تنفع: {plain_text(sc["why"])}',
        '',
        f'(من دليل الملف {meta["file"]} · {meta["title"]}، والأدلة بمصادرها في آخر الدليل)',
        '```',
        '',
    ])


def shot(html_text, path, w, h):
    tmp = path + '.html'
    open(tmp, 'w', encoding='utf-8').write(html_text)
    subprocess.run(['node', SHOT, tmp, path, str(w), str(h)], check=True)
    os.remove(tmp)


def store_images(ep, meta, pdf, pages, folder):
    accent = bg.ACCENTS[meta.get('accent', 'red')]
    css_fonts = ''.join(f'<link rel="stylesheet" href="{bg.url(os.path.join(bg.FONTS, f))}">'
                        for f in ['readex-pro/400.css', 'readex-pro/500.css', 'readex-pro/700.css'])
    wash = bg.tinted(accent[3], os.path.join(bg.PRODUCTS, 'out', 'assets'))
    paper = bg.url(os.path.join(bg.LOOK, 'paper.jpg'))
    gold = bg.url(os.path.join(bg.LOOK, 'wash-gold.png'))
    # the guide's own cover, as an image
    cover_png = os.path.join(folder, 'page-1')
    subprocess.run(['pdftoppm', '-r', '100', '-png', '-f', '1', '-l', '1', '-singlefile', pdf, cover_png], check=True)
    cover_png += '.png'
    inside = ''.join(f'<li>{bg.inline(x.strip())}</li>' for x in meta.get('inside', '').split('|')[:3] if x.strip())
    base = f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">{css_fonts}<style>
      * {{ box-sizing: border-box; margin: 0; }}
      html, body {{ overflow: hidden; }}
      body {{ font-family: 'Readex Pro', sans-serif; color: #1C2333; background: #FBF6EC; }}
      .frame {{ position: relative; overflow: hidden; }}
      .paper {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .9; }}
      .wash {{ position: absolute; mix-blend-mode: multiply; }}
      .n {{ unicode-bidi: isolate; direction: ltr; }}
    </style></head><body>'''
    cover = base + f'''<div class="frame" style="width:1280px; height:720px">
      <img class="paper" src="{paper}">
      <img class="wash" src="{wash}" style="right:-120px; top:-160px; width:620px; opacity:.5">
      <img class="wash" src="{gold}" style="left:-140px; bottom:-200px; width:640px; opacity:.4">
      <img src="{bg.url(cover_png)}" style="position:absolute; left:110px; top:60px; height:600px; box-shadow:0 18px 40px rgba(60,40,20,.28); border-radius:4px">
      <div style="position:absolute; right:90px; top:120px; width:600px">
        <div style="font-size:28px; font-weight:500; color:{accent[1]}">دليل الملف {bg.plain(meta["file"])} · غرفة الفرص</div>
        <div style="font-size:92px; font-weight:700; line-height:1.25; margin:10px 0 18px">{bg.inline(meta["title"])}</div>
        <ul style="list-style:none; padding:0; font-size:26px; line-height:1.6; color:#3F4859">{inside.replace("<li>", f"<li style='margin-bottom:10px'><span style='color:{accent[0]}'>●</span> ")}</ul>
        <div style="margin-top:22px; font-size:22px; color:#6A7385">PDF · بالعربي · <span class="n">{pages}</span> صفحة</div>
      </div>
    </div></body></html>'''
    shot(cover, os.path.join(folder, 'cover.png'), 1280, 720)
    door = bg.DOOR_SVG.replace('__ACCENT__', accent[0]).replace('__FILE__', meta['file'])
    thumb = base + f'''<div class="frame" style="width:600px; height:600px">
      <img class="paper" src="{paper}">
      <img class="wash" src="{wash}" style="right:-120px; top:-120px; width:520px; opacity:.5">
      <img class="wash" src="{gold}" style="left:-160px; bottom:-200px; width:520px; opacity:.4">
      <div style="position:absolute; left:40px; top:120px; width:250px">{door}</div>
      <div style="position:absolute; right:40px; top:150px; width:290px; text-align:right">
        <div style="font-size:24px; font-weight:500; color:{accent[1]}">دليل الملف {bg.plain(meta["file"])}</div>
        <div style="font-size:64px; font-weight:700; line-height:1.25; margin-top:8px">{bg.inline(meta["title"])}</div>
        <div style="font-size:22px; color:#5A6475; margin-top:16px">غرفة الفرص</div>
      </div>
    </div></body></html>'''
    shot(thumb, os.path.join(folder, 'thumb.png'), 600, 600)
    os.remove(cover_png)


def main():
    eps = sys.argv[1:] or list(DAY3)
    os.makedirs(OUT, exist_ok=True)
    samples = ['# Day-3 samples (private: pages of the paid guides)', '',
               'Paste each block into its day-3 email in 07-products/store/emails.md.', '']
    for ep in eps:
        meta, lines = bg.parse(open(os.path.join(bg.PRODUCTS, 'guides', f'{ep}.md'), encoding='utf-8').read())
        scs = scenarios(lines)
        n = DAY3[ep]
        samples.append(day3_block(ep, meta, scs[n - 1], n))
        pdf = os.path.join(bg.PRODUCTS, 'out', f'{ep}-guide.pdf')
        if not os.path.exists(pdf):
            raise SystemExit(f'{pdf} is missing: run build_guide.py {ep} first')
        pages, count = bg.find_pages(pdf, 7)
        folder = os.path.join(OUT, ep)
        os.makedirs(folder, exist_ok=True)
        # the gallery: the map's doors page, the first scenario page, and the 14-day plan
        for k, p in enumerate([pages[0], pages[2] + 1, pages[4]], 1):
            subprocess.run(['pdftoppm', '-r', '110', '-png', '-f', str(p), '-l', str(p), '-singlefile', pdf,
                            os.path.join(folder, f'preview-{k}')], check=True)
        store_images(ep, meta, pdf, count, folder)
        print(f'{ep}: cover, thumb, 3 previews (pages {pages[0]}, {pages[2] + 1}, {pages[4]}), day-3 scenario {n}')
    open(os.path.join(OUT, 'day3-samples.md'), 'w', encoding='utf-8').write('\n'.join(samples))
    print(os.path.join(OUT, 'day3-samples.md'))


if __name__ == '__main__':
    main()
