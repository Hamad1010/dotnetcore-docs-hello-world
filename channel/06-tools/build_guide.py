"""Build a «دليل الملف» PDF guide (one per season-2 episode) from its source file.

The guides are paid products. Their sources and PDFs live in channel/07-products/guides/ and channel/07-products/out/,
which git ignores (the repository is public). This script, guide/guide.css and guide/print_pdf.cjs hold no guide content.

Run from channel/:   python3 06-tools/build_guide.py EP006 [--png]
  reads   07-products/guides/EP006.md
  writes  07-products/out/EP006-guide.pdf  (and with --png, page images in 07-products/out/EP006-pages/ to check it)
Needs Pillow, numpy and pypdf (Python), Node with Playwright (the cloud image has both) and poppler's pdftotext;
fonts come from 04-studio/node_modules/@fontsource (run `npm install` there once).

The source format
-----------------
A header between --- lines (key: value): id, file (06), title, tagline, accent (red | blue | green | gold | purple),
inside (the cover's list, items split by |), verse, verse_ref, hadith, hadith_ref, closing.
Then the guide, in a small Markdown:
  # Title | contents line | intro          a section: new page, its number, a watercolor header
  ## Title | small tag                     a heading, with an optional small line above it
  ### Title, paragraphs, - bullets, 1. numbers, > a key line, | tables |, **bold**, ==highlight==, `English`,
  [text](https://link)
  [مثال توضيحي]                           the illustration label
  ::: works / fails / move / note Label    boxes (works + fails side by side when they follow each other)
  ::: doors                                the map's list of doors (- lines)
  ::: scenario                             title:, who:, situation:, usual:, cost:, right:, why:, ref:
  ::: words                                title:, for:, text:, change:
  ::: plan                                 one line a day: N | title | what to do
  ::: check                                - one statement a line (rated 1 to 5, before and after)
  ::: evidence                             who:, cite:, used:, number:, numlabel:, finding:, link:
  ::: howto                                the page after the cover (how to use the guide), before the contents
:::
"""
import html
import os
import re
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image

CHANNEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(CHANNEL, '06-tools', 'guide')
PRODUCTS = os.path.join(CHANNEL, '07-products')
LOOK = os.path.join(CHANNEL, '03-episodes', '_assets', 'look')
AVATAR = os.path.join(CHANNEL, '03-episodes', '_assets', 'brand', 'avatar.png')
FONTS = os.path.join(CHANNEL, '04-studio', 'node_modules', '@fontsource')

# accent: (main, deep for text, soft for highlights, the watercolor wash that matches it)
ACCENTS = {
    'red': ('#D9573F', '#B23F2A', '#F8DDD5', 'rose'),
    'blue': ('#3A78C2', '#2A5E9E', '#DCE8F6', 'blue'),
    'green': ('#3C9660', '#2B7448', '#DCEFE3', 'green'),
    'gold': ('#E0A23A', '#9A6A0A', '#FBEBC9', 'gold'),
    'purple': ('#8E6BB8', '#6E4F96', '#E9E1F3', '#8E6BB8'),
}
BOX_LABELS = {'works': 'متى تنفع', 'fails': 'متى تنقلب عليك', 'move': 'حركة صغيرة… أثرها كبير', 'note': 'انتبه'}
FIELD_KEYS = {
    'scenario': ['title', 'who', 'situation', 'usual', 'cost', 'right', 'why', 'ref'],
    'words': ['title', 'for', 'text', 'change'],
    'evidence': ['who', 'cite', 'used', 'number', 'numlabel', 'finding', 'link'],
}
NUM = re.compile(r'\$?\d[\d,.]*(?:[–-]\$?\d[\d,.]*)?%?\+?')


def url(path):
    return 'file://' + path


# ── inline text ────────────────────────────────────────────────────────────────────────────────────
def plain(s):
    s = html.escape(s, quote=False)
    return NUM.sub(lambda m: f'<span class="n">{m.group(0)}</span>', s)


def inline(s):
    out = []
    for p in re.split(r'(\*\*.+?\*\*|==.+?==|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\[مثال توضيحي\])', s):
        if not p:
            continue
        link = re.fullmatch(r'\[([^\]]+)\]\(([^)\s]+)\)', p)
        if link:
            out.append(f'<a href="{html.escape(link.group(2))}">{inline(link.group(1))}</a>')
        elif p.startswith('**') and p.endswith('**') and len(p) > 4:
            out.append('<strong>' + inline(p[2:-2]) + '</strong>')
        elif p.startswith('==') and p.endswith('==') and len(p) > 4:
            out.append('<mark>' + inline(p[2:-2]) + '</mark>')
        elif p.startswith('`') and p.endswith('`'):
            out.append('<span class="en" dir="ltr">' + html.escape(p[1:-1], quote=False) + '</span>')
        elif p == '[مثال توضيحي]':
            out.append('<span class="ill">مثال توضيحي</span>')
        else:
            out.append(plain(p))
    return ''.join(out)


# ── blocks ─────────────────────────────────────────────────────────────────────────────────────────
def fields(lines, keys):
    """key: value lines; a line that does not start with a known key continues the value before it."""
    out, last = {}, None
    for ln in lines:
        m = re.match(r'^(\w+)\s*:\s?(.*)$', ln)
        if m and m.group(1) in keys:
            last = m.group(1)
            out[last] = m.group(2).strip()
        elif last and ln.strip():
            out[last] += ' ' + ln.strip()
    return out


def markdown(lines):
    """Paragraphs, headings, lists, key lines and tables."""
    html_out, para, i = [], [], 0

    def flush():
        if para:
            html_out.append('<p>' + inline(' '.join(para)) + '</p>')
            para.clear()

    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip():
            flush()
            i += 1
            continue
        if ln.startswith('### '):
            flush()
            html_out.append('<h3>' + inline(ln[4:]) + '</h3>')
        elif ln.startswith('## '):
            flush()
            title, _, tag = ln[3:].partition(' | ')
            tag_html = f'<span class="tag">{inline(tag)}</span>' if tag else ''
            html_out.append(f'<h2>{tag_html}{inline(title)}</h2>')
        elif re.match(r'^[-•] ', ln) or re.match(r'^\d+\. ', ln):
            flush()
            ordered = bool(re.match(r'^\d+\. ', ln))
            items = []
            while i < len(lines) and (re.match(r'^[-•] ', lines[i]) or re.match(r'^\d+\. ', lines[i]) or (lines[i].startswith('  ') and lines[i].strip())):
                if lines[i].startswith('  '):
                    items[-1] += ' ' + lines[i].strip()
                else:
                    items.append(re.sub(r'^([-•]|\d+\.) ', '', lines[i]).strip())
                i += 1
            tag = 'ol' if ordered else 'ul'
            html_out.append(f'<{tag}>' + ''.join(f'<li>{inline(t)}</li>' for t in items) + f'</{tag}>')
            continue
        elif ln.startswith('> '):
            flush()
            quote = []
            while i < len(lines) and lines[i].startswith('>'):
                quote.append(lines[i][1:].strip())
                i += 1
            paras = ' '.join(quote).split('  ')
            html_out.append('<blockquote>' + ''.join(f'<p>{inline(p)}</p>' for p in paras if p.strip()) + '</blockquote>')
            continue
        elif ln.startswith('|'):
            flush()
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-{2,}:?', c) for c in cells):
                    rows.append(cells)
                i += 1
            head, body = rows[0], rows[1:]
            t = '<table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>'
            t += ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body)
            html_out.append(t + '</tbody></table>')
            continue
        else:
            para.append(ln.strip())
        i += 1
    flush()
    return '\n'.join(html_out)


def render_block(kind, label, lines, counters):
    if kind in ('works', 'fails', 'move', 'note'):
        lab = label or BOX_LABELS[kind]
        return f'<aside class="box box-{kind}"><div class="label">{inline(lab)}</div>{markdown(lines)}</aside>'
    if kind == 'doors':
        items = [re.sub(r'^[-•] ', '', ln).strip() for ln in lines if ln.strip()]
        return '<ol class="doors">' + ''.join(f'<li><p>{inline(t)}</p></li>' for t in items) + '</ol>'
    if kind == 'scenario':
        counters['scenario'] += 1
        f = fields(lines, FIELD_KEYS['scenario'])
        ref = f' <span class="ref">({inline(f["ref"])})</span>' if f.get('ref') else ''
        return (
            f'<article class="sc"><header><span class="no">{counters["scenario"]}</span><h3>{inline(f.get("title", ""))}</h3>'
            f'<span class="who">{inline(f.get("who", ""))}</span></header>'
            f'<p class="sit"><b>الموقف:</b> {inline(f.get("situation", ""))}</p>'
            '<div class="q">وش لو…؟</div>'
            '<div class="fork">'
            f'<div class="usual"><div class="lbl">✗ اللي يسويه أغلبنا</div><p>{inline(f.get("usual", ""))}</p>'
            f'<p class="cost">{inline(f.get("cost", ""))}</p></div>'
            f'<div class="right"><div class="lbl">✓ الحركة الصح</div><p>{inline(f.get("right", ""))}</p></div>'
            '</div>'
            f'<p class="why"><b>ليش تنفع:</b> {inline(f.get("why", ""))}{ref}</p></article>'
        )
    if kind == 'words':
        f = fields(lines, FIELD_KEYS['words'])
        for_ = f'<div class="for">{inline(f["for"])}</div>' if f.get('for') else ''
        change = f'<p class="change"><b>غيّر فيها:</b> {inline(f["change"])}</p>' if f.get('change') else ''
        texts = ''.join(f'<p>{inline(t.strip())}</p>' for t in f.get('text', '').split(' // '))
        return f'<article class="wd"><h3>{inline(f.get("title", ""))}</h3>{for_}<div class="text">{texts}</div>{change}</article>'
    if kind == 'plan':
        days = []
        for ln in lines:
            if not ln.strip():
                continue
            n, title, text = [x.strip() for x in ln.split('|', 2)]
            stop = n in ('7', '14')
            lines_html = '<div class="lines"></div>' if stop else ''
            days.append(
                f'<div class="day{" stop" if stop else ""}"><div class="top"><span class="box-tick"></span>'
                f'<span class="d">اليوم {plain(n)}</span><span class="t">{inline(title)}</span></div><p>{inline(text)}</p>{lines_html}</div>'
            )
        return '<div class="plan">' + ''.join(days) + '</div>'
    if kind == 'check':
        items = [re.sub(r'^[-•] ', '', ln).strip() for ln in lines if ln.strip()]
        dots = '<td class="dots">' + ''.join(f'<i>{k}</i>' for k in range(1, 6)) + '</td>'
        rows = ''.join(f'<tr><td>{inline(t)}</td>{dots}{dots}</tr>' for t in items)
        return (
            '<table class="check"><thead><tr><th>العبارة</th><th>قبل الخطة</th><th>بعد 14 يوم</th></tr></thead>'
            f'<tbody>{rows}</tbody></table>'
        )
    if kind == 'evidence':
        counters['evidence'] += 1
        f = fields(lines, FIELD_KEYS['evidence'])
        link = f.get('link', '')
        link_html = f'<div class="link"><a href="{html.escape(link)}">{html.escape(link)}</a></div>' if link else ''
        return (
            f'<article class="ev"><div class="band"><span>الدليل {counters["evidence"]}</span><span class="used">{inline(f.get("used", ""))}</span></div>'
            f'<div class="body"><div><div class="who">{inline(f.get("who", ""))}</div>'
            f'<div class="cite" dir="ltr">{html.escape(f.get("cite", ""))}</div><p>{inline(f.get("finding", ""))}</p>{link_html}</div>'
            f'<div class="num"><b{" class=long" if len(f.get("number", "")) > 7 else ""}>{html.escape(f.get("number", ""))}</b>'
            f'<span>{inline(f.get("numlabel", ""))}</span></div></div></article>'
        )
    raise SystemExit(f'unknown block ::: {kind}')


# ── the guide ──────────────────────────────────────────────────────────────────────────────────────
def parse(text):
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m:
        raise SystemExit('the guide needs a header between --- lines')
    meta = {}
    for ln in m.group(1).splitlines():
        if ':' in ln:
            k, _, v = ln.partition(':')
            meta[k.strip()] = v.strip()
    return meta, text[m.end():].splitlines()


def build_body(lines):
    """The sections and the page after the cover; returns (howto_html, sections) with sections = [(title, toc, html)]."""
    counters = {'scenario': 0, 'evidence': 0}
    sections, howto, chunk, current = [], '', [], None
    out = []  # html pieces of the current section

    def flush_md():
        if chunk:
            h = markdown(chunk)
            if h.strip():
                out.append(h)
            chunk.clear()

    i = 0
    while i < len(lines):
        ln = lines[i]
        m = re.match(r'^:::\s*(\w+)\s*(.*)$', ln)
        if m:
            flush_md()
            kind, label = m.group(1), m.group(2).strip()
            j = i + 1
            while j < len(lines) and lines[j].strip() != ':::':
                j += 1
            block_lines = lines[i + 1:j]
            if kind == 'howto':
                howto = markdown(block_lines)
            else:
                out.append((kind, render_block(kind, label, block_lines, counters)))
            i = j + 1
            continue
        if ln.startswith('# '):
            flush_md()
            if current:
                sections.append((*current, pair_boxes(out)))
            parts = [p.strip() for p in ln[2:].split(' | ')]
            current = (parts[0], parts[1] if len(parts) > 1 else '', parts[2] if len(parts) > 2 else '')
            out = []
            i += 1
            continue
        chunk.append(ln)
        i += 1
    flush_md()
    if current:
        sections.append((*current, pair_boxes(out)))
    return howto, sections


def pair_boxes(pieces):
    """A «works» box followed by a «fails» box sit side by side."""
    html_out, k = [], 0
    while k < len(pieces):
        p = pieces[k]
        if isinstance(p, tuple):
            kind, h = p
            nxt = pieces[k + 1] if k + 1 < len(pieces) else None
            if kind == 'works' and isinstance(nxt, tuple) and nxt[0] == 'fails':
                html_out.append(f'<div class="pair">{h}{nxt[1]}</div>')
                k += 2
                continue
            html_out.append(h)
        else:
            html_out.append(p)
        k += 1
    return '\n'.join(html_out)


def tinted(name_or_hex, out_dir):
    """A watercolor wash: one of ours, or ours recoloured to a hex colour."""
    if not name_or_hex.startswith('#'):
        return url(os.path.join(LOOK, f'wash-{name_or_hex}.png'))
    path = os.path.join(out_dir, f'wash-{name_or_hex[1:]}.png')
    if not os.path.exists(path):
        im = np.asarray(Image.open(os.path.join(LOOK, 'wash-blue.png')).convert('RGBA')).astype(np.float32) / 255
        lum = im[..., :3].mean(axis=2, keepdims=True)
        target = np.array([int(name_or_hex[k:k + 2], 16) / 255 for k in (1, 3, 5)], dtype=np.float32)
        rgb = 1 - (1 - target) * (1 - lum) / max(1e-3, float((1 - lum).max())) * 1.1
        out = np.concatenate([np.clip(rgb, 0, 1), im[..., 3:]], axis=2)
        Image.fromarray((out * 255).astype(np.uint8), 'RGBA').save(path)
    return url(path)


DOOR_SVG = '''<svg class="door" viewBox="0 0 320 470" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g-light" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stop-color="#FFF4D2"/><stop offset="0.55" stop-color="#F6D27E"/><stop offset="1" stop-color="#E8AA35"/></radialGradient>
    <linearGradient id="g-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3C766" stop-opacity="0.75"/><stop offset="1" stop-color="#F3C766" stop-opacity="0"/></linearGradient>
  </defs>
  <polygon points="70,402 250,402 320,470 0,470" fill="url(#g-spill)"/>
  <rect x="70" y="58" width="180" height="344" fill="url(#g-light)"/>
  <rect x="62" y="50" width="196" height="356" rx="3" fill="none" stroke="#6B5444" stroke-width="5"/>
  <polygon points="250,58 312,36 312,430 250,402" fill="__ACCENT__"/>
  <polygon points="250,58 312,36 312,430 250,402" fill="#FFFFFF" opacity="0.13"/>
  <circle cx="300" cy="236" r="6" fill="#F2E3B5"/>
  <circle cx="160" cy="26" r="20" fill="#FFFCF5" stroke="#6B5444" stroke-width="3"/>
  <text x="160" y="27" font-family="Readex Pro" font-weight="700" font-size="17" fill="#1C2333" text-anchor="middle" dominant-baseline="central">__FILE__</text>
  <g fill="#3A3557" opacity="0.92">
    <circle cx="160" cy="318" r="23"/>
    <path d="M104 402 C104 362 126 346 160 346 C194 346 216 362 216 402 Z"/>
  </g>
</svg>'''


def page_html(meta, howto, sections, pages=None):
    accent = ACCENTS[meta.get('accent', 'red')]
    out_dir = os.path.join(PRODUCTS, 'out', 'assets')
    os.makedirs(out_dir, exist_ok=True)
    footer = f'غرفة الفرص · دليل الملف {meta["file"]} · {meta["title"]}'
    css = open(os.path.join(TOOLS, 'guide.css'), encoding='utf-8').read()
    css = (css.replace('__ACCENT__', accent[0]).replace('__ACCENT_DEEP__', accent[1]).replace('__ACCENT_SOFT__', accent[2])
           .replace('__FOOTER__', footer))
    fonts = ''.join(
        f'<link rel="stylesheet" href="{url(os.path.join(FONTS, f))}">'
        for f in ['readex-pro/300.css', 'readex-pro/400.css', 'readex-pro/500.css', 'readex-pro/600.css', 'readex-pro/700.css',
                  'amiri/400.css', 'amiri/700.css', 'amiri-quran/400.css']
    )
    wash = tinted(accent[3], out_dir)
    paper = url(os.path.join(LOOK, 'paper.jpg'))
    gold, blue = url(os.path.join(LOOK, 'wash-gold.png')), url(os.path.join(LOOK, 'wash-blue.png'))
    inside = ''.join(f'<li><span>{inline(x.strip())}</span></li>' for x in meta.get('inside', '').split('|') if x.strip())
    door = DOOR_SVG.replace('__ACCENT__', accent[0]).replace('__FILE__', meta['file'])

    cover = f'''<section class="full cover">
  <img class="paper" src="{paper}">
  <img class="wash" src="{wash}" style="left:-40mm; top:-30mm; width:170mm; opacity:.55">
  <img class="wash" src="{gold}" style="right:-50mm; bottom:-40mm; width:180mm; opacity:.42">
  <img class="wash" src="{blue}" style="right:-30mm; top:-36mm; width:110mm; opacity:.16">
  <div class="brand"><img src="{url(AVATAR)}">غرفة الفرص</div>
  <div class="season">الموسم الثاني · المحادثات اللي تفتح الأبواب</div>
  <div class="file">دليل الملف {plain(meta["file"])}</div>
  <h1>{inline(meta["title"])}</h1>
  <p class="tagline">{inline(meta.get("tagline", ""))}</p>
  {door}
  <ul class="inside">{inside}</ul>
  <div class="foot"><span>للاستخدام الشخصي · لا تشاركه رجاءً</span><span>دليل عملي مع الحلقة</span></div>
</section>'''

    toc_items = ''.join(
        f'<li><span class="k">{plain(str(k + 1))}</span><span class="t">{inline(t)}</span><span class="d">{inline(d)}</span>'
        f'<span class="p">{plain(str(pages[k])) if pages else "00"}</span></li>'
        for k, (t, d, _intro, _h) in enumerate(sections)
    )
    contents = f'''<section class="front">
  {howto}
  <h2>المحتويات</h2>
  <ol class="toc">{toc_items}</ol>
  <p class="small">كل قصة حقيقية في الدليل لها مصدر، والمصادر في القسم الأخير. الأمثلة اللي عليها «مثال توضيحي» مبنية على
  الأبحاث وليست قصص أشخاص حقيقيين. الأرقام نتائج دراسات، وما هي وعد بنتيجة لك؛ نتيجتك على قد تطبيقك.
  هذا الدليل لك أنت: لا تنشره ولا ترسله لغيرك، وإذا نفعك… دلّهم عليه.</p>
</section>'''

    secs = []
    for k, (title, _toc, intro, body) in enumerate(sections):
        secs.append(f'''<section class="sec">
  <header class="sec-head">
    <img class="wash" src="{wash}"><img class="wash2" src="{gold}">
    <div class="num"><b>{plain(str(k + 1))}</b> من {plain(str(len(sections)))}<span class="marker">SECMARK{k + 1}X</span></div>
    <h1>{inline(title)}</h1>
    <p class="intro">{inline(intro)}</p>
  </header>
  {body}
</section>''')

    closing = f'''<section class="full closing">
  <img class="paper" src="{paper}">
  <img class="wash" src="{wash}" style="left:-50mm; bottom:-50mm; width:170mm; opacity:.35">
  <img class="wash" src="{gold}" style="right:-40mm; top:-40mm; width:150mm; opacity:.35">
  <div class="inner">
    <div class="k">وقفة</div>
    <p class="verse">{html.escape(meta.get("verse", ""))}</p>
    <div class="ref">{inline(meta.get("verse_ref", ""))}</div>
    <p class="hadith">{html.escape(meta.get("hadith", ""))}</p>
    <div class="ref">{inline(meta.get("hadith_ref", ""))}</div>
    <p class="last">{inline(meta.get("closing", ""))}</p>
  </div>
  <div class="brand"><img src="{url(AVATAR)}">غرفة الفرص<span>دليل الملف {plain(meta["file"])} · {inline(meta["title"])}</span></div>
</section>'''

    return f'''<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>دليل الملف {meta["file"]} · {meta["title"]} · غرفة الفرص</title>
{fonts}<style>{css}</style></head>
<body>
{cover}
{contents}
{"".join(secs)}
{closing}
</body></html>'''


def print_pdf(html_path, pdf_path):
    subprocess.run(['node', os.path.join(TOOLS, 'print_pdf.cjs'), html_path, pdf_path], check=True)


def find_pages(pdf_path, n):
    """The page each section starts on, from the hidden SECMARK markers."""
    pages = [0] * n
    count = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf_path], capture_output=True, text=True).stdout).group(1))
    for p in range(1, count + 1):
        text = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), pdf_path, '-'], capture_output=True, text=True).stdout
        for k in re.findall(r'SECMARK(\d+)X', re.sub(r'\s+', '', text)):
            if not pages[int(k) - 1]:
                pages[int(k) - 1] = p
    return pages, count


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    ep = sys.argv[1]
    src = os.path.join(PRODUCTS, 'guides', f'{ep}.md')
    out = os.path.join(PRODUCTS, 'out')
    os.makedirs(out, exist_ok=True)
    meta, lines = parse(open(src, encoding='utf-8').read())
    howto, sections = build_body(lines)
    html_path = os.path.join(out, f'{ep}-guide.html')
    pdf_path = os.path.join(out, f'{ep}-guide.pdf')

    # two passes: the first finds the page each section starts on, the second prints the contents with them
    open(html_path, 'w', encoding='utf-8').write(page_html(meta, howto, sections))
    print_pdf(html_path, pdf_path)
    pages, _ = find_pages(pdf_path, len(sections))
    open(html_path, 'w', encoding='utf-8').write(page_html(meta, howto, sections, pages))
    print_pdf(html_path, pdf_path)
    pages2, count = find_pages(pdf_path, len(sections))
    if pages2 != pages:
        print('warning: the contents moved the pages; check the page numbers', pages, pages2)

    from pypdf import PdfReader, PdfWriter
    reader = PdfReader(pdf_path)
    writer = PdfWriter(clone_from=reader)
    writer.add_metadata({'/Title': f'دليل الملف {meta["file"]} · {meta["title"]}', '/Author': 'غرفة الفرص', '/Subject': meta.get('tagline', '')})
    with open(pdf_path, 'wb') as fh:
        writer.write(fh)

    scen = sum(1 for ln in lines if ln.strip() == '::: scenario')
    print(f'{pdf_path}: {count} pages, {len(sections)} sections starting on pages {pages}, {scen} scenarios')
    if '--png' in sys.argv:
        png_dir = os.path.join(out, f'{ep}-pages')
        shutil.rmtree(png_dir, ignore_errors=True)
        os.makedirs(png_dir)
        subprocess.run(['pdftoppm', '-r', '50', '-png', pdf_path, os.path.join(png_dir, 'p')], check=True)
        print(f'page images: {png_dir}')


if __name__ == '__main__':
    main()
